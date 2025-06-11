import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sentTime: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;