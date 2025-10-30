import { Request, Response } from 'express';
import * as visitService from '../services/visit-service';
import { sendSuccess, sendError, sendCreated } from '../utils/response-handler';
import { UserRole } from '../models/user';
import { Account } from '../models/account';


/**
   * Get nurse queue
   * GET /api/visits/queue/nurse
   */
export const getNurseQueue = async (req: Request, res: Response) => {
    try {
      if (!req.user?.hospitalId) {
        return sendError(res, 'Hospital ID required', 400);
      }

      const visits = await visitService.getNurseQueue(
        req.user.hospitalId,
        req.user.role === UserRole.NURSE ? req.user.userId : undefined
      );

      return sendSuccess(res, visits, 'Nurse queue retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get nurse queue', 500);
    }
}

/**
   * Get doctor queue
   * GET /api/visits/queue/doctor
   */
export const getDoctorQueue = async (req: Request, res: Response) => {
    try {
      if (!req.user?.hospitalId) {
        return sendError(res, 'Hospital ID required', 400);
      }

      const visits = await visitService.getDoctorQueue(
        req.user.hospitalId,
        req.user.role === UserRole.DOCTOR ? req.user.userId : undefined
      );

      return sendSuccess(res, visits, 'Doctor queue retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get doctor queue', 500);
    }
}

/**
   * Start pre-consultation (nurse picks up visit)
   * POST /api/visits/:id/start-pre-consultation
   */
export const startPreConsultation = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const visit = await visitService.startPreConsultation(id, req.user.userId);

      return sendSuccess(res, visit, 'Pre-consultation started successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to start pre-consultation', 400);
    }
}

/**
   * Update pre-consultation data
   * PUT /api/visits/:id/pre-consultation
   */
export const updatePreConsultation = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const updateData = req.body;

      const visit = await visitService.updatePreConsultation(id, req.user.userId, updateData);

      return sendSuccess(res, visit, 'Pre-consultation updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update pre-consultation', 400);
    }
}

/**
   * Complete pre-consultation
   * POST /api/visits/:id/complete-pre-consultation
   */
export const completePreConsultation = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const visit = await visitService.completePreConsultation(id, req.user.userId);

      return sendSuccess(res, visit, 'Pre-consultation completed successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to complete pre-consultation', 400);
    }
}

/**
   * Start consultation (doctor picks up visit)
   * POST /api/visits/:id/start-consultation
   */
export const startConsultation = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const visit = await visitService.startConsultation(id, req.user.userId);

      return sendSuccess(res, visit, 'Consultation started successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to start consultation', 400);
    }
}

/**
   * Update consultation data
   * PUT /api/visits/:id/consultation
   */
export const updateConsultation = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const updateData = req.body;

      // Check hospital settings for nurse data edit permission
      const hospital = await Account.findById(req.user.hospitalId);
      const canEditNurseData = hospital?.settings?.allowNurseEdit || false;

      const visit = await visitService.updateConsultation(
        id,
        req.user.userId,
        updateData,
        canEditNurseData
      );

      return sendSuccess(res, visit, 'Consultation updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update consultation', 400);
    }
}

/**
   * Finalize visit (doctor completes)
   * POST /api/visits/:id/finalize
   */
export const finalizeVisit = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const visit = await visitService.finalizeVisit(id, req.user.userId);

      return sendSuccess(res, visit, 'Visit finalized successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to finalize visit', 400);
    }
}

/**
   * Cancel visit
   * POST /api/visits/:id/cancel
   */
export const cancelVisit = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const visit = await visitService.cancelVisit(id, reason);

      return sendSuccess(res, visit, 'Visit cancelled successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to cancel visit', 400);
    }
}

/**
   * Get visit by ID
   * GET /api/visits/:id
   */
export const getVisitById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const visit = await visitService.getVisitById(id);

      if (!visit) {
        return sendError(res, 'Visit not found', 404);
      }

      return sendSuccess(res, visit, 'Visit retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get visit', 500);
    }
}

/**
   * Get all visits by hospital with filters
   * GET /api/hospitals/:hospitalId/visits
   */
export const getHospitalVisits = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const { status, startDate, endDate, doctorId, nurseId } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status;
      }
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      if (doctorId) {
        filters.doctorId = doctorId;
      }
      if (nurseId) {
        filters.nurseId = nurseId;
      }

      const visits = await visitService.getHospitalVisits(hospitalId, filters);

      return sendSuccess(res, visits, 'Hospital visits retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get hospital visits', 500);
    }
}
