import { useMemo } from 'react';

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
  availableSlots = [],
  bookedSlots = [],
  errors = {},
  bookingDuration = 60
}) {
  const groupedSlots = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    availableSlots.forEach(slot => {
      groups[getTimeBucket(slot)].push(slot);
    });
    return groups;
  }, [availableSlots]);

  return (
    <div className="bg-transparent sm:bg-white border-0 sm:border border-surface-200 rounded-[10px] p-0 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-3 border-b border-surface-200 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-surface-900">
            Available Time Slots
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-2.5 py-1 rounded-[10px] tracking-wider uppercase">
          {bookingDuration === 30 ? '30 Mins (Half Session)' : '1 Hour (Full Session)'}
        </span>
      </div>

      {selectedDate ? (
        availableSlots.length > 0 ? (
          <div className="space-y-4 max-h-[320px] sm:max-h-[420px] overflow-y-auto pr-1">
            {['morning', 'afternoon', 'evening'].map(bucket => {
              const items = groupedSlots[bucket];
              if (!items || items.length === 0) return null;
              const meta = BUCKET_META[bucket];
              return (
                <div key={bucket} className="space-y-2">
                  <div className={`flex items-center gap-1.5 text-xs font-bold tracking-widest ${meta.color}`}>
                    <span>{meta.label}</span>
                    <span className="text-surface-400 normal-case">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                    {items.map(time => {
                      const isSelected = selectedTime === time;
                      const isBooked = bookedSlots && bookedSlots.includes(time);
                      const intervalText = getTimeIntervalLabel(time, bookingDuration);

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (isBooked) {
                              import('react-hot-toast').then(mod => mod.toast.error("This time slot is already booked by another user."));
                              return;
                            }
                            onTimeChange(time);
                          }}
                          className={`py-2.5 px-2 text-[10.5px] xs:text-xs sm:text-[11.5px] font-bold border rounded-xl transition cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 min-h-[44px] ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-[#00c9d6]/40'
                              : isBooked
                              ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold whitespace-nowrap">{intervalText}</span>
                          {isBooked ? (
                            <span className="text-[9px] text-rose-500 font-extrabold uppercase tracking-wider bg-rose-50 px-1.5 py-0.2 rounded">Booked</span>
                          ) : isSelected ? (
                            <span className="text-[9px] text-[#00c9d6] font-extrabold uppercase tracking-wider bg-white/10 px-1.5 py-0.2 rounded">Selected ✓</span>
                          ) : null}
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
 <p className="text-[10px] font-black text-rose-600 tracking-widest">
 No Slots Available
 </p>
 <p className="text-[10px] font-bold text-surface-500 tracking-widest leading-relaxed px-4 mt-2">
 No advisors have availability on {formatHumanDate(selectedDate)}. Try a different day.
 </p>
 </div>
 )
 ) : (
 <div className="py-10 text-center space-y-2">
 <p className="text-[10px] font-black text-surface-500 tracking-widest">
 Pick an Advisor First
 </p>
 <p className="text-[10px] font-bold text-surface-400 tracking-widest leading-relaxed px-4 mt-2">
 Select an advisor to see available 1-hour time slots.
 </p>
 </div>
 )}
 
 {errors.time && <p className="text-sm font-medium text-rose-500 mt-2" role="alert">{errors.time}</p>}
 </div>
 );
}
