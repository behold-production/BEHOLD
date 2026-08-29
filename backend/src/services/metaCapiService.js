const crypto = require('crypto');
const https = require('https');

const PIXEL_ID = process.env.META_PIXEL_ID || '2080399902866260';

/**
 * SHA-256 Hashing for Meta Conversions API Normalization
 */
function hashData(input) {
  if (!input) return null;
  const clean = String(input).trim().toLowerCase();
  if (!clean) return null;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

function hashPhone(phone) {
  if (!phone) return null;
  // Strip all non-digit characters and prepend country code if 10 digits
  const clean = String(phone).replace(/\D/g, '');
  if (!clean) return null;
  const normalized = clean.length === 10 ? '91' + clean : clean;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Dispatch server-side event to Meta Conversions API (CAPI)
 */
async function sendToMetaCapi(payload) {
  const token = process.env.META_CAPI_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;
  if (!token) {
    return { success: false, status: 'NO_TOKEN_CONFIGURED', message: 'Meta CAPI Access Token not set in environment' };
  }

  const endpoint = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${token}`;

  return new Promise((resolve) => {
    try {
      const dataString = JSON.stringify(payload);
      const url = new URL(endpoint);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        },
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, status: 'DISPATCHED', data: parsed });
            } else {
              resolve({ success: false, status: 'META_ERROR', error: parsed });
            }
          } catch {
            resolve({ success: false, status: 'PARSE_ERROR', raw: body });
          }
        });
      });

      req.on('error', (err) => {
        resolve({ success: false, status: 'NETWORK_ERROR', error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, status: 'TIMEOUT', message: 'Meta CAPI request timed out' });
      });

      req.write(dataString);
      req.end();
    } catch (err) {
      resolve({ success: false, status: 'EXCEPTION', error: err.message });
    }
  });
}

const MetaCapiService = {
  PIXEL_ID,
  hashData,
  hashPhone,

  /**
   * Format and send event to Meta Conversions API
   */
  async trackServerEvent({
    eventName,
    eventId,
    eventTime,
    url,
    ip,
    userAgent,
    email,
    phone,
    userId,
    fbclid,
    fbp,
    fbc,
    value,
    currency = 'INR',
    customData = {}
  }) {
    const userData = {};

    if (email) {
      const hashedEm = hashData(email);
      if (hashedEm) userData.em = [hashedEm];
    }

    if (phone) {
      const hashedPh = hashPhone(phone);
      if (hashedPh) userData.ph = [hashedPh];
    }

    if (userId) {
      const hashedExt = hashData(userId);
      if (hashedExt) userData.external_id = [hashedExt];
    }

    if (ip) userData.client_ip_address = ip;
    if (userAgent) userData.client_user_agent = userAgent;
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;
    else if (fbclid) userData.fbc = `fb.1.${Date.now()}.${fbclid}`;

    const formattedCustomData = {
      currency: currency || 'INR',
      value: value !== undefined ? Number(value) : 0,
      ...customData
    };

    const eventPayload = {
      data: [
        {
          event_name: eventName || 'PageView',
          event_time: eventTime || Math.floor(Date.now() / 1000),
          event_source_url: url || 'https://www.behold.co.in',
          event_id: eventId || undefined,
          action_source: 'website',
          user_data: userData,
          custom_data: formattedCustomData
        }
      ]
    };

    const result = await sendToMetaCapi(eventPayload);
    return { payload: eventPayload, result };
  }
};

module.exports = MetaCapiService;
