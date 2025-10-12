const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { validateLogin, validateRegister } = require('../middleware/validator.middleware');

const router = express.Router();

router.post('/login', validateLogin, AuthController.login);
router.post('/register', validateRegister, AuthController.register);

module.exports = router;