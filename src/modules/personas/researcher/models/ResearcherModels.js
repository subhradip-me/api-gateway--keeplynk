import mongoose from 'mongoose';

// Researcher Project Model
const researcherProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'researcher', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  researchArea: String,
  status: { type: String, enum: ['planning', 'active', 'completed', 'on-hold', 'published'], default: 'planning' },
  startDate: Date,
  endDate: Date,
  funding: {
    source: String,
    amount: Number,
    grantNumber: String
  },
  collaborators: [{
    name: String,
    institution: String,
    role: String,
    email: String
  }],
  milestones: [{
    title: String,
    targetDate: Date,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedDate: Date
  }],
  tags: [String]
}, { timestamps: true });

// Researcher Publication Model
const researcherPublicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'researcher', required: true },
  title: { type: String, required: true },
  authors: [String],
  abstract: String,
  publicationType: { type: String, enum: ['journal', 'conference', 'preprint', 'book-chapter', 'thesis', 'other'] },
  journal: String,
  conference: String,
  year: Number,
  doi: String,
  url: String,
  citationCount: Number,
  status: { type: String, enum: ['draft', 'submitted', 'under-review', 'accepted', 'published'], default: 'draft' },
  submittedDate: Date,
  publishedDate: Date,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearcherProject' }
}, { timestamps: true });

// Researcher Collaboration Model
const researcherCollaborationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'researcher', required: true },
  collaboratorName: { type: String, required: true },
  institution: String,
  department: String,
  email: String,
  researchAreas: [String],
  collaborationType: { type: String, enum: ['co-author', 'co-investigator', 'advisor', 'student', 'peer'], default: 'peer' },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResearcherProject' }],
  publications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResearcherPublication' }],
  lastContact: Date,
  notes: String
}, { timestamps: true });

// Indexes
researcherProjectSchema.index({ userId: 1, persona: 1 });
researcherPublicationSchema.index({ userId: 1, persona: 1 });
researcherCollaborationSchema.index({ userId: 1, persona: 1 });

const ResearcherProject = mongoose.model('ResearcherProject', researcherProjectSchema);
const ResearcherPublication = mongoose.model('ResearcherPublication', researcherPublicationSchema);
const ResearcherCollaboration = mongoose.model('ResearcherCollaboration', researcherCollaborationSchema);

export { ResearcherProject, ResearcherPublication, ResearcherCollaboration };
