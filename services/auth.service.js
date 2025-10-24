const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const { verifyPhoneCode } = require('./verification.service');
const JWT_SECRET = process.env.JWT_SECRET || 'test';

class AuthService {
  // 登录：phone + password
  static async login(phone, password) {
    const user = await UserModel.findByPhone(phone);
    if (!user) {
      throw new AppError('手机号未注册', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('手机号或密码不正确', 401);
    }

    // 向后兼容：userId + userUid + role
    const token = jwt.sign(
      { userUid: user.uid, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        uid: user.uid,
        phone: user.phone,
        role: user.role
      }
    };
  }

  // 注册：phone + phoneCode + password
  static async register(userData) {
    const { phone, phoneCode, password } = userData;

    // 校验验证码
    // const ok = await verifyPhoneCode(phone, phoneCode);
    // if (!ok) {
    //   throw new AppError('验证码错误或已过期', 400);
    // }

    // 是否已存在
    const existed = await UserModel.findByPhone(phone);
    if (existed) {
      throw new AppError('手机号已注册', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await UserModel.create({
      phone,
      password: hashedPassword
    });

    const user = await UserModel.findById(userId);

    const token = jwt.sign(
      { userId: user.id, userUid: user.uid, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        uid: user.uid,
        phone: user.phone,
        role: user.role
      }
    };
  }
}

module.exports = AuthService;