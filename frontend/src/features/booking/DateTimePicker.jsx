import { useMemo, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check, Clock } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toLocalDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getLocalTodayString() {
  return toLocalDateString(new Date());
}

function getNextWeekdayDate(targetWeekday, fromDate = new Date()) {
  const result = new Date(fromDate);
  result.setHours(0, 0, 0, 0);
  const current = result.getDay();
  let diff = (targetWeekday - current + 7) % 7;
  if (diff === 0) diff = 7;
  result.setDate(result.getDate() + diff);
  return result;
}

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

  // Sync current month view when selectedDate changes
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

  // Quick-jump dates
  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toLocalDateString(d);
  }, [today]);

  const weekendStr = useMemo(() => toLocalDateString(getNextWeekdayDate(6, today)), [today]);

  const nextWeekStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return toLocalDateString(d);
  }, [today]);

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
    onDateChange(dateStr);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-backdrop-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-900 animate-modal-in my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-[#00c9d6] shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-white truncate">Choose Appointment Date</h3>
              <p className="text-xs text-slate-300 truncate">
                {selectedAdvisorName ? `Availability for ${selectedAdvisorName}` : 'Select a date with available slots'}
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

        <div className="p-4 sm:p-6 space-y-5">
          {/* Quick Jump Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Quick Jump</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Today', dateStr: todayStr, obj: today },
                { label: 'Tomorrow', dateStr: tomorrowStr, obj: new Date(tomorrowStr + 'T00:00:00') },
                { label: 'Weekend', dateStr: weekendStr, obj: new Date(weekendStr + 'T00:00:00') },
                { label: 'Next Week', dateStr: nextWeekStr, obj: new Date(nextWeekStr + 'T00:00:00') }
              ].map(item => {
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
                        ? 'bg-slate-900 text-[#00c9d6] border-slate-900 shadow-sm'
                        : isDisabled
                        ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 cursor-pointer'
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                    <span className="text-[10px] font-medium opacity-80">
                      {isDisabled ? 'No slots' : `${meta.slotCount} ${meta.slotCount === 1 ? 'slot' : 'slots'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPrevMonthDisabled}
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={isNextMonthDisabled}
                onClick={handleNextMonth}
                aria-label="Next month"
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Table */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAY_SHORT.map((day, idx) => (
                <span
                  key={day}
                  className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
                    idx === 0 || idx === 6 ? 'text-teal-600' : 'text-slate-500'
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
                        ? 'text-slate-300 opacity-20 pointer-events-none'
                        : isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-md ring-2 ring-[#00c9d6]'
                        : isClickable
                        ? 'bg-white hover:bg-teal-50 border border-slate-200/90 text-slate-900 font-semibold cursor-pointer hover:border-teal-500 hover:shadow-xs'
                        : 'bg-slate-100/50 border border-slate-200/40 text-slate-400 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className={`text-xs ${isSelected ? 'text-white' : ''}`}>
                      {dayNum}
                    </span>

                    {/* Today indicator dot/text */}
                    {isToday && isCurrentMonth && (
                      <span className={`text-[8px] font-extrabold uppercase leading-none tracking-tighter mt-0.5 ${
                        isSelected ? 'text-[#00c9d6]' : 'text-teal-600'
                      }`}>
                        Today
                      </span>
                    )}

                    {/* Available slot count pill */}
                    {isClickable && !isToday && (
                      <span className={`text-[8px] font-medium leading-none mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-emerald-700'
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
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-[#00c9d6]" /> Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Unavailable
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="font-semibold text-slate-700 hover:text-slate-900 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
