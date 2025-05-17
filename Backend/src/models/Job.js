const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: 'CompanyProfile' },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  title: { type: String },
  description: { type: String },
  experienceYears: { type: Number },
  location: { type: String },
  salary: { type: Number },
  status: { type: String },
  date: { type: Date, default: Date.now },
  endDate: { type: Date },
  startDate: { type: Date },
  applicantCount: { type: Number, default: 0 },
  state: { type: String },
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  favouritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);