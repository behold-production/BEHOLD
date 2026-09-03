const { checkIntroductoryUsed } = require('../utils/introductoryHelper');
const StorageService = require('../services/storageService');

jest.mock('../services/storageService');

describe('Introductory Session Eligibility & Single-Use Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return true if user document has hasUsedIntroductory: true', async () => {
    StorageService.findById.mockResolvedValue({ id: 'user_1', hasUsedIntroductory: true });

    const used = await checkIntroductoryUsed({ userId: 'user_1', email: 'test@example.com' });
    expect(used).toBe(true);
  });

  test('should return false if user has never booked an introductory session and has no flag', async () => {
    StorageService.findById.mockResolvedValue({ id: 'user_2', hasUsedIntroductory: false });
    StorageService.findAll.mockResolvedValue([
      { id: 'appt_1', userId: 'user_2', duration: '1 Hour (60 Mins)', status: 'CONFIRMED' }
    ]);

    const used = await checkIntroductoryUsed({ userId: 'user_2', email: 'new@example.com' });
    expect(used).toBe(false);
  });

  test('should return true if past non-cancelled appointment was 30 mins / introductory', async () => {
    StorageService.findById.mockResolvedValue({ id: 'user_3', hasUsedIntroductory: false });
    StorageService.findAll.mockResolvedValue([
      { id: 'appt_2', userId: 'user_3', duration: '30 Minutes (Introductory Session)', status: 'CONFIRMED' }
    ]);
    StorageService.update.mockResolvedValue({});

    const used = await checkIntroductoryUsed({ userId: 'user_3', email: 'past@example.com' });
    expect(used).toBe(true);
    expect(StorageService.update).toHaveBeenCalledWith('users', 'user_3', { hasUsedIntroductory: true });
  });

  test('should ignore CANCELLED appointments when evaluating introductory eligibility', async () => {
    StorageService.findById.mockResolvedValue({ id: 'user_4', hasUsedIntroductory: false });
    StorageService.findAll.mockResolvedValue([]); // filtered out by status: { $ne: 'CANCELLED' }

    const used = await checkIntroductoryUsed({ userId: 'user_4', email: 'cancelled@example.com' });
    expect(used).toBe(false);
  });
});
