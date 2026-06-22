const Session = require('../models/Session');
const Appointment = require('../models/Appointment');
const StorageService = require('../services/storageService');

const autoExpireSessions = async () => {
  try {
    // Find all sessions/appointments with active status
    const activeSessions = await Session.find({ status: { $in: ['PENDING', 'APPROVED', 'CONFIRMED'] } });
    const activeAppointments = await Appointment.find({ status: { $in: ['PENDING', 'APPROVED', 'CONFIRMED'] } });

    const now = new Date();

    const parseSessionDateTime = (dateStr, timeStr) => {
      try {
        if (!dateStr || !timeStr) return null;
        // timeStr format: "09:00 AM" or similar
        const timeParts = timeStr.trim().split(/\s+/);
        const [hoursStr, minutesStr] = (timeParts[0] || '0:00').split(':');
        let hours = Number(hoursStr || 0);
        const minutes = Number(minutesStr || 0);
        const modifier = (timeParts[1] || 'AM').toUpperCase();

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const [year, month, day] = dateStr.split('-').map(Number);
        const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
        const dt = new Date(isoStr);
        dt.setUTCHours(dt.getUTCHours() + 1);
        return dt;
      } catch (e) {
        console.error('[Auto-Expire] Error parsing date/time:', dateStr, timeStr, e);
        return null;
      }
    };

    // Expire Sessions
    for (const session of activeSessions) {
      const expiryTime = parseSessionDateTime(session.date, session.time);
      if (expiryTime && now > expiryTime) {
        const currentSession = await Session.findOne({ id: session.id });
        if (!currentSession || currentSession.status === 'EXPIRED') continue;

        await Session.updateOne({ id: session.id }, { $set: { status: 'EXPIRED' } });
        console.log(`[Auto-Expire] Session ${session.id} marked as EXPIRED.`);

        // Also update corresponding appointment to EXPIRED
        await Appointment.updateOne({ id: session.appointmentId }, { $set: { status: 'EXPIRED' } });

        // Notify student
        await StorageService.create('notifications', {
          recipientId: session.userId,
          recipientRole: 'user',
          title: 'Session Expired',
          message: `Your session scheduled on ${session.date} at ${session.time} has expired because it was not joined within 1 hour.`,
          type: 'session_expired',
          isRead: false
        });

        // Notify counsellor
        await StorageService.create('notifications', {
          recipientId: session.counsellorId,
          recipientRole: 'counsellor',
          title: 'Session Expired',
          message: `Your session with student scheduled on ${session.date} at ${session.time} has expired because it was not joined within 1 hour.`,
          type: 'session_expired',
          isRead: false
        });
      }
    }

    // Expire Appointments
    for (const appt of activeAppointments) {
      const expiryTime = parseSessionDateTime(appt.date, appt.time);
      if (expiryTime && now > expiryTime) {
        const currentAppt = await Appointment.findOne({ id: appt.id });
        if (!currentAppt || currentAppt.status === 'EXPIRED') continue;

        await Appointment.updateOne({ id: appt.id }, { $set: { status: 'EXPIRED' } });
        console.log(`[Auto-Expire] Appointment ${appt.id} marked as EXPIRED.`);

        // Also check if there's a session for it and update it
        await Session.updateOne({ appointmentId: appt.id }, { $set: { status: 'EXPIRED' } });

        // Notify student
        await StorageService.create('notifications', {
          recipientId: appt.userId,
          recipientRole: 'user',
          title: 'Appointment Booking Request Expired',
          message: `Your booking request scheduled on ${appt.date} at ${appt.time} has expired.`,
          type: 'session_expired',
          isRead: false
        });

        // Notify counsellor
        await StorageService.create('notifications', {
          recipientId: appt.counsellorId,
          recipientRole: 'counsellor',
          title: 'Appointment Request Expired',
          message: `The booking request scheduled on ${appt.date} at ${appt.time} has expired.`,
          type: 'session_expired',
          isRead: false
        });
      }
    }
  } catch (error) {
    console.error('[Auto-Expire Error]:', error);
  }
};

module.exports = {
  autoExpireSessions
};
