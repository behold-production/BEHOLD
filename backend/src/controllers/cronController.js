const StorageService = require('../services/storageService');
const WhatsAppService = require('../services/whatsappService');
const EmailService = require('../services/emailService');
const { resolveAnyPhone, resolveStudentName } = require('../utils/phoneUtils');

/**
 * Parses appointment date and time into a local JS Date object (assuming IST for this project).
 * date format: "YYYY-MM-DD"
 * time format: "10:30 AM"
 */
function parseAppointmentDateTime(dateStr, timeStr) {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [timeParts, modifier] = timeStr.split(' ');
    let [hours, minutes] = timeParts.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    // Create a local date in the server timezone (which should be configured appropriately)
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (err) {
    return null;
  }
}

exports.sendDailyReminders = async (req, res) => {
  try {
    const now = new Date();
    
    // We check appointments from yesterday, today, and tomorrow to catch the 24h/1h windows
    // But since it's simpler, we can just pull all PENDING, APPROVED, CONFIRMED and filter in JS
    
    // Fetch all active appointments (this might need pagination if very large, but usually fine for pending)
    const appointments = await StorageService.findAll('appointments', {
      status: { $in: ['CONFIRMED', 'APPROVED', 'PENDING'] },
      isDeleted: false
    });

    let waSentCount = 0;
    let emailSentCount = 0;

    for (const appt of appointments) {
      if (!appt.date || !appt.time) continue;
      
      const apptTime = parseAppointmentDateTime(appt.date, appt.time);
      if (!apptTime) continue;

      const diffMs = apptTime - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // We only care if the appointment is in the future
      if (diffMs < 0) continue;

      const student = await StorageService.findById('users', appt.userId);
      const counsellor = await StorageService.findById('counsellors', appt.counsellorId);
      const studentPhone = resolveAnyPhone(appt.clientPhone, appt, student);
      const counsellorPhone = resolveAnyPhone(counsellor?.phone, counsellor?.whatsappNumber, counsellor);
      const sName = resolveStudentName(appt.clientName, student?.name, appt);

      const details = {
        date: appt.date,
        time: appt.time,
        mode: appt.mode || 'ONLINE',
        duration: appt.duration || '1 Hour (60 Mins)',
        bookingId: appt.id || '',
        meetLink: appt.meetLink || '',
        studentName: sName,
        counsellorName: counsellor ? counsellor.name : 'Psychologist',
        recipientRole: 'user'
      };

      const updates = {};

      // 1. Check 24-Hour Reminder Window (Between 23.5 and 24.5 hours from now)
      if (diffHours > 23.5 && diffHours <= 24.5) {
        if (studentPhone && !appt.reminder24hUserSentAt) {
          await WhatsAppService.send24HourReminder(studentPhone, details).catch(e => console.error(e));
          updates.reminder24hUserSentAt = new Date();
          waSentCount++;
        }
        if (counsellorPhone && !appt.reminder24hPsychologistSentAt) {
          const msg = `*Reminder — BEHOLD.*\n\nHi ${details.counsellorName},\n\nYou have a session scheduled in 24 hours.\n\n• *Client:* ${sName}\n• *Date:* ${appt.date}\n• *Time:* ${appt.time}\n• *Mode:* ${details.mode}`;
          await WhatsAppService.sendNotification(counsellorPhone, msg).catch(e => console.error(e));
          updates.reminder24hPsychologistSentAt = new Date();
          waSentCount++;
        }
      }

      // 2. Check 1-Hour Reminder Window (Between 0.5 and 1.5 hours from now)
      if (diffHours > 0.5 && diffHours <= 1.5) {
        if (studentPhone && !appt.reminder1hUserSentAt) {
          await WhatsAppService.send1HourReminder(studentPhone, details).catch(e => console.error(e));
          updates.reminder1hUserSentAt = new Date();
          waSentCount++;
        }
        if (counsellorPhone && !appt.reminder1hPsychologistSentAt) {
          const meetStr = (appt.mode === 'ONLINE' && appt.meetLink) ? `\n🔗 *Link:* ${appt.meetLink}` : '';
          const msg = `*Your Session Starts Soon — BEHOLD.*\n\nHi ${details.counsellorName},\n\nYour session with ${sName} starts in approximately 1 hour.\n\n• *Time:* ${appt.time}\n• *Duration:* ${details.duration}${meetStr}\n\nPlease be ready on time.`;
          await WhatsAppService.sendNotification(counsellorPhone, msg).catch(e => console.error(e));
          updates.reminder1hPsychologistSentAt = new Date();
          waSentCount++;
        }
      }

      // Legacy fallback: Keep email reminders firing if we are roughly "today" (within 24h)
      // and haven't sent the email. We reuse `reminderSentAt` for the email flag.
      if (diffHours > 0 && diffHours <= 24) {
        if (!appt.reminderSentAt) {
          if (student || counsellor) {
            EmailService.sendAppointmentReminder({ user: student, counsellor, appointment: appt })
              .then(() => { emailSentCount++; })
              .catch(err => console.error('[Email Reminder Error]:', err));
          }
          updates.reminderSentAt = new Date();
        }
      }

      // Save if there were any updates
      if (Object.keys(updates).length > 0) {
        await StorageService.update('appointments', appt.id || appt._id, updates);
      }
    }

    res.status(200).json({
      success: true,
      message: `Daily/Scheduled reminders processed. WhatsApp: ${waSentCount}, Emails: ${emailSentCount}.`,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in sendDailyReminders cron:', error);
    res.status(500).json({ success: false, message: 'Server error while sending reminders.' });
  }
};

