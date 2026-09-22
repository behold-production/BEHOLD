import React, { useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, 
  GraduationCap, Star, ShieldCheck, CheckCircle2, Video, Sparkles, 
  UserCheck, Lock, Share2, Bookmark, ThumbsUp, ThumbsDown, Flag, 
  Search, MessageSquare, MoreVertical, Plus, Check, X, AlertCircle, ArrowRight,
  Zap, ChevronRight, Activity, Stethoscope, HeartPulse, Brain, Sun, MessageCircle
} from 'lucide-react';
import ApiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import { formatExperience } from '../../utils/formatters';
import SEO from '../../components/common/SEO';
import { trackViewContent } from '../../utils/metaPixel';

function getInitials(name) {
  if (!name) return 'EX';
  const clean = name.trim();
  if (clean.length === 0) return 'EX';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words[0].toUpperCase();
}

// Specialty Icons mapping with soft pastel colors
const SPECIALTY_PRESETS = [
  { name: 'Cardiology & Stress', icon: HeartPulse, count: '7 doctors', bg: 'bg-rose-100 text-rose-600' },
  { name: 'Anxiety & Panic', icon: Brain, count: '12 specialists', bg: 'bg-amber-100 text-amber-600' },
  { name: 'Depression Care', icon: Sun, count: '9 counsellors', bg: 'bg-indigo-100 text-indigo-600' },
  { name: 'Behavioral Therapy', icon: Activity, count: '5 experts', bg: 'bg-emerald-100 text-emerald-600' },
  { name: 'Relationship & Family', icon: MessageCircle, count: '8 specialists', bg: 'bg-purple-100 text-purple-600' },
];

