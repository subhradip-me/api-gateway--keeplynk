import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true
  },
  color: {
    type: String,
    default: '#6B7280'
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes
tagSchema.index({ userId: 1, persona: 1, name: 1 }, { unique: true });
tagSchema.index({ userId: 1, persona: 1, usageCount: -1 });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
