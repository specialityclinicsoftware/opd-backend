import mongoose from 'mongoose';
import MedicationHistory, { IMedicationHistoryDocument } from '../models/medication-history';
import Patient from '../models/patient';
import Visit from '../models/visit';
import PharmacySales from '../models/pharmacy-sales';
import { IMedicationHistory } from '../types';
import logger from '../config/logger';
import {
  verifyPatientAndVisit,
  checkInventoryAvailability,
  prepareSalesAndDeductInventory,
  handleBillingError,
} from '../utils/medication-billing-utils';

/**
 * Add medication history for a visit
 */
export const addMedicationHistory = async (
  medicationData: IMedicationHistory
): Promise<{ success: boolean; medicationHistory?: IMedicationHistoryDocument; message?: string }> => {
  try {
    // Verify patient exists
    const patient = await Patient.findById(medicationData.patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found' };
    }

    // Verify visit exists
    const visit = await Visit.findById(medicationData.visitId);
    if (!visit) {
      return { success: false, message: 'Visit not found' };
    }

    // Create medication history
    const medicationHistory = new MedicationHistory(medicationData);
    await medicationHistory.save();

    logger.info(`Medication history added for patient: ${medicationData.patientId}, visit: ${medicationData.visitId}`);

    return { success: true, medicationHistory };
  } catch (error) {
    logger.error('Error in addMedicationHistory service:', error);
    throw error;
  }
};

/**
 * Get all medication history for a patient
 */
export const getPatientMedicationHistory = async (
  patientId: string
): Promise<IMedicationHistory[]> => {
  try {
    const medicationHistory = await MedicationHistory.find({ patientId })
      .sort({ prescribedDate: -1 })
      .populate('visitId', 'visitDate diagnosis').lean();

    return medicationHistory;
  } catch (error) {
    logger.error(`Error in getPatientMedicationHistory service for patient ${patientId}:`, error);
    throw error;
  }
};

/**
 * Get medication history for a specific visit
 */
export const getVisitMedicationHistory = async (
  visitId: string
): Promise<IMedicationHistory | null> => {
  try {
    const medicationHistory = await MedicationHistory.findOne({ visitId })
      .populate('patientId', 'name phoneNumber age gender')
      .lean();

    return medicationHistory;
  } catch (error) {
    logger.error(`Error in getVisitMedicationHistory service for visit ${visitId}:`, error);
    throw error;
  }
};

/**
 * Update medication history
 */
export const updateMedicationHistory = async (
  medicationHistoryId: string,
  updateData: Partial<IMedicationHistory>
): Promise<IMedicationHistoryDocument | null> => {
  try {
    const medicationHistory = await MedicationHistory.findByIdAndUpdate(
      medicationHistoryId,
      updateData,
      { new: true, runValidators: true }
    );

    if (medicationHistory) {
      logger.info(`Medication history updated: ${medicationHistoryId}`);
    }

    return medicationHistory;
  } catch (error) {
    logger.error(`Error in updateMedicationHistory service for ${medicationHistoryId}:`, error);
    throw error;
  }
};

/**
 * Delete medication history
 */
export const deleteMedicationHistory = async (
  medicationHistoryId: string
): Promise<IMedicationHistoryDocument | null> => {
  try {
    const medicationHistory = await MedicationHistory.findByIdAndDelete(medicationHistoryId);

    if (medicationHistory) {
      logger.info(`Medication history deleted: ${medicationHistoryId}`);
    }

    return medicationHistory;
  } catch (error) {
    logger.error(`Error in deleteMedicationHistory service for ${medicationHistoryId}:`, error);
    throw error;
  }
};

/**
 * Get recent prescriptions for a patient (last N prescriptions)
 */
export const getRecentPrescriptions = async (
  patientId: string,
  limit: number = 5
): Promise<IMedicationHistory[]> => {
  try {
    const recentPrescriptions = await MedicationHistory.find({ patientId })
      .sort({ prescribedDate: -1 })
      .limit(limit)
      .populate('visitId', 'visitDate diagnosis')
      .lean();

    return recentPrescriptions;
  } catch (error) {
    logger.error(`Error in getRecentPrescriptions service for patient ${patientId}:`, error);
    throw error;
  }
};

/**
 * Add medication history and deduct from inventory (Billing) with transaction
 * This is a critical function that ensures atomicity across:
 * 1. Creating prescription record
 * 2. Deducting inventory
 * 3. Recording sales
 */
export const addMedicationHistoryWithBilling = async (
  medicationData: IMedicationHistory,
  soldBy?: string
): Promise<{
  success: boolean;
  medicationHistory?: IMedicationHistoryDocument;
  salesRecord?: any;
  message?: string;
  insufficientStock?: string[];
  deductedItems?: Array<{ medicineName: string; quantityDeducted: number }>;
}> => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(
      async () => {
        // Step 1: Verify patient and visit exist
        await verifyPatientAndVisit(
          medicationData.patientId,
          medicationData.visitId,
          session
        );

        // Step 2: Validate medications array
        if (!medicationData.medications || medicationData.medications.length === 0) {
          throw new Error('NO_MEDICATIONS');
        }

        // Step 3: Check inventory availability for all medications
        const { inventoryItems, insufficientStock } = await checkInventoryAvailability(
          medicationData.hospitalId,
          medicationData.medications,
          session
        );

        if (insufficientStock.length > 0) {
          const error: any = new Error('INSUFFICIENT_STOCK');
          error.insufficientStock = insufficientStock;
          throw error;
        }

        // Step 4: Create medication history (prescription record)
        const medicationHistory = new MedicationHistory(medicationData);
        await medicationHistory.save({ session });

        // Step 5: Prepare sales items and deduct inventory
        const { salesItems, deductedItems, totalAmount } =
          await prepareSalesAndDeductInventory(inventoryItems, session);

        // Step 6: Create pharmacy sales record
        const salesRecord = new PharmacySales({
          hospitalId: medicationData.hospitalId,
          patientId: medicationData.patientId,
          visitId: medicationData.visitId,
          prescriptionId: medicationHistory._id,
          items: salesItems,
          totalAmount,
          saleDate: new Date(),
          soldBy,
        });
        await salesRecord.save({ session });

        logger.info(
          `Billing completed - Patient: ${medicationData.patientId}, Visit: ${medicationData.visitId}, Total: ${totalAmount}`
        );

        // Store results for return
        (session as any).result = {
          success: true,
          medicationHistory,
          salesRecord,
          deductedItems,
        };
      },
      {
        readPreference: 'primary',
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
        maxCommitTimeMS: 30000,
      }
    );

    return (session as any).result;
  } catch (error: any) {
    return handleBillingError(error);
  } finally {
    await session.endSession();
  }
};
