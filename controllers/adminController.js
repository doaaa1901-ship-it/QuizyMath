const User = require('../models/User');
const Score = require('../models/Score');

// إحصائيات سريعة لأعلى الداشبورد
exports.getStats = async (req, res) => {
    try {
        const [totalUsers, verifiedUsers, adminCount, totalScores] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ role: 'admin' }),
            Score.countDocuments()
        ]);
        res.json({ totalUsers, verifiedUsers, adminCount, totalScores });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
    }
};

// كل المستخدمين + آخر تسجيل دخول ليهم (بدون الباسورد طبعاً)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب المستخدمين' });
    }
};

// تفاصيل مستخدم واحد بالكامل: بياناته + سجل دخوله + كل نتائجه
exports.getUserDetail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

        const scores = await Score.find({ email: user.email }).sort({ createdAt: -1 });
        res.json({ user, scores });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب بيانات المستخدم' });
    }
};

// كل النتائج المسجلة في النظام (بما فيها نتائج الـ guests)
exports.getAllScores = async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(200);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء جلب النتائج' });
    }
};
