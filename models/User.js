const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    profilePhoto: { type: String, default: 'images/default-profile.png' }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);