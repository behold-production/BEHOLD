export const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  try {
    let year, month, day;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        [year, month, day] = parts.map(Number);
      } else {
        // MM-DD-YYYY or DD-MM-YYYY
        // Check if the user specified format matches "06-17-2026" -> MM-DD-YYYY
        // Usually index 0 is month if it is <= 12, index 1 is day if it is <= 31.
        // Let's assume MM-DD-YYYY as the user explicitly asked for "06-17-2026" -> "June 17, 2026"
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
    } else {
      return dateStr;
    }

    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
      return dateStr;
    }

    const dateObj = new Date(year, month - 1, day);
    // Safe check that the date object is valid
    if (isNaN(dateObj.getTime())) {
      return dateStr;
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};
