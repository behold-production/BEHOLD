const StorageService = require('../services/storageService');
const WhatsAppService = require('../services/whatsappService');
const EmailService = require('../services/emailService');

exports.sendDailyReminders = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const allAppointments = await StorageService.findAll('appointments', {
      date: todayStr,
      isDeleted: false
    });
    
    const appointments = allAppointments.filter(a => a.status === 'PENDING' || a.status === 'APPROVED');

    let waSentCount = 0;
    let emailSentCount = 0;
    
    for (const appt of appointments) {
      const student = await StorageService.findById('users', appt.userId);
      const counsellor = await StorageService.findById('counsellors', appt.counsellorId);
      
      const details = {
        date: appt.date,
        time: appt.time,
        mode: appt.mode,
        meetLink: appt.meetLink || '',
        studentName: student ? student.name : 'Student',
        counsellorName: counsellor ? counsellor.name : 'Counsellor'
      };

      // WhatsApp reminders
      if (student && student.phone) {
        await WhatsAppService.sendDayOfReminder(student.phone, details).catch(err => console.error(err));
        waSentCount++;
      }
      if (counsellor && counsellor.phone) {
        await WhatsAppService.sendDayOfReminder(counsellor.phone, details).catch(err => console.error(err));
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
