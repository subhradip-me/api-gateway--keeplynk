import { StudentAssignment, StudentCourse, StudentStudySession } from '../models/StudentModels.js';
import PersonaDataService from '../../../shared/services/PersonaDataService.js';

class StudentService {
  // Assignment methods
  static async createAssignment(userId, assignmentData) {
    const assignment = await StudentAssignment.create(
      PersonaDataService.sanitizePersonaDocument(assignmentData, userId, 'student')
    );
    return assignment;
  }

  static async getAssignments(userId, filters = {}) {
    const query = PersonaDataService.buildPersonaQuery(userId, 'student', filters);
    return await StudentAssignment.find(query).sort({ dueDate: 1 });
  }

  static async updateAssignment(userId, assignmentId, updateData) {
    const assignment = await StudentAssignment.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: assignmentId }),
      updateData,
      { new: true, runValidators: true }
    );
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  }

  static async deleteAssignment(userId, assignmentId) {
    const assignment = await StudentAssignment.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: assignmentId })
    );
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  }

  // Course methods
  static async createCourse(userId, courseData) {
    const course = await StudentCourse.create(
      PersonaDataService.sanitizePersonaDocument(courseData, userId, 'student')
    );
    return course;
  }

  static async getCourses(userId, filters = {}) {
    const query = PersonaDataService.buildPersonaQuery(userId, 'student', filters);
    return await StudentCourse.find(query).sort({ courseName: 1 });
  }

  static async updateCourse(userId, courseId, updateData) {
    const course = await StudentCourse.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: courseId }),
      updateData,
      { new: true, runValidators: true }
    );
    if (!course) throw new Error('Course not found');
    return course;
  }

  static async deleteCourse(userId, courseId) {
    const course = await StudentCourse.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: courseId })
    );
    if (!course) throw new Error('Course not found');
    return course;
  }

  // Study Session methods
  static async createStudySession(userId, sessionData) {
    const session = await StudentStudySession.create(
      PersonaDataService.sanitizePersonaDocument(sessionData, userId, 'student')
    );
    return session;
  }

  static async getStudySessions(userId, filters = {}) {
    const query = PersonaDataService.buildPersonaQuery(userId, 'student', filters);
    return await StudentStudySession.find(query).sort({ startTime: -1 });
  }

  static async updateStudySession(userId, sessionId, updateData) {
    const session = await StudentStudySession.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: sessionId }),
      updateData,
      { new: true, runValidators: true }
    );
    if (!session) throw new Error('Study session not found');
    return session;
  }

  static async deleteStudySession(userId, sessionId) {
    const session = await StudentStudySession.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, 'student', { _id: sessionId })
    );
    if (!session) throw new Error('Study session not found');
    return session;
  }

  // Dashboard/Stats methods
  static async getDashboard(userId) {
    const [assignments, courses, studySessions] = await Promise.all([
      StudentAssignment.find({ userId, persona: 'student', status: { $ne: 'graded' } })
        .sort({ dueDate: 1 })
        .limit(10),
      StudentCourse.find({ userId, persona: 'student', isActive: true }),
      StudentStudySession.find({ userId, persona: 'student' })
        .sort({ startTime: -1 })
        .limit(5)
    ]);

    return {
      upcomingAssignments: assignments,
      activeCourses: courses,
      recentStudySessions: studySessions,
      stats: {
        totalAssignments: await StudentAssignment.countDocuments({ userId, persona: 'student' }),
        completedAssignments: await StudentAssignment.countDocuments({ 
          userId, 
          persona: 'student', 
          status: { $in: ['completed', 'submitted', 'graded'] }
        }),
        activeCourses: courses.length,
        totalStudyHours: await this.calculateTotalStudyHours(userId)
      }
    };
  }

  static async calculateTotalStudyHours(userId) {
    const sessions = await StudentStudySession.find({ userId, persona: 'student' });
    return sessions.reduce((total, session) => total + (session.duration || 0), 0) / 60;
  }
}

export default StudentService;
