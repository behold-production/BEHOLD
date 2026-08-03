import re

def update_admin_tab():
    with open('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', 'r') as f:
        content = f.read()

    # 1. State definitions
    state_search = """  const [adminAvailableSlots, setAdminAvailableSlots] = useState([]);
  const [adminAllSlots, setAdminAllSlots] = useState([]);"""
    state_replace = """  const [adminAvailableSlots, setAdminAvailableSlots] = useState([]);
  const [adminAllSlots, setAdminAllSlots] = useState([]);
  const [adminDaySlots, setAdminDaySlots] = useState({});
  const [selectedAdminDay, setSelectedAdminDay] = useState(1);"""
    content = content.replace(state_search, state_replace)

    # 2. Initialization inside handleEditPsy
    init_search = """      if (avail.availableSlots) {
        setAdminAvailableSlots(avail.availableSlots);
        setAdminAllSlots(avail.availableSlots);
      } else {
        setAdminAvailableSlots([]);
        setAdminAllSlots([]);
      }"""
    init_replace = """      if (avail.availableSlots) {
        setAdminAvailableSlots(avail.availableSlots);
        setAdminAllSlots(avail.availableSlots);
      } else {
        setAdminAvailableSlots([]);
        setAdminAllSlots([]);
      }
      if (avail.daySlots) {
        setAdminDaySlots(avail.daySlots);
      } else if (avail.availableSlots) {
        const fallback = {};
        Object.keys(avail.activeDays || {}).forEach(dayIndex => {
          if (avail.activeDays[dayIndex]) fallback[dayIndex] = [...avail.availableSlots];
        });
        setAdminDaySlots(fallback);
      } else {
        setAdminDaySlots({});
      }"""
    content = content.replace(init_search, init_replace)

    # Initialization for handleAddPsychologist
    add_search = """                  setAdminAvailableSlots([]);
                  setAdminAllSlots([]);"""
    add_replace = """                  setAdminAvailableSlots([]);
                  setAdminAllSlots([]);
                  setAdminDaySlots({});"""
    content = content.replace(add_search, add_replace)

    # Save Payload inside handleUpdatePsy
    payload_search = """        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots,
        },"""
    payload_replace = """        availability: {
          activeDays: adminActiveDays,
          availableSlots: adminAvailableSlots,
          daySlots: adminDaySlots,
        },"""
    content = content.replace(payload_search, payload_replace)

    # 3. Add Custom Slot handler
    handle_custom_search = """  const handleAddAdminCustomSlot = () => {
    const slot = `${adminCustomHour}:${adminCustomMinute} ${adminCustomPeriod}`;
    if (!adminAllSlots.includes(slot)) {
      setAdminAllSlots((prev) => [...prev, slot]);
      setAdminAvailableSlots((prev) => [...prev, slot]);
    }
  };"""
    handle_custom_replace = """  const handleAddAdminCustomSlot = () => {
    const slot = `${adminCustomHour}:${adminCustomMinute} ${adminCustomPeriod}`;
    setAdminDaySlots(prev => {
      const current = prev[selectedAdminDay] || [];
      if (current.includes(slot)) return prev;
      return { ...prev, [selectedAdminDay]: [...current, slot] };
    });
  };"""
    content = content.replace(handle_custom_search, handle_custom_replace)

    # Add Range Slots handler
    handle_range_search = """  const addAdminTimeRangeSlots = (fromStr, toStr, isOverride = false, interval = 60) => {
    const from = new Date(`1970/01/01 ${fromStr}`);
    let to = new Date(`1970/01/01 ${toStr}`);

    if (to <= from) {
      to.setDate(to.getDate() + 1);
    }
    const newSlots = [];
    let current = new Date(from);
    while (current < to) {
      const h = current.getHours();
      const m = current.getMinutes();
      const period = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      const formatted = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
      newSlots.push(formatted);
      current.setMinutes(current.getMinutes() + interval);
    }
    setAdminAllSlots((prev) => {
      const unique = [...new Set([...prev, ...newSlots])];
      return unique;
    });
    setAdminAvailableSlots((prev) => {
      const unique = [...new Set([...prev, ...newSlots])];
      return unique;
    });
  };"""
    handle_range_replace = """  const addAdminTimeRangeSlots = (fromStr, toStr, isOverride = false, interval = 60) => {
    const from = new Date(`1970/01/01 ${fromStr}`);
    let to = new Date(`1970/01/01 ${toStr}`);

    if (to <= from) {
      to.setDate(to.getDate() + 1);
    }
    const newSlots = [];
    let current = new Date(from);
    while (current < to) {
      const h = current.getHours();
      const m = current.getMinutes();
      const period = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      const formatted = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
      newSlots.push(formatted);
      current.setMinutes(current.getMinutes() + interval);
    }
    setAdminDaySlots(prev => {
      const current = prev[selectedAdminDay] || [];
      const unique = [...new Set([...current, ...newSlots])];
      return { ...prev, [selectedAdminDay]: unique };
    });
  };"""
    content = content.replace(handle_range_search, handle_range_replace)

    # Remove Slot Handler
    remove_search = """  const handleRemoveAdminSlot = (slotToRemove) => {
    setAdminAllSlots((prev) => prev.filter((s) => s !== slotToRemove));
    setAdminAvailableSlots((prev) => prev.filter((s) => s !== slotToRemove));
  };"""
    remove_replace = """  const handleRemoveAdminSlot = (slotToRemove) => {
    setAdminDaySlots((prev) => {
      const current = prev[selectedAdminDay] || [];
      return { ...prev, [selectedAdminDay]: current.filter(s => s !== slotToRemove) };
    });
  };"""
    content = content.replace(remove_search, remove_replace)

    # 4. Update the UI for Add/Edit Form
    ui_search = """                  {/* Operational Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Operational Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Mon", index: 1 },
                        { label: "Tue", index: 2 },
                        { label: "Wed", index: 3 },
                        { label: "Thu", index: 4 },
                        { label: "Fri", index: 5 },
                        { label: "Sat", index: 6 },
                        { label: "Sun", index: 0 },
                      ].map((day) => {
                        const active = adminActiveDays[day.index];
                        return (
                          <button
                            key={day.index}
                            type="button"
                            onClick={() => toggleAdminDay(day.index)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${active
                                ? "bg-brand text-zinc-955 font-bold border-none"
                                : "bg-zinc-955 border-zinc-850 text-zinc-500 hover:border-zinc-750"
                              }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Timing Slots */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Timing Slots (Active)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {adminAllSlots.map((slot) => {
                        const exists = adminAvailableSlots.includes(slot);
                        return (
                          <div
                            key={slot}
                            className="flex items-center gap-1.5 w-full"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (exists) {
                                  setAdminAvailableSlots((prev) =>
                                    prev.filter((s) => s !== slot),
                                  );
                                } else {
                                  setAdminAvailableSlots((prev) => [
                                    ...prev,
                                    slot,
                                  ]);
                                }
                              }}
                              className={`flex-1 py-2 border rounded-lg font-bold transition cursor-pointer text-xs ${exists
                                  ? "bg-brand/10 border-brand text-brand"
                                  : "bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750"
                                }`}
                            >
                              {slot}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdminSlot(slot)}
                              className="px-2 py-2 bg-zinc-950 border border-zinc-850 hover:bg-rose-955/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 font-header"
                              title="Remove Slot"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                      {adminAllSlots.length === 0 && (
                        <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-lg text-zinc-550 italic text-xs text-center w-full">
                          No timing slots configured. Use the controls below to
                          add custom slots or generate from a time range.
                        </div>
                      )}
                    </div>
                  </div>"""

    ui_replace = """                  {/* Select Day */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Select Day to Manage
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Mon", index: 1 },
                        { label: "Tue", index: 2 },
                        { label: "Wed", index: 3 },
                        { label: "Thu", index: 4 },
                        { label: "Fri", index: 5 },
                        { label: "Sat", index: 6 },
                        { label: "Sun", index: 0 },
                      ].map((day) => {
                        const isSelected = selectedAdminDay === day.index;
                        const isActive = adminActiveDays[day.index];
                        return (
                          <div key={day.index} className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedAdminDay(day.index)}
                              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${isSelected
                                  ? "bg-brand text-zinc-955 font-bold border-none"
                                  : "bg-zinc-955 border-zinc-850 text-zinc-500 hover:border-zinc-750"
                                }`}
                            >
                              {day.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAdminDay(day.index)}
                              className={`text-[9px] px-2 py-0.5 rounded font-bold transition-colors border cursor-pointer ${isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
                            >
                              {isActive ? 'ACTIVE' : 'OFF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Timing Slots */}
                  <div className="space-y-1.5 pt-4">
                    <label className="text-xs font-bold text-zinc-400 block">
                      Timing Slots (Active)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {(adminDaySlots[selectedAdminDay] || []).map((slot) => {
                        return (
                          <div
                            key={slot}
                            className="flex items-center gap-1.5 w-full"
                          >
                            <button
                              type="button"
                              className="flex-1 py-2 border rounded-lg font-bold transition cursor-default text-xs bg-brand/10 border-brand text-brand pointer-events-none"
                            >
                              {slot}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdminSlot(slot)}
                              className="px-2 py-2 bg-zinc-950 border border-zinc-850 hover:bg-rose-955/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 font-header"
                              title="Remove Slot"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                      {(!adminDaySlots[selectedAdminDay] || adminDaySlots[selectedAdminDay].length === 0) && (
                        <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-lg text-zinc-550 italic text-xs text-center w-full">
                          No timing slots configured for this day. Use the controls below to
                          add custom slots or generate from a time range.
                        </div>
                      )}
                    </div>
                  </div>"""
    
    content = content.replace(ui_search, ui_replace)

    # 5. UI Updates for Add Form (lines 2663+)
    ui_search_2 = """                  {/* Operational Days */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">Operational Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Mon', index: 1 },
                        { label: 'Tue', index: 2 },
                        { label: 'Wed', index: 3 },
                        { label: 'Thu', index: 4 },
                        { label: 'Fri', index: 5 },
                        { label: 'Sat', index: 6 },
                        { label: 'Sun', index: 0 }
                      ].map(day => {
                        const active = adminActiveDays[day.index];
                        return (
                          <button
                            key={day.index}
                            type="button"
                            onClick={() => toggleAdminDay(day.index)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${active
                              ? 'bg-brand text-zinc-955 font-bold border-none'
                              : 'bg-zinc-955 border-zinc-850 text-zinc-500 hover:border-zinc-750'
                              }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Timing Slots */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 block">Timing Slots (Active)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {adminAllSlots.map(slot => {
                        const exists = adminAvailableSlots.includes(slot);
                        return (
                          <div key={slot} className="flex items-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => {
                                if (exists) {
                                  setAdminAvailableSlots(prev => prev.filter(s => s !== slot));
                                } else {
                                  setAdminAvailableSlots(prev => [...prev, slot]);
                                }
                              }}
                              className={`flex-1 py-2 border rounded-lg font-bold transition cursor-pointer text-xs ${exists
                                ? 'bg-brand/10 border-brand text-brand'
                                : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750'
                                }`}
                            >
                              {slot}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdminSlot(slot)}
                              className="px-2 py-2 bg-zinc-950 border border-zinc-850 hover:bg-rose-955/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 font-header"
                              title="Remove Slot"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                      {adminAllSlots.length === 0 && (
                        <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-lg text-zinc-550 italic text-xs text-center w-full">
                          No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                        </div>
                      )}
                    </div>
                  </div>"""

    content = content.replace(ui_search_2, ui_replace)

    with open('frontend/src/features/admin/admin-dashboard/tabs/PsychologistManagementTab.jsx', 'w') as f:
        f.write(content)

update_admin_tab()
