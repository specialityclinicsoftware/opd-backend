import { Request, Response } from 'express';
import * as pharmacyService from '../services/pharmacy-service';
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendCreated,
  sendValidationError,
} from '../utils/response-handler';
import { logError, getErrorMessage } from '../utils/error-handler';

/**
 * Add new pharmacy inventory item
 */
export const addInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { success, item, message } = await pharmacyService.addInventoryItem(req.body);

    if (!success) {
      sendValidationError(res, message || 'Failed to add inventory item');
      return;
    }

    sendCreated(res, item , 'Inventory item added successfully');
  } catch (error: unknown) {
    logError('addInventoryItem', error);
    sendError(res, 'Failed to add inventory item', 500, getErrorMessage(error));
  }
};

/**
 * Get all inventory items for a hospital
 */
export const getHospitalInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.params;
    const filters = {
      category: req.query.category as string | undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      lowStock: req.query.lowStock === 'true',
      expired: req.query.expired === 'true',
      search: req.query.search as string | undefined,
    };
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await pharmacyService.getHospitalInventory(hospitalId, filters, page, limit);

    sendSuccess(res, {
      inventory: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: unknown) {
    logError('getHospitalInventory', error);
    sendError(res, 'Failed to fetch inventory', 500, getErrorMessage(error));
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await pharmacyService.getInventoryItemById(req.params.id);

    if (!item) {
      sendNotFound(res, 'Inventory item');
      return;
    }

    sendSuccess(res,  item );
  } catch (error: unknown) {
    logError('getInventoryItemById', error);
    sendError(res, 'Failed to fetch inventory item', 500, getErrorMessage(error));
  }
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await pharmacyService.updateInventoryItem(req.params.id, req.body);

    if (!item) {
      sendNotFound(res, 'Inventory item');
      return;
    }

    sendSuccess(res, item , 'Inventory item updated successfully');
  } catch (error: unknown) {
    logError('updateInventoryItem', error);
    sendError(res, 'Failed to update inventory item', 500, getErrorMessage(error));
  }
};

/**
 * Delete inventory item (soft delete)
 */
export const deleteInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await pharmacyService.deleteInventoryItem(req.params.id);

    if (!item) {
      sendNotFound(res, 'Inventory item');
      return;
    }

    sendSuccess(res, item, 'Inventory item deleted successfully');
  } catch (error: unknown) {
    logError('deleteInventoryItem', error);
    sendError(res, 'Failed to delete inventory item', 500, getErrorMessage(error));
  }
};

/**
 * Update item quantity
 */
export const updateItemQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantityChange } = req.body;
    const userId = req.body.userId; // Can be extracted from auth middleware

    if (quantityChange === undefined || quantityChange === null) {
      sendValidationError(res, 'Quantity change is required');
      return;
    }

    const { success, item, message } = await pharmacyService.updateItemQuantity(
      req.params.id,
      quantityChange,
      userId
    );

    if (!success) {
      sendValidationError(res, message || 'Failed to update quantity');
      return;
    }

    sendSuccess(res,  item , 'Quantity updated successfully');
  } catch (error: unknown) {
    logError('updateItemQuantity', error);
    sendError(res, 'Failed to update quantity', 500, getErrorMessage(error));
  }
};

/**
 * Get low stock items for a hospital
 */
export const getLowStockItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await pharmacyService.getLowStockItems(
      req.params.hospitalId,
      page,
      limit
    );

    sendSuccess(res, {
      inventory: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: unknown) {
    logError('getLowStockItems', error);
    sendError(res, 'Failed to fetch low stock items', 500, getErrorMessage(error));
  }
};

/**
 * Get expired or expiring soon items
 */
export const getExpiringItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const daysThreshold = req.query.days ? parseInt(req.query.days as string) : 30;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await pharmacyService.getExpiringItems(
      req.params.hospitalId,
      daysThreshold,
      page,
      limit
    );

    sendSuccess(res, {
      inventory: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
      daysThreshold,
    });
  } catch (error: unknown) {
    logError('getExpiringItems', error);
    sendError(res, 'Failed to fetch expiring items', 500, getErrorMessage(error));
  }
};

/**
 * Get inventory statistics for a hospital
 */
export const getInventoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await pharmacyService.getInventoryStats(req.params.hospitalId);

    sendSuccess(res, stats);
  } catch (error: unknown) {
    logError('getInventoryStats', error);
    sendError(res, 'Failed to fetch inventory statistics', 500, getErrorMessage(error));
  }
};
