import mongoose from 'mongoose';

// Entrepreneur Startup Model
const entrepreneurStartupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'entrepreneur', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  industry: String,
  stage: { type: String, enum: ['idea', 'mvp', 'early-stage', 'growth', 'mature'], default: 'idea' },
  foundedDate: Date,
  website: String,
  teamSize: Number,
  fundingStage: { type: String, enum: ['bootstrapped', 'pre-seed', 'seed', 'series-a', 'series-b', 'series-c+'], default: 'bootstrapped' },
  totalFunding: Number,
  valuation: Number,
  revenue: { mrr: Number, arr: Number },
  metrics: {
    users: Number,
    growth: Number,
    churnRate: Number
  },
  status: { type: String, enum: ['active', 'paused', 'sold', 'closed'], default: 'active' }
}, { timestamps: true });

// Entrepreneur Investor Model
const entrepreneurInvestorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'entrepreneur', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['angel', 'vc', 'corporate', 'accelerator', 'other'], default: 'angel' },
  firmName: String,
  contactPerson: {
    name: String,
    email: String,
    linkedin: String
  },
  investmentRange: {
    min: Number,
    max: Number
  },
  focusAreas: [String],
  status: { type: String, enum: ['prospect', 'contacted', 'meeting-scheduled', 'negotiating', 'invested', 'passed'], default: 'prospect' },
  pitchDate: Date,
  notes: String
}, { timestamps: true });

// Entrepreneur Business Plan Model
const entrepreneurBusinessPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'entrepreneur', required: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'EntrepreneurStartup' },
  title: { type: String, required: true },
  version: String,
  executiveSummary: String,
  problemStatement: String,
  solution: String,
  marketAnalysis: String,
  competitiveAnalysis: String,
  businessModel: String,
  financialProjections: {
    year1: Number,
    year2: Number,
    year3: Number,
    year5: Number
  },
  lastUpdated: Date,
  sharedWith: [String]
}, { timestamps: true });

// Indexes
entrepreneurStartupSchema.index({ userId: 1, persona: 1 });
entrepreneurInvestorSchema.index({ userId: 1, persona: 1 });
entrepreneurBusinessPlanSchema.index({ userId: 1, persona: 1 });

const EntrepreneurStartup = mongoose.model('EntrepreneurStartup', entrepreneurStartupSchema);
const EntrepreneurInvestor = mongoose.model('EntrepreneurInvestor', entrepreneurInvestorSchema);
const EntrepreneurBusinessPlan = mongoose.model('EntrepreneurBusinessPlan', entrepreneurBusinessPlanSchema);

export { EntrepreneurStartup, EntrepreneurInvestor, EntrepreneurBusinessPlan };
