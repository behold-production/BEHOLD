/**
 * Meta (Facebook) Pixel Tracking Utility for BEHOLD Aspire
 * Pixel ID: 2080399902866260
 * 
 * Compliant with Meta Pixel Standard Events specification:
 * https://developers.facebook.com/docs/facebook-pixel/reference
 */

export const META_PIXEL_ID = '2080399902866260';

const UTM_STORAGE_KEY = 'behold_campaign_params';
const RECENT_EVENTS = new Map();
const DEDUPLICATION_WINDOW_MS = 3000;

/**
 * Generate a unique eventID or reuse existing one for Meta deduplication
 */
export const getEventId = (prefix = 'evt', customId = '') => {
  if (customId) return `${prefix}_${customId}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

/**
 * Check and record event to prevent duplicate execution (e.g. StrictMode double renders)
 */
const shouldSkipDuplicate = (eventKey) => {
  const now = Date.now();
  const lastTime = RECENT_EVENTS.get(eventKey);
  if (lastTime && (now - lastTime) < DEDUPLICATION_WINDOW_MS) {
    return true;
  }
  RECENT_EVENTS.set(eventKey, now);

  // Clean old entries
  if (RECENT_EVENTS.size > 100) {
    for (const [key, time] of RECENT_EVENTS.entries()) {
      if (now - time > 10000) RECENT_EVENTS.delete(key);
    }
  }
  return false;
};

/**
 * Safe invocation of window.fbq with deduplication support
 */
export const fbq = (action, eventName, payload = {}, options = {}) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

  try {
    const dedupeKey = options.eventID || `${action}_${eventName}_${payload.order_id || payload.content_name || payload.page_path || ''}`;
    if (shouldSkipDuplicate(dedupeKey)) {
      return;
    }

    if (options.eventID) {
      window.fbq(action, eventName, payload, { eventID: options.eventID });
    } else {
      window.fbq(action, eventName, payload);
    }

    // Dual tracking: Dispatch to backend endpoint for Meta CAPI & server-side logging
    if (action === 'track' && eventName !== 'PageView' && typeof window !== 'undefined') {
      try {
        const campaign = getStoredCampaignData();
        const serverPayload = JSON.stringify({
          eventName,
          eventId: options.eventID || dedupeKey,
          eventData: payload,
          customData: payload,
          utmSource: campaign.utm_source || '',
          utmMedium: campaign.utm_medium || '',
          utmCampaign: campaign.utm_campaign || '',
          utmContent: campaign.utm_content || '',
          utmTerm: campaign.utm_term || '',
          fbclid: campaign.fbclid || '',
          url: window.location.href,
          value: payload.value,
          currency: payload.currency || 'INR'
        });

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/meta-events', new Blob([serverPayload], { type: 'application/json' }));
        } else {
          fetch('/api/meta-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: serverPayload,
            keepalive: true
          }).catch(() => {});
        }
      } catch {}
    }
  } catch (err) {
    console.warn('[MetaPixel] Error tracking event:', err);
  }
};

/**
 * Capture and persist UTM and Facebook Click ID parameters from URL
 */
export const captureUtmParameters = () => {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    const captured = {};
    let hasCampaignData = false;

    campaignKeys.forEach((key) => {
      const val = urlParams.get(key);
      if (val) {
        captured[key] = val;
        hasCampaignData = true;
      }
    });

    if (hasCampaignData) {
      const payload = {
        ...captured,
        timestamp: new Date().toISOString(),
        landingPath: window.location.pathname
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
      return payload;
    }

    const stored = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Retrieve current active campaign parameters for lead/booking metadata
 */
export const getStoredCampaignData = () => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Update Advanced Matching user details (e.g. email, phone, name)
 */
export const setMetaUserData = (userData = {}) => {
  if (typeof window === 'undefined') return;
  const matchData = {};
  if (userData.em) matchData.em = String(userData.em).trim().toLowerCase();
  if (userData.email) matchData.em = String(userData.email).trim().toLowerCase();
  if (userData.ph) matchData.ph = String(userData.ph).replace(/\D/g, '');
  if (userData.phone) matchData.ph = String(userData.phone).replace(/\D/g, '');
  if (userData.fn) matchData.fn = String(userData.fn).trim().toLowerCase();
  if (userData.name) matchData.fn = String(userData.name).trim().toLowerCase();
  if (userData.external_id) matchData.external_id = String(userData.external_id);
  if (userData.id) matchData.external_id = String(userData.id);

  if (Object.keys(matchData).length > 0) {
    fbq('init', META_PIXEL_ID, matchData);
  }
};

/**
 * Track SPA PageView on route change
 */
export const trackPageView = (pagePath = window.location.pathname) => {
  fbq('track', 'PageView', {
    page_path: pagePath,
    page_title: document.title
  });
};

/**
 * Track Lead event (e.g. general inquiries, contact forms, aptitude submission)
 */
export const trackLead = (params = {}) => {
  const campaign = getStoredCampaignData();
  const eventID = params.eventID || getEventId('lead', params.content_name);
  fbq('track', 'Lead', {
    content_name: params.content_name || 'General Inquiry',
    content_category: params.content_category || 'Lead',
    value: params.value !== undefined ? Number(params.value) : 0.00,
    currency: params.currency || 'INR',
    utm_source: campaign.utm_source || undefined,
    utm_campaign: campaign.utm_campaign || undefined,
    ...params
  }, { eventID });
};

/**
 * Track InitiateCheckout event (when user starts booking / configuration)
 */
export const trackInitiateCheckout = (params = {}) => {
  const eventID = params.eventID || getEventId('init_checkout', `${params.service}_${params.mode}`);
  fbq('track', 'InitiateCheckout', {
    content_name: params.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring',
    content_category: params.mode || 'Online',
    num_items: 1,
    value: params.value !== undefined ? Number(params.value) : 0.00,
    currency: params.currency || 'INR',
    ...params
  }, { eventID });
};

/**
 * Track Purchase event (confirmed paid/zero-cost booking)
 */
export const trackPurchase = (params = {}) => {
  const campaign = getStoredCampaignData();
  const orderId = params.orderId || params.bookingId || '';
  const eventID = params.eventID || getEventId('purchase', orderId);
  fbq('track', 'Purchase', {
    content_type: 'appointment_booking',
    content_name: params.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring',
    order_id: orderId || undefined,
    value: Number(params.value || 0),
    currency: params.currency || 'INR',
    num_items: 1,
    utm_source: campaign.utm_source || undefined,
    utm_campaign: campaign.utm_campaign || undefined,
    ...params
  }, { eventID });
};

/**
 * Track Schedule event (booking confirmed / appointment scheduled)
 */
export const trackSchedule = (params = {}) => {
  const eventID = params.eventID || getEventId('schedule', `${params.advisorId}_${params.date}_${params.time}`);
  fbq('track', 'Schedule', {
    content_name: params.advisorName ? `Session with ${params.advisorName}` : 'Therapy / Mentoring Session',
    advisor_id: params.advisorId || undefined,
    date: params.date || undefined,
    time: params.time || undefined,
    mode: params.mode || 'Online',
    service: params.service || 'Counselling',
    ...params
  }, { eventID });
};

/**
 * Track CompleteRegistration event (OTP verification / profile completion)
 */
export const trackCompleteRegistration = (params = {}) => {
  const eventID = params.eventID || getEventId('reg', params.method);
  fbq('track', 'CompleteRegistration', {
    content_name: params.method || 'whatsapp_otp',
    status: 'completed',
    role: params.role || 'user',
    ...params
  }, { eventID });
};

/**
 * Track Contact event (WhatsApp button clicks, phone calls, contact inquiries)
 */
export const trackContact = (params = {}) => {
  fbq('track', 'Contact', {
    contact_method: params.method || 'whatsapp',
    source: params.source || 'website',
    ...params
  });
};

/**
 * Track ViewContent event (viewing advisor profile, services, blog post, c-dat)
 */
export const trackViewContent = (params = {}) => {
  fbq('track', 'ViewContent', {
    content_name: params.content_name || 'Behold Page',
    content_type: params.content_type || 'page',
    content_id: params.content_id || undefined,
    value: params.value !== undefined ? Number(params.value) : undefined,
    currency: params.currency || 'INR',
    ...params
  });
};

/**
 * Track Search event (e.g. blog or topic search)
 */
export const trackSearch = (params = {}) => {
  fbq('track', 'Search', {
    search_string: params.search_string || '',
    content_category: params.content_category || 'All',
    ...params
  });
};

/**
 * Track StartTrial event (sample aptitude test start)
 */
export const trackStartTrial = (params = {}) => {
  fbq('track', 'StartTrial', {
    content_name: params.test_type || 'C-DAT Sample Assessment',
    value: 0.00,
    currency: 'INR',
    ...params
  });
};

/**
 * Track SubmitApplication event (sample test result submission / registration)
 */
export const trackSubmitApplication = (params = {}) => {
  fbq('track', 'SubmitApplication', {
    content_name: 'C-DAT Aptitude Result Submission',
    dominant_domain: params.dominantDomain || undefined,
    ...params
  });
};

/**
 * Generic custom event tracker
 */
export const trackCustomEvent = (eventName, params = {}) => {
  fbq('trackCustom', eventName, params);
};

export default {
  META_PIXEL_ID,
  fbq,
  captureUtmParameters,
  getStoredCampaignData,
  setMetaUserData,
  trackPageView,
  trackLead,
  trackInitiateCheckout,
  trackPurchase,
  trackSchedule,
  trackCompleteRegistration,
  trackContact,
  trackViewContent,
  trackSearch,
  trackStartTrial,
  trackSubmitApplication,
  trackCustomEvent
};
