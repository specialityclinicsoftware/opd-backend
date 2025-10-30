import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { sendError } from '../utils/response-handler';
import { UserRole } from '../models/user';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - Verifies JWT token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

/**
 * Authorization middleware - Checks if user has required role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const hasRole = allowedRoles.includes(req.user.role as UserRole);

    if (!hasRole) {
      return sendError(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to the same hospital
 */
export const checkHospitalAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }

  // Super admin can access all hospitals
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // For other users, check if hospitalId matches
  const hospitalIdFromParam = req.params.hospitalId || req.body.hospitalId;

  if (hospitalIdFromParam && hospitalIdFromParam !== req.user.hospitalId) {
    return sendError(res, 'Access denied to this hospital', 403);
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if present
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};
