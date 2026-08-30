const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

// 1. Signup
exports.signup = async (req, res) => {
  // ...
};

// 2. Resend Code
exports.resendCode = async (req, res) => {
  // ...
};

// 3. Verify
exports.verify = async (req, res) => {
  // ...
};

// 4. Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: "هذا الحساب لم يتم تفعيله بعد، يرجى تفعيل الحساب أولاً" });
    }

    // تسجيل تفاصيل عملية الدخول دي (تظهر بعدين في لوحة الأدمن)
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({ date: user.lastLoginAt, ip, userAgent });
    user.loginHistory = user.loginHistory.slice(0, 10); // نحتفظ بآخر 10 عمليات دخول بس
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
};