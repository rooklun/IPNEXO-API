const ContactModel = require('../models/contact.model');
const { AppError } = require('../middleware/error.middleware');

class ContactController {
  // 提交联系表单
  static async submitContact(req, res, next) {
    try {
      const { name, email, phone, subject, message } = req.body;
      
      // 基本验证
      if (!name || !email || !phone || !message) {
        throw new AppError('请填写所有必填字段', 400);
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('请输入有效的邮箱地址', 400);
      }

      // 验证手机号格式（如果提供）
      if (phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
          throw new AppError('请输入有效的手机号码', 400);
        }
      }

      const contactId = await ContactModel.create({
        name,
        email,
        phone,
        subject,
        message
      });

      const contactMessage = await ContactModel.findById(contactId);

      res.status(201).json({
        status: 'success',
        message: '消息已成功提交',
        data: contactMessage
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取联系消息列表（需要管理员权限）
  static async getMessages(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await ContactModel.findAll(page, limit);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新消息状态（需要管理员权限）
  static async updateMessageStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'processing', 'completed'].includes(status)) {
        throw new AppError('无效的状态值', 400);
      }

      const success = await ContactModel.updateStatus(id, status);
      
      if (!success) {
        throw new AppError('消息不存在', 404);
      }

      res.json({
        status: 'success',
        message: '状态更新成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContactController;