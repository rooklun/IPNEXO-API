// Role-based authorization middleware
// Usage: authorize('admin') or authorize('admin','user')
module.exports = function authorize(...allowed) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证' });
      }
      const role = req.user.role;
      if (!role || !allowed.includes(role)) {
        return res.status(403).json({ message: '无权限访问' });
      }
      next();
    } catch (e) {
      return res.status(403).json({ message: '无权限访问' });
    }
  };
}
