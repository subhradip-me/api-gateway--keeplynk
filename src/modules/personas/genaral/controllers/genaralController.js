import GenaralService from '../services/genaralService.js';
import { successResponse, errorResponse } from '../../../shared/utils/responseHelpers.js';

class GenaralController {
  static async getDashboard(req, res) {
    try {
      const dashboard = await GenaralService.getDashboard(req.user.userId);
      return successResponse(res, dashboard, 'Dashboard data retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default GenaralController;
