import { useMemo, useState } from 'react';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
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

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [time, meridiem] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getTimeBucket(timeStr) {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17 * 60) return 'afternoon';
  return 'evening';
}

const BUCKET_META = {
  morning: { label: 'Morning', color: 'text-amber-500' },
  afternoon: { label: 'Afternoon', color: 'text-sky-500' },
  evening: { label: 'Evening', color: 'text-indigo-500' }
};

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

function buildCalendarMonth(viewYear, viewMonth) {
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    cells.push({
      day: d,
      dateObj: date,
      dateStr: toLocalDateString(date)
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
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

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxAdvanceDays);
    return d;
  }, [today, maxAdvanceDays]);

  const cells = useMemo(() => buildCalendarMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const raw = getAvailableSlotsForDate ? getAvailableSlotsForDate(selectedDate) : [];
    return raw
      .filter(t => !isSlotInPast(t, selectedDate))
      .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
  }, [selectedDate, getAvailableSlotsForDate]);

  const groupedSlots = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    slotsForSelectedDate.forEach(slot => {
      groups[getTimeBucket(slot)].push(slot);
    });
    return groups;
  }, [slotsForSelectedDate]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

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

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onDateChange(todayStr);
    onTimeChange('');
  };

  const goToTomorrow = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setViewYear(tomorrow.getFullYear());
    setViewMonth(tomorrow.getMonth());
    onDateChange(tomorrowStr);
    onTimeChange('');
  };

  const goToWeekend = () => {
    const sat = getNextWeekdayDate(6, today);
    setViewYear(sat.getFullYear());
    setViewMonth(sat.getMonth());
    onDateChange(weekendStr);
    onTimeChange('');
  };

  const goToNextWeek = () => {
    const next = new Date(today);
    next.setDate(next.getDate() + 7);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    onDateChange(nextWeekStr);
    onTimeChange('');
  };

  const getDayMeta = (cell) => {
    if (!cell) return { isPast: true, isToday: false, isAvailable: false, slotCount: 0 };
    const isPast = cell.dateStr < todayStr;
    const isToday = cell.dateStr === todayStr;
    const isBeyondMax = cell.dateObj > maxDate;
    let slotCount = 0;
    let isAvailable = false;
    if (!isPast && !isBeyondMax && getAvailableSlotsForDate) {
      const slots = getAvailableSlotsForDate(cell.dateStr)
        .filter(t => !isSlotInPast(t, cell.dateStr));
      slotCount = slots.length;
      isAvailable = slotCount > 0;
    }
    return { isPast: isPast || isBeyondMax, isToday, isAvailable, slotCount };
  };

  const isPrevDisabled = (() => {
    if (viewYear < today.getFullYear()) return false;
    if (viewYear > today.getFullYear()) return true;
    return viewMonth <= today.getMonth();
  })();

  const getChipClass = (targetStr) => {
    const isSelected = selectedDate === targetStr;
    const base = "snap-start shrink-0 px-3.5 min-h-[40px] sm:min-h-[36px] rounded-full text-[11px] font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center border";
    if (isSelected) {
      return `${base} bg-brand border-brand text-zinc-900 shadow-md ring-2 ring-brand/30 scale-105`;
    }
    return `${base} bg-white border-zinc-200 text-zinc-700 hover:border-brand/40 hover:bg-brand/5`;
  };

  return (
    <div className="space-y-5">
      {/* Quick-jump chips */}
      <div className="flex flex-wrap gap-2 w-full">
        <button
          type="button"
          onClick={goToToday}
          className={getChipClass(todayStr)}
        >
          Today
        </button>
        <button
          type="button"
          onClick={goToTomorrow}
          className={getChipClass(tomorrowStr)}
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={goToWeekend}
          className={getChipClass(weekendStr)}
        >
          This Weekend
        </button>
        <button
          type="button"
          onClick={goToNextWeek}
          className={getChipClass(nextWeekStr)}
        >
          Next Week
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              type="button"
              onClick={goToPrevMonth}
              disabled={isPrevDisabled}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-bold text-base"
              aria-label="Previous month"
            >
              ←
            </button>
            <div className="text-center">
              <div className="text-xs sm:text-base font-extrabold text-zinc-900 uppercase tracking-wide truncate max-w-[140px] sm:max-w-none">
                {MONTH_LABELS[viewMonth]}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                {viewYear}
              </div>
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl sm:rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition cursor-pointer font-bold text-base"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {WEEKDAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }
              const meta = getDayMeta(cell);
              const isSelected = selectedDate === cell.dateStr;
              const baseClasses = 'w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 border';
              let stateClasses = 'bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed';
              if (!meta.isPast) {
                if (isSelected) {
                  stateClasses = 'bg-gradient-brand border-transparent text-zinc-955 font-black shadow-md ring-2 ring-brand/30 scale-105 cursor-pointer';
                } else if (meta.isAvailable) {
                  stateClasses = 'bg-white border-zinc-200 text-zinc-800 hover:border-brand/50 hover:bg-brand/5 cursor-pointer';
                } else {
                  stateClasses = 'bg-zinc-50/40 border-zinc-100 text-zinc-400 cursor-not-allowed';
                }
              }

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={meta.isPast}
                  onClick={() => {
                    if (meta.isPast) return;
                    onDateChange(cell.dateStr);
                    onTimeChange('');
                  }}
                  className={`${baseClasses} ${stateClasses} relative`}
                  aria-label={`${cell.dateStr}${meta.isAvailable ? `, ${meta.slotCount} slots available` : ''}`}
                >
                  <span className={`leading-none ${meta.isToday && !isSelected ? 'underline decoration-brand decoration-2 underline-offset-2' : ''}`}>
                    {cell.day}
                  </span>
                  {!meta.isPast && meta.isAvailable && !isSelected && (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {meta.slotCount >= 3 ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        </>
                      ) : meta.slotCount === 2 ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                        </>
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-rose-500" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 mt-3 border-t border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 3+ slots
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> 1-2 slots
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Last slot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gradient-brand" /> Selected
            </span>
          </div>
        </div>

        {/* Time slots */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700">
                Available Time Slots
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-brand-dark bg-brand-light border border-brand/20 px-2 py-0.5 rounded tracking-widest uppercase font-mono">
              1 Hour
            </span>
          </div>

          {selectedDate ? (
            slotsForSelectedDate.length > 0 ? (
              <div className="space-y-4 max-h-[320px] sm:max-h-[420px] overflow-y-auto pr-1">
                {['morning', 'afternoon', 'evening'].map(bucket => {
                  const items = groupedSlots[bucket];
                  if (!items || items.length === 0) return null;
                  const meta = BUCKET_META[bucket];
                  return (
                    <div key={bucket} className="space-y-2">
                      <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${meta.color}`}>
                        <span>{meta.label}</span>
                        <span className="text-zinc-400">({items.length})</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {items.map(time => {
                          const isSelected = selectedTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => onTimeChange(time)}
                              className={`min-h-[48px] py-2.5 px-2 text-[11px] uppercase font-bold border rounded-lg transition cursor-pointer text-center ${
                                isSelected
                                  ? 'bg-gradient-brand text-zinc-955 border-transparent shadow-xs font-black ring-1 ring-brand/40'
                                  : 'bg-white border-zinc-200 text-zinc-700 hover:border-brand/40 hover:bg-brand/5'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">
                  No Slots Available
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed px-4">
                  No advisors have availability on {formatHumanDate(selectedDate)}. Try a different day.
                </p>
              </div>
            )
          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">
                Pick a Date First
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed px-4">
                Select a day on the calendar to see available 1-hour time slots.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected summary */}
      {selectedDate && (
        <div className="bg-gradient-to-br from-brand/8 via-white to-brand-accent/8 border border-brand/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3 text-left">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-dark">
                Your Selection
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-zinc-900 mt-0.5">
                {formatHumanDate(selectedDate)}
              </div>
              <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
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
              className="min-h-[36px] px-3 inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 hover:text-rose-600 transition cursor-pointer self-start sm:self-auto"
            >
              Clear Time
            </button>
          )}
        </div>
      )}

      {(errors.date || errors.time) && (
        <div className="space-y-1">
          {errors.date && <p className="text-[11px] text-rose-500 font-bold" role="alert">{errors.date}</p>}
          {errors.time && <p className="text-[11px] text-rose-500 font-bold" role="alert">{errors.time}</p>}
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
