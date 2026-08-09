const axios = require('axios');

/**
 * WASenderAPI Exclusive WhatsApp Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Operates primarily via WASenderAPI. Falls back to Mock mode in development
 * if no token is configured.
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
   * Helper to format phone number to standard E.164 without '+' symbol (e.g. 919876543210)
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    // Automatically prepend country code 91 for standard 10-digit Indian numbers
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  }

  /**
   * Send Direct Plain Text Message via WASender API (Third-party)
   */
  async _sendViaWaSender(phone, text) {
    try {
      const formattedPhone = this._formatPhoneNumber(phone);
      const response = await axios.post(
        'https://www.wasenderapi.com/api/send-message',
        {
          to: `+${formattedPhone}`,
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
      console.log(`[WASender API Success] Sent message to ${formattedPhone}:`, response.data);
      return { success: true, provider: 'WASender API', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[WASender API Error]:', JSON.stringify(errData, null, 2));
      return { success: false, provider: 'WASender API', error: errData };
    }
  }

  /**
   * Unified dispatcher
   */
  async _dispatchMessage({ phone, plainText }) {
    this._init();
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    if (this.isWaSenderConfigured) {
      return await this._sendViaWaSender(formattedPhone, plainText);
    }

    // Fallback Mock/Dev Mode (Enables non-blocking test workflows without app crashes)
    console.log('────────────────────────────────────────────────────');
    console.log('📱 WHATSAPP MESSAGING LOG (Mock / Fallback Mode)');
    console.log('To:      ', formattedPhone);
    console.log('Message: ', plainText);
    console.log('────────────────────────────────────────────────────');
    return { success: true, mock: true, provider: 'Mock Console', message: plainText };
  }

  async sendOTP(phone, code) {
    const plainText = `Your Behold Aspire OTP Verification code is: ${code}. Please do not share this code with anyone.`;
    return this._dispatchMessage({ phone, plainText });
  }

  async sendNotification(phone, message) {
    const plainText = String(message).substring(0, 4000);
    return this._dispatchMessage({ phone, plainText });
  }

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

  async sendDayOfReminder(phone, details) {
    const otherParty = details.counsellorName
      ? `Counsellor: ${details.counsellorName}`
      : `Student: ${details.studentName}`;
    const summary = `Reminder: Appointment today!\n${otherParty}\nTime: ${details.time || 'N/A'}`;
    return this.sendNotification(phone, summary);
  }

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
