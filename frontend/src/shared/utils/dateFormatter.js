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
        } else {
          // MM-DD-YYYY or DD-MM-YYYY
          [month, day, year] = parts.map(Number);
        }
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts[0].length === 4) {
          // YYYY/MM/DD
          [year, month, day] = parts.map(Number);
        } else {
          // MM/DD/YYYY
          [month, day, year] = parts.map(Number);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput);
  }
};

export const calculateNextAvailable = (availability, bookedSlots) => {
  if (!availability || !availability.availableSlots || availability.availableSlots.length === 0) {
    return 'Unavailable';
  }

  const activeDays = availability.activeDays || {};
  const hasActiveDays = Object.values(activeDays).some(v => v === true);
  if (!hasActiveDays) {
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
    const parts = timeStr.trim().split(/\s+/);
    if (parts.length < 2) return 0;
    const [time, meridiem] = parts;
    const timeParts = time.split(':');
    let hours = Number(timeParts[0]);
    let minutes = Number(timeParts[1] || 0);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Check next 30 days
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + i);
    
    const dayOfWeek = checkDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const isDayActive = activeDays[dayOfWeek] === true || activeDays[String(dayOfWeek)] === true;
    
    if (isDayActive) {
      const dateStr = formatDateStringLocal(checkDate);
      const bookingsForDate = (bookedSlots || []).filter(b => b && b.date === dateStr);
      
      const freeSlots = availability.availableSlots.filter(slot => {
        const isBooked = bookingsForDate.some(b => b.time === slot);
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

