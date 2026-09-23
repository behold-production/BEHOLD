import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/common/SEO";
import { ArrowRight, Search, Calendar, Star, CheckCircle } from 'lucide-react';

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const navigate = useNavigate();

  const handleConnectClick = () => {
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
  };

  return (
    <>
      <SEO 
        title="BEHOLD | Professional Online Therapy & Psychological Counselling" 
        description="A safe space for psychological counselling and mental wellbeing." 
        canonicalUrl="https://www.behold.co.in/"
      />
      <div className="relative min-h-screen bg-glow-gradient grid-bg text-slate-900 font-sans overflow-hidden -mt-[90px] pt-[90px]">
        {/* Background Glows */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00e5ff] rounded-full opacity-[0.08] filter blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-[#00e5ff] rounded-full opacity-[0.05] filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[700px] h-[700px] bg-[#00e5ff] rounded-full opacity-[0.05] filter blur-[120px] pointer-events-none" />
        
        {/* HERO SECTION */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Value Prop */}
          <div className="flex-1 space-y-8 animate-fade-scale">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#00e5ff]/30 bg-white/50 backdrop-blur-md">
              <span className="w-3 h-3 rounded-full bg-[#00e5ff] shadow-sm animate-pulse" />
              <span className="text-sm font-semibold text-[#00e5ff]">The Future of Wellbeing</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
                Transform Your <br />
                <span className="text-transparent bg-whitelip-text bg-[#00e5ff] pb-2 block">Mental Health</span>
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-xl leading-relaxed">
              A personal development and mentoring ecosystem combining psychological care, self-discovery, and career guidance to help you grow with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={handleConnectClick} className="bg-[#00e5ff] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:scale-[1.03] transition-transform flex items-center justify-center gap-3">
                Book Session <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigateToSection ? navigateToSection('services') : navigate('/about')} className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-colors">
                Explore Services
              </button>
            </div>
            
            <div className="pt-10 flex items-center gap-5">
              <div className="flex -space-x-4">
                {[1,2,3,4].map((i, index) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-[3px] border-[#0f172a] flex items-center justify-center text-xs font-bold text-slate-600 ${index === 3 ? 'bg-[#00e5ff] text-slate-900' : 'bg-slate-100'}`}>
                    {index === 3 ? '+2k' : ''}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#00e5ff] mb-1">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs text-slate-600 font-medium">Trusted by thousands daily</p>
              </div>
            </div>
          </div>
          
          {/* Right: UI Canvas Mockup */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative animate-fade-down hidden md:block">
            <div className="bg-white shadow-sm border border-slate-200/60 rounded-[32px] p-8 shadow-md backdrop-blur-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* Top bar mock */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Search className="w-5 h-5 text-slate-600" />
                  <div className="w-40 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="flex gap-3">
                  <div className="w-24 h-10 rounded-xl bg-slate-100" />
                  <div className="w-24 h-10 rounded-xl bg-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
                </div>
              </div>
              
              {/* Card 1 */}
              <div className="bg-slate-100/80 border border-[#00e5ff]/60 rounded-2xl p-5 mb-5 flex items-center gap-5 shadow-[0_0_20px_rgba(0,229,255,0.15)] transform -translate-x-4">
                <div className="w-20 h-20 rounded-xl bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-4 bg-white rounded-full" />
                  <div className="w-1/3 h-3 bg-[#00e5ff] rounded-full" />
                  <div className="w-5/6 h-2.5 bg-slate-600 rounded-full" />
                </div>
                <div className="w-28 h-12 rounded-xl bg-[#00e5ff]" />
              </div>
              
              {/* Card 2 */}
              <div className="bg-white/60 border border-slate-200/80 rounded-2xl p-5 mb-8 flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-4 bg-slate-600 rounded-full" />
                  <div className="w-1/3 h-3 bg-slate-700 rounded-full" />
                  <div className="w-5/6 h-2.5 bg-slate-700 rounded-full" />
                </div>
                <div className="w-28 h-12 rounded-xl bg-slate-100" />
              </div>
              
              {/* Slots Mock */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="w-1/3 h-3 bg-slate-600 rounded-full mb-5" />
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 h-12 bg-slate-100 rounded-xl" />
                  <div className="flex-1 h-12 bg-[#00e5ff]/10 border border-[#00e5ff] rounded-xl" />
                  <div className="flex-1 h-12 bg-slate-100 rounded-xl" />
                </div>
                <div className="w-full h-14 bg-[#00e5ff] rounded-xl" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}