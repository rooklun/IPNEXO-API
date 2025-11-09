const PaymentService = require('../services/payment.service');

class PaymentController {
  static async create(req, res, next) {
    try {
      const { orderNo, provider, scene, returnUrl, quitUrl } = req.body || {};
      const result = await PaymentService.createPayment(req.user, { orderNo, provider, scene, returnUrl, quitUrl });
      res.json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  // 支付宝异步回调（表单）
  static async alipayNotify(req, res, next) {
    try {
      const ok = await PaymentService.handleAlipayNotify(req.body);
      // 必须返回 success
      res.send('success');
    } catch (err) {
      // 返回失败也需要 200，以告知已接收
      res.send('failure');
    }
  }

  // 微信支付回调（JSON）
  static async wechatNotify(req, res, next) {
    try {
      await PaymentService.handleWechatNotify(req.body);
      // 按微信要求回包
      res.status(200).json({ code: 'SUCCESS', message: '成功' });
    } catch (err) {
      res.status(200).json({ code: 'FAIL', message: '失败' });
    }
  }
}

module.exports = PaymentController;
