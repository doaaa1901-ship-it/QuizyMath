const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  validate,
  signupRules,
  resendCodeRules,
  verifyRules,
  loginRules
} = require('../middlewares/authValidation');

router.post('/signup', signupRules, validate, authController.signup);
router.post('/resend-code', resendCodeRules, validate, authController.resendCode);
router.post('/verify', verifyRules, validate, authController.verify);
router.post('/login', loginRules, validate, authController.login);

module.exports = router;