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

export default function TimePicker({
  selectedDate,
  selectedTime,
  onTimeChange,
  availableSlots = [],
  bookedSlots = [],
  errors = {}
}) {
  const groupedSlots = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    availableSlots.forEach(slot => {
      groups[getTimeBucket(slot)].push(slot);
    });
    return groups;
  }, [availableSlots]);

  return (
    <div className="bg-transparent sm:bg-white border-0 sm:border border-surface-200 rounded-none p-0 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-3 border-b border-surface-200 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-surface-900">
            Available Time Slots
          </span>
        </div>
        <span className="text-[9px] font-black text-surface-900 bg-surface-100 border border-surface-200 px-2 py-0.5 rounded-none uppercase tracking-widest">
          1 Hour
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
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${meta.color}`}>
                    <span>{meta.label}</span>
                    <span className="text-surface-400 normal-case">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {items.map(time => {
                      const isSelected = selectedTime === time;
                      const isBooked = bookedSlots && bookedSlots.includes(time);
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
                          className={`min-h-[48px] py-2.5 px-2 text-xs font-bold uppercase tracking-widest border rounded-none transition cursor-pointer text-center ${
                            isSelected
                              ? 'bg-surface-900 text-white border-surface-900'
                              : isBooked
                                ? 'bg-surface-50 border-surface-200 text-surface-400 cursor-not-allowed opacity-60'
                                : 'bg-white border-surface-200 text-surface-700 hover:border-surface-400 hover:bg-surface-50'
                          }`}
                        >
                          {time}
                          {isBooked && <span className="block text-[8px] text-rose-500 font-semibold mt-0.5">Booked</span>}
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
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
              No Slots Available
            </p>
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest leading-relaxed px-4 mt-2">
              No advisors have availability on {formatHumanDate(selectedDate)}. Try a different day.
            </p>
          </div>
        )
      ) : (
        <div className="py-10 text-center space-y-2">
          <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
            Pick an Advisor First
          </p>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-relaxed px-4 mt-2">
            Select an advisor to see available 1-hour time slots.
          </p>
        </div>
      )}
      
      {errors.time && <p className="text-[9.5px] uppercase tracking-widest text-rose-500 font-bold mt-2" role="alert">{errors.time}</p>}
    </div>
  );
}
