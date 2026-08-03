const mongoose = require('mongoose');
require('dotenv').config();
const StorageService = require('./src/services/StorageService');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const blogs = await StorageService.findAll('blogs');
  if (blogs.length > 0) {
    const blogToUpdate = blogs[0];
    console.log('Found:', blogToUpdate.title);
    const id = blogToUpdate.id || blogToUpdate._id.toString();
    try {
      const updated = await StorageService.update('blogs', id, { title: blogToUpdate.title + ' (Updated)' });
      console.log('Update successful!', updated.title);
      await StorageService.update('blogs', id, { title: blogToUpdate.title });
      console.log('Reverted title.');
    } catch (e) {
      console.error('Update fail:', e);
    }
  } else {
    console.log('No blogs');
  }
  process.exit(0);
}
test();
