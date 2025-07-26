import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cvProfileId: { type: Schema.Types.ObjectId, ref: 'CVProfile', required: true }, // Added
  applicationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'interview_scheduled'],
    default: 'pending'
  },
  // Update the interview.status enum values
  interview: {
    scheduledSlot: {
      date: Date,
      time: String
    },
    note: String,
    status: {
      type: String,
      enum: ['pending_selection', 'scheduled', 'completed', 'cancelled'] // Add 'pending_selection'
    }
  },
  // AI Match Score fields
  aiAnalysis: {
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    explanation: {
      type: String,
      default: ''
    },
    skillsMatch: {
      matched: [String],
      missing: [String],
      additional: [String]
    },
    experienceMatch: {
      score: Number,
      explanation: String
    },
    educationMatch: {
      score: Number,
      explanation: String
    },
    overallRecommendation: {
      type: String,
      enum: ['highly_recommended', 'recommended', 'consider', 'not_recommended',null],
      default: null
    },
    analyzedAt: {
      type: Date,
      default: null
    },
    aiModel: {
      type: String,
      default: 'llama-3.1-70b-versatile'
    }
  }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ applicationDate: -1 });
ApplicationSchema.index({ 'aiAnalysis.matchScore': -1 }); // Index for sorting by score

export default mongoose.model('Application', ApplicationSchema);