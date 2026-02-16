const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');

// 会话相关
router.get('/conversations', auth, messageController.getConversations);

// 消息相关
router.get('/messages', auth, messageController.getMessages);
router.post('/messages', auth, messageController.sendMessage);
router.post('/messages/read', auth, messageController.markAsRead);
router.post('/messages/revoke', auth, messageController.revokeMessage);

// 文件相关
router.post('/files/upload', auth, fileController.upload.single('file'), fileController.uploadFile);
router.get('/files/:fileId', auth, fileController.getFileInfo);

module.exports = router;