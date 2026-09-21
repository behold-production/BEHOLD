const { google } = require('googleapis');

/**
 * Builds a direct, frictionless video consultation room URL.
 * Works instantly on all devices with zero account login, zero waiting rooms, and zero knocking/admissions.
 */
function buildDirectRoomUrl(appointmentId) {
  const cleanId = String(appointmentId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '-');
  return `https://meet.jit.si/BEHOLD-Consultation-${cleanId}`;
}

/**
 * Validates whether a provided meeting link is legitimate and not a placeholder or 'meet.google.com/new'.
 */
function isValidCustomMeetLink(link) {
  if (!link || typeof link !== 'string') return false;
  const trimmed = link.trim().toLowerCase();
  if (!trimmed.startsWith('https://')) return false;
  if (trimmed.includes('meet.google.com/new')) return false;
  if (trimmed.includes('meet.google.com/abc-defg-hij')) return false;
  if (trimmed.includes('meet.google.com/behold-aspire-session')) return false;
  if (trimmed.includes('meet.google.com/beh-olds-ess')) return false;
  return true;
}

/**
 * Helper to generate a friction-free meeting link for online counselling sessions.
 * 
 * Flow:
 * 1. Checks SYSTEM_GOOGLE_REFRESH_TOKEN / GOOGLE_REFRESH_TOKEN first.
 * 2. If system token is not configured, gracefully falls back to counsellor.googleRefreshToken if connected.
 * 3. Creates the Google Calendar Event with Google Meet video conference.
 * 4. Fallbacks to valid counsellor.defaultMeetLink or instant direct room URL (meet.jit.si) if Google API fails or is unconnected.
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

module.exports = { generateSessionMeetingLink, buildDirectRoomUrl, isValidCustomMeetLink };
