const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StorageService = require('../services/storageService');
const WhatsAppService = require('../services/whatsappService');

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

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
async function findAnyUserByEmail(email) {
  const emailLower = email.toLowerCase();

  const admin = await StorageService.findOne('admins', { email: emailLower });
  if (admin) return { user: admin, table: 'admins' };

  const counsellor = await StorageService.findOne('counsellors', { email: emailLower, status: { $ne: 'DELETED' } });
  if (counsellor) return { user: counsellor, table: 'counsellors' };

  const student = await StorageService.findOne('users', { email: emailLower, status: { $ne: 'DELETED' } });
  if (student) return { user: student, table: 'users' };

  return null;
}

// Helper to find any user across all tables by phone
async function findAnyUserByPhone(phone) {
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

  const admin = (await StorageService.findAll('admins', {})).find(a => checkMatch(a.phone));
  if (admin) return { user: admin, table: 'admins' };

  const counsellor = (await StorageService.findAll('counsellors', { status: { $ne: 'DELETED' } })).find(c => checkMatch(c.phone));
  if (counsellor) return { user: counsellor, table: 'counsellors' };

  const student = (await StorageService.findAll('users', { status: { $ne: 'DELETED' } })).find(s => checkMatch(s.phone));
  if (student) return { user: student, table: 'users' };

  return null;
}

const AuthController = {
  // Register Student/User
  async registerUser(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      // Check if email already exists
      const existing = await findAnyUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await StorageService.create('users', {
        name,
        email: email.toLowerCase(),
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

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      // Check if email already exists
      const existing = await findAnyUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use' });
      }

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
        isVerified: false,
        isActive: true,
        rating: 5.0,
        reviewCount: 0,
        price: Number(price) || 1200,
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
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const match = await findAnyUserByEmail(email);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { user, table } = match;

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

  // Forgot Password (Mock returning reset token)
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const match = await findAnyUserByEmail(email);
      if (!match) {
        return res.status(404).json({ success: false, message: 'User with this email does not exist' });
      }

      const resetToken = jwt.sign(
        { id: match.user.id, email: match.user.email },
        process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz',
        { expiresIn: '10m' }
      );

      // Return mock reset instructions and token for development convenience
      res.status(200).json({
        success: true,
        message: 'Password reset link generated. Reset using the provided token.',
        data: { resetToken }
      });
    } catch (error) {
      next(error);
    }
  },

  // Reset Password using token
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Reset token and new password are required' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'behold_jwt_secret_key_2026_xyz');
        const match = await findAnyUserByEmail(decoded.email);
        if (!match) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { user, table } = match;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await StorageService.update(table, user.id, { password: hashedPassword });

        res.status(200).json({
          success: true,
          message: 'Password has been reset successfully'
        });
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }
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

      // Generate 6 digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

      // Store in otps collection
      await StorageService.create('otps', {
        phone,
        otpCode,
        expiresAt,
        used: false
      });

      // Securely log the OTP for development / testing
      console.log(`\n======================================`);
      console.log(`🔐 WHATSAPP OTP CODE GENERATED: ${otpCode}`);
      console.log(`📱 TO: ${phone}`);
      console.log(`======================================\n`);

      // Send via WhatsApp
      const waResponse = await WhatsAppService.sendOTP(phone, otpCode);

      if (!waResponse.success && !waResponse.mock) {
        console.error('WhatsApp sending failed:', waResponse.error);
        
        let metaErrorDetails = 'Unknown Meta API error';
        if (waResponse.error && waResponse.error.error && waResponse.error.error.message) {
          metaErrorDetails = waResponse.error.error.message;
        } else if (typeof waResponse.error === 'string') {
          metaErrorDetails = waResponse.error;
        }

        return res.status(500).json({ 
          success: false, 
          message: `WhatsApp API Error: ${metaErrorDetails}. Ensure your Meta Template 'otp_verification' exists and is approved, and your token is valid.` 
        });
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully via WhatsApp'
      });
    } catch (error) {
      next(error);
    }
  },

  // Verify WhatsApp OTP
  async verifyOtp(req, res, next) {
    try {
      const { phone, otpCode, isLogin } = req.body;
      
      if (!phone || !otpCode) {
        return res.status(400).json({ success: false, message: 'Phone and OTP code are required' });
      }

      // Find OTP record
      const otps = await StorageService.findAll('otps', { phone });
      // Get the latest unused OTP
      const validOtps = otps.filter(o => !o.used && new Date(o.expiresAt) > new Date());
      const latestOtp = validOtps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (!latestOtp || latestOtp.otpCode !== otpCode) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Mark as used
      await StorageService.update('otps', latestOtp.id, { used: true });

      // If this is an OTP login flow, find the user and log them in
      if (isLogin) {
        const match = await findAnyUserByPhone(phone);
        if (!match) {
          return res.status(404).json({ 
            success: false, 
            message: 'No account found with this phone number. Please register.' 
          });
        }

        const { user } = match;
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
