import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';

/* Inline clamp-text helper */
function ReadMore({ text, color = 'text-blue-600' }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p
        className="text-gray-600 leading-relaxed text-sm"
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: open ? 'unset' : 3,
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setOpen(o => !o)}
        className={`mt-1 text-xs font-semibold ${color} bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity`}
      >
        {open ? 'Show less' : 'Read more'}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enablePsychology = settings.enablePsychology !== false;
  const enableCareerMentoring = settings.enableCareerMentoring !== false;

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
            lang: c.lang || 'Malayalam',
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
    <section id={sectionId} className={`py-24 ${mode === 'experts' ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* ── SERVICES INTRO ── */}
        {(!mode || mode === 'intro') && (
          <>
            <div className="text-center mb-12">
              <span className="text-sm font-bold tracking-widest uppercase text-blue-600 block mb-4">
                {settings.servicesSectionSub || 'Our Mentorship Services'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                {settings.servicesSectionTitle || 'Book Your Session'}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {settings.servicesSectionDesc || 'Access expert counselling sessions and lifetime career mentoring.'}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${enableCareerMentoring && enablePsychology ? 'md:grid-cols-2' : ''} gap-6 mb-8`}>
              {enableCareerMentoring && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">{settings.careerBadge || 'Career Mentoring'}</span>
                        <span className="text-xs text-gray-400 font-medium">Lifetime Access</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{settings.careerTitle || 'Career Clarity & Direction'}</h3>
                  <p className="text-gray-500 text-base mb-3 font-medium">{settings.careerSubtitle || "Feeling Unsure About What's Next?"}</p>
                  <ReadMore color="text-blue-600" text={settings.careerDesc || "Whether you're choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions."} />
                  <ul className="space-y-2 mb-8">
                    {['Stream & Degree Selection Guidance', 'Strengths & Aptitude Mapping', 'Personalized Career Roadmap'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                        <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { if (onBookTherapist) onBookTherapist('career_1'); else window.spaNavigate('/booking?service=career'); window.scrollTo({ top: 0 }); }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition border-none cursor-pointer"
                  >
                    {settings.careerBtnText || 'Book Your Mentor'}
                  </button>
                </div>
              )}

              {enablePsychology && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600 block">{settings.counselBadge || 'Psychological Counselling'}</span>
                        <span className="text-xs text-gray-400 font-medium">Confidential & Safe</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{settings.counselTitle || 'Emotional Wellbeing & Support'}</h3>
                  <p className="text-gray-500 text-base mb-3 font-medium">{settings.counselSubtitle || "You Don't Have to Face It Alone."}</p>
                  <ReadMore color="text-pink-600" text={settings.counselDesc || "When stress, anxiety, or personal challenges begin to feel overwhelming, having the right support makes all the difference. Our sessions provide a safe space to heal and grow."} />
                  <ul className="space-y-2 mb-8">
                    {['Stress, Anxiety & Emotional Support', 'Licensed & Experienced Therapists', '100% Private & Non-Judgmental Space'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                        <svg className="w-4 h-4 text-pink-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { if (onBookTherapist) onBookTherapist('psychology_1'); else window.spaNavigate('/booking?service=counselling'); window.scrollTo({ top: 0 }); }}
                    className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition border-none cursor-pointer"
                  >
                    {settings.counselBtnText || 'Book Your Therapist'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── EXPERTS LISTING ── */}
        {(!mode || mode === 'experts') && (
          <div className={mode === 'experts' ? '' : 'mt-20'}>
            <div className="text-center mb-10">
              <span className="text-sm font-bold tracking-widest uppercase text-blue-600 block mb-4">Our Clinical Team</span>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Meet Our Experts</h2>
              <p className="text-xl text-gray-600 max-w-xl mx-auto">Certified professionals dedicated to your wellbeing and career success.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex gap-2 flex-wrap">
                {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Career Mentor'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition border-none cursor-pointer ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                    {f === 'All' ? 'All Roles' : f}
                  </button>
                ))}
              </div>
              <div className="flex-1 md:max-w-xs ml-auto">
                <input
                  type="text" placeholder="Search by name or specialty..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Cards */}
            {isLoading ? (
              <div className="text-center py-16 text-gray-500 text-lg">Loading experts...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Specialists Found</h3>
                <p className="text-gray-500">Try resetting your filters.</p>
                <button onClick={() => { setFilter('All'); setSearch(''); }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold border-none cursor-pointer">Reset Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.slice(0, 6).map(advisor => (
                  <div key={advisor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Top */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl overflow-hidden shrink-0">
                          {advisor.profilePic
                            ? <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                            : advisor.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg leading-tight">{advisor.name}</h4>
                          <p className="text-blue-600 text-sm font-semibold">{advisor.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {advisor.specialties.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
                      <div className="p-4 text-center">
                        <div className="font-black text-lg text-gray-900">₹{advisor.price.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-400 uppercase font-semibold">Per Session</div>
                      </div>
                      <div className="p-4 text-center">
                        <div className="font-black text-lg text-gray-900">{advisor.lang.split(',')[0].trim()}</div>
                        <div className="text-xs text-gray-400 uppercase font-semibold">Language</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 flex gap-3 border-t border-gray-100">
                      <button
                        onClick={() => { window.spaNavigate?.(`/advisor/${advisor.id}`); window.scrollTo({ top: 0 }); }}
                        className="flex-1 py-2.5 border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-semibold rounded-xl text-sm transition bg-transparent cursor-pointer"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => { if (onBookTherapist) onBookTherapist(advisor.id); else window.spaNavigate('/booking'); window.scrollTo({ top: 0 }); }}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition border-none cursor-pointer"
                      >
                        Book Now
                      </button>
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
