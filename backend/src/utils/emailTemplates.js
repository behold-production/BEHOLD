/**
 * Behold Aspire — Branded HTML Email Templates
 * All email templates share a clean, modern design using Behold Aspire's
 * green/teal brand palette. Each function returns a complete HTML string.
 */

const BRAND_COLOR = '#16a34a';
const BRAND_DARK = '#14532d';
const BRAND_LIGHT = '#dcfce7';

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Behold Aspire</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(22,163,74,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR},${BRAND_DARK});padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">🌿 Behold Aspire</h1>
              <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;font-weight:500;">Mental Health & Career Counselling</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© 2025 Behold Aspire. All rights reserved.</p>
              <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">This is an automated email. Please do not reply.</p>
              <p style="margin:6px 0 0;"><a href="https://www.behold.co.in" style="color:${BRAND_COLOR};font-size:12px;text-decoration:none;">www.behold.co.in</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const btn = (text, url) =>
  `<a href="${url}" style="display:inline-block;margin-top:20px;padding:14px 32px;background:${BRAND_COLOR};color:#ffffff;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">${text}</a>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;

const infoRow = (label, value) =>
  `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;font-weight:600;width:160px;">${label}</td>
    <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:500;">${value || '—'}</td>
  </tr>`;

const infoTable = (rows) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:10px;padding:16px 20px;margin:20px 0;">
    ${rows}
  </table>`;

// ─── Templates ─────────────────────────────────────────────────────────────

const welcomeUser = ({ name }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Welcome to Behold Aspire! 🎉</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, your account has been created successfully. We're so glad to have you here!</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Behold Aspire connects you with expert counsellors and psychologists to help you grow, heal, and thrive.</p>
    ${divider()}
    <h3 style="color:${BRAND_COLOR};font-size:16px;margin:0 0 12px;">What you can do now:</h3>
    <ul style="color:#475569;font-size:14px;line-height:2;padding-left:18px;margin:0;">
      <li>Browse and book sessions with top counsellors</li>
      <li>Take the CIGI career aptitude assessment</li>
      <li>Access expert mental health & career resources</li>
    </ul>
    <div style="text-align:center;">${btn('Explore Behold Aspire →', 'https://www.behold.co.in')}</div>
  `);

const welcomeCounsellor = ({ name }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Application Received! 🌿</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, thank you for applying to join the Behold Aspire counsellor network!</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Your application is currently <strong>under review</strong> by our admin team. You'll receive an email once your profile has been verified.</p>
    <div style="background:${BRAND_LIGHT};border-left:4px solid ${BRAND_COLOR};border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">⏳ Expected review time: 24–48 hours</p>
    </div>
    <div style="text-align:center;">${btn('Go to Dashboard →', 'https://www.behold.co.in/counsellor')}</div>
  `);

