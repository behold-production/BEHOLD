import { useMemo, useState, useEffect } from 'react';
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
    color: 'text-sky-600',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  evening: {
    label: 'Evening',
    periodText: '5:00 PM - 9:00 PM',
    icon: Moon,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
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

  // Inline month calendar expand/collapse toggle
  const [showInlineCalendar, setShowInlineCalendar] = useState(false);

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

  // Next 5 days for quick 1-tap strip with live slot counts
  const quickDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const str = toLocalDateString(d);
      let label = 'Today';
      if (i === 1) label = 'Tomorrow';
      else {
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      }

      let slotCount = 0;
      if (selectedAdvisor && getAdvisorSlotsForDate) {
        const slots = getAdvisorSlotsForDate(selectedAdvisor, str) || [];
        slotCount = slots.length;
      } else if (str === selectedDate) {
        slotCount = availableSlots.length;
      }

      days.push({
        label,
        dateStr: str,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        slotCount,
        hasSlots: slotCount > 0
      });
    }
    return days;
  }, [today, selectedAdvisor, getAdvisorSlotsForDate, selectedDate, availableSlots]);

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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 text-left">
      {/* Step Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-xl bg-slate-900 text-[#00c9d6] text-xs flex items-center justify-center font-extrabold shadow-xs">
            3
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
              Select Date & Time Slot
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {selectedAdvisor
                ? `Booking with ${selectedAdvisor.name} (${bookingDuration === 30 ? '30-Min Intro' : '60-Min Standard'})`
                : 'Pick a consultation time that fits your daily routine'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
          Step 3 of 4
        </span>
      </div>

      {/* Date Header + Toggle for Calendar View */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Choose Appointment Date
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInlineCalendar(prev => !prev)}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{showInlineCalendar ? 'Show Quick Days' : 'Interactive Calendar'}</span>
            </button>
            {onOpenDatePicker && (
              <>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  type="button"
                  onClick={onOpenDatePicker}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Full Modal</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quick Date Selector Bar */}
        {!showInlineCalendar ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {quickDays.map((qd) => {
                const isSelected = selectedDate === qd.dateStr;
                const isDisabled = !qd.hasSlots;

                return (
                  <button
                    key={qd.dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) return;
                      if (onDateChange) onDateChange(qd.dateStr);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border ${
                      isSelected
                        ? 'bg-slate-900 text-[#00c9d6] border-slate-900 shadow-sm ring-2 ring-[#00c9d6]/50'
                        : isDisabled
                        ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-teal-400 cursor-pointer shadow-xs'
                    }`}
                  >
                    <span className="font-extrabold leading-tight">{qd.label}</span>
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {qd.shortDate}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full mt-0.5 leading-tight ${
                        isSelected
                          ? 'bg-teal-500/20 text-[#00c9d6]'
                          : isDisabled
                          ? 'bg-slate-200/70 text-slate-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {isDisabled ? 'No slots' : `${qd.slotCount} slots`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* If selected date is beyond the 5 days, show indicator */}
            {!quickDays.some(qd => qd.dateStr === selectedDate) && selectedDate && (
              <div className="flex items-center justify-between p-2.5 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs text-teal-900">
                <span className="font-medium">
                  Viewing selected date from calendar: <strong className="font-bold">{formatDateString(selectedDate)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineCalendar(true)}
                  className="font-bold text-teal-700 hover:underline cursor-pointer bg-transparent border-none p-0 text-xs"
                >
                  Change Date
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Inline Interactive Month Calendar */
          <div className="border border-slate-200 rounded-2xl p-3 sm:p-4 bg-slate-50/50 space-y-3 animate-in fade-in duration-200">
            {/* Month Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-sm sm:text-base text-slate-900">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPrevMonthDisabled}
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
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
                    idx === 0 || idx === 6 ? 'text-teal-600' : 'text-slate-500'
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
                    className={`relative aspect-square p-1 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                      !isCurrentMonth
                        ? 'text-slate-300 opacity-20 pointer-events-none'
                        : isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-md ring-2 ring-[#00c9d6]'
                        : isClickable
                        ? 'bg-white hover:bg-teal-50 border border-slate-200/90 text-slate-900 font-semibold cursor-pointer hover:border-teal-500 hover:shadow-xs'
                        : 'bg-slate-100/50 border border-slate-200/40 text-slate-300 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {isTodayCell && isCurrentMonth && (
                      <span className={`text-[8px] font-extrabold uppercase leading-none tracking-tighter mt-0.5 ${
                        isSelected ? 'text-[#00c9d6]' : 'text-teal-600'
                      }`}>
                        Today
                      </span>
                    )}

                    {isClickable && !isTodayCell && (
                      <span className={`text-[8px] font-bold leading-none mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-emerald-700'
                      }`}>
                        {info.slotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Inline Footer / Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Open Slots
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-900 border border-[#00c9d6]" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Fully Booked / Off
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineCalendar(false)}
                className="font-bold text-teal-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Indicator & Earliest Jump Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Today
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-slate-500" />
              Selected
            </span>
          )}
          <span className="font-bold text-xs sm:text-sm text-slate-900">
            {selectedDate ? formatDateString(selectedDate) : 'Select a date'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {totalSlotCount > 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span>✓ {totalSlotCount} {totalSlotCount === 1 ? 'Slot' : 'Slots'} Available</span>
                <span className="text-slate-400 font-normal">({bookingDuration === 30 ? '30m' : '60m'})</span>
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
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00c9d6]/10 hover:bg-[#00c9d6]/20 text-teal-900 border border-teal-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Zap className="w-3 h-3 text-[#008b94]" />
              <span>Next Free: {formatDateString(earliestAvailableDateStr)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Available Slots Section */}
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
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${meta.badgeBg}`}>
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{meta.label}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {meta.periodText}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {items.length} {items.length === 1 ? 'slot' : 'slots'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
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
                        className={`p-3 rounded-xl font-semibold transition-all duration-200 text-center flex flex-col items-center justify-center gap-0.5 border min-h-[58px] relative overflow-hidden active:scale-95 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#00c9d6]'
                            : isBooked
                            ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                            : 'bg-white hover:bg-teal-50/60 border-slate-200 text-slate-800 hover:border-teal-500 hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#00c9d6] stroke-[3]" />}
                          <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-[#00c9d6]' : 'text-slate-900'}`}>
                            {time}
                          </span>
                        </div>

                        <span className={`text-[10.5px] font-medium leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
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
        <div className="p-8 sm:p-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm sm:text-base text-slate-800">
              {isToday
                ? 'No consultation slots available today.'
                : 'No slots available on this date.'}
            </h5>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <Zap className="w-4 h-4 text-[#00c9d6]" />
                <span>Jump to {formatDateString(earliestAvailableDateStr)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowInlineCalendar(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200 shadow-xs"
            >
              <CalendarIcon className="w-4 h-4 text-[#008b94]" />
              <span>Browse Full Month</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Slot Summary Badge */}
      {selectedTime && totalSlotCount > 0 && (
        <div className="p-3 bg-teal-50/70 border border-teal-200/90 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">
                {selectedTime} ({getTimeIntervalLabel(selectedTime, bookingDuration)})
              </p>
              <p className="text-[11px] text-slate-600 truncate">
                {formatDateString(selectedDate)} • {selectedAdvisor?.name || 'Selected Advisor'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded shrink-0">
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
