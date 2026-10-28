import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  ChevronDown,
  Heart,
  Home,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  X,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import shadeGreenBg from '../../assets/greygreen.png';
import SEO from '../../components/common/SEO';

const getInitial = (name = '') => {
  const cleanName = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

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
    fee: Number.isFinite(fee) ? fee : null,
    halfSessionPrice: Number.isFinite(halfSessionPrice) ? halfSessionPrice : null,
    hours: experience.rawHours || (counsellor.years ? counsellor.years * 150 : 0),
    years: counsellor.years || (typeof counsellor.experience === 'string' ? parseInt(counsellor.experience, 10) : 0),
    bio: counsellor.bio || '',
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter((v) => typeof v === 'string' && v.trim()).slice(0, 5),
    languages: Array.isArray(counsellor.lang)
      ? counsellor.lang.join(', ')
      : (counsellor.lang || (Array.isArray(counsellor.languages)
        ? counsellor.languages.join(', ')
        : (counsellor.languages || counsellor.language || 'English'))),
    availability: counsellor.availability || {},
    bookedSlots: counsellor.bookedSlots || [],
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
  const [advisors, setAdvisors] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_counsellors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(isPublicAdvisor).map(normalizeAdvisor);
        }
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => advisors.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedMode, setSelectedMode] = useState('');
  const [sortBy, setSortBy] = useState('RECOMMENDED');

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && Array.isArray(res.data)) {
          const active = res.data.filter(isPublicAdvisor).map(normalizeAdvisor);
          setAdvisors(active);
          try {
            localStorage.setItem('behold_counsellors_cache', JSON.stringify(res.data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Psychologists directory fetch note:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const specialties = useMemo(() => {
    const set = new Set();
    advisors.forEach((a) => {
      a.specialties.forEach((s) => {
        if (s && typeof s === 'string') set.add(s.trim());
      });
    });
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [advisors]);

  const availableModeLabels = useMemo(() => {
    return [...new Set(advisors.flatMap((a) => getModeLabels(a.modes, siteSettings)))];
  }, [advisors, siteSettings]);

  const filteredAdvisors = useMemo(() => {
    return advisors
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
        if (sortBy === 'FEE_LOW') {
          if (a.fee === null) return b.fee === null ? 0 : 1;
          if (b.fee === null) return -1;
          return a.fee - b.fee;
        }
        if (sortBy === 'FEE_HIGH') {
          if (a.fee === null) return b.fee === null ? 0 : 1;
          if (b.fee === null) return -1;
          return b.fee - a.fee;
        }
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

      <div className="min-h-screen bg-[#fafaf7] text-slate-900 pt-20 sm:pt-24 pb-20 relative">
        {/* Soft Background Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <img
            src={shadeGreenBg?.src || shadeGreenBg}
            alt=""
            className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Clinical Psychologists</span>
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
              All Licensed Specialists
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 mb-4 tracking-tight leading-tight">
              Our Clinical Psychologists<span className="text-[#00e5ff]">.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
              Explore our full directory of certified, compassionate mental health professionals. Filter by focus areas, session styles, and connect with the right person for your journey.
            </p>
          </div>

          {/* Interactive Toolbar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-8">
            {/* Top Row: Search & Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
              {/* Search */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by psychologist name, concern, or bio..."
                  className="w-full bg-slate-50/80 border border-slate-200/90 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#00e5ff] focus:bg-white focus:ring-4 focus:ring-[#00e5ff]/10 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Session Mode Selector */}
              <div className="lg:col-span-4 relative">
                <Camera className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full appearance-none bg-slate-50/80 border border-slate-200/90 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00e5ff] focus:bg-white focus:ring-4 focus:ring-[#00e5ff]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="">Any Consultation Mode</option>
                  {availableModeLabels.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector */}
              <div className="lg:col-span-3 relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-slate-50/80 border border-slate-200/90 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00e5ff] focus:bg-white focus:ring-4 focus:ring-[#00e5ff]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="RECOMMENDED">Sort: Recommended</option>
                  <option value="FEE_LOW">Fee: Low to High</option>
                  <option value="FEE_HIGH">Fee: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Specialty Horizontal Chips Row */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">Focus Area:</span>
                {specialties.map((cat) => {
                  const active = selectedSpecialty === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSpecialty(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80 hover:text-slate-900'
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
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Filters applied
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 px-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">
              Showing <span className="font-bold text-slate-950">{filteredAdvisors.length}</span> verified psychologist{filteredAdvisors.length !== 1 ? 's' : ''}
            </p>
            <span className="text-xs font-semibold text-teal-800 hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Confidential &amp; Encrypted Sessions
            </span>
          </div>

          {/* Grid System */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col space-y-4 shadow-xs">
                  <div className="shimmer h-56 w-full rounded-xl" />
                  <div className="space-y-2.5">
                    <div className="shimmer h-4 w-1/3 rounded-md" />
                    <div className="shimmer h-6 w-3/4 rounded-md" />
                    <div className="shimmer h-3 w-1/2 rounded-md" />
                  </div>
                  <div className="shimmer h-12 w-full rounded-xl mt-auto" />
                </div>
              ))}
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto p-10">
              <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                <UserRound className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Psychologists Found</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
                Try adjusting your search query, specialty focus, or session format to discover available therapists.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border-none shadow-xs"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
              {filteredAdvisors.map((advisor) => {
                const nextAvailable = calculateNextAvailable(advisor.availability, advisor.bookedSlots);
                const modeLabels = getModeLabels(advisor.modes, siteSettings);
                const modeSummaryText = modeLabels.length >= 2 ? 'Online & Clinic' : (modeLabels[0] || 'Online Video');

                return (
                  <article
                    key={advisor.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#00e5ff]/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full relative"
                  >
                    {/* Photo Header */}
                    <div
                      onClick={() => handleAdvisorClick(advisor.id)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-teal-50/40 cursor-pointer shrink-0"
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
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#1e3a5f] text-[#00e5ff]">
                          <span className="text-5xl font-black font-sans">{getInitial(advisor.name)}</span>
                          <span className="text-[10px] tracking-widest uppercase text-slate-300 mt-1 font-bold">Clinical Care</span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                      {/* Next Available Pill (Top-Left) */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs border border-white/60 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{nextAvailable === 'Unavailable' ? 'Check available times' : `Next: ${nextAvailable}`}</span>
                        </span>
                      </div>

                      {/* Verified Badge (Top-Right) */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10 flex items-center gap-1 shadow-xs">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#00e5ff]" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Bottom Tagline on Photo */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-center justify-between text-white">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e5ff] drop-shadow-xs">
                          {advisor.credential || 'CLINICAL PSYCHOLOGIST'}
                        </span>
                        {advisor.rating && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-slate-900 px-2 py-0.5 rounded-md shadow-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span>{advisor.rating}</span>
                            {advisor.reviews > 0 && <span className="text-slate-400 font-normal">({advisor.reviews})</span>}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name & Designation */}
                        <div className="mb-3">
                          <h3
                            onClick={() => handleAdvisorClick(advisor.id)}
                            className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-teal-900 transition-colors leading-tight cursor-pointer inline-block"
                          >
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                            {advisor.designation}
                          </p>
                        </div>

                        {/* Specialties Chips */}
                        {advisor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {advisor.specialties.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-md transition-colors"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bio snippet */}
                        {advisor.bio && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal mb-4">
                            {advisor.bio}
                          </p>
                        )}

                        {/* Facts: Experience & Format */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500">
                          {advisor.years > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <BriefcaseBusiness className="w-3.5 h-3.5 text-teal-700" />
                              <span>{advisor.years} yrs experience</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-teal-700" />
                            <span>{modeSummaryText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Session Fee
                          </span>
                          <div className="text-sm font-bold text-slate-900 leading-tight">
                            {advisor.fee !== null ? (
                              <>
                                ₹{advisor.fee.toLocaleString('en-IN')}
                                <span className="text-[11px] text-slate-500 font-normal ml-0.5">/ session</span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600">Standard rate</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdvisorClick(advisor.id)}
                            title="View clinical profile"
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 transition-colors cursor-pointer border-none"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => onBookTherapist?.(advisor.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-[#00e5ff] text-white hover:text-slate-950 transition-all duration-200 cursor-pointer border-none shadow-xs hover-scale-btn inline-flex items-center gap-1.5"
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
