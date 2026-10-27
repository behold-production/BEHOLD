export const formatDateString = (dateInput) => {
  if (!dateInput) return '';
  try {
    let dateObj;
    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (typeof dateInput === 'number') {
      dateObj = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      // Extract date portion if it's ISO string (e.g., "YYYY-MM-DDTHH:mm:ss...")
      const dateStr = dateInput.split('T')[0];
      
      let year, month, day;
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          [year, month, day] = parts.map(Number);
        } else if (parts[2] && parts[2].length === 4) {
          // DD-MM-YYYY or MM-DD-YYYY
          const p0 = Number(parts[0]);
          const p1 = Number(parts[1]);
          const p2 = Number(parts[2]);
          if (p0 > 12) {
            // Definitely DD-MM-YYYY
            day = p0;
            month = p1;
            year = p2;
          } else {
            // Default to MM-DD-YYYY
            month = p0;
            day = p1;
            year = p2;
          }
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts[0].length === 4) {
          // YYYY/MM/DD
          [year, month, day] = parts.map(Number);
        } else if (parts[2] && parts[2].length === 4) {
          // DD/MM/YYYY or MM/DD/YYYY
          const p0 = Number(parts[0]);
          const p1 = Number(parts[1]);
          const p2 = Number(parts[2]);
          if (p0 > 12) {
            day = p0;
            month = p1;
            year = p2;
          } else {
            month = p0;
            day = p1;
            year = p2;
          }
        }
      }
      
      if (year && month && day && !isNaN(year) && !isNaN(month) && !isNaN(day)) {
        dateObj = new Date(year, month - 1, day);
      } else {
        // Fallback to standard JS parsing
        dateObj = new Date(dateInput);
      }
    } else {
      dateObj = new Date(dateInput);
    }

    if (!dateObj || isNaN(dateObj.getTime())) {
      return String(dateInput);
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput);
  }
};

export const getScheduleForDay = (availability, dayOfWeek) => {
  if (!availability) {
    return { isDayActive: true, slots: [], hasConfig: false };
  }

  let parsed = availability;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return { isDayActive: false, slots: [], hasConfig: true };
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    return { isDayActive: true, slots: [], hasConfig: false };
  }

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = DAY_NAMES[dayOfWeek];
  const dayNameLower = dayName ? dayName.toLowerCase() : '';
  const hasWeekdaySchedule = DAY_NAMES.some((name) => (
    Object.prototype.hasOwnProperty.call(parsed, name)
    || Object.prototype.hasOwnProperty.call(parsed, name.toLowerCase())
  ));

  const activeDays = parsed.activeDays;
  const hasActiveDaysConfig = activeDays && typeof activeDays === 'object' && Object.keys(activeDays).length > 0;

  let isDayActive = true;
  if (hasActiveDaysConfig) {
    isDayActive = Boolean(
      activeDays[dayOfWeek] === true ||
      activeDays[String(dayOfWeek)] === true ||
      (dayName && activeDays[dayName] === true) ||
      (dayNameLower && activeDays[dayNameLower] === true)
    );
  } else if (parsed[dayName] !== undefined || parsed[dayNameLower] !== undefined) {
    const direct = parsed[dayName] !== undefined ? parsed[dayName] : parsed[dayNameLower];
    isDayActive = Array.isArray(direct) ? direct.length > 0 : Boolean(direct);
  } else if (hasWeekdaySchedule) {
    isDayActive = false;
  }

  if (!isDayActive) {
    return { isDayActive: false, slots: [], hasConfig: true };
  }

  let rawSlots = [];
  const daySlots = parsed.daySlots;
  if (daySlots && typeof daySlots === 'object') {
    const s = daySlots[dayOfWeek] || daySlots[String(dayOfWeek)] || (dayName && daySlots[dayName]) || (dayNameLower && daySlots[dayNameLower]);
    if (Array.isArray(s) && s.length > 0) rawSlots = s;
  }

  if (rawSlots.length === 0 && (parsed[dayName] || parsed[dayNameLower])) {
    const s = parsed[dayName] || parsed[dayNameLower];
    if (Array.isArray(s) && s.length > 0) rawSlots = s;
  }

  if (rawSlots.length === 0 && Array.isArray(parsed.availableSlots) && parsed.availableSlots.length > 0) {
    rawSlots = parsed.availableSlots;
  }

  const hasConfig = Boolean(hasActiveDaysConfig) || Boolean(daySlots) || Boolean(parsed.availableSlots) || hasWeekdaySchedule;

  return { isDayActive: true, slots: rawSlots, hasConfig };
};

const parseTimeToMinutes = (value) => {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (minutes > 59 || hours > 24 || (hours === 24 && minutes !== 0)) return null;
  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === 'AM' && hours === 12) hours = 0;
    if (period === 'PM' && hours !== 12) hours += 12;
  }
  return hours * 60 + minutes;
};

