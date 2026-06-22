require('dotenv').config();
const { connectDB } = require('./src/config/db');
const Counsellor = require('./src/models/Counsellor');

async function run() {
  await connectDB();
  const counsellors = await Counsellor.find({}).lean();
  console.log('Counsellors:');
  console.log(JSON.stringify(counsellors, null, 2));
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
