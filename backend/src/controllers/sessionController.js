const StorageService = require('../services/storageService');
const { autoExpireSessions } = require('../utils/sessionHelper');
const { resolveStudentName } = require('../utils/phoneUtils');

const isUserRole = (r) => {
  const lower = (r || '').toLowerCase();
  return lower === 'user' || lower === 'customer' || lower === 'student';
};
const isCounsellorRole = (r) => {
  const lower = (r || '').toLowerCase();
  return lower === 'counsellor' || lower === 'psychologist';
};
const isAdminRole = (r) => {
  const lower = (r || '').toLowerCase();
  return lower === 'admin' || lower === 'super_admin' || lower === 'sub_admin';
};

const SessionController = {
  // Get Sessions (List for User or Counsellor)
  async getSessions(req, res, next) {
    try {
      await autoExpireSessions();
      let filter;
      if (isCounsellorRole(req.user.role)) {
        filter = { counsellorId: req.user.id };
      } else if (isAdminRole(req.user.role)) {
        filter = {};
      } else {
        filter = { userId: req.user.id };
      }

      const sessions = await StorageService.findAll('sessions', filter);
      const appointments = await StorageService.findAll('appointments', filter);

      const uniqueSessionsMap = new Map();

      for (const s of sessions) {
        if (!uniqueSessionsMap.has(s.appointmentId)) {
          uniqueSessionsMap.set(s.appointmentId, s);
        }
      }

      for (const a of appointments) {
        // Use a.id or a._id as fallback, convert to string just in case
        const appId = a.id || (a._id ? a._id.toString() : '');
        if (appId && !uniqueSessionsMap.has(appId)) {
          uniqueSessionsMap.set(appId, {
            id: appId,
            appointmentId: appId,
            userId: a.userId,
            counsellorId: a.counsellorId,
            date: a.date,
            time: a.time,
            mode: a.mode,
            meetLink: a.meetLink || '',
            status: a.status,
            notes: a.notes || '',
            feedback: a.feedback || ''
          });
        }
      }

      const mergedSessions = Array.from(uniqueSessionsMap.values());

      const { buildDirectRoomUrl, isValidCustomMeetLink } = require('../utils/calendarHelper');

      const populated = await Promise.all(
        mergedSessions.map(async (s) => {
          const user = await StorageService.findById('users', s.userId);
          const counsellor = await StorageService.findById('counsellors', s.counsellorId);
          const appt = appointments.find((a) => (a.id && a.id === s.appointmentId) || (a._id && a._id.toString() === s.appointmentId));
          const canonicalId = s.appointmentId || appt?.id || s.id;

          // Authorized meeting link resolution
          let meetLink = s.meetLink || appt?.meetLink || '';
          const isAuthorized =
            req.user.id === s.userId || req.user.id === s.counsellorId || isAdminRole(req.user.role);

          if (!isAuthorized) {
            meetLink = '';
          } else if (s.mode === 'ONLINE') {
            if (s.status === 'CANCELLED') {
              meetLink = '';
            } else if (!meetLink || meetLink === 'LOCKED' || !isValidCustomMeetLink(meetLink)) {
              // Ensure every online session has a guaranteed direct-join consultation room link
              meetLink = buildDirectRoomUrl(canonicalId);
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
            studentName: resolveStudentName(appt?.clientName, user?.name) || user?.name || 'Student',
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            advisorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            advisorRole: counsellor ? counsellor.role || 'Consultation' : 'Consultation',
            advisorProfilePic: counsellor ? (counsellor.profilePic || counsellor.image) : null,
            service: appt ? appt.service : s.service || 'counselling',
            duration: appt?.duration || s.duration || '1 Hour (60 Mins)',
            status: frontendStatus,
            meetLink,
            baseFee: appt ? (appt.baseFee || appt.amountPaid || 0) : 0,
            gstAmount: appt ? (appt.gstAmount || 0) : 0,
            appliedDiscount: appt ? (appt.appliedDiscount || 0) : 0,
            couponCode: appt ? (appt.couponCode || '') : '',
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
        isAdminRole(req.user.role) || req.user.id === session.userId || req.user.id === session.counsellorId;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this session' });
      }

      const user = await StorageService.findById('users', session.userId);
      const counsellor = await StorageService.findById('counsellors', session.counsellorId);

      const { buildDirectRoomUrl, isValidCustomMeetLink } = require('../utils/calendarHelper');
      const appt = await StorageService.findById('appointments', session.appointmentId);

      // Direct meeting link resolution
      const canonicalId = session.appointmentId || appt?.id || session.id;
      let meetLink = session.meetLink || appt?.meetLink || '';
      if (session.mode === 'ONLINE') {
        if (session.status === 'CANCELLED') {
          meetLink = '';
        } else if (!meetLink || meetLink === 'LOCKED' || !isValidCustomMeetLink(meetLink)) {
          meetLink = buildDirectRoomUrl(canonicalId);
        }
      }

      let frontendStatus = session.status;
      if (session.status === 'PENDING' && appt && appt.status === 'APPROVED') {
        frontendStatus = 'CONFIRMED';
      } else if (session.status === 'APPROVED') {
        frontendStatus = 'CONFIRMED';
      }

      const sessionData = { ...session };
      if (!isAdminRole(req.user.role)) {
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
          studentName: resolveStudentName(appt?.clientName, user?.name) || user?.name || 'Student',
          counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          advisorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          advisorRole: counsellor ? counsellor.role || 'Consultation' : 'Consultation',
          advisorProfilePic: counsellor ? (counsellor.profilePic || counsellor.image) : null,
          service: appt ? appt.service : session.service || 'counselling',
          duration: appt?.duration || session.duration || '1 Hour (60 Mins)',
          status: frontendStatus,
          meetLink,
          baseFee: appt ? (appt.baseFee || appt.amountPaid || 0) : 0,
          gstAmount: appt ? (appt.gstAmount || 0) : 0,
          appliedDiscount: appt ? (appt.appliedDiscount || 0) : 0,
          couponCode: appt ? (appt.couponCode || '') : '',
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

      if (!isAdminRole(req.user.role) && session.counsellorId !== req.user.id) {
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

      if (status === 'CANCELLED') {
        const appointment = await StorageService.findById('appointments', session.appointmentId);
        if (appointment) {
          const isPaid = appointment.paymentStatus === 'PAID';
          await StorageService.update('appointments', session.appointmentId, {
            status: 'CANCELLED',
            cancellationReason: 'Session cancelled by counsellor/admin.',
            cancelledBy: req.user.role || 'counsellor',
            refundStatus: isPaid ? 'PENDING' : 'NONE'
          });
        }
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

      if (!meetLink || typeof meetLink !== 'string') {
        return res.status(400).json({ success: false, message: 'Meeting link is required' });
      }

      const trimmed = meetLink.trim();
      if (!trimmed.startsWith('https://')) {
        return res.status(400).json({ success: false, message: 'Meeting link must be a valid URL starting with https://' });
      }

      if (trimmed.toLowerCase().includes('meet.google.com/new')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot save "meet.google.com/new". Please open Google Meet, create your meeting room, and copy the room link (e.g. meet.google.com/abc-defg-hij), or generate a Direct Join Room.'
        });
      }

      const session = await StorageService.findById('sessions', id);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      if (!isAdminRole(req.user.role) && session.counsellorId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await StorageService.update('sessions', id, { meetLink: trimmed });

      if (session.appointmentId) {
        await StorageService.update('appointments', session.appointmentId, { meetLink: trimmed });
      }

      // Notify student
      await StorageService.create('notifications', {
        recipientId: session.userId,
        recipientRole: 'user',
        title: 'Meeting Link Added',
        message: 'Your counsellor has added a video consultation link to your upcoming session.',
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