export const hasOverlappingBooking = (date, time, durationMinutes, bookings = []) => {
  const requestedStart = parseTimeToMinutes(time);
  if (requestedStart === null) return true;
  const requestedDuration = Number(durationMinutes);
  if (!Number.isFinite(requestedDuration) || requestedDuration <= 0) return true;

  return bookings.some((booking) => {
    if (!booking || booking.date !== date) return false;
    const bookedStart = parseTimeToMinutes(booking.time);
    if (bookedStart === null) return booking.time === time;
    const bookedDuration = Number(booking.duration) === 30
      || (typeof booking.duration === 'string' && /\b30\b/.test(booking.duration))
      ? 30
      : 60;
    return requestedStart < bookedStart + bookedDuration
      && bookedStart < requestedStart + requestedDuration;
  });
};

export const getSessionStartTimes = (slots, durationMinutes = 60, stepMinutes = 30) => {
  if (!Array.isArray(slots)) return [];

  const formatMinutes = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  };
  const duration = Number(durationMinutes);
  const step = Number(stepMinutes);
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(step) || step <= 0) return [];

  const starts = new Set();
  for (const slot of slots) {
    if (typeof slot === 'string') {
      const start = parseTimeToMinutes(slot);
      if (start !== null) starts.add(formatMinutes(start));
      continue;
    }
    if (!slot || typeof slot !== 'object') continue;
    const start = parseTimeToMinutes(slot.start);
    const end = parseTimeToMinutes(slot.end);
    if (start === null || end === null || end <= start) continue;
    for (let time = start; time + duration <= end; time += step) {
      starts.add(formatMinutes(time));
    }
  }

  return [...starts].sort((first, second) => parseTimeToMinutes(first) - parseTimeToMinutes(second));
};

export const calculateNextAvailable = (availability, bookedSlots) => {
  if (!availability) {
    return 'Unavailable';
  }

  let parsed = availability;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return 'Unavailable'; }
  }
  if (!parsed || typeof parsed !== 'object') {
    return 'Unavailable';
  }

  const activeDays = parsed.activeDays || {};
  const hasActiveDaysConfig = Object.keys(activeDays).length > 0;
  const hasActiveDays = Object.values(activeDays).some(v => v === true);
  if (hasActiveDaysConfig && !hasActiveDays) {
    return 'Unavailable';
  }

  const hasAvailableSlotsConfig = Array.isArray(parsed.availableSlots);
  const hasDaySlotsConfig = parsed.daySlots && typeof parsed.daySlots === 'object';
  
  const hasAnySlots = (hasAvailableSlotsConfig && parsed.availableSlots.length > 0) ||
    (hasDaySlotsConfig && Object.values(parsed.daySlots).some(arr => Array.isArray(arr) && arr.length > 0)) ||
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].some(d => Array.isArray(parsed[d]) && parsed[d].length > 0);

  if ((hasAvailableSlotsConfig || hasDaySlotsConfig) && !hasAnySlots) {
    return 'Unavailable';
  }

  const today = new Date();
  
  const formatDateStringLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = String(timeStr).trim();
    // 12-hour format: e.g. "10:00 AM", "10:00AM", "10 AM"
    const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (match12) {
      let hours = Number(match12[1]);
      const minutes = Number(match12[2] || 0);
      const meridiem = match12[3].toUpperCase();
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    // 24-hour format: e.g. "14:30", "09:00"
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = Number(match24[1]);
      const minutes = Number(match24[2]);
      return hours * 60 + minutes;
    }
    // General whitespace split fallback
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      const [time, meridiem] = parts;
      const timeParts = time.split(':');
      let hours = Number(timeParts[0]);
      let minutes = Number(timeParts[1] || 0);
      if (meridiem && meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (meridiem && meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Check next 30 days
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + i);
    
    const dayOfWeek = checkDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const { isDayActive, slots } = getScheduleForDay(parsed, dayOfWeek);
    
    if (isDayActive) {
      const dateStr = formatDateStringLocal(checkDate);
      const bookingsForDate = (bookedSlots || []).filter(b => b && b.date === dateStr);
      
      const rawSlots = getSessionStartTimes(slots, 60);

      const freeSlots = rawSlots.filter(slot => {
        const isBooked = hasOverlappingBooking(dateStr, slot, 60, bookingsForDate);
        if (isBooked) return false;
        
        if (i === 0) {
          const slotMinutes = parseTimeToMinutes(slot);
          const currentMinutes = today.getHours() * 60 + today.getMinutes();
          return slotMinutes > currentMinutes;
        }
        
        return true;
      });

      if (freeSlots.length > 0) {
        if (i === 0) {
          return 'Available Today';
        } else if (i === 1) {
          return 'Available Tomorrow';
        } else {
          const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return `Available ${daysOfWeekNames[dayOfWeek]}`;
        }
      }
    }
  }

  return 'Unavailable';
};

export const formatTimeString = (timeInput) => {
  if (!timeInput) return '';
  const clean = String(timeInput).trim();
  
  if (clean.match(/AM|PM/i)) {
    return clean;
  }
  
  const match24 = clean.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    let hours = Number(match24[1]);
    const minutes = match24[2];
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${meridiem}`;
  }
  
  return clean;
};
