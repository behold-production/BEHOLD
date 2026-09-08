require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./backend/src/models/User');
    const counsellors = await User.find({ role: { $in: ['counsellor', 'psychologist', 'advisor', 'therapist'] } });
    console.log(`Found ${counsellors.length} counsellors.`);
    counsellors.forEach(c => {
      console.log(`- ${c.name} (Role: ${c.role}, Type: ${c.type}, title: ${c.title}, isActive: ${c.isActive}, status: ${c.status}, isDeleted: ${c.isDeleted}, isVerified: ${c.isVerified})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
test();
