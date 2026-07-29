import React, { useState, useEffect, useRef } from 'react';
import greenTexture from '../../assets/green_watercolor_texture.png';
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
  }
];

export default function TherapistSwipeSection({ onBookTherapist, navigateToSection }) {
  const [advisors, setAdvisors] = useState(defaultPsychologists);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Transition states for silky-smooth motion
  const [transitionState, setTransitionState] = useState(null); // 'next' | 'prev' | null
  
  // Drag State
  const [dragOffset, setDragOffset] = useState(0);
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
    if (transitionState || advisors.length <= 1) return;
    setTransitionState('next');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % advisors.length);
      setTransitionState(null);
      setDragOffset(0);
    }, 450);
  };

  const handlePrevCard = () => {
    if (transitionState || advisors.length <= 1) return;
    setTransitionState('prev');
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + advisors.length) % advisors.length);
      setTransitionState(null);
      setDragOffset(0);
    }, 450);
  };

  // Drag Gesture Handlers
  const handleTouchStart = (clientX) => {
    if (transitionState) return;
    setIsDragging(true);
    startXRef.current = clientX;
  };

  const handleTouchMove = (clientX) => {
    if (!isDragging || transitionState) return;
    const deltaX = clientX - startXRef.current;
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging || transitionState) return;
    setIsDragging(false);

    if (dragOffset < -40) {
      handleNextCard();
    } else if (dragOffset > 40) {
      handlePrevCard();
    } else {
      setDragOffset(0);
    }
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

  const renderCard = (advisor) => {
    if (!advisor) return null;
    return (
      <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-white rounded-[32px] shadow-2xl border border-slate-200/80">
        {/* Top Image Section */}
        <div className="relative w-full h-48 sm:h-52 bg-slate-100 overflow-hidden pointer-events-none">
          <img
            src={advisor.photo}
            alt={advisor.name}
            className="w-full h-full object-cover object-top filter brightness-[1.02]"
          />
        </div>

        {/* Content Section matching Image 2 */}
        <div className="p-5 flex flex-col space-y-2.5 text-left bg-white">
          
          {/* Row 1: Name & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-xl sm:text-2xl font-bold text-[#0c1424] leading-tight">
              {advisor.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="font-['Outfit',sans-serif] text-lg sm:text-xl font-bold text-[#0c1424] block leading-none">
                ₹{advisor.fee}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                PER SESSION
              </span>
            </div>
          </div>

          {/* Designation */}
          <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest leading-none">
            {advisor.designation}
          </p>

          {/* Title / Sub-category */}
          <p className="text-xs text-slate-500 font-medium leading-none">
            {advisor.title}
          </p>

          {/* SPECIALTIES Header & Tags */}
          <div className="pt-0.5">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              SPECIALTIES
            </span>
            <div className="flex flex-wrap gap-1">
              {advisor.specialties.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100/90 text-slate-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200/80 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Language */}
          <p className="text-xs text-slate-700">
            <strong className="font-bold text-slate-900">Language:</strong> {advisor.languages}
          </p>

          {/* Separator Line */}
          <div className="border-t border-slate-100 my-0.5" />

          {/* Row 2: Action Buttons */}
          <div className="flex items-center gap-3 pt-0.5 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBookTherapist) onBookTherapist(advisor.id);
                else window.spaNavigate?.('/book-session');
              }}
              className="flex-1 bg-[#0c1424] hover:bg-[#1a263d] active:scale-95 text-white text-xs font-bold py-2.5 rounded-full shadow-md transition cursor-pointer text-center uppercase tracking-wider"
            >
              BOOK NOW
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/advisor/${advisor.id}`);
              }}
              className="flex-1 bg-[#f0f4f8] hover:bg-[#e2eaf0] active:scale-95 text-[#0c1424] text-xs font-bold py-2.5 rounded-full border border-slate-200 transition cursor-pointer text-center uppercase tracking-wider"
            >
              VIEW PROFILE
            </button>
          </div>

        </div>
      </div>
    );
  };

  const getAdvisorAt = (offset) => {
    const len = advisors.length;
    if (len === 0) return null;
    return advisors[(currentIndex + offset + len * 100) % len];
  };

  return (
    <section
      id="therapists"
      className="relative w-full flex items-center justify-center py-16 sm:py-20 lg:py-24 px-5 sm:px-10 lg:px-16 overflow-hidden text-white select-none"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#89b26b'
      }}
    >
      {/* Background Soft Overlay */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        
        {/* LEFT SIDE: Straight Upright Stacked Card Deck + "Meet Our Experts" */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl overflow-visible">
          
          {/* Straight Cards Container */}
          <div
            onMouseDown={(e) => handleTouchStart(e.clientX)}
            onMouseMove={(e) => handleTouchMove(e.clientX)}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
            className="relative w-[320px] sm:w-[360px] min-h-[510px] flex items-center justify-center cursor-grab active:cursor-grabbing perspective overflow-visible py-4"
          >
            {/* Left Prev Card (-1) */}
            <div
              onClick={handlePrevCard}
              className={`absolute w-full h-full transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                transitionState === 'prev'
                  ? 'translate-x-0 scale-100 opacity-100 z-30 shadow-2xl'
                  : '-translate-x-[90px] sm:-translate-x-[110px] translate-y-1 scale-[0.88] opacity-80 z-10 hover:opacity-100 hover:scale-[0.90]'
              }`}
              title="Click to view previous expert"
            >
              <div className="w-full h-full rounded-[32px] border-4 border-white/90 bg-[#7ba65a] shadow-xl overflow-hidden pointer-events-none">
                {renderCard(getAdvisorAt(-1))}
              </div>
            </div>

            {/* Right Next Card (+1) (Peeking Halfway Right) */}
            <div
              onClick={handleNextCard}
              className={`absolute w-full h-full transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                transitionState === 'next'
                  ? 'translate-x-0 scale-100 opacity-100 z-30 shadow-2xl'
                  : 'translate-x-[115px] sm:translate-x-[140px] translate-y-0.5 scale-[0.94] opacity-95 z-20 hover:opacity-100 hover:scale-[0.96]'
              }`}
              title="Click to view next expert"
            >
              <div className="w-full h-full rounded-[32px] border-4 border-white bg-[#8bb56d] shadow-2xl overflow-hidden pointer-events-none">
                {renderCard(getAdvisorAt(1))}
              </div>
            </div>

            {/* Deep Layer Right (+2) */}
            <div
              className={`absolute w-full h-full transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                transitionState === 'next'
                  ? 'translate-x-[115px] sm:translate-x-[140px] scale-[0.94] opacity-95 z-20'
                  : 'translate-x-[180px] sm:translate-x-[210px] translate-y-2 scale-[0.85] opacity-70 z-0'
              }`}
            >
              <div className="w-full h-full rounded-[32px] border-4 border-white/80 bg-[#729b52] shadow-md overflow-hidden">
                {renderCard(getAdvisorAt(2))}
              </div>
            </div>

            {/* Active Front Card (0) */}
            <div
              style={
                isDragging && dragOffset !== 0 && !transitionState
                  ? {
                      transform: `translateX(${dragOffset}px)`,
                      transition: 'none'
                    }
                  : {}
              }
              className={`relative w-full h-full z-30 transform transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-[32px] ${
                transitionState === 'next'
                  ? '-translate-x-[130%] opacity-0 scale-95'
                  : transitionState === 'prev'
                  ? 'translate-x-[130%] opacity-0 scale-95'
                  : 'translate-x-0 scale-100 opacity-100 shadow-2xl'
              }`}
            >
              {renderCard(getAdvisorAt(0))}
            </div>

          </div>

          {/* Title Below Deck */}
          <h2 className="mt-8 font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl font-bold tracking-wide text-white drop-shadow-md text-center">
            Meet Our Experts
          </h2>
        </div>

        {/* RIGHT SIDE: Text & Button */}
        <div className="flex-1 flex flex-col items-start text-left space-y-8 max-w-xl">
          <p className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl md:text-4xl text-white/95 font-medium leading-relaxed drop-shadow-sm">
            Sometimes healing begins with a conversation. Whenever you're ready, we'll meet you with understanding, care, and professional support.
          </p>

          <button
            onClick={handleConnectClick}
            className="bg-[#3f9d95] hover:bg-[#338982] active:scale-95 transition-all duration-300 text-white font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-base sm:text-lg font-medium px-8 py-3 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-white/20 cursor-pointer"
          >
            Let's Connect
          </button>
        </div>

      </div>
    </section>
  );
}
