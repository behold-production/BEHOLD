const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const WhatsAppMessage = require('../models/WhatsAppMessage');

// ─────────────────────────────────────────────────────────────────────────────
// ███  WaSender Webhook Handler
// ─────────────────────────────────────────────────────────────────────────────
//
// Setup in WaSender Dashboard:
//   1. Go to: wasenderapi.com/whatsapp → your session → Webhook tab
//   2. Set Payload URL to: https://api.behold.co.in/api/whatsapp/wasender/webhook
//      (or your deployed backend URL)
//   3. Copy the Webhook Secret from the dashboard → paste into .env as
//      WASENDER_WEBHOOK_SECRET=<your_secret>
//   4. Enable subscriptions: messages.received, session.status, qrcode.updated,
//      message.sent, messages.update, message-receipt.update
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify WaSender HMAC-SHA256 signature
 * WaSender sends one of these headers:
 *   X-WaSender-Signature: sha256=<hex>
 *   X-Signature: sha256=<hex>
 * Calculated as: HMAC-SHA256(rawBody, WASENDER_WEBHOOK_SECRET)
 */
function verifyWaSenderSignature(req) {
  const secret = (process.env.WASENDER_WEBHOOK_SECRET || '').trim();
  if (!secret) return true; // Skip verification in dev if secret not set

  // Check all possible header names WaSender may use
  const signature =
    req.headers['x-wasender-signature'] ||
    req.headers['x-signature'] ||
    req.headers['x-hub-signature-256'] ||
    req.headers['x-hub-signature'] ||
    '';

  if (!signature) {
    console.warn('[WaSender Webhook] No signature header found — rejecting request');
    return false;
  }

  // Use rawBody (set by express.json verify) for accurate HMAC computation
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  // Safe comparison — handles length mismatch without throwing
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}


/**
 * POST /api/whatsapp/wasender/webhook
 * WaSender Event Receiver — handles all subscribed event types
 */
