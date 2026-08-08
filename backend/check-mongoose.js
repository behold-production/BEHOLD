require('dotenv').config();
const mongoose = require('mongoose');
const StorageService = require('./src/services/storageService');
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB via Mongoose');
    
    const email = 'mhdfaizalofficial@gmail.com';
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailQuery = { email: { $regex: new RegExp(`^${escaped}$`, 'i') } };
    const userQuery = { ...emailQuery, status: { $ne: 'DELETED' } };
    
    console.log('Query:', userQuery);
    const user = await StorageService.findOne('users', userQuery);
    console.log('StorageService.findOne(users):', user ? { role: user.role, status: user.status } : 'null');
    
    const admin = await StorageService.findOne('admins', emailQuery);
    console.log('StorageService.findOne(admins):', admin ? { role: admin.role, status: admin.status } : 'null');
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
