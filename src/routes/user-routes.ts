import { Router } from 'express';
import * as userController from '../controllers/user-controller';
import { authenticate, authorize, checkHospitalAccess } from '../middleware/auth';
import { UserRole } from '../models/user';

const router = Router();

// Hospital Admin and Super Admin can create/manage users
router.post(
  '/hospitals/:hospitalId/users',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  checkHospitalAccess,
  userController.createUser
);

router.get(
  '/hospitals/:hospitalId/users',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  checkHospitalAccess,
  userController.getUsersByHospital
);

router.get(
  '/hospitals/:hospitalId/doctors',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  checkHospitalAccess,
  userController.getDoctorsByHospital
);

router.get(
  '/hospitals/:hospitalId/nurses',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  checkHospitalAccess,
  userController.getNursesByHospital
);

router.get(
  '/users/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  userController.getUserById
);

router.put(
  '/users/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  userController.updateUser
);

router.post(
  '/users/:id/deactivate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  userController.deactivateUser
);

router.post(
  '/users/:id/activate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  userController.activateUser
);

router.delete(
  '/users/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  userController.deleteUser
);

export default router;
