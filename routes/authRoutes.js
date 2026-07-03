const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// مسارات التحقق والتسجيل (Endpoints)
router.post('/signup', authController.signup);
router.post('/resend-code', authController.resendCode);
router.post('/verify', authController.verify);
router.post('/login', authController.login);

module.exports = router;