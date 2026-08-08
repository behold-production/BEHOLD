require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'mhdfaizalofficial@gmail.com';
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailQuery = { email: { $regex: new RegExp(`^${escaped}$`, 'i') } };
    
    const result = await Admin.deleteOne(emailQuery);
    console.log('Deleted admin record:', result);
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
