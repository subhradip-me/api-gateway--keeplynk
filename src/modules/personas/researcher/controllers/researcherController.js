import { successResponse, errorResponse, createdResponse } from '../../../shared/utils/responseHelpers.js';
import { ResearcherProject as ResearchProject, ResearcherPublication as Publication } from '../models/ResearcherModels.js';

class ResearcherController {
  // Research Project endpoints
  static async createProject(req, res) {
    try {
      const project = await ResearchProject.create({
        userId: req.user.userId,
        persona: 'researcher',
        ...req.body
      });
      return createdResponse(res, project, 'Research project created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getProjects(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'researcher' };
      if (req.query.status) filters.status = req.query.status;
      
      const projects = await ResearchProject.find(filters).sort({ createdAt: -1 });
      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateProject(req, res) {
    try {
      const project = await ResearchProject.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'researcher' },
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
      const project = await ResearchProject.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'researcher'
      });
      
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Publication endpoints
  static async createPublication(req, res) {
    try {
      const publication = await Publication.create({
        userId: req.user.userId,
        persona: 'researcher',
        ...req.body
      });
      return createdResponse(res, publication, 'Publication created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getPublications(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'researcher' };
      const publications = await Publication.find(filters).sort({ year: -1 });
      return successResponse(res, publications, 'Publications retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updatePublication(req, res) {
    try {
      const publication = await Publication.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'researcher' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!publication) {
        return errorResponse(res, 'Publication not found', 404);
      }
      
      return successResponse(res, publication, 'Publication updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deletePublication(req, res) {
    try {
      const publication = await Publication.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'researcher'
      });
      
      if (!publication) {
        return errorResponse(res, 'Publication not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getDashboard(req, res) {
    try {
      return successResponse(res, { message: 'Researcher dashboard' });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ResearcherController;
