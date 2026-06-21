const StorageService = require('../services/storageService');
const { autoExpireSessions } = require('../utils/sessionHelper');

const SessionController = {
  // Get Sessions (List for User or Counsellor)
  async getSessions(req, res, next) {
    try {
      await autoExpireSessions();
      const filter = req.user.role === 'counsellor' ? { counsellorId: req.user.id } : { userId: req.user.id };

      const sessions = await StorageService.findAll('sessions', filter);
      const appointments = await StorageService.findAll('appointments', filter);

      const sessionAppIds = new Set(sessions.map((s) => s.appointmentId));
      const mergedSessions = [...sessions];

      for (const a of appointments) {
        if (!sessionAppIds.has(a.id)) {
          mergedSessions.push({
            id: 'mock_session_' + a.id,
            appointmentId: a.id,
            userId: a.userId,
            counsellorId: a.counsellorId,
            date: a.date,
            time: a.time,
            mode: a.mode,
            meetLink: '',
            status: a.status,
            notes: '',
            feedback: ''
          });
        }
      }

      const populated = await Promise.all(
        mergedSessions.map(async (s) => {
          const user = await StorageService.findById('users', s.userId);
          const counsellor = await StorageService.findById('counsellors', s.counsellorId);
          const appt = appointments.find((a) => a.id === s.appointmentId);

          // Filter meeting link based on session access rules (only return link if session is today/upcoming)
          let meetLink = s.meetLink;
          if (meetLink) {
            const isAuthorized =
              req.user.id === s.userId || req.user.id === s.counsellorId || req.user.role === 'admin';
            if (!isAuthorized) {
              meetLink = '';
            } else if (req.user.role === 'user') {
              if (s.status === 'EXPIRED' || s.status === 'COMPLETED' || s.status === 'CANCELLED') {
                meetLink = 'LOCKED';
              } else {
                try {
                  let [hours, minutes] = s.time.split(' ')[0].split(':').map(Number);
                  const modifier = s.time.split(' ')[1];
                  if (modifier === 'PM' && hours < 12) hours += 12;
                  if (modifier === 'AM' && hours === 12) hours = 0;

                  const [year, month, day] = s.date.split('-').map(Number);
                  const sessionTime = new Date(year, month - 1, day, hours, minutes);
                  const now = new Date();

                  const diffMinutes = (sessionTime - now) / 60000;

                  // Hide link if more than 10 mins before, or more than 60 mins after
                  if (diffMinutes > 10 || diffMinutes < -60) {
                    meetLink = 'LOCKED';
                  }
                } catch (e) {
                  meetLink = 'LOCKED';
                }
              }
            }
          }

          // Compute status for frontend
          let frontendStatus = s.status;
          if (s.status === 'PENDING' && appt && appt.status === 'APPROVED') {
            frontendStatus = 'CONFIRMED';
          } else if (s.status === 'APPROVED') {
            frontendStatus = 'CONFIRMED';
          }
          const sessionData = { ...s };
          if (req.user.role !== 'admin') {
            delete sessionData.adminNotes;
          }

          return {
            ...sessionData,
            notes: s.notes || (appt ? appt.notes : ''),
            feedback: s.feedback || (appt ? appt.feedback : ''),
            nextSession: s.nextSession || (appt ? appt.nextSession : ''),
            studentName: user ? user.name : 'Unknown Student',
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            advisorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            advisorRole: counsellor ? counsellor.role || 'Consultation' : 'Consultation',
            service: appt ? appt.service : s.service || 'counselling',
            status: frontendStatus,
            meetLink,
            amountPaid: appt ? appt.amountPaid : 0,
            paymentStatus: appt ? appt.paymentStatus : 'PENDING',
            razorpayPaymentId: appt ? appt.razorpayPaymentId : '',
            razorpayOrderId: appt ? appt.razorpayOrderId : '',
            student: user
              ? {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  schoolName: user.schoolName,
                  grade: user.grade,
                  guardianName: user.guardianName,
                  guardianPhone: user.guardianPhone
                }
              : null,
            counsellor: counsellor
              ? {
                  name: counsellor.name,
                  email: counsellor.email,
                  phone: counsellor.phone,
                  title: counsellor.title,
                  education: counsellor.education,
                  specialties: counsellor.specialties,
                  qualifications: counsellor.qualifications
                }
              : null
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Sessions retrieved successfully',
        data: populated
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Session By ID (with strict meeting link authorization check)
  async getSessionById(req, res, next) {
    try {
      const { id } = req.params;
      const session = await StorageService.findById('sessions', id);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      // Check authorization
      const isAuthorized =
        req.user.role === 'admin' || req.user.id === session.userId || req.user.id === session.counsellorId;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this session' });
      }

      const user = await StorageService.findById('users', session.userId);
      const counsellor = await StorageService.findById('counsellors', session.counsellorId);

      // Meeting link safety check: only reveal if within 1 hour of scheduled time, or if requested by counsellor/admin
      let meetLink = session.meetLink;
      if (meetLink && req.user.role === 'user') {
        if (session.status === 'EXPIRED' || session.status === 'COMPLETED' || session.status === 'CANCELLED') {
          meetLink = 'LOCKED';
        } else {
          try {
            let [hours, minutes] = session.time.split(' ')[0].split(':').map(Number);
            const modifier = session.time.split(' ')[1];
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            const [year, month, day] = session.date.split('-').map(Number);
            const sessionTime = new Date(year, month - 1, day, hours, minutes);
            const now = new Date();

            const diffMinutes = (sessionTime - now) / 60000;

            // Hide link if more than 10 mins before, or more than 60 mins after
            if (diffMinutes > 10 || diffMinutes < -60) {
              meetLink = 'LOCKED';
            }
          } catch {
            meetLink = 'LOCKED';
          }
        }
      }

      const appt = await StorageService.findById('appointments', session.appointmentId);

      let frontendStatus = session.status;
      if (session.status === 'PENDING' && appt && appt.status === 'APPROVED') {
        frontendStatus = 'CONFIRMED';
      } else if (session.status === 'APPROVED') {
        frontendStatus = 'CONFIRMED';
      }

      const sessionData = { ...session };
      if (req.user.role !== 'admin') {
        delete sessionData.adminNotes;
      }

      res.status(200).json({
        success: true,
        message: 'Session retrieved successfully',
        data: {
          ...sessionData,
          notes: session.notes || (appt ? appt.notes : ''),
          feedback: session.feedback || (appt ? appt.feedback : ''),
          nextSession: session.nextSession || (appt ? appt.nextSession : ''),
          studentName: user ? user.name : 'Unknown Student',
          counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          advisorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          advisorRole: counsellor ? counsellor.role || 'Consultation' : 'Consultation',
          service: appt ? appt.service : session.service || 'counselling',
          status: frontendStatus,
          meetLink,
          amountPaid: appt ? appt.amountPaid : 0,
          paymentStatus: appt ? appt.paymentStatus : 'PENDING',
          razorpayPaymentId: appt ? appt.razorpayPaymentId : '',
          razorpayOrderId: appt ? appt.razorpayOrderId : '',
          student: user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
                schoolName: user.schoolName,
                grade: user.grade,
                guardianName: user.guardianName,
                guardianPhone: user.guardianPhone
              }
            : null,
          counsellor: counsellor
            ? {
                name: counsellor.name,
                email: counsellor.email,
                phone: counsellor.phone,
                title: counsellor.title,
                education: counsellor.education,
                specialties: counsellor.specialties,
                qualifications: counsellor.qualifications
              }
            : null
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Session notes / feedback (Counsellor only)
  async updateSession(req, res, next) {
    try {
      const { id } = req.params;
      const { notes, feedback, status } = req.body;

      const session = await StorageService.findById('sessions', id);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      if (req.user.role !== 'admin' && session.counsellorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this session' });
      }

      const updates = {};
      if (notes !== undefined) updates.notes = notes;
      if (feedback !== undefined) updates.feedback = feedback;
      if (status !== undefined) {
        updates.status = status; // e.g. COMPLETED or CANCELLED
      }

      const updated = await StorageService.update('sessions', id, updates);

      // If status changes to COMPLETED, also update matching appointment status
      if (status === 'COMPLETED') {
        await StorageService.update('appointments', session.appointmentId, { status: 'COMPLETED' });

        // Notify student that session feedback is ready
        await StorageService.create('notifications', {
          recipientId: session.userId,
          recipientRole: 'user',
          title: 'Session Completed & Feedback Available',
          message:
            'Your session has been marked as completed. You can view your counsellor feedback and leave a rating.',
          type: 'session_completed',
          isRead: false
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Set/Add meeting link (Counsellor only)
  async addMeetingLink(req, res, next) {
    try {
      const { id } = req.params;
      const { meetLink } = req.body;

      if (!meetLink) {
        return res.status(400).json({ success: false, message: 'Meeting link is required' });
      }

      const session = await StorageService.findById('sessions', id);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      if (req.user.role !== 'admin' && session.counsellorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await StorageService.update('sessions', id, { meetLink });

      // Notify student
      await StorageService.create('notifications', {
        recipientId: session.userId,
        recipientRole: 'user',
        title: 'Meeting Link Added',
        message: 'Your counsellor has added a video meeting link to your upcoming session.',
        type: 'session_link_added',
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Meeting link updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = SessionController;
