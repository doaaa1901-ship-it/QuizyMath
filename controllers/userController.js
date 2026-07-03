const User = require('../models/User');

// [UPDATE PROFILE]
exports.updateProfile = async (req, res) => {
    try {
        const { email, name, profilePhoto } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "المستخدم غير موجود" }); // تم تعديل كود الحالة هنا ليكون 404 بدلاً من 44

        if (name) user.name = name;
        if (profilePhoto) user.profilePhoto = profilePhoto;

        await user.save();
        res.status(200).json({ message: "تم تحديث الإعدادات بنجاح", user: { name: user.name, profilePhoto: user.profilePhoto } });
    } catch (err) {
        res.status(500).json({ error: "فشل في تحديث البيانات" });
    }
};