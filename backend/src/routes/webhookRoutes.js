const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const StorageService = require('../services/storageService');
const PaymentController = require('../controllers/paymentController');

// ─── Health & Ping Check ────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'active',
    message: 'BEHOLD. Webhook Hub is operational',
    endpoints: {
      resend: '/api/webhooks/resend',
      razorpay: '/api/webhooks/razorpay',
      whatsapp: '/api/webhooks/whatsapp',
      wasender: '/api/webhooks/wasender'
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Handshake verification for webhook setups (GET requests from monitoring/registration tools)
router.get('/resend', (req, res) => {
  res.status(200).json({ success: true, service: 'resend', status: 'ready' });
});

router.get('/razorpay', (req, res) => {
  res.status(200).json({ success: true, service: 'razorpay', status: 'ready' });
});

router.get('/payment', (req, res) => {
  res.status(200).json({ success: true, service: 'razorpay-payment', status: 'ready' });
});

router.get('/whatsapp', (req, res) => {
  const challenge = req.query['hub.challenge'] || req.query.challenge || 'ok';
  res.status(200).send(challenge);
});

router.get('/wasender', (req, res) => {
  const challenge = req.query['hub.challenge'] || req.query.challenge || 'ok';
  res.status(200).send(challenge);
});

// ─── 1. Resend Email Webhook ────────────────────────────────────────────────
/**
 * POST /api/webhooks/resend
 * Receives real-time email delivery events from Resend.
 * Verifies Svix signature if configured.
 */
router.post('/resend', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signingSecret = (process.env.RESEND_WEBHOOK_SECRET || '').trim();

    // ── Signature Verification ──────────────────────────────────────────────
    if (signingSecret && !signingSecret.includes('your_signing_secret')) {
      const svixId        = req.headers['svix-id'];
      const svixTimestamp = req.headers['svix-timestamp'];
      const svixSignature = req.headers['svix-signature'];

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('[Resend Webhook] Missing Svix signature headers');
        return res.status(400).json({ success: false, message: 'Missing signature headers' });
      }

      // Build the signed content: "<svix-id>.<svix-timestamp>.<raw-body>"
      const rawBody   = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const toSign    = `${svixId}.${svixTimestamp}.${rawBody}`;
      const secretKey = Buffer.from(signingSecret.replace(/^whsec_/, ''), 'base64');
      const computed  = crypto.createHmac('sha256', secretKey).update(toSign).digest('base64');

      // svix-signature header may contain multiple signatures separated by spaces
      const signatures = svixSignature.split(' ').map(s => s.replace(/^v1,/, ''));
      const isValid    = signatures.some(sig => sig === computed);

      if (!isValid) {
        console.warn('[Resend Webhook] ❌ Invalid signature — request rejected');
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }
    }

    // ── Parse Payload ───────────────────────────────────────────────────────
    const rawStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const payload = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawStr);
    const { type, data } = payload || {};

    const emailId   = data?.email_id || data?.id || 'unknown';
    const toAddress = (data?.to && data.to[0]) || data?.to || 'unknown';
    const subject   = data?.subject || '';

    console.log(`[Resend Webhook] Event: ${type} | To: ${toAddress} | Subject: "${subject}" | ID: ${emailId}`);

    switch (type) {
      case 'email.sent':
        console.log(`[Resend Webhook] ✉️ Email queued for delivery to ${toAddress}`);
        break;

      case 'email.delivered':
        console.log(`[Resend Webhook] ✅ Email delivered to ${toAddress}`);
        break;

      case 'email.bounced': {
        console.warn(`[Resend Webhook] ❌ Email bounced: ${toAddress} — ${data?.bounce?.message || 'unknown reason'}`);
        try {
          const userRecord = await StorageService.findOne('users', { email: toAddress });
          if (userRecord) {
            await StorageService.update('users', userRecord.id, { emailBounced: true });
            console.log(`[Resend Webhook] Flagged user ${userRecord.id} email as bounced`);
          }
          const counsellorRecord = await StorageService.findOne('counsellors', { email: toAddress });
          if (counsellorRecord) {
            await StorageService.update('counsellors', counsellorRecord.id, { emailBounced: true });
            console.log(`[Resend Webhook] Flagged counsellor ${counsellorRecord.id} email as bounced`);
          }
        } catch (dbErr) {
          console.error('[Resend Webhook] DB update error on bounce:', dbErr.message);
        }
        break;
      }

      case 'email.complained':
        console.warn(`[Resend Webhook] 🚩 Spam complaint from: ${toAddress}`);
        break;

      case 'email.opened':
        console.log(`[Resend Webhook] 👁️ Email opened by ${toAddress}`);
        break;

      case 'email.clicked':
        console.log(`[Resend Webhook] 🖱️ Link clicked by ${toAddress}`);
        break;

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${type}`);
    }

    res.status(200).json({ success: true, received: true });
  } catch (err) {
    console.error('[Resend Webhook] Error processing event:', err.message);
    res.status(200).json({ success: true, received: true });
  }
});

// ─── 2. Razorpay Payment Webhook Aliases ────────────────────────────────────
router.post('/razorpay', PaymentController.handleWebhook);
router.post('/payment', PaymentController.handleWebhook);

// ─── 3. WhatsApp / WaSender Webhook Aliases ─────────────────────────────────
const whatsappRoutes = require('./whatsappRoutes');
router.use('/whatsapp', whatsappRoutes);
router.use('/wasender', whatsappRoutes);

module.exports = router;
