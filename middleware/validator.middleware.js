const { body, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 登录验证：phone + password
exports.validateLogin = [
  body('phone')
    .trim()
    .notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符'),
  validateResults
];

// 注册验证：phone + phoneCode + password
exports.validateRegister = [
  body('phone')
    .trim()
    .notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('phoneCode')
    .trim()
    .notEmpty().withMessage('验证码不能为空')
    .isLength({ min: 4, max: 8 }).withMessage('验证码长度不正确')
    .matches(/^\d+$/).withMessage('验证码必须是数字'),
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('密码必须包含大小写字母和数字'),
  validateResults
];

// 发送验证码：phone + optional purpose
exports.validateSendSms = [
  body('phone')
    .trim()
    .notEmpty().withMessage('手机号不能为空')
    .isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
  body('purpose')
    .optional()
    .isIn(['register', 'login', 'reset']).withMessage('purpose 取值无效'),
  validateResults
];