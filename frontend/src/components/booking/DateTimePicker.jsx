import { useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Auto-scroll selected date card into view
  useEffect(() => {
    if (selectedDate && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-date="${selectedDate}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  const getChipClass = (targetStr) => {
    const isSelected = selectedDate === targetStr;
    const base = "shrink-0 px-3 min-h-[34px] rounded-full text-[11px] font-semibold capitalize transition-all duration-200 cursor-pointer flex items-center border";
    if (isSelected) {
      return `${base} bg-zinc-900 border-zinc-900 text-white shadow-sm`;
    }
    return `${base} bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50`;
  };

  const handleQuickJump = (dateStr) => {
    onDateChange(dateStr);
    onTimeChange('');
  };

  return (
    <div className="space-y-4">
      {/* Quick-jump chips */}
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => handleQuickJump(todayStr)} className={getChipClass(todayStr)}>Today</button>
        <button type="button" onClick={() => handleQuickJump(tomorrowStr)} className={getChipClass(tomorrowStr)}>Tomorrow</button>
        <button type="button" onClick={() => handleQuickJump(weekendStr)} className={getChipClass(weekendStr)}>Weekend</button>
        <button type="button" onClick={() => handleQuickJump(nextWeekStr)} className={getChipClass(nextWeekStr)}>Next Week</button>
      </div>

      {/* Calendar Card Strip */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-50 items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer hidden sm:flex"
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
                  rounded-xl border-2 transition-all duration-200 select-none
                  ${meta.isPast
                    ? 'bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed opacity-40'
                    : isSelected
                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg scale-[1.04] cursor-pointer'
                      : meta.isAvailable
                        ? 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-900 hover:shadow-sm cursor-pointer'
                        : 'bg-zinc-50 border-zinc-150 text-zinc-350 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {/* Weekday */}
                <span className={`text-[9px] sm:text-[10px] font-bold tracking-widest uppercase leading-none ${
                  isSelected ? 'text-zinc-400' : 'text-zinc-400'
                }`}>
                  {day.weekday}
                </span>

                {/* Day Number */}
                <span className={`text-xl sm:text-2xl font-black leading-none mt-1 ${
                  isSelected ? 'text-white' : isToday ? 'text-zinc-900' : ''
                }`}>
                  {day.day}
                </span>

                {/* Month + availability dot */}
                <span className="flex items-center gap-1 mt-1.5">
                  <span className={`text-[9px] sm:text-[10px] font-semibold leading-none ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-450'
                  }`}>
                    {day.month}
                  </span>
                  {!meta.isPast && meta.isAvailable && !isSelected && (
                    <span className={`w-1 h-1 rounded-full shrink-0 ${
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
          className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-md hover:bg-zinc-50 items-center justify-center text-zinc-500 hover:text-zinc-800 transition cursor-pointer hidden sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selected date summary */}
      {selectedDate && (
        <div className="bg-gradient-to-br from-brand/8 via-white to-brand-accent/8 border border-brand/20 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in slide-in-from-top-2 duration-300">
          <div className="text-left">
            <div className="text-[10px] font-semibold capitalize text-brand-dark tracking-wide">
              Your Selection
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5">
              {formatHumanDate(selectedDate)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {selectedTime
                ? `${selectedTime} • ${bookingModeLabel(selectedMode)}`
                : 'No time slot picked yet'}
            </div>
          </div>
          {selectedTime && (
            <button
              type="button"
              onClick={() => onTimeChange('')}
              className="min-h-[32px] px-3 inline-flex items-center text-[11px] font-semibold text-zinc-500 hover:text-rose-600 transition cursor-pointer self-start sm:self-auto"
            >
              Clear Time
            </button>
          )}
        </div>
      )}

      {/* Errors */}
      {(errors.date || errors.time) && (
        <div className="space-y-1">
          {errors.date && <p className="text-xs text-rose-500 font-bold" role="alert">{errors.date}</p>}
          {errors.time && <p className="text-xs text-rose-500 font-bold" role="alert">{errors.time}</p>}
        </div>
      )}
    </div>
  );
}
