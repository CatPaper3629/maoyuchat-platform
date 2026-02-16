const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 注册
router.post('/auth/register', userController.register);

// 登录
router.post('/auth/login', userController.login);

// 获取当前用户信息（需要认证）
router.get('/user/current', auth, userController.getCurrentUser);

// 更新用户信息（需要认证）
router.put('/user/profile', auth, userController.updateUser);

// 搜索用户（需要认证）
router.get('/user/search', auth, userController.searchUsers);

module.exports = router;