import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';

/**
 * Validation middleware for adding medication history
 */
export const validateAddMedicationHistory = [
  body('patientId')
    .exists().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),

  body('visitId')
    .exists().withMessage('Visit ID is required')
    .isMongoId().withMessage('Invalid visit ID'),

  body('doctorId')
    .exists().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Invalid doctor ID'),

  body('hospitalId')
    .optional()
    .isMongoId().withMessage('Invalid hospital ID'),

  body('consultingDoctor')
    .optional()
    .isString().withMessage('Consulting doctor must be a string')
    .trim(),

  body('diagnosis')
    .optional()
    .isString().withMessage('Diagnosis must be a string')
    .trim(),

  body('medications')
    .exists().withMessage('Medications are required')
    .isArray({ min: 1 }).withMessage('At least one medication is required'),

  body('medications.*.medicineName')
    .exists().withMessage('Medicine name is required')
    .notEmpty().withMessage('Medicine name cannot be empty')
    .isString().withMessage('Medicine name must be a string')
    .trim(),

  body('medications.*.dosage')
    .exists().withMessage('Dosage is required')
    .notEmpty().withMessage('Dosage cannot be empty')
    .isString().withMessage('Dosage must be a string')
    .trim(),

  body('medications.*.frequency')
    .exists().withMessage('Frequency is required')
    .notEmpty().withMessage('Frequency cannot be empty')
    .isString().withMessage('Frequency must be a string')
    .trim(),

  body('medications.*.duration')
    .exists().withMessage('Duration is required')
    .notEmpty().withMessage('Duration cannot be empty')
    .isString().withMessage('Duration must be a string')
    .trim(),

  body('medications.*.route')
    .optional()
    .isString().withMessage('Route must be a string')
    .trim(),

  body('medications.*.instructions')
    .optional()
    .isString().withMessage('Instructions must be a string')
    .trim(),

  body('medications.*.timing')
    .optional()
    .isString().withMessage('Timing must be a string')
    .trim(),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
    .trim(),

  body('prescribedDate')
    .optional()
    .isISO8601().withMessage('Invalid prescribed date format'),

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
 * Validation middleware for updating medication history
 */
export const validateUpdateMedicationHistory = [
  body('consultingDoctor')
    .optional()
    .isString().withMessage('Consulting doctor must be a string')
    .trim(),

  body('diagnosis')
    .optional()
    .isString().withMessage('Diagnosis must be a string')
    .trim(),

  body('medications')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one medication is required if updating medications'),

  body('medications.*.medicineName')
    .optional()
    .notEmpty().withMessage('Medicine name cannot be empty')
    .isString().withMessage('Medicine name must be a string')
    .trim(),

  body('medications.*.dosage')
    .optional()
    .notEmpty().withMessage('Dosage cannot be empty')
    .isString().withMessage('Dosage must be a string')
    .trim(),

  body('medications.*.frequency')
    .optional()
    .notEmpty().withMessage('Frequency cannot be empty')
    .isString().withMessage('Frequency must be a string')
    .trim(),

  body('medications.*.duration')
    .optional()
    .notEmpty().withMessage('Duration cannot be empty')
    .isString().withMessage('Duration must be a string')
    .trim(),

  body('medications.*.route')
    .optional()
    .isString().withMessage('Route must be a string')
    .trim(),

  body('medications.*.instructions')
    .optional()
    .isString().withMessage('Instructions must be a string')
    .trim(),

  body('medications.*.timing')
    .optional()
    .isString().withMessage('Timing must be a string')
    .trim(),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
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
