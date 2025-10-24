const UserModel = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');

class UserController {
  static async getByUid(req, res, next) {
    try {
      const { uid } = req.params;
      const user = await UserModel.findByUid(uid);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      const { phone, balance } = user;
      return res.json({
        status: 'success',
        data: { uid, phone, balance }
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await UserModel.findAll(page, limit);
      return res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
