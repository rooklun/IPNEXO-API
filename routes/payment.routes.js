const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const PaymentController = require('../controllers/payment.controller');

// 创建支付
router.post('/create', auth, PaymentController.create);

// 支付宝异步通知（无需鉴权）
router.post('/alipay/notify', express.urlencoded({ extended: false }), PaymentController.alipayNotify);

// 微信支付回调（JSON）
router.post('/wechat/notify', express.json(), PaymentController.wechatNotify);

module.exports = router;