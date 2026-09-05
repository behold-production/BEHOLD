const nodemailer = require('nodemailer');
const ics = require('ics');
const { resolveAnyPhone } = require('../utils/phoneUtils');

/**
 * BEHOLD. — Email Service
 * Primary provider: Resend SDK (resend.com)
 * Fallback: Nodemailer (Brevo, custom SMTP, Gmail)
 *
 * Required .env variables:
 *   RESEND_API_KEY      — Resend API key (re_...)
 *   RESEND_FROM_EMAIL   — Verified sender email (e.g. beholdoffice@behold.co.in)
 *   EMAIL_FROM_NAME     — Display name (default: "BEHOLD.")
 */

let _resendClient = null;
let _nodemailerTransporter = null;
let _etherealTransporter = null;

function _getFromEmail() {
  const resendFrom = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (resendFrom && !resendFrom.endsWith('@gmail.com') && !resendFrom.includes('resend.dev')) {
    return resendFrom;
  }
  const rawFrom = (process.env.GMAIL_USER || process.env.SMTP_USER || 'beholdoffice@gmail.com').trim();
  return (rawFrom.includes('flutterclt') || !rawFrom.includes('@')) ? 'beholdoffice@gmail.com' : rawFrom;
}

function _getResendClient() {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  if (!apiKey) return null;
  if (_resendClient) return _resendClient;
  const { Resend } = require('resend');
  _resendClient = new Resend(apiKey);
  console.log('[EmailService] ✅ Using Resend SDK (from: ' + _getFromEmail() + ')');
  return _resendClient;
}

function _getNodemailerTransporter() {
  if (_nodemailerTransporter) return _nodemailerTransporter;

  // 1. Brevo (Sendinblue)
  const brevoKey = (process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || '').trim();
  if (brevoKey) {
    const brevoUser = (process.env.BREVO_USER || process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim();
    _nodemailerTransporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: { user: brevoUser, pass: brevoKey }
    });
    console.log('[EmailService] ✅ Using Brevo SMTP provider');
    return _nodemailerTransporter;
  }

  // 2. Custom Generic SMTP
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    _nodemailerTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });
    console.log('[EmailService] ✅ Using custom SMTP provider');
    return _nodemailerTransporter;
  }

  // 3. Gmail SMTP
  const gmailUser = (process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (gmailUser && gmailPass && !gmailUser.includes('your_gmail')) {
    _nodemailerTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
    console.log('[EmailService] ✅ Using Gmail SMTP provider (' + gmailUser + ')');
    return _nodemailerTransporter;
  }

  console.warn('[EmailService] ⚠️  No email credentials configured — emails will not be sent');
  return null;
}

async function _getEtherealTransporter() {
  if (_etherealTransporter) return _etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    _etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    return _etherealTransporter;
  } catch (err) {
    console.error('[EmailService] Failed to create Ethereal test account:', err.message);
    return null;
  }
}

