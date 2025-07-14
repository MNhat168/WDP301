import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  readStatus: {
    type: Number,
    enum: [0, 1], 
    default: 0
  },
  type: {
    type: String,
    enum: ['job_application', 'message', 'blog_comment', 'system'],
    required: true
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;