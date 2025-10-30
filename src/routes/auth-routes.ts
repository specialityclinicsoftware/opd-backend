import { Router } from 'express';
import * as authController from '../controllers/auth-controller';
import { authenticate } from '../middleware/auth';
import { validateLogin, validateRefreshToken, validateChangePassword } from '../validators/auth-validator';

const router = Router();

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshTokenHandler);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);

export default router;
