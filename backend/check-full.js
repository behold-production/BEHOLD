require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'mhdfaizalofficial@gmail.com';
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailQuery = { email: { $regex: new RegExp(`^${escaped}$`, 'i') } };
    
    const user = await User.findOne(emailQuery).lean();
    console.log('User full:', user);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
