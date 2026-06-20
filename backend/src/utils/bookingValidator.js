const StorageService = require('../services/storageService');

const parseDateTime = (dateStr, timeStr) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [timeParts, modifier] = timeStr.split(' ');
    let [hours, minutes] = timeParts.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes);
  } catch (e) {
    return null;
  }
};

const validateBookingDetails = async (counsellorId, date, time, mode, service, appointmentIdToExclude = null) => {
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

  // 3. Mode preference compatibility check
  const availableModes = Array.isArray(counsellor.modes) ? counsellor.modes : ['ONLINE', 'OFFLINE'];
  if (!availableModes.includes(mode)) {
    return { valid: false, message: `Counsellor does not support session mode: ${mode}` };
  }

  // 4. Double booking check
  const existingAppts = await StorageService.findAll('appointments', {
    counsellorId,
    date,
    time
  });
  
  const isDoubleBooked = existingAppts.some(appt => {
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

  const dayOfWeek = selectedDateTime.getDay(); // 0 = Sunday, 6 = Saturday
  const isDayActive = availability.activeDays[dayOfWeek];
  if (!isDayActive) {
    const weekdayName = selectedDateTime.toLocaleDateString('en-IN', { weekday: 'long' });
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
