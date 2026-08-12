/**
 * Behold Aspire — Phone Normalization & Resolution Utilities
 */

/**
 * Normalizes any phone number into canonical international format with country code (e.g. "+918075374600")
 * Handles: "8075374600", "918075374600", "+918075374600", "08075374600"
 */
function normalizePhoneWithCountryCode(phone) {
  if (!phone) return '';
  let str = String(phone).trim();
  if (!str) return '';

  let cleaned = str.replace(/\D/g, '');
  if (!cleaned) return '';

  // Remove leading single zero if 11 digits (e.g. "08075374600" -> "8075374600")
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Prepend India country code 91 if 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Resolves the best available phone number from a list of objects or strings
 * e.g. resolveAnyPhone(user, appointment, req.body)
 */
function resolveAnyPhone(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'string') {
      const normalized = normalizePhoneWithCountryCode(candidate);
      if (normalized && normalized.length >= 10) return normalized;
    }

    if (typeof candidate === 'object') {
      const possibleValues = [
        candidate.phone,
        candidate.phoneNumber,
        candidate.clientPhone,
        candidate.contactPhone,
        candidate.mobile,
        candidate.userPhone,
        candidate.guardianPhone,
        candidate.user?.phone,
        candidate.user?.phoneNumber
      ];

      for (const val of possibleValues) {
        if (val) {
          const normalized = normalizePhoneWithCountryCode(val);
          if (normalized && normalized.length >= 10) return normalized;
        }
      }
    }
  }
  return '';
}

module.exports = {
  normalizePhoneWithCountryCode,
  resolveAnyPhone
};
