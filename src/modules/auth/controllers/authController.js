import AuthService from '../services/authService.js';
import { successResponse, errorResponse, createdResponse } from '../../shared/utils/responseHelpers.js';

/**
 * AuthController - Handles user authentication and persona management
 */

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, initialPersona } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        return errorResponse(res, 'All fields are required', 400);
      }

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        initialPersona
      });

      return createdResponse(res, result, 'User registered successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }

      const result = await AuthService.login(email, password);

      return successResponse(res, result, 'Login successful');
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getProfile(req, res) {
    try {
      const profile = await AuthService.getUserProfile(req.user.userId);
      return successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  /**
   * Add persona to user
   * POST /api/auth/personas
   */
  static async addPersona(req, res) {
    try {
      const { persona } = req.body;

      if (!persona) {
        return errorResponse(res, 'Persona is required', 400);
      }

      const result = await AuthService.addPersona(req.user.userId, persona);

      return createdResponse(res, result, 'Persona added successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Switch current persona
   * PUT /api/auth/personas/switch
   */
  static async switchPersona(req, res) {
    try {
      const { persona } = req.body;

      if (!persona) {
        return errorResponse(res, 'Persona is required', 400);
      }

      const result = await AuthService.switchPersona(req.user.userId, persona);

      return successResponse(res, result, 'Persona switched successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  /**
   * Remove persona from user
   * DELETE /api/auth/personas/:persona
   */
  static async removePersona(req, res) {
    try {
      const { persona } = req.params;

      const result = await AuthService.removePersona(req.user.userId, persona);

      return successResponse(res, result, 'Persona removed successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default AuthController;
