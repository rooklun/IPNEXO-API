const { body, validationResult } = require('express-validator');

// 统一的验证结果处理
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 登录验证规则
exports.validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符'),
    
  validateResults
];

// 注册验证规则
exports.validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3 }).withMessage('用户名至少3个字符')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('密码必须包含大小写字母和数字'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
    
  validateResults
];

// 订单创建验证
exports.validateCreateOrder = [
  body('serviceId')
    .notEmpty().withMessage('服务ID不能为空')
    .isNumeric().withMessage('服务ID必须是数字'),
    
  body('duration')
    .notEmpty().withMessage('购买时长不能为空')
    .isNumeric().withMessage('购买时长必须是数字')
    .isIn([1, 3, 6, 12]).withMessage('购买时长必须是1/3/6/12个月'),
    
  validateResults
];