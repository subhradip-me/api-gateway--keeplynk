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

  static async softDelete(req, res) {
    try {
      await FolderService.softDelete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, null, 'Folder moved to trash');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async restore(req, res) {
    try {
      await FolderService.restore(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, null, 'Folder restored successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async hardDelete(req, res) {
    try {
      await FolderService.hardDelete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, null, 'Folder permanently deleted');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getTrash(req, res) {
    try {
      const trash = await FolderService.getTrash(
        req.personaContext.userId,
        req.personaContext.persona
      );
      return successResponse(res, trash, 'Trash retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default FolderController;
