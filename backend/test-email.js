require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  console.log('Testing Email Service...');
  try {
    const result = await emailService.sendEmail(
      'beholdoffice@gmail.com', // send to yourself
      'Behold Aspire - Test Email',
      '<h1>Test Email</h1><p>This is a test email from the Behold Aspire backend to verify Gmail SMTP configuration.</p>'
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
testEmail();
