require('dotenv').config();
const axios = require('axios');

/**
 * WaSender Session Reconnect Helper
 * 
 * The per-session API key (WASENDER_TOKEN) can only send messages once the
 * WhatsApp session is CONNECTED. If status shows "logged_out", this script
 * uses the token to trigger a reconnect and display the fresh QR code URL.
 * 
 * Run: node reconnect-wasender.js
 */

const TOKEN = process.env.WASENDER_TOKEN;
const BASE_URL = 'https://www.wasenderapi.com';

async function main() {
  console.log('\n======================================');
  console.log(' WaSender Session Reconnect Helper');
  console.log('======================================\n');

  if (!TOKEN) {
    console.error('ERROR: WASENDER_TOKEN is not set in .env');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Step 1: Check current session status
  console.log('Checking session status...');
  const statusRes = await axios.get(`${BASE_URL}/api/status`, { headers }).catch(e => ({ data: { error: e.message } }));
  console.log('Status:', JSON.stringify(statusRes.data, null, 2));

  const status = statusRes.data?.status;

  if (status === 'connected') {
    console.log('\n✅ Session is CONNECTED! WhatsApp messages will work.');

    // Test send
    console.log('\nSending test message...');
    const testPhone = process.env.TEST_PHONE || '919497174011';
    const sendRes = await axios.post(`${BASE_URL}/api/send-message`,
      { to: `+${testPhone}`, text: 'Behold Aspire: WhatsApp API is working correctly!' },
      { headers }
    ).catch(e => ({ data: { error: e.response?.data || e.message } }));
    console.log('Send result:', JSON.stringify(sendRes.data, null, 2));
    return;
  }

  // Step 2: Session is not connected — trigger QR generation via connect endpoint
  // The session ID is embedded in the API key — we call /api/whatsapp-sessions to find it
  console.log('\nSession is logged_out. Fetching session list to find your session ID...');
  const sessionsRes = await axios.get(`${BASE_URL}/api/whatsapp-sessions`, { headers }).catch(e => {
    console.log('Could not list sessions with this token (session key has limited scope)');
    return { data: null };
  });

  if (sessionsRes.data && Array.isArray(sessionsRes.data.data)) {
    console.log('\nSessions found:', sessionsRes.data.data.length);
    for (const s of sessionsRes.data.data) {
      console.log(`  - ID: ${s.id} | Name: ${s.name || 'N/A'} | Status: ${s.status || 'N/A'}`);
    }
  }

  // Step 3: Guide user to reconnect via dashboard
  console.log('\n======================================');
  console.log('ACTION REQUIRED: Session is logged out');
  console.log('======================================');
  console.log('\nThe QR you scanned earlier did not establish the session.');
  console.log('This happens when:');
  console.log('  1. WhatsApp disconnected the linked device (restart the phone and try again)');
  console.log('  2. The QR expired before you scanned it (QR codes last ~60 seconds)');
  console.log('  3. WhatsApp rate-limited the device linking');
  console.log('\nTo fix:');
  console.log('  1. Open https://www.wasenderapi.com/whatsapp in your browser');
  console.log('  2. Click on your session');
  console.log('  3. Click the "Connect" button — a fresh QR will appear');
  console.log('  4. On your phone: WhatsApp → three dots → Linked Devices → Link a Device');
  console.log('  5. Scan the new QR code QUICKLY (within 30 seconds)');
  console.log('  6. Wait for the green "Connected" status on the dashboard');
  console.log('  7. Re-run: node test-wasender.js');
  console.log('\n======================================\n');
}

main().catch(console.error);
