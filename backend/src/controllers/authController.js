const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StorageService = require('../services/storageService');
const WhatsAppService = require('../services/whatsappService');
const EmailService = require('../services/emailService');
const PasswordResetOtp = require('../models/PasswordResetOtp');

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

function buildEmailQuery(email) {
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { email: { $regex: new RegExp(`^${escaped}$`, 'i') } };
}

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz', {
    expiresIn: ACCESS_EXPIRY
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'behold_jwt_refresh_secret_key_2026_abc', {
    expiresIn: REFRESH_EXPIRY
  });
  return { accessToken, refreshToken };
};

// Helper to find any user across all tables by email
async function findAnyUserByEmail(email, portal = 'any') {
  if (!email) return null;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

  // Ensure default admin exists if DB is empty
  try {
    await StorageService.seedDefaultAdmin();
  } catch (e) {}

  const emailQuery = buildEmailQuery(normalizedEmail);
  const userQuery = { ...emailQuery, status: { $ne: 'DELETED' } };

  if (portal === 'user') {
    const student = await StorageService.findOne('users', userQuery);
    if (student) return { user: student, table: 'users' };

    const counsellor = await StorageService.findOne('counsellors', userQuery);
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const admin = await StorageService.findOne('admins', emailQuery);
    if (admin) return { user: admin, table: 'admins' };

    return null;
  }

  if (portal === 'counsellor') {
    const counsellor = await StorageService.findOne('counsellors', userQuery);
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const admin = await StorageService.findOne('admins', emailQuery);
    if (admin) return { user: admin, table: 'admins' };

    const student = await StorageService.findOne('users', userQuery);
    if (student) return { user: student, table: 'users' };

    return null;
  }

  if (portal === 'admin') {
    const admin = await StorageService.findOne('admins', emailQuery);
    if (admin) return { user: admin, table: 'admins' };

    const counsellor = await StorageService.findOne('counsellors', userQuery);
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const student = await StorageService.findOne('users', userQuery);
    if (student) return { user: student, table: 'users' };

    return null;
  }

  const admin = await StorageService.findOne('admins', emailQuery);
  if (admin) return { user: admin, table: 'admins' };

  const counsellor = await StorageService.findOne('counsellors', userQuery);
  if (counsellor) return { user: counsellor, table: 'counsellors' };

  const student = await StorageService.findOne('users', userQuery);
  if (student) return { user: student, table: 'users' };

  return null;
}

// Helper to find any user across all tables by phone
async function findAnyUserByPhone(phone, portal = 'any') {
  // Normalize phone (strip non-digits, etc if needed, or just exact match)
  const phoneClean = phone.replace(/\D/g, '');

  // Helper inner function
  const checkMatch = (userPhone) => {
    if (!userPhone) return false;
    const uPhone = userPhone.replace(/\D/g, '');
    // Match last 10 digits to handle country code differences
    if (uPhone.length >= 10 && phoneClean.length >= 10) {
      return uPhone.slice(-10) === phoneClean.slice(-10);
    }
    return uPhone === phoneClean;
  };

  const records = [];

  const tryFind = async (table) => {
    const items = await StorageService.findAll(table, table === 'admins' ? {} : { status: { $ne: 'DELETED' } });
    return items.find((item) => checkMatch(item.phone));
  };

  if (portal === 'user') {
    const student = await tryFind('users');
    if (student) return { user: student, table: 'users' };

    const counsellor = await tryFind('counsellors');
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const admin = await tryFind('admins');
    if (admin) return { user: admin, table: 'admins' };

    return null;
  }

  if (portal === 'counsellor') {
    const counsellor = await tryFind('counsellors');
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const admin = await tryFind('admins');
    if (admin) return { user: admin, table: 'admins' };

    const student = await tryFind('users');
    if (student) return { user: student, table: 'users' };

    return null;
  }

  if (portal === 'admin') {
    const admin = await tryFind('admins');
    if (admin) return { user: admin, table: 'admins' };

    const counsellor = await tryFind('counsellors');
    if (counsellor) return { user: counsellor, table: 'counsellors' };

    const student = await tryFind('users');
    if (student) return { user: student, table: 'users' };

    return null;
  }

  const admin = await tryFind('admins');
  if (admin) return { user: admin, table: 'admins' };

  const counsellor = await tryFind('counsellors');
  if (counsellor) return { user: counsellor, table: 'counsellors' };

  const student = await tryFind('users');
  if (student) return { user: student, table: 'users' };

  return null;
}

