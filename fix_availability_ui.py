import re

def update_counsellor_dashboard():
    with open('frontend/src/features/counsellor/PsychologistDashboard.jsx', 'r') as f:
        content = f.read()

    # 1. Add daySlots and selectedDay state
    state_injection = """ const [availableSlots, setAvailableSlots] = useState([]);
 const [daySlots, setDaySlots] = useState({});
 const [selectedDay, setSelectedDay] = useState(1);
"""
    content = content.replace(" const [availableSlots, setAvailableSlots] = useState([]);", state_injection)

    # 2. Update loadBookingsData to load daySlots
    load_avail_search = """      if (res.data.availability) {
        if (res.data.availability.activeDays) setActiveDays(res.data.availability.activeDays);
        if (res.data.availability.availableSlots) {
          setAvailableSlots(res.data.availability.availableSlots);
          setAllSlots(res.data.availability.availableSlots);
        }
      }"""
    load_avail_replace = """      if (res.data.availability) {
        if (res.data.availability.activeDays) setActiveDays(res.data.availability.activeDays);
        if (res.data.availability.availableSlots) {
          setAvailableSlots(res.data.availability.availableSlots);
        }
        if (res.data.availability.daySlots) {
          setDaySlots(res.data.availability.daySlots);
        } else if (res.data.availability.availableSlots) {
          // Backward compatibility: pre-fill daySlots with global slots for active days
          const fallbackDaySlots = {};
          Object.keys(res.data.availability.activeDays || {}).forEach(dayIndex => {
            if (res.data.availability.activeDays[dayIndex]) {
              fallbackDaySlots[dayIndex] = [...res.data.availability.availableSlots];
            }
          });
          setDaySlots(fallbackDaySlots);
        }
      }"""
    content = content.replace(load_avail_search, load_avail_replace)

    # 3. Update handleAvailabilitySave payload
    save_payload_search = """      availability: {
        activeDays,
        availableSlots
      }"""
    save_payload_replace = """      availability: {
        activeDays,
        availableSlots,
        daySlots
      }"""
    content = content.replace(save_payload_search, save_payload_replace)

    # 4. Update slot generator functions to target daySlots[selectedDay]
    # We will replace addTimeRangeSlots and handleAddCustomSlot and handleRemoveSlot
    
    # First, handleRemoveSlot
    remove_slot_search = """ const handleRemoveSlot = (slotToRemove) => {
 setAvailableSlots(prev => prev.filter(slot => slot !== slotToRemove));
 };"""
    remove_slot_replace = """ const handleRemoveSlot = (slotToRemove) => {
 setDaySlots(prev => {
   const newSlots = prev[selectedDay] ? prev[selectedDay].filter(slot => slot !== slotToRemove) : [];
   return { ...prev, [selectedDay]: newSlots };
 });
 };"""
    content = content.replace(remove_slot_search, remove_slot_replace)

    # handleAddCustomSlot
    add_custom_search = """ setAvailableSlots(prev => {
 if (prev.includes(newSlot)) return prev;
 return [...prev, newSlot].sort((a, b) => {
 const aTime = new Date('1970/01/01 ' + a);
 const bTime = new Date('1970/01/01 ' + b);
 return aTime - bTime;
 });
 });"""
    add_custom_replace = """ setDaySlots(prev => {
 const currentDaySlots = prev[selectedDay] || [];
 if (currentDaySlots.includes(newSlot)) return prev;
 const newDaySlots = [...currentDaySlots, newSlot].sort((a, b) => {
 const aTime = new Date('1970/01/01 ' + a);
 const bTime = new Date('1970/01/01 ' + b);
 return aTime - bTime;
 });
 return { ...prev, [selectedDay]: newDaySlots };
 });"""
    content = content.replace(add_custom_search, add_custom_replace)

    # addTimeRangeSlots
    add_range_search = """ setAvailableSlots(prev => {
 const unique = [...new Set([...prev, ...newSlots])];
 return unique.sort((a, b) => {
 const aTime = new Date('1970/01/01 ' + a);
 const bTime = new Date('1970/01/01 ' + b);
 return aTime - bTime;
 });
 });"""
    add_range_replace = """ setDaySlots(prev => {
 const currentDaySlots = prev[selectedDay] || [];
 const unique = [...new Set([...currentDaySlots, ...newSlots])];
 const sorted = unique.sort((a, b) => {
 const aTime = new Date('1970/01/01 ' + a);
 const bTime = new Date('1970/01/01 ' + b);
 return aTime - bTime;
 });
 return { ...prev, [selectedDay]: sorted };
 });"""
    content = content.replace(add_range_search, add_range_replace)

    # Pass daySlots and selectedDay down
    props_search = """ activeDays={activeDays}
 toggleDay={toggleDay}
 allSlots={allSlots}
 availableSlots={availableSlots}"""
    props_replace = """ activeDays={activeDays}
 toggleDay={toggleDay}
 daySlots={daySlots}
 setDaySlots={setDaySlots}
 selectedDay={selectedDay}
 setSelectedDay={setSelectedDay}
 availableSlots={availableSlots}"""
    content = content.replace(props_search, props_replace)

    with open('frontend/src/features/counsellor/PsychologistDashboard.jsx', 'w') as f:
        f.write(content)

update_counsellor_dashboard()
