import { Router } from 'express';
import * as visitWorkflowController from '../controllers/visit-workflow-controller';
import { authenticate, authorize, checkHospitalAccess } from '../middleware/auth';
import { UserRole } from '../models/user';
import { validateUpdatePreConsultation, validateUpdateConsultation, validateCancelVisit } from '../validators/visit-workflow-validator';

const router = Router();

// Queue endpoints
router.get(
  '/visits/queue/nurse',
  authenticate,
  authorize(UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.getNurseQueue
);

router.get(
  '/visits/queue/doctor',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.getDoctorQueue
);

// Nurse pre-consultation endpoints
router.post(
  '/visits/:id/start-pre-consultation',
  authenticate,
  authorize(UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.startPreConsultation
);

router.put(
  '/visits/:id/pre-consultation',
  authenticate,
  authorize(UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateUpdatePreConsultation,
  visitWorkflowController.updatePreConsultation
);

router.post(
  '/visits/:id/complete-pre-consultation',
  authenticate,
  authorize(UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.completePreConsultation
);

// Doctor consultation endpoints
router.post(
  '/visits/:id/start-consultation',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.startConsultation
);

router.put(
  '/visits/:id/consultation',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateUpdateConsultation,
  visitWorkflowController.updateConsultation
);

router.post(
  '/visits/:id/finalize',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.finalizeVisit
);

// General visit endpoints
router.get(
  '/visits/:id',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  visitWorkflowController.getVisitById
);

router.post(
  '/visits/:id/cancel',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  validateCancelVisit,
  visitWorkflowController.cancelVisit
);

router.get(
  '/hospitals/:hospitalId/visits',
  authenticate,
  authorize(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN),
  checkHospitalAccess,
  visitWorkflowController.getHospitalVisits
);

export default router;
