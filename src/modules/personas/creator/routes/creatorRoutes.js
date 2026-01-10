import express from 'express';
const router = express.Router();
import CreatorController from '../controllers/creatorController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

router.use(authenticate);
router.use(requirePersona('creator'));

// Dashboard
router.get('/dashboard', CreatorController.getDashboard);

// Projects
router.post('/projects', CreatorController.createProject);
router.get('/projects', CreatorController.getProjects);
router.put('/projects/:id', CreatorController.updateProject);
router.delete('/projects/:id', CreatorController.deleteProject);

// Calendar
router.post('/calendar', CreatorController.createCalendarEntry);
router.get('/calendar', CreatorController.getCalendar);
router.put('/calendar/:id', CreatorController.updateCalendarEntry);
router.delete('/calendar/:id', CreatorController.deleteCalendarEntry);

export default router;
