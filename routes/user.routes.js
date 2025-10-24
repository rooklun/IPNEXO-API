const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/roles.middleware');

// 用户列表（包含 uid），可按需加权限控制
router.get('/', auth, authorize('admin'), UserController.list);

// 用户详情，uid 为对外标识
router.get('/:uid', UserController.getByUid);

module.exports = router;