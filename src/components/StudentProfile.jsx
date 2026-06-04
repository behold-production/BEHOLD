import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, ChevronRight, BookOpen, Heart, Award, ShieldAlert,
  LayoutDashboard, Calendar, History, BarChart3, Clock, ExternalLink, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  // Load booked sessions from localStorage or seed mock session
  useEffect(() => {
    const stored = localStorage.getItem('behold_booked_sessions');
    let list = [];
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) { }
    }

    // Seed default upcoming session if none exists
    if (list.length === 0) {
      list = [
        {
          id: 'sb_mock_1',
          service: 'counselling',
          mode: 'ONLINE',
          date: '2026-06-15',
          time: '02:00 PM',
          advisorName: 'Josina Joseph',
          advisorRole: 'Consultant Psychologist',
          status: 'CONFIRMED',
          meetLink: 'https://meet.google.com/abc-defg-hij'
        }
      ];
    }
    setBookedSessions(list);
  }, []);

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

  // Mock completed sessions (static for diagnostic logs timeline)
  const completedSessions = [
    {
      id: 'sb_mock_c1',
      service: 'counselling',
      mode: 'OFFLINE',
      date: '2026-05-10',
      time: '11:00 AM',
      advisorName: 'Muhammed Niyas S H',
      advisorRole: 'Consultant Psychologist',
      status: 'COMPLETED',
      feedback: 'Completed CDAT baseline mapping. Student has strong cognitive scores and lateral creative thinking. Recommend focus stream: Applied Psychology, Design, or Software Engineering.'
    }
  ];

  return (
    <div className="pt-5 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-zinc-50 text-zinc-900 font-sans text-left relative overflow-hidden">

      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-brand/5 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">

        {/* Mobile Summary Cards - Visible only on mobile/tablet */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-zinc-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand/10 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 border border-brand/20 shadow-inner">
              {profile.name ? profile.name[0].toUpperCase() : (user?.name ? user.name[0].toUpperCase() : 'S')}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Student</span>
              <p className="text-xs font-black text-zinc-900 truncate uppercase mt-0.5">{profile.name || user?.name || 'Student'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0">
              <Calendar className="w-4 h-4 text-zinc-800" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Booked Slots</span>
              <p className="text-xs font-black text-zinc-900 mt-0.5">{bookedSessions.length} Upcoming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0">
              <History className="w-4 h-4 text-zinc-800" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Completed</span>
              <p className="text-xs font-black text-zinc-900 mt-0.5">{completedSessions.length} Sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-900 shrink-0">
              <BarChart3 className="w-4 h-4 text-zinc-800" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">CDAT Profile</span>
              <p className="text-xs font-black text-zinc-900 truncate mt-0.5 uppercase">
                {testProfile ? testProfile.dominantDomain : 'Not Taken'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Premium Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Premium Sidebar Menu (col-span-3) */}
          <div className="lg:col-span-3 space-y-4">

            {/* Sidebar Navigation */}
            <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-xs flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-4 scrollbar-none snap-x w-full">
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
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-[10px] sm:text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer shrink-0 snap-start w-auto lg:w-full ${isActive
                      ? 'bg-zinc-900 text-brand border-zinc-900 shadow-sm'
                      : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-zinc-900'
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Privacy notice banner inside sidebar */}
            <div className="hidden lg:block p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-900" /> Secure Database
              </span>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                All profile parameters are synced inside your local browser database (`localStorage`) for ultimate privacy control.
              </p>
            </div>
          </div>

          {/* Right Column: Dashboard Active Tab Workspace (col-span-9) */}
          <div className="lg:col-span-9 bg-white border border-zinc-200 rounded-lg p-5 sm:p-8 shadow-xs">

            {/* TAB 1: DASHBOARD OVERVIEW */}
            {currentSection === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    Dashboard Overview
                  </h3>
                  <span className="text-[9px] bg-brand/20 text-zinc-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Status: Active</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Side: Profile Summary Card */}
                  <div className="md:col-span-5">
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs relative overflow-hidden text-left h-full flex flex-col justify-between">
                      {/* Top border accent line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand to-black" />

                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand/20 to-brand/40 text-zinc-900 flex items-center justify-center font-bold text-base border border-brand/30 shadow-inner shrink-0">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : (user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-header font-black text-xs sm:text-sm uppercase text-zinc-900 truncate">
                              {profile.name || user?.name || 'Student Name'}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate mt-0.5">
                              {profile.grade || 'Grade Not Synced'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-100 space-y-2.5 text-[11px] font-semibold text-zinc-700">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-900/40" />
                            <span className="truncate text-zinc-650">{profile.email || user?.email || 'No email synced'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-900/40" />
                            <span className="text-zinc-650">{profile.phone || 'No phone number'}</span>
                          </div>
                          {profile.schoolName && (
                            <div className="flex items-start gap-2 pt-0.5">
                              <BookOpen className="w-3.5 h-3.5 shrink-0 text-zinc-900/40 mt-0.5" />
                              <span className="text-zinc-655 leading-tight">School: <strong className="text-zinc-900 font-bold">{profile.schoolName}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
                        <button
                          onClick={() => handleSectionChange('details')}
                          className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-brand px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs w-full sm:w-auto text-center"
                        >
                          Update Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: CDAT Status and Career Consultations Grid */}
                  <div className="md:col-span-7 space-y-6">
                    {/* CDAT Aptitude Card */}
                    <div className="bg-white border border-zinc-200 p-5 rounded-lg transition-all shadow-xs flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <BarChart3 className="w-4 h-4 text-zinc-900" />
                            <h4 className="font-header font-black text-xs uppercase tracking-wider text-zinc-900">CDAT Aptitude Status</h4>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-medium">
                            {testProfile ? (
                              <span>Dominant: <span className="text-zinc-900 font-bold">{testProfile.dominantDomain}</span></span>
                            ) : (
                              <span>Assess your interest and matching domains.</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${testProfile ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' : 'bg-zinc-100 border border-zinc-200 text-zinc-500'}`}>
                          {testProfile ? 'Completed' : 'Not Taken'}
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end gap-2">
                        {testProfile ? (
                          <button
                            onClick={() => handleSectionChange('results')}
                            className="text-[9px] font-black uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-brand px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                          >
                            View Results
                          </button>
                        ) : (
                          <button
                            onClick={() => window.location.hash = '#/sample-test'}
                            className="text-[9px] font-black uppercase tracking-wider bg-brand hover:bg-brand-dark text-zinc-900 px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                          >
                            Start CDAT Test
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Upcoming Session Card */}
                    <div className="bg-white border border-zinc-200 p-5 rounded-lg transition-all shadow-xs flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-zinc-900" />
                            <h4 className="font-header font-black text-xs uppercase tracking-wider text-zinc-900">Career Consultations</h4>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-medium">
                            {bookedSessions.length > 0 ? (
                              <span>Next: <span className="text-zinc-900 font-bold">{bookedSessions[0].date}</span> with {bookedSessions[0].advisorName}</span>
                            ) : (
                              <span>Schedule your dialogue with career counsellors.</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-black tracking-wider uppercase ${bookedSessions.length > 0 ? 'bg-emerald-50 border border-emerald-250 text-emerald-700' : 'bg-zinc-100 border border-zinc-200 text-zinc-500'}`}>
                          {bookedSessions.length > 0 ? 'Scheduled' : 'No Bookings'}
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end gap-2">
                        {bookedSessions.length > 0 ? (
                          <button
                            onClick={() => handleSectionChange('booked')}
                            className="text-[9px] font-black uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-brand px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                          >
                            View Sessions
                          </button>
                        ) : (
                          <button
                            onClick={() => window.location.hash = '#/booking'}
                            className="text-[9px] font-black uppercase tracking-wider bg-brand hover:bg-brand-dark text-zinc-900 px-3 py-1.5 rounded-lg cursor-pointer transition shadow-xs"
                          >
                            Book Session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower Grid: Sessions Timeline and CDAT Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Completed session timeline summary */}
                  <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs text-left flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-zinc-900" /> Completed Timeline
                        </h5>
                        <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                          {completedSessions.length} Total
                        </span>
                      </div>

                      {completedSessions.length > 0 ? (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h6 className="font-header font-black text-xs uppercase text-zinc-900 truncate">{completedSessions[0].advisorName}</h6>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 truncate">{completedSessions[0].advisorRole}</p>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase whitespace-nowrap bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded shrink-0">{completedSessions[0].date}</span>
                          </div>
                          <div className="bg-zinc-50 p-2.5 rounded-lg border border-black/[0.02] relative">
                            <p className="text-[10px] text-zinc-650 font-light italic leading-relaxed line-clamp-3">
                              "{completedSessions[0].feedback}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500 font-medium text-center py-2">No completed sessions in archive.</p>
                      )}
                    </div>
                    {completedSessions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                        <button
                          onClick={() => handleSectionChange('completed')}
                          className="text-[9px] font-black uppercase tracking-wider bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 px-3 py-1 rounded-lg cursor-pointer transition shadow-xs"
                        >
                          View Full Timeline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CDAT Results Summary */}
                  <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-xs text-left flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-zinc-900" /> CDAT Profile
                        </h5>
                      </div>

                      {testProfile ? (
                        <div className="space-y-3">
                          <div className="bg-brand/10 p-2.5 rounded-lg border border-brand/20 text-center">
                            <p className="text-[8px] text-brand-dark/80 uppercase font-black tracking-wider">Dominant Domain</p>
                            <h6 className="font-header font-black text-xs uppercase text-brand-dark mt-0.5 truncate">
                              {testProfile.dominantDomain}
                            </h6>
                          </div>

                          <div className="space-y-2 pt-1">
                            {Object.entries(testProfile.scores || {}).slice(0, 3).map(([key, pct]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold text-zinc-900/60">
                                  <span className="truncate pr-1">{key}</span>
                                  <span>{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand rounded-full"
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3.5 space-y-2.5">
                          <p className="text-[10px] text-zinc-500 font-medium">Aptitude Profile not yet created.</p>
                          <button
                            onClick={() => window.location.hash = '#/sample-test'}
                            className="w-full text-[9px] bg-brand text-zinc-900 font-extrabold uppercase tracking-widest py-2.5 rounded-lg cursor-pointer hover:bg-brand-dark transition shadow-xs"
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
                          className="text-[9px] font-black uppercase tracking-wider bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 px-3 py-1 rounded-lg cursor-pointer transition shadow-xs"
                        >
                          View Full Results
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name of Student */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Name of Student</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={profile.name}
                        onChange={handleChange}
                        className={`w-full px-3.5 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305 ${errors.name ? 'border-red-500' : 'border-zinc-200'}`}
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
                        className={`w-full px-3.5 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305 ${errors.email ? 'border-red-500' : 'border-zinc-200'}`}
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
                        className={`w-full px-3.5 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305 ${errors.phone ? 'border-red-500' : 'border-zinc-200'}`}
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
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305"
                      />
                    </div>

                    {/* Grade */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 uppercase tracking-wider font-bold">Grade (Class)</label>
                      <select
                        name="grade"
                        value={profile.grade}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305 cursor-pointer"
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
                        className={`w-full px-3.5 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305 ${errors.guardianName ? 'border-red-500' : 'border-zinc-200'}`}
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
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305"
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
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all hover:border-zinc-305"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex justify-end">
                    <button
                      type="submit"
                      className="bg-brand text-zinc-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest cursor-pointer hover:bg-brand-dark transition rounded-lg shadow-md w-full sm:w-auto text-center border border-zinc-900/5"
                    >
                      Save & Sync Profile
                    </button>
                  </div>

                  {isSaved && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
                      Profile Registered & Synchronized Locally!
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* TAB 3: BOOKED SESSIONS */}
            {currentSection === 'booked' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    Booked Guidance Sessions
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-light">Upcoming Slots</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookedSessions.map((session, sIdx) => (
                    <div key={session.id || sIdx} className="bg-gradient-to-br from-white to-zinc-50 border border-zinc-200 p-5 rounded-lg shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${session.status === 'CONFIRMED' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-zinc-100 text-zinc-650'
                            }`}>
                            {session.status}
                          </span>
                          <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded font-extrabold uppercase font-mono tracking-widest">
                            {session.service === 'counselling' ? 'Therapy Slot' : 'Career Slot'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{session.mode}</span>
                        </div>
                        <h4 className="font-header font-black text-sm uppercase text-zinc-900 truncate">{session.advisorName}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium truncate">{session.advisorRole}</p>
                        <p className="text-[11px] font-bold text-zinc-900 uppercase pt-1">📅 {session.date} at {session.time} (1 Hour Slot)</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full pt-3 border-t border-zinc-100">
                        {session.mode === 'ONLINE' && session.meetLink && (
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer shadow-sm text-center"
                          >
                            <span>Launch Room</span>
                            <ExternalLink className="w-3 h-3 text-zinc-900" />
                          </a>
                        )}
                        <button
                          onClick={() => window.location.hash = `#/booking`}
                          className="flex-1 px-4 py-2 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-wider transition bg-white cursor-pointer"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {bookedSessions.length === 0 && (
                  <div className="text-center py-12 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No upcoming booked sessions scheduled.</p>
                    <button
                      onClick={() => window.location.hash = '#/booking'}
                      className="mt-4 px-6 py-2.5 bg-brand text-zinc-900 font-black uppercase tracking-widest text-[9px] rounded-lg cursor-pointer"
                    >
                      Book a session now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMPLETED SESSIONS */}
            {currentSection === 'completed' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    Completed Timeline & Feedback
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-light">Past Sessions Archive</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedSessions.map((session, sIdx) => (
                    <div key={session.id || sIdx} className="bg-white border border-zinc-200 p-5 rounded-lg shadow-xs space-y-4 text-left flex flex-col justify-between">
                      <div className="flex flex-col justify-between gap-2 border-b border-zinc-100 pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] bg-zinc-100 text-zinc-650 border border-zinc-200 px-2 py-0.5 rounded font-black tracking-widest">
                                {session.status}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">{session.mode}</span>
                            </div>
                            <h4 className="font-header font-black text-xs uppercase text-zinc-900 mt-1">{session.advisorName}</h4>
                            <p className="text-[10px] text-zinc-500">{session.advisorRole}</p>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-900 uppercase bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 shrink-0">📅 {session.date}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider font-black text-zinc-400 block">Feedback Notes:</span>
                        <p className="text-[10.5px] text-zinc-600 font-light leading-relaxed bg-zinc-50 p-2.5 rounded-lg border border-black/[0.02]">
                          "{session.feedback}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CDAT TEST RESULTS */}
            {currentSection === 'results' && (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                    CDAT Diagnostic Results
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-light">CIGI Framework</span>
                </div>

                {testProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                    <div className="md:col-span-5 space-y-4">
                      <div className="p-5 bg-brand/10 border border-brand/20 text-zinc-900 rounded-lg space-y-2.5">
                        <div className="flex gap-2 items-center">
                          <h4 className="font-header font-black text-xs uppercase text-brand-dark leading-tight">
                            Dominant Domain
                          </h4>
                        </div>
                        <p className="text-sm font-extrabold text-zinc-900 uppercase">
                          {testProfile.dominantDomain}
                        </p>
                        <p className="text-[10px] text-zinc-900/60 font-light leading-relaxed">
                          Your testing metrics show high scores and interest compatibility inside this category. Book a session with a State Coordinator to outline your exact high school streams map.
                        </p>
                      </div>

                      <button
                        onClick={() => window.location.hash = '#/sample-test'}
                        className="w-full py-3 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black tracking-widest uppercase transition bg-white cursor-pointer text-zinc-900 text-center"
                      >
                        Retake diagnostic profiling
                      </button>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Score Metrics Distribution</h4>
                      <div className="grid grid-cols-1 gap-3.5">
                        {Object.entries(testProfile.scores || {}).map(([key, pct]) => (
                          <div key={key} className="space-y-1.5 bg-zinc-50/50 p-3 rounded-lg border border-zinc-200">
                            <div className="flex justify-between text-[10.5px] font-bold text-zinc-700">
                              <span>{key}</span>
                              <span className="font-extrabold text-zinc-900">{pct}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-brand rounded-lg"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No CDAT testing history found for this account.</p>
                    <button
                      onClick={() => window.location.hash = '#/sample-test'}
                      className="px-6 py-3 bg-brand text-zinc-900 font-extrabold tracking-widest uppercase text-[10px] rounded-lg cursor-pointer"
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
