const db = require('../config/database');
const { generateNumericUid } = require('../utils/uid');

class UserModel {
  static async findByPhone(phone) {
    const [rows] = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows[0];
  }

  static async create(userData) {
    // 生成纯数字 UID，若唯一冲突则最多重试 3 次
    let uid = generateNumericUid();
    let lastErr;
    for (let i = 0; i < 3; i++) {
      try {
        const [result] = await db.query(
          // username/email 不再使用，这里置为 NULL；role 默认由表定义为 'user'
          'INSERT INTO users (uid, phone, password) VALUES (?, ?, ?)',
          [uid, userData.phone, userData.password]
        );
        return result.insertId;
      } catch (err) {
        // 若因唯一索引冲突，则重试
        if (err && err.code === 'ER_DUP_ENTRY') {
          uid = generateNumericUid();
          lastErr = err;
          continue;
        }
        throw err;
      }
    }
    throw lastErr || new Error('Failed to create user with unique numeric uid');
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, uid, phone, balance, role FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUid(uid) {
    const [rows] = await db.query(
      'SELECT id, uid, phone, balance, role FROM users WHERE uid = ?',
      [uid]
    );
    return rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      'SELECT uid, phone, balance FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );
    const [total] = await db.query('SELECT COUNT(*) as count FROM users');
    return {
      users: rows,
      total: total[0].count,
      page,
      totalPages: Math.ceil(total[0].count / limit)
    };
  }
}

module.exports = UserModel;