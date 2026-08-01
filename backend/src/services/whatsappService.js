const axios = require('axios');

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

    this.apiVersion = (
      process.env.META_WA_API_VERSION ||
      process.env.API_VERSION ||
      'v19.0'
    ).trim();

    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`;

    // Only active if valid token & phoneId are provided
    const hasRealToken = this.token && !this.token.includes('your_meta') && !this.token.includes('ACCESS_TOKEN');
    const hasRealPhoneId = this.phoneId && !this.phoneId.includes('your_meta') && !this.phoneId.includes('PHONE_NUMBER_ID');

    this.isConfigured = Boolean(hasRealToken && hasRealPhoneId);
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
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      console.log(`[WhatsApp Service Success] Message sent to ${payload.to}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[WhatsApp Service Error]:', JSON.stringify(errData, null, 2));
      return { success: false, error: errData };
    }
  }

  /**
   * Send Meta Template Message
   */
  async sendTemplate(to, templateName = 'hello_world', languageCode = 'en_US', components = []) {
    const formattedTo = this._formatPhoneNumber(to);
    if (!formattedTo) return { success: false, error: 'Invalid phone number' };

    const payload = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    if (Array.isArray(components) && components.length > 0) {
      payload.template.components = components;
    }

    return this._sendRequest(payload);
  }

  /**
   * Send Direct Text Message (Available during 24-hour customer care session)
   */
  async sendTextMessage(to, message) {
    const formattedTo = this._formatPhoneNumber(to);
    if (!formattedTo) return { success: false, error: 'Invalid phone number' };

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedTo,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    };

    return this._sendRequest(payload);
  }

  /**
   * Send OTP Code for WhatsApp Authentication
   * With automatic fallback to 'hello_world' sample template if custom template fails or isn't approved
   */
  async sendOTP(phone, code) {
    const otpTemplate = (process.env.META_WA_OTP_TEMPLATE || 'otp_verification').trim();

    if (otpTemplate === 'hello_world') {
      return this.sendTemplate(phone, 'hello_world', 'en_US');
    }

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: String(code)
          }
        ]
      }
    ];

    const result = await this.sendTemplate(phone, otpTemplate, 'en_US', components);

    // If custom template failed (e.g., Error #131030 or template missing), try fallback to Meta's default 'hello_world'
    if (!result.success) {
      console.warn(`[WhatsApp Service Warning] Template '${otpTemplate}' failed. Retrying with fallback template 'hello_world'...`);
      const fallbackResult = await this.sendTemplate(phone, 'hello_world', 'en_US');
      if (fallbackResult.success) {
        return { success: true, fallback: true, data: fallbackResult.data };
      }
    }

    return result;
  }

  /**
   * Send general notification using custom template or fallback
   */
  async sendNotification(phone, message) {
    const templateName = (process.env.META_WA_NOTIF_TEMPLATE || 'behold_alert').trim();

    if (templateName === 'hello_world') {
      return this.sendTemplate(phone, 'hello_world', 'en_US');
    }

    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: message
          }
        ]
      }
    ];

    const result = await this.sendTemplate(phone, templateName, 'en_US', components);
    if (!result.success) {
      console.warn(`[WhatsApp Service Warning] Notification template '${templateName}' failed. Retrying with fallback 'hello_world'...`);
      return this.sendTemplate(phone, 'hello_world', 'en_US');
    }

    return result;
  }

  /**
   * Send Appointment Booking Alert
   */
  async sendBookingAlert(phone, action, details) {
    const formattedDate = details.date || 'N/A';
    const formattedTime = details.time || 'N/A';
    const otherParty = details.counsellorName ? `Counsellor: ${details.counsellorName}` : `Student: ${details.studentName}`;
    const mode = details.mode ? `\nMode: ${details.mode}` : '';

    let summary = '';
    switch (action) {
      case 'created':
        summary = `New Appointment Request:\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}${mode}`;
        break;
      case 'approved':
        summary = `Appointment Confirmed!\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}${mode}`;
        break;
      case 'cancelled':
        summary = `Appointment Cancelled.\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\nReason: ${details.reason || 'N/A'}`;
        break;
      case 'rescheduled':
        summary = `Appointment Rescheduled!\n👤 ${otherParty}\n📅 New Date: ${formattedDate}\n⏰ New Time: ${formattedTime}${mode}`;
        break;
      default:
        summary = `Appointment Update:\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}`;
    }

    return this.sendNotification(phone, summary);
  }

  /**
   * Send Day-of Appointment Reminder
   */
  async sendDayOfReminder(phone, details) {
    const otherParty = details.counsellorName ? `Counsellor: ${details.counsellorName}` : `Student: ${details.studentName}`;
    const summary = `Reminder: Appointment scheduled for today!\n👤 ${otherParty}\n⏰ Time: ${details.time || 'N/A'}`;
    return this.sendNotification(phone, summary);
  }

  /**
   * Get WhatsApp Account Number Details & Quality Rating
   * Meta Graph API: GET /{Version}/{WhatsApp-Account-Number-ID}
   */
  async getAccountStatus() {
    this._init();
    if (!this.isConfigured) {
      return { success: false, error: 'WhatsApp service is not configured' };
    }

    try {
      const fields = 'id,display_phone_number,verified_name,status,quality_rating,name_status,messaging_limit_tier,account_mode';
      const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}?fields=${fields}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log(`[WhatsApp Account Status Success]:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[WhatsApp Account Status Error]:', JSON.stringify(errData, null, 2));
      return { success: false, error: errData };
    }
  }
}

module.exports = new WhatsAppService();
