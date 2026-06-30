const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.token = process.env.META_WA_ACCESS_TOKEN || '';
    this.phoneId = process.env.META_WA_PHONE_NUMBER_ID || '';
    this.baseUrl = `https://graph.facebook.com/v19.0/${this.phoneId}/messages`;
    
    // It's only configured if both token and phoneId are present and NOT placeholders
    const hasRealToken = this.token && !this.token.includes('your_meta');
    const hasRealPhoneId = this.phoneId && !this.phoneId.includes('your_meta');
    
    this.isConfigured = Boolean(hasRealToken && hasRealPhoneId);
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
    // We assume there is a Utility template named "otp_verification" with 1 body parameter (the code).
    const components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: code
          }
        ]
      }
    ];

    // For demonstration, if not configured, the logger will just output the payload
    return this.sendTemplate(phone, 'otp_verification', 'en_US', components);
  }

  /**
   * Send a general text notification using the universal 'behold_alert' template
   */
  async sendNotification(phone, message) {
    const components = [
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: message
          }
        ]
      }
    ];
    return this.sendTemplate(phone, 'behold_alert', 'en_US', components);
  }

  /**
   * Send an appointment booking alert
   * action can be: 'created', 'approved', 'rescheduled', 'cancelled'
   */
  async sendBookingAlert(phone, action, details) {
    let summary = '';
    
    const formattedDate = details.date || 'N/A';
    const formattedTime = details.time || 'N/A';
    const otherParty = details.counsellorName ? `Counsellor: ${details.counsellorName}` : `Student: ${details.studentName}`;
    const mode = details.mode ? `\n📍 Mode: ${details.mode}` : '';

    switch(action) {
      case 'created':
        summary = `🗓️ *New Booking Request*\n\nWe have received a new appointment request.\n\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}${mode}\n\nPlease check your dashboard for more details.`;
        break;
      case 'approved':
        summary = `✅ *Booking Confirmed*\n\nYour appointment has been successfully confirmed!\n\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}${mode}\n\nWe look forward to seeing you.`;
        break;
      case 'cancelled':
        summary = `❌ *Booking Cancelled*\n\nYour appointment has been cancelled.\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n📝 Reason: ${details.reason || 'N/A'}\n\nIf you have any questions, please contact support.`;
        break;
      case 'rescheduled':
        summary = `🔄 *Booking Rescheduled*\n\nYour appointment has been rescheduled to a new time.\n\n👤 ${otherParty}\n📅 New Date: ${formattedDate}\n⏰ New Time: ${formattedTime}${mode}\n\nPlease check your dashboard for updates.`;
        break;
      default:
        summary = `🔔 *Booking Update*\n\nThere has been an update regarding your appointment.\n\n👤 ${otherParty}\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n\nPlease check your dashboard for details.`;
    }

    return this.sendNotification(phone, summary);
  }

  /**
   * Send a day-of-booking reminder
   */
  async sendDayOfReminder(phone, details) {
    const otherParty = details.counsellorName ? `Counsellor: ${details.counsellorName}` : `Student: ${details.studentName}`;
    const mode = details.mode ? `\n📍 Mode: ${details.mode}` : '';
    
    const summary = `⏰ *Appointment Reminder*\n\nHello! This is a friendly reminder that you have an appointment scheduled for today.\n\n👤 ${otherParty}\n⏰ Time: ${details.time || 'N/A'}${mode}\n\nPlease ensure you are ready at the scheduled time. See you soon!`;
    
    return this.sendNotification(phone, summary);
  }
}

module.exports = new WhatsAppService();
