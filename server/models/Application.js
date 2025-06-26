import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cvProfileId: { type: Schema.Types.ObjectId, ref: 'CVProfile', required: true }, // Added
  applicationDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  }
}, { timestamps: true });

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ applicationDate: -1 });

export default mongoose.model('Application', ApplicationSchema);