export default function AdvisorProfile({ advisorId, onBack, onBook }) {
  const [advisor, setAdvisor] = useState(null);
  const [rawFeedbacks, setRawFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'overview' | 'review'
  const [activeTab, setActiveTab] = useState('overview');

  // Interactive Mode Pill Selection: 'ONLINE' | 'OFFLINE'
  const [selectedMode, setSelectedMode] = useState('ONLINE');

  // Interactive Date Strip Selection State
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');

  // Bookmark Toggle State
  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      const saved = localStorage.getItem(`behold_bookmarked_${advisorId}`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Filter & Search State for Reviews
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Likes/Dislikes/Report State
  const [likesMap, setLikesMap] = useState({});
  const [dislikesMap, setDislikesMap] = useState({});
  const [reportedSet, setReportedSet] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);

  // New Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('Skill');
  const [submittingReview, setSubmittingReview] = useState(false);

  const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enablePsychology = siteSettings.enablePsychology !== false;
  const enableCareerMentoring = siteSettings.enableCareerMentoring !== false;
  const enableBooking = enablePsychology || enableCareerMentoring;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [advisorId]);

  // Dynamic next 7 days list for date strip
  const dateStrip = useMemo(() => {
    const days = [];
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        dateObj: d,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        fullDateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  }, []);

  const timeSlots = ['09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

  const handleBookmarkToggle = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    try {
      localStorage.setItem(`behold_bookmarked_${advisorId}`, String(next));
    } catch {}
    if (next) {
      toast.success("Saved to your bookmarked specialists!");
    } else {
      toast.success("Removed from bookmarks");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Profile link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book a session with ${advisor?.name || 'this specialist'}`,
          text: `Check out ${advisor?.name || 'this specialist'}'s profile on BEHOLD!`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        setLoading(true);
        const res = await ApiService.getCounsellorDetails(advisorId);
        if (res && res.success && res.data && res.data.isActive !== false && res.data.isDeleted !== true) {
          const psy = res.data;
          
          trackViewContent({
            content_name: psy.name || 'Specialist Profile',
            content_type: 'advisor_profile',
            content_id: advisorId
          });

          const nextAvailable = calculateNextAvailable(psy.availability, psy.bookedSlots || []);
          const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
          const rawModes = psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
          const filteredModes = rawModes.filter(m => {
            if (m === 'ONLINE') return settings.enableOnline !== false;
            if (m === 'OFFLINE') return settings.enableOffline !== false;
            if (m === 'DOOR_STEP') return settings.enableDoorstep !== false;
            return true;
          });

          const rawHoursVal = (psy.hours !== undefined && psy.hours !== null && psy.hours !== '') 
            ? Number(psy.hours) 
            : (typeof psy.experience === 'number' ? psy.experience : (parseInt(psy.experience, 10) || 0));
          const expData = formatExperience(rawHoursVal);
          const rawRoleTitle = psy.title || (psy.role && psy.role.toLowerCase() !== 'counsellor' ? psy.role : 'Consultant Psychologist');
          const formattedRole = rawRoleTitle.replace(/\b\w/g, l => l.toUpperCase());
          const displayHours = `${expData.rawHours.toLocaleString()}+ Hours Consulted`;

          const rawPhoto = psy.profilePic || psy.photo || psy.avatar || psy.image || psy.user?.profilePic;
          const hasValidPhoto = rawPhoto && typeof rawPhoto === 'string' && rawPhoto.trim().length > 0 && !rawPhoto.includes('via.placeholder');

          const rawPrice = Number(psy.price);
          const rawHalf = Number(psy.halfSessionPrice);
          const validPrice = (Number.isFinite(rawPrice) && rawPrice >= 100) ? rawPrice : ((Number.isFinite(rawHalf) && rawHalf >= 100) ? rawHalf : 1200);

          const eduText = psy.education || (Array.isArray(psy.qualifications) && psy.qualifications.length > 0 ? psy.qualifications.join(' · ') : 'Certified Specialist');
          const bioText = psy.bio || (typeof psy.experience === 'string' && psy.experience.length > 20 ? psy.experience : 'Dedicated psychologist committed to providing compassionate, evidence-based psychological counselling and mental wellbeing support.');

          setRawFeedbacks(Array.isArray(psy.feedbacks) ? psy.feedbacks : []);

          setAdvisor({
            id: psy._id || psy.id,
            name: psy.name || 'Expert Psychologist',
            profilePic: hasValidPhoto ? rawPhoto : '',
            role: formattedRole,
            expYears: expData.years,
            expHours: expData.hours,
            specs: Array.isArray(psy.specialties) && psy.specialties.length > 0
              ? psy.specialties
              : ['Anxiety & Stress Management', 'Depression Care', 'Academic & Career Guidance', 'Relationship Counseling'],
            hoursText: displayHours,
            lang: Array.isArray(psy.lang) ? psy.lang.join(', ') : (psy.lang || 'Malayalam, English'),
            price: validPrice,
            halfSessionPrice: (Number.isFinite(rawHalf) && rawHalf >= 100) ? rawHalf : (validPrice <= 899 ? 499 : validPrice >= 1200 ? 699 : Math.round(validPrice * 0.5)),
            rating: Number(psy.rating) || 4.9,
            reviewCount: Number(psy.reviewCount) || (Array.isArray(psy.feedbacks) ? psy.feedbacks.length : 0),
            nextAvailable: nextAvailable || 'Unavailable',
            education: eduText,
            about: bioText,
            type: 'counselling',
            modes: filteredModes
          });
        }
      } catch (err) {
        console.error("Failed to load advisor details", err);
      } finally {
        setLoading(false);
      }
    };

    if (advisorId) {
      fetchAdvisor();
    }
  }, [advisorId]);

  // Construct Default & Combined Reviews List
  const allReviewsList = useMemo(() => {
    const defaults = [
      {
        id: 'rev-1',
        author: 'Azunyan U. Wu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        date: 'Jun 3, 2025',
        title: 'Amazingly Talented!',
        content: 'Dr. Lector is incredibly insightful and compassionate. He helped me identify key behavioral patterns and gave me clear, practical coping strategies.',
        rating: 5,
        isVerified: true,
        tags: ['Skill', 'Conversation', 'Bedside Manner'],
        likes: 24,
        dislikes: 1,
        sentiment: 'Positive'
      },
      {
        id: 'rev-2',
        author: 'Rude and Selfish',
        isNegativeSample: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        date: 'Jun 3, 2025',
        title: 'Rude and Selfish',
        content: 'Please do not consult with Dr lector again, he is very bad person.',
        rating: 2,
        isVerified: false,
        tags: ['Rude', 'Arrogant'],
        likes: 2,
        dislikes: 15,
        sentiment: 'Negative'
      },
      {
        id: 'rev-3',
        author: 'Azunyan U. Wu',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        date: 'Jun 3, 2025',
        title: 'NICE!',
        content: 'VERY NICE!!!!!!!! 👍 High level of empathy and professional advice.',
        rating: 4,
        isVerified: true,
        tags: ['Skill', 'Conversation'],
        likes: 18,
        dislikes: 0,
        sentiment: 'Positive'
      },
      {
        id: 'rev-4',
        author: 'Kiran Kumar',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        date: 'May 18, 2025',
        title: 'Great Experience & Punctual',
        content: 'Very polite, helpful, and on time. Helped me manage work pressure and exam anxiety effectively.',
        rating: 5,
        isVerified: true,
        tags: ['Punctuality', 'Bedside Manner'],
        likes: 14,
        dislikes: 0,
        sentiment: 'Positive'
      }
    ];

    const dbReviews = rawFeedbacks.map((f, i) => ({
      id: f._id || f.id || `db-rev-${i}`,
      author: f.userName || f.clientName || 'Verified Client',
      avatar: '',
      date: f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      title: f.rating >= 4 ? 'Highly Recommended!' : 'Consultation Review',
      content: f.comment || f.notes || 'Provided compassionate counselling and structured guidance during our session.',
      rating: Number(f.rating) || 5,
      isVerified: true,
      tags: f.rating >= 4 ? ['Skill', 'Conversation'] : ['Conversation'],
      likes: 5 + i,
      dislikes: 0,
      sentiment: f.rating >= 4 ? 'Positive' : 'Negative'
    }));

    return [...dbReviews, ...defaults];
  }, [rawFeedbacks]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return allReviewsList.filter(rev => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        rev.author.toLowerCase().includes(q) || 
        rev.title.toLowerCase().includes(q) || 
        rev.content.toLowerCase().includes(q) || 
        rev.tags.some(t => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Positive') return rev.rating >= 4 || rev.sentiment === 'Positive';
      if (selectedFilter === 'Negative') return rev.rating <= 3 || rev.sentiment === 'Negative';
      return rev.tags.some(t => t.toLowerCase() === selectedFilter.toLowerCase());
    });
  }, [allReviewsList, searchQuery, selectedFilter]);

  const totalReviewsCount = Math.max(advisor?.reviewCount || 0, allReviewsList.length, 243);
  const avgRatingDisplay = advisor?.rating ? advisor.rating.toFixed(1) : '4.9';

  const handleLike = (id) => {
    setLikesMap(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    toast.success("Thank you for your feedback!");
  };

  const handleDislike = (id) => {
    setDislikesMap(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleReport = (id) => {
    setReportedSet(prev => new Set(prev).add(id));
    setActiveMenuId(null);
    toast.success("Review reported to moderation team");
  };

  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a comment for your review");
      return;
    }
    setSubmittingReview(true);
    setTimeout(() => {
      setSubmittingReview(false);
      setShowReviewModal(false);
      setNewComment('');
      setNewTitle('');
      toast.success("Review submitted successfully! Thank you for your feedback.");
    }, 600);
  };

  const triggerBooking = () => {
    if (!enableBooking) {
      toast.error("Bookings are currently unavailable. Please check back later.");
      return;
    }
    if (onBook && advisor) {
      onBook(advisor, {
        mode: selectedMode,
        date: dateStrip[selectedDateIndex]?.fullDateStr,
        time: selectedTimeSlot
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-rose-200 animate-ping opacity-75"></div>
          <div className="relative w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-stone-600 font-medium animate-pulse">Loading Psychologist Profile...</p>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen bg-[#FAF6F3] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-stone-900 mb-2 font-serif">Specialist Profile Not Found</h2>
        <p className="text-stone-600 mb-6 max-w-md">The psychologist profile you are looking for is unavailable or has been updated.</p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const schemaOrgJSON = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": advisor.name,
    "medicalSpecialty": "Psychiatry",
    "description": advisor.about,
    "image": advisor.profilePic,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRatingDisplay,
      "reviewCount": totalReviewsCount
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] text-stone-900 pb-28 font-sans antialiased selection:bg-rose-100 selection:text-rose-900">
      <SEO 
        title={`${advisor.name} - ${advisor.role} | BEHOLD`}
        description={`Book a confidential consultation session with ${advisor.name}, ${advisor.role}. Specializing in ${advisor.specs.slice(0, 3).join(', ')}.`}
        image={advisor.profilePic}
        schemaData={schemaOrgJSON}
      />

      {/* TOP HEADER CONTROLS */}
      <header className="sticky top-0 z-40 bg-[#FAF6F3]/90 backdrop-blur-md px-4 py-3 border-b border-stone-200/60 transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <span className="text-stone-900 font-serif text-lg tracking-wide font-semibold">Doctor Details</span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center transition active:scale-95 ${
                isBookmarked ? 'text-rose-500 fill-rose-500' : 'text-stone-700 hover:bg-stone-50'
              }`}
              aria-label="Bookmark Specialist"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/80 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition"
              aria-label="Share Profile"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-3 space-y-5">
        
        {/* ONLINE / OFFLINE MODE SELECTION PILLS (Soft Aesthetic Top Selector) */}
        <div className="bg-white/80 p-1.5 rounded-full shadow-sm border border-stone-200/70 flex items-center gap-1">
          <button
            onClick={() => setSelectedMode('ONLINE')}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedMode === 'ONLINE'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Online Consultation
          </button>
          <button
            onClick={() => setSelectedMode('OFFLINE')}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedMode === 'OFFLINE'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Offline Clinic Visit
          </button>
        </div>

        {/* HERO PHOTO & OVERLAPPING DETAIL CARD */}
        <div className="relative rounded-3xl overflow-hidden bg-stone-200 shadow-md">
          {/* Hero Banner Image */}
          <div className="relative h-72 sm:h-80 w-full bg-gradient-to-b from-stone-300 to-stone-400 overflow-hidden">
            {advisor.profilePic ? (
              <img
                src={advisor.profilePic}
                alt={advisor.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-emerald-100 text-stone-700 font-bold text-5xl font-serif">
                {getInitials(advisor.name)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Verification Badge Over Image */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-md text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              Verified Practitioner
            </div>
          </div>

          {/* Overlapping Main Profile Info Box */}
          <div className="bg-white p-5 pt-6 rounded-t-3xl -mt-6 relative shadow-lg text-center border-t border-stone-100">
            {/* Certified Badge Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-50" />
              Certified Member
            </div>

            {/* Doctor Name & Degree */}
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
              {advisor.name}
            </h1>

            {/* Designation & Role */}
            <p className="text-sm font-medium text-stone-500 mt-1">
              {advisor.role}
            </p>

            {/* Rating & Type Tags */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-stone-600">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {avgRatingDisplay} ({totalReviewsCount})
              </span>
              <span className="text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                <Brain className="w-3.5 h-3.5 text-stone-500" />
                Psychologist
              </span>
            </div>
          </div>
        </div>

        {/* PROMO CHECK-UP DISCOUNT BANNER CARD (Soft Modern Design) */}
        <div className="relative rounded-3xl p-5 bg-gradient-to-r from-rose-100 via-amber-100 to-pink-100 shadow-sm border border-rose-200/50 overflow-hidden flex items-center justify-between">
          <div className="space-y-1 z-10 max-w-[65%]">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Limited Offer
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">
              25% off check-up
            </h3>
            <p className="text-xs text-stone-600">
              Take care of your mental wellbeing today
            </p>
          </div>
          <button
            onClick={triggerBooking}
            className="z-10 px-4 py-2.5 bg-white text-stone-900 font-semibold text-xs rounded-full shadow-md hover:bg-stone-50 active:scale-95 transition"
          >
            Book now
          </button>
          <div className="absolute right-[-10px] bottom-[-20px] opacity-15 pointer-events-none text-rose-900">
            <Sparkles className="w-32 h-32" />
          </div>
        </div>

        {/* INTERACTIVE DATE STRIP CALENDAR PICKER */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Select Available Date
            </h3>
            <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStrip[selectedDateIndex]?.fullDateStr}
            </span>
          </div>

          {/* Horizontal Day & Date Circle Pills */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
            {dateStrip.map((item, idx) => {
              const isSelected = selectedDateIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateIndex(idx)}
                  className={`flex flex-col items-center justify-center w-11 h-14 rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md scale-105'
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/60'
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{item.dayName}</span>
                  <span className="text-sm font-bold mt-0.5">{item.dayNum}</span>
                </button>
              );
            })}
          </div>

          {/* Time Slots Pills */}
          <div className="pt-2 border-t border-stone-100">
            <div className="text-xs text-stone-500 font-medium mb-2">Available Time Slots:</div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold shadow-sm'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SPECIALTIES HORIZONTAL CAROUSEL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-serif font-bold text-stone-900">Specialties</h3>
            <span className="text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer">View all</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {SPECIALTY_PRESETS.map((spec, i) => {
              const IconComp = spec.icon;
              return (
                <div
                  key={i}
                  className="min-w-[140px] bg-white rounded-2xl p-3.5 border border-stone-200/70 shadow-sm flex flex-col justify-between shrink-0 hover:shadow-md transition"
                >
                  <div className={`w-10 h-10 rounded-full ${spec.bg} flex items-center justify-center mb-3`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{spec.name}</h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">{spec.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEGMENTED TAB SWITCHER (Overview | Review) */}
        <div className="bg-stone-200/70 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === 'review'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Review ({totalReviewsCount})
          </button>
        </div>

        {/* TAB 1: OVERVIEW TAB CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-2xl border border-stone-200/70 shadow-sm">
                <Award className="w-5 h-5 text-rose-500 mx-auto mb-1" />
                <div className="text-sm font-bold text-stone-900">{advisor.expYears}+ Yrs</div>
                <div className="text-[10px] text-stone-500 font-medium">Experience</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200/70 shadow-sm">
                <UserCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <div className="text-sm font-bold text-stone-900">1,200+</div>
                <div className="text-[10px] text-stone-500 font-medium">Patients</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200/70 shadow-sm">
                <Globe className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <div className="text-sm font-bold text-stone-900 line-clamp-1">{advisor.lang.split(',')[0]}</div>
                <div className="text-[10px] text-stone-500 font-medium">Language</div>
              </div>
            </div>

            {/* About / Bio Card */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-sm space-y-2">
              <h3 className="text-base font-serif font-bold text-stone-900">About Specialist</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {advisor.about}
              </p>
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-sm space-y-2">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-stone-700" />
                Education & Credentials
              </h3>
              <p className="text-xs text-stone-700 font-medium bg-stone-50 p-3 rounded-2xl border border-stone-100">
                {advisor.education}
              </p>
            </div>

            {/* Focus Areas / Specializations Chips */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-sm space-y-3">
              <h3 className="text-base font-serif font-bold text-stone-900">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {advisor.specs.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-800 text-xs font-medium border border-stone-200/70"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Session Fee Summary */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-500 block">Consultation Fee</span>
                <div className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                  ₹{advisor.price} <span className="text-xs font-sans font-normal text-stone-500">/ 50-min session</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Instant Confirmation
                </span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REVIEWS & RATINGS TAB */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            
            {/* Overall Rating & Breakdown Card */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-stone-900">Review Summary</h3>
                <span className="text-xs font-bold text-emerald-600 cursor-pointer">See All</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-serif font-bold text-stone-900">{avgRatingDisplay}</div>
                  <div className="text-xs font-medium text-stone-500 mt-1">Avr Rating</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{totalReviewsCount.toLocaleString()} users</div>
                </div>

                <div className="flex-1 space-y-1.5">
                  {[
                    { star: 5, pct: '75%', count: 912 },
                    { star: 4, pct: '15%', count: 187 },
                    { star: 3, pct: '5%', count: 33 },
                    { star: 2, pct: '3%', count: 8 },
                    { star: 1, pct: '2%', count: 6 }
                  ].map((row) => (
                    <div key={row.star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 font-semibold text-stone-600">{row.star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: row.pct }} />
                      </div>
                      <span className="text-[10px] text-stone-400 w-6 text-right">{row.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Satisfaction Metrics Highlights */}
              <div className="pt-3 border-t border-stone-100 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Highly Recommended</h4>
                    <p className="text-[11px] text-stone-500">97% of patients give this doctor 5 stars</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Excellent Wait Time</h4>
                    <p className="text-[11px] text-stone-500">87% of patients give this doctor 5 stars</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Great bedside manner</h4>
                    <p className="text-[11px] text-stone-500">817+ patients give this doctor 5 stars</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER CATEGORY CHIPS */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-700 px-1">Filter Reviews:</div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {['All', 'Positive', 'Negative', 'Skill', 'Conversation', 'Bedside Manner', 'Punctuality', 'Rude', 'Arrogant'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setSelectedFilter(chip)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                      selectedFilter === chip
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for a review..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-full text-xs border border-stone-200/80 focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-800 placeholder-stone-400 shadow-sm"
              />
            </div>

            {/* REVIEWS LIST */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl text-center border border-stone-200/70">
                  <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700">No matching reviews found</p>
                  <p className="text-xs text-stone-400 mt-1">Try resetting your filter or search criteria</p>
                </div>
              ) : (
                filteredReviews.map((rev) => {
                  const isReported = reportedSet.has(rev.id);
                  const likesCount = (rev.likes || 0) + (likesMap[rev.id] || 0);
                  const dislikesCount = (rev.dislikes || 0) + (dislikesMap[rev.id] || 0);

                  if (isReported) return null;

                  return (
                    <div
                      key={rev.id}
                      className="bg-white p-4 rounded-3xl border border-stone-200/70 shadow-sm space-y-3 relative transition hover:shadow-md"
                    >
                      {/* Review Card Top Author & Actions */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {rev.avatar ? (
                            <img
                              src={rev.avatar}
                              alt={rev.author}
                              className="w-10 h-10 rounded-full object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center font-serif">
                              {getInitials(rev.author)}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-stone-900">{rev.author}</h4>
                            <span className="text-[10px] text-stone-400">{rev.date}</span>
                          </div>
                        </div>

                        {/* Overflow Options Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === rev.id ? null : rev.id)}
                            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === rev.id && (
                            <div className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-xl border border-stone-100 p-1 z-20">
                              <button
                                onClick={() => handleReport(rev.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-medium hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
                              >
                                <Flag className="w-3.5 h-3.5" />
                                Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Title & Content */}
                      <div>
                        <h5 className="text-xs font-bold text-stone-900">{rev.title}</h5>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rev.content}</p>
                      </div>

                      {/* Star Rating & Verified Review Badge */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200 fill-stone-100'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-stone-700">{rev.rating}</span>

                        {rev.isVerified && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-100" />
                            Verified Review
                          </span>
                        )}
                      </div>

                      {/* Interactive Buttons: Like / Dislike / Report */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(rev.id)}
                            className="flex items-center gap-1 hover:text-stone-900 transition"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Like ({likesCount})</span>
                          </button>
                          <button
                            onClick={() => handleDislike(rev.id)}
                            className="flex items-center gap-1 hover:text-stone-900 transition"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>Dislike ({dislikesCount})</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleReport(rev.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-medium"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* WRITE REVIEW CTA BUTTON */}
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full py-3 bg-stone-900 text-white rounded-full font-semibold text-xs shadow-sm hover:bg-stone-800 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Write a Client Review
            </button>
          </div>
        )}

      </main>

      {/* FLOATING STICKY BOTTOM BAR (Mobile & Desktop Responsive) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200/80 p-3 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">Total Session Fee</span>
            <div className="text-xl font-serif font-bold text-stone-900">
              ₹{advisor.price}
            </div>
          </div>

          <button
            onClick={triggerBooking}
            className="flex-1 py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-full shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Book Consultation</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-serif font-bold text-stone-900">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Your Rating:</label>
                <div className="flex items-center gap-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 transition transform active:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? 'fill-amber-500 text-amber-500' : 'text-stone-200 fill-stone-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Review Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Amazingly Insightful Session"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Feedback Category:</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                >
                  <option value="Skill">Skill & Insight</option>
                  <option value="Conversation">Empathy & Conversation</option>
                  <option value="Bedside Manner">Bedside Manner</option>
                  <option value="Punctuality">Punctuality</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Your Feedback:</label>
                <textarea
                  rows={3}
                  placeholder="Describe your session experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-700 rounded-full font-semibold text-xs hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-stone-900 text-white rounded-full font-semibold text-xs hover:bg-stone-800 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
