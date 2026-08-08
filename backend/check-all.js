require('dotenv').config();
const mongoose = require('mongoose');
const StorageService = require('./src/services/storageService');
const User = require('./src/models/User');
const Admin = require('./src/models/Admin');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'mhdfaizalofficial@gmail.com';
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailQuery = { email: { $regex: new RegExp(`^${escaped}$`, 'i') } };
    
    const allUsers = await User.find(emailQuery).lean();
    console.log('All Users with email:', allUsers.map(u => ({ role: u.role, status: u.status, id: u.id, _id: u._id })));
    
    const allAdmins = await Admin.find(emailQuery).lean();
    console.log('All Admins with email:', allAdmins.map(u => ({ role: u.role, status: u.status, id: u.id, _id: u._id })));
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
