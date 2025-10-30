import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';

/**
 * Validation middleware for creating a hospital
 */
export const validateCreateHospital = [
  // Validate hospital object exists
  body('hospital').exists().withMessage('Hospital data is required'),

  // Hospital fields validation
  body('hospital.hospitalName')
    .exists().withMessage('Hospital name is required')
    .notEmpty().withMessage('Hospital name cannot be empty')
    .isString().withMessage('Hospital name must be a string')
    .trim(),

  body('hospital.address')
    .exists().withMessage('Address is required')
    .notEmpty().withMessage('Address cannot be empty')
    .isString().withMessage('Address must be a string')
    .trim(),

  body('hospital.city')
    .exists().withMessage('City is required')
    .notEmpty().withMessage('City cannot be empty')
    .isString().withMessage('City must be a string')
    .trim(),

  body('hospital.state')
    .exists().withMessage('State is required')
    .notEmpty().withMessage('State cannot be empty')
    .isString().withMessage('State must be a string')
    .trim(),

  body('hospital.pincode')
    .exists().withMessage('Pincode is required')
    .notEmpty().withMessage('Pincode cannot be empty')
    .isString().withMessage('Pincode must be a string')
    .trim(),

  body('hospital.phoneNumber')
    .exists().withMessage('Phone number is required')
    .notEmpty().withMessage('Phone number cannot be empty')
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('hospital.email')
    .exists().withMessage('Email is required')
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  // Validate admin object exists
  body('admin').exists().withMessage('Admin data is required'),

  // Admin fields validation
  body('admin.name')
    .exists().withMessage('Admin name is required')
    .notEmpty().withMessage('Admin name cannot be empty')
    .isString().withMessage('Admin name must be a string')
    .trim(),

  body('admin.email')
    .exists().withMessage('Admin email is required')
    .notEmpty().withMessage('Admin email cannot be empty')
    .isEmail().withMessage('Admin email must be valid')
    .normalizeEmail(),

  body('admin.password')
    .exists().withMessage('Admin password is required')
    .notEmpty().withMessage('Admin password cannot be empty')
    .isString().withMessage('Admin password must be a string')
    .isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters long'),

  // Middleware to handle validation errors
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
 * Validation middleware for updating a hospital
 */
export const validateUpdateHospital = [
  body('hospitalName')
    .optional()
    .notEmpty().withMessage('Hospital name cannot be empty')
    .isString().withMessage('Hospital name must be a string')
    .trim(),

  body('address')
    .optional()
    .notEmpty().withMessage('Address cannot be empty')
    .isString().withMessage('Address must be a string')
    .trim(),

  body('city')
    .optional()
    .notEmpty().withMessage('City cannot be empty')
    .isString().withMessage('City must be a string')
    .trim(),

  body('state')
    .optional()
    .notEmpty().withMessage('State cannot be empty')
    .isString().withMessage('State must be a string')
    .trim(),

  body('pincode')
    .optional()
    .notEmpty().withMessage('Pincode cannot be empty')
    .isString().withMessage('Pincode must be a string')
    .trim(),

  body('phoneNumber')
    .optional()
    .notEmpty().withMessage('Phone number cannot be empty')
    .isString().withMessage('Phone number must be a string')
    .trim(),

  body('email')
    .optional()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return sendValidationError(res, errorMessages);
    }
    next();
  }
];
