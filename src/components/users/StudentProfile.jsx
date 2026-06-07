import { useState, useEffect, useMemo, useRef } from 'react';
import {
  User, Phone, Mail, BookOpen, Award, LayoutDashboard, Calendar,
  History, BarChart3, Clock, ExternalLink, Lock, Check, Sun,
  Trophy, Target, Bell, ChevronRight, Save, Download, Star,
  Briefcase, GraduationCap, Users, X as XIcon, Plus, ArrowUpRight,
  Shield, MessageCircle, RefreshCw, CalendarDays, Video, MapPin,
  CheckCircle2, AlertCircle, Hash, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const INITIAL_STATE = {
  name: '', email: '', phone: '', schoolName: '', grade: '',
  guardianName: '', guardianPhone: '', groupCode: ''
};

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard, accent: 'from-brand to-brand-accent' },
  { id: 'details', label: 'My Profile', short: 'Profile', icon: User, accent: 'from-indigo-500 to-purple-500' },
  { id: 'booked', label: 'Upcoming', short: 'Upcoming', icon: Calendar, accent: 'from-amber-500 to-orange-500' },
  { id: 'completed', label: 'Timeline', short: 'Timeline', icon: History, accent: 'from-emerald-500 to-teal-500' },
  { id: 'results', label: 'CDAT Results', short: 'Results', icon: BarChart3, accent: 'from-rose-500 to-pink-500' }
];

const CAREER_SUGGESTIONS = {
  'Logical Reasoning': ['Engineering', 'Data Science', 'Computer Science', 'Mathematics'],
  'Verbal Ability': ['Law', 'Journalism', 'Content Writing', 'Mass Communication'],
  'Numerical Ability': ['Finance', 'Accounting', 'Statistics', 'Actuarial Science'],
  'Spatial Reasoning': ['Architecture', 'Graphic Design', 'UI/UX', 'Game Design'],
  'Mechanical Reasoning': ['Mechanical Engineering', 'Robotics', 'Automotive', 'Aerospace'],
  'Abstract Reasoning': ['Research', 'Philosophy', 'Psychology', 'Innovation Management'],
  'Clerical Speed': ['Administration', 'Banking', 'Government Services', 'Operations']
};

const STATUS_STYLES = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  zinc:    { bg: 'bg-zinc-100',    text: 'text-zinc-600',    dot: 'bg-zinc-400' },
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' }
};

