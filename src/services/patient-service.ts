import Patient, { IPatientDocument } from '../models/patient';
import { IPatient } from '../types';
import logger from '../config/logger';

/**
 * Register a new patient
 */
export const registerPatient = async (
  patientData: IPatient
): Promise<{ exists: boolean; patient: IPatientDocument }> => {
  try {
    // Check if patient already exists in the same hospital
    const query: any = { phoneNumber: patientData.phoneNumber };
    if (patientData.hospitalId) {
      query.hospitalId = patientData.hospitalId;
    }

    const existingPatient = await Patient.findOne(query);

    if (existingPatient) {
      logger.info(`Patient registration attempt with existing phone in hospital: ${patientData.phoneNumber}`);
      return { exists: true, patient: existingPatient };
    }

    // Create new patient
    const patient = new Patient(patientData);
    await patient.save();

    logger.info(`New patient registered: ${patient._id}`);

    return { exists: false, patient };
  } catch (error: unknown) {
    logger.error('Error in registerPatient service:', error);
    throw error;
  }
};

/**
 * Get all patients
 */
export const getAllPatients = async (hospitalId?: string): Promise<IPatientDocument[]> => {
  try {
    const query: any = {};
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    return patients;
  } catch (error: unknown) {
    logger.error('Error in getAllPatients service:', error);
    throw error;
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (patientId: string): Promise<IPatientDocument | null> => {
  try {
    const patient = await Patient.findById(patientId);
    return patient;
  } catch (error: unknown) {
    logger.error(`Error in getPatientById service for patient ${patientId}:`, error);
    throw error;
  }
};

/**
 * Search patient by phone number
 */
export const searchPatientByPhone = async (
  phoneNumber: string,
  hospitalId?: string
): Promise<IPatientDocument | null> => {
  try {
    const query: any = { phoneNumber };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const patient = await Patient.findOne(query);
    return patient;
  } catch (error: unknown) {
    logger.error(`Error in searchPatientByPhone service for phone ${phoneNumber}:`, error);
    throw error;
  }
};

/**
 * Update patient information
 */
export const updatePatient = async (
  patientId: string,
  updateData: Partial<IPatient>
): Promise<IPatientDocument | null> => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    );

    if (patient) {
      logger.info(`Patient updated: ${patientId}`);
    }

    return patient;
  } catch (error: unknown) {
    logger.error(`Error in updatePatient service for patient ${patientId}:`, error);
    throw error;
  }
};

/**
 * Delete a patient
 */
export const deletePatient = async (patientId: string): Promise<IPatientDocument | null> => {
  try {
    const patient = await Patient.findByIdAndDelete(patientId);

    if (patient) {
      logger.info(`Patient deleted: ${patientId}`);
    }

    return patient;
  } catch (error: unknown) {
    logger.error(`Error in deletePatient service for patient ${patientId}:`, error);
    throw error;
  }
};
