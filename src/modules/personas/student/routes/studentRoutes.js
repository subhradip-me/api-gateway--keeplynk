import express from 'express';
const router = express.Router();
import StudentController from '../controllers/studentController.js';
import { authenticate, requirePersona } from '../../../shared/middleware/authMiddleware.js';

// Apply authentication and persona check to all routes
router.use(authenticate);
router.use(requirePersona('student'));

// Dashboard
router.get('/dashboard', StudentController.getDashboard);

// Assignments
router.post('/assignments', StudentController.createAssignment);
router.get('/assignments', StudentController.getAssignments);
router.put('/assignments/:id', StudentController.updateAssignment);
router.delete('/assignments/:id', StudentController.deleteAssignment);

// Courses
router.post('/courses', StudentController.createCourse);
router.get('/courses', StudentController.getCourses);
router.put('/courses/:id', StudentController.updateCourse);
router.delete('/courses/:id', StudentController.deleteCourse);

// Study Sessions
router.post('/study-sessions', StudentController.createStudySession);
router.get('/study-sessions', StudentController.getStudySessions);
router.put('/study-sessions/:id', StudentController.updateStudySession);
router.delete('/study-sessions/:id', StudentController.deleteStudySession);

export default router;
