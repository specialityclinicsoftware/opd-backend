import { Request, Response } from 'express';
import * as authService from '../services/auth-service';
import { sendSuccess, sendError } from '../utils/response-handler';

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return sendSuccess(res, result, 'Login successful');
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 401);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Token refresh failed', 401);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await authService.getCurrentUser(req.user.userId);

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to get user', 500);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const result = await authService.logout(req.user.userId);

    return sendSuccess(res, result, 'Logout successful');
  } catch (error: any) {
    return sendError(res, error.message || 'Logout failed', 500);
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { oldPassword, newPassword } = req.body;

    const result = await authService.changePassword(req.user.userId, oldPassword, newPassword);

    return sendSuccess(res, result, 'Password changed successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Password change failed', 400);
  }
};
