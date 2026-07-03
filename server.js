require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// استدعاء الموجهات (Routes)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// الـ Middlewares
app.use(express.json());
app.use(cors());

// تقديم الملفات الثابتة (CSS, JS, الصور، الصوت) من مجلداتها المنظمة داخل public
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// تقديم ملفات الـ HTML من مجلدها الفرعي داخل public تلقائياً عند طلب الموقع
app.use(express.static(path.join(__dirname, 'public/html')));

// ربط المسارات بالـ APIs المخصصة لها
app.use('/api', authRoutes);               // مسارات الـ Authentication
app.use('/api/user', userRoutes);          // مسارات المستخدم والبروفايل
app.use('/api/questions', questionRoutes); // مسارات الأسئلة
app.use('/api/scores', scoreRoutes);       // مسارات النتائج ولوحة الصدارة

// تشغيل السيرفر والإعداد لـ Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر شغال تمام والموقع متاح على: http://localhost:${PORT}`);
    });
}

module.exports = app;