import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';

/**
 * Validation middleware for login
 */
export const validateLogin = [
  body('email')
    .exists().withMessage('Email is required')
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  body('password')
    .exists().withMessage('Password is required')
    .notEmpty().withMessage('Password cannot be empty')
    .isString().withMessage('Password must be a string'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];

/**
 * Validation middleware for refresh token
 */
export const validateRefreshToken = [
  body('refreshToken')
    .exists().withMessage('Refresh token is required')
    .notEmpty().withMessage('Refresh token cannot be empty')
    .isString().withMessage('Refresh token must be a string'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];

/**
 * Validation middleware for change password
 */
export const validateChangePassword = [
  body('oldPassword')
    .exists().withMessage('Old password is required')
    .notEmpty().withMessage('Old password cannot be empty')
    .isString().withMessage('Old password must be a string'),

  body('newPassword')
    .exists().withMessage('New password is required')
    .notEmpty().withMessage('New password cannot be empty')
    .isString().withMessage('New password must be a string')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];
