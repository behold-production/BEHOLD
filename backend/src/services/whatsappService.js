const axios = require('axios');

/**
 * WASenderAPI Exclusive WhatsApp Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Operates via WASenderAPI. Each WaSender account uses a per-session API key
 * found under the 🔑 icon on the WhatsApp session page in the dashboard.
 * Falls back to Mock/Console mode in development if no token is configured.
 *
 * ⚠️  IMPORTANT: WASENDER_TOKEN must be the session-specific API key, NOT the
 *     account password or any other credential. Log in to wasenderapi.com →
 *     WhatsApp Sessions → your session → click the 🔑 key icon to copy it.
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
   * Format phone number to E.164 format with '+' prefix (e.g. +919876543210)
   * WaSender requires the `to` field as "+<country_code><number>"
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    // Strip everything except digits
    let cleaned = String(phone).replace(/\D/g, '');
    // Automatically prepend country code 91 for standard 10-digit Indian numbers
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    // Always return with '+' prefix for E.164 — WaSender requires this format
    return `+${cleaned}`;
  }

  /**
   * Send Direct Plain Text Message via WaSender API
   * Endpoint: POST https://www.wasenderapi.com/api/send-message
   * Auth:      Authorization: Bearer <session_api_key>
   * Body:      { to: "+91XXXXXXXXXX", text: "..." }
   */
  async _sendViaWaSender(phone, text) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) {
      return { success: false, provider: 'WASender API', error: 'Invalid phone number' };
    }

    try {
      const response = await axios.post(
        'https://www.wasenderapi.com/api/send-message',
        {
          to: formattedPhone,
          text: text
        },
        {
          headers: {
            Authorization: `Bearer ${this.waSenderToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );
      console.log(`[WASender API OK] Message sent to ${formattedPhone}:`, JSON.stringify(response.data));
      return { success: true, provider: 'WASender API', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[WASender API Error]:', JSON.stringify(errData, null, 2));

      // Provide helpful guidance on the "invalid API key" error
      if (error.response?.data?.message === 'invalid API key') {
        console.error(
          '[WASender API] HINT: The WASENDER_TOKEN is invalid or expired.\n' +
          '  -> Log in to https://www.wasenderapi.com\n' +
          '  -> Go to WhatsApp Sessions -> your session -> click the key icon\n' +
          '  -> Copy the session-specific API key and update WASENDER_TOKEN in .env'
        );
      }

      return { success: false, provider: 'WASender API', error: errData };
    }
  }

  /**
   * Unified message dispatcher
   * @param {string} phone     - Raw phone number (any format; normalized internally)
   * @param {string} plainText - Plain text message content
   */
  async _dispatchMessage({ phone, plainText }) {
    // Re-read env vars on every dispatch so runtime updates are picked up
    this._init();

    if (!phone) return { success: false, error: 'Phone number is required' };

    if (this.isWaSenderConfigured) {
      return await this._sendViaWaSender(phone, plainText);
    }

    // Fallback Mock/Dev Mode — logs to console so devs can verify OTPs without real sends
    const formatted = this._formatPhoneNumber(phone) || phone;
    console.log('------------------------------------------------------');
    console.log('📱 WHATSAPP MESSAGING LOG (Mock / Dev Mode — No Token)');
    console.log('To:      ', formatted);
    console.log('Message: ', plainText);
    console.log('------------------------------------------------------');
    return { success: true, mock: true, provider: 'Mock Console', message: plainText };
  }

  /**
   * Send OTP via WhatsApp
   * @param {string} phone - Phone number
   * @param {string} code  - 6-digit OTP code
   */
  async sendOTP(phone, code) {
    const plainText =
      `*Behold Aspire — OTP Verification*\n\n` +
      `Your verification code is:\n\n` +
      `*${code}*\n\n` +
      `This code is valid for 5 minutes. Do NOT share it with anyone.`;
    return this._dispatchMessage({ phone, plainText });
  }

  /**
   * Send a generic notification message
   * @param {string} phone   - Phone number
   * @param {string} message - Message text (max 4000 chars)
   */
  async sendNotification(phone, message) {
    const plainText = String(message).substring(0, 4000);
    return this._dispatchMessage({ phone, plainText });
  }

  /**
   * Send booking-related alerts
   */
  async sendBookingAlert(phone, action, details) {
    const formattedDate = details.date || 'N/A';
    const formattedTime = details.time || 'N/A';
    const otherParty = details.counsellorName
      ? `Counsellor: ${details.counsellorName}`
      : `Student: ${details.studentName}`;
    const mode = details.mode ? `\nMode: ${details.mode}` : '';

    let summary = '';
    switch (action) {
      case 'created':
        summary = `New Booking Request:\n${otherParty}\nDate: ${formattedDate}\nTime: ${formattedTime}${mode}`;
        break;
      case 'approved':
        summary = `Booking Confirmed!\n${otherParty}\nDate: ${formattedDate}\nTime: ${formattedTime}${mode}`;
        break;
      case 'cancelled':
        summary = `Booking Cancelled.\nDate: ${formattedDate}\nTime: ${formattedTime}\nReason: ${details.reason || 'N/A'}`;
        break;
      case 'rescheduled':
        summary = `Booking Rescheduled!\n${otherParty}\nNew Date: ${formattedDate}\nNew Time: ${formattedTime}${mode}`;
        break;
      default:
        summary = `Booking Update:\n${otherParty}\nDate: ${formattedDate}\nTime: ${formattedTime}`;
    }

    return this.sendNotification(phone, summary);
  }

  /**
   * Send day-of appointment reminder
   */
  async sendDayOfReminder(phone, details) {
    const otherParty = details.counsellorName
      ? `Counsellor: ${details.counsellorName}`
      : `Student: ${details.studentName}`;
    const summary = `Reminder: Appointment today!\n${otherParty}\nTime: ${details.time || 'N/A'}`;
    return this.sendNotification(phone, summary);
  }

  /**
   * Get current service configuration status
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
