const User = require('../models/User');
const bcrypt = require('bcryptjs');
const transporter = require('../config/mailer');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "جميع الحقول مطلوبة" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 

        if (existingUser && !existingUser.isVerified) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.verificationCode = verificationCode;
            await existingUser.save();
        } else {
            const newUser = new User({ name, email, password: hashedPassword, verificationCode });
            await newUser.save();
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'MathApp Verification Code 🔢',
            text: `مرحباً ${name}،\n\nكود التحقق الخاص بك لتفعيل حساب QuizyMath هو: ${verificationCode}\n\nبالتوفيق!`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "تم إرسال كود التحقق بنجاح" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل أو إرسال الإيميل" });
    }
};

exports.resendCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
        if (user.isVerified) return res.status(400).json({ error: "الحساب مفعّل بالفعل" });

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'MathApp New Verification Code 🔄',
            text: `كود التحقق الجديد الخاص بك هو: ${newCode}`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "تم إعادة إرسال الكود بنجاح" });
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء إعادة إرسال الكود" });
    }
};

exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "لم يتم العثور على طلب تسجيل لهذا الإيميل" });
        if (user.verificationCode !== code) return res.status(400).json({ error: "كود التحقق غير صحيح!" });

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();
        res.status(200).json({ message: "تم تفعيل الحساب بنجاح، يمكنك تسجيل الدخول الآن" });
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء عملية التحقق" });
    }
};

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
        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            user: { name: user.name, email: user.email, profilePhoto: user.profilePhoto }
        });
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
};