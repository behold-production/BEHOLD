const StorageService = require('../services/storageService');

const parseDateTime = (dateStr, timeStr) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [timeParts, modifier] = timeStr.split(' ');
    let [hours, minutes] = timeParts.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
    return new Date(isoStr);
  } catch (e) {
    return null;
  }
};

const validateBookingDetails = async (counsellorId, date, time, mode, service, appointmentIdToExclude = null, clientLatitude = null, clientLongitude = null) => {
  // 1. Past date check
  const now = new Date();
  const selectedDateTime = parseDateTime(date, time);
  if (!selectedDateTime || isNaN(selectedDateTime.getTime())) {
    return { valid: false, message: 'Invalid date or time format' };
  }
  if (selectedDateTime <= now) {
    return { valid: false, message: 'Cannot book a date or time in the past' };
  }
  const leadTimeMs = 30 * 60 * 1000; // 30 minutes lead time
  if (selectedDateTime.getTime() - now.getTime() < leadTimeMs) {
    return { valid: false, message: 'Sessions must be booked at least 30 minutes in advance.' };
  }

  // 2. Fetch counsellor
  const counsellor = await StorageService.findById('counsellors', counsellorId);
  if (!counsellor) {
    return { valid: false, message: 'Counsellor not found' };
  }
  if (counsellor.isActive === false) {
    return { valid: false, message: 'This psychologist is temporarily suspended or unavailable.' };
  }

  // Check global mode constraints
  const settingsList = await StorageService.findAll('settings');
  const settings = settingsList[0] || {};
  if (mode === 'ONLINE' && settings.enableOnline === false) {
    return { valid: false, message: 'Online video consultation sessions are temporarily disabled by the administrator.' };
  }
  if (mode === 'OFFLINE' && settings.enableOffline === false) {
    return { valid: false, message: 'Offline at-center sessions are temporarily disabled by the administrator.' };
  }
  if (mode === 'DOOR_STEP' && settings.enableDoorstep === false) {
    return { valid: false, message: 'Doorstep home visit sessions are temporarily disabled by the administrator.' };
  }

  // 3. Mode preference compatibility check
  const availableModes = Array.isArray(counsellor.modes) ? counsellor.modes : ['ONLINE', 'OFFLINE'];
  if (!availableModes.includes(mode)) {
    return { valid: false, message: `Counsellor does not support session mode: ${mode}` };
  }

  // 3.1 Doorstep location distance check (10 km limit)
  if (mode === 'DOOR_STEP') {
    if (clientLatitude === undefined || clientLatitude === null || clientLongitude === undefined || clientLongitude === null) {
      return { valid: false, message: 'Your location coordinates (latitude and longitude) are required for doorstep sessions.' };
    }
    const lat1 = Number(clientLatitude);
    const lon1 = Number(clientLongitude);
    const lat2 = Number(counsellor.latitude);
    const lon2 = Number(counsellor.longitude);
    if (isNaN(lat1) || isNaN(lon1)) {
      return { valid: false, message: 'Invalid client location coordinates.' };
    }
    if (!lat2 && !lon2) {
      return { valid: false, message: 'Doorstep booking is temporarily unavailable for this psychologist (counsellor has not set their location center).' };
    }

    // Haversine formula
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance > 10) {
      return { valid: false, message: `Your location is ${distance.toFixed(2)} km away. Doorstep service is only available within a 10 km radius of the counsellor's location (${counsellor.locationName || 'their center'}).` };
    }
  }

  // 4. Double booking check
  const existingAppts = await StorageService.findAll('appointments', {
    counsellorId,
    date,
    time
  });

  const isDoubleBooked = existingAppts.some((appt) => {
    if (appointmentIdToExclude && appt.id === appointmentIdToExclude) {
      return false;
    }
    return appt.status !== 'CANCELLED' && appt.status !== 'REJECTED';
  });

  if (isDoubleBooked) {
    return { valid: false, message: 'This slot is already booked for this counsellor. Please select another slot.' };
  }

  // 5. Counsellor Availability Schedule check
  const availability = counsellor.availability;
  if (!availability || !availability.activeDays || !availability.availableSlots) {
    return { valid: false, message: 'Counsellor has no availability configured.' };
  }

  const [year, month, day] = date.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Sunday, 6 = Saturday
  const isDayActive = availability.activeDays[dayOfWeek];
  if (!isDayActive) {
    const weekdayName = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'UTC' });
    return { valid: false, message: `Counsellor is not available on ${weekdayName}s.` };
  }

  if (!availability.availableSlots.includes(time)) {
    return { valid: false, message: `Counsellor is not available at ${time}.` };
  }

  return { valid: true, counsellor };
};

module.exports = {
  parseDateTime,
  validateBookingDetails
};
