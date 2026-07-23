const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

// Customer
router.get('/my-chat', verifyToken, checkRole('customer'), chatController.getMyChat);
router.post('/my-chat', verifyToken, checkRole('customer'), chatController.sendMyMessage);

// Admin/Staff
router.get('/conversations', verifyToken, checkRole('admin', 'staff'), chatController.getConversations);
router.get('/conversations/:customerId', verifyToken, checkRole('admin', 'staff'), chatController.getConversationMessages);
router.post('/conversations/:customerId', verifyToken, checkRole('admin', 'staff'), chatController.sendStaffMessage);

// Dùng chung cho mọi role đã đăng nhập
router.get('/unread-count', verifyToken, chatController.getUnreadCount);

module.exports = router;