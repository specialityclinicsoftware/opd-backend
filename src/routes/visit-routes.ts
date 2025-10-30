import express from 'express';
import {
  createVisit,
  getPatientVisits,
  getVisitById,
  getLatestVisit,
  updateVisit,
  deleteVisit,
  getPatientHistory,
  getPendingVisits,
} from '../controllers/visit-controller';
import { validateCreateVisit, validateUpdateVisit } from '../validators/visit-validator';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/user';

const router = express.Router();

// Visit routes
router.post('/', validateCreateVisit, createVisit);

// IMPORTANT: Specific routes must come BEFORE parameterized routes like /:id
// Get pending visits (must be before /:id route)
router.get(
  '/pending',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST),
  getPendingVisits
);

router.get('/patient/:patientId', getPatientVisits);
router.get('/patient/:patientId/latest', getLatestVisit);
router.get('/patient/:patientId/history', getPatientHistory);

// Generic ID route must come AFTER all specific routes
router.get('/:id', getVisitById);
router.put('/:id', validateUpdateVisit, updateVisit);
router.delete('/:id', deleteVisit);

export default router;
