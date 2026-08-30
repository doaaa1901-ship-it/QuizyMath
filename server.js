require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// استدعاء الموجهات (Routes)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// الـ Middlewares
app.use(express.json());
app.use(cors());

// تقديم الملفات الثابتة من مجلداتها المنظمة داخل public
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// تقديم ملفات الـ HTML تلقائياً من مجلدها الجديد
app.use(express.static(path.join(__dirname, 'public/html')));

// ربط المسارات بالـ APIs المخصصة لها
app.use('/api', authRoutes);               // مسارات الـ Authentication
app.use('/api/user', userRoutes);          // مسارات المستخدم والبروفايل
app.use('/api/questions', questionRoutes); // مسارات الأسئلة
app.use('/api/scores', scoreRoutes);       // مسارات النتائج ولوحة الصدارة

// ================= لوحة تحكم الأدمن =================
// مقصود إن الرابط مش /admin وملوش أي ملف ثابت بيتقدم تلقائي منه.
// لازم تعرفي الـ secret اللي في ملف .env عشان توصلي للوحة أصلاً،
// وحتى لو حد خمّن الرابط، الـ API بتاعها برضه محمي بتوكن admin حقيقي (middlewares/auth.js).
const ADMIN_SECRET = process.env.ADMIN_URL_SECRET;

if (!ADMIN_SECRET) {
    console.warn('⚠️  ADMIN_URL_SECRET مش موجود في .env — لوحة الأدمن معطّلة لحد ما تضيفيه.');
} else {
    const adminBase = `/panel-${ADMIN_SECRET}`;
    const apiAdminBase = `/api${adminBase}`;

    const serveAdminPage = (filePath) => (req, res) => {
        let html = fs.readFileSync(filePath, 'utf8');
        html = html.replaceAll('__ADMIN_API_BASE__', apiAdminBase);
        html = html.replaceAll('__ADMIN_PANEL_BASE__', adminBase);
        res.type('html').send(html);
    };

    // صفحة تسجيل دخول الأدمن — بتتقدم مباشرة، مش عن طريق express.static،
    // عشان محدش يقدر يوصلها من مسار تاني غير الرابط ده بالظبط
    app.get(adminBase, serveAdminPage(path.join(__dirname, 'public/admin/login.html')));

    // صفحة الداشبورد نفسها
    app.get(`${adminBase}/dashboard`, serveAdminPage(path.join(__dirname, 'public/admin/dashboard.html')));

    // API بتاع الأدمن: نفس الرابط السري + لازم توكن admin حقيقي (مش مجرد معرفة الرابط)
    app.use(apiAdminBase, adminRoutes);

    console.log(`🔐 لوحة الأدمن شغالة على المسار السري: ${adminBase}`);
}

// تشغيل السيرفر والإعداد لـ Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 السيرفر شغال تمام والموقع متاح على: http://localhost:${PORT}`);
    });
}

module.exports = app;