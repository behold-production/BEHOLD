import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  Home,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  X
} from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import SEO from '../../components/common/SEO';

const getInitial = (name = '') => {
  const cleanName = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

const fallbackPsychologists = [
  {
    id: 'athira-v',
    name: 'Athira V',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Counselling Psychology',
    rating: '5.0',
    reviews: 28,
    years: 5,
    mode: 'Online & Clinic',
    specialties: ['Career', 'Adjustment & Emotional difficulties', 'Self-Esteem & Confidence'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Experienced Consultant Psychologist specializing in career direction, emotional difficulties, and student guidance with compassionate therapeutic frameworks.',
    modes: ['ONLINE', 'OFFLINE']
  },
  {
    id: 'arya-k',
    name: 'Arya K',
    designation: 'Consultant Psychologist',
    credential: 'M.Phil Clinical Psychology',
    rating: '5.0',
    reviews: 34,
    years: 6,
    mode: 'Online & Doorstep',
    specialties: ['Parent and Child Care', 'Anxiety issues', 'depression', 'Adjustment & Emotional difficulties'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1594824813576-9043328e930f?auto=format&fit=crop&w=600&q=80',
    bio: 'Dedicated Consultant Psychologist focusing on parent and child counseling, depression management, and evidence-based anxiety interventions.',
    modes: ['ONLINE', 'DOOR_STEP']
  },
  {
    id: 'arushi-s',
    name: 'ARUSHI S',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Clinical Psychology',
    rating: '5.0',
    reviews: 26,
    years: 5,
    mode: 'Online & Clinic',
    specialties: ['Anxiety', 'Relationship & Family Challenges', 'Career', 'Anxiety & Stress'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Specializing in relational health, relationship conflict resolution, somatic anxiety alleviation, and personal goal alignment.',
    modes: ['ONLINE', 'OFFLINE']
  },
  {
    id: 'fathima-n',
    name: 'Fathima N.',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Applied Psychology',
    rating: '5.0',
    reviews: 22,
    years: 7,
    mode: 'Online Video',
    specialties: ['Workplace Burnout', 'Self-Esteem & Confidence', 'Adjustment & Emotional difficulties'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    bio: 'Helping working professionals and university students conquer burnout, build healthy boundary habits, and recover emotional resilience.',
    modes: ['ONLINE']
  },
  {
    id: 'anand-m',
    name: 'Anand M.',
    designation: 'Consultant Psychologist',
    credential: 'M.Phil Clinical Psychology',
    rating: '4.9',
    reviews: 31,
    years: 8,
    mode: 'Clinic & Doorstep',
    specialties: ['Relationship & Family Challenges', 'Adjustment & Emotional difficulties', 'Anxiety & Stress'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Guiding couples, youth, and families through active communication, cognitive behavioral interventions, and emotional reconciliation.',
    modes: ['OFFLINE', 'DOOR_STEP']
  },
  {
    id: 'divya-r',
    name: 'Divya R.',
    designation: 'Consultant Psychologist',
    credential: 'Certified Psychological Counselor',
    rating: '5.0',
    reviews: 19,
    years: 6,
    mode: 'Online Video',
    specialties: ['Anxiety & Stress', 'Mindfulness & Calm', 'Self-Esteem & Confidence'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    bio: 'Integrating mindfulness-based cognitive practices to soothe panic, calm chronic worry, and instill enduring emotional groundedness.',
    modes: ['ONLINE']
  }
];

function normalizeAdvisor(counsellor) {
  const rawPhoto = counsellor.profilePic || counsellor.photo || counsellor.avatar
    || counsellor.profilePicture || counsellor.image || counsellor.user?.profilePic;
  const hoursValue = counsellor.hours !== undefined && counsellor.hours !== null && counsellor.hours !== ''
    ? Number(counsellor.hours)
    : (typeof counsellor.experience === 'number' ? counsellor.experience : (parseInt(counsellor.experience, 10) || 0));
  const experience = formatExperience(Number.isFinite(hoursValue) ? hoursValue : 0);
  const designation = counsellor.title
    || (counsellor.designation && counsellor.designation.toLowerCase() !== 'counsellor' ? counsellor.designation : null)
    || (counsellor.role && counsellor.role.toLowerCase() !== 'counsellor' ? counsellor.role : null)
    || 'Clinical Psychologist';
  const rawFee = counsellor.fee ?? counsellor.price;
  const rawHalfSessionPrice = counsellor.halfSessionPrice;
  const fee = rawFee === null || rawFee === undefined || rawFee === '' ? null : Number(rawFee);
  const halfSessionPrice = rawHalfSessionPrice === null || rawHalfSessionPrice === undefined || rawHalfSessionPrice === ''
    ? null
    : Number(rawHalfSessionPrice);
  const rawSpecialties = Array.isArray(counsellor.specialties)
    ? counsellor.specialties
    : (counsellor.tags ? (Array.isArray(counsellor.tags) ? counsellor.tags : [counsellor.tags]) : (counsellor.focus || []));

  return {
    id: counsellor.id || counsellor._id?.toString(),
    name: counsellor.name || counsellor.user?.name || counsellor.fullName || '',
    designation,
    credential: counsellor.credential || (designation.toLowerCase().includes('clinical') ? 'CLINICAL PSYCHOLOGIST' : 'COUNSELLING PSYCHOLOGIST'),
    rating: counsellor.rating ? String(Number(counsellor.rating).toFixed(1)) : '5.0',
    reviews: counsellor.reviews || counsellor.reviewCount || 0,
    fee: Number.isFinite(fee) ? fee : 1299,
    halfSessionPrice: Number.isFinite(halfSessionPrice) ? halfSessionPrice : null,
    hours: experience.rawHours || (counsellor.years ? counsellor.years * 150 : 0),
    years: counsellor.years || (typeof counsellor.experience === 'string' ? parseInt(counsellor.experience, 10) : 7),
    bio: counsellor.bio || '',
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter((v) => typeof v === 'string' && v.trim()).slice(0, 5),
    modes: Array.isArray(counsellor.modes) && counsellor.modes.length > 0 ? counsellor.modes : ['ONLINE', 'OFFLINE'],
    isActive: counsellor.isActive !== false,
    isDeleted: counsellor.isDeleted === true,
    isVerified: counsellor.isVerified !== false,
    status: counsellor.status || 'APPROVED',
  };
}

function getModeLabels(modes = [], siteSettings = {}) {
  return modes.map((mode) => {
    const normalizedMode = String(mode).toUpperCase();
    if ((normalizedMode === 'ONLINE' && siteSettings.enableOnline === false)
      || (normalizedMode === 'OFFLINE' && siteSettings.enableOffline === false)
      || (normalizedMode === 'DOOR_STEP' && siteSettings.enableDoorstep === false)) return null;
    return ({
      ONLINE: 'Online Video',
      OFFLINE: 'Clinic Visit',
      DOOR_STEP: 'Home Visit',
    }[normalizedMode]);
  }).filter(Boolean);
}

function isPublicAdvisor(advisor) {
  const status = String(advisor?.status || '').toUpperCase();
  return advisor
    && (advisor.id || advisor._id)
    && String(advisor.name || advisor.user?.name || advisor.fullName || '').trim()
    && advisor.isActive !== false
    && advisor.isDeleted !== true
    && advisor.isVerified !== false
    && !['REJECTED', 'DELETED', 'PAUSED'].includes(status);
}

export default function PsychologistsPage({ onBookTherapist, siteSettings = {} }) {
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedMode, setSelectedMode] = useState('');
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const active = res.data.filter(isPublicAdvisor).map(normalizeAdvisor);
          setAdvisors(active.length > 0 ? active : fallbackPsychologists);
        } else {
          setAdvisors(fallbackPsychologists);
        }
      })
      .catch(() => {
        if (isMounted) setAdvisors(fallbackPsychologists);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const specialties = useMemo(() => {
    const set = new Set();
    const list = advisors.length > 0 ? advisors : fallbackPsychologists;
    list.forEach((a) => {
      a.specialties.forEach((s) => {
        if (s && typeof s === 'string') set.add(s.trim());
      });
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [advisors]);

  const availableModeLabels = useMemo(() => {
    const list = advisors.length > 0 ? advisors : fallbackPsychologists;
    return [...new Set(list.flatMap((a) => getModeLabels(a.modes, siteSettings)))];
  }, [advisors, siteSettings]);

  const filteredAdvisors = useMemo(() => {
    const list = advisors.length > 0 ? advisors : fallbackPsychologists;
    return list
      .filter((advisor) => {
        if (selectedSpecialty !== 'All' && !advisor.specialties.some((s) => s.toLowerCase() === selectedSpecialty.toLowerCase())) {
          return false;
        }
        if (selectedMode && !getModeLabels(advisor.modes, siteSettings).includes(selectedMode)) {
          return false;
        }
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return [advisor.name, advisor.designation, advisor.bio, ...advisor.specialties]
          .some((val) => String(val).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        if (sortBy === 'FEE_LOW') return (a.fee || 0) - (b.fee || 0);
        if (sortBy === 'FEE_HIGH') return (b.fee || 0) - (a.fee || 0);
        return 0;
      });
  }, [advisors, searchQuery, selectedSpecialty, selectedMode, sortBy, siteSettings]);

  const hasActiveFilters = Boolean(searchQuery || selectedSpecialty !== 'All' || selectedMode || sortBy !== 'RECOMMENDED');

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('All');
    setSelectedMode('');
    setSortBy('RECOMMENDED');
  };

  const handleAdvisorClick = (advisorId) => {
    if (advisorId) {
      navigate(`/advisor/${advisorId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="Licensed Clinical Psychologists & Mentors | BEHOLD"
        description="Browse our complete directory of licensed, verified clinical psychologists. Filter by therapeutic specialty, session format, and book your confidential consultation."
        canonicalUrl="https://www.behold.co.in/psychologists"
      />

      <div className="min-h-screen bg-[#fbf9f5] text-[#1c2826] pt-24 sm:pt-28 pb-20 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-[#5c6b66]">
            <Link to="/" className="hover:text-[#b85438] transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#1c2826] font-semibold">Clinical Psychologists</span>
          </nav>

          {/* Page Header matching mockup */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-[#b85438] text-[11px] font-bold tracking-[0.2em] uppercase block mb-3">
              All Licensed Specialists
            </span>
            <h1 className="font-serif-hero text-3xl sm:text-4xl md:text-5xl font-normal text-[#1c2826] mb-4 tracking-tight leading-tight">
              Our Clinical Psychologists<span className="text-[#b85438]">.</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#5c6b66] font-normal max-w-2xl mx-auto leading-relaxed">
              Explore our full directory of certified, compassionate mental health professionals. Filter by focus areas, session formats, and connect with the right specialist for your journey.
            </p>
          </div>

          {/* Interactive Toolbar matching mockup */}
          <div className="bg-white rounded-3xl border border-[#ede7de] shadow-xs p-5 sm:p-6 mb-8">
            {/* Top Row: Search & Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
              {/* Search */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by psychologist name, concern, or bio..."
                  className="w-full bg-[#fbf9f5] border border-[#ede7de] rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1c2826] placeholder-slate-400 outline-none focus:border-[#b85438] focus:bg-white focus:ring-4 focus:ring-[#b85438]/10 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Session Mode Selector */}
              <div className="lg:col-span-4 relative">
                <Camera className="w-4 h-4 text-[#b85438] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full appearance-none bg-[#fbf9f5] border border-[#ede7de] rounded-full pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1c2826] outline-none focus:border-[#b85438] focus:bg-white focus:ring-4 focus:ring-[#b85438]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="">Any Consultation Mode</option>
                  {availableModeLabels.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector */}
              <div className="lg:col-span-3 relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#fbf9f5] border border-[#ede7de] rounded-full pl-10 pr-8 py-2.5 text-xs sm:text-sm text-[#1c2826] outline-none focus:border-[#b85438] focus:bg-white focus:ring-4 focus:ring-[#b85438]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="RECOMMENDED">Sort: Recommended</option>
                  <option value="FEE_LOW">Fee: Low to High</option>
                  <option value="FEE_HIGH">Fee: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Specialty Horizontal Chips Row */}
            <div className="mt-4 pt-4 border-t border-[#ede7de]">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[10px] font-bold text-[#b85438] uppercase tracking-wider mr-1 shrink-0">Focus Area:</span>
                {specialties.map((cat) => {
                  const active = selectedSpecialty === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSpecialty(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border ${
                        active
                          ? 'bg-[#b85438] text-white border-[#b85438] shadow-xs'
                          : 'bg-[#fbf9f5] hover:bg-white text-slate-700 border-[#ede7de] hover:text-[#1c2826]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Clear Row */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-[#ede7de] flex items-center justify-between">
                <span className="text-xs font-medium text-[#5c6b66]">
                  Filters applied
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[#b85438] hover:text-[#9e432c] bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 px-1">
            <p className="text-xs sm:text-sm font-semibold text-[#1c2826]">
              Showing <span className="font-bold text-[#b85438]">{filteredAdvisors.length}</span> verified psychologist{filteredAdvisors.length !== 1 ? 's' : ''}
            </p>
            <span className="text-xs font-semibold text-[#2d4a3e] hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2d4a3e]" />
              100% Confidential &amp; Encrypted Sessions
            </span>
          </div>

          {/* Grid System matching reference aesthetic */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-3xl border border-[#ede7de] p-5 flex flex-col space-y-4 shadow-xs">
                  <div className="h-52 w-full rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-6 w-3/4 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-slate-100 rounded-full mt-auto animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#ede7de] shadow-xs max-w-lg mx-auto p-10">
              <div className="w-14 h-14 bg-[#faf5f0] text-[#b85438] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eedfd0]">
                <UserRound className="w-6 h-6" />
              </div>
              <h3 className="font-serif-hero text-xl font-bold text-[#1c2826] mb-2">No Psychologists Found</h3>
              <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed max-w-sm mx-auto mb-6">
                Try adjusting your search query, specialty focus, or session format to discover available specialists.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-semibold rounded-full transition-all cursor-pointer border-none shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {filteredAdvisors.map((advisor) => {
                const nextAvailable = calculateNextAvailable(advisor.availability, advisor.bookedSlots);
                const modeLabels = getModeLabels(advisor.modes, siteSettings);
                const modeSummaryText = modeLabels.length >= 2 ? 'Online & Clinic' : (modeLabels[0] || 'Online Video');

                return (
                  <article
                    key={advisor.id}
                    className="group bg-white rounded-3xl border border-[#ede7de] hover:border-[#b85438]/40 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full relative"
                  >
                    {/* Photo Header */}
                    <div
                      onClick={() => handleAdvisorClick(advisor.id)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4eee6] cursor-pointer shrink-0"
                    >
                      {advisor.photo ? (
                        <img
                          src={advisor.photo}
                          alt={advisor.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1c2826] text-white">
                          <span className="font-serif-hero text-5xl font-bold">{getInitial(advisor.name)}</span>
                          <span className="text-[10px] tracking-widest uppercase text-slate-300 mt-1 font-semibold">Clinical Care</span>
                        </div>
                      )}

                      {/* Gentle bottom shade for badge contrast */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                      {/* Next Available Pill (Top-Left) */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs border border-white/80 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{nextAvailable === 'Unavailable' ? 'Check slots' : `Next: ${nextAvailable}`}</span>
                        </span>
                      </div>

                      {/* Verified Badge (Top-Right) */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="bg-[#1c2826]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#b85438]" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Rating on bottom right */}
                      {advisor.rating && (
                        <div className="absolute bottom-3 right-3.5 z-10">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-slate-900 px-2.5 py-0.5 rounded-full shadow-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{advisor.rating}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Credential line */}
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#b85438] block mb-1">
                          {advisor.credential || 'CLINICAL PSYCHOLOGIST'}
                        </span>

                        {/* Name & Designation */}
                        <div className="mb-3">
                          <h3
                            onClick={() => handleAdvisorClick(advisor.id)}
                            className="font-serif-hero text-xl font-bold text-[#1c2826] group-hover:text-[#b85438] transition-colors leading-tight cursor-pointer inline-block"
                          >
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-[#5c6b66] font-medium mt-1 leading-snug">
                            {advisor.designation}
                          </p>
                        </div>

                        {/* Specialties Chips */}
                        {advisor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3.5">
                            {advisor.specialties.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="text-[11px] font-medium text-[#5c6b66] bg-[#fbf9f5] border border-[#ede7de] px-2.5 py-0.5 rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bio snippet */}
                        {advisor.bio && (
                          <p className="text-xs text-[#5c6b66] line-clamp-2 leading-relaxed font-normal mb-3">
                            {advisor.bio}
                          </p>
                        )}

                        {/* Facts: Experience & Format */}
                        <div className="pt-2.5 border-t border-[#ede7de] flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-[#5c6b66]">
                          {advisor.years > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <BriefcaseBusiness className="w-3.5 h-3.5 text-[#b85438]" />
                              <span>{advisor.years} yrs experience</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#b85438]" />
                            <span>{modeSummaryText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-4 mt-4 border-t border-[#ede7de] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Session Fee
                          </span>
                          <div className="text-sm font-bold text-[#1c2826] leading-tight">
                            {advisor.fee !== null ? (
                              <>
                                ₹{advisor.fee.toLocaleString('en-IN')}
                                <span className="text-[11px] text-[#5c6b66] font-normal ml-0.5">/ session</span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-[#1c2826]">Standard rate</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdvisorClick(advisor.id)}
                            title="View clinical profile"
                            className="px-3.5 py-2 rounded-full text-xs font-semibold text-slate-700 bg-[#fbf9f5] hover:bg-[#ede7de] transition-colors cursor-pointer border border-[#ede7de]"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => onBookTherapist?.(advisor.id)}
                            className="px-4.5 py-2 rounded-full text-xs font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white transition-all duration-200 cursor-pointer border-none shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <span>Book Session</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
