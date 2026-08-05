const StorageService = require('../services/storageService');

/**
 * Scans all non-deleted appointments and removes any duplicate records created for the same slot.
 * Deduplication rules:
 * - Group by `counsellorId_date_time` (excluding CANCELLED / REJECTED records).
 * - Keep the record with paymentStatus === 'PAID' (or created first).
 * - Delete the extraneous duplicate records from database.
 */
async function cleanDuplicateAppointments() {
  try {
    const allAppointments = await StorageService.findAll('appointments', { isDeleted: { $ne: true } });
    if (!Array.isArray(allAppointments) || allAppointments.length <= 1) return;

    const groups = {};

    for (const appt of allAppointments) {
      if (appt.status === 'CANCELLED' || appt.status === 'REJECTED') continue;
      const key = `${appt.counsellorId || ''}_${appt.date || ''}_${appt.time || ''}`;
      if (!key.replace(/_/g, '').trim()) continue;
      if (!groups[key]) groups[key] = [];
      groups[key].push(appt);
    }

    let deletedCount = 0;
    for (const key in groups) {
      const list = groups[key];
      if (list.length > 1) {
        // Sort: PAID first, then with razorpayOrderId/PaymentId, then earliest created
        list.sort((a, b) => {
          const aPaid = a.paymentStatus === 'PAID' ? 1 : 0;
          const bPaid = b.paymentStatus === 'PAID' ? 1 : 0;
          if (aPaid !== bPaid) return bPaid - aPaid;

          const aRzp = (a.razorpayOrderId || a.razorpayPaymentId) ? 1 : 0;
          const bRzp = (b.razorpayOrderId || b.razorpayPaymentId) ? 1 : 0;
          if (aRzp !== bRzp) return bRzp - aRzp;

          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });

        // Keep primary list[0], delete remaining duplicates
        const primary = list[0];
        for (let i = 1; i < list.length; i++) {
          const duplicate = list[i];
          // Merge any details into primary if primary was missing them
          if (!primary.razorpayOrderId && duplicate.razorpayOrderId) primary.razorpayOrderId = duplicate.razorpayOrderId;
          if (!primary.razorpayPaymentId && duplicate.razorpayPaymentId) primary.razorpayPaymentId = duplicate.razorpayPaymentId;
          if (!primary.userId && duplicate.userId) primary.userId = duplicate.userId;
          if (!primary.clientName && duplicate.clientName) primary.clientName = duplicate.clientName;
          
          await StorageService.delete('appointments', duplicate.id);
          deletedCount++;
        }
        await StorageService.update('appointments', primary.id, {
          razorpayOrderId: primary.razorpayOrderId,
          razorpayPaymentId: primary.razorpayPaymentId,
          userId: primary.userId,
          clientName: primary.clientName
        });
      }
    }
    if (deletedCount > 0) {
      console.log(`[Deduplicator]: Cleaned up ${deletedCount} duplicate appointment records from database.`);
    }
  } catch (err) {
    console.error('[Deduplicator Error]:', err.message || err);
  }
}

module.exports = {
  cleanDuplicateAppointments
};
