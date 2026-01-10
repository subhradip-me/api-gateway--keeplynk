import express from 'express';
import multer from 'multer';
import organiseController from '../controllers/organiseController.js';
import { authenticate, personaContext } from '../../shared/middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads (memory storage for AI processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

/**
 * Auto Organise Routes
 * All routes require authentication and persona context
 */

// Apply authentication and persona context to all routes
router.use(authenticate);
router.use(personaContext);

/**
 * POST /api/organise/auto
 * Trigger auto-organise for user's unorganised resources
 * Returns immediately, processing happens async
 */
router.post('/auto', (req, res) => {
  organiseController.autoOrganise(req, res);
});

/**
 * GET /api/organise/preview
 * Preview how many resources will be organized
 * (Optional - for better UX)
 */
router.get('/preview', (req, res) => {
  organiseController.preview(req, res);
});

/**
 * POST /api/organise/extract-metadata
 * Extract metadata from URL using AI for auto-filling forms
 */
router.post('/extract-metadata', (req, res) => {
  organiseController.extractMetadata(req, res);
});

/**
 * POST /api/organise/extract-document-metadata
 * Extract metadata from document using AI for auto-filling forms
 */
router.post('/extract-document-metadata', upload.single('file'), (req, res) => {
  organiseController.extractDocumentMetadata(req, res);
});

export default router;
