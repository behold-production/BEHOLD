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
async function generateSessionMeetingLink({ counsellor, user, date, time, service, appointmentId }) {
  let meetingLink = counsellor?.defaultMeetLink || '';
  const fallbackRoomLink = `https://meet.jit.si/Behold_Session_${appointmentId || Date.now()}`;

  if (counsellor && counsellor.googleRefreshToken) {
    try {
      const keyId = process.env.GOOGLE_CLIENT_ID;
      const keySecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google/callback';

      if (keyId && keySecret) {
        const oauth2Client = new google.auth.OAuth2(keyId, keySecret, redirectUri);
        oauth2Client.setCredentials({ refresh_token: counsellor.googleRefreshToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Parse date and time
        const [year, month, day] = (date || '').split('-');
        let [timePart, period] = (time || '10:00 AM').split(' ');
        let [hours, minutes] = (timePart || '10:00').split(':');
        hours = parseInt(hours, 10);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        const startTimeStr = `${year}-${month}-${day}T${hours.toString().padStart(2, '0')}:${minutes || '00'}:00+05:30`;
        const startTime = new Date(startTimeStr);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        const frontendUrl = process.env.FRONTEND_URL || 'https://behold-aspire.vercel.app';
        
        // Construct event: Counsellor is ORGANIZER, User is ATTENDEE.
        // DO NOT put counsellor in attendees array to avoid Google Meet treating them as guest!
        const event = {
          summary: `BEHOLD Session: ${user ? user.name : 'Student'} & ${counsellor.name}`,
          description: `Service: ${service || 'Psychological Counselling'}\nMode: ONLINE\n\nJoin Portal:\n- Student Portal: ${frontendUrl}/profile\n- Advisor Console: ${frontendUrl}/counsellor`,
          start: { dateTime: startTime.toISOString() },
          end: { dateTime: endTime.toISOString() },
          organizer: { email: counsellor.email, displayName: counsellor.name, self: true },
          attendees: user && user.email ? [{ email: user.email, displayName: user.name, responseStatus: 'accepted' }] : [],
          guestsCanModify: true,
          guestsCanInviteOthers: false,
          guestsCanSeeOtherGuests: true,
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
          console.log(`[Google Calendar Success]: Generated Meet link for appointment ${appointmentId}: ${meetingLink}`);
          return meetingLink;
        }
      }
    } catch (calError) {
      console.error('[Google Calendar API Warning]: Could not create event via Google API, falling back to default/instant room:', calError.message);
    }
  }

  // Fallback to defaultMeetLink or instant room
  if (!meetingLink || meetingLink.trim() === '') {
    meetingLink = fallbackRoomLink;
  }

  return meetingLink;
}

module.exports = { generateSessionMeetingLink };
