import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function Services({ setView, onBookTherapist }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');

  const ADVISORS_DB = [
    { id: 't1', name: 'Josina Joseph', role: 'Consultant Psychologist', specialties: ['Mental Health Concerns', 'Anger & Emotional Regulation'], hours: 6000, lang: 'Malayalam', price: 1500, nextAvailable: '15 mins' },
    { id: 't2', name: 'Muhammed Niyas S H', role: 'Consultant Psychologist', specialties: ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'], hours: 1000, lang: 'Malayalam', price: 1250, nextAvailable: 'Today at 7:00 PM' },
    { id: 't3', name: 'Jahnavi Navami Rajesh', role: 'Clinical Psychologist', specialties: ['Relationship & Marital Issues', 'Anxiety Stress & Panic'], hours: 250, lang: 'Malayalam', price: 1000, nextAvailable: 'Today at 7:00 PM' },
    { id: 't4', name: 'Hana Anvar M P', role: 'Career Counsellor', specialties: ['Work Career & Academic Concerns', 'Anger & Emotional'], hours: 400, lang: 'Malayalam', price: 1000, nextAvailable: 'Today at 7:00 PM' },
    { id: 't5', name: 'Surbinas Rahman V P', role: 'Psychiatrist', specialties: ['Anxiety & Panic', 'Depression & Mood Concerns', 'Relationship & Marital'], hours: 3000, lang: 'Malayalam', price: 2000, nextAvailable: 'Today at 10:00 PM' },
    { id: 't6', name: 'Mary Santra Tomy', role: 'Consultant Psychologist', specialties: ['Relationship & Marital Issues', 'Self-Esteem & Personal Growth'], hours: 4000, lang: 'Malayalam', price: 1000, nextAvailable: 'Tomorrow at 12:00 AM' }
  ];

  const filteredAndSortedAdvisors = ADVISORS_DB.filter(adv => {
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
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-black text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand/5 rounded-xl glow-glow pointer-events-none" />

      {/* DUAL COUPLING ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch w-full">

        {/* SERVICE 2: CAREER COUNSELLING */}
        <div
          id="card-career"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[300px] md:min-h-[360px] group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-black text-white px-2.5 py-0.5 rounded-xl uppercase tracking-widest font-black font-mono">
                  Career Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                  Career Clarity & Direction
                </h3>
                <h4 className="text-xs font-bold text-black/50 italic mt-0.5">
                  Feeling Unsure About What’s Next?
                </h4>
              </div>
              <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-xl bg-white/50 backdrop-blur-xs font-mono">
                01
              </span>
            </div>
            <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
              Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('career_1'); // Pre-select a career advisor
              } else {
                window.location.hash = '#/booking';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md"
          >
            Book a Career Guidance Session
          </button>
        </div>

        {/* SERVICE 3: PSYCHOLOGICAL COUNSELLING */}
        <div
          id="card-mental"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[300px] md:min-h-[360px] group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-black text-white px-2.5 py-0.5 rounded-xl uppercase tracking-widest font-black font-mono">
                  Psychological Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                  Emotional Wellbeing & Support
                </h3>
                <h4 className="text-xs font-bold text-black/50 italic mt-0.5">
                  You Don’t Have to Face It Alone.
                </h4>
              </div>
              <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-xl bg-white/50 backdrop-blur-xs font-mono">
                02
              </span>
            </div>
            <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
              When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('c3'); // Pre-select a personal counsellor
              } else {
                window.location.hash = '#/booking';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md"
          >
            Talk to a Counsellor →
          </button>
        </div>

      </div>

      {/* OUR EXPERTS SECTION */}
      <div className="mt-12 md:mt-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-xl uppercase tracking-wider font-extrabold w-fit mx-auto block">
            our experts
          </span>
          <h2 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-black">
            Meet Our Professionals
          </h2>
          <p className="text-black/60 font-sans text-sm font-light max-w-2xl mx-auto">
            Book a personalized session directly with our highly qualified consultant psychologists and career advisors.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6 pt-2">
          <div className="relative flex-1 max-w-sm">
            <input 
              type="text" 
              placeholder="Search therapist or specialty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-brand shadow-xs bg-white transition" 
            />
            <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-3.5" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
            {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Psychiatrist', 'Career Counsellor'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition cursor-pointer ${
                  activeFilter === filter 
                    ? 'border-black bg-black text-white' 
                    : 'border-black/10 bg-white text-black/60 hover:border-black/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-black/10 rounded-xl text-xs font-bold bg-white text-black/70 focus:outline-none focus:border-brand shadow-xs cursor-pointer appearance-none"
            >
              <option value="Recommended">Sort: Recommended</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Experience">Experience (Most Hours)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAdvisors.map(advisor => (
            <div 
              key={advisor.id}
              className="bg-white border border-black/10 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group hover:border-brand"
            >
              {/* Top Header - Brand Colored */}
              <div className="bg-brand p-5 flex justify-between items-start border-b border-black/5">
                <div className="flex flex-col">
                  <h4 className="font-extrabold text-black text-[16px] leading-tight">{advisor.name}</h4>
                  <p className="text-[11px] text-black/70 mt-1 font-semibold">{advisor.role}</p>
                </div>
                <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center font-black text-2xl shadow-sm shrink-0 border border-black/5">
                  {advisor.name.charAt(0)}
                </div>
              </div>

              {/* Specializations Pills */}
              <div className="p-4 border-b border-black/5 bg-white">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {advisor.specialties.map((spec, i) => (
                    <span key={i} className="whitespace-nowrap px-3 py-1.5 border border-black/10 rounded-xl bg-black/5 text-[9px] font-bold text-black tracking-wider uppercase">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* View Profile Action */}
              <div className="px-5 py-3 border-b border-black/5 flex justify-end bg-white">
                <button 
                  onClick={() => window.location.hash = `#/advisor/${advisor.id}`}
                  className="px-5 py-1.5 border-2 border-black rounded-xl text-[10px] font-black text-black hover:bg-black hover:text-white transition-colors tracking-widest uppercase cursor-pointer"
                >
                  View Profile
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-black/5 bg-white">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-extrabold text-black text-[13px]">{advisor.hours}+</span>
                  <span className="text-[10px] text-black/50 font-bold mt-0.5 uppercase tracking-wider">Therapy hrs</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-x border-black/5">
                  <span className="font-extrabold text-black text-[13px]">{advisor.lang}</span>
                  <span className="text-[10px] text-black/50 font-bold mt-0.5 uppercase tracking-wider">Languages</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-extrabold text-black text-[13px]">₹{advisor.price.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-black/50 font-bold mt-0.5 uppercase tracking-wider">Per session</span>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="p-5 flex items-center justify-between bg-white mt-auto rounded-b-[4px]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider">Next available in</span>
                  <span className="font-extrabold text-black text-[12px] mt-0.5">{advisor.nextAvailable}</span>
                </div>
                <button
                  onClick={() => {
                    if (onBookTherapist) {
                      onBookTherapist(advisor.id);
                    } else {
                      window.location.hash = '#/booking';
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-colors shadow-xs cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
          
          {filteredAndSortedAdvisors.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
              <p className="text-black/50 font-bold text-sm uppercase tracking-wider">No professionals found matching your criteria.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-white border border-black/10 hover:border-black text-black rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer">
            View more professionals
          </button>
        </div>
      </div>

    </section>
  );
}
