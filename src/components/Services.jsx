import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

export default function Services({ setView, onBookTherapist }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');
  const [showAll, setShowAll] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Reset showAll when search or filter changes
  useEffect(() => {
    setShowAll(false);
  }, [searchTerm, activeFilter, sortBy]);

  const [advisors, setAdvisors] = useState([]);

  useEffect(() => {
    const getDynamicAdvisors = () => {
      // 1. Gather all registered psychologists from behold_users_db
      let registeredPsychologists = [];
      try {
        const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
        registeredPsychologists = users.filter(u => u.role === 'PSYCHOLOGIST' && u.role !== 'ADMIN' && u.email !== 'admin@behold.com' && u.verified !== false)
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (e) {
        console.error("Failed to load registered users", e);
      }

      // 2. Build the final advisors list of newly registered psychologists
      const baseAdvisors = registeredPsychologists.map(psy => {
        return {
          id: psy.id,
          name: psy.name,
          role: 'Consultant Psychologist',
          specialties: ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'],
          hours: 0,
          lang: 'English',
          price: 1200,
          nextAvailable: 'Available Today'
        };
      });

      // 3. Resolve profile details for each advisor dynamically
      const finalAdvisors = baseAdvisors.map(adv => {
        const savedProfile = localStorage.getItem(`behold_advisor_profile_${adv.id}`);
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            const specialtiesArray = typeof profile.specialties === 'string'
              ? profile.specialties.split(',').map(s => s.trim()).filter(Boolean)
              : profile.specialties || adv.specialties;

            return {
              ...adv,
              name: profile.name || adv.name,
              role: profile.role || adv.role,
              specialties: specialtiesArray,
              hours: profile.hours !== undefined && profile.hours !== '' ? Number(profile.hours) : adv.hours,
              lang: profile.lang || adv.lang,
              price: (profile.price !== undefined && profile.price !== '') ? Number(profile.price) : adv.price,
              defaultMeetLink: profile.defaultMeetLink || ''
            };
          } catch (e) {
            console.error("Error parsing profile for advisor", adv.id, e);
          }
        }
        return { ...adv, defaultMeetLink: '' };
      });

      // 4. Dynamically append completed booking hours to advisor hours
      const isSessionCompleted = (booking) => {
        if (booking.status === 'CANCELLED') return false;
        if (booking.status === 'COMPLETED') return true;
        
        if (booking.status === 'CONFIRMED') {
          try {
            const [year, month, day] = booking.date.split('-').map(Number);
            const timeParts = booking.time.split(' ');
            const [hoursStr, minutesStr] = timeParts[0].split(':');
            let hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            const meridiem = timeParts[1];
            
            if (meridiem === 'PM' && hours < 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            
            const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
            return new Date() > sessionEnd;
          } catch (e) {
            console.error("Error checking session completion", e);
          }
        }
        return false;
      };

      try {
        const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
        finalAdvisors.forEach(adv => {
          const completedCount = bookings.filter(b => 
            (b.advisorId && b.advisorId === adv.id) ||
            (b.advisorName && b.advisorName.toLowerCase() === adv.name.toLowerCase())
          ).filter(isSessionCompleted).length;
          adv.hours = adv.hours + completedCount;
        });
      } catch (e) {
        console.error("Failed to dynamically append booking hours to advisors", e);
      }

      return finalAdvisors;
    };

    setAdvisors(getDynamicAdvisors());
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
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Experience') return b.hours - a.hours;
    return 0; // Recommended (default order)
  });

  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-zinc-900 text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-lg glow-glow pointer-events-none" />

      {/* DUAL COUPLING ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch w-full">

        {/* SERVICE 2: CAREER COUNSELLING */}
        <div
          id="card-career"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-zinc-200/60 min-h-[300px] md:min-h-[360px] group rounded-lg"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-zinc-900 text-white px-2.5 py-0.5 rounded-md uppercase tracking-widest font-black font-mono">
                  Career Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-zinc-900 mt-1 group-hover:text-brand transition-colors duration-500">
                  Career Clarity & Direction
                </h3>
                <h4 className="text-xs font-bold text-zinc-400 italic mt-0.5">
                  Feeling Unsure About What’s Next?
                </h4>
              </div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider border border-zinc-200 px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-xs font-mono">
                01
              </span>
            </div>
            <p className="text-zinc-650 font-sans text-xs md:text-sm font-light leading-relaxed">
              Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('career_1'); // Pre-select a career advisor
              } else {
                window.spaNavigate('/booking');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white hover:bg-gradient-brand hover:text-zinc-950 hover:border-transparent border border-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md text-zinc-800"
          >
            Book a Career Guidance Session
          </button>
        </div>

        {/* SERVICE 3: PSYCHOLOGICAL COUNSELLING */}
        <div
          id="card-mental"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-zinc-200/60 min-h-[300px] md:min-h-[360px] group rounded-lg"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-zinc-900 text-white px-2.5 py-0.5 rounded-md uppercase tracking-widest font-black font-mono">
                  Psychological Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-zinc-900 mt-1 group-hover:text-brand transition-colors duration-500">
                  Emotional Wellbeing & Support
                </h3>
                <h4 className="text-xs font-bold text-zinc-400 italic mt-0.5">
                  You Don’t Have to Face It Alone.
                </h4>
              </div>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider border border-zinc-200 px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-xs font-mono">
                02
              </span>
            </div>
            <p className="text-zinc-650 font-sans text-xs md:text-sm font-light leading-relaxed">
              When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('c3'); // Pre-select a personal counsellor
              } else {
                window.spaNavigate('/booking');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white hover:bg-gradient-brand hover:text-zinc-950 hover:border-transparent border border-zinc-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md text-zinc-800"
          >
            Talk to a Counsellor →
          </button>
        </div>

      </div>

      {/* OUR EXPERTS SECTION */}
      <div id="our-experts" className="mt-12 md:mt-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] bg-brand-light text-brand-dark border border-brand/20 px-3.5 py-1 rounded-md uppercase tracking-wider font-extrabold w-fit mx-auto block">
            our experts
          </span>
          <h2 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-zinc-900">
            Meet Our Professionals
          </h2>
          <p className="text-zinc-600 font-sans text-sm font-light max-w-2xl mx-auto">
            Book a personalized session directly with our highly qualified consultant psychologists and career advisors.
          </p>
        </div>

        {/* Dashboard-Style Toolbar */}
        <div className="bg-white/40 backdrop-blur-md border border-zinc-200/50 p-3 sm:p-4 rounded-lg flex flex-col min-[900px]:flex-row gap-3.5 sm:gap-4 w-full shadow-xs">
          {/* Search Box */}
          <div className="relative w-full min-[900px]:max-w-[280px] shrink-0">
            <input 
              type="text" 
              placeholder="Search experts or skills..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3.5 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:border-brand shadow-xs bg-white text-zinc-900 transition hover:border-zinc-300" 
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 sm:top-4" />
          </div>

          {/* Filter Tabs - scrollable horizontally on mobile */}
          <div className="flex flex-row overflow-x-auto scrollbar-none snap-x gap-1.5 sm:gap-2 w-full flex-1 pb-1 shrink-0">
            {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Psychiatrist', 'Career Counsellor'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-xs transition-all duration-300 cursor-pointer shrink-0 snap-start ${
                  activeFilter === filter 
                    ? 'border-brand/40 bg-brand/10 text-brand-dark shadow-xs shadow-brand/10' 
                    : 'border-zinc-200 bg-white text-zinc-650 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {filter === 'All' ? 'All Roles' : filter}
              </button>
            ))}
          </div>

          {/* Sort Selector & Grid/List View Toggles */}
          <div className="flex items-center gap-2 w-full min-[900px]:w-auto shrink-0">
            <div className="relative flex-1 min-[900px]:w-[190px] shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 pr-10 py-2.5 sm:py-3.5 border border-zinc-200 rounded-lg text-xs font-bold bg-white text-zinc-650 focus:outline-none focus:border-brand shadow-xs cursor-pointer appearance-none hover:border-zinc-300 transition-all"
              >
                <option value="Recommended">Sort: Recommended</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Experience">Experience (Most Hours)</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-white shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2.5 sm:p-3.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-900 text-brand' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2.5 sm:p-3.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-zinc-900 text-brand' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Directory Grid / List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {(showAll ? filteredAndSortedAdvisors : filteredAndSortedAdvisors.slice(0, 3)).map(advisor => (
              <div 
                key={advisor.id}
                className="bg-white/80 backdrop-blur-md border border-zinc-200 rounded-lg shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-brand/40 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Profile Card Header */}
                <div className="p-4.5 sm:p-6 flex items-start gap-4 border-b border-zinc-100 bg-gradient-to-br from-white to-zinc-50/50">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-brand/10 border border-brand/20 text-brand-dark flex items-center justify-center font-black text-lg sm:text-xl shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {advisor.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-header font-black text-zinc-900 text-sm sm:text-md leading-tight truncate group-hover:text-brand transition-colors duration-300">
                      {advisor.name}
                    </h4>
                    <span className="inline-block text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold font-mono w-fit">
                      {advisor.role}
                    </span>
                  </div>
                </div>

                {/* Specialties Pills */}
                <div className="p-4.5 sm:px-6 sm:py-4 border-b border-zinc-100 bg-white flex-1 flex flex-col justify-center">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-400 mb-2 block text-left">Specialities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {advisor.specialties.map((spec, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 border border-zinc-100 bg-zinc-50/50 text-[9px] font-semibold text-zinc-650 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="grid grid-cols-3 gap-2 p-4 sm:px-6 sm:py-4 border-b border-zinc-100 bg-zinc-50/30">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">{advisor.hours.toLocaleString()}+</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Therapy hrs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center border-x border-zinc-200">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">{advisor.lang}</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Language</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">₹{advisor.price.toLocaleString('en-IN')}</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Session</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4.5 sm:p-6 bg-white flex flex-col space-y-4 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Availability</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="font-bold text-zinc-700 text-[10px]">{advisor.nextAvailable}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full pt-1">
                    <button 
                      onClick={() => window.spaNavigate(`/advisor/${advisor.id}`)}
                      className="flex-1 py-2.5 sm:py-3 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black text-zinc-900 uppercase tracking-widest transition-all duration-200 cursor-pointer active:scale-95 text-center bg-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        if (onBookTherapist) {
                          onBookTherapist(advisor.id);
                        } else {
                          window.spaNavigate('/booking');
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-2.5 sm:py-3 bg-gradient-brand hover:opacity-95 hover:scale-[1.01] text-zinc-950 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-95 shadow-xs border-none"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(showAll ? filteredAndSortedAdvisors : filteredAndSortedAdvisors.slice(0, 3)).map(advisor => (
              <div 
                key={advisor.id}
                className="bg-white/80 backdrop-blur-md border border-zinc-200 rounded-lg shadow-xs hover:shadow-xl hover:border-brand/40 transition-all duration-300 flex flex-col lg:flex-row items-stretch overflow-hidden group"
              >
                {/* Left Column: Avatar & Name */}
                <div className="p-4.5 sm:p-6 flex items-center gap-4 bg-gradient-to-br from-white to-zinc-50/50 border-b lg:border-b-0 lg:border-r border-zinc-100 flex-1 lg:flex-initial lg:basis-1/4 shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/20 text-brand-dark flex items-center justify-center font-black text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {advisor.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left space-y-1.5 min-w-0">
                    <h4 className="font-header font-black text-zinc-900 text-sm sm:text-md leading-tight truncate group-hover:text-brand transition-colors duration-300">
                      {advisor.name}
                    </h4>
                    <span className="inline-block text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold font-mono w-fit">
                      {advisor.role}
                    </span>
                  </div>
                </div>

                {/* Middle Column: Specialties */}
                <div className="p-4.5 sm:p-6 flex-[2] flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-100 bg-white">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-400 mb-2 block text-left">Specialities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {advisor.specialties.map((spec, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-0.5 border border-zinc-100 bg-zinc-50/50 text-[9px] font-semibold text-zinc-655 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats & Info Panel */}
                <div className="grid grid-cols-3 gap-2 p-4.5 sm:p-6 bg-zinc-50/20 flex-1 lg:flex-initial lg:basis-1/5 shrink-0 items-center justify-center border-b lg:border-b-0 lg:border-r border-zinc-100">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">{advisor.hours.toLocaleString()}+</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Therapy hrs</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center border-x border-zinc-200">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">{advisor.lang}</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Language</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="font-black text-zinc-900 text-xs sm:text-[13px] tracking-tight">₹{advisor.price.toLocaleString('en-IN')}</span>
                    <span className="text-[8px] text-zinc-455 font-bold uppercase tracking-wider mt-0.5">Session</span>
                  </div>
                </div>

                {/* Right Column: Actions */}
                <div className="p-4.5 sm:p-6 bg-white flex-1 lg:flex-initial lg:basis-1/5 shrink-0 flex flex-col justify-center space-y-3.5 mt-auto lg:mt-0">
                  <div className="flex items-center justify-between lg:justify-center gap-2 text-xs">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider lg:hidden">Availability</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="font-bold text-zinc-700 text-[10px]">{advisor.nextAvailable}</span>
                    </div>
                  </div>
                  
                  <div className="flex lg:flex-col gap-2 w-full">
                    <button 
                      onClick={() => window.spaNavigate(`/advisor/${advisor.id}`)}
                      className="flex-1 py-2 sm:py-2.5 border border-zinc-200 hover:border-zinc-900 rounded-lg text-[9px] font-black text-zinc-900 uppercase tracking-widest transition-all duration-200 cursor-pointer active:scale-95 text-center bg-white"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        if (onBookTherapist) {
                          onBookTherapist(advisor.id);
                        } else {
                          window.spaNavigate('/booking');
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-1 py-2 sm:py-2.5 bg-gradient-brand hover:opacity-95 hover:scale-[1.01] text-zinc-955 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer active:scale-95 shadow-xs border-none"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedAdvisors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-400 font-bold text-sm uppercase tracking-wider">No professionals found matching your criteria.</p>
          </div>
        )}
        
        {filteredAndSortedAdvisors.length > 3 && (
          <div className="flex justify-center mt-10">
            <button 
              onClick={() => {
                if (showAll) {
                  setShowAll(false);
                  document.getElementById('our-experts')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setShowAll(true);
                }
              }}
              className="px-8 py-3 bg-white border border-zinc-200 hover:border-zinc-900 text-zinc-900 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
            >
              {showAll ? 'Show less professionals' : 'View more professionals'}
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
