const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 连接数据库
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '你的数据库密码',
  database: 'ipnexo_db'
};

// 测试连接
app.get('/api/ping', async (req, res) => {
  res.send({ message: 'pong' });
});

// 注册用户
app.post('/api/users/register', async (req, res) => {
  const { username, email, password } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]  // ⚠️ 实际项目要加密密码 bcrypt
    );
    res.json({ success: true, userId: rows.insertId });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  } finally {
    conn.end();
  }
});

// 创建订单
app.post('/api/orders/create', async (req, res) => {
  const { user_id, product_name, amount } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.execute(
      'INSERT INTO orders (user_id, product_name, amount) VALUES (?, ?, ?)',
      [user_id, product_name, amount]
    );
    res.json({ success: true, orderId: rows.insertId });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  } finally {
    conn.end();
  }
});

// 获取某个用户的订单
app.get('/api/orders/:userId', async (req, res) => {
  const userId = req.params.userId;
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM orders WHERE user_id = ?',
      [userId]
    );
    res.json(rows);
  } finally {
    conn.end();
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
