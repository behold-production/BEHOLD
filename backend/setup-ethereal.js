const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Created Ethereal Account:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Comment out Gmail
    envContent = envContent.replace('GMAIL_USER=', '# GMAIL_USER=');
    envContent = envContent.replace('GMAIL_APP_PASSWORD=', '# GMAIL_APP_PASSWORD=');
    
    // Add SMTP settings
    const smtpConfig = `\n# ─── Ethereal Testing SMTP ─────────────────────────────────────────\nSMTP_HOST=smtp.ethereal.email\nSMTP_PORT=587\nSMTP_USER=${testAccount.user}\nSMTP_PASS=${testAccount.pass}\nSMTP_SECURE=false\n`;
    
    fs.writeFileSync(envPath, envContent + smtpConfig);
    console.log('Successfully updated .env with Ethereal SMTP configuration.');
  } catch (err) {
    console.error('Failed to create account:', err);
  }
})();
