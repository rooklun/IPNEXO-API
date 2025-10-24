const { AppError } = require('../middleware/error.middleware');
const { setPhoneCode, canSendSms } = require('../services/verification.service');
const { sendSms } = require('../services/aliyun-sms.service');

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

class VerificationController {
  static async sendSms(req, res, next) {
    try {
      const { phone, purpose = 'register' } = req.body;

      // 简单限频
      const allowed = await canSendSms(phone, purpose);
      if (!allowed) {
        throw new AppError('发送太频繁，请稍后再试', 429);
      }

      const code = makeCode();
      await setPhoneCode(phone, code, 300, purpose); // 5 分钟有效

      if (process.env.NODE_ENV === 'production') {
        await sendSms(phone, code);
      } else {
        console.log(`[DEV] SMS code for ${phone} (${purpose}): ${code}`);
      }

      return res.json({ status: 'success', message: '验证码已发送' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VerificationController;