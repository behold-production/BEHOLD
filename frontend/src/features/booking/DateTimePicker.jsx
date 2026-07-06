import { useMemo, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function formatHumanDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function isSlotInPast(timeStr, dateStr) {
  if (!timeStr || !dateStr) return false;
  if (dateStr !== getLocalTodayString()) return false;
  try {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    return now >= slotDate;
  } catch (e) {
    return false;
  }
}

function bookingModeLabel(mode) {
  if (mode === 'DOOR_STEP') return 'Doorstep visit';
  if (mode === 'OFFLINE') return 'In-center visit';
  return 'Online video session';
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  getAvailableSlotsForDate,
  errors = {},
  maxAdvanceDays = 60,
  selectedMode = 'ONLINE'
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => getLocalTodayString(), []);
  const scrollRef = useRef(null);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxAdvanceDays);
    return d;
  }, [today, maxAdvanceDays]);

  const [viewType, setViewType] = useState('calendar'); // 'calendar' or 'strip'
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

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

  // Build the list of all days from today to maxAdvanceDays
  const daysList = useMemo(() => {
    const list = [];
    for (let i = 0; i <= maxAdvanceDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        dateObj: d,
        dateStr: toLocalDateString(d),
        weekday: WEEKDAY_SHORT[d.getDay()],
        day: d.getDate(),
        month: MONTH_SHORT[d.getMonth()]
      });
    }
    return list;
  }, [today, maxAdvanceDays]);

  // Get availability metadata for a given date
  const getDayMeta = (dateStr, dateObj) => {
    const isPast = dateStr < todayStr;
    const isBeyondMax = dateObj > maxDate;
    let slotCount = 0;
    let isAvailable = false;
    if (!isPast && !isBeyondMax && getAvailableSlotsForDate) {
      const slots = getAvailableSlotsForDate(dateStr)
        .filter(t => !isSlotInPast(t, dateStr));
      slotCount = slots.length;
      isAvailable = slotCount > 0;
    }
    return { isPast: isPast || isBeyondMax, isAvailable, slotCount };
  };

  // Auto-scroll selected date card into view (only if in strip mode)
  useEffect(() => {
    if (viewType === 'strip' && selectedDate && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate, viewType]);

  // Adjust current month when selectedDate changes from outside (e.g. quick-jump)
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const targetMonth = new Date(y, m - 1, 1);
      if (
        targetMonth.getFullYear() !== currentMonth.getFullYear() ||
        targetMonth.getMonth() !== currentMonth.getMonth()
      ) {
        setCurrentMonth(targetMonth);
      }
    }
  }

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  const getChipClass = (targetStr) => {
    const isSelected = selectedDate === targetStr;
    const base = "shrink-0 px-3 min-h-[34px] rounded-[10px] text-[11px] font-semibold capitalize transition-all duration-200 cursor-pointer flex items-center border";
    if (isSelected) {
      return `${base} bg-surface-900 border-surface-900 text-white`;
    }
    return `${base} bg-white border-surface-200 text-surface-600 hover:border-surface-400 hover:bg-surface-50`;
  };

  const handleQuickJump = (dateStr) => {
    onDateChange(dateStr);
    onTimeChange('');
  };

  // Calculate days for the calendar grid
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Days in previous month
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    const cells = [];
    
    // Previous month padding days
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
    
    // Next month padding days to complete standard 6-row layout (42 cells)
    const remaining = 42 - cells.length;
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

  return (
    <div className="space-y-4">
      {/* Top Header Row with Quick Jump & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* Quick-jump chips */}
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => handleQuickJump(todayStr)} className={getChipClass(todayStr)}>Today</button>
          <button type="button" onClick={() => handleQuickJump(tomorrowStr)} className={getChipClass(tomorrowStr)}>Tomorrow</button>
          <button type="button" onClick={() => handleQuickJump(weekendStr)} className={getChipClass(weekendStr)}>Weekend</button>
          <button type="button" onClick={() => handleQuickJump(nextWeekStr)} className={getChipClass(nextWeekStr)}>Next Week</button>
        </div>

        <div className="flex items-center bg-surface-100 p-0.5 rounded-[10px] border border-surface-200 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewType('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
              viewType === 'calendar'
                ? 'bg-white text-surface-950 shadow-sm border border-surface-200'
                : 'text-surface-500 hover:text-surface-900 border border-transparent'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar Grid
          </button>
          <button
            type="button"
            onClick={() => setViewType('strip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[10px] transition-all cursor-pointer ${
              viewType === 'strip'
                ? 'bg-white text-surface-950 shadow-sm border border-surface-200'
                : 'text-surface-500 hover:text-surface-900 border border-transparent'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            Weekly Strip
          </button>
        </div>
      </div>

      {viewType === 'calendar' ? (
        /* Calendar Grid View */
        <div className="bg-white border border-surface-200 rounded-[10px] overflow-hidden shadow-xs animate-in fade-in duration-300 w-full max-w-full md:max-w-[450px] md:mx-auto">
          {/* Calendar Header / Navigation */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-50 border-b border-surface-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevMonthDisabled}
              className="p-1.5 rounded-full hover:bg-surface-100 text-surface-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold w-32 text-center text-surface-900 capitalize tracking-wide">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              className="p-1.5 rounded-full hover:bg-surface-100 text-surface-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Weekdays Labels */}
          <div className="grid grid-cols-7 gap-1 px-3 py-2 text-center border-b border-surface-100 bg-surface-50/30">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((wd, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] font-bold uppercase text-surface-400 tracking-wider">
                {wd.substring(0, 3)}
              </span>
            ))}
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 gap-1.5 p-3">
            {calendarCells.map((cell, idx) => {
              const meta = getDayMeta(cell.dateStr, cell.dateObj);
              const isSelected = selectedDate === cell.dateStr;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  disabled={meta.isPast}
                  onClick={() => {
                    if (!meta.isPast) {
                      onDateChange(cell.dateStr);
                      onTimeChange('');
                    }
                  }}
                  className={`
                    relative flex flex-col items-center justify-center h-11 sm:h-12 w-full rounded-[10px] transition-all duration-200 select-none border-2
                    ${meta.isPast
                      ? 'bg-surface-50 border-surface-50 text-surface-300 cursor-not-allowed opacity-40'
                      : isSelected
                        ? 'bg-surface-900 border-surface-900 text-white shadow-md font-bold'
                        : meta.isAvailable
                          ? isToday
                            ? 'bg-white border-surface-900 text-surface-800 hover:border-surface-900'
                            : 'bg-white border-surface-200 text-surface-800 hover:border-surface-900'
                          : isToday
                            ? 'bg-surface-50 border-surface-900 text-surface-400 cursor-not-allowed opacity-50'
                            : 'bg-surface-50 border-surface-100 text-surface-400 cursor-not-allowed opacity-50'
                    }
                    ${!cell.isCurrentMonth && !meta.isPast && !isSelected ? 'opacity-40 text-surface-400' : ''}
                  `}
                >
                  {/* Day Number */}
                  <span className={`text-sm sm:text-base font-black leading-none ${
                    isSelected ? 'text-white' : isToday ? 'text-surface-900' : ''
                  }`}>
                    {cell.dayNum}
                  </span>

                  {/* Availability Dot indicator */}
                  {!meta.isPast && meta.isAvailable && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                      isSelected
                        ? 'bg-white'
                        : meta.slotCount >= 3
                          ? 'bg-emerald-500'
                          : meta.slotCount >= 2
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Color Legend */}
          <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 bg-surface-50/50 border-t border-surface-150 text-[10px] sm:text-xs text-surface-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> High Availability (3+ slots)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Limited Availability (2 slots)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Last Slots Remaining (1 slot)
            </span>
          </div>
        </div>
      ) : (
        /* Weekly Strip View (Original Layout) */
        <div className="relative group animate-in fade-in duration-300">
          {/* Left Arrow */}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-[10px] bg-white border border-surface-200 shadow-md hover:bg-surface-50 items-center justify-center text-surface-500 hover:text-surface-900 transition cursor-pointer hidden sm:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Scrollable Date Cards */}
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth px-1 py-1"
          >
            {daysList.map((day) => {
              const meta = getDayMeta(day.dateStr, day.dateObj);
              const isSelected = selectedDate === day.dateStr;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  data-date={day.dateStr}
                  type="button"
                  disabled={meta.isPast}
                  onClick={() => {
                    if (!meta.isPast) {
                      onDateChange(day.dateStr);
                      onTimeChange('');
                    }
                  }}
                  className={`
                    flex flex-col items-center justify-center snap-start
                    min-w-[60px] sm:min-w-[66px] h-[82px] sm:h-[88px]
                    rounded-[10px] border-2 transition-all duration-200 select-none
                    ${meta.isPast
                      ? 'bg-surface-50 border-surface-100 text-surface-300 cursor-not-allowed opacity-40'
                      : isSelected
                        ? 'bg-surface-900 border-surface-900 text-white shadow-lg cursor-pointer'
                        : meta.isAvailable
                          ? isToday
                            ? 'bg-white border-surface-900 text-surface-800 hover:border-surface-900 hover:shadow-sm cursor-pointer'
                            : 'bg-white border-surface-200 text-surface-800 hover:border-surface-900 hover:shadow-sm cursor-pointer'
                          : isToday
                            ? 'bg-surface-50 border-surface-900 text-surface-400 cursor-not-allowed opacity-50'
                            : 'bg-surface-50 border-surface-150 text-surface-400 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {/* Weekday */}
                  <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase leading-none ${
                    isSelected ? 'text-surface-400' : 'text-surface-400'
                  }`}>
                    {day.weekday}
                  </span>

                  {/* Day Number */}
                  <span className={`text-xl sm:text-2xl font-black leading-none mt-1 ${
                    isSelected ? 'text-white' : isToday ? 'text-surface-900' : ''
                  }`}>
                    {day.day}
                  </span>

                  {/* Month + availability dot */}
                  <span className="flex items-center gap-1 mt-1.5">
                    <span className={`text-[9px] sm:text-[10px] font-semibold leading-none ${
                      isSelected ? 'text-surface-400' : 'text-surface-400'
                    }`}>
                      {day.month}
                    </span>
                    {!meta.isPast && meta.isAvailable && !isSelected && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        meta.slotCount >= 3 ? 'bg-emerald-500' : meta.slotCount >= 2 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                    )}
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-[10px] bg-white border border-surface-200 shadow-md hover:bg-surface-50 items-center justify-center text-surface-500 hover:text-surface-900 transition cursor-pointer hidden sm:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected date summary */}
      {selectedDate && (
        <div className="bg-surface-50 border border-surface-200 rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in slide-in-from-top-2 duration-300">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase text-surface-900 tracking-widest">
              Your Selection
            </div>
            <div className="text-xs sm:text-sm font-bold text-surface-900 mt-0.5">
              {formatHumanDate(selectedDate)}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-surface-500 mt-0.5">
              {selectedTime
                ? `${selectedTime} • ${bookingModeLabel(selectedMode)}`
                : 'No time slot picked yet'}
            </div>
          </div>
          {selectedTime && (
            <button
              type="button"
              onClick={() => onTimeChange('')}
              className="min-h-[32px] px-4 py-1.5 bg-white border-[2px] border-surface-200 inline-flex items-center text-sm font-semibold text-brand hover:border-brand transition-colors cursor-pointer self-start sm:self-auto rounded-[8px] active:scale-[0.98]"
            >
              Clear Time
            </button>
          )}
        </div>
      )}

      {/* Errors */}
      {(errors.date || errors.time) && (
        <div className="min-h-[20px] text-center pt-2">
          {errors.date && <p className="text-sm font-medium text-rose-500" role="alert">{errors.date}</p>}
          {errors.time && <p className="text-sm font-medium text-rose-500" role="alert">{errors.time}</p>}
        </div>
      )}
    </div>
  );
}
