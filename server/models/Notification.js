const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  time: { type: Date, default: Date.now },
  readStatus: { type: Number, default: 0 },
  type: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);