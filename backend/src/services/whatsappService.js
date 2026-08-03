const axios = require('axios');

/**
 * Meta Cloud API WhatsApp Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses the official Meta WhatsApp Cloud API.
 * 
 * Required .env variables:
 *   META_WA_ACCESS_TOKEN
 *   META_WA_PHONE_NUMBER_ID
 *   META_WA_OTP_TEMPLATE (default: 'hello_world')
 *   META_WA_NOTIF_TEMPLATE (default: 'hello_world')
 *   META_WA_API_VERSION (default: 'v19.0')
 * ─────────────────────────────────────────────────────────────────────────────
 */

class WhatsAppService {
  constructor() {
    this._init();
  }

  _init() {
    this.token = (
      process.env.META_WA_ACCESS_TOKEN ||
      process.env.WHATSAPP_ACCESS_TOKEN ||
      process.env.META_WHATSAPP_TOKEN ||
      process.env.ACCESS_TOKEN ||
      ''
    ).trim();

    this.phoneId = (
      process.env.META_WA_PHONE_NUMBER_ID ||
      process.env.WHATSAPP_PHONE_NUMBER_ID ||
      process.env.META_WHATSAPP_PHONE_NUMBER_ID ||
      process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID ||
      ''
    ).trim();

    this.otpTemplate = (
      process.env.META_WA_OTP_TEMPLATE ||
      process.env.WHATSAPP_OTP_TEMPLATE ||
      'hello_world'
    ).trim();

    this.notifTemplate = (
      process.env.META_WA_NOTIF_TEMPLATE ||
      process.env.WHATSAPP_NOTIF_TEMPLATE ||
      'hello_world'
    ).trim();

    this.apiVersion = (
      process.env.META_WA_API_VERSION ||
      process.env.WHATSAPP_API_VERSION ||
      'v19.0'
    ).trim();

    this.isConfigured = Boolean(
      this.token && 
      !this.token.includes('your_meta') && 
      this.phoneId && 
      !this.phoneId.includes('your_phone')
    );
  }

  /**
   * Helper to format phone number to E.164 without '+' symbol (Meta API requirement)
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  }

  /**
   * Core method to send request to Meta Cloud API
   */
  async _sendRequest(payload) {
    this._init();

    if (!this.isConfigured) {
      console.log('----------------------------------------------------');
      console.log('📱 WHATSAPP META API LOG (Dev/Mock Mode)');
      console.log('To:      ', payload.to);
      console.log('Type:    ', payload.type);
      console.log('Payload: ', JSON.stringify(payload.template || payload.text, null, 2));
      console.log('----------------------------------------------------');
      return { success: true, mock: true };
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      console.log(`[WhatsApp Success] Sent to ${payload.to}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[WhatsApp Error]:', JSON.stringify(errData, null, 2));
      return { success: false, error: errData };
    }
  }

  async sendOTP(phone, code) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: this.otpTemplate,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: code
              }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: code
              }
            ]
          }
        ]
      }
    };

    return this._sendRequest(payload);
  }

  async sendNotification(phone, message) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: this.notifTemplate,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: message.substring(0, 1024)
              }
            ]
          }
        ]
      }
    };

    return this._sendRequest(payload);
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
    return { success: true, provider: 'Meta Cloud API', isConfigured: this.isConfigured };
  }
}

module.exports = new WhatsAppService();
