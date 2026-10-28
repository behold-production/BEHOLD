import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Star,
  UserRound,
  LayoutGrid
} from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import greyGreenBg from '../../assets/greygreen.png';

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
    specialties: rawSpecialties.filter(v => typeof v === 'string' && v.trim()).slice(0, 4),
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

export default function TherapistSwipeSection({ onBookTherapist, navigateToSection, siteSettings = {} }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((response) => {
        if (!isMounted) return;
        if (response?.success && Array.isArray(response.data)) {
          const activeCounsellors = response.data.filter(isPublicAdvisor);
          setAdvisors(activeCounsellors.map(normalizeAdvisor));
          try {
            localStorage.setItem('behold_counsellors_cache', JSON.stringify(response.data));
          } catch {}
        }
      })
      .catch((error) => {
        console.warn('API counsellors fetch note:', error.message || error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Update slider navigation buttons state
  const checkScrollState = () => {
    const el = sliderRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [advisors]);

  const handleScroll = (direction) => {
    const el = sliderRef.current;
    if (el) {
      const cardWidth = el.querySelector('article')?.offsetWidth || 340;
      const scrollAmount = direction === 'left' ? -cardWidth * 1.15 : cardWidth * 1.15;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleShowAll = () => {
    navigate('/psychologists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvisorClick = (advisorId) => {
    if (advisorId) {
      navigate(`/advisor/${advisorId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      className="relative py-20 sm:py-28 bg-[#fafaf7]/90 text-slate-900 border-b border-slate-200/80 overflow-hidden scroll-mt-20"
      id="experts"
      aria-labelledby="bh-experts-title"
    >
      {/* Background texture matching website design */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <img
          src={greyGreenBg?.src || greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with "Show All" and Swipe Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
              Empathetic &amp; Verified Guidance
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
            </span>
            <h2
              id="bh-experts-title"
              className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 mb-3 tracking-tight leading-tight"
            >
              Find Someone Who Truly Gets You<span className="text-[#00e5ff]">.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Swipe through our compassionate, verified clinical psychologists. Swipe left or right to explore their background, clinical focus, and availability.
            </p>
          </div>

          {/* Action Header Controls: Swipe Arrows & Show All Button */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            {/* Show All Option Button */}
            <button
              type="button"
              onClick={handleShowAll}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs sm:text-[13px] font-bold tracking-wider inline-flex items-center gap-2 transition-all shadow-xs hover-scale-btn cursor-pointer border-none"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Show All ({advisors.length})</span>
              <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
            </button>

            {/* Slider Arrow Controls */}
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Previous psychologist"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Next psychologist"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Shimmer State */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div key={item} className="shrink-0 w-[310px] sm:w-[340px] bg-white rounded-2xl border border-slate-200 p-6 flex flex-col space-y-4 shadow-xs">
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
        ) : advisors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto p-8">
            <UserRound className="w-10 h-10 text-teal-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Psychologists Updating</h3>
            <p className="text-xs text-slate-600 mb-4">Please check back shortly or explore our booking services.</p>
          </div>
        ) : (
          /* Smooth Swipe / Carousel Track */
          <div className="relative -mx-4 sm:mx-0">
            <div
              ref={sliderRef}
              className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory px-4 sm:px-1 py-3"
            >
              {advisors.map((advisor) => {
                const nextAvailable = calculateNextAvailable(advisor.availability, advisor.bookedSlots);
                const modeLabels = getModeLabels(advisor.modes, siteSettings);
                const modeSummaryText = modeLabels.length >= 2 ? 'Online & Clinic' : (modeLabels[0] || 'Online Video');

                return (
                  <article
                    key={advisor.id}
                    className="snap-start shrink-0 w-[290px] sm:w-[325px] md:w-[350px] group bg-white rounded-2xl border border-slate-200/90 hover:border-[#00e5ff]/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden select-none"
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
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
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
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name & Designation */}
                        <div className="mb-3">
                          <h3
                            onClick={() => handleAdvisorClick(advisor.id)}
                            className="text-lg font-bold text-slate-900 group-hover:text-teal-900 transition-colors leading-tight cursor-pointer inline-block"
                          >
                            {advisor.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                            {advisor.designation}
                          </p>
                        </div>

                        {/* Specialties Chips */}
                        {advisor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3.5">
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
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal mb-3">
                            {advisor.bio}
                          </p>
                        )}

                        {/* Meta facts: Experience & Format */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center gap-3 text-xs font-medium text-slate-500">
                          {advisor.years > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <BriefcaseBusiness className="w-3 h-3 text-teal-700" />
                              <span>{advisor.years} yrs exp</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Camera className="w-3 h-3 text-teal-700" />
                            <span>{modeSummaryText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Actions */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Session Fee
                          </span>
                          <div className="text-sm font-bold text-slate-900 leading-tight">
                            {advisor.fee !== null ? (
                              <>
                                ₹{advisor.fee.toLocaleString('en-IN')}
                                <span className="text-[10px] text-slate-500 font-normal ml-0.5">/ session</span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600">Standard rate</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdvisorClick(advisor.id)}
                            title="View clinical profile"
                            className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-950 transition-colors cursor-pointer border-none"
                          >
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => onBookTherapist?.(advisor.id)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-[#00e5ff] text-white hover:text-slate-950 transition-all duration-200 cursor-pointer border-none shadow-xs hover-scale-btn inline-flex items-center gap-1"
                          >
                            <span>Book</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Swipe Controls & "Show All Grid View" CTA */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/70">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Swipe horizontally to browse specialists. 100% private, verified, and confidential care.</span>
          </div>

          {/* Show All Full Directory CTA */}
          <button
            type="button"
            onClick={handleShowAll}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-xs hover-scale-btn cursor-pointer border-none"
          >
            <LayoutGrid className="w-4 h-4 text-[#00e5ff]" />
            <span>Show All Psychologists (Grid View)</span>
            <ArrowRight className="w-4 h-4 text-[#00e5ff]" />
          </button>
        </div>
      </div>
    </section>
  );
}
