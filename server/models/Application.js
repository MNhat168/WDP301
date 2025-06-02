const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  cvId: {
    type: Schema.Types.ObjectId,
    ref: 'CVProfile',
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  companyName: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound unique index for JobID and CVId
ApplicationSchema.index({ jobId: 1, cvId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);