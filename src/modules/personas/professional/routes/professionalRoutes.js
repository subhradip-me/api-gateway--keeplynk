import express from 'express';
const router = express.Router();
import ProfessionalController from '../controllers/professionalController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

router.use(authenticate);
router.use(requirePersona('professional'));

// Dashboard
router.get('/dashboard', ProfessionalController.getDashboard);

// Projects
router.post('/projects', ProfessionalController.createProject);
router.get('/projects', ProfessionalController.getProjects);
router.put('/projects/:id', ProfessionalController.updateProject);
router.delete('/projects/:id', ProfessionalController.deleteProject);

// Contacts
router.post('/contacts', ProfessionalController.createContact);
router.get('/contacts', ProfessionalController.getContacts);
router.put('/contacts/:id', ProfessionalController.updateContact);
router.delete('/contacts/:id', ProfessionalController.deleteContact);

export default router;
