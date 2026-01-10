import express from 'express';
const router = express.Router();
import ResourceController from '../controllers/resourceController.js';
import { authenticate, personaContext } from '../../shared/middleware/authMiddleware.js';
import upload from '../../shared/middleware/upload.js';

// Apply authentication and persona context to all routes
router.use(authenticate);
router.use(personaContext);

// Resource routes
// NOTE: Specific routes MUST come before parameterized routes (:id)
router.post('/', ResourceController.create);
router.post('/upload', upload.single('file'), ResourceController.upload);
router.get('/search', ResourceController.search);
router.get('/unorganized', ResourceController.getUnorganized);
router.get('/', ResourceController.getAll);
router.get('/:id', ResourceController.getById);
router.put('/:id', ResourceController.update);
router.delete('/:id', ResourceController.delete);

export default router;
