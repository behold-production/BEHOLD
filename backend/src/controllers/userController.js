const StorageService = require('../services/storageService');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary, uploadProfilePicToCloudinary } = require('../utils/cloudinaryHelper');
const { autoExpireSessions } = require('../utils/sessionHelper');

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
        filtered = filtered.filter((c) => c.specialties && c.specialties.includes(specialty));
      }

      if (mode) {
        // e.g. ONLINE or OFFLINE
        filtered = filtered.filter(
          (c) => c.modePreference === mode || !c.modePreference || c.modePreference === 'BOTH'
        );
      }

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(query) || (c.experience && c.experience.toLowerCase().includes(query))
        );
      }

      // Get all active appointments
      const allActiveAppointments = await StorageService.findAll('appointments', {
        status: { $in: ['APPROVED', 'PENDING', 'CONFIRMED'] }
      });

      // Format response to hide sensitive details
      const responseData = filtered.map(({ password, ...data }) => {
        const booked = allActiveAppointments
          .filter((appt) => appt.counsellorId === data.id)
          .map((appt) => ({ date: appt.date, time: appt.time }));
        return {
          ...data,
          bookedSlots: booked
        };
      });

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

      // Load booked slots
      const activeAppointments = await StorageService.findAll('appointments', {
        counsellorId: id,
        status: { $in: ['APPROVED', 'PENDING', 'CONFIRMED'] }
      });
      const bookedSlots = activeAppointments.map((appt) => ({ date: appt.date, time: appt.time }));

      res.status(200).json({
        success: true,
        message: 'Counsellor details retrieved successfully',
        data: {
          ...counsellorData,
          feedbacks,
          bookedSlots
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // User Dashboard APIs
  async getDashboard(req, res, next) {
    try {
      await autoExpireSessions();
      const userId = req.user.id;

      // Get appointments
      const appointments = await StorageService.findAll('appointments', { userId });

      // Get sessions (upcoming & historical)
      const sessions = await StorageService.findAll('sessions', { userId });
      const now = new Date();

      const upcomingSessions = sessions
        .filter((s) => {
          try {
            const sessionDate = new Date(`${s.date} ${s.time.split(' ')[0]}`);
            return sessionDate >= now && s.status !== 'CANCELLED';
          } catch {
            return s.status === 'PENDING';
          }
        })
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      const appointmentHistory = appointments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
        $or: [{ userId: userId }, { studentEmail: user.email.toLowerCase() }]
      });

      res.status(200).json({
        success: true,
        message: 'Test results retrieved successfully',
        data: results
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload CIGI Aptitude Test Result
  async addCigiResult(req, res, next) {
    try {
      const userId = req.user.id;
      const { testDate, testTime, note } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image or PDF.'
        });
      }

      // Find user
      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Upload file to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer);

      const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
      const newResult = {
        id: 'cigi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType,
        testDate: testDate || '',
        testTime: testTime || '',
        note: note || '',
        uploadedAt: new Date()
      };

      if (!user.cigiResults) {
        user.cigiResults = [];
      }
      user.cigiResults.push(newResult);
      await user.save();

      const { password, ...userData } = user.toObject();

      res.status(200).json({
        success: true,
        message: 'CIGI Aptitude Test result uploaded successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete CIGI Aptitude Test Result
  async deleteCigiResult(req, res, next) {
    try {
      const userId = req.user.id;
      const { resultId } = req.params;

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const resultIndex = user.cigiResults.findIndex((r) => r.id === resultId);
      if (resultIndex === -1) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }

      const targetResult = user.cigiResults[resultIndex];

      // Delete from Cloudinary if publicId exists
      if (targetResult.publicId) {
        try {
          await cloudinary.uploader.destroy(targetResult.publicId);
        } catch (cloudinaryError) {
          console.error('[Cloudinary Delete Error]:', cloudinaryError);
        }
      }

      user.cigiResults.splice(resultIndex, 1);
      await user.save();

      const { password, ...userData } = user.toObject();

      res.status(200).json({
        success: true,
        message: 'CIGI Aptitude Test result deleted successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Profile Picture
  async updateProfilePic(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image.'
        });
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Delete existing profile pic if it exists
      if (user.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicPublicId);
        } catch (err) {
          console.error('[Cloudinary Delete Avatar Error]:', err);
        }
      }

      // Upload and compress new profile pic
      const uploadResult = await uploadProfilePicToCloudinary(req.file.buffer);

      user.profilePic = uploadResult.secure_url;
      user.profilePicPublicId = uploadResult.public_id;
      await user.save();

      const { password, ...userData } = user.toObject();

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete own profile (soft delete)
  async deleteProfile(req, res, next) {
    try {
      const updated = await StorageService.update('users', req.user.id, { status: 'DELETED' });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UserController;
