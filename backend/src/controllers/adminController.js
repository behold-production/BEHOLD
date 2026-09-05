const StorageService = require('../services/storageService');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary, uploadProfilePicToCloudinary } = require('../utils/cloudinaryHelper');
const EmailService = require('../services/emailService');
const WhatsAppService = require('../services/whatsappService');
const { autoExpireSessions } = require('../utils/sessionHelper');
const cacheHelper = require('../utils/cacheHelper');

const COUNSELLOR_MODES = new Set(['ONLINE', 'OFFLINE', 'DOOR_STEP']);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeStringList = (value) => {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
};

const normalizeModes = (value) =>
  normalizeStringList(value)
    .map((mode) => mode.toUpperCase())
    .filter((mode) => COUNSELLOR_MODES.has(mode));

const getNumber = (value, field, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    const error = new Error(`${field} must be a number between ${min} and ${max}`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

async function ensureEmailAvailable(email, excludeId) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(normalizedEmail) || normalizedEmail.includes('@temp.behold')) {
    const error = new Error('A valid, real email address is required');
    error.statusCode = 400;
    throw error;
  }

  const [user, counsellor] = await Promise.all([
    StorageService.findOne('users', { email: normalizedEmail }),
    StorageService.findOne('counsellors', { email: normalizedEmail })
  ]);

  if ((user && user.id !== excludeId) || (counsellor && counsellor.id !== excludeId)) {
    const error = new Error('An account already exists with this email address');
    error.statusCode = 409;
    throw error;
  }

  return normalizedEmail;
}

