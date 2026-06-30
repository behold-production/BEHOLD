const StorageService = require('../services/storageService');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary, uploadProfilePicToCloudinary } = require('../utils/cloudinaryHelper');
const { autoExpireSessions } = require('../utils/sessionHelper');

const AdminController = {
  // Admin Dashboard Statistics
  async getDashboard(req, res, next) {
    try {
      await autoExpireSessions();
      const [users, counsellors, appointments, sessions] = await Promise.all([
        StorageService.findAll('users'),
        StorageService.findAll('counsellors'),
        StorageService.findAll('appointments'),
        StorageService.findAll('sessions')
      ]);

      const pendingRequests = counsellors.filter((c) => !c.isVerified).length;

      // Calculate mock monthly statistics
      const monthlyStats = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0
      };

      appointments.forEach((a) => {
        try {
          const monthIndex = new Date(a.date).getMonth();
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          monthlyStats[months[monthIndex]]++;
        } catch {
          // ignore parsing error
        }
      });

      res.status(200).json({
        success: true,
        message: 'Admin dashboard statistics retrieved successfully',
        data: {
          totalUsers: users.length,
          totalCounsellors: counsellors.length,
          totalAppointments: appointments.length,
          totalSessions: sessions.length,
          pendingRequests,
          monthlyStats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Manage Users - List
  async getUsers(req, res, next) {
    try {
      const users = await StorageService.findAll('users', { status: { $ne: 'DELETED' }, isDeleted: { $ne: true } });
      const safeUsers = users.map(({ password, ...data }) => data);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: safeUsers
      });
    } catch (error) {
      next(error);
    }
  },

  // Manage Counsellors - List
  async getCounsellors(req, res, next) {
    try {
      const counsellors = await StorageService.findAll('counsellors', { isDeleted: { $ne: true } });
      const safeCounsellors = counsellors.map(({ password, ...data }) => data);

      res.status(200).json({
        success: true,
        message: 'Counsellors retrieved successfully',
        data: safeCounsellors
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify/Approve Counsellor
  async verifyCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      if (isVerified === undefined) {
        return res.status(400).json({ success: false, message: 'isVerified status is required' });
      }

      const updated = await StorageService.update('counsellors', id, {
        isVerified,
        status: isVerified ? 'APPROVED' : 'PENDING',
        rejectionReason: isVerified ? '' : ''
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      // Send a notification to the counsellor
      await StorageService.create('notifications', {
        recipientId: id,
        recipientRole: 'counsellor',
        title: isVerified ? 'Account Verified' : 'Account Verification Revoked',
        message: isVerified
          ? 'Congratulations! Your professional counsellor profile has been verified by the administrator.'
          : 'Your professional counsellor verification has been revoked. Please check with administrator.',
        type: 'verification_update',
        isRead: false
      });

      const { password, ...counsellorData } = updated;
      res.status(200).json({
        success: true,
        message: `Counsellor verification status updated to ${isVerified}`,
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  },

  // Reject Counsellor application
  async rejectCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await StorageService.update('counsellors', id, {
        isVerified: false,
        status: 'REJECTED',
        rejectionReason: reason || 'Credentials did not meet verification standards.'
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Counsellor not found' });
      }

      // Send a notification to the counsellor
      await StorageService.create('notifications', {
        recipientId: id,
        recipientRole: 'counsellor',
        title: 'Application Rejected',
        message: `Your professional counsellor profile application has been rejected. Reason: ${reason || 'Credentials did not meet verification standards.'}`,
        type: 'verification_update',
        isRead: false
      });

      const { password, ...counsellorData } = updated;
      res.status(200).json({
        success: true,
        message: 'Counsellor status updated to REJECTED',
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  },

  // Get All Appointments
  async getAppointments(req, res, next) {
    try {
      await autoExpireSessions();
      const [appointments, users, counsellors, sessions] = await Promise.all([
        StorageService.findAll('appointments', { isDeleted: { $ne: true } }),
        StorageService.findAll('users'),
        StorageService.findAll('counsellors'),
        StorageService.findAll('sessions')
      ]);

      const userMap = new Map(users.map(u => [u.id, u]));
      const counsellorMap = new Map(counsellors.map(c => [c.id, c]));
      const sessionMap = new Map(sessions.map(s => [s.appointmentId, s]));

      const populated = appointments.map((a) => {
        const user = userMap.get(a.userId);
        const counsellor = counsellorMap.get(a.counsellorId);
        const session = sessionMap.get(a.id);
        return {
          ...a,
          studentName: user ? user.name : 'Unknown Student',
          counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          notes: session ? session.notes || a.notes || '' : a.notes || '',
          feedback: session ? session.feedback || a.feedback || '' : a.feedback || '',
          nextSession: session ? session.nextSession || a.nextSession || '' : a.nextSession || '',
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
      });

      res.status(200).json({
        success: true,
        message: 'Appointments retrieved successfully',
        data: populated
      });
    } catch (error) {
      next(error);
    }
  },

  // Manage Feedbacks
  async getFeedbacks(req, res, next) {
    try {
      const feedbacks = await StorageService.findAll('feedbacks');
      res.status(200).json({
        success: true,
        message: 'Feedbacks retrieved successfully',
        data: feedbacks
      });
    } catch (error) {
      next(error);
    }
  },

  // Moderate Feedback (Delete/Approve)
  async moderateFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { isModerated } = req.body;

      const updated = await StorageService.update('feedbacks', id, { isModerated });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Feedback not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Feedback moderation status updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // System Settings - Send Global Notification
  async sendSystemNotification(req, res, next) {
    try {
      const { recipientId, recipientRole, title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Title and message are required' });
      }

      const newNotification = await StorageService.create('notifications', {
        recipientId: recipientId || 'ALL',
        recipientRole: recipientRole || 'user',
        title,
        message,
        type: 'system_alert',
        isRead: false
      });

      res.status(201).json({
        success: true,
        message: 'System notification sent successfully',
        data: newNotification
      });
    } catch (error) {
      next(error);
    }
  },

  // Create User
  async createUser(req, res, next) {
    try {
      const { name, email, password, role, permissions, customRoleTitle, locationName, latitude, longitude } = req.body;
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await StorageService.create('users', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: '',
        schoolName: '',
        grade: '',
        guardianName: '',
        guardianPhone: '',
        groupCode: '',
        role: role || 'user',
        permissions: permissions || [],
        customRoleTitle: customRoleTitle || '',
        locationName: locationName || '',
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        status: 'ACTIVE'
      });
      const { password: _, ...userData } = newUser;
      res.status(201).json({ success: true, message: 'User created successfully', data: userData });
    } catch (error) {
      next(error);
    }
  },

  // Update User
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        password,
        role,
        permissions,
        customRoleTitle,
        status,
        phone,
        schoolName,
        grade,
        guardianName,
        guardianPhone,
        groupCode,
        profilePic,
        profilePicPublicId,
        locationName,
        latitude,
        longitude
      } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email.toLowerCase();
      if (role !== undefined) updates.role = role;
      if (permissions !== undefined) updates.permissions = permissions;
      if (customRoleTitle !== undefined) updates.customRoleTitle = customRoleTitle;
      if (locationName !== undefined) updates.locationName = locationName;
      if (latitude !== undefined) updates.latitude = Number(latitude) || 0;
      if (longitude !== undefined) updates.longitude = Number(longitude) || 0;
      if (status !== undefined) updates.status = status;
      if (phone !== undefined) updates.phone = phone;
      if (schoolName !== undefined) updates.schoolName = schoolName;
      if (grade !== undefined) updates.grade = grade;
      if (guardianName !== undefined) updates.guardianName = guardianName;
      if (guardianPhone !== undefined) updates.guardianPhone = guardianPhone;
      if (groupCode !== undefined) updates.groupCode = groupCode;
      if (profilePic !== undefined) updates.profilePic = profilePic;
      if (profilePicPublicId !== undefined) updates.profilePicPublicId = profilePicPublicId;

      if (password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
      }
      const updated = await StorageService.update('users', id, updates);
      if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
      const { password: _, ...userData } = updated;
      res.status(200).json({ success: true, message: 'User updated successfully', data: userData });
    } catch (error) {
      next(error);
    }
  },

  // Delete User (Soft Delete - 30-day trash window)
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const now = new Date();
      const updated = await StorageService.update('users', id, {
        status: 'DELETED',
        isDeleted: true,
        deletedAt: now
      });
      if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
      // Cascade soft-delete: mark all related appointments
      const Appointment = require('../models/Appointment');
      await Appointment.updateMany({ userId: id, isDeleted: { $ne: true } }, { $set: { isDeleted: true, deletedAt: now } });
      res.status(200).json({ success: true, message: 'User moved to trash. Can be restored within 30 days.' });
    } catch (error) {
      next(error);
    }
  },

  // Create Counsellor
  async createCounsellor(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        education,
        specialties,
        price,
        lang,
        bio,
        defaultMeetLink,
        phone,
        hours,
        modes,
        title,
        availability,
        isTopFive
      } = req.body;
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newCounsellor = await StorageService.create('counsellors', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || '',
        role: 'counsellor',
        education: education || '',
        specialties: Array.isArray(specialties)
          ? specialties
          : specialties && typeof specialties === 'string'
            ? specialties
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        qualifications: education ? [education] : [],
        experience: bio || '',
        bio: bio || '',
        availability: availability || {},
        isVerified: true,
        isActive: true,
        rating: 5.0,
        reviewCount: 0,
        price: Number(price) || 1200,
        lang: lang || 'English',
        defaultMeetLink: defaultMeetLink || '',
        modePreference: 'BOTH',
        hours: Number(hours) || 0,
        modes: Array.isArray(modes)
          ? modes
          : modes && typeof modes === 'string'
            ? modes
                .split(',')
                .map((m) => m.trim().toUpperCase())
                .filter(Boolean)
            : ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
        title: title || 'Consultant Psychologist',
        isTopFive: isTopFive === true || isTopFive === 'true'
      });
      const { password: _, ...counsellorData } = newCounsellor;
      res.status(201).json({ success: true, message: 'Counsellor created successfully', data: counsellorData });
    } catch (error) {
      next(error);
    }
  },

  // Update Counsellor
  async updateCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        email,
        password,
        education,
        specialties,
        price,
        lang,
        bio,
        defaultMeetLink,
        phone,
        hours,
        modes,
        title,
        availability,
        profilePic,
        profilePicPublicId,
        isTopFive,
        isActive,
        razorpayAccountId,
        bankAccountNumber,
        bankIfscCode,
        bankAccountName
      } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email.toLowerCase();
      if (education !== undefined) {
        updates.education = education;
        updates.qualifications = [education];
      }
      if (specialties !== undefined) {
        updates.specialties = Array.isArray(specialties)
          ? specialties
          : typeof specialties === 'string'
            ? specialties
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
      }
      if (price !== undefined) updates.price = Number(price);
      if (lang !== undefined) updates.lang = lang;
      if (bio !== undefined) {
        updates.experience = bio;
        updates.bio = bio;
      }
      if (defaultMeetLink !== undefined) updates.defaultMeetLink = defaultMeetLink;
      if (phone !== undefined) updates.phone = phone;
      if (hours !== undefined) updates.hours = Number(hours) || 0;
      if (modes !== undefined) {
        updates.modes = Array.isArray(modes)
          ? (updates.modes = modes)
          : typeof modes === 'string'
            ? (updates.modes = modes
                .split(',')
                .map((m) => m.trim().toUpperCase())
                .filter(Boolean))
            : [];
      }
      if (title !== undefined) updates.title = title;
      if (availability !== undefined) updates.availability = availability;
      if (profilePic !== undefined) updates.profilePic = profilePic;
      if (profilePicPublicId !== undefined) updates.profilePicPublicId = profilePicPublicId;
      if (isTopFive !== undefined) updates.isTopFive = isTopFive === true || isTopFive === 'true';
      if (isActive !== undefined) updates.isActive = isActive === true || isActive === 'true';
      if (razorpayAccountId !== undefined) updates.razorpayAccountId = razorpayAccountId;
      if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode !== undefined) updates.bankIfscCode = bankIfscCode;
      if (bankAccountName !== undefined) updates.bankAccountName = bankAccountName;

      if (password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
      }
      const updated = await StorageService.update('counsellors', id, updates);
      if (!updated) return res.status(404).json({ success: false, message: 'Counsellor not found' });

      // Send WhatsApp Notification if status changed
      if (updates.isActive !== undefined && updated.phone) {
        const WhatsAppService = require('../services/whatsappService');
        const msg = updates.isActive 
          ? `Congratulations ${updated.name}! Your counsellor profile has been Activated by the admin team.`
          : `Notice: Your counsellor profile has been Deactivated. Please contact support.`;
        WhatsAppService.sendNotification(updated.phone, msg).catch(err => console.error(err));
      }

      const { password: _, ...counsellorData } = updated;
      res.status(200).json({ success: true, message: 'Counsellor updated successfully', data: counsellorData });
    } catch (error) {
      next(error);
    }
  },

  // Delete Counsellor (Soft Delete - 30-day trash window)
  async deleteCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const now = new Date();
      const updated = await StorageService.update('counsellors', id, {
        status: 'DELETED',
        isVerified: false,
        isDeleted: true,
        deletedAt: now
      });
      if (!updated) return res.status(404).json({ success: false, message: 'Counsellor not found' });
      // Cascade soft-delete: mark all related appointments as deleted too
      const Appointment = require('../models/Appointment');
      await Appointment.updateMany({ counsellorId: id, isDeleted: { $ne: true } }, { $set: { isDeleted: true, deletedAt: now } });
      res.status(200).json({ success: true, message: 'Psychologist moved to trash. Can be restored within 30 days.' });
    } catch (error) {
      next(error);
    }
  },

  // ── Trash & Restore System ───────────────────────────────────────────────

  // Get all soft-deleted items (within 30 days)
  async getTrashItems(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [counsellors, users, appointments] = await Promise.all([
        StorageService.findAll('counsellors', { isDeleted: true, deletedAt: { $gte: thirtyDaysAgo } }),
        StorageService.findAll('users', { isDeleted: true, deletedAt: { $gte: thirtyDaysAgo } }),
        StorageService.findAll('appointments', { isDeleted: true, deletedAt: { $gte: thirtyDaysAgo } })
      ]);

      const safeCounsellors = counsellors.map(({ password, ...data }) => data);
      const safeUsers = users.map(({ password, ...data }) => data);

      res.status(200).json({
        success: true,
        data: {
          counsellors: safeCounsellors,
          users: safeUsers,
          appointments
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Restore Counsellor from trash
  async restoreCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const counsellor = await StorageService.findOne('counsellors', { id, isDeleted: true });
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found in trash' });
      }
      const restored = await StorageService.update('counsellors', id, {
        isDeleted: false,
        deletedAt: null,
        status: 'APPROVED',
        isVerified: true
      });
      // Also restore their appointments that were deleted at the same time
      const Appointment = require('../models/Appointment');
      await Appointment.updateMany(
        { counsellorId: id, isDeleted: true, deletedAt: counsellor.deletedAt },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      const { password, ...data } = restored;
      res.status(200).json({ success: true, message: 'Psychologist restored successfully', data });
    } catch (error) {
      next(error);
    }
  },

  // Restore User from trash
  async restoreUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await StorageService.findOne('users', { id, isDeleted: true });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found in trash' });
      }
      const restored = await StorageService.update('users', id, {
        isDeleted: false,
        deletedAt: null,
        status: 'ACTIVE'
      });
      // Also restore their appointments deleted at same time
      const Appointment = require('../models/Appointment');
      await Appointment.updateMany(
        { userId: id, isDeleted: true, deletedAt: user.deletedAt },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      const { password, ...data } = restored;
      res.status(200).json({ success: true, message: 'User restored successfully', data });
    } catch (error) {
      next(error);
    }
  },

  // Restore a single appointment from trash
  async restoreAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const appt = await StorageService.findOne('appointments', { id, isDeleted: true });
      if (!appt) {
        return res.status(404).json({ success: false, message: 'Appointment not found in trash' });
      }
      const restored = await StorageService.update('appointments', id, {
        isDeleted: false,
        deletedAt: null
      });
      res.status(200).json({ success: true, message: 'Appointment restored successfully', data: restored });
    } catch (error) {
      next(error);
    }
  },

  // Permanently delete counsellor (admin manual hard-delete)
  async permanentDeleteCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const counsellor = await StorageService.findOne('counsellors', { id, isDeleted: true });
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Counsellor not found in trash' });
      }
      // Also hard-delete their soft-deleted appointments
      const Appointment = require('../models/Appointment');
      await Appointment.deleteMany({ counsellorId: id, isDeleted: true });
      await StorageService.delete('counsellors', id);
      res.status(200).json({ success: true, message: 'Psychologist permanently deleted.' });
    } catch (error) {
      next(error);
    }
  },

  // Permanently delete user (admin manual hard-delete)
  async permanentDeleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await StorageService.findOne('users', { id, isDeleted: true });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found in trash' });
      }
      // Also hard-delete their soft-deleted appointments
      const Appointment = require('../models/Appointment');
      await Appointment.deleteMany({ userId: id, isDeleted: true });
      await StorageService.delete('users', id);
      res.status(200).json({ success: true, message: 'User permanently deleted.' });
    } catch (error) {
      next(error);
    }
  },

  // Permanently delete appointment (admin manual hard-delete)
  async permanentDeleteAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const appt = await StorageService.findOne('appointments', { id, isDeleted: true });
      if (!appt) {
        return res.status(404).json({ success: false, message: 'Appointment not found in trash' });
      }
      const Session = require('../models/Session');
      await Session.deleteMany({ appointmentId: id });
      await StorageService.delete('appointments', id);
      res.status(200).json({ success: true, message: 'Appointment permanently deleted.' });
    } catch (error) {
      next(error);
    }
  },

  // Purge all items expired beyond 30 days from trash
  async purgeExpiredTrash(req, res, next) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const Counsellor = require('../models/Counsellor');
      const User = require('../models/User');
      const Appointment = require('../models/Appointment');
      const [c, u, a] = await Promise.all([
        Counsellor.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } }),
        User.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } }),
        Appointment.deleteMany({ isDeleted: true, deletedAt: { $lt: thirtyDaysAgo } })
      ]);
      res.status(200).json({
        success: true,
        message: 'Expired trash purged successfully',
        data: { counsellorsRemoved: c.deletedCount, usersRemoved: u.deletedCount, appointmentsRemoved: a.deletedCount }
      });
    } catch (error) {
      next(error);
    }
  },

  // FAQs management
  async getFaqs(req, res, next) {
    try {
      const faqs = await StorageService.findAll('faqs');
      res.status(200).json({ success: true, data: faqs });
    } catch (error) {
      next(error);
    }
  },

  async createFaq(req, res, next) {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ success: false, message: 'Question and answer are required' });
      }
      const newFaq = await StorageService.create('faqs', { question, answer });
      res.status(201).json({ success: true, message: 'FAQ created successfully', data: newFaq });
    } catch (error) {
      next(error);
    }
  },

  async updateFaq(req, res, next) {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      const updated = await StorageService.update('faqs', id, { question, answer });
      if (!updated) return res.status(404).json({ success: false, message: 'FAQ not found' });
      res.status(200).json({ success: true, message: 'FAQ updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteFaq(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('faqs', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'FAQ not found' });
      res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Inquiries management
  async getInquiries(req, res, next) {
    try {
      const inquiries = await StorageService.findAll('inquiries');
      res.status(200).json({ success: true, data: inquiries });
    } catch (error) {
      next(error);
    }
  },

  async resolveInquiry(req, res, next) {
    try {
      const { id } = req.params;
      const inquiry = await StorageService.findById('inquiries', id);
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      const newStatus = inquiry.status === 'RESOLVED' ? 'PENDING' : 'RESOLVED';
      const updated = await StorageService.update('inquiries', id, { status: newStatus });
      res.status(200).json({ success: true, message: 'Inquiry status updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async saveInquiryNote(req, res, next) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const updated = await StorageService.update('inquiries', id, { note: note || '' });
      if (!updated) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      res.status(200).json({ success: true, message: 'Inquiry note updated', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteInquiry(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('inquiries', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Inquiry not found' });
      res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async clearResolvedInquiries(req, res, next) {
    try {
      const Inquiry = require('../models/Inquiry');
      await Inquiry.deleteMany({ status: 'RESOLVED' });
      res.status(200).json({ success: true, message: 'Resolved inquiries cleared successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Settings management
  async getSettings(req, res, next) {
    try {
      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        settings = await StorageService.create('settings', {
          heroTitle: 'Bridging You \nTo Your {True Growth.}',
          heroSub:
            'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
          whatsapp: 'https://wa.me/919497174011',
          contactEmail: 'support@behold.com',
          siteName: 'BEHOLD',
          siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
          showBanner: false,
          bannerNotice:
            '🚨 Maintenance Notice: Schedulers undergoing maintenance tonight between 12:00 AM - 02:00 AM IST.',
          termsOfUse:
            'Welcome to BEHOLD. By accessing or using our platform, you agree to comply with and be bound by the terms and conditions.',
          privacyPolicy:
            'Your privacy is extremely important to us. This policy describes how we collect, protect, and use your personal information.',
          enablePsychology: true,
          enableAptitude: true,
          enableOnline: true,
          enableOffline: true,
          enableDoorstep: true,
          gstEnabled: false,
          gstPercent: 0,
          counsellorSplitPercent: 50,
          careerBadge: 'Career Mentoring',
          careerTitle: 'Career Clarity & Direction',
          careerSubtitle: 'Feeling Unsure About What’s Next?',
          careerDesc: 'Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.',
          careerBtnText: 'Book Your Mentor',
          counselBadge: 'Psychological Counselling',
          counselTitle: 'Emotional Wellbeing & Support',
          counselSubtitle: 'You Don’t Have to Face It Alone.',
          counselDesc: 'When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.',
          counselBtnText: 'Book Your Therapist',
          aboutTitle: 'What We Offer',
          aboutSub: 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.',
          offer1Title: 'Extended Mentorship',
          offer1Desc: 'We guide students through milestones to turn assessment reports into real achievements.',
          offer2Title: 'Doorstep & Online Counseling',
          offer2Desc: 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.',
          offer3Title: 'Personalized School Programs',
          offer3Desc: 'We conduct orientations and workshops to build healthy learning environments in schools.',
          offer4Title: 'C-DAT & Career Roadmaps',
          offer4Desc: 'We use aptitude evaluations to match university pathways with individual natural talents.',
          offer5Title: 'Goal Tracking',
          offer5Desc: 'We provide continuous reviews to keep students on track with their long-term goals.',
          offer6Title: 'Parent Guidance',
          offer6Desc: 'We guide parents to reduce academic friction and relieve student stress.'
        });
      }
      res.status(200).json({
        success: true,
        data: {
          ...settings,
          enablePsychology: settings.enablePsychology !== false,
          enableAptitude: settings.enableAptitude !== false,
          enableOnline: settings.enableOnline !== false,
          enableOffline: settings.enableOffline !== false,
          enableDoorstep: settings.enableDoorstep !== false
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const updates = req.body;
      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        settings = await StorageService.create('settings', updates);
      } else {
        settings = await StorageService.update('settings', settings.id, updates);
      }
      res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
      next(error);
    }
  },

  // ── IP Blocklist ──────────────────────────────────────────────────────────
  async getBlockedIps(req, res, next) {
    try {
      const { invalidateIpCache } = require('../middleware/ipBlockMiddleware');
      let settingsList = await StorageService.findAll('settings');
      const settings = settingsList[0];
      res.status(200).json({ success: true, data: settings?.blockedIps ?? [] });
    } catch (error) {
      next(error);
    }
  },

  async addBlockedIp(req, res, next) {
    try {
      const { invalidateIpCache } = require('../middleware/ipBlockMiddleware');
      const { ip } = req.body;
      if (!ip || typeof ip !== 'string') {
        return res.status(400).json({ success: false, message: 'IP address is required' });
      }
      // Basic IPv4/IPv6 sanity check
      const ipTrimmed = ip.trim();
      if (!/^[\d.:a-fA-F]+$/.test(ipTrimmed)) {
        return res.status(400).json({ success: false, message: 'Invalid IP address format' });
      }

      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        settings = await StorageService.create('settings', { blockedIps: [ipTrimmed] });
      } else {
        const current = settings.blockedIps ?? [];
        if (current.includes(ipTrimmed)) {
          return res.status(409).json({ success: false, message: 'IP is already blocked' });
        }
        settings = await StorageService.update('settings', settings.id, {
          blockedIps: [...current, ipTrimmed]
        });
      }
      invalidateIpCache();
      res
        .status(200)
        .json({ success: true, message: `IP ${ipTrimmed} blocked successfully`, data: settings.blockedIps });
    } catch (error) {
      next(error);
    }
  },

  async removeBlockedIp(req, res, next) {
    try {
      const { invalidateIpCache } = require('../middleware/ipBlockMiddleware');
      const ipToRemove = decodeURIComponent(req.params.ip);
      let settingsList = await StorageService.findAll('settings');
      let settings = settingsList[0];
      if (!settings) {
        return res.status(404).json({ success: false, message: 'Settings not found' });
      }
      const current = settings.blockedIps ?? [];
      if (!current.includes(ipToRemove)) {
        return res.status(404).json({ success: false, message: 'IP not found in blocklist' });
      }
      settings = await StorageService.update('settings', settings.id, {
        blockedIps: current.filter((i) => i !== ipToRemove)
      });
      invalidateIpCache();
      res
        .status(200)
        .json({ success: true, message: `IP ${ipToRemove} unblocked successfully`, data: settings.blockedIps });
    } catch (error) {
      next(error);
    }
  },

  // Roles management
  async getRoles(req, res, next) {
    try {
      const roles = await StorageService.findAll('roles');
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  },

  async createRole(req, res, next) {
    try {
      const { name, permissions, description } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });
      const newRole = await StorageService.create('roles', {
        name,
        description: description || '',
        permissions: permissions || []
      });
      res.status(201).json({ success: true, message: 'Role created successfully', data: newRole });
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { name, permissions, description } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (permissions !== undefined) updates.permissions = permissions;

      const updated = await StorageService.update('roles', id, updates);
      if (!updated) return res.status(404).json({ success: false, message: 'Role not found' });
      res.status(200).json({ success: true, message: 'Role updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('roles', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Role not found' });
      res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Test Results management
  async getTestResults(req, res, next) {
    try {
      const testResults = await StorageService.findAll('testresults');
      res.status(200).json({ success: true, data: testResults });
    } catch (error) {
      next(error);
    }
  },

  async deleteTestResult(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('testresults', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Test result not found' });
      res.status(200).json({ success: true, message: 'Test result deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Appointments management
  async createAppointment(req, res, next) {
    try {
      const { userId, advisorId, service, mode, date, time, status, meetLink, clientLocationName, clientLatitude, clientLongitude } = req.body;
      if (!userId || !advisorId || !date || !time) {
        return res.status(400).json({ success: false, message: 'UserId, advisorId, date, and time are required' });
      }

      const counsellor = await StorageService.findById('users', advisorId);

      const newAppointment = await StorageService.create('appointments', {
        userId,
        counsellorId: advisorId,
        service: service || 'counselling',
        mode: mode || 'ONLINE',
        date,
        time,
        status: status === 'CONFIRMED' ? 'APPROVED' : status || 'PENDING',
        meetLink: meetLink || (mode === 'ONLINE' && counsellor ? counsellor.defaultMeetLink || '' : ''),
        clientLocationName: clientLocationName || '',
        clientLatitude: Number(clientLatitude) || 0,
        clientLongitude: Number(clientLongitude) || 0
      });

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: newAppointment
      });
    } catch (error) {
      next(error);
    }
  },

  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const {
        userId,
        advisorId,
        service,
        mode,
        date,
        time,
        status,
        meetLink,
        cancellationReason,
        notes,
        feedback,
        nextSession,
        adminNotes,
        clientLocationName,
        clientLatitude,
        clientLongitude
      } = req.body;

      const updates = {};
      if (userId !== undefined) updates.userId = userId;
      if (advisorId !== undefined) updates.counsellorId = advisorId;
      if (service !== undefined) updates.service = service;
      if (mode !== undefined) updates.mode = mode;
      if (date !== undefined) updates.date = date;
      if (time !== undefined) updates.time = time;
      if (status !== undefined) {
        updates.status = status === 'CONFIRMED' ? 'APPROVED' : status;
        if (status === 'CANCELLED') {
          updates.cancellationReason = cancellationReason || 'Cancelled by administrator.';
          updates.cancelledBy = req.user.role || 'admin';
          updates.refundStatus = appointment.paymentStatus === 'PAID' ? 'PENDING' : 'NONE';
        }
      }
      if (meetLink !== undefined) updates.meetLink = meetLink;
      if (notes !== undefined) updates.notes = notes;
      if (feedback !== undefined) updates.feedback = feedback;
      if (nextSession !== undefined) updates.nextSession = nextSession;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;
      if (clientLocationName !== undefined) updates.clientLocationName = clientLocationName;
      if (clientLatitude !== undefined) updates.clientLatitude = Number(clientLatitude) || 0;
      if (clientLongitude !== undefined) updates.clientLongitude = Number(clientLongitude) || 0;

      const updated = await StorageService.update('appointments', id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Keep matching session in sync if it exists
      const session = await StorageService.findOne('sessions', { appointmentId: id });
      if (session) {
        const sessionUpdates = {};
        if (updates.counsellorId !== undefined) sessionUpdates.counsellorId = updates.counsellorId;
        if (updates.userId !== undefined) sessionUpdates.userId = updates.userId;
        if (updates.date !== undefined) sessionUpdates.date = updates.date;
        if (updates.time !== undefined) sessionUpdates.time = updates.time;
        if (updates.mode !== undefined) sessionUpdates.mode = updates.mode;
        if (updates.status !== undefined) sessionUpdates.status = updates.status;
        if (updates.meetLink !== undefined) sessionUpdates.meetLink = updates.meetLink;
        if (updates.notes !== undefined) sessionUpdates.notes = updates.notes;
        if (updates.feedback !== undefined) sessionUpdates.feedback = updates.feedback;
        if (updates.nextSession !== undefined) sessionUpdates.nextSession = updates.nextSession;
        if (updates.adminNotes !== undefined) sessionUpdates.adminNotes = updates.adminNotes;
        if (updates.cancellationReason !== undefined) sessionUpdates.cancellationReason = updates.cancellationReason;
        if (updates.cancelledBy !== undefined) sessionUpdates.cancelledBy = updates.cancelledBy;
        if (updates.clientLocationName !== undefined) sessionUpdates.clientLocationName = updates.clientLocationName;
        if (updates.clientLatitude !== undefined) sessionUpdates.clientLatitude = updates.clientLatitude;
        if (updates.clientLongitude !== undefined) sessionUpdates.clientLongitude = updates.clientLongitude;

        await StorageService.update('sessions', session.id, sessionUpdates);
      }

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await StorageService.update('appointments', id, {
        isDeleted: true,
        deletedAt: new Date()
      });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.status(200).json({ success: true, message: 'Appointment moved to trash. Can be restored within 30 days.' });
    } catch (error) {
      next(error);
    }
  },

  // Aptitude Questions Management
  async getAptitudeQuestions(req, res, next) {
    try {
      const questions = await StorageService.findAll('aptitudequestions');
      res.status(200).json({ success: true, data: questions });
    } catch (error) {
      next(error);
    }
  },

  async createAptitudeQuestion(req, res, next) {
    try {
      const { question, category, options, isActive } = req.body;
      if (!question || !category || !options || options.length === 0) {
        return res.status(400).json({ success: false, message: 'Question, category, and options are required' });
      }
      const newQuestion = await StorageService.create('aptitudequestions', {
        question,
        category,
        options,
        isActive: isActive !== false
      });
      res.status(201).json({ success: true, message: 'Aptitude question created successfully', data: newQuestion });
    } catch (error) {
      next(error);
    }
  },

  async updateAptitudeQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const { question, category, options, isActive } = req.body;
      const updates = {};
      if (question !== undefined) updates.question = question;
      if (category !== undefined) updates.category = category;
      if (options !== undefined) updates.options = options;
      if (isActive !== undefined) updates.isActive = isActive;

      const updated = await StorageService.update('aptitudequestions', id, updates);
      if (!updated) return res.status(404).json({ success: false, message: 'Aptitude question not found' });
      res.status(200).json({ success: true, message: 'Aptitude question updated successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async deleteAptitudeQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('aptitudequestions', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Aptitude question not found' });
      res.status(200).json({ success: true, message: 'Aptitude question deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Upload CIGI Aptitude Test Result for student
  async addCigiResult(req, res, next) {
    try {
      const { userId } = req.params;
      const { testDate, testTime, note } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image or PDF.'
        });
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

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

  // Edit CIGI Aptitude Test Result (Update metadata or replace file)
  async editCigiResult(req, res, next) {
    try {
      const { userId, resultId } = req.params;
      const { testDate, testTime, note } = req.body;

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

      const Cigis = user.cigiResults || [];
      const resultIndex = Cigis.findIndex((r) => r.id === resultId);
      if (resultIndex === -1) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }

      const targetResult = Cigis[resultIndex];

      // If a new file is uploaded, replace the existing file
      if (req.file) {
        // Delete old file from Cloudinary first if publicId exists
        if (targetResult.publicId) {
          try {
            await cloudinary.uploader.destroy(targetResult.publicId);
          } catch (cloudinaryError) {
            console.error('[Cloudinary Delete Error]:', cloudinaryError);
          }
        }

        // Upload new file
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        targetResult.fileUrl = uploadResult.secure_url;
        targetResult.publicId = uploadResult.public_id;
        targetResult.fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
      }

      // Update other fields
      if (testDate !== undefined) targetResult.testDate = testDate;
      if (testTime !== undefined) targetResult.testTime = testTime;
      if (note !== undefined) targetResult.note = note;

      // Mark the array element as modified
      user.markModified('cigiResults');
      await user.save();

      const { password, ...userData } = user.toObject();

      res.status(200).json({
        success: true,
        message: 'CIGI Aptitude Test result updated successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete CIGI Aptitude Test Result
  async deleteCigiResult(req, res, next) {
    try {
      const { userId, resultId } = req.params;

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

      const Cigis = user.cigiResults || [];
      const resultIndex = Cigis.findIndex((r) => r.id === resultId);
      if (resultIndex === -1) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }

      const targetResult = Cigis[resultIndex];

      // Delete from Cloudinary if publicId exists
      if (targetResult.publicId) {
        try {
          await cloudinary.uploader.destroy(targetResult.publicId);
        } catch (cloudinaryError) {
          console.error('[Cloudinary Delete Error]:', cloudinaryError);
        }
      }

      Cigis.splice(resultIndex, 1);
      user.cigiResults = Cigis;
      user.markModified('cigiResults');
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

  // Admin upload/update student profile pic
  async updateUserProfilePic(req, res, next) {
    try {
      const { userId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image.'
        });
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

      // Delete existing profile pic if it exists
      if (user.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicPublicId);
        } catch (err) {
          console.error('[Cloudinary Delete User Avatar Error]:', err);
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
        message: 'Student profile picture updated successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin upload/update psychologist profile pic
  async updateCounsellorProfilePic(req, res, next) {
    try {
      const { counsellorId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided. Please select an image.'
        });
      }

      const counsellor = await Counsellor.findOne({ id: counsellorId });
      if (!counsellor) {
        return res.status(404).json({ success: false, message: 'Psychologist not found' });
      }

      // Delete existing profile pic if it exists
      if (counsellor.profilePicPublicId) {
        try {
          await cloudinary.uploader.destroy(counsellor.profilePicPublicId);
        } catch (err) {
          console.error('[Cloudinary Delete Psychologist Avatar Error]:', err);
        }
      }

      // Upload and compress new profile pic
      const uploadResult = await uploadProfilePicToCloudinary(req.file.buffer);

      counsellor.profilePic = uploadResult.secure_url;
      counsellor.profilePicPublicId = uploadResult.public_id;
      await counsellor.save();

      const { password, ...counsellorData } = counsellor.toObject();

      res.status(200).json({
        success: true,
        message: 'Psychologist profile picture updated successfully',
        data: counsellorData
      });
    } catch (error) {
      next(error);
    }
  },

  // Refund Management
  async getRefundRequests(req, res, next) {
    try {
      const [appointments, users, counsellors] = await Promise.all([
        StorageService.findAll('appointments'),
        StorageService.findAll('users'),
        StorageService.findAll('counsellors')
      ]);

      const userMap = new Map(users.map(u => [u.id, u]));
      const counsellorMap = new Map(counsellors.map(c => [c.id, c]));

      const refundRequests = appointments
        .filter(a => a.refundStatus && a.refundStatus !== 'NONE')
        .map((a) => {
          const user = userMap.get(a.userId);
          const counsellor = counsellorMap.get(a.counsellorId);
          return {
            ...a,
            studentName: user ? user.name : 'Unknown Student',
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            studentEmail: user ? user.email : '',
            counsellorEmail: counsellor ? counsellor.email : '',
            counsellorBank: counsellor ? {
              accountName: counsellor.bankAccountName || '',
              accountNumber: counsellor.bankAccountNumber || '',
              ifscCode: counsellor.bankIfscCode || ''
            } : null
          };
        });

      res.status(200).json({ success: true, data: refundRequests });
    } catch (error) {
      next(error);
    }
  },

  async approveRefund(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (appointment.refundStatus !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Refund is not in PENDING status' });
      }

      // Process with Razorpay if keys and paymentId exist
      let refundId = 'manual_' + Date.now();
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && appointment.razorpayPaymentId) {
        try {
          const Razorpay = require('razorpay');
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
          });
          const refund = await razorpay.payments.refund(appointment.razorpayPaymentId, {
            amount: Math.round(appointment.amountPaid * 100),
            reverse_all: true
          });
          refundId = refund.id;
        } catch (err) {
          console.warn("Razorpay API refund failed. Proceeding with manual/local refund marking.", err.message);
          refundId = `manual_err_${Date.now()}`;
        }
      }

      const updated = await StorageService.update('appointments', id, {
        refundStatus: 'REFUNDED',
        refundId,
        refundedAt: new Date()
      });

      res.status(200).json({ success: true, message: 'Refund approved and processed successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async rejectRefund(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (appointment.refundStatus !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Refund is not in PENDING status' });
      }

      const updated = await StorageService.update('appointments', id, {
        refundStatus: 'REJECTED'
      });

      res.status(200).json({ success: true, message: 'Refund request rejected successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AdminController;
