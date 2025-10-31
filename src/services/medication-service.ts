import MedicationHistory, { IMedicationHistoryDocument } from '../models/medication-history';
import Patient from '../models/patient';
import Visit from '../models/visit';
import { IMedicationHistory } from '../types';
import logger from '../config/logger';

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
