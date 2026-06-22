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

