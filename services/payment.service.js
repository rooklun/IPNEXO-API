const { AppError } = require('../middleware/error.middleware');
const OrderModel = require('../models/order.model');
const { createWapPay, createPagePay, createQrPrecreate, verifyNotify } = require('./alipay-pay.service');
const { createNative, parseNotify } = require('./wechat-pay.service');

class PaymentService {
  // 创建支付：需要已有订单号
  static async createPayment(userPayload, { orderNo, provider, scene = 'qr', returnUrl, quitUrl }) {
    if (!userPayload?.userUid) throw new AppError('未登录', 401);
    if (!orderNo) throw new AppError('缺少订单号', 400);
    const order = await OrderModel.findByOrderNo(orderNo);
    if (!order) throw new AppError('订单不存在', 404);
    if (order.status !== 'pending') throw new AppError('订单状态不可支付', 400);
    if (order.user_uid !== userPayload.userUid && userPayload.role !== 'admin') {
      throw new AppError('无权限', 403);
    }

    await OrderModel.setProvider(orderNo, provider);

    if (provider === 'alipay') {
      const subject = order.product_name || `订单${order.order_no}`;
      const totalAmount = order.amount;
      if (scene === 'wap') {
        return await createWapPay({ outTradeNo: order.order_no, subject, totalAmount, returnUrl, quitUrl });
      } else if (scene === 'page') {
        return await createPagePay({ outTradeNo: order.order_no, subject, totalAmount, returnUrl });
      } else { // qr
        return await createQrPrecreate({ outTradeNo: order.order_no, subject, totalAmount });
      }
    }

    if (provider === 'wechat') {
      const description = order.product_name || `订单${order.order_no}`;
      return await createNative({ outTradeNo: order.order_no, description, totalAmount: order.amount });
    }

    throw new AppError('不支持的支付渠道', 400);
  }

  static async handleAlipayNotify(formBody) {
    const info = await verifyNotify(formBody);
    const { outTradeNo, tradeNo, tradeStatus } = info;
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      await OrderModel.markPaid(outTradeNo, 'alipay', tradeNo, new Date(), formBody);
      return true;
    }
    return false;
  }

  static async handleWechatNotify(jsonBody) {
    const info = await parseNotify(jsonBody);
    await OrderModel.markPaid(info.outTradeNo, 'wechat', info.transactionId, new Date(info.successTime), info.raw);
    return true;
  }
}

module.exports = PaymentService;
