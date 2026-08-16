const axios = require('axios');
const { normalizePhoneWithCountryCode } = require('../utils/phoneUtils');

/**
 * BEHOLD. — WhatsApp Notification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider: WASenderAPI (wasenderapi.com)
 * All messages are sent as plain text with WhatsApp bold/formatting (*bold*, _italic_).
 *
 * Required .env:
 *   WASENDER_TOKEN — Session-specific API key from wasenderapi.com
 *                    Dashboard → WhatsApp Sessions → your session → 🔑 key icon
 * ─────────────────────────────────────────────────────────────────────────────
 */

class WhatsAppService {
  constructor() {
    this._init();
  }

  _init() {
    this.waSenderToken = (process.env.WASENDER_TOKEN || '04dd74a889079fa8a0030b0d5758854885be408fa8486f84a962c7ffb18ecf50').trim();
    this.isWaSenderConfigured = Boolean(this.waSenderToken);
  }

  /**
   * Normalize phone to canonical format "+918075374600"
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    const formatted = normalizePhoneWithCountryCode(phone);
    return formatted || null;
  }

  /**
   * Low-level send via WASender API with automatic rate-limit handling & retries
   */
  async _sendViaWaSender(phone, text, attempt = 1) {
    const formattedPhoneWithPlus = this._formatPhoneNumber(phone);
    if (!formattedPhoneWithPlus) {
      return { success: false, provider: 'WASender', error: 'Invalid phone number' };
    }

    const cleanedPhoneWithoutPlus = formattedPhoneWithPlus.replace(/^\+/, '');

    // Primary WASender payload with +91 format: { to: "+919876543210", text: "..." }
    const primaryPayload = {
      to: formattedPhoneWithPlus,
      text: text
    };

    try {
      const response = await axios.post(
        'https://wasenderapi.com/api/send-message',
        primaryPayload,
        {
          headers: {
            Authorization: `Bearer ${this.waSenderToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );
      console.log(`[WhatsApp] ✅ Sent to ${formattedPhoneWithPlus}:`, response.data?.data || response.data?.message || 'OK');
      return { success: true, provider: 'WASender', data: response.data };
    } catch (error) {
      const errData = error.response?.data || {};
      const errMsg = String(errData.message || error.message || '');
      const retryAfter = Number(errData.retry_after) || 0;

      // Handle WASender "Account Protection" 5-second rate limit automatically
      if ((retryAfter > 0 || errMsg.includes('5 seconds') || errMsg.includes('account protection')) && attempt <= 3) {
        const waitSeconds = retryAfter > 0 ? retryAfter + 1 : 5.5;
        console.warn(`[WhatsApp] ⏳ WASender Account Protection active. Auto-waiting ${waitSeconds}s before retry (Attempt ${attempt}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        return this._sendViaWaSender(phone, text, attempt + 1);
      }

      console.error(`[WhatsApp] ⚠️ Initial payload failed for ${formattedPhoneWithPlus}:`, JSON.stringify(errData));

      // Secondary fallback with clean 91... (without +)
      try {
        const response2 = await axios.post(
          'https://wasenderapi.com/api/send-message',
          { to: cleanedPhoneWithoutPlus, text },
          {
            headers: {
              Authorization: `Bearer ${this.waSenderToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        console.log(`[WhatsApp] ✅ Fallback sent to ${cleanedPhoneWithoutPlus}:`, response2.data?.data || response2.data?.message || 'OK');
        return { success: true, provider: 'WASender', data: response2.data };
      } catch (retryErr) {
        const retryErrData = retryErr.response?.data || {};
        const retryErrMsg = String(retryErrData.message || retryErr.message || '');
        const retryWaitSec = Number(retryErrData.retry_after) || 0;

        if ((retryWaitSec > 0 || retryErrMsg.includes('5 seconds') || retryErrMsg.includes('account protection')) && attempt <= 3) {
          const waitSec = retryWaitSec > 0 ? retryWaitSec + 1 : 5.5;
          console.warn(`[WhatsApp] ⏳ WASender fallback Account Protection active. Auto-waiting ${waitSec}s...`);
          await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
          return this._sendViaWaSender(phone, text, attempt + 1);
        }
        console.error(`[WhatsApp] ❌ Both attempts failed for ${phone}:`, retryErr.response?.data || retryErr.message);
      }

      if (errData.message === 'invalid API key') {
        console.error(
          '[WhatsApp] HINT: WASENDER_TOKEN is invalid or expired.\n' +
          '  → Log in to https://www.wasenderapi.com\n' +
          '  → Copy the session-specific API key and update WASENDER_TOKEN in .env'
        );
      }
      return { success: false, provider: 'WASender', error: errData };
    }
  }

  /**
   * Core dispatcher — sends via WASender or falls back to console mock
   */
  async _dispatch(phone, text) {
    this._init(); // re-read env each time so .env changes take effect without restart
    if (!phone) return { success: false, error: 'Phone number is required' };

    const truncated = String(text).substring(0, 4096); // WhatsApp limit

    if (this.isWaSenderConfigured) {
      return await this._sendViaWaSender(phone, truncated);
    }

    // Dev/Mock mode — print to console so devs can see messages without real sends
    const formatted = this._formatPhoneNumber(phone) || phone;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 WHATSAPP MOCK (no WASENDER_TOKEN configured)');
    console.log(`To:  ${formatted}`);
    console.log(`Msg: ${truncated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, mock: true, provider: 'Mock Console' };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * OTP Verification — sent when user logs in or registers via WhatsApp
   */
  async sendOTP(phone, code) {
    const text =
      `Your BEHOLD. verification code is: ${code}\n\n` +
      `Valid for 5 minutes. Please do not share this code with anyone.`;
    return this._dispatch(phone, text);
  }

  /**
   * Generic plain notification
   */
  async sendNotification(phone, message) {
    return this._dispatch(phone, message);
  }

  /**
   * Session booking alerts — 7 User-Only WhatsApp Templates
   * @param {string} phone
   * @param {'approved'|'created'|'cancelled'|'psychologist_cancelled'|'rejected'|'rescheduled'|'reminder_24h'|'reminder_1h'|'reminder'|'completed'} action
   * @param {object} details
   */
  async sendBookingAlert(phone, action, details = {}) {
    const {
      studentName    = 'there',
      counsellorName = 'Psychologist',
      date           = 'N/A',
      time           = 'N/A',
      mode           = '',
      duration       = '1 Hour (60 Mins)',
      bookingId      = '',
      reason         = '',
      meetLink       = '',
      oldDate        = '',
      oldTime        = ''
    } = details;

    const modeLabel = mode === 'ONLINE' ? 'Online' : mode === 'OFFLINE' ? 'In-Person' : mode === 'DOOR_STEP' ? 'Doorstep Visit' : (mode || 'Online');
    const bookingUrl = 'https://www.behold.co.in/profile?tab=booked';
    const catalogUrl = 'https://www.behold.co.in/advisors';
    const finalMeetLink = meetLink || bookingUrl;

    let text = '';

    switch (action) {

      // 1. Booking Confirmed
      case 'approved':
      case 'created':
      case 'confirmed':
      case 'booking_confirmed':
        text =
          `*Session Confirmed — BEHOLD.*\n\n` +
          `Hi *${studentName}* 👋\n\n` +
          `Great news! Your counselling session has been successfully confirmed.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          `🔗 *Meeting Link:* ${finalMeetLink}\n\n` +
          `Please join a few minutes before your scheduled time and ensure you have a quiet and private space for the session.\n\n` +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `Thank you for choosing BEHOLD.. We look forward to supporting you.`;
        break;

      // 2. Booking Cancelled
      case 'cancelled':
      case 'booking_cancelled':
        text =
          `*Session Cancelled — BEHOLD.*\n\n` +
          `Hi *${studentName}*,\n\n` +
          `Your counselling session has been cancelled.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          (bookingId ? `• *Booking ID:* ${bookingId}\n` : '') +
          `\n*Cancellation Reason:* ${reason || 'Cancelled upon request'}\n\n` +
          `If you would like to book another session, you can choose a new available appointment.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `If you have any questions, please contact BEHOLD. Support.`;
        break;

      // 3. Psychologist Cancelled
      case 'psychologist_cancelled':
      case 'rejected':
        text =
          `*Session Update — BEHOLD.*\n\n` +
          `Hi *${studentName}*,\n\n` +
          `We’re sorry to inform you that your counselling session with *${counsellorName}* scheduled for *${date}* at *${time}* has been cancelled by the psychologist.\n\n` +
          `You can choose another available psychologist or select a different appointment time.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `We apologize for the inconvenience and appreciate your understanding.\n\n` +
          `BEHOLD. Support Team`;
        break;

      // 4. Session Rescheduled
      case 'rescheduled':
      case 'session_rescheduled':
        text =
          `*Session Rescheduled — BEHOLD.*\n\n` +
          `Hi *${studentName}*,\n\n` +
          `Your counselling session has been successfully rescheduled.\n\n` +
          `*Psychologist:* ${counsellorName}\n\n` +
          `*Previous Schedule*\n` +
          `• ${oldDate || 'Previous Date'}\n` +
          `• ${oldTime || 'Previous Time'}\n\n` +
          `*New Schedule*\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          `🔗 *Meeting Link:* ${finalMeetLink}\n\n` +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `Please make sure you are available at the new scheduled time.`;
        break;

      // 5. 24-Hour Reminder
      case 'reminder_24h':
      case 'reminder_24_hour':
        text =
          `*Reminder: Your Session Is Tomorrow — BEHOLD.*\n\n` +
          `Hi *${studentName}* 👋\n\n` +
          `This is a friendly reminder about your counselling session tomorrow.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          `🔗 *Meeting Link:* ${finalMeetLink}\n\n` +
          `Please be ready a few minutes before your scheduled time.\n\n` +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `See you soon!`;
        break;

      // 6. 1-Hour Reminder
      case 'reminder_1h':
      case 'reminder_1_hour':
      case 'reminder':
        text =
          `*Your Session Starts Soon — BEHOLD.*\n\n` +
          `Hi *${studentName}* 👋\n\n` +
          `Your counselling session with *${counsellorName}* starts in approximately 1 hour.\n\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          `🔗 *Join Session:* ${finalMeetLink}\n\n` +
          `Please join a few minutes early and make sure you have a quiet and private space for your session.\n\n` +
          `BEHOLD.`;
        break;

      // 7. Session Completed
      case 'completed':
      case 'session_completed':
        text =
          `*Session Completed — BEHOLD.*\n\n` +
          `Hi *${studentName}*,\n\n` +
          `Your counselling session with *${counsellorName}* has been completed successfully.\n\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n\n` +
          `We hope the session was helpful and supportive. Your wellbeing matters to us. 💙\n\n` +
          `⭐ *Share Your Experience* — Your feedback helps future students find the right support.\n` +
          `👉 Leave a Review: ${bookingUrl}\n\n` +
          `If you'd like to continue your counselling journey, you can book another session at your convenience.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `Thank you for choosing BEHOLD..`;
        break;

      default:
        text =
          `*BEHOLD. — Session Update*\n\n` +
          `Hi *${studentName}*,\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n\n` +
          `📋 *View Booking:* ${bookingUrl}`;
    }

    return this._dispatch(phone, text);
  }

  // ── Convenience Helpers ──────────────────────────────────────────────────
  async sendBookingConfirmed(phone, details) {
    return this.sendBookingAlert(phone, 'approved', details);
  }

  async sendBookingCancelled(phone, details) {
    return this.sendBookingAlert(phone, 'cancelled', details);
  }

  async sendPsychologistCancelled(phone, details) {
    return this.sendBookingAlert(phone, 'psychologist_cancelled', details);
  }

  async sendSessionRescheduled(phone, details) {
    return this.sendBookingAlert(phone, 'rescheduled', details);
  }

  async send24HourReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_24h', details);
  }

  async send1HourReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_1h', details);
  }

  async sendSessionCompleted(phone, details) {
    return this.sendBookingAlert(phone, 'completed', details);
  }

  async sendDayOfReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_1h', details);
  }

  /**
   * Notify a psychologist when a client submits a star rating / review
   */
  async sendFeedbackReceived(phone, details = {}) {
    const {
      counsellorName = 'Psychologist',
      studentName    = 'A client',
      rating         = 5,
      comment        = ''
    } = details;

    const stars = '⭐'.repeat(Math.max(1, Math.min(5, Number(rating))));
    const profileUrl = 'https://www.behold.co.in/counsellor';

    const text =
      `*New Client Review — BEHOLD.*\n\n` +
      `Hi *${counsellorName}*,\n\n` +
      `Great news! *${studentName}* just left you a review.\n\n` +
      `${stars} *${rating}/5 Stars*\n` +
      (comment ? `_"${comment}"_\n\n` : '\n') +
      `This review has been recorded and will be reflected in your public rating.\n\n` +
      `📊 *View Your Dashboard:* ${profileUrl}\n\n` +
      `Thank you for your dedication to supporting students. 💙\n\n` +
      `BEHOLD. Support Team`;

    return this._dispatch(phone, text);
  }

  /**
   * Provider status check
   */
  async getAccountStatus() {
    this._init();
    return {
      success: true,
      providerConfig: {
        activeProvider: 'wasender',
        wasender: { isConfigured: this.isWaSenderConfigured }
      }
    };
  }
}

module.exports = new WhatsAppService();
