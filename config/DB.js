const mongoose = require('mongoose');

const connectDB = async () => {
    // التحقق أولاً إذا كان هناك اتصال قائم لمنع التكرار في بيئة Serverless
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas successfully!');
    } catch (err) {
        console.error('❌ Database Connection Error:', err);
        // لا تضع process.exit(1) هنا حتى لا ينار سيرفر Vercel
    }
};

module.exports = connectDB;