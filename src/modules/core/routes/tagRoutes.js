import express from 'express';
const router = express.Router();
import TagController from '../controllers/tagController.js';
import { authenticate, personaContext } from '../../shared/middleware/authMiddleware.js';

// Apply authentication and persona context to all routes
router.use(authenticate);
router.use(personaContext);

// Tag routes
router.post('/', TagController.create);
router.get('/', TagController.getAll);
router.get('/popular', TagController.getPopular);
router.get('/:id', TagController.getById);
router.put('/:id', TagController.update);
router.delete('/:id', TagController.delete);

export default router;
