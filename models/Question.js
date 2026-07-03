const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});

module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);