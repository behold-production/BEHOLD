const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const StorageService = require('../services/storageService');

/**
 * POST /api/webhooks/resend
 * Receives real-time email delivery events from Resend.
 * Verifies the Svix signature before processing.
 *
 * Events handled:
 *  - email.sent       → log only
 *  - email.delivered  → log + mark email delivered in DB (future)
 *  - email.bounced    → log + flag user/counsellor email as invalid
 *  - email.complained → log spam complaint
 */
router.post('/resend', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signingSecret = (process.env.RESEND_WEBHOOK_SECRET || '').trim();

    // ── Signature Verification ──────────────────────────────────────────────
    // Resend uses Svix to sign webhooks. Three headers are always present:
    //   svix-id, svix-timestamp, svix-signature
    if (signingSecret && !signingSecret.includes('your_signing_secret')) {
      const svixId        = req.headers['svix-id'];
      const svixTimestamp = req.headers['svix-timestamp'];
      const svixSignature = req.headers['svix-signature'];

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('[Resend Webhook] Missing Svix signature headers');
        return res.status(400).json({ success: false, message: 'Missing signature headers' });
      }

      // Build the signed content: "<svix-id>.<svix-timestamp>.<raw-body>"
      const rawBody   = req.body.toString('utf8');
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
    } else {
      console.warn('[Resend Webhook] ⚠️  RESEND_WEBHOOK_SECRET not configured — skipping signature check');
    }

    // ── Parse Payload ───────────────────────────────────────────────────────
    const payload = JSON.parse(req.body.toString('utf8'));
    const { type, data } = payload;

    const emailId   = data?.email_id   || data?.id || 'unknown';
    const toAddress = (data?.to && data.to[0]) || data?.to || 'unknown';
    const subject   = data?.subject || '';

    console.log(`[Resend Webhook] Event: ${type} | To: ${toAddress} | Subject: "${subject}" | ID: ${emailId}`);

    // ── Handle Events ───────────────────────────────────────────────────────
    switch (type) {

      case 'email.sent':
        // Email accepted by Resend — waiting for ISP delivery
        console.log(`[Resend Webhook] ✉️  Email queued for delivery to ${toAddress}`);
        break;

      case 'email.delivered':
        // ISP confirmed delivery — email is in the inbox
        console.log(`[Resend Webhook] ✅ Email delivered to ${toAddress}`);
        break;

      case 'email.bounced': {
        // Hard bounce — the email address doesn't exist or ISP rejected it
        console.warn(`[Resend Webhook] ❌ Email bounced: ${toAddress} — ${data?.bounce?.message || 'unknown reason'}`);

        // Try to flag the user or counsellor with an invalid email so admin knows
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
        // Recipient marked the email as spam — important to monitor
        console.warn(`[Resend Webhook] 🚩 Spam complaint from: ${toAddress}`);
        break;

      case 'email.opened':
        console.log(`[Resend Webhook] 👁️  Email opened by ${toAddress}`);
        break;

      case 'email.clicked':
        console.log(`[Resend Webhook] 🖱️  Link clicked by ${toAddress}`);
        break;

      default:
        console.log(`[Resend Webhook] Unhandled event type: ${type}`);
    }

    // Always respond 200 quickly so Resend doesn't retry
    res.status(200).json({ success: true, received: true });

  } catch (err) {
    console.error('[Resend Webhook] Error processing event:', err.message);
    // Still return 200 to prevent Resend from retrying on our own parse errors
    res.status(200).json({ success: true, received: true });
  }
});

module.exports = router;
