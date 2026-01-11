import express from 'express';
const router = express.Router();
import GenaralController from '../controllers/genaralController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

// Apply authentication and persona check to all routes
router.use(authenticate);
router.use(requirePersona('genaral'));

// Dashboard
router.get('/dashboard', GenaralController.getDashboard);

export default router;
