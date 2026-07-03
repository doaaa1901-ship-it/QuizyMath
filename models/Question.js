const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});

// التصدير الآمن لمنع إعادة تعريف الموديل في Vercel
module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);