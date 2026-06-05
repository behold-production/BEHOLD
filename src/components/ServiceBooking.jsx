import React, { useState, useEffect } from 'react';
import {
  Globe, MapPin, Building, Calendar, Clock, User,
  CreditCard, Bell, ArrowRight, Info, Lock, Eye, EyeOff
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
  const [advisors, setAdvisors] = useState([]);

  useEffect(() => {
    const getDynamicAdvisorsForBooking = () => {
      // 1. Gather all registered psychologists
      let registeredPsychologists = [];
      try {
        const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
        registeredPsychologists = users.filter(u => u.role === 'PSYCHOLOGIST' && u.verified !== false);
      } catch (e) {
        console.error("Failed to load registered users in booking", e);
      }

      // 2. Build dynamic advisors list
      const resolvedAdvisors = registeredPsychologists.map(psy => {
        const adv = {
          id: psy.id,
          name: psy.name,
          role: 'Consultant Psychologist',
          availability: 'Available Today',
          type: 'counselling',
          defaultMeetLink: '',
          price: 1200,
          modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
        };

        const savedProfile = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            return {
              ...adv,
              name: profile.name || adv.name,
              role: profile.role || adv.role,
              defaultMeetLink: profile.defaultMeetLink || adv.defaultMeetLink || '',
              price: (profile.price !== undefined && profile.price !== '') ? Number(profile.price) : adv.price,
              modes: profile.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP']
            };
          } catch (e) {
            console.error("Error parsing saved profile details in booking", e);
          }
        }
        return adv;
      });

      return resolvedAdvisors;
    };

    setAdvisors(getDynamicAdvisorsForBooking());

    const handleSync = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      if (!key || key === 'behold_users_db' || key === 'behold_booked_sessions' || key.startsWith('behold_advisor_')) {
        setAdvisors(getDynamicAdvisorsForBooking());
      }
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('storage_update', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('storage_update', handleSync);
    };
  }, []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);
  
  const { user } = useAuth();

  const getAvailableSlotsForDate = (dateStr, serviceType) => {
    if (!dateStr) return [];

    try {
      const dayOfWeek = new Date(dateStr).getDay(); // 0 to 6

      // If a specific advisor is selected, prioritize their schedule
      if (selectedAdvisor) {
        const savedAvailability = localStorage.getItem(`behold_advisor_availability_${selectedAdvisor.id}`);
        if (savedAvailability) {
          try {
            const parsed = JSON.parse(savedAvailability);
            const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
            if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
              const list = [...parsed.availableSlots];
              const parseTimeToMinutes = (timeStr) => {
                const [time, meridiem] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (meridiem === 'PM' && hours !== 12) hours += 12;
                if (meridiem === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
              };
              return list.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
            }
            return []; // No slots available for this advisor on this day
          } catch (e) {
            console.error("Error parsing advisor availability in booking", e);
          }
        }
        return [];
      }

      // Load all advisors including dynamic ones
      const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
      const psychologists = users.filter(u => u.role === 'PSYCHOLOGIST' && u.verified !== false);
      const allAdvisorsList = psychologists.map(psy => {
        const adv = {
          id: psy.id,
          name: psy.name,
          type: 'counselling'
        };
        const savedProfile = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            adv.role = profile.role || 'Consultant Psychologist';
            adv.price = (profile.price !== undefined && profile.price !== '') ? Number(profile.price) : 1200;
          } catch (e) {}
        }
        return adv;
      });

      // Filter advisors matching serviceType
      const matchingAdvisors = allAdvisorsList.filter(a => a.type === serviceType);

      // Collect union of available slots
      const activeSlotsSet = new Set();

      matchingAdvisors.forEach(advisor => {
        const savedAvailability = localStorage.getItem(`behold_advisor_availability_${advisor.id}`);
        if (savedAvailability) {
          try {
            const parsed = JSON.parse(savedAvailability);
            // Check if day is active
            const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
            if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
              parsed.availableSlots.forEach(slot => activeSlotsSet.add(slot));
            }
          } catch (e) {}
        }
      });

      if (activeSlotsSet.size > 0) {
        const list = Array.from(activeSlotsSet);
        const parseTimeToMinutes = (timeStr) => {
          const [time, meridiem] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (meridiem === 'PM' && hours !== 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        return list.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
      }

      return [];
    } catch (err) {
      console.error("Error generating dynamic slots", err);
      return [];
    }
  };

  const getAdvisorAvailabilityStatus = (advisorId, dateStr, timeStr) => {
    if (!dateStr || !timeStr) return 'Available';
    const dayOfWeek = new Date(dateStr).getDay();

    const savedAvailability = localStorage.getItem(`behold_advisor_availability_${advisorId}`);
    if (!savedAvailability) {
      return 'Unavailable';
    }

    try {
      const parsed = JSON.parse(savedAvailability);
      const isDayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
      const isSlotActive = parsed.availableSlots && parsed.availableSlots.includes(timeStr);
      if (isDayActive && isSlotActive) {
        return 'Available';
      }
    } catch (e) {}

    return 'Unavailable';
  };

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
    if (selectedDate && selectedTime) {
      setSelectedAdvisor(null);
      setAdvisorConfirmed(false);
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
    if (preselectedAdvisorId && advisors.length > 0) {
      const found = advisors.find(a => a.id === preselectedAdvisorId);
      if (found) {
        setBookingService(found.type); // Dynamically set based on advisor type (counselling or career)
        setSelectedAdvisor(found);
        setAdvisorConfirmed(true);
        if (found.modes && found.modes.length > 0 && !found.modes.includes(bookingMode)) {
          setBookingMode(found.modes[0]);
        }
        
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
  }, [preselectedAdvisorId, clearPreselectedAdvisor, advisors]);

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
      // Persist the booking to localStorage
      try {
        const stored = localStorage.getItem('behold_booked_sessions');
        let currentBookings = [];
        if (stored) {
          try { currentBookings = JSON.parse(stored); } catch (ex) {}
        }

        const newBooking = {
          id: 'sb_' + Date.now(),
          userId: user ? user.id : 'guest_' + Date.now(),
          userName: bookingForm.name || (user ? user.name : 'Guest User'),
          email: bookingForm.email || (user ? user.email : ''),
          phone: bookingForm.phone || '',
          service: bookingService,
          mode: bookingMode,
          date: selectedDate,
          time: selectedTime,
          advisorId: selectedAdvisor ? selectedAdvisor.id : '',
          advisorName: selectedAdvisor ? selectedAdvisor.name : 'Unknown Advisor',
          advisorRole: selectedAdvisor ? selectedAdvisor.role : 'Consultant',
          status: 'CONFIRMED',
          meetLink: selectedAdvisor ? (selectedAdvisor.defaultMeetLink || '') : '',
          created_at: new Date().toISOString()
        };

        currentBookings.unshift(newBooking);
        localStorage.setItem('behold_booked_sessions', JSON.stringify(currentBookings));
      } catch (ex) {
        console.error("Failed to save booking to localStorage", ex);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      handleStepChange('success');
    }, 1500);
  };

  const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
  const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20 bg-white text-zinc-900 text-left font-sans border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

        {/* Header */}
        <div className="text-center flex flex-col items-center space-y-4">
          <span className="text-[10px] bg-zinc-900 text-white px-3.5 py-1 rounded-md uppercase tracking-wider font-extrabold w-fit block">
            booking engine
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black tracking-tight leading-none text-zinc-900 uppercase">
            Session Booking
          </h1>
          <p className="text-zinc-650 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed font-light">
            Select your service, choose your preferred mode, and configure your session details below.
          </p>
        </div>

        {/* BOOKING CONSOLE */}
        {!user ? (
          <div className="border border-zinc-200 p-5 sm:p-14 bg-white space-y-6 rounded-lg text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 shadow-xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <Lock className="w-12 h-12 text-brand mx-auto relative z-10" />
            <div className="space-y-2 relative z-10">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-900">Authentication Required</h2>
              <p className="text-xs sm:text-sm text-zinc-600">Please sign in or create an account to book your counselling or career guidance sessions.</p>
            </div>
            <button
              onClick={onOpenAuth}
              className="relative z-10 px-8 py-3.5 bg-gradient-brand hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-md border-none"
            >
              Sign In to Continue
            </button>
          </div>
        ) : (
          <div id="booking-console" className="border border-zinc-200/80 p-3.5 sm:p-8 bg-white/70 backdrop-blur-md space-y-6 sm:space-y-8 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-zinc-900">
                Configure Your Session
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded border border-zinc-200">
                <Info className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>Step-by-step guidance is dynamic based on your selections below.</span>
              </div>
            </div>

            {/* Interactive Dynamic Journey Stepper */}
            {!isSuccess && (
              <div className="bg-zinc-50 border border-zinc-200 p-4 sm:p-5 rounded-lg space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-zinc-900">
                      Session Flow: {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Counselling'} ({bookingMode.replace('_', ' ')})
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-light">Interactive Booking Guide</span>
                </div>

                <div className="flex overflow-x-auto snap-x scrollbar-none gap-4 pb-2 lg:grid lg:grid-cols-5 lg:gap-6 w-full">
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
                      <div key={idx} className="flex lg:flex-col items-start gap-3 lg:gap-2 relative shrink-0 snap-start w-[240px] lg:w-auto">
                        <div className="flex items-center lg:w-full">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] border transition-all duration-300 shrink-0 ${
                            isCompleted
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : isActive
                                ? 'bg-brand border-brand text-zinc-955 shadow-xs ring-2 ring-brand/10 font-black'
                                : 'bg-white border-zinc-200 text-zinc-400'
                          }`}>
                            {idx + 1}
                          </div>
                          {idx < 4 && (
                            <div className={`hidden lg:block h-0.5 w-full ml-2 transition-all duration-300 ${
                              isCompleted ? 'bg-zinc-900' : 'bg-zinc-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-brand-dark' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {idx === 0 ? 'Schedule' : idx === 1 ? 'Advisor' : idx === 2 ? 'Details' : idx === 3 ? 'Reminders' : 'Session'}
                          </span>
                          <span className={`text-[10px] font-light leading-tight transition-colors duration-300 mt-0.5 ${isActive ? 'text-zinc-900 font-normal' : 'text-zinc-650'}`}>
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
              <div className="p-5 sm:p-8 bg-zinc-50 border border-zinc-200 text-center rounded-lg space-y-4 max-w-xl mx-auto animate-in fade-in duration-500">
                <h3 className="text-lg font-bold uppercase text-zinc-900">Session Successfully Booked!</h3>
                <p className="text-xs text-zinc-650 max-w-md mx-auto leading-relaxed">
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
                  className="px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold uppercase tracking-wider rounded-lg transition cursor-pointer w-full sm:w-auto text-center"
                >
                  Book Another Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start text-xs font-medium">

                {/* Left Column: Flow Inputs */}
                <div className="lg:col-span-6 space-y-6">

                  {/* 1. Date & Time Selectors */}
                  <div className="space-y-1">
                    <label className="text-zinc-500 uppercase tracking-wide block font-semibold">1. Select Date & Time Slot</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wide flex items-center gap-1">
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
                          className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                        />
                        {errors.date && <p className="text-[10px] text-red-500 font-semibold">{errors.date}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="text-zinc-500 uppercase tracking-wide flex items-center justify-between gap-1 w-full text-[10px] font-bold">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Time Slot</span>
                          <span className="text-[9px] font-extrabold text-brand-dark bg-brand-light border border-brand/20 px-2 py-0.5 rounded tracking-widest uppercase font-mono">1 hour session</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {getAvailableSlotsForDate(selectedDate, bookingService).length > 0 ? (
                            getAvailableSlotsForDate(selectedDate, bookingService).map(time => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(time);
                                  if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                                }}
                                className={`py-2 px-1 text-xs uppercase font-bold border rounded-lg transition cursor-pointer text-center ${
                                  selectedTime === time 
                                    ? 'bg-gradient-brand text-zinc-955 border-none shadow-xs font-black scale-102' 
                                    : 'bg-white border-zinc-200 text-zinc-650 hover:border-brand/50'
                                }`}
                              >
                                {time}
                              </button>
                            ))
                          ) : (
                            <p className="text-[10px] text-rose-500 font-bold col-span-2 pt-2 text-center w-full">
                              No slots available for this therapist on this date.
                            </p>
                          )}
                        </div>
                        {errors.time && <p className="text-[10px] text-red-500 font-semibold">{errors.time}</p>}
                      </div>
                    </div>
                  </div>

                  {/* 2. Select Service & Mode */}
                  <div className="space-y-1">
                    <label className="text-zinc-500 uppercase tracking-wide block font-semibold">2. Select Service & Mode</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wider block text-[10px] font-bold mb-1">Service Type</label>
                        <select
                          value={bookingService}
                          onChange={(e) => setBookingService(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition cursor-pointer"
                        >
                          <option value="counselling">Psychological Counselling</option>
                          <option value="career">Career Counselling</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wider block text-[10px] font-bold mb-1">Mode of Session</label>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {['ONLINE', 'DOOR_STEP', 'OFFLINE'].map((m) => {
                            const isSupported = !selectedAdvisor || (selectedAdvisor.modes && selectedAdvisor.modes.includes(m));
                            return (
                              <button
                                type="button"
                                key={m}
                                disabled={!isSupported}
                                onClick={() => setBookingMode(m)}
                                className={`py-2 px-1 sm:py-2.5 text-[8px] min-[370px]:text-[10px] uppercase font-bold border rounded-lg transition cursor-pointer ${
                                  !isSupported
                                    ? 'bg-zinc-100 border-zinc-200 text-zinc-300 cursor-not-allowed opacity-40'
                                    : bookingMode === m
                                      ? 'bg-gradient-brand text-zinc-955 border-none shadow-xs font-black'
                                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                                }`}
                              >
                                {m.replace('_', ' ')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-zinc-500 uppercase tracking-wide block font-semibold">3. Select Advisor</label>
                    <div className="space-y-2">
                      {advisors
                        .filter(advisor => advisor.type === bookingService)
                        .filter(advisor => !advisor.modes || advisor.modes.includes(bookingMode))
                        .map((advisor) => {
                        const availabilityStatus = getAdvisorAvailabilityStatus(advisor.id, selectedDate, selectedTime);
                        
                        // Get available slots for this specific advisor on the selected date
                        let advisorSlotsOnDate = [];
                        if (selectedDate) {
                          const dayOfWeek = new Date(selectedDate).getDay();
                          const savedAvailability = localStorage.getItem(`behold_advisor_availability_${advisor.id}`);
                          if (savedAvailability) {
                            try {
                              const parsed = JSON.parse(savedAvailability);
                              const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
                              if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
                                advisorSlotsOnDate = [...parsed.availableSlots];
                              }
                            } catch (e) {}
                          }
                        }

                        return (
                          <div
                            key={advisor.id}
                            onClick={() => {
                              setSelectedAdvisor(advisor);
                              setAdvisorConfirmed(false);
                              if (errors.advisor) {
                                setErrors(prev => ({ ...prev, advisor: null }));
                              }
                              if (advisor.modes && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
                                setBookingMode(advisor.modes[0]);
                              }
                            }}
                            className={`p-3 border rounded-lg flex flex-wrap items-center justify-between gap-2.5 cursor-pointer transition ${selectedAdvisor?.id === advisor.id
                              ? 'bg-brand/5 border-brand shadow-xs'
                              : 'bg-white border-zinc-200 hover:border-brand/40 hover:bg-zinc-50'
                              }`}
                          >
                            <div>
                              <h4 className="font-bold text-zinc-900">{advisor.name}</h4>
                              <p className="text-[10px] text-zinc-500">{advisor.role}</p>
                              {selectedDate && (
                                <p className="text-[9.5px] text-zinc-500 mt-1.5 bg-zinc-50 border border-zinc-150 px-2 py-1 rounded inline-block">
                                  <span className="font-semibold text-zinc-750">Available Slots:</span>{' '}
                                  {advisorSlotsOnDate.length > 0 ? (
                                    <span className="text-brand-dark font-bold">{advisorSlotsOnDate.join(', ')}</span>
                                  ) : (
                                    <span className="text-rose-500 font-bold">No slots active on this day</span>
                                  )}
                                </p>
                              )}
                            </div>
                            {availabilityStatus === 'Available' ? (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-750 border border-emerald-200 font-black uppercase shrink-0">Available</span>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-rose-50 text-rose-650 border border-rose-200 font-bold uppercase shrink-0">Unavailable</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {errors.advisor && <p className="text-[10px] text-red-500 font-semibold">{errors.advisor}</p>}

                    {/* Confirm Toggle */}
                    {selectedAdvisor && (() => {
                      const isSelectedAdvisorAvailable = getAdvisorAvailabilityStatus(selectedAdvisor.id, selectedDate, selectedTime) === 'Available';
                      return (
                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-2.5 animate-in zoom-in-95 duration-200 text-left">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] text-zinc-600 font-semibold">
                              Selected Advisor: <strong>{selectedAdvisor.name}</strong>
                            </span>
                            {isSelectedAdvisorAvailable ? (
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
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${advisorConfirmed
                                  ? 'bg-brand/10 border border-brand/20 text-brand-dark font-extrabold'
                                  : 'bg-gradient-brand text-zinc-955 shadow-sm hover:opacity-95 border-none font-black'
                                  }`}
                              >
                                {advisorConfirmed ? 'Confirmed' : 'Confirm'}
                              </button>
                            ) : (
                              <span className="text-[9px] px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-600 font-black uppercase tracking-wide shrink-0">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {!isSelectedAdvisorAvailable && (
                            <div className="p-3 bg-rose-50/50 border border-rose-200/60 rounded-lg text-[10px] text-rose-900 font-medium">
                              <strong>{selectedAdvisor.name}</strong> is not available at {selectedTime} on {selectedDate}. Please select another time slot or advisor to proceed.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {errors.confirm && <p className="text-[10px] text-red-500 font-semibold">{errors.confirm}</p>}
                  </div>
                </div>

                {/* Right Column: User Details */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-4 sm:p-6 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900">4. User Details</h3>

                    {isAutofilled && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] flex items-center gap-1.5">
                        Details auto-filled from your Student Profile.
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wide">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={bookingForm.name}
                          onChange={handleInputChange}
                          placeholder="Student Name"
                          className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                        />
                        {errors.name && <p className="text-red-500 font-bold">{errors.name}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wide">Mobile Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile"
                          className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                        />
                        {errors.phone && <p className="text-red-500 font-bold">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-zinc-500 uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={bookingForm.email}
                          onChange={handleInputChange}
                          placeholder="name@email.com"
                          className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                        />
                        {errors.email && <p className="text-red-500 font-bold">{errors.email}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-zinc-400" /> Integrated Payment Link and Login</span>
                      <span className="font-bold text-zinc-800">Secure Auth</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-brand hover:opacity-95 text-zinc-955 font-bold text-sm uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-sm border-none"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-zinc-955/25 border-t-zinc-955 rounded-full animate-spin"></div>
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

                  <div className="flex gap-3 bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-[10px] text-zinc-500 items-start">
                    <Bell className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-800 font-semibold block">Reminder & Post-Session Recaps</span>
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
