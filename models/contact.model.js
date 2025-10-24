const pool = require('../config/database');

class ContactModel {
  static async create(data) {
    const { name, email, phone, subject, message } = data;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone, subject, message]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM contact_messages WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      const [total] = await pool.execute('SELECT COUNT(*) as count FROM contact_messages');
      
      return {
        messages: rows,
        total: total[0].count,
        page,
        totalPages: Math.ceil(total[0].count / limit)
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE contact_messages SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ContactModel;