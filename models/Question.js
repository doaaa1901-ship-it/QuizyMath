const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});

// التحقق أولاً إذا كان الموديل موجوداً في الـ cache الخاص بـ mongoose، وإذا لم يكن، يقم بإنشائه
module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);