const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });

        const user = await User.findOne({ email }).select('-password');
        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات الملف الشخصي" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, name, profilePhoto } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

        if (name) user.name = name;
        if (profilePhoto) user.profilePhoto = profilePhoto;

        await user.save();
        res.status(200).json({ message: "تم تحديث الإعدادات بنجاح", user: { name: user.name, profilePhoto: user.profilePhoto } });
    } catch (err) {
        res.status(500).json({ error: "فشل في تحديث البيانات" });
    }
};