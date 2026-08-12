const { google } = require('googleapis');

/**
 * Helper to generate a friction-free meeting link for online counselling sessions.
 * 
 * Fixes "Ask to Join" issue:
 * 1. Sets organizer: { email: counsellor.email, displayName: counsellor.name, self: true }
 * 2. Does NOT place counsellor inside attendees array (counsellor IS the calendar owner/organizer)
 * 3. Sets guestsCanModify: true, guestsCanInviteOthers: false, guestsCanSeeOtherGuests: true
 * 4. Fallbacks to counsellor.defaultMeetLink or instant secure room URL (meet.jit.si) if Google API fails or is unconnected.
 */
async function generateSessionMeetingLink({ counsellor, user, date, time, service, appointmentId, durationMinutes }) {
  let meetingLink = counsellor?.defaultMeetLink || '';
  const fallbackRoomLink = `https://meet.jit.si/behold-aspire-${appointmentId || Date.now()}`;

  const keyId = process.env.GOOGLE_CLIENT_ID;
  const keySecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://www.behold.co.in/api/google/callback';

  // ONLY use central system OAuth refresh token so event is created exclusively by central system account (beholdoffice@gmail.com / admin@behold.co.in)
  // NEVER fall back to psychologist's personal OAuth token to prevent emails being sent from psychologist's personal email
  const refreshToken = (process.env.SYSTEM_GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN || '').trim();

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

      const rawUrl = (process.env.FRONTEND_URL || 'https://www.behold.co.in').trim();
      const baseDomain = rawUrl.replace(/\/counsellor\/?$/, '').replace(/\/profile\/?$/, '').replace(/\/$/, '');
      const organizerEmail = (process.env.RESEND_FROM_EMAIL || process.env.GMAIL_USER || 'beholdoffice@gmail.com').trim();

      const studentName = user?.name || 'Student';
      const counsellorName = counsellor?.name || 'Psychologist';

      const attendees = [
        { email: organizerEmail, displayName: 'BEHOLD Aspire', responseStatus: 'accepted', organizer: true }
      ];
      if (user && user.email && user.email.toLowerCase() !== organizerEmail.toLowerCase()) {
        attendees.push({ email: user.email, displayName: studentName, responseStatus: 'accepted' });
      }
      if (counsellor && counsellor.email && counsellor.email.toLowerCase() !== organizerEmail.toLowerCase()) {
        attendees.push({ email: counsellor.email, displayName: counsellorName, responseStatus: 'accepted' });
      }

      const event = {
        summary: `BEHOLD Counselling Session: ${studentName} & ${counsellorName}`,
        description: `Service: ${service || 'counselling'}\nMode: ONLINE (Google Meet)`,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        organizer: { email: organizerEmail, displayName: 'BEHOLD Aspire', self: true },
        attendees,
        guestsCanModify: true,
        guestsCanInviteOthers: true,
        guestsCanSeeOtherGuests: true,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 0 },
            { method: 'email', minutes: 0 }
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
      console.error('[Google Calendar API Warning]: Could not create event via Google API, using default/fallback room:', calError.message);
    }
  }

  // Fallback to counsellor defaultMeetLink or Jitsi instant link
  if (!meetingLink || meetingLink.trim() === '') {
    meetingLink = fallbackRoomLink;
  }

  return meetingLink;
}

module.exports = { generateSessionMeetingLink };