router.post('/wasender/webhook', async (req, res) => {
  // Always respond 200 first (WaSender expects fast ACK within 5s)
  res.status(200).json({ received: true });

  try {
    // Signature verification (non-blocking — already responded 200)
    const secret = (process.env.WASENDER_WEBHOOK_SECRET || '').trim();
    if (secret && !verifyWaSenderSignature(req)) {
      console.error('[WaSender Webhook] ❌ Invalid signature — payload rejected');
      return;
    }

    const { event, data, timestamp } = req.body;

    if (!event) {
      console.warn('[WaSender Webhook] Received payload with no event field:', JSON.stringify(req.body).substring(0, 200));
      return;
    }

    console.log(`[WaSender Webhook] Event: "${event}" | Time: ${new Date((timestamp || Date.now() / 1000) * 1000).toISOString()}`);

    // ── Route to appropriate handler ──────────────────────────────────────────
    switch (event) {

      // ── 1. Incoming Private Message ────────────────────────────────────────
      case 'messages.received':
      case 'messages-personal.received': {
        await handleIncomingMessage(data, event);
        break;
      }

      // ── 2. All messages (incoming + outgoing) ──────────────────────────────
      case 'messages.upsert': {
        await handleMessageUpsert(data);
        break;
      }

      // ── 3. Outgoing Message Sent Confirmation ──────────────────────────────
      case 'message.sent': {
        await handleMessageSent(data);
        break;
      }

      // ── 4. Message Delivery/Read Status Update ─────────────────────────────
      case 'messages.update':
      case 'message-receipt.update': {
        await handleMessageStatusUpdate(data);
        break;
      }

      // ── 5. Message Deleted ─────────────────────────────────────────────────
      case 'messages.delete': {
        console.log('[WaSender] Message deleted:', JSON.stringify(data).substring(0, 200));
        break;
      }

      // ── 6. Message Reaction ────────────────────────────────────────────────
      case 'messages.reaction': {
        const from = data?.messages?.key?.cleanedSenderPn || 'unknown';
        const reaction = data?.messages?.message?.reactionMessage?.text || '';
        console.log(`[WaSender] Reaction "${reaction}" from ${from}`);
        break;
      }

      // ── 7. Session Connection Status Change ────────────────────────────────
      case 'session.status': {
        handleSessionStatus(data);
        break;
      }

      // ── 8. QR Code Updated (for re-linking) ───────────────────────────────
      case 'qrcode.updated': {
        const qrState = data?.qrcode?.state || data?.state || 'unknown';
        console.log(`[WaSender] QR Code updated — state: "${qrState}"`);
        if (qrState === 'expired') {
          console.warn('[WaSender] QR code expired. A new QR will be generated automatically.');
        }
        break;
      }

      // ── 9. Passkey Updated ─────────────────────────────────────────────────
      case 'passkey.updated': {
        console.log('[WaSender] Passkey updated:', JSON.stringify(data).substring(0, 200));
        break;
      }

      // ── 10. Group Message Received ─────────────────────────────────────────
      case 'messages-group.received': {
        const groupMsg = data?.messages;
        if (groupMsg) {
          const sender = groupMsg.key?.cleanedParticipantPn || groupMsg.key?.remoteJid || 'group';
          const body = groupMsg.messageBody || '[media/unsupported]';
          console.log(`[WaSender] Group Message from ${sender}: ${String(body).substring(0, 100)}`);
        }
        break;
      }

      // ── 11. Chat Updates ───────────────────────────────────────────────────
      case 'chats.upsert':
      case 'chats.update':
      case 'chats.delete': {
        console.log(`[WaSender] Chat event: "${event}"`);
        break;
      }

      // ── 12. Contact Events ─────────────────────────────────────────────────
      case 'contacts.upsert':
      case 'contacts.update': {
        const contactPn = data?.contact?.pn || 'unknown';
        console.log(`[WaSender] Contact ${event}: ${contactPn}`);
        break;
      }

      // ── 13. Group Events ───────────────────────────────────────────────────
      case 'groups.upsert':
      case 'groups.update':
      case 'group-participants.update': {
        console.log(`[WaSender] Group event: "${event}" | Data:`, JSON.stringify(data).substring(0, 200));
        break;
      }

      // ── 14. Incoming Call ──────────────────────────────────────────────────
      case 'call': {
        const callerPn = data?.call?.from || 'unknown';
        console.log(`[WaSender] Incoming call from ${callerPn}`);
        break;
      }

      // ── 15. Newsletter / Broadcast ─────────────────────────────────────────
      case 'messages-newsletter.received': {
        console.log('[WaSender] Newsletter message received');
        break;
      }

      // ── Catch-all ──────────────────────────────────────────────────────────
      default: {
        console.log(`[WaSender Webhook] Unhandled event: "${event}" | Payload:`, JSON.stringify(req.body).substring(0, 300));
      }
    }
  } catch (err) {
    console.error('[WaSender Webhook Handler Error]:', err.message, err.stack);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ███  Event Handler Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle incoming personal/private WhatsApp message
 */
async function handleIncomingMessage(data, eventType) {
  const msg = data?.messages;
  if (!msg) return;

  const key = msg.key || {};
  const from = key.cleanedSenderPn || key.remoteJid || 'unknown';
  const messageId = key.id || `wasender_${Date.now()}`;
  const body = msg.messageBody || extractMessageBody(msg.message) || '[media/unsupported]';
  const messageType = detectMessageType(msg.message);

  console.log(`[WaSender] Incoming message (${eventType}) from +${from}: ${String(body).substring(0, 100)}`);

  // Persist to database (non-blocking, won't crash if DB fails)
  WhatsAppMessage.create({
    wamid: messageId,
    from: from,
    senderName: msg.pushName || 'WhatsApp User',
    messageType,
    textBody: String(body).substring(0, 4000),
    rawPayload: data,
    direction: 'incoming',
    status: 'received'
  }).catch((err) => {
    // Duplicate wamid is fine — just skip
    if (err.code !== 11000) {
      console.error('[WaSender DB Save Error]:', err.message);
    }
  });
}

/**
 * Handle messages.upsert — fired for both incoming and outgoing messages
 */
async function handleMessageUpsert(data) {
  const msg = data?.messages;
  if (!msg) return;

  const key = msg.key || {};
  const isOutgoing = key.fromMe === true;
  const party = isOutgoing
    ? key.remoteJid
    : (key.cleanedSenderPn || key.remoteJid || 'unknown');
  const body = msg.messageBody || extractMessageBody(msg.message) || '[media/unsupported]';
  const direction = isOutgoing ? 'outgoing' : 'incoming';

  console.log(`[WaSender] Message upsert | Direction: ${direction} | Party: ${party} | Body: ${String(body).substring(0, 80)}`);
}

/**
 * Handle outgoing message sent confirmation
 */
async function handleMessageSent(data) {
  const msg = data?.messages;
  if (!msg) return;

  const key = msg.key || {};
  const to = key.remoteJid || key.cleanedSenderPn || 'unknown';
  const messageId = key.id;
  const body = msg.messageBody || 'sent';

  console.log(`[WaSender] Message sent to ${to} | ID: ${messageId}`);

  // Update DB record if it exists
  if (messageId) {
    WhatsAppMessage.findOneAndUpdate(
      { wamid: messageId },
      { status: 'sent', direction: 'outgoing', textBody: String(body).substring(0, 4000) },
      { upsert: true, new: true }
    ).catch((err) => {
      if (err.code !== 11000) console.error('[WaSender DB Update Error]:', err.message);
    });
  }
}

/**
 * Handle delivery/read receipt status updates
 */
async function handleMessageStatusUpdate(data) {
  // message-receipt.update format
  const update = data?.update || data;
  const key = update?.key || data?.messages?.key;
  const status = update?.receipt?.type || update?.status || data?.status || 'delivered';
  const messageId = key?.id;

  if (messageId) {
    console.log(`[WaSender] Status update: ${messageId} → "${status}"`);
    WhatsAppMessage.findOneAndUpdate(
      { wamid: messageId },
      { status: normalizeStatus(status) }
    ).catch((err) => console.error('[WaSender Status Update Error]:', err.message));
  }
}

/**
 * Handle session connection status changes
 */
function handleSessionStatus(data) {
  const status = data?.status || data?.connection || 'unknown';
  const statusMap = {
    open: '✅ CONNECTED',
    connecting: '🔄 CONNECTING',
    close: '❌ DISCONNECTED',
    logged_out: '⚠️  LOGGED OUT',
    conflict: '⚠️  CONFLICT (another device logged in)',
    replaced: '⚠️  REPLACED (logged in elsewhere)',
  };
  const label = statusMap[status] || `STATUS: ${status}`;
  console.log(`[WaSender] Session status changed → ${label}`);

  if (status === 'logged_out' || status === 'close') {
    console.warn('[WaSender] Session disconnected. Reconnect via wasenderapi.com dashboard.');
  }
  if (status === 'open') {
    console.log('[WaSender] Session fully connected. Message sending is active.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ███  Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function extractMessageBody(message) {
  if (!message) return null;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    null
  );
}

function detectMessageType(message) {
  if (!message) return 'text';
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.audioMessage) return 'audio';
  if (message.documentMessage) return 'document';
  if (message.stickerMessage) return 'sticker';
  if (message.locationMessage) return 'location';
  if (message.contactMessage) return 'contact';
  if (message.reactionMessage) return 'reaction';
  if (message.pollCreationMessage) return 'poll';
  return 'text';
}

function normalizeStatus(raw) {
  const map = {
    read: 'read',
    played: 'read',
    delivery_ack: 'delivered',
    server_ack: 'sent',
    failed: 'failed',
  };
  return map[raw] || 'delivered';
}


// ─────────────────────────────────────────────────────────────────────────────
// ███  Meta Cloud API Webhook (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook Verification Endpoint
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = (process.env.META_WA_VERIFY_TOKEN || '').trim();

  console.log('[Meta Webhook Verification]:', { mode, token, challenge });

  if (!verifyToken) {
    console.warn('[Meta Webhook] META_WA_VERIFY_TOKEN is not set — accepting all verification requests (dev mode)');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(String(challenge || ''));
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Meta Webhook] Verification successful');
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(String(challenge));
  }

  console.error('[Meta Webhook] Verification FAILED — token mismatch or wrong mode');
  return res.status(403).send('Forbidden: Invalid verify_token');
});

