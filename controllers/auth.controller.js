const AuthService = require('../services/auth.service');

class AuthController {
  static async login(req, res, next) {
    try {
      const { phone, password } = req.body;
      const result = await AuthService.login(phone, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      // 需要 body: { phone, phoneCode, password }
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;