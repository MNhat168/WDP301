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
  }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ applicationDate: -1 });

export default mongoose.model('Application', ApplicationSchema);