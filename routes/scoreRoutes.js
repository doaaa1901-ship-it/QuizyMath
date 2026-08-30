const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');
const { protect, optionalAuth } = require('../middlewares/auth');

// optionalAuth: لو المستخدم مسجل دخول بنربط النتيجة بحسابه، لو guest بتتحفظ من غيره
router.post('/', optionalAuth, scoreController.saveScore);
router.get('/leaderboard', scoreController.getLeaderboard);
// محمية: كل مستخدم يشوف نتائجه هو بس (مش نتائج أي إيميل حد يبعته)
router.get('/user', protect, scoreController.getUserScores);

module.exports = router;