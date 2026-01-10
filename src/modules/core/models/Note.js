import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    enum: ['markdown', 'html', 'plain'],
    default: 'markdown'
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
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
  isPinned: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes
noteSchema.index({ userId: 1, persona: 1 });
noteSchema.index({ userId: 1, persona: 1, createdAt: -1 });
noteSchema.index({ userId: 1, persona: 1, isPinned: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
