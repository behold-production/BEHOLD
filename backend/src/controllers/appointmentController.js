const StorageService = require('../services/storageService');

const AppointmentController = {
  // Create Appointment (User / Student)
  async createAppointment(req, res, next) {
    try {
      const { counsellorId, date, time, mode, service } = req.body;
      const userId = req.user.id;

      if (!counsellorId || !date || !time || !mode) {
        return res.status(400).json({ success: false, message: 'Counsellor ID, date, time, and mode are required' });
      }

      // Check user and counsellor exist
      const user = await StorageService.findById('users', userId);
      const counsellor = await StorageService.findById('counsellors', counsellorId);

      if (!user) return res.status(404).json({ success: false, message: 'Student profile not found' });
      if (!counsellor) return res.status(404).json({ success: false, message: 'Counsellor not found' });

      // Create appointment
      const newAppointment = await StorageService.create('appointments', {
        userId,
        counsellorId,
        date,
        time,
        mode, // ONLINE or OFFLINE
        status: 'PENDING',
        service: service || 'counselling'
      });

      // Send notification to counsellor
      await StorageService.create('notifications', {
        recipientId: counsellorId,
        recipientRole: 'counsellor',
        title: 'New Appointment Booking Request',
        message: `Student ${user.name} has requested an appointment on ${date} at ${time}.`,
        type: 'appointment_created',
        isRead: false
      });

      // Send notification to student
      await StorageService.create('notifications', {
        recipientId: userId,
        recipientRole: 'user',
        title: 'Appointment Request Submitted',
        message: `Your booking request with ${counsellor.name} on ${date} at ${time} has been submitted.`,
        type: 'appointment_created',
        isRead: false
      });

      res.status(201).json({
        success: true,
        message: 'Appointment request created successfully',
        data: newAppointment
      });
    } catch (error) {
      next(error);
    }
  },

  // Approve Appointment (Counsellor / Admin)
  async approveAppointment(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (appointment.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Cannot approve appointment with status: ${appointment.status}` });
      }

      // Update appointment status to APPROVED
      const updated = await StorageService.update('appointments', id, { status: 'APPROVED' });

      // Create matching session
      const meetLink = appointment.mode === 'ONLINE' 
        ? `https://meet.google.com/behold-cdat-${id.split('_')[1] || 'session'}`
        : '';

      const session = await StorageService.create('sessions', {
        appointmentId: id,
        userId: appointment.userId,
        counsellorId: appointment.counsellorId,
        date: appointment.date,
        time: appointment.time,
        mode: appointment.mode,
        meetLink,
        status: 'PENDING',
        notes: '',
        feedback: ''
      });

      // Notify User
      const user = await StorageService.findById('users', appointment.userId);
      const counsellor = await StorageService.findById('counsellors', appointment.counsellorId);

      await StorageService.create('notifications', {
        recipientId: appointment.userId,
        recipientRole: 'user',
        title: 'Appointment Approved',
        message: `Your appointment with ${counsellor ? counsellor.name : 'Counsellor'} on ${appointment.date} has been approved.`,
        type: 'appointment_approved',
        isRead: false
      });

      // Notify Counsellor
      await StorageService.create('notifications', {
        recipientId: appointment.counsellorId,
        recipientRole: 'counsellor',
        title: 'Appointment Approved',
        message: `You approved the appointment request from ${user ? user.name : 'Student'} on ${appointment.date}.`,
        type: 'appointment_approved',
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Appointment approved successfully',
        data: { appointment: updated, session }
      });
    } catch (error) {
      next(error);
    }
  },

  // Reject Appointment (Counsellor / Admin)
  async rejectAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (appointment.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Cannot reject appointment with status: ${appointment.status}` });
      }

      const updated = await StorageService.update('appointments', id, { status: 'REJECTED' });

      // Notify User
      const counsellor = await StorageService.findById('counsellors', appointment.counsellorId);
      await StorageService.create('notifications', {
        recipientId: appointment.userId,
        recipientRole: 'user',
        title: 'Appointment Declined',
        message: `Your appointment request with ${counsellor ? counsellor.name : 'Counsellor'} on ${appointment.date} was declined.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'appointment_rejected',
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Appointment request rejected successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Reschedule Appointment
  async rescheduleAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { date, time } = req.body;

      if (!date || !time) {
        return res.status(400).json({ success: false, message: 'New date and time are required' });
      }

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Check current user is authorized (either User, Counsellor or Admin)
      const userAuthorized = 
        req.user.role === 'admin' || 
        (req.user.role === 'user' && appointment.userId === req.user.id) ||
        (req.user.role === 'counsellor' && appointment.counsellorId === req.user.id);

      if (!userAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reschedule this appointment' });
      }

      const updated = await StorageService.update('appointments', id, {
        date,
        time,
        status: 'PENDING' // reset to pending for re-approval unless modified by admin/counsellor
      });

      // Update matching session if exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        await StorageService.update('sessions', session.id, { date, time, status: 'PENDING' });
      }

      // Notify other participant
      const isStudentRescheduling = req.user.role === 'user';
      const targetId = isStudentRescheduling ? appointment.counsellorId : appointment.userId;
      const targetRole = isStudentRescheduling ? 'counsellor' : 'user';
      const actorName = req.user.role === 'user' ? 'The student' : 'The counsellor';

      await StorageService.create('notifications', {
        recipientId: targetId,
        recipientRole: targetRole,
        title: 'Appointment Rescheduled Request',
        message: `${actorName} has requested to reschedule the appointment on ${date} at ${time}.`,
        type: 'appointment_rescheduled',
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully. Pending approval.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Cancel Appointment
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Authorization check
      const userAuthorized = 
        req.user.role === 'admin' || 
        (req.user.role === 'user' && appointment.userId === req.user.id) ||
        (req.user.role === 'counsellor' && appointment.counsellorId === req.user.id);

      if (!userAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment' });
      }

      const updated = await StorageService.update('appointments', id, { status: 'CANCELLED' });

      // Cancel matching session if exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        await StorageService.update('sessions', session.id, { status: 'CANCELLED' });
      }

      // Notify the other party
      const isStudentCancelling = req.user.id === appointment.userId;
      const targetId = isStudentCancelling ? appointment.counsellorId : appointment.userId;
      const targetRole = isStudentCancelling ? 'counsellor' : 'user';
      const cancellerName = req.user.role === 'user' ? 'Student' : 'Counsellor';

      await StorageService.create('notifications', {
        recipientId: targetId,
        recipientRole: targetRole,
        title: 'Appointment Cancelled',
        message: `${cancellerName} has cancelled the appointment scheduled on ${appointment.date}.`,
        type: 'appointment_cancelled',
        isRead: false
      });

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Update meeting link
  async updateMeetLink(req, res, next) {
    try {
      const { id } = req.params;
      const { meetLink } = req.body;

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await StorageService.update('appointments', id, { meetLink });

      // Update matching session if exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        await StorageService.update('sessions', session.id, { meetLink });
      }

      res.status(200).json({
        success: true,
        message: 'Meeting link updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Update session feedback / notes from counsellor
  async updateFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await StorageService.update('appointments', id, { feedback });

      // Update matching session if exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        await StorageService.update('sessions', session.id, { feedback });
      }

      res.status(200).json({
        success: true,
        message: 'Session feedback updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Complete Appointment
  async completeAppointment(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const updated = await StorageService.update('appointments', id, { status: 'COMPLETED' });

      // Also complete matching session if exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        await StorageService.update('sessions', session.id, { status: 'COMPLETED' });
      }

      res.status(200).json({
        success: true,
        message: 'Appointment completed successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Get User Appointments (List)
  async getUserAppointments(req, res, next) {
    try {
      const filter = req.user.role === 'counsellor' 
        ? { counsellorId: req.user.id }
        : { userId: req.user.id };

      const appointments = await StorageService.findAll('appointments', filter);
      
      const populated = await Promise.all(
        appointments.map(async (a) => {
          const user = await StorageService.findById('users', a.userId);
          const counsellor = await StorageService.findById('counsellors', a.counsellorId);
          return {
            ...a,
            studentName: user ? user.name : 'Unknown Student',
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor'
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: populated
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AppointmentController;
