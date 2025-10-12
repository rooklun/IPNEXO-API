const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const JWT_SECRET = process.env.JWT_SECRET || 'test';

class AuthService {
  static async login(username, email, password) {
    const user = await UserModel.findByUsername(username, email);
    if (!user) {
      throw new AppError('用户名尚未注册', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('用户名或密码不正确', 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }

  static async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const isexists = await UserModel.findByUsername(userData.username, userData.email);

    if (isexists) {
      throw new AppError('用户已存在', 401);
    }

    const userId = await UserModel.create({
      ...userData,
      password: hashedPassword
    });
    
    const user = await UserModel.findById(userId);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }
}

module.exports = AuthService;