import { Request, Response } from 'express';
import * as visitService from '../services/visit-service';
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendCreated,
} from '../utils/response-handler';
import { logError, getErrorMessage } from '../utils/error-handler';
import { VisitStatus } from '../models/visit';

/**
 * Create a new visit record
 */
export const createVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patient, visit } = await visitService.createVisit(req.body);

    if (!patient) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendCreated(res, { visit }, 'Visit recorded successfully');
  } catch (error: any) {
    logError('createVisit', error);
    sendError(res, 'Failed to create visit', 500, getErrorMessage(error));
  }
};

/**
 * Get all visits for a patient
 */
export const getPatientVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    const visits = await visitService.getPatientVisits(req.params.patientId);
    sendSuccess(res, { count: visits.length, visits });
  } catch (error: any) {
    logError('getPatientVisits', error);
    sendError(res, 'Failed to fetch visits', 500, getErrorMessage(error));
  }
};

/**
 * Get a specific visit by ID
 */
export const getVisitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await visitService.getVisitById(req.params.id);

    if (!visit) {
      sendNotFound(res, 'Visit');
      return;
    }

    sendSuccess(res, { visit });
  } catch (error: any) {
    logError('getVisitById', error);
    sendError(res, 'Failed to fetch visit', 500, getErrorMessage(error));
  }
};

/**
 * Get latest visit for a patient
 */
export const getLatestVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await visitService.getLatestVisit(req.params.patientId);

    if (!visit) {
      sendNotFound(res, 'No visits found for this patient');
      return;
    }

    sendSuccess(res, { visit });
  } catch (error: any) {
    logError('getLatestVisit', error);
    sendError(res, 'Failed to fetch latest visit', 500, getErrorMessage(error));
  }
};

/**
 * Update a visit record
 */
export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await visitService.updateVisit(req.params.id, req.body);

    if (!visit) {
      sendNotFound(res, 'Visit');
      return;
    }

    sendSuccess(res, { visit }, 'Visit updated successfully');
  } catch (error: any) {
    logError('updateVisit', error);
    sendError(res, 'Failed to update visit', 500, getErrorMessage(error));
  }
};

/**
 * Delete a visit record
 */
export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const visit = await visitService.deleteVisit(req.params.id);

    if (!visit) {
      sendNotFound(res, 'Visit');
      return;
    }

    sendSuccess(res, {}, 'Visit deleted successfully');
  } catch (error: any) {
    logError('deleteVisit', error);
    sendError(res, 'Failed to delete visit', 500, getErrorMessage(error));
  }
};

/**
 * Get complete patient history (patient info + all visits)
 */
export const getPatientHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await visitService.getPatientHistory(req.params.patientId);

    if (!result) {
      sendNotFound(res, 'Patient');
      return;
    }

    sendSuccess(res, {
      patient: result.patient,
      visitCount: result.visits.length,
      visits: result.visits,
    });
  } catch (error: any) {
    logError('getPatientHistory', error);
    sendError(res, 'Failed to fetch patient history', 500, getErrorMessage(error));
  }
};

/**
 * Get pending visits for the authenticated user's hospital
 * GET /api/visits/pending
 */
export const getPendingVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.hospitalId) {
      sendError(res, 'Hospital ID required', 400);
      return;
    }

    const visits = await visitService.getHospitalVisits(req.user.hospitalId, {
      status: VisitStatus.PENDING,
    });

    sendSuccess(res, { count: visits.length, visits }, 'Pending visits retrieved successfully');
  } catch (error: any) {
    logError('getPendingVisits', error);
    sendError(res, 'Failed to fetch pending visits', 500, getErrorMessage(error));
  }
};
