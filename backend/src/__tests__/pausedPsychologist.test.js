const UserController = require('../controllers/userController');
const StorageService = require('../services/storageService');
const { validateBookingDetails } = require('../utils/bookingValidator');
const Feedback = require('../models/Feedback');

jest.mock('../services/storageService');
jest.mock('../models/Feedback');

describe('Paused / Inactive Psychologist Filtering & Booking Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserController.searchCounsellors', () => {
    test('should exclude paused (isActive: false) psychologists from public listings', async () => {
      const mockCounsellors = [
        { id: 'c1', name: 'Active Psychologist', isActive: true, status: 'APPROVED', isDeleted: false },
        { id: 'c2', name: 'Paused Psychologist', isActive: false, status: 'APPROVED', isDeleted: false },
        { id: 'c3', name: 'Rejected Psychologist', isActive: true, status: 'REJECTED', isDeleted: false },
        { id: 'c4', name: 'Deleted Psychologist', isActive: true, status: 'APPROVED', isDeleted: true }
      ];

      StorageService.findAll.mockImplementation((collection) => {
        if (collection === 'counsellors') return Promise.resolve(mockCounsellors);
        if (collection === 'users') return Promise.resolve([]);
        if (collection === 'appointments') return Promise.resolve([]);
        if (collection === 'settings') return Promise.resolve([{ enableOnline: true, enableOffline: true, enableDoorstep: true }]);
        return Promise.resolve([]);
      });

      Feedback.find = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await UserController.searchCounsellors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe('c1');
      expect(data[0].name).toBe('Active Psychologist');
    });
  });

  describe('UserController.getCounsellorDetails', () => {
    test('should return 404 if psychologist is paused (isActive: false)', async () => {
      StorageService.findById.mockResolvedValue({
        id: 'c2',
        name: 'Paused Psychologist',
        isActive: false,
        status: 'APPROVED',
        isDeleted: false
      });

      const req = { params: { id: 'c2' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await UserController.getCounsellorDetails(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });

  describe('validateBookingDetails', () => {
    test('should reject booking when psychologist is paused (isActive: false)', async () => {
      StorageService.findById.mockResolvedValue({
        id: 'c2',
        name: 'Paused Psychologist',
        isActive: false,
        status: 'APPROVED',
        modes: ['ONLINE']
      });

      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString().split('T')[0];
      const result = await validateBookingDetails('c2', dateStr, '10:00 AM', 'ONLINE', 'counselling');

      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/paused|unavailable/i);
    });
  });
});
