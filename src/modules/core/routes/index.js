import express from 'express';
const router = express.Router();
import resourceRoutes from './resourceRoutes.js';
import folderRoutes from './folderRoutes.js';
import tagRoutes from './tagRoutes.js';

// Mount sub-routes
router.use('/resources', resourceRoutes);
router.use('/folders', folderRoutes);
router.use('/tags', tagRoutes);

// TODO: Add other core routes (notes, tasks)

export default router;
