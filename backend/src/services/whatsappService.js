const axios = require('axios');

/**
 * Multi-Provider WhatsApp Service (Meta Cloud API, Whapi.Cloud, Green API, Evolution API)
 * ─────────────────────────────────────────────────────────────────────────────
 * Designed to handle unverified Meta account limitations and template restrictions
 * by supporting alternative free and instant plain-text providers like Whapi & Green API.
 *
 * Supported Providers via process.env.WHATSAPP_PROVIDER:
 *   1. 'whapi'     - Whapi.Cloud (Requires WHAPI_TOKEN / WHAPI_API_KEY)
 *   2. 'greenapi'  - Green API (Requires GREEN_API_INSTANCE_ID, GREEN_API_TOKEN)
 *   3. 'evolution' - Evolution API / Self-hosted (Requires EVOLUTION_API_URL, EVOLUTION_API_KEY)
 *   4. 'meta'      - Meta WhatsApp Cloud API (Requires META_WA_ACCESS_TOKEN, META_WA_PHONE_NUMBER_ID)
 *   5. 'auto'      - Tries configured third-party text providers first, falls back to Meta, then dev/mock.
 * ─────────────────────────────────────────────────────────────────────────────
 */

class WhatsAppService {
  constructor() {
    this._init();
  }

  _init() {
    this.provider = (
      process.env.WHATSAPP_PROVIDER ||
      'auto'
    ).trim().toLowerCase();

    // 1. Whapi.cloud Configuration
    this.whapiToken = (
      process.env.WHAPI_TOKEN ||
      process.env.WHAPI_API_KEY ||
      ''
    ).trim();
    this.whapiEndpoint = process.env.WHAPI_URL || 'https://gate.whapi.cloud/messages/text';
    this.isWhapiConfigured = Boolean(this.whapiToken && !this.whapiToken.includes('your_'));

    // 2. Green API Configuration
    this.greenApiId = (process.env.GREEN_API_INSTANCE_ID || process.env.GREEN_API_ID || '').trim();
    this.greenApiToken = (process.env.GREEN_API_TOKEN || '').trim();
    this.isGreenApiConfigured = Boolean(this.greenApiId && this.greenApiToken && !this.greenApiId.includes('your_'));

    // 3. Evolution API Configuration
    this.evolutionUrl = (process.env.EVOLUTION_API_URL || '').trim();
    this.evolutionKey = (process.env.EVOLUTION_API_KEY || '').trim();
    this.evolutionInstance = (process.env.EVOLUTION_API_INSTANCE || 'behold').trim();
    this.isEvolutionConfigured = Boolean(this.evolutionUrl && this.evolutionKey);

    // 4. Meta Cloud API Configuration
    this.metaToken = (
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

    this.isMetaConfigured = Boolean(
      this.metaToken &&
      !this.metaToken.includes('your_meta') &&
      this.phoneId &&
      !this.phoneId.includes('your_phone')
    );
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
   * Send Direct Plain Text Message via Whapi.cloud (Zero Template Restrictions)
   */
  async _sendViaWhapi(phone, text) {
    try {
      const formattedPhone = this._formatPhoneNumber(phone);
      const response = await axios.post(
        this.whapiEndpoint,
        {
          to: `${formattedPhone}@s.whatsapp.net`,
          body: text
        },
        {
          headers: {
            Authorization: `Bearer ${this.whapiToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 20000
        }
      );
      console.log(`[Whapi Success] Sent message to ${formattedPhone}:`, response.data);
      return { success: true, provider: 'Whapi.cloud', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[Whapi Error]:', JSON.stringify(errData, null, 2));
      return { success: false, provider: 'Whapi.cloud', error: errData };
    }
  }

  /**
   * Send Direct Plain Text Message via Green API (Zero Template Restrictions)
   */
  async _sendViaGreenApi(phone, text) {
    try {
      const formattedPhone = this._formatPhoneNumber(phone);
      const endpoint = `https://api.green-api.com/waInstance${this.greenApiId}/sendMessage/${this.greenApiToken}`;
      const response = await axios.post(
        endpoint,
        {
          chatId: `${formattedPhone}@c.us`,
          message: text
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        }
      );
      console.log(`[Green API Success] Sent message to ${formattedPhone}:`, response.data);
      return { success: true, provider: 'Green API', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[Green API Error]:', JSON.stringify(errData, null, 2));
      return { success: false, provider: 'Green API', error: errData };
    }
  }

  /**
   * Send Direct Plain Text Message via Evolution API (Self-Hosted Gateway)
   */
  async _sendViaEvolution(phone, text) {
    try {
      const formattedPhone = this._formatPhoneNumber(phone);
      const endpoint = `${this.evolutionUrl.replace(/\/$/, '')}/message/sendText/${this.evolutionInstance}`;
      const response = await axios.post(
        endpoint,
        {
          number: formattedPhone,
          textMessage: { text: text }
        },
        {
          headers: {
            apikey: this.evolutionKey,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );
      console.log(`[Evolution API Success] Sent message to ${formattedPhone}:`, response.data);
      return { success: true, provider: 'Evolution API', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[Evolution API Error]:', JSON.stringify(errData, null, 2));
      return { success: false, provider: 'Evolution API', error: errData };
    }
  }

  /**
   * Core method to send request to Meta Cloud API (Template based)
   */
  async _sendViaMeta(payload) {
    if (!this.isMetaConfigured) {
      return { success: false, error: 'Meta Cloud API access token or phone ID unconfigured' };
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.metaToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(`[Meta WhatsApp Success] Sent to ${payload.to}:`, response.data);
      return { success: true, provider: 'Meta Cloud API', data: response.data };
    } catch (error) {
      const errData = error.response?.data || error.message;
      console.error('[Meta WhatsApp Error - Check Template/Account Verification]:', JSON.stringify(errData, null, 2));
      return { success: false, provider: 'Meta Cloud API', error: errData };
    }
  }

  /**
   * Unified smart dispatcher that checks preferred provider and executes fallback logic
   */
  async _dispatchMessage({ phone, plainText, metaPayload }) {
    this._init();
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    // 1. Explicit Whapi Request or configured in auto mode
    if (this.provider === 'whapi' || (this.provider === 'auto' && this.isWhapiConfigured)) {
      const result = await this._sendViaWhapi(formattedPhone, plainText);
      if (result.success || this.provider === 'whapi') return result;
    }

    // 2. Explicit Green API Request or configured in auto mode
    if (this.provider === 'greenapi' || (this.provider === 'auto' && this.isGreenApiConfigured)) {
      const result = await this._sendViaGreenApi(formattedPhone, plainText);
      if (result.success || this.provider === 'greenapi') return result;
    }

    // 3. Explicit Evolution API Request or configured in auto mode
    if (this.provider === 'evolution' || (this.provider === 'auto' && this.isEvolutionConfigured)) {
      const result = await this._sendViaEvolution(formattedPhone, plainText);
      if (result.success || this.provider === 'evolution') return result;
    }

    // 4. Attempt Meta Cloud API (Official)
    if (this.provider === 'meta' || this.isMetaConfigured) {
      const result = await this._sendViaMeta(metaPayload);
      if (result.success || this.provider === 'meta') {
        // If Meta failed due to template/unverified business error in auto mode, fallback to console mock
        if (!result.success && this.provider === 'auto') {
          console.warn('[WhatsApp Notice] Meta delivery failed (likely unverified account or unapproved template). Logging mock message.');
        } else {
          return result;
        }
      }
    }

    // 5. Fallback Mock/Dev Mode (Enables non-blocking test workflows without app crashes)
    console.log('────────────────────────────────────────────────────');
    console.log('📱 WHATSAPP MESSAGING LOG (Mock / Fallback Mode)');
    console.log('To:      ', formattedPhone);
    console.log('Message: ', plainText);
    console.log('────────────────────────────────────────────────────');
    return { success: true, mock: true, provider: 'Mock Console', message: plainText };
  }

  async sendOTP(phone, code) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    const plainText = `Your Behold Aspire OTP Verification code is: ${code}. Please do not share this code with anyone.`;

    const metaPayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: this.otpTemplate,
        language: { code: 'en' }
      }
    };

    // Only attach dynamic body parameters if it's NOT the default 'hello_world' template.
    // Meta rejects the request if parameters are sent to a template that doesn't expect them.
    if (this.otpTemplate !== 'hello_world') {
      metaPayload.template.components = [
        {
          type: 'body',
          parameters: [{ type: 'text', text: code }]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: code }]
        }
      ];
    }

    return this._dispatchMessage({ phone, plainText, metaPayload });
  }

  async sendNotification(phone, message) {
    const formattedPhone = this._formatPhoneNumber(phone);
    if (!formattedPhone) return { success: false, error: 'Invalid phone number' };

    const plainText = String(message).substring(0, 4000);

    const metaPayload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: this.notifTemplate,
        language: { code: 'en' }
      }
    };

    if (this.notifTemplate !== 'hello_world') {
      metaPayload.template.components = [
        {
          type: 'body',
          parameters: [{ type: 'text', text: plainText.substring(0, 1024) }]
        }
      ];
    }

    return this._dispatchMessage({ phone, plainText, metaPayload });
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
        activeProvider: this.provider,
        whapi: { isConfigured: this.isWhapiConfigured },
        greenApi: { isConfigured: this.isGreenApiConfigured },
        evolutionApi: { isConfigured: this.isEvolutionConfigured },
        metaCloudApi: { isConfigured: this.isMetaConfigured }
      }
    };
  }
}

module.exports = new WhatsAppService();

