const axios = require('axios');
const { normalizePhoneWithCountryCode } = require('../utils/phoneUtils');

/**
 * Behold Aspire — WhatsApp Notification Service
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
   * Low-level send via WASender API with retry and fallback payload format
   */
  async _sendViaWaSender(phone, text) {
    const formattedPhoneWithPlus = this._formatPhoneNumber(phone);
    if (!formattedPhoneWithPlus) {
      return { success: false, provider: 'WASender', error: 'Invalid phone number' };
    }

    const cleanedPhoneWithoutPlus = formattedPhoneWithPlus.replace(/^\+/, '');

    // Standard WASender payload: { to: "+918075374600", text: "..." }
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
      const errData = error.response?.data || error.message;
      console.error(`[WhatsApp] ⚠️ Initial payload failed for ${formattedPhoneWithPlus}:`, JSON.stringify(errData));
      
      // Fallback with clean 91... (without +)
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
        console.error(`[WhatsApp] ❌ Both attempts failed for ${phone}:`, retryErr.response?.data || retryErr.message);
      }

      if (error.response?.data?.message === 'invalid API key') {
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
      `Your Behold Aspire verification code is: ${code}\n\n` +
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
   * Session booking alerts — all appointment lifecycle events
   * @param {string} phone
   * @param {'created'|'approved'|'cancelled'|'rescheduled'|'rejected'|'reminder'} action
   * @param {object} details - { studentName, counsellorName, date, time, mode, reason, meetLink }
   */
  async sendBookingAlert(phone, action, details) {
    const {
      studentName    = 'Student',
      counsellorName = 'Psychologist',
      date           = 'N/A',
      time           = 'N/A',
      mode           = '',
      reason         = '',
      meetLink       = '',
      recipientRole  = 'user'
    } = details;

    const modeLabel = mode === 'ONLINE' ? 'Online (Google Meet)' : mode === 'OFFLINE' ? 'In-person' : mode || 'Online';
    const isCounsellor = recipientRole === 'counsellor';

    let text = '';

    switch (action) {

      case 'created':
        if (isCounsellor) {
          text =
            `*New Session Request — BEHOLD Aspire*\n\n` +
            `Hi *${counsellorName}*,\n` +
            `You have received a new counselling session request.\n\n` +
            `• *Student:* ${studentName}\n` +
            `• *Date:* ${date}\n` +
            `• *Time:* ${time}\n` +
            `• *Mode:* ${modeLabel}\n\n` +
            `Status: *Pending Confirmation*\n\n` +
            `Please review in your dashboard: https://www.behold.co.in/counsellor`;
        } else {
          text =
            `*Session Request Received — BEHOLD Aspire*\n\n` +
            `Hi *${studentName}*,\n` +
            `Your counselling session request has been submitted successfully!\n\n` +
            `• *Psychologist:* ${counsellorName}\n` +
            `• *Date:* ${date}\n` +
            `• *Time:* ${time}\n` +
            `• *Mode:* ${modeLabel}\n\n` +
            `Status: *Pending Confirmation*\n\n` +
            `Your psychologist will review and confirm your session shortly.\n\n` +
            `View Bookings: https://www.behold.co.in/profile?tab=booked`;
        }
        break;

      case 'approved':
        if (isCounsellor) {
          text =
            `*Session Confirmed — BEHOLD Aspire*\n\n` +
            `Hi *${counsellorName}*,\n` +
            `Your upcoming session is confirmed.\n\n` +
            `• *Student:* ${studentName}\n` +
            `• *Date:* ${date}\n` +
            `• *Time:* ${time}\n` +
            `• *Mode:* ${modeLabel}\n` +
            (meetLink ? `• *Meeting Link:* ${meetLink}\n` : '') +
            `\nDashboard: https://www.behold.co.in/counsellor`;
        } else {
          text =
            `*Session Confirmed — BEHOLD Aspire*\n\n` +
            `Hi *${studentName}*,\n` +
            `Great news! Your counselling session is *confirmed*.\n\n` +
            `• *Psychologist:* ${counsellorName}\n` +
            `• *Date:* ${date}\n` +
            `• *Time:* ${time}\n` +
            `• *Mode:* ${modeLabel}\n` +
            (meetLink ? `• *Meeting Link:* ${meetLink}\n` : '') +
            `\nPlease be ready on time for your session!\n\n` +
            `View Booking: https://www.behold.co.in/profile?tab=booked`;
        }
        break;

      case 'cancelled':
        text =
          `*Session Cancelled — BEHOLD Aspire*\n\n` +
          `The following counselling session has been cancelled.\n\n` +
          `• *Student:* ${studentName}\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          (reason ? `• *Reason:* ${reason}\n` : '') +
          `\nVisit Behold Aspire: https://www.behold.co.in`;
        break;

      case 'rejected':
        text =
          `*Session Request Update — BEHOLD Aspire*\n\n` +
          `Hi *${studentName}*,\n` +
          `Your session request for ${date} at ${time} could not be confirmed at this time.\n\n` +
          (reason ? `• *Reason:* ${reason}\n` : '') +
          `\nYou can browse other available psychologists: https://www.behold.co.in/advisors`;
        break;

      case 'rescheduled':
        text =
          `*Session Rescheduled — BEHOLD Aspire*\n\n` +
          `Your session has been moved to a new time.\n\n` +
          `• *Student:* ${studentName}\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *New Date:* ${date}\n` +
          `• *New Time:* ${time}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          `View Booking: https://www.behold.co.in/profile?tab=booked`;
        break;

      case 'reminder':
        text =
          `*Session Reminder — Today! — BEHOLD Aspire*\n\n` +
          `Reminder for your counselling session today:\n\n` +
          `• *Student:* ${studentName}\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Mode:* ${modeLabel}\n` +
          (meetLink ? `• *Meeting Link:* ${meetLink}\n` : '') +
          `\nPlease be ready on time!`;
        break;

      default:
        text =
          `*BEHOLD Aspire — Session Update*\n\n` +
          `• *Student:* ${studentName}\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}`;
    }

    return this._dispatch(phone, text);
  }

  /**
   * Day-of appointment reminder
   */
  async sendDayOfReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder', details);
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
