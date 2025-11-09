const { AppError } = require('../middleware/error.middleware');
const { generateOrderNo } = require('../utils/uid');
const UserModel = require('../models/user.model');
const OrderModel = require('../models/order.model');

class OrderService {
  static async createOrder(userPayload, { productName, amount, currency = 'CNY', metadata }) {
    const userUid = userPayload?.userUid;
    if (!userUid) throw new AppError('未登录', 401);

    const user = await UserModel.findByUid(userUid);
    if (!user) throw new AppError('用户不存在', 404);

    // 基本校验
    if (!productName || typeof productName !== 'string') {
      throw new AppError('商品名称不合法', 400);
    }
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      throw new AppError('金额不合法', 400);
    }

    // 生成唯一订单号，避免重复
    let orderNo = generateOrderNo();
    for (let i = 0; i < 3; i++) {
      try {
        const orderId = await OrderModel.create({
          orderNo,
          userId: user.id,
          userUid: user.uid,
          productName,
          amount: num,
          currency,
          metadata
        });
        const order = await OrderModel.findByOrderNo(orderNo);
        return order;
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          orderNo = generateOrderNo();
          continue;
        }
        throw err;
      }
    }
    throw new AppError('创建订单失败，请稍后再试', 500);
  }

  static async listMyOrders(userPayload, { page = 1, limit = 10 }) {
    const userUid = userPayload?.userUid;
    if (!userUid) throw new AppError('未登录', 401);
    return OrderModel.findByUserUid(userUid, Number(page), Number(limit));
  }

  static async getOrder(userPayload, orderNo) {
    const order = await OrderModel.findByOrderNo(orderNo);
    if (!order) throw new AppError('订单不存在', 404);

    const isOwner = userPayload?.role === 'admin' || userPayload?.userUid === order.user_uid;
    if (!isOwner) throw new AppError('无权限查看该订单', 403);

    return order;
  }

  static async listAll(userPayload, { page = 1, limit = 10 }) {
    if (userPayload?.role !== 'admin') throw new AppError('无权限', 403);
    return OrderModel.findAllAdmin(Number(page), Number(limit));
  }
}

module.exports = OrderService;
