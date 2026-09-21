const { google } = require('googleapis');
const crypto = require('crypto');

/**
 * Converts any seed / appointment ID into a deterministic 10-character Google Meet room code (xxx-yyyy-zzz).
 */
function formatToGoogleMeetCode(appointmentId) {
  if (!appointmentId) return 'beh-olds-ess';
  const clean = String(appointmentId).trim();
  if (clean.startsWith('https://meet.google.com/')) {
    return clean.replace('https://meet.google.com/', '').split('?')[0].trim();
  }
  const hash = crypto.createHash('md5').update(clean).digest('hex');
  let letters = '';
  for (let i = 0; i < hash.length && letters.length < 10; i++) {
    const code = hash.charCodeAt(i);
    const charCode = code <= 57 ? 97 + (code - 48) : 107 + (code - 97);
    letters += String.fromCharCode(charCode);
  }
  while (letters.length < 10) letters += 'a';
  return `${letters.slice(0, 3)}-${letters.slice(3, 7)}-${letters.slice(7, 10)}`;
}

/**
 * Builds a deterministic canonical Google Meet room URL for an appointment.
 */
function buildDirectRoomUrl(appointmentId) {
  if (!appointmentId) return 'https://meet.google.com/beh-olds-ess';
  const clean = String(appointmentId).trim();
  if (clean.startsWith('https://meet.google.com/')) {
    return clean;
  }
  const code = formatToGoogleMeetCode(clean);
  return `https://meet.google.com/${code}`;
}

const buildGoogleMeetUrl = buildDirectRoomUrl;

/**
 * Validates whether a provided meeting link is legitimate Google Meet link and not 'meet.google.com/new'.
 */
function isValidCustomMeetLink(link) {
  if (!link || typeof link !== 'string') return false;
  const trimmed = link.trim().toLowerCase();
  if (!trimmed.startsWith('https://meet.google.com/')) return false;
  if (trimmed === 'https://meet.google.com/new' || trimmed.endsWith('/new')) return false;
  return true;
}

/**
 * Helper to generate a Google Meet link for online counselling sessions.
 * 
 * Flow:
 * 1. Checks SYSTEM_GOOGLE_REFRESH_TOKEN / GOOGLE_REFRESH_TOKEN first.
 * 2. If system token is not configured, gracefully falls back to counsellor.googleRefreshToken if connected.
 * 3. Creates the Google Calendar Event with Google Meet video conference.
 * 4. Fallbacks to instant canonical Google Meet room URL (meet.google.com/xxx-yyyy-zzz) if Google API is not configured or fails.
 */
