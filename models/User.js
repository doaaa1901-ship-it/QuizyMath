const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    profilePhoto: { type: String, default: 'images/default-profile.png' },

    // من هنا: صلاحيات الأدمن وتتبع تسجيل الدخول
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLoginAt: { type: Date },
    lastLoginIP: { type: String },
    // آخر 10 عمليات دخول فقط (وقت + IP + user agent) عشان نعرف "user بيدخل إزاي"
    loginHistory: [
        {
            date: { type: Date, default: Date.now },
            ip: String,
            userAgent: String
        }
    ]
}, { timestamps: true }); // createdAt / updatedAt تلقائي

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);