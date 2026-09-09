const StorageService = require('../services/storageService');
const WhatsAppService = require('../services/whatsappService');
const EmailService = require('../services/emailService');
const { resolveAnyPhone, resolveStudentName } = require('../utils/phoneUtils');

exports.sendDailyReminders = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const allAppointments = await StorageService.findAll('appointments', {
      date: todayStr,
      isDeleted: false
    });
    
    // Include PENDING, APPROVED, and CONFIRMED (paid) appointments
    const appointments = allAppointments.filter(
      (a) => a.status === 'CONFIRMED' || a.status === 'APPROVED' || a.status === 'PENDING'
    );

    let waSentCount = 0;
    let emailSentCount = 0;
    
    for (const appt of appointments) {
      const student = await StorageService.findById('users', appt.userId);
      const counsellor = await StorageService.findById('counsellors', appt.counsellorId);
      const studentPhone = resolveAnyPhone(appt.clientPhone, appt, student);
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

      // WhatsApp reminder (Student/User ONLY)
      if (studentPhone) {
        await WhatsAppService.sendDayOfReminder(studentPhone, details).catch(err => console.error('[Cron WhatsApp Reminder Error]:', err));
        waSentCount++;
      }

      // Email reminders
      if (student || counsellor) {
        EmailService.sendAppointmentReminder({ user: student, counsellor, appointment: appt })
          .then(() => { emailSentCount++; })
          .catch(err => console.error('[Email Reminder Error]:', err));
      }
    }

    res.status(200).json({
      success: true,
      message: `Daily reminders processed. WhatsApp: ${waSentCount}, Emails: ${emailSentCount}.`,
      date: todayStr
    });
  } catch (error) {
    console.error('Error in sendDailyReminders cron:', error);
    res.status(500).json({ success: false, message: 'Server error while sending reminders.' });
  }
};

