const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    email: String, 
    scoreText: String,
    difficulty: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);