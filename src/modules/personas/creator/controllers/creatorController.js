import { successResponse, errorResponse, createdResponse } from '../../../shared/utils/responseHelpers.js';
import { CreatorProject, CreatorCalendar as ContentCalendar } from '../models/CreatorModels.js';

class CreatorController {
  // Project endpoints
  static async createProject(req, res) {
    try {
      const project = await CreatorProject.create({
        userId: req.user.userId,
        persona: 'creator',
        ...req.body
      });
      return createdResponse(res, project, 'Project created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getProjects(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'creator' };
      if (req.query.status) filters.status = req.query.status;
      
      const projects = await CreatorProject.find(filters).sort({ createdAt: -1 });
      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateProject(req, res) {
    try {
      const project = await CreatorProject.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'creator' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }
      
      return successResponse(res, project, 'Project updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteProject(req, res) {
    try {
      const project = await CreatorProject.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'creator'
      });
      
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Calendar endpoints
  static async createCalendarEntry(req, res) {
    try {
      const entry = await ContentCalendar.create({
        userId: req.user.userId,
        persona: 'creator',
        ...req.body
      });
      return createdResponse(res, entry, 'Calendar entry created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getCalendar(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'creator' };
      if (req.query.status) filters.status = req.query.status;
      
      const entries = await ContentCalendar.find(filters).sort({ scheduledDate: 1 });
      return successResponse(res, entries, 'Calendar retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateCalendarEntry(req, res) {
    try {
      const entry = await ContentCalendar.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'creator' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!entry) {
        return errorResponse(res, 'Calendar entry not found', 404);
      }
      
      return successResponse(res, entry, 'Calendar entry updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteCalendarEntry(req, res) {
    try {
      const entry = await ContentCalendar.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'creator'
      });
      
      if (!entry) {
        return errorResponse(res, 'Calendar entry not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getDashboard(req, res) {
    try {
      return successResponse(res, { message: 'Creator dashboard' });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default CreatorController;
