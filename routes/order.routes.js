const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const authorize = require('../middleware/roles.middleware');
const OrderController = require('../controllers/order.controller');

// 创建订单（用户）
router.post('/', auth, OrderController.create);

// 我的订单列表
router.get('/me', auth, OrderController.listMe);

// 管理员订单列表
router.get('/', auth, authorize('admin'), OrderController.listAll);

// 查询单个订单
router.get('/:orderNo', auth, OrderController.getOne);

module.exports = router;