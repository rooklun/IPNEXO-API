const OrderService = require('../services/order.service');

class OrderController {
  static async create(req, res, next) {
    try {
      const { productName, amount, currency, metadata } = req.body || {};
      const order = await OrderService.createOrder(req.user, { productName, amount, currency, metadata });
      res.status(201).json({ status: 'success', data: order });
    } catch (err) {
      next(err);
    }
  }

  static async listMe(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const data = await OrderService.listMyOrders(req.user, { page, limit });
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  }

  static async getOne(req, res, next) {
    try {
      const { orderNo } = req.params;
      const order = await OrderService.getOrder(req.user, orderNo);
      res.json({ status: 'success', data: order });
    } catch (err) {
      next(err);
    }
  }

  static async listAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const data = await OrderService.listAll(req.user, { page, limit });
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
