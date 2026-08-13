const StorageService = require('../services/storageService');
const Counsellor = require('../models/Counsellor');
const cloudinary = require('../config/cloudinary');
const { uploadProfilePicToCloudinary } = require('../utils/cloudinaryHelper');
const { autoExpireSessions } = require('../utils/sessionHelper');
const cacheHelper = require('../utils/cacheHelper');

const COUNSELLOR_MODES = new Set(['ONLINE', 'OFFLINE', 'DOOR_STEP']);

const normalizeList = (value) => {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
};

const normalizeModes = (value) => normalizeList(value).map((mode) => mode.toUpperCase()).filter((mode) => COUNSELLOR_MODES.has(mode));

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
      const {
        name,
        title,
        phone,
        specialties,
        qualifications,
        experience,
        modePreference,
        bio,
        education,
        price,
        halfSessionPrice,
        lang,
        defaultMeetLink,
        hours,
        modes,
        locationName,
        latitude,
        longitude,
        bankAccountNumber,
        bankIfscCode,
        bankAccountName
      } = req.body;
      const updates = {};

      if (name !== undefined) {
        if (!String(name).trim()) {
          return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        }
        updates.name = String(name).trim();
      }
      if (title !== undefined) updates.title = String(title).trim() || 'Consultant Psychologist';
      if (phone !== undefined) updates.phone = phone;
      if (specialties !== undefined) updates.specialties = normalizeList(specialties);
      if (qualifications !== undefined) updates.qualifications = normalizeList(qualifications);
      if (experience !== undefined) updates.experience = experience;
      if (modePreference !== undefined) updates.modePreference = modePreference;
      if (bio !== undefined) updates.bio = bio;
      if (education !== undefined) updates.education = education;
      if (price !== undefined) {
        const parsedPrice = Number(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
        }
        updates.price = parsedPrice;
      }
      if (halfSessionPrice !== undefined) {
        const parsedHalf = Number(halfSessionPrice);
        if (!Number.isFinite(parsedHalf) || parsedHalf < 0) {
          return res.status(400).json({ success: false, message: 'Half session price must be a non-negative number' });
        }
        updates.halfSessionPrice = parsedHalf;
      }
      if (lang !== undefined) updates.lang = lang;
      if (defaultMeetLink !== undefined) updates.defaultMeetLink = defaultMeetLink;
      if (hours !== undefined) {
        const parsedHours = Number(hours);
        if (!Number.isFinite(parsedHours) || parsedHours < 0) {
          return res.status(400).json({ success: false, message: 'Experience hours must be a non-negative number' });
        }
        updates.hours = parsedHours;
      }
      if (modes !== undefined) {
        updates.modes = normalizeModes(modes);
        if (updates.modes.length === 0) {
          return res.status(400).json({ success: false, message: 'Select at least one valid consultation mode' });
        }
      }
      if (locationName !== undefined) updates.locationName = locationName;
      if (latitude !== undefined) {
        const parsedLatitude = Number(latitude);
        if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
          return res.status(400).json({ success: false, message: 'Latitude must be between -90 and 90' });
        }
        updates.latitude = parsedLatitude;
      }
      if (longitude !== undefined) {
        const parsedLongitude = Number(longitude);
        if (!Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
          return res.status(400).json({ success: false, message: 'Longitude must be between -180 and 180' });
        }
        updates.longitude = parsedLongitude;
      }
      if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode !== undefined) updates.bankIfscCode = bankIfscCode;
      if (bankAccountName !== undefined) updates.bankAccountName = bankAccountName;

      const updated = await StorageService.update('counsellors', req.user.id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      cacheHelper.clear('counsellors_list_');

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
      await autoExpireSessions();
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
      const todaySessions = sessions.filter((s) => s.date === todayStr && s.status !== 'CANCELLED');

      // Upcoming sessions
      const now = new Date();
      const upcomingAppointments = appointments.filter((a) => {
        try {
          const appointmentDate = new Date(`${a.date} ${a.time.split(' ')[0]}`);
          return appointmentDate >= now && (a.status === 'PENDING' || a.status === 'APPROVED' || a.status === 'CONFIRMED');
        } catch {
          return a.status === 'PENDING' || a.status === 'CONFIRMED';
        }
      });

      // Total clients (distinct users)
      const clientIds = new Set(appointments.map((a) => a.userId));
      const totalClients = clientIds.size;

      // Feedbacks summary
      const feedbacks = await StorageService.findAll('feedbacks', { counsellorId, isModerated: false });
      const avgRating =
        feedbacks.length > 0
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
          earningsPlaceholder: `$${sessions.filter((s) => s.status === 'COMPLETED').length * 50}` // Dev mock
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Profile Picture
  async updateProfilePic(req, res, next) {
    try {
      const counsellorId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image.'
        });
      }

      const counsellor = await StorageService.findById('counsellors', counsellorId);
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      // Delete existing profile pic if it exists
      if (counsellor.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(counsellor.profilePicPublicId);
        } catch (err) {
          console.error('[Cloudinary Delete Avatar Error]:', err);
        }
      }

      // Upload and compress new profile pic
      const uploadResult = await uploadProfilePicToCloudinary(req.file.buffer);

      const updated = await StorageService.update('counsellors', counsellorId, {
        profilePic: uploadResult.secure_url,
        profilePicPublicId: uploadResult.public_id
      });

      const { password, ...counsellorData } = updated || counsellor;

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CounsellorController;
