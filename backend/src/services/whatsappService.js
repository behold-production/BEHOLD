const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.token = process.env.META_WA_ACCESS_TOKEN || '';
    this.phoneId = process.env.META_WA_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v19.0/${this.phoneId}/messages`;
    this.isConfigured = Boolean(this.token && this.phoneId && this.token !== 'your_meta_wa_access_token_here');
  }

  /**
   * Helper to format phone number to E.164 (roughly) for WhatsApp
   * Strips all non-digit characters. Assumes Indian numbers (+91) if 10 digits.
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  }

  /**
   * Core method to send a raw payload to Meta Cloud API
   */
  async _sendRequest(payload) {
    if (!this.isConfigured) {
      console.log('----------------------------------------------------');
      console.log('📱 WHATSAPP MESSAGE LOG (Meta API Not Configured)');
      console.log('To: ', payload.to);
      console.log('Payload:', JSON.stringify(payload.template || payload.text, null, 2));
      console.log('----------------------------------------------------');
      return { success: true, mock: true };
    }

    try {
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[WhatsApp Service Error]:', error.response?.data || error.message);
      // We don't want booking flows to crash if WA fails
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send a template message
   */
  async sendTemplate(to, templateName, languageCode = 'en', components = []) {
    const formattedTo = this._formatPhoneNumber(to);
    if (!formattedTo) return { success: false, error: 'Invalid phone number' };

    const payload = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    return this._sendRequest(payload);
  }

  /**
   * Send an OTP code for verification
   */
  async sendOTP(phone, code) {
    // We assume there is a template named "otp_verification" with 1 body parameter (the code).
    const components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: code
          }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: code
          }
        ]
      }
    ];

    // For demonstration, if not configured, the logger will just output the payload
    return this.sendTemplate(phone, 'otp_verification', 'en', components);
  }

  /**
   * Send an appointment booking alert
   * action can be: 'created', 'approved', 'rescheduled', 'cancelled'
   */
  async sendBookingAlert(phone, action, details) {
    const formattedTo = this._formatPhoneNumber(phone);
    if (!formattedTo) return { success: false, error: 'Invalid phone number' };

    // Format the details string for the template
    // In Meta, templates usually have positional parameters {{1}}, {{2}} etc.
    let summary = '';
    switch(action) {
      case 'created': summary = `Requested by ${details.studentName} for ${details.date} at ${details.time}`; break;
      case 'approved': summary = `Confirmed with ${details.counsellorName} on ${details.date} at ${details.time}`; break;
      case 'cancelled': summary = `Cancelled. Reason: ${details.reason || 'N/A'}`; break;
      case 'rescheduled': summary = `Rescheduled to ${details.date} at ${details.time}`; break;
      default: summary = 'Updated';
    }

    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: action.toUpperCase() }, // {{1}}
          { type: "text", text: summary }               // {{2}}
        ]
      }
    ];

    return this.sendTemplate(phone, 'booking_alert', 'en', components);
  }
}

module.exports = new WhatsAppService();
