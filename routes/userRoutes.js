const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// مسار جلب بيانات البروفايل ومسار التحديث
router.get('/profile', userController.getProfile);
router.put('/update', userController.updateProfile);

module.exports = router;