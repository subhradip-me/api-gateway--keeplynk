import mongoose from 'mongoose';

// Creator Project Model
const creatorProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'creator', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  platform: { type: String, enum: ['youtube', 'instagram', 'tiktok', 'twitter', 'linkedin', 'blog', 'podcast', 'other'] },
  status: { type: String, enum: ['idea', 'planning', 'in-progress', 'published', 'archived'], default: 'idea' },
  publishDate: Date,
  url: String,
  analytics: {
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number,
    engagementRate: Number
  },
  monetization: {
    revenue: Number,
    sponsorship: Boolean,
    affiliateLinks: [String]
  },
  tags: [String]
}, { timestamps: true });

// Creator Calendar Model
const creatorCalendarSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'creator', required: true },
  title: { type: String, required: true },
  contentType: { type: String, enum: ['video', 'post', 'article', 'podcast', 'stream', 'other'] },
  platform: String,
  scheduledDate: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'published', 'cancelled'], default: 'scheduled' },
  notes: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorProject' }
}, { timestamps: true });

// Creator Partnership Model
const creatorPartnershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'creator', required: true },
  brandName: { type: String, required: true },
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  status: { type: String, enum: ['prospect', 'negotiating', 'active', 'completed', 'rejected'], default: 'prospect' },
  dealValue: Number,
  startDate: Date,
  endDate: Date,
  deliverables: [String],
  notes: String
}, { timestamps: true });

// Indexes
creatorProjectSchema.index({ userId: 1, persona: 1 });
creatorCalendarSchema.index({ userId: 1, persona: 1, scheduledDate: 1 });
creatorPartnershipSchema.index({ userId: 1, persona: 1 });

const CreatorProject = mongoose.model('CreatorProject', creatorProjectSchema);
const CreatorCalendar = mongoose.model('CreatorCalendar', creatorCalendarSchema);
const CreatorPartnership = mongoose.model('CreatorPartnership', creatorPartnershipSchema);

export { CreatorProject, CreatorCalendar, CreatorPartnership };
