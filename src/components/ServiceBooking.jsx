import React, { useState, useEffect } from 'react';
import { 
  Globe, MapPin, Building, Calendar, Clock, User, 
  CreditCard, CheckCircle2, Sparkles, Bell, ArrowRight, Info
} from 'lucide-react';

const COUNSELLING_FLOW = {
  online: [
    "Select Time",
    "Confirm Counsellor on Availability",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session on Google Meet / Our Platform"
  ],
  doorstep: [
    "Select Time & Date",
    "Profile of Counsellor + Location",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session at clients location House prefered"
  ],
  offline: [
    "Select Time & Date",
    "Profile of Counsellor",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session at the office"
  ]
};

const CAREER_FLOW = {
  online: [
    "Select Time",
    "Confirm Counsellor on Availability",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session on Google Meet / Our Platform"
  ],
  doorstep: [
    "Select Time & Date",
    "Profile of Counsellor + Location",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session at clients location House prefered"
  ],
  offline: [
    "Select Time & Date",
    "Profile of Counsellor",
    "BookSession with Integrated payment link and login",
    "Reminder Day Before",
    "Session at the office"
  ]
};

const ADVISORS = [
  // Counselling Psychologists
  { id: 'c3', name: 'Muhsina P R', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 'c1', name: 'Merin Susan', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 'c3_leena', name: 'Leena Mary Mathew', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 'c1_ahlam', name: 'Ahlam Naseer', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 'c2_gayathri', name: 'Gayathri S', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 'c2', name: 'Rahan Ajith', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  // Career Coaches
  { id: 'career_1', name: 'Dr. Anjali Menon', role: 'Senior Career Coach', availability: 'Available Today', type: 'career' },
  { id: 'career_2', name: 'Prof. Mathew Joseph', role: 'Higher Education Advisor', availability: 'Available Tomorrow', type: 'career' }
];

export default function ServiceBooking({ preselectedAdvisorId, clearPreselectedAdvisor }) {
  const [bookingService, setBookingService] = useState('counselling'); // counselling, career
  const [bookingMode, setBookingMode] = useState('ONLINE'); // ONLINE, DOOR_STEP, OFFLINE
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    groupCode: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [advisorConfirmed, setAdvisorConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // Autofill form from Student Profile if saved
  useEffect(() => {
    const saved = localStorage.getItem('behold_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookingForm(parsed);
        setIsAutofilled(true);
      } catch (e) {
        console.error("Error reading student profile", e);
      }
    }
  }, []);

  // Handle preselected advisor redirecting from landing page
  useEffect(() => {
    if (preselectedAdvisorId) {
      const found = ADVISORS.find(a => a.id === preselectedAdvisorId);
      if (found) {
        setBookingService('counselling'); // All directory therapists are counselling psychologists
        setSelectedAdvisor(found);
        setAdvisorConfirmed(true);
      }
      if (clearPreselectedAdvisor) {
        clearPreselectedAdvisor();
      }
    }
  }, [preselectedAdvisorId, clearPreselectedAdvisor]);

  // Reset advisor if service type changes to avoid invalid combinations
  useEffect(() => {
    if (selectedAdvisor && selectedAdvisor.type !== bookingService) {
      setSelectedAdvisor(null);
      setAdvisorConfirmed(false);
    }
  }, [bookingService]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
    setIsAutofilled(false);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!bookingForm.name.trim() || bookingForm.name.trim().length < 3) {
      err.name = "Name must be at least 3 characters";
    }
    const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
    if (!bookingForm.phone || !phoneRegex.test(bookingForm.phone)) {
      err.phone = "Please enter a valid phone number (e.g. 8086664001 or 0091-8086664001)";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bookingForm.email || !emailRegex.test(bookingForm.email)) {
      err.email = "Please enter a valid email address";
    }
    if (!selectedDate) err.date = "Please select a date";
    if (!selectedTime) err.time = "Please select a time slot";
    if (!selectedAdvisor) err.advisor = "Please select an advisor";
    if (!advisorConfirmed) err.confirm = "Please confirm the advisor selection";
    return err;
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white text-black text-left font-sans border-b border-gray-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-header font-black tracking-tight leading-none text-gray-900 uppercase">
            Service Booking Flows
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed font-light">
            Review our online, doorstep, and offline booking flows, and configure your session details below.
          </p>
        </div>

        {/* 1. Counselling Booking Flow */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-gray-150 pb-2">
            Counselling Booking — Flow
          </h2>
          <p className="text-xs text-gray-400">Three session modes: Online | Door step | Office Visit</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ONLINE CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">ONLINE</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {COUNSELLING_FLOW.online.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-450 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DOOR STEP CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">DOOR STEP</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {COUNSELLING_FLOW.doorstep.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-455 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* OFFLINE CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">OFFLINE (Office Visit)</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {COUNSELLING_FLOW.offline.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-455 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Career Counselling Booking Flow */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider border-b border-gray-150 pb-2">
            Career Counselling Booking — Flow
          </h2>
          <p className="text-xs text-gray-400">Three session modes: Online | Door step | Office Visit</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ONLINE CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">ONLINE</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {CAREER_FLOW.online.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-455 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DOOR STEP CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">DOOR STEP</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {CAREER_FLOW.doorstep.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-455 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* OFFLINE CARD */}
            <div className="border border-brand p-6 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-brand" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">OFFLINE (Office Visit)</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  {CAREER_FLOW.offline.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-bold text-gray-455 shrink-0">{idx + 1}.</span>
                      <span className="text-gray-600 font-light">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOOKING CONSOLE */}
        <div className="border border-brand p-4 sm:p-8 bg-white space-y-6 rounded-[4px]">
          <h2 className="text-xl font-bold uppercase tracking-wide border-b border-gray-100 pb-3">
            Session Booking Console
          </h2>

          {isSuccess ? (
            <div className="p-5 sm:p-8 bg-gray-50 border border-gray-200 text-center rounded-[4px] space-y-4 max-w-xl mx-auto animate-in fade-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
              <h3 className="text-lg font-bold uppercase">Session Successfully Booked!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{bookingForm.name}</strong>. Your <strong>{bookingService === 'counselling' ? 'Personal Counselling' : 'Career Counseling'}</strong> session is scheduled on <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong> via <strong>{bookingMode}</strong> with <strong>{selectedAdvisor?.name}</strong>.
              </p>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedDate('');
                  setSelectedTime('');
                  setSelectedAdvisor(null);
                  setAdvisorConfirmed(false);
                }}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 text-xs font-semibold uppercase tracking-wider rounded-[4px] transition cursor-pointer w-full sm:w-auto text-center"
              >
                Book Another Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-xs font-medium">
              
              {/* Left Column: Flow Inputs */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* 1. Date & Time Selectors */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block font-semibold text-gray-700">1. Select Date & Time Slot</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-[4px]">
                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Date
                      </label>
                      <input 
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-xs text-gray-900 focus:border-brand outline-none"
                      />
                      {errors.date && <p className="text-[10px] text-red-500 font-semibold">{errors.date}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Time Slot (1 Hr Session)
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-xs text-gray-900 focus:border-brand outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select slot</option>
                        <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                        <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                      </select>
                      {errors.time && <p className="text-[10px] text-red-500 font-semibold">{errors.time}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. Select Service & Mode */}
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wide block font-semibold text-gray-700">2. Select Service & Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold mb-1">Service Type</label>
                      <select
                        value={bookingService}
                        onChange={(e) => setBookingService(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition cursor-pointer"
                      >
                        <option value="counselling">Personal Counselling</option>
                        <option value="career">Career Counseling</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold mb-1">Mode of Session</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['ONLINE', 'DOOR_STEP', 'OFFLINE'].map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setBookingMode(m)}
                            className={`py-2.5 text-[10px] uppercase font-bold border rounded-[4px] transition cursor-pointer ${
                              bookingMode === m 
                                ? 'bg-brand text-white border-brand' 
                                : 'bg-white text-gray-500 border-gray-300 hover:border-brand hover:text-brand'
                            }`}
                          >
                            {m.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counsellor Profile Select */}
                <div className="space-y-3">
                  <label className="text-gray-500 uppercase tracking-wide block font-semibold text-gray-700">3. Select Advisor</label>
                  <div className="space-y-2">
                    {ADVISORS.filter(advisor => advisor.type === bookingService).map((advisor) => (
                      <div 
                        key={advisor.id}
                        onClick={() => { setSelectedAdvisor(advisor); setAdvisorConfirmed(false); }}
                        className={`p-3 border rounded-[4px] flex items-center justify-between gap-3 cursor-pointer transition ${
                          selectedAdvisor?.id === advisor.id
                            ? 'bg-brand/5 border-brand shadow-xs'
                            : 'bg-white border-gray-200 hover:border-brand/40 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-gray-900">{advisor.name}</h4>
                          <p className="text-[10px] text-gray-500">{advisor.role}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-black border border-gray-200 font-bold uppercase">{advisor.availability}</span>
                      </div>
                    ))}
                  </div>
                  {errors.advisor && <p className="text-[10px] text-red-500 font-semibold">{errors.advisor}</p>}

                  {/* Confirm Toggle */}
                  {selectedAdvisor && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-[4px] flex items-center justify-between animate-in zoom-in-95 duration-200">
                      <span className="text-[10px] text-gray-600 font-semibold">
                        Confirm <strong>{selectedAdvisor.name}</strong> for this session?
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdvisorConfirmed(!advisorConfirmed)}
                        className={`px-3 py-1 rounded-[4px] text-[10px] font-bold transition cursor-pointer ${
                          advisorConfirmed 
                            ? 'bg-brand/10 border border-brand/35 text-brand' 
                            : 'bg-brand text-white hover:bg-brand-dark shadow-sm'
                        }`}
                      >
                        {advisorConfirmed ? '✓ Confirmed' : 'Confirm'}
                      </button>
                    </div>
                  )}
                  {errors.confirm && <p className="text-[10px] text-red-500 font-semibold">{errors.confirm}</p>}
                </div>
              </div>

              {/* Right Column: User Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-[4px] space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide">4. User Details</h3>

                  {isAutofilled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[4px] text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Details auto-filled from your Student Profile.
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Name</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        placeholder="Student Name"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition"
                      />
                      {errors.name && <p className="text-red-500 font-bold">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Mobile Number</label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition"
                      />
                      {errors.phone && <p className="text-red-500 font-bold">{errors.phone}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Email</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        placeholder="name@email.com"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition"
                      />
                      {errors.email && <p className="text-red-500 font-bold">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-150">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-gray-500 bg-gray-50 p-3 rounded-[4px] border border-gray-200">
                    <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-gray-400" /> Integrated Payment Link and Login</span>
                    <span className="font-bold text-gray-800">Secure Auth</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm uppercase tracking-wider rounded-[4px] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Book Counselling Session</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex gap-3 bg-gray-50 border border-gray-200 p-3 rounded-[4px] text-[10px] text-gray-500 items-start">
                  <Bell className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold block">Reminder & Post-Session Recaps</span>
                    Automated updates sent via WhatsApp and recaps straight to your dashboard.
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
