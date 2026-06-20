import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, ChevronRight } from 'lucide-react';
import ApiService from '../services/api';

function getInitials(name) {
  if (!name) return 'EX';
  const clean = name.trim();
  if (clean.length === 0) return 'EX';
  if (clean.length === 1) return clean.toUpperCase();
  const first = clean[0];
  const last = clean[clean.length - 1];
  return (first + last).toUpperCase();
}

export default function Services({ setView, onBookTherapist }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [visibleCount, setVisibleCount] = useState(5);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedBios, setExpandedBios] = useState({});

  const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enablePsychology = siteSettings.enablePsychology !== false;

  // Reset visibleCount when search or filter changes
  useEffect(() => {
    setVisibleCount(5);
  }, [searchTerm, activeFilter, sortBy]);

  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setIsLoading(true);
        const res = await ApiService.getCounsellors();
        if (res.success && res.data) {
          const mapped = res.data.map(c => {
            // Map Mongoose/backend fields to expected keys in the UI cards
            return {
              id: c.id,
              name: c.name,
              profilePic: c.profilePic || '',
              role: c.title || 'Consultant Psychologist',
              specialties: c.specialties && c.specialties.length > 0 
                ? c.specialties 
                : ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'],
              hours: c.hours || 0,
              lang: c.lang || 'English, Malayalam',
              price: c.price || 1200,
              nextAvailable: 'Available Today',
              rating: c.rating || 5.0,
              modes: c.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
              isTopFive: c.isTopFive || false,
              bio: c.bio || ''
            };
          });
          setAdvisors(mapped);
        }
      } catch (err) {
        console.error("Failed to load counsellors from backend", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

  const filteredAndSortedAdvisors = advisors.filter(adv => {
    // Search by name or specialty
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      adv.name.toLowerCase().includes(searchLower) || 
      adv.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
      adv.role.toLowerCase().includes(searchLower);

    // Filter by role category
    const matchesFilter = activeFilter === 'All' || adv.role.includes(activeFilter);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Featured Top 5 psychologists always sorted first
    if (a.isTopFive && !b.isTopFive) return -1;
    if (!a.isTopFive && b.isTopFive) return 1;

    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Experience') return b.hours - a.hours;
    return 0; // Recommended (default order)
  });

  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-zinc-900 text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {/* DUAL COUPLING ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch w-full">

        {/* SERVICE 2: CAREER MENTORING */}
        <div
          id="card-career"
          className="relative bg-white/70 backdrop-blur-2xl shadow-[0_12px_36px_-8px_rgba(11,30,54,0.25),0_4px_20px_-2px_rgba(14,165,233,0.15)] hover:shadow-[0_20px_48px_-6px_rgba(11,30,54,0.4),0_8px_30px_-4px_rgba(14,165,233,0.3)] border-[4px] border-[#0b1424] p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group rounded-xl sm:rounded-[2rem] transition-all duration-700 min-h-[300px] md:min-h-[360px] overflow-hidden"
        >
          {/* Decorative inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-sm sm:text-base bg-zinc-900 text-white px-4 py-1.5 rounded-md capitalize font-bold tracking-wide">
                  Career Mentoring
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-header font-bold capitalize tracking-wide text-zinc-900 mt-1 group-hover:text-brand transition-colors duration-500">
                  Career Clarity & Direction
                </h3>
                <h4 className="text-xs font-bold text-zinc-400 italic mt-0.5">
                  Feeling Unsure About What’s Next?
                </h4>
              </div>
              <span className="text-xs text-zinc-400 font-bold capitalize  border border-zinc-200 px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-xs ">
                01
              </span>
            </div>
            <p className="text-zinc-650 font-sans text-xs md:text-sm font-light leading-relaxed">
              Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.
            </p>
          </div>

          {enablePsychology && (
            <button
              type="button"
              onClick={() => {
                if (onBookTherapist) {
                  onBookTherapist('career_1');
                } else {
                  window.spaNavigate('/booking?service=career');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative z-10 min-h-[52px] px-8 py-3.5 bg-zinc-900 text-white hover:bg-gradient-brand hover:text-zinc-955 hover:border-transparent border border-zinc-900 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer w-full sm:w-auto text-center shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Book a Career Mentoring Session
            </button>
          )}
        </div>

        {/* SERVICE 3: PSYCHOLOGICAL COUNSELLING */}
        <div
          id="card-mental"
          className="relative bg-white/70 backdrop-blur-2xl shadow-[0_12px_36px_-8px_rgba(11,30,54,0.25),0_4px_20px_-2px_rgba(14,165,233,0.15)] hover:shadow-[0_20px_48px_-6px_rgba(11,30,54,0.4),0_8px_30px_-4px_rgba(14,165,233,0.3)] border-[4px] border-[#0b1424] p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group rounded-xl sm:rounded-[2rem] transition-all duration-700 min-h-[300px] md:min-h-[360px] overflow-hidden"
        >
          {/* Decorative inner glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-sm sm:text-base bg-zinc-900 text-white px-4 py-1.5 rounded-md capitalize font-bold tracking-wide">
                  Psychological Counselling
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-header font-bold capitalize tracking-wide text-zinc-900 mt-1 group-hover:text-brand transition-colors duration-500">
                  Emotional Wellbeing & Support
                </h3>
                <h4 className="text-xs font-bold text-zinc-400 italic mt-0.5">
                  You Don’t Have to Face It Alone.
                </h4>
              </div>
              <span className="text-xs text-zinc-400 font-bold capitalize  border border-zinc-200 px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-xs ">
                02
              </span>
            </div>
            <p className="text-zinc-650 font-sans text-xs md:text-sm font-light leading-relaxed">
              When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.
            </p>
          </div>

          {enablePsychology && (
            <button
              type="button"
              onClick={() => {
                if (onBookTherapist) {
                  onBookTherapist('c3');
                } else {
                  window.spaNavigate('/booking?service=counselling');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative z-10 min-h-[52px] px-8 py-3.5 bg-zinc-900 text-white hover:bg-gradient-brand hover:text-zinc-955 hover:border-transparent border border-zinc-900 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer w-full sm:w-auto flex justify-center items-center gap-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Talk to a Counsellor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* OUR EXPERTS SECTION */}
      <div id="our-experts" className="mt-12 md:mt-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs bg-brand-light text-brand-dark border border-brand/20 px-3.5 py-1 rounded-full uppercase tracking-wider font-bold w-fit mx-auto block">
            Our Experts
          </span>
          <h2 className="text-2xl md:text-3xl font-header font-bold tracking-tight text-zinc-900">
            Meet Our Professionals
          </h2>
          <p className="text-zinc-600 font-sans text-sm font-light max-w-2xl mx-auto">
            Book a personalized session directly with our highly qualified consultant psychologists and career advisors.
          </p>
        </div>

        {/* Dashboard-Style Toolbar */}
        <div className="bg-white border border-zinc-200 p-3 sm:p-4 rounded-lg lg:rounded-2xl flex flex-col xl:flex-row xl:items-center gap-3 sm:gap-4 w-full shadow-[0_12px_36px_-8px_rgba(9,14,26,0.22),0_4px_20px_-2px_rgba(0,209,209,0.08)] hover:shadow-[0_20px_48px_-6px_rgba(9,14,26,0.30),0_8px_30px_-4px_rgba(0,209,209,0.16)] hover:border-brand/30 transition-all duration-300">
          {/* Search Box */}
          <div className="relative w-full xl:w-[260px] shrink-0">
            <input
              type="text"
              placeholder="Search experts or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 min-h-[44px] border border-zinc-200 rounded-xl text-sm font-bold focus:outline-none focus:border-brand shadow-xs bg-zinc-50 text-zinc-900 transition hover:border-zinc-300"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Tabs - scrollable horizontally on all sizes if needed */}
          <div className="flex flex-row overflow-x-auto scrollbar-none snap-x gap-2 w-full flex-1 pb-1 xl:pb-0 min-w-0">
            {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Psychiatrist', 'Career Mentor'].map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center justify-center gap-1.5 px-4 min-h-[44px] border rounded-xl text-sm font-bold whitespace-nowrap shadow-xs transition-all duration-300 cursor-pointer shrink-0 snap-start ${
                  activeFilter === filter
                    ? 'border-brand/40 bg-brand/10 text-brand-dark shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-650 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {filter === 'All' ? 'All Roles' : filter}
              </button>
            ))}
          </div>

          {/* Sort Selector & Grid/List View Toggles */}
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full xl:w-auto shrink-0">
            <div className="relative flex-1 sm:w-[200px] shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 pr-10 min-h-[44px] border border-zinc-200 rounded-xl text-sm font-bold bg-white text-zinc-650 focus:outline-none focus:border-brand shadow-xs cursor-pointer appearance-none hover:border-zinc-300 transition-all"
              >
                <option value="Recommended">Sort: Recommended</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Experience">Experience (Most Hours)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="flex border border-zinc-200 rounded-xl overflow-hidden bg-white shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`w-11 h-11 transition-colors cursor-pointer flex items-center justify-center ${viewMode === 'grid' ? 'bg-zinc-900 text-brand' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`w-11 h-11 transition-colors cursor-pointer flex items-center justify-center ${viewMode === 'list' ? 'bg-zinc-900 text-brand' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Directory Grid / List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="bg-white border border-zinc-200 rounded-lg lg:rounded-2xl shadow-[0_12px_36px_-8px_rgba(9,14,26,0.15)] flex flex-col overflow-hidden animate-pulse min-h-[300px]"
              >
                <div className="p-5 sm:p-6 flex items-start gap-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-200" />
                  <div className="flex flex-col flex-1 space-y-3 pt-2">
                    <div className="h-5 bg-zinc-200 rounded w-3/4" />
                    <div className="h-4 bg-zinc-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center space-y-3 border-b border-zinc-100">
                  <div className="h-3 bg-zinc-200 rounded w-1/4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-zinc-100 rounded w-20" />
                    <div className="h-6 bg-zinc-100 rounded w-24" />
                    <div className="h-6 bg-zinc-100 rounded w-16" />
                  </div>
                </div>
                <div className="p-5 bg-white flex flex-col mt-auto space-y-4">
                  <div className="h-3 bg-zinc-200 rounded w-1/3" />
                  <div className="flex gap-2 w-full pt-1">
                    <div className="h-10 bg-zinc-100 rounded-xl flex-1" />
                    <div className="h-10 bg-zinc-200 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedAdvisors.slice(0, visibleCount).map(advisor => (
              <div 
                key={advisor.id}
                className="bg-white border border-zinc-200/80 rounded-lg lg:rounded-2xl shadow-[0_12px_36px_-8px_rgba(9,14,26,0.28),0_4px_20px_-2px_rgba(0,209,209,0.12)] hover:shadow-[0_20px_48px_-6px_rgba(9,14,26,0.38),0_8px_30px_-4px_rgba(0,209,209,0.22)] hover:-translate-y-1 hover:border-brand/40 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Profile Card Header */}
                <div className="p-5 sm:p-6 flex items-start gap-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50/50 to-white">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand/10 text-brand-dark flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {advisor.profilePic ? (
                      <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(advisor.name)
                    )}
                  </div>
                  <div className="flex flex-col text-left space-y-1 flex-1 min-w-0 pt-1">
                    <h4 className="font-header font-bold text-zinc-900 text-lg sm:text-xl leading-tight truncate group-hover:text-brand transition-colors duration-300">
                      {advisor.name}
                    </h4>
                    <span className="inline-block text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-medium w-fit">
                      {advisor.role}
                    </span>
                  </div>
                </div>

                {/* Bio Block */}
                <div className="px-5 sm:px-6 pt-4 flex items-start justify-between gap-2 text-xs text-zinc-500 font-light w-full">
                  <span className={`italic flex-1 min-w-0 ${expandedBios[advisor.id] ? '' : 'line-clamp-2'}`}>
                    "{advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.'}"
                  </span>
                  {(advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.').length > 100 && (
                    <button
                      onClick={() => setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                      className="text-brand font-semibold hover:underline shrink-0 bg-transparent border-none p-0 cursor-pointer text-xs mt-0.5"
                    >
                      {expandedBios[advisor.id] ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>

                {/* Specialties Pills */}
                <div className="p-5 sm:p-6 border-b border-zinc-100 bg-white flex-1 flex flex-col justify-center">
                  <span className="text-xs font-medium text-zinc-400 mb-2.5 block text-left uppercase tracking-wider">Specialties</span>
                  <div className="flex flex-wrap gap-2">
                    {advisor.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-3 gap-0 p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/50 divide-x divide-zinc-200">
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight">{advisor.hours.toLocaleString()}+</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">Therapy hrs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight truncate max-w-full">{advisor.lang}</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">Language</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center px-2">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight">₹{advisor.price.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">Per session</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 sm:p-6 bg-white flex flex-col space-y-4 mt-auto">
                  {enablePsychology && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-medium">Next available</span>
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-medium text-emerald-700 text-[11px] sm:text-xs">{advisor.nextAvailable}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2.5 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => window.spaNavigate(`/advisor/${advisor.id}`)}
                      className={`min-h-[44px] py-2.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 transition-all duration-200 cursor-pointer active:scale-95 text-center bg-white flex items-center justify-center ${enablePsychology ? 'flex-1' : 'w-full'}`}
                    >
                      View Profile
                    </button>
                    {enablePsychology && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onBookTherapist) {
                            onBookTherapist(advisor.id);
                          } else {
                            window.spaNavigate('/booking');
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 min-h-[44px] py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm border-none flex items-center justify-center"
                      >
                        Book Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAndSortedAdvisors.slice(0, visibleCount).map(advisor => (
              <div 
                key={advisor.id}
                className="bg-white border border-zinc-200/80 rounded-lg lg:rounded-2xl shadow-[0_12px_36px_-8px_rgba(9,14,26,0.28),0_4px_20px_-2px_rgba(0,209,209,0.12)] hover:shadow-[0_20px_48px_-6px_rgba(9,14,26,0.38),0_8px_30px_-4px_rgba(0,209,209,0.22)] hover:border-brand/40 transition-all duration-300 flex flex-col lg:flex-row items-stretch overflow-hidden group"
              >
                {/* Left Column: Avatar & Name */}
                <div className="p-5 sm:p-6 flex items-center gap-4 bg-gradient-to-br from-zinc-50/50 to-white border-b lg:border-b-0 lg:border-r border-zinc-100 flex-1 lg:flex-initial lg:basis-[28%] shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand/10 text-brand-dark flex items-center justify-center font-bold text-xl sm:text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {advisor.profilePic ? (
                      <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(advisor.name)
                    )}
                  </div>
                  <div className="flex flex-col text-left space-y-1 min-w-0">
                    <h4 className="font-header font-bold text-zinc-900 text-lg sm:text-xl leading-tight truncate group-hover:text-brand transition-colors duration-300">
                      {advisor.name}
                    </h4>
                    <span className="inline-block text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-medium w-fit">
                      {advisor.role}
                    </span>
                  </div>
                </div>

                {/* Middle Column: Specialties & Bio */}
                <div className="p-5 sm:p-6 flex-[2] flex flex-col justify-center gap-3 border-b lg:border-b-0 lg:border-r border-zinc-100 bg-white">
                  <div>
                    <span className="text-xs font-medium text-zinc-400 mb-1.5 block text-left uppercase tracking-wider">Specialties</span>
                    <div className="flex flex-wrap gap-2">
                      {advisor.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-600 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-xs text-zinc-500 font-light w-full">
                    <span className={`italic flex-1 min-w-0 ${expandedBios[advisor.id] ? '' : 'line-clamp-2'}`}>
                      "{advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.'}"
                    </span>
                    {(advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.').length > 100 && (
                      <button
                        onClick={() => setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                        className="text-brand font-semibold hover:underline shrink-0 bg-transparent border-none p-0 cursor-pointer text-xs mt-0.5"
                      >
                        {expandedBios[advisor.id] ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats & Info Panel */}
                <div className="grid grid-cols-3 lg:flex lg:flex-col lg:items-start lg:justify-center gap-0 lg:gap-3 p-0 sm:p-0 lg:p-6 bg-zinc-50/50 flex-1 lg:flex-initial lg:basis-[20%] shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-100 divide-x divide-zinc-200 lg:divide-x-0">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 sm:gap-1.5 text-center lg:text-left w-full py-4 lg:py-0 px-2 lg:px-0">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight">{advisor.hours.toLocaleString()}+</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium lg:font-medium">therapy hrs</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 sm:gap-1.5 text-center lg:text-left w-full py-4 lg:py-0 px-2 lg:px-0">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight truncate max-w-full">{advisor.lang}</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium lg:font-medium">language</span>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 sm:gap-1.5 text-center lg:text-left w-full py-4 lg:py-0 px-2 lg:px-0">
                    <span className="font-bold text-zinc-900 text-sm sm:text-base tracking-tight">₹{advisor.price.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 font-medium lg:font-medium">/ session</span>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="p-5 sm:p-6 bg-white flex-1 lg:flex-initial lg:basis-[22%] shrink-0 flex flex-col justify-center space-y-4 mt-auto lg:mt-0">
                  {enablePsychology && (
                    <div className="flex items-center justify-between lg:justify-center gap-2">
                      <span className="text-xs text-zinc-500 font-medium lg:hidden">Next available</span>
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 lg:w-full lg:justify-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                        <span className="font-medium text-emerald-700 text-[11px] sm:text-xs text-center">{advisor.nextAvailable}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex lg:flex-col gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => window.spaNavigate(`/advisor/${advisor.id}`)}
                      className={`min-h-[44px] py-2.5 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 transition-all duration-200 cursor-pointer active:scale-95 text-center bg-white flex items-center justify-center ${enablePsychology ? 'flex-1' : 'w-full lg:w-full'}`}
                    >
                      View Profile
                    </button>
                    {enablePsychology && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onBookTherapist) {
                            onBookTherapist(advisor.id);
                          } else {
                            window.spaNavigate('/booking');
                          }
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 min-h-[44px] py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm border-none flex items-center justify-center"
                      >
                        Book Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredAndSortedAdvisors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 font-bold text-sm capitalize ">No professionals found matching your criteria.</p>
          </div>
        )}
        
        {!isLoading && filteredAndSortedAdvisors.length > visibleCount && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => {
                setVisibleCount(prev => prev + 5);
              }}
              className="px-8 min-h-[48px] py-3 bg-white border border-zinc-200 hover:border-zinc-900 hover:text-brand-dark text-zinc-900 rounded-lg text-xs font-bold  capitalize transition-colors shadow-xs cursor-pointer"
            >
              Load More Professionals
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
