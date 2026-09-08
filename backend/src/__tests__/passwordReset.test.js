const AuthController = require('../controllers/authController');
const StorageService = require('../services/storageService');
const PasswordResetOtp = require('../models/PasswordResetOtp');
const EmailService = require('../services/emailService');
const bcrypt = require('bcryptjs');

jest.mock('../services/storageService');
jest.mock('../models/PasswordResetOtp');
jest.mock('../services/emailService');
jest.mock('bcryptjs');

describe('Auth — Forgot Password, OTP Verification & Password Reset Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should return 400 if neither email nor phone is provided', async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.forgotPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should return 404 for counselor portal if counselor account not found', async () => {
      StorageService.findOne.mockResolvedValue(null);
      const req = { body: { email: 'unknown@example.com', portal: 'counsellor' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.forgotPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('No registered Psychologist account found')
      }));
    });

    it('should send email OTP when counselor account exists', async () => {
      const mockCounsellor = { id: 'c123', name: 'Dr. Sarah', email: 'sarah@example.com', role: 'counsellor' };
      StorageService.findOne.mockResolvedValue(mockCounsellor);
      PasswordResetOtp.updateMany.mockResolvedValue({});
      PasswordResetOtp.create.mockResolvedValue({ otpCode: '123456' });
      EmailService.sendPasswordResetOTP.mockResolvedValue({ success: true, messageId: 'msg_1' });

      const req = { body: { email: 'sarah@example.com', portal: 'counsellor' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.forgotPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('6-digit verification code has been sent')
      }));
      expect(EmailService.sendPasswordResetOTP).toHaveBeenCalledWith(
        'sarah@example.com',
        'Dr. Sarah',
        expect.any(String)
      );
    });
  });

  describe('verifyResetOtp', () => {
    it('should return 400 if email or otpCode is missing', async () => {
      const req = { body: { email: 'sarah@example.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.verifyResetOtp(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if OTP is invalid or expired', async () => {
      PasswordResetOtp.findOne.mockResolvedValue(null);
      const req = { body: { email: 'sarah@example.com', otpCode: '000000' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.verifyResetOtp(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Invalid or expired verification code')
      }));
    });

    it('should return 200 if OTP is valid', async () => {
      PasswordResetOtp.findOne.mockResolvedValue({ email: 'sarah@example.com', otpCode: '123456', used: false });
      const req = { body: { email: 'sarah@example.com', otpCode: '123456' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.verifyResetOtp(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('verified successfully')
      }));
    });
  });

  describe('resetPassword', () => {
    it('should reject passwords shorter than 6 characters', async () => {
      const req = { body: { email: 'sarah@example.com', otpCode: '123456', newPassword: '123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.resetPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('at least 6 characters')
      }));
    });

    it('should hash new password, update storage, and mark OTP as used', async () => {
      const mockOtpRecord = { email: 'sarah@example.com', otpCode: '123456', used: false, save: jest.fn().mockResolvedValue(true) };
      PasswordResetOtp.findOne.mockResolvedValue(mockOtpRecord);

      const mockCounsellor = { id: 'c123', name: 'Dr. Sarah', email: 'sarah@example.com', role: 'counsellor' };
      StorageService.findOne.mockImplementation((table) => {
        if (table === 'counsellors') return Promise.resolve(mockCounsellor);
        return Promise.resolve(null);
      });
      bcrypt.genSalt.mockResolvedValue('salt10');
      bcrypt.hash.mockResolvedValue('hashed_new_password');
      StorageService.update.mockResolvedValue({ ...mockCounsellor, password: 'hashed_new_password' });

      const req = { body: { email: 'sarah@example.com', otpCode: '123456', newPassword: 'NewSecurePassword@123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await AuthController.resetPassword(req, res, next);
      expect(mockOtpRecord.used).toBe(true);
      expect(mockOtpRecord.save).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('NewSecurePassword@123', 'salt10');
      expect(StorageService.update).toHaveBeenCalledWith('counsellors', 'c123', { password: 'hashed_new_password' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('Password has been reset successfully')
      }));
    });
  });
});
