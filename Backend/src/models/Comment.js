const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
  commentText: { type: String },
  commentDate: { type: Date, default: Date.now },
  status: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);