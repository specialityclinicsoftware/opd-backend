import { Request, Response } from 'express';
import * as userService from '../services/user-service';
import { sendSuccess, sendError, sendCreated } from '../utils/response-handler';
import { UserRole } from '../models/user';


/**
   * Create new user
   * POST /api/hospitals/:hospitalId/users
   */
export const createUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { hospitalId } = req.params;
      const userData = req.body;

      // Set hospital ID from params
      userData.hospitalId = hospitalId;

      const user = await userService.createUser(
        userData,
        req.user.role as UserRole,
        req.user.hospitalId
      );

      return sendCreated(res, user, 'User created successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to create user', 400);
    }
}

/**
   * Get users by hospital
   * GET /api/hospitals/:hospitalId/users
   */
export const getUsersByHospital = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;
      const { role, isActive } = req.query;

      console.log(hospitalId)

      const filters: any = {};
      if (role) {
        filters.role = role as UserRole;
      }
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      const users = await userService.getUsersByHospital(hospitalId, filters);

      return sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to get users', 500);
    }
}

/**
   * Get user by ID
   * GET /api/users/:id
   */
export const getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to get user', 404);
    }
}

/**
   * Update user
   * PUT /api/users/:id
   */
export const updateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.lastLogin;

      const user = await userService.updateUser(
        id,
        updateData,
        req.user.role as UserRole,
        req.user.hospitalId
      );

      return sendSuccess(res, user, 'User updated successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to update user', 400);
    }
}

/**
   * Deactivate user
   * POST /api/users/:id/deactivate
   */
export const deactivateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const user = await userService.deactivateUser(
        id,
        req.user.role as UserRole,
        req.user.hospitalId
      );

      return sendSuccess(res, user, 'User deactivated successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to deactivate user', 400);
    }
}

/**
   * Activate user
   * POST /api/users/:id/activate
   */
export const activateUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const user = await userService.activateUser(
        id,
        req.user.role as UserRole,
        req.user.hospitalId
      );

      return sendSuccess(res, user, 'User activated successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to activate user', 400);
    }
}

/**
   * Delete user
   * DELETE /api/users/:id
   */
export const deleteUser = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;

      const user = await userService.deleteUser(
        id,
        req.user.role as UserRole,
        req.user.hospitalId
      );

      return sendSuccess(res, user, 'User deleted successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to delete user', 400);
    }
}

/**
   * Get doctors by hospital
   * GET /api/hospitals/:hospitalId/doctors
   */
export const getDoctorsByHospital = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;

      const doctors = await userService.getDoctorsByHospital(hospitalId);

      return sendSuccess(res, doctors, 'Doctors retrieved successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to get doctors', 500);
    }
}

/**
   * Get nurses by hospital
   * GET /api/hospitals/:hospitalId/nurses
   */
export const getNursesByHospital = async (req: Request, res: Response) => {
    try {
      const { hospitalId } = req.params;

      const nurses = await userService.getNursesByHospital(hospitalId);

      return sendSuccess(res, nurses, 'Nurses retrieved successfully');
    } catch (error: unknown) {
      return sendError(res, (error as Error).message || 'Failed to get nurses', 500);
    }
}
