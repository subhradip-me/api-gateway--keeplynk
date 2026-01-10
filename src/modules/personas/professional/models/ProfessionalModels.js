import mongoose from 'mongoose';

// Professional Project Model
const professionalProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'professional', required: true },
  name: { type: String, required: true, trim: true },
  client: String,
  description: String,
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  startDate: Date,
  endDate: Date,
  budget: Number,
  actualCost: Number,
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  team: [String],
  tags: [String]
}, { timestamps: true });

// Professional Contact Model
const professionalContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'professional', required: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  company: String,
  position: String,
  linkedin: String,
  category: { type: String, enum: ['client', 'colleague', 'mentor', 'vendor', 'other'], default: 'other' },
  notes: String,
  lastContact: Date
}, { timestamps: true });

// Professional Skill Model
const professionalSkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  persona: { type: String, default: 'professional', required: true },
  skillName: { type: String, required: true },
  category: String,
  proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
  yearsExperience: Number,
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  learningResources: [String]
}, { timestamps: true });

// Indexes
professionalProjectSchema.index({ userId: 1, persona: 1 });
professionalContactSchema.index({ userId: 1, persona: 1 });
professionalSkillSchema.index({ userId: 1, persona: 1 });

const ProfessionalProject = mongoose.model('ProfessionalProject', professionalProjectSchema);
const ProfessionalContact = mongoose.model('ProfessionalContact', professionalContactSchema);
const ProfessionalSkill = mongoose.model('ProfessionalSkill', professionalSkillSchema);

export { ProfessionalProject, ProfessionalContact, ProfessionalSkill };
