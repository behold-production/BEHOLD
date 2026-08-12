/**
 * Behold Aspire — Email Templates
 * Design: White background + Neon Blue accent (#0ea5e9)
 * Logo: "B." wordmark
 */

const BLUE      = '#0ea5e9';   // Neon / sky blue — primary CTA
const BLUE_DARK = '#0369a1';   // Deep blue — header gradient end
const BLUE_BG   = '#f0f9ff';   // Ice blue — info panel background
const BLUE_GLOW = '#bae6fd';   // Light blue — subtle accents

// ─── Layout Shell ───────────────────────────────────────────────────────────
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Behold Aspire</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:36px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(14,165,233,0.12);">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,${BLUE} 0%,${BLUE_DARK} 100%);padding:32px 44px;text-align:center;">
              <img src="https://www.behold.co.in/pwa-512.png" alt="BEHOLD Logo" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);background:#ffffff;padding:4px;" />
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">BEHOLD Aspire</h1>
              <p style="margin:4px 0 0;color:${BLUE_GLOW};font-size:12px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;">Mental Health &amp; Career Counselling</p>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="padding:40px 44px;">
              ${content}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 44px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© 2025 Behold Aspire. All rights reserved.</p>
              <p style="margin:5px 0 0;font-size:12px;color:#94a3b8;">This is an automated notification — please do not reply directly.</p>
              <p style="margin:8px 0 0;">
                <a href="https://www.behold.co.in" style="color:${BLUE};font-size:12px;text-decoration:none;font-weight:600;">www.behold.co.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── UI Components ───────────────────────────────────────────────────────────
const btn = (text, url) =>
  `<div style="text-align:center;margin-top:28px;">
    <a href="${url}" style="display:inline-block;padding:14px 36px;background:${BLUE};color:#ffffff;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.2px;box-shadow:0 4px 16px rgba(14,165,233,0.30);">${text}</a>
  </div>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />`;

const badge = (text, color = BLUE) =>
  `<div style="display:inline-block;background:${color}18;border:1px solid ${color}40;border-radius:6px;padding:5px 12px;margin-bottom:20px;">
    <span style="color:${color};font-size:13px;font-weight:700;">${text}</span>
  </div>`;

const infoRow = (label, value) =>
  `<tr>
    <td style="padding:10px 0;color:#64748b;font-size:13px;font-weight:600;width:140px;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:500;border-bottom:1px solid #f1f5f9;">${value || '—'}</td>
  </tr>`;

