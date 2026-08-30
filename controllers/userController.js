const User = require('../models/User');

// جلب بيانات الملف الشخصي الحالية (بتاعت صاحب التوكن بس، مش أي إيميل حد يبعته)
exports.getProfile = async (req, res) => {
    try {
        // req.user جاي من middleware الـ protect بعد التحقق من التوكن
        res.status(200).json(req.user);
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ أثناء جلب بيانات الملف الشخصي" });
    }
};

// تعديل بيانات الملف الشخصي (بتاعت صاحب التوكن بس)
exports.updateProfile = async (req, res) => {
    try {
        const { name, profilePhoto } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

        if (name) user.name = name;
        if (profilePhoto) user.profilePhoto = profilePhoto;

        await user.save();
        res.status(200).json({ message: "تم تحديث الإعدادات بنجاح", user: { name: user.name, profilePhoto: user.profilePhoto } });
    } catch (err) {
        res.status(500).json({ error: "فشل في تحديث البيانات" });
    }
};