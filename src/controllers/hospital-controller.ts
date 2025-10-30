import { Request, Response } from 'express';
import * as hospitalService from '../services/hospital-service';
import { sendSuccess, sendError, sendCreated } from '../utils/response-handler';

/**
 * Create new hospital (Super Admin only)
 * POST /api/admin/hospitals
 */
export const createHospital = async (req: Request, res: Response) => {
  try {
    const { hospital, admin } = req.body;

    const result = await hospitalService.createHospital(hospital, admin);

    return sendCreated(res, result, 'Hospital created successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to create hospital', 400);
  }
};

/**
 * Get hospital by ID
 * GET /api/hospitals/:id
 */
export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalService.getHospitalById(id);

    return sendSuccess(res, hospital, 'Hospital retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get hospital', 404);
  }
};

/**
 * Get all hospitals (Super Admin only)
 * GET /api/admin/hospitals
 */
export const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const filters: any = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const hospitals = await hospitalService.getAllHospitals(filters);

    return sendSuccess(res, hospitals, 'Hospitals retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get hospitals', 500);
  }
};

/**
 * Update hospital
 * PUT /api/hospitals/:id
 */
export const updateHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const hospital = await hospitalService.updateHospital(id, updateData);

    return sendSuccess(res, hospital, 'Hospital updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update hospital', 400);
  }
};

/**
 * Deactivate hospital
 * POST /api/hospitals/:id/deactivate
 */
export const deactivateHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalService.deactivateHospital(id);

    return sendSuccess(res, hospital, 'Hospital deactivated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to deactivate hospital', 400);
  }
};

/**
 * Activate hospital
 * POST /api/hospitals/:id/activate
 */
export const activateHospital = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalService.activateHospital(id);

    return sendSuccess(res, hospital, 'Hospital activated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to activate hospital', 400);
  }
};

/**
 * Get hospital statistics
 * GET /api/hospitals/:id/stats
 */
export const getHospitalStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await hospitalService.getHospitalStats(id);

    return sendSuccess(res, stats, 'Hospital statistics retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get hospital statistics', 500);
  }
};
