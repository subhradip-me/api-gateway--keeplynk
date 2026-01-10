import FolderService from '../services/folderService.js';
import { successResponse, errorResponse, createdResponse } from '../../shared/utils/responseHelpers.js';

class FolderController {
  static async create(req, res) {
    try {
      const folder = await FolderService.create(
        req.personaContext.userId,
        req.personaContext.persona,
        req.body
      );
      return createdResponse(res, folder, 'Folder created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAll(req, res) {
    try {
      const result = await FolderService.getAll(
        req.personaContext.userId,
        req.personaContext.persona
      );
      return successResponse(res, result, 'Folders retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getById(req, res) {
    try {
      const folder = await FolderService.getById(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, folder, 'Folder retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async update(req, res) {
    try {
      const folder = await FolderService.update(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id,
        req.body
      );
      return successResponse(res, folder, 'Folder updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await FolderService.delete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

export default FolderController;
