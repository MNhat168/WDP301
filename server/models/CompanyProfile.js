const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanyProfileSchema = new Schema({
  companyName: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  aboutUs: { type: String },
  address: { type: String },
  status: { type: String },
  url: { type: String },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);