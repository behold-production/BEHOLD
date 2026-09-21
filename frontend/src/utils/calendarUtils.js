/**
 * Calendar and Date utilities for booking sessions, Google Calendar integration, and ICS downloads.
 */

export function toLocalDateString(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getLocalTodayString() {
  return toLocalDateString(new Date());
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim();
  const [time, meridiem] = clean.split(' ');
  if (!time) return 0;
  let [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) minutes = 0;
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function getTimeBucket(timeStr) {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17 * 60) return 'afternoon';
  return 'evening';
}

export function getTimeIntervalLabel(timeStr, durationMinutes = 60) {
  if (!timeStr) return '';
  try {
    const startMins = parseTimeToMinutes(timeStr);
    const endMins = startMins + (Number(durationMinutes) || 60);

    const formatMins = (totalMins) => {
      let h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    };

    return `${timeStr} - ${formatMins(endMins)}`;
  } catch (e) {
    return timeStr;
  }
}

/**
 * Returns date for target weekday (0=Sun, 1=Mon, ..., 6=Sat).
 * If today is already that weekday, returns today.
 */
export function getSmartWeekdayDate(targetWeekday, fromDate = new Date()) {
  const result = new Date(fromDate);
  result.setHours(0, 0, 0, 0);
  const current = result.getDay();
  let diff = (targetWeekday - current + 7) % 7;
  // If today is target weekday, keep today (diff = 0)
  result.setDate(result.getDate() + diff);
  return result;
}

/**
 * Creates an instant Google Calendar event template URL.
 * Converts IST (UTC+05:30) date & time to ISO UTC string for Google Calendar render URL.
 */
export function createGoogleCalendarUrl({
  title = 'BEHOLD Counselling Session',
  description = '',
  advisorName = '',
  studentName = '',
  location = 'Google Meet',
  meetLink = '',
  service = 'Psychological Counselling',
  date, // 'YYYY-MM-DD'
  time, // '10:00 AM'
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
    const durationMs = (Number(durationMinutes) || 60) * 60 * 1000;
    const endUtcMs = startUtcMs + durationMs;

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
      studentName ? `• Client: ${studentName}` : '',
      `• Date: ${date}`,
      `• Time: ${time} (IST)`,
      `• Duration: ${durationMinutes} Minutes`,
      `• Service: ${service}`,
      meetLink ? `• Video Room: ${meetLink}` : '',
      ``,
      `📌 Note: Please join the session 5 minutes early. Ensure you have a quiet and private space.`,
      ``,
      `Support: support@behold.co.in | https://www.behold.co.in`
    ].filter(Boolean).join('\n');

    url.searchParams.set('details', fullDescription);
    if (meetLink || location) url.searchParams.set('location', meetLink || location);

    return url.toString();
  } catch (e) {
    console.error('Error generating Google Calendar URL:', e);
    return '';
  }
}

/**
 * Triggers a download of a standard .ics calendar file.
 */
export function downloadIcsFile({
  title = 'BEHOLD Counselling Session',
  description = 'Private psychological counselling session via BEHOLD.',
  location = 'Google Meet',
  date,
  time,
  durationMinutes = 60,
  filename = 'behold-session.ics'
}) {
  if (!date || !time) return;
  try {
    const [year, month, day] = date.split('-').map(Number);
    let [timePart, period] = (time || '10:00 AM').split(' ');
    let [hours, minutes] = (timePart || '10:00').split(':').map(Number);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Fixed IST offset (UTC+5:30)
    const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
    const startUtcMs = Date.UTC(year, month - 1, day, hours, minutes) - istOffsetMs;
    const durationMs = (Number(durationMinutes) || 60) * 60 * 1000;
    const endUtcMs = startUtcMs + durationMs;

    const pad = (n) => String(n).padStart(2, '0');
    const toIcsDate = (ms) => {
      const d = new Date(ms);
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BEHOLD//Counselling Session//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:behold-${Date.now()}@behold.co.in`,
      `DTSTAMP:${toIcsDate(Date.now())}`,
      `DTSTART:${toIcsDate(startUtcMs)}`,
      `DTEND:${toIcsDate(endUtcMs)}`,
      `SUMMARY:${title.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`,
      `LOCATION:${location.replace(/,/g, '\\,')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Error downloading ICS file:', e);
  }
}
