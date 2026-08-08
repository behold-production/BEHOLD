require('dotenv').config();
const emailService = require('./src/services/emailService');

(async () => {
  try {
    const result = await emailService.sendEmail('test@example.com', 'Test Email', '<p>Testing</p>');
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
})();
