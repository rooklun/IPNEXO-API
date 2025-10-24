const express = require('express');
const AuthController = require('../controllers/auth.controller');
const VerificationController = require('../controllers/verification.controller');
const { validateLogin, validateRegister, validateSendSms } = require('../middleware/validator.middleware');

const router = express.Router();

router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);

// 发送短信验证码
router.post('/sms/send', validateSendSms, VerificationController.sendSms);

module.exports = router;