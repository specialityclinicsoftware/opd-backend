import { Request, Response } from 'express';
import * as medicationService from '../services/medication-service';
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendCreated,
  sendValidationError,
} from '../utils/response-handler';
import { logError, getErrorMessage } from '../utils/error-handler';

/**
 * Add medication history for a visit
 */
export const addMedicationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { success, medicationHistory, message } = await medicationService.addMedicationHistory(
      req.body
    );

    if (!success) {
      sendValidationError(res, message || 'Failed to add medication history');
      return;
    }

    sendCreated(res, { medicationHistory }, 'Medication history added successfully');
  } catch (error: unknown) {
    logError('addMedicationHistory', error);
    sendError(res, 'Failed to add medication history', 500, getErrorMessage(error));
  }
};

/**
 * Get all medication history for a patient
 */
export const getPatientMedicationHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const medicationHistory = await medicationService.getPatientMedicationHistory(
      req.params.patientId
    );

    sendSuccess(res, {
      count: medicationHistory.length,
      medicationHistory,
    });
  } catch (error: unknown) {
    logError('getPatientMedicationHistory', error);
    sendError(res, 'Failed to fetch medication history', 500, getErrorMessage(error));
  }
};

/**
 * Get medication history for a specific visit
 */
export const getVisitMedicationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicationHistory = await medicationService.getVisitMedicationHistory(req.params.visitId);

    if (!medicationHistory) {
      sendNotFound(res, 'Medication history for this visit');
      return;
    }

    sendSuccess(res, { medicationHistory });
  } catch (error: unknown) {
    logError('getVisitMedicationHistory', error);
    sendError(res, 'Failed to fetch medication history', 500, getErrorMessage(error));
  }
};

/**
 * Update medication history
 */
export const updateMedicationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicationHistory = await medicationService.updateMedicationHistory(
      req.params.id,
      req.body
    );

    if (!medicationHistory) {
      sendNotFound(res, 'Medication history');
      return;
    }

    sendSuccess(res, { medicationHistory }, 'Medication history updated successfully');
  } catch (error: unknown) {
    logError('updateMedicationHistory', error);
    sendError(res, 'Failed to update medication history', 500, getErrorMessage(error));
  }
};

/**
 * Delete medication history
 */
export const deleteMedicationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicationHistory = await medicationService.deleteMedicationHistory(req.params.id);

    if (!medicationHistory) {
      sendNotFound(res, 'Medication history');
      return;
    }

    sendSuccess(res, {}, 'Medication history deleted successfully');
  } catch (error: unknown) {
    logError('deleteMedicationHistory', error);
    sendError(res, 'Failed to delete medication history', 500, getErrorMessage(error));
  }
};

/**
 * Get recent prescriptions for a patient
 */
export const getRecentPrescriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const recentPrescriptions = await medicationService.getRecentPrescriptions(
      req.params.patientId,
      limit
    );

    sendSuccess(res, {
      count: recentPrescriptions.length,
      recentPrescriptions,
    });
  } catch (error: unknown) {
    logError('getRecentPrescriptions', error);
    sendError(res, 'Failed to fetch recent prescriptions', 500, getErrorMessage(error));
  }
};

/**
 * Add medication history with billing (deduct from inventory)
 */
export const addMedicationHistoryWithBilling = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await medicationService.addMedicationHistoryWithBilling(req.body);

    if (!result.success) {
      if (result.insufficientStock) {
        res.status(400).json({
          success: false,
          message: result.message || 'Insufficient inventory',
          insufficientStock: result.insufficientStock,
        });
        return;
      }
      sendValidationError(res, result.message || 'Failed to add medication history with billing');
      return;
    }

    sendCreated(
      res,
      {
        medicationHistory: result.medicationHistory,
        deductedItems: result.deductedItems,
      },
      'Medication history added and inventory updated successfully'
    );
  } catch (error: unknown) {
    logError('addMedicationHistoryWithBilling', error);
    sendError(res, 'Failed to add medication history with billing', 500, getErrorMessage(error));
  }
};
