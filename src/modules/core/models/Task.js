import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  persona: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  linkedBookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bookmark'
  }],
  subtasks: [{
    title: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  reminders: [{
    reminderDate: Date,
    isSent: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Compound indexes
taskSchema.index({ userId: 1, persona: 1 });
taskSchema.index({ userId: 1, persona: 1, status: 1 });
taskSchema.index({ userId: 1, persona: 1, dueDate: 1 });
taskSchema.index({ userId: 1, persona: 1, priority: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
