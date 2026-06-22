import React from 'react';
import { Save } from 'lucide-react';
import { DAYS_OF_WEEK } from '../constants';

const AvailabilityTab = ({
  activeDays,
  toggleDay,
  allSlots,
  availableSlots,
  setAvailableSlots,
  handleRemoveSlot,
  customHour,
  setCustomHour,
  customMinute,
  setCustomMinute,
  customPeriod,
  setCustomPeriod,
  handleAddCustomSlot,
  fromHour,
  setFromHour,
  fromMinute,
  setFromMinute,
  fromPeriod,
  setFromPeriod,
  toHour,
  setToHour,
  toMinute,
  setToMinute,
  toPeriod,
  setToPeriod,
  setSlotError,
  addTimeRangeSlots,
  isAvailabilitySaved,
  handleAvailabilitySave
}) => {
  const shadowStyle = {
    background: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
  };

  return (
    <form onSubmit={handleAvailabilitySave} className="space-y-6 animate-in fade-in duration-200 text-sm">
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center">
        <h3 className="text-sm font-bold capitalize text-zinc-500">Manage Slot Availability</h3>
        <span className="text-sm text-zinc-400 font-medium">Set Standard Hours</span>
      </div>

      <div className="space-y-6 text-left font-medium p-5 rounded-xl transition-all" style={shadowStyle}>
        {/* Select Days */}
        <div className="space-y-2.5">
          <label className="text-zinc-600 capitalize font-bold block text-xs tracking-wide">Active Operational Days</label>
          <div className="flex flex-wrap gap-2.5">
            {DAYS_OF_WEEK.map(day => {
              const active = activeDays[day.index];
              return (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => toggleDay(day.index)}
                  className={`px-4 py-2 border rounded-lg text-sm font-bold capitalize transition-all duration-300 cursor-pointer ${active
                    ? 'bg-brand border-brand text-zinc-950 shadow-sm'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100'
                    }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Timings Checkbox */}
        <div className="space-y-3 pt-5 border-t border-zinc-100">
          <label className="text-zinc-600 capitalize font-bold block text-xs tracking-wide">Select Active Timing Slots</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allSlots.map(slot => {
              const exists = availableSlots.includes(slot);
              return (
                <div key={slot} className="flex items-center gap-2 w-full group">
                  <button
                    type="button"
                    onClick={() => {
                      if (exists) {
                        setAvailableSlots(prev => prev.filter(s => s !== slot));
                      } else {
                        setAvailableSlots(prev => [...prev, slot]);
                      }
                    }}
                    className={`flex-1 p-2.5 border rounded-lg text-center font-bold transition-all cursor-pointer text-sm ${exists
                      ? 'bg-brand/10 border-brand text-brand'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                      }`}
                  >
                    {slot}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 text-zinc-400 hover:text-rose-500 rounded-lg text-sm font-bold capitalize transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                    title="Remove Slot"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            {allSlots.length === 0 && (
              <div className="col-span-1 sm:col-span-2 py-5 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-zinc-400 italic text-sm text-center w-full">
                No timing slots configured. Use the controls below to add custom slots or generate from a time range.
              </div>
            )}
          </div>
        </div>

        {/* Custom Timings Adder */}
        <div className="space-y-3 pt-5 border-t border-zinc-100">
          <label className="text-zinc-600 capitalize font-bold block text-xs tracking-wide">Add Custom Timing Slot</label>
          <div className="flex gap-2 items-end max-w-sm">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-zinc-500 font-semibold block">Hour</label>
              <select
                value={customHour}
                onChange={(e) => setCustomHour(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer"
              >
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-zinc-500 font-semibold block">Minute</label>
              <select
                value={customMinute}
                onChange={(e) => setCustomMinute(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer"
              >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs text-zinc-500 font-semibold block">AM/PM</label>
              <select
                value={customPeriod}
                onChange={(e) => setCustomPeriod(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddCustomSlot}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-sm font-bold capitalize rounded-lg transition-colors cursor-pointer shrink-0 h-[38px] flex items-center justify-center shadow-sm"
            >
              Add Slot
            </button>
          </div>
        </div>

        {/* Custom Time Range Adder */}
        <div className="space-y-3 pt-5 border-t border-zinc-100">
          <label className="text-zinc-600 capitalize font-bold block text-xs tracking-wide">Generate Slots from Time Range</label>
          <div className="flex flex-col gap-3 max-w-sm p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="flex gap-2 items-end">
              <span className="text-xs text-zinc-500 font-bold pb-2 uppercase tracking-wider w-10 text-left">From:</span>
              <div className="flex-1 space-y-1">
                <select
                  value={fromHour}
                  onChange={(e) => setFromHour(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <select
                  value={fromMinute}
                  onChange={(e) => setFromMinute(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <select
                  value={fromPeriod}
                  onChange={(e) => setFromPeriod(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <span className="text-xs text-zinc-500 font-bold pb-2 uppercase tracking-wider w-10 text-left">To:</span>
              <div className="flex-1 space-y-1">
                <select
                  value={toHour}
                  onChange={(e) => setToHour(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <select
                  value={toMinute}
                  onChange={(e) => setToMinute(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <select
                  value={toPeriod}
                  onChange={(e) => setToPeriod(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand cursor-pointer shadow-sm"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSlotError('');
                const fromStr = `${fromHour}:${fromMinute} ${fromPeriod}`;
                const toStr = `${toHour}:${toMinute} ${toPeriod}`;
                addTimeRangeSlots(fromStr, toStr, false);
              }}
              className="w-full mt-2 bg-white hover:bg-zinc-100 text-zinc-900 py-2.5 text-sm font-bold capitalize rounded-lg transition-colors border border-zinc-200 cursor-pointer flex items-center justify-center shadow-sm"
            >
              Generate Hourly Slots
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isAvailabilitySaved ? (
            <span className="text-sm text-emerald-600 font-bold capitalize flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              Availability Matrix Synchronized!
            </span>
          ) : <span />}
          <button
            type="submit"
            className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-zinc-950 px-8 py-2.5 text-sm font-bold capitalize rounded-lg shadow-sm border-none cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Slots Matrix
          </button>
        </div>
      </div>
    </form>
  );
};

export default AvailabilityTab;
