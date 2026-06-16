import { useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getLocalTodayString(), []);
  
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxAdvanceDays);
    return d;
  }, [today, maxAdvanceDays]);

  const tomorrowStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return toLocalDateString(d);
  }, [today]);

  const weekendStr = useMemo(() => {
    const d = getNextWeekdayDate(6, today);
    return toLocalDateString(d);
  }, [today]);

  const nextWeekStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return toLocalDateString(d);
  }, [today]);

  // Generate full list of days
  const daysList = useMemo(() => {
    const list = [];
    const temp = new Date(today);
    temp.setHours(0, 0, 0, 0);
    
    for (let i = 0; i <= maxAdvanceDays; i++) {
      const d = new Date(temp);
      d.setDate(temp.getDate() + i);
      list.push({
        dateObj: d,
        dateStr: toLocalDateString(d)
      });
    }
    return list;
  }, [today, maxAdvanceDays]);

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

  // Scroll active date card into center of ribbon view when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const activeEl = document.querySelector(`[data-date="${selectedDate}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  const getChipClass = (targetStr) => {
    const isSelected = selectedDate === targetStr;
    const base = "snap-start shrink-0 px-3.5 min-h-[36px] rounded-full text-xs font-semibold capitalize transition-all duration-200 cursor-pointer flex items-center border";
    if (isSelected) {
      return `${base} bg-brand border-brand text-zinc-900 shadow-md ring-2 ring-brand/20 scale-105`;
    }
    return `${base} bg-white border-zinc-200 text-zinc-700 hover:border-brand/40 hover:bg-brand/5`;
  };

  return (
    <div className="space-y-4">
      {/* Quick-jump chips */}
      <div className="flex flex-wrap gap-2 w-full">
        <button
          type="button"
          onClick={() => {
            onDateChange(todayStr);
            onTimeChange('');
          }}
          className={getChipClass(todayStr)}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            onDateChange(tomorrowStr);
            onTimeChange('');
          }}
          className={getChipClass(tomorrowStr)}
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={() => {
            onDateChange(weekendStr);
            onTimeChange('');
          }}
          className={getChipClass(weekendStr)}
        >
          This Weekend
        </button>
        <button
          type="button"
          onClick={() => {
            onDateChange(nextWeekStr);
            onTimeChange('');
          }}
          className={getChipClass(nextWeekStr)}
        >
          Next Week
        </button>
      </div>

      {/* Horizontal Date Ribbon Container */}
      <div className="bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 shadow-xs relative group">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('date-ribbon');
            if (el) el.scrollBy({ left: -220, behavior: 'smooth' });
          }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-zinc-250 shadow-sm hover:bg-zinc-50 flex items-center justify-center text-zinc-650 transition cursor-pointer md:flex hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable strip */}
        <div
          id="date-ribbon"
          className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1.5 px-0.5 scroll-smooth"
        >
          {daysList.map((day) => {
            const meta = getDayMeta(day.dateStr, day.dateObj);
            const isSelected = selectedDate === day.dateStr;
            const weekday = day.dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = day.dateObj.getDate();
            const month = day.dateObj.toLocaleDateString('en-US', { month: 'short' });

            const baseClasses = "flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 min-w-[58px] sm:min-w-[62px] h-[78px] sm:h-[82px] snap-start select-none cursor-pointer";
            let stateClasses = "";

            if (meta.isPast) {
              stateClasses = "bg-zinc-50 border-zinc-100 text-zinc-300 opacity-40 cursor-not-allowed";
            } else if (isSelected) {
              stateClasses = "bg-zinc-900 border-zinc-900 text-white font-bold shadow-md scale-105";
            } else if (meta.isAvailable) {
              stateClasses = "bg-white border-zinc-255 text-zinc-850 hover:border-brand hover:bg-brand/5";
            } else {
              stateClasses = "bg-zinc-50 border-zinc-150 text-zinc-400 opacity-60 cursor-not-allowed";
            }

            return (
              <button
                key={day.dateStr}
                data-date={day.dateStr}
                type="button"
                disabled={meta.isPast || (!meta.isAvailable && !isSelected)}
                onClick={() => {
                  onDateChange(day.dateStr);
                  onTimeChange('');
                }}
                className={`${baseClasses} ${stateClasses}`}
                aria-label={`${day.dateStr}${meta.isAvailable ? `, ${meta.slotCount} slots available` : ''}`}
              >
                {/* Weekday name */}
                <span className={`text-[9px] uppercase tracking-wider font-semibold ${isSelected ? 'text-brand' : 'text-zinc-400'}`}>
                  {weekday}
                </span>
                
                {/* Day Number */}
                <span className="text-base sm:text-lg font-black tracking-tight mt-0.5 leading-none">
                  {dayNum}
                </span>

                {/* Month Name / Availability dot */}
                <span className="text-[9px] font-semibold mt-1.5 flex items-center gap-1">
                  <span>{month}</span>
                  {meta.isAvailable && !isSelected && (
                    <span className={`w-1 h-1 rounded-full ${
                      meta.slotCount >= 3 ? 'bg-emerald-500' : meta.slotCount === 2 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('date-ribbon');
            if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-zinc-250 shadow-sm hover:bg-zinc-50 flex items-center justify-center text-zinc-650 transition cursor-pointer md:flex hidden"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selected summary info */}
      {selectedDate && (
        <div className="bg-gradient-to-br from-brand/8 via-white to-brand-accent/8 border border-brand/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3 text-left">
            <div>
              <div className="text-xs font-semibold capitalize text-brand-dark">
                Your Selection
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-900 mt-0.5">
                {formatHumanDate(selectedDate)}
              </div>
              <div className="text-xs text-zinc-650 mt-0.5">
                {selectedTime
                  ? `${selectedTime} • ${bookingModeLabel(selectedMode)}`
                  : 'No time slot picked yet'}
              </div>
            </div>
          </div>
          {selectedTime && (
            <button
              type="button"
              onClick={() => onTimeChange('')}
              className="min-h-[36px] px-3 inline-flex items-center text-xs font-semibold capitalize text-zinc-500 hover:text-rose-600 transition cursor-pointer self-start sm:self-auto"
            >
              Clear Time
            </button>
          )}
        </div>
      )}

      {(errors.date || errors.time) && (
        <div className="space-y-1">
          {errors.date && <p className="text-xs text-rose-500 font-bold" role="alert">{errors.date}</p>}
          {errors.time && <p className="text-xs text-rose-500 font-bold" role="alert">{errors.time}</p>}
        </div>
      )}
    </div>
  );
}

function bookingModeLabel(mode) {
  if (mode === 'DOOR_STEP') return 'Doorstep visit';
  if (mode === 'OFFLINE') return 'In-center visit';
  return 'Online video session';
}