/**
 * POST /api/whatsapp/webhook
 * Meta Cloud API Event Handler
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const appSecret = (process.env.META_APP_SECRET || process.env.APP_SECRET || '').trim();

    if (signature && appSecret) {
      const expectedSignature =
        'sha256=' + crypto.createHmac('sha256', appSecret).update(JSON.stringify(req.body)).digest('hex');
      if (signature !== expectedSignature) {
        console.error('[Meta Webhook HMAC Error]: X-Hub-Signature-256 mismatch.');
        return res.status(401).send('Unauthorized Signature');
      }
    }

    const body = req.body;

    if (body?.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const field = change.field;
          const value = change.value || {};

          switch (field) {
            case 'messages': {
              const contacts = value.contacts || [];
              for (const msg of value.messages || []) {
                const senderPhone = msg.from;
                const wamid = msg.id;
                const messageType = msg.type || 'text';
                let textBody = msg.text?.body || msg.caption || messageType;

                const contactMatch = contacts.find((c) => c.wa_id === senderPhone);
                const senderName = contactMatch?.profile?.name || 'WhatsApp User';

                console.log(`[Meta WhatsApp] From: ${senderName} (+${senderPhone}) | Type: ${messageType}`);

                WhatsAppMessage.create({
                  wamid, from: senderPhone, senderName,
                  phoneNumberId: value.metadata?.phone_number_id,
                  displayPhoneNumber: value.metadata?.display_phone_number,
                  messageType, textBody, rawPayload: body,
                  direction: 'incoming', status: 'received'
                }).catch((err) => {
                  if (err.code !== 11000) console.error('[Meta WhatsApp DB Error]:', err.message);
                });
              }

              for (const statusObj of value.statuses || []) {
                console.log(`[Meta WhatsApp] Status: ${statusObj.id} → ${statusObj.status}`);
                WhatsAppMessage.findOneAndUpdate(
                  { wamid: statusObj.id },
                  { status: statusObj.status }
                ).catch((err) => console.error('[Meta Status Update Error]:', err.message));
              }
              break;
            }
            default:
              console.log(`[Meta Webhook] Event field: ${field}`);
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('[Meta Webhook Error]:', error);
    return res.status(200).send('EVENT_RECEIVED');
  }
});

module.exports = router;
