import { successResponse, errorResponse, createdResponse } from '../../../shared/utils/responseHelpers.js';
import { ProfessionalProject as Project, ProfessionalContact as Contact } from '../models/ProfessionalModels.js';

class ProfessionalController {
  // Project endpoints
  static async createProject(req, res) {
    try {
      const project = await Project.create({
        userId: req.user.userId,
        persona: 'professional',
        ...req.body
      });
      return createdResponse(res, project, 'Project created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getProjects(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'professional' };
      if (req.query.status) filters.status = req.query.status;
      
      const projects = await Project.find(filters).sort({ createdAt: -1 });
      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateProject(req, res) {
    try {
      const project = await Project.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'professional' },
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
      const project = await Project.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'professional'
      });
      
      if (!project) {
        return errorResponse(res, 'Project not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Contact endpoints
  static async createContact(req, res) {
    try {
      const contact = await Contact.create({
        userId: req.user.userId,
        persona: 'professional',
        ...req.body
      });
      return createdResponse(res, contact, 'Contact created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getContacts(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'professional' };
      const contacts = await Contact.find(filters).sort({ name: 1 });
      return successResponse(res, contacts, 'Contacts retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateContact(req, res) {
    try {
      const contact = await Contact.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'professional' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!contact) {
        return errorResponse(res, 'Contact not found', 404);
      }
      
      return successResponse(res, contact, 'Contact updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteContact(req, res) {
    try {
      const contact = await Contact.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'professional'
      });
      
      if (!contact) {
        return errorResponse(res, 'Contact not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getDashboard(req, res) {
    try {
      return successResponse(res, { message: 'Professional dashboard' });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ProfessionalController;
