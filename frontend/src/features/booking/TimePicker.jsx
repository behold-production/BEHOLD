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
    color: 'text-[#0b5c73]',
    badgeBg: 'bg-[#f6f1e6] text-[#0c6b83] border-[#d5cdbb]'
  },
  evening: {
    label: 'Evening',
    periodText: '5:00 PM - 9:00 PM',
    icon: Moon,
    color: 'text-[#0b5c73]',
    badgeBg: 'bg-[#f6f1e6] text-[#0c6b83] border-[#d5cdbb]'
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
    <div className="bg-white border border-[#e6dfd0]/90 rounded-xl p-4 sm:p-6 shadow-xs space-y-5 text-left">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-[#f1eadc] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-[#0e7490] text-white text-xs flex items-center justify-center font-extrabold shadow-xs">
            3
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#0e1111] leading-tight">
              Select Date & Time Slot
            </h3>
            <p className="text-xs text-[#7c8785] font-medium">
              {selectedAdvisor
                ? `Booking with ${selectedAdvisor.name} (${bookingDuration === 30 ? '30-Min Intro' : '60-Min Standard'})`
                : 'Pick a consultation time that fits your daily routine'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-[#0b5c73] bg-[#edf5f7] border border-[#bfe3ec] px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
          Step 3 of 4
        </span>
      </div>

      {/* Two-column on large screens: compact calendar (left) + time slots (right); stacked on mobile */}
      <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-8 lg:items-start">
        {/* LEFT COLUMN — Calendar */}
        <div className="space-y-5">
      {/* Date Header + Toggle for Calendar View */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-bold text-[#7c8785] uppercase tracking-wider">
            Choose Appointment Date
          </span>
        </div>

        {/* Interactive Month Calendar */}
        <div className="border border-[#e6dfd0] rounded-lg p-3 sm:p-4 bg-[#f6f1e6]/50 space-y-3 animate-step-in">
            {/* Month Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-[#e6dfd0]">
              <span className="font-bold text-sm sm:text-base text-[#0e1111]">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPrevMonthDisabled}
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="w-7 h-7 rounded-md border border-[#e6dfd0] bg-white hover:bg-[#f1eadc] disabled:opacity-30 disabled:cursor-not-allowed text-[#3c4747] flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="w-7 h-7 rounded-md border border-[#e6dfd0] bg-white hover:bg-[#f1eadc] text-[#3c4747] flex items-center justify-center transition cursor-pointer"
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
                    idx === 0 || idx === 6 ? 'text-[#0b5c73]' : 'text-[#7c8785]'
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
                        ? 'text-[#d5cdbb] opacity-20 pointer-events-none'
                        : isSelected
                        ? 'bg-[#0e7490] text-white font-bold shadow-xs ring-1 ring-[#0b5c73]'
                        : isClickable
                        ? 'bg-white hover:bg-[#f7f2e7] border border-[#e6dfd0] text-[#0e1111] font-semibold cursor-pointer hover:border-[#d5cdbb] hover:shadow-xs'
                        : 'bg-[#f1eadc]/50 border border-[#e6dfd0]/40 text-[#d5cdbb] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {isTodayCell && isCurrentMonth && (
                      <span className={`text-[8px] font-extrabold uppercase leading-none tracking-tighter mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#0b5c73]'}`}>
                        Today
                      </span>
                    )}

                    {isClickable && !isTodayCell && (
                      <span className={`text-[8px] font-bold leading-none mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-emerald-700'
                      }`}>
                        {info.slotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inline Footer / Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd0] text-[11px] text-[#7c8785]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open Slots
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0e7490]" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#d5cdbb]" /> Fully Booked / Off
                </span>
              </div>
            </div>
          </div>
      </div>

      {/* Selected Date Indicator & Earliest Jump Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 bg-[#f6f1e6] border border-[#e6dfd0] rounded-lg">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="px-2 py-0.5 bg-[#f7f2e7] text-[#0c6b83] border border-[#bfe3ec] text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0e7490] animate-pulse" />
              Today
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-white text-[#3c4747] border border-[#e6dfd0] text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-[#7c8785]" />
              Selected
            </span>
          )}
          <span className="font-bold text-xs sm:text-sm text-[#0e1111]">
            {selectedDate ? formatDateString(selectedDate) : 'Select a date'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {totalSlotCount > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span>✓ {totalSlotCount} {totalSlotCount === 1 ? 'Slot' : 'Slots'} Available</span>
                <span className="text-[#9aa29f] font-normal">({bookingDuration === 30 ? '30m' : '60m'})</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f7f2e7] hover:bg-[#f1eadc] text-[#0e1111] border border-[#bfe3ec] rounded-md text-xs font-bold transition cursor-pointer"
            >
              <Zap className="w-3 h-3 text-[#0c6b83]" />
              <span>Next Free: {formatDateString(earliestAvailableDateStr)}</span>
            </button>
          )}
        </div>
      </div>

        </div>
        {/* /LEFT COLUMN */}

        {/* RIGHT COLUMN — Time Slots */}
        <div className="space-y-4">
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
                    <span className="text-[11px] font-medium text-[#9aa29f]">
                      {meta.periodText}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#7c8785]">
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
                            ? 'bg-[#0e7490] text-white border-[#0e7490] shadow-xs ring-1 ring-[#0b5c73]'
                            : isBooked
                            ? 'bg-[#f1eadc]/70 border-[#e6dfd0] text-[#9aa29f] opacity-50 cursor-not-allowed'
                            : 'bg-white hover:bg-[#f7f2e7]/60 border-[#e6dfd0] text-[#243033] hover:border-[#d5cdbb] hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-white' : 'text-[#0e1111]'}`}>
                            {time}
                          </span>
                        </div>

                        <span className={`text-[10.5px] font-medium leading-tight ${isSelected ? 'text-white/75' : 'text-[#7c8785]'}`}>
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
        <div className="p-8 sm:p-10 border border-dashed border-[#e6dfd0] rounded-lg bg-[#f6f1e6]/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f1eadc] border border-[#e6dfd0] flex items-center justify-center mx-auto text-[#9aa29f]">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm sm:text-base text-[#243033]">
              {isToday
                ? 'No consultation slots available today.'
                : 'No slots available on this date.'}
            </h5>
            <p className="text-xs text-[#7c8785] max-w-md mx-auto">
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)]"
              >
                <Zap className="w-4 h-4 text-white" />
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
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-[#f1eadc] text-[#243033] text-xs font-bold rounded-xl transition-all cursor-pointer border border-[#e6dfd0] shadow-xs"
            >
              <CalendarIcon className="w-4 h-4 text-[#0e7490]" />
              <span>Browse Full Month</span>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Selected Slot Summary Badge */}
      {selectedTime && totalSlotCount > 0 && (
        <div className="p-3 bg-[#f7f2e7]/70 border border-[#bfe3ec]/90 rounded-xl flex items-center justify-between text-xs animate-step-in">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#0b5c73] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#0e1111] truncate">
                {selectedTime} ({getTimeIntervalLabel(selectedTime, bookingDuration)})
              </p>
              <p className="text-[11px] text-[#55605f] truncate">
                {formatDateString(selectedDate)} • {selectedAdvisor?.name || 'Selected Advisor'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b5c73] bg-[#edf5f7] border border-[#bfe3ec] px-2 py-0.5 rounded shrink-0">
            Slot Ready
          </span>
        </div>
      )}
        </div>
        {/* /RIGHT COLUMN */}
      </div>
      {/* /GRID WRAPPER */}

      {errors.time && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errors.time}</span>
        </div>
      )}
    </div>
  );
}