// Helper to strip HTML tags for plain-text fallback
const htmlToText = (htmlStr) => {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Core send function — tries Resend SDK first, falls back to Nodemailer.
 * @param {string} to — recipient email address
 * @param {string} subject — email subject line
 * @param {string} html — complete HTML body
 * @param {Array}  attachments — array of nodemailer/resend attachment objects
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  if (!to) {
    console.warn('[Email] ⚠️  Skipped — no recipient email address provided');
    return { success: false, error: 'No recipient address provided' };
  }

  if (!to || typeof to !== 'string' || to.includes('@temp.behold')) {
    console.log(`[Email] ℹ️ Skipped sending email to synthetic placeholder address: ${to}`);
    return { success: true, skipped: true };
  }

  const fromName = (process.env.EMAIL_FROM_NAME || 'BEHOLD.').trim();
  const fromEmail = _getFromEmail();
  const from = `${fromName} <${fromEmail}>`;

  console.log(`[Email] 📤 Sending to: ${to} | Subject: "${subject}"`);

  // ── 1. Resend SDK (primary if verified custom domain is set) ───────────────
  const resendFromEmail = (process.env.RESEND_FROM_EMAIL || '').trim();
  const isResendConfigured = Boolean(process.env.RESEND_API_KEY);
  const isCustomResendDomain = isResendConfigured && resendFromEmail && !resendFromEmail.endsWith('@gmail.com') && !resendFromEmail.includes('resend.dev');

  if (isCustomResendDomain) {
    const resend = _getResendClient();
    if (resend) {
      try {
        const fromStr = `${fromName} <${resendFromEmail}>`;
        const resendAttachments = attachments.map(a => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content
        })).filter(a => a.content);

        const { data, error } = await resend.emails.send({
          from: fromStr,
          to: Array.isArray(to) ? to : [to],
          replyTo: (process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim(),
          subject,
          html,
          text: htmlToText(html),
          attachments: resendAttachments.length > 0 ? resendAttachments : undefined
        });

        if (!error && data && data.id) {
          console.log(`[Email] ✅ Delivered via Resend SDK → ${to} | Subject: "${subject}" | id: ${data.id}`);
          return { success: true, messageId: data.id };
        }
        console.warn(`[Email] ⚠️ Resend API error for ${to}: ${error?.message || 'Unknown'}. Trying Nodemailer...`);
      } catch (err) {
        console.warn(`[Email] ⚠️ Resend SDK exception for ${to}: ${err.message}. Trying Nodemailer...`);
      }
    }
  }

  // ── 2. Nodemailer (Gmail / Brevo / Custom SMTP) ───────────────────────────
  const transporter = _getNodemailerTransporter();
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    replyTo: `"${fromName} Support" <${fromEmail}>`,
    to,
    subject,
    text: htmlToText(html),
    html,
    attachments,
    headers: {
      'X-Mailer': 'BEHOLD. Notification Engine',
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] ✅ Delivered via Nodemailer to ${to}: ${subject} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email] ⚠️ Nodemailer failed for ${to}:`, error.message);
    }
  }

  // ── 3. Resend SDK Fallback (if custom domain was not explicitly flagged above) ──
  if (isResendConfigured && !isCustomResendDomain) {
    const resend = _getResendClient();
    if (resend) {
      try {
        const fromAddress = resendFromEmail || 'onboarding@resend.dev';
        const fromStr = `${fromName} <${fromAddress}>`;
        const resendAttachments = attachments.map(a => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content
        })).filter(a => a.content);

        const { data, error } = await resend.emails.send({
          from: fromStr,
          to: Array.isArray(to) ? to : [to],
          replyTo: (process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim(),
          subject,
          html,
          text: htmlToText(html),
          attachments: resendAttachments.length > 0 ? resendAttachments : undefined
        });

        if (!error && data && data.id) {
          console.log(`[Email] ✅ Delivered via Resend SDK Fallback → ${to} | Subject: "${subject}" | id: ${data.id}`);
          return { success: true, messageId: data.id };
        }
      } catch (err) {
        console.warn(`[Email] ⚠️ Resend SDK fallback failed for ${to}:`, err.message);
      }
    }
  }

  // ── 3. Ethereal test fallback ──────────────────────────────────────────────
  try {
    const ethereal = await _getEtherealTransporter();
    if (ethereal) {
      const info = await ethereal.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email] 📧 Ethereal fallback to ${to}!`);
      console.log(`[Email] 🔗 Preview: ${previewUrl}`);
      return { success: true, fallback: true, previewUrl, messageId: info.messageId };
    }
  } catch (e) {
    console.error('[Email] ❌ Ethereal fallback failed:', e.message);
  }

  console.error(`[Email] ❌ All providers failed — email to ${to} was NOT sent`);
  return { success: false, error: 'All email providers failed' };
};


// ─── Convenience Wrappers ──────────────────────────────────────────────────

const Templates = require('../utils/emailTemplates');

/**
 * Creates a calendar (.ics) attachment for a session.
 * @param {object} appointment - The appointment object with date, time, mode, meetLink
 * @param {string} recipientName - Full name of the recipient (user or counsellor)
 * @param {string} recipientEmail - Real email of the recipient from the database
 * @param {string} otherPartyName - Full name of the other party
 * @param {string} otherPartyEmail - Real email of the other party from the database
 */