const infoTable = (rows) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="background:${BLUE_BG};border:1px solid ${BLUE_GLOW};border-radius:12px;padding:4px 20px;margin:20px 0;">
    ${rows}
  </table>`;

const alertBox = (text, type = 'info') => {
  const styles = {
    info:    { bg: '#f0f9ff', border: BLUE,     color: '#0369a1' },
    success: { bg: '#f0fdf4', border: '#22c55e', color: '#15803d' },
    warning: { bg: '#fefce8', border: '#eab308', color: '#854d0e' },
    danger:  { bg: '#fef2f2', border: '#ef4444', color: '#991b1b' }
  };
  const s = styles[type] || styles.info;
  return `<div style="background:${s.bg};border-left:4px solid ${s.border};border-radius:8px;padding:14px 18px;margin:20px 0;">
    <p style="margin:0;color:${s.color};font-size:14px;font-weight:600;">${text}</p>
  </div>`;
};

// ─── Templates ───────────────────────────────────────────────────────────────

// Auth
const welcomeUser = ({ name }) =>
  baseLayout(`
    ${badge('Welcome!')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Hi ${name}, welcome to Behold Aspire!</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">Your account has been created. We're glad to have you here.</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Behold Aspire connects you with expert counsellors and psychologists to help you grow and thrive.</p>
    ${divider()}
    <h3 style="color:${BLUE};font-size:15px;margin:0 0 10px;">What you can do now:</h3>
    <ul style="color:#475569;font-size:14px;line-height:2.0;padding-left:18px;margin:0 0 8px;">
      <li>Browse and book sessions with top counsellors</li>
      <li>Take the CIGI career aptitude assessment</li>
      <li>Access expert mental health &amp; career resources</li>
    </ul>
    ${btn('Explore Behold Aspire →', 'https://www.behold.co.in')}
  `);

const welcomeCounsellor = ({ name }) =>
  baseLayout(`
    ${badge('Application Received')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Hi ${name}!</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">Thank you for applying to join the Behold Aspire counsellor network. Your application is currently <strong>under review</strong> by our admin team.</p>
    ${alertBox('⏳ Expected review time: 24–48 hours', 'warning')}
    ${btn('Go to Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

const passwordResetOTP = ({ name, otp }) =>
  baseLayout(`
    ${badge('Security — Password Reset')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Password Reset Code</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${name || 'there'}</strong>, here is your one-time verification code to reset your password.</p>
    <div style="text-align:center;margin:32px 0;">
      <p style="margin:0 0 10px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your Code</p>
      <div style="display:inline-block;background:#0f172a;color:#ffffff;font-size:38px;font-weight:900;letter-spacing:14px;padding:20px 36px;border-radius:14px;font-family:monospace;">${otp}</div>
      <p style="margin:14px 0 0;font-size:13px;color:#ef4444;font-weight:600;">Expires in 10 minutes</p>
    </div>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">If you didn't request this, please ignore this email.</p>
  `);

// ── SESSION BOOKING EMAILS ─────────────────────────────────────────────────

/** Sent to STUDENT when they submit a booking */
const appointmentBooked = ({ userName, counsellorName, date, time, mode, platform }) =>
  baseLayout(`
    ${badge('Booking Submitted', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Your session request is submitted!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${userName}</strong>, your booking request has been received. You'll be notified once your psychologist confirms.</p>
    ${infoTable(`
      ${infoRow('Psychologist', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${platform ? infoRow('Platform', platform) : ''}
    `)}
    ${alertBox('⏳ Status: Pending Confirmation — awaiting psychologist approval', 'warning')}
    ${btn('View My Bookings →', 'https://www.behold.co.in/profile?tab=booked')}
  `);

/** Sent to PSYCHOLOGIST when a student books */
const appointmentBookedCounsellor = ({ userName, counsellorName, date, time, mode }) =>
  baseLayout(`
    ${badge('New Booking Request', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">You have a new session request!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${counsellorName}</strong>, a student has requested a session with you.</p>
    ${infoTable(`
      ${infoRow('Student', userName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    <p style="margin:0 0 4px;color:#475569;font-size:14px;line-height:1.6;">Please log in to your dashboard to approve or decline this request.</p>
    ${btn('Review in Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

/** Sent to STUDENT when booking is approved */
const appointmentApproved = ({ userName, counsellorName, date, time, mode, meetLink }) =>
  baseLayout(`
    ${badge('Session Confirmed ✓', '#22c55e')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Your session is confirmed!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Great news, <strong>${userName}</strong>! Your psychologist has confirmed your session.</p>
    ${infoTable(`
      ${infoRow('Psychologist', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Join Link', `<a href="${meetLink}" style="color:${BLUE};font-weight:700;">Click to Join Meeting</a>`) : ''}
    `)}
    ${alertBox('✅ Your session is confirmed — please be on time!', 'success')}
    ${meetLink ? btn('Join Meeting →', meetLink) : btn('View Booking →', 'https://www.behold.co.in/profile?tab=booked')}
  `);

/** Sent to PSYCHOLOGIST when they approve a booking */
const appointmentApprovedCounsellor = ({ userName, counsellorName, date, time, mode, meetLink }) =>
  baseLayout(`
    ${badge('Session Confirmed ✓', '#22c55e')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session confirmed with ${userName}</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${counsellorName}</strong>, your upcoming session is confirmed.</p>
    ${infoTable(`
      ${infoRow('Student', userName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BLUE};font-weight:700;">Open Meeting</a>`) : ''}
    `)}
    ${alertBox('✅ Session confirmed — student has been notified.', 'success')}
    ${meetLink ? btn('Start Meeting →', meetLink) : btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

/** Sent to STUDENT when booking is rejected */
const appointmentRejected = ({ userName, counsellorName, date, reason }) =>
  baseLayout(`
    ${badge('Session Update')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session could not be confirmed</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${userName}</strong>, unfortunately your session request could not be confirmed at this time.</p>
    ${infoTable(`
      ${infoRow('Psychologist', counsellorName)}
      ${infoRow('Requested Date', date)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    <p style="margin:16px 0;color:#475569;font-size:14px;line-height:1.7;">You can browse other available psychologists on our platform.</p>
    ${btn('Find Another Psychologist →', 'https://www.behold.co.in/advisors')}
  `);

/** Sent to STUDENT/COUNSELLOR when cancelled */
const appointmentCancelled = ({ recipientName, otherPartyName, date, time, cancelledBy, reason }) =>
  baseLayout(`
    ${badge('Session Cancelled', '#ef4444')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session cancelled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, your session has been cancelled.</p>
    ${infoTable(`
      ${infoRow('With', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Cancelled By', cancelledBy)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    ${btn('Book a New Session →', 'https://www.behold.co.in/advisors')}
  `);

const appointmentCancelledCounsellor = ({ recipientName, otherPartyName, date, time, cancelledBy, reason }) =>
  baseLayout(`
    ${badge('Session Cancelled', '#ef4444')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session with ${otherPartyName} cancelled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, the following session has been cancelled.</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Cancelled By', cancelledBy)}
      ${reason ? infoRow('Reason', reason) : ''}
    `)}
    ${btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

/** Sent to both parties when rescheduled */
const appointmentRescheduled = ({ recipientName, otherPartyName, newDate, newTime, mode }) =>
  baseLayout(`
    ${badge('Session Rescheduled', '#f59e0b')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Your session has been rescheduled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, your session with <strong>${otherPartyName}</strong> has been moved to a new time.</p>
    ${infoTable(`
      ${infoRow('New Date', newDate)}
      ${infoRow('New Time', newTime)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    ${alertBox('⏳ Awaiting re-confirmation from the psychologist.', 'warning')}
    ${btn('View Updated Booking →', 'https://www.behold.co.in/profile?tab=booked')}
  `);

const appointmentRescheduledCounsellor = ({ recipientName, otherPartyName, newDate, newTime, mode }) =>
  baseLayout(`
    ${badge('Session Rescheduled', '#f59e0b')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session with ${otherPartyName} rescheduled</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, a session has been rescheduled and requires your approval.</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('New Date', newDate)}
      ${infoRow('New Time', newTime)}
      ${infoRow('Mode', mode || 'Online')}
    `)}
    ${btn('Review in Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

/** Day-of reminder */
const appointmentReminder = ({ recipientName, otherPartyName, date, time, mode, meetLink }) =>
  baseLayout(`
    ${badge('Session Reminder — Today!', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Your session is today</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, this is a reminder about your session with <strong>${otherPartyName}</strong> today.</p>
    ${infoTable(`
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Join Link', `<a href="${meetLink}" style="color:${BLUE};font-weight:700;">Click to Join</a>`) : ''}
    `)}
    ${meetLink ? btn('Join Meeting Now →', meetLink) : btn('View My Dashboard →', 'https://www.behold.co.in/profile?tab=booked')}
  `);

const appointmentReminderCounsellor = ({ recipientName, otherPartyName, date, time, mode, meetLink }) =>
  baseLayout(`
    ${badge('Session Reminder — Today!', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Session today with ${otherPartyName}</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName}</strong>, you have a session today.</p>
    ${infoTable(`
      ${infoRow('Student', otherPartyName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Mode', mode || 'Online')}
      ${meetLink ? infoRow('Meeting Link', `<a href="${meetLink}" style="color:${BLUE};font-weight:700;">Open Link</a>`) : ''}
    `)}
    ${meetLink ? btn('Start Meeting →', meetLink) : btn('View Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

/** Payment receipt — student only */
const paymentReceipt = ({ userName, amount, appointmentDate, appointmentTime, counsellorName, transactionId }) =>
  baseLayout(`
    ${badge('Payment Confirmed', '#22c55e')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Payment Successful!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${userName}</strong>, your payment has been received. Here is your receipt.</p>
    ${infoTable(`
      ${infoRow('Amount Paid', `<strong style="color:${BLUE};font-size:16px;">₹${amount}</strong>`)}
      ${infoRow('Psychologist', counsellorName)}
      ${infoRow('Session Date', appointmentDate)}
      ${infoRow('Session Time', appointmentTime)}
      ${transactionId ? infoRow('Transaction ID', `<code style="font-size:12px;background:#f1f5f9;padding:2px 6px;border-radius:4px;">${transactionId}</code>`) : ''}
    `)}
    ${alertBox('✅ Payment received — your session is awaiting psychologist confirmation.', 'success')}
    ${btn('View My Bookings →', 'https://www.behold.co.in/profile?tab=booked')}
  `);

/** Admin: Counsellor verified */
const counsellorVerified = ({ name }) =>
  baseLayout(`
    ${badge('Profile Verified ✓', '#22c55e')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">You're now verified!</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">Congratulations, <strong>${name}</strong>! Your psychologist profile has been reviewed and <strong>approved</strong> by the Behold Aspire admin team.</p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Your profile is now live and students can book sessions with you. Complete your availability to start receiving bookings.</p>
    ${btn('Go to Your Dashboard →', 'https://www.behold.co.in/counsellor')}
  `);

const counsellorRejected = ({ name, reason }) =>
  baseLayout(`
    ${badge('Application Update')}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Application Update</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${name}</strong>, after reviewing your application, we are unable to approve your profile at this time.</p>
    ${reason ? alertBox(`<strong>Reason:</strong> ${reason}`, 'danger') : ''}
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">Contact our support team if you believe this is an error.</p>
    ${btn('Contact Support →', 'mailto:support@behold.co.in')}
  `);

/** Admin broadcast */
const broadcastEmail = ({ title, message, recipientName }) =>
  baseLayout(`
    ${badge('Announcement', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">${title}</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${recipientName || 'there'}</strong>,</p>
    <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:16px 0;border:1px solid #e2e8f0;">
      <p style="margin:0;color:#334155;font-size:15px;line-height:1.8;white-space:pre-line;">${message}</p>
    </div>
    ${btn('Visit Behold Aspire →', 'https://www.behold.co.in')}
  `);

/** Meet link notification */
const meetLinkAdded = ({ userName, counsellorName, date, time, meetLink }) =>
  baseLayout(`
    ${badge('Meeting Link Ready', BLUE)}
    <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;font-weight:800;">Your meeting link is ready!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">Hi <strong>${userName}</strong>, your psychologist has added the meeting link for your upcoming session.</p>
    ${infoTable(`
      ${infoRow('Psychologist', counsellorName)}
      ${infoRow('Date', date)}
      ${infoRow('Time', time)}
      ${infoRow('Join Link', `<a href="${meetLink}" style="color:${BLUE};font-weight:700;">Click to Join Session</a>`)}
    `)}
    ${btn('Join Meeting →', meetLink)}
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
