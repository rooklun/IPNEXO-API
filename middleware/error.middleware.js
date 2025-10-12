// 统一的错误响应格式
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 验证错误处理
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(error => error.message);
  return new AppError(`验证失败: ${errors.join(', ')}`, 400);
};

// 统一错误处理中间件
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // 生产环境返回友好错误信息
  if (err.name === 'ValidationError') {
    err = handleValidationError(err);
  }

  // 处理常见错误类型
  if (err.code === 11000) { // MongoDB重复键错误
    err = new AppError('该记录已存在', 400);
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    data: null
  });
};

module.exports = {
  AppError,
  errorHandler
};
