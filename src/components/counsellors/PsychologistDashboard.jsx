import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, BookOpen, Link, ShieldAlert, Award, Globe,
  Edit, Video, BarChart3, AlertCircle, Save, LogOut,
  X, ChevronRight, Mail, Shield, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';

export default function PsychologistDashboard({ setView }) {
  const { user, login, register, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('overview'); // overview, profile, availability, bookings
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleNavClick = (section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false);
  };

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    role: 'Consultant Psychologist',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
  });

  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [bookings, setBookings] = useState([]);

  // Availability state
  const [activeDays, setActiveDays] = useState({
    1: true, // Monday
    2: true, // Tuesday
    3: true, // Wednesday
    4: true, // Thursday
    5: true, // Friday
    6: false, // Saturday
    0: false  // Sunday
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('00');
  const [customPeriod, setCustomPeriod] = useState('AM');
  const [slotError, setSlotError] = useState('');
  const [isAvailabilitySaved, setIsAvailabilitySaved] = useState(false);

  // Input meeting link state per booking
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [meetLinkError, setMeetLinkError] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [activeBookingTab, setActiveBookingTab] = useState('CONFIRMED'); // CONFIRMED, COMPLETED, CANCELLED

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Onboarding & Registration Gate states
  const [gateMode, setGateMode] = useState('login'); // 'login' or 'register'
  const [onboardingStep, setOnboardingStep] = useState(1); // 1, 2, or 3

  // Registration Form States
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
  });
  const [regError, setRegError] = useState('');
  const [regActiveDays, setRegActiveDays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
  });
  const [regAvailableSlots, setRegAvailableSlots] = useState([]);
  const [regAllSlots, setRegAllSlots] = useState([]);
  const [regCustomHour, setRegCustomHour] = useState('09');
  const [regCustomMinute, setRegCustomMinute] = useState('00');
  const [regCustomPeriod, setRegCustomPeriod] = useState('AM');
  const [regSlotError, setRegSlotError] = useState('');

  // Availability time range state
  const [fromHour, setFromHour] = useState('09');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('05');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('PM');

  // Registration onboarding time range state
  const [regFromHour, setRegFromHour] = useState('09');
  const [regFromMinute, setRegFromMinute] = useState('00');
  const [regFromPeriod, setRegFromPeriod] = useState('AM');
  const [regToHour, setRegToHour] = useState('05');
  const [regToMinute, setRegToMinute] = useState('00');
  const [regToPeriod, setRegToPeriod] = useState('PM');

  const isSessionCompleted = (booking) => {
    if (booking.status === 'CANCELLED') return false;
    if (booking.status === 'COMPLETED') return true;
    
    if (booking.status === 'CONFIRMED') {
      try {
        const [year, month, day] = booking.date.split('-').map(Number);
        const timeParts = booking.time.split(' ');
        const [hoursStr, minutesStr] = timeParts[0].split(':');
        let hours = Number(hoursStr);
        const minutes = Number(minutesStr);
        const meridiem = timeParts[1];
        
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        
        const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
        return new Date() > sessionEnd;
      } catch (e) {
        console.error("Error checking session completion", e);
      }
    }
    return false;
  };

  const loadBookingsData = () => {
    try {
      const advisorId = user?.id || '';

      // Load profile
      let advisorName = user?.name || 'Counsellor Name';
      const savedProfile = localStorage.getItem(`behold_advisor_profile_${advisorId}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile({
            ...parsed,
            modes: parsed.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP']
          });
          if (parsed.name) advisorName = parsed.name;
        } catch (e) { }
      } else {
        setProfile(prev => ({
          ...prev,
          name: advisorName,
          hours: 0
        }));
      }

      // Load availability
      const savedAvailability = localStorage.getItem(`behold_advisor_availability_${advisorId}`);
      if (savedAvailability) {
        try {
          const parsed = JSON.parse(savedAvailability);
          if (parsed.activeDays) setActiveDays(parsed.activeDays);
          if (parsed.availableSlots) {
            setAvailableSlots(parsed.availableSlots);
            // Ensure any saved custom slot is also added to the list of displayed slots
            setAllSlots(prev => {
              const merged = [...prev];
              parsed.availableSlots.forEach(slot => {
                if (!merged.includes(slot)) {
                  merged.push(slot);
                }
              });
              return merged;
            });
          }
        } catch (e) { }
      }

      // Load bookings
      const stored = localStorage.getItem('behold_booked_sessions');
      let list = [];
      if (stored) {
        try { list = JSON.parse(stored); } catch (e) { }
      }

      // Filter out mock bookings to ensure clean slate
      const cleanList = list.filter(b => b.id !== 'sb_mock_1' && b.id !== 'sb_mock_2' && b.id !== 'sb_mock_c1');
      if (cleanList.length !== list.length) {
        localStorage.setItem('behold_booked_sessions', JSON.stringify(cleanList));
        list = cleanList;
      }

      // Filter bookings only for this advisor
      const myBookings = list.filter(b => {
        const matchesId = b.advisorId === advisorId;
        const matchesName = b.advisorName && b.advisorName.toLowerCase().includes(advisorName.toLowerCase());
        return matchesId || matchesName;
      });
      setBookings(myBookings);
    } catch (err) {
      console.error("Failed loading counsellor bookings", err);
    }
  };

  // Load advisor details & bookings from localStorage
  useEffect(() => {
    loadBookingsData();

    const handleStorageChange = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      const advisorId = user?.id || '';
      if (
        key === 'behold_booked_sessions' ||
        key === `behold_advisor_profile_${advisorId}` ||
        key === `behold_advisor_availability_${advisorId}`
      ) {
        loadBookingsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
    };
  }, [user]);

  // Auto-refresh bookings when switching to bookings or overview tab
  useEffect(() => {
    if (currentSection === 'bookings' || currentSection === 'overview') {
      loadBookingsData();
    }
  }, [currentSection]);

  // Onboarding Step Handlers
  const handleStepOneNext = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regForm.name.trim() || !regForm.email.trim() || !regForm.password || !regForm.confirmPassword) {
      setRegError("All fields are required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regForm.email)) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (regForm.password.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    // Check if email already exists
    const registeredUsers = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    if (registeredUsers.some(u => u.email === regForm.email)) {
      setRegError("Email is already registered.");
      return;
    }

    setOnboardingStep(2);
  };

  const handleStepTwoNext = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regForm.education.trim() || !regForm.specialties.trim() || !regForm.bio.trim()) {
      setRegError("Education, Specialties, and Bio are required.");
      return;
    }
    if (!regForm.modes || regForm.modes.length === 0) {
      setRegError("Please select at least one supported session mode.");
      return;
    }
    if (Number(regForm.price) <= 0) {
      setRegError("Hourly price must be greater than 0.");
      return;
    }

    setOnboardingStep(3);
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsLoggingIn(true);

    if (!regAvailableSlots || regAvailableSlots.length === 0) {
      setRegError("Please configure at least one availability slot to complete registration.");
      setIsLoggingIn(false);
      return;
    }

    try {
      const registeredUser = await register(
        regForm.name.trim(),
        regForm.email.trim(),
        regForm.password,
        'PSYCHOLOGIST'
      );

      const newId = registeredUser.id;

      const newProfile = {
        name: regForm.name.trim(),
        role: 'Consultant Psychologist',
        education: regForm.education.trim(),
        specialties: regForm.specialties.trim(),
        price: Number(regForm.price) || 1200,
        lang: regForm.lang.trim(),
        bio: regForm.bio.trim(),
        defaultMeetLink: regForm.defaultMeetLink.trim(),
        hours: Number(regForm.hours) || 0,
        modes: regForm.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP']
      };
      localStorage.setItem(`behold_advisor_profile_${newId}`, JSON.stringify(newProfile));

      // Propagate defaultMeetLink to pre-existing bookings
      try {
        const stored = localStorage.getItem('behold_booked_sessions');
        if (stored) {
          let allBookings = JSON.parse(stored);
          let updated = false;
          const newMeetLink = newProfile.defaultMeetLink;
          allBookings = allBookings.map(b => {
            const matchesId = b.advisorId === newId;
            const matchesName = b.advisorName && newProfile.name && b.advisorName.toLowerCase().trim() === newProfile.name.toLowerCase().trim();
            if (matchesId || matchesName) {
              if (b.meetLink !== newMeetLink) {
                updated = true;
                return { ...b, meetLink: newMeetLink, advisorId: newId };
              }
            }
            return b;
          });
          if (updated) {
            localStorage.setItem('behold_booked_sessions', JSON.stringify(allBookings));
          }
        }
      } catch (err) {
        console.error("Failed to propagate meet link in onboarding:", err);
      }

      localStorage.setItem(`behold_advisor_availability_${newId}`, JSON.stringify({
        activeDays: regActiveDays,
        availableSlots: regAvailableSlots
      }));

      await login(regForm.email.trim(), regForm.password);

      setRegForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        education: '',
        specialties: '',
        price: '',
        lang: '',
        bio: '',
        defaultMeetLink: '',
        hours: 0,
        modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
      });
      setOnboardingStep(1);
      setGateMode('login');
    } catch (err) {
      setRegError(err.message || "Failed to complete counsellor onboarding.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const toggleRegDay = (dayIndex) => {
    setRegActiveDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  // Auth Submit Handlers
  const handleCounsellorLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      if (loggedInUser.role !== 'PSYCHOLOGIST') {
        logout();
        setLoginError('Access Denied: Account does not have Counsellor privileges.');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid counsellor credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const advisorId = user?.id || 't2';
    localStorage.setItem(`behold_advisor_profile_${advisorId}`, JSON.stringify(profile));

    // Propagate defaultMeetLink to all matching bookings
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      if (stored) {
        let allBookings = JSON.parse(stored);
        let updated = false;
        const newMeetLink = profile.defaultMeetLink || '';

        allBookings = allBookings.map(b => {
          const matchesId = b.advisorId === advisorId;
          const matchesName = b.advisorName && profile.name && b.advisorName.toLowerCase().trim() === profile.name.toLowerCase().trim();
          if (matchesId || matchesName) {
            if (b.meetLink !== newMeetLink) {
              updated = true;
              return { ...b, meetLink: newMeetLink, advisorId };
            }
          }
          return b;
        });

        if (updated) {
          localStorage.setItem('behold_booked_sessions', JSON.stringify(allBookings));
          // Update the local bookings state
          const myBookings = allBookings.filter(b => {
            const matchesId = b.advisorId === advisorId;
            const matchesName = b.advisorName && profile.name && b.advisorName.toLowerCase().trim() === profile.name.toLowerCase().trim();
            return matchesId || matchesName;
          });
          setBookings(myBookings);
        }
      }
    } catch (err) {
      console.error("Failed to propagate meet link updates:", err);
    }

    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleAvailabilitySave = (e) => {
    e.preventDefault();
    setSlotError('');
    if (!availableSlots || availableSlots.length === 0) {
      setSlotError("Please configure at least one availability slot to save.");
      return;
    }
    const advisorId = user?.id || 't2';
    localStorage.setItem(`behold_advisor_availability_${advisorId}`, JSON.stringify({ activeDays, availableSlots }));
    setIsAvailabilitySaved(true);
    setTimeout(() => setIsAvailabilitySaved(false), 3000);
  };

  const parseTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const hourStr = String(hours).padStart(2, '0');
    const minStr = String(mins).padStart(2, '0');
    return `${hourStr}:${minStr} ${period}`;
  };

  const addTimeRangeSlots = (fromStr, toStr, isReg = false) => {
    const fromMins = parseTimeToMinutes(fromStr);
    const toMins = parseTimeToMinutes(toStr);
    if (fromMins >= toMins) {
      const err = 'Start time must be before end time.';
      if (isReg) setRegSlotError(err); else setSlotError(err);
      return;
    }

    const generated = [];
    // Generate every 60 minutes (1 hour)
    for (let m = fromMins; m <= toMins; m += 60) {
      generated.push(formatMinutesToTime(m));
    }

    if (isReg) {
      setRegAllSlots(prev => {
        const merged = [...prev];
        generated.forEach(slot => {
          if (!merged.includes(slot)) merged.push(slot);
        });
        return merged;
      });
      setRegAvailableSlots(prev => {
        const merged = [...prev];
        generated.forEach(slot => {
          if (!merged.includes(slot)) merged.push(slot);
        });
        return merged;
      });
    } else {
      setAllSlots(prev => {
        const merged = [...prev];
        generated.forEach(slot => {
          if (!merged.includes(slot)) merged.push(slot);
        });
        return merged;
      });
      setAvailableSlots(prev => {
        const merged = [...prev];
        generated.forEach(slot => {
          if (!merged.includes(slot)) merged.push(slot);
        });
        return merged;
      });
    }
  };

  const handleAddCustomSlot = () => {
    setSlotError('');
    const slotStr = `${customHour}:${customMinute} ${customPeriod}`;
    if (allSlots.includes(slotStr)) {
      setSlotError('This slot already exists.');
      return;
    }
    setAllSlots(prev => [...prev, slotStr]);
    setAvailableSlots(prev => [...prev, slotStr]); // Add and select it
  };

  const handleRemoveSlot = (slot) => {
    setAllSlots(prev => prev.filter(s => s !== slot));
    setAvailableSlots(prev => prev.filter(s => s !== slot));
  };

  const handleAddRegCustomSlot = () => {
    setRegSlotError('');
    const slotStr = `${regCustomHour}:${regCustomMinute} ${regCustomPeriod}`;
    if (regAllSlots.includes(slotStr)) {
      setRegSlotError('This slot already exists.');
      return;
    }
    setRegAllSlots(prev => [...prev, slotStr]);
    setRegAvailableSlots(prev => [...prev, slotStr]);
  };

  const handleRemoveRegSlot = (slot) => {
    setRegAllSlots(prev => prev.filter(s => s !== slot));
    setRegAvailableSlots(prev => prev.filter(s => s !== slot));
  };

  // Google Meet Link editing
  const startEditMeetLink = (booking) => {
    setEditingBookingId(booking.id);
    setMeetLinkInput(booking.meetLink || profile.defaultMeetLink || '');
    setMeetLinkError('');
  };

  const saveMeetLink = (bookingId) => {
    const trimmed = meetLinkInput.trim();
    if (trimmed && !trimmed.startsWith('https://')) {
      setMeetLinkError('Please enter a valid URL beginning with https://');
      return;
    }
    setMeetLinkError('');

    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let allBookings = [];
      if (stored) {
        try { allBookings = JSON.parse(stored); } catch (e) { }
      }

      const updatedAll = allBookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, meetLink: trimmed };
        }
        return b;
      });

      localStorage.setItem('behold_booked_sessions', JSON.stringify(updatedAll));
      loadBookingsData();
      setEditingBookingId(null);
    } catch (err) {
      console.error("Failed to save Meet link", err);
    }
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let allBookings = [];
      if (stored) {
        try { allBookings = JSON.parse(stored); } catch (e) { }
      }

      const updatedAll = allBookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, status: newStatus };
        }
        return b;
      });

      localStorage.setItem('behold_booked_sessions', JSON.stringify(updatedAll));
      loadBookingsData();
    } catch (err) {
      console.error("Failed to update booking status", err);
    }
  };

  const saveFeedback = (bookingId) => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let allBookings = [];
      if (stored) {
        try { allBookings = JSON.parse(stored); } catch (e) { }
      }

      const updatedAll = allBookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, feedback: feedbackInput.trim() };
        }
        return b;
      });

      localStorage.setItem('behold_booked_sessions', JSON.stringify(updatedAll));
      loadBookingsData();
      setEditingFeedbackId(null);
    } catch (err) {
      console.error("Failed to save feedback", err);
    }
  };

  const toggleDay = (dayIndex) => {
    setActiveDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  const DAYS_OF_WEEK = [
    { label: 'Monday', index: 1 },
    { label: 'Tuesday', index: 2 },
    { label: 'Wednesday', index: 3 },
    { label: 'Thursday', index: 4 },
    { label: 'Friday', index: 5 },
    { label: 'Saturday', index: 6 },
    { label: 'Sunday', index: 0 }
  ];

  // Check role authorization
  const isCounsellor = user && user.role === 'PSYCHOLOGIST';

  // --- 1. COUNSELLOR PORTAL LOGIN GATE ---
  if (!isCounsellor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-left">
        {/* Glowing background shapes */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-header font-black tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </h1>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">COUNSELLOR CENTRAL PORTAL</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            {/* Header Tabs */}
            <div className="flex border-b border-zinc-800 pb-1">
              <button
                type="button"
                onClick={() => setGateMode('login')}
                className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-black transition-colors ${gateMode === 'login' ? 'text-brand border-b-2 border-brand' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setGateMode('register'); setOnboardingStep(1); setRegError(''); }}
                className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-black transition-colors ${gateMode === 'register' ? 'text-brand border-b-2 border-brand' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Register Consultant
              </button>
            </div>

            {gateMode === 'login' ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Counsellor Sign In</h2>
                  <p className="text-[10px] text-zinc-500 leading-none">Access schedules, update clinic slots, and edit video rooms.</p>
                </div>

                <form onSubmit={handleCounsellorLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="counsellor@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                    />
                  </div>

                  {loginError && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
                  >
                    {isLoggingIn ? 'Connecting...' : 'Enter Consultant Desk'}
                  </button>
                </form>

              </div>
            ) : (
              // REGISTRATION STEP-BY-STEP FLOW
              <div className="space-y-6">
                {/* Stepper Indicators */}
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider border-b border-zinc-850 pb-3">
                  <span className={onboardingStep === 1 ? "text-indigo-400" : "text-zinc-550"}>1. Account Details</span>
                  <span className="text-zinc-700">→</span>
                  <span className={onboardingStep === 2 ? "text-indigo-400" : "text-zinc-550"}>2. Qualifications</span>
                  <span className="text-zinc-700">→</span>
                  <span className={onboardingStep === 3 ? "text-indigo-400" : "text-zinc-550"}>3. Schedule</span>
                </div>

                {onboardingStep === 1 && (
                  <form onSubmit={handleStepOneNext} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Sandra Tomy"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="counsellor@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Confirm</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-855 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {regError && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{regError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                    >
                      Next: Clinical Details
                    </button>
                  </form>
                )}

                {onboardingStep === 2 && (
                  <form onSubmit={handleStepTwoNext} className="space-y-4 font-medium">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Education Details</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PhD Clinical Psychology"
                          value={regForm.education}
                          onChange={(e) => setRegForm({ ...regForm, education: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Languages Spoken</label>
                        <input
                          type="text"
                          required
                          placeholder="Malayalam, English, Tamil"
                          value={regForm.lang}
                          onChange={(e) => setRegForm({ ...regForm, lang: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Hourly Session Fee (INR)</label>
                      <input
                        type="number"
                        required
                        placeholder="1200"
                        value={regForm.price}
                        onChange={(e) => setRegForm({ ...regForm, price: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Specialties (comma-separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="Anxiety, Relationship Dynamics, Career Stress"
                        value={regForm.specialties}
                        onChange={(e) => setRegForm({ ...regForm, specialties: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Default Google Meet Link (optional)</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={regForm.defaultMeetLink}
                        onChange={(e) => setRegForm({ ...regForm, defaultMeetLink: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block text-left">Supported Session Modes</label>
                      <div className="flex gap-4 pt-0.5 justify-start text-left">
                        {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                          const isSelected = regForm.modes?.includes(mode);
                          return (
                            <label key={mode} className="flex items-center gap-1.5 cursor-pointer text-xs text-white select-none">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  let nextModes = [...(regForm.modes || [])];
                                  if (e.target.checked) {
                                    if (!nextModes.includes(mode)) nextModes.push(mode);
                                  } else {
                                    nextModes = nextModes.filter(m => m !== mode);
                                  }
                                  setRegForm({ ...regForm, modes: nextModes });
                                }}
                                className="w-3.5 h-3.5 rounded border-zinc-850 bg-zinc-950 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                              />
                              <span>{mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Professional Bio</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe your clinical expertise and background..."
                        value={regForm.bio}
                        onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-xs text-white outline-none transition-colors resize-none"
                      />
                    </div>

                    {regError && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{regError}</p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(1)}
                        className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                      >
                        Next: Calendar
                      </button>
                    </div>
                  </form>
                )}

                {onboardingStep === 3 && (
                  <form onSubmit={handleCompleteOnboarding} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-zinc-400 uppercase tracking-wider font-bold text-[9px] block">Operational Days</label>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map(day => {
                          const active = regActiveDays[day.index];
                          return (
                            <button
                              key={day.index}
                              type="button"
                              onClick={() => toggleRegDay(day.index)}
                              className={`px-3 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${active
                                ? 'bg-brand text-zinc-955 font-black border-none'
                                : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:border-zinc-750'
                                }`}
                            >
                              {day.label.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-800 pt-3 text-left">
                      <label className="text-zinc-400 uppercase tracking-wider font-bold text-[9px] block">Timing Slots (Active)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
                        {regAllSlots.map(slot => {
                          const exists = regAvailableSlots.includes(slot);
                          return (
                            <div key={slot} className="flex items-center gap-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  if (exists) {
                                    setRegAvailableSlots(prev => prev.filter(s => s !== slot));
                                  } else {
                                    setRegAvailableSlots(prev => [...prev, slot]);
                                  }
                                }}
                                className={`flex-1 py-2.5 border rounded-lg font-black transition cursor-pointer text-[10px] ${exists
                                  ? 'bg-brand/10 border-brand text-brand'
                                  : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750'
                                  }`}
                              >
                                {slot}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRegSlot(slot)}
                                className="px-2.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:bg-rose-950/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-[9px] font-bold uppercase transition cursor-pointer shrink-0 font-header"
                                title="Remove Slot"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                        {regAllSlots.length === 0 && (
                          <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-xl text-zinc-500 italic text-[10px] text-center w-full">
                            No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-800 pt-3 text-left">
                      <label className="text-zinc-400 uppercase tracking-wider font-bold text-[9px] block">Add Custom Timing Slot</label>
                      <div className="flex gap-1.5 items-end">
                        <div className="flex-1 space-y-0.5">
                          <label className="text-[7.5px] text-zinc-400 uppercase tracking-wider font-bold block">Hour</label>
                          <select
                            value={regCustomHour}
                            onChange={(e) => setRegCustomHour(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <label className="text-[7.5px] text-zinc-400 uppercase tracking-wider font-bold block">Minute</label>
                          <select
                            value={regCustomMinute}
                            onChange={(e) => setRegCustomMinute(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <label className="text-[7.5px] text-zinc-400 uppercase tracking-wider font-bold block">AM/PM</label>
                          <select
                            value={regCustomPeriod}
                            onChange={(e) => setRegCustomPeriod(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddRegCustomSlot}
                          className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[28.5px] flex items-center justify-center font-header"
                        >
                          Add Slot
                        </button>
                      </div>
                      {regSlotError && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wide font-mono mt-1">{regSlotError}</p>}
                    </div>

                    <div className="space-y-2 border-t border-zinc-800 pt-3 text-left">
                      <label className="text-zinc-400 uppercase tracking-wider font-bold text-[9px] block">Add Custom Time Range (From / To)</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1.5 items-end">
                          <span className="text-[8.5px] text-zinc-550 font-bold pb-1.5 uppercase tracking-wide w-8 text-left">From:</span>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regFromHour}
                              onChange={(e) => setRegFromHour(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regFromMinute}
                              onChange={(e) => setRegFromMinute(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regFromPeriod}
                              onChange={(e) => setRegFromPeriod(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-1.5 items-end">
                          <span className="text-[8.5px] text-zinc-555 font-bold pb-1.5 uppercase tracking-wide w-8 text-left">To:</span>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regToHour}
                              onChange={(e) => setRegToHour(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regToMinute}
                              onChange={(e) => setRegToMinute(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regToPeriod}
                              onChange={(e) => setRegToPeriod(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-[10px] text-white outline-none focus:border-brand cursor-pointer"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRegSlotError('');
                            const fromStr = `${regFromHour}:${regFromMinute} ${regFromPeriod}`;
                            const toStr = `${regToHour}:${regToMinute} ${regToPeriod}`;
                            addTimeRangeSlots(fromStr, toStr, true);
                          }}
                          className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                        >
                          Generate Hourly Slots from Range
                        </button>
                      </div>
                    </div>

                    {regError && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{regError}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                      >
                        {isLoggingIn ? 'Creating Profile...' : 'Complete & Launch'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 2. DEDICATED LOGGED-IN COUNSELLOR CONSOLE ---
  return (
    <div className="min-h-screen bg-zinc-955 text-white font-sans text-left flex flex-col lg:flex-row relative overflow-hidden">

      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Top Navbar (Visible only on lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-5 py-4 w-full">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-zinc-955 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
            title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-header font-black text-md tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </span>
            <span className="text-[7.5px] bg-zinc-850 border border-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-black tracking-widest uppercase font-mono">
              CLINIC
            </span>
          </div>
        </div>

        {/* Profile Icon / Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileDrawerOpen(true)}
          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-indigo-500/30 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
          title="Open Profile Menu"
        >
          <User className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop (Overlay) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Left Fixed Sidebar (Drawer on Mobile, static on Desktop) */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:flex`}>
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-header font-black text-lg tracking-tighter text-white">
                BEHOLD<span className="text-brand font-black">.</span>
              </span>
              <span className="text-[8px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                CLINIC
              </span>
            </div>
            {/* Close Button inside Drawer (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 bg-zinc-955 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User profile details — click to open drawer */}
          <button
            type="button"
            onClick={() => setIsProfileDrawerOpen(true)}
            className="w-full flex items-center gap-3 bg-zinc-950/60 hover:bg-zinc-955 p-3 rounded-xl border border-zinc-850 hover:border-indigo-500/30 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-950 text-brand flex items-center justify-center font-header font-black text-xs border border-indigo-900 shrink-0">
              {(profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight uppercase font-header">
                {profile.name}
              </h4>
              <span className="text-[8px] text-zinc-550 font-black tracking-wider uppercase truncate block font-mono">
                {profile.education}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          </button>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Consultant Profile', icon: User },
              { id: 'availability', label: 'Manage Timings', icon: Clock },
              { id: 'bookings', label: 'Client Bookings', icon: Video }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = currentSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleNavClick(sec.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${isActive
                    ? 'bg-brand text-zinc-955 font-black shadow-sm'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-zinc-800 mt-6 lg:mt-0">
          <div className="bg-zinc-955/40 p-3 rounded-lg border border-zinc-850">
            <span className="text-[8px] uppercase font-black tracking-wider text-zinc-500 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Psychologist Console
            </span>
            <p className="text-[9px] text-zinc-550 leading-relaxed pt-1.5">
              Updates to pricing or timing are synced immediately with public advisor slots listings.
            </p>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-955/20 hover:bg-rose-900 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Exit Console Mode
          </button>
        </div>
      </div>

      {/* 2. Main Content Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-6 relative z-10 text-left">

        {/* Workspace Banner */}
        <div className="bg-zinc-900 border border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 relative z-10 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-header font-black tracking-wide uppercase">
                {profile.name}
              </h1>
              <span className="text-[8px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                CLINICAL STAFF
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Role: {profile.role} • Hourly Fee: ₹{profile.price}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center">
            <div className="bg-zinc-955 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Upcoming Slots</span>
              <p className="text-sm font-black text-brand mt-0.5">{bookings.filter(b => b.status === 'CONFIRMED' && !isSessionCompleted(b)).length} Bookings</p>
            </div>
            <div className="bg-zinc-955 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Hours Completed</span>
              <p className="text-sm font-black text-brand mt-0.5">{bookings.filter(isSessionCompleted).length + Number(profile.hours || 0)}+ Hrs</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-5 sm:p-8 shadow-md">

          {/* WORKSPACE 1: OVERVIEW */}
          {currentSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Psychology Dashboard Overview</h3>
                <span className="text-[9px] bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-black tracking-wider uppercase">Active Status</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Next session card */}
                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
                  <div className="space-y-3">
                    <span className="text-[8px] bg-indigo-950 text-indigo-455 border border-indigo-900 px-2 py-0.5 rounded font-black uppercase tracking-wider">Next Client Session</span>
                    {bookings.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <h4 className="font-header font-black text-sm text-white uppercase">{bookings[0].userName}</h4>
                        <p className="text-[10px] text-zinc-400">Session Type: {bookings[0].service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{bookings[0].date} at {bookings[0].time}</span>
                        </div>
                        <div className="pt-1 flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">Room Status:</span>
                          {bookings[0].meetLink ? (
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                              Link Set
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wide">
                              <AlertCircle className="w-3 h-3 text-amber-500" /> Missing Link
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-505 text-[10px] pt-1">No upcoming scheduled bookings.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {bookings.length > 0 && bookings[0].meetLink && bookings[0].mode === 'ONLINE' && (
                      <a
                        href={bookings[0].meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <Video className="w-3.5 h-3.5 text-white" />
                        <span>Join Meet</span>
                      </a>
                    )}
                    <button
                      onClick={() => setCurrentSection('bookings')}
                      className="text-[9px] font-black uppercase tracking-widest bg-brand text-zinc-950 hover:bg-brand-dark px-3.5 py-2 rounded-lg cursor-pointer border-none"
                    >
                      {bookings.length > 0 && !bookings[0].meetLink ? 'Set Meet Link' : 'Manage Bookings'}
                    </button>
                  </div>
                </div>

                {/* Pricing stats card */}
                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                  <div className="space-y-2">
                    <span className="text-[8px] bg-zinc-900 text-zinc-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Financial Rate Card</span>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between font-bold text-zinc-400">
                        <span>Hourly Booking Charge</span>
                        <span className="text-white">₹{profile.price} / Hr</span>
                      </div>
                      <div className="flex justify-between font-bold text-zinc-400">
                        <span>Consultant Credential</span>
                        <span className="text-white truncate max-w-[150px]">{profile.education}</span>
                      </div>
                      <div className="flex justify-between font-bold text-zinc-400">
                        <span>Language scope</span>
                        <span className="text-white">{profile.lang}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentSection('profile')}
                    className="w-fit text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-850 border border-zinc-800 px-4 py-2 rounded-lg mt-4 cursor-pointer"
                  >
                    Edit Profile Info
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 2: PROFILE DETAILS FORM */}
          {currentSection === 'profile' && (
            <form onSubmit={handleProfileSave} className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Consultant Psychologist Profile</h3>
                <span className="text-[10px] text-zinc-500 font-light">Clinic Records</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left font-medium">
                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sandra Tomy"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Education Credentials</label>
                  <input
                    type="text"
                    placeholder="e.g. PhD Clinical Psychology"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Session Fee (INR / Hour)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={profile.price}
                    onChange={(e) => setProfile({ ...profile, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Languages Spoken</label>
                  <input
                    type="text"
                    placeholder="Malayalam, English, Tamil"
                    value={profile.lang}
                    onChange={(e) => setProfile({ ...profile, lang: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Baseline Therapy Hours Completed</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={profile.hours || 0}
                    onChange={(e) => setProfile({ ...profile, hours: Number(e.target.value) })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Anxiety, Relationship Dynamics, Career Stress"
                    value={profile.specialties}
                    onChange={(e) => setProfile({ ...profile, specialties: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Default Google Meet Link (optional)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={profile.defaultMeetLink || ''}
                    onChange={(e) => setProfile({ ...profile, defaultMeetLink: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold block text-left">Supported Session Modes</label>
                  <div className="flex gap-4 pt-1 justify-start text-left">
                    {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                      const isSelected = profile.modes?.includes(mode);
                      return (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer text-xs text-white select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              let nextModes = [...(profile.modes || [])];
                              if (e.target.checked) {
                                if (!nextModes.includes(mode)) nextModes.push(mode);
                              } else {
                                nextModes = nextModes.filter(m => m !== mode);
                              }
                              setProfile({ ...profile, modes: nextModes });
                            }}
                            className="w-4 h-4 rounded border-zinc-850 bg-zinc-950 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                          />
                          <span>{mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Professional Biography</label>
                  <textarea
                    rows={5}
                    placeholder="Describe your clinical expertise and background..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                {isProfileSaved ? (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                    Changes Synced with public profiles!
                  </span>
                ) : <span />}
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-dark text-zinc-955 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* WORKSPACE 3: EDIT AVAILABILITY TIMINGS */}
          {currentSection === 'availability' && (
            <form onSubmit={handleAvailabilitySave} className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Manage Slot Availability</h3>
                <span className="text-[10px] text-zinc-500 font-light">Set Standard Hours</span>
              </div>

              <div className="space-y-5 text-left font-medium">
                {/* Select Days */}
                <div className="space-y-2">
                  <label className="text-zinc-400 uppercase tracking-wider font-bold block mb-1">Active Operational Days</label>
                  <div className="flex flex-wrap gap-2.5">
                    {DAYS_OF_WEEK.map(day => {
                      const active = activeDays[day.index];
                      return (
                        <button
                          key={day.index}
                          type="button"
                          onClick={() => toggleDay(day.index)}
                          className={`px-4 py-2 border rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${active
                            ? 'bg-gradient-brand border-none text-zinc-955 font-black'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-650'
                            }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Timings Checkbox */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="text-zinc-400 uppercase tracking-wider font-bold block">Select Active Timing Slots</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allSlots.map(slot => {
                      const exists = availableSlots.includes(slot);
                      return (
                        <div key={slot} className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              if (exists) {
                                setAvailableSlots(prev => prev.filter(s => s !== slot));
                              } else {
                                setAvailableSlots(prev => [...prev, slot]);
                              }
                            }}
                            className={`flex-1 p-3 border rounded-lg text-center font-black transition cursor-pointer text-xs ${exists
                              ? 'bg-brand/10 border-brand text-brand'
                              : 'bg-zinc-955 border-zinc-850 text-zinc-400'
                              }`}
                          >
                            {slot}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot)}
                            className="px-3.5 py-3 bg-zinc-955 border border-zinc-850 hover:bg-rose-955/35 hover:border-rose-900 text-zinc-450 hover:text-rose-400 rounded-lg text-xs font-bold uppercase transition cursor-pointer shrink-0"
                            title="Remove Slot"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                    {allSlots.length === 0 && (
                      <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-xl text-zinc-500 italic text-[10px] text-center w-full">
                        No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Timings Adder */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="text-zinc-400 uppercase tracking-wider font-bold block">Add Custom Timing Slot</label>
                  <div className="flex gap-2 items-end max-w-sm">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] text-zinc-550 uppercase tracking-wider font-bold block">Hour</label>
                      <select
                        value={customHour}
                        onChange={(e) => setCustomHour(e.target.value)}
                        className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                      >
                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] text-zinc-550 uppercase tracking-wider font-bold block">Minute</label>
                      <select
                        value={customMinute}
                        onChange={(e) => setCustomMinute(e.target.value)}
                        className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] text-zinc-550 uppercase tracking-wider font-bold block">AM/PM</label>
                      <select
                        value={customPeriod}
                        onChange={(e) => setCustomPeriod(e.target.value)}
                        className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[31.5px] flex items-center justify-center"
                    >
                      Add Slot
                    </button>
                  </div>
                  {slotError && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wide font-mono mt-1">{slotError}</p>}
                </div>

                {/* Custom Time Range Adder */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="text-zinc-400 uppercase tracking-wider font-bold block">Add Custom Time Range (From / To)</label>
                  <div className="flex flex-col gap-2 max-w-sm">
                    <div className="flex gap-2 items-end">
                      <span className="text-[10px] text-zinc-550 font-bold pb-2.5 uppercase tracking-wide w-10 text-left">From:</span>
                      <div className="flex-1 space-y-1">
                        <select
                          value={fromHour}
                          onChange={(e) => setFromHour(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 items-end">
                      <span className="text-[10px] text-zinc-555 font-bold pb-2.5 uppercase tracking-wide w-10 text-left">To:</span>
                      <div className="flex-1 space-y-1">
                        <select
                          value={toHour}
                          onChange={(e) => setToHour(e.target.value)}
                          className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-xs text-white outline-none focus:border-brand cursor-pointer"
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
                      className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                    >
                      Generate Hourly Slots from Range
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                {isAvailabilitySaved ? (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    Availability Matrix Synchronized!
                  </span>
                ) : slotError ? (
                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider font-mono">
                    {slotError}
                  </span>
                ) : <span />}
                <button
                  type="submit"
                  className="bg-brand hover:bg-brand-dark text-zinc-955 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Slots Matrix
                </button>
              </div>
            </form>
          )}

                  {currentSection === 'bookings' && (() => {
            const confirmedCount = bookings.filter(b => !b.status || b.status === 'CONFIRMED' || b.status === 'PENDING').length;
            const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
            const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

            const filteredBookings = bookings.filter(b => {
              const status = b.status || 'CONFIRMED';
              if (activeBookingTab === 'CONFIRMED') {
                return status === 'CONFIRMED' || status === 'PENDING';
              }
              return status === activeBookingTab;
            });

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left">
                <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Student Booking Details & Rooms</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Manage virtual consultations, update appointment statuses, and log clinic summaries.</p>
                  </div>
                  <span className="text-[9px] bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">{bookings.length} Total</span>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-2 p-1.5 bg-zinc-950/60 border border-zinc-850/50 rounded-xl max-w-md backdrop-blur-md">
                  {[
                    { id: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },
                    { id: 'COMPLETED', label: 'Completed', count: completedCount },
                    { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount }
                  ].map(tab => {
                    const isActive = activeBookingTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveBookingTab(tab.id)}
                        className={`flex-1 py-2 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 border ${
                          isActive
                            ? 'bg-brand text-zinc-955 border-brand font-black shadow-lg scale-102 shadow-brand/10'
                            : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono ${isActive ? 'bg-zinc-955/20 text-zinc-955 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={booking.status || 'CONFIRMED'}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                            className={`px-2.5 py-1 border rounded outline-none text-[8.5px] font-black uppercase tracking-wider cursor-pointer transition-all ${booking.status === 'CONFIRMED'
                              ? 'bg-emerald-955 border-emerald-900/40 text-emerald-455'
                              : booking.status === 'COMPLETED'
                                ? 'bg-indigo-955 border-indigo-900/40 text-indigo-400'
                                : 'bg-rose-955 border-rose-900/40 text-rose-400'
                              }`}
                          >
                            <option value="CONFIRMED" className="bg-zinc-950 text-emerald-400">CONFIRMED</option>
                            <option value="COMPLETED" className="bg-zinc-950 text-indigo-400">COMPLETED</option>
                            <option value="CANCELLED" className="bg-zinc-950 text-rose-400">CANCELLED</option>
                          </select>
                          <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-extrabold uppercase font-mono tracking-widest">
                            {booking.service === 'counselling' ? 'Psychological Session' : 'Career Session'}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{booking.mode}</span>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-header font-black text-sm uppercase text-white">{booking.userName}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{booking.date} at {booking.time}</span>
                          </div>
                        </div>

                        {/* Room link status block */}
                        <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500">Meeting Room:</span>
                          {booking.meetLink ? (
                            <a
                              href={booking.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-white hover:text-brand transition flex items-center gap-1.5 underline truncate max-w-[200px]"
                            >
                              <Link className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {booking.meetLink}
                            </a>
                          ) : (
                            <span className="text-[10.5px] font-semibold text-zinc-500 italic flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Link Missing. Access Locked.
                            </span>
                          )}
                        </div>

                        {/* Diagnostic Feedback Editor / Display */}
                        {booking.status === 'COMPLETED' && (
                          <div className="pt-3 mt-2 border-t border-zinc-900 space-y-2 w-full max-w-xl">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-505 block">Session Feedback & Diagnostic Notes:</span>

                            {editingFeedbackId === booking.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={feedbackInput}
                                  onChange={(e) => setFeedbackInput(e.target.value)}
                                  placeholder="Enter session feedback, guidance notes, or key recommendations for the student..."
                                  rows={3}
                                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg outline-none focus:border-brand resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveFeedback(booking.id)}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[8.5px] font-black uppercase tracking-widest cursor-pointer shadow-xs border-none"
                                  >
                                    Save Feedback
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFeedbackId(null)}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[8.5px] font-black uppercase tracking-widest cursor-pointer border-none"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {booking.feedback ? (
                                  <p className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850/50 italic leading-relaxed font-light">
                                    "{booking.feedback}"
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-zinc-500 italic">No notes added yet.</p>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFeedbackId(booking.id);
                                    setFeedbackInput(booking.feedback || '');
                                  }}
                                  className="text-[9px] font-bold text-brand hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
                                >
                                  {booking.feedback ? 'Edit Feedback' : '+ Add Diagnostic Notes'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Google Meet Input logic */}
                      <div className="shrink-0 flex items-center gap-2">
                        {editingBookingId === booking.id ? (
                          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={meetLinkInput}
                                onChange={(e) => {
                                  setMeetLinkInput(e.target.value);
                                  setMeetLinkError('');
                                }}
                                className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg outline-none w-full sm:w-[240px] focus:border-brand"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveMeetLink(booking.id)}
                                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer shadow-xs border-none"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingBookingId(null)}
                                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest cursor-pointer border-none"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                            {meetLinkError && (
                              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono mt-0.5">{meetLinkError}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {booking.meetLink && booking.mode === 'ONLINE' && (
                              <a
                                href={booking.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5 text-white" />
                                <span>Join Meet</span>
                              </a>
                            )}
                            <button
                              onClick={() => startEditMeetLink(booking)}
                              className="px-4.5 py-3 bg-brand hover:bg-brand-dark text-zinc-955 rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1 shadow-xs border-none font-sans font-extrabold"
                            >
                              <Edit className="w-3.5 h-3.5 text-zinc-955" />
                              <span>{booking.meetLink ? 'Edit Link' : 'Set Meet Link'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-12 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
                      <Video className="w-8 h-8 text-zinc-650 mx-auto" />
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        No {activeBookingTab.toLowerCase()} sessions registered for your account yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* ── COUNSELLOR PROFILE DRAWER ──────────────────────────────── */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsProfileDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-80 bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-header font-black">My Profile</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Clinical Staff Profile</p>
              </div>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="px-6 py-6 flex flex-col items-center text-center space-y-3 border-b border-zinc-800">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-header font-black text-2xl shadow-xl">
                {(profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide font-header font-black">{profile.name}</h2>
                <span className="inline-block mt-1 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest bg-indigo-950 border border-indigo-900 text-indigo-400 font-mono">
                  Consultant Psychologist
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 py-5 space-y-4 flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono">Professional Details</p>
              <div className="bg-zinc-955/60 rounded-xl p-4 space-y-3 border border-zinc-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Email Address</p>
                    <p className="text-xs text-white font-semibold truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Education</p>
                    <p className="text-xs text-white font-semibold">{profile.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Session Fee</p>
                    <p className="text-xs text-white font-semibold">₹{profile.price} / Hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Languages</p>
                    <p className="text-xs text-white font-semibold">{profile.lang}</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              {profile.specialties && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 font-mono">Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.split(',').map((s, i) => (
                      <span key={i} className="text-[9px] px-2 py-1 bg-indigo-955 border border-indigo-900 text-indigo-300 rounded-full font-semibold font-mono">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-5 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => { handleNavClick('profile'); setIsProfileDrawerOpen(false); }}
                className="w-full py-2.5 border border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-zinc-900"
              >
                <Edit className="w-3.5 h-3.5 text-brand" /> Edit Profile
              </button>
              <button
                onClick={() => { setIsProfileDrawerOpen(false); setIsLogoutConfirmOpen(true); }}
                className="w-full py-2.5 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-955/20 hover:bg-rose-900 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT CONFIRMATION ─────────────────────────────────────── */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
          window.spaNavigate('/');
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        theme="dark"
      />

    </div>
  );
}
