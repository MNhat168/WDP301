const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  cv: { type: Schema.Types.ObjectId, ref: 'CVProfile' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  applicationDate: { type: Date, default: Date.now },
  status: { type: String },
  companyName: { type: String },
  jobTitle: { type: String }
}, { timestamps: true });

// Compound index to ensure unique job and CV combination
ApplicationSchema.index({ job: 1, cv: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);