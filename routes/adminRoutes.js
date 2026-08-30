const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

// ملاحظة: تسجيل دخول الأدمن بيتم عن طريق نفس /api/login العادي
// (نفس الإيميل والباسورد بتاعته)، والفرق إن الـ token اللي بيرجع
// بيبقى فيه role: 'admin'، وهو ده اللي بيفتح الراوتس دي تحت.
// كل الراوتس هنا لازم توكن صحيح + role admin، مش مجرد معرفة الرابط.

router.get('/stats', protect, adminOnly, adminController.getStats);
router.get('/users', protect, adminOnly, adminController.getUsers);
router.get('/users/:id', protect, adminOnly, adminController.getUserDetail);
router.get('/scores', protect, adminOnly, adminController.getAllScores);

module.exports = router;
