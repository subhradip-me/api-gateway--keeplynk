import ResourceService from '../services/resourceService.js';
import { successResponse, errorResponse, createdResponse } from '../../shared/utils/responseHelpers.js';
import path from 'path';

class ResourceController {
  static async create(req, res) {
    try {
      // Debug logging
      console.log('=== CREATE RESOURCE DEBUG ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('req.user:', req.user);
      console.log('PersonaContext:', req.personaContext);
      console.log('User ID:', req.personaContext?.userId);
      console.log('Persona from context:', req.personaContext?.persona);
      console.log('Persona from body:', req.body.persona);
      console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
      console.log('Tags type:', typeof req.body.tags);
      console.log('Tags value:', req.body.tags);
      console.log('Tags is Array?:', Array.isArray(req.body.tags));
      if (Array.isArray(req.body.tags)) {
        console.log('First tag type:', typeof req.body.tags[0]);
        console.log('First tag value:', req.body.tags[0]);
      }
      console.log('===========================');
      
      if (!req.personaContext || !req.personaContext.persona) {
        console.error('❌ PERSONA CONTEXT MISSING OR INVALID');
        console.error('Available req.personaContext:', req.personaContext);
        console.error('Available req.user:', req.user);
        return errorResponse(res, 'Persona context is required. Please add a persona to your account.', 400);
      }
      
      const resource = await ResourceService.create(
        req.personaContext.userId,
        req.personaContext.persona,
        req.body
      );
      return createdResponse(res, resource, 'Resource created successfully');
    } catch (error) {
      console.error('Resource creation error:', error.message);
      console.error('Error stack:', error.stack);
      return errorResponse(res, error.message, 400);
    }
  }

  static async upload(req, res) {
    try {
      console.log('=== UPLOAD RESOURCE DEBUG ===');
      console.log('File:', req.file);
      console.log('Body:', req.body);
      console.log('===========================');

      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      // Parse tags if it's a JSON string
      let tags = req.body.tags;
      if (typeof tags === 'string') {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [];
        }
      }

      // Prepare resource data
      const resourceData = {
        type: 'document',
        title: req.body.title,
        description: req.body.description || '',
        filePath: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        tags: tags,
        folderId: req.body.folderId || null,
        isFavorite: req.body.isFavorite === 'true' || false
      };

      const resource = await ResourceService.create(
        req.personaContext.userId,
        req.personaContext.persona,
        resourceData
      );

      return createdResponse(res, resource, 'Document uploaded successfully');
    } catch (error) {
      console.error('Document upload error:', error.message);
      console.error('Error stack:', error.stack);
      
      // Clean up uploaded file if resource creation fails
      if (req.file) {
        const fs = await import('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAll(req, res) {
    try {
      const { folderId, isFavorite, isArchived } = req.query;
      const filters = {};
      
      if (folderId) filters.folderId = folderId;
      if (isFavorite !== undefined) filters.isFavorite = isFavorite === 'true';
      if (isArchived !== undefined) filters.isArchived = isArchived === 'true';

      const resources = await ResourceService.getAll(
        req.personaContext.userId,
        req.personaContext.persona,
        filters
      );
      
      return successResponse(res, resources, 'Resources retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getById(req, res) {
    try {
      const resource = await ResourceService.getById(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, resource, 'Resource retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async update(req, res) {
    try {
      const resource = await ResourceService.update(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id,
        req.body
      );
      return successResponse(res, resource, 'Resource updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await ResourceService.delete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, null, 'Resource deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async search(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return errorResponse(res, 'Search query is required', 400);
      }

      const resources = await ResourceService.search(
        req.personaContext.userId,
        req.personaContext.persona,
        q
      );
      return successResponse(res, resources, 'Search completed successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getUnorganized(req, res) {
    try {
      const resources = await ResourceService.getUnorganized(
        req.personaContext.userId,
        req.personaContext.persona
      );
      return successResponse(res, resources, 'Unorganized resources retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default ResourceController;
