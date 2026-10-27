import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Camera, ChevronDown, Clock3, Heart, Languages, MapPin, Search, ShieldCheck, SlidersHorizontal, UserRound } from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';
import { calculateNextAvailable } from '../../utils/dateFormatter';

const getInitial = (name = '') => {
  const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
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
    || 'Psychologist';
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
    years: counsellor.years || (typeof counsellor.experience === 'string' ? parseInt(counsellor.experience, 10) : 0),
    bio: counsellor.bio || '',
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter(value => typeof value === 'string' && value.trim()).slice(0, 5),
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
      ONLINE: 'Online',
      OFFLINE: 'In person',
      DOOR_STEP: 'Home visit',
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

export default function TherapistSwipeSection({ onBookTherapist, navigateToSection, siteSettings }) {
  const [advisors, setAdvisors] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_counsellors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(isPublicAdvisor).map(normalizeAdvisor);
        }
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(() => advisors.length === 0);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Listen for specialty filter trigger from Hero concern tags
  useEffect(() => {
    const handleFilterSpecialty = (event) => {
      if (event.detail?.specialty) {
        setSelectedSpecialty(event.detail.specialty);
      }
    };
    window.addEventListener('behold:filter_specialty', handleFilterSpecialty);
    return () => window.removeEventListener('behold:filter_specialty', handleFilterSpecialty);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadError('');
    ApiService.getCounsellors({}, true)
      .then((response) => {
        if (!isMounted) return;
        if (response?.success && Array.isArray(response.data)) {
          const activeCounsellors = response.data.filter(isPublicAdvisor);
          setAdvisors(activeCounsellors.map(normalizeAdvisor));
          try {
            localStorage.setItem('behold_counsellors_cache', JSON.stringify(response.data));
          } catch (e) {}
        }
        setLoadError('');
      })
      .catch((error) => {
        console.warn('API counsellors fetch note:', error.message || error);
        if (isMounted && advisors.length === 0) {
          setLoadError('Psychologists are currently unavailable. Please refresh or check back shortly.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [retryCount]);

  // Listen for admin changes to counsellors
  useEffect(() => {
    const handleCounsellorsUpdated = () => {
      setRetryCount((c) => c + 1);
    };
    window.addEventListener('behold_counsellors_updated', handleCounsellorsUpdated);
    window.addEventListener('storage_update', (e) => {
      if (e.detail?.key === 'behold_counsellors_cache') handleCounsellorsUpdated();
    });
    return () => {
      window.removeEventListener('behold_counsellors_updated', handleCounsellorsUpdated);
    };
  }, []);

  const filteredAdvisors = useMemo(() => advisors
    .filter((advisor) => {
      if (selectedSpecialty && !advisor.specialties.some(s => s.toLowerCase() === selectedSpecialty.toLowerCase())) return false;
      if (selectedMode && !getModeLabels(advisor.modes, siteSettings).includes(selectedMode)) return false;
      const query = searchQuery.trim().toLocaleLowerCase();
      if (!query) return true;
      return [advisor.name, advisor.designation, advisor.bio, ...advisor.specialties]
        .some(value => String(value).toLocaleLowerCase().includes(query));
    })
    .sort((first, second) => {
      if (sortBy === 'FEE_LOW' || sortBy === 'FEE_HIGH') {
        if (first.fee === null) return second.fee === null ? 0 : 1;
        if (second.fee === null) return -1;
        return sortBy === 'FEE_LOW' ? first.fee - second.fee : second.fee - first.fee;
      }
      return 0;
    }), [advisors, searchQuery, selectedSpecialty, selectedMode, sortBy, siteSettings]);

  const specialties = useMemo(() => {
    return [...new Set(advisors.flatMap((advisor) => advisor.specialties))].sort((a, b) => a.localeCompare(b));
  }, [advisors]);

  const availableModeLabels = useMemo(() => {
    return [...new Set(advisors.flatMap((advisor) => getModeLabels(advisor.modes, siteSettings)))];
  }, [advisors, siteSettings]);

  return (
    <section className="bh-experts" id="experts" aria-labelledby="bh-experts-title">
      <div className="bh-section-shell">
        <div className="bh-section-heading">
          <div>
            <span className="bh-eyebrow"><span className="bh-eyebrow-dot" />A good place to start</span>
            <h2 id="bh-experts-title">Find someone who<br /><em>gets you.</em></h2>
          </div>
          <p>Every journey is different. Explore experienced, compassionate professionals and choose the person and kind of support that feels right for you.</p>
        </div>

        <div className="bh-expert-tools">
          <label className="bh-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search psychologists by name or focus</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or concern"
            />
          </label>
          <label className="bh-select-filter">
            <Heart size={16} aria-hidden="true" />
            <span className="sr-only">Filter by focus area</span>
            <select value={selectedSpecialty} onChange={(event) => setSelectedSpecialty(event.target.value)}>
              <option value="">All focus areas</option>
              {specialties.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
          <label className="bh-select-filter">
            <Camera size={16} aria-hidden="true" />
            <span className="sr-only">Filter by session mode</span>
            <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)}>
              <option value="">Any session mode</option>
              {availableModeLabels.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
          <label className="bh-sort">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Sort psychologists</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="RECOMMENDED">Recommended</option>
              <option value="FEE_LOW">Fee: low to high</option>
              <option value="FEE_HIGH">Fee: high to low</option>
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>

        {loadError && advisors.length > 0 && <p className="bh-load-note" role="status">{loadError}</p>}

        {loading ? (
          <div className="bh-loading-grid" aria-label="Loading psychologists">
            {[1, 2, 3].map(item => <div className="bh-skeleton-card" key={item}><span /><span /><span /></div>)}
          </div>
        ) : filteredAdvisors.length === 0 ? (
          <div className="bh-empty">
            <span className="bh-empty-icon"><UserRound size={24} /></span>
            <h3>No psychologists available at the moment</h3>
            <p>{searchQuery || selectedSpecialty || selectedMode ? 'Try clearing your filters to see more professionals.' : 'Please check back shortly or reach out to our team.'}</p>
            {(searchQuery || selectedSpecialty || selectedMode) && (
              <button
                type="button"
                className="bh-text-button cursor-pointer"
                onClick={() => { setSearchQuery(''); setSelectedSpecialty(''); setSelectedMode(''); }}
              >
                Clear filters <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bh-results-line">
              <span>{filteredAdvisors.length} {filteredAdvisors.length === 1 ? 'psychologist' : 'psychologists'}</span>
              <span>Available for online or in-person sessions</span>
            </div>
            <div className="bh-expert-grid">
              {filteredAdvisors.map((advisor) => {
                const nextAvailable = calculateNextAvailable(advisor.availability, advisor.bookedSlots);
                const modeLabels = getModeLabels(advisor.modes, siteSettings);
                const modeSummaryText = modeLabels.length >= 2 ? 'Online & in person' : (modeLabels[0] || 'Online');

                return (
                  <article className="bh-expert-card" key={advisor.id}>
                    <div className="bh-expert-photo">
                      {advisor.photo ? (
                        <img src={advisor.photo} alt={advisor.name} loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <span className="bh-expert-photo-placeholder" aria-hidden="true">{getInitial(advisor.name)}</span>
                      )}
                      <span className="bh-availability-badge">
                        <i aria-hidden="true" />
                        {nextAvailable === 'Unavailable' ? "Check this week's times" : `Next: ${nextAvailable}`}
                      </span>
                    </div>
                    <div className="bh-expert-card-body">
                      <div className="bh-expert-card-top">
                        <div className="bh-expert-heading w-full">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="bh-role-label">{advisor.credential || 'CLINICAL PSYCHOLOGIST'}</span>
                            {advisor.rating && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                ★ {advisor.rating} {advisor.reviews > 0 && <span className="text-slate-400 font-normal">({advisor.reviews})</span>}
                              </span>
                            )}
                          </div>
                          <h3>{advisor.name}</h3>
                          <p className="text-[12px] text-slate-500 font-medium mb-1">{advisor.designation}</p>
                          <span className="bh-verified"><BadgeCheck size={14} aria-hidden="true" />Verified Psychologist</span>
                        </div>
                      </div>

                      {advisor.specialties.length > 0 && (
                        <div className="bh-specialties">
                          {advisor.specialties.slice(0, 3).map((specialty) => <span key={specialty}>{specialty}</span>)}
                        </div>
                      )}

                      {advisor.bio && <p className="bh-expert-bio">{advisor.bio}</p>}

                      <div className="bh-expert-facts">
                        {advisor.years > 0 && <span><BriefcaseBusiness size={14} aria-hidden="true" />{advisor.years} years experience</span>}
                        <span><Camera size={14} aria-hidden="true" />{modeSummaryText}</span>
                      </div>

                      <div className="bh-expert-card-bottom mt-auto pt-3">
                        <div className="bh-expert-price">
                          <span>Session fee</span>
                          <strong>
                            {advisor.fee !== null ? (
                              <>₹{advisor.fee.toLocaleString('en-IN')} <small className="text-[10px] text-slate-400 font-normal">/ session</small></>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600">Standard rate</span>
                            )}
                          </strong>
                        </div>
                        <div className="bh-expert-actions">
                          <button
                            type="button"
                            className="bh-book-button cursor-pointer"
                            onClick={() => onBookTherapist?.(advisor.id)}
                          >
                            View times <ArrowRight size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <p className="bh-trust-note">
          <ShieldCheck size={15} aria-hidden="true" />
          Provider details are verified profiles. Your sessions are private, confidential, and at your pace.
        </p>
      </div>
    </section>
  );
}
