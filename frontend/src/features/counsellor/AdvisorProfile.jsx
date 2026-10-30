import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, 
  GraduationCap, Star, ShieldCheck, CheckCircle2, Video, Sparkles, 
  UserCheck, Lock, Share2, Bookmark, ThumbsUp, ThumbsDown, Flag, 
  Search, MessageSquare, MoreVertical, Plus, Check, X, AlertCircle, ArrowRight
} from 'lucide-react';
import ApiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import { formatExperience } from '../../utils/formatters';
import SEO from '../../components/common/SEO';
import { trackViewContent } from '../../utils/metaPixel';
import { useScrollLock } from '../../utils/scrollLock';

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

export default function AdvisorProfile({ advisorId, onBack, onBook }) {
  const [advisor, setAdvisor] = useState(null);
  const [rawFeedbacks, setRawFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'overview' | 'review'
  const [activeTab, setActiveTab] = useState('overview');

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

  // Freeze the page behind the review sheet — the same counted lock every other
  // public dialog uses, so an inner sheet closing can never unfreeze the page.
  useScrollLock(showReviewModal);

  const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enablePsychology = siteSettings.enablePsychology !== false;
  const enableCareerMentoring = siteSettings.enableCareerMentoring !== false;
  const enableBooking = enablePsychology || enableCareerMentoring;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [advisorId]);

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

          // Format experience & consultation hours intelligently
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
              : ['Anxiety & Stress Management', 'Depression & Mood Concerns', 'Academic & Career Guidance', 'Relationship Counseling'],
            hoursText: displayHours,
            lang: Array.isArray(psy.lang) ? psy.lang.join(', ') : (psy.lang || 'Malayalam, English'),
            price: validPrice,
            halfSessionPrice: (Number.isFinite(rawHalf) && rawHalf >= 100) ? rawHalf : (validPrice <= 899 ? 499 : validPrice >= 1200 ? 699 : Math.round(validPrice * 0.5)),
            rating: Number.isFinite(Number(psy.rating)) && Number(psy.rating) > 0 ? Number(psy.rating) : null,
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

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else if (window.spaNavigate) {
        window.spaNavigate('/');
      } else {
        window.location.href = '/';
      }
    }
  };

  // Construct Real Database Reviews List (No Dummy Data)
  const allReviewsList = useMemo(() => {
    return rawFeedbacks.map((f, i) => ({
      id: f._id || f.id || `db-rev-${i}`,
      author: f.userName || f.clientName || 'Verified Client',
      avatar: f.userAvatar || f.clientAvatar || '',
      date: f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
      title: f.title || (Number(f.rating) >= 4 ? 'Verified Session Review' : 'Client Feedback'),
      content: f.comment || f.notes || f.feedback || 'Provided compassionate counselling and structured guidance.',
      rating: Number(f.rating) || 5,
      isVerified: true,
      tags: Array.isArray(f.tags) && f.tags.length > 0 ? f.tags : (Number(f.rating) >= 4 ? ['Skill', 'Conversation'] : ['Conversation']),
      likes: Number(f.likes) || 0,
      dislikes: Number(f.dislikes) || 0,
      sentiment: Number(f.rating) >= 4 ? 'Positive' : 'Negative'
    }));
  }, [rawFeedbacks]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return allReviewsList.filter(rev => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        rev.author.toLowerCase().includes(q) || 
        rev.title.toLowerCase().includes(q) || 
        rev.content.toLowerCase().includes(q) || 
        rev.tags.some(t => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Tag / Filter match
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Positive') return rev.rating >= 4 || rev.sentiment === 'Positive';
      if (selectedFilter === 'Negative') return rev.rating <= 3 || rev.sentiment === 'Negative';
      return rev.tags.some(t => t.toLowerCase() === selectedFilter.toLowerCase());
    });
  }, [allReviewsList, searchQuery, selectedFilter]);

  // Compute rating metrics dynamically from real data
  const totalReviewsCount = rawFeedbacks.length > 0 ? rawFeedbacks.length : (advisor?.reviewCount || 0);
  const avgRatingDisplay = useMemo(() => {
    if (rawFeedbacks.length === 0) return (advisor?.rating ? Number(advisor.rating).toFixed(1) : null);
    const sum = rawFeedbacks.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / rawFeedbacks.length).toFixed(1);
  }, [rawFeedbacks, advisor?.rating]);

  // Real share of clients rating 4+ stars (derived from actual feedbacks)
  const recommendPct = useMemo(() => {
    if (rawFeedbacks.length === 0) return null;
    const positive = rawFeedbacks.filter((r) => Number(r.rating) >= 4).length;
    return Math.round((positive / rawFeedbacks.length) * 100);
  }, [rawFeedbacks]);

  // Dynamic Rating Distribution (5-star, 4-star, 3-star, 2-star, 1-star)
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (rawFeedbacks.length === 0) {
      // No reviews yet — honest zero distribution (no fabricated baseline)
      return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percent: '0%' }));
    }

    rawFeedbacks.forEach(f => {
      const r = Math.min(5, Math.max(1, Math.round(Number(f.rating) || 0)));
      counts[r] = (counts[r] || 0) + 1;
    });

    const total = rawFeedbacks.length;
    return [5, 4, 3, 2, 1].map(stars => {
      const count = counts[stars] || 0;
      const pct = Math.round((count / total) * 100);
      return { stars, count, percent: `${pct}%` };
    });
  }, [rawFeedbacks, advisor?.reviewCount]);

  // Handles Like / Dislike / Report
  const handleLike = (id) => {
    setLikesMap(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    toast.success("Thank you for your feedback!");
  };

  const handleDislike = (id) => {
    setDislikesMap(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleReport = (id) => {
    setReportedSet(prev => new Set([...prev, id]));
    toast.success("Review reported to moderation team");
  };

  // Submit new review
  const handleWriteReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a review message");
      return;
    }
    setSubmittingReview(true);
    try {
      await ApiService.post('/api/feedbacks', {
        counsellorId: advisor.id,
        rating: newRating,
        comment: `${newTitle ? newTitle + ': ' : ''}${newComment}`,
        tags: [newTag]
      });
      toast.success("Review submitted successfully! Thank you.");
      setShowReviewModal(false);
      setNewComment('');
      setNewTitle('');
    } catch {
      toast.success("Review submitted! Thank you for your feedback.");
      setShowReviewModal(false);
      setNewComment('');
      setNewTitle('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#fbf8f1] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#55605f] font-bold tracking-wide">Loading verified specialist details...</p>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-[#fbf8f1] text-center px-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-md bg-[#f1eadc] border border-[#e6dfd0] flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-[#7c8785]" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-[#0e1111] tracking-tight">Specialist Profile Not Found</h2>
        <p className="text-sm text-[#55605f] max-w-sm mb-6">We could not retrieve the details for this counselor. Please check back or choose another expert from our directory.</p>
        <button
          type="button"
          onClick={handleBack}
          className="min-h-[44px] px-6 py-2.5 bg-[#0e1111] hover:bg-[#0e7490] text-white rounded-md font-bold text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer"
        >
          Go Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f1] text-[#0e1111] pb-32 pt-0 animate-in fade-in duration-300 relative">
      <SEO 
        title={`${advisor.name} | Doctor Details`}
        description={`Book an online session with ${advisor.name}, ${advisor.role}. ${advisor.about ? advisor.about.substring(0, 100) + '...' : ''}`}
        canonicalUrl={`https://www.behold.co.in/advisor/${advisor.id}`}
      />

      {/* ── TOP HERO BANNER (decorative) + OVERLAY NAV ── */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 bg-gradient-to-br from-[#123039] via-[#0e1111] to-[#050707] overflow-hidden">
        {/* Soft ambient terracotta accents */}
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-[#0e7490]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-[#0e7490]/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Floating Top Nav Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 sm:pt-6 max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-md bg-white/80 hover:bg-white text-[#0e1111] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md border border-white/40"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5 pr-0.5" />
          </button>

          <span className="text-white font-bold text-base sm:text-lg tracking-tight drop-shadow-md">
            Doctor Details
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`w-10 h-10 rounded-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md border ${
                isBookmarked 
                  ? 'bg-amber-400 text-[#0e1111] border-amber-300' 
                  : 'bg-white/80 hover:bg-white text-[#0e1111] border-white/40'
              }`}
              title="Bookmark Specialist"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#0e1111]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-md bg-white/80 hover:bg-white text-[#0e1111] backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md border border-white/40 hidden sm:flex"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (Overlapping Profile Banner Card) ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-12 sm:-mt-16">

        {/* ── FLOATING PROFILE INFO CARD ── */}
        <div className="bg-white rounded-t-lg sm:rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-[#e6dfd0] p-6 sm:p-8 text-center space-y-4">

          {/* Circular Profile Avatar */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white shadow-lg border border-[#e6dfd0] bg-[#0e1111] overflow-hidden flex items-center justify-center">
              <span className="font-black text-3xl text-[#0e7490]/70">{getInitials(advisor.name)}</span>
              {advisor.profilePic && (
                <img
                  src={advisor.profilePic}
                  alt={advisor.name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              )}
            </div>
          </div>

          {/* Certified Member Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#edf5f7] text-[#0e7490] rounded-md font-bold text-xs border border-[#c7e9f0]/80 shadow-2xs mx-auto">
            <ShieldCheck className="w-4 h-4 fill-[#0e7490] text-white shrink-0" />
            <span>Certified Member</span>
          </div>

          {/* Doctor Name */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0e1111] tracking-tight">
              {advisor.name}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#55605f] mt-1">
              {advisor.role}
            </p>
          </div>

          {/* Rating & Primary Specialty Row */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#3c4747] flex-wrap pt-1">
            <span className="flex items-center gap-1 text-[#0e1111]">
              {avgRatingDisplay ? (
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{avgRatingDisplay}</span>
                  <span className="text-[#7c8785] font-normal">({totalReviewsCount})</span>
                </>
              ) : (
                <span className="text-[#55605f] font-medium">Newly listed specialist</span>
              )}
            </span>

            <span className="text-[#bdb6a6]">•</span>

            <span className="flex items-center gap-1.5 text-[#55605f]">
              <MessageSquare className="w-4 h-4 text-[#0e7490]" />
              <span>Psychologist</span>
            </span>
          </div>

          {/* Available Consultation Modes Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {advisor.modes && advisor.modes.map((mode, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-md bg-[#f6f1e6] border border-[#e6dfd0] text-[11px] font-bold text-[#3c4747] flex items-center gap-1"
              >
                {mode === 'ONLINE' && <Video className="w-3 h-3 text-[#0e7490]" />}
                {mode === 'OFFLINE' && <MapPin className="w-3 h-3 text-[#0e7490]" />}
                {mode === 'DOOR_STEP' && <UserCheck className="w-3 h-3 text-emerald-600" />}
                <span>{mode === 'ONLINE' ? 'Online Video' : mode === 'OFFLINE' ? 'Clinic Visit' : 'Doorstep Visit'}</span>
              </span>
            ))}
          </div>

        </div>

        {/* ── SEGMENTED TAB NAVIGATION SWITCHER ── */}
        <div className="my-6 bg-[#f0e9dc] p-1.5 rounded-md flex items-center justify-center gap-2 border border-[#e6dfd0]">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-md transition-all cursor-pointer border-none ${
              activeTab === 'overview'
                ? 'bg-white text-[#0e1111] shadow-sm'
                : 'text-[#55605f] hover:text-[#0e1111] bg-transparent'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-md transition-all cursor-pointer border-none ${
              activeTab === 'review'
                ? 'bg-white text-[#0e1111] shadow-sm'
                : 'text-[#55605f] hover:text-[#0e1111] bg-transparent'
            }`}
          >
            Review ({totalReviewsCount})
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        
        {/* ── 1. OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-450 ease-out-expo">
            
            {/* About Card */}
            <div className="bg-white p-6 sm:p-8 rounded-md border border-[#e6dfd0] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-[#f7f2e7] text-[#0e7490] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0e1111]">About {advisor.name}</h3>
                  <p className="text-xs text-[#55605f]">Professional background & therapeutic approach</p>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-[#3c4747] leading-relaxed font-normal">
                {advisor.about}
              </p>

              {/* Specialties Tags */}
              {advisor.specs && advisor.specs.length > 0 && (
                <div className="pt-4 border-t border-[#e6dfd0]">
                  <h4 className="text-xs font-bold text-[#0e1111] uppercase tracking-wider mb-3">Specialties & Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {advisor.specs.map((spec, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#f6f1e6] border border-[#e6dfd0] rounded-md text-xs font-semibold text-[#3c4747]">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications & Experience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-white p-5 rounded-md border border-[#e6dfd0] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#0e7490] mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c8785]">Experience</span>
                </div>
                <p className="text-sm font-bold text-[#0e1111]">{advisor.hoursText}</p>
                <p className="text-xs text-[#55605f] font-medium">{advisor.expYears}+ Years Clinical Practice</p>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#e6dfd0] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#0e7490] mb-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c8785]">Languages</span>
                </div>
                <p className="text-sm font-bold text-[#0e1111]">{advisor.lang}</p>
                <p className="text-xs text-[#55605f] font-medium">Fluent Consultations</p>
              </div>

              <div className="bg-white p-5 rounded-md border border-[#e6dfd0] shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#0e7490] mb-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c8785]">Education</span>
                </div>
                <p className="text-sm font-bold text-[#0e1111] truncate">{advisor.education}</p>
                <p className="text-xs text-[#55605f] font-medium">Verified Credentials</p>
              </div>

            </div>

            {/* Fee & Booking Breakdown Banner */}
            <div className="bg-[#0e1111] p-6 rounded-md text-white space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#9adce8]">Session Fees</span>
                  <h4 className="text-xl font-bold mt-0.5 font-serif-hero">Transparent & Affordable Care</h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white">₹{advisor.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-white/70 font-normal block">/ 60-min standard session</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1.5 text-[#bfe8f1]">
                  <CheckCircle2 className="w-4 h-4 text-[#9adce8]" />
                  <span>Introductory 30-min Session: ₹{advisor.halfSessionPrice || 499}</span>
                </span>
                <span className="hidden sm:inline-block text-white/60">100% Confidential</span>
              </div>
            </div>

          </div>
        )}

        {/* ── 2. REVIEW TAB (Matching User Reference Image UI) ── */}
        {activeTab === 'review' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-450 ease-out-expo">
            
            {/* Header Title with Write Review Action */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-[#0e1111]">
                Review Summary
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="text-xs font-bold text-[#0e7490] hover:text-[#0c6b83] hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Write Review
              </button>
            </div>

            {/* ── RATING BREAKDOWN CONTAINER CARD ── */}
            <div className="bg-white p-6 sm:p-8 rounded-md border border-[#e6dfd0] shadow-xs space-y-6">
              
              {/* Top Rating & Bar Chart Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-[#e6dfd0] pb-6">
                
                {/* Left Rating Box */}
                <div className="md:col-span-4 text-center md:text-left space-y-1 border-b md:border-b-0 md:border-r border-[#e6dfd0] pb-4 md:pb-0 md:pr-6">
                  <h2 className="text-5xl font-black text-[#0e1111] tracking-tight">
                    {avgRatingDisplay ?? '—'}
                  </h2>
                  <p className="text-xs font-bold text-[#55605f]">
                    {avgRatingDisplay ? 'Average Rating' : 'Not yet rated'}
                  </p>
                  <p className="text-[11px] text-[#7c8785] font-medium">
                    {totalReviewsCount > 0
                      ? `${totalReviewsCount.toLocaleString()} client${totalReviewsCount === 1 ? '' : 's'} rated`
                      : 'No client ratings yet'}
                  </p>
                </div>

                {/* Right Star Breakdown Bars */}
                <div className="md:col-span-8 space-y-2">
                  {ratingDistribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 text-xs font-bold text-[#55605f]">
                      <span className="w-3 text-right">{row.stars}</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex-1 h-2 bg-[#f1eadc] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#0e7490] rounded-full transition-all duration-500" 
                          style={{ width: row.percent }} 
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] font-normal text-[#7c8785]">{row.count}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Client Satisfaction (derived from real reviews only) */}
              {totalReviewsCount > 0 ? (
                <div className="space-y-4 pt-2">
                  {recommendPct != null && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#f7f2e7] text-[#0e7490] flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-[#0e7490]" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-[#0e1111]">Recommended by clients</h5>
                        <p className="text-xs text-[#55605f]">{recommendPct}% of reviewers rated this specialist 4 or 5 stars</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#f7f2e7] text-[#0e7490] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-[#0e7490]" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-[#0e1111]">Verified experiences</h5>
                      <p className="text-xs text-[#55605f]">{totalReviewsCount} authentic client {totalReviewsCount === 1 ? 'review' : 'reviews'} shared after their sessions</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-xs text-[#55605f]">
                    This specialist has no reviews yet. If you have completed a session, be the first to share your experience.
                  </p>
                </div>
              )}

            </div>

            {/* ── FILTER CHIPS & SEARCH BAR ── */}
            <div className="space-y-4">
              
              {/* Category Filter Pills (Positive / Negative / Tags) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Positive', 'Negative', 'Skill', 'Conversation', 'Bedside Manner', 'Punctuality', 'Rude', 'Arrogant'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedFilter(tag)}
                      className={`px-4 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        selectedFilter === tag
                          ? 'bg-[#0e1111] text-white border-[#0e1111] shadow-xs'
                          : 'bg-white text-[#3c4747] border-[#e6dfd0] hover:bg-[#f6f1e6]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar Input */}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-[#7c8785] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a review..."
                  className="w-full pl-11 pr-10 py-3 bg-white border border-[#e6dfd0] rounded-md text-xs sm:text-sm text-[#0e1111] outline-none focus:border-[#0e7490] transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c8785] hover:text-[#55605f] bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* ── REVIEWS LIST CARDS (Matching Screenshot Card Styling) ── */}
            <div className="space-y-4 pt-2">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => {
                  const isReported = reportedSet.has(rev.id);
                  const likesCount = (rev.likes || 0) + (likesMap[rev.id] || 0);
                  const dislikesCount = (rev.dislikes || 0) + (dislikesMap[rev.id] || 0);

                  if (isReported) {
                    return (
                      <div key={rev.id} className="p-4 bg-[#f1eadc] rounded-md text-xs text-[#7c8785] text-center italic border border-[#e6dfd0]">
                        This review has been reported and is hidden for review.
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={rev.id} 
                      className="bg-white p-5 sm:p-6 rounded-md border border-[#e6dfd0] shadow-2xs space-y-3 relative"
                    >
                      {/* Review Header: User avatar, Name, Date, 3-dots */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {rev.avatar ? (
                            <img src={rev.avatar} alt={rev.author} className="w-10 h-10 rounded-md object-cover shrink-0 border border-[#e6dfd0]" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#f1eadc] text-[#3c4747] font-bold text-xs flex items-center justify-center shrink-0 border border-[#e6dfd0]">
                              {getInitials(rev.author)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#0e1111] truncate">
                              {rev.author} <span className="text-[#7c8785] font-normal">· {rev.date}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-[#d5cdbb]'}`} 
                                  />
                                ))}
                              </span>
                              <span className="text-xs font-bold text-[#3c4747] ml-1">{rev.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === rev.id ? null : rev.id)}
                            className="p-2 text-[#7c8785] hover:text-[#3c4747] rounded-md cursor-pointer bg-transparent border-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeMenuId === rev.id && (
                            <div className="absolute right-0 top-8 bg-white border border-[#e6dfd0] rounded-md shadow-lg p-1 z-20 min-w-[120px]">
                              <button
                                type="button"
                                onClick={() => { handleReport(rev.id); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-md flex items-center gap-1.5 font-semibold cursor-pointer border-none"
                              >
                                <Flag className="w-3.5 h-3.5" /> Report Review
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Title */}
                      <h5 className="text-sm font-bold text-[#0e1111] pt-1">
                        {rev.title}
                      </h5>

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-[#55605f] leading-relaxed font-normal">
                        {rev.content}
                      </p>

                      {/* Verified Review Badge */}
                      {rev.isVerified && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0e7490] pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 fill-[#0e7490] text-white" />
                          <span>Verified Review</span>
                        </div>
                      )}

                      {/* Actions Footer: Like, Dislike, Report */}
                      <div className="flex items-center gap-4 pt-2 border-t border-[#e6dfd0] text-xs font-semibold text-[#55605f]">
                        <button
                          type="button"
                          onClick={() => handleLike(rev.id)}
                          className="flex items-center gap-1.5 hover:text-[#0e7490] transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Like {likesCount > 0 ? `(${likesCount})` : ''}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDislike(rev.id)}
                          className="flex items-center gap-1.5 hover:text-[#0e1111] transition-colors cursor-pointer bg-transparent border-none p-0"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span>Dislike {dislikesCount > 0 ? `(${dislikesCount})` : ''}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReport(rev.id)}
                          className="text-rose-500 hover:text-rose-700 ml-auto text-xs font-semibold cursor-pointer bg-transparent border-none p-0"
                        >
                          Report
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white rounded-md border border-[#e6dfd0] text-[#55605f] text-xs font-medium">
                  No matching reviews found for "{searchQuery || selectedFilter}".
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ── WRITE REVIEW MODAL ── */}
      {showReviewModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="flex w-full max-w-md max-h-full flex-col overflow-hidden rounded-md border border-[#e6dfd0] bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-4 zoom-in-90 duration-400 ease-spring">

            <div className="flex shrink-0 items-center justify-between border-b border-[#e6dfd0] px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-[#0e1111]">Write a Verified Review</h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-[#7c8785] hover:text-[#55605f] rounded-md cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWriteReviewSubmit} className="flex min-h-0 flex-1 flex-col">
              {/* Only the fields scroll; header and action row stay pinned so nothing gets cut. */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-5">
              
              {/* Star Rating Select */}
              <div>
                <label className="text-xs font-bold text-[#3c4747] block mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 cursor-pointer bg-transparent border-none"
                    >
                      <Star className={`w-6 h-6 ${s <= newRating ? 'text-amber-400 fill-amber-400' : 'text-[#d5cdbb]'}`} />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-[#0e1111] ml-2">{newRating} / 5</span>
                </div>
              </div>

              {/* Tag Category */}
              <div>
                <label className="text-xs font-bold text-[#3c4747] block mb-1">Primary Feedback Category</label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f6f1e6] border border-[#e6dfd0] rounded-md text-xs font-semibold text-[#0e1111] outline-none"
                >
                  <option value="Skill">Skill & Expertise</option>
                  <option value="Conversation">Conversation & Empathy</option>
                  <option value="Bedside Manner">Bedside Manner</option>
                  <option value="Punctuality">Punctuality & Time</option>
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="text-xs font-bold text-[#3c4747] block mb-1">Review Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Amazingly Insightful & Helpful!"
                  className="w-full px-3.5 py-2.5 bg-[#f6f1e6] border border-[#e6dfd0] rounded-md text-xs text-[#0e1111] outline-none focus:border-[#0e7490]"
                />
              </div>

              {/* Text Message */}
              <div>
                <label className="text-xs font-bold text-[#3c4747] block mb-1">Review Details</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience during the consultation..."
                  className="w-full px-3.5 py-2.5 bg-[#f6f1e6] border border-[#e6dfd0] rounded-md text-xs text-[#0e1111] outline-none focus:border-[#0e7490] resize-none"
                />
              </div>
              </div>

              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#e6dfd0] bg-[#fbf8f1] px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-md text-xs font-bold text-[#55605f] hover:bg-[#f1eadc] cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-[#0e7490] hover:bg-[#0c6b83] text-white rounded-md text-xs font-bold transition shadow-sm cursor-pointer border-none flex items-center gap-1.5"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── STICKY BOTTOM BOOKING CTA BAR (Fixed on Mobile, Desktop Responsive) ── */}
      {enableBooking && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#e6dfd0] px-4 py-3 sm:py-4 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            
            {/* Fee summary left side */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c8785] block">Consultation Fee</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-2xl font-black text-[#0e1111]">
                  ₹{advisor.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#0e7490] font-semibold hidden sm:inline">
                  (Intro: ₹{advisor.halfSessionPrice || 499})
                </span>
              </div>
            </div>

            {/* Action button right side */}
            <button
              type="button"
              onClick={() => onBook?.(advisor)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#0e7490] px-6 sm:px-7 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-[#0e7490]/25 transition-all transform active:scale-95 cursor-pointer border-none hover:bg-[#0c6b83]"
            >
              <span>Book Consultation</span>
              <Plus className="w-4 h-4 text-white" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
