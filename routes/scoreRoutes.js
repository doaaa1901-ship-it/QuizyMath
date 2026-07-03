const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.post('/', scoreController.saveScore);
router.get('/leaderboard', scoreController.getLeaderboard);
router.get('/user', scoreController.getUserScores);

module.exports = router;