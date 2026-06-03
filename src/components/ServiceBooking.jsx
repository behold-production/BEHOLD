import React, { useState, useEffect } from 'react';
import {
  Globe, MapPin, Building, Calendar, Clock, User,
  CreditCard, CheckCircle2, Sparkles, Bell, ArrowRight, Info, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COUNSELLING_FLOW = {
  online: [
    "Select preferred date & time slot",
    "Choose available consultant psychologist",
    "Complete booking via secure integrated payment",
    "Receive session reminders & details via WhatsApp/Email",
    "Join online session via Google Meet or our portal"
  ],
  doorstep: [
    "Select date, time slot, & delivery mode",
    "Review therapist profile & location suitability",
    "Complete booking via secure integrated payment",
    "Receive advisor details & reminder a day before",
    "Personalised session at client's preferred location (home/office)"
  ],
  offline: [
    "Select preferred date & time slot",
    "Review consultant profile & offline schedule",
    "Complete booking via secure integrated payment",
    "Receive session reminder & directions a day before",
    "In-person session at our professional counselling office"
  ]
};

const CAREER_FLOW = {
  online: [
    "Select preferred date & time slot",
    "Choose senior career coach or academic advisor",
    "Complete booking via secure integrated payment",
    "Receive session reminders & preparation checklist",
    "Join live coaching session via Google Meet/our portal"
  ],
  doorstep: [
    "Select date, time slot, & delivery mode",
    "Review coach profile & location suitability",
    "Complete booking via secure integrated payment",
    "Receive advisor details & preparation guide a day before",
    "Interactive coaching session at client's preferred location (home/office)"
  ],
  offline: [
    "Select preferred date & time slot",
    "Review coach profile & office schedule",
    "Complete booking via secure integrated payment",
    "Receive session reminder & directions a day before",
    "In-person coaching session at our professional career centre"
  ]
};

const ADVISORS = [
  { id: 't1', name: 'Josina Joseph', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 't2', name: 'Muhammed Niyas S H', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 't3', name: 'Jahnavi Navami Rajesh', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 't4', name: 'Hana Anvar M P', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 't5', name: 'Surbinas Rahman V P', role: 'Consultant Psychologist', availability: 'Available Today', type: 'counselling' },
  { id: 't6', name: 'Mary Santra Tomy', role: 'Consultant Psychologist', availability: 'Available Tomorrow', type: 'counselling' },
  // Career Coaches (keeping original since they weren't in the image)
  { id: 'career_1', name: 'Dr. Anjali Menon', role: 'Senior Career Coach', availability: 'Available Today', type: 'career' },
  { id: 'career_2', name: 'Prof. Mathew Joseph', role: 'Higher Education Advisor', availability: 'Available Tomorrow', type: 'career' }
];

export default function ServiceBooking({ preselectedAdvisorId, clearPreselectedAdvisor, onOpenAuth }) {
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
  
  const { user } = useAuth();

  // History tracking popstate listener
  useEffect(() => {
    // Set initial state on mount if it's booking view
    window.history.replaceState({ component: 'booking', step: 'config' }, '');

    const handlePopState = (e) => {
      if (e.state && e.state.component === 'booking' && e.state.step) {
        const step = e.state.step;
        if (step === 'config') {
          setSelectedDate('');
          setSelectedTime('');
          setSelectedAdvisor(null);
          setAdvisorConfirmed(false);
          setIsSuccess(false);
        } else if (step === 'advisor') {
          setSelectedAdvisor(null);
          setAdvisorConfirmed(false);
          setIsSuccess(false);
        } else if (step === 'details') {
          setIsSuccess(false);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStepChange = (newStep) => {
    window.history.pushState({ component: 'booking', step: newStep }, '');
  };

  // Monitor date/time selections to push advisor selection step
  useEffect(() => {
    if (selectedDate && selectedTime && !selectedAdvisor) {
      handleStepChange('advisor');
    }
  }, [selectedDate, selectedTime]);

  // Autofill form from Auth user
  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({ ...prev, name: user.name, email: user.email }));
      setIsAutofilled(true);
    } else {
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
    }
  }, [user]);

  // Handle preselected advisor redirecting from landing page
  useEffect(() => {
    if (preselectedAdvisorId) {
      const found = ADVISORS.find(a => a.id === preselectedAdvisorId);
      if (found) {
        setBookingService(found.type); // Dynamically set based on advisor type (counselling or career)
        setSelectedAdvisor(found);
        setAdvisorConfirmed(true);
        
        // Auto-scroll to the booking console form
        setTimeout(() => {
          const element = document.getElementById('booking-console');
          if (element) {
            const offset = 85;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 150);
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
    setBookingForm(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('behold_student_profile', JSON.stringify(updated));
      return updated;
    });
    setIsAutofilled(false);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!bookingForm.name.trim()) {
      err.name = "Name is required";
    } else if (bookingForm.name.trim().length < 3) {
      err.name = "Name must be at least 3 characters";
    }
    
    if (!bookingForm.phone.trim()) {
      err.phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(bookingForm.phone)) {
        err.phone = "Please enter a valid phone number (e.g. 8086664001)";
      }
    }
    
    if (!bookingForm.email.trim()) {
      err.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingForm.email)) {
        err.email = "Please enter a valid email address";
      }
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
      handleStepChange('success');
    }, 1500);
  };

  const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
  const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white text-black text-left font-sans border-b border-gray-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">

        {/* Header */}
        <div className="text-center flex flex-col items-center space-y-4">
          <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-xl uppercase tracking-wider font-extrabold w-fit block">
            booking engine
          </span>
          <h1 className="text-3xl md:text-5xl font-header font-black tracking-tight leading-none text-gray-900 uppercase">
            Session Booking
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed font-light">
            Select your service, choose your preferred mode, and configure your session details below.
          </p>
        </div>

        {/* BOOKING CONSOLE */}
        {!user ? (
          <div className="border border-black/10 p-8 sm:p-14 bg-white space-y-6 rounded-xl text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <Lock className="w-12 h-12 text-brand mx-auto relative z-10" />
            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-black uppercase tracking-wide">Authentication Required</h2>
              <p className="text-sm text-gray-500">Please sign in or create an account to book your counselling or career guidance sessions.</p>
            </div>
            <button
              onClick={onOpenAuth}
              className="relative z-10 px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <div id="booking-console" className="border border-brand p-4 sm:p-8 bg-white space-y-8 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Configure Your Session
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
              <Info className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>Step-by-step guidance is dynamic based on your selections below.</span>
            </div>
          </div>

          {/* Interactive Dynamic Journey Stepper */}
          {!isSuccess && (
            <div className="bg-gray-50 border border-gray-150 p-5 rounded-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand shrink-0" />
                  <h3 className="font-bold uppercase tracking-wider text-xs text-gray-800">
                    Session Flow: {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Counselling'} ({bookingMode.replace('_', ' ')})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-light">Interactive Booking Guide</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {activeSteps.map((step, idx) => {
                  let isCompleted = false;
                  let isActive = false;

                  if (idx === 0) {
                    isCompleted = !!(selectedDate && selectedTime);
                    isActive = !isCompleted;
                  } else if (idx === 1) {
                    isCompleted = !!(selectedAdvisor && advisorConfirmed);
                    isActive = !isCompleted && !!(selectedDate && selectedTime);
                  } else if (idx === 2) {
                    isCompleted = !!(bookingForm.name && bookingForm.phone && bookingForm.email);
                    isActive = !isCompleted && !!(selectedAdvisor && advisorConfirmed);
                  } else if (idx === 3) {
                    isCompleted = isSuccess;
                    isActive = !isCompleted && !!(bookingForm.name && bookingForm.phone && bookingForm.email);
                  } else {
                    isCompleted = isSuccess;
                    isActive = !isCompleted && isSuccess;
                  }

                  return (
                    <div key={idx} className="flex lg:flex-col items-start gap-3 lg:gap-2 relative">
                      <div className="flex items-center lg:w-full">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] border transition-all duration-300 shrink-0 ${
                          isCompleted
                            ? 'bg-black border-black text-white'
                            : isActive
                              ? 'bg-brand border-brand text-white shadow-xs ring-2 ring-brand/10'
                              : 'bg-white border-gray-300 text-gray-405'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        {idx < 4 && (
                          <div className={`hidden lg:block h-0.5 w-full ml-2 transition-all duration-300 ${
                            isCompleted ? 'bg-black' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-brand' : isCompleted ? 'text-black' : 'text-gray-400'}`}>
                          {idx === 0 ? 'Schedule' : idx === 1 ? 'Advisor' : idx === 2 ? 'Details' : idx === 3 ? 'Reminders' : 'Session'}
                        </span>
                        <span className={`text-[10px] font-light leading-tight transition-colors duration-300 mt-0.5 ${isActive ? 'text-gray-900 font-normal' : 'text-gray-500'}`}>
                          {step}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="p-5 sm:p-8 bg-gray-50 border border-gray-200 text-center rounded-xl space-y-4 max-w-xl mx-auto animate-in fade-in duration-500">
              <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
              <h3 className="text-lg font-bold uppercase">Session Successfully Booked!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{bookingForm.name}</strong>. Your <strong>{bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Counselling'}</strong> session (1 Hour) is scheduled on <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong> via <strong>{bookingMode}</strong> with <strong>{selectedAdvisor?.name}</strong>.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedDate('');
                  setSelectedTime('');
                  setSelectedAdvisor(null);
                  setAdvisorConfirmed(false);
                }}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 text-xs font-semibold uppercase tracking-wider rounded-xl transition cursor-pointer w-full sm:w-auto text-center"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          if (errors.date) {
                            setErrors(prev => ({ ...prev, date: null }));
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:border-brand outline-none"
                      />
                      {errors.date && <p className="text-[10px] text-red-500 font-semibold">{errors.date}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 uppercase tracking-wide flex items-center justify-between gap-1 w-full text-[10px] font-bold">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time Slot</span>
                        <span className="text-[9px] font-extrabold text-white bg-black px-2 py-0.5 rounded tracking-widest">1 HOUR SESSION</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setSelectedTime(time);
                              if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                            }}
                            className={`py-2 text-xs font-bold rounded border transition-colors cursor-pointer ${
                              selectedTime === time 
                                ? 'bg-brand border-brand text-black shadow-sm ring-1 ring-brand' 
                                : 'bg-white border-gray-300 text-gray-600 hover:border-brand/50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
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
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-brand transition cursor-pointer"
                      >
                        <option value="counselling">Psychological Counselling</option>
                        <option value="career">Career Counselling</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wider block text-[10px] font-bold mb-1">Mode of Session</label>
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {['ONLINE', 'DOOR_STEP', 'OFFLINE'].map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setBookingMode(m)}
                            className={`py-2 px-1 sm:py-2.5 text-[8px] min-[370px]:text-[10px] uppercase font-bold border rounded-xl transition cursor-pointer ${bookingMode === m
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
                        onClick={() => {
                          setSelectedAdvisor(advisor);
                          setAdvisorConfirmed(false);
                          if (errors.advisor) {
                            setErrors(prev => ({ ...prev, advisor: null }));
                          }
                        }}
                        className={`p-3 border rounded-xl flex flex-wrap items-center justify-between gap-2.5 cursor-pointer transition ${selectedAdvisor?.id === advisor.id
                          ? 'bg-brand/5 border-brand shadow-xs'
                          : 'bg-white border-gray-200 hover:border-brand/40 hover:bg-gray-50'
                          }`}
                      >
                        <div>
                          <h4 className="font-bold text-gray-900">{advisor.name}</h4>
                          <p className="text-[10px] text-gray-500">{advisor.role}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-black border border-gray-200 font-bold uppercase shrink-0">{advisor.availability}</span>
                      </div>
                    ))}
                  </div>
                  {errors.advisor && <p className="text-[10px] text-red-500 font-semibold">{errors.advisor}</p>}

                  {/* Confirm Toggle */}
                  {selectedAdvisor && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                      <span className="text-[10px] text-gray-600 font-semibold">
                        Confirm <strong>{selectedAdvisor.name}</strong> for this session?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextConfirmed = !advisorConfirmed;
                          setAdvisorConfirmed(nextConfirmed);
                          if (nextConfirmed) {
                            handleStepChange('details');
                            if (errors.confirm) {
                              setErrors(prev => ({ ...prev, confirm: null }));
                            }
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${advisorConfirmed
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
                <div className="p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide">4. User Details</h3>

                  {isAutofilled && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[10px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Details auto-filled from your Student Profile.
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        placeholder="Student Name"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-brand transition"
                      />
                      {errors.name && <p className="text-red-500 font-bold">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Mobile Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit mobile"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-brand transition"
                      />
                      {errors.phone && <p className="text-red-500 font-bold">{errors.phone}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-500 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        placeholder="name@email.com"
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-brand transition"
                      />
                      {errors.email && <p className="text-red-500 font-bold">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-150">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-gray-400" /> Integrated Payment Link and Login</span>
                    <span className="font-bold text-gray-800">Secure Auth</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-bold text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>
                          {bookingService === 'career' ? 'Book Career Guidance Session' : 'Book Counselling Session'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex gap-3 bg-gray-50 border border-gray-200 p-3 rounded-xl text-[10px] text-gray-500 items-start">
                  <Bell className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-semibold block">Reminder & Post-Session Recaps</span>
                    Automated updates sent via WhatsApp and recaps straight to your profile.
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
