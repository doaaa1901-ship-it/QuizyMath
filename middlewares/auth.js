const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect: يتأكد إن فيه توكن صحيح في الهيدر Authorization: Bearer <token>
 * ويحط بيانات المستخدم في req.user. من غير توكن صحيح، محدش يقدر يشوف بيانات حد تاني.
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' });
  }
};

/**
 * optionalAuth: زي protect بس مش بيرفض الطلب لو مفيش توكن.
 * لو التوكن موجود وصحيح بيحط req.user، غير كده بيكمل عادي (guest).
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (err) {
    // توكن باظ أو منتهي؟ عادي، هنكمل كـ guest بدل ما نرفض الطلب
  }
  next();
};

/**
 * adminOnly: لازم يتحط بعد protect. بيرفض أي حد role بتاعه مش admin.
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' });
  }
  next();
};
