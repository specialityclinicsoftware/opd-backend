import { Request, Response } from 'express';
import * as patientService from '../services/patient-service';
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendCreated,
  sendValidationError,
} from '../utils/response-handler';
import { logError, getErrorMessage } from '../utils/error-handler';

/**
 * Register a new patient
 */
export const registerPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add hospitalId from authenticated user
    if (req.user?.hospitalId) {
      req.body.hospitalId = req.user.hospitalId;
    }

    const { exists, patient } = await patientService.registerPatient(req.body);

    if (exists) {
      sendValidationError(res, 'Patient with this phone number already exists in this hospital');
      return;
    }

    sendCreated(res, { patient }, 'Patient registered successfully');
  } catch (error) {
    logError('registerPatient', error);
    sendError(res, 'Failed to register patient', 500, getErrorMessage(error));
  }
};

/**
 * Get all patients
 */
export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    // Filter by hospital ID for non-super-admin users
    console.log('User hospital ID:', req.user);
    const hospitalId = req.user?.hospitalId;
    const patients = await patientService.getAllPatients(hospitalId);
    sendSuccess(res, { count: patients.length, patients });
  } catch (error) {
    logError('getAllPatients', error);
    sendError(res, 'Failed to fetch patients', 500, getErrorMessage(error));
  }
};

/**
 * Get patient by ID
 */
export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await patientService.getPatientById(req.params.id);

    if (!patient) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendSuccess(res, { patient });
  } catch (error) {
    logError('getPatientById', error);
    sendError(res, 'Failed to fetch patient', 500, getErrorMessage(error));
  }
};

/**
 * Search patient by phone number
 */
export const searchPatientByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.query;

    // Search within hospital for non-super-admin users
    const hospitalId = req.user?.hospitalId;
    const patient = await patientService.searchPatientByPhone(phoneNumber as string, hospitalId);

    if (!patient) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendSuccess(res, { patient });
  } catch (error) {
    logError('searchPatientByPhone', error);
    sendError(res, 'Failed to search patient', 500, getErrorMessage(error));
  }
};

/**
 * Update patient information
 */
export const updatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);

    if (!patient) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendSuccess(res, { patient }, 'Patient updated successfully');
  } catch (error) {
    logError('updatePatient', error);
    sendError(res, 'Failed to update patient', 500, getErrorMessage(error));
  }
};

/**
 * Delete a patient
 */
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await patientService.deletePatient(req.params.id);

    if (!patient) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendSuccess(res, {}, 'Patient deleted successfully');
  } catch (error) {
    logError('deletePatient', error);
    sendError(res, 'Failed to delete patient', 500, getErrorMessage(error));
  }
};
