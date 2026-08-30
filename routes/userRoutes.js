const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// محمية بتوكن الدخول: كل مستخدم يشوف/يعدل بياناته هو بس، مش بياناته باستخدام إيميل حد تاني
router.get('/profile', protect, userController.getProfile);
router.put('/update', protect, userController.updateProfile);

module.exports = router;