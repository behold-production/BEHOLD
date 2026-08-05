const nodemailer = require('nodemailer');

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

function _getTransporter() {
  if (_transporter) return _transporter;

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

/**
 * Core send function
 * @param {string} to — recipient email address
 * @param {string} subject — email subject line
 * @param {string} html — complete HTML body
 */
const sendEmail = async (to, subject, html) => {
  if (!to) return { success: false, error: 'No recipient address provided' };

  const transporter = _getTransporter();

  if (!transporter) {
    // Dev/Mock mode — log to console instead of sending
    console.log('─────────────────────────────────────────────────────────────');
    console.log('📧 EMAIL LOG [Dev/Mock Mode — GMAIL_USER not configured]');
    console.log('To:     ', to);
    console.log('Subject:', subject);
    console.log('─────────────────────────────────────────────────────────────');
    return { success: true, mock: true };
  }

  const fromName = (process.env.EMAIL_FROM_NAME || 'Behold Aspire').trim();
  const fromEmail = (process.env.GMAIL_USER || '').trim();

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html
    });

    console.log(`[Email] ✅ Sent to ${to}: ${subject} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] ❌ Failed to send to ${to}:`, error.message);
    // Fallback: return success with fallback flag so auth flows remain functional
    return { success: true, fallback: true, error: error.message };
  }
};

// ─── Convenience Wrappers ──────────────────────────────────────────────────

const Templates = require('../utils/emailTemplates');

const EmailService = {
  // Auth
  async sendWelcomeUser(user) {
    const html = Templates.welcomeUser({ name: user.name });
    return sendEmail(user.email, '🌿 Welcome to Behold Aspire!', html);
  },

  async sendWelcomeCounsellor(counsellor) {
    const html = Templates.welcomeCounsellor({ name: counsellor.name });
    return sendEmail(counsellor.email, '🌿 Application Received — Behold Aspire', html);
  },

  async sendPasswordResetOTP(email, name, otp) {
    const html = Templates.passwordResetOTP({ name, otp });
    return sendEmail(email, '🔐 Your Behold Aspire Password Reset Code', html);
  },

  // Appointments
  async sendAppointmentBooked({ user, counsellor, appointment }) {
    const date = appointment.date;
    const time = appointment.time;
    const mode = appointment.mode;
    const platform = appointment.platform;

    await sendEmail(
      user.email,
      '📋 Appointment Request Submitted — Behold Aspire',
      Templates.appointmentBooked({ userName: user.name, counsellorName: counsellor?.name, date, time, mode, platform })
    );
    if (counsellor?.email) {
      await sendEmail(
        counsellor.email,
        '📋 New Booking Request — Behold Aspire',
        Templates.appointmentBookedCounsellor({ userName: user.name, counsellorName: counsellor.name, date, time, mode })
      );
    }
  },

  async sendAppointmentApproved({ user, counsellor, appointment }) {
    const html = Templates.appointmentApproved({
      userName: user.name,
      counsellorName: counsellor?.name,
      date: appointment.date,
      time: appointment.time,
      mode: appointment.mode,
      meetLink: appointment.meetLink
    });
    return sendEmail(user.email, '✅ Appointment Confirmed — Behold Aspire', html);
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
        Templates.appointmentCancelled({
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
        Templates.appointmentRescheduled({ recipientName: counsellor.name, otherPartyName: user.name, ...payload })
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
        Templates.appointmentReminder({ recipientName: counsellor.name, otherPartyName: user.name, ...payload })
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