function flushCounsellorCaches() {
  try {
    cacheHelper.clear();
    const { cache } = require('../middleware/cacheMiddleware');
    if (cache && typeof cache.flushAll === 'function') {
      cache.flushAll();
    }
  } catch (e) {}
}

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
      const { isVerified: rawIsVerified } = req.body;

      if (rawIsVerified === undefined || ![true, false, 'true', 'false'].includes(rawIsVerified)) {
        return res.status(400).json({ success: false, message: 'isVerified status is required' });
      }
      const isVerified = rawIsVerified === true || rawIsVerified === 'true';

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

      // ── Email notification ───────────────────────────────────────────────
      if (isVerified && updated.email) {
        EmailService.sendCounsellorVerified(updated).catch(err => console.error('[Email Verify Error]:', err));
      }

      // ── WhatsApp notification ─────────────────────────────────────────
      if (updated.phone) {
        const waMsg = isVerified
          ? `✅ *BEHOLD. — Account Verified!*

Congratulations, *${updated.name}*!

Your psychologist profile has been *approved* by our admin team. Your profile is now live and students can book sessions with you.

🔗 Log in to your dashboard:
https://www.behold.co.in/counsellor`
          : `⚠️ *BEHOLD. — Verification Update*

Hi *${updated.name}*,

Your verification status has been updated. Please log in to your dashboard for details or contact support.

🔗 Dashboard:
https://www.behold.co.in/counsellor`;
        WhatsAppService.sendNotification(updated.phone, waMsg).catch(err => console.error('[WA Verify Error]:', err));
      }

      flushCounsellorCaches();

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

      // ── Email notification ───────────────────────────────────────────────
      if (updated.email) {
        EmailService.sendCounsellorRejected(updated, reason).catch(err => console.error('[Email Reject Counsellor Error]:', err));
      }

      // ── WhatsApp notification ─────────────────────────────────────────
      if (updated.phone) {
        const waMsg = `❌ *BEHOLD. — Application Update*

Hi *${updated.name}*,

We’ve reviewed your psychologist profile application and unfortunately we are *unable to approve* it at this time.

${reason ? `*Reason:* ${reason}` : ''}

If you have questions or would like to reapply with updated information, please contact our support team.

📧 support@behold.co.in
🔗 www.behold.co.in`;
        WhatsAppService.sendNotification(updated.phone, waMsg).catch(err => console.error('[WA Reject Counsellor Error]:', err));
      }

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
      const { cleanDuplicateAppointments } = require('../utils/appointmentDeduplicator');
      await cleanDuplicateAppointments();

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
          studentName: a.clientName || (user ? user.name : 'Unknown Student'),
          counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
          notes: session ? session.notes || a.notes || '' : a.notes || '',
          feedback: session ? session.feedback || a.feedback || '' : a.feedback || '',
          nextSession: session ? session.nextSession || a.nextSession || '' : a.nextSession || '',
          student: {
            name: a.clientName || (user ? user.name : 'Unknown Student'),
            email: a.clientEmail || (user ? user.email : ''),
            phone: a.clientPhone || (user ? user.phone : ''),
            schoolName: user ? user.schoolName : '',
            grade: user ? user.grade : '',
            guardianName: user ? user.guardianName : '',
            guardianPhone: user ? user.guardianPhone : ''
          },
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

  // System Settings - Send Global / Targeted Broadcast Notification
  async sendSystemNotification(req, res, next) {
    try {
      const { recipientId, recipientRole, title, message, sendWhatsApp } = req.body;
      const WhatsAppService = require('../services/whatsappService');

      if (!title || !message) {
        return res.status(400).json({ success: false, message: 'Title and message are required' });
      }

      const roleTarget = (recipientRole || 'user').toLowerCase();
      let recipientsToNotify = [];

      if (roleTarget === 'all' || roleTarget === 'user') {
        const users = await StorageService.findAll('users', { isDeleted: { $ne: true } });
        recipientsToNotify.push(...users.map((u) => ({ ...u, role: 'user' })));
      }
      if (roleTarget === 'all' || roleTarget === 'counsellor' || roleTarget === 'psychologist') {
        const counsellors = await StorageService.findAll('counsellors', { isDeleted: { $ne: true } });
        recipientsToNotify.push(...counsellors.map((c) => ({ ...c, role: 'counsellor' })));
      }

      if (recipientId && recipientId !== 'ALL') {
        recipientsToNotify = recipientsToNotify.filter((r) => r.id === recipientId);
      }

      // Create in-app notification records
      let createdNotifications = [];
      if (recipientId && recipientId !== 'ALL') {
        const notif = await StorageService.create('notifications', {
          recipientId,
          recipientRole: recipientRole || 'user',
          title,
          message,
          type: 'system_alert',
          isRead: false
        });
        createdNotifications.push(notif);
      } else {
        const batchNotifs = await Promise.all(
          recipientsToNotify.map((r) =>
            StorageService.create('notifications', {
              recipientId: r.id,
              recipientRole: r.role,
              title,
              message,
              type: 'system_alert',
              isRead: false
            })
          )
        );
        createdNotifications = batchNotifs;
      }

      // Optional WhatsApp Broadcast Dispatch
      let waStatus = { sentCount: 0, attempted: false };
      if (sendWhatsApp) {
        waStatus.attempted = true;
        for (const recipient of recipientsToNotify) {
          if (recipient.phone) {
            try {
              await WhatsAppService.sendNotification(
                recipient.phone,
                `📢 ${title.toUpperCase()}\n\n${message}\n\n- BEHOLD. Team`
              );
              waStatus.sentCount++;
            } catch (waErr) {
              console.warn(`[WhatsApp Broadcast Fail] To ${recipient.phone}:`, waErr.message);
            }
          }
        }
      }
      // Optional Email Broadcast Dispatch
      let emailSentCount = 0;
      for (const recipient of recipientsToNotify) {
        if (recipient.email) {
          EmailService.sendBroadcast([recipient], title, message)
            .then(() => { emailSentCount++; })
            .catch(err => console.warn(`[Email Broadcast Fail] To ${recipient.email}:`, err.message));
        }
      }

      res.status(201).json({
        success: true,
        message: `System notification broadcasted to ${recipientsToNotify.length} recipient(s)${waStatus.attempted ? ` (${waStatus.sentCount} sent via WhatsApp)` : ''}`,
        data: createdNotifications,
        waStatus
      });
    } catch (error) {
      next(error);
    }
  },

  // Manual Trigger: Send WhatsApp Session Reminder for Appointment
  async sendAppointmentReminder(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await StorageService.findById('appointments', id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const [student, counsellor] = await Promise.all([
        StorageService.findById('users', appointment.userId),
        StorageService.findById('counsellors', appointment.counsellorId)
      ]);

      const WhatsAppService = require('../services/whatsappService');
      let waResults = { student: false, counsellor: false };

      const reminderDetails = {
        date: appointment.date,
        time: appointment.time,
        mode: appointment.mode,
        studentName: student?.name || 'Student',
        counsellorName: counsellor?.name || 'Counsellor'
      };

      if (student && student.phone) {
        try {
          await WhatsAppService.sendBookingAlert(student.phone, 'approved', reminderDetails);
          waResults.student = true;
        } catch (err) {
          console.warn('[WhatsApp Reminder Error - Student]:', err.message);
        }
      }


      // Create in-app notifications
      if (student) {
        await StorageService.create('notifications', {
          recipientId: student.id,
          recipientRole: 'user',
          title: 'Appointment Session Reminder',
          message: `Reminder for your upcoming session on ${appointment.date} at ${appointment.time} with ${counsellor?.name || 'Counsellor'}.`,
          type: 'appointment_reminder',
          isRead: false
        });
      }

      if (counsellor) {
        await StorageService.create('notifications', {
          recipientId: counsellor.id,
          recipientRole: 'counsellor',
          title: 'Appointment Session Reminder',
          message: `Reminder for your upcoming session on ${appointment.date} at ${appointment.time} with ${student?.name || 'Student'}.`,
          type: 'appointment_reminder',
          isRead: false
        });
      }

      res.status(200).json({
        success: true,
        message: 'Session reminders dispatched successfully',
        data: { waResults, appointmentId: id }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create User
  async createUser(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role,
        permissions,
        customRoleTitle,
        locationName,
        latitude,
        longitude,
        phone,
        age,
        feelingLately,
        hadPriorTherapy,
        priorTherapyDetails,
        schoolName,
        grade,
        guardianName,
        guardianPhone,
        groupCode
      } = req.body;
      if (!String(name || '').trim() || !String(password || '')) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      }
      const normalizedEmail = await ensureEmailAvailable(email);
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await StorageService.create('users', {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        age: age || '',
        feelingLately: feelingLately || '',
        hadPriorTherapy: hadPriorTherapy || '',
        priorTherapyDetails: priorTherapyDetails || '',
        schoolName: schoolName || '',
        grade: grade || '',
        guardianName: guardianName || '',
        guardianPhone: guardianPhone || '',
        groupCode: groupCode || '',
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
        age,
        feelingLately,
        hadPriorTherapy,
        priorTherapyDetails,
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
      if (name !== undefined) {
        if (!String(name).trim()) return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        updates.name = String(name).trim();
      }
      if (email !== undefined) updates.email = await ensureEmailAvailable(email, id);
      if (role !== undefined) updates.role = role;
      if (permissions !== undefined) updates.permissions = permissions;
      if (customRoleTitle !== undefined) updates.customRoleTitle = customRoleTitle;
      if (locationName !== undefined) updates.locationName = locationName;
      if (latitude !== undefined) updates.latitude = Number(latitude) || 0;
      if (longitude !== undefined) updates.longitude = Number(longitude) || 0;
      if (status !== undefined) updates.status = status;
      if (phone !== undefined) updates.phone = phone;
      if (age !== undefined) updates.age = age;
      if (feelingLately !== undefined) updates.feelingLately = feelingLately;
      if (hadPriorTherapy !== undefined) updates.hadPriorTherapy = hadPriorTherapy;
      if (priorTherapyDetails !== undefined) updates.priorTherapyDetails = priorTherapyDetails;
      if (schoolName !== undefined) updates.schoolName = schoolName;
      if (grade !== undefined) updates.grade = grade;
      if (guardianName !== undefined) updates.guardianName = guardianName;
      if (guardianPhone !== undefined) updates.guardianPhone = guardianPhone;
      if (groupCode !== undefined) updates.groupCode = groupCode;
      if (profilePic !== undefined) updates.profilePic = profilePic;
      if (profilePicPublicId !== undefined) updates.profilePicPublicId = profilePicPublicId;

      if (password) {
        if (String(password).length < 6) {
          return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
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
        halfSessionPrice,
        lang,
        bio,
        defaultMeetLink,
        phone,
        hours,
        modes,
        title,
        availability,
        isTopFive,
        commissionPercent
      } = req.body;
      if (!String(name || '').trim() || !String(password || '')) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      }
      const normalizedEmail = await ensureEmailAvailable(email);
      const normalizedModes = modes === undefined ? ['ONLINE', 'OFFLINE', 'DOOR_STEP'] : normalizeModes(modes);
      if (modes !== undefined && normalizedModes.length === 0) {
        return res.status(400).json({ success: false, message: 'Select at least one valid consultation mode' });
      }
      const normalizedPrice = price === undefined || price === '' ? 1200 : getNumber(price, 'Price', { min: 0 });
      const normalizedHalfSessionPrice = halfSessionPrice === undefined || halfSessionPrice === '' ? 499 : getNumber(halfSessionPrice, 'Half Session Price', { min: 0 });
      const normalizedHours = hours === undefined || hours === '' ? 0 : getNumber(hours, 'Experience hours', { min: 0 });
      const normalizedCommission = commissionPercent === undefined || commissionPercent === ''
        ? 50
        : getNumber(commissionPercent, 'Commission percentage', { min: 0, max: 100 });
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newCounsellor = await StorageService.create('counsellors', {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'counsellor',
        education: education || '',
        specialties: normalizeStringList(specialties),
        qualifications: education ? [education] : [],
        experience: bio || '',
        bio: bio || '',
        availability: availability || {},
        isVerified: true,
        status: 'APPROVED',
        isActive: true,
        rating: 5.0,
        reviewCount: 0,
        price: normalizedPrice,
        halfSessionPrice: normalizedHalfSessionPrice,
        lang: lang || 'English',
        defaultMeetLink: defaultMeetLink || '',
        modePreference: 'BOTH',
        hours: normalizedHours,
        modes: normalizedModes,
        title: title || 'Consultant Psychologist',
        isTopFive: isTopFive === true || isTopFive === 'true',
        commissionPercent: normalizedCommission
      });
      flushCounsellorCaches();
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
        halfSessionPrice,
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
        bankAccountNumber,
        bankIfscCode,
        bankAccountName,
        commissionPercent,
        locationName,
        latitude,
        longitude
      } = req.body;
      const updates = {};
      if (name !== undefined) {
        if (!String(name).trim()) return res.status(400).json({ success: false, message: 'Name cannot be empty' });
        updates.name = String(name).trim();
      }
      if (email !== undefined) updates.email = await ensureEmailAvailable(email, id);
      if (education !== undefined) {
        updates.education = education;
        updates.qualifications = [education];
      }
      if (specialties !== undefined) {
        updates.specialties = normalizeStringList(specialties);
      }
      if (price !== undefined) updates.price = getNumber(price, 'Price', { min: 0 });
      if (halfSessionPrice !== undefined) updates.halfSessionPrice = getNumber(halfSessionPrice, 'Half Session Price', { min: 0 });
      if (lang !== undefined) updates.lang = lang;
      if (bio !== undefined) {
        updates.experience = bio;
        updates.bio = bio;
      }
      if (defaultMeetLink !== undefined) updates.defaultMeetLink = defaultMeetLink;
      if (phone !== undefined) updates.phone = phone;
      if (hours !== undefined) updates.hours = getNumber(hours, 'Experience hours', { min: 0 });
      if (modes !== undefined) {
        updates.modes = normalizeModes(modes);
        if (updates.modes.length === 0) {
          return res.status(400).json({ success: false, message: 'Select at least one valid consultation mode' });
        }
      }
      if (title !== undefined) updates.title = title;
      if (availability !== undefined) updates.availability = availability;
      if (profilePic !== undefined) updates.profilePic = profilePic;
      if (profilePicPublicId !== undefined) updates.profilePicPublicId = profilePicPublicId;
      if (isTopFive !== undefined) updates.isTopFive = isTopFive === true || isTopFive === 'true';
      if (isActive !== undefined) updates.isActive = isActive === true || isActive === 'true';
      if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode !== undefined) updates.bankIfscCode = bankIfscCode;
      if (bankAccountName !== undefined) updates.bankAccountName = bankAccountName;
      if (commissionPercent !== undefined) {
        updates.commissionPercent = getNumber(commissionPercent, 'Commission percentage', { min: 0, max: 100 });
      }
      if (locationName !== undefined) updates.locationName = locationName;
      if (latitude !== undefined) updates.latitude = Number(latitude) || 0;
      if (longitude !== undefined) updates.longitude = Number(longitude) || 0;

      if (password) {
        if (String(password).length < 6) {
          return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
      }
      let updated = await StorageService.update('counsellors', id, updates);
      if (!updated) {
        updated = await StorageService.update('users', id, updates);
      } else if (updates.isActive !== undefined && updated.email) {
        try {
          const userRecs = await StorageService.findAll('users', { email: updated.email.toLowerCase() });
          if (Array.isArray(userRecs)) {
            for (const u of userRecs) {
              await StorageService.update('users', u.id || u._id, { isActive: updates.isActive });
            }
          }
        } catch (e) {}
      }
      if (!updated) return res.status(404).json({ success: false, message: 'Counsellor not found' });

      // Send WhatsApp Notification if status changed
      if (updates.isActive !== undefined && updated.phone) {
        const WhatsAppService = require('../services/whatsappService');
        const msg = updates.isActive
          ? `Congratulations ${updated.name}! Your counsellor profile has been Activated by the admin team.`
          : `Notice: Your counsellor profile has been Deactivated. Please contact support.`;
        WhatsAppService.sendNotification(updated.phone, msg).catch(err => console.error(err));
      }

      flushCounsellorCaches();

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
      flushCounsellorCaches();
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
      flushCounsellorCaches();
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
      flushCounsellorCaches();
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
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();

      const counsellors = await StorageService.findAll('counsellors');
      const users = await StorageService.findAll('users');
      const appointments = await StorageService.findAll('appointments');

      let cCount = 0, uCount = 0, aCount = 0;

      for (const c of counsellors) {
        if (c.isDeleted && new Date(c.deletedAt).getTime() < thirtyDaysAgo) {
          await StorageService.delete('counsellors', c.id);
          cCount++;
        }
      }

      for (const u of users) {
        if (u.isDeleted && new Date(u.deletedAt).getTime() < thirtyDaysAgo) {
          await StorageService.delete('users', u.id);
          uCount++;
        }
      }

      for (const a of appointments) {
        if (a.isDeleted && new Date(a.deletedAt).getTime() < thirtyDaysAgo) {
          await StorageService.delete('appointments', a.id);
          aCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: 'Expired trash purged successfully',
        data: { counsellorsRemoved: cCount, usersRemoved: uCount, appointmentsRemoved: aCount }
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
          refundPolicy:
            'BEHOLD Return, Cancellation & Refund Policy:\n\n1. Appointment Cancellations:\n- Clients can request session cancellation up to 24 hours prior to the scheduled session start time for a full 100% refund.\n- Cancellations made less than 24 hours before the scheduled session start time or no-shows are non-refundable.\n\n2. Refund Processing:\n- Approved refunds will be processed back to the original Razorpay payment source within 5-7 business days.\n- In case of technical issues or platform cancellations, full automatic refund will be issued.\n\n3. Rescheduling:\n- Sessions can be rescheduled up to 12 hours before start time free of charge.',
          consentPolicy:
            'BEHOLD Informed Consent & Client Agreement for Psychological Counselling & Mentorship:\n\n1. Purpose & Voluntary Participation:\n- Psychological counselling is a collaborative, goal-directed process aimed at facilitating personal growth, emotional wellbeing, and resilience.\n- Participation in all sessions is entirely voluntary. You may ask questions about therapeutic approaches, goals, or techniques at any time.\n\n2. Confidentiality & Privacy:\n- Information shared during sessions is strictly confidential and protected by professional psychological codes of ethics and data protection standards.\n- Exceptions to confidentiality: Confidentiality may be breached only where legally mandated—specifically if there is clear and imminent danger of harm to yourself or others, suspected abuse of children or vulnerable persons, or by formal order of a court of law.\n\n3. Online / Tele-Consultation Guidelines:\n- Tele-counselling sessions are conducted over secure, end-to-end encrypted video channels.\n- Please ensure you are in a private, quiet room with minimal distractions and a stable internet connection.\n- Unauthorized audio or video recording of sessions by either party without explicit written mutual consent is strictly prohibited.\n\n4. Emergency & Crisis Disclaimer:\n- Behold counselling sessions are scheduled professional consultations and are NOT an emergency suicide/crisis intervention service.\n- If you or someone you know is experiencing acute psychiatric distress or an immediate life-threatening emergency, please contact national emergency services (112), KIRAN Mental Health Helpline (1800-599-0019), or Tele-MANAS (14416) immediately.\n\n5. Cancellations & Rescheduling:\n- Cancellations requested 24 hours prior to scheduled start time receive a 100% full refund.\n- Rescheduling is available free of charge up to 12 hours before your appointment.\n\n6. Minor / Guardian Consent:\n- For clients under 18 years of age, parent/guardian acknowledgment and consent is required.',
          enablePsychology: true,
          enableCareerMentoring: true,
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
          offer6Desc: 'We guide parents to reduce academic friction and relieve student stress.',
          heroStats: [
            { num: '500+', label: 'Students Guided' },
            { num: '98%', label: 'Clarity & Peace' },
            { num: '50+', label: 'Certified Mentors' }
          ],
          aboutStats: [
            { value: '10+', label: 'Years Experience' },
            { value: '500+', label: 'Students Guided' },
            { value: '50+', label: 'Expert Mentors' },
            { value: '98%', label: 'Success Rate' }
          ]
        });
      }
      res.status(200).json({
        success: true,
        data: {
          ...settings,
          heroStats: Array.isArray(settings.heroStats) && settings.heroStats.length > 0 ? settings.heroStats : [
            { num: '500+', label: 'Students Guided' },
            { num: '98%', label: 'Clarity & Peace' },
            { num: '50+', label: 'Certified Mentors' }
          ],
          aboutStats: Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0 ? settings.aboutStats : [
            { value: '10+', label: 'Years Experience' },
            { value: '500+', label: 'Students Guided' },
            { value: '50+', label: 'Expert Mentors' },
            { value: '98%', label: 'Success Rate' }
          ],
          enablePsychology: settings.enablePsychology !== false,
          enableCareerMentoring: settings.enableCareerMentoring !== false,
          enableAptitude: settings.enableAptitude !== false,
          enableSampleTest: settings.enableSampleTest !== false,
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
      cacheHelper.clear('public_settings');
      cacheHelper.clear('counsellors_list_');
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

      const user = await StorageService.findById('users', userId);
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

      const cigiResults = Array.isArray(user.cigiResults) ? [...user.cigiResults, newResult] : [newResult];
      const updated = await StorageService.update('users', userId, { cigiResults });

      const { password, ...userData } = updated || user;

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

      const user = await StorageService.findById('users', userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

      const Cigis = user.cigiResults ? [...user.cigiResults] : [];
      const resultIndex = Cigis.findIndex((r) => r.id === resultId);
      if (resultIndex === -1) {
        return res.status(404).json({ success: false, message: 'Result record not found' });
      }

      const targetResult = { ...Cigis[resultIndex] };

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

      Cigis[resultIndex] = targetResult;

      const updated = await StorageService.update('users', userId, { cigiResults: Cigis });

      const { password, ...userData } = updated || user;

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

      const user = await StorageService.findById('users', userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Student user not found' });
      }

      const Cigis = user.cigiResults ? [...user.cigiResults] : [];
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

      const updated = await StorageService.update('users', userId, { cigiResults: Cigis });

      const { password, ...userData } = updated || user;

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

      const user = await StorageService.findById('users', userId);
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

      const updated = await StorageService.update('users', userId, {
        profilePic: uploadResult.secure_url,
        profilePicPublicId: uploadResult.public_id
      });

      const { password, ...userData } = updated || user;

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

      const counsellor = await StorageService.findById('counsellors', counsellorId);
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

      const updated = await StorageService.update('counsellors', counsellorId, {
        profilePic: uploadResult.secure_url,
        profilePicPublicId: uploadResult.public_id
      });

      flushCounsellorCaches();

      const { password, ...counsellorData } = updated || counsellor;

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
            studentName: a.clientName || (user ? user.name : 'Unknown Student'),
            counsellorName: counsellor ? counsellor.name : 'Unknown Counsellor',
            student: {
              name: a.clientName || (user ? user.name : 'Unknown Student'),
              email: a.clientEmail || (user ? user.email : ''),
              phone: a.clientPhone || (user ? user.phone : '')
            },
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
        refundStatus: 'REJECTED',
        refundProcessedAt: new Date()
      });

      res.status(200).json({ success: true, message: 'Refund request rejected successfully', data: updated });
    } catch (error) {
      next(error);
    }
  },

  async testWhatsApp(req, res, next) {
    try {
      const { phone } = req.body;
      const targetPhone = phone || '918075374600';
      const WhatsAppService = require('../services/whatsappService');
      const testResult = await WhatsAppService.sendNotification(targetPhone, '🧪 Test message from BEHOLD. WASender API integration!');
      res.status(200).json({
        success: testResult.success,
        data: testResult
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AdminController;
