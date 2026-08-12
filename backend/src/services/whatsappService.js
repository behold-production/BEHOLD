const axios = require('axios');

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
    this.waSenderToken = (process.env.WASENDER_TOKEN || '').trim();
    this.isWaSenderConfigured = Boolean(this.waSenderToken);
  }

  /**
   * Normalize phone to E.164 format (+91XXXXXXXXXX)
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return `+${cleaned}`;
  }

  /**
   * Low-level send via WASender API
   */
  async _sendViaWaSender(phone, text) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) {
      return { success: false, provider: 'WASender', error: 'Invalid phone number' };
    }
    try {
      const response = await axios.post(
        'https://www.wasenderapi.com/api/send-message',
        { to: formattedPhone, text },
        {
          headers: {
            Authorization: `Bearer ${this.waSenderToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );
      console.log(`[WhatsApp] ✅ Sent to ${formattedPhone}:`, response.data?.message || 'OK');
      return { success: true, provider: 'WASender', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error(`[WhatsApp] ❌ Failed to send to ${formattedPhone}:`, JSON.stringify(errData));
      if (error.response?.data?.message === 'invalid API key') {
        console.error(
          '[WhatsApp] HINT: WASENDER_TOKEN is invalid or expired.\n' +
          '  → Log in to https://www.wasenderapi.com\n' +
          '  → WhatsApp Sessions → your session → click the 🔑 key icon\n' +
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
      `🔐 *Behold Aspire — Verification Code*\n\n` +
      `Hi! Your one-time verification code is:\n\n` +
      `━━━━━━━━━━━━━\n` +
      `  *${code}*\n` +
      `━━━━━━━━━━━━━\n\n` +
      `⏱ Valid for *5 minutes* only.\n` +
      `🚫 Do *NOT* share this code with anyone.\n\n` +
      `_If you did not request this, please ignore._`;
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
      studentName  = 'Student',
      counsellorName = 'Psychologist',
      date         = 'N/A',
      time         = 'N/A',
      mode         = '',
      reason       = '',
      meetLink     = ''
    } = details;

    const sessionInfo =
      `📅 *Date:* ${date}\n` +
      `🕐 *Time:* ${time}\n` +
      (mode ? `📍 *Mode:* ${mode}\n` : '');

    const modeLabel = mode === 'ONLINE' ? 'Online' : mode === 'OFFLINE' ? 'In-person' : mode || 'Online';
    const meetLine  = meetLink ? `\n🔗 *Join Meeting:* ${meetLink}` : '';

    let text = '';

    switch (action) {

      case 'created':
        text =
          `📋 *New Session Request — Behold Aspire*\n\n` +
          `👤 *Student:* ${studentName}\n` +
          `🧑‍⚕️ *Psychologist:* ${counsellorName}\n` +
          `${sessionInfo}` +
          `\n⏳ *Status:* Pending confirmation\n\n` +
          `_The psychologist will review and confirm your session shortly._\n\n` +
          `🔗 View bookings: https://www.behold.co.in/profile?tab=booked`;
        break;

      case 'approved':
        text =
          `✅ *Session Confirmed — Behold Aspire*\n\n` +
          `Your session has been *confirmed*!\n\n` +
          `👤 *Student:* ${studentName}\n` +
          `🧑‍⚕️ *Psychologist:* ${counsellorName}\n` +
          `${sessionInfo}` +
          `🎯 *Type:* ${modeLabel}` +
          `${meetLine}\n\n` +
          `_Please be on time. See you at your session!_ 🙏`;
        break;

      case 'cancelled':
        text =
          `❌ *Session Cancelled — Behold Aspire*\n\n` +
          `Your session has been *cancelled*.\n\n` +
          `📅 *Date:* ${date}\n` +
          `🕐 *Time:* ${time}\n` +
          (reason ? `📌 *Reason:* ${reason}\n` : '') +
          `\n_You can book a new session anytime._\n\n` +
          `🔗 Book again: https://www.behold.co.in/advisors`;
        break;

      case 'rejected':
        text =
          `❌ *Session Request Declined — Behold Aspire*\n\n` +
          `Your session request with *${counsellorName}* on *${date}* could not be confirmed.\n\n` +
          (reason ? `📌 *Reason:* ${reason}\n\n` : '') +
          `_Please browse other available psychologists._\n\n` +
          `🔗 Find a psychologist: https://www.behold.co.in/advisors`;
        break;

      case 'rescheduled':
        text =
          `🔄 *Session Rescheduled — Behold Aspire*\n\n` +
          `Your session has been *rescheduled* to a new time.\n\n` +
          `👤 *Student:* ${studentName}\n` +
          `🧑‍⚕️ *Psychologist:* ${counsellorName}\n` +
          `📅 *New Date:* ${date}\n` +
          `🕐 *New Time:* ${time}\n\n` +
          `⏳ _Awaiting re-confirmation from the psychologist._\n\n` +
          `🔗 View bookings: https://www.behold.co.in/profile?tab=booked`;
        break;

      case 'reminder':
        text =
          `⏰ *Session Reminder — Behold Aspire*\n\n` +
          `Your session is *today*!\n\n` +
          `👤 *Student:* ${studentName}\n` +
          `🧑‍⚕️ *Psychologist:* ${counsellorName}\n` +
          `${sessionInfo}` +
          `${meetLine}\n\n` +
          `_Please be ready on time. All the best!_ 💙`;
        break;

      default:
        text =
          `📢 *Behold Aspire — Session Update*\n\n` +
          `👤 *Student:* ${studentName}\n` +
          `🧑‍⚕️ *Psychologist:* ${counsellorName}\n` +
          `${sessionInfo}`;
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
