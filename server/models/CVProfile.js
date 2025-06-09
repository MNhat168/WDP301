import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CVProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  education: {
    type: String,
    trim: true
  },
  certifications: {
    type: String,
    trim: true
  },
  linkUrl: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  linkPdf: {
    type: String,
    trim: true
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    trim: true
  },
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isCurrent: {
      type: Boolean,
      default: false
    }
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    gpa: Number
  }],
  skills: [{
    skillName: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    yearsOfExperience: Number
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    url: String,
    startDate: Date,
    endDate: Date
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    url: String
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'employers_only'],
    default: 'employers_only'
  }
}, {
  timestamps: true
});

CVProfileSchema.index({ userId: 1 });
CVProfileSchema.index({ isComplete: 1 });
CVProfileSchema.index({ lastUpdated: -1 });
CVProfileSchema.index({ 'skills.skillName': 'text' });
CVProfileSchema.index({ 'workExperience.company': 'text' });
CVProfileSchema.index({ visibility: 1 });

CVProfileSchema.virtual('completionPercentage').get(function() {
  const requiredFields = ['summary', 'workExperience', 'education', 'skills'];
  let completed = 0;
  
  if (this.summary && this.summary.trim().length > 0) completed++;
  if (this.workExperience && this.workExperience.length > 0) completed++;
  if (this.education && this.education.length > 0) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  
  return Math.round((completed / requiredFields.length) * 100);
});

CVProfileSchema.methods.checkCompleteness = function() {
  const requiredFields = ['summary', 'workExperience', 'education', 'skills'];
  const isComplete = requiredFields.every(field => {
    if (Array.isArray(this[field])) {
      return this[field].length > 0;
    }
    return this[field] && this[field].toString().trim().length > 0;
  });
  
  this.isComplete = isComplete;
  this.lastUpdated = new Date();
  return isComplete;
};

CVProfileSchema.pre('save', function(next) {
  this.checkCompleteness();
  next();
});

const CVProfile = mongoose.model('CVProfile', CVProfileSchema);

export default CVProfile;