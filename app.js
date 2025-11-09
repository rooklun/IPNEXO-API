const express = require("express");
const cors = require("cors");

const { errorHandler } = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const contactRoutes = require("./routes/contact.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // for Alipay notify

// test
// 测试连接
app.get("/api/ping", async (req, res) => {
  res.send({ message: "pong" });
});

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/pay", paymentRoutes);

// 错误处理中间件
app.use(errorHandler);

module.exports = app;
