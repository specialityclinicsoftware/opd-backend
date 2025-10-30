import express from 'express';
import {
  createVisit,
  getPatientVisits,
  getVisitById,
  getLatestVisit,
  updateVisit,
  deleteVisit,
  getPatientHistory,
} from '../controllers/visit-controller';
import { validateCreateVisit, validateUpdateVisit } from '../validators/visit-validator';

const router = express.Router();

// Visit routes
router.post('/', validateCreateVisit, createVisit);
router.get('/patient/:patientId', getPatientVisits);
router.get('/patient/:patientId/latest', getLatestVisit);
router.get('/patient/:patientId/history', getPatientHistory);
router.get('/:id', getVisitById);
router.put('/:id', validateUpdateVisit, updateVisit);
router.delete('/:id', deleteVisit);

export default router;
