import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  persona: {
    type: String,
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ['url', 'document'],
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  // 🔗 URL-specific
  url: {
    type: String,
    trim: true
  },

  favicon: String,
  thumbnail: String,

  // 📄 Document-specific
  file: {
    path: String,       // local file path or cloud URL
    key: String,        // storage key (s3 / cloudinary / local)
    name: String,       // original filename
    mimeType: String,
    size: Number
  },

  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: false,
    default: null,
    index: true
  },

  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    index: true
  }],

  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },

  isArchived: {
    type: Boolean,
    default: false
  },

  isTrashed: {
    type: Boolean,
    default: false
  },

  metadata: {
    siteName: String,
    author: String,
    publishedDate: Date,
    readTime: Number
  }

}, {
  timestamps: true
});

resourceSchema.index({ userId: 1, persona: 1, folderId: 1 });
resourceSchema.index({ userId: 1, persona: 1, type: 1 });
resourceSchema.index({ userId: 1, persona: 1, isFavorite: 1 });

export default mongoose.model('Resource', resourceSchema);