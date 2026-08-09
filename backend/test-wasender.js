require('dotenv').config();
const WhatsAppService = require('./src/services/whatsappService');

async function testWaSender() {
  console.log('--- Testing WASenderAPI Integration ---');
  
  const status = await WhatsAppService.getAccountStatus();
  console.log('Account Status:', JSON.stringify(status.providerConfig, null, 2));

  if (!process.env.WASENDER_TOKEN) {
    console.error('\n❌ ERROR: WASENDER_TOKEN is not set in your .env file!');
    console.error('Please add WASENDER_TOKEN=your_token_here to .env and try again.');
    return;
  }

  // Use a phone number from the context, or prompt user to change it
  const testPhone = '919497174011'; 
  console.log(`\nAttempting to send a test message to ${testPhone}...`);
  console.log('(If this is not your number, please change it in test-wasender.js)');

  const result = await WhatsAppService.sendNotification(
    testPhone,
    'Hello! This is a test message from Behold Aspire to verify WASenderAPI integration.'
  );

  console.log('\n--- Result ---');
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.provider === 'WASender API') {
    console.log('\n✅ SUCCESS: Message was sent via WASenderAPI!');
  } else if (result.success && result.mock) {
    console.log('\n⚠️ WARNING: Message was sent in MOCK mode. Check your .env config.');
  } else {
    console.log('\n❌ FAILED: Message could not be sent.');
  }
}

testWaSender();
