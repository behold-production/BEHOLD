const StorageService = require('../services/storageService');
const { normalizePhoneWithCountryCode } = require('./phoneUtils');

/**
 * Checks if a user has already used their one-time Introductory Session.
 * Evaluates both user profile flag and historical non-cancelled appointments.
 */
async function checkIntroductoryUsed({ userId, email, phone }) {
  try {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? normalizePhoneWithCountryCode(phone) : '';

    // 1. If userId is provided, check user document first
    if (userId) {
      const user = await StorageService.findById('users', userId);
      if (user && user.hasUsedIntroductory === true) {
        return true;
      }
    }

    // 2. Build identifiers to search appointments
    const identifierQueries = [];
    if (userId) {
      identifierQueries.push({ userId });
    }
    if (cleanPhone) {
      identifierQueries.push({ clientPhone: cleanPhone });
    }
    if (cleanEmail && !cleanEmail.includes('@temp.behold') && !cleanEmail.includes('temp.behold.co.in')) {
      identifierQueries.push({ clientEmail: cleanEmail });
    }

    if (identifierQueries.length === 0) {
      return false;
    }

    // 3. Query all non-cancelled appointments for matching user identifiers
    const appointments = await StorageService.findAll('appointments', {
      $or: identifierQueries,
      status: { $ne: 'CANCELLED' }
    });

    const hasIntroAppt = appointments.some((appt) => {
      if (appt.isIntroductory === true) return true;
      const d = String(appt.duration || '').toLowerCase();
      const bDuration = Number(appt.bookingDuration);
      return bDuration === 30 || d.includes('30') || d.includes('introductory') || d.includes('half');
    });

    if (hasIntroAppt && userId) {
      // Self-heal flag on user document
      StorageService.update('users', userId, { hasUsedIntroductory: true }).catch(() => {});
    }

    return hasIntroAppt;
  } catch (error) {
    console.error('[Introductory Check Error]:', error);
    return false;
  }
}

/**
 * Flags the user as having used their one-time introductory session.
 */
async function markIntroductoryUsed({ userId, email, phone }) {
  try {
    if (userId) {
      await StorageService.update('users', userId, { hasUsedIntroductory: true });
      return;
    }
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? normalizePhoneWithCountryCode(phone) : '';

    if (cleanPhone) {
      const user = await StorageService.findOne('users', { phone: cleanPhone });
      if (user) {
        await StorageService.update('users', user.id, { hasUsedIntroductory: true });
        return;
      }
    }
    if (cleanEmail) {
      const user = await StorageService.findOne('users', { email: cleanEmail });
      if (user) {
        await StorageService.update('users', user.id, { hasUsedIntroductory: true });
      }
    }
  } catch (error) {
    console.error('[Mark Introductory Used Error]:', error);
  }
}

module.exports = {
  checkIntroductoryUsed,
  markIntroductoryUsed
};
