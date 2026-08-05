/**
 * Centralized Validation & Phone Normalization Utilities for BEHOLD
 * Default Country: India (+91)
 */

/**
 * Validates an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

/**
 * Extracts a clean 10-digit Indian mobile number starting with [6-9].
 * @param {string} phone 
 * @returns {{ isValid: boolean, phone10: string, formattedWithCode: string }}
 */
export const parseIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, phone10: '', formattedWithCode: '' };
  }

  // Remove non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Handle leading 91 or 0
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  const isValid = digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
  const formattedWithCode = isValid ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : (phone ? `+91 ${phone.trim()}` : '');

  return {
    isValid,
    phone10: isValid ? digits : '',
    formattedWithCode
  };
};

/**
 * Validates if the phone number is a valid 10-digit Indian mobile number.
 * Accepts optional +91, 91, or leading 0.
 * @param {string} phone 
 * @returns {boolean}
 */
export const validateIndianPhone = (phone) => {
  return parseIndianPhone(phone).isValid;
};

/**
 * Formats a phone string to display +91 prefix cleanly.
 * @param {string} phone 
 * @returns {string}
 */
export const formatIndianPhoneDisplay = (phone) => {
  if (!phone) return '';
  const parsed = parseIndianPhone(phone);
  if (parsed.isValid) return parsed.formattedWithCode;
  if (phone.startsWith('+91')) return phone;
  return `+91 ${phone.replace(/\D/g, '')}`;
};
