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
    rating: counsellor.rating ? String(Number(counsellor.rating).toFixed(1)) : null,
    reviews: counsellor.reviews || counsellor.reviewCount || 0,
    fee: Number.isFinite(fee) ? fee : null,
    halfSessionPrice: Number.isFinite(halfSessionPrice) ? halfSessionPrice : null,
    hours: experience.rawHours || (counsellor.years ? counsellor.years * 150 : 0),
    years: Number.isFinite(counsellor.years) ? counsellor.years : (parseInt(counsellor.experience, 10) || 0),
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
  const [fetchError, setFetchError] = useState(false);

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
          setAdvisors(active);
        } else {
          setAdvisors([]);
        }
      })
      .catch(() => {
        if (isMounted) { setAdvisors([]); setFetchError(true); }
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

      <div className="min-h-screen bg-[#fbf8f1] text-[#0e1111] pt-24 sm:pt-28 pb-20 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-medium text-[#55605f]">
            <Link to="/" className="hover:text-[#0e7490] transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-[#7c8785]">/</span>
            <span className="text-[#0e1111] font-semibold">Clinical Psychologists</span>
          </nav>

          {/* Page Header matching mockup */}
          <div className="reveal-on-scroll text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="text-[#0e7490] text-[11px] font-bold tracking-[0.2em] uppercase block mb-3">
              All Licensed Specialists
            </span>
            <h1 className="font-serif-hero text-3xl sm:text-4xl md:text-5xl font-normal text-[#0e1111] mb-4 tracking-tight leading-tight">
              Our Clinical Psychologists<span className="text-[#0e7490]">.</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#55605f] font-normal max-w-2xl mx-auto leading-relaxed">
              Explore our full directory of certified, compassionate mental health professionals. Filter by focus areas, session formats, and connect with the right specialist for your journey.
            </p>
          </div>

          {/* Interactive Toolbar matching modern professional layout */}
          <div className="reveal-scale-in reveal-delay-1 bg-white rounded-md border border-[#e6dfd0] shadow-xs p-5 sm:p-6 mb-8">
            {/* Top Row: Search & Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
              {/* Search */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-[#7c8785] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by psychologist name, concern, or bio..."
                  className="w-full bg-[#fbf8f1] border border-[#e6dfd0] rounded-md pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#0e1111] placeholder-[#9aa29f] outline-none focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/10 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7c8785] hover:text-[#55605f] p-0.5 bg-transparent border-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Session Mode Selector */}
              <div className="lg:col-span-4 relative">
                <Camera className="w-4 h-4 text-[#0e7490] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full appearance-none bg-[#fbf8f1] border border-[#e6dfd0] rounded-md pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#0e1111] outline-none focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="">Any Consultation Mode</option>
                  {availableModeLabels.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#7c8785] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector */}
              <div className="lg:col-span-3 relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#7c8785] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#fbf8f1] border border-[#e6dfd0] rounded-md pl-10 pr-8 py-2.5 text-xs sm:text-sm text-[#0e1111] outline-none focus:border-[#0e7490] focus:bg-white focus:ring-2 focus:ring-[#0e7490]/10 transition-all font-medium cursor-pointer"
                >
                  <option value="RECOMMENDED">Sort: Recommended</option>
                  <option value="FEE_LOW">Fee: Low to High</option>
                  <option value="FEE_HIGH">Fee: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#7c8785] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Specialty Horizontal Chips Row */}
            <div className="mt-4 pt-4 border-t border-[#e6dfd0]">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                <span className="text-[10px] font-bold text-[#0e7490] uppercase tracking-wider mr-1 shrink-0">Focus Area:</span>
                {specialties.map((cat) => {
                  const active = selectedSpecialty === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedSpecialty(cat)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border ${
                        active
                          ? 'bg-[#0e7490] text-white border-[#0e7490] shadow-xs'
                          : 'bg-[#fbf8f1] hover:bg-white text-[#3c4747] border-[#e6dfd0] hover:text-[#0e1111]'
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
              <div className="mt-3 pt-3 border-t border-[#e6dfd0] flex items-center justify-between">
                <span className="text-xs font-medium text-[#55605f]">
                  Filters applied
                </span>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[#0e7490] hover:text-[#0c6b83] bg-transparent border-none cursor-pointer inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 px-1">
            <p className="text-xs sm:text-sm font-semibold text-[#0e1111]">
              Showing <span className="font-bold text-[#0e7490]">{filteredAdvisors.length}</span> verified psychologist{filteredAdvisors.length !== 1 ? 's' : ''}
            </p>
            <span className="text-xs font-semibold text-[#14414d] hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#14414d]" />
              100% Confidential &amp; Encrypted Sessions
            </span>
          </div>

          {/* Grid System matching reference aesthetic */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-md border border-[#e6dfd0] p-5 flex flex-col space-y-4 shadow-xs">
                  <div className="h-52 w-full rounded-sm bg-[#f1eadc] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-[#f1eadc] rounded-sm animate-pulse" />
                    <div className="h-6 w-3/4 bg-[#f1eadc] rounded-sm animate-pulse" />
                    <div className="h-3 w-1/2 bg-[#f1eadc] rounded-sm animate-pulse" />
                  </div>
                  <div className="h-10 w-full bg-[#f1eadc] rounded-sm mt-auto animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="reveal-scale-in text-center py-20 bg-white rounded-md border border-[#e6dfd0] shadow-xs max-w-lg mx-auto p-10">
              <div className="w-14 h-14 bg-[#f7f2e7] text-[#0e7490] rounded-sm flex items-center justify-center mx-auto mb-4 border border-[#cbe9f1]">
                <UserRound className="w-6 h-6" />
              </div>
              <h3 className="font-serif-hero text-xl font-bold text-[#0e1111] mb-2">
                {fetchError ? 'Unable to Load Specialists' : 'No Psychologists Found'}
              </h3>
              <p className="text-xs sm:text-sm text-[#55605f] leading-relaxed max-w-sm mx-auto mb-6">
                {fetchError
                  ? 'We could not reach our servers to fetch the specialist directory. Please check your connection and try again.'
                  : 'Try adjusting your search query, specialty focus, or session format to discover available specialists.'}
              </p>
              <button
                type="button"
                onClick={() => (fetchError ? window.location.reload() : handleClearFilters())}
                className="px-6 py-2.5 bg-[#0e1111] hover:bg-[#0e7490] text-white text-xs font-semibold rounded-md transition-all cursor-pointer border-none shadow-xs"
              >
                {fetchError ? 'Try Again' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            <div className="reveal-on-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
              {filteredAdvisors.map((advisor) => {
                const nextAvailable = calculateNextAvailable(advisor.availability, advisor.bookedSlots);
                const modeLabels = getModeLabels(advisor.modes, siteSettings);
                const modeSummaryText = modeLabels.length >= 2 ? 'Online & Clinic' : (modeLabels[0] || 'Online Video');

                return (
                  <article
                    key={advisor.id}
                    className="group bg-white rounded-md border border-[#e6dfd0] hover:border-[#0e7490]/40 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden h-full relative"
                  >
                    {/* Photo Header */}
                    <div
                      onClick={() => handleAdvisorClick(advisor.id)}
                      className="relative aspect-[4/3] w-full overflow-hidden bg-[#f1eadc] cursor-pointer shrink-0"
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
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e1111] text-white">
                          <span className="font-serif-hero text-5xl font-bold">{getInitial(advisor.name)}</span>
                          <span className="text-[10px] tracking-widest uppercase text-[#9aa29f] mt-1 font-semibold">Clinical Care</span>
                        </div>
                      )}

                      {/* Gentle bottom shade for badge contrast */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                      {/* Next Available Pill (Top-Left) */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-[#0e1111] text-[11px] font-semibold px-3 py-1 rounded-sm shadow-xs border border-white/80 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{nextAvailable === 'Unavailable' ? 'Check slots' : `Next: ${nextAvailable}`}</span>
                        </span>
                      </div>

                      {/* Verified Badge (Top-Right) */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="bg-[#0e1111]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#0e7490]" />
                          <span>Verified</span>
                        </span>
                      </div>

                      {/* Rating on bottom right */}
                      {advisor.rating && (
                        <div className="absolute bottom-3 right-3.5 z-10">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/95 text-[#0e1111] px-2.5 py-0.5 rounded-sm shadow-xs">
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
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e7490] block mb-1">
                          {advisor.credential || 'CLINICAL PSYCHOLOGIST'}
                        </span>

                        {/* Name & Designation */}
                        <div className="mb-3">
                          <h3
                            onClick={() => handleAdvisorClick(advisor.id)}
                            className="font-serif-hero text-xl font-bold text-[#0e1111] group-hover:text-[#0e7490] transition-colors leading-tight cursor-pointer inline-block"
                          >
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-[#55605f] font-medium mt-1 leading-snug">
                            {advisor.designation}
                          </p>
                        </div>

                        {/* Specialties Chips */}
                        {advisor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3.5">
                            {advisor.specialties.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="text-[11px] font-medium text-[#55605f] bg-[#fbf8f1] border border-[#e6dfd0] px-2.5 py-0.5 rounded-sm"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bio snippet */}
                        {advisor.bio && (
                          <p className="text-xs text-[#55605f] line-clamp-2 leading-relaxed font-normal mb-3">
                            {advisor.bio}
                          </p>
                        )}

                        {/* Facts: Experience & Format */}
                        <div className="pt-2.5 border-t border-[#e6dfd0] flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-[#55605f]">
                          {advisor.years > 0 && (
                            <span className="inline-flex items-center gap-1.5">
                              <BriefcaseBusiness className="w-3.5 h-3.5 text-[#0e7490]" />
                              <span>{advisor.years} yrs experience</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#0e7490]" />
                            <span>{modeSummaryText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-4 mt-4 border-t border-[#e6dfd0] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-semibold text-[#7c8785] uppercase tracking-wider block">
                            Session Fee
                          </span>
                          <div className="text-sm font-bold text-[#0e1111] leading-tight">
                            {advisor.fee !== null ? (
                              <>
                                ₹{advisor.fee.toLocaleString('en-IN')}
                                <span className="text-[11px] text-[#55605f] font-normal ml-0.5">/ session</span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-[#0e1111]">Standard rate</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdvisorClick(advisor.id)}
                            title="View clinical profile"
                            className="px-3.5 py-2 rounded-md text-xs font-semibold text-[#3c4747] bg-[#fbf8f1] hover:bg-[#e6dfd0] transition-colors cursor-pointer border border-[#e6dfd0]"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => onBookTherapist?.(advisor.id)}
                            className="px-4.5 py-2 rounded-md text-xs font-semibold bg-[#0e1111] hover:bg-[#0e7490] text-white transition-all duration-200 cursor-pointer border-none shadow-2xs inline-flex items-center gap-1.5"
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
