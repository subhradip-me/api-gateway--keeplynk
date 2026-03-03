import express from 'express';
const router = express.Router();
import FolderController from '../controllers/folderController.js';
import { authenticate, personaContext } from '../../shared/middleware/authMiddleware.js';

// Apply authentication and persona context to all routes
router.use(authenticate);
router.use(personaContext);

// Folder routes
router.post('/', FolderController.create);
router.get('/', FolderController.getAll);
router.get('/:id', FolderController.getById);
router.put('/:id', FolderController.update);

// Trash routes
router.patch('/:id/trash', FolderController.softDelete);
router.patch('/:id/restore', FolderController.restore);
router.delete('/:id/hard', FolderController.hardDelete);
router.get('/trash/all', FolderController.getTrash);

export default router;
