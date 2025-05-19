const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CVProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skills: { type: String },
  experience: { type: String },
  description: { type: String },
  education: { type: String },
  certifications: { type: String },
  linkUrl: { type: String },
  number: { type: Number },
  avatar: { type: String },
  linkPdf: { type: String },
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });

module.exports = mongoose.model('CVProfile', CVProfileSchema);