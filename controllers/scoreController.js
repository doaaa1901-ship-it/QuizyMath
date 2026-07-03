const Score = require('../models/Score');

// حفظ نتيجة جديدة
exports.saveScore = async (req, res) => {
    try {
        const { scoreText, difficulty, email } = req.body;
        const newScore = new Score({ scoreText, difficulty, email });
        await newScore.save();
        res.status(201).json({ success: true, message: "تم حفظ النتيجة بنجاح" });
    } catch (err) {
        res.status(500).json({ error: 'فشل حفظ النتيجة' });
    }
};

// جلب لوحة الصدارة العامة (أعلى 10)
exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب لوحة الصدارة' });
    }
};

// جلب التاريخ الشخصي لدرجات مستخدم معين (جديد)