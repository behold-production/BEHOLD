const StorageService = require('../services/storageService');

const UserController = {
  // Get User Profile
  async getProfile(req, res, next) {
    try {
      const user = await StorageService.findById('users', req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { password, ...userData } = user;
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Update User Profile
  async updateProfile(req, res, next) {
    try {
      const { name, phone, schoolName, grade, guardianName, guardianPhone, groupCode } = req.body;
      const updates = {};
      
      if (name !== undefined) updates.name = name;
      if (phone !== undefined) updates.phone = phone;
      if (schoolName !== undefined) updates.schoolName = schoolName;
      if (grade !== undefined) updates.grade = grade;
      if (guardianName !== undefined) updates.guardianName = guardianName;
      if (guardianPhone !== undefined) updates.guardianPhone = guardianPhone;
      if (groupCode !== undefined) updates.groupCode = groupCode;

      const updatedUser = await StorageService.update('users', req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { password, ...userData } = updatedUser;
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Search/Filter Counsellors
  async searchCounsellors(req, res, next) {
    try {
      const { specialty, mode, search } = req.query;
      
      const allCounsellors = await StorageService.findAll('counsellors', { isVerified: true, isActive: true });

      let filtered = allCounsellors;

      if (specialty) {
        filtered = filtered.filter(c => c.specialties && c.specialties.includes(specialty));
      }

      if (mode) {
        // e.g. ONLINE or OFFLINE
        filtered = filtered.filter(c => c.modePreference === mode || !c.modePreference || c.modePreference === 'BOTH');
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(query) || 
          (c.experience && c.experience.toLowerCase().includes(query))
        );
      }

      // Format response to hide sensitive details
      const responseData = filtered.map(({ password, ...data }) => data);

      res.status(200).json({
        success: true,
        message: 'Counsellors retrieved successfully',
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Counsellor Details with Reviews
  async getCounsellorDetails(req, res, next) {
    try {
      const { id } = req.params;
      const counsellor = await StorageService.findById('counsellors', id);
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      const { password, ...counsellorData } = counsellor;
      
      // Load feedbacks
      const feedbacks = await StorageService.findAll('feedbacks', { counsellorId: id, isModerated: false });

      res.status(200).json({
        success: true,
        message: 'Counsellor details retrieved successfully',
        data: {
          ...counsellorData,
          feedbacks
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // User Dashboard APIs
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;

      // Get appointments
      const appointments = await StorageService.findAll('appointments', { userId });
      
      // Get sessions (upcoming & historical)
      const sessions = await StorageService.findAll('sessions', { userId });
      const now = new Date();

      const upcomingSessions = sessions.filter(s => {
        try {
          const sessionDate = new Date(`${s.date} ${s.time.split(' ')[0]}`);
          return sessionDate >= now && s.status !== 'CANCELLED';
        } catch {
          return s.status === 'PENDING';
        }
      }).sort((a, b) => a.date.localeCompare(b.date));

      const appointmentHistory = appointments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      // Get notifications
      const notifications = await StorageService.findAll('notifications', { 
        recipientId: userId,
        recipientRole: 'user'
      });

      res.status(200).json({
        success: true,
        message: 'User dashboard data retrieved successfully',
        data: {
          upcomingSessions,
          appointmentHistory,
          notifications: notifications.slice(0, 10), // Limit to top 10
          favouriteCounsellors: [] // Mock list
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get student's own test results
  async getMyTestResults(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await StorageService.findById('users', userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const results = await StorageService.findAll('testresults', {
        $or: [
          { userId: userId },
          { studentEmail: user.email.toLowerCase() }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Test results retrieved successfully',
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UserController;
