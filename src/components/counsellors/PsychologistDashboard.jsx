import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Clock, BookOpen, Link, ShieldAlert, Award, Globe, 
  Edit, Check, Video, BarChart3, AlertCircle, Save, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PsychologistDashboard({ setView }) {
  const { user, login, register, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('overview'); // overview, profile, availability, bookings
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'Muhammed Niyas S H',
    role: 'Consultant Psychologist',
    education: 'MPhil Clinical Psychology',
    specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
    price: 1250,
    lang: 'Malayalam, English',
    bio: 'Muhammed specializes in cognitive behavioral approaches to managing severe anxiety and depressive disorders. He has a keen focus on relationship dynamics, helping couples and individuals find harmony and understanding in their interpersonal connections.'
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
  const [availableSlots, setAvailableSlots] = useState([
    '09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'
  ]);
  const [isAvailabilitySaved, setIsAvailabilitySaved] = useState(false);
  
  // Input meeting link state per booking
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [meetLinkError, setMeetLinkError] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');

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
    education: 'MPhil Clinical Psychology',
    specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
    price: 1250,
    lang: 'Malayalam, English',
    bio: 'Dedicated consultant psychologist specializing in mood and anxiety therapy.'
  });
  const [regError, setRegError] = useState('');
  const [regActiveDays, setRegActiveDays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
  });
  const [regAvailableSlots, setRegAvailableSlots] = useState([
    '09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'
  ]);

  const loadBookingsData = () => {
    try {
      const advisorId = user?.id || 'u_psy_1';
      
      // Load profile
      let advisorName = user?.name || 'Muhammed Niyas S H';
      const savedProfile = localStorage.getItem(`behold_advisor_profile_${advisorId}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
          if (parsed.name) advisorName = parsed.name;
        } catch (e) {}
      } else {
        setProfile(prev => ({
          ...prev,
          name: user?.name || 'Muhammed Niyas S H'
        }));
      }

      // Load availability
      const savedAvailability = localStorage.getItem(`behold_advisor_availability_${advisorId}`);
      if (savedAvailability) {
        try {
          const parsed = JSON.parse(savedAvailability);
          if (parsed.activeDays) setActiveDays(parsed.activeDays);
          if (parsed.availableSlots) setAvailableSlots(parsed.availableSlots);
        } catch (e) {}
      }

      // Load bookings
      const stored = localStorage.getItem('behold_booked_sessions');
      let list = [];
      if (stored) {
        try { list = JSON.parse(stored); } catch (e) {}
      }
      
      // Seed standard booking if database is empty (consistent with StudentProfile)
      if (list.length === 0) {
        list = [
          {
            id: 'sb_mock_1',
            userId: 'u_student_1',
            userName: 'Albin Siby',
            email: 'student@behold.com',
            phone: '8086664001',
            service: 'counselling',
            mode: 'ONLINE',
            date: '2026-06-15',
            time: '02:00 PM',
            advisorName: 'Josina Joseph',
            advisorRole: 'Consultant Psychologist',
            status: 'CONFIRMED',
            meetLink: 'https://meet.google.com/abc-defg-hij'
          },
          {
            id: 'sb_mock_2',
            userId: 'u_student_1',
            userName: 'Albin Siby',
            email: 'student@behold.com',
            phone: '8086664001',
            service: 'counselling',
            mode: 'ONLINE',
            date: new Date().toISOString().split('T')[0], // Today
            time: '02:00 PM',
            advisorName: 'Muhammed Niyas S H',
            advisorRole: 'Consultant Psychologist',
            status: 'CONFIRMED',
            meetLink: ''
          }
        ];
        localStorage.setItem('behold_booked_sessions', JSON.stringify(list));
      }
      
      // Filter bookings only for this advisor
      const myBookings = list.filter(b => b.advisorName.toLowerCase().includes(advisorName.toLowerCase()));
      setBookings(myBookings);
    } catch (err) {
      console.error("Failed loading counsellor bookings", err);
    }
  };

  // Load advisor details & bookings from localStorage
  useEffect(() => {
    loadBookingsData();

    const handleStorageChange = (e) => {
      if (e.key === 'behold_booked_sessions') {
        loadBookingsData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
        bio: regForm.bio.trim()
      };
      localStorage.setItem(`behold_advisor_profile_${newId}`, JSON.stringify(newProfile));

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
        education: 'MPhil Clinical Psychology',
        specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
        price: 1250,
        lang: 'Malayalam, English',
        bio: 'Dedicated consultant psychologist specializing in mood and anxiety therapy.'
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
    const advisorId = user?.id || 'u_psy_1';
    localStorage.setItem(`behold_advisor_profile_${advisorId}`, JSON.stringify(profile));
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleAvailabilitySave = (e) => {
    e.preventDefault();
    const advisorId = user?.id || 'u_psy_1';
    localStorage.setItem(`behold_advisor_availability_${advisorId}`, JSON.stringify({ activeDays, availableSlots }));
    setIsAvailabilitySaved(true);
    setTimeout(() => setIsAvailabilitySaved(false), 3000);
  };

  // Google Meet Link editing
  const startEditMeetLink = (booking) => {
    setEditingBookingId(booking.id);
    setMeetLinkInput(booking.meetLink || '');
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
        try { allBookings = JSON.parse(stored); } catch (e) {}
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
        try { allBookings = JSON.parse(stored); } catch (e) {}
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
        try { allBookings = JSON.parse(stored); } catch (e) {}
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
                      placeholder="niyas@behold.com"
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
                        placeholder="name@behold.com"
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
                              className={`px-3 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                active
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

                    <div className="space-y-2 border-t border-zinc-800 pt-3">
                      <label className="text-zinc-400 uppercase tracking-wider font-bold text-[9px] block">Timing Slots</label>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        {['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(slot => {
                          const exists = regAvailableSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                if (exists) {
                                  setRegAvailableSlots(prev => prev.filter(s => s !== slot));
                                } else {
                                  setRegAvailableSlots(prev => [...prev, slot]);
                                }
                              }}
                              className={`py-2.5 border rounded-lg font-black transition cursor-pointer text-[10px] ${
                                exists
                                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-350'
                                  : 'bg-zinc-950 border-zinc-850 text-zinc-555'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans text-left flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Left Fixed Sidebar */}
      <div className="w-full lg:w-64 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 relative z-20">
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <span className="font-header font-black text-lg tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </span>
            <span className="text-[8px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              CLINIC
            </span>
          </div>

          {/* User profile details */}
          <div className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 text-brand flex items-center justify-center font-header font-black text-xs border border-indigo-900 shrink-0">
              {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight uppercase">
                {profile.name}
              </h4>
              <span className="text-[8px] text-zinc-550 font-black tracking-wider uppercase truncate block">
                {profile.education}
              </span>
            </div>
          </div>

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
                  onClick={() => setCurrentSection(sec.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    isActive
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
            <p className="text-[9px] text-zinc-500 leading-relaxed pt-1.5">
              Updates to pricing or timing are synced immediately with public advisor slots listings.
            </p>
          </div>
          <button 
            onClick={() => {
              logout();
              window.location.hash = '#/';
            }}
            className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
            <div className="bg-zinc-950 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Upcoming Slots</span>
              <p className="text-sm font-black text-brand mt-0.5">{bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length} Bookings</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Hours Completed</span>
              <p className="text-sm font-black text-brand mt-0.5">{bookings.filter(b => b.status === 'COMPLETED').length * 1 + 65}+ Hrs</p>
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
                            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wide">
                              <Check className="w-3 h-3 text-emerald-400" /> Link Set
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
                  <label className="text-zinc-450 uppercase tracking-wider font-bold">Display Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-450 uppercase tracking-wider font-bold">Education Credentials</label>
                  <input 
                    type="text" 
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Session Fee (INR / Hour)</label>
                  <input 
                    type="number" 
                    value={profile.price}
                    onChange={(e) => setProfile({ ...profile, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Languages Spoken</label>
                  <input 
                    type="text" 
                    value={profile.lang}
                    onChange={(e) => setProfile({ ...profile, lang: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Specialties (comma-separated)</label>
                  <input 
                    type="text" 
                    value={profile.specialties}
                    onChange={(e) => setProfile({ ...profile, specialties: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-zinc-455 uppercase tracking-wider font-bold">Professional Biography</label>
                  <textarea 
                    rows={5}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-xs text-white rounded-lg outline-none focus:border-brand resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                {isProfileSaved ? (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Changes Synced with public profiles!
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
                          className={`px-4 py-2 border rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                            active
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

                {/* Standard Timings Checkbox */}
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <label className="text-zinc-400 uppercase tracking-wider font-bold block">Select Active Timing Slots</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['09:30 AM', '11:00 AM', '02:00 PM', '04:00 PM'].map(slot => {
                      const exists = availableSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            if (exists) {
                              setAvailableSlots(prev => prev.filter(s => s !== slot));
                            } else {
                              setAvailableSlots(prev => [...prev, slot]);
                            }
                          }}
                          className={`p-3 border rounded-lg text-center font-black transition cursor-pointer text-xs ${
                            exists
                              ? 'bg-brand/10 border-brand text-brand-dark'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                {isAvailabilitySaved ? (
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Availability Matrix Synchronized!
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

          {/* WORKSPACE 4: BOOKINGS & GOOGLE MEET LINK UPDATES */}
          {currentSection === 'bookings' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left">
              <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Student Booking Details & Rooms</h3>
                <span className="text-[9px] bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">{bookings.length} Booked</span>
              </div>

              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={booking.status || 'CONFIRMED'}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          className={`px-2.5 py-1 border rounded outline-none text-[8.5px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                            booking.status === 'CONFIRMED'
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
                            className="px-4.5 py-3 bg-brand hover:bg-brand-dark text-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1 shadow-xs border-none font-sans font-extrabold"
                          >
                            <Edit className="w-3.5 h-3.5 text-zinc-955" />
                            <span>{booking.meetLink ? 'Edit Link' : 'Set Meet Link'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {bookings.length === 0 && (
                  <div className="text-center py-10 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
                    <Video className="w-8 h-8 text-zinc-650 mx-auto" />
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No client bookings registered for your account yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
