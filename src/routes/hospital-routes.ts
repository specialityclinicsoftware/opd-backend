import { Router } from 'express';
import * as hospitalController from '../controllers/hospital-controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/user';

const router = Router();

// Super Admin routes
router.post(
  '/admin/hospitals',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  hospitalController.createHospital
);

router.get(
  '/admin/hospitals',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  hospitalController.getAllHospitals
);

// Hospital routes (accessible by hospital admin and above)
router.get(
  '/hospitals/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE),
  hospitalController.getHospitalById
);

router.put(
  '/hospitals/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  hospitalController.updateHospital
);

router.post(
  '/hospitals/:id/deactivate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  hospitalController.deactivateHospital
);

router.post(
  '/hospitals/:id/activate',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  hospitalController.activateHospital
);

router.get(
  '/hospitals/:id/stats',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN),
  hospitalController.getHospitalStats
);

export default router;
