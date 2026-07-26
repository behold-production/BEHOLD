import React, { useState, useEffect } from 'react';
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
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

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
    <section id={sectionId} className="py-12 sm:py-16 bg-[#f7f4ef] text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SERVICES INTRO: UNFOLD WITH BEHOLD ── */}
        {(!mode || mode === 'intro') && (
          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Heading & Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-2">
                    {settings.servicesSectionSub || 'UNFOLD WITH BEHOLD'}
                  </span>
                  <h2 id="services-title" className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold uppercase text-[#1c1514] mb-4 leading-tight tracking-tight">
                    {settings.servicesSectionTitle || 'Comprehensive Care for Your Mind & Future.'}
                  </h2>
                  <p className="text-sm sm:text-base text-[#6e635e] leading-relaxed max-w-lg font-normal mb-6">
                    {settings.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold Aspire brings both pillars into one cohesive mentoring model.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-7 py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-xs"
                  >
                    Explore All Programs
                  </button>
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-7 py-3 bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#d8d0c7] cursor-pointer"
                  >
                    Book a Session
                  </button>
                </div>
              </div>

              {/* Right Column: 2x2 Feature Grid */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:border-l lg:border-[#d6cecb] lg:pl-10">
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-[#1c1514] uppercase mb-1.5">Dual Support Architecture</h4>
                  <p className="text-xs sm:text-sm text-[#6e635e] leading-relaxed">
                    Transition seamlessly between clinical psychologists and career strategists under one unified roof.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-[#1c1514] uppercase mb-1.5">100% Safe & Scientific</h4>
                  <p className="text-xs sm:text-sm text-[#6e635e] leading-relaxed">
                    Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-[#1c1514] uppercase mb-1.5">CIGI-Certified Aptitude Assessment</h4>
                  <p className="text-xs sm:text-sm text-[#6e635e] leading-relaxed">
                    C-DAT evaluations designed for grades 8-12 to align cognitive strengths with career aspirations.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-[#1c1514] uppercase mb-1.5">Holistic Career Roadmapping</h4>
                  <p className="text-xs sm:text-sm text-[#6e635e] leading-relaxed">
                    Comprehensive stream selection, degree guidance, and university planning in one cohesive journey.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── EXPERTS LISTING ── */}
        {(!mode || mode === 'experts') && (
          <div className={mode === 'experts' ? '' : 'pt-10 border-t border-[#d6cecb]'}>
            
            {/* Header */}
            <div className="max-w-3xl mb-10">
              <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-2">
                OUR CLINICAL TEAM
              </span>
              <h2 id="experts-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#1c1514] mb-3 tracking-tight leading-none">
                Meet Our Experts.
              </h2>
              <p className="text-sm sm:text-base text-[#6e635e] font-normal leading-relaxed">
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
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      filter === f
                        ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                        : 'bg-white text-[#6e635e] hover:text-[#1c1514] border-[#d8d0c7] hover:border-[#1c1514]'
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
                  className="w-full px-5 py-2.5 bg-white border border-[#d8d0c7] rounded-full focus:outline-none focus:border-[#1c1514] text-xs font-medium placeholder:text-[#8a7e77]"
                />
              </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#2b211e] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#d6cecb] p-8 shadow-xs">
                <p className="text-lg font-bold text-[#1c1514] uppercase mb-1">No Specialists Found</p>
                <p className="text-xs text-[#6e635e] mb-5">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setFilter('All'); setSearch(''); }}
                  className="px-6 py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  {paginatedAdvisors.map(advisor => (
                    <div
                      key={advisor.id}
                      className="bg-white rounded-3xl border border-[#d6cecb] hover:border-[#1c1514] shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between group transition-all h-full"
                    >
                      {/* Photo or Branded Initial Header */}
                      {advisor.profilePic ? (
                        <div className="h-80 w-full bg-[#eae4dc] overflow-hidden relative shrink-0">
                          <img
                            src={advisor.profilePic}
                            alt={advisor.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-64 w-full bg-[#2b211e] text-[#f7f4ef] flex flex-col items-center justify-center relative shrink-0 p-8 text-center border-b border-[#d6cecb]">
                          <div className="w-20 h-20 rounded-full bg-[#f7f4ef]/10 border border-[#f7f4ef]/20 flex items-center justify-center text-[#f7f4ef] font-sans text-3xl font-black uppercase mb-3 shadow-xs">
                            {(advisor.name || 'C').charAt(0)}
                          </div>
                          <span className="text-xs font-bold tracking-widest text-[#e2dad2] uppercase">
                            Certified Specialist
                          </span>
                        </div>
                      )}

                      {/* Content Box */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                        <div>
                          {/* Name + Price */}
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <h4 className="font-bold text-[#1c1514] text-lg tracking-tight leading-tight truncate">
                              {advisor.name}
                            </h4>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-[#1c1514] text-base">₹{advisor.price?.toLocaleString('en-IN')}</span>
                              <span className="block text-[10px] text-[#8a7e77] font-bold uppercase">Per Session</span>
                            </div>
                          </div>

                          {/* Role */}
                          <p className="text-xs text-[#7c7069] font-semibold mb-3 uppercase tracking-wider">{advisor.role}</p>

                          {/* Bio / Description with Read More Toggle */}
                          {advisor.bio && (
                            <div className="mb-4">
                              <p className={`text-xs text-[#6e635e] leading-relaxed font-normal ${expandedBios[advisor.id] ? '' : 'line-clamp-2'}`}>
                                {advisor.bio}
                              </p>
                              {advisor.bio.length > 70 && (
                                <button
                                  type="button"
                                  onClick={() => toggleBio(advisor.id)}
                                  className="text-[11px] font-bold text-[#1c1514] hover:underline mt-1 cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1 uppercase tracking-wider"
                                >
                                  {expandedBios[advisor.id] ? 'Show Less ↑' : 'Read More ↓'}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Specialties & Categories */}
                          <div className="mb-4">
                            <span className="text-[10px] font-bold tracking-widest text-[#7c7069] uppercase block mb-2">Specialties</span>
                            <div className="flex flex-wrap gap-1.5">
                              {advisor.specialties.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-[#eae4dc] text-[#1c1514] text-[10px] font-bold rounded-full uppercase tracking-wider border border-[#d8d0c7] shadow-2xs hover:bg-[#2b211e] hover:text-[#f7f4ef] transition-all">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Languages */}
                          <p className="text-xs text-[#6e635e] font-normal mb-2">
                            <strong className="font-bold text-[#1c1514]">Language:</strong> {advisor.lang}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 pt-4 border-t border-[#eae4dc]">
                          <button
                            onClick={() => { if (onBookTherapist) onBookTherapist(advisor.id); else window.spaNavigate('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="flex-1 py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer text-center"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => { window.spaNavigate?.(`/advisor/${advisor.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="flex-1 py-3 bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full border border-[#d8d0c7] transition-all cursor-pointer text-center"
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
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                        currentPage === 1
                          ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                          : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                          currentPage === num
                            ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                            : 'bg-white text-[#2b211e] border-[#d8d0c7] hover:border-[#1c1514]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Next Page"
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                        currentPage === totalPages
                          ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                          : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
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
