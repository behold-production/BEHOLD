import re

def update_avail_tab():
    with open('frontend/src/features/counsellor/psychologist-dashboard/tabs/AvailabilityTab.jsx', 'r') as f:
        content = f.read()

    # 1. Update Props
    props_search = """ toggleDay,
 allSlots,
 availableSlots,"""
    props_replace = """ toggleDay,
 daySlots,
 setDaySlots,
 selectedDay,
 setSelectedDay,
 availableSlots,"""
    content = content.replace(props_search, props_replace)

    # 2. Update UI for Days
    days_ui_search = """ <div className="space-y-2.5">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">Active Operational Days</label>
 <div className="flex flex-wrap gap-2.5">
 {DAYS_OF_WEEK.map(day => {
 const active = activeDays[day.index];
 return (
 <button
 key={day.index}
 type="button"
 onClick={() => toggleDay(day.index)}
 className={`px-4 py-2 border rounded-[10px] text-sm font-bold transition-all duration-300 cursor-pointer ${active
 ? 'bg-brand border-brand text-zinc-955 shadow-sm'
 : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:border-zinc-700 hover:bg-zinc-900'
 }`}
 >
 {day.label}
 </button>
 );
 })}
 </div>
 </div>"""

    days_ui_replace = """ <div className="space-y-2.5">
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
 </div>"""
    content = content.replace(days_ui_search, days_ui_replace)

    # 3. Update Slot Grid
    grid_search = """ <div className="space-y-3 pt-5 border-t border-zinc-800">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">Select Active Timing Slots</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {allSlots.map(slot => {
 const exists = availableSlots.includes(slot);"""
    grid_replace = """ <div className="space-y-3 pt-5 border-t border-zinc-800">
 <div className="flex justify-between items-center">
 <label className="text-zinc-400 font-bold block text-xs tracking-wide">
 Slots for {DAYS_OF_WEEK.find(d => d.index === selectedDay)?.label}
 </label>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {(daySlots[selectedDay] || []).map(slot => {
 const exists = true;"""
    content = content.replace(grid_search, grid_replace)

    # 4. Remove allSlots references from grid logic
    # Basically, we map over daySlots[selectedDay] directly now.
    
    empty_slots_search = """ {allSlots.length === 0 && (
 <div className="col-span-1 sm:col-span-2 py-5 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-[10px] text-zinc-500 italic text-sm text-center w-full">
 No timing slots configured. Use the controls below to add custom slots or generate from a time range.
 </div>
 )}"""
    empty_slots_replace = """ {(!daySlots[selectedDay] || daySlots[selectedDay].length === 0) && (
 <div className="col-span-1 sm:col-span-2 py-5 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-[10px] text-zinc-500 italic text-sm text-center w-full">
 No timing slots configured for this day. Use the controls below to add custom slots or generate from a time range.
 </div>
 )}"""
    content = content.replace(empty_slots_search, empty_slots_replace)

    with open('frontend/src/features/counsellor/psychologist-dashboard/tabs/AvailabilityTab.jsx', 'w') as f:
        f.write(content)

update_avail_tab()
