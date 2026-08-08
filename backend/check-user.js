require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found.');
    return;
  }
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to DB');
    const db = client.db();
    const email = 'mhdfaizalofficial@gmail.com';
    
    const user = await db.collection('users').findOne({ email: new RegExp('^' + email + '$', 'i') });
    console.log('User Collection:', user ? { role: user.role, status: user.status } : 'Not found');
    
    const admin = await db.collection('admins').findOne({ email: new RegExp('^' + email + '$', 'i') });
    console.log('Admin Collection:', admin ? { role: admin.role, status: admin.status } : 'Not found');
    
    const counsellor = await db.collection('counsellors').findOne({ email: new RegExp('^' + email + '$', 'i') });
    console.log('Counsellor Collection:', counsellor ? { role: counsellor.role, status: counsellor.status } : 'Not found');
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
