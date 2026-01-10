import StudentService from '../services/studentService.js';
import { successResponse, errorResponse, createdResponse } from '../../../shared/utils/responseHelpers.js';

class StudentController {
  // Assignment endpoints
  static async createAssignment(req, res) {
    try {
      const assignment = await StudentService.createAssignment(
        req.personaContext.userId,
        req.body
      );
      return createdResponse(res, assignment, 'Assignment created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getAssignments(req, res) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.courseId) filters.courseId = req.query.courseId;

      const assignments = await StudentService.getAssignments(
        req.personaContext.userId,
        filters
      );
      return successResponse(res, assignments, 'Assignments retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateAssignment(req, res) {
    try {
      const assignment = await StudentService.updateAssignment(
        req.personaContext.userId,
        req.params.id,
        req.body
      );
      return successResponse(res, assignment, 'Assignment updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteAssignment(req, res) {
    try {
      await StudentService.deleteAssignment(
        req.personaContext.userId,
        req.params.id
      );
      return successResponse(res, null, 'Assignment deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Course endpoints
  static async createCourse(req, res) {
    try {
      const course = await StudentService.createCourse(
        req.personaContext.userId,
        req.body
      );
      return createdResponse(res, course, 'Course created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getCourses(req, res) {
    try {
      const filters = {};
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

      const courses = await StudentService.getCourses(req.personaContext.userId, filters);
      return successResponse(res, courses, 'Courses retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateCourse(req, res) {
    try {
      const course = await StudentService.updateCourse(req.personaContext.userId, req.params.id, req.body);
      return successResponse(res, course, 'Course updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteCourse(req, res) {
    try {
      await StudentService.deleteCourse(req.personaContext.userId, req.params.id);
      return successResponse(res, null, 'Course deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Study Session endpoints
  static async createStudySession(req, res) {
    try {
      const session = await StudentService.createStudySession(req.personaContext.userId, req.body);
      return createdResponse(res, session, 'Study session created successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async getStudySessions(req, res) {
    try {
      const filters = {};
      if (req.query.courseId) filters.courseId = req.query.courseId;

      const sessions = await StudentService.getStudySessions(req.personaContext.userId, filters);
      return successResponse(res, sessions, 'Study sessions retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async updateStudySession(req, res) {
    try {
      const session = await StudentService.updateStudySession(req.personaContext.userId, req.params.id, req.body);
      return successResponse(res, session, 'Study session updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async deleteStudySession(req, res) {
    try {
      await StudentService.deleteStudySession(req.personaContext.userId, req.params.id);
      return successResponse(res, null, 'Study session deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Dashboard endpoint
  static async getDashboard(req, res) {
    try {
      const dashboard = await StudentService.getDashboard(req.user.userId);
      return successResponse(res, dashboard, 'Dashboard data retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

export default StudentController;
