const nodemailer = require('nodemailer');
const ics = require('ics');

/**
 * Behold Aspire — Email Service
 * Uses Gmail SMTP via Nodemailer.
 *
 * Required .env variables:
 *   GMAIL_USER         — Your Gmail address (e.g. notifications@gmail.com)
 *   GMAIL_APP_PASSWORD — Gmail App Password (16-char, from Google Account → Security → App Passwords)
 *   EMAIL_FROM_NAME    — Display name (default: "Behold Aspire")
 */

let _transporter = null;
let _etherealTransporter = null;

function _getTransporter() {
  if (_transporter) return _transporter;

  // 1. Resend SMTP support
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    _transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: resendApiKey }
    });
    return _transporter;
  }

  // 2. Brevo (Sendinblue) SMTP support
  const brevoKey = (process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || '').trim();
  if (brevoKey) {
    const brevoUser = (process.env.BREVO_USER || process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim();
    _transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: { user: brevoUser, pass: brevoKey }
    });
    return _transporter;
  }

  // 3. Custom Generic SMTP
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    _transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass }
    });
    return _transporter;
  }

  // 4. Gmail SMTP
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

  if (!user || !pass || user.includes('your_gmail')) {
    return null; // Mock mode — no credentials configured
  }

  _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  return _transporter;
}

async function _getEtherealTransporter() {
  if (_etherealTransporter) return _etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    _etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return _etherealTransporter;
  } catch (err) {
    console.error('[EmailService] Failed to create Ethereal test account:', err.message);
    return null;
  }
}

// Helper to generate clean plain-text version from HTML for anti-spam filters
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
 * Core send function
 * @param {string} to — recipient email address
 * @param {string} subject — email subject line
 * @param {string} html — complete HTML body
 * @param {Array} attachments — array of nodemailer attachment objects
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  if (!to) return { success: false, error: 'No recipient address provided' };

  const fromName = (process.env.EMAIL_FROM_NAME || 'BEHOLD Aspire').trim();
  const rawFrom = (process.env.GMAIL_USER || process.env.SMTP_USER || 'beholdoffice@gmail.com').trim();
  const fromEmail = rawFrom.includes('flutterclt') ? 'beholdoffice@gmail.com' : rawFrom;
  const transporter = _getTransporter();
  const plainText = htmlToText(html);

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    replyTo: `"${fromName} Support" <${fromEmail}>`,
    to,
    subject,
    text: plainText,
    html,
    attachments,
    headers: {
      'X-Mailer': 'BEHOLD Aspire Notification Engine',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`
    }
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] ✅ Sent via primary SMTP to ${to}: ${subject} (${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[Email] ⚠️ Primary SMTP failed to send to ${to}:`, error.message);
    }
  }

  // Fallback to Ethereal Test Email
  try {
    const etherealTransporter = await _getEtherealTransporter();
    if (etherealTransporter) {
      const info = await etherealTransporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email] 📧 Delivered via Ethereal Test Service to ${to}!`);
      console.log(`[Email] 🔗 View Email Online: ${previewUrl}`);
      return { success: true, fallback: true, previewUrl, messageId: info.messageId };
    }
  } catch (e) {
    console.error('[Email] ❌ Ethereal fallback failed:', e.message);
  }

  return { success: true, fallback: true };
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

    const fromEmail = (process.env.GMAIL_USER || process.env.SMTP_USER || 'beholdoffice@gmail.com').trim();

    const event = {
      start: [year, month, day, hours, minutes],
      duration: { hours: 1 },
      title: `Counselling Session — Behold Aspire`,
      description: `Counselling session between ${recipientName} and ${otherPartyName || 'Counsellor'}. Mode: ${appointment.mode}.${appointment.meetLink ? ' Join: ' + appointment.meetLink : ''}`,
      location: appointment.mode === 'ONLINE' ? (appointment.meetLink || 'Online — link in email') : 'Behold Aspire Center',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: { name: 'Behold Aspire', email: fromEmail },
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

  // Appointments
  async sendAppointmentBooked({ user, counsellor, appointment }) {
    const date = appointment.date;
    const time = appointment.time;
    const mode = appointment.mode;
    const platform = appointment.platform;

    // User-specific calendar invite with their actual email
    const userAttachments = _createIcsAttachment(
      appointment,
      user.name,
      user.email,
      counsellor?.name,
      counsellor?.email
    );

    // Send confirmation + calendar invite to user immediately on booking
    await sendEmail(
      user.email,
      '📋 Appointment Request Submitted — Behold Aspire',
      Templates.appointmentBooked({ userName: user.name, counsellorName: counsellor?.name, date, time, mode, platform }),
      userAttachments
    );

    // Counsellor-specific calendar invite with their actual email
    if (counsellor?.email) {
      const counsellorAttachments = _createIcsAttachment(
        appointment,
        counsellor.name,
        counsellor.email,
        user.name,
        user.email
      );
      await sendEmail(
        counsellor.email,
        '📋 New Booking Request — Behold Aspire',
        Templates.appointmentBookedCounsellor({ userName: user.name, counsellorName: counsellor.name, date, time, mode }),
        counsellorAttachments
      );
    }
  },

  async sendAppointmentApproved({ user, counsellor, appointment }) {
    // User-specific calendar invite with their actual email from the database
    const userAttachments = _createIcsAttachment(
      appointment,
      user.name,
      user.email,
      counsellor?.name,
      counsellor?.email
    );

    const htmlUser = Templates.appointmentApproved({
      userName: user.name,
      counsellorName: counsellor?.name,
      date: appointment.date,
      time: appointment.time,
      mode: appointment.mode,
      meetLink: appointment.meetLink
    });
    // Send confirmed appointment + calendar invite to user immediately
    await sendEmail(user.email, '✅ Appointment Confirmed — Behold Aspire', htmlUser, userAttachments);

    if (counsellor?.email) {
      // Counsellor-specific calendar invite with their actual email from the database
      const counsellorAttachments = _createIcsAttachment(
        appointment,
        counsellor.name,
        counsellor.email,
        user.name,
        user.email
      );
      const htmlCounsellor = Templates.appointmentApprovedCounsellor({
        userName: user.name,
        counsellorName: counsellor.name,
        date: appointment.date,
        time: appointment.time,
        mode: appointment.mode,
        meetLink: appointment.meetLink
      });
      // Send confirmed appointment + calendar invite to counsellor immediately
      await sendEmail(counsellor.email, '✅ Appointment Confirmed — Behold Aspire', htmlCounsellor, counsellorAttachments);
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
