const axios = require('axios');
const { normalizePhoneWithCountryCode, cleanUserName } = require('../utils/phoneUtils');

/**
 * BEHOLD. — WhatsApp Notification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider: WASenderAPI (wasenderapi.com)
 * All messages are sent as plain text with WhatsApp bold/formatting (*bold*, _italic_).
 *
 * Required .env:
 *   WASENDER_TOKEN — Session-specific API key from wasenderapi.com
 *                    Dashboard → WhatsApp Sessions → your session → 🔑 key icon
 *
 * The token is never defaulted in code: without it the service reports a
 * configuration failure so callers can tell the user the truth instead of
 * claiming a message was delivered.
 * ─────────────────────────────────────────────────────────────────────────────
 */

class WhatsAppService {
  constructor() {
    this._recentSends = new Map();
    this._warmedContacts = new Map(); // canonical phone -> last on-whatsapp check
    this._sendQueue = Promise.resolve();
    this._lastSendTime = 0;
    this._init();
  }

  _init() {
    this.waSenderToken = (process.env.WASENDER_TOKEN || '').trim();
    this.isWaSenderConfigured = Boolean(this.waSenderToken);
  }

  /**
   * Check and record outgoing message to prevent duplicate sends within cooldown window
   */
  /**
   * Check and record outgoing message to prevent duplicate sends within cooldown window
   */
  _isDuplicateSend(phone, text, windowMs = 30000) {
    if (!phone || !text) return false;
    const now = Date.now();
    // Clean old entries (> 2 minutes)
    for (const [k, timestamp] of this._recentSends.entries()) {
      if (now - timestamp > 120000) {
        this._recentSends.delete(k);
      }
    }
    const cleanPhone = String(phone).replace(/\D/g, '');
    const textSnippet = String(text).trim().substring(0, 100);
    const key = `${cleanPhone}_${textSnippet}`;

    const lastSent = this._recentSends.get(key);
    if (lastSent && (now - lastSent) < windowMs) {
      return true;
    }

    this._recentSends.set(key, now);
    return false;
  }

  /**
   * Normalize phone to canonical format "+918075374600"
   */
  _formatPhoneNumber(phone) {
    if (!phone) return null;
    const formatted = normalizePhoneWithCountryCode(phone);
    return formatted || null;
  }

  /** Is there enough room left before the deadline to sit out for `ms`? */
  _canWait(deadlineMs, ms) {
    return Date.now() + ms < deadlineMs;
  }

