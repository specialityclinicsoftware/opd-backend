import { ClientSession } from 'mongoose';
import PharmacyInventory from '../models/pharmacy-inventory';
import Patient from '../models/patient';
import Visit from '../models/visit';
import { IMedication } from '../types';
import logger from '../config/logger';

/**
 * Validate basic medication data
 */
export const validateMedicationData = (medication: IMedication): void => {
  if (!medication.medicineName || !medication.days || medication.days <= 0) {
    throw new Error(`INVALID_MEDICATION_DATA: ${medication.medicineName || 'Unknown'}`);
  }
};

/**
 * Calculate required quantity for a medication based on timing and days
 */
export const calculateRequiredQuantity = (medication: IMedication): number => {
  const timingsPerDay = [
    medication.timing.morning,
    medication.timing.afternoon,
    medication.timing.evening,
    medication.timing.night,
  ].filter(Boolean).length;

  if (timingsPerDay === 0) {
    throw new Error(`NO_TIMING_SELECTED: ${medication.medicineName}`);
  }

  const requiredQuantity = timingsPerDay * medication.days;

  if (requiredQuantity <= 0) {
    throw new Error(`INVALID_QUANTITY: ${medication.medicineName}`);
  }

  return requiredQuantity;
};

/**
 * Find inventory item for a medication
 * Tries exact match first, then case-insensitive match
 */
export const findInventoryItem = async (
  hospitalId: string,
  medicineName: string,
  session: ClientSession
): Promise<any> => {
  // Try exact match first
  let inventoryItem = await PharmacyInventory.findOne({
    hospitalId,
    itemName: medicineName,
    isActive: true,
  }).session(session);

  // Fallback to case-insensitive search
  if (!inventoryItem) {
    inventoryItem = await PharmacyInventory.findOne({
      hospitalId,
      itemName: { $regex: new RegExp(`^${medicineName}$`, 'i') },
      isActive: true,
    }).session(session);
  }

  return inventoryItem;
};

/**
 * Verify patient and visit exist
 */
export const verifyPatientAndVisit = async (
  patientId: string,
  visitId: string,
  session: ClientSession
): Promise<{ patient: any; visit: any }> => {
  const patient = await Patient.findById(patientId).session(session);
  if (!patient) {
    throw new Error('PATIENT_NOT_FOUND');
  }

  const visit = await Visit.findById(visitId).session(session);
  if (!visit) {
    throw new Error('VISIT_NOT_FOUND');
  }

  return { patient, visit };
};

/**
 * Check inventory availability for all medications
 */
export const checkInventoryAvailability = async (
  hospitalId: string,
  medications: IMedication[],
  session: ClientSession
): Promise<{
  inventoryItems: Array<{
    item: any;
    requiredQuantity: number;
    medicineName: string;
  }>;
  insufficientStock: string[];
}> => {
  const insufficientStock: string[] = [];
  const inventoryItems: any[] = [];

  for (const medication of medications) {
    // Validate medication
    validateMedicationData(medication);

    // Calculate required quantity
    const requiredQuantity = calculateRequiredQuantity(medication);

    // Find inventory item
    const inventoryItem = await findInventoryItem(
      hospitalId,
      medication.medicineName,
      session
    );

    if (!inventoryItem) {
      insufficientStock.push(`${medication.medicineName} - Not found in inventory`);
      continue;
    }

    // Check stock availability
    if (inventoryItem.quantity < requiredQuantity) {
      insufficientStock.push(
        `${medication.medicineName} - Required: ${requiredQuantity}, Available: ${inventoryItem.quantity}`
      );
      continue;
    }

    inventoryItems.push({
      item: inventoryItem,
      requiredQuantity,
      medicineName: medication.medicineName,
    });
  }

  return { inventoryItems, insufficientStock };
};

/**
 * Prepare sales items and deduct inventory
 */
export const prepareSalesAndDeductInventory = async (
  inventoryItems: Array<{
    item: any;
    requiredQuantity: number;
    medicineName: string;
  }>,
  session: ClientSession
): Promise<{
  salesItems: any[];
  deductedItems: Array<{ medicineName: string; quantityDeducted: number }>;
  totalAmount: number;
}> => {
  const salesItems: any[] = [];
  const deductedItems: Array<{ medicineName: string; quantityDeducted: number }> = [];
  let totalAmount = 0;

  for (const { item, requiredQuantity, medicineName } of inventoryItems) {
    // Double-check quantity hasn't changed (race condition protection)
    if (item.quantity < requiredQuantity) {
      throw new Error(`CONCURRENT_UPDATE: ${medicineName} - Stock changed during transaction`);
    }

    // Deduct inventory
    item.quantity -= requiredQuantity;
    await item.save({ session });

    // Calculate sale price
    const unitPrice = item.sellingPrice || item.purchasePrice || 0;
    const totalPrice = unitPrice * requiredQuantity;
    totalAmount += totalPrice;

    // Add to sales items
    salesItems.push({
      inventoryId: item._id,
      itemName: medicineName,
      quantity: requiredQuantity,
      unitPrice,
      totalPrice,
      batchNumber: item.batchNumber,
    });

    deductedItems.push({
      medicineName,
      quantityDeducted: requiredQuantity,
    });

    logger.info(
      `Inventory deducted: ${medicineName}, Quantity: ${requiredQuantity}, Remaining: ${item.quantity}, Amount: ${totalPrice}`
    );
  }

  // Validate total amount
  if (totalAmount < 0) {
    throw new Error('INVALID_TOTAL_AMOUNT');
  }

  return { salesItems, deductedItems, totalAmount };
};

/**
 * Handle billing errors and return appropriate response
 */
export const handleBillingError = (error: any): {
  success: false;
  message: string;
  insufficientStock?: string[];
} => {
  logger.error('Billing error:', error);

  const errorMap: Record<string, string> = {
    PATIENT_NOT_FOUND: 'Patient not found',
    VISIT_NOT_FOUND: 'Visit not found',
    NO_MEDICATIONS: 'At least one medication is required',
    INSUFFICIENT_STOCK: 'Insufficient inventory for some medications',
    INVALID_TOTAL_AMOUNT: 'Invalid total amount calculated',
  };

  // Handle known errors
  if (errorMap[error.message]) {
    const response: any = {
      success: false,
      message: errorMap[error.message],
    };

    if (error.message === 'INSUFFICIENT_STOCK' && error.insufficientStock) {
      response.insufficientStock = error.insufficientStock;
    }

    return response;
  }

  // Handle prefixed errors
  if (error.message?.startsWith('NO_TIMING_SELECTED')) {
    return {
      success: false,
      message: error.message.replace('NO_TIMING_SELECTED: ', 'No timing selected for medication: '),
    };
  }
  if (error.message?.startsWith('INVALID_MEDICATION_DATA')) {
    return {
      success: false,
      message: error.message.replace('INVALID_MEDICATION_DATA: ', 'Invalid medication data for: '),
    };
  }
  if (error.message?.startsWith('INVALID_QUANTITY')) {
    return {
      success: false,
      message: error.message.replace('INVALID_QUANTITY: ', 'Invalid quantity calculated for: '),
    };
  }
  if (error.message?.startsWith('CONCURRENT_UPDATE')) {
    return {
      success: false,
      message: error.message.replace('CONCURRENT_UPDATE: ', 'Stock changed during processing for: '),
    };
  }

  // Unknown error - should be re-thrown by caller
  throw error;
};