function _createIcsAttachment(appointment, recipientName, recipientEmail, otherPartyName, otherPartyEmail) {
  try {
    const [year, month, day] = appointment.date.split('-').map(Number);
    const timeParts = appointment.time.split(' ');
    let [hours, minutes] = timeParts[0].split(':').map(Number);
    if (timeParts[1] === 'PM' && hours < 12) hours += 12;
    if (timeParts[1] === 'AM' && hours === 12) hours = 0;

    const fromEmail = _getFromEmail();
    const rawUrl = (process.env.FRONTEND_URL || 'https://www.behold.co.in').trim();
    const baseDomain = rawUrl.replace(/\/counsellor\/?$/, '').replace(/\/profile\/?$/, '').replace(/\/$/, '');

    const event = {
      start: [year, month, day, hours, minutes],
      duration: { hours: 1 },
      title: `BEHOLD Counselling Session`,
      description: `Service: ${appointment.service || 'counselling'}\nMode: ${appointment.mode}${appointment.meetLink ? '\n\nJoin Link: ' + appointment.meetLink : ''}`,
      location: appointment.mode === 'ONLINE' ? (appointment.meetLink || 'Online (Google Meet)') : 'BEHOLD. Center',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'BEHOLD.', email: fromEmail },
      attendees: [
        { name: 'BEHOLD.', email: fromEmail, rsvp: false, partstat: 'ACCEPTED', role: 'CHAIR' },
        ...(recipientEmail ? [{ name: recipientName, email: recipientEmail, rsvp: true, role: 'REQ-PARTICIPANT' }] : []),
        ...(otherPartyEmail ? [{ name: otherPartyName || 'Psychologist', email: otherPartyEmail, rsvp: true, role: 'REQ-PARTICIPANT' }] : [])
      ]
    };

    const { error, value } = ics.createEvent(event);
    if (error) {
      console.error('[ICS Generation Error]:', error);
      return [];
    }
    return [{ filename: 'session_invite.ics', content: value, contentType: 'text/calendar' }];
  } catch (err) {
    console.error('[ICS Parsing Error]:', err);
    return [];
  }
}

function _buildBookingPayload(user, counsellor, appointment) {
  const appt = appointment || {};
  const usr = user || {};
  const csl = counsellor || {};
  const bookingDetails = appt.bookingDetails || {};

  const bookingId = appt.id || appt._id || appt.appointmentId || `BEHOLD_${Date.now()}`;
  
  // Real email or sanitized placeholder
  const rawUserEmail = usr.email || appt.clientEmail || bookingDetails.email || '';
  const isTempEmail = rawUserEmail.includes('@temp.behold') || rawUserEmail.includes('@localhost') || rawUserEmail.startsWith('whatsapp_');
  const userEmail = isTempEmail ? (rawUserEmail.startsWith('whatsapp_') ? 'Registered via WhatsApp' : '—') : (rawUserEmail || '—');
  const realUserEmail = (!isTempEmail && rawUserEmail && rawUserEmail.includes('@')) ? rawUserEmail : '';

  const counsellorEmail = csl.email || '—';
  const userName = (appt.clientName && appt.clientName !== 'New User' && !String(appt.clientName).startsWith('Behold User'))
    ? appt.clientName
    : ((usr.name && usr.name !== 'New User' && !String(usr.name).startsWith('Behold User')) ? usr.name : (bookingDetails.name || 'Patient'));
  
  const counsellorName = csl.name || appt.counsellorName || 'Psychologist';
  
  const userPhone = resolveAnyPhone(usr, appt, bookingDetails) || appt.clientPhone || usr.phone || '';
  const userAge = appt.age || appt.clientAge || usr.age || bookingDetails.age || '';
  const schoolName = appt.schoolName || usr.schoolName || bookingDetails.schoolName || '';
  const grade = appt.grade || usr.grade || bookingDetails.grade || '';
  const guardianName = appt.guardianName || usr.guardianName || bookingDetails.guardianName || '';
  const guardianPhone = appt.guardianPhone || usr.guardianPhone || bookingDetails.guardianPhone || '';
  const clientLocationName = appt.clientLocationName || usr.locationName || bookingDetails.clientLocationName || '';

  const date = appt.date || '—';
  const time = appt.time || '—';
  const mode = appt.mode || 'ONLINE';
  const duration = appt.duration || appt.sessionDuration || '1 Hour (60 Mins)';
  const service = appt.service || 'Individual Counselling';
  const meetLink = appt.meetLink || '';
  const amountPaid = appt.amountPaid !== undefined ? appt.amountPaid : 0;
  const paymentStatus = appt.paymentStatus || (amountPaid > 0 ? 'PAID' : 'FREE');
  const isIntroductory = appt.isIntroductory || false;

  const reason = appt.feelingLately || usr.feelingLately || appt.reason || usr.reason || bookingDetails.feelingLately || 'General Counselling & Mental Wellbeing';
  const hadPriorTherapy = appt.hadPriorTherapy || usr.hadPriorTherapy || bookingDetails.hadPriorTherapy || 'No';
  const priorTherapyDetails = appt.priorTherapyDetails || usr.priorTherapyDetails || bookingDetails.priorTherapyDetails || '';
  const additionalInfo = appt.notes || clientLocationName || bookingDetails.notes || '';

  return {
    userName,
    counsellorName,
    userEmail,
    realUserEmail,
    counsellorEmail,
    userPhone,
    userAge,
    schoolName,
    grade,
    guardianName,
    guardianPhone,
    clientLocationName,
    service,
    amountPaid,
    paymentStatus,
    isIntroductory,
    date,
    time,
    timeZone: 'IST (Asia/Kolkata)',
    mode,
    duration,
    bookingId,
    meetLink,
    reason,
    hadPriorTherapy,
    priorTherapyDetails,
    additionalInfo
  };
}

