const nodemailer = require('nodemailer');
const ics = require('ics');

/**
 * Behold Aspire — Email Service
 * Primary provider: Resend SDK (resend.com)
 * Fallback: Nodemailer (Brevo, custom SMTP, Gmail)
 *
 * Required .env variables:
 *   RESEND_API_KEY      — Resend API key (re_...)
 *   RESEND_FROM_EMAIL   — Verified sender email (e.g. beholdoffice@behold.co.in)
 *   EMAIL_FROM_NAME     — Display name (default: "Behold Aspire")
 */

let _resendClient = null;
let _nodemailerTransporter = null;
let _etherealTransporter = null;

function _getFromEmail() {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    return (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').trim();
  }
  const rawFrom = (process.env.GMAIL_USER || process.env.SMTP_USER || 'beholdoffice@gmail.com').trim();
  return rawFrom.includes('flutterclt') ? 'beholdoffice@gmail.com' : rawFrom;
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

  const fromName = (process.env.EMAIL_FROM_NAME || 'Behold Aspire').trim();
  const fromEmail = _getFromEmail();
  const from = `${fromName} <${fromEmail}>`;

  console.log(`[Email] 📤 Sending to: ${to} | Subject: "${subject}"`);

  // ── 1. Resend SDK (primary) ────────────────────────────────────────────────
  const resend = _getResendClient();
  if (resend) {
    try {
      // Convert nodemailer-style attachments to Resend format
      const resendAttachments = attachments.map(a => ({
        filename: a.filename,
        content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content
      })).filter(a => a.content);

      const { data, error } = await resend.emails.send({
        from,
        to,
        reply_to: 'beholdoffice@gmail.com',
        subject,
        html,
        text: htmlToText(html),
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined
      });

      if (error) {
        // Resend test-mode restriction: only sends to owner email until domain is verified
        if (error.message && error.message.includes('only send testing emails')) {
          console.warn(`[Email] 🔒 DOMAIN NOT VERIFIED YET — Resend is blocking delivery to ${to}.`);
          console.warn(`[Email]    Fix: Go to https://resend.com/domains and wait until behold.co.in shows as ACTIVE.`);
          console.warn(`[Email]    Then set RESEND_FROM_EMAIL=admin@behold.co.in in .env and restart the server.`);
        } else {
          console.error(`[Email] ❌ Resend error sending to ${to}:`, error.message);
        }
      } else {
        console.log(`[Email] ✅ Delivered via Resend → ${to} | Subject: "${subject}" | id: ${data?.id}`);
        return { success: true, messageId: data?.id };
      }
    } catch (err) {
      console.error(`[Email] ⚠️ Resend SDK threw for ${to}:`, err.message);
    }
  }

  // ── 2. Nodemailer fallback ─────────────────────────────────────────────────
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
      'X-Mailer': 'BEHOLD Aspire Notification Engine',
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] ✅ Sent via Nodemailer to ${to}: ${subject} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email] ⚠️ Nodemailer failed for ${to}:`, error.message);
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
      title: `BEHOLD Counselling Session: ${recipientName} & ${otherPartyName || 'BEHOLD Aspire'}`,
      description: `Service: ${appointment.service || 'counselling'}\nMode: ${appointment.mode}\n\nJoin Portals:\n- Student Portal: ${baseDomain}/profile\n- Advisor Console: ${baseDomain}/counsellor${appointment.meetLink ? '\n\nJoin Link: ' + appointment.meetLink : ''}`,
      location: appointment.mode === 'ONLINE' ? (appointment.meetLink || 'Online (Google Meet)') : 'Behold Aspire Center',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'BEHOLD Aspire', email: fromEmail },
      attendees: [
        { name: recipientName, email: recipientEmail || fromEmail, rsvp: true, role: 'REQ-PARTICIPANT' },
        ...(otherPartyEmail ? [{ name: otherPartyName || 'Other Party', email: otherPartyEmail, rsvp: true, role: 'REQ-PARTICIPANT' }] : [])
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

const EmailService = {
  sendEmail,

  // Auth
  async sendWelcomeUser(user) {
    const html = Templates.welcomeUser({ name: user.name });
    return sendEmail(user.email, 'Welcome to BEHOLD Aspire', html);
  },

  async sendWelcomeCounsellor(counsellor) {
    const html = Templates.welcomeCounsellor({ name: counsellor.name });
    return sendEmail(counsellor.email, 'Application Received — BEHOLD Aspire', html);
  },

  async sendPasswordResetOTP(email, name, otp) {
    const html = Templates.passwordResetOTP({ name, otp });
    return sendEmail(email, `BEHOLD Aspire Password Reset Code: ${otp}`, html);
  },

  // ── Appointment Email Notifications ──────────────────────────────────────

  async sendAppointmentBooked({ user, counsellor, appointment }) {
    const date     = appointment.date;
    const time     = appointment.time;
    const mode     = appointment.mode;
    const platform = appointment.platform;

    console.log('[Email] 📋 sendAppointmentBooked triggered');
    console.log(`[Email]    User:        ${user?.name || 'MISSING'} <${user?.email || 'NO EMAIL IN DB'}>`);
    console.log(`[Email]    Psychologist: ${counsellor?.name || 'MISSING'} <${counsellor?.email || 'NO EMAIL IN DB'}>`);
    console.log(`[Email]    Session:      ${date} at ${time} (${mode})`);

    // ── 1. Send to USER (student) ─────────────────────────────────────────
    if (!user?.email) {
      console.warn('[Email] ⚠️  User has no email address in database — skipping user notification');
    } else {
      const userAttachments = _createIcsAttachment(
        appointment, user.name, user.email, counsellor?.name, counsellor?.email
      );
      await sendEmail(
        user.email,
        '📋 Session Request Submitted — Behold Aspire',
        Templates.appointmentBooked({ userName: user.name, counsellorName: counsellor?.name, date, time, mode, platform }),
        userAttachments
      );
    }

    // ── 2. Send to PSYCHOLOGIST (counsellor) ──────────────────────────────
    if (!counsellor?.email) {
      console.warn('[Email] ⚠️  Psychologist has no email address in database — skipping psychologist notification');
    } else {
      const counsellorAttachments = _createIcsAttachment(
        appointment, counsellor.name, counsellor.email, user?.name, user?.email
      );
      await sendEmail(
        counsellor.email,
        '📋 New Session Request — Behold Aspire',
        Templates.appointmentBookedCounsellor({ userName: user?.name, counsellorName: counsellor.name, date, time, mode }),
        counsellorAttachments
      );
    }
  },

  async sendAppointmentApproved({ user, counsellor, appointment }) {
    console.log('[Email] ✅ sendAppointmentApproved triggered');
    console.log(`[Email]    User:        ${user?.name || 'MISSING'} <${user?.email || 'NO EMAIL IN DB'}>`);
    console.log(`[Email]    Psychologist: ${counsellor?.name || 'MISSING'} <${counsellor?.email || 'NO EMAIL IN DB'}>`);

    // ── 1. Confirm to USER (student) ──────────────────────────────────────
    if (!user?.email) {
      console.warn('[Email] ⚠️  User has no email in database — skipping user confirmation');
    } else {
      const userAttachments = _createIcsAttachment(
        appointment, user.name, user.email, counsellor?.name, counsellor?.email
      );
      await sendEmail(
        user.email,
        '✅ Session Confirmed — Behold Aspire',
        Templates.appointmentApproved({
          userName: user.name,
          counsellorName: counsellor?.name,
          date: appointment.date,
          time: appointment.time,
          mode: appointment.mode,
          meetLink: appointment.meetLink
        }),
        userAttachments
      );
    }

    // ── 2. Confirm to PSYCHOLOGIST (counsellor) ───────────────────────────
    if (!counsellor?.email) {
      console.warn('[Email] ⚠️  Psychologist has no email in database — skipping psychologist confirmation');
    } else {
      const counsellorAttachments = _createIcsAttachment(
        appointment, counsellor.name, counsellor.email, user?.name, user?.email
      );
      await sendEmail(
        counsellor.email,
        '✅ Session Confirmed — Behold Aspire',
        Templates.appointmentApprovedCounsellor({
          userName: user?.name,
          counsellorName: counsellor.name,
          date: appointment.date,
          time: appointment.time,
          mode: appointment.mode,
          meetLink: appointment.meetLink
        }),
        counsellorAttachments
      );
    }
  },

  async sendAppointmentRejected({ user, counsellor, appointment, reason }) {
    const html = Templates.appointmentRejected({
      userName: user.name,
      counsellorName: counsellor?.name,
      date: appointment.date,
      reason
    });
    return sendEmail(user.email, 'Appointment Update — Behold Aspire', html);
  },

  async sendAppointmentCancelled({ user, counsellor, appointment, cancelledBy, reason }) {
    const date = appointment.date;
    const time = appointment.time;

    // Notify user
    await sendEmail(
      user.email,
      'Appointment Cancelled — Behold Aspire',
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
        'Appointment Cancelled — Behold Aspire',
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
      '🔄 Appointment Rescheduled — Behold Aspire',
      Templates.appointmentRescheduled({ recipientName: user.name, otherPartyName: counsellor?.name, ...payload })
    );
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        '🔄 Appointment Rescheduled — Behold Aspire',
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
    return sendEmail(user.email, '🔗 Meeting Link Ready — Behold Aspire', html);
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
      '⏰ Appointment Reminder — Behold Aspire',
      Templates.appointmentReminder({ recipientName: user.name, otherPartyName: counsellor?.name, ...payload })
    );
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        '⏰ Appointment Reminder — Behold Aspire',
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
    return sendEmail(user.email, '💚 Payment Confirmed — Behold Aspire', html);
  },

  // Admin Actions
  async sendCounsellorVerified(counsellor) {
    const html = Templates.counsellorVerified({ name: counsellor.name });
    return sendEmail(counsellor.email, '✅ Your Profile is Now Verified — Behold Aspire', html);
  },

  async sendCounsellorRejected(counsellor, reason) {
    const html = Templates.counsellorRejected({ name: counsellor.name, reason });
    return sendEmail(counsellor.email, 'Application Update — Behold Aspire', html);
  },

  async sendBroadcast(recipients, title, message) {
    const results = [];
    for (const recipient of recipients) {
      if (recipient.email) {
        const html = Templates.broadcastEmail({ title, message, recipientName: recipient.name });
        const result = await sendEmail(recipient.email, `📢 ${title} — Behold Aspire`, html);
        results.push({ email: recipient.email, ...result });
      }
    }
    return results;
  }
};

module.exports = EmailService;
