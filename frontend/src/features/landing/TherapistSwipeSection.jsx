import React, { useState, useEffect, useRef } from 'react';
import shadeGreenBg from '../../assets/greygreen.png';
import ApiService from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';

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

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await ApiService.getCounsellors();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((c) => {
            const rawPhoto = c.photo || c.avatar || c.profilePicture || c.image;
            const hasValidPhoto = rawPhoto && typeof rawPhoto === 'string' && !rawPhoto.includes('unsplash.com') && !rawPhoto.includes('via.placeholder') && !rawPhoto.includes('lorempicsum');
            return {
              id: c.id || c._id,
              name: c.name || c.user?.name || c.fullName || 'Psychologist',
              designation: c.designation || c.role || 'CONSULTANT PSYCHOLOGIST',
              title: c.title || c.qualification || 'Psychologist',
              fee: c.fee || c.price || c.consultationFee || '500',
              photo: hasValidPhoto ? rawPhoto : null,
              specialties: Array.isArray(c.specialties) ? c.specialties : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : ['ANXIETY STRESS & PANIC', 'CAREER GUIDANCE']),
              languages: Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'Malayalam, English')
            };
          });
          setAdvisors(formatted);
          localStorage.setItem('behold_counsellors_cache', JSON.stringify(formatted));
        } else {
          setAdvisors([]);
          localStorage.removeItem('behold_counsellors_cache');
        }
      } catch (err) {
        console.warn('Failed to load counsellors:', err);
        setAdvisors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
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
        return 'translate-x-0 scale-100 opacity-100 z-30 shadow-2xl cursor-default brightness-100';
      case -1:
        return '-translate-x-[100px] xs:-translate-x-[130px] sm:-translate-x-[170px] md:-translate-x-[200px] lg:-translate-x-[225px] scale-[0.88] opacity-95 z-20 shadow-xl cursor-pointer hover:scale-[0.90] brightness-[0.75]';
      case 1:
        return 'translate-x-[100px] xs:translate-x-[130px] sm:translate-x-[170px] md:translate-x-[200px] lg:translate-x-[225px] scale-[0.88] opacity-95 z-20 shadow-xl cursor-pointer hover:scale-[0.90] brightness-[0.75]';
      case -2:
        return '-translate-x-[190px] xs:-translate-x-[240px] sm:-translate-x-[320px] md:-translate-x-[380px] lg:-translate-x-[425px] scale-[0.76] opacity-85 z-10 shadow-lg cursor-pointer hover:scale-[0.78] brightness-[0.55]';
      case 2:
        return 'translate-x-[190px] xs:translate-x-[240px] sm:translate-x-[320px] md:translate-x-[380px] lg:translate-x-[425px] scale-[0.76] opacity-85 z-10 shadow-lg cursor-pointer hover:scale-[0.78] brightness-[0.55]';
      default:
        if (diff < 0) {
          return '-translate-x-[300px] scale-[0.6] opacity-0 z-0 pointer-events-none';
        } else {
          return 'translate-x-[300px] scale-[0.6] opacity-0 z-0 pointer-events-none';
        }
    }
  };

  const renderCard = (advisor, isCenter) => {
    if (!advisor) return null;
    return (
      <div className={`w-full h-full flex flex-col justify-between overflow-hidden bg-white rounded-xl shadow-2xl transition-all duration-500 ${isCenter ? 'pointer-events-auto border-2 border-[#00c9d6] shadow-[0_0_24px_rgba(0,201,214,0.45)]' : 'pointer-events-none border border-slate-200/80'}`}>
        {/* Top Image / Initial Badge Section */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-br from-[#00c9d6]/20 via-[#d4f8fc]/40 to-[#00f0ff]/10 flex items-center justify-center overflow-hidden border-b border-slate-100 pointer-events-none">
          {advisor.photo ? (
            <img
              src={advisor.photo}
              alt={advisor.name}
              className="w-full h-full object-cover object-top filter brightness-[1.02]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg border-2 border-white tracking-widest select-none">
              {getInitial(advisor.name)}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex flex-col space-y-2 text-left bg-white h-full justify-between">

          <div>
            {/* Row 1: Name & Price */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-lg sm:text-2xl font-bold text-[#0c1424] leading-tight line-clamp-1">
                {advisor.name}
              </h3>
              <div className="text-right shrink-0">
                <span className="font-['Outfit',sans-serif] text-base sm:text-xl font-bold text-[#0c1424] block leading-none">
                  ₹{advisor.fee}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                  PER SESSION
                </span>
              </div>
            </div>

            {/* Designation */}
            <p className="text-[9px] sm:text-[10.5px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2">
              {advisor.designation}
            </p>

            {/* Title / Sub-category */}
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none mt-1">
              {advisor.title}
            </p>

            {/* SPECIALTIES Header & Tags */}
            <div className="pt-2">
              <span className="text-[8px] sm:text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                SPECIALTIES
              </span>
              <div className="flex flex-wrap gap-1">
                {advisor.specialties.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100/90 text-slate-700 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200/80 uppercase tracking-wider truncate max-w-[120px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Language */}
            <p className="text-[10px] sm:text-xs text-slate-700">
              <strong className="font-bold text-slate-900">Lang:</strong> {advisor.languages}
            </p>

            {/* Separator Line */}
            <div className="border-t border-slate-100" />

            {/* Row 2: Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBookTherapist) onBookTherapist(advisor.id);
                  else window.spaNavigate?.('/book-session');
                }}
                className="flex-1 bg-[#0c1424] hover:bg-[#1a263d] active:scale-95 text-white text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-full shadow-md transition cursor-pointer text-center uppercase tracking-wider"
              >
                BOOK
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/advisor/${advisor.id}`);
                }}
                className="flex-1 bg-[#f0f4f8] hover:bg-[#e2eaf0] active:scale-95 text-[#0c1424] text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-full border border-slate-200 transition cursor-pointer text-center uppercase tracking-wider"
              >
                PROFILE
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
        <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#0f172a] uppercase drop-shadow-md leading-none">
          Meet Our Experts
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
                className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${selectedRole === role.id
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
            <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-wide">No Counsellors Currently Listed</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mb-6 font-normal">
              Our team of certified psychologists and career mentors is being onboarded. Please check back shortly or connect directly with our support desk.
            </p>
            <button
              onClick={handleConnectClick}
              className="px-8 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs tracking-widest uppercase rounded-full transition shadow-md border border-[#00e5ff]/30 cursor-pointer"
            >
              Contact Support Desk
            </button>
          </div>
        ) : (
          <>
            {/* 5-Card Coverflow Carousel Wrapper */}
            <div className="relative w-full max-w-7xl mx-auto">

              {/* Left Floating Navigation Arrow (Outer Screen Margin) */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                aria-label="Previous Psychologist"
                className="absolute left-0 sm:-left-4 lg:-left-8 top-[200px] -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 text-slate-800 hover:text-slate-950 hover:bg-[#00e5ff] shadow-xl border border-slate-200/80 transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center group"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* Right Floating Navigation Arrow (Outer Screen Margin) */}
              <button
                onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                aria-label="Next Psychologist"
                className="absolute right-0 sm:-right-4 lg:-right-8 top-[200px] -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 text-slate-800 hover:text-slate-950 hover:bg-[#00e5ff] shadow-xl border border-slate-200/80 transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center group"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Card Perspective Area */}
              <div
                className="relative w-full max-w-5xl mx-auto h-[410px] sm:h-[470px] flex items-center justify-center perspective-[1200px] overflow-visible"
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
                      className={`absolute w-[280px] xs:w-[320px] sm:w-[350px] md:w-[380px] h-[390px] sm:h-[450px] transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${styleClass}`}
                    >
                      {renderCard(advisor, diff === 0)}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Text & Button Centered Under Cards (Smaller Refined Text Size) */}
            <div className="mt-8 sm:mt-10 flex flex-col items-center text-center space-y-5 max-w-lg px-4">
              <p className="font-sans text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed drop-shadow-xs">
                Sometimes healing begins with a conversation. Whenever you're ready, we'll meet you with understanding, care, and professional support.
              </p>

              <button
                onClick={handleConnectClick}
                className="bg-gradient-to-r from-[#00f0ff] via-[#00e5ff] to-[#00c9d6] hover:from-[#00c9d6] hover:to-[#00f0ff] active:scale-95 text-[#060e20] font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-xs sm:text-sm font-extrabold uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:shadow-[0_0_32px_rgba(0,229,255,0.9)] border border-[#00f0ff]/60 transition-all duration-300 cursor-pointer flex items-center justify-center"
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

