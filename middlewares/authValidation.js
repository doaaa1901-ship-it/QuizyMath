const { body, validationResult } = require('express-validator');

// 1. البرمجية الوسيطة لقراءة الأخطاء وإيقاف الطلب إذا وُجدت
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'fail',
      message: 'فشل التحقق من البيانات',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

// 2. قواعد التسجيل (Signup)
const signupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('الاسم مطلوب')
    .isLength({ min: 2 }).withMessage('الاسم يجب أن يكون حرفين على الأقل'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('البريد الإلكتروني مطلوب')
    .isEmail().withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(), // تنقية: تحويل للحروف الصغيرة وإزالة المسافات
  
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
];

// 3. قواعد إعادة إرسال الكود (Resend Code)
const resendCodeRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('البريد الإلكتروني مطلوب')
    .isEmail().withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail()
];

// 4. قواعد تفعيل الحساب (Verify)
const verifyRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('البريد الإلكتروني مطلوب')
    .isEmail().withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  
  body('code')
    .trim()
    .notEmpty().withMessage('كود التحقق مطلوب')
    .isNumeric().withMessage('كود التحقق يجب أن يكون أرقاماً فقط')
    .isLength({ min: 6, max: 6 }).withMessage('كود التحقق يتكون من 6 أرقام')
];

// 5. قواعد تسجيل الدخول (Login)
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('البريد الإلكتروني مطلوب')
    .isEmail().withMessage('البريد الإلكتروني غير صحيح')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
];

module.exports = {
  validate,
  signupRules,
  resendCodeRules,
  verifyRules,
  loginRules
};