const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  categoryName: { type: String },
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
