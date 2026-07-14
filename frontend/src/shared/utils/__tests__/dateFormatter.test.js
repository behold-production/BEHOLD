import { describe, it, expect, vi } from 'vitest';
import { formatDateString, calculateNextAvailable } from '../dateFormatter';

describe('formatDateString', () => {
  it('should return empty string for null/undefined', () => {
    expect(formatDateString(null)).toBe('');
    expect(formatDateString(undefined)).toBe('');
  });

  it('should format Date objects correctly', () => {
    const date = new Date(2026, 5, 22); // June 22, 2026
    expect(formatDateString(date)).toBe('June 22, 2026');
  });

  it('should format ISO date strings correctly', () => {
    expect(formatDateString('2026-06-22T00:00:00.000Z')).toBe('June 22, 2026');
    expect(formatDateString('2026-06-22')).toBe('June 22, 2026');
  });

  it('should format timestamps correctly', () => {
    const timestamp = new Date(2026, 5, 22).getTime();
    expect(formatDateString(timestamp)).toBe('June 22, 2026');
  });

  it('should fall back to raw string on invalid formats', () => {
    expect(formatDateString('invalid-date')).toBe('invalid-date');
  });
});

describe('calculateNextAvailable', () => {
  it('should return Unavailable if no slots are provided', () => {
    expect(calculateNextAvailable(null, [])).toBe('Unavailable');
    expect(calculateNextAvailable({ activeDays: {}, availableSlots: [] }, [])).toBe('Unavailable');
  });

  it('should return Available Today if there are unbooked slots in the future today', () => {
    vi.setSystemTime(new Date(2026, 5, 25, 9, 0)); // Thursday June 25, 2026, 9:00 AM

    const availability = {
      activeDays: { 4: true },
      availableSlots: ['10:00 AM', '11:00 AM']
    };
    const bookedSlots = [];

    expect(calculateNextAvailable(availability, bookedSlots)).toBe('Available Today');
  });

  it('should return Available Tomorrow if today slots are past but tomorrow is active and free', () => {
    vi.setSystemTime(new Date(2026, 5, 25, 12, 0)); // Thursday June 25, 2026, 12:00 PM

    const availability = {
      activeDays: { 4: true, 5: true },
      availableSlots: ['10:00 AM']
    };
    const bookedSlots = [];

    expect(calculateNextAvailable(availability, bookedSlots)).toBe('Available Tomorrow');
  });

  it('should return Available [DayName] if next active day is after tomorrow', () => {
    vi.setSystemTime(new Date(2026, 5, 26, 12, 0)); // Friday June 26, 2026, 12:00 PM

    const availability = {
      activeDays: { 1: true }, // Monday
      availableSlots: ['10:00 AM']
    };
    const bookedSlots = [];

    expect(calculateNextAvailable(availability, bookedSlots)).toBe('Available Monday');
  });

  it('should ignore booked slots when finding availability', () => {
    vi.setSystemTime(new Date(2026, 5, 25, 9, 0)); // Thursday June 25, 2026, 9:00 AM

    const availability = {
      activeDays: { 4: true, 5: true },
      availableSlots: ['10:00 AM']
    };
    const bookedSlots = [{ date: '2026-06-25', time: '10:00 AM' }];

    expect(calculateNextAvailable(availability, bookedSlots)).toBe('Available Tomorrow');
  });
});
