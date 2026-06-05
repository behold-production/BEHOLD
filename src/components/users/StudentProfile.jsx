import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, ChevronRight, BookOpen, Heart, Award, ShieldAlert,
  LayoutDashboard, Calendar, History, BarChart3, Clock, ExternalLink, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_STATE = {
  name: '',
  email: '',
  phone: '',
  schoolName: '',
  grade: '',
  guardianName: '',
  guardianPhone: '',
  groupCode: ''
};

export default function StudentProfile({ setView }) {
  const [profile, setProfile] = useState(INITIAL_STATE);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});

  // Dashboard Tab Selection
  const [currentSection, setCurrentSection] = useState('overview'); // overview, details, booked, completed, results

  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [testProfile, setTestProfile] = useState(null);
  const { user } = useAuth();

  // History tracking popstate listener
  useEffect(() => {
    // Set initial state on mount if it's profile view
    window.history.replaceState({ component: 'profile', section: 'overview' }, '');

    const handlePopState = (e) => {
      if (e.state && e.state.component === 'profile') {
        if (e.state.section) setCurrentSection(e.state.section);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
    window.history.pushState({ component: 'profile', section: sectionId }, '');
    if (sectionId === 'booked' || sectionId === 'overview') {
      loadStudentBookings();
    }
    if (sectionId === 'completed' || sectionId === 'overview') {
      loadCompletedSessions();
    }
  };

  // Load profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('behold_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(prev => ({ ...INITIAL_STATE, ...parsed }));
      } catch (e) {
        console.error("Error reading student profile from localStorage", e);
      }
    }
  }, []);

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

  const handleCancelSession = (sessionId) => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let list = [];
      if (stored) {
        try { list = JSON.parse(stored); } catch (e) { }
      }
      
      const updated = list.map(b => {
        if (b.id === sessionId) {
          return { ...b, status: 'CANCELLED' };
        }
        return b;
      });
      
      localStorage.setItem('behold_booked_sessions', JSON.stringify(updated));
      loadStudentBookings();
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const loadStudentBookings = () => {
    try {
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

      const currentStudentId = user?.id || '';
      const filtered = list.filter(b => b.userId === currentStudentId && b.status !== 'CANCELLED' && !isSessionCompleted(b));
      setBookedSessions(filtered);
    } catch (err) {
      console.error("Failed loading student bookings", err);
    }
  };

  const loadCompletedSessions = () => {
    try {
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

      // Filter completed sessions for this student
      const currentStudentId = user?.id || '';
      const completedList = list.filter(b => b.userId === currentStudentId && isSessionCompleted(b));
      setCompletedSessions(completedList);
    } catch (err) {
      console.error("Failed loading completed sessions", err);
    }
  };

  // Load booked & completed sessions from localStorage or seed mock sessions
  useEffect(() => {
    loadStudentBookings();
    loadCompletedSessions();

    const handleStorageChange = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      if (key === 'behold_booked_sessions') {
        loadStudentBookings();
        loadCompletedSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
    };
  }, [user]);

  // Load test profile (CDAT results) from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('behold_test_profile');
    if (stored) {
      try {
        setTestProfile(JSON.parse(stored));
      } catch (e) { }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('behold_student_profile', JSON.stringify(updated));
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!profile.name.trim()) {
      err.name = "Name of Student is required";
    } else if (profile.name.trim().length < 3) {
      err.name = "Name of Student must be at least 3 characters";
    }

    if (!profile.email.trim()) {
      err.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        err.email = "Please enter a valid email address";
      }
    }

    if (!profile.phone.trim()) {
      err.phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(profile.phone)) {
        err.phone = "Please enter a valid phone number (e.g. 8086664001)";
      }
    }

    if (!profile.guardianName.trim()) {
      err.guardianName = "Guardian Name is required";
    }

    return err;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };


  const getMeetLinkStatus = (session) => {
    if (!session.meetLink) return { status: 'NO_LINK', label: 'Waiting for Link' };
    if (session.mode !== 'ONLINE') return { status: 'OFFLINE', label: 'In-Person Session' };

    try {
      // Parse session date ("YYYY-MM-DD") and time ("hh:mm AM/PM")
      const [time, modifier] = session.time.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const [year, month, day] = session.date.split('-').map(Number);
      const sessionTime = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      
      const diffMs = sessionTime - now;
      const diffMinutes = diffMs / (1000 * 60);

      // Access allowed: 10 minutes before to 60 minutes after start
      if (diffMinutes <= 10 && diffMinutes >= -60) {
        return { status: 'AVAILABLE', label: 'Launch Room', link: session.meetLink };
      } else if (diffMinutes > 10) {
        const minsLeft = Math.round(diffMinutes);
        let timeLabel = `${minsLeft} mins`;
        if (minsLeft > 60) {
          const hoursLeft = Math.round(minsLeft / 60);
          timeLabel = hoursLeft === 1 ? '1 hour' : `${hoursLeft} hours`;
        }
        return { status: 'LOCKED', label: `Opens in ${timeLabel}` };
      } else {
        return { status: 'EXPIRED', label: 'Session Expired' };
      }
    } catch (err) {
      return { status: 'AVAILABLE', label: 'Launch Room', link: session.meetLink }; // Fallback
    }
  };

  return (
    <div className="pt-5 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-zinc-50 grid-bg text-zinc-900 font-sans text-left relative overflow-hidden">

      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand/10 rounded-full glow-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">

        {/* Top Premium Hero Section (Desktop & Mobile Unified Banner) */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-955 border border-zinc-900 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Decorative glowing gradient in background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 animate-pulse duration-[8000ms]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          {/* Profile Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10 w-full md:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-brand text-zinc-955 flex items-center justify-center font-header font-black text-2xl sm:text-3xl shadow-lg border border-white/20 shrink-0">
              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : (user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST')}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl sm:text-2xl font-header font-black tracking-wide uppercase text-white truncate">
                  {profile.name || user?.name || 'Student Name'}
                </h2>
                <span className="text-[9px] bg-brand/20 border border-brand/30 text-brand px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono shrink-0">
                  STUDENT
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {profile.grade ? `${profile.grade} • ` : ''}{profile.schoolName || 'School Details Not Set'}
              </p>
              <div className="flex flex-wrap items-center gap-3.5 pt-1.5 text-[11px] font-semibold text-zinc-400 justify-center sm:justify-start">
                <span className="flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 text-brand shrink-0" />{profile.email || user?.email || 'No email synced'}</span>
                {profile.phone && <span className="flex items-center gap-1.5 shrink-0"><Phone className="w-3.5 h-3.5 text-brand shrink-0" />{profile.phone}</span>}
              </div>
            </div>
          </div>

          {/* Core Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto shrink-0 relative z-10">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center w-full min-w-[90px] hover:border-brand/40 transition-colors">
              <Calendar className="w-4 h-4 text-brand mb-1.5" />
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Booked</span>
              <p className="text-xs font-black text-white mt-0.5">{bookedSessions.length} Slots</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center w-full min-w-[90px] hover:border-brand/40 transition-colors">
              <History className="w-4 h-4 text-brand mb-1.5" />
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Completed</span>
              <p className="text-xs font-black text-white mt-0.5">{completedSessions.length} Slots</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center text-center w-full min-w-[90px] hover:border-brand/40 transition-colors col-span-1">
              <BarChart3 className="w-4 h-4 text-brand mb-1.5" />
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">CDAT</span>
              <p className="text-xs font-black text-white mt-0.5 truncate max-w-[80px]">{testProfile ? testProfile.dominantDomain : 'Not Taken'}</p>
            </div>
          </div>
        </div>

        {/* 2-Column Premium Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Premium Sidebar Menu (col-span-3) */}
          <div className="lg:col-span-3 space-y-4 w-full">

            {/* Sidebar Navigation (Segmented Control Dock) */}
            <div className="bg-zinc-100/80 backdrop-blur-md p-1 rounded-xl border border-zinc-200/50 shadow-xs flex flex-row lg:flex-col gap-0.5 w-full overflow-x-auto scrollbar-none snap-x">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'details', label: 'CIGI Profile Details', icon: User },
                { id: 'booked', label: 'Booked Sessions', icon: Calendar },
                { id: 'completed', label: 'Completed Timeline', icon: History },
                { id: 'results', label: 'CDAT Test Results', icon: BarChart3 }
              ].map(section => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] min-[400px]:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 text-left cursor-pointer shrink-0 snap-start ${isActive
                      ? 'bg-brand text-zinc-955 shadow-xs font-black'
                      : 'text-zinc-505 hover:text-zinc-900 hover:bg-zinc-200/40'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-zinc-955' : 'text-zinc-450'}`} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Privacy notice banner inside sidebar */}
            <div className="hidden lg:block p-4 bg-white border border-zinc-200/80 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-zinc-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-brand-dark" /> Secure Database
              </span>
              <p className="text-[10px] text-zinc-505 leading-relaxed font-light">
                All profile parameters are synced inside your local browser database (`localStorage`) for ultimate privacy control.
              </p>
            </div>
          </div>

          {/* Right Column: Dashboard Active Tab Workspace (col-span-9) */}
          <div className="lg:col-span-9 bg-white border border-zinc-200/80 rounded-xl p-5 sm:p-8 shadow-xs">

            {/* TAB 1: DASHBOARD OVERVIEW */}
            {currentSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center text-left">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                    Dashboard Overview
                  </h3>
                  <span className="text-[9px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">Status: Active</span>
                </div>

                {/* Primary Action statuses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                  {/* CDAT Aptitude Card */}
                  <div className="bg-white border border-zinc-200/80 p-5 rounded-xl transition-all shadow-xs hover:shadow-md hover:border-brand/35 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${testProfile ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' : 'bg-zinc-100 border border-zinc-200 text-zinc-505'}`}>
                          {testProfile ? 'Completed' : 'Not Taken'}
                        </span>
                        <BarChart3 className="w-4 h-4 text-zinc-400 group-hover:text-brand-dark transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-header font-black text-xs uppercase tracking-wider text-zinc-900">CDAT Aptitude Test</h4>
                        <p className="text-[10px] text-zinc-505 font-medium leading-relaxed">
                          {testProfile ? (
                            <span>Dominant Domain: <strong className="text-zinc-900 font-bold">{testProfile.dominantDomain}</strong></span>
                          ) : (
                            <span>Map your logical and psychological strength clusters.</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                      {testProfile ? (
                        <button
                          onClick={() => handleSectionChange('results')}
                          className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-brand px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs border-none"
                        >
                          View Results
                        </button>
                      ) : (
                        <button
                          onClick={() => window.spaNavigate('/sample-test')}
                          className="text-[9px] font-black uppercase tracking-widest bg-brand hover:bg-brand-dark text-zinc-955 px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs border-none"
                        >
                          Start Test
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Career Consultations Status */}
                  <div className="bg-white border border-zinc-200/80 p-5 rounded-xl transition-all shadow-xs hover:shadow-md hover:border-brand/35 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-brand/5 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${bookedSessions.length > 0 ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' : 'bg-zinc-100 border border-zinc-200 text-zinc-505'}`}>
                          {bookedSessions.length > 0 ? 'Scheduled' : 'No Bookings'}
                        </span>
                        <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-brand-dark transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-header font-black text-xs uppercase tracking-wider text-zinc-900">Career Consultations</h4>
                        <p className="text-[10px] text-zinc-505 font-medium leading-relaxed truncate">
                          {bookedSessions.length > 0 ? (
                            <span>Next: <strong className="text-zinc-900 font-bold">{bookedSessions[0].date}</strong> with {bookedSessions[0].advisorName}</span>
                          ) : (
                            <span>Schedule direct guidance sessions with professionals.</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                      {bookedSessions.length > 0 ? (
                        <button
                          onClick={() => handleSectionChange('booked')}
                          className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-brand px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs border-none"
                        >
                          View Bookings
                        </button>
                      ) : (
                        <button
                          onClick={() => window.spaNavigate('/booking')}
                          className="text-[9px] font-black uppercase tracking-widest bg-brand hover:bg-brand-dark text-zinc-955 px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs border-none"
                        >
                          Book Slot
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lower Grid: Sessions Timeline and CDAT Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CDAT Results Summary */}
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between hover:border-brand/20 transition-colors">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-brand-dark" /> CDAT Aptitude Profile
                        </h5>
                      </div>

                      {testProfile ? (
                        <div className="space-y-4">
                          <div className="bg-brand-light border border-brand/20 p-2.5 rounded-lg text-center">
                            <p className="text-[8px] text-brand-dark font-black tracking-wider uppercase">Dominant Domain</p>
                            <h6 className="font-header font-black text-xs uppercase text-zinc-900 mt-0.5 truncate">
                              {testProfile.dominantDomain}
                            </h6>
                          </div>

                          <div className="space-y-2.5 pt-1">
                            {Object.entries(testProfile.scores || {}).slice(0, 3).map(([key, pct]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold text-zinc-650">
                                  <span className="truncate pr-1">{key}</span>
                                  <span className="font-bold text-zinc-900">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-brand rounded-full"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-5 space-y-3">
                          <BarChart3 className="w-8 h-8 text-zinc-300 mx-auto" />
                          <p className="text-[10px] text-zinc-505 font-medium">Aptitude Profile not yet created.</p>
                          <button
                            onClick={() => window.spaNavigate('/sample-test')}
                            className="w-full text-[9px] bg-brand hover:bg-brand-dark text-zinc-955 font-black uppercase tracking-widest py-2.5 rounded-lg cursor-pointer transition shadow-xs border-none"
                          >
                            Take CDAT Test
                          </button>
                        </div>
                      )}
                    </div>
                    {testProfile && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                        <button
                          onClick={() => handleSectionChange('results')}
                          className="text-[9px] font-black uppercase tracking-wider bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                        >
                          View Full Results
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Completed session timeline summary */}
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between hover:border-brand/20 transition-colors">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-brand-dark" /> Completed Activities
                        </h5>
                        <span className="text-[9px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                          {completedSessions.length} Total
                        </span>
                      </div>

                      {completedSessions.length > 0 ? (
                        <div className="relative pl-5 border-l-2 border-brand/20 space-y-4 ml-1.5 py-0.5 text-xs">
                          {completedSessions.map((session, idx) => (
                            <div key={session.id || idx} className="relative">
                              {/* Small timeline dot */}
                              <span className="absolute -left-[25px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-light border border-brand/40 text-brand-dark ring-2 ring-white">
                                <Award className="w-2 h-2 text-brand-dark" />
                              </span>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h6 className="font-header font-black text-[11px] uppercase text-zinc-900 truncate">
                                    {session.advisorName}
                                  </h6>
                                  <span className="text-[8px] font-bold text-zinc-550 uppercase whitespace-nowrap bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                                    {session.date}
                                  </span>
                                </div>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider text-left">
                                  {session.advisorRole}
                                </p>
                                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/40 relative">
                                  <p className="text-[9.5px] text-zinc-650 font-light italic leading-relaxed line-clamp-2">
                                    "{session.feedback}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-505 font-medium text-center py-6">No completed sessions in archive.</p>
                      )}
                    </div>
                    {completedSessions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                        <button
                          onClick={() => handleSectionChange('completed')}
                          className="text-[9px] font-black uppercase tracking-wider bg-white border border-zinc-200 hover:border-zinc-950 text-zinc-900 px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                        >
                          View Full Timeline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFILE DETAILS FORM */}
            {currentSection === 'details' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    CIGI Detailed Profile
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-light">Verify Details</span>
                </div>

                <form onSubmit={handleSave} className="space-y-6 text-xs font-medium">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                    {/* Name of Student */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Name of Student</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={profile.name}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-3 bg-white border text-xs text-zinc-900 rounded-lg outline-none transition-all ${
                          errors.name 
                            ? 'border-red-550 focus:border-red-550 focus:ring-red-200' 
                            : 'border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand'
                        }`}
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@email.com"
                        value={profile.email}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-3 bg-white border text-xs text-zinc-900 rounded-lg outline-none transition-all ${
                          errors.email 
                            ? 'border-red-550 focus:border-red-550 focus:ring-red-200' 
                            : 'border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand'
                        }`}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 8086664001"
                        value={profile.phone}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-3 bg-white border text-xs text-zinc-900 rounded-lg outline-none transition-all ${
                          errors.phone 
                            ? 'border-red-550 focus:border-red-550 focus:ring-red-200' 
                            : 'border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand'
                        }`}
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>}
                    </div>

                    {/* School Name */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">School Name</label>
                      <input
                        type="text"
                        name="schoolName"
                        placeholder="Name of your school"
                        value={profile.schoolName}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-white border border-zinc-200 text-xs text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                    </div>

                    {/* Grade */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Grade (Class)</label>
                      <select
                        name="grade"
                        value={profile.grade}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-white border border-zinc-200 text-xs text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all cursor-pointer"
                      >
                        <option value="">Select Grade</option>
                        {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guardian Name */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Parent / Guardian Name</label>
                      <input
                        type="text"
                        name="guardianName"
                        placeholder="Name of parent or guardian"
                        value={profile.guardianName}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-3 bg-white border text-xs text-zinc-900 rounded-lg outline-none transition-all ${
                          errors.guardianName 
                            ? 'border-red-550 focus:border-red-550 focus:ring-red-200' 
                            : 'border-zinc-200 focus:border-brand focus:ring-1 focus:ring-brand'
                        }`}
                      />
                      {errors.guardianName && <p className="text-[10px] text-red-500 font-semibold">{errors.guardianName}</p>}
                    </div>

                    {/* Guardian Phone */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Guardian's Phone</label>
                      <input
                        type="tel"
                        name="guardianPhone"
                        placeholder="Guardian mobile number"
                        value={profile.guardianPhone}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-white border border-zinc-200 text-xs text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                    </div>

                    {/* Group Code */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Group / School Code (Optional)</label>
                      <input
                        type="text"
                        name="groupCode"
                        placeholder="e.g. BEHOLD-CDAT-2026"
                        value={profile.groupCode}
                        onChange={handleChange}
                        className="w-full px-3.5 py-3 bg-white border border-zinc-200 text-xs text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand hover:bg-brand-dark text-zinc-950 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest cursor-pointer transition rounded-lg shadow-sm w-full sm:w-auto text-center border-none"
                    >
                      Save & Sync Profile
                    </button>
                  </div>

                  {isSaved && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
                      Profile Registered & Synchronized Locally!
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB 3: BOOKED SESSIONS */}
            {currentSection === 'booked' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-left">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    Booked Guidance Sessions
                  </h3>
                  <span className="text-[9px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                    Upcoming
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {bookedSessions.map((session, sIdx) => (
                    <div 
                      key={session.id || sIdx} 
                      className="bg-white border border-zinc-200/80 rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-brand/35 transition-all duration-300 flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            session.status === 'CONFIRMED' 
                              ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' 
                              : 'bg-zinc-100 border border-zinc-200 text-zinc-650'
                          }`}>
                            {session.status}
                          </span>
                          <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-extrabold uppercase font-mono tracking-widest">
                            {session.service === 'counselling' ? 'Psychological Slot' : 'Career Slot'}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{session.mode}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-header font-black text-sm uppercase text-zinc-900 truncate">{session.advisorName}</h4>
                          <p className="text-[10px] text-zinc-505 font-medium truncate">{session.advisorRole}</p>
                        </div>
                        
                        <div className="bg-brand-light/50 border border-brand/10 p-3 rounded-lg flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-dark shrink-0" />
                          <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">
                            {session.date} at {session.time}
                          </span>
                        </div>
                      </div>

                      {session.mode === 'ONLINE' && !session.meetLink && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] p-2.5 rounded-lg flex items-center gap-1.5 font-medium">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Counsellor will add the Google Meet link soon.</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 w-full pt-4 border-t border-zinc-100">
                        {session.mode === 'ONLINE' && (() => {
                          const meetStatus = getMeetLinkStatus(session);
                          if (meetStatus.status === 'AVAILABLE') {
                            return (
                              <a
                                href={meetStatus.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 rounded-lg text-[9px] font-black tracking-widest transition cursor-pointer shadow-sm text-center border-none"
                              >
                                <span>{meetStatus.label}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            );
                          } else {
                            return (
                              <button
                                disabled
                                className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded-lg text-[9px] font-bold uppercase tracking-widest cursor-not-allowed text-center"
                                title={meetStatus.status === 'LOCKED' ? 'Meet link will be active 10 minutes before the scheduled time.' : 'This session has expired or link is pending.'}
                              >
                                <span>{meetStatus.label}</span>
                                <Lock className="w-3 h-3 text-zinc-350 shrink-0" />
                              </button>
                            );
                          }
                        })()}
                        <button
                          type="button"
                          onClick={() => window.spaNavigate('/booking')}
                          className="px-4 py-2.5 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-widest transition bg-white cursor-pointer text-zinc-900"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelSession(session.id)}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer text-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {bookedSessions.length === 0 && (
                  <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
                    <Calendar className="w-8 h-8 text-zinc-350 mx-auto" />
                    <p className="text-zinc-505 font-bold text-xs uppercase tracking-wider">No upcoming booked sessions scheduled.</p>
                    <button
                      onClick={() => window.spaNavigate('/booking')}
                      className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black uppercase tracking-widest text-[9px] rounded-lg cursor-pointer border-none shadow-sm"
                    >
                      Book a session now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMPLETED SESSIONS */}
            {currentSection === 'completed' && (
              <div className="space-y-8 animate-in fade-in duration-200 text-left">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    Completed Timeline & Feedback
                  </h3>
                  <span className="text-[9px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                    Archive
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-brand/25 space-y-8 ml-3 sm:ml-4 pt-1">
                  {completedSessions.map((session, sIdx) => (
                    <div key={session.id || sIdx} className="relative group">
                      {/* Pulsing visual timeline marker */}
                      <span className="absolute -left-[35px] sm:-left-[39px] top-1.5 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-brand-light border border-brand/40 text-brand-dark ring-4 ring-white shadow-xs group-hover:scale-110 transition-transform">
                        <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-dark" />
                      </span>

                      <div className="bg-white border border-zinc-200/80 rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-brand/30 transition-all duration-300 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[8px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                {session.status}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">{session.mode} SESSION</span>
                            </div>
                            <h4 className="font-header font-black text-sm uppercase text-zinc-900 mt-1">
                              {session.advisorName}
                            </h4>
                            <p className="text-[10px] text-zinc-505 font-medium">
                              {session.advisorRole}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-900 uppercase bg-zinc-50 border border-zinc-200/60 px-2.5 py-1 rounded-md w-fit h-fit">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{session.date} at {session.time}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 block">Feedback & Action Plan:</span>
                          <div className="relative bg-zinc-50/50 p-4 rounded-xl border border-zinc-200/40">
                            {/* Visual double quote accent watermark */}
                            <span className="absolute right-4 top-2 text-zinc-200/60 font-serif text-5xl leading-none select-none">”</span>
                            <p className="text-xs text-zinc-650 font-light italic leading-relaxed relative z-10 pr-6">
                              "{session.feedback}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CDAT TEST RESULTS */}
            {currentSection === 'results' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs text-left">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    CDAT Diagnostic Results
                  </h3>
                  <span className="text-[9px] bg-brand-light text-brand-dark border border-brand/20 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                    CIGI Framework
                  </span>
                </div>

                {testProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-4">
                      <div className="p-5 bg-brand-light border border-brand/20 text-zinc-900 rounded-xl space-y-3 shadow-xs relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 rounded-full blur-xl pointer-events-none" />
                        <span className="text-[8px] bg-brand/20 text-brand-dark border border-brand/35 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono w-fit block">
                          Primary Outcome
                        </span>
                        <h4 className="font-header font-black text-sm uppercase text-brand-dark leading-tight pt-1">
                          Dominant Domain
                        </h4>
                        <p className="text-base font-black text-zinc-900 uppercase">
                          {testProfile.dominantDomain}
                        </p>
                        <p className="text-[10px] text-zinc-600 font-light leading-relaxed">
                          Your testing metrics show high scores and interest compatibility inside this category. Book a session with a State Coordinator to outline your exact high school streams map.
                        </p>
                      </div>

                      <button
                        onClick={() => window.spaNavigate('/sample-test')}
                        className="w-full py-3 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black tracking-widest uppercase transition bg-white cursor-pointer text-zinc-900 text-center shadow-xs"
                      >
                        Retake diagnostic profiling
                      </button>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Score Metrics Distribution</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(testProfile.scores || {}).map(([key, pct]) => (
                          <div key={key} className="space-y-1.5 bg-zinc-50/50 p-3.5 rounded-lg border border-zinc-200/60">
                            <div className="flex justify-between text-[10.5px] font-bold text-zinc-755">
                              <span>{key}</span>
                              <span className="font-extrabold text-zinc-900">{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-200/50 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-brand rounded-lg"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
                    <BarChart3 className="w-8 h-8 text-zinc-350 mx-auto" />
                    <p className="text-zinc-555 font-bold text-xs uppercase tracking-wider">No CDAT testing history found for this account.</p>
                    <button
                      onClick={() => window.spaNavigate('/sample-test')}
                      className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-extrabold tracking-widest uppercase text-[10px] rounded-lg cursor-pointer border-none shadow-sm"
                    >
                      Take Sample Aptitude Test
                    </button>
                  </div>
                )}
              </div>
            )}

          </div></div>

      </div>
    </div>
  );
}
