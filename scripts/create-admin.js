require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateNumericUid } = require('../utils/uid');

console.log('Creating admin user...', process.env.DB_PASSWORD);

(async () => {
  try {
    const phone = process.env.ADMIN_PHONE || ('199' + Math.floor(10_000_000 + Math.random() * 89_999_999).toString());
    const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // 已存在则退出
    const [exists] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (exists.length > 0) {
      console.log('Admin already exists for given phone. Aborting.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(rawPassword, 10);

    // 生成唯一纯数字 UID（冲突重试）
    let uid = generateNumericUid();
    for (let i = 0; i < 3; i++) {
      try {
        const [result] = await pool.query(
          "INSERT INTO users (uid, phone, password, role) VALUES (?, ?, ?, 'admin')",
          [uid, phone, hashed]
        );

        const [rows] = await pool.query('SELECT uid, phone, role FROM users WHERE id = ?', [result.insertId]);
        console.log('Admin user created:');
        console.log(rows[0]);
        console.log('Login credentials:');
        console.log({ phone, password: rawPassword });
        process.exit(0);
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          uid = generateNumericUid();
          continue;
        }
        throw err;
      }
    }
    console.error('Failed to create admin after retries.');
    process.exit(1);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  } finally {
    pool.end && pool.end();
  }
})();
