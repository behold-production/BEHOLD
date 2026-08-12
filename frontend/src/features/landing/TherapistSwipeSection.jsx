import React, { useState, useEffect, useRef } from 'react';
import shadeGreenBg from '../../assets/greygreen.png';
import ApiService from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { formatExperience } from '../../utils/formatters';

const getInitial = (name) => {
  if (!name) return 'P';
  const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

export default function TherapistSwipeSection({ onBookTherapist, navigateToSection }) {
  const [advisors, setAdvisors] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_counsellors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });
  const [loading, setLoading] = useState(() => advisors.length === 0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [expandedBios, setExpandedBios] = useState({});

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    const fetchAdvisors = async () => {
      try {
        const res = await ApiService.getCounsellors();
        if (isMounted) {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const formatted = res.data.map((c) => {
              const rawPhoto = c.profilePic || c.photo || c.avatar || c.profilePicture || c.image || c.user?.profilePic;
              const hasValidPhoto = rawPhoto && typeof rawPhoto === 'string' && rawPhoto.trim().length > 0 && !rawPhoto.includes('via.placeholder');
              const expData = formatExperience(c.experience || c.hours || c.completedHours);
              return {
                id: c.id || c._id,
                name: c.name || c.user?.name || c.fullName || 'Psychologist',
                designation: c.designation || c.role || 'Consultant Psychologist',
                title: c.title || c.qualification || 'Psychologist',
                fee: c.fee || c.price || c.consultationFee || '1000',
                hours: expData.rawHours,
                rawYears: expData.rawYears,
                expYears: expData.years,
                bio: c.bio || 'Specializing in compassionate psychological counselling and mental wellbeing.',
                photo: hasValidPhoto ? rawPhoto : null,
                specialties: Array.isArray(c.specialties) ? c.specialties : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : ['Identity Concerns', 'Anxiety Stress & Panic', 'Depression']),
                languages: Array.isArray(c.lang) ? c.lang.join(', ') : (c.lang || (Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'English, Malayalam')))
              };
            });
            setAdvisors(formatted);
            localStorage.setItem('behold_counsellors_cache', JSON.stringify(formatted));
          } else {
            setAdvisors([]);
            localStorage.removeItem('behold_counsellors_cache');
          }
        }
      } catch (err) {
        console.warn('Failed to load counsellors:', err);
        if (isMounted) setAdvisors([]);
      } finally {
        if (isMounted) {
          clearTimeout(timer);
          setLoading(false);
        }
      }
    };
    fetchAdvisors();
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Filtered & Sorted Advisors
  const filteredAdvisors = advisors.filter((advisor) => {
    if (selectedRole === 'CONSULTANT') {
      const match = advisor.designation.toUpperCase().includes('CONSULTANT') || advisor.title.toUpperCase().includes('CONSULTANT');
      if (!match) return false;
    } else if (selectedRole === 'CLINICAL') {
      const match = advisor.designation.toUpperCase().includes('CLINICAL') || advisor.title.toUpperCase().includes('CLINICAL');
      if (!match) return false;
    } else if (selectedRole === 'PSYCHIATRIST') {
      const match = advisor.designation.toUpperCase().includes('PSYCHIATRIST') || advisor.title.toUpperCase().includes('PSYCHIATRIST') || advisor.specialties.some((s) => s.toUpperCase().includes('PSYCHIATRIST'));
      if (!match) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = advisor.name.toLowerCase().includes(q);
      const desigMatch = advisor.designation.toLowerCase().includes(q);
      const titleMatch = advisor.title.toLowerCase().includes(q);
      const specMatch = advisor.specialties.some((s) => s.toLowerCase().includes(q));
      if (!nameMatch && !desigMatch && !titleMatch && !specMatch) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'FEE_LOW') return Number(a.fee) - Number(b.fee);
    if (sortBy === 'FEE_HIGH') return Number(b.fee) - Number(a.fee);
    return 0;
  });

  const displayAdvisors = filteredAdvisors;

  const handleNextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % displayAdvisors.length);
  };

  const handlePrevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + displayAdvisors.length) % displayAdvisors.length);
  };

  // Drag Gesture Handlers
  const handleTouchStart = (clientX) => {
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleTouchMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startXRef.current;
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0) {
        handleNextCard();
      } else {
        handlePrevCard();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleConnectClick = () => {
    const contactEl = document.getElementById('inquiry');
    if (contactEl) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactEl.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    } else {
      navigateToSection?.('contact');
    }
  };

  const getRelativePosition = (index) => {
    const total = displayAdvisors.length;
    if (total === 0) return 0;
    let diff = (index - currentIndex) % total;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  const getCardStyles = (diff) => {
    switch (diff) {
      case 0:
        return 'translate-x-0 scale-100 opacity-100 z-30 shadow-[0_20px_50px_rgba(0,201,214,0.25)] cursor-default brightness-100 rotate-y-0';
      case -1:
        return '-translate-x-[110px] xs:-translate-x-[140px] sm:-translate-x-[190px] md:-translate-x-[220px] lg:-translate-x-[255px] scale-[0.88] -rotate-y-[10deg] opacity-90 z-20 shadow-xl cursor-pointer hover:scale-[0.90] brightness-[0.88]';
      case 1:
        return 'translate-x-[110px] xs:translate-x-[140px] sm:translate-x-[190px] md:translate-x-[220px] lg:translate-x-[255px] scale-[0.88] rotate-y-[10deg] opacity-90 z-20 shadow-xl cursor-pointer hover:scale-[0.90] brightness-[0.88]';
      case -2:
        return '-translate-x-[200px] xs:-translate-x-[260px] sm:-translate-x-[350px] md:-translate-x-[410px] lg:-translate-x-[465px] scale-[0.76] -rotate-y-[18deg] opacity-75 z-10 shadow-lg cursor-pointer hover:scale-[0.78] brightness-[0.70]';
      case 2:
        return 'translate-x-[200px] xs:translate-x-[260px] sm:translate-x-[350px] md:translate-x-[410px] lg:translate-x-[465px] scale-[0.76] rotate-y-[18deg] opacity-75 z-10 shadow-lg cursor-pointer hover:scale-[0.78] brightness-[0.70]';
      default:
        if (diff < 0) {
          return '-translate-x-[350px] scale-[0.6] opacity-0 z-0 pointer-events-none';
        } else {
          return 'translate-x-[350px] scale-[0.6] opacity-0 z-0 pointer-events-none';
        }
    }
  };

  const renderCard = (advisor, isCenter) => {
    if (!advisor) return null;
    return (
      <div className={`w-full h-full flex flex-col overflow-hidden bg-white rounded-[28px] transition-all duration-500 text-left ${isCenter ? 'pointer-events-auto border-[2px] border-[#00c9d6] shadow-[0_12px_36px_rgba(0,201,214,0.25)]' : 'pointer-events-none border border-slate-200/80 shadow-md'}`}>
        
        {/* Top Header Section (Light Primary Teal Background with Full Height Right Image) */}
        <div className="relative w-full h-[110px] sm:h-[125px] p-3.5 sm:p-4 bg-gradient-to-r from-[#bcf4f8] via-[#d7f9fb] to-[#a8eff4] flex items-start justify-between overflow-hidden shrink-0">
          <div className="pr-2 space-y-0.5 z-10 max-w-[62%]">
            <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
              {advisor.name}
            </h3>
            <p className="text-[9.5px] sm:text-[11px] font-semibold text-slate-600 tracking-wider truncate">
              {advisor.designation === 'counsellor' || advisor.designation === 'COUNSELLOR' ? 'Psychologist' : (advisor.designation || 'Consultant Psychologist')}
            </p>
          </div>

          {/* Counsellor Profile Image */}
          <div className="w-[100px] sm:w-[120px] h-[110px] sm:h-[125px] absolute right-2 bottom-0 z-10 flex items-end justify-center pointer-events-none">
            {advisor.photo ? (
              <img
                src={advisor.photo}
                alt={advisor.name}
                className="w-full h-full object-cover object-top filter brightness-[1.02] drop-shadow-sm rounded-t-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/90 shadow-md flex items-center justify-center mb-2 border border-white">
                <span className="font-bold text-xl text-[#00c9d6]">
                  {getInitial(advisor.name)}
                </span>
              </div>
            )}
            <div style={{ display: 'none' }} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/90 shadow-md items-center justify-center mb-2 border border-white">
              <span className="font-bold text-xl text-[#00c9d6]">
                {getInitial(advisor.name)}
              </span>
            </div>
          </div>
        </div>

        {/* White Body Card */}
        <div className="relative z-20 -mt-4 bg-white rounded-t-[22px] rounded-b-[26px] p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 overflow-hidden">
          
          {/* Specialties Tags Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
            {advisor.specialties.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-slate-50 border border-slate-200/80 text-slate-800 text-[9.5px] sm:text-[10.5px] font-semibold rounded-xl whitespace-nowrap shrink-0"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Description Card Box */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs transition-all duration-300">
            <p className={`text-[10.5px] sm:text-xs text-slate-700 italic font-medium leading-relaxed ${expandedBios[advisor.id] ? 'max-h-[100px] overflow-y-auto pr-1 scrollbar-thin' : 'line-clamp-2'}`}>
              "{advisor.bio || 'Specializing in compassionate psychological counselling and mental wellbeing.'}"
            </p>
            {advisor.bio && advisor.bio.length > 45 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }));
                }}
                className="text-[9.5px] sm:text-[10.5px] font-bold text-[#00c9d6] hover:text-[#008b94] hover:underline cursor-pointer mt-1.5 inline-block tracking-wider"
              >
                {expandedBios[advisor.id] ? 'Read Less ▲' : 'Read More ▼'}
              </button>
            )}
          </div>

          {/* 3 Metric Stat Boxes */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-2.5 text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-none">{advisor.rawYears || 3}+</span>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 block mt-1">Yrs Experience</span>
            </div>
            <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-2.5 text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight line-clamp-2">{advisor.languages || 'Malayalam'}</span>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 block mt-1">Languages</span>
            </div>
            <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-2.5 text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-none">₹{advisor.fee <= 899 ? 499 : (advisor.fee >= 1200 ? 699 : Math.round(advisor.fee * 0.5))}</span>
              <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 block mt-1">Starting from</span>
            </div>
          </div>

          {/* Bottom Availability & Action Buttons Row */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 shrink-0">
            <div className="text-left shrink-0">
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 block tracking-wider">Next available</span>
              <span className="text-[10.5px] sm:text-xs font-bold text-slate-900 block mt-0.5 whitespace-nowrap">Available Today</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/advisor/${advisor.id}`);
                }}
                className="px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-300 hover:border-slate-900 text-slate-800 hover:bg-slate-900 hover:text-white rounded-full text-[9.5px] xs:text-[10px] sm:text-[11px] font-bold transition cursor-pointer whitespace-nowrap hover-scale-btn shadow-xs"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBookTherapist) onBookTherapist(advisor.id);
                  else window.spaNavigate?.('/book-session');
                }}
                className="bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 font-bold text-[9.5px] xs:text-[10px] sm:text-[11px] tracking-wider px-3 xs:px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer whitespace-nowrap hover-scale-btn"
              >
                Book Session
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <section
      id="therapists"
      className="relative w-full flex flex-col items-center justify-center py-16 sm:py-20 lg:py-24 px-[15px] sm:px-6 lg:px-10 overflow-hidden text-[#0f172a] select-none"
    >
      {/* Background Image with smooth mask-image fade (no hard cutout lines) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={shadeGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>
      {/* SECTION TOPPER TITLE */}
      <div className="w-full max-w-7xl mx-auto mb-6 sm:mb-8 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#00c9d6] tracking-widest uppercase mb-3">
          <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
          Our Expert Team
          <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
        </span>
        <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-none">
          Meet Our Experts<span className="text-[#00c9d6] font-bold">.</span>
        </h2>
      </div>

      {/* FILTER & SEARCH BAR UNDER MEET OUR EXPERTS */}
      <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 p-3 sm:p-4 flex flex-col gap-3 transition-all duration-300">

        {/* Row 1: Search Input */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 w-full">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
            placeholder="Search experts or skills..."
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none border-none"
          />
        </div>

        {/* Row 2: Role Filter Pills + Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-2">

          {/* Category Role Filter Pills — wrapping on mobile */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: 'CONSULTANT', label: 'Consultant Psychologist' },
              { id: 'CLINICAL', label: 'Clinical Psychologist' },
              { id: 'PSYCHIATRIST', label: 'Psychiatrist' },
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => { setSelectedRole(role.id); setCurrentIndex(0); }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${selectedRole === role.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown — right-aligned, compact */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] sm:text-xs font-bold px-3 py-1.5 pr-7 rounded-full border border-slate-200 outline-none cursor-pointer transition-all"
            >
              <option value="RECOMMENDED">Recommended</option>
              <option value="FEE_LOW">Price: Low → High</option>
              <option value="FEE_HIGH">Price: High → Low</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* FULL WIDTH 5-CARD CAROUSEL & CENTERED UNDER-TEXT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center">

        {/* ── SHIMMER SKELETON while loading from API ── */}
        {loading ? (
          <div className="w-full max-w-6xl mx-auto px-[10px]">
            {/* Skeleton cards row */}
            <div className="flex items-center justify-center gap-4 overflow-hidden h-[410px] sm:h-[470px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 bg-white/80 rounded-3xl border border-slate-200 flex flex-col items-center p-6 gap-4 ${i === 1 ? 'w-[260px] sm:w-[290px] opacity-100 scale-100' : 'w-[220px] sm:w-[250px] opacity-50 scale-90'
                    }`}
                >
                  <div className="shimmer w-24 h-24 rounded-full" />
                  <div className="shimmer h-4 w-3/4 rounded-md" />
                  <div className="shimmer h-3 w-1/2 rounded-md" />
                  <div className="flex gap-2 w-full justify-center">
                    <div className="shimmer h-5 w-20 rounded-full" />
                    <div className="shimmer h-5 w-24 rounded-full" />
                  </div>
                  <div className="shimmer h-10 w-full rounded-xl mt-2" />
                </div>
              ))}
            </div>
          </div>
        ) : displayAdvisors.length === 0 ? (
          <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-sm my-6">
            <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00e5ff]/40 shadow-xs">
              <span className="text-[#00e5ff] text-2xl font-bold">🎓</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">No Psychologists Currently Listed</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mb-6 font-normal">
              Our team of certified psychologists and career mentors is being onboarded. Please check back shortly or connect directly with our support desk.
            </p>
            <button
              onClick={handleConnectClick}
              className="px-8 py-3 bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold text-xs tracking-wider rounded-full transition shadow-md border-none cursor-pointer hover-scale-btn"
            >
              Contact Support Desk
            </button>
          </div>
        ) : (
          <>
            {/* 5-Card Coverflow Carousel Wrapper */}
            <div className="relative w-full max-w-7xl mx-auto">

              {/* Left Floating Navigation Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                aria-label="Previous Psychologist"
                className="absolute -left-2 sm:-left-4 lg:-left-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-slate-800 hover:text-slate-950 hover:bg-[#00c9d6] shadow-xl border border-slate-200/80 transition-all duration-300 cursor-pointer flex items-center justify-center group hover-scale-btn"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Right Floating Navigation Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                aria-label="Next Psychologist"
                className="absolute -right-2 sm:-right-4 lg:-right-8 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-slate-800 hover:text-slate-950 hover:bg-[#00c9d6] shadow-xl border border-slate-200/80 transition-all duration-300 cursor-pointer flex items-center justify-center group hover-scale-btn"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Card Perspective Area */}
              <div
                className="relative w-full max-w-5xl mx-auto h-[415px] sm:h-[465px] flex items-center justify-center [perspective:1000px] overflow-visible"
                onMouseDown={(e) => handleTouchStart(e.clientX)}
                onMouseMove={(e) => handleTouchMove(e.clientX)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
                onTouchEnd={handleTouchEnd}
              >
                {displayAdvisors.map((advisor, index) => {
                  const diff = getRelativePosition(index);
                  const styleClass = getCardStyles(diff);
                  return (
                    <div
                      key={advisor.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`absolute w-[335px] xs:w-[365px] sm:w-[395px] md:w-[410px] h-[395px] sm:h-[445px] rounded-[28px] overflow-hidden transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${styleClass}`}
                    >
                      {renderCard(advisor, diff === 0)}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Text & Button Centered Under Cards - Wider & Balanced Container */}
            <div className="mt-8 sm:mt-12 flex flex-col items-center text-center space-y-5 max-w-2xl mx-auto px-4 sm:px-6">
              <p className="font-sans text-sm sm:text-base md:text-lg text-slate-700 font-normal leading-relaxed">
                Sometimes healing begins with a conversation. Whenever you're ready, we'll meet you with understanding, care, and professional support.
              </p>

              <button
                onClick={handleConnectClick}
                className="bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-semibold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center border-none hover-scale-btn mt-2"
              >
                Let's Connect
              </button>
            </div>

          </>
        )} {/* end loading ternary */}

      </div>
    </section>
  );
}

