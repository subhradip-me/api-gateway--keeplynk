import mongoose from 'mongoose';
import config from '../../shared/config/environment.js';

const personaProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  persona: {
    type: String,
    enum: config.VALID_PERSONAS,
    required: true
  },
  
  // Common profile fields
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String
  },
  displayName: {
    type: String,
    trim: true
  },
  
  // Persona-specific data stored as flexible objects
  studentData: {
    university: String,
    major: String,
    graduationYear: Number,
    gpa: Number,
    academicGoals: [String]
  },
  
  creatorData: {
    niche: String,
    platforms: [String],
    audience: Number,
    contentTypes: [String],
    monetizationMethods: [String]
  },
  
  professionalData: {
    company: String,
    position: String,
    industry: String,
    yearsExperience: Number,
    skills: [String],
    certifications: [String]
  },
  
  entrepreneurData: {
    ventures: [String],
    industries: [String],
    fundingStage: String,
    teamSize: Number,
    businessGoals: [String]
  },
  
  researcherData: {
    institution: String,
    department: String,
    researchAreas: [String],
    publications: Number,
    hIndex: Number,
    orcidId: String
  },
  
  // Persona-specific preferences
  preferences: {
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'contacts'],
        default: 'private'
      },
      showEmail: {
        type: Boolean,
        default: false
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'daily'
      }
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
personaProfileSchema.index({ userId: 1, persona: 1 }, { unique: true });

const PersonaProfile = mongoose.model('PersonaProfile', personaProfileSchema);

export default PersonaProfile;
