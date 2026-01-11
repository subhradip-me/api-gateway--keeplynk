import express from 'express';
import authRoutes from './modules/auth/routes/authRoutes.js';
import agentRoutes from './modules/agent/routes/agent.routes.js';
import resourceRoutes from './modules/core/routes/resourceRoutes.js';
import folderRoutes from './modules/core/routes/folderRoutes.js';
import tagRoutes from './modules/core/routes/tagRoutes.js';
import organiseRoutes from './modules/organise/routes/organise.routes.js';
import studentRoutes from './modules/personas/student/routes/studentRoutes.js';
import genaralRoutes from './modules/personas/genaral/routes/genaralRoutes.js';
import professionalRoutes from './modules/personas/professional/routes/professionalRoutes.js';
import creatorRoutes from './modules/personas/creator/routes/creatorRoutes.js';
import entrepreneurRoutes from './modules/personas/entrepreneur/routes/entrepreneurRoutes.js';
import researcherRoutes from './modules/personas/researcher/routes/researcherRoutes.js';

const router = express.Router();

// Basic API info
router.get('/', (req, res) => {
  res.json({
    name: 'KeepLynk API Gateway',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      agent: '/api/agent',
      resources: '/api/resources',
      folders: '/api/folders',
      tags: '/api/tags',
      organise: '/api/organise',
      student: '/api/student',
      professional: '/api/professional',
      creator: '/api/creator',
      entrepreneur: '/api/entrepreneur',
      researcher: '/api/researcher',
      genaral: '/api/genaral'
    }
  });
});

// Agent routes
router.use('/agent', agentRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Core routes
router.use('/resources', resourceRoutes);
router.use('/folders', folderRoutes);
router.use('/tags', tagRoutes);

// Auto Organise routes
router.use('/organise', organiseRoutes);

// Persona-specific routes
router.use('/student', studentRoutes);
router.use('/genaral', genaralRoutes);
router.use('/professional', professionalRoutes);
router.use('/creator', creatorRoutes);
router.use('/entrepreneur', entrepreneurRoutes);
router.use('/researcher', researcherRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Users endpoint - implement your logic here' });
});

export default router;
