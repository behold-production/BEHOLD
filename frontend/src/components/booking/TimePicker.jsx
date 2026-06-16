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
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold capitalize text-zinc-700">
            Available Time Slots
          </span>
        </div>
        <span className="text-xs font-semibold text-brand-dark bg-brand-light border border-brand/20 px-2 py-0.5 rounded capitalize">
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
                  <div className={`flex items-center gap-1.5 text-xs font-semibold capitalize ${meta.color}`}>
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
                          className={`min-h-[48px] py-2.5 px-2 text-xs capitalize font-bold border rounded-lg transition cursor-pointer text-center ${
                            isSelected
                              ? 'bg-gradient-brand text-zinc-955 border-transparent shadow-xs font-bold ring-1 ring-brand/40'
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
            <p className="text-xs font-semibold text-rose-600 capitalize">
              No Slots Available
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed px-4">
              No advisors have availability on {formatHumanDate(selectedDate)}. Try a different day.
            </p>
          </div>
        )
      ) : (
        <div className="py-10 text-center space-y-2">
          <p className="text-xs font-semibold text-zinc-500 capitalize">
            Pick an Advisor First
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed px-4">
            Select an advisor to see available 1-hour time slots.
          </p>
        </div>
      )}
      
      {errors.time && <p className="text-xs text-rose-500 font-bold mt-2" role="alert">{errors.time}</p>}
    </div>
  );
}
