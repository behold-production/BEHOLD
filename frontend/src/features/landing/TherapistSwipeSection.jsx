import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, ArrowUpRight } from 'lucide-react';
import ApiService from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function TherapistSwipeSection({ onOpenBooking }) {
  const navigate = useNavigate();
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getPublicCounsellors({ limit: 4 })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCounsellors(res.data);
        }
      })
      .catch((err) => console.warn('Failed to fetch public counsellors:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = () => {
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
  };

  return (
    <section id="experts" className="relative z-10 w-full py-24 sm:py-32 bg-slate-50 overflow-hidden font-sans border-y border-slate-100">
      
      {/* Background graphic elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00e5ff]/5 rounded-full filter blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00e5ff]/5 rounded-full filter blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Meet Our <span className="text-[#00e5ff]">Experts.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Highly qualified, empathetic professionals dedicated to guiding you through life’s toughest challenges.
            </p>
          </div>
          <button 
            onClick={handleBook}
            className="group flex items-center gap-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:border-[#00e5ff]/50 hover:shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            See All Therapists 
            <ArrowRight className="w-4 h-4 text-[#00e5ff] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Therapist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {loading ? (
            // Skeletons
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse flex flex-col h-[340px]">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 mb-6" />
                <div className="w-3/4 h-5 bg-slate-100 rounded-full mb-3" />
                <div className="w-1/2 h-4 bg-slate-100 rounded-full mb-6" />
                <div className="mt-auto w-full h-12 bg-slate-100 rounded-xl" />
              </div>
            ))
          ) : counsellors.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-medium">Experts will be listed here soon.</p>
            </div>
          ) : (
            counsellors.slice(0, 4).map((c) => (
              <div 
                key={c._id} 
                className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,229,255,0.15)] hover:border-[#00e5ff]/30 transition-all duration-300 flex flex-col hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Subtle top gradient line on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00b2be] to-[#00e5ff] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner group-hover:shadow-md transition-shadow">
                    {c.profilePic ? (
                      <img src={c.profilePic} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">
                        {c.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Star className="w-3.5 h-3.5 fill-[#00e5ff] text-[#00e5ff]" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-[#00e5ff] transition-colors line-clamp-1">
                    {c.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-[11px] line-clamp-1">
                    {c.specialization || 'Clinical Psychologist'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(c.languages || ['English', 'Malayalam']).slice(0, 2).map((lang, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                  {c.languages?.length > 2 && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                      +{c.languages.length - 2}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">
                    ₹{c.price || '999'}<span className="text-xs text-slate-500 font-medium font-sans">/session</span>
                  </span>
                  <button 
                    onClick={handleBook}
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-[#00e5ff] group-hover:border-[#00e5ff] group-hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
