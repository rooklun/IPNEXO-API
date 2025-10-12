const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const email = username; // 允许使用邮箱登录
      const result = await AuthService.login(username, email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;