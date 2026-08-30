/**
 * إنشاء/ترقية حساب أدمن مباشرة في قاعدة البيانات.
 *
 * الاستخدام:
 *   node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPassword123"
 *
 * - لو الإيميل ده مسجل قبل كده كـ user عادي: هيترقّى لـ role admin (وهيتفعّل isVerified).
 * - لو مش موجود: هيتعمله حساب جديد role admin من الأول.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function main() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.log('❌ الاستخدام: node scripts/createAdmin.js "Admin Name" admin@example.com "StrongPassword123"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('❌ الباسورد لازم يكون 6 أحرف على الأقل.');
    process.exit(1);
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user) {
    user.role = 'admin';
    user.isVerified = true;
    user.password = hashedPassword; // بنحدث الباسورد كمان عشان تتأكد إنك عارفه
    await user.save();
    console.log(`✅ الحساب الموجود (${user.email}) اتترقّى لـ admin.`);
  } else {
    user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: true,
      role: 'admin'
    });
    console.log(`✅ اتعمل حساب admin جديد: ${user.email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ حصل خطأ:', err);
  process.exit(1);
});
