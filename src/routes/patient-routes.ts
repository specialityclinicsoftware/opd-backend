import express from 'express';
import {
  registerPatient,
  getAllPatients,
  getPatientById,
  searchPatientByPhone,
  updatePatient,
  deletePatient,
} from '../controllers/patient-controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/user';

const router = express.Router();

// All patient routes require authentication
router.use(authenticate);

// Patient routes - accessible by all authenticated users in the hospital
router.post(
  '/register',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
  registerPatient
);

router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
  getAllPatients
);

router.get(
  '/search',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
  searchPatientByPhone
);

router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
  getPatientById
);

router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  updatePatient
);

router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  deletePatient
);

export default router;