async function generateSessionMeetingLink({ counsellor, user, date, time, service, appointmentId, durationMinutes }) {
  const directRoomLink = buildDirectRoomUrl(appointmentId);
  let meetingLink = isValidCustomMeetLink(counsellor?.defaultMeetLink) ? counsellor.defaultMeetLink.trim() : '';

  const keyId = process.env.GOOGLE_CLIENT_ID;
  const keySecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://www.behold.co.in/api/google/callback';

  // Primary: Central system OAuth refresh token
  // Fallback: Counsellor's connected Google Calendar token
  const systemRefreshToken = (process.env.SYSTEM_GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || '').trim();
  const counsellorRefreshToken = (counsellor?.googleRefreshToken || '').trim();
  const refreshToken = systemRefreshToken || counsellorRefreshToken;

  if (keyId && keySecret && refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(keyId, keySecret, redirectUri);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Parse date and time
      const [year, month, day] = (date || '').split('-').map(Number);
      let [timePart, period] = (time || '10:00 AM').split(' ');
      let [hours, minutes] = (timePart || '10:00').split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      const startTimeStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
      const startTime = new Date(startTimeStr);
      const durationMs = (Number(durationMinutes) || 60) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);

      const isSystemAccount = Boolean(systemRefreshToken);
      const organizerEmail = isSystemAccount
        ? (process.env.RESEND_FROM_EMAIL || process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim()
        : (counsellor?.googleEmail || counsellor?.email || 'beholdoffice@gmail.com').trim();

      const { resolveStudentName } = require('./phoneUtils');
      const studentName = resolveStudentName(user?.name) || 'Student';
      const counsellorName = counsellor?.name || 'Psychologist';

      const attendees = [];
      if (organizerEmail) {
        attendees.push({
          email: organizerEmail,
          displayName: isSystemAccount ? 'BEHOLD.' : counsellorName,
          responseStatus: 'accepted',
          organizer: true
        });
      }

      if (user && user.email && user.email.toLowerCase() !== organizerEmail.toLowerCase() && !user.email.includes('@temp.behold')) {
        attendees.push({ email: user.email, displayName: studentName, responseStatus: 'accepted' });
      }

      if (counsellor && counsellor.email && counsellor.email.toLowerCase() !== organizerEmail.toLowerCase() && !counsellor.email.includes('@temp.behold')) {
        attendees.push({ email: counsellor.email, displayName: counsellorName, responseStatus: 'accepted' });
      }

      const eventDescription = [
        `🧠 BEHOLD. Psychological Counselling & Consultation Session`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `• Psychologist: ${counsellorName}`,
        `• Client/Student: ${studentName}`,
        `• Date: ${date}`,
        `• Time: ${time}`,
        `• Duration: ${Number(durationMinutes) || 60} Minutes`,
        `• Service: ${service || 'Emotional Wellbeing & Counselling'}`,
        `• Mode: ONLINE Video Consultation`,
        ``,
        `📌 Note: Please join the meeting 5 minutes before scheduled start time. Ensure you have a quiet and private space with a stable internet connection.`,
        ``,
        `Direct Room Backup: ${directRoomLink}`,
        `For support or queries, visit https://www.behold.co.in or email support@behold.co.in.`
      ].join('\n');

      const event = {
        summary: `BEHOLD Counselling Session: ${counsellorName} & ${studentName}`,
        description: eventDescription,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        organizer: { email: organizerEmail, displayName: isSystemAccount ? 'BEHOLD.' : counsellorName, self: true },
        attendees,
        guestsCanModify: true,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 },
            { method: 'popup', minutes: 10 },
            { method: 'email', minutes: 1440 }
          ]
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      if (response.data && response.data.hangoutLink) {
        meetingLink = response.data.hangoutLink;
        console.log(`[Google Calendar Success]: Generated Google Meet link for appointment ${appointmentId}: ${meetingLink}`);
        return meetingLink;
      }
    } catch (calError) {
      console.error('[Google Calendar API Warning]: Could not create event via Google API, using direct room:', calError.message);
    }
  }

  // Fallback to validated counsellor defaultMeetLink or direct room link
  if (!meetingLink || meetingLink.trim() === '') {
    meetingLink = directRoomLink;
  }

  return meetingLink;
}

/**
 * Builds a direct web URL to add the session event to Google Calendar (1-click calendar sync).
 * Accurately converts IST (UTC+05:30) date and time to ISO UTC format for Google Calendar template.
 */
function buildGoogleCalendarWebUrl({
  title = 'BEHOLD Counselling Session',
  description = '',
  advisorName = '',
  studentName = '',
  location = 'Google Meet',
  meetLink = '',
  service = 'Psychological Counselling',
  date,
  time,
  durationMinutes = 60
}) {
  if (!date || !time) return '';
  try {
    const [year, month, day] = date.split('-').map(Number);
    let [timePart, period] = (time || '10:00 AM').split(' ');
    let [hours, minutes] = (timePart || '10:00').split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Fixed IST offset (UTC+5:30)
    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const startUtcMs = Date.UTC(year, month - 1, day, hours, minutes) - istOffsetMs;
    const endUtcMs = startUtcMs + (Number(durationMinutes) || 60) * 60 * 1000;

    const pad = (n) => String(n).padStart(2, '0');
    const toUtcStr = (ms) => {
      const d = new Date(ms);
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const datesParam = `${toUtcStr(startUtcMs)}/${toUtcStr(endUtcMs)}`;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('dates', datesParam);

    const fullDescription = description || [
      `🧠 BEHOLD. Psychological Counselling & Consultation Session`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      advisorName ? `• Psychologist: ${advisorName}` : '',
      studentName ? `• Client/Student: ${studentName}` : '',
      `• Date: ${date}`,
      `• Time: ${time} (IST)`,
      `• Duration: ${durationMinutes} Minutes`,
      `• Service: ${service}`,
      meetLink ? `• Direct Video Room: ${meetLink}` : '',
      ``,
      `📌 Note: Please join 5 minutes early in a quiet, private space.`,
      ``,
      `Support: support@behold.co.in | https://www.behold.co.in`
    ].filter(Boolean).join('\n');

    url.searchParams.set('details', fullDescription);
    if (meetLink || location) {
      url.searchParams.set('location', meetLink || location);
    }

    return url.toString();
  } catch (err) {
    console.error('[buildGoogleCalendarWebUrl Error]:', err);
    return '';
  }
}

module.exports = {
  generateSessionMeetingLink,
  buildDirectRoomUrl,
  buildGoogleMeetUrl,
  formatToGoogleMeetCode,
  isValidCustomMeetLink,
  buildGoogleCalendarWebUrl
};
