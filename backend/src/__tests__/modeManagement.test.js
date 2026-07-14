const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const StorageService = require('../services/storageService');
const { validateBookingDetails } = require('../utils/bookingValidator');

describe('Mode Management & Counsellor States Validation', () => {
  let testCounsellorId;
  let originalSettings;

  beforeAll(async () => {
    // Connect to database
    await connectDB();

    // Backup original settings
    const settingsList = await StorageService.findAll('settings');
    if (settingsList.length > 0) {
      originalSettings = settingsList[0];
    }

    // Create a test counsellor
    const counsellor = await StorageService.create('counsellors', {
      id: 'test_counsellor_' + Date.now(),
      name: 'Test Psychologist',
      email: 'test_counsellor_' + Date.now() + '@behold.com',
      password: 'password123',
      isActive: true,
      modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
      specialties: ['Anxiety', 'Depression'],
      price: 1500,
      availability: {
        activeDays: { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true },
        availableSlots: ['10:00 AM']
      }
    });
    testCounsellorId = counsellor.id;
  });

  afterAll(async () => {
    // Delete test counsellor
    if (testCounsellorId) {
      const Counsellor = mongoose.model('Counsellor');
      await Counsellor.deleteOne({ id: testCounsellorId });
    }

    // Restore original settings
    if (originalSettings) {
      const Setting = mongoose.model('Setting');
      await Setting.deleteOne({});
      const restored = new Setting(originalSettings);
      await restored.save();
    }

    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Reset global settings to all enabled before each test
    const Setting = mongoose.model('Setting');
    await Setting.deleteOne({});
    const newSettings = new Setting({
      id: 'settings_global',
      enableOnline: true,
      enableOffline: true,
      enableDoorstep: true
    });
    await newSettings.save();

    // Ensure the counsellor is active
    const Counsellor = mongoose.model('Counsellor');
    await Counsellor.updateOne({ id: testCounsellorId }, { $set: { isActive: true } });
  });

  it('should allow booking when everything is active and enabled', async () => {
    // Use a date 2 days in the future to avoid lead time / past date issues
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '10:00 AM';

    const result = await validateBookingDetails(testCounsellorId, dateStr, timeStr, 'ONLINE', 'counselling');
    expect(result.valid).toBe(true);
  });

  it('should reject booking when counsellor is deactivated', async () => {
    const Counsellor = mongoose.model('Counsellor');
    await Counsellor.updateOne({ id: testCounsellorId }, { $set: { isActive: false } });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '10:00 AM';

    const result = await validateBookingDetails(testCounsellorId, dateStr, timeStr, 'ONLINE', 'counselling');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('suspended or unavailable');
  });

  it('should reject booking when ONLINE mode is globally disabled', async () => {
    const Setting = mongoose.model('Setting');
    await Setting.updateOne({}, { $set: { enableOnline: false } });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '10:00 AM';

    const result = await validateBookingDetails(testCounsellorId, dateStr, timeStr, 'ONLINE', 'counselling');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Online video consultation sessions are temporarily disabled');
  });

  it('should reject booking when OFFLINE mode is globally disabled', async () => {
    const Setting = mongoose.model('Setting');
    await Setting.updateOne({}, { $set: { enableOffline: false } });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '10:00 AM';

    const result = await validateBookingDetails(testCounsellorId, dateStr, timeStr, 'OFFLINE', 'counselling');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Offline at-center sessions are temporarily disabled');
  });

  it('should reject booking when DOOR_STEP mode is globally disabled', async () => {
    const Setting = mongoose.model('Setting');
    await Setting.updateOne({}, { $set: { enableDoorstep: false } });

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '10:00 AM';

    const result = await validateBookingDetails(testCounsellorId, dateStr, timeStr, 'DOOR_STEP', 'counselling');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Doorstep home visit sessions are temporarily disabled');
  });
});
