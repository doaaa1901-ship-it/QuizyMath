const Score = require('../models/Score');

// إخفاء جزء من الإيميل قبل ما يظهر في لوحة صدارة عامة لأي زائر (m***@gmail.com)
function maskEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) return 'guest';
    const [namePart, domain] = email.split('@');
    const visible = namePart.slice(0, 1);
    return `${visible}${'*'.repeat(Math.max(namePart.length - 1, 1))}@${domain}`;
}

exports.saveScore = async (req, res) => {
    try {
        const { scoreText, difficulty } = req.body;
        // لو فيه مستخدم مسجل دخول (جاي من optionalAuth) بنربط النتيجة بإيميله الحقيقي
        // وليس بأي إيميل ممكن يبعته حد في جسم الطلب
        const email = req.user ? req.user.email : 'guest';
        const newScore = new Score({ scoreText, difficulty, email });
        await newScore.save();
        res.status(201).json({ success: true, message: "تم حفظ النتيجة بنجاح" });
    } catch (err) {
        res.status(500).json({ error: 'فشل حفظ النتيجة' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(10).lean();
        // إخفاء الإيميلات الكاملة عن أي زائر مش مسجل دخول
        const safeScores = scores.map(s => ({ ...s, email: maskEmail(s.email) }));
        res.json(safeScores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب لوحة الصدارة' });
    }
};

exports.getUserScores = async (req, res) => {
    try {
        // req.user جاي من middleware الـ protect: كل واحد يشوف نتائجه بس
        const userScores = await Score.find({ email: req.user.email }).sort({ createdAt: -1 });
        res.json(userScores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب نتائج المستخدم' });
    }
};