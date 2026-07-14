const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const WhatsAppService = require('../services/whatsappService');

exports.sendDailyReminders = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const appointments = await Appointment.find({
      date: todayStr,
      status: { $in: ['PENDING', 'APPROVED'] },
      isDeleted: false
    });

    let sentCount = 0;
    
    for (const appt of appointments) {
      const student = await User.findOne({ id: appt.userId });
      const counsellor = await Counsellor.findOne({ id: appt.counsellorId });
      
      const details = {
        date: appt.date,
        time: appt.time,
        mode: appt.mode,
        studentName: student ? student.name : 'Student',
        counsellorName: counsellor ? counsellor.name : 'Counsellor'
      };

      if (student && student.phone) {
        await WhatsAppService.sendDayOfReminder(student.phone, details).catch(err => console.error(err));
        sentCount++;
      }
      
      if (counsellor && counsellor.phone) {
        await WhatsAppService.sendDayOfReminder(counsellor.phone, details).catch(err => console.error(err));
        sentCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Daily reminders processed. Sent ${sentCount} messages.`,
      date: todayStr
    });
  } catch (error) {
    console.error('Error in sendDailyReminders cron:', error);
    res.status(500).json({ success: false, message: 'Server error while sending reminders.' });
  }
};
