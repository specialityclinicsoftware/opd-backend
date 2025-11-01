import express from 'express';
import {
  addInventoryItem,
  getHospitalInventory,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  updateItemQuantity,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats,
} from '../controllers/pharmacy-controller';

const router = express.Router();

// Inventory CRUD routes
router.post('/', addInventoryItem);
router.get('/hospital/:hospitalId', getHospitalInventory);
router.get('/hospital/:hospitalId/low-stock', getLowStockItems);
router.get('/hospital/:hospitalId/expiring', getExpiringItems);
router.get('/hospital/:hospitalId/stats', getInventoryStats);
router.get('/:id', getInventoryItemById);
router.put('/:id', updateInventoryItem);
router.patch('/:id/quantity', updateItemQuantity);
router.delete('/:id', deleteInventoryItem);

export default router;
