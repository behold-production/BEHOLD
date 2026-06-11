const StorageService = require('../services/storageService');

const SessionController = {
  // Get Sessions (List for User or Counsellor)
  async getSessions(req, res, next) {
    try {
      const filter = req.user.role === 'counsellor'
        ? { counsellorId: req.user.id }
        : { userId: req.user.id };

      const sessions = await StorageService.findAll('sessions', filter);
      
      const populated = await Promise.all(
        sessions.map(async (s) => {
          const user = await StorageService.findById('users', s.userId);
          const counsellor = await StorageService.findById('counsellors', s.counsellorId);
          
          // Filter meeting link based on session access rules (only return link if session is today/upcoming)
          let meetLink = s.meetLink;
          if (meetLink) {
            const isAuthorized = req.user.id === s.userId || req.user.id === s.counsellorId || req.user.role === 'admin';
            if (!isAuthorized) {
              meetLink = '';
            }
          }

          return {
            ...s,
            studentName: user ? user.name : 'Unknown Student',
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            meetLink
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
        req.user.role === 'admin' || 
        req.user.id === session.userId || 
        req.user.id === session.counsellorId;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this session' });
      }

      const user = await StorageService.findById('users', session.userId);
      const counsellor = await StorageService.findById('counsellors', session.counsellorId);

      // Meeting link safety check: only reveal if within 1 hour of scheduled time, or if requested by counsellor/admin
      let meetLink = session.meetLink;
      if (meetLink && req.user.role === 'user') {
        try {
          const sessionTime = new Date(`${session.date} ${session.time.split(' ')[0]}`);
          const now = new Date();
          const diffMinutes = Math.abs((sessionTime - now) / 60000);
          
          // If session is more than 60 minutes away, don't return link to student yet
          if (diffMinutes > 60 && sessionTime > now) {
            meetLink = 'LOCKED';
          }
        } catch {
          // fallback if datetime fails to parse
        }
      }

      res.status(200).json({
        success: true,
        message: 'Session retrieved successfully',
        data: {
          ...session,
          studentName: user ? user.name : 'Unknown Student',
          counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          meetLink
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
          message: 'Your session has been marked as completed. You can view your counsellor feedback and leave a rating.',
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
