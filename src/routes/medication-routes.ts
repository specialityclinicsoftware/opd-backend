import express from 'express';
import {
  addMedicationHistory,
  getPatientMedicationHistory,
  getVisitMedicationHistory,
  updateMedicationHistory,
  deleteMedicationHistory,
  getRecentPrescriptions,
} from '../controllers/medication-controller';
import { validateAddMedicationHistory, validateUpdateMedicationHistory } from '../validators/medication-validator';

const router = express.Router();

// Medication history routes
router.post('/', validateAddMedicationHistory, addMedicationHistory);
router.get('/patient/:patientId', getPatientMedicationHistory);
router.get('/patient/:patientId/recent', getRecentPrescriptions);
router.get('/visit/:visitId', getVisitMedicationHistory);
router.get('/:id', getVisitMedicationHistory); // Get by medication history ID
router.put('/:id', validateUpdateMedicationHistory, updateMedicationHistory);
router.delete('/:id', deleteMedicationHistory);

export default router;
