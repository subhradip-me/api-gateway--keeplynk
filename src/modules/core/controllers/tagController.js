import TagService from '../services/tagService.js';
import { successResponse, errorResponse, createdResponse } from '../../shared/utils/responseHelpers.js';

class TagController {
  static async create(req, res) {
    try {
      const tag = await TagService.create(
        req.personaContext.userId,
        req.personaContext.persona,
        req.body
      );
      return createdResponse(res, tag, 'Tag created successfully');
    } catch (error) {
      if (error.code === 11000) {
        return errorResponse(res, 'Tag with this name already exists', 400);
      }
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAll(req, res) {
    try {
      const tags = await TagService.getAll(
        req.personaContext.userId,
        req.personaContext.persona
      );
      return successResponse(res, tags, 'Tags retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getById(req, res) {
    try {
      const tag = await TagService.getById(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, tag, 'Tag retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async update(req, res) {
    try {
      const tag = await TagService.update(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id,
        req.body
      );
      return successResponse(res, tag, 'Tag updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await TagService.delete(
        req.personaContext.userId,
        req.personaContext.persona,
        req.params.id
      );
      return successResponse(res, null, 'Tag deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getPopular(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const tags = await TagService.getPopularTags(
        req.personaContext.userId,
        req.personaContext.persona,
        limit
      );
      return successResponse(res, tags, 'Popular tags retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default TagController;
