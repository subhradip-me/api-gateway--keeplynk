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
router.patch('/:id/trash', FolderController.moveToTrash);
router.patch('/:id/restore', FolderController.restoreFromTrash);
router.delete('/:id', FolderController.hardDelete);

export default router;
