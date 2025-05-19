const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  isTrue: { type: Number },
  answerText: { type: String },
  answerDate: { type: Date, default: Date.now },
  chosenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Answer', AnswerSchema);