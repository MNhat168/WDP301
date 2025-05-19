const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  content: { type: String },
  date: { type: Date, default: Date.now },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }]
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
