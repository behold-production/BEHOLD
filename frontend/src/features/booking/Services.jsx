import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setIsLoading(true);
        const res = await ApiService.getCounsellors();
        if (res.success && res.data) {
          setAdvisors(res.data.map(c => ({
            id: c.id,
            name: c.name,
            profilePic: c.profilePic || '',
            role: c.title || 'Consultant Psychologist',
            specialties: c.specialties?.length > 0 ? c.specialties : ['Anxiety', 'Stress', 'Career'],
            price: c.price || 1200,
            lang: c.lang || 'Malayalam, English',
          })));
        }
      } catch (err) {
        console.error('Failed to load counsellors', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCounsellors();
  }, []);

  const filtered = advisors.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'All' || a.role?.includes(filter);
    return matchSearch && matchFilter;
  });

  const sectionId = mode === 'experts' ? 'counsellors' : 'services';

  return (
    <section id={sectionId} className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SERVICES INTRO: UNFOLD WITH BEHOLD ── */}
        {(!mode || mode === 'intro') && (
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Heading & Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
                    {settings.servicesSectionSub || 'UNFOLD WITH BEHOLD'}
                  </span>
                  <h2 id="services-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                    {settings.servicesSectionTitle || 'Comprehensive Care for Your Mind & Future.'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg font-normal mb-8">
                    {settings.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold Aspire brings both pillars into one cohesive mentoring model.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition shadow-sm border-none cursor-pointer text-sm"
                  >
                    Explore All Programs
                  </button>
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold rounded-lg transition cursor-pointer text-sm"
                  >
                    Book a Session
                  </button>
                </div>
              </div>

              {/* Right Column: 2x2 Feature Grid */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:border-l lg:border-gray-200 lg:pl-10">
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 mb-2">Dual Support Architecture</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Transition seamlessly between clinical psychologists and career strategists under one unified roof.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 mb-2">100% Safe & Scientific</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Backed by CIGI assessment data and strictly private, non-judgmental counseling protocols.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 mb-2">CIGI-Certified Aptitude Assessment</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    C-DAT evaluations designed for grades 8-12 to align cognitive strengths with career aspirations.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-base font-bold text-gray-900 mb-2">Holistic Career Roadmapping</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Comprehensive stream selection, degree guidance, and university planning in one cohesive journey.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── EXPERTS LISTING ── */}
        {(!mode || mode === 'experts') && (
          <div className={mode === 'experts' ? '' : 'pt-20 border-t border-gray-200'}>
            
            {/* Header */}
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
                Our Clinical Team
              </span>
              <h2 id="experts-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Meet Our Experts.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
                Certified professionals dedicated to your wellbeing and career success.
              </p>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
              <div className="flex flex-wrap items-center gap-2">
                {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Career Mentor'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition border cursor-pointer ${
                      filter === f
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    {f === 'All' ? 'All Roles' : f}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-gray-900 text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
              <div className="text-center py-20 text-gray-500 text-sm font-medium">Loading experts...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-gray-200 rounded-lg">
                <p className="text-base font-bold text-gray-900 mb-1">No Specialists Found</p>
                <p className="text-xs text-gray-500 mb-4">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setFilter('All'); setSearch(''); }}
                  className="px-5 py-2 bg-gray-900 text-white rounded text-xs font-semibold border-none cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(advisor => (
                  <div
                    key={advisor.id}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                  >
                    {/* Photo Box */}
                    <div className="h-72 w-full bg-gray-100 overflow-hidden relative">
                      {advisor.profilePic ? (
                        <img
                          src={advisor.profilePic}
                          alt={advisor.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-serif text-5xl font-bold">
                          {advisor.name?.charAt(0) || 'E'}
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name + Price */}
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg tracking-tight leading-tight truncate">
                            {advisor.name}
                          </h4>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-gray-900 text-base">₹{advisor.price.toLocaleString('en-IN')}</span>
                            <span className="block text-[10px] text-gray-400 font-medium uppercase">Per Session</span>
                          </div>
                        </div>

                        {/* Role */}
                        <p className="text-xs text-gray-500 font-medium mb-4">{advisor.role}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {advisor.specialties.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded font-medium">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Languages */}
                        <p className="text-xs text-gray-600 font-normal mb-6">
                          <strong className="font-semibold text-gray-900">Language:</strong> {advisor.lang}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2.5 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => { if (onBookTherapist) onBookTherapist(advisor.id); else window.spaNavigate('/booking'); window.scrollTo({ top: 0 }); }}
                          className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded text-xs transition border-none cursor-pointer text-center"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => { window.spaNavigate?.(`/advisor/${advisor.id}`); window.scrollTo({ top: 0 }); }}
                          className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold rounded text-xs transition cursor-pointer text-center"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
