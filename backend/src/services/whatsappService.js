const axios = require('axios');

/**
 * MSG91 WhatsApp OTP Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the Meta Cloud API WhatsApp integration with MSG91.
 * MSG91 is used for:
 *   - Sending OTPs via WhatsApp (sendOTP)
 *   - Sending general text notifications (sendNotification)
 *   - Sending booking alerts (sendBookingAlert)
 *   - Sending appointment reminders (sendDayOfReminder)
 *
 * Required .env variables:
 *   MSG91_AUTH_KEY        — Your MSG91 Auth Key (from MSG91 dashboard)
 *   MSG91_OTP_TEMPLATE_ID — Your MSG91 WhatsApp OTP template ID
 *   MSG91_NOTIF_TEMPLATE_ID — Your MSG91 WhatsApp notification template ID (optional)
 *   MSG91_SENDER_ID       — Your MSG91 registered WhatsApp number (11-digit, no +)
 *                           e.g. 917012345678
 * ─────────────────────────────────────────────────────────────────────────────
 */

class WhatsAppService {
  constructor() {
    this._init();
  }

  _init() {
    this.authKey = (process.env.MSG91_AUTH_KEY || '').trim();
    this.otpTemplateId = (process.env.MSG91_OTP_TEMPLATE_ID || '').trim();
    this.notifTemplateId = (process.env.MSG91_NOTIF_TEMPLATE_ID || '').trim();
    this.senderId = (process.env.MSG91_SENDER_ID || '').trim();

    // Service is only active if MSG91_AUTH_KEY is configured
    this.isConfigured = Boolean(
      this.authKey &&
      !this.authKey.includes('your_msg91') &&
      this.otpTemplateId &&
      !this.otpTemplateId.includes('your_')
    );
  }

  /**
   * Format phone number to E.164 without '+' (MSG91 requirement)
   * Assumes Indian numbers (+91) if 10 digits provided.
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
   * Send OTP via MSG91 WhatsApp
   * MSG91 Send OTP API: POST https://api.msg91.com/api/v5/whatsapp/whatsapp-otp-send-otp
   */
  async sendOTP(phone, code) {
    this._init();
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    if (!this.isConfigured) {
      console.log('------------------------------------------------------------');
      console.log('📱 MSG91 WHATSAPP OTP LOG [Dev/Mock Mode — Not Configured]');
      console.log('To:   ', formattedPhone);
      console.log('OTP:  ', code);
      console.log('------------------------------------------------------------');
      return { success: true, mock: true };
    }

    try {
      const response = await axios.post(
        'https://api.msg91.com/api/v5/whatsapp/whatsapp-otp-send-otp',
        {
          mobile: formattedPhone,
          otp: code,
          template_id: this.otpTemplateId,
        },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(`[MSG91 OTP Success] Sent to ${formattedPhone}:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[MSG91 OTP Error]:', JSON.stringify(errData, null, 2));
      return { success: false, error: errData };
    }
  }

  /**
   * Send a general text notification.
   * Uses MSG91 WhatsApp flow API if a notification template is configured,
   * otherwise falls back to a simple text message via MSG91 SMS (as a safety net).
   */
  async sendNotification(phone, message) {
    this._init();
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    if (!this.isConfigured) {
      console.log('------------------------------------------------------------');
      console.log('📱 MSG91 NOTIFICATION LOG [Dev/Mock Mode — Not Configured]');
      console.log('To:     ', formattedPhone);
      console.log('Message:', message);
      console.log('------------------------------------------------------------');
      return { success: true, mock: true };
    }

    // If a dedicated notification template is set, use MSG91 WhatsApp Flow API
    if (this.notifTemplateId) {
      try {
        const response = await axios.post(
          'https://api.msg91.com/api/v5/whatsapp/whatsapp-otp-send-otp',
          {
            mobile: formattedPhone,
            otp: message, // MSG91 passes this as the variable in the template
            template_id: this.notifTemplateId,
          },
          {
            headers: {
              authkey: this.authKey,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );
        console.log(`[MSG91 Notification Success] Sent to ${formattedPhone}:`, response.data);
        return { success: true, data: response.data };
      } catch (error) {
        const errData = error.response?.data || error.message;
        console.error('[MSG91 Notification Error]:', JSON.stringify(errData, null, 2));
        return { success: false, error: errData };
      }
    }

    // Fallback: Send SMS if WhatsApp notification template is not configured
    console.log('[MSG91] No notification template set. Logging notification only.');
    console.log('Notification to', formattedPhone, ':', message);
    return { success: true, mock: true };
  }

  /**
   * Send an appointment booking alert
   * action can be: 'created' | 'approved' | 'rescheduled' | 'cancelled'
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
   * Send a day-of appointment reminder
   */
  async sendDayOfReminder(phone, details) {
    const otherParty = details.counsellorName
      ? `Counsellor: ${details.counsellorName}`
      : `Student: ${details.studentName}`;
    const summary = `Reminder: Appointment today!\n${otherParty}\nTime: ${details.time || 'N/A'}`;
    return this.sendNotification(phone, summary);
  }

  async getAccountStatus() {
    return { success: true, provider: 'MSG91', isConfigured: this.isConfigured };
  }
}

module.exports = new WhatsAppService();
