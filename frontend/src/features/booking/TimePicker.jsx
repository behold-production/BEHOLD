import { useMemo } from 'react';
import { Calendar, Clock, Check, AlertCircle, Sun, CloudSun, Moon } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';

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
  morning: { label: 'Morning', icon: Sun, color: 'text-amber-600', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  afternoon: { label: 'Afternoon', icon: CloudSun, color: 'text-sky-600', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200' },
  evening: { label: 'Evening', icon: Moon, color: 'text-indigo-600', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
};

function toLocalDateString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getLocalTodayString() {
  return toLocalDateString(new Date());
}

function getTimeIntervalLabel(timeStr, durationMinutes = 60) {
  if (!timeStr) return '';
  try {
    const [time, meridiem] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const startTotal = hours * 60 + minutes;
    const endTotal = startTotal + (Number(durationMinutes) || 60);

    const formatMins = (totalMins) => {
      let h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
    };

    return `${timeStr} - ${formatMins(endTotal)}`;
  } catch (e) {
    return timeStr;
  }
}

export default function TimePicker({
  selectedDate,
  selectedTime,
  onTimeChange,
  onDateChange,
  availableSlots = [],
  bookedSlots = [],
  errors = {},
  bookingDuration = 60,
  onOpenDatePicker
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => getLocalTodayString(), []);
  const isToday = selectedDate === todayStr;

  // Next 3 quick selectable days for 1-tap switching
  const quickDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const str = toLocalDateString(d);
      let label = 'Today';
      if (i === 1) label = 'Tomorrow';
      else if (i === 2) {
        label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      days.push({
        label,
        dateStr: str,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  }, [today]);

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
              Pick a consultation time that fits your daily routine
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
          Step 3
        </span>
      </div>

      {/* Quick 1-Tap Date Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Choose Appointment Date
          </span>
          {onOpenDatePicker && (
            <button
              type="button"
              onClick={onOpenDatePicker}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Calendar</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickDays.map((qd) => {
            const isSelected = selectedDate === qd.dateStr;
            return (
              <button
                key={qd.dateStr}
                type="button"
                onClick={() => {
                  if (onDateChange) onDateChange(qd.dateStr);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-[#00c9d6] border-slate-900 shadow-sm ring-2 ring-[#00c9d6]/50'
                    : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200/90'
                }`}
              >
                <span className="font-extrabold leading-tight">{qd.label}</span>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {qd.shortDate}
                </span>
              </button>
            );
          })}

          {onOpenDatePicker && (
            <button
              type="button"
              onClick={onOpenDatePicker}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                !quickDays.some(qd => qd.dateStr === selectedDate)
                  ? 'bg-slate-900 text-[#00c9d6] border-slate-900 shadow-sm ring-2 ring-[#00c9d6]/50'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-dashed border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1 font-extrabold text-teal-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>More Dates</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {!quickDays.some(qd => qd.dateStr === selectedDate) ? formatDateString(selectedDate) : 'Browse Month'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Date Indicator Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-1 border-y border-slate-100">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-extrabold uppercase tracking-wider rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Today
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Selected
            </span>
          )}
          <span className="font-bold text-xs sm:text-sm text-slate-900">
            {formatDateString(selectedDate)}
          </span>
        </div>

        <span className="text-xs font-semibold text-slate-600">
          {totalSlotCount > 0 ? (
            <span className="text-emerald-700 font-bold">
              ✓ {totalSlotCount} {totalSlotCount === 1 ? 'Slot' : 'Slots'} Available ({bookingDuration === 30 ? '30m' : '60m'})
            </span>
          ) : (
            <span className="text-rose-500 font-medium">0 Slots Available</span>
          )}
        </span>
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
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${meta.badgeBg}`}>
                    <IconComp className="w-3 h-3" />
                    <span>{meta.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    ({items.length} {items.length === 1 ? 'slot' : 'slots'})
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
                        className={`p-3 rounded-xl font-semibold transition-all duration-200 text-center flex flex-col items-center justify-center gap-0.5 border min-h-[56px] relative overflow-hidden active:scale-95 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#00c9d6]'
                            : isBooked
                            ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                            : 'bg-white hover:bg-teal-50/50 border-slate-200/90 text-slate-800 hover:border-teal-500 hover:shadow-xs cursor-pointer'
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
        /* Empty State with Action */
        <div className="p-8 sm:p-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-sm sm:text-base text-slate-800">
              {isToday
                ? 'No available slots today.'
                : 'No slots available for this date. Please select another date.'}
            </h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isToday
                ? 'All slots for today have been booked or expired. Please select tomorrow or browse the calendar.'
                : 'The psychologist has no available consultation slots on this date.'}
            </p>
          </div>

          {onOpenDatePicker && (
            <button
              type="button"
              onClick={onOpenDatePicker}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-[#00c9d6]" />
              <span>Choose Another Date</span>
            </button>
          )}
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
