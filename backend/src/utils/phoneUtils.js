/**
 * BEHOLD. — Phone Normalization & Resolution Utilities
 */

/**
 * Normalizes any phone number into canonical international format with country code (e.g. "+918075374600")
 * Handles: "8075374600", "918075374600", "+918075374600", "08075374600", "00918075374600", "+91 80753 74600"
 */
function normalizePhoneWithCountryCode(phone) {
  if (!phone) return '';
  let str = String(phone).trim();
  if (!str) return '';

  let cleaned = str.replace(/\D/g, '');
  if (!cleaned) return '';

  // Remove international double-zero prefix if present (e.g. "00918075374600" -> "918075374600")
  if (cleaned.startsWith('00') && cleaned.length > 11) {
    cleaned = cleaned.substring(2);
  }

  // Remove leading single zero if 11 digits (e.g. "08075374600" -> "8075374600")
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Prepend India country code 91 if 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  // Must have at least 10 digits to be a valid phone number
  if (cleaned.length < 10) {
    return '';
  }

  return '+' + cleaned;
}

/**
 * Resolves the best available phone number from a list of objects or strings
 * Prioritizes direct client intake phone over cached/stale profile numbers.
 * e.g. resolveAnyPhone(clientPhone, newAppointment, user, req.body)
 */
function resolveAnyPhone(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'string') {
      const normalized = normalizePhoneWithCountryCode(candidate);
      if (normalized && normalized.length >= 11) return normalized;
    }

    if (typeof candidate === 'object') {
      const possibleValues = [
        candidate.clientPhone,
        candidate.whatsappNumber,
        candidate.phone,
        candidate.phoneNumber,
        candidate.contactPhone,
        candidate.contactNumber,
        candidate.mobile,
        candidate.userPhone,
        candidate.guardianPhone,
        candidate.user?.clientPhone,
        candidate.user?.whatsappNumber,
        candidate.user?.phone,
        candidate.user?.phoneNumber,
        candidate.bookingDetails?.clientPhone,
        candidate.bookingDetails?.phone
      ];

      for (const val of possibleValues) {
        if (val) {
          const normalized = normalizePhoneWithCountryCode(val);
          if (normalized && normalized.length >= 11) return normalized;
        }
      }
    }
  }
  return '';
}

/**
 * Cleans a candidate user name, stripping generic placeholders (e.g. "Test Student", "New User", "Student", "user_123")
 */
function cleanUserName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (
    !lower ||
    ['null', 'undefined', 'n/a', 'na', 'none', 'nil', 'new user', 'student', 'unknown student', 'user', 'client', 'a client', 'anonymous student', 'patient', 'there', 'behold user', 'test user', 'test student', 'test', 'tester', 'test client', 'demo user', 'sample user', 'test account', 'teststudent', 'testuser', 'guest', 'guest user'].includes(lower) ||
    lower.startsWith('behold user') ||
    lower.startsWith('test ') ||
    lower.startsWith('test_') ||
    lower.startsWith('test-') ||
    lower.startsWith('student ') ||
    lower.startsWith('user_') ||
    lower.startsWith('user-') ||
    lower.startsWith('user ') ||
    /^user\d+$/i.test(lower) ||
    /^test\d+$/i.test(lower) ||
    /^student\d+$/i.test(lower)
  ) {
    return '';
  }
  return trimmed;
}

/**
 * Resolves the genuine name of the student from multiple candidate sources
 * e.g. resolveStudentName(clientName, appointment?.clientName, user?.name, req.body)
 */
function resolveStudentName(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'string') {
      const cleaned = cleanUserName(candidate);
      if (cleaned) return cleaned;
    }

    if (typeof candidate === 'object') {
      const possibleValues = [
        candidate.clientName,
        candidate.name,
        candidate.userName,
        candidate.fullName,
        candidate.studentName,
        candidate.user?.name,
        candidate.user?.clientName,
        candidate.bookingDetails?.clientName,
        candidate.bookingDetails?.name
      ];

      for (const val of possibleValues) {
        if (val) {
          const cleaned = cleanUserName(val);
          if (cleaned) return cleaned;
        }
      }
    }
  }
  return '';
}

module.exports = {
  normalizePhoneWithCountryCode,
  resolveAnyPhone,
  cleanUserName,
  resolveStudentName
};


