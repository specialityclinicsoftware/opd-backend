import { Request, Response } from 'express';
import * as visitService from '../services/visit-service';
import { sendSuccess, sendError } from '../utils/response-handler';
import { Account } from '../models/account';
import { VisitStatus } from '../models/visit';


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
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to update pre-consultation';
      return sendError(res, message, 400);
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
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to update consultation';
      return sendError(res, message, 400);
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
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to cancel visit';
      return sendError(res, message, 400);
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
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to get visit';
      return sendError(res, message, 500);
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

      const filters: {
        status?: VisitStatus;
        startDate?: Date;
        endDate?: Date;
        doctorId?: string;
        nurseId?: string;
      } = {};

      if (status) {
        filters.status = status as VisitStatus;
      }
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }
      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }
      if (doctorId) {
        filters.doctorId = doctorId as string;
      }
      if (nurseId) {
        filters.nurseId = nurseId as string;
      }

      const visits = await visitService.getHospitalVisits(hospitalId, filters);

      return sendSuccess(res, visits, 'Hospital visits retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to get hospital visits';
      return sendError(res, message, 500);
    }
}

/**
   * Get recent visits for a hospital (last 10 visits)
   * GET /api/hospitals/:hospitalId/visits/recent
   */
export const getRecentVisits = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;

      const visits = await visitService.getRecentHospitalVisits(hospitalId);

      return sendSuccess(res, visits, 'Recent visits retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? (error as Error).message : 'Failed to get recent visits';
      return sendError(res, message, 500);
    }
}
