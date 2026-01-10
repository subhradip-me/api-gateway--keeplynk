import mongoose from 'mongoose';

const studentAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  persona: {
    type: String,
    default: 'student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentCourse'
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'submitted', 'graded'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  grade: {
    score: Number,
    maxScore: Number,
    percentage: Number,
    letterGrade: String,
    feedback: String
  },
  submittedAt: {
    type: Date
  },
  gradedAt: {
    type: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  linkedBookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark'
  }],
  notes: {
    type: String
  },
  estimatedHours: {
    type: Number
  },
  actualHours: {
    type: Number
  }
}, {
  timestamps: true
});

const studentCourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  persona: {
    type: String,
    default: 'student',
    required: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  courseCode: {
    type: String,
    trim: true
  },
  instructor: {
    name: String,
    email: String,
    officeHours: String
  },
  semester: {
    type: String
  },
  year: {
    type: Number
  },
  credits: {
    type: Number
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    location: String
  }],
  syllabus: {
    url: String,
    description: String
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  grade: {
    current: Number,
    target: Number,
    letterGrade: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const studentStudySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  persona: {
    type: String,
    default: 'student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentCourse'
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true
  },
  description: {
    type: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  topics: [{
    type: String
  }],
  productivity: {
    type: Number, // 1-5 rating
    min: 1,
    max: 5
  },
  notes: {
    type: String
  },
  linkedBookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark'
  }],
  linkedAssignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentAssignment'
  }]
}, {
  timestamps: true
});

// Compound indexes
studentAssignmentSchema.index({ userId: 1, persona: 1 });
studentAssignmentSchema.index({ userId: 1, persona: 1, dueDate: 1 });
studentAssignmentSchema.index({ userId: 1, persona: 1, status: 1 });

studentCourseSchema.index({ userId: 1, persona: 1 });
studentCourseSchema.index({ userId: 1, persona: 1, isActive: 1 });

studentStudySessionSchema.index({ userId: 1, persona: 1 });
studentStudySessionSchema.index({ userId: 1, persona: 1, startTime: -1 });

const StudentAssignment = mongoose.model('StudentAssignment', studentAssignmentSchema);
const StudentCourse = mongoose.model('StudentCourse', studentCourseSchema);
const StudentStudySession = mongoose.model('StudentStudySession', studentStudySessionSchema);

export { StudentAssignment, StudentCourse, StudentStudySession };
