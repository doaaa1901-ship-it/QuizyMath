require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); 
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

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    profilePhoto: { type: String, default: 'images/default-profile.png' } // تم تحديثها لربطها بصفحة الـ Settings
});
const User = mongoose.model('User', UserSchema);

const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});
const Question = mongoose.model('Question', QuestionSchema);

const ScoreSchema = new mongoose.Schema({
    email: String, // ربط السكور بإيميل المستخدم لمعرفة صاحب النتيجة
    scoreText: String,
    difficulty: String,
    createdAt: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);


// 4. الـ API Endpoints الخاصة بالـ Authentication والـ Profile

// [SIGNUP] - إنشاء حساب وإرسال الكود
app.post('/api/signup', async (req, res) => {
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
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                verificationCode
            });
            await newUser.save();
        }

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

// [RESEND CODE] - (مسار جديد) إعادة إرسال كود التفعيل دون الحاجة لإعادة التسجيل
app.post('/api/resend-code', async (req, res) => {
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
            return res.status(400).json({ error: "هذا الحساب لم يتم تفعيله بعد، يرجى تفعيل الحساب أولاً" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        res.status(200).json({
            message: "تم تسجيل الدخول بنجاح",
            user: { name: user.name, email: user.email, profilePhoto: user.profilePhoto }
        });

    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
    }
});

// [UPDATE PROFILE] - (مسار جديد ومهم لصفحة settings.html) تحديث بيانات الحساب
app.put('/api/user/update', async (req, res) => {
    try {
        const { email, name, profilePhoto } = req.body; // يتم التعرف على المستخدم عبر الإيميل
        const user = await User.findOne({ email });

        if (!user) return res.status(44).json({ error: "المستخدم غير موجود" });

        if (name) user.name = name;
        if (profilePhoto) user.profilePhoto = profilePhoto; // تخزين الصورة كـ Base64 أو رابط

        await user.save();
        res.status(200).json({ message: "تم تحديث الإعدادات بنجاح", user: { name: user.name, profilePhoto: user.profilePhoto } });
    } catch (err) {
        res.status(500).json({ error: "فشل في تحديث البيانات" });
    }
});


// 5. الـ API Endpoints الخاصة بالأسئلة والسكورات

// جلب الأسئلة
app.get('/api/questions', async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const queryFilter = {};
        if (category) queryFilter.category = category;
        if (difficulty) queryFilter.difficulty = difficulty;

        const questions = await Question.find(queryFilter);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء جلب الأسئلة' });
    }
});

// حفظ السكور
app.post('/api/scores', async (req, res) => {
    try {
        const { scoreText, difficulty, email } = req.body;
        const newScore = new Score({ scoreText, difficulty, email });
        await newScore.save();
        res.status(201).json({ success: true, message: "تم حفظ النتيجة بنجاح" });
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
        res.status(500).json({ error: 'حدث خطأ أثناء جلب لوحة الصدارة' });
    }
});


// 6. تشغيل السيرفر والإعداد لـ Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر شغال تمام والموقع متاح على: http://localhost:${PORT}`);
    });
}

module.exports = app;