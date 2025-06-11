import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  experienceYears: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  salary: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  endDate: {
    type: Date
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  applicantCount: {
    type: Number,
    default: 0,
    min: 0
  },
  state: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', JobSchema);

export default Job;