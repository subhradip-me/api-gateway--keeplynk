import express from 'express';
const router = express.Router();
import EntrepreneurController from '../controllers/entrepreneurController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

router.use(authenticate);
router.use(requirePersona('entrepreneur'));

// Dashboard
router.get('/dashboard', EntrepreneurController.getDashboard);

// Startups
router.post('/startups', EntrepreneurController.createStartup);
router.get('/startups', EntrepreneurController.getStartups);
router.put('/startups/:id', EntrepreneurController.updateStartup);
router.delete('/startups/:id', EntrepreneurController.deleteStartup);

// Investors
router.post('/investors', EntrepreneurController.createInvestor);
router.get('/investors', EntrepreneurController.getInvestors);
router.put('/investors/:id', EntrepreneurController.updateInvestor);
router.delete('/investors/:id', EntrepreneurController.deleteInvestor);

export default router;
