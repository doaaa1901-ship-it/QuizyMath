require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); // تستخدم لتشفير كلمات المرور وحمايتها في قاعدة البيانات
const nodemailer = require('nodemailer');

const app = express();

// الـ Middlewares الأساسية
app.use(express.json());
app.use(cors());

// تشغيل عرض ملفات الـ Frontend من فولدر public أوتوماتيكياً
app.use(express.static(path.join(__dirname, 'public')));

// 1. الاتصال بقاعدة بيانات MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ Database Connection Error:', err));

// 2. إعداد مرسل الإيميلات (Nodemailer Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. تعريف الـ Schemas والـ Models للـ Database

// موديل المستخدمين (جديد)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String }
});
const User = mongoose.model('User', UserSchema);

// موديل الأسئلة
const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});
const Question = mongoose.model('Question', QuestionSchema);

// موديل السكور
const ScoreSchema = new mongoose.Schema({
    scoreText: String,
    difficulty: String,
    createdAt: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);


// 4. الـ API Endpoints الخاصة بالـ Authentication (تسجيل الدخول والتحقق)

// [SIGNUP] - إنشاء حساب وإرسال الكود
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "جميع الحقول مطلوبة" });
        }

        // التحقق مما إذا كان الإيميل مسجلاً ومفعلاً مسبقاً
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: "هذا البريد الإلكتروني مسجل بالفعل" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // كود من 6 أرقام

        if (existingUser && !existingUser.isVerified) {
            // إذا كان الإيميل موجوداً ولكنه غير مفعل، نقوم بتحديث البيانات فقط
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.verificationCode = verificationCode;
            await existingUser.save();
        } else {
            // إنشاء مستخدم جديد تماماً بوضعية غير مفعل
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                verificationCode
            });
            await newUser.save();
        }

        // إرسال كود التحقق للإيميل
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'MathApp Verification Code 🔢',
            text: `مرحباً ${name}،\n\nكود التحقق الخاص بك لتفعيل حساب MathApp هو: ${verificationCode}\n\nبالتوفيق!`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "تم إرسال كود التحقق بنجاح" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء التسجيل أو إرسال الإيميل" });
    }
});

// [VERIFY] - التأكد من صحة كود التحقق وتفعيل الحساب
app.post('/api/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "لم يتم العثور على طلب تسجيل لهذا الإيميل" });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: "كود التحقق غير صحيح!" });
        }

        // تفعيل الحساب وحذف كود التحقق لتوفير مساحة وحماية الحساب
        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        res.status(200).json({ message: "تم تفعيل الحساب بنجاح، يمكنك تسجيل الدخول الآن" });

    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء عملية التحقق" });
    }
});

// [LOGIN] - تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: "هذا الحساب لم يتم تفعيله بعد، يرجى إعادة التسجيل لتلقي كود التفعيل" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        // إرسال بيانات المستخدم المتوافقة تماماً مع الفرونت إند الخاص بك
        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            user: { name: user.name, email: user.email }
        });

    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
});


// 5. الـ API Endpoints الخاصة بالأسئلة والسكورات

// جلب الأسئلة
app.get('/api/questions', async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const questions = await Question.find({ category, difficulty });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

// حفظ السكور
app.post('/api/scores', async (req, res) => {
    try {
        const { scoreText, difficulty } = req.body;
        const newScore = new Score({ scoreText, difficulty });
        await newScore.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'فشل حفظ النتيجة' });
    }
});

// جلب الـ Scoreboard
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ' });
    }
});


// 6. تشغيل السيرفر والإعداد لـ Vercel

// تشغيل السيرفر محلياً فقط عند التطوير
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر شغال تمام والموقع متاح على: http://localhost:${PORT}`);
    });
}

// تصدير الـ app لـ Vercel
module.exports = app;