const passwordResetOTP = ({ name, otp }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Password Reset Verification Code</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${name || 'there'}</strong>, we received a request to reset your BEHOLD Aspire account password.</p>
    <div style="text-align:center;margin:28px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Verification Code</p>
      <div style="display:inline-block;background:#0f172a;color:#ffffff;font-size:36px;font-weight:900;letter-spacing:12px;padding:18px 32px;border-radius:12px;font-family:monospace;">${otp}</div>
      <p style="margin:12px 0 0;font-size:13px;color:#ef4444;font-weight:600;">This code will expire in 10 minutes.</p>
    </div>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">If you did not request a password reset, please ignore this email or contact support immediately.</p>
  `);

const appointmentBooked = ({ userName, counsellorName, date, time, mode, platform }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Request Submitted ✅</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>, your booking request has been received. You'll be notified once the counsellor confirms.</p>
    ${infoTable(`
      ${infoRow('Counsellor', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${platform ? infoRow('Platform', platform) : ''}
    `)}
    <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;color:#713f12;font-size:14px;font-weight:600;">⏳ Status: Pending Confirmation</p>
    </div>
    <div style="text-align:center;">${btn('View My Bookings →', 'https://www.behold.co.in/profile?tab=booked')}</div>
  `);

const appointmentBookedCounsellor = ({ userName, counsellorName, date, time, mode }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">New Booking Request 📋</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${counsellorName}</strong>, you have a new appointment request from a student.</p>
    ${infoTable(`
      ${infoRow('Student', userName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    <p style="margin:0 0 16px;color:#475569;font-size:14px;">Please log in to your dashboard to approve or reject this request.</p>
    <div style="text-align:center;">${btn('Review in Dashboard →', 'https://www.behold.co.in/counsellor')}</div>
  `);

const appointmentApproved = ({ userName, counsellorName, date, time, mode, meetLink }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Confirmed! 🎉</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Great news, <strong>${userName}</strong>! Your appointment has been confirmed.</p>
    ${infoTable(`
      ${infoRow('Counsellor', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BRAND_COLOR};">Join Meeting</a>`) : ''}
    `)}
    <div style="background:${BRAND_LIGHT};border-left:4px solid ${BRAND_COLOR};border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Status: Confirmed</p>
    </div>
    ${meetLink ? `<div style="text-align:center;">${btn('Join Meeting →', meetLink)}</div>` : `<div style="text-align:center;">${btn('View Booking →', 'https://www.behold.co.in/profile?tab=booked')}</div>`}
  `);

const appointmentApprovedCounsellor = ({ userName, counsellorName, date, time, mode, meetLink }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Confirmed! 🎉</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${counsellorName}</strong>, your upcoming session with <strong>${userName}</strong> is confirmed.</p>
    ${infoTable(`
      ${infoRow('Student', userName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BRAND_COLOR};">Join Meeting</a>`) : ''}
    `)}
    <div style="background:${BRAND_LIGHT};border-left:4px solid ${BRAND_COLOR};border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Status: Confirmed</p>
    </div>
    ${meetLink ? `<div style="text-align:center;">${btn('Join Meeting →', meetLink)}</div>` : `<div style="text-align:center;">${btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}</div>`}
  `);

const appointmentRejected = ({ userName, counsellorName, date, reason }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Not Confirmed</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>, unfortunately your appointment request could not be confirmed at this time.</p>
    ${infoTable(`
      ${infoRow('Counsellor', counsellorName)}
      ${infoRow('Requested Date', date)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    <p style="margin:16px 0 0;color:#475569;font-size:14px;line-height:1.6;">You can browse other available counsellors and times on our platform.</p>
    <div style="text-align:center;">${btn('Find Another Counsellor →', 'https://www.behold.co.in/advisors')}</div>
  `);

const appointmentCancelled = ({ recipientName, otherPartyName, date, time, cancelledBy, reason }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Cancelled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, your appointment has been cancelled.</p>
    ${infoTable(`
      ${infoRow('With', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Cancelled By', cancelledBy)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    <div style="text-align:center;">${btn('Book a New Session →', 'https://www.behold.co.in/advisors')}</div>
  `);

const appointmentCancelledCounsellor = ({ recipientName, otherPartyName, date, time, cancelledBy, reason }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Cancelled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, your appointment with <strong>${otherPartyName}</strong> has been cancelled.</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Cancelled By', cancelledBy)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    <div style="text-align:center;">${btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}</div>
  `);

const appointmentRescheduled = ({ recipientName, otherPartyName, newDate, newTime, mode }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Rescheduled 🔄</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, your appointment has been rescheduled.</p>
    ${infoTable(`
      ${infoRow('With', otherPartyName)}
      ${infoRow('New Date', newDate)}
      ${infoRow('New Time', newTime)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    <div style="text-align:center;">${btn('View Updated Booking →', 'https://www.behold.co.in/profile?tab=booked')}</div>
  `);

const appointmentRescheduledCounsellor = ({ recipientName, otherPartyName, newDate, newTime, mode }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Appointment Rescheduled 🔄</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, your appointment with <strong>${otherPartyName}</strong> has been rescheduled.</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('New Date', newDate)}
      ${infoRow('New Time', newTime)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    <div style="text-align:center;">${btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}</div>
  `);

const appointmentReminder = ({ recipientName, otherPartyName, date, time, mode, meetLink }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">⏰ Appointment Reminder</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, this is a reminder about your upcoming appointment <strong>today</strong>!</p>
    ${infoTable(`
      ${infoRow('With', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BRAND_COLOR};">Join Meeting</a>`) : ''}
    `)}
    ${meetLink ? `<div style="text-align:center;">${btn('Join Meeting Now →', meetLink)}</div>` : `<div style="text-align:center;">${btn('View My Dashboard →', 'https://www.behold.co.in/profile?tab=booked')}</div>`}
  `);

const appointmentReminderCounsellor = ({ recipientName, otherPartyName, date, time, mode, meetLink }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">⏰ Session Reminder</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName}</strong>, this is a reminder that you have a session with <strong>${otherPartyName}</strong> today!</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BRAND_COLOR};">Join Meeting</a>`) : ''}
    `)}
    ${meetLink ? `<div style="text-align:center;">${btn('Start Meeting Now →', meetLink)}</div>` : `<div style="text-align:center;">${btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}</div>`}
  `);

const paymentReceipt = ({ userName, amount, appointmentDate, appointmentTime, counsellorName, transactionId }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Payment Successful! 💚</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>, your payment has been received. Here is your receipt.</p>
    ${infoTable(`
      ${infoRow('Amount Paid', `<strong style="color:${BRAND_COLOR};font-size:16px;">₹${amount}</strong>`)}
      ${infoRow('Counsellor', counsellorName)}
      ${infoRow('Session Date', appointmentDate)}
      ${infoRow('Session Time', appointmentTime)}
      ${transactionId ? infoRow('Transaction ID', `<code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${transactionId}</code>`) : ''}
    `)}
    <div style="background:${BRAND_LIGHT};border-left:4px solid ${BRAND_COLOR};border-radius:6px;padding:14px 18px;margin:20px 0;">
      <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Your session is now booked and awaiting confirmation.</p>
    </div>
    <div style="text-align:center;">${btn('View My Bookings →', 'https://www.behold.co.in/profile?tab=booked')}</div>
  `);

const counsellorVerified = ({ name }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">You're Now Verified! ✅</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Congratulations, <strong>${name}</strong>! Your counsellor profile has been reviewed and <strong>approved</strong> by the Behold Aspire admin team.</p>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Your profile is now live and students can book sessions with you. Complete your availability and profile to start receiving bookings!</p>
    <div style="text-align:center;">${btn('Go to Your Dashboard →', 'https://www.behold.co.in/counsellor')}</div>
  `);

const counsellorRejected = ({ name, reason }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Application Update</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, after reviewing your application, we are unable to approve your profile at this time.</p>
    ${reason ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:6px;padding:14px 18px;margin:20px 0;"><p style="margin:0;color:#7f1d1d;font-size:14px;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Please contact our support team if you believe this is an error or if you would like to reapply with updated information.</p>
    <div style="text-align:center;">${btn('Contact Support →', 'mailto:support@behold.co.in')}</div>
  `);

const broadcastEmail = ({ title, message, recipientName }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">📢 ${title}</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${recipientName || 'there'}</strong>,</p>
    <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin:16px 0;border:1px solid #e2e8f0;">
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.8;white-space:pre-line;">${message}</p>
    </div>
    <div style="text-align:center;">${btn('Visit Behold Aspire →', 'https://www.behold.co.in')}</div>
  `);

const meetLinkAdded = ({ userName, counsellorName, date, time, meetLink }) =>
  baseLayout(`
    <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:800;">Meeting Link Ready! 🔗</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">Hi <strong>${userName}</strong>, your counsellor has added a meeting link for your upcoming session.</p>
    ${infoTable(`
      ${infoRow('Counsellor', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Join Link', `<a href="${meetLink}" style="color:${BRAND_COLOR};font-weight:700;">Click to Join</a>`)}
    `)}
    <div style="text-align:center;">${btn('Join Meeting →', meetLink)}</div>
  `);

module.exports = {
  welcomeUser,
  welcomeCounsellor,
  passwordResetOTP,
  appointmentBooked,
  appointmentBookedCounsellor,
  appointmentApproved,
  appointmentApprovedCounsellor,
  appointmentRejected,
  appointmentCancelled,
  appointmentCancelledCounsellor,
  appointmentRescheduled,
  appointmentRescheduledCounsellor,
  appointmentReminder,
  appointmentReminderCounsellor,
  paymentReceipt,
  counsellorVerified,
  counsellorRejected,
  broadcastEmail,
  meetLinkAdded
};
