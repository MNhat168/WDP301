const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChooseAnsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
  status: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ChooseAns', ChooseAnsSchema);