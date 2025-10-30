import { body, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';

/**
 * Validation middleware for registering a patient
 */
export const validateRegisterPatient = [
  body('name')
    .exists().withMessage('Name is required')
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string')
    .trim(),

  body('phoneNumber')
    .exists().withMessage('Phone number is required')
    .notEmpty().withMessage('Phone number cannot be empty')
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
    .trim(),

  body('hospitalId')
    .optional()
    .isMongoId().withMessage('Invalid hospital ID'),

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
 * Validation middleware for updating a patient
 */
export const validateUpdatePatient = [
  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string')
    .trim(),

  body('phoneNumber')
    .optional()
    .notEmpty().withMessage('Phone number cannot be empty')
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),

  body('address')
    .optional()
    .isString().withMessage('Address must be a string')
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
 * Validation middleware for searching patient by phone
 */
export const validateSearchByPhone = [
  query('phoneNumber')
    .exists().withMessage('Phone number is required')
    .notEmpty().withMessage('Phone number cannot be empty')
    .isString().withMessage('Phone number must be a string'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];