const EmailService = {
  sendEmail,

  // Auth
  async sendWelcomeUser(user) {
    const html = Templates.welcomeUser({ name: user.name });
    return sendEmail(user.email, 'Welcome to BEHOLD.', html);
  },

  async sendWelcomeCounsellor(counsellor) {
    const html = Templates.welcomeCounsellor({ name: counsellor.name });
    return sendEmail(counsellor.email, 'Application Received — BEHOLD.', html);
  },

  async sendPasswordResetOTP(email, name, otp) {
    const html = Templates.passwordResetOTP({ name, otp });
    return sendEmail(email, `BEHOLD. Password Reset Code: ${otp}`, html);
  },

  // ── Appointment Email Notifications ──────────────────────────────────────

  async sendAppointmentBooked({ user, counsellor, appointment }) {
    const payload = _buildBookingPayload(user, counsellor, appointment);

    console.log('[Email] 📋 sendAppointmentBooked triggered');
    console.log(`[Email]    Client:       ${payload.userName} (Age: ${payload.userAge || '—'}, Phone: ${payload.userPhone || '—'})`);
    console.log(`[Email]    Psychologist: ${payload.counsellorName} <${payload.counsellorEmail}>`);
    console.log(`[Email]    Session:      ${payload.date} at ${payload.time} (${payload.mode})`);

    // ── 1. Send to USER (student/patient) ─────────────────────────────────
    if (!payload.realUserEmail) {
      console.log('[Email] ℹ️  User has no standard email address (or logged in via WhatsApp) — user email skipped; WhatsApp alert is dispatched');
    } else {
      const userAttachments = _createIcsAttachment(
        appointment, payload.userName, payload.realUserEmail, payload.counsellorName, payload.counsellorEmail
      );
      await sendEmail(
        payload.realUserEmail,
        'Session Confirmed — BEHOLD.',
        Templates.appointmentApproved(payload),
        userAttachments
      );
    }

    // ── 2. Send to PSYCHOLOGIST (counsellor) ──────────────────────────────
    if (!payload.counsellorEmail || payload.counsellorEmail === '—') {
      console.warn('[Email] ⚠️  Psychologist has no email address in database — skipping psychologist notification');
    } else if (payload.realUserEmail && payload.counsellorEmail.toLowerCase() === payload.realUserEmail.toLowerCase()) {
      console.log('[Email] ℹ️  Student & Psychologist have identical email address — skipping duplicate send.');
    } else {
      const counsellorAttachments = _createIcsAttachment(
        appointment, payload.counsellorName, payload.counsellorEmail, payload.userName, payload.realUserEmail
      );
      await sendEmail(
        payload.counsellorEmail,
        `New Session Booked — ${payload.userName} (BEHOLD.)`,
        Templates.appointmentApprovedCounsellor(payload),
        counsellorAttachments
      );
    }
  },

  async sendAppointmentApproved({ user, counsellor, appointment }) {
    return this.sendAppointmentBooked({ user, counsellor, appointment });
  },

  async sendAppointmentRejected({ user, counsellor, appointment, reason }) {
    const html = Templates.appointmentRejected({
      userName: user.name,
      counsellorName: counsellor?.name,
      date: appointment.date,
      reason
    });
    return sendEmail(user.email, 'Session Update — BEHOLD.', html);
  },

  async sendAppointmentCancelled({ user, counsellor, appointment, cancelledBy, reason }) {
    const date = appointment.date;
    const time = appointment.time;

    // Notify user
    await sendEmail(
      user.email,
      'Session Cancelled — BEHOLD.',
      Templates.appointmentCancelled({
        recipientName: user.name,
        otherPartyName: counsellor?.name || 'Counsellor',
        date, time, cancelledBy, reason
      })
    );
    // Notify counsellor
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        'Session Cancelled — BEHOLD.',
        Templates.appointmentCancelledCounsellor({
          recipientName: counsellor.name,
          otherPartyName: user.name || 'Student',
          date, time, cancelledBy, reason
        })
      );
    }
  },

  async sendAppointmentRescheduled({ user, counsellor, appointment }) {
    const payload = {
      newDate: appointment.date,
      newTime: appointment.time,
      mode: appointment.mode
    };

    await sendEmail(
      user.email,
      'Session Rescheduled — BEHOLD.',
      Templates.appointmentRescheduled({ recipientName: user.name, otherPartyName: counsellor?.name, ...payload })
    );
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        'Session Rescheduled — BEHOLD.',
        Templates.appointmentRescheduledCounsellor({ recipientName: counsellor.name, otherPartyName: user.name, ...payload })
      );
    }
  },

  async sendMeetLinkAdded({ user, counsellor, appointment }) {
    const html = Templates.meetLinkAdded({
      userName: user.name,
      counsellorName: counsellor?.name,
      date: appointment.date,
      time: appointment.time,
      meetLink: appointment.meetLink
    });
    return sendEmail(user.email, '🔗 Meeting Link Ready — BEHOLD.', html);
  },

  async sendAppointmentReminder({ user, counsellor, appointment }) {
    const payload = {
      date: appointment.date,
      time: appointment.time,
      mode: appointment.mode,
      meetLink: appointment.meetLink
    };

    await sendEmail(
      user.email,
      '⏰ Appointment Reminder — BEHOLD.',
      Templates.appointmentReminder({ recipientName: user.name, otherPartyName: counsellor?.name, ...payload })
    );
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        '⏰ Appointment Reminder — BEHOLD.',
        Templates.appointmentReminderCounsellor({ recipientName: counsellor.name, otherPartyName: user.name, ...payload })
      );
    }
  },

  // Payments
  async sendPaymentReceipt({ user, appointment, counsellor, amount, transactionId }) {
    const html = Templates.paymentReceipt({
      userName: user.name,
      amount,
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      counsellorName: counsellor?.name,
      transactionId
    });
    return sendEmail(user.email, '💚 Payment Confirmed — BEHOLD.', html);
  },

  // Admin Actions
  async sendCounsellorVerified(counsellor) {
    const html = Templates.counsellorVerified({ name: counsellor.name });
    return sendEmail(counsellor.email, '✅ Your Profile is Now Verified — BEHOLD.', html);
  },

  async sendCounsellorRejected(counsellor, reason) {
    const html = Templates.counsellorRejected({ name: counsellor.name, reason });
    return sendEmail(counsellor.email, 'Application Update — BEHOLD.', html);
  },

  async sendBroadcast(recipients, title, message) {
    const results = [];
    for (const recipient of recipients) {
      if (recipient.email) {
        const html = Templates.broadcastEmail({ title, message, recipientName: recipient.name });
        const result = await sendEmail(recipient.email, `📢 ${title} — BEHOLD.`, html);
        results.push({ email: recipient.email, ...result });
      }
    }
    return results;
  },

  async sendContactInquiry({ name, email, phone, message }) {
    const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'beholdoffice@gmail.com').trim();
    const html = Templates.contactInquiry({ name, email, phone, message });
    return sendEmail(adminEmail, `🔔 New Contact Inquiry from ${name} — BEHOLD.`, html);
  }
};

module.exports = EmailService;
