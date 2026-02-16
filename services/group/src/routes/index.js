const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

// 创建群组
router.post('/groups', auth, groupController.createGroup);

// 获取群组列表
router.get('/groups', auth, groupController.getGroupList);

// 获取群组详情
router.get('/groups/:groupId', auth, groupController.getGroupDetail);

// 更新群组信息
router.put('/groups/:groupId', auth, groupController.updateGroup);

// 解散群组
router.delete('/groups/:groupId', auth, groupController.dissolveGroup);

// 退出群组
router.post('/groups/:groupId/leave', auth, groupController.leaveGroup);

// 邀请成员
router.post('/groups/members/invite', auth, groupController.inviteMember);

// 移除成员
router.post('/groups/members/remove', auth, groupController.removeMember);

// 设置管理员
router.post('/groups/members/admin', auth, groupController.setAdmin);

// 取消管理员
router.post('/groups/members/admin/remove', auth, groupController.removeAdmin);

module.exports = router;