import { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check, Clock, Zap } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
import { toLocalDateString, getLocalTodayString, getSmartWeekdayDate } from '../../utils/calendarUtils';
import { useScrollLock } from '../../utils/scrollLock';

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DateTimePicker({
  isOpen = false,
  onClose,
  selectedDate,
  onDateChange,
  getAvailableSlotsForDate,
  maxAdvanceDays = 60,
  selectedAdvisorName = ''
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => getLocalTodayString(), []);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxAdvanceDays);
    return d;
  }, [today, maxAdvanceDays]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      if (y && m) return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Sync current month view when selectedDate changes or modal opens
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
  }, [selectedDate, isOpen]);

  // Helper to check availability for any given date
  const getDayMeta = (dateStr, dateObj) => {
    const isPast = dateStr < todayStr;
    const isBeyondMax = dateObj > maxDate;
    let slotCount = 0;
    let isAvailable = false;
    if (!isPast && !isBeyondMax && getAvailableSlotsForDate) {
      const slots = getAvailableSlotsForDate(dateStr) || [];
      slotCount = slots.length;
      isAvailable = slotCount > 0;
    }
    return { isPast: isPast || isBeyondMax, isAvailable, slotCount };
  };

  // Find next available date dynamically
  const earliestAvailableDateStr = useMemo(() => {
    if (!getAvailableSlotsForDate) return null;
    const d = new Date(today);
    for (let i = 0; i <= maxAdvanceDays; i++) {
      const checkDate = new Date(d);
      checkDate.setDate(d.getDate() + i);
      const str = toLocalDateString(checkDate);
      const slots = getAvailableSlotsForDate(str) || [];
      if (slots.length > 0) {
        return str;
      }
    }
    return null;
  }, [today, maxAdvanceDays, getAvailableSlotsForDate]);

  // Quick-jump dates
  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toLocalDateString(d);
  }, [today]);

  const weekendStr = useMemo(() => {
    const sat = getSmartWeekdayDate(6, today);
    return toLocalDateString(sat);
  }, [today]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month padding
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

    // Next month padding to maintain uniform grid (multiple of 7)
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

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isPrevMonthDisabled = useMemo(() => {
    return currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
  }, [currentMonth, today]);

  const isNextMonthDisabled = useMemo(() => {
    return currentMonth.getFullYear() === maxDate.getFullYear() && currentMonth.getMonth() === maxDate.getMonth();
  }, [currentMonth, maxDate]);

  const handleSelectDate = (dateStr, dateObj) => {
    const meta = getDayMeta(dateStr, dateObj);
    if (meta.isPast || !meta.isAvailable) return;
    if (onClose) onClose();
    onDateChange(dateStr);
  };

  // Counted lock: this sheet usually opens on top of the booking wizard, which
  // already holds a lock, so releasing here can't unfreeze the page underneath.
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const quickJumpList = [
    { label: 'Today', dateStr: todayStr, obj: today },
    { label: 'Tomorrow', dateStr: tomorrowStr, obj: new Date(tomorrowStr + 'T00:00:00') },
    ...(earliestAvailableDateStr && earliestAvailableDateStr !== todayStr && earliestAvailableDateStr !== tomorrowStr
      ? [{ label: 'Next Free', dateStr: earliestAvailableDateStr, obj: new Date(earliestAvailableDateStr + 'T00:00:00'), isNext: true }]
      : []),
    { label: 'Weekend', dateStr: weekendStr, obj: new Date(weekendStr + 'T00:00:00') }
  ];

  const modalNode = (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-backdrop-in overflow-hidden"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e6dfd0]/90 bg-white text-[#0e1111] shadow-2xl animate-modal-in my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0e1111] via-[#243033] to-[#0e1111] text-white flex items-center justify-between border-b border-[#3c4747]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0e7490]/20 border border-[#7fd3e3]/30 flex items-center justify-center text-[#0e7490] shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-white truncate">Choose Appointment Date</h3>
              <p className="text-xs text-[#d5cdbb] truncate">
                {selectedAdvisorName ? `Available Consultation Dates for ${selectedAdvisorName}` : 'Select a date with open session slots'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close date picker"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border-none shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {/* Quick Jump Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#7c8785] uppercase tracking-wider block">Quick Jump</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickJumpList.slice(0, 4).map(item => {
                const meta = getDayMeta(item.dateStr, item.obj);
                const isSelected = selectedDate === item.dateStr;
                const isDisabled = meta.isPast || !meta.isAvailable;

                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(item.dateStr, item.obj)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-[#0e1111] text-[#0e7490] border-[#0e1111] shadow-sm ring-2 ring-[#0e7490]/50'
                        : isDisabled
                        ? 'bg-[#f6f1e6] border-[#e6dfd0] text-[#d5cdbb] cursor-not-allowed opacity-50'
                        : item.isNext
                        ? 'bg-[#f7f2e7] hover:bg-[#f1eadc] border-[#bfe8f1] text-[#0e1111] cursor-pointer shadow-xs'
                        : 'bg-white hover:bg-[#f6f1e6] border-[#e6dfd0] text-[#3c4747] hover:border-[#9aa29f] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {item.isNext && <Zap className="w-3 h-3 text-[#0e7490]" />}
                      <span className="font-bold">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-medium ${isDisabled ? 'text-[#d5cdbb]' : isSelected ? 'text-[#bfe8f1]' : 'text-emerald-700'}`}>
                      {isDisabled ? '0 slots' : `${meta.slotCount} ${meta.slotCount === 1 ? 'slot' : 'slots'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f1eadc]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#0e1111]">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPrevMonthDisabled}
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="w-8 h-8 rounded-lg border border-[#e6dfd0] bg-white hover:bg-[#f6f1e6] disabled:opacity-30 disabled:cursor-not-allowed text-[#3c4747] flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isNextMonthDisabled}
                onClick={handleNextMonth}
                aria-label="Next month"
                className="w-8 h-8 rounded-lg border border-[#e6dfd0] bg-white hover:bg-[#f6f1e6] disabled:opacity-30 disabled:cursor-not-allowed text-[#3c4747] flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="border border-[#e6dfd0] rounded-2xl p-3 bg-[#f6f1e6]/50">
            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAY_SHORT.map((day, idx) => (
                <span
                  key={day}
                  className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
                    idx === 0 || idx === 6 ? 'text-[#0b5c73]' : 'text-[#7c8785]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, index) => {
                const { dateStr, dateObj, isCurrentMonth, dayNum } = cell;
                const meta = getDayMeta(dateStr, dateObj);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;
                const isClickable = isCurrentMonth && !meta.isPast && meta.isAvailable;

                return (
                  <button
                    key={`${dateStr}-${index}`}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleSelectDate(dateStr, dateObj)}
                    className={`relative aspect-square p-1 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                      !isCurrentMonth
                        ? 'text-[#d5cdbb] opacity-20 pointer-events-none'
                        : isSelected
                        ? 'bg-[#0e1111] text-white font-bold shadow-md ring-2 ring-[#0e7490]'
                        : isClickable
                        ? 'bg-white hover:bg-[#f7f2e7] border border-[#e6dfd0]/90 text-[#0e1111] font-semibold cursor-pointer hover:border-[#0e7490] hover:shadow-xs'
                        : 'bg-[#f1eadc]/50 border border-[#e6dfd0]/40 text-[#9aa29f] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {/* Today indicator */}
                    {isToday && isCurrentMonth && (
                      <span className={`text-[8px] font-extrabold uppercase leading-none tracking-tighter mt-0.5 ${
                        isSelected ? 'text-[#0e7490]' : 'text-[#0b5c73]'
                      }`}>
                        Today
                      </span>
                    )}

                    {/* Available slot count pill */}
                    {isClickable && !isToday && (
                      <span className={`text-[8px] font-medium leading-none mt-0.5 ${
                        isSelected ? 'text-[#d5cdbb]' : 'text-emerald-700 font-bold'
                      }`}>
                        {meta.slotCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Guide & Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#7c8785] pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available Slots
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0e1111] border border-[#0e7490]" /> Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d5cdbb]" /> Unavailable
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-[#3c4747] hover:text-[#0e1111] hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
}