  /**
   * Resolve the recipient against WhatsApp once per number before sending.
   *
   * WASender runs on a linked WhatsApp Web client, and the very first message
   * to a number with no existing chat is rejected or dropped ("The provided
   * JID does not exist on WhatsApp") even though every later send succeeds —
   * which is exactly why OTPs historically only arrived on resend (the dropped
   * first attempt had registered the contact by then). This check makes the
   * session resolve the JID, so the first code actually lands.
   *
   * Returns true/false when the provider gave a definitive answer, or null
   * when the check was skipped or failed — callers must still send on null.
   */
  async _ensureContactWarm(phoneWithPlus, deadlineMs) {
    const key = String(phoneWithPlus || '').replace(/\D/g, '');
    if (!key) return null;
    const cached = this._warmedContacts.get(key);
    if (cached && Date.now() - cached.ts < 10 * 60 * 1000) return cached.exists;
    if (!this._canWait(deadlineMs, 3000)) return null; // no budget left — send anyway

    // Keep the map from growing unbounded on long-lived instances.
    if (this._warmedContacts.size > 500) {
      const cutoff = Date.now() - 10 * 60 * 1000;
      for (const [k, entry] of this._warmedContacts.entries()) {
        if (entry.ts < cutoff) this._warmedContacts.delete(k);
      }
    }

    try {
      const res = await axios.get(`https://wasenderapi.com/api/on-whatsapp/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.waSenderToken}` },
        timeout: Math.max(1500, Math.min(3500, deadlineMs - Date.now()))
      });
      const exists = res.data?.data?.exists !== undefined ? Boolean(res.data.data.exists) : null;
      if (exists !== false) this._warmedContacts.set(key, { ts: Date.now(), exists });
      return exists;
    } catch (e) {
      // A 4xx/5xx here still forces the client-side JID resolution, and a
      // timeout costs the provider-side check nothing — never block the send.
      console.warn(`[WhatsApp] Contact warm-up for ${key} inconclusive (${e?.message || 'error'}) — sending anyway.`);
      return null;
    }
  }

  /**
   * Seconds to wait before the next attempt. Honours the provider's retry_after
   * hint but never sleeps past the caller's deadline. 6.5s is the floor because
   * WASender's account protection blocks anything under 5s.
   */
  _retryWaitSeconds(deadlineMs, retryAfterSec = 0) {
    const requested = Math.max(Number(retryAfterSec) + 1, 6.5);
    if (!Number.isFinite(deadlineMs)) return requested;
    return Math.min(requested, Math.max(0, (deadlineMs - Date.now()) / 1000));
  }

  /**
   * Low-level send via WASender API with automatic rate-limit handling & retries.
   *
   * `deadlineMs` is an absolute timestamp: retries only happen while there is
   * still time left, so a caller waiting on this promise (an HTTP request inside
   * a 30s serverless function, for example) is never held open indefinitely.
   */
  async _sendViaWaSender(phone, text, { attempt = 1, maxAttempts = 3, deadlineMs = Infinity } = {}) {
    const formattedPhoneWithPlus = this._formatPhoneNumber(phone);
    if (!formattedPhoneWithPlus) {
      return { success: false, provider: 'WASender', error: 'Invalid phone number' };
    }

    if (Date.now() > deadlineMs) {
      return { success: false, provider: 'WASender', error: 'Send deadline exceeded before dispatch' };
    }

    const cleanedPhoneWithoutPlus = formattedPhoneWithPlus.replace(/^\+/, '');

    // Register the contact/chat with the session before the first send —
    // without this, the very first OTP to a new number is rejected by the
    // WhatsApp Web client (see _ensureContactWarm).
    const onWhatsApp = await this._ensureContactWarm(formattedPhoneWithPlus, deadlineMs);
    if (onWhatsApp === false) {
      return {
        success: false,
        provider: 'WASender',
        notOnWhatsApp: true,
        error: { message: 'This number is not registered on WhatsApp' }
      };
    }

    // Primary WASender payload with +91 format: { to: "+919876543210", text: "..." }
    const primaryPayload = {
      to: formattedPhoneWithPlus,
      text: text
    };

    // Never let the socket outlive the caller's deadline.
    const httpTimeout = Number.isFinite(deadlineMs)
      ? Math.max(2000, Math.min(25000, deadlineMs - Date.now()))
      : 25000;

    try {
      const response = await axios.post(
        'https://wasenderapi.com/api/send-message',
        primaryPayload,
        {
          headers: {
            Authorization: `Bearer ${this.waSenderToken}`,
            'Content-Type': 'application/json'
          },
          timeout: httpTimeout
        }
      );
      // The provider can answer HTTP 200 with { success: false } — never
      // report those as delivered or the UI lies to the user.
      if (response.data && response.data.success === false) {
        const bizMsg = String(response.data.message || 'provider rejected send');
        console.error(`[WhatsApp] ⚠️ Provider reported success:false for ${formattedPhoneWithPlus}: ${bizMsg}`);
        return { success: false, provider: 'WASender', error: response.data };
      }
      console.log(`[WhatsApp] ✅ Sent to ${formattedPhoneWithPlus}:`, response.data?.data || response.data?.message || 'OK');
      return { success: true, provider: 'WASender', data: response.data };
    } catch (error) {
      const errData = error.response?.data || {};
      const errMsg = String(errData.message || error.message || errData.error || '').toLowerCase();
      const status = error.response?.status;
      const retryAfter = Number(errData.retry_after) || 0;

      const isAccountProtection = status === 400 || status === 429 || retryAfter > 0 ||
        errMsg.includes('5 second') || errMsg.includes('account protection') ||
        errMsg.includes('rate limit') || errMsg.includes('too many');

      // "JID does not exist" on a brand-new number: the contact registration
      // raced the send. Re-warm and retry — but the provider counts every
      // attempt against its 5s account-protection window, so the gap must be
      // at least as long as a rate-limit retry or the second try bounces too.
      const isChatMiss = status === 422 &&
        (errMsg.includes('jid') || errMsg.includes('chat') || errMsg.includes('does not exist') || errMsg.includes('not exist'));

      if (isChatMiss && attempt < maxAttempts && this._canWait(deadlineMs, 7000)) {
        this._warmedContacts.delete(cleanedPhoneWithoutPlus);
        console.warn(`[WhatsApp] Chat miss for ${formattedPhoneWithPlus} — re-warming contact and retrying (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, 6500));
        return this._sendViaWaSender(phone, text, { attempt: attempt + 1, maxAttempts, deadlineMs });
      }

      if (isAccountProtection && attempt < maxAttempts && this._canWait(deadlineMs, 6500)) {
        const waitSeconds = this._retryWaitSeconds(deadlineMs, retryAfter);
        console.warn(`[WhatsApp Rate Protection] ⏳ WASender Account Protection active. Auto-waiting ${waitSeconds}s before retry (Attempt ${attempt}/${maxAttempts})...`);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        return this._sendViaWaSender(phone, text, { attempt: attempt + 1, maxAttempts, deadlineMs });
      }

      console.error(`[WhatsApp] ⚠️ Initial payload failed for ${formattedPhoneWithPlus}:`, JSON.stringify(errData));

      // Secondary fallback with clean 91... (without +)
      try {
        const response2 = await axios.post(
          'https://wasenderapi.com/api/send-message',
          { to: cleanedPhoneWithoutPlus, text },
          {
            headers: {
              Authorization: `Bearer ${this.waSenderToken}`,
              'Content-Type': 'application/json'
            },
            timeout: Number.isFinite(deadlineMs) ? Math.max(2000, Math.min(20000, deadlineMs - Date.now())) : 20000
          }
        );
        if (response2.data && response2.data.success === false) {
          console.error(`[WhatsApp] ⚠️ Fallback reported success:false for ${cleanedPhoneWithoutPlus}:`, response2.data.message || '');
          return { success: false, provider: 'WASender', error: response2.data };
        }
        console.log(`[WhatsApp] ✅ Fallback sent to ${cleanedPhoneWithoutPlus}:`, response2.data?.data || response2.data?.message || 'OK');
        return { success: true, provider: 'WASender', data: response2.data };
      } catch (retryErr) {
        const retryErrData = retryErr.response?.data || {};
        const retryErrMsg = String(retryErrData.message || retryErr.message || '').toLowerCase();
        const retryWaitSec = Number(retryErrData.retry_after) || 0;
        const retryStatus = retryErr.response?.status;

        const isRetryAccountProtection = retryStatus === 400 || retryStatus === 429 || retryWaitSec > 0 ||
          retryErrMsg.includes('5 second') || retryErrMsg.includes('account protection') ||
          retryErrMsg.includes('rate limit');

        if (isRetryAccountProtection && attempt < maxAttempts && this._canWait(deadlineMs, 6500)) {
          const waitSec = this._retryWaitSeconds(deadlineMs, retryWaitSec);
          console.warn(`[WhatsApp Rate Protection] ⏳ Secondary attempt triggered Account Protection. Auto-waiting ${waitSec}s...`);
          await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
          return this._sendViaWaSender(phone, text, { attempt: attempt + 1, maxAttempts, deadlineMs });
        }
        console.error(`[WhatsApp] ❌ Both attempts failed for ${phone}:`, retryErr.response?.data || retryErr.message);
      }

      if (errData.message === 'invalid API key') {
        console.error(
          '[WhatsApp] HINT: WASENDER_TOKEN is invalid or expired.\n' +
          '  → Log in to https://www.wasenderapi.com\n' +
          '  → Copy the session-specific API key and update WASENDER_TOKEN in .env'
        );
      }
      return { success: false, provider: 'WASender', error: errData };
    }
  }

  /**
   * Core dispatcher — sends via WASender or falls back to console mock
   * Uses sequential queue throttling (6s gap) to prevent Account Protection rate limits
   */
  async _dispatch(phone, text, { skipDeduplication = false, bypassQueue = false, maxAttempts = 3, deadlineMs = Infinity } = {}) {
    this._init(); // re-read env each time so .env changes take effect without restart
    if (!phone) return { success: false, error: 'Phone number is required' };

    const truncated = String(text).substring(0, 4096); // WhatsApp limit

    // Prevent duplicate messages sent within window
    if (!skipDeduplication && this._isDuplicateSend(phone, truncated)) {
      console.log(`[WhatsApp Deduplicator] 🛡️ Suppressed duplicate message send to ${phone}`);
      return { success: true, deduped: true, provider: 'WASender (Deduped)' };
    }

    if (this.isWaSenderConfigured) {
      if (bypassQueue) {
        console.log(`[WhatsApp] 🚀 Bypassing queue for high-priority message to ${phone}...`);
        try {
          const result = await this._sendViaWaSender(phone, truncated, { maxAttempts, deadlineMs });
          this._lastSendTime = Date.now(); // Reset timer so regular messages wait
          return result;
        } catch (e) {
          this._lastSendTime = Date.now();
          throw e;
        }
      }

      // Chain message dispatch onto sequential queue ensuring a minimum 6.0s gap between consecutive sends
      const sendTask = this._sendQueue.then(async () => {
        const now = Date.now();
        const minGap = 6000; // WASender requires >5s between messages
        const timeSinceLastSend = now - this._lastSendTime;
        if (this._lastSendTime > 0 && timeSinceLastSend < minGap) {
          const waitMs = minGap - timeSinceLastSend;
          console.log(`[WhatsApp Throttle] ⏳ Spacing message to ${phone} by ${waitMs}ms to respect provider rate limit...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
        try {
          const result = await this._sendViaWaSender(phone, truncated, { maxAttempts, deadlineMs });
          this._lastSendTime = Date.now();
          return result;
        } catch (e) {
          this._lastSendTime = Date.now();
          throw e;
        }
      });

      // Keep chain advancing even if this specific send errors
      this._sendQueue = sendTask.catch(() => {});
      return sendTask;
    }

    // No token configured: in production this used to fall through to the mock
    // branch and report success, so users were told an OTP had been sent when it
    // never left the server.
    if (process.env.NODE_ENV === 'production') {
      console.error('[WhatsApp] WASENDER_TOKEN is not configured — message to', this._formatPhoneNumber(phone) || phone, 'was NOT sent.');
      return { success: false, notConfigured: true, provider: 'WASender', error: 'WhatsApp provider not configured' };
    }

    // Dev/Mock mode — print to console so devs can see messages without real sends
    const formatted = this._formatPhoneNumber(phone) || phone;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 WHATSAPP MOCK (no WASENDER_TOKEN configured)');
    console.log(`To:  ${formatted}`);
    console.log(`Msg: ${truncated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: true, mock: true, provider: 'Mock Console' };
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * OTP Verification — sent when a user logs in or registers over WhatsApp.
   *
   * Callers await this inside an HTTP request, so it runs against a deadline:
   * an OTP that keeps retrying until the platform kills the function is worse
   * than one that fails fast and lets the user ask for a fresh code.
   * The budget covers contact warm-up (~3.5s) + send + one spaced retry.
   */
  async sendOTP(phone, code, { deadlineMs = 16000 } = {}) {
    const text =
      `*BEHOLD. — Verification Code*\n\n` +
      `Your 6-digit code is:\n\n` +
      `*${code}*\n\n` +
      `It expires in 5 minutes.\n` +
      `Never share this code with anyone — not even BEHOLD. staff.`;
    return this._dispatch(phone, text, {
      skipDeduplication: true,
      bypassQueue: true,
      maxAttempts: 2,
      deadlineMs: Date.now() + deadlineMs
    });
  }

  /**
   * Password reset code — same urgent treatment as the login OTP.
   */
  async sendPasswordResetOtp(phone, code, { minutes = 10, deadlineMs = 16000 } = {}) {
    const text =
      `*BEHOLD. — Password Reset Code*\n\n` +
      `Your 6-digit verification code is:\n\n` +
      `*${code}*\n\n` +
      `This code is valid for ${minutes} minutes. Do not share it with anyone.`;
    return this._dispatch(phone, text, {
      skipDeduplication: true,
      bypassQueue: true,
      maxAttempts: 2,
      deadlineMs: Date.now() + deadlineMs
    });
  }

  /**
   * Generic plain notification
   */
  async sendNotification(phone, message) {
    return this._dispatch(phone, message);
  }

  /**
   * Session booking alerts — 7 User-Only WhatsApp Templates
   * @param {string} phone
   * @param {'approved'|'created'|'cancelled'|'psychologist_cancelled'|'rejected'|'rescheduled'|'reminder_24h'|'reminder_1h'|'reminder'|'completed'} action
   * @param {object} details
   */
  async sendBookingAlert(phone, action, details = {}) {
    const {
      studentName    = '',
      counsellorName = 'Psychologist',
      date           = 'N/A',
      time           = 'N/A',
      mode           = 'ONLINE',
      duration       = '1 Hour (60 Mins)',
      bookingId      = '',
      reason         = '',
      meetLink       = '',
      oldDate        = '',
      oldTime        = ''
    } = details;

    const isOnline = !mode || mode === 'ONLINE';
    const modeLabel = mode === 'ONLINE' ? 'Online Google Meet Consultation' : mode === 'OFFLINE' ? 'In-Person Consultation' : mode === 'DOOR_STEP' ? 'Doorstep Visit Consultation' : (mode || 'Online');
    const bookingUrl = 'https://www.behold.co.in/profile?tab=booked';
    const catalogUrl = 'https://www.behold.co.in/advisors';
    const { buildDirectRoomUrl } = require('../utils/calendarHelper');
    const canonicalRoomUrl = bookingId ? buildDirectRoomUrl(bookingId) : '';
    const finalMeetLink = (isOnline && meetLink && meetLink.startsWith('https://')) ? meetLink : (isOnline ? (canonicalRoomUrl || bookingUrl) : '');

    const cleanStudentName = cleanUserName(studentName);
    const greeting = cleanStudentName ? `Hi *${cleanStudentName}* 👋` : `Hi there 👋`;
    const formalGreeting = cleanStudentName ? `Hi *${cleanStudentName}*,` : `Hi there,`;

    let text = '';

    switch (action) {

      // 1. Booking Confirmed
      case 'approved':
      case 'created':
      case 'confirmed':
      case 'booking_confirmed':
        text =
          `*Session Confirmed — BEHOLD.*\n\n` +
          `${greeting}\n\n` +
          `Great news! Your counselling session has been successfully confirmed.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          (isOnline
            ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\nTap the link above to join your Google Meet video consultation directly from your phone or PC.\n\n`
            : `📍 Please be ready at your scheduled time and location.\n\n`) +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `Thank you for choosing BEHOLD.. We look forward to supporting you.`;
        break;

      // 2. Booking Cancelled
      case 'cancelled':
      case 'booking_cancelled':
        text =
          `*Session Cancelled — BEHOLD.*\n\n` +
          `${formalGreeting}\n\n` +
          `Your counselling session has been cancelled.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          (bookingId ? `• *Booking ID:* ${bookingId}\n` : '') +
          `\n*Cancellation Reason:* ${reason || 'Cancelled upon request'}\n\n` +
          `If you would like to book another session, you can choose a new available appointment.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `If you have any questions, please contact BEHOLD. Support.`;
        break;

      // 3. Psychologist Cancelled
      case 'psychologist_cancelled':
      case 'rejected':
        text =
          `*Session Update — BEHOLD.*\n\n` +
          `${formalGreeting}\n\n` +
          `We’re sorry to inform you that your counselling session with *${counsellorName}* scheduled for *${date}* at *${time}* has been cancelled by the psychologist.\n\n` +
          `You can choose another available psychologist or select a different appointment time.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `We apologize for the inconvenience and appreciate your understanding.\n\n` +
          `BEHOLD. Support Team`;
        break;

      // 4. Session Rescheduled
      case 'rescheduled':
      case 'session_rescheduled':
        text =
          `*Session Rescheduled — BEHOLD.*\n\n` +
          `${formalGreeting}\n\n` +
          `Your counselling session has been successfully rescheduled.\n\n` +
          `*Psychologist:* ${counsellorName}\n\n` +
          `*Previous Schedule*\n` +
          `• ${oldDate || 'Previous Date'}\n` +
          `• ${oldTime || 'Previous Time'}\n\n` +
          `*New Schedule*\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          (isOnline && finalMeetLink ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\n` : '') +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `Please make sure you are available at the new scheduled time.`;
        break;

      // 5. 24-Hour Reminder
      case 'reminder_24h':
      case 'reminder_24_hour':
        text =
          `*Reminder: Your Session Is Tomorrow — BEHOLD.*\n\n` +
          `${greeting}\n\n` +
          `This is a friendly reminder about your counselling session tomorrow.\n\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          (isOnline && finalMeetLink ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\n` : '') +
          `Please be ready a few minutes before your scheduled time.\n\n` +
          `📋 *View Booking:* ${bookingUrl}\n\n` +
          `See you soon!`;
        break;

      // 6. 1-Hour Reminder
      case 'reminder_1h':
      case 'reminder_1_hour':
      case 'reminder':
        text =
          `*Your Session Starts Soon — BEHOLD.*\n\n` +
          `${greeting}\n\n` +
          `Your counselling session with *${counsellorName}* starts in approximately 1 hour.\n\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n` +
          `• *Mode:* ${modeLabel}\n\n` +
          (isOnline && finalMeetLink ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\n` : '') +
          `Please join a few minutes early and make sure you have a quiet and private space for your session.\n\n` +
          `BEHOLD.`;
        break;

      // 7. Session Completed
      case 'completed':
      case 'session_completed':
        text =
          `*Session Completed — BEHOLD.*\n\n` +
          `${formalGreeting}\n\n` +
          `Your counselling session with *${counsellorName}* has been completed successfully.\n\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n` +
          `• *Duration:* ${duration}\n\n` +
          `We hope the session was helpful and supportive. Your wellbeing matters to us. 💙\n\n` +
          `⭐ *Share Your Experience* — Your feedback helps future students find the right support.\n` +
          `👉 Leave a Review: ${bookingUrl}\n\n` +
          `If you'd like to continue your counselling journey, you can book another session at your convenience.\n\n` +
          `📅 *Book Another Session:* ${catalogUrl}\n\n` +
          `Thank you for choosing BEHOLD..`;
        break;

      default:
        text =
          `*BEHOLD. — Session Update*\n\n` +
          `${formalGreeting}\n` +
          `• *Psychologist:* ${counsellorName}\n` +
          `• *Date:* ${date}\n` +
          `• *Time:* ${time}\n\n` +
          `📋 *View Booking:* ${bookingUrl}`;
    }

    return this._dispatch(phone, text);
  }

  // ── Convenience Helpers ──────────────────────────────────────────────────
  async sendBookingConfirmed(phone, details) {
    return this.sendBookingAlert(phone, 'approved', details);
  }

  async sendBookingCancelled(phone, details) {
    return this.sendBookingAlert(phone, 'cancelled', details);
  }

  async sendPsychologistCancelled(phone, details) {
    return this.sendBookingAlert(phone, 'psychologist_cancelled', details);
  }

  async sendSessionRescheduled(phone, details) {
    return this.sendBookingAlert(phone, 'rescheduled', details);
  }

  async send24HourReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_24h', details);
  }

  async send1HourReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_1h', details);
  }

  async sendSessionCompleted(phone, details) {
    return this.sendBookingAlert(phone, 'completed', details);
  }

  async sendDayOfReminder(phone, details) {
    return this.sendBookingAlert(phone, 'reminder_1h', details);
  }

  async sendWorksheetNotification(phone, details) {
    const { clientName, secureLink } = details;
    const text = 
      `Hi ${clientName},\n\n` +
      `Your BEHOLD activity sheet is ready.\n\n` +
      `You can access it securely here:\n\n` +
      `${secureLink}\n\n` +
      `Thank you,\nBEHOLD`;
    return this._dispatch(phone, text);
  }

  /**
   * Notify a psychologist when a new booking is confirmed
   */
  async sendCounsellorBookingAlert(phone, action, details = {}) {
    const {
      studentName    = 'A client',
      counsellorName = 'Psychologist',
      date           = 'N/A',
      time           = 'N/A',
      mode           = 'ONLINE',
      duration       = '1 Hour (60 Mins)',
      bookingId      = '',
      meetLink       = ''
    } = details;

    const isOnline = !mode || mode === 'ONLINE';
    const modeLabel = mode === 'ONLINE' ? 'Online Google Meet Consultation' : mode === 'OFFLINE' ? 'In-Person Consultation' : mode === 'DOOR_STEP' ? 'Doorstep Visit Consultation' : (mode || 'Online');
    const profileUrl = 'https://www.behold.co.in/counsellor';
    const cleanStudentName = cleanUserName(studentName) || 'A student';
    const { buildDirectRoomUrl } = require('../utils/calendarHelper');
    const canonicalRoomUrl = bookingId ? buildDirectRoomUrl(bookingId) : '';
    const finalMeetLink = (isOnline && meetLink && meetLink.startsWith('https://')) ? meetLink : (isOnline ? canonicalRoomUrl : '');

    let text = '';
    
    if (action === 'approved' || action === 'created' || action === 'confirmed') {
      text = 
        `*New Session Booking Alert — BEHOLD.*\n\n` +
        `Hi *${counsellorName}*,\n\n` +
        `You have a new session booking confirmed.\n\n` +
        `• *Client/Student:* ${cleanStudentName}\n` +
        `• *Date:* ${date}\n` +
        `• *Time:* ${time}\n` +
        `• *Duration:* ${duration}\n` +
        `• *Mode:* ${modeLabel}\n\n` +
        (isOnline && finalMeetLink ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\nTap the link above to join the Google Meet video consultation with the student.\n\n` : '') +
        `Please log in to your dashboard to view full client intake details and manage your sessions.\n\n` +
        `📊 *Dashboard:* ${profileUrl}\n\n` +
        `BEHOLD. Support Team`;
    } else if (action === 'cancelled' || action === 'booking_cancelled') {
      text =
        `*Booking Cancelled — BEHOLD.*\n\n` +
        `Hi *${counsellorName}*,\n\n` +
        `A booking with your client *${cleanStudentName}* has been cancelled.\n\n` +
        `• *Date:* ${date}\n` +
        `• *Time:* ${time}\n\n` +
        `Please check your dashboard for any updates.\n\n` +
        `BEHOLD. Support Team`;
    } else if (action === 'rescheduled' || action === 'session_rescheduled') {
      text =
        `*Session Rescheduled — BEHOLD.*\n\n` +
        `Hi *${counsellorName}*,\n\n` +
        `A session with your client *${cleanStudentName}* has been rescheduled to a new time.\n\n` +
        `• *New Date:* ${date}\n` +
        `• *New Time:* ${time}\n\n` +
        (isOnline && finalMeetLink ? `🔗 *Google Meet Link:* ${finalMeetLink}\n\n` : '') +
        `Please log in to your dashboard to review the updated schedule.\n\n` +
        `📊 *Dashboard:* ${profileUrl}\n\n` +
        `BEHOLD. Support Team`;
    }

    if (!text) return { success: false, message: 'Invalid action' };
    return this._dispatch(phone, text);
  }

  /**
   * Notify a psychologist when a client submits a star rating / review
   */
  async sendFeedbackReceived(phone, details = {}) {
    const {
      counsellorName = 'Psychologist',
      studentName    = '',
      rating         = 5,
      comment        = ''
    } = details;

    const cleanStudentName = cleanUserName(studentName) || 'A client';
    const stars = '⭐'.repeat(Math.max(1, Math.min(5, Number(rating))));
    const profileUrl = 'https://www.behold.co.in/counsellor';

    const text =
      `*New Client Review — BEHOLD.*\n\n` +
      `Hi *${counsellorName}*,\n\n` +
      `Great news! *${cleanStudentName}* just left you a review.\n\n` +
      `${stars} *${rating}/5 Stars*\n` +
      (comment ? `_"${comment}"_\n\n` : '\n') +
      `This review has been recorded and will be reflected in your public rating.\n\n` +
      `📊 *View Your Dashboard:* ${profileUrl}\n\n` +
      `Thank you for your dedication to supporting students. 💙\n\n` +
      `BEHOLD. Support Team`;

    return this._dispatch(phone, text);
  }

  /**
   * Provider status check
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
