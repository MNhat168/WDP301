const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
  status: { type: String },
  likeDate: { type: Date, default: Date.now }
}, { timestamps: true });

LikeSchema.index({ user: 1, blog: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);