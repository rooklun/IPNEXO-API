const db = require('../config/database');

class UserModel {
  static async findByUsername(username, email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? or email = ?',
      [username, email]
    );
    return rows[0];
  }

  static async create(userData) {
    const [result] = await db.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [userData.username, userData.password, userData.email]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, username, email, balance FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = UserModel;