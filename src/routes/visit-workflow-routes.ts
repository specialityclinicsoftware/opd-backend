import { Router } from 'express';
import * as visitWorkflowController from '../controllers/visit-workflow-controller';
import { authenticate, authorize, checkHospitalAccess } from '../middleware/auth';
import { UserRole } from '../models/user';
import { validateUpdatePreConsultation, validateUpdateConsultation, validateCancelVisit } from '../validators/visit-workflow-validator';

const router = Router();



router.post(
  '/visits/workflow/:id/pre-consultation',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateUpdatePreConsultation,
  visitWorkflowController.updatePreConsultation
);




router.post(
  '/visits/workflow/:id/consultation',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateUpdateConsultation,
  visitWorkflowController.updateConsultation
);


// General visit endpoints
router.get(
  '/visits/workflow/:id',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.getVisitById
);

router.post(
  '/visits/workflow/:id/cancel',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateCancelVisit,
  visitWorkflowController.cancelVisit
);

router.get(
  '/hospitals/:hospitalId/visits/workflow',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  checkHospitalAccess,
  visitWorkflowController.getHospitalVisits
);

router.get(
  '/hospitals/:hospitalId/visits/workflow/recent',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  checkHospitalAccess,
  visitWorkflowController.getRecentVisits
);

export default router;
