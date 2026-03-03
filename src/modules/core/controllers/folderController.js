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

  static async moveToTrash(req, res) {
    try {
      const folder = await FolderService.moveToTrash(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, folder, 'Folder moved to trash successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async restoreFromTrash(req, res) {
    try {
      const folder = await FolderService.restoreFromTrash(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, folder, 'Folder restored from trash successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async hardDelete(req, res) {
    try {
      const result = await FolderService.hardDelete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, result, 'Folder permanently deleted');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getTrash(req, res) {
    try {
      const folders = await FolderService.getTrash(
        req.personaContext.userId,
        req.personaContext.persona
      );
      return successResponse(res, folders, 'Trashed folders retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default FolderController;