const KPI_STYLES = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  brand:   { bg: 'bg-brand-light', text: 'text-brand-dark' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700' }
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function calculateCompletion(profile) {
  const fields = ['name', 'email', 'phone', 'schoolName', 'grade', 'guardianName', 'guardianPhone'];
  const filled = fields.filter(f => profile[f] && String(profile[f]).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

function getInitials(name, fallback) {
  const source = name || fallback || 'ST';
  return source.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatCountdown(dateStr, timeStr) {
  try {
    const [time, modifier] = (timeStr || '').split(' ');
    let [hours, minutes] = (time || '0:00').split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day, hours, minutes);
    const diff = target - new Date();
    if (diff <= 0) return { text: 'Starting now', urgent: true };
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return { text: `${days}d ${hrs}h`, urgent: days < 1 };
    if (hrs > 0) return { text: `${hrs}h ${mins}m`, urgent: hrs < 1 };
    return { text: `${mins}m`, urgent: true };
  } catch {
    return { text: '—', urgent: false };
  }
}

const isSessionCompleted = (booking) => {
  if (booking.status === 'CANCELLED') return false;
  if (booking.status === 'COMPLETED') return true;
  if (booking.status === 'CONFIRMED') {
    try {
      const [year, month, day] = booking.date.split('-').map(Number);
      const timeParts = booking.time.split(' ');
      let [hours, minutes] = timeParts[0].split(':').map(Number);
      const meridiem = timeParts[1];
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
      return new Date() > sessionEnd;
    } catch { return false; }
  }
  return false;
};

const getMeetLinkStatus = (session) => {
  if (!session.meetLink) return { status: 'NO_LINK', label: 'Awaiting Link', color: 'amber' };
  if (session.mode !== 'ONLINE') return { status: 'OFFLINE', label: 'In-Person', color: 'zinc' };
  try {
    const [time, modifier] = session.time.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const [year, month, day] = session.date.split('-').map(Number);
    const sessionTime = new Date(year, month - 1, day, hours, minutes);
    const diffMinutes = (sessionTime - new Date()) / 60000;
    if (diffMinutes <= 10 && diffMinutes >= -60) {
      return { status: 'AVAILABLE', label: 'Join Now', link: session.meetLink, color: 'emerald' };
    } else if (diffMinutes > 10) {
      const mins = Math.round(diffMinutes);
      return { status: 'LOCKED', label: mins > 60 ? `Opens in ${Math.round(mins / 60)}h` : `Opens in ${mins}m`, color: 'zinc' };
    }
    return { status: 'EXPIRED', label: 'Session Ended', color: 'rose' };
  } catch {
    return { status: 'AVAILABLE', label: 'Join Now', link: session.meetLink, color: 'emerald' };
  }
};

export default function StudentProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (!saved) return INITIAL_STATE;
      return { ...INITIAL_STATE, ...JSON.parse(saved) };
    } catch {
      return INITIAL_STATE;
    }
  });
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState('overview');
  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [testProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('behold_test_profile');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [sessionFilter, setSessionFilter] = useState('all');
  const { user } = useAuth();

  const completion = useMemo(() => calculateCompletion(profile), [profile]);
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = profile.name || user?.name || 'Student';

  useEffect(() => {
    window.history.replaceState({ component: 'profile', section: 'overview' }, '');
    const handlePopState = (e) => {
      if (e.state && e.state.component === 'profile' && e.state.section) {
        setCurrentSection(e.state.section);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadStudentBookings = () => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let list = stored ? JSON.parse(stored) : [];
      const cleanList = list.filter(b => !['sb_mock_1', 'sb_mock_2', 'sb_mock_c1'].includes(b.id));
      if (cleanList.length !== list.length) {
        localStorage.setItem('behold_booked_sessions', JSON.stringify(cleanList));
        list = cleanList;
      }
      const currentStudentId = user?.id || '';
      const filtered = list
        .filter(b => b.userId === currentStudentId && b.status !== 'CANCELLED' && !isSessionCompleted(b))
        .sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          return a.date.localeCompare(b.date);
        });
      setBookedSessions(filtered);
    } catch { /* noop */ }
  };

  const loadCompletedSessions = () => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      let list = stored ? JSON.parse(stored) : [];
      const cleanList = list.filter(b => !['sb_mock_1', 'sb_mock_2', 'sb_mock_c1'].includes(b.id));
      if (cleanList.length !== list.length) {
        localStorage.setItem('behold_booked_sessions', JSON.stringify(cleanList));
        list = cleanList;
      }
      const currentStudentId = user?.id || '';
      const completedList = list
        .filter(b => b.userId === currentStudentId && isSessionCompleted(b))
        .sort((a, b) => b.date.localeCompare(a.date));
      setCompletedSessions(completedList);
    } catch { /* noop */ }
  };

  const loadBookingsRef = useRef(loadStudentBookings);
  const loadCompletedRef = useRef(loadCompletedSessions);

  useEffect(() => {
    loadBookingsRef.current = loadStudentBookings;
    loadCompletedRef.current = loadCompletedSessions;
  });

  useEffect(() => {
    loadBookingsRef.current();
    loadCompletedRef.current();
    const handleStorageChange = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      if (key === 'behold_booked_sessions' || !key) {
        loadBookingsRef.current();
        loadCompletedRef.current();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
    };
  }, [user]);

  const handleSectionChange = (sectionId) => {
    setCurrentSection(sectionId);
    window.history.pushState({ component: 'profile', section: sectionId }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('behold_student_profile', JSON.stringify(updated));
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const err = {};
    if (!profile.name.trim()) err.name = 'Required';
    else if (profile.name.trim().length < 3) err.name = 'Min 3 characters';
    if (!profile.email.trim()) err.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) err.email = 'Invalid email';
    if (!profile.phone.trim()) err.phone = 'Required';
    else if (!/^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/.test(profile.phone.trim())) err.phone = 'Invalid phone';
    if (!profile.guardianName.trim()) err.guardianName = 'Required';
    return err;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancelSession = (sessionId) => {
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      const list = stored ? JSON.parse(stored) : [];
      const session = list.find(b => b.id === sessionId);
      if (session && isSessionCompleted(session)) {
        alert('Cannot cancel a session that is already in the past or completed.');
        return;
      }
      const updated = list.map(b => b.id === sessionId ? { ...b, status: 'CANCELLED' } : b);
      localStorage.setItem('behold_booked_sessions', JSON.stringify(updated));
      loadStudentBookings();
    } catch { /* noop */ }
  };

  const filteredBooked = useMemo(() => {
    if (sessionFilter === 'all') return bookedSessions;
    if (sessionFilter === 'online') return bookedSessions.filter(s => s.mode === 'ONLINE');
    if (sessionFilter === 'offline') return bookedSessions.filter(s => s.mode !== 'ONLINE');
    if (sessionFilter === 'pending') return bookedSessions.filter(s => s.status === 'PENDING');
    return bookedSessions;
  }, [bookedSessions, sessionFilter]);

  const nextSession = bookedSessions[0];
  const stats = {
    total: bookedSessions.length + completedSessions.length,
    completed: completedSessions.length,
    upcoming: bookedSessions.length,
    hours: completedSessions.length
  };

  // ─── Sub-components ──────────────────────────────────────────────

  const HeroHeader = () => {
    const totalProgress = Math.min(100, completion + (testProfile ? 15 : 0) + (stats.completed > 0 ? 10 : 0));
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white shadow-2xl border border-zinc-800">
        {/* Decorative gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-accent/15 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,209,209,0.08),transparent_50%)]" />

        <div className="relative z-10 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
            {/* Avatar with completion ring */}
            <div className="relative shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke="url(#avatarGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - totalProgress / 100)}`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D1D1" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center text-zinc-950 font-black text-2xl sm:text-3xl shadow-inner">
                  {getInitials(profile.name, user?.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-zinc-950 flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Name & meta */}
            <div className="flex-1 text-center lg:text-left min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-brand-light tracking-widest uppercase mb-1.5 flex items-center gap-2 justify-center lg:justify-start">
                <Sun className="w-3.5 h-3.5" /> {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-header font-black tracking-tight uppercase leading-tight">
                {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 justify-center lg:justify-start text-xs text-zinc-400">
                {profile.grade && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    <GraduationCap className="w-3.5 h-3.5 text-brand" /> {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                    <BookOpen className="w-3.5 h-3.5 text-brand" />
                    <span className="truncate max-w-[200px]">{profile.schoolName}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand">
                  <Shield className="w-3.5 h-3.5" /> Verified Student
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3.5 justify-center lg:justify-start text-[11px] sm:text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span className="truncate max-w-[200px]">{profile.email || user?.email || 'Add email'}</span>
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand" /> {profile.phone}
                  </span>
                )}
              </div>
              {/* Profile completion bar */}
              <div className="mt-4 max-w-md mx-auto lg:mx-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Profile completion</span>
                  <span className="text-xs font-black text-brand">{totalProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-brand-accent rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(0,209,209,0.5)]"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full lg:w-auto lg:max-w-xs shrink-0">
              {[
                { icon: CalendarDays, label: 'Upcoming', value: stats.upcoming, color: 'text-amber-400' },
                { icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
                { icon: Clock, label: 'Hours', value: `${stats.hours}h`, color: 'text-brand-light' }
              ].map((s, i) => (
                <div
                  key={i}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-brand/40 p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  <s.icon className={`w-4 h-4 ${s.color} mb-1.5 group-hover:scale-110 transition-transform`} />
                  <span className="text-base sm:text-xl font-black text-white">{s.value}</span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SidebarNav = () => (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col gap-1.5 p-2 bg-white border border-zinc-200 rounded-2xl shadow-sm sticky top-24">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          const badge =
            tab.id === 'booked' ? bookedSessions.length :
            tab.id === 'completed' ? completedSessions.length :
            tab.id === 'results' && !testProfile ? '!' : null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSectionChange(tab.id)}
              className={`relative flex items-center gap-3 px-3.5 min-h-[48px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${tab.accent} text-white shadow-md`
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-brand'}`} />
              <span className="flex-1 text-left">{tab.label}</span>
              {badge !== null && badge !== 0 && (
                <span className={`text-[10px] font-black px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.id === 'results' && !testProfile
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-brand-light text-brand-dark'
                }`}>
                  {badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>
          );
        })}

        <div className="mt-3 p-3 bg-gradient-to-br from-brand-light/50 to-brand-accent/10 border border-brand/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-brand/20 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-brand-dark" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-800">Need help?</span>
          </div>
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Your data is stored locally on your device. Reach out to your coordinator for any support.
          </p>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 max-w-2xl mx-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentSection === tab.id;
            const badge =
              tab.id === 'booked' ? bookedSessions.length :
              tab.id === 'completed' ? completedSessions.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors ${
                  isActive ? 'text-brand-dark' : 'text-zinc-500'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge !== null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-black px-1.5 min-w-[16px] h-4 rounded-full bg-brand text-zinc-950 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-full">{tab.short}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );

  // ─── Tab: Overview ────────────────────────────────────────────────

  const OverviewTab = () => {
    const [, setNow] = useState(new Date());
    useEffect(() => {
      const t = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(t);
    }, []);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Greeting + Quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">
              Welcome back, <span className="text-brand-dark">{displayName.split(' ')[0]}</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {nextSession ? 'Your next session is around the corner.' : 'Ready to take the next step in your journey?'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.spaNavigate('/booking')}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-brand/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Book New
            </button>
          </div>
        </div>

        {/* Next session hero card */}
        {nextSession ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 sm:p-6 text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-brand-accent/20 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-accent text-zinc-950 flex items-center justify-center shrink-0 shadow-lg">
                  {nextSession.mode === 'ONLINE' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-light mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Next session
                  </p>
                  <h3 className="text-lg sm:text-xl font-header font-black uppercase tracking-wide leading-tight">
                    {nextSession.advisorName}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    {nextSession.advisorRole || 'Consultation'} • {nextSession.mode === 'ONLINE' ? 'Online' : 'In-Person'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 font-bold inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {nextSession.date}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15 font-bold inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {nextSession.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {(() => {
                  const cd = formatCountdown(nextSession.date, nextSession.time);
                  return (
                    <>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Starts in</p>
                        <p className={`text-2xl sm:text-3xl font-black tabular-nums ${cd.urgent ? 'text-amber-300' : 'text-white'}`}>
                          {cd.text}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSectionChange('booked')}
                        className="min-h-[40px] px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/5 via-white to-brand-accent/5 border-2 border-dashed border-brand/30 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand to-brand-accent text-zinc-950 flex items-center justify-center mb-4 shadow-lg">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-header font-black text-zinc-900">No upcoming sessions</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
              Schedule a session with one of our certified professionals to start your journey.
            </p>
            <button
              type="button"
              onClick={() => window.spaNavigate('/booking')}
              className="mt-4 inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Book Your First Session
            </button>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: Calendar, label: 'Booked', value: stats.upcoming, color: 'from-amber-400 to-orange-500', trend: 'Upcoming sessions' },
            { icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'from-emerald-400 to-teal-500', trend: 'Lifetime sessions' },
            { icon: BarChart3, label: 'CDAT', value: testProfile ? 'Done' : 'Pending', color: 'from-rose-400 to-pink-500', trend: testProfile ? 'Profile ready' : 'Not taken yet' },
            { icon: Trophy, label: 'Hours', value: `${stats.hours}h`, color: 'from-indigo-400 to-purple-500', trend: 'Coaching time' }
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div
                key={i}
                className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity`} />
                <div className={`relative inline-flex w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${kpi.color} text-white items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{kpi.value}</p>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-1">{kpi.trend}</p>
              </div>
            );
          })}
        </div>

        {/* Action cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* CDAT card */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-100 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testProfile ? 'from-emerald-400 to-teal-500' : 'from-rose-400 to-pink-500'} text-white flex items-center justify-center shadow-md`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${testProfile ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                  {testProfile ? 'Completed' : 'Not taken'}
                </span>
              </div>
              <h4 className="font-header font-black text-base sm:text-lg text-zinc-900 uppercase tracking-wide">Aptitude Test</h4>
              {testProfile ? (
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Your dominant domain is <strong className="text-zinc-900">{testProfile.dominantDomain}</strong>. Review your full profile for career insights.
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Map your natural strengths across 7 key domains. Takes about 15 minutes.
                </p>
              )}
              <button
                type="button"
                onClick={() => testProfile ? handleSectionChange('results') : window.spaNavigate('/sample-test')}
                className={`mt-4 w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  testProfile
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-brand'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:scale-[1.02] text-white shadow-md shadow-rose-500/20'
                } border-none`}
              >
                {testProfile ? 'View Full Results' : 'Start Test Now'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Book consult card */}
          <div className="group relative overflow-hidden bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-100 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bookedSessions.length > 0 ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'} text-white flex items-center justify-center shadow-md`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${bookedSessions.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                  {bookedSessions.length > 0 ? `${bookedSessions.length} scheduled` : 'No bookings'}
                </span>
              </div>
              <h4 className="font-header font-black text-base sm:text-lg text-zinc-900 uppercase tracking-wide">Expert Consultation</h4>
              {bookedSessions.length > 0 ? (
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Your next session is with <strong className="text-zinc-900">{bookedSessions[0].advisorName}</strong> on {bookedSessions[0].date}.
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Connect 1-on-1 with our certified psychologists and career counsellors.
                </p>
              )}
              <button
                type="button"
                onClick={() => bookedSessions.length > 0 ? handleSectionChange('booked') : window.spaNavigate('/booking')}
                className={`mt-4 w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  bookedSessions.length > 0
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-brand'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02] text-white shadow-md shadow-amber-500/20'
                } border-none`}
              >
                {bookedSessions.length > 0 ? 'View Bookings' : 'Book a Session'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Timeline strip + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-header font-black text-sm sm:text-base uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand" /> Recent Activity
              </h4>
              <button
                type="button"
                onClick={() => handleSectionChange('completed')}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:text-brand transition-colors cursor-pointer"
              >
                View all →
              </button>
            </div>
            {completedSessions.length > 0 ? (
              <div className="space-y-3">
                {completedSessions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{s.advisorName}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{s.advisorRole || 'Consultation'} • {s.date}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Your completed sessions will appear here.</p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand/20 rounded-full blur-2xl" />
            <h4 className="font-header font-black text-sm sm:text-base uppercase tracking-wide flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-300" /> Achievements
            </h4>
            <div className="space-y-2.5">
              {[
                { icon: User, label: 'Profile Created', done: !!profile.name },
                { icon: Mail, label: 'Email Verified', done: !!profile.email },
                { icon: Phone, label: 'Phone Added', done: !!profile.phone },
                { icon: Calendar, label: 'First Booking', done: stats.total > 0 },
                { icon: BarChart3, label: 'CDAT Completed', done: !!testProfile },
                { icon: Award, label: '5 Sessions Done', done: stats.completed >= 5 }
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className={`flex items-center gap-2.5 text-xs ${a.done ? 'text-white' : 'text-zinc-500'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      a.done ? 'bg-gradient-to-br from-brand to-brand-accent text-zinc-950' : 'bg-white/5 border border-white/10'
                    }`}>
                      {a.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-semibold">{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Tab: Profile Details ─────────────────────────────────────────

  const ProfileDetailsTab = () => {
    const sections = [
      {
        title: 'Personal Info',
        icon: User,
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', required: true, icon: User },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@email.com', required: true, icon: Mail, autoComplete: 'email' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. 8086664001', required: true, icon: Phone, autoComplete: 'tel' }
        ]
      },
      {
        title: 'Academic',
        icon: GraduationCap,
        fields: [
          { name: 'schoolName', label: 'School Name', type: 'text', placeholder: 'Name of your school', required: false, icon: BookOpen },
          { name: 'grade', label: 'Grade (Class)', type: 'select', options: ['', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'], required: false, icon: Hash },
          { name: 'groupCode', label: 'Group / School Code', type: 'text', placeholder: 'e.g. BEHOLD-CDAT-2026', required: false, icon: Hash }
        ]
      },
      {
        title: 'Guardian',
        icon: Users,
        fields: [
          { name: 'guardianName', label: 'Parent / Guardian Name', type: 'text', placeholder: 'Name of parent or guardian', required: true, icon: User },
          { name: 'guardianPhone', label: 'Guardian Phone', type: 'tel', placeholder: 'Guardian mobile number', required: false, icon: Phone, autoComplete: 'tel' }
        ]
      }
    ];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">My Profile</h2>
            <p className="text-sm text-zinc-500 mt-1">Keep your details up to date for the best guidance experience.</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" /> Stored locally on your device
          </div>
        </div>

        {/* Progress card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-light/40 to-brand-accent/10 border border-brand/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-dark">Profile Strength</p>
              <p className="text-sm text-zinc-700 mt-0.5">
                {completion < 50 ? 'A complete profile helps us serve you better.' :
                 completion < 100 ? 'Almost there! Fill in remaining fields.' :
                 'Your profile is complete. Great job!'}
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-brand-dark tabular-nums">{completion}%</div>
          </div>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-accent rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,209,209,0.4)]"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {sections.map((section, sIdx) => {
            const SIcon = section.icon;
            return (
              <div key={sIdx} className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand/10 to-brand-accent/10 text-brand-dark flex items-center justify-center">
                    <SIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-header font-black text-base text-zinc-900 uppercase tracking-wide">{section.title}</h3>
                    <p className="text-[11px] text-zinc-500">
                      {section.title === 'Personal Info' && 'Used for booking and contact'}
                      {section.title === 'Academic' && 'Optional but recommended'}
                      {section.title === 'Guardian' && 'For students under 18'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(field => {
                    const FIcon = field.icon;
                    const hasError = !!errors[field.name];
                    const hasValue = !!profile[field.name];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label htmlFor={`sp-${field.name}`} className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="relative group">
                          {FIcon && (
                            <FIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                              hasError ? 'text-rose-400' : hasValue ? 'text-brand' : 'text-zinc-400 group-focus-within:text-brand'
                            }`} />
                          )}
                          {field.type === 'select' ? (
                            <select
                              id={`sp-${field.name}`}
                              name={field.name}
                              value={profile[field.name]}
                              onChange={handleChange}
                              className={`w-full min-h-[48px] pl-11 pr-10 py-3 bg-white border text-sm text-zinc-900 rounded-xl outline-none transition-all appearance-none cursor-pointer ${
                                hasError ? 'border-rose-300 focus:border-rose-500' : 'border-zinc-200 focus:border-brand focus:ring-2 focus:ring-brand/15'
                              }`}
                            >
                              {field.options.map((o, i) => (
                                <option key={i} value={o}>{o || 'Select ' + field.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id={`sp-${field.name}`}
                              type={field.type}
                              name={field.name}
                              value={profile[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              autoComplete={field.autoComplete}
                              className={`w-full min-h-[48px] pl-11 pr-10 py-3 bg-white border text-sm text-zinc-900 rounded-xl outline-none transition-all ${
                                hasError ? 'border-rose-300 focus:border-rose-500' : 'border-zinc-200 focus:border-brand focus:ring-2 focus:ring-brand/15'
                              }`}
                            />
                          )}
                          {hasValue && !hasError && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                            </div>
                          )}
                          {hasError && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            </div>
                          )}
                        </div>
                        {hasError ? (
                          <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1" role="alert">
                            <AlertCircle className="w-3 h-3" /> {errors[field.name]}
                          </p>
                        ) : (
                          <p className="text-[10px] text-zinc-400">{field.required ? 'Required field' : 'Optional'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="sticky bottom-16 lg:bottom-0 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 bg-white border border-zinc-200 rounded-2xl shadow-lg">
            <button
              type="button"
              onClick={() => setErrors({})}
              className="min-h-[48px] px-5 py-3 border border-zinc-200 hover:border-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-700 transition bg-white"
            >
              Discard
            </button>
            <button
              type="submit"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-brand/20 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all border-none"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>

        {isSaved && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-bottom-4" role="status">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold">Profile saved successfully!</span>
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: Booked Sessions ─────────────────────────────────────────

  const BookedSessionsTab = () => {
    const filterChips = [
      { id: 'all', label: 'All', count: bookedSessions.length },
      { id: 'online', label: 'Online', count: bookedSessions.filter(s => s.mode === 'ONLINE').length },
      { id: 'offline', label: 'In-Person', count: bookedSessions.filter(s => s.mode !== 'ONLINE').length },
      { id: 'pending', label: 'Pending', count: bookedSessions.filter(s => s.status === 'PENDING').length }
    ];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">Upcoming Sessions</h2>
            <p className="text-sm text-zinc-500 mt-1">{bookedSessions.length} session{bookedSessions.length !== 1 ? 's' : ''} on your calendar.</p>
          </div>
          <button
            type="button"
            onClick={() => window.spaNavigate('/booking')}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border-none"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> New Booking
          </button>
        </div>

        {/* Filter chips */}
        {bookedSessions.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
            {filterChips.map(chip => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSessionFilter(chip.id)}
                className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  sessionFilter === chip.id
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {chip.label}
                {chip.count > 0 && (
                  <span className={`text-[9px] font-black px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center ${
                    sessionFilter === chip.id ? 'bg-white/20' : 'bg-zinc-100'
                  }`}>
                    {chip.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {filteredBooked.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBooked.map((session, idx) => {
              const meetStatus = getMeetLinkStatus(session);
              const statusKey = session.status === 'CONFIRMED' ? 'emerald' : session.status === 'PENDING' ? 'amber' : 'zinc';
              const statusStyle = STATUS_STYLES[statusKey];
              const cd = formatCountdown(session.date, session.time);
              return (
                <div
                  key={session.id || idx}
                  className={`group relative bg-white border-2 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    session.status === 'CONFIRMED' ? 'border-emerald-200 hover:border-emerald-300' : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    session.status === 'CONFIRMED' ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'
                  }`} />

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        session.mode === 'ONLINE' ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                      } text-white shadow-md`}>
                        {session.mode === 'ONLINE' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${session.status === 'CONFIRMED' ? 'animate-pulse' : ''}`} />
                          {session.status}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5">
                          {session.service === 'counselling' ? 'Psychological' : 'Career'} • {session.mode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">In</p>
                      <p className={`text-base font-black tabular-nums ${cd.urgent ? 'text-amber-600' : 'text-zinc-900'}`}>{cd.text}</p>
                    </div>
                  </div>

                  <h4 className="font-header font-black text-base uppercase tracking-wide text-zinc-900 truncate">
                    {session.advisorName}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{session.advisorRole || 'Consultation'}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="text-xs font-bold text-zinc-700 truncate">{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200/60">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="text-xs font-bold text-zinc-700 truncate">{session.time}</span>
                    </div>
                  </div>

                  {session.mode === 'ONLINE' && !session.meetLink && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Meet link pending from counsellor.</span>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap gap-2">
                    {session.mode === 'ONLINE' && meetStatus.status === 'AVAILABLE' ? (
                      <a
                        href={meetStatus.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-brand/20 hover:scale-[1.01] transition-transform"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Now
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : session.mode === 'ONLINE' ? (
                      <button
                        type="button"
                        disabled
                        title={meetStatus.status === 'LOCKED' ? 'Link activates 10 min before session' : 'Session has ended'}
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" /> {meetStatus.label}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View Location
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => window.spaNavigate('/booking')}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-zinc-200 hover:border-zinc-900 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-900 transition bg-white"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Cancel this session? This cannot be undone.')) handleCancelSession(session.id);
                      }}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-widest transition"
                    >
                      <XIcon className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-light/30 to-brand-accent/10 border-2 border-dashed border-brand/30 rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand to-brand-accent text-zinc-950 flex items-center justify-center mb-4 shadow-lg">
              <CalendarDays className="w-9 h-9" />
            </div>
            <h3 className="text-lg sm:text-xl font-header font-black text-zinc-900">No sessions yet</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              {sessionFilter === 'all'
                ? 'Book a session with one of our experts to start your journey.'
                : `No ${sessionFilter} sessions scheduled. Try a different filter.`}
            </p>
            <button
              type="button"
              onClick={() => window.spaNavigate('/booking')}
              className="mt-5 inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Book a Session
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: Completed Timeline ──────────────────────────────────────

  const CompletedTab = () => {
    const avgRating = 4.8; // Placeholder
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">Timeline & Feedback</h2>
          <p className="text-sm text-zinc-500 mt-1">Your journey with our experts — celebrate your progress.</p>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total Sessions', value: completedSessions.length, icon: CheckCircle2, color: 'emerald' },
            { label: 'Hours Coached', value: `${completedSessions.length}h`, icon: Clock, color: 'brand' },
            { label: 'Avg. Rating', value: avgRating, icon: Star, color: 'amber', suffix: '/5' }
          ].map((s, i) => {
            const Icon = s.icon;
            const style = KPI_STYLES[s.color] || KPI_STYLES.brand;
            return (
              <div key={i} className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.text} flex items-center justify-center mb-2`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-900">{s.value}{s.suffix && <span className="text-sm text-zinc-500 font-bold">{s.suffix}</span>}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {completedSessions.length > 0 ? (
          <div className="relative">
            <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand via-brand-accent to-brand/30" />
            <div className="space-y-6">
              {completedSessions.map((session, sIdx) => (
                <div key={session.id || sIdx} className="relative pl-12 sm:pl-16">
                  <div className="absolute left-0 top-3 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-brand to-brand-accent text-zinc-950 flex items-center justify-center shadow-lg shadow-brand/30 ring-4 ring-white">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black uppercase tracking-wider">
                            {session.status}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {session.mode} SESSION
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star key={n} className={`w-3 h-3 ${n <= 5 ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`} />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-header font-black text-base uppercase tracking-wide text-zinc-900">
                          {session.advisorName}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{session.advisorRole || 'Consultation'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg shrink-0 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-bold">{session.date}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="font-semibold">{session.time}</span>
                      </div>
                    </div>

                    {session.feedback && (
                      <div className="relative bg-gradient-to-br from-brand-light/40 to-brand-accent/10 border border-brand/15 rounded-xl p-4 mt-3">
                        <MessageCircle className="absolute top-3 right-3 w-4 h-4 text-brand/30" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark mb-1.5">Counsellor Feedback</p>
                        <p className="text-sm text-zinc-700 italic leading-relaxed">"{session.feedback}"</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                        Session #{completedSessions.length - sIdx}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-dark hover:text-brand transition-colors"
                        title="Download certificate"
                      >
                        <Download className="w-3.5 h-3.5" /> Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-200 rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="w-9 h-9" />
            </div>
            <h3 className="text-lg sm:text-xl font-header font-black text-zinc-900">No completed sessions yet</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Once you finish your first session, it will appear here with the counsellor's feedback.
            </p>
            <button
              type="button"
              onClick={() => window.spaNavigate('/booking')}
              className="mt-5 inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all border-none"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Book First Session
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: CDAT Results ────────────────────────────────────────────

  const ResultsTab = () => {
    if (!testProfile) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">CDAT Test Results</h2>
            <p className="text-sm text-zinc-500 mt-1">Discover your dominant strengths across 7 key domains.</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-dashed border-rose-200 rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center mb-4 shadow-lg">
              <BarChart3 className="w-9 h-9" />
            </div>
            <h3 className="text-lg sm:text-xl font-header font-black text-zinc-900">No test history yet</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Take the CIGI Differential Aptitude Test to unlock personalized career insights.
            </p>
            <button
              type="button"
              onClick={() => window.spaNavigate('/sample-test')}
              className="mt-5 inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
            >
              <Target className="w-4 h-4" /> Take CDAT Test
            </button>
          </div>
        </div>
      );
    }

    const scores = Object.entries(testProfile.scores || {});
    const topDomain = testProfile.dominantDomain;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h2 className="text-xl sm:text-2xl font-header font-black text-zinc-900 tracking-tight">Your CDAT Profile</h2>
          <p className="text-sm text-zinc-500 mt-1">Detailed breakdown of your strengths across all domains.</p>
        </div>

        {/* Hero card with dominant domain */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white font-black uppercase tracking-widest mb-3">
                <Star className="w-3 h-3" /> Primary Outcome
              </span>
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-100">Your Dominant Domain</p>
              <h3 className="text-3xl sm:text-4xl font-header font-black uppercase tracking-tight mt-1 leading-tight">
                {topDomain}
              </h3>
              <p className="text-sm text-rose-100 mt-3 max-w-md">
                You scored highest in this domain. Career paths aligned with this strength tend to be a great fit.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="14" />
                  {scores.slice(0, 3).map(([key, pct], i) => {
                    const colors = ['#ffffff', '#fecdd3', '#ffe4e6'];
                    const offsets = [0, ...scores.slice(0, 2).map(([, p]) => p)];
                    const cumOffset = offsets.slice(0, i).reduce((a, b) => a + b, 0);
                    const circumference = 2 * Math.PI * 80;
                    return (
                      <circle
                        key={key}
                        cx="100" cy="100" r="80"
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="14"
                        strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                        strokeDashoffset={-((cumOffset / 100) * circumference)}
                        className="transition-all duration-1000"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-100">Top Score</p>
                  <p className="text-4xl font-black">{scores[0]?.[1] || 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All scores */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h4 className="font-header font-black text-sm sm:text-base uppercase tracking-wide text-zinc-900 mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" /> Score Distribution
          </h4>
          <div className="space-y-4">
            {scores.map(([key, pct]) => {
              const isTop = pct === Math.max(...scores.map(s => s[1]));
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-bold flex items-center gap-1.5 ${isTop ? 'text-brand-dark' : 'text-zinc-700'}`}>
                      {isTop && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                      {key}
                    </span>
                    <span className={`font-black tabular-nums ${isTop ? 'text-brand-dark' : 'text-zinc-900'}`}>{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isTop
                          ? 'bg-gradient-to-r from-brand to-brand-accent shadow-[0_0_10px_rgba(0,209,209,0.4)]'
                          : 'bg-gradient-to-r from-zinc-300 to-zinc-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Career suggestions */}
        {topDomain && CAREER_SUGGESTIONS[topDomain] && (
          <div className="bg-gradient-to-br from-brand-light/30 to-brand-accent/10 border border-brand/20 rounded-2xl p-5 sm:p-6">
            <h4 className="font-header font-black text-sm sm:text-base uppercase tracking-wide text-zinc-900 mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand" /> Suggested Career Paths
            </h4>
            <p className="text-xs text-zinc-500 mb-4">Based on your top domain — explore these to find your fit.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {CAREER_SUGGESTIONS[topDomain].map((career, i) => (
                <div key={i} className="group bg-white border border-zinc-200 rounded-xl p-3 sm:p-4 hover:border-brand/40 hover:shadow-md transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/10 to-brand-accent/10 text-brand-dark flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Target className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight">{career}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => window.spaNavigate('/booking')}
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-gradient-to-r from-brand to-brand-accent text-zinc-950 text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-brand/20 hover:scale-[1.01] transition-transform border-none"
            >
              <MessageCircle className="w-4 h-4" /> Discuss with a Counsellor
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => window.spaNavigate('/sample-test')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake diagnostic test
          </button>
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="pt-5 sm:pt-20 pb-24 lg:pb-12 min-h-screen bg-gradient-to-br from-zinc-50 via-white to-brand-light/20 text-zinc-900 font-sans text-left relative overflow-x-hidden">
      {/* Soft background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
        <HeroHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <aside className="lg:col-span-3">
            <SidebarNav />
          </aside>

          <main className="lg:col-span-9 min-w-0">
            {currentSection === 'overview' && <OverviewTab />}
            {currentSection === 'details' && <ProfileDetailsTab />}
            {currentSection === 'booked' && <BookedSessionsTab />}
            {currentSection === 'completed' && <CompletedTab />}
            {currentSection === 'results' && <ResultsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
