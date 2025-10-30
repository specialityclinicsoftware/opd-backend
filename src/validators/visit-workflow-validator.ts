import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response-handler';

/**
 * Validation middleware for updating pre-consultation data
 */
export const validateUpdatePreConsultation = [
  body('vitals.pulseRate')
    .optional()
    .isNumeric().withMessage('Pulse rate must be a number'),

  body('vitals.bloodPressure.systolic')
    .optional()
    .isNumeric().withMessage('Systolic blood pressure must be a number'),

  body('vitals.bloodPressure.diastolic')
    .optional()
    .isNumeric().withMessage('Diastolic blood pressure must be a number'),

  body('vitals.spO2')
    .optional()
    .isNumeric().withMessage('SpO2 must be a number')
    .isFloat({ min: 0, max: 100 }).withMessage('SpO2 must be between 0 and 100'),

  body('vitals.temperature')
    .optional()
    .isNumeric().withMessage('Temperature must be a number'),

  body('chiefComplaints')
    .optional()
    .isString().withMessage('Chief complaints must be a string')
    .trim(),

  body('pastHistory')
    .optional()
    .isString().withMessage('Past history must be a string')
    .trim(),

  body('familyHistory')
    .optional()
    .isString().withMessage('Family history must be a string')
    .trim(),

  body('maritalHistory')
    .optional()
    .isString().withMessage('Marital history must be a string')
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
 * Validation middleware for updating consultation data
 */
export const validateUpdateConsultation = [
  body('vitals.pulseRate')
    .optional()
    .isNumeric().withMessage('Pulse rate must be a number'),

  body('vitals.bloodPressure.systolic')
    .optional()
    .isNumeric().withMessage('Systolic blood pressure must be a number'),

  body('vitals.bloodPressure.diastolic')
    .optional()
    .isNumeric().withMessage('Diastolic blood pressure must be a number'),

  body('vitals.spO2')
    .optional()
    .isNumeric().withMessage('SpO2 must be a number')
    .isFloat({ min: 0, max: 100 }).withMessage('SpO2 must be between 0 and 100'),

  body('vitals.temperature')
    .optional()
    .isNumeric().withMessage('Temperature must be a number'),

  body('chiefComplaints')
    .optional()
    .isString().withMessage('Chief complaints must be a string')
    .trim(),

  body('pastHistory')
    .optional()
    .isString().withMessage('Past history must be a string')
    .trim(),

  body('familyHistory')
    .optional()
    .isString().withMessage('Family history must be a string')
    .trim(),

  body('maritalHistory')
    .optional()
    .isString().withMessage('Marital history must be a string')
    .trim(),

  body('generalExamination.pallor')
    .optional()
    .isBoolean().withMessage('Pallor must be a boolean'),

  body('generalExamination.icterus')
    .optional()
    .isBoolean().withMessage('Icterus must be a boolean'),

  body('generalExamination.clubbing')
    .optional()
    .isBoolean().withMessage('Clubbing must be a boolean'),

  body('generalExamination.cyanosis')
    .optional()
    .isBoolean().withMessage('Cyanosis must be a boolean'),

  body('generalExamination.lymphadenopathy')
    .optional()
    .isBoolean().withMessage('Lymphadenopathy must be a boolean'),

  body('systemicExamination.cvs')
    .optional()
    .isString().withMessage('CVS examination must be a string')
    .trim(),

  body('systemicExamination.rs')
    .optional()
    .isString().withMessage('RS examination must be a string')
    .trim(),

  body('systemicExamination.pa')
    .optional()
    .isString().withMessage('PA examination must be a string')
    .trim(),

  body('systemicExamination.cns')
    .optional()
    .isString().withMessage('CNS examination must be a string')
    .trim(),

  body('diagnosis')
    .optional()
    .isString().withMessage('Diagnosis must be a string')
    .trim(),

  body('treatment')
    .optional()
    .isString().withMessage('Treatment must be a string')
    .trim(),

  body('investigation')
    .optional()
    .isString().withMessage('Investigation must be a string')
    .trim(),

  body('advice')
    .optional()
    .isString().withMessage('Advice must be a string')
    .trim(),

  body('reviewDate')
    .optional()
    .isISO8601().withMessage('Invalid review date format'),

  body('bloodInvestigations')
    .optional()
    .isArray().withMessage('Blood investigations must be an array'),

  body('bloodInvestigations.*.testName')
    .optional()
    .isString().withMessage('Test name must be a string')
    .trim(),

  body('bloodInvestigations.*.value')
    .optional()
    .isString().withMessage('Test value must be a string')
    .trim(),

  body('bloodInvestigations.*.unit')
    .optional()
    .isString().withMessage('Test unit must be a string')
    .trim(),

  body('bloodInvestigations.*.referenceRange')
    .optional()
    .isString().withMessage('Reference range must be a string')
    .trim(),

  body('bloodInvestigations.*.testDate')
    .optional()
    .isISO8601().withMessage('Invalid test date format'),

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
 * Validation middleware for canceling a visit
 */
export const validateCancelVisit = [
  body('reason')
    .optional()
    .isString().withMessage('Reason must be a string')
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
