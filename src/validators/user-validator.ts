import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';
import { UserRole } from '../models/user';

/**
 * Validation middleware for creating a user
 */
export const validateCreateUser = [
  body('name')
    .exists().withMessage('Name is required')
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string')
    .trim(),

  body('email')
    .exists().withMessage('Email is required')
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  body('password')
    .exists().withMessage('Password is required')
    .notEmpty().withMessage('Password cannot be empty')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .exists().withMessage('Role is required')
    .notEmpty().withMessage('Role cannot be empty')
    .isIn(Object.values(UserRole)).withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),

  body('phoneNumber')
    .optional()
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('specialization')
    .optional()
    .isString().withMessage('Specialization must be a string')
    .trim(),

  body('licenseNumber')
    .optional()
    .isString().withMessage('License number must be a string')
    .trim(),

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
 * Validation middleware for updating a user
 */
export const validateUpdateUser = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string')
    .trim(),

  body('email')
    .optional()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(Object.values(UserRole)).withMessage(`Role must be one of: ${Object.values(UserRole).join(', ')}`),

  body('phoneNumber')
    .optional()
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('specialization')
    .optional()
    .isString().withMessage('Specialization must be a string')
    .trim(),

  body('licenseNumber')
    .optional()
    .isString().withMessage('License number must be a string')
    .trim(),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];
