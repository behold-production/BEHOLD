import re

with open('frontend/src/components/ServiceBooking.jsx', 'r', encoding='utf8') as f:
    content = f.read()

new_block = """                {/* STEP 1: Schedule & Advisor */}
                {bookingStep === 'config' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-zinc-100 pb-3">
                      <h3 className="text-sm font-semibold capitalize  text-zinc-850 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                        Schedule & Advisor
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Select a date, choose your advisor, and pick a time.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Service Type Selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Service Type</label>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {[
                            { id: 'counselling', label: 'Psychological' },
                            { id: 'career', label: 'Career' }
                          ].map((s) => (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => setBookingService(s.id)}
                              className={`px-3 py-3 text-xs capitalize font-bold border rounded-xl transition cursor-pointer text-center min-h-[56px] leading-tight ${
                                bookingService === s.id
                                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs font-bold'
                                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                              }`}
                            >
                              <span className="flex flex-col items-center">
                                <span>{s.label}</span>
                                <span className="text-xs font-normal normal-case text-zinc-400">
                                  {s.id === 'counselling' ? 'Counselling' : 'Mentoring'}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Mode of Session Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Session Mode</label>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[
                            { id: 'ONLINE', label: 'Online', desc: 'Video call' },
                            { id: 'DOOR_STEP', label: 'Doorstep', desc: 'Home visit' },
                            { id: 'OFFLINE', label: 'Offline', desc: 'At center' }
                          ].map((m) => (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => setBookingMode(m.id)}
                              className={`flex flex-col items-center justify-center gap-1 px-2 py-3.5 text-xs capitalize font-semibold border rounded-xl transition cursor-pointer text-center min-h-[56px] leading-tight ${
                                bookingMode === m.id
                                  ? 'bg-brand/10 text-brand-dark border-brand/30 shadow-xs font-bold'
                                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                              }`}
                            >
                              <span className="flex flex-col items-center">
                                <span>{m.label}</span>
                                <span className="text-xs font-normal normal-case text-zinc-400">{m.desc}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step A: Date Picker */}
                    <div className="space-y-2 pt-4 border-t border-zinc-100">
                      <label className="text-sm font-bold text-zinc-700 block">1. Select Date</label>
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <DateTimePicker
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onDateChange={(d) => {
                            setSelectedDate(d);
                            setSelectedTime('');
                            if (!isAdvisorLocked) {
                              setSelectedAdvisor(null);
                              setAdvisorConfirmed(false);
                            }
                            if (errors.date) setErrors(prev => ({ ...prev, date: null }));
                          }}
                          onTimeChange={(t) => {
                            setSelectedTime(t);
                            if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                          }}
                          getAvailableSlotsForDate={(date) => getAvailableSlotsForDate(date, bookingService)}
                          errors={errors}
                          selectedMode={bookingMode}
                        />
                      </div>
                    </div>

                    {/* Step B: Advisor Selection */}
                    {selectedDate && (
                      <div className="space-y-3 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold text-zinc-700 block">2. Choose Advisor</label>
                        {isAdvisorLocked && selectedAdvisor ? (
                          <div className="p-4 border border-brand bg-brand/5 shadow-sm ring-1 ring-brand/10 rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1.5 text-left min-w-0 flex-1">
                                <h4 className="font-semibold text-zinc-900 text-sm sm:text-base leading-tight">{selectedAdvisor.name}</h4>
                                <p className="text-xs sm:text-xs text-zinc-500 font-medium">{selectedAdvisor.role}</p>
                                <span className="text-xs font-semibold text-brand-dark mt-1 inline-block">Pre-selected</span>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-sm font-bold text-zinc-900">₹{selectedAdvisor.price}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {advisors
                              .filter(advisor => advisor.type === bookingService)
                              .filter(advisor => !advisor.modes || advisor.modes.includes(bookingMode))
                              .map((advisor) => {
                                return (
                                  <div
                                    key={advisor.id}
                                    onClick={() => {
                                      setSelectedAdvisor(advisor);
                                      setAdvisorConfirmed(true);
                                      if (errors.advisor) setErrors(prev => ({ ...prev, advisor: null }));
                                      if (errors.confirm) setErrors(prev => ({ ...prev, confirm: null }));
                                      if (advisor.modes && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
                                        setBookingMode(advisor.modes[0]);
                                      }
                                      // Clear selected time if they change advisor!
                                      setSelectedTime('');
                                    }}
                                    className={`p-4 border rounded-xl cursor-pointer transition active:scale-[0.98] ${
                                      selectedAdvisor?.id === advisor.id
                                        ? 'bg-brand/5 border-brand shadow-sm ring-1 ring-brand/10'
                                        : 'bg-white border-zinc-200 hover:border-brand/40 hover:bg-zinc-50'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="space-y-1.5 text-left min-w-0 flex-1">
                                        <h4 className="font-semibold text-zinc-900 text-sm sm:text-base leading-tight">{advisor.name}</h4>
                                        <p className="text-xs sm:text-xs text-zinc-500 font-medium">{advisor.role}</p>
                                      </div>
                                      <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="text-sm font-bold text-zinc-900">₹{advisor.price}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            {errors.advisor && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.advisor}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step C: Time Selection */}
                    {selectedDate && selectedAdvisor && (
                      <div className="space-y-3 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold text-zinc-700 block">3. Select Time</label>
                        <TimePicker
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onTimeChange={(t) => {
                            setSelectedTime(t);
                            if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                          }}
                          availableSlots={(() => {
                            if (!selectedDate || !selectedAdvisor) return [];
                            const dateObj = selectedAdvisor.availabilitySlots?.[selectedDate];
                            if (!dateObj || !dateObj.slots) return [];
                            return dateObj.slots.filter(s => s.isAvailable).map(s => s.time);
                          })()}
                          errors={errors}
                        />
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-4 border-t border-zinc-200">
                      <button
                        type="button"
                        disabled={!selectedDate || !selectedTime || !selectedAdvisor}
                        onClick={() => handleStepChange('payment')}
                        className="px-6 py-3 min-h-[48px] bg-zinc-900 text-white font-bold capitalize  text-xs rounded-lg transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-xs w-full sm:w-auto"
                      >
                        Account & Payment
                      </button>
                    </div>
                  </div>
                )}"""

pattern = re.compile(r'                \{/\* STEP 1: Choose Advisor \*/\}.*?                  </div>\n                \)}', re.DOTALL)

match = pattern.search(content)
if not match:
    print("Pattern not found!")
else:
    new_content = content[:match.start()] + new_block + content[match.end():]
    with open('frontend/src/components/ServiceBooking.jsx', 'w', encoding='utf8') as f:
        f.write(new_content)
    print("Success")
