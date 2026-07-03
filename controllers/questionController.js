const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const queryFilter = {};
        if (category) queryFilter.category = category;
        if (difficulty) queryFilter.difficulty = difficulty;

        const questions = await Question.find(queryFilter);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء جلب الأسئلة' });
    }
};