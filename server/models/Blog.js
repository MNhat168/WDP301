const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String },
  content: { type: String },
  publishDate: { type: Date, default: Date.now },
  image: { type: String },
  status: { type: String },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);