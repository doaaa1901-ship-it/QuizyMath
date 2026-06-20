require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// الـ Middlewares الأساسية
app.use(express.json());
app.use(cors());

// تشغيل عرض ملفات الـ Frontend من فولدر public أوتوماتيكياً
app.use(express.static(path.join(__dirname, 'public')));

// 1. الاتصال بقاعدة بيانات MongoDB Atlas باستخدام الـ URI من ملف .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ Database Connection Error:', err));
// 2. تعريف الـ Schema والـ Models مباشرة لتسهيل الشغل
const QuestionSchema = new mongoose.Schema({
    category: String,
    difficulty: String,
    questionText: String,
    options: [String],
    correctAnswer: String,
    hint: String
});
const Question = mongoose.model('Question', QuestionSchema);

const ScoreSchema = new mongoose.Schema({
    scoreText: String,
    difficulty: String,
    createdAt: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);

// 3. الـ API Endpoints بتاعتك
// جلب الأسئلة
app.get('/api/questions', async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const questions = await Question.find({ category, difficulty });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

// حفظ السكور
app.post('/api/scores', async (req, res) => {
    try {
        const { scoreText, difficulty } = req.body;
        const newScore = new Score({ scoreText, difficulty });
        await newScore.save();
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'فشل حفظ النتيجة' });
    }
});

// جلب الـ Scoreboard
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ createdAt: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ' });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال تمام والموقع متاح على: http://localhost:${PORT}`);
});