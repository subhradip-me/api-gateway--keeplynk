import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Protected routes
router.get('/me', authenticate, AuthController.getProfile);
router.post('/personas', authenticate, AuthController.addPersona);
router.put('/personas/switch', authenticate, AuthController.switchPersona);
router.delete('/personas/:persona', authenticate, AuthController.removePersona);

export default router;