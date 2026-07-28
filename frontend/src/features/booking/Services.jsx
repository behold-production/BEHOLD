import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ApiService from '../../shared/services/api';

const DEFAULT_EXPERTS = [
  {
    id: 'exp-1',
    name: 'Dr. Ananya Ramesh',
    profilePic: '',
    role: 'Clinical Psychologist',
    bio: 'Specializes in adolescent cognitive care, CDAT data evaluation, and stress management with 8+ years of clinical practice.',
    specialties: ['Adolescent Psychology', 'CDAT Evaluation', 'Stress Care'],
    price: 1500,
    lang: 'English, Malayalam',
  },
  {
    id: 'exp-2',
    name: 'Rahul K. Varma',
    profilePic: '',
    role: 'Career Mentor',
    bio: 'CIGI-certified career strategist guiding Class 8-12 students through stream selection, engineering & medical entrance roadmaps.',
    specialties: ['Stream Selection', 'Degree Roadmaps', 'Engineering & Medical'],
    price: 1200,
    lang: 'English, Malayalam, Hindi',
  },
  {
    id: 'exp-3',
    name: 'Fathima Sahla',
    profilePic: '',
    role: 'Consultant Psychologist',
    bio: 'Expert in behavioral therapy, parenting guidance, and relieving exam anxiety for high school & university aspirants.',
    specialties: ['Parenting Guidance', 'Academic Anxiety', 'Behavioral Care'],
    price: 1350,
    lang: 'Malayalam, English',
  }
];

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
  const [advisors, setAdvisors] = useState(DEFAULT_EXPERTS);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBios, setExpandedBios] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const scrollHorizontal = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (!cards || cards.length === 0) return;

      const firstCardWidth = cards[0].offsetWidth;
      const gap = 24;
      const step = firstCardWidth + gap;

      const currentIndex = Math.round(container.scrollLeft / step);
      const targetIndex = direction === 'right'
        ? Math.min(currentIndex + 1, cards.length - 1)
        : Math.max(currentIndex - 1, 0);

      container.scrollTo({
        left: targetIndex * step,
        behavior: 'smooth'
      });
      setActiveCardIndex(targetIndex);
    }
  };

  const handleScrollUpdate = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = container.children;
      if (!cards || cards.length === 0) return;

      const firstCardWidth = cards[0].offsetWidth;
      const gap = 24;
      const step = firstCardWidth + gap;
      const idx = Math.round(container.scrollLeft / step);
      setActiveCardIndex(idx);
    }
  };

  const toggleBio = (id) => {
    setExpandedBios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setIsLoading(true);
        const res = await ApiService.getCounsellors();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAdvisors(res.data.map(c => ({
            id: c.id,
            name: c.name,
            profilePic: c.profilePic || '',
            role: c.title || 'Consultant Psychologist',
            bio: c.bio || c.description || 'Dedicated specialist providing personalized clinical & career guidance.',
            specialties: c.specialties?.length > 0 ? c.specialties : ['Anxiety', 'Stress', 'Career'],
            price: c.price || 1200,
            lang: c.lang || 'Malayalam, English',
          })));
        } else {
          setAdvisors(DEFAULT_EXPERTS);
        }
      } catch (err) {
        console.error('Failed to load counsellors', err);
        setAdvisors(DEFAULT_EXPERTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCounsellors();
  }, []);

  const filtered = advisors.filter(a => {
    const matchSearch = !search.trim() ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'All' || a.role?.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedAdvisors = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const sectionId = mode === 'experts' ? 'counsellors' : 'services';

  return (
    <section id={sectionId} className="py-12 sm:py-16 bg-white text-surface-900 border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SERVICES INTRO: UNFOLD WITH BEHOLD ── */}
        {(!mode || mode === 'intro') && (
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* Left Column: Heading & Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#00e5ff] flex items-center gap-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                    {settings.servicesSectionSub || 'UNFOLD WITH BEHOLD'}
                  </span>
                  <h2 id="services-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-black uppercase text-[#0f172a] mb-4 leading-tight tracking-tight">
                    {settings.servicesSectionTitle || 'Comprehensive Care for Your Mind & Future.'}
                  </h2>
                  <p className="text-sm sm:text-base text-surface-600 leading-relaxed max-w-lg font-normal mb-6">
                    {settings.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold Aspire brings both pillars into one cohesive mentoring model.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-7 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer shadow-xs"
                  >
                    Explore All Programs
                  </button>
                  <button
                    onClick={() => { window.spaNavigate?.('/book-session'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-7 py-3 bg-surface-100 hover:bg-surface-200 text-[#0f172a] font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-surface-200 cursor-pointer"
                  >
                    Book a Session
                  </button>
                </div>
              </div>

              {/* Right Column: 2x2 Feature Grid */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 lg:border-l lg:border-surface-200 lg:pl-10 pt-6 lg:pt-0 border-t lg:border-t-0 border-surface-200">
                <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3 group hover:border-[#00e5ff] transition-all">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase tracking-wide mb-1.5 leading-snug group-hover:text-[#00e5ff] transition-colors">Dual Support Architecture</h4>
                    <p className="text-[11px] sm:text-xs text-surface-600 leading-relaxed font-normal">
                      Transition seamlessly between clinical psychologists and career strategists under one roof.
                    </p>
                  </div>
                  <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                    <span className="text-xl sm:text-2xl font-black text-[#0f172a] font-sans tracking-tight">01</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3 group hover:border-[#00e5ff] transition-all">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase tracking-wide mb-1.5 leading-snug group-hover:text-[#00e5ff] transition-colors">100% Safe & Scientific</h4>
                    <p className="text-[11px] sm:text-xs text-surface-600 leading-relaxed font-normal">
                      Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                    </p>
                  </div>
                  <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                    <span className="text-xl sm:text-2xl font-black text-[#0f172a] font-sans tracking-tight">100%</span>
                  </div>
                </div>

                {/* Card 3: Conditional — C-DAT when aptitude enabled, Personalised Mentoring when disabled */}
                {settings?.enableAptitude !== false ? (
                  <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3 group hover:border-[#00e5ff] transition-all">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase tracking-wide mb-1.5 leading-snug group-hover:text-[#00e5ff] transition-colors">C-DAT Aptitude Assessment</h4>
                      <p className="text-[11px] sm:text-xs text-surface-600 leading-relaxed font-normal">
                        Evaluations designed for grades 8-12 to align cognitive strengths with aspirations.
                      </p>
                    </div>
                    <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                      <span className="text-sm sm:text-base font-black text-[#0f172a] uppercase tracking-wider">C-DAT</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-3 group hover:border-[#00e5ff] transition-all">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0f172a] uppercase tracking-wide mb-1.5 leading-snug group-hover:text-[#00e5ff] transition-colors">Personalised Mentoring Sessions</h4>
                      <p className="text-[11px] sm:text-xs text-surface-600 leading-relaxed font-normal">
                        One-on-one sessions tailored to each student's goals — from stream selection to career clarity.
                      </p>
                    </div>
                    <div className="text-right pt-2 border-t border-surface-100 flex items-center justify-between">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                      <span className="text-sm sm:text-base font-black text-[#0f172a] uppercase tracking-wider">1:1</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#0f172a] text-white shadow-md border border-[#00e5ff]/30 space-y-3">
                  <div>
                    <p className="text-[11px] sm:text-xs text-surface-200 italic leading-relaxed mb-3">
                      "True growth happens when emotional peace and career direction align<span className="text-[#00e5ff] not-italic font-bold">.</span>"
                    </p>
                  </div>
                  <button
                    onClick={() => { window.spaNavigate?.('/book-session'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full py-2 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border-none shadow-2xs text-center"
                  >
                    Book a Session
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── EXPERTS LISTING ── */}
        {(!mode || mode === 'experts') && (
          <div className={mode === 'experts' ? '' : 'pt-10 border-t border-surface-200'}>

            {/* Header */}
            <div className="max-w-3xl mb-10">
              <span className="text-xs font-bold tracking-widest uppercase text-[#00e5ff] flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                OUR CLINICAL TEAM
              </span>
              <h2 id="experts-title" className="text-3xl sm:text-5xl font-sans font-black uppercase text-[#0f172a] mb-3 tracking-tight leading-none">
                Meet Our Experts<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
              </h2>
              <p className="text-sm sm:text-base text-surface-600 font-normal leading-relaxed">
                Certified professionals dedicated to your wellbeing and career success.
              </p>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
              <div className="flex flex-wrap items-center gap-2.5">
                {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Career Mentor'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${filter === f
                        ? 'bg-[#0f172a] text-white border-[#00e5ff] shadow-xs'
                        : 'bg-white text-surface-600 hover:text-[#0f172a] border-surface-200 hover:border-[#00e5ff]'
                      }`}
                  >
                    {f === 'All' ? 'All Roles' : f}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-5 py-2.5 bg-white border border-surface-200 rounded-full focus:outline-none focus:border-[#00e5ff] text-xs font-medium placeholder:text-surface-400"
                />
              </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#0f172a] border-t-[#00e5ff] rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 p-8 shadow-xs">
                <p className="text-lg font-bold text-[#0f172a] uppercase mb-1">No Specialists Found</p>
                <p className="text-xs text-surface-600 mb-5">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setFilter('All'); setSearch(''); }}
                  className="px-6 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Swipe Navigation Controls (<768px) */}
                <div className="flex md:hidden items-center justify-end px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollHorizontal('left')}
                      className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center border border-[#00e5ff]/30 active:scale-95 transition-all p-0 shadow-2xs"
                      aria-label="Previous Expert"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#00e5ff]" />
                    </button>
                    <button
                      onClick={() => scrollHorizontal('right')}
                      className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center border border-[#00e5ff]/30 active:scale-95 transition-all p-0 shadow-2xs"
                      aria-label="Next Expert"
                    >
                      <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
                    </button>
                  </div>
                </div>

                {/* Horizontal 1-by-1 Swipe Carousel on Mobile (<768px) & Grid on Desktop (>=768px) */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScrollUpdate}
                  className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch pb-4 pt-1"
                >
                  {paginatedAdvisors.map(advisor => (
                    <div
                      key={advisor.id}
                      className="bg-white rounded-3xl border border-surface-200 hover:border-[#00e5ff] shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between group transition-all h-full shrink-0 w-full snap-start snap-always md:w-auto md:max-w-none"
                    >
                      {/* Photo or Branded Initial Header */}
                      {advisor.profilePic ? (
                        <div className="h-80 w-full bg-surface-100 overflow-hidden relative shrink-0">
                          <img
                            src={advisor.profilePic}
                            alt={advisor.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-64 w-full bg-[#0f172a] text-white flex flex-col items-center justify-center relative shrink-0 p-8 text-center border-b border-surface-200">
                          <div className="w-20 h-20 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] font-sans text-3xl font-black uppercase mb-3 shadow-xs">
                            {(advisor.name || 'C').charAt(0)}
                          </div>
                          <span className="text-xs font-bold tracking-widest text-[#00e5ff] uppercase">
                            Certified Specialist
                          </span>
                        </div>
                      )}

                      {/* Content Box */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                        <div>
                          {/* Name + Price */}
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <h4 className="font-bold text-[#0f172a] text-lg tracking-tight leading-tight truncate group-hover:text-[#00e5ff] transition-colors">
                              {advisor.name}
                            </h4>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-[#0f172a] text-base">₹{advisor.price?.toLocaleString('en-IN')}</span>
                              <span className="block text-[10px] text-surface-500 font-bold uppercase">Per Session</span>
                            </div>
                          </div>

                          {/* Role */}
                          <p className="text-xs text-surface-500 font-semibold mb-3 uppercase tracking-wider">{advisor.role}</p>

                          {/* Bio / Description with Read More Toggle */}
                          {advisor.bio && (
                            <div className="mb-4">
                              <p className={`text-xs text-surface-600 leading-relaxed font-normal ${expandedBios[advisor.id] ? '' : 'line-clamp-2'}`}>
                                {advisor.bio}
                              </p>
                              {advisor.bio.length > 70 && (
                                <button
                                  type="button"
                                  onClick={() => toggleBio(advisor.id)}
                                  className="text-[11px] font-bold text-[#0f172a] hover:text-[#00e5ff] hover:underline mt-1 cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1 uppercase tracking-wider"
                                >
                                  {expandedBios[advisor.id] ? 'Show Less ↑' : 'Read More ↓'}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Specialties & Categories */}
                          <div className="mb-4">
                            <span className="text-[10px] font-bold tracking-widest text-surface-500 uppercase block mb-2">Specialties</span>
                            <div className="flex flex-wrap gap-1.5">
                              {advisor.specialties.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-surface-50 text-[#0f172a] text-[10px] font-bold rounded-full uppercase tracking-wider border border-surface-200 shadow-2xs hover:bg-[#0f172a] hover:text-[#00e5ff] transition-all">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Languages */}
                          <p className="text-xs text-surface-600 font-normal mb-2">
                            <strong className="font-bold text-[#0f172a]">Language:</strong> {advisor.lang}
                          </p>
                        </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5 pt-4 border-t border-surface-100">
                        <button
                          onClick={() => { if (onBookTherapist) onBookTherapist(advisor.id); else window.spaNavigate('/book-session'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex-1 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full border border-[#00e5ff]/30 transition-all cursor-pointer text-center shadow-xs"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => { window.spaNavigate?.(`/advisor/${advisor.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex-1 py-3 bg-surface-100 hover:bg-surface-200 text-[#0f172a] font-bold text-xs uppercase tracking-widest rounded-full border border-surface-200 transition-all cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === 1
                        ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                        : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      }`}
                  >
                    <ChevronLeft className="w-4 h-4 text-[#00e5ff]" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === num
                          ? 'bg-[#0f172a] text-white border-[#00e5ff] shadow-xs'
                          : 'bg-white text-[#0f172a] border-surface-200 hover:border-[#00e5ff]'
                        }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${currentPage === totalPages
                        ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                        : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                      }`}
                  >
                    <ChevronRight className="w-4 h-4 text-[#00e5ff]" />
                  </button>
                </div>
              )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
