const db = require('../config/database');

class OrderModel {
  static async create({ orderNo, userId, userUid, productName, amount, currency = 'CNY', metadata = null }) {
    const [res] = await db.query(
      'INSERT INTO orders (order_no, user_id, user_uid, product_name, amount, currency, status, metadata) VALUES (?, ?, ?, ?, ?, ?, "pending", ?)',
      [orderNo, userId, userUid, productName, amount, currency, metadata ? JSON.stringify(metadata) : null]
    );
    return res.insertId;
  }

  static async findByOrderNo(orderNo) {
    const [rows] = await db.query('SELECT * FROM orders WHERE order_no = ?', [orderNo]);
    return rows[0];
  }

  static async findByUserUid(userUid, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT order_no, product_name, amount, currency, status, created_at FROM orders WHERE user_uid = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [userUid, Number(limit), Number(offset)]
    );
    const [total] = await db.query('SELECT COUNT(*) AS count FROM orders WHERE user_uid = ?', [userUid]);
    return {
      orders: rows,
      total: total[0].count,
      page,
      totalPages: Math.ceil(total[0].count / limit)
    };
  }

  static async findAllAdmin(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT order_no, user_uid, product_name, amount, currency, status, created_at FROM orders ORDER BY id DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );
    const [total] = await db.query('SELECT COUNT(*) AS count FROM orders');
    return {
      orders: rows,
      total: total[0].count,
      page,
      totalPages: Math.ceil(total[0].count / limit)
    };
  }

  static async setProvider(orderNo, provider) {
    const [res] = await db.query(
      'UPDATE orders SET provider = ? WHERE order_no = ? LIMIT 1',
      [provider, orderNo]
    );
    return res.affectedRows > 0;
  }

  static async markPaid(orderNo, provider, transactionId, paidAt, notifyRaw) {
    const [res] = await db.query(
      'UPDATE orders SET status = "paid", provider = ?, transaction_id = ?, paid_at = ?, notify_raw = ? WHERE order_no = ? LIMIT 1',
      [provider, transactionId, paidAt, notifyRaw ? JSON.stringify(notifyRaw) : null, orderNo]
    );
    return res.affectedRows > 0;
  }
}

module.exports = OrderModel;
