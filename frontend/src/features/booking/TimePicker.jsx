import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  AlertCircle,
  Sun,
  CloudSun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Zap,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
import {
  toLocalDateString,
  getLocalTodayString,
  parseTimeToMinutes,
  getTimeBucket,
  getTimeIntervalLabel,
  getSmartWeekdayDate
} from '../../utils/calendarUtils';

const BUCKET_META = {
  morning: {
    label: 'Morning',
    periodText: '9:00 AM - 12:00 PM',
    icon: Sun,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  afternoon: {
    label: 'Afternoon',
    periodText: '12:00 PM - 5:00 PM',
    icon: CloudSun,
    color: 'text-[#a0462e]',
    badgeBg: 'bg-[#faf6ee] text-[#9e432c] border-[#e0d8cb]'
  },
  evening: {
    label: 'Evening',
    periodText: '5:00 PM - 9:00 PM',
    icon: Moon,
    color: 'text-[#a0462e]',
    badgeBg: 'bg-[#faf6ee] text-[#9e432c] border-[#e0d8cb]'
  }
};

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TimePicker({
  selectedDate,
  selectedTime,
  onTimeChange,
  onDateChange,
  availableSlots = [],
  bookedSlots = [],
  errors = {},
  bookingDuration = 60,
  selectedAdvisor = null,
  getAdvisorSlotsForDate,
  getAdvisorEarliestAvailableDate,
  onOpenDatePicker
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => getLocalTodayString(), []);
  const isToday = selectedDate === todayStr;

  const slotsContainerRef = useRef(null);
  // Skip the auto-scroll on first mount / when arriving at this step, so it does not
  // fight the wizard's scroll reset. Only react to genuine user date changes.
  const lastAutoScrolledDateRef = useRef(selectedDate);

  // Auto-scroll to slots when the user picks a different date
  useEffect(() => {
    if (lastAutoScrolledDateRef.current === selectedDate) return;
    lastAutoScrolledDateRef.current = selectedDate;

    if (!selectedDate) return;
    const timer = setTimeout(() => {
      const container = slotsContainerRef.current;
      const modalScroll = document.getElementById('booking-modal-scroll');
      if (container && modalScroll) {
        const containerRect = modalScroll.getBoundingClientRect();
        const targetRect = container.getBoundingClientRect();
        const targetOffset = targetRect.top - containerRect.top + modalScroll.scrollTop - 24;
        modalScroll.scrollTo({ top: Math.max(0, targetOffset), behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  // Month navigation state for the calendar view
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Keep month view in sync when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) {
        const target = new Date(y, m - 1, 1);
        setCurrentMonth(prev => {
          if (target.getFullYear() !== prev.getFullYear() || target.getMonth() !== prev.getMonth()) {
            return target;
          }
          return prev;
        });
      }
    }
  }, [selectedDate]);

  // Advisor's earliest available date
  const earliestAvailableDateStr = useMemo(() => {
    if (selectedAdvisor && getAdvisorEarliestAvailableDate) {
      return getAdvisorEarliestAvailableDate(selectedAdvisor);
    }
    return null;
  }, [selectedAdvisor, getAdvisorEarliestAvailableDate]);

  // Calendar cells for inline month view
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dObj = new Date(year, month - 1, prevTotalDays - i);
      cells.push({
        dateObj: dObj,
        dateStr: toLocalDateString(dObj),
        isCurrentMonth: false,
        dayNum: prevTotalDays - i
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dObj = new Date(year, month, i);
      cells.push({
        dateObj: dObj,
        dateStr: toLocalDateString(dObj),
        isCurrentMonth: true,
        dayNum: i
      });
    }

    // Next month padding
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const dObj = new Date(year, month + 1, i);
      cells.push({
        dateObj: dObj,
        dateStr: toLocalDateString(dObj),
        isCurrentMonth: false,
        dayNum: i
      });
    }

    return cells;
  }, [currentMonth]);

  const isPrevMonthDisabled = useMemo(() => {
    return currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  }, [currentMonth, today]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDaySlotInfo = (dateStr) => {
    const isPast = dateStr < todayStr;
    if (isPast) return { isPast: true, slotCount: 0, hasSlots: false };
    if (selectedAdvisor && getAdvisorSlotsForDate) {
      const s = getAdvisorSlotsForDate(selectedAdvisor, dateStr) || [];
      return { isPast: false, slotCount: s.length, hasSlots: s.length > 0 };
    }
    if (dateStr === selectedDate) {
      return { isPast: false, slotCount: availableSlots.length, hasSlots: availableSlots.length > 0 };
    }
    return { isPast: false, slotCount: 0, hasSlots: false };
  };

  const groupedSlots = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    availableSlots.forEach(slot => {
      const bucket = getTimeBucket(slot);
      if (groups[bucket]) {
        groups[bucket].push(slot);
      }
    });
    return groups;
  }, [availableSlots]);

  const totalSlotCount = availableSlots.length;

  return (
    <div className="bg-white border border-[#ede7de]/90 rounded-xl p-4 sm:p-6 shadow-xs space-y-5 text-left">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-[#f4eee6] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#1c2826] text-[#b85438] text-xs flex items-center justify-center font-extrabold shadow-xs">
            3
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#1c2826] leading-tight">
              Select Date & Time Slot
            </h3>
            <p className="text-xs text-[#8a938f] font-medium">
              {selectedAdvisor
                ? `Booking with ${selectedAdvisor.name} (${bookingDuration === 30 ? '30-Min Intro' : '60-Min Standard'})`
                : 'Pick a consultation time that fits your daily routine'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-[#9e432c] bg-[#faf5f0] border border-[#eadfd0]/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
          Step 3 of 4
        </span>
      </div>

      {/* Date Header + Toggle for Calendar View */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-[#8a938f] uppercase tracking-wider">
            Choose Appointment Date
          </span>
        </div>

        {/* Interactive Month Calendar */}
        <div className="border border-[#ede7de] rounded-lg p-3 sm:p-4 bg-[#faf6ee]/50 space-y-3 animate-step-in">
            {/* Month Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-[#ede7de]">
              <span className="font-bold text-sm sm:text-base text-[#1c2826]">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPrevMonthDisabled}
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="w-7 h-7 rounded-md border border-[#ede7de] bg-white hover:bg-[#f4eee6] disabled:opacity-30 disabled:cursor-not-allowed text-[#4c5b55] flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="w-7 h-7 rounded-md border border-[#ede7de] bg-white hover:bg-[#f4eee6] text-[#4c5b55] flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_SHORT.map((day, idx) => (
                <span
                  key={day}
                  className={`text-[10px] font-bold uppercase tracking-wider py-0.5 ${
                    idx === 0 || idx === 6 ? 'text-[#a0462e]' : 'text-[#8a938f]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                const { dateStr, isCurrentMonth, dayNum } = cell;
                const info = getDaySlotInfo(dateStr);
                const isSelected = selectedDate === dateStr;
                const isTodayCell = dateStr === todayStr;
                const isClickable = isCurrentMonth && !info.isPast && info.hasSlots;

                return (
                  <button
                    key={`${dateStr}-${idx}`}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => {
                      if (!isClickable) return;
                      if (onDateChange) onDateChange(dateStr);
                    }}
                    className={`relative aspect-square p-1 rounded-md flex flex-col items-center justify-center text-center transition-all ${
                      !isCurrentMonth
                        ? 'text-[#e0d8cb] opacity-20 pointer-events-none'
                        : isSelected
                        ? 'bg-[#1c2826] text-white font-bold shadow-xs ring-1 ring-[#b85438]'
                        : isClickable
                        ? 'bg-white hover:bg-[#faf5f0] border border-[#ede7de] text-[#1c2826] font-semibold cursor-pointer hover:border-[#e0d8cb] hover:shadow-xs'
                        : 'bg-[#f4eee6]/50 border border-[#ede7de]/40 text-[#e0d8cb] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {isTodayCell && isCurrentMonth && (
                      <span className={`text-[8px] font-extrabold uppercase leading-none tracking-tighter mt-0.5 ${
                        isSelected ? 'text-[#e8c9bc]' : 'text-[#a0462e]'
                      }`}>
                        Today
                      </span>
                    )}

                    {isClickable && !isTodayCell && (
                      <span className={`text-[8px] font-bold leading-none mt-0.5 ${
                        isSelected ? 'text-[#e0d8cb]' : 'text-emerald-700'
                      }`}>
                        {info.slotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inline Footer / Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-[#ede7de] text-[11px] text-[#8a938f]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open Slots
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1c2826] border border-[#b85438]" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#e0d8cb]" /> Fully Booked / Off
                </span>
              </div>
            </div>
          </div>
      </div>

      {/* Selected Date Indicator & Earliest Jump Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 bg-[#faf6ee] border border-[#ede7de] rounded-lg">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="px-2 py-0.5 bg-[#faf5f0] text-[#9e432c] border border-[#eadfd0] text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b85438] animate-pulse" />
              Today
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-white text-[#4c5b55] border border-[#ede7de] text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-[#8a938f]" />
              Selected
            </span>
          )}
          <span className="font-bold text-xs sm:text-sm text-[#1c2826]">
            {selectedDate ? formatDateString(selectedDate) : 'Select a date'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {totalSlotCount > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span>✓ {totalSlotCount} {totalSlotCount === 1 ? 'Slot' : 'Slots'} Available</span>
                <span className="text-[#a8a094] font-normal">({bookingDuration === 30 ? '30m' : '60m'})</span>
              </span>
            ) : (
              <span className="text-rose-500 font-medium">0 Slots Available</span>
            )}
          </span>

          {/* Quick jump to earliest available if current date has 0 slots */}
          {totalSlotCount === 0 && earliestAvailableDateStr && earliestAvailableDateStr !== selectedDate && (
            <button
              type="button"
              onClick={() => onDateChange && onDateChange(earliestAvailableDateStr)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#faf5f0] hover:bg-[#f4eee6] text-[#1c2826] border border-[#eadfd0] rounded-md text-xs font-bold transition cursor-pointer"
            >
              <Zap className="w-3 h-3 text-[#9e432c]" />
              <span>Next Free: {formatDateString(earliestAvailableDateStr)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Available Slots Section */}
      <div ref={slotsContainerRef}>
        {totalSlotCount > 0 ? (
        <div className="space-y-4 pt-1">
          {['morning', 'afternoon', 'evening'].map(bucket => {
            const items = groupedSlots[bucket];
            if (!items || items.length === 0) return null;
            const meta = BUCKET_META[bucket];
            const IconComp = meta.icon;

            return (
              <div key={bucket} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-bold ${meta.badgeBg}`}>
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#a8a094]">
                      {meta.periodText}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#8a938f]">
                    {items.length} {items.length === 1 ? 'slot' : 'slots'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {items.map(time => {
                    const isSelected = selectedTime === time;
                    const isBooked = bookedSlots && bookedSlots.includes(time);
                    const intervalText = getTimeIntervalLabel(time, bookingDuration);

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={isBooked}
                        onClick={() => {
                          if (isBooked) return;
                          onTimeChange(time);
                        }}
                        className={`p-2.5 rounded-lg font-semibold transition-all duration-150 text-center flex flex-col items-center justify-center gap-0.5 border min-h-[54px] relative overflow-hidden active:scale-95 ${
                          isSelected
                            ? 'bg-[#1c2826] text-white border-[#1c2826] shadow-xs ring-1 ring-[#b85438]'
                            : isBooked
                            ? 'bg-[#f4eee6]/70 border-[#ede7de] text-[#a8a094] opacity-50 cursor-not-allowed'
                            : 'bg-white hover:bg-[#faf5f0]/60 border-[#ede7de] text-[#33413d] hover:border-[#e0d8cb] hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#e8c9bc] stroke-[3]" />}
                          <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-[#e8c9bc]' : 'text-[#1c2826]'}`}>
                            {time}
                          </span>
                        </div>

                        <span className={`text-[10.5px] font-medium leading-tight ${isSelected ? 'text-[#e0d8cb]' : 'text-[#8a938f]'}`}>
                          {intervalText}
                        </span>

                        {isBooked && (
                          <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mt-0.5">
                            Booked
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State with Automatic Next-Date Action */
        <div className="p-8 sm:p-10 border border-dashed border-[#ede7de] rounded-lg bg-[#faf6ee]/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f4eee6] border border-[#ede7de] flex items-center justify-center mx-auto text-[#a8a094]">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm sm:text-base text-[#33413d]">
              {isToday
                ? 'No consultation slots available today.'
                : 'No slots available on this date.'}
            </h5>
            <p className="text-xs text-[#8a938f] max-w-md mx-auto">
              {earliestAvailableDateStr && earliestAvailableDateStr !== selectedDate
                ? `${selectedAdvisor?.name || 'The psychologist'} has upcoming consultation slots starting on ${formatDateString(earliestAvailableDateStr)}.`
                : 'All slots for this date have been booked or expired. Please browse the calendar to select another day.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {earliestAvailableDateStr && earliestAvailableDateStr !== selectedDate && (
              <button
                type="button"
                onClick={() => onDateChange && onDateChange(earliestAvailableDateStr)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1c2826] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <Zap className="w-4 h-4 text-[#b85438]" />
                <span>Jump to {formatDateString(earliestAvailableDateStr)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (typeof onOpenDatePicker === 'function') {
                  onOpenDatePicker();
                } else {
                  const modalScroll = document.getElementById('booking-modal-scroll');
                  if (modalScroll) {
                    modalScroll.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-[#f4eee6] text-[#33413d] text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#ede7de] shadow-xs"
            >
              <CalendarIcon className="w-4 h-4 text-[#b85438]" />
              <span>Browse Full Month</span>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Selected Slot Summary Badge */}
      {selectedTime && totalSlotCount > 0 && (
        <div className="p-3 bg-[#faf5f0]/70 border border-[#eadfd0]/90 rounded-xl flex items-center justify-between text-xs animate-step-in">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#a0462e] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1c2826] truncate">
                {selectedTime} ({getTimeIntervalLabel(selectedTime, bookingDuration)})
              </p>
              <p className="text-[11px] text-[#5c6b66] truncate">
                {formatDateString(selectedDate)} • {selectedAdvisor?.name || 'Selected Advisor'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d3522] bg-[#f4eee6]/80 px-2 py-0.5 rounded shrink-0">
            Slot Ready
          </span>
        </div>
      )}

      {errors.time && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errors.time}</span>
        </div>
      )}
    </div>
  );
}
