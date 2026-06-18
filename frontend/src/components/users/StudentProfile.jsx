import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
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
import toast from 'react-hot-toast';
import { formatDateString } from '../../utils/dateFormatter';

const INITIAL_STATE = {
  name: '', email: '', phone: '', schoolName: '', grade: '',
  guardianName: '', guardianPhone: '', groupCode: ''
};

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard },
  { id: 'details', label: 'My Profile', short: 'Profile', icon: User },
  { id: 'booked', label: 'My Sessions', short: 'Sessions', icon: Calendar },
  { id: 'results', label: 'C-DAT Results', short: 'Results', icon: BarChart3 },
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
  const clean = (name || fallback || 'ST').trim();
  if (clean.length === 0) return 'ST';
  if (clean.length === 1) return clean.toUpperCase();
  const first = clean[0];
  const last = clean[clean.length - 1];
  return (first + last).toUpperCase();
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
  if (booking.status === 'COMPLETED' || booking.status === 'EXPIRED') return true;
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
  // Server-truth: used for header display, completion bar, avatar
  const [profile, setProfile] = useState(INITIAL_STATE);
  // Form state: what inputs bind to — NEVER reset by background fetches
  const [formData, setFormData] = useState(INITIAL_STATE);
  // useRef (not useState) so the effect always sees the current value without stale closure
  const formLoadedRef = useRef(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [testProfile, setTestProfile] = useState(null);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSubTab, setSessionSubTab] = useState('upcoming');
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // CIGI Aptitude Test uploads state
  const [cigiFile, setCigiFile] = useState(null);
  const [cigiDate, setCigiDate] = useState('');
  const [cigiTime, setCigiTime] = useState('');
  const [cigiNote, setCigiNote] = useState('');
  const [isCigiUploading, setIsCigiUploading] = useState(false);
  const fileInputRef = useRef(null);

  const currentSection = useMemo(() => searchParams.get('tab') || 'overview', [searchParams]);

  // Completion bar reflects live formData so users see real-time profile strength
  const completion = useMemo(() => calculateCompletion(formData), [formData]);
  const greeting = useMemo(() => getGreeting(), []);
  // displayName from saved profile (header doesn't change until Save is clicked)
  const displayName = profile.name || user?.name || 'Student';

  const generateReceiptPDFDoc = (bookingDetails) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top Banner Accent Bar (Teal brand color #06b6d4)
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 210, 8, 'F');

      // Header Brand Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('BEHOLD.', 20, 25);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text('Premium Career Guidance & Mental Health Platform', 20, 30);

      // Status Badge
      doc.setFillColor(240, 253, 250); // light teal background
      doc.roundedRect(142, 18, 48, 10, 2, 2, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136); // Teal text
      doc.text('CONFIRMED & PAID', 147, 24.5);

      // Divider Line
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.line(20, 36, 190, 36);

      // Client & Billing Info Grid
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42); // zinc-800
      doc.text('CLIENT DETAILS', 20, 46);
      doc.text('RECEIPT METADATA', 120, 46);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91); // zinc-600
      
      // Client info
      doc.text(`Name: ${bookingDetails.clientName}`, 20, 52);
      doc.text(`Email: ${bookingDetails.clientEmail || 'N/A'}`, 20, 58);
      doc.text(`Phone: ${bookingDetails.clientPhone || 'N/A'}`, 20, 64);

      // Receipt Metadata info
      const displayId = bookingDetails.id ? bookingDetails.id.toString().substring(Math.max(0, bookingDetails.id.toString().length - 6)) : 'N/A';
      doc.text(`Receipt ID: REC-${displayId}`, 120, 52);
      doc.text(`Booking ID: SB-${bookingDetails.id || 'N/A'}`, 120, 58);
      doc.text(`Date of Issue: ${formatDateString(new Date())}`, 120, 64);

      // Divider Line
      doc.line(20, 70, 190, 70);

      // Booking Specifics
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('SESSION DETAILS', 20, 80);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      doc.text(`Service Type: ${bookingDetails.service}`, 20, 86);
      doc.text(`Advisor Assigned: ${bookingDetails.advisorName} (${bookingDetails.advisorRole})`, 20, 92);
      doc.text(`Session Schedule: ${formatDateString(bookingDetails.date)} at ${bookingDetails.time}`, 20, 98);
      doc.text(`Session Mode: ${bookingDetails.mode}`, 20, 104);

      // Divider Line
      doc.line(20, 110, 190, 110);

      // Pricing Breakdown Table
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('CHARGES BREAKDOWN', 20, 120);

      // Table Header Background
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.rect(20, 124, 170, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(63, 63, 70); // zinc-700
      doc.text('Description', 24, 129.5);
      doc.text('Amount', 160, 129.5);

      // Table Rows
      let tableY = 138;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(82, 82, 91);

      // Resolve breakdown metrics dynamically
      const detailsBaseFee = bookingDetails.baseFee || 0;
      const detailsGstPercent = bookingDetails.gstPercent || 0;
      const detailsGstAmount = bookingDetails.gstAmount || 0;
      const detailsDiscount = bookingDetails.appliedDiscount || 0;
      const detailsNetTotal = bookingDetails.amount || 0;

      // 1. Base fee
      doc.text(`${bookingDetails.service} Session Booking Fee`, 24, tableY);
      doc.text(`Rs. ${detailsBaseFee.toFixed(2)}`, 160, tableY);
      tableY += 8;

      // 2. GST (if enabled)
      if (detailsGstAmount > 0) {
        doc.text(`GST (${detailsGstPercent}%)`, 24, tableY);
        doc.text(`Rs. ${detailsGstAmount.toFixed(2)}`, 160, tableY);
        tableY += 8;
      }

      // 3. Discount (if applied)
      if (detailsDiscount > 0) {
        doc.setTextColor(22, 163, 74); // green
        doc.text(`Promo Discount Code`, 24, tableY);
        doc.text(`-Rs. ${detailsDiscount.toFixed(2)}`, 160, tableY);
        tableY += 8;
        doc.setTextColor(82, 82, 91); // reset to zinc-600
      }

      // Border line for total
      doc.setDrawColor(228, 228, 231);
      doc.line(20, tableY - 4, 190, tableY - 4);

      // Total Row
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('Net Total Paid', 24, tableY + 2);
      doc.setTextColor(13, 148, 136); // Teal color for total price
      doc.setFontSize(10.5);
      doc.text(`INR ${detailsNetTotal.toFixed(2)}`, 160, tableY + 2);
      
      tableY += 16;

      // Google Meet Session Link if Online
      if (bookingDetails.meetLink) {
        doc.setFillColor(240, 253, 250); // Light teal bg
        doc.roundedRect(20, tableY, 170, 18, 2, 2, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text('Google Meet Session Link (Online Video Call):', 25, tableY + 6);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(6, 182, 212); // blue-link
        doc.text(bookingDetails.meetLink, 25, tableY + 12);
        
        tableY += 28;
      } else {
        tableY += 10;
      }

      // Footer Notes
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text('This is a secure computer-generated booking receipt. No physical signature is required.', 20, tableY);
      doc.text('For rescheduling queries, cancellations, or support, please reply to your coordinator on WhatsApp.', 20, tableY + 5);

      // Save document
      doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF receipt. Please contact platform support.");
    }
  };

  const downloadPDFReceiptForSession = (session) => {
    const toastId = toast.loading('Generating receipt PDF...');
    try {
      let gstEnabled = false;
      let gstPercent = 0;
      try {
        const stored = localStorage.getItem('behold_site_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          gstEnabled = parsed.gstEnabled === true;
          gstPercent = typeof parsed.gstPercent === 'number' ? parsed.gstPercent : 0;
        }
      } catch (e) {}

      const amountPaid = session.amountPaid || 1200;
      const appliedDiscount = session.appliedDiscount || 0;
      const totalBeforeDiscount = amountPaid + appliedDiscount;

      let baseFeeVal = totalBeforeDiscount;
      let gstAmountVal = 0;
      if (gstEnabled && gstPercent > 0) {
        baseFeeVal = Math.round(totalBeforeDiscount / (1 + gstPercent / 100));
        gstAmountVal = totalBeforeDiscount - baseFeeVal;
      }

      const clientName = profile.name || user?.name || 'Student';
      const clientEmail = profile.email || user?.email || '';
      const clientPhone = profile.phone || user?.phone || '';

      const service = session.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
      const mode = session.mode === 'ONLINE' ? 'Video Call' : session.mode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';

      const details = {
        id: session.appointmentId || session.id,
        service,
        mode,
        advisorName: session.advisorName || 'Advisor',
        advisorRole: session.advisorRole || (session.service === 'counselling' ? 'Consultant Psychologist' : 'Career Advisor'),
        date: session.date,
        time: session.time,
        clientName,
        clientEmail,
        clientPhone,
        meetLink: session.meetLink && session.meetLink !== 'LOCKED' ? session.meetLink : null,
        amount: amountPaid,
        baseFee: baseFeeVal,
        gstPercent: gstEnabled ? gstPercent : 0,
        gstAmount: gstAmountVal,
        appliedDiscount: appliedDiscount
      };

      generateReceiptPDFDoc(details);
      toast.success('Receipt downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF receipt', { id: toastId });
    }
  };

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
          // Always update server-truth profile
          setProfile(data);
          // useRef check — always current, no stale closure
          if (!formLoadedRef.current) {
            formLoadedRef.current = true;
            setFormData(data);
          }
        }

        if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
          const list = sessionsRes.data;
          setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
          setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
        }

        if (testRes && testRes.success && Array.isArray(testRes.data) && testRes.data.length > 0) {
          const sorted = [...testRes.data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setTestProfile(sorted[0]);
        } else {
          try {
            const stored = localStorage.getItem('behold_test_profile');
            if (stored) setTestProfile(JSON.parse(stored));
          } catch (_) { }
        }
      } catch (err) {
        console.error('Failed to load student dashboard info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const hasToken = !!localStorage.getItem('behold_token');
    const isStudent = user && user.role?.toUpperCase() === 'USER';

    if (isStudent && hasToken && !authLoading) {
      setIsLoading(true);
      fetchData();
    } else if (!authLoading) {
      // Not logged in or not a student — stop the spinner
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleSectionChange = (sectionId) => {
    setSearchParams({ tab: sectionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form input handler — only touches formData, never profile
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Discard — revert form to last saved server state
  const handleDiscard = () => {
    setFormData({ ...profile });
    setErrors({});
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Required';
    else if (formData.name.trim().length < 3) err.name = 'Min 3 characters';
    if (!formData.email.trim()) err.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = 'Invalid email';
    if (!formData.phone.trim()) err.phone = 'Required';
    else if (!/^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/.test(formData.phone.trim())) err.phone = 'Invalid phone';
    if (!formData.guardianName.trim()) err.guardianName = 'Required';
    if (formData.guardianPhone.trim()) {
      if (!/^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/.test(formData.guardianPhone.trim())) {
        err.guardianPhone = 'Invalid phone';
      }
    }
    return err;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setIsSaving(true);
    try {
      const res = await ApiService.updateProfile(formData);
      // Sync saved form back to server-truth profile
      setProfile({ ...formData });

      // Update global user authentication details (like name)
      if (res.success && res.data && user) {
        updateUser({
          ...user,
          name: formData.name,
          phone: formData.phone
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      const errMsg = error.message || 'Failed to update profile';
      import('react-hot-toast').then(mod => mod.toast.error(errMsg));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = window.prompt('Please provide a reason for cancelling this session:');
    if (reason === null) return;

    try {
      const session = bookedSessions.find(b => b.id === sessionId);
      if (session && isSessionCompleted(session)) {
        alert('Cannot cancel a session that is already in the past or completed.');
        return;
      }
      await ApiService.cancelAppointment(sessionId, reason);

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

  const filterChips = useMemo(() => [
    { id: 'all', label: 'All', count: bookedSessions.length },
    { id: 'online', label: 'Online', count: bookedSessions.filter(s => s.mode === 'ONLINE').length },
    { id: 'offline', label: 'In-Person', count: bookedSessions.filter(s => s.mode !== 'ONLINE').length },
    { id: 'pending', label: 'Pending', count: bookedSessions.filter(s => s.status === 'PENDING').length },
  ], [bookedSessions]);

  const [, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

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
      <div className="card-luxury border-none rounded-2xl shadow-sm overflow-hidden">
        {/* Top accent strip */}
        <div className="h-1 bg-brand w-full" />

        <div className="p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              {profile.profilePic || user?.profilePic || user?.image ? (
                <img
                  src={profile.profilePic || user?.profilePic || user?.image}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xl sm:text-2xl">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-2xl bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                <Plus className="w-5 h-5 text-white" />
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
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
      <nav className="hidden lg:flex flex-col gap-0.5 p-1.5 card-luxury border-none rounded-xl shadow-sm sticky top-24">
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
                      <Calendar className="w-3.5 h-3.5" /> {formatDateString(nextSession.date)}
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
            { icon: BarChart3, label: 'C-DAT', value: testProfile ? 'Done' : 'Pending', sub: testProfile ? 'profile ready' : 'not taken' },
            { icon: Clock, label: 'Hours', value: `${stats.hours}h`, sub: 'coached' },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className="card-luxury border-none rounded-xl p-4 card-luxury-hover">
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
          {/* C-DAT card */}
          <div className="card-luxury border-none rounded-xl p-5 card-luxury-hover">
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
          <div className="card-luxury border-none rounded-xl p-5 card-luxury-hover">
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
                ? `Next session with ${bookedSessions[0].advisorName} on ${formatDateString(bookedSessions[0].date)}.`
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
          <div className="lg:col-span-2 card-luxury border-none rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" /> Recent Activity
              </h4>
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {completedSessions.length > 0 ? (
              <div className="space-y-2">
                {completedSessions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg card-luxury border-none flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{s.advisorName}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{s.advisorRole || 'Consultation'} · {formatDateString(s.date)}</p>
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
          <div className="card-luxury border-none rounded-xl p-5">
            <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-zinc-400" /> Achievements
            </h4>
            <div className="space-y-2.5">
              {[
                { icon: User, label: 'Profile Created', done: !!profile.name },
                { icon: Mail, label: 'Email Added', done: !!profile.email },
                { icon: Phone, label: 'Phone Added', done: !!profile.phone },
                { icon: Calendar, label: 'First Booking', done: stats.total > 0 },
                { icon: BarChart3, label: 'C-DAT Completed', done: !!testProfile },
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
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@email.com', required: true, icon: Mail, autoComplete: 'email', disabled: true },
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
        <div className="card-luxury border-none rounded-xl p-4">
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
              <div key={sIdx} className="card-luxury border-none rounded-xl p-5">
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
                    const hasValue = !!formData[field.name];
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
                              value={formData[field.name]}
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
                              value={formData[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              autoComplete={field.autoComplete}
                              disabled={field.disabled}
                              className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 text-sm rounded-lg outline-none transition-all ${field.disabled
                                  ? 'bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed'
                                  : hasError
                                    ? 'bg-white border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-zinc-900'
                                    : 'bg-white border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 text-zinc-900'
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

          <div className="sticky bottom-16 lg:bottom-0 z-30 flex items-center justify-end gap-2 p-3 card-luxury border-none rounded-xl shadow-sm">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSaving}
              className="min-h-[40px] px-4 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-500 text-white text-xs font-semibold rounded-lg transition-colors border-none"
            >
              {isSaving ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : (
                <><Save className="w-3.5 h-3.5" />Save Changes</>
              )}
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
                      className="card-luxury border-none rounded-xl p-5 card-luxury-hover text-left"
                    >
                      {/* Status indicator */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                            {session.mode === 'ONLINE' ? <Video className="w-5 h-5 text-zinc-600" /> : <MapPin className="w-5 h-5 text-zinc-600" />}
                          </div>
                          <div>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold capitalize  ${
                              session.status === 'EXPIRED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isConfirmed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                session.status === 'EXPIRED'
                                  ? 'bg-rose-500'
                                  : isConfirmed
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-amber-500'
                              }`} />
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
                          <span className="font-medium truncate">{formatDateString(session.date)}</span>
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
                        {session.status === 'EXPIRED' ? (
                          <div className="w-full text-center text-xs font-bold text-rose-650 bg-rose-50 border border-rose-100 py-3 rounded-lg flex items-center justify-center gap-1.5 px-4">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>This session expired because it wasn't joined within 1 hour.</span>
                          </div>
                        ) : (
                          <>
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
                                className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-medium card-luxury-hover"
                              >
                                <MapPin className="w-3.5 h-3.5" /> View Location
                              </button>
                            )}
                            {(session.paymentStatus === 'PAID' || session.amountPaid > 0) && (
                              <button
                                type="button"
                                onClick={() => downloadPDFReceiptForSession(session)}
                                className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors bg-white cursor-pointer"
                                title="Download Receipt PDF"
                              >
                                <Download className="w-3.5 h-3.5 text-zinc-500" /> Receipt
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
                              onClick={() => handleCancelSession(session.id)}
                              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 card-luxury border-none hover:border-rose-200 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
                            >
                              <XIcon className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </>
                        )}
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
                  <div key={i} className="card-luxury border-none rounded-xl p-4 text-left">
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
                      <div className="absolute left-0 top-3 w-8 h-8 rounded-lg card-luxury border-none flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="card-luxury border-none rounded-xl p-4 card-luxury-hover">
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
                            <span className="font-medium">{formatDateString(session.date)}</span>
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
                          <div className="flex items-center gap-3">
                            {(session.paymentStatus === 'PAID' || session.amountPaid > 0) && (
                              <button
                                type="button"
                                onClick={() => downloadPDFReceiptForSession(session)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                                title="Download Receipt PDF"
                              >
                                <Download className="w-3.5 h-3.5" /> Receipt
                              </button>
                            )}
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

  // ─── Tab: C-DAT Results ───────────────────────────────────────────────

  const handleCigiUpload = async (e) => {
    e.preventDefault();
    if (!cigiFile) {
      toast.error('Please select a result file (Image or PDF)');
      return;
    }
    
    // File extension check
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExt = cigiFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Only JPG, JPEG, PNG, and PDF files are allowed.');
      return;
    }

    setIsCigiUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', cigiFile);
      formDataToSend.append('testDate', cigiDate);
      formDataToSend.append('testTime', cigiTime);
      formDataToSend.append('note', cigiNote);

      const res = await ApiService.uploadCigiResult(formDataToSend);
      if (res.success) {
        toast.success('CIGI result uploaded successfully');
        setProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
        // Reset form
        setCigiFile(null);
        setCigiDate('');
        setCigiTime('');
        setCigiNote('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload CIGI result');
    } finally {
      setIsCigiUploading(false);
    }
  };

  const handleCigiDelete = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this CIGI result?')) return;
    try {
      const res = await ApiService.deleteCigiResult(resultId);
      if (res.success) {
        toast.success('CIGI result deleted successfully');
        setProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete CIGI result');
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profilePic', file);

      const res = await ApiService.updateProfilePic(formDataToSend);
      if (res.success) {
        toast.success('Profile picture updated!', { id: toastId });
        setProfile(prev => ({ 
          ...prev, 
          profilePic: res.data.profilePic, 
          profilePicPublicId: res.data.profilePicPublicId 
        }));
        
        // Update user context so top header avatar updates too
        if (user) {
          updateUser({
            ...user,
            profilePic: res.data.profilePic
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile picture', { id: toastId });
    }
  };

  const ResultsTab = () => {
    const cigiResultsList = profile.cigiResults || [];
    const scores = testProfile ? Object.entries(testProfile.scores || {}) : [];
    const topDomain = testProfile?.dominantDomain;

    return (
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold text-zinc-950">Aptitude Test Results</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Access your sample diagnostic test results and upload external CIGI Differential Aptitude Test (C-DAT) results.
          </p>
        </div>

        {/* Grid layout for two sections: Sample Test and CIGI Test */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Column 1: Sample Test Results */}
          <div className="xl:col-span-7 space-y-6">
            <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-700 animate-pulse" /> Sample Aptitude Test (C-DAT)
              </h3>
              
              {!testProfile ? (
                <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-700">No Sample Test History</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Take the Behold sample diagnostic test to map your strengths.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/sample-test')}
                    className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
                  >
                    <Target className="w-3.5 h-3.5" /> Start Sample Test
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Dominant Domain Card */}
                  <div className="bg-zinc-900 rounded-xl p-5 text-white">
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Dominant Domain</p>
                    <h4 className="text-xl font-bold text-white">{topDomain}</h4>
                    <p className="text-xs text-zinc-400 mt-1.5">
                      Your primary strength outcome. Click below to view the full detailed breakdown.
                    </p>
                    <div className="mt-3.5 flex justify-between items-center">
                      <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-md">
                        Score: {scores.find(([k]) => k === topDomain)?.[1] || 100}%
                      </span>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Strength Domains</p>
                    {scores.slice(0, 4).map(([key, pct]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-zinc-700">{key}</span>
                          <span className="text-zinc-900 font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/sample-test')}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 font-medium rounded-lg text-xs transition-colors bg-white cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake Sample Test
                  </button>
                </div>
              )}
            </div>

            {/* Career Suggestions */}
            {testProfile && topDomain && CAREER_SUGGESTIONS[topDomain] && (
              <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" /> Career Alignment
                </h3>
                <p className="text-xs text-zinc-400 mb-3">Paths suited for {topDomain} strength.</p>
                <div className="grid grid-cols-2 gap-2">
                  {CAREER_SUGGESTIONS[topDomain].map((career, i) => (
                    <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-zinc-200 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-zinc-600" />
                      </div>
                      <span className="text-xs font-medium text-zinc-800">{career}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: CIGI Aptitude Test Results & Uploads */}
          <div className="xl:col-span-5 space-y-6">
            {/* Upload form */}
            <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-semibold text-zinc-900 mb-1.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-750" /> CIGI Aptitude Test (C-DAT)
              </h3>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                Registered and took the test on CIGI's site? Upload your scorecard/result (Image or PDF) below.
              </p>

              <form onSubmit={handleCigiUpload} className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">
                    Upload Result File <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setCigiFile(e.target.files[0])}
                    accept="image/*,application/pdf"
                    required
                    className="w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer p-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Allowed formats: JPG, JPEG, PNG, PDF (Max 5MB)</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">Date Taken</label>
                    <input
                      type="date"
                      value={cigiDate}
                      onChange={(e) => setCigiDate(e.target.value)}
                      className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-700 block mb-1">Time Taken</label>
                    <input
                      type="time"
                      value={cigiTime}
                      onChange={(e) => setCigiTime(e.target.value)}
                      className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Remarks / Note</label>
                  <textarea
                    placeholder="E.g. Got high scores in mathematical reasoning..."
                    value={cigiNote}
                    onChange={(e) => setCigiNote(e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCigiUploading}
                  className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-500 text-white rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer"
                >
                  {isCigiUploading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <>Upload Result</>
                  )}
                </button>
              </form>
            </div>

            {/* Results list */}
            <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Uploaded CIGI Results ({cigiResultsList.length})</h3>

              {cigiResultsList.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                  <p className="text-xs">No result files uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {cigiResultsList.map((result) => (
                    <div key={result.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-left">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${result.fileType === 'pdf' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                            {result.fileType}
                          </span>
                          {(result.testDate || result.testTime) && (
                            <span className="text-[10px] text-zinc-500">
                              {formatDateString(result.testDate)} {result.testTime}
                            </span>
                          )}
                        </div>
                        {result.note && (
                          <p className="text-xs text-zinc-600 mt-1 truncate" title={result.note}>
                            {result.note}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          Uploaded {formatDateString(result.uploadedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={result.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"
                          title="View document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCigiDelete(result.id)}
                          className="p-1.5 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Delete result"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="pt-5 sm:pt-20 pb-24 lg:pb-12 min-h-screen bg-zinc-50 text-zinc-900 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
        {(isLoading || authLoading) ? (
          <div className="animate-pulse space-y-5 sm:space-y-6">
            {/* Skeleton Hero Header */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-zinc-200">
              <div className="w-20 h-20 rounded-2xl bg-zinc-200 shrink-0"></div>
              <div className="flex-1 w-full space-y-3">
                <div className="h-6 bg-zinc-200 rounded-md w-1/3"></div>
                <div className="h-4 bg-zinc-200 rounded-md w-1/4"></div>
                <div className="flex gap-4 mt-4">
                  <div className="h-4 bg-zinc-200 rounded-md w-24"></div>
                  <div className="h-4 bg-zinc-200 rounded-md w-24"></div>
                </div>
              </div>
            </div>

            {/* Skeleton Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <aside className="lg:col-span-3">
                <div className="card-luxury border-none rounded-xl p-3 space-y-2">
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                </div>
              </aside>
              <main className="lg:col-span-9 space-y-5">
                <div className="h-8 bg-zinc-200 rounded-md w-1/4 mb-4"></div>
                <div className="h-32 bg-zinc-200 rounded-xl w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-24 bg-zinc-200 rounded-xl w-full"></div>
                  <div className="h-24 bg-zinc-200 rounded-xl w-full"></div>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <>
            {HeroHeader()}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <aside className="lg:col-span-3">
                {SidebarNav()}
              </aside>

              <main className="lg:col-span-9 min-w-0">
                {currentSection === 'overview' && OverviewTab()}
                {currentSection === 'details' && ProfileDetailsTab()}
                {currentSection === 'booked' && BookedSessionsTab()}
                {currentSection === 'results' && ResultsTab()}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
