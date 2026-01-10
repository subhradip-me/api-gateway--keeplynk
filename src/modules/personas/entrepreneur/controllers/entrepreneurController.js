import { successResponse, errorResponse, createdResponse } from '../../../shared/utils/responseHelpers.js';
import { EntrepreneurStartup as Startup, EntrepreneurInvestor as Investor } from '../models/EntrepreneurModels.js';

class EntrepreneurController {
  // Startup endpoints
  static async createStartup(req, res) {
    try {
      const startup = await Startup.create({
        userId: req.user.userId,
        persona: 'entrepreneur',
        ...req.body
      });
      return createdResponse(res, startup, 'Startup created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getStartups(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'entrepreneur' };
      if (req.query.stage) filters.stage = req.query.stage;
      
      const startups = await Startup.find(filters).sort({ createdAt: -1 });
      return successResponse(res, startups, 'Startups retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateStartup(req, res) {
    try {
      const startup = await Startup.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'entrepreneur' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!startup) {
        return errorResponse(res, 'Startup not found', 404);
      }
      
      return successResponse(res, startup, 'Startup updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteStartup(req, res) {
    try {
      const startup = await Startup.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'entrepreneur'
      });
      
      if (!startup) {
        return errorResponse(res, 'Startup not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Investor endpoints
  static async createInvestor(req, res) {
    try {
      const investor = await Investor.create({
        userId: req.user.userId,
        persona: 'entrepreneur',
        ...req.body
      });
      return createdResponse(res, investor, 'Investor created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getInvestors(req, res) {
    try {
      const filters = { userId: req.user.userId, persona: 'entrepreneur' };
      const investors = await Investor.find(filters).sort({ name: 1 });
      return successResponse(res, investors, 'Investors retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateInvestor(req, res) {
    try {
      const investor = await Investor.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId, persona: 'entrepreneur' },
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!investor) {
        return errorResponse(res, 'Investor not found', 404);
      }
      
      return successResponse(res, investor, 'Investor updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteInvestor(req, res) {
    try {
      const investor = await Investor.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
        persona: 'entrepreneur'
      });
      
      if (!investor) {
        return errorResponse(res, 'Investor not found', 404);
      }
      
      return res.status(204).send();
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  static async getDashboard(req, res) {
    try {
      return successResponse(res, { message: 'Entrepreneur dashboard' });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
}

export default EntrepreneurController;
