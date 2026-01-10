import express from 'express';
const router = express.Router();
import ResearcherController from '../controllers/researcherController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

router.use(authenticate);
router.use(requirePersona('researcher'));

// Dashboard
router.get('/dashboard', ResearcherController.getDashboard);

// Projects
router.post('/projects', ResearcherController.createProject);
router.get('/projects', ResearcherController.getProjects);
router.put('/projects/:id', ResearcherController.updateProject);
router.delete('/projects/:id', ResearcherController.deleteProject);

// Publications
router.post('/publications', ResearcherController.createPublication);
router.get('/publications', ResearcherController.getPublications);
router.put('/publications/:id', ResearcherController.updatePublication);
router.delete('/publications/:id', ResearcherController.deletePublication);

export default router;
