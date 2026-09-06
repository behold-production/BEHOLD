import { describe, it, expect } from 'vitest';
import { getScheduleForDay } from '../../../utils/dateFormatter';

describe('Psychologist-First Booking Availability Logic', () => {
  const DEFAULT_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const parseTimeToMinutes = (timeStr) => {
    const [time, meridiem] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getAdvisorSlotsForDate = (advisor, dateStr, todayStr = '2026-09-11', nowMinutes = 9 * 60) => {
    if (!dateStr || !advisor) return [];

    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const rawAvailability = advisor.availabilitySlots || advisor.availability || {};

    const { isDayActive, slots, hasConfig } = getScheduleForDay(rawAvailability, dayOfWeek);
    if (!isDayActive) return [];

    const activeSlots = slots.length > 0 ? slots : (!hasConfig ? DEFAULT_SLOTS : []);
    const bookings = advisor.bookedSlots || [];

    const isSlotInPast = (timeStr) => {
      const slotMins = parseTimeToMinutes(timeStr);
      return slotMins <= nowMinutes;
    };

    return activeSlots
      .filter(slot => {
        if (dateStr === todayStr && isSlotInPast(slot)) {
          return false;
        }
        return !bookings.some(b => b.date === dateStr && b.time === slot);
      })
      .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  };

  const getAdvisorEarliestAvailableDate = (advisor, baseDate = new Date(2026, 8, 11)) => {
    if (!advisor) return null;
    for (let i = 0; i <= 60; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const slots = getAdvisorSlotsForDate(advisor, dateStr, '2026-09-11', 9 * 60);
      if (slots.length > 0) {
        return dateStr;
      }
    }
    return null;
  };

  it('should find the earliest available date for an advisor available today', () => {
    // 2026-09-11 is Friday (day 5)
    const advisor = {
      id: 'adv-1',
      name: 'Dr. Jasir',
      availability: {
        activeDays: { 5: true, 6: true },
        availableSlots: ['10:00 AM', '11:00 AM']
      },
      bookedSlots: []
    };

    const earliest = getAdvisorEarliestAvailableDate(advisor);
    expect(earliest).toBe('2026-09-11');
    const slots = getAdvisorSlotsForDate(advisor, earliest);
    expect(slots.length).toBe(2);
  });

  it('should skip days with no availability and find the next active date', () => {
    // Advisor is only active on Monday (day 1)
    // 2026-09-11 is Friday. Next Monday is 2026-09-14
    const advisor = {
      id: 'adv-2',
      name: 'Dr. Amitha',
      availability: {
        activeDays: { 1: true },
        availableSlots: ['02:00 PM']
      },
      bookedSlots: []
    };

    const earliest = getAdvisorEarliestAvailableDate(advisor);
    expect(earliest).toBe('2026-09-14');

    // Dates in between have 0 slots and should be disabled
    expect(getAdvisorSlotsForDate(advisor, '2026-09-11').length).toBe(0);
    expect(getAdvisorSlotsForDate(advisor, '2026-09-12').length).toBe(0);
    expect(getAdvisorSlotsForDate(advisor, '2026-09-13').length).toBe(0);
  });

  it('should skip fully booked days to the next available date', () => {
    // Friday is active, but the slot is already booked
    // Saturday (2026-09-12) is active and free
    const advisor = {
      id: 'adv-3',
      name: 'Dr. Athira',
      availability: {
        activeDays: { 5: true, 6: true },
        availableSlots: ['10:00 AM']
      },
      bookedSlots: [
        { date: '2026-09-11', time: '10:00 AM' }
      ]
    };

    const earliest = getAdvisorEarliestAvailableDate(advisor);
    expect(earliest).toBe('2026-09-12');
    expect(getAdvisorSlotsForDate(advisor, '2026-09-11').length).toBe(0); // 0 slots -> disabled on calendar!
    expect(getAdvisorSlotsForDate(advisor, '2026-09-12').length).toBe(1); // 1 slot -> enabled on calendar!
  });

  it('should return null if advisor has no active days within 60 days', () => {
    const advisor = {
      id: 'adv-4',
      name: 'Dr. Unavailable',
      availability: {
        activeDays: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
      }
    };

    const earliest = getAdvisorEarliestAvailableDate(advisor);
    expect(earliest).toBeNull();
  });

  describe('Sequential Booking Flow & Pricing Calculations', () => {
    it('should calculate correct end times for 30-minute Introductory vs 60-minute Standard sessions', () => {
      const calculateEndTime = (startTimeStr, durationMinutes) => {
        const [time, meridiem] = startTimeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours24 = Math.floor(totalMinutes / 60) % 24;
        const endMins = totalMinutes % 60;
        const endMeridiem = endHours24 >= 12 ? 'PM' : 'AM';
        const endHours12 = endHours24 % 12 === 0 ? 12 : endHours24 % 12;
        return `${String(endHours12).padStart(2, '0')}:${String(endMins).padStart(2, '0')} ${endMeridiem}`;
      };

      // 10:30 AM with 30 min duration -> 11:00 AM
      expect(calculateEndTime('10:30 AM', 30)).toBe('11:00 AM');
      // 10:30 AM with 60 min duration -> 11:30 AM
      expect(calculateEndTime('10:30 AM', 60)).toBe('11:30 AM');
      // 11:30 AM with 30 min duration -> 12:00 PM
      expect(calculateEndTime('11:30 AM', 30)).toBe('12:00 PM');
      // 11:30 AM with 60 min duration -> 12:30 PM
      expect(calculateEndTime('11:30 AM', 60)).toBe('12:30 PM');
    });

    it('should correctly select session price based on plan (₹499 for 30m vs ₹899 for 60m)', () => {
      const advisor = {
        id: 'adv-5',
        name: 'Dr. Neha',
        halfSessionPrice: 499,
        price: 899
      };

      const getSessionPrice = (adv, duration) => {
        return duration === 30 ? (adv.halfSessionPrice || 499) : (adv.price || 899);
      };

      expect(getSessionPrice(advisor, 30)).toBe(499);
      expect(getSessionPrice(advisor, 60)).toBe(899);
    });
  });
});
