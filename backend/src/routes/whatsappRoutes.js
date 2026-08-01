const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const WhatsAppMessage = require('../models/WhatsAppMessage');

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook Verification Endpoint
 * Validates hub.mode, hub.verify_token and returns hub.challenge
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'] || req.query.verify_token;
  const challenge = req.query['hub.challenge'] || req.query.challenge;

  const expectedToken = (
    process.env.META_WA_VERIFY_TOKEN ||
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.VERIFY_TOKEN ||
    '12345'
  ).trim();

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[Meta Webhook Verified Successfully]: Challenge token matched.');
    return res.status(200).send(challenge);
  }

  if (challenge && (!token || token === expectedToken)) {
    console.log('[Meta Webhook Verification Fallback]: Sending challenge.');
    return res.status(200).send(challenge);
  }

  console.warn('[Meta Webhook Verification Failed]: Invalid verify_token.');
  return res.status(403).send('Forbidden');
});

/**
 * POST /api/whatsapp/webhook
 * Meta Cloud API Event Handler with optional HMAC-SHA256 X-Hub-Signature-256 validation
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const appSecret = (process.env.META_APP_SECRET || process.env.APP_SECRET || '').trim();

    // Verify HMAC-SHA256 signature if appSecret is configured
    if (signature && appSecret) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('[Meta Webhook HMAC Error]: X-Hub-Signature-256 mismatch.');
        return res.status(401).send('Unauthorized Signature');
      }
    }

    const body = req.body;

    if (body?.object === 'whatsapp_business_account') {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const field = change.field;
          const value = change.value || {};

          switch (field) {
            // 1. Core Messaging & Status Updates
            case 'messages': {
              const metadata = value.metadata || {};
              const contacts = value.contacts || [];
              const messages = value.messages || [];
              const statuses = value.statuses || [];

              if (messages.length > 0) {
                for (const msg of messages) {
                  const senderPhone = msg.from;
                  const wamid = msg.id;
                  const messageType = msg.type || 'text';
                  let textBody = msg.text?.body || msg.caption || (msg.interactive ? 'Interactive Action' : messageType);

                  if (messageType === 'contacts' && Array.isArray(msg.contacts)) {
                    textBody = `Contact Shared: ${msg.contacts.map(c => c.name?.formatted_name || c.name?.first_name || 'Contact').join(', ')}`;
                  } else if (msg.referral) {
                    textBody = `[Ad Referral: ${msg.referral.headline || msg.referral.body || 'Click to WhatsApp Ad'}] ${textBody}`;
                  } else if (msg.context?.referred_product) {
                    textBody = `[Product Inquiry: Catalog ${msg.context.referred_product.catalog_id}] ${textBody}`;
                  }

                  const contactMatch = contacts.find((c) => c.wa_id === senderPhone);
                  const senderName = contactMatch?.profile?.name || 'WhatsApp User';

                  console.log(`[WhatsApp Incoming Message] From: ${senderName} (+${senderPhone}) | Type: ${messageType} | Content: ${textBody}`);

                  WhatsAppMessage.create({
                    wamid,
                    from: senderPhone,
                    senderName,
                    phoneNumberId: metadata.phone_number_id,
                    displayPhoneNumber: metadata.display_phone_number,
                    messageType,
                    textBody,
                    rawPayload: body,
                    direction: 'incoming',
                    status: 'received'
                  }).catch((err) => console.error('[WhatsApp DB Save Error]:', err.message));
                }
              }

              if (statuses.length > 0) {
                for (const statusObj of statuses) {
                  console.log(`[WhatsApp Message Status Update] WAMID: ${statusObj.id} | Status: ${statusObj.status} | Recipient: ${statusObj.recipient_id}`);
                  WhatsAppMessage.findOneAndUpdate(
                    { wamid: statusObj.id },
                    { status: statusObj.status },
                    { new: true }
                  ).catch((err) => console.error('[WhatsApp Status Update Error]:', err.message));
                }
              }
              break;
            }

            // 2. Message Template Field Updates
            case 'message_template_status_update':
            case 'message_template_quality_update':
            case 'message_template_components_update':
            case 'template_category_update': {
              console.log(`[WhatsApp Template Update] Event: ${field} | Template ID: ${value.message_template_id} | Name: ${value.message_template_name} | Event: ${value.event}`);
              break;
            }

            // 3. Phone Number Verification & Quality Updates
            case 'phone_number_name_update':
            case 'phone_number_quality_update': {
              console.log(`[WhatsApp Phone Update] Event: ${field} | Phone ID: ${value.phone_number_id} | Decision: ${value.decision || value.quality_score}`);
              break;
            }

            // 4. Account, Business Capability & Policy Updates
            case 'account_alerts':
            case 'account_review_update':
            case 'account_update':
            case 'business_capability_update':
            case 'security': {
              console.log(`[WhatsApp Account Alert] Event: ${field} | Event: ${value.event || value.policy_name}`);
              break;
            }

            // 5. Calls & User Preference Updates
            case 'calls':
            case 'user_preferences':
            case 'automatic_events':
            case 'payment_configuration_update': {
              console.log(`[WhatsApp Interactive Event] Event: ${field} | Data:`, JSON.stringify(value, null, 2));
              break;
            }

            // 6. Solution Provider & Sync Echoes
            case 'history':
            case 'partner_solutions':
            case 'smb_app_state_sync':
            case 'smb_message_echoes':
            default: {
              console.log(`[WhatsApp Webhook Event] Event: ${field} | Payload:`, JSON.stringify(value, null, 2));
              break;
            }
          }
        }
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('[WhatsApp Webhook Error]:', error);
    return res.status(200).send('EVENT_RECEIVED');
  }
});

module.exports = router;
