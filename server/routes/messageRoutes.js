import express from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';
import {
  sendMessage,
  getConversation,
  getUnreadCount,
  markConversationAsRead,
  getAllConversations
} from '../controllers/messageController.js';

const router = express.Router();

// All routes are protected
router.use(verifyAccessToken);

router.post('/', sendMessage);
router.get('/conversations', getAllConversations);
router.get('/conversations/:userId', getConversation);
router.get('/unread', getUnreadCount);
router.patch('/conversations/:userId/read', markConversationAsRead);

export default router; 