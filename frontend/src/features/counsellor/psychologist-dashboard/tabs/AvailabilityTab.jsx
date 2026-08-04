import React from 'react';
import { Save } from 'lucide-react';
import { DAYS_OF_WEEK } from '../counsellorDashboardConstants';

const AvailabilityTab = ({
 activeDays,
 toggleDay,
 daySlots,
 setDaySlots,
 selectedDay,
 setSelectedDay,
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
 slotInterval,
 setSlotInterval,
 addTimeRangeSlots,
 isAvailabilitySaved,
 handleAvailabilitySave,
 applyMultipleDays,
 setApplyMultipleDays,
 rangeStartDay,
 setRangeStartDay,
 rangeEndDay,
 setRangeEndDay
}) => {
 const shadowStyle = {
 background: '#18181b', // zinc-900
 border: '1px solid #27272a', // zinc-800
 boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
 };

 return (
 <form onSubmit={handleAvailabilitySave} className="space-y-6 animate-in fade-in duration-200 text-sm">
 <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
 <h3 className="text-sm font-bold text-zinc-400 font-header">Manage Slot Availability</h3>
 <span className="text-sm text-zinc-500 font-medium">Set Standard Hours</span>
 </div>

 <div className="space-y-6 text-left font-medium p-5 rounded-[10px] transition-all" style={shadowStyle}>
 {/* Select Days */}
 <div className="space-y-2.5">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">Select Day to Manage</label>
 <div className="flex flex-wrap gap-2.5">
 {DAYS_OF_WEEK.map(day => {
 const isSelected = selectedDay === day.index;
 const isActive = activeDays[day.index];
 return (
 <div key={day.index} className="flex flex-col items-center gap-1">
 <button
 type="button"
 onClick={() => setSelectedDay(day.index)}
 className={`px-4 py-2 border rounded-[10px] text-sm font-bold transition-all duration-300 cursor-pointer ${isSelected
 ? 'bg-brand border-brand text-zinc-955 shadow-sm'
 : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:bg-zinc-900'
 }`}
 >
 {day.label}
 </button>
 <button
 type="button"
 onClick={() => toggleDay(day.index)}
 className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors border ${isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
 >
 {isActive ? 'ACTIVE' : 'OFF'}
 </button>
 </div>
 );
 })}
 </div>
 </div>

 {/* Active Timings Checkbox */}
 <div className="space-y-3 pt-5 border-t border-zinc-800">
 <div className="flex justify-between items-center">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">
 Slots for {DAYS_OF_WEEK.find(d => d.index === selectedDay)?.label}
 </label>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {(daySlots[selectedDay] || []).map(slot => {
 const exists = true;
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
 className={`flex-1 p-2.5 border rounded-[10px] text-center font-bold transition-all cursor-pointer text-sm ${exists
 ? 'bg-brand/10 border-brand/40 text-brand'
 : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:bg-zinc-900/60'
 }`}
 >
 {slot}
 </button>
 <button
 type="button"
 onClick={() => handleRemoveSlot(slot)}
 className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 hover:bg-rose-955/20 hover:border-rose-900 text-zinc-400 hover:text-rose-400 rounded-[10px] text-sm font-bold transition-colors cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
 title="Remove Slot"
 >
 Remove
 </button>
 </div>
 );
 })}
 {(!daySlots[selectedDay] || daySlots[selectedDay].length === 0) && (
 <div className="col-span-1 sm:col-span-2 py-5 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-[10px] text-zinc-500 italic text-sm text-center w-full">
 No timing slots configured for this day. Use the controls below to add custom slots or generate from a time range.
 </div>
 )}
 </div>
 </div>

 {/* Custom Timings Adder */}
 <div className="space-y-4 pt-3">
          <label className="text-zinc-400 font-bold block text-xs tracking-wide">Add Custom Timing Slot</label>
          
          <div className="mb-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={applyMultipleDays} 
                onChange={(e) => setApplyMultipleDays(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-950 text-brand focus:ring-brand accent-brand cursor-pointer"
              />
              <span className="text-xs text-zinc-300 font-medium">Apply to multiple days</span>
            </label>
            
            {applyMultipleDays && (
              <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">From Day</label>
                  <select 
                    value={rangeStartDay} 
                    onChange={(e) => setRangeStartDay(e.target.value)}
                    className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map((d, i) => (
                      <option key={d.label} value={d.index}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-zinc-600 text-xs font-bold pt-4">to</div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">To Day</label>
                  <select 
                    value={rangeEndDay} 
                    onChange={(e) => setRangeEndDay(e.target.value)}
                    className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map((d, i) => (
                      <option key={d.label} value={d.index}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 items-end max-w-sm">
 <div className="flex-1 space-y-1.5">
 <label className="text-xs text-zinc-550 font-semibold block">Hour</label>
 <select
 value={customHour}
 onChange={(e) => setCustomHour(e.target.value)}
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer"
 >
 {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
 <option key={h} value={h}>{h}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-1.5">
 <label className="text-xs text-zinc-555 font-semibold block">Minute</label>
 <select
 value={customMinute}
 onChange={(e) => setCustomMinute(e.target.value)}
 className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer"
 >
 {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
 <option key={m} value={m}>{m}</option>
 ))}
 </select>
 </div>
 <div className="flex-1 space-y-1.5">
 <label className="text-xs text-zinc-555 font-semibold block">AM/PM</label>
 <select
 value={customPeriod}
 onChange={(e) => setCustomPeriod(e.target.value)}
 className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 <button
 type="button"
 onClick={handleAddCustomSlot}
 className="bg-brand hover:bg-brand-dark text-zinc-955 px-4 py-2 text-sm font-bold rounded-full transition-colors cursor-pointer shrink-0 h-[38px] flex items-center justify-center shadow-sm border-none"
 >
 Add Slot
 </button>
 </div>
 </div>

 {/* Custom Time Range Adder */}
 <div className="space-y-3 pt-5 border-t border-zinc-800">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">Generate Slots from Time Range</label>
 <div className="flex flex-col gap-3 max-w-sm p-4 bg-zinc-950/40 border border-zinc-800 rounded-[10px]">
 <div className="flex gap-2 items-end">
 <span className="text-xs text-zinc-500 font-bold pb-2 tracking-wider w-10 text-left">From:</span>
 <div className="flex-1 space-y-1">
 <select
 value={fromHour}
 onChange={(e) => setFromHour(e.target.value)}
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
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
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
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
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 </div>

 <div className="flex gap-2 items-end">
 <span className="text-xs text-zinc-500 font-bold pb-2 tracking-wider w-10 text-left">To:</span>
 <div className="flex-1 space-y-1">
 <select
 value={toHour}
 onChange={(e) => setToHour(e.target.value)}
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
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
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
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
 className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
 >
 <option value="AM">AM</option>
 <option value="PM">PM</option>
 </select>
 </div>
 </div>

  <div className="flex gap-1.5 items-center mt-3">
    <span className="text-xs text-zinc-500 font-bold tracking-wide w-20 text-left">
      Duration:
    </span>
    <div className="flex-1">
      <select
        value={slotInterval || 60}
        onChange={(e) => setSlotInterval(Number(e.target.value))}
        className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-[10px] text-sm text-white outline-none focus:border-brand cursor-pointer shadow-sm"
      >
        <option value={30}>30 Minutes</option>
        <option value={60}>60 Minutes</option>
      </select>
    </div>
  </div>

  <button
    type="button"
    onClick={() => {
      setSlotError('');
      const fromStr = `${fromHour}:${fromMinute} ${fromPeriod}`;
      const toStr = `${toHour}:${toMinute} ${toPeriod}`;
      addTimeRangeSlots(fromStr, toStr, false, slotInterval);
    }}
    className="w-full mt-3 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 text-sm font-bold rounded-[10px] transition-colors border border-zinc-800 cursor-pointer flex items-center justify-center shadow-sm"
  >
    Generate Time Slots
  </button>
 </div>
 </div>

 <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
 {isAvailabilitySaved ? (
 <span className="text-sm text-emerald-450 font-bold flex items-center gap-1 bg-emerald-955/20 px-3 py-1.5 rounded-[10px] border border-emerald-900/30">
 Availability Matrix Synchronized!
 </span>
 ) : <span />}
 <button
 type="submit"
 className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-zinc-955 px-8 py-2.5 text-sm font-bold rounded-full shadow-sm border-none cursor-pointer flex items-center justify-center gap-2 transition-colors"
 >
 <Save className="w-4 h-4" /> Save Slots Matrix
 </button>
 </div>
 </div>
 </form>
 );
};

export default AvailabilityTab;
