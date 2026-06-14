import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, BookOpen, Link, ShieldAlert, Award, Globe,
  Edit, Video, BarChart3, AlertCircle, Save, LogOut,
  X, ChevronRight, Mail, Shield, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import ApiService from '../../services/api';

export default function PsychologistDashboard({ setView }) {
  const { user, login, register, logout, isLoading, updateUser } = useAuth();

  const isCounsellorVerified = () => {
    return user ? user.isVerified !== false : true;
  };

  const [currentSection, setCurrentSection] = useState('overview'); // overview, profile, availability, bookings
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleNavClick = (section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false);
  };

  // Profile state (server truth — updated by loadBookingsData)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    role: user?.title || 'Consultant Psychologist',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
  });
  // Separate edit state — what the form binds to, so background refreshes don't clear the user's typing
  const [editProfile, setEditProfile] = useState(null);

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
    0: false // Sunday
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [customHour, setCustomHour] = useState('09');
  const [customMinute, setCustomMinute] = useState('00');
  const [customPeriod, setCustomPeriod] = useState('AM');
  const setSlotError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
  const slotError = '';
  const [isAvailabilitySaved, setIsAvailabilitySaved] = useState(false);

  // Input meeting link state per booking
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const setMeetLinkError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
  const meetLinkError = '';
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [activeBookingTab, setActiveBookingTab] = useState('CONFIRMED'); // CONFIRMED, COMPLETED, CANCELLED

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const setLoginError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
  const loginError = '';
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
  const setRegError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
  const regError = '';
  const [regActiveDays, setRegActiveDays] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
  });
  const [regAvailableSlots, setRegAvailableSlots] = useState([]);
  const [regAllSlots, setRegAllSlots] = useState([]);
  const [regCustomHour, setRegCustomHour] = useState('09');
  const [regCustomMinute, setRegCustomMinute] = useState('00');
  const [regCustomPeriod, setRegCustomPeriod] = useState('AM');
  const setRegSlotError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
  const regSlotError = '';

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

  // Profile picture upload state
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const avatarFileRef = React.useRef(null);

  const handleCounsellorAvatarUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      import('react-hot-toast').then(mod => mod.toast.error('Only JPG/PNG images are allowed for profile picture.'));
      return;
    }
    setIsAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('profilePic', file);
      const res = await ApiService.updateCounsellorProfilePic(fd);
      if (res.success) {
        import('react-hot-toast').then(mod => mod.toast.success('Profile picture updated!'));
        if (updateUser && user && res.data) updateUser({ ...user, profilePic: res.data.profilePic });
        setProfilePicFile(null);
      }
    } catch (err) {
      import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Failed to upload picture.'));
    } finally {
      setIsAvatarUploading(false);
    }
  };


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

  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadBookingsData = async (silent = false) => {
    try {
      const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');
      const hasToken = !!localStorage.getItem('behold_token');
      if (!isCounsellor || !hasToken) return;
      if (!silent) setIsLoadingData(true);

      // Fetch both profile and bookings concurrently
      const [profileRes, bookingsRes] = await Promise.all([
        ApiService.getCounsellorProfile(),
        ApiService.getAppointments()
      ]);

      // Load profile
      if (profileRes.success && profileRes.data) {
        const c = profileRes.data;
        const specialtiesStr = c.specialties
          ? (Array.isArray(c.specialties) ? c.specialties.join(', ') : c.specialties)
          : '';
        setProfile({
          name: c.name || user.name || '',
          role: c.title || 'Consultant Psychologist',
          education: c.education || '',
          specialties: specialtiesStr,
          price: c.price !== undefined ? c.price : 1200,
          lang: c.lang || 'English, Malayalam',
          bio: c.bio || '',
          defaultMeetLink: c.defaultMeetLink || '',
          hours: c.hours || 0,
          modes: c.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP']
        });

        // Load availability
        if (c.availability) {
          const avail = c.availability;
          if (avail.activeDays) setActiveDays(avail.activeDays);
          if (avail.availableSlots) {
            setAvailableSlots(avail.availableSlots);
            // Ensure slots are added to the list of displayed slots
            setAllSlots(prev => {
              const merged = [...prev];
              avail.availableSlots.forEach(slot => {
                if (!merged.includes(slot)) {
                  merged.push(slot);
                }
              });
              return merged;
            });
          }
        }
      }

      // Load bookings
      if (bookingsRes.success && bookingsRes.data) {
        const list = bookingsRes.data;
        const myBookings = list.map(b => ({
          id: b.id,
          userId: b.userId,
          userName: b.studentName || 'Student Name',
          advisorId: b.counsellorId,
          advisorName: b.counsellorName || user.name,
          date: b.date,
          time: b.time,
          mode: b.mode,
          status: b.status,
          meetLink: b.meetLink || '',
          feedback: b.feedback || '',
          service: b.service || 'counselling'
        })).sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED' && b.status !== 'PENDING') return -1;
          if (b.status === 'CONFIRMED' && a.status !== 'CONFIRMED' && a.status !== 'PENDING') return 1;
          return b.date.localeCompare(a.date);
        });
        setBookings(myBookings);
      } else {
        throw new Error(bookingsRes.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Failed loading counsellor profile & bookings from API", err);
      toast.error("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load advisor details & bookings from API
  useEffect(() => {
    const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');
    const hasToken = !!localStorage.getItem('behold_token');
    if (isCounsellor && hasToken) {
      loadBookingsData(false);
    }
  }, [user]);

  // Auto-refresh bookings silently when switching to bookings or overview tab
  useEffect(() => {
    if (currentSection === 'bookings' || currentSection === 'overview') {
      loadBookingsData(true);
    }
    // When entering the profile edit section, sync editProfile from latest server data
    if (currentSection === 'profile') {
      setEditProfile({ ...profile });
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
      // Convert specialties string to array
      const specialtiesArr = regForm.specialties
        ? regForm.specialties.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const extraPayload = {
        education: regForm.education.trim(),
        specialties: specialtiesArr,
        price: Number(regForm.price) || 1200,
        lang: regForm.lang.trim(),
        bio: regForm.bio.trim(),
        defaultMeetLink: regForm.defaultMeetLink.trim(),
        hours: Number(regForm.hours) || 0,
        modes: regForm.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
        title: 'Consultant Psychologist',
        availability: {
          activeDays: regActiveDays,
          availableSlots: regAvailableSlots
        }
      };

      await register(
        regForm.name.trim(),
        regForm.email.trim(),
        regForm.password,
        'PSYCHOLOGIST',
        extraPayload
      );

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
      const roleUpper = loggedInUser.role?.toUpperCase();
      if (roleUpper !== 'PSYCHOLOGIST' && roleUpper !== 'COUNSELLOR') {
        logout();
        setLoginError('Access Denied: Account does not have Counsellor privileges.');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid counsellor credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const formData = editProfile || profile;
    try {
      const specialtiesArr = formData.specialties
        ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        education: formData.education,
        specialties: specialtiesArr,
        price: Number(formData.price) || 1200,
        lang: formData.lang,
        bio: formData.bio,
        defaultMeetLink: formData.defaultMeetLink,
        hours: Number(formData.hours) || 0,
        modes: formData.modes
      };

      const res = await ApiService.updateCounsellorProfile(payload);
      if (res.success) {
        setIsProfileSaved(true);
        setTimeout(() => setIsProfileSaved(false), 3000);
        if (updateUser && user) {
          updateUser({
            ...user,
            name: payload.name
          });
        }
        await loadBookingsData();
      }
    } catch (err) {
      console.error("Failed to save counsellor profile via API", err);
    }
  };

  const handleAvailabilitySave = async (e) => {
    e.preventDefault();
    setSlotError('');
    if (!availableSlots || availableSlots.length === 0) {
      setSlotError("Please configure at least one availability slot to save.");
      return;
    }
    try {
      const payload = { activeDays, availableSlots };
      const res = await ApiService.updateAvailability(payload);
      if (res.success) {
        setIsAvailabilitySaved(true);
        setTimeout(() => setIsAvailabilitySaved(false), 3000);
        await loadBookingsData();
      }
    } catch (err) {
      console.error("Failed to save counsellor availability via API", err);
      setSlotError(err.message || "Failed to save availability.");
    }
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

  const saveMeetLink = async (bookingId) => {
    const trimmed = meetLinkInput.trim();
    if (trimmed && !trimmed.startsWith('https://')) {
      setMeetLinkError('Please enter a valid URL beginning with https://');
      return;
    }
    setMeetLinkError('');

    try {
      const res = await ApiService.updateAppointmentMeetLink(bookingId, trimmed);
      if (res.success) {
        await loadBookingsData();
        setEditingBookingId(null);
      } else {
        setMeetLinkError(res.message || 'Failed to update meeting link');
      }
    } catch (err) {
      console.error("Failed to save Meet link", err);
      setMeetLinkError(err.message || 'Failed to update meeting link');
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      let res;
      if (newStatus === 'CONFIRMED' || newStatus === 'APPROVED') {
        res = await ApiService.approveAppointment(bookingId);
      } else if (newStatus === 'CANCELLED') {
        res = await ApiService.cancelAppointment(bookingId);
      } else if (newStatus === 'COMPLETED') {
        res = await ApiService.completeAppointment(bookingId);
      } else if (newStatus === 'REJECTED') {
        res = await ApiService.rejectAppointment(bookingId, 'Declined by counsellor');
      }

      if (res && res.success) {
        await loadBookingsData();
      }
    } catch (err) {
      console.error("Failed to update booking status via API", err);
    }
  };

  const saveFeedback = async (bookingId) => {
    try {
      const res = await ApiService.updateAppointmentFeedback(bookingId, feedbackInput.trim());
      if (res.success) {
        await loadBookingsData();
        setEditingFeedbackId(null);
      }
    } catch (err) {
      console.error("Failed to save feedback via API", err);
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

  // --- LOGIN GATE UI ---
  const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // --- 1. COUNSELLOR PORTAL LOGIN GATE ---
  if (!isCounsellor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden text-left">
        {/* Glowing background shapes */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-header font-bold tracking-tighter text-white">
              BEHOLD<span className="text-brand font-bold">.</span>
            </h1>
            <p className="text-sm text-indigo-400 capitalize  font-bold">COUNSELLOR CENTRAL PORTAL</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
            {/* Header Tabs */}
            <div className="flex border-b border-zinc-800 pb-1">
              <button
                type="button"
                onClick={() => setGateMode('login')}
                className={`flex-1 pb-3 text-sm capitalize  font-bold transition-colors ${gateMode === 'login' ? 'text-brand border-b-2 border-brand' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setGateMode('register'); setOnboardingStep(1); setRegError(''); }}
                className={`flex-1 pb-3 text-sm capitalize  font-bold transition-colors ${gateMode === 'register' ? 'text-brand border-b-2 border-brand' : 'text-zinc-500 hover:text-zinc-400'}`}
              >
                Register Consultant
              </button>
            </div>

            {gateMode === 'login' ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white capitalize ">Counsellor Sign In</h2>
                  <p className="text-sm text-zinc-500 leading-none">Access schedules, update clinic slots, and edit video rooms.</p>
                </div>

                <form onSubmit={handleCounsellorLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="enter your mail id"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
                  >
                    {isLoggingIn ? 'Connecting...' : 'Enter Consultant Desk'}
                  </button>
                </form>

              </div>
            ) : (
              // REGISTRATION STEP-BY-STEP FLOW
              <div className="space-y-6">
                {/* Stepper Indicators */}
                <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-2 gap-y-2 text-sm md:text-base font-bold capitalize  border-b border-zinc-850 pb-3 text-center">
                  <span className={`whitespace-nowrap ${onboardingStep === 1 ? "text-indigo-400" : "text-zinc-550"}`}>1. Account Details</span>
                  <ChevronRight className="w-4 h-4 text-zinc-700 hidden sm:inline" />
                  <span className={`whitespace-nowrap ${onboardingStep === 2 ? "text-indigo-400" : "text-zinc-550"}`}>2. Qualifications</span>
                  <ChevronRight className="w-4 h-4 text-zinc-700 hidden sm:inline" />
                  <span className={`whitespace-nowrap ${onboardingStep === 3 ? "text-indigo-400" : "text-zinc-550"}`}>3. Schedule</span>
                </div>

                {onboardingStep === 1 && (
                  <form onSubmit={handleStepOneNext} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm capitalize  font-bold text-zinc-400">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Sandra Tomy"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm capitalize  font-bold text-zinc-400">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="counsellor@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm capitalize  font-bold text-zinc-400">Password</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm capitalize  font-bold text-zinc-400">Confirm</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={regForm.confirmPassword}
                          onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-855 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                    >
                      Next: Clinical Details
                    </button>
                  </form>
                )}

                {onboardingStep === 2 && (
                  <form onSubmit={handleStepTwoNext} className="space-y-4 font-medium">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm capitalize  font-bold text-zinc-400">Education Details</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PhD Clinical Psychology"
                          value={regForm.education}
                          onChange={(e) => setRegForm({ ...regForm, education: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm capitalize  font-bold text-zinc-400">Languages Spoken</label>
                        <input
                          type="text"
                          required
                          placeholder="Malayalam, English, Tamil"
                          value={regForm.lang}
                          onChange={(e) => setRegForm({ ...regForm, lang: e.target.value })}
                          className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm capitalize  font-bold text-zinc-400">Hourly Session Fee (INR)</label>
                      <input
                        type="number"
                        required
                        placeholder="1200"
                        value={regForm.price}
                        onChange={(e) => setRegForm({ ...regForm, price: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm capitalize  font-bold text-zinc-400">Specialties (comma-separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="Anxiety, Relationship Dynamics, Career Stress"
                        value={regForm.specialties}
                        onChange={(e) => setRegForm({ ...regForm, specialties: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm capitalize  font-bold text-zinc-400">Default Google Meet Link (optional)</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/abc-defg-hij"
                        value={regForm.defaultMeetLink}
                        onChange={(e) => setRegForm({ ...regForm, defaultMeetLink: e.target.value })}
                        className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm capitalize  font-bold text-zinc-400 block text-left">Supported Session Modes</label>
                      <div className="flex gap-4 pt-0.5 justify-start text-left">
                        {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                          const isSelected = regForm.modes?.includes(mode);
                          return (
                            <label key={mode} className="flex items-center gap-1.5 cursor-pointer text-sm text-white select-none">
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
                      <label className="text-sm capitalize  font-bold text-zinc-400">Professional Bio</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe your clinical expertise and background..."
                        value={regForm.bio}
                        onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-indigo-500 rounded-lg text-sm text-white outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(1)}
                        className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
                      >
                        Next: Calendar
                      </button>
                    </div>
                  </form>
                )}

                {onboardingStep === 3 && (
                  <form onSubmit={handleCompleteOnboarding} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-zinc-400 capitalize  font-bold text-sm block">Operational Days</label>
                      <div className="flex flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map(day => {
                          const active = regActiveDays[day.index];
                          return (
                            <button
                              key={day.index}
                              type="button"
                              onClick={() => toggleRegDay(day.index)}
                              className={`px-3 py-1.5 border rounded-lg text-sm font-bold capitalize  transition-all duration-200 cursor-pointer ${active
                                ? 'bg-brand text-zinc-955 font-bold border-none'
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
                      <label className="text-zinc-400 capitalize  font-bold text-sm block">Timing Slots (Active)</label>
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
                                className={`flex-1 py-2.5 border rounded-lg font-bold transition cursor-pointer text-sm ${exists
                                  ? 'bg-brand/10 border-brand text-brand'
                                  : 'bg-zinc-955 border-zinc-850 text-zinc-400 hover:border-zinc-750'
                                  }`}
                              >
                                {slot}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRegSlot(slot)}
                                className="px-2.5 py-2.5 bg-zinc-950 border border-zinc-850 hover:bg-rose-950/40 hover:border-rose-900 text-zinc-500 hover:text-rose-400 rounded-lg text-sm font-bold capitalize transition cursor-pointer shrink-0 font-header"
                                title="Remove Slot"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                        {regAllSlots.length === 0 && (
                          <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-xl text-zinc-500 italic text-sm text-center w-full">
                            No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-800 pt-3 text-left">
                      <label className="text-zinc-400 capitalize  font-bold text-sm block">Add Custom Timing Slot</label>
                      <div className="flex gap-1.5 items-end">
                        <div className="flex-1 space-y-0.5">
                          <label className="text-xs text-zinc-400 capitalize  font-bold block">Hour</label>
                          <select
                            value={regCustomHour}
                            onChange={(e) => setRegCustomHour(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <label className="text-xs text-zinc-400 capitalize  font-bold block">Minute</label>
                          <select
                            value={regCustomMinute}
                            onChange={(e) => setRegCustomMinute(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <label className="text-xs text-zinc-400 capitalize  font-bold block">AM/PM</label>
                          <select
                            value={regCustomPeriod}
                            onChange={(e) => setRegCustomPeriod(e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddRegCustomSlot}
                          className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-3 py-1.5 text-sm font-bold capitalize  rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[28.5px] flex items-center justify-center font-header"
                        >
                          Add Slot
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-800 pt-3 text-left">
                      <label className="text-zinc-400 capitalize  font-bold text-sm block">Add Custom Time Range (From / To)</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1.5 items-end">
                          <span className="text-sm text-zinc-550 font-bold pb-1.5 capitalize tracking-wide w-8 text-left">From:</span>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regFromHour}
                              onChange={(e) => setRegFromHour(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-1.5 items-end">
                          <span className="text-sm text-zinc-555 font-bold pb-1.5 capitalize tracking-wide w-8 text-left">To:</span>
                          <div className="flex-1 space-y-0.5">
                            <select
                              value={regToHour}
                              onChange={(e) => setRegToHour(e.target.value)}
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2 py-1.5 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2 text-sm font-bold capitalize  rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                        >
                          Generate Hourly Slots from Range
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-sm capitalize  rounded-lg cursor-pointer transition text-center"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
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
    <div className="min-h-screen bg-zinc-955 text-white text-left flex flex-col lg:flex-row relative overflow-hidden">

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
            <span className="font-header font-bold text-base tracking-tighter text-white">
              BEHOLD<span className="text-brand font-bold">.</span>
            </span>
            <span className="text-xs bg-zinc-850 border border-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-bold  capitalize ">
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
              <span className="font-header font-bold text-lg tracking-tighter text-white">
                BEHOLD<span className="text-brand font-bold">.</span>
              </span>
              <span className="text-sm bg-indigo-950 border border-indigo-900 text-indigo-400 px-1.5 py-0.5 rounded font-bold  capitalize">
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
            <div className="w-10 h-10 rounded-lg bg-indigo-950 text-brand flex items-center justify-center font-header font-bold text-sm border border-indigo-900 shrink-0 overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                (profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate leading-tight capitalize font-header">
                {profile.name}
              </h4>
              <span className="text-sm text-zinc-550 font-bold  capitalize truncate block ">
                {profile.education}
              </span>
            </div>
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
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-bold capitalize  transition-all text-left cursor-pointer border-none ${isActive
                    ? 'bg-brand text-zinc-955 font-bold shadow-sm'
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
            <span className="text-sm capitalize font-bold  text-zinc-500 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Psychologist Console
            </span>
            <p className="text-sm text-zinc-550 leading-relaxed pt-1.5">
              Updates to pricing or timing are synced immediately with public advisor slots listings.
            </p>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-955/20 hover:bg-rose-900 hover:text-white font-bold text-sm capitalize  rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
              <h1 className="text-xl sm:text-2xl font-header font-bold tracking-wide capitalize">
                {profile.name}
              </h1>
              <span className="text-sm bg-indigo-950 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded font-bold  capitalize ">
                CLINICAL STAFF
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Role: {profile.role} • Hourly Fee: ₹{profile.price}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center">
            <div className="bg-zinc-955 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-sm text-zinc-500 font-bold capitalize  block">Upcoming Slots</span>
              <p className="text-sm font-bold text-brand mt-0.5">{bookings.filter(b => b.status === 'CONFIRMED' && !isSessionCompleted(b)).length} Bookings</p>
            </div>
            <div className="bg-zinc-955 border border-zinc-850 px-5 py-2.5 rounded-xl">
              <span className="text-sm text-zinc-500 font-bold capitalize  block">Hours Completed</span>
              <p className="text-sm font-bold text-brand mt-0.5">{bookings.filter(isSessionCompleted).length + Number(profile.hours || 0)}+ Hrs</p>
            </div>
          </div>
        </div>

        {/* Verification Status Alert Banner */}
        {!isCounsellorVerified() && (
          <div className="bg-amber-955/20 border border-amber-900/60 p-4 rounded-xl flex items-center gap-3 text-amber-300 text-sm animate-in slide-in-from-top duration-300">
            <ShieldAlert className="w-5 h-5 text-amber-450 shrink-0" />
            <div>
              <span className="font-bold capitalize  block mb-0.5">Account Pending Verification</span>
              Your consultant profile is registered but pending admin acceptance. It will not be shown on the public Experts directory or Booking engine until verified by an administrator.
            </div>
          </div>
        )}

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-5 sm:p-8 shadow-md">
          {isLoadingData ? (
            <div className="animate-pulse space-y-6">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <div className="h-4 bg-zinc-800 rounded w-48"></div>
                <div className="h-6 bg-zinc-800 rounded w-24"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 min-h-[160px] space-y-4">
                  <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/2 mt-6"></div>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 min-h-[160px] space-y-4">
                  <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full mt-4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-800 rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* WORKSPACE 1: OVERVIEW */}
              {currentSection === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                  <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold capitalize  text-zinc-400">Psychology Dashboard Overview</h3>
                    <span className="text-sm bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-bold  capitalize">Active Status</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Next session card */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between group min-h-[160px]">
                      <div className="space-y-3">
                        <span className="text-sm bg-indigo-950 text-indigo-455 border border-indigo-900 px-2 py-0.5 rounded font-bold capitalize ">Next Client Session</span>
                        {bookings.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            <h4 className="font-header font-bold text-sm text-white capitalize">{bookings[0].userName}</h4>
                            <p className="text-sm text-zinc-400">Session Type: {bookings[0].service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}</p>
                            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{bookings[0].date} at {bookings[0].time}</span>
                            </div>
                            <div className="pt-1 flex items-center gap-2">
                              <span className="text-sm capitalize  font-semibold text-zinc-500">Room Status:</span>
                              {bookings[0].meetLink ? (
                                <span className="text-sm font-bold text-emerald-400 capitalize tracking-wide">
                                  Link Set
                                </span>
                              ) : (
                                <span className="text-sm font-bold text-amber-500 flex items-center gap-1 capitalize tracking-wide">
                                  <AlertCircle className="w-3 h-3 text-amber-500" /> Missing Link
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-505 text-sm pt-1">No upcoming scheduled bookings.</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {bookings.length > 0 && bookings[0].meetLink && bookings[0].mode === 'ONLINE' && (
                          <button
                            type="button"
                            onClick={() => window.open(bookings[0].meetLink, '_blank')}
                            className="text-sm font-bold capitalize  bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors duration-200 border-none"
                          >
                            <Video className="w-3.5 h-3.5 text-white" />
                            <span>Join Meet</span>
                          </button>
                        )}
                        <button
                          onClick={() => setCurrentSection('bookings')}
                          className="text-sm font-bold capitalize  bg-brand text-zinc-950 hover:bg-brand-dark px-3.5 py-2 rounded-lg cursor-pointer border-none"
                        >
                          {bookings.length > 0 && !bookings[0].meetLink ? 'Set Meet Link' : 'Manage Bookings'}
                        </button>
                      </div>
                    </div>

                    {/* Pricing stats card */}
                    <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                      <div className="space-y-2">
                        <span className="text-sm bg-zinc-900 text-zinc-950 px-2 py-0.5 rounded font-bold capitalize  ">Financial Rate Card</span>
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
                        className="w-fit text-sm font-bold capitalize  bg-zinc-900 text-white hover:bg-zinc-850 border border-zinc-800 px-4 py-2 rounded-lg mt-4 cursor-pointer"
                      >
                        Edit Profile Info
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* WORKSPACE 2: PROFILE DETAILS FORM */}
              {currentSection === 'profile' && (
                <form onSubmit={handleProfileSave} className="space-y-6 animate-in fade-in duration-200 text-sm">
                  <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold capitalize  text-zinc-400">Consultant Psychologist Profile</h3>
                    <span className="text-sm text-zinc-500 font-light">Clinic Records</span>
                  </div>

                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-5 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-700 group-hover:border-indigo-500 transition-colors">
                        {user?.profilePic ? (
                          <img src={user.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-indigo-950 flex items-center justify-center">
                            <span className="text-indigo-400 font-bold text-2xl font-header">
                              {(profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarFileRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-zinc-950/70 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity cursor-pointer text-white"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-white">{profile.name || 'Unnamed Counsellor'}</p>
                      <p className="text-xs text-zinc-500">{user?.email || ''}</p>
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCounsellorAvatarUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isAvatarUploading}
                        onClick={() => avatarFileRef.current?.click()}
                        className="mt-1 px-3 py-1.5 text-xs font-bold bg-indigo-950 border border-indigo-800 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg cursor-pointer transition disabled:opacity-50"
                      >
                        {isAvatarUploading ? 'Uploading...' : 'Change Photo'}
                      </button>
                    </div>
                  </div>

                  {(() => {
                    // Use editProfile (local edit copy) so background refreshes never reset the form
                    const ep = editProfile || profile;
                    const setEp = (updater) => setEditProfile(prev => ({ ...(prev || profile), ...updater }));
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left font-medium">
                        <div className="space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Display Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Dr. Sandra Tomy"
                            value={ep.name || ''}
                            onChange={(e) => setEp({ name: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Education Credentials</label>
                          <input
                            type="text"
                            placeholder="e.g. PhD Clinical Psychology"
                            value={ep.education || ''}
                            onChange={(e) => setEp({ education: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Session Fee (INR / Hour)</label>
                          <input
                            type="number"
                            placeholder="1200"
                            value={ep.price || ''}
                            onChange={(e) => setEp({ price: Number(e.target.value) })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Languages Spoken</label>
                          <input
                            type="text"
                            placeholder="Malayalam, English, Tamil"
                            value={ep.lang || ''}
                            onChange={(e) => setEp({ lang: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Baseline Therapy Hours Completed</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={ep.hours || 0}
                            onChange={(e) => setEp({ hours: Number(e.target.value) })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Specialties (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="Anxiety, Relationship Dynamics, Career Stress"
                            value={ep.specialties || ''}
                            onChange={(e) => setEp({ specialties: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold">Default Google Meet Link (optional)</label>
                          <input
                            type="url"
                            placeholder="https://meet.google.com/abc-defg-hij"
                            value={ep.defaultMeetLink || ''}
                            onChange={(e) => setEp({ defaultMeetLink: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-zinc-455 capitalize  font-bold block text-left">Supported Session Modes</label>
                          <div className="flex gap-4 pt-1 justify-start text-left">
                            {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                              const isSelected = ep.modes?.includes(mode);
                              return (
                                <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm text-white select-none">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let nextModes = [...(ep.modes || [])];
                                      if (e.target.checked) {
                                        if (!nextModes.includes(mode)) nextModes.push(mode);
                                      } else {
                                        nextModes = nextModes.filter(m => m !== mode);
                                      }
                                      setEp({ modes: nextModes });
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
                          <label className="text-zinc-455 capitalize  font-bold">Professional Biography</label>
                          <textarea
                            rows={5}
                            placeholder="Describe your clinical expertise and background..."
                            value={ep.bio || ''}
                            onChange={(e) => setEp({ bio: e.target.value })}
                            className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-lg outline-none focus:border-brand resize-none"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    {isProfileSaved ? (
                      <span className="text-sm text-emerald-500 font-bold capitalize ">
                        Changes Synced with public profiles!
                      </span>
                    ) : <span />}
                    <button
                      type="submit"
                      className="bg-brand hover:bg-brand-dark text-zinc-955 px-8 py-3 text-sm font-bold capitalize  rounded-lg shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              )}

              {/* WORKSPACE 3: EDIT AVAILABILITY TIMINGS */}
              {currentSection === 'availability' && (
                <form onSubmit={handleAvailabilitySave} className="space-y-6 animate-in fade-in duration-200 text-sm">
                  <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-bold capitalize  text-zinc-400">Manage Slot Availability</h3>
                    <span className="text-sm text-zinc-500 font-light">Set Standard Hours</span>
                  </div>

                  <div className="space-y-5 text-left font-medium">
                    {/* Select Days */}
                    <div className="space-y-2">
                      <label className="text-zinc-400 capitalize  font-bold block mb-1">Active Operational Days</label>
                      <div className="flex flex-wrap gap-2.5">
                        {DAYS_OF_WEEK.map(day => {
                          const active = activeDays[day.index];
                          return (
                            <button
                              key={day.index}
                              type="button"
                              onClick={() => toggleDay(day.index)}
                              className={`px-4 py-2 border rounded-lg text-xs font-bold capitalize  transition-all duration-300 cursor-pointer ${active
                                ? 'bg-gradient-brand border-none text-zinc-955 font-bold'
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
                      <label className="text-zinc-400 capitalize  font-bold block">Select Active Timing Slots</label>
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
                                className={`flex-1 p-3 border rounded-lg text-center font-bold transition cursor-pointer text-sm ${exists
                                  ? 'bg-brand/10 border-brand text-brand'
                                  : 'bg-zinc-955 border-zinc-850 text-zinc-400'
                                  }`}
                              >
                                {slot}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(slot)}
                                className="px-3.5 py-3 bg-zinc-955 border border-zinc-850 hover:bg-rose-955/35 hover:border-rose-900 text-zinc-450 hover:text-rose-400 rounded-lg text-sm font-bold capitalize transition cursor-pointer shrink-0"
                                title="Remove Slot"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                        {allSlots.length === 0 && (
                          <div className="col-span-2 py-4 bg-zinc-955/40 border border-dashed border-zinc-850 rounded-xl text-zinc-500 italic text-sm text-center w-full">
                            No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom Timings Adder */}
                    <div className="space-y-3 pt-3 border-t border-zinc-800">
                      <label className="text-zinc-400 capitalize  font-bold block">Add Custom Timing Slot</label>
                      <div className="flex gap-2 items-end max-w-sm">
                        <div className="flex-1 space-y-1">
                          <label className="text-sm text-zinc-550 capitalize  font-bold block">Hour</label>
                          <select
                            value={customHour}
                            onChange={(e) => setCustomHour(e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-sm text-zinc-550 capitalize  font-bold block">Minute</label>
                          <select
                            value={customMinute}
                            onChange={(e) => setCustomMinute(e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-sm text-zinc-550 capitalize  font-bold block">AM/PM</label>
                          <select
                            value={customPeriod}
                            onChange={(e) => setCustomPeriod(e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomSlot}
                          className="bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-4 py-2 text-sm font-bold capitalize  rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer shrink-0 h-[31.5px] flex items-center justify-center"
                        >
                          Add Slot
                        </button>
                      </div>
                    </div>

                    {/* Custom Time Range Adder */}
                    <div className="space-y-3 pt-3 border-t border-zinc-800">
                      <label className="text-zinc-400 capitalize  font-bold block">Add Custom Time Range (From / To)</label>
                      <div className="flex flex-col gap-2 max-w-sm">
                        <div className="flex gap-2 items-end">
                          <span className="text-sm text-zinc-550 font-bold pb-2.5 capitalize tracking-wide w-10 text-left">From:</span>
                          <div className="flex-1 space-y-1">
                            <select
                              value={fromHour}
                              onChange={(e) => setFromHour(e.target.value)}
                              className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 items-end">
                          <span className="text-sm text-zinc-555 font-bold pb-2.5 capitalize tracking-wide w-10 text-left">To:</span>
                          <div className="flex-1 space-y-1">
                            <select
                              value={toHour}
                              onChange={(e) => setToHour(e.target.value)}
                              className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                              className="w-full px-2.5 py-2 bg-zinc-955 border border-zinc-850 rounded-lg text-sm text-white outline-none focus:border-brand cursor-pointer"
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
                          className="w-full mt-1 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 py-2.5 text-sm font-bold capitalize  rounded-lg transition-colors border border-brand/30 hover:border-brand cursor-pointer flex items-center justify-center font-header"
                        >
                          Generate Hourly Slots from Range
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                    {isAvailabilitySaved ? (
                      <span className="text-sm text-emerald-500 font-bold capitalize  flex items-center gap-1">
                        Availability Matrix Synchronized!
                      </span>
                    ) : <span />}
                    <button
                      type="submit"
                      className="bg-brand hover:bg-brand-dark text-zinc-955 px-8 py-3 text-sm font-bold capitalize  rounded-lg shadow-sm border-none cursor-pointer flex items-center gap-1.5"
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
                  <div className="space-y-6 animate-in fade-in duration-200 text-sm text-left">
                    <div className="border-b border-zinc-805 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-bold capitalize  text-zinc-400">Student Booking Details & Rooms</h3>
                        <p className="text-sm text-zinc-500 mt-1">Manage virtual consultations, update appointment statuses, and log clinic summaries.</p>
                      </div>
                      <span className="text-sm bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded font-bold  capitalize ">{bookings.length} Total</span>
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
                            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize  transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 border ${isActive
                              ? 'bg-brand text-zinc-955 border-brand font-bold shadow-lg scale-102 shadow-brand/10'
                              : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                              }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-sm  ${isActive ? 'bg-zinc-955/20 text-zinc-955 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
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
                                className={`px-2.5 py-1 border rounded outline-none text-sm font-bold capitalize  cursor-pointer transition-all ${booking.status === 'CONFIRMED'
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
                              <span className="text-sm bg-zinc-900 text-white px-2 py-0.5 rounded font-semibold capitalize  ">
                                {booking.service === 'counselling' ? 'Psychological Session' : 'Career Session'}
                              </span>
                              <span className="text-sm text-zinc-500 font-bold capitalize ">{booking.mode}</span>
                            </div>

                            <div className="space-y-0.5">
                              <h4 className="font-header font-bold text-sm capitalize text-white">{booking.userName}</h4>
                              <div className="flex items-center gap-1.5 text-sm text-zinc-400 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                <span>{booking.date} at {booking.time}</span>
                              </div>
                            </div>

                            {/* Room link status block */}
                            <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="text-sm capitalize  font-semibold text-zinc-500">Meeting Room:</span>
                              {booking.meetLink ? (
                                <button
                                  type="button"
                                  onClick={() => window.open(booking.meetLink, '_blank')}
                                  className="text-sm font-bold text-white hover:text-brand transition flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 underline"
                                >
                                  <Link className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Join Meet
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-zinc-500 italic flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Link Missing. Access Locked.
                                </span>
                              )}
                            </div>

                            {/* Diagnostic Feedback Editor / Display */}
                            {booking.status === 'COMPLETED' && (
                              <div className="pt-3 mt-2 border-t border-zinc-900 space-y-2 w-full max-w-xl">
                                <span className="text-sm capitalize  font-semibold text-zinc-505 block">Session Feedback & Diagnostic Notes:</span>

                                {editingFeedbackId === booking.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={feedbackInput}
                                      onChange={(e) => setFeedbackInput(e.target.value)}
                                      placeholder="Enter session feedback, guidance notes, or key recommendations for the student..."
                                      rows={3}
                                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg outline-none focus:border-brand resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => saveFeedback(booking.id)}
                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm font-bold capitalize  cursor-pointer shadow-xs border-none"
                                      >
                                        Save Feedback
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingFeedbackId(null)}
                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {booking.feedback ? (
                                      <p className="text-[12.5px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850/50 italic leading-relaxed font-light">
                                        "{booking.feedback}"
                                      </p>
                                    ) : (
                                      <p className="text-sm text-zinc-500 italic">No notes added yet.</p>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingFeedbackId(booking.id);
                                        setFeedbackInput(booking.feedback || '');
                                      }}
                                      className="text-sm font-bold text-brand hover:underline capitalize  flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
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
                                    className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg outline-none w-full sm:w-[240px] focus:border-brand"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveMeetLink(booking.id)}
                                      className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold capitalize  cursor-pointer shadow-xs border-none"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingBookingId(null)}
                                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold capitalize  cursor-pointer border-none"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {booking.meetLink && booking.mode === 'ONLINE' && (
                                  <a
                                    href={booking.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold capitalize  transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                                  >
                                    <Video className="w-3.5 h-3.5 text-white" />
                                    <span>Join Meet</span>
                                  </a>
                                )}
                                <button
                                  onClick={() => startEditMeetLink(booking)}
                                  className="px-4.5 py-3 bg-brand hover:bg-brand-dark text-zinc-955 rounded-lg text-sm font-bold capitalize  transition cursor-pointer flex items-center gap-1 shadow-xs border-none font-semibold"
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
                          <p className="text-zinc-500 font-bold text-sm capitalize ">
                            No {activeBookingTab.toLowerCase()} sessions registered for your account yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
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
                <h3 className="text-sm font-bold text-white capitalize  font-header font-bold">My Profile</h3>
                <p className="text-sm text-zinc-500 mt-0.5">Clinical Staff Profile</p>
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-header font-bold text-2xl shadow-xl">
                {(profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-white capitalize tracking-wide font-header font-bold">{profile.name}</h2>
                <span className="inline-block mt-1 text-sm px-2.5 py-1 rounded-full font-bold capitalize  bg-indigo-950 border border-indigo-900 text-indigo-400 ">
                  Consultant Psychologist
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 py-5 space-y-4 flex-1">
              <p className="text-sm font-bold capitalize  text-zinc-500 ">Professional Details</p>
              <div className="bg-zinc-955/60 rounded-xl p-4 space-y-3 border border-zinc-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold capitalize  text-zinc-500 ">Email Address</p>
                    <p className="text-sm text-white font-semibold truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize  text-zinc-500 ">Education</p>
                    <p className="text-sm text-white font-semibold">{profile.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize  text-zinc-500 ">Session Fee</p>
                    <p className="text-sm text-white font-semibold">₹{profile.price} / Hour</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize  text-zinc-500 ">Languages</p>
                    <p className="text-sm text-white font-semibold">{profile.lang}</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              {profile.specialties && (
                <div className="space-y-2">
                  <p className="text-sm font-bold capitalize  text-zinc-500 ">Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialties.split(',').map((s, i) => (
                      <span key={i} className="text-sm px-2 py-1 bg-indigo-955 border border-indigo-900 text-indigo-300 rounded-full font-semibold ">
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
                className="w-full py-2.5 border border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-white font-bold text-sm capitalize  rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-zinc-900"
              >
                <Edit className="w-3.5 h-3.5 text-brand" /> Edit Profile
              </button>
              <button
                onClick={() => { setIsProfileDrawerOpen(false); setIsLogoutConfirmOpen(true); }}
                className="w-full py-2.5 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-955/20 hover:bg-rose-900 hover:text-white font-bold text-sm capitalize  rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