const AuthController = {
  // Register Student/User
  async registerUser(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

      if (!name || !normalizedEmail || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      // Check if email already exists
      const existing = await findAnyUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await StorageService.create('users', {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'user',
        schoolName: '',
        grade: '',
        guardianName: '',
        guardianPhone: '',
        groupCode: ''
      });

      const { password: _, ...userData } = newUser;
      const tokens = generateTokens(newUser);

      if (newUser.phone) {
        WhatsAppService.sendNotification(newUser.phone, `Welcome to Behold Aspire, ${newUser.name}! Your account has been created successfully.`).catch(err => console.error(err));
      }
      // Send welcome email
      EmailService.sendWelcomeUser(newUser).catch(err => console.error('[Email Welcome Error]:', err));

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: userData, ...tokens }
      });
    } catch (error) {
      next(error);
    }
  },

  // Register Counsellor
  async registerCounsellor(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        phone,
        specialties,
        education,
        price,
        halfSessionPrice,
        lang,
        bio,
        defaultMeetLink,
        hours,
        modes,
        title,
        availability,
        locationName,
        latitude,
        longitude
      } = req.body;
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

      if (!name || !normalizedEmail || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      // Check if email already exists
      const existing = await findAnyUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newCounsellor = await StorageService.create('counsellors', {
        name,
        email: normalizedEmail,
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
        isVerified: false,
        isActive: true,
        rating: 5.0,
        reviewCount: 0,
        price: Number(price) || 1200,
        halfSessionPrice: Number(halfSessionPrice) || 499,
        lang: lang || 'English, Malayalam',
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
        locationName: locationName || '',
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0
      });

      const { password: _, ...counsellorData } = newCounsellor;
      const tokens = generateTokens(newCounsellor);

      if (newCounsellor.phone) {
        WhatsAppService.sendNotification(newCounsellor.phone, `Welcome to Behold Aspire, ${newCounsellor.name}! Your application is under review by our admin team.`).catch(err => console.error(err));
      }
      // Send welcome email to counsellor
      EmailService.sendWelcomeCounsellor(newCounsellor).catch(err => console.error('[Email Welcome Counsellor Error]:', err));

      res.status(201).json({
        success: true,
        message: 'Counsellor application submitted successfully. Pending verification.',
        data: { counsellor: counsellorData, ...tokens }
      });
    } catch (error) {
      next(error);
    }
  },

  // Universal Login (Admin, Counsellor, User)
  async login(req, res, next) {
    try {
      const { email, password, portal = 'user' } = req.body;
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

      if (!normalizedEmail || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const match = await findAnyUserByEmail(normalizedEmail, portal);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { user, table } = match;
      const roleUpper = (user.role || '').toUpperCase();

      // Enforce strict portal & role separation
      if (portal === 'user') {
        if (table === 'counsellors' || roleUpper === 'PSYCHOLOGIST' || roleUpper === 'COUNSELLOR') {
          return res.status(403).json({
            success: false,
            message: 'This email belongs to a Psychologist account. Please sign in at behold.co.in/counsellor'
          });
        }
        if (table === 'admins' || roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'SUB_ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'This email belongs to an Admin account. Please sign in at behold.co.in/admin'
          });
        }
      } else if (portal === 'counsellor') {
        if (table !== 'counsellors' && roleUpper !== 'PSYCHOLOGIST' && roleUpper !== 'COUNSELLOR') {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: This portal is exclusively for Psychologists/Counsellors.'
          });
        }
      } else if (portal === 'admin') {
        if (table !== 'admins' && roleUpper !== 'ADMIN' && roleUpper !== 'SUPER_ADMIN' && roleUpper !== 'SUB_ADMIN') {
          return res.status(403).json({
            success: false,
            message: 'Access Denied: This portal is exclusively for System Administrators.'
          });
        }
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { password: _, ...userData } = user;
      const tokens = generateTokens(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user: userData, ...tokens }
      });
    } catch (error) {
      next(error);
    }
  },

  // Refresh Token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }

      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || 'behold_jwt_refresh_secret_key_2026_abc'
        );

        // Find user
        let userRecord = null;
        if (decoded.role === 'admin') userRecord = await StorageService.findById('admins', decoded.id);
        else if (decoded.role === 'counsellor') userRecord = await StorageService.findById('counsellors', decoded.id);
        else userRecord = await StorageService.findById('users', decoded.id);

        if (!userRecord) {
          return res.status(401).json({ success: false, message: 'User not found' });
        }

        const tokens = generateTokens(userRecord);
        res.status(200).json({
          success: true,
          message: 'Tokens refreshed successfully',
          data: tokens
        });
      } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }
    } catch (error) {
      next(error);
    }
  },

  // Forgot Password — sends 6-digit OTP to user's registered Email (and WhatsApp if linked)
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const match = await findAnyUserByEmail(cleanEmail);
      if (!match) {
        // Security: don't reveal if email exists or not
        return res.status(200).json({
          success: true,
          message: 'If this email is registered, a 6-digit reset code has been sent to your email address.'
        });
      }

      const { user } = match;

      // Invalidate any previous unused OTPs for this email
      await PasswordResetOtp.updateMany(
        { email: cleanEmail, used: false },
        { used: true }
      );

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await PasswordResetOtp.create({
        email: cleanEmail,
        otpCode,
        expiresAt,
        used: false
      });

      // Log for dev convenience
      console.log(`\n======================================`);
      console.log(`🔑 PASSWORD RESET OTP: ${otpCode}`);
      console.log(`📧 FOR EMAIL: ${cleanEmail}`);
      console.log(`======================================\n`);

      // Send OTP via email (Primary)
      const emailResult = await EmailService.sendPasswordResetOTP(cleanEmail, user.name || 'User', otpCode);
      if (emailResult && emailResult.fallback) {
        console.warn(`[Password Reset]: SMTP delivery fallback triggered (${emailResult.error}). OTP code ${otpCode} saved for email ${cleanEmail}.`);
      }

      // Also send via WhatsApp if registered phone exists
      if (user.phone && user.phone.trim() !== '') {
        const message = `*BEHOLD Aspire — Password Reset*\n\nYour password reset code is:\n\n*${otpCode}*\n\nThis code is valid for 10 minutes. Do not share it with anyone.`;
        WhatsAppService.sendNotification(user.phone, message).catch(err => {
          console.error('[WhatsApp Reset OTP Error]:', err.message);
        });
      }

      const maskedPhone = (user.phone && user.phone.trim()) ? user.phone.replace(/.(?=.{4})/g, '•') : '';

      res.status(200).json({
        success: true,
        message: 'A 6-digit reset code has been sent to your email address.',
        data: {
          maskedPhone,
          ...(emailResult?.previewUrl ? { previewUrl: emailResult.previewUrl } : {}),
          ...(emailResult?.fallback ? { devOtp: otpCode } : {})
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset Password — verify OTP + new password together
  async resetPassword(req, res, next) {
    try {
      const { email, otpCode, newPassword } = req.body;

      if (!email || !otpCode || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }

      // Find valid OTP
      const otpRecord = await PasswordResetOtp.findOne({
        email: email.toLowerCase().trim(),
        otpCode: otpCode.trim(),
        used: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset code. Please request a new one.' });
      }

      // Mark OTP as used
      otpRecord.used = true;
      await otpRecord.save();

      // Find user and update password
      const match = await findAnyUserByEmail(email);
      if (!match) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { user, table } = match;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await StorageService.update(table, user.id, { password: hashedPassword });

      // Notify user on WhatsApp
      if (user.phone) {
        WhatsAppService.sendNotification(
          user.phone,
          `*BEHOLD Aspire*\n\nYour password has been successfully reset. If you did not do this, please contact our support team immediately.`
        ).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now sign in.'
      });
    } catch (error) {
      next(error);
    }
  },

  // Change Password (Authenticated users)
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { id, role } = req.user;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
      }

      let table = 'users';
      if (role === 'admin') table = 'admins';
      else if (role === 'counsellor') table = 'counsellors';

      const user = await StorageService.findById(table, id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await StorageService.update(table, id, { password: hashedPassword });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // --- WhatsApp OTP Flow ---

  // Send WhatsApp OTP
  async sendOtp(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
      }

      // Normalize phone: strip non-digits, prepend 91 for 10-digit Indian numbers
      const phoneClean = String(phone).replace(/\D/g, '');
      const normalizedPhone = phoneClean.length === 10 ? '91' + phoneClean : phoneClean;

      if (normalizedPhone.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number provided' });
      }

      // Invalidate any previous unused OTPs for this phone number before creating a new one
      const existingOtps = await StorageService.findAll('otps', { phone: normalizedPhone });
      const unusedOtps = existingOtps.filter((o) => !o.used);
      for (const otp of unusedOtps) {
        await StorageService.update('otps', otp.id || otp._id, { used: true });
      }

      // Generate 6 digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

      // Store in otps collection using the normalized phone number
      await StorageService.create('otps', {
        phone: normalizedPhone,
        otpCode,
        expiresAt,
        used: false
      });

      // Securely log the OTP for development / testing
      console.log(`\n======================================`);
      console.log(`WHATSAPP OTP CODE GENERATED: ${otpCode}`);
      console.log(`TO: ${normalizedPhone}`);
      console.log(`======================================\n`);

      // Send via WhatsApp (use original phone so WaSender formats correctly)
      const waResponse = await WhatsAppService.sendOTP(phone, otpCode);

      if (!waResponse.success && !waResponse.mock) {
        console.warn(`[WhatsApp OTP Warning]: WASender API failed for ${phone}:`, waResponse.error);
        console.log(`[Fallback OTP]: Code generated for ${phone} is ${otpCode}`);
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully via WhatsApp',
        ...(process.env.NODE_ENV !== 'production' || !process.env.WASENDER_TOKEN ? { devOtp: otpCode } : {})
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify WhatsApp OTP
  async verifyOtp(req, res, next) {
    try {
      const { phone, otpCode, isLogin, portal = 'user' } = req.body;

      if (!phone || !otpCode) {
        return res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
      }

      // Normalize phone to match how it was stored during sendOtp
      const phoneClean = String(phone).replace(/\D/g, '');
      const normalizedPhone = phoneClean.length === 10 ? '91' + phoneClean : phoneClean;

      // Find OTP records using normalized phone
      const otps = await StorageService.findAll('otps', { phone: normalizedPhone });
      // Get the latest unused, non-expired OTP
      const validOtps = otps.filter((o) => !o.used && new Date(o.expiresAt) > new Date());
      const latestOtp = validOtps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (!latestOtp || latestOtp.otpCode !== otpCode) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Mark as used
      await StorageService.update('otps', latestOtp.id, { used: true });

      // If this is an OTP login flow, find the user and log them in
      if (isLogin) {
        let match = await findAnyUserByPhone(phone, portal);
        if (!match && portal === 'user') {
          // Auto-register the user if they are using WhatsApp login for the first time
          const tempEmail = `whatsapp_${normalizedPhone}@temp.behold.co.in`;
          
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

          const newUser = await StorageService.create('users', {
            name: 'New User',
            email: tempEmail,
            password: hashedPassword,
            phone: normalizedPhone,
            role: 'user',
            schoolName: '',
            grade: '',
            guardianName: '',
            guardianPhone: '',
            groupCode: ''
          });
          
          match = { user: newUser, table: 'users' };
        } else if (!match) {
          return res.status(404).json({ 
            success: false, 
            message: 'No account found with this phone number. Please register.' 
          });
        }

        const { user, table } = match;
        const roleUpper = (user.role || '').toUpperCase();

        // Enforce strict portal & role separation
        if (portal === 'user') {
          if (table === 'counsellors' || roleUpper === 'PSYCHOLOGIST' || roleUpper === 'COUNSELLOR') {
            return res.status(403).json({
              success: false,
              message: 'This phone number belongs to a Psychologist account. Please sign in at behold.co.in/counsellor'
            });
          }
          if (table === 'admins' || roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'SUB_ADMIN') {
            return res.status(403).json({
              success: false,
              message: 'This phone number belongs to an Admin account. Please sign in at behold.co.in/admin'
            });
          }
        } else if (portal === 'counsellor') {
          if (table !== 'counsellors' && roleUpper !== 'PSYCHOLOGIST' && roleUpper !== 'COUNSELLOR') {
            return res.status(403).json({
              success: false,
              message: 'Access Denied: This portal is exclusively for Psychologists/Counsellors.'
            });
          }
        } else if (portal === 'admin') {
          if (table !== 'admins' && roleUpper !== 'ADMIN' && roleUpper !== 'SUPER_ADMIN' && roleUpper !== 'SUB_ADMIN') {
            return res.status(403).json({
              success: false,
              message: 'Access Denied: This portal is exclusively for System Administrators.'
            });
          }
        }

        const { password: _, ...userData } = user;
        const tokens = generateTokens(user);

        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully. Logged in.',
          data: { user: userData, ...tokens }
        });
      }

      // If it's just verification (e.g. during registration)
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });

    } catch (error) {
      next(error);
    }
  },

  // Logout (noop in jwt stateless auth but standard response endpoint)
  async logout(req, res, next) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

module.exports = AuthController;
