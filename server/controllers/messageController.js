import Message from '../models/Message.js';
import asyncHandler from 'express-async-handler';

// Send message
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content, job, application } = req.body;
  const { _id } = req.user;

  if (!receiver || !content) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Invalid input',
      result: "Missing receiver or content"
    });
  }

  try {
    const message = await Message.create({
      sender: _id,
      receiver,
      content,
      job,
      application
    });

    await message.populate('sender', 'firstName lastName');
    await message.populate('receiver', 'firstName lastName');
    if (job) await message.populate('job', 'title');
    if (application) await message.populate('application');

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Message sent successfully',
      result: message
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Send message failed',
      result: error.message
    });
  }
});

// Get conversation
const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const { _id } = req.user;

  if (!userId) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Invalid input',
      result: "Missing userId"
    });
  }

  try {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find({
        $or: [
          { sender: _id, receiver: userId },
          { sender: userId, receiver: _id }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('job', 'title')
      .populate('application'),
      Message.countDocuments({
        $or: [
          { sender: _id, receiver: userId },
          { sender: userId, receiver: _id }
        ]
      })
    ]);

    const result = {
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get conversation successfully',
      result: result
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get conversation failed',
      result: error.message
    });
  }
});

// Get unread messages count
const getUnreadCount = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const count = await Message.countDocuments({
      receiver: _id,
      read: false
    });

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get unread count successfully',
      result: { count }
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get unread count failed',
      result: error.message
    });
  }
});

// Mark conversation as read
const markConversationAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { _id } = req.user;

  if (!userId) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Invalid input',
      result: "Missing userId"
    });
  }

  try {
    await Message.updateMany(
      {
        sender: userId,
        receiver: _id,
        read: false
      },
      {
        $set: {
          read: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Conversation marked as read',
      result: 'Conversation marked as read'
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Mark conversation as read failed',
      result: error.message
    });
  }
});

// Get all conversations
const getAllConversations = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  try {
    const messages = await Message.find({
      $or: [
        { sender: _id },
        { receiver: _id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'firstName lastName')
    .populate('receiver', 'firstName lastName')
    .populate('job', 'title')
    .populate('application');

    // Group messages by conversation
    const conversations = messages.reduce((acc, message) => {
      const otherUserId = message.sender._id.toString() === _id.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          user: message.sender._id.toString() === _id.toString()
            ? message.receiver
            : message.sender,
          lastMessage: message,
          unreadCount: 0
        };
      }

      if (!message.read && message.receiver._id.toString() === _id.toString()) {
        acc[otherUserId].unreadCount++;
      }

      return acc;
    }, {});

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Get all conversations successfully',
      result: Object.values(conversations)
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: 'Get all conversations failed',
      result: error.message
    });
  }
});

export {
  sendMessage,
  getConversation,
  getUnreadCount,
  markConversationAsRead,
  getAllConversations
}; 