import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Star, UserRound } from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';

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
  const fee = rawFee === null || rawFee === undefined || rawFee === '' ? null : Number(rawFee);
  const rawSpecialties = Array.isArray(counsellor.specialties)
    ? counsellor.specialties
    : (counsellor.tags ? (Array.isArray(counsellor.tags) ? counsellor.tags : [counsellor.tags]) : (counsellor.focus || []));

  return {
    id: counsellor.id || counsellor._id?.toString(),
    name: counsellor.name || counsellor.user?.name || counsellor.fullName || '',
    designation,
    credential: counsellor.credential || 'Licensed Psychologist',
    rating: counsellor.rating ? String(Number(counsellor.rating).toFixed(1)) : null,
    fee: Number.isFinite(fee) ? fee : null,
    years: Number.isFinite(counsellor.years) ? counsellor.years : (parseInt(counsellor.experience, 10) || 0),
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter(v => typeof v === 'string' && v.trim()),
    mode: Array.isArray(counsellor.modes) && counsellor.modes.length > 0 ? counsellor.modes.join(' & ') : 'Online & Clinic',
  };
}

function isPublicAdvisor(advisor) {
  const status = String(advisor?.status || '').toUpperCase();
  return advisor
    && (advisor.id || advisor._id)
    && String(advisor.name || advisor.user?.name || advisor.fullName || '').trim()
    && advisor.isActive !== false
    && advisor.isDeleted !== true
    && !['REJECTED', 'DELETED', 'PAUSED'].includes(status);
}

export default function TherapistSwipeSection({ onBookTherapist, siteSettings = {} }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const categories = [
    'All',
    'Clinical Psychology',
    'Career Guidance',
    'Anxiety & Stress',
    'Adolescent Care',
    'Couples & Family',
  ];

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((response) => {
        if (!isMounted) return;
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          const publicOnly = response.data.filter(isPublicAdvisor);
          setAdvisors(publicOnly.map(normalizeAdvisor));
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

  const displayList = useMemo(() => {
    const list = advisors;
    if (activeCategory === 'All') return list.slice(0, 6);
    return list.filter((a) => {
      const matchSpecialty = a.specialties?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
      const matchDesignation = a.designation?.toLowerCase().includes(activeCategory.toLowerCase());
      return matchSpecialty || matchDesignation;
    }).slice(0, 6);
  }, [advisors, activeCategory]);

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
      id="experts"
      aria-labelledby="bh-specialists-heading"
      className="relative py-20 sm:py-28 bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20 border-t border-[#ece6dc]"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Left terracotta eyebrow, Right serif heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              Our Specialists
            </span>
          </div>
          <div>
            <h2
              id="bh-specialists-heading"
              className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug"
            >
              Meet Your Dedicated Psychologists
            </h2>
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-md text-xs font-medium tracking-wide transition-all duration-200 shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#b85438] text-white border-[#b85438] shadow-xs'
                    : 'bg-white text-[#4c5b55] hover:text-[#1c2826] hover:bg-[#f6f2ec] border-[#ede7de]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stack of Horizontal Rows matching modern professional layout */}
        {loading ? (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-white rounded-md px-5 py-4 border border-[#ede7de] flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-[#f0eae1] rounded-sm animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#f0eae1] rounded-sm animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-[#f0eae1] animate-pulse shrink-0" />
                  <div className="h-3 w-24 bg-[#f0eae1] rounded-sm animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-[#f0eae1] rounded-md animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-md border border-[#ede7de]">
            <div className="w-12 h-12 bg-[#faf5f0] text-[#b85438] rounded-sm flex items-center justify-center mx-auto mb-3 border border-[#eedfd0]">
              <UserRound className="w-5 h-5" />
            </div>
            <p className="font-serif-hero text-lg text-[#1c2826] mb-1">
              {fetchError ? 'Unable to Load Specialists' : 'No Specialists in This Focus Yet'}
            </p>
            <p className="text-xs text-[#5c6b66] max-w-sm mx-auto">
              {fetchError
                ? 'We could not reach our servers right now. Please check your connection and try again shortly.'
                : 'Please try a different focus area above, or browse the full directory of our clinical psychologists.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {displayList.map((psychologist) => (
              <div
                key={psychologist.id}
                className="group bg-white rounded-md px-5 py-3.5 sm:py-3.5 border border-[#ede7de] hover:border-[#b85438]/50 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Left Column: Format & Session Type */}
                <div className="sm:w-1/4">
                  <span className="text-[11px] font-bold text-[#b85438] uppercase tracking-wider block">
                    {psychologist.mode || 'Online & Clinic'}
                  </span>
                  <span className="text-xs text-[#5c6b66] font-medium block">
                    {psychologist.years > 0 ? `${psychologist.years}+ Years Experience` : 'Accredited Specialist'}
                  </span>
                </div>

                {/* Middle Column: Primary Focus / Credentials */}
                <div className="sm:w-1/3">
                  <span className="text-xs font-medium text-[#33413d] line-clamp-1">
                    {psychologist.specialties?.slice(0, 2).join(' • ') || psychologist.credential}
                  </span>
                  <span className="text-[11px] text-[#5c6b66]">
                    {psychologist.designation}
                  </span>
                </div>

                {/* Middle-Right Column: Avatar & Doctor Name */}
                <div
                  onClick={() => handleAdvisorClick(psychologist.id)}
                  className="flex items-center gap-3 sm:w-1/3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0 bg-[#f4eee6] border border-[#ede7de]">
                    {psychologist.photo ? (
                      <img
                        src={psychologist.photo}
                        alt={psychologist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#b85438]">
                        {getInitial(psychologist.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors truncate">
                      {psychologist.name}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                      {psychologist.rating ? (
                        <>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{psychologist.rating}</span>
                          {psychologist.fee != null && (
                            <>
                              <span className="text-[#a8a094]">·</span>
                              <span className="text-[#5c6b66] font-normal">₹{psychologist.fee}</span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-[#8a938f] font-normal">
                          {psychologist.fee != null ? `₹${psychologist.fee} / session` : 'Newly listed specialist'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Book Button */}
                <div className="sm:w-auto shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onBookTherapist?.(psychologist.id)}
                    className="w-full sm:w-auto px-5 py-2 rounded-md text-xs font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white transition-colors duration-200 shadow-2xs cursor-pointer border-none"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Centered Button linking to /psychologists */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-[#5c6b66] mb-3">
            Showing top clinical psychologists ready to support your mental wellness.
          </p>
          <button
            type="button"
            onClick={handleShowAll}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md text-xs sm:text-sm font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white shadow-sm hover:shadow transition-all duration-300 cursor-pointer active:scale-95 border-none"
          >
            <span>View All Psychologists</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </section>
  );
}
