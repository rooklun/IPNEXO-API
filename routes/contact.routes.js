const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/roles.middleware');

// 提交联系表单（公开接口）
router.post('/', ContactController.submitContact);

// 获取消息列表（需要管理员权限）
router.get('/', auth, authorize('admin'), ContactController.getMessages);

// 更新消息状态（需要管理员权限）
router.patch('/:id/status', auth, authorize('admin'), ContactController.updateMessageStatus);

module.exports = router;