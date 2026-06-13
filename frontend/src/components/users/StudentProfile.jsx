import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Phone, Mail, BookOpen, Award, LayoutDashboard, Calendar,
  History, BarChart3, Clock, ExternalLink, Lock, Check, Sun,
  Trophy, Target, Bell, ChevronRight, Save, Download, Star,
  Briefcase, GraduationCap, Users, X as XIcon, Plus, ArrowUpRight,
  Shield, MessageCircle, RefreshCw, CalendarDays, Video, MapPin,
  CheckCircle2, AlertCircle, Hash, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const INITIAL_STATE = {
  name: '', email: '', phone: '', schoolName: '', grade: '',
  guardianName: '', guardianPhone: '', groupCode: ''
};

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard },
  { id: 'details', label: 'My Profile', short: 'Profile', icon: User },
  { id: 'booked', label: 'My Sessions', short: 'Sessions', icon: Calendar },
  { id: 'results', label: 'CDAT Results', short: 'Results', icon: BarChart3 },
];

const CAREER_SUGGESTIONS = {
  'Logical Reasoning': ['Engineering', 'Data Science', 'Computer Science', 'Mathematics'],
  'Verbal Ability': ['Law', 'Journalism', 'Content Writing', 'Mass Communication'],
  'Numerical Ability': ['Finance', 'Accounting', 'Statistics', 'Actuarial Science'],
  'Spatial Reasoning': ['Architecture', 'Graphic Design', 'UI/UX', 'Game Design'],
  'Mechanical Reasoning': ['Mechanical Engineering', 'Robotics', 'Automotive', 'Aerospace'],
  'Abstract Reasoning': ['Research', 'Philosophy', 'Psychology', 'Innovation Management'],
  'Clerical Speed': ['Administration', 'Banking', 'Government Services', 'Operations'],
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
    return { status: 'EXPIRED', label: 'Session Ended', color: 'zinc' };
  } catch {
    return { status: 'AVAILABLE', label: 'Join Now', link: session.meetLink, color: 'emerald' };
  }
};

export default function StudentProfile() {
  const [profile, setProfile] = useState(INITIAL_STATE);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [testProfile, setTestProfile] = useState(null);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSubTab, setSessionSubTab] = useState('upcoming');
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSection = useMemo(() => searchParams.get('tab') || 'overview', [searchParams]);

  const completion = useMemo(() => calculateCompletion(profile), [profile]);
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = profile.name || user?.name || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes, testRes] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getSessions(),
          ApiService.getMyTestResults()
        ]);

        if (profileRes.success && profileRes.data) {
          const data = { ...INITIAL_STATE, ...profileRes.data };
          Object.keys(INITIAL_STATE).forEach(key => {
            if (data[key] === null) data[key] = '';
          });
          setProfile(data);
        }

        if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
          const list = sessionsRes.data;
          setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
          setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
        }

        if (testRes && testRes.success && Array.isArray(testRes.data) && testRes.data.length > 0) {
          // Get the latest test result
          const sorted = [...testRes.data].sort((a, b) => b.date.localeCompare(a.date));
          setTestProfile(sorted[0]);
        } else {
          // Fallback to local storage if no database record exists
          try {
            const stored = localStorage.getItem('behold_test_profile');
            if (stored) setTestProfile(JSON.parse(stored));
          } catch (_) {}
        }
      } catch (err) {
        console.error('Failed to load student dashboard info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !authLoading) {
      setIsLoading(true);
      fetchData();
    }
  }, [user, authLoading]);

  const handleSectionChange = (sectionId) => {
    setSearchParams({ tab: sectionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    try {
      await ApiService.updateProfile(profile);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const session = bookedSessions.find(b => b.id === sessionId);
      if (session && isSessionCompleted(session)) {
        alert('Cannot cancel a session that is already in the past or completed.');
        return;
      }
      await ApiService.cancelAppointment(sessionId);

      // Reload sessions list
      const sessionsRes = await ApiService.getSessions();
      if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
        const list = sessionsRes.data;
        setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
        setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel session');
    }
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
    hours: completedSessions.length,
  };

  // ─── Hero Header ─────────────────────────────────────────────────────

  const HeroHeader = () => {
    const totalProgress = Math.min(100, completion + (testProfile ? 15 : 0) + (stats.completed > 0 ? 10 : 0));
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 bg-brand w-full" />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-black text-xl sm:text-2xl">
                {getInitials(profile.name, user?.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-xs text-zinc-400 font-medium mb-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <Sun className="w-3 h-3" /> {greeting}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                {displayName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs text-zinc-500">
                {profile.grade && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                    <GraduationCap className="w-3 h-3" /> {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 max-w-[180px] truncate">
                    <BookOpen className="w-3 h-3 shrink-0" />
                    <span className="truncate">{profile.schoolName}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start text-xs text-zinc-500">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate max-w-[180px]">{profile.email || user?.email || 'Add email'}</span>
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {profile.phone}
                  </span>
                )}
              </div>

              {/* Profile progress */}
              <div className="mt-3 max-w-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400 font-medium capitalize ">Profile completion</span>
                  <span className="text-xs font-semibold text-zinc-600">{totalProgress}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-700"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-3 shrink-0">
              {[
                { label: 'Upcoming', value: stats.upcoming },
                { label: 'Completed', value: stats.completed },
                { label: 'Hours', value: `${stats.hours}h` },
              ].map((s, i) => (
                <div key={i} className="text-center px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl min-w-[72px]">
                  <p className="text-base font-bold text-zinc-900">{s.value}</p>
                  <p className="text-xs text-zinc-500 font-medium capitalize ">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Sidebar Nav ─────────────────────────────────────────────────────

  const SidebarNav = () => (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col gap-0.5 p-1.5 bg-white border border-zinc-200 rounded-xl shadow-sm sticky top-24">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentSection === tab.id;
          const badge =
            tab.id === 'booked' ? bookedSessions.length :
              tab.id === 'results' && !testProfile ? '!' : null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSectionChange(tab.id)}
              className={`relative flex items-center gap-2.5 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${isActive
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
              <span className="flex-1 text-left">{tab.label}</span>
              {badge !== null && badge !== 0 && (
                <span className={`text-xs font-semibold px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center ${isActive
                  ? 'bg-white/20 text-white'
                  : tab.id === 'results' && !testProfile
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-zinc-100 text-zinc-600'
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-2 mx-1 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700">Need help?</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Data securely synced in Cloud. Contact your coordinator for support.
          </p>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200">
        <div className="grid grid-cols-4 max-w-2xl mx-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentSection === tab.id;
            const badge =
              tab.id === 'booked' ? bookedSessions.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge !== null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-xs font-bold px-1 min-w-[14px] h-3.5 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium capitalize tracking-wide truncate max-w-full">{tab.short}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-zinc-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );

  // ─── Tab: Overview ───────────────────────────────────────────────────

  const OverviewTab = () => {
    const [, setNow] = useState(new Date());
    useEffect(() => {
      const t = setInterval(() => setNow(new Date()), 60000);
      return () => clearInterval(t);
    }, []);

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Overview</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {nextSession ? 'Your next session is coming up.' : 'Ready to start your journey?'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
          >
            <Plus className="w-3.5 h-3.5" /> Book Session
          </button>
        </div>

        {/* Next session card */}
        {nextSession ? (
          <div className="bg-zinc-900 rounded-xl p-5 text-white">
            <p className="text-xs font-semibold capitalize  text-zinc-400 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Next Session
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  {nextSession.mode === 'ONLINE' ? <Video className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-white text-base">{nextSession.advisorName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {nextSession.advisorRole || 'Consultation'} · {nextSession.mode === 'ONLINE' ? 'Online' : 'In-Person'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {nextSession.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {nextSession.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {(() => {
                  const cd = formatCountdown(nextSession.date, nextSession.time);
                  return (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 font-medium">Starts in</p>
                      <p className={`text-xl font-bold ${cd.urgent ? 'text-amber-400' : 'text-white'}`}>{cd.text}</p>
                    </div>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
                  className="min-h-[36px] px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer text-white"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
              <CalendarDays className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">No upcoming sessions</p>
            <p className="text-xs text-zinc-500 mt-1">
              Schedule a session with one of our certified professionals.
            </p>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-4 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
            >
              <Plus className="w-3.5 h-3.5" /> Book a Session
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: 'Upcoming', value: stats.upcoming, sub: 'sessions' },
            { icon: CheckCircle2, label: 'Completed', value: stats.completed, sub: 'lifetime' },
            { icon: BarChart3, label: 'CDAT', value: testProfile ? 'Done' : 'Pending', sub: testProfile ? 'profile ready' : 'not taken' },
            { icon: Clock, label: 'Hours', value: `${stats.hours}h`, sub: 'coached' },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-500 font-medium">{kpi.label}</p>
                <p className="text-xl font-bold text-zinc-900 mt-0.5">{kpi.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5 capitalize ">{kpi.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CDAT card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-zinc-600" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize  ${testProfile ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                }`}>
                {testProfile ? 'Completed' : 'Pending'}
              </span>
            </div>
            <h4 className="font-semibold text-zinc-900 text-sm">Aptitude Test</h4>
            <p className="text-xs text-zinc-500 mt-1">
              {testProfile
                ? `Your dominant domain is ${testProfile.dominantDomain}.`
                : 'Map your natural strengths across 7 key domains. ~15 minutes.'}
            </p>
            <button
              type="button"
              onClick={() => testProfile ? handleSectionChange('results') : navigate('/sample-test')}
              className="mt-4 w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors border-none"
            >
              {testProfile ? 'View Results' : 'Start Test'}
            </button>
          </div>

          {/* Consultation card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-zinc-600" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize  ${bookedSessions.length > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                }`}>
                {bookedSessions.length > 0 ? `${bookedSessions.length} scheduled` : 'None'}
              </span>
            </div>
            <h4 className="font-semibold text-zinc-900 text-sm">Expert Consultation</h4>
            <p className="text-xs text-zinc-500 mt-1">
              {bookedSessions.length > 0
                ? `Next session with ${bookedSessions[0].advisorName} on ${bookedSessions[0].date}.`
                : 'Connect 1-on-1 with certified psychologists and career mentors.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (bookedSessions.length > 0) {
                  handleSectionChange('booked');
                  setSessionSubTab('upcoming');
                } else {
                  navigate('/booking');
                }
              }}
              className="mt-4 w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors border-none"
            >
              {bookedSessions.length > 0 ? 'View Bookings' : 'Book a Session'}
            </button>
          </div>
        </div>

        {/* Recent activity + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" /> Recent Activity
              </h4>
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                View all →
              </button>
            </div>
            {completedSessions.length > 0 ? (
              <div className="space-y-2">
                {completedSessions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{s.advisorName}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{s.advisorRole || 'Consultation'} · {s.date}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Completed sessions will appear here.</p>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-zinc-400" /> Achievements
            </h4>
            <div className="space-y-2.5">
              {[
                { icon: User, label: 'Profile Created', done: !!profile.name },
                { icon: Mail, label: 'Email Added', done: !!profile.email },
                { icon: Phone, label: 'Phone Added', done: !!profile.phone },
                { icon: Calendar, label: 'First Booking', done: stats.total > 0 },
                { icon: BarChart3, label: 'CDAT Completed', done: !!testProfile },
                { icon: Award, label: '5 Sessions Done', done: stats.completed >= 5 },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className={`flex items-center gap-2.5 text-xs ${a.done ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${a.done ? 'bg-zinc-900 text-white' : 'bg-zinc-100'
                      }`}>
                      {a.done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <Icon className="w-3 h-3" />}
                    </div>
                    <span className={`font-medium ${a.done ? '' : 'line-through opacity-60'}`}>{a.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Tab: Profile Details ────────────────────────────────────────────

  const ProfileDetailsTab = () => {
    const sections = [
      {
        title: 'Personal Info',
        icon: User,
        hint: 'Used for booking and contact',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', required: true, icon: User },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@email.com', required: true, icon: Mail, autoComplete: 'email' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. 8086664001', required: true, icon: Phone, autoComplete: 'tel' },
        ],
      },
      {
        title: 'Academic',
        icon: GraduationCap,
        hint: 'Optional but recommended',
        fields: [
          { name: 'schoolName', label: 'School Name', type: 'text', placeholder: 'Name of your school', required: false, icon: BookOpen },
          { name: 'grade', label: 'Grade / Class', type: 'select', options: ['', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'], required: false, icon: Hash },
          { name: 'groupCode', label: 'Group / School Code', type: 'text', placeholder: 'e.g. BEHOLD-CDAT-2026', required: false, icon: Hash },
        ],
      },
      {
        title: 'Guardian',
        icon: Users,
        hint: 'For students under 18',
        fields: [
          { name: 'guardianName', label: 'Parent / Guardian Name', type: 'text', placeholder: 'Name of parent or guardian', required: true, icon: User },
          { name: 'guardianPhone', label: 'Guardian Phone', type: 'tel', placeholder: 'Guardian mobile number', required: false, icon: Phone, autoComplete: 'tel' },
        ],
      },
    ];

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">My Profile</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Keep your details up to date.</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs font-medium">
            <Shield className="w-3.5 h-3.5" /> Saved securely in Cloud Database
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-zinc-700">Profile Strength</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {completion < 50 ? 'Fill in more fields to strengthen your profile.' :
                  completion < 100 ? 'Almost complete — just a few more fields.' :
                    'Your profile is complete!'}
              </p>
            </div>
            <span className="text-xl font-bold text-zinc-900">{completion}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {sections.map((section, sIdx) => {
            const SIcon = section.icon;
            return (
              <div key={sIdx} className="bg-white border border-zinc-200 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-100">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <SIcon className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{section.title}</h3>
                    <p className="text-xs text-zinc-400">{section.hint}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(field => {
                    const FIcon = field.icon;
                    const hasError = !!errors[field.name];
                    const hasValue = !!profile[field.name];
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label htmlFor={`sp-${field.name}`} className="text-xs text-zinc-600 font-medium block flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="relative">
                          {FIcon && (
                            <FIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${hasError ? 'text-rose-400' : hasValue ? 'text-zinc-600' : 'text-zinc-300'
                              }`} />
                          )}
                          {field.type === 'select' ? (
                            <select
                              id={`sp-${field.name}`}
                              name={field.name}
                              value={profile[field.name]}
                              onChange={handleChange}
                              className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none transition-all appearance-none cursor-pointer ${hasError
                                ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                                : 'border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100'
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
                              className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 bg-white border text-sm text-zinc-900 rounded-lg outline-none transition-all ${hasError
                                ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                                : 'border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100'
                                }`}
                            />
                          )}
                          {hasValue && !hasError && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                            </div>
                          )}
                          {hasError && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            </div>
                          )}
                        </div>
                        {hasError ? (
                          <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
                            <AlertCircle className="w-3 h-3" /> {errors[field.name]}
                          </p>
                        ) : (
                          <p className="text-xs text-zinc-400">{field.required ? 'Required' : 'Optional'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="sticky bottom-16 lg:bottom-0 z-30 flex items-center justify-end gap-2 p-3 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <button
              type="button"
              onClick={() => setErrors({})}
              className="min-h-[40px] px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white"
            >
              Discard
            </button>
            <button
              type="submit"
              className="min-h-[40px] inline-flex items-center gap-1.5 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors border-none"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>

        {isSaved && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl shadow-xl" role="status">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">Profile saved successfully!</span>
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: Booked Sessions ────────────────────────────────────────────

  const BookedSessionsTab = () => {
    const filterChips = useMemo(() => [
      { id: 'all', label: 'All', count: bookedSessions.length },
      { id: 'online', label: 'Online', count: bookedSessions.filter(s => s.mode === 'ONLINE').length },
      { id: 'offline', label: 'In-Person', count: bookedSessions.filter(s => s.mode !== 'ONLINE').length },
      { id: 'pending', label: 'Pending', count: bookedSessions.filter(s => s.status === 'PENDING').length },
    ], [bookedSessions]);

    return (
      <div className="space-y-5">
        {/* Sub-tab Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-1.5">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setSessionSubTab('upcoming')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all relative cursor-pointer ${sessionSubTab === 'upcoming'
                ? 'border-zinc-900 text-zinc-900 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              Upcoming Sessions
              {bookedSessions.length > 0 && (
                <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${sessionSubTab === 'upcoming' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                  {bookedSessions.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSessionSubTab('history')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all relative cursor-pointer ${sessionSubTab === 'history'
                ? 'border-zinc-900 text-zinc-900 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              History & Timeline
              {completedSessions.length > 0 && (
                <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${sessionSubTab === 'history' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                  {completedSessions.length}
                </span>
              )}
            </button>
          </div>

          {sessionSubTab === 'upcoming' && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors border-none sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" /> New Booking
            </button>
          )}
        </div>

        {sessionSubTab === 'upcoming' ? (
          <div className="space-y-4">
            {/* Filters */}
            {bookedSessions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
                {filterChips.map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSessionFilter(chip.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[32px] rounded-lg text-xs font-medium transition-all border ${sessionFilter === chip.id
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                      }`}
                  >
                    {chip.label}
                    {chip.count > 0 && (
                      <span className={`text-xs font-semibold px-1.5 min-w-[18px] h-4 rounded-full flex items-center justify-center ${sessionFilter === chip.id ? 'bg-white/20' : 'bg-zinc-100 text-zinc-600'
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
                  const cd = formatCountdown(session.date, session.time);
                  const isConfirmed = session.status === 'CONFIRMED';
                  return (
                    <div
                      key={session.id || idx}
                      className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors text-left"
                    >
                      {/* Status indicator */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                            {session.mode === 'ONLINE' ? <Video className="w-5 h-5 text-zinc-600" /> : <MapPin className="w-5 h-5 text-zinc-600" />}
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold capitalize  ${isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              {session.status}
                            </span>
                            <p className="text-xs text-zinc-400 font-medium mt-1">
                              {session.service === 'counselling' ? 'Psychological' : 'Career'} · {session.mode}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-zinc-400">In</p>
                          <p className={`text-sm font-bold ${cd.urgent ? 'text-amber-600' : 'text-zinc-900'}`}>{cd.text}</p>
                        </div>
                      </div>

                      <p className="font-semibold text-zinc-900 text-base">{session.advisorName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{session.advisorRole || 'Consultation'}</p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-600">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium truncate">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs text-zinc-600">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium truncate">{session.time}</span>
                        </div>
                      </div>

                      {session.mode === 'ONLINE' && !session.meetLink && (
                        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Meet link pending from counsellor.</span>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-wrap gap-2">
                        {session.mode === 'ONLINE' && meetStatus.status === 'AVAILABLE' ? (
                          <button
                            type="button"
                            onClick={() => window.open(meetStatus.link, '_blank')}
                            className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Now
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : session.mode === 'ONLINE' ? (
                          <button
                            type="button"
                            disabled
                            title={meetStatus.status === 'LOCKED' ? 'Link activates 10 min before session' : 'Session has ended'}
                            className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-400 border border-zinc-200 rounded-lg text-xs font-medium cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" /> {meetStatus.label}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium hover:border-zinc-300 transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5" /> View Location
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate('/booking')}
                          className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (window.confirm('Cancel this session?')) handleCancelSession(session.id); }}
                          className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 hover:border-rose-200 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">No sessions found</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {sessionFilter === 'all'
                    ? 'Book a session with one of our experts.'
                    : `No ${sessionFilter} sessions scheduled.`}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="mt-4 inline-flex items-center gap-1.5 min-h-[36px] px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
                >
                  <Plus className="w-3.5 h-3.5" /> Book a Session
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Completed sessions Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Sessions', value: completedSessions.length, icon: CheckCircle2 },
                { label: 'Hours Coached', value: `${completedSessions.length}h`, icon: Clock },
                { label: 'Avg. Rating', value: '4.8', icon: Star, suffix: '/5' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="bg-white border border-zinc-200 rounded-xl p-4 text-left">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4 text-zinc-600" />
                    </div>
                    <p className="text-lg font-bold text-zinc-900">
                      {s.value}{s.suffix && <span className="text-sm text-zinc-400 font-medium">{s.suffix}</span>}
                    </p>
                    <p className="text-xs text-zinc-500 font-semibold capitalize  mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {completedSessions.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-200" />
                <div className="space-y-4">
                  {completedSessions.map((session, sIdx) => (
                    <div key={session.id || sIdx} className="relative pl-12 text-left">
                      <div className="absolute left-0 top-3 w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold capitalize ">
                                {session.status}
                              </span>
                              <span className="text-xs text-zinc-400 font-medium capitalize ">{session.mode}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <Star key={n} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                            <p className="font-semibold text-zinc-900">{session.advisorName}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{session.advisorRole || 'Consultation'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 px-2.5 py-1.5 rounded-lg shrink-0 w-fit">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-medium">{session.date}</span>
                            <span className="text-zinc-300">·</span>
                            <span>{session.time}</span>
                          </div>
                        </div>

                        {session.feedback && (
                          <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                            <p className="text-xs font-semibold text-zinc-500 capitalize  mb-1.5">Counsellor Feedback</p>
                            <p className="text-xs text-zinc-600 italic leading-relaxed">"{session.feedback}"</p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Session #{completedSessions.length - sIdx}</span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
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
              <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">No completed sessions yet</p>
                <p className="text-xs text-zinc-500 mt-1">Finished sessions will appear here with counsellor feedback.</p>
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="mt-4 inline-flex items-center gap-1.5 min-h-[36px] px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
                >
                  <Plus className="w-3.5 h-3.5" /> Book First Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Tab: CDAT Results ───────────────────────────────────────────────

  const ResultsTab = () => {
    if (!testProfile) {
      return (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">CDAT Results</h2>
            <p className="text-sm text-zinc-500 mt-0.5">Discover your dominant strengths across 7 key domains.</p>
          </div>
          <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">No test history yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Take the CIGI Differential Aptitude Test to unlock personalized career insights.
            </p>
            <button
              type="button"
              onClick={() => navigate('/sample-test')}
              className="mt-4 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
            >
              <Target className="w-3.5 h-3.5" /> Take CDAT Test
            </button>
          </div>
        </div>
      );
    }

    const scores = Object.entries(testProfile.scores || {});
    const topDomain = testProfile.dominantDomain;

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Your CDAT Profile</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Detailed breakdown of your strengths across all domains.</p>
        </div>

        {/* Dominant domain card */}
        <div className="bg-zinc-900 rounded-xl p-6 text-white">
          <p className="text-xs font-semibold capitalize  text-zinc-400 mb-3 flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-400" /> Primary Outcome
          </p>
          <p className="text-xs text-zinc-400 font-medium mb-1">Your Dominant Domain</p>
          <h3 className="text-2xl font-bold text-white">{topDomain}</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-md">
            You scored highest in this domain. Career paths aligned with this strength tend to be a great fit.
          </p>
          {scores[0] && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm font-bold">
              Top Score: {scores[0][1]}%
            </div>
          )}
        </div>

        {/* Score distribution */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-400" /> Score Distribution
          </h4>
          <div className="space-y-4">
            {scores.map(([key, pct]) => {
              const isTop = pct === Math.max(...scores.map(s => s[1]));
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium flex items-center gap-1.5 ${isTop ? 'text-zinc-900' : 'text-zinc-600'}`}>
                      {isTop && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                      {key}
                    </span>
                    <span className={`font-semibold tabular-nums ${isTop ? 'text-zinc-900' : 'text-zinc-500'}`}>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${isTop ? 'bg-zinc-900' : 'bg-zinc-300'
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
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-zinc-400" /> Suggested Career Paths
            </h4>
            <p className="text-xs text-zinc-500 mb-4">Based on your top domain.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CAREER_SUGGESTIONS[topDomain].map((career, i) => (
                <div key={i} className="group bg-zinc-50 border border-zinc-200 rounded-lg p-3 hover:border-zinc-300 transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center mb-2">
                    <Target className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                  <p className="text-xs font-medium text-zinc-800 leading-tight">{career}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 min-h-[40px] px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg transition-colors border-none"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Discuss with a Counsellor
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/sample-test')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retake diagnostic test
          </button>
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="pt-5 sm:pt-20 pb-24 lg:pb-12 min-h-screen bg-zinc-50 text-zinc-900 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
        {isLoading && (
          <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-zinc-900 animate-spin mb-4" />
            <p className="text-sm font-semibold text-zinc-900">Loading your profile...</p>
          </div>
        )}

        <HeroHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <aside className="lg:col-span-3">
            <SidebarNav />
          </aside>

          <main className="lg:col-span-9 min-w-0">
            {currentSection === 'overview' && <OverviewTab />}
            {currentSection === 'details' && <ProfileDetailsTab />}
            {currentSection === 'booked' && <BookedSessionsTab />}
            {currentSection === 'results' && <ResultsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
