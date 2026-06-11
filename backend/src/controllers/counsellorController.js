const StorageService = require('../services/storageService');

const CounsellorController = {
  // Get Counsellor Profile
  async getProfile(req, res, next) {
    try {
      const counsellor = await StorageService.findById('counsellors', req.user.id);
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      const { password, ...counsellorData } = counsellor;
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Counsellor Profile
  async updateProfile(req, res, next) {
    try {
      const { name, phone, specialties, qualifications, experience, modePreference, bio, education, price, lang, defaultMeetLink, hours, modes } = req.body;
      const updates = {};

      if (name !== undefined) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (specialties !== undefined) updates.specialties = specialties;
      if (qualifications !== undefined) updates.qualifications = qualifications;
      if (experience !== undefined) updates.experience = experience;
      if (modePreference !== undefined) updates.modePreference = modePreference;
      if (bio !== undefined) updates.bio = bio;
      if (education !== undefined) updates.education = education;
      if (price !== undefined) updates.price = price;
      if (lang !== undefined) updates.lang = lang;
      if (defaultMeetLink !== undefined) updates.defaultMeetLink = defaultMeetLink;
      if (hours !== undefined) updates.hours = hours;
      if (modes !== undefined) updates.modes = modes;

      const updated = await StorageService.update('counsellors', req.user.id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      const { password, ...counsellorData } = updated;
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Availability
  async updateAvailability(req, res, next) {
    try {
      const { availability } = req.body; // e.g. { Monday: ["09:00 AM", "10:00 AM"], ... }

      if (!availability) {
        return res.status(400).json({ success: false, message: 'Availability slots are required' });
      }

      const updated = await StorageService.update('counsellors', req.user.id, { availability });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      const { password, ...counsellorData } = updated;
      res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: counsellorData.availability
      });
    } catch (error) {
      next(error);
    }
  },

  // Counsellor Dashboard APIs
  async getDashboard(req, res, next) {
    try {
      const counsellorId = req.user.id;

      // Validate counsellor exists
      const counsellor = await StorageService.findById('counsellors', counsellorId);
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      const todayStr = new Date().toISOString().split('T')[0];

      // Sessions for this counsellor
      const sessions = await StorageService.findAll('sessions', { counsellorId });
      const appointments = await StorageService.findAll('appointments', { counsellorId });

      // Today's sessions
      const todaySessions = sessions.filter(s => s.date === todayStr && s.status !== 'CANCELLED');

      // Upcoming sessions
      const now = new Date();
      const upcomingAppointments = appointments.filter(a => {
        try {
          const appointmentDate = new Date(`${a.date} ${a.time.split(' ')[0]}`);
          return appointmentDate >= now && (a.status === 'PENDING' || a.status === 'APPROVED');
        } catch {
          return a.status === 'PENDING';
        }
      });

      // Total clients (distinct users)
      const clientIds = new Set(appointments.map(a => a.userId));
      const totalClients = clientIds.size;

      // Feedbacks summary
      const feedbacks = await StorageService.findAll('feedbacks', { counsellorId, isModerated: false });
      const avgRating = feedbacks.length > 0 
        ? parseFloat((feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1))
        : 5.0;

      res.status(200).json({
        success: true,
        message: 'Counsellor dashboard data retrieved successfully',
        data: {
          todaySessions,
          upcomingAppointments,
          totalClients,
          avgRating,
          feedbackSummary: feedbacks.slice(0, 5),
          earningsPlaceholder: `$${sessions.filter(s => s.status === 'COMPLETED').length * 50}` // Dev mock
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CounsellorController;
