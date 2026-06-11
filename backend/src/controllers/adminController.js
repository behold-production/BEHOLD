const StorageService = require('../services/storageService');

const AdminController = {
  // Admin Dashboard Statistics
  async getDashboard(req, res, next) {
    try {
      const users = await StorageService.findAll('users');
      const counsellors = await StorageService.findAll('counsellors');
      const appointments = await StorageService.findAll('appointments');
      const sessions = await StorageService.findAll('sessions');

      const pendingRequests = counsellors.filter(c => !c.isVerified).length;

      // Calculate mock monthly statistics
      const monthlyStats = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
      
      appointments.forEach(a => {
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
      const users = await StorageService.findAll('users');
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
      const counsellors = await StorageService.findAll('counsellors');
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

      const updated = await StorageService.update('counsellors', id, { isVerified });
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

  // Get All Appointments
  async getAppointments(req, res, next) {
    try {
      const appointments = await StorageService.findAll('appointments');
      
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
      const { name, email, password, role, permissions, customRoleTitle } = req.body;
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
      const { name, email, password, role, permissions, customRoleTitle, status } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email.toLowerCase();
      if (role !== undefined) updates.role = role;
      if (permissions !== undefined) updates.permissions = permissions;
      if (customRoleTitle !== undefined) updates.customRoleTitle = customRoleTitle;
      if (status !== undefined) updates.status = status;
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

  // Delete User
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('users', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  // Create Counsellor
  async createCounsellor(req, res, next) {
    try {
      const { name, email, password, education, specialties, price, lang, bio, defaultMeetLink } = req.body;
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newCounsellor = await StorageService.create('counsellors', {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: '',
        role: 'counsellor',
        education: education || '',
        specialties: specialties ? specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
        qualifications: education ? [education] : [],
        experience: bio || '',
        availability: {},
        isVerified: true,
        isActive: true,
        rating: 5.0,
        reviewCount: 0,
        price: Number(price) || 1200,
        lang: lang || 'English',
        defaultMeetLink: defaultMeetLink || '',
        modePreference: 'BOTH'
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
      const { name, email, password, education, specialties, price, lang, bio, defaultMeetLink } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (email !== undefined) updates.email = email.toLowerCase();
      if (education !== undefined) {
        updates.education = education;
        updates.qualifications = [education];
      }
      if (specialties !== undefined) {
        updates.specialties = typeof specialties === 'string' 
          ? specialties.split(',').map(s => s.trim()).filter(Boolean) 
          : specialties;
      }
      if (price !== undefined) updates.price = Number(price);
      if (lang !== undefined) updates.lang = lang;
      if (bio !== undefined) updates.experience = bio;
      if (defaultMeetLink !== undefined) updates.defaultMeetLink = defaultMeetLink;
      
      if (password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(password, salt);
      }
      const updated = await StorageService.update('counsellors', id, updates);
      if (!updated) return res.status(404).json({ success: false, message: 'Counsellor not found' });
      const { password: _, ...counsellorData } = updated;
      res.status(200).json({ success: true, message: 'Counsellor updated successfully', data: counsellorData });
    } catch (error) {
      next(error);
    }
  },

  // Delete Counsellor
  async deleteCounsellor(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await StorageService.delete('counsellors', id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Counsellor not found' });
      res.status(200).json({ success: true, message: 'Counsellor deleted successfully' });
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
          heroSub: 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
          whatsapp: 'https://wa.me/919497174011',
          contactEmail: 'support@behold.com',
          siteName: 'BEHOLD',
          siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
          showBanner: false,
          bannerNotice: '🚨 Maintenance Notice: Schedulers undergoing maintenance tonight between 12:00 AM - 02:00 AM IST.',
          termsOfUse: 'Welcome to BEHOLD. By accessing or using our platform, you agree to comply with and be bound by the terms and conditions.',
          privacyPolicy: 'Your privacy is extremely important to us. This policy describes how we collect, protect, and use your personal information.'
        });
      }
      res.status(200).json({ success: true, data: settings });
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
      const { name, permissions } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });
      const newRole = await StorageService.create('roles', { name, permissions: permissions || [] });
      res.status(201).json({ success: true, message: 'Role created successfully', data: newRole });
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
      const { userId, advisorId, service, mode, date, time, status, meetLink } = req.body;
      if (!userId || !advisorId || !date || !time) {
        return res.status(400).json({ success: false, message: 'UserId, advisorId, date, and time are required' });
      }

      const newAppointment = await StorageService.create('appointments', {
        userId,
        counsellorId: advisorId,
        service: service || 'counselling',
        mode: mode || 'ONLINE',
        date,
        time,
        status: status === 'CONFIRMED' ? 'APPROVED' : (status || 'PENDING'),
        meetLink: meetLink || ''
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
      const { userId, advisorId, service, mode, date, time, status, meetLink } = req.body;
      
      const updates = {};
      if (userId !== undefined) updates.userId = userId;
      if (advisorId !== undefined) updates.counsellorId = advisorId;
      if (service !== undefined) updates.service = service;
      if (mode !== undefined) updates.mode = mode;
      if (date !== undefined) updates.date = date;
      if (time !== undefined) updates.time = time;
      if (status !== undefined) {
        updates.status = status === 'CONFIRMED' ? 'APPROVED' : status;
      }
      if (meetLink !== undefined) updates.meetLink = meetLink;

      const updated = await StorageService.update('appointments', id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
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
      const deleted = await StorageService.delete('appointments', id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = AdminController;
