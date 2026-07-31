import React, { useState, useEffect, useRef } from 'react';
import greenTexture from '../../assets/clarity_bg.png';
import ApiService from '../../shared/services/api';
import { useNavigate } from 'react-router-dom';

const defaultPsychologists = [
  {
    id: '1',
    name: 'Amal',
    designation: 'CONSULTANT PSYCHOLOGIST',
    title: 'Psychologist',
    fee: '10',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    specialties: ['ANXIETY STRESS & PANIC', 'DEPRESSION & MOOD CONCERNS', 'RELATIONSHIP'],
    languages: 'Malayalam, English'
  },
  {
    id: '2',
    name: 'Dr. Ananya Sharma',
    designation: 'SENIOR CLINICAL PSYCHOLOGIST',
    title: 'Clinical Psychologist',
    fee: '500',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    specialties: ['ACADEMIC STRESS & BURNOUT', 'C-DAT CAREER GUIDANCE', 'STUDENT MENTORING'],
    languages: 'English, Malayalam, Hindi'
  },
  {
    id: '3',
    name: 'Rahil V. Nambiar',
    designation: 'CAREER & PSYCHOMETRIC SPECIALIST',
    title: 'Career Guidance Mentor',
    fee: '400',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    specialties: ['APTITUDE EVALUATION', 'STREAM SELECTION', 'GOAL SETTING'],
    languages: 'Malayalam, English'
  },
  {
    id: '4',
    name: 'Sneha K. Roy',
    designation: 'CHILD & ADOLESCENT PSYCHOLOGIST',
    title: 'Child Psychologist',
    fee: '450',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    specialties: ['EMOTIONAL HEALING', 'PARENT COUNSELING', 'ACADEMIC FOCUS'],
    languages: 'English, Malayalam'
  },
  {
    id: '5',
    name: 'Dr. Vikram Patel',
    designation: 'CLINICAL PSYCHIATRIST',
    title: 'Mental Health Expert',
    fee: '600',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
    specialties: ['MOOD DISORDERS', 'TRAUMA RECOVERY', 'CBT THERAPY'],
    languages: 'English, Hindi'
  }
];

export default function TherapistSwipeSection({ onBookTherapist, navigateToSection }) {
  const [advisors, setAdvisors] = useState(defaultPsychologists);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await ApiService.getCounsellors();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((c) => ({
            id: c.id || c._id,
            name: c.name || c.user?.name || c.fullName || 'Psychologist',
            designation: c.designation || c.role || 'CONSULTANT PSYCHOLOGIST',
            title: c.title || c.qualification || 'Psychologist',
            fee: c.fee || c.price || c.consultationFee || '500',
            photo: c.photo || c.avatar || c.profilePicture || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
            specialties: Array.isArray(c.specialties) ? c.specialties : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : ['ANXIETY STRESS & PANIC', 'CAREER GUIDANCE']),
            languages: Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'Malayalam, English')
          }));
          setAdvisors(formatted);
        }
      } catch (err) {
        console.warn('Using default psychologist profiles:', err);
      }
    };
    fetchAdvisors();
  }, []);

  const handleNextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % advisors.length);
  };

  const handlePrevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + advisors.length) % advisors.length);
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
    const total = advisors.length;
    if (total === 0) return 0;
    let diff = (index - currentIndex) % total;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  };

  const getCardStyles = (diff) => {
    switch (diff) {
      case 0:
        return 'translate-x-0 scale-100 opacity-100 z-30 shadow-2xl cursor-default';
      case -1:
        return '-translate-x-[110px] sm:-translate-x-[140px] scale-[0.85] opacity-90 z-20 shadow-xl cursor-pointer hover:scale-[0.88]';
      case 1:
        return 'translate-x-[110px] sm:translate-x-[140px] scale-[0.85] opacity-90 z-20 shadow-xl cursor-pointer hover:scale-[0.88]';
      case -2:
        return '-translate-x-[180px] sm:-translate-x-[220px] scale-[0.65] opacity-0 z-10 pointer-events-none';
      case 2:
        return 'translate-x-[180px] sm:translate-x-[220px] scale-[0.65] opacity-0 z-10 pointer-events-none';
      default:
        // Hide cards that are far away
        if (diff < 0) {
          return '-translate-x-[250px] scale-[0.5] opacity-0 z-0 pointer-events-none';
        } else {
          return 'translate-x-[250px] scale-[0.5] opacity-0 z-0 pointer-events-none';
        }
    }
  };

  const renderCard = (advisor, isCenter) => {
    if (!advisor) return null;
    return (
      <div className={`w-full h-full flex flex-col justify-between overflow-hidden bg-white rounded-xl shadow-2xl border border-slate-200/80 transition-opacity duration-300 ${isCenter ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Top Image Section */}
        <div className="relative w-full h-44 sm:h-52 bg-slate-100 overflow-hidden pointer-events-none">
          <img
            src={advisor.photo}
            alt={advisor.name}
            className="w-full h-full object-cover object-top filter brightness-[1.02]"
          />
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
      className="relative w-full flex items-center justify-center py-16 sm:py-20 lg:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden text-[#0f172a] select-none"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      {/* Background Soft Overlay */}

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* LEFT SIDE: Coverflow Carousel Container + Title */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl overflow-visible">

          <div
            className="relative w-full h-[400px] sm:h-[460px] flex items-center justify-center perspective-[1200px] overflow-visible"
            onMouseDown={(e) => handleTouchStart(e.clientX)}
            onMouseMove={(e) => handleTouchMove(e.clientX)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
          >
            {advisors.map((advisor, index) => {
              const diff = getRelativePosition(index);
              const styleClass = getCardStyles(diff);
              return (
                <div
                  key={advisor.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`absolute w-[260px] sm:w-[300px] h-[380px] sm:h-[440px] transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${styleClass}`}
                >
                  {renderCard(advisor, diff === 0)}
                </div>
              )
            })}
          </div>

          <h2 className="mt-8 font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold tracking-wide text-[#0f172a] drop-shadow-md text-center">
            Meet Our Experts
          </h2>
        </div>

        {/* RIGHT SIDE: Text & Button */}
        <div className="flex-1 flex flex-col items-start text-left space-y-6 sm:space-y-8 max-w-xl">
          <p className="font-['Cormorant_Garamond',serif] text-lg sm:text-xl md:text-2xl text-[#0f172a]/95 font-medium leading-relaxed drop-shadow-sm">
            Sometimes healing begins with a conversation. Whenever you're ready, we'll meet you with understanding, care, and professional support.
          </p>

          <button
            onClick={handleConnectClick}
            className="bg-[#00e5ff] hover:bg-[#00cce6] active:scale-95 transition-all duration-300 text-[#0f172a] font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-base sm:text-lg font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-[#0f172a]/10 cursor-pointer"
          >
            Let's Connect
          </button>
        </div>

      </div>
    </section>
  );
}
