import PharmacyInventory, { IPharmacyInventoryDocument } from '../models/pharmacy-inventory';
import { IPharmacyInventory } from '../types';
import logger from '../config/logger';

/**
 * Add new pharmacy inventory item
 */
export const addInventoryItem = async (
  itemData: IPharmacyInventory
): Promise<{ success: boolean; item?: IPharmacyInventoryDocument; message?: string }> => {
  try {
    // Check if item with same name and batch number already exists for this hospital
    if (itemData.batchNumber) {
      const existingItem = await PharmacyInventory.findOne({
        hospitalId: itemData.hospitalId,
        itemName: itemData.itemName,
        batchNumber: itemData.batchNumber,
        isActive: true,
      });

      if (existingItem) {
        return {
          success: false,
          message: 'Item with same name and batch number already exists. Please update the existing item instead.'
        };
      }
    }

    // Create new inventory item
    const item = new PharmacyInventory(itemData);
    await item.save();

    logger.info(`Pharmacy inventory item added: ${itemData.itemName} for hospital: ${itemData.hospitalId}`);

    return { success: true, item };
  } catch (error) {
    logger.error('Error in addInventoryItem service:', error);
    throw error;
  }
};

/**
 * Get all inventory items for a hospital
 */
export const getHospitalInventory = async (
  hospitalId: string,
  filters?: {
    category?: string;
    isActive?: boolean;
    lowStock?: boolean;
    expired?: boolean;
    search?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<{
  items: IPharmacyInventory[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const query: any = { hospitalId };

    // Apply filters
    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.lowStock) {
      query.$expr = { $lte: ['$quantity', '$minStockLevel'] };
    }

    if (filters?.expired) {
      query.expiryDate = { $lte: new Date() };
    }

    if (filters?.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;

    const [inventory, total] = await Promise.all([
      PharmacyInventory.find(query)
        .sort({ itemName: 1 })
        .populate('addedBy', 'name email')
        .populate('lastUpdatedBy', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      PharmacyInventory.countDocuments(query),
    ]);

    return {
      items: inventory,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error(`Error in getHospitalInventory service for hospital ${hospitalId}:`, error);
    throw error;
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (
  itemId: string
): Promise<IPharmacyInventory | null> => {
  try {
    const item = await PharmacyInventory.findById(itemId)
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email')
      .lean();

    return item;
  } catch (error) {
    logger.error(`Error in getInventoryItemById service for item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (
  itemId: string,
  updateData: Partial<IPharmacyInventory>
): Promise<IPharmacyInventoryDocument | null> => {
  try {
    const item = await PharmacyInventory.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('addedBy', 'name email')
      .populate('lastUpdatedBy', 'name email');

    if (item) {
      logger.info(`Pharmacy inventory item updated: ${itemId}`);
    }

    return item;
  } catch (error) {
    logger.error(`Error in updateInventoryItem service for ${itemId}:`, error);
    throw error;
  }
};

/**
 * Delete inventory item (hard delete)
 */
export const deleteInventoryItem = async (
  itemId: string
): Promise<IPharmacyInventoryDocument | null> => {
  try {
    const item = await PharmacyInventory.findByIdAndDelete(itemId);

    if (item) {
      logger.info(`Pharmacy inventory item deleted: ${itemId}`);
    }

    return item;
  } catch (error) {
    logger.error(`Error in deleteInventoryItem service for ${itemId}:`, error);
    throw error;
  }
};

/**
 * Update item quantity (for stock adjustments)
 */
export const updateItemQuantity = async (
  itemId: string,
  quantityChange: number,
  userId?: string
): Promise<{ success: boolean; item?: IPharmacyInventoryDocument; message?: string }> => {
  try {
    const item = await PharmacyInventory.findById(itemId);

    if (!item) {
      return { success: false, message: 'Inventory item not found' };
    }

    const newQuantity = item.quantity + quantityChange;

    if (newQuantity < 0) {
      return { success: false, message: 'Insufficient stock. Cannot reduce quantity below zero.' };
    }

    item.quantity = newQuantity;
    if (userId) {
      item.lastUpdatedBy = userId as any;
    }

    await item.save();

    logger.info(`Inventory quantity updated for item ${itemId}: ${item.quantity} (change: ${quantityChange})`);

    return { success: true, item };
  } catch (error) {
    logger.error(`Error in updateItemQuantity service for ${itemId}:`, error);
    throw error;
  }
};

/**
 * Get low stock items for a hospital
 */
export const getLowStockItems = async (
  hospitalId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  items: IPharmacyInventory[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const query = {
      hospitalId,
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
    };

    const skip = (page - 1) * limit;

    const [lowStockItems, total] = await Promise.all([
      PharmacyInventory.find(query)
        .sort({ quantity: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PharmacyInventory.countDocuments(query),
    ]);

    return {
      items: lowStockItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error(`Error in getLowStockItems service for hospital ${hospitalId}:`, error);
    throw error;
  }
};

/**
 * Get expired or expiring soon items
 */
export const getExpiringItems = async (
  hospitalId: string,
  daysThreshold: number = 30,
  page: number = 1,
  limit: number = 10
): Promise<{
  items: IPharmacyInventory[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const query = {
      hospitalId,
      isActive: true,
      expiryDate: {
        $lte: thresholdDate,
      },
    };

    const skip = (page - 1) * limit;

    const [expiringItems, total] = await Promise.all([
      PharmacyInventory.find(query)
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PharmacyInventory.countDocuments(query),
    ]);

    return {
      items: expiringItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error(`Error in getExpiringItems service for hospital ${hospitalId}:`, error);
    throw error;
  }
};

/**
 * Get inventory statistics for a hospital
 */
export const getInventoryStats = async (
  hospitalId: string
): Promise<{
  totalItems: number;
  activeItems: number;
  lowStockCount: number;
  expiredCount: number;
  totalValue: number;
  categoryCounts: Record<string, number>;
}> => {
  try {
    const [
      totalItems,
      activeItems,
      lowStock,
      expired,
      items,
    ] = await Promise.all([
      PharmacyInventory.countDocuments({ hospitalId }),
      PharmacyInventory.countDocuments({ hospitalId, isActive: true }),
      PharmacyInventory.countDocuments({
        hospitalId,
        isActive: true,
        $expr: { $lte: ['$quantity', '$minStockLevel'] },
      }),
      PharmacyInventory.countDocuments({
        hospitalId,
        isActive: true,
        expiryDate: { $lte: new Date() },
      }),
      PharmacyInventory.find({ hospitalId, isActive: true }).lean(),
    ]);

    // Calculate total value and category counts
    let totalValue = 0;
    const categoryCounts: Record<string, number> = {};

    items.forEach((item) => {
      if (item.sellingPrice) {
        totalValue += item.sellingPrice * item.quantity;
      }

      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    return {
      totalItems,
      activeItems,
      lowStockCount: lowStock,
      expiredCount: expired,
      totalValue,
      categoryCounts,
    };
  } catch (error) {
    logger.error(`Error in getInventoryStats service for hospital ${hospitalId}:`, error);
    throw error;
  }
};
