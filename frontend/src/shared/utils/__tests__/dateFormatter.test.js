import { describe, it, expect } from 'vitest';
import { formatDateString } from '../dateFormatter';

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
