const mongoose = require('mongoose');

const connectDB = async () => {
    // ميزة التحقق الآمن لبيئة Serverless: إذا كان الاتصال قائماً فلا تكرره
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas successfully!');
    } catch (err) {
        console.error('❌ Database Connection Error:', err);
    }
};

module.exports = connectDB;