const Score = require('../models/Score');

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

exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب لوحة الصدارة' });
    }
};

exports.getUserScores = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });

        const userScores = await Score.find({ email }).sort({ createdAt: -1 });
        res.json(userScores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب نتائج المستخدم' });
    }
};