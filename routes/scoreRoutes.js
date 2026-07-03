const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

// مسار حفظ النتيجة (POST)
router.post('/', scoreController.saveScore);

// مسار لوحة الصدارة (GET)
router.get('/leaderboard', scoreController.getLeaderboard);

// مسار السجل الشخصي للطالب (GET)
router.get('/user', scoreController.getUserScores);

module.exports = router;