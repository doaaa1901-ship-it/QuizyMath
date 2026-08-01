const User = require('../models/User');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailer');

// 1. تسجيل حساب جديد وإرسال كود التحقق
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // تنقية البريد الإلكتروني (Sanitisation)
        const cleanEmail = email.toLowerCase().trim();
        const cleanName = name.trim();

        // الفحص في قاعدة البيانات
        const existingUser = await User.findOne({ email: cleanEmail });
        
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: "البريد الإلكتروني مُسجل بالفعل ومُفعل" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 

        if (existingUser && !existingUser.isVerified) {
            // تحديث بيانات حساب سابق غير مفعل
            existingUser.name = cleanName;
            existingUser.password = hashedPassword;
            existingUser.verificationCode = verificationCode;
            await existingUser.save();
        } else {
            // إنشاء حساب جديد
            const newUser = new User({ 
                name: cleanName, 
                email: cleanEmail, 
                password: hashedPassword, 
                verificationCode 
            });
            await newUser.save();
        }

        // إرسال كود التفعيل عبر البريد
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cleanEmail,
            subject: 'QuizyMath Verification Code 🔢',
            text: `مرحباً ${cleanName}،\n\nكود التحقق الخاص بك لتفعيل حساب QuizyMath هو: ${verificationCode}\n\nبالتوفيق!`
        };
        
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "تم إرسال كود التحقق بنجاح" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل أو إرسال الإيميل" });
    }
};

// 2. إعادة إرسال كود التحقق
exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
        if (user.isVerified) return res.status(400).json({ error: "الحساب مفعّل بالفعل" });

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cleanEmail,
            subject: 'QuizyMath New Verification Code 🔄',
            text: `كود التحقق الجديد الخاص بك هو: ${newCode}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "تم إعادة إرسال الكود بنجاح" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء إعادة إرسال الكود" });
    }
};

// 3. التحقق من كود التفعيل
exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) return res.status(400).json({ error: "لم يتم العثور على طلب تسجيل لهذا الإيميل" });
        
        // التحقق من المطابقة النصية لكود التفعيل
        if (user.verificationCode !== String(code)) {
            return res.status(400).json({ error: "كود التحقق غير صحيح!" });
        }

        user.isVerified = true;
        user.verificationCode = undefined; // حذف الكود بعد التفعيل
        await user.save();

        res.status(200).json({ message: "تم تفعيل الحساب بنجاح، يمكنك تسجيل الدخول الآن" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء عملية التحقق" });
    }
};

// 4. تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });
        
        // فحص وجود المستخدم وكلمة المرور
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: "هذا الحساب لم يتم تفعيله بعد، يرجى تفعيل الحساب أولاً" });
        }

        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            user: { 
                name: user.name, 
                email: user.email, 
                profilePhoto: user.profilePhoto 
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
};

// 5. تسجيل الدخول مع JWT
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 1. استيراد المكتبة

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // تنقية الإيميل تتم تلقائياً عبر express-validator (normalizeEmail)
        const user = await User.findOne({ email });
        
        // فحص وجود المستخدم وكلمة المرور
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: "هذا الحساب لم يتم تفعيله بعد، يرجى تفعيل الحساب أولاً" });
        }

        // 2. إنشاء توكن JWT
        const token = jwt.sign(
            { id: user._id, email: user.email }, // البيانات المخزنة داخل التوكن (Payload)
            process.env.JWT_SECRET || 'fallback_secret_key', // مفتاح التشفير الأمني
            { expiresIn: '7d' } // مدة صلاحية التوكن (7 أيام)
        );

        // 3. إرجاع التوكن مع استجابة النجاح
        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            token, // 🔑 التوكن لإرساله في الـ Headers للطلبات القادمة
            user: { 
                id: user._id,
                name: user.name, 
                email: user.email, 
                profilePhoto: user.profilePhoto 
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
};