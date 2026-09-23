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
      <div className="relative min-h-screen bg-glow-gradient grid-bg text-white font-sans overflow-hidden -mt-[90px] pt-[90px]">
        {/* Background Glows */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00e5ff] rounded-full opacity-[0.08] filter blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-[#00e5ff] rounded-full opacity-[0.05] filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[700px] h-[700px] bg-[#00e5ff] rounded-full opacity-[0.05] filter blur-[120px] pointer-events-none" />
        
        {/* HERO SECTION */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Value Prop */}
          <div className="flex-1 space-y-8 animate-fade-scale">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#00e5ff]/30 bg-slate-900/50 backdrop-blur-md">
              <span className="w-3 h-3 rounded-full bg-[#00e5ff] filter-glow animate-pulse" />
              <span className="text-sm font-semibold text-[#00e5ff]">The Future of Wellbeing</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
                Transform Your <br />
                <span className="text-transparent bg-clip-text primary-cyan-gradient pb-2 block">Mental Health</span>
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
              A personal development and mentoring ecosystem combining psychological care, self-discovery, and career guidance to help you grow with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={handleConnectClick} className="primary-cyan-gradient text-slate-950 px-8 py-4 rounded-2xl font-bold text-lg filter-glow hover:scale-[1.03] transition-transform flex items-center justify-center gap-3">
                Book Session <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => navigateToSection ? navigateToSection('services') : navigate('/about')} className="bg-slate-900 border border-slate-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors">
                Explore Services
              </button>
            </div>
            
            <div className="pt-10 flex items-center gap-5">
              <div className="flex -space-x-4">
                {[1,2,3,4].map((i, index) => (
                  <div key={i} className={`w-12 h-12 rounded-full border-[3px] border-[#0f172a] flex items-center justify-center text-xs font-bold text-slate-400 ${index === 3 ? 'bg-[#00e5ff] text-slate-900' : 'bg-slate-800'}`}>
                    {index === 3 ? '+2k' : ''}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#00e5ff] mb-1">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Trusted by thousands daily</p>
              </div>
            </div>
          </div>
          
          {/* Right: UI Canvas Mockup */}
          <div className="flex-1 w-full max-w-xl lg:max-w-none relative animate-fade-down hidden md:block">
            <div className="card-grad-gradient border border-slate-700/60 rounded-[32px] p-8 filter-card-shadow backdrop-blur-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* Top bar mock */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Search className="w-5 h-5 text-slate-500" />
                  <div className="w-40 h-3 bg-slate-800 rounded-full" />
                </div>
                <div className="flex gap-3">
                  <div className="w-24 h-10 rounded-xl bg-slate-800" />
                  <div className="w-24 h-10 rounded-xl primary-cyan-gradient shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
                </div>
              </div>
              
              {/* Card 1 */}
              <div className="bg-slate-800/80 border border-[#00e5ff]/60 rounded-2xl p-5 mb-5 flex items-center gap-5 shadow-[0_0_20px_rgba(0,229,255,0.15)] transform -translate-x-4">
                <div className="w-20 h-20 rounded-xl bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-4 bg-white rounded-full" />
                  <div className="w-1/3 h-3 bg-[#00e5ff] rounded-full" />
                  <div className="w-5/6 h-2.5 bg-slate-600 rounded-full" />
                </div>
                <div className="w-28 h-12 rounded-xl primary-cyan-gradient" />
              </div>
              
              {/* Card 2 */}
              <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-5 mb-8 flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-4 bg-slate-600 rounded-full" />
                  <div className="w-1/3 h-3 bg-slate-700 rounded-full" />
                  <div className="w-5/6 h-2.5 bg-slate-700 rounded-full" />
                </div>
                <div className="w-28 h-12 rounded-xl bg-slate-800" />
              </div>
              
              {/* Slots Mock */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
                <div className="w-1/3 h-3 bg-slate-600 rounded-full mb-5" />
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 h-12 bg-slate-800 rounded-xl" />
                  <div className="flex-1 h-12 bg-[#00e5ff]/10 border border-[#00e5ff] rounded-xl" />
                  <div className="flex-1 h-12 bg-slate-800 rounded-xl" />
                </div>
                <div className="w-full h-14 primary-cyan-gradient rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-20 space-y-6">
            <div className="w-48 h-3 bg-[#00e5ff]/80 rounded-full mx-auto" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">Our Specialized Services</h2>
            <div className="w-64 h-2 bg-slate-800 rounded-full mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="card-grad-gradient border border-slate-700/80 rounded-[32px] p-10 filter-card-shadow hover:-translate-y-3 transition-all duration-500 hover:border-[#00e5ff]/50 hover:shadow-[0_15px_40px_-10px_rgba(0,229,255,0.2)]">
                <div className="w-20 h-20 bg-[#00e5ff]/10 rounded-2xl border border-[#00e5ff]/30 flex items-center justify-center mb-10">
                  {i === 1 && <Search className="w-10 h-10 text-[#00e5ff]" />}
                  {i === 2 && <Star className="w-10 h-10 text-[#00e5ff]" />}
                  {i === 3 && <CheckCircle className="w-10 h-10 text-[#00e5ff]" />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  {i === 1 ? 'Psychological Care' : i === 2 ? 'Career Mentoring' : 'Aptitude Tests'}
                </h3>
                <div className="space-y-4 mb-10">
                  <div className="w-full h-3 bg-slate-700 rounded-full" />
                  <div className="w-5/6 h-3 bg-slate-700 rounded-full" />
                  <div className="w-4/6 h-3 bg-slate-700 rounded-full" />
                </div>
                <div className="pt-8 border-t border-slate-700/50">
                  <div className="w-32 h-3 bg-[#00e5ff] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* DETAILED BOOKING FLOW PROTOTYPE SECTION */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-24 hidden lg:block">
          <div className="bg-[#090d16] border border-slate-700/50 rounded-[40px] p-12 filter-card-shadow">
            {/* Header */}
            <div className="flex justify-between items-center mb-16">
              <div>
                <div className="w-72 h-8 bg-white rounded-xl mb-5" />
                <div className="w-96 h-3 bg-slate-700 rounded-full" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full primary-cyan-gradient" />
                <div className="w-20 h-1 bg-[#00e5ff]" />
                <div className="w-10 h-10 rounded-full border-[3px] border-[#00e5ff] bg-slate-900" />
                <div className="w-20 h-1 bg-slate-700" />
                <div className="w-10 h-10 rounded-full border-[3px] border-slate-700 bg-slate-900" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Col 1 */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-[32px] p-8">
                <div className="w-40 h-3 bg-slate-500 rounded-full mb-6" />
                <div className="w-full h-16 bg-slate-800 rounded-2xl mb-10" />
                <div className="w-32 h-3 bg-slate-500 rounded-full mb-6" />
                <div className="w-full h-16 bg-slate-800 rounded-2xl mb-10" />
                <div className="w-full h-64 bg-slate-800/50 border border-slate-700/50 rounded-3xl flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-slate-600" />
                </div>
              </div>
              {/* Col 2 */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-[32px] p-8 space-y-8">
                <div className="bg-slate-800/80 border border-[#00e5ff] rounded-3xl p-6 flex gap-5 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
                  <div className="w-20 h-20 rounded-full bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="w-2/3 h-4 bg-white rounded-full" />
                    <div className="w-1/3 h-3 bg-[#00e5ff] rounded-full" />
                    <div className="w-full h-2.5 bg-slate-600 rounded-full" />
                  </div>
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 flex gap-5">
                  <div className="w-20 h-20 rounded-full bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="w-1/2 h-4 bg-slate-500 rounded-full" />
                    <div className="w-1/4 h-3 bg-slate-600 rounded-full" />
                    <div className="w-5/6 h-2.5 bg-slate-600 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Col 3 */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-[32px] p-8 flex flex-col">
                 <div className="w-40 h-4 bg-white rounded-full mb-8" />
                 <div className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 space-y-6">
                   <div className="w-40 h-3 bg-slate-500 rounded-full" />
                   <div className="w-56 h-2.5 bg-slate-600 rounded-full" />
                   <hr className="border-slate-700 my-6" />
                   <div className="flex justify-between">
                     <div className="w-32 h-3 bg-slate-500 rounded-full" />
                     <div className="w-20 h-3 bg-[#00e5ff] rounded-full" />
                   </div>
                 </div>
                 <div className="mt-10 space-y-5">
                   <div className="w-full h-16 bg-slate-800 rounded-2xl" />
                   <button onClick={handleConnectClick} className="w-full h-16 primary-cyan-gradient rounded-2xl font-bold text-slate-950 text-xl filter-glow">
                     Confirm & Pay
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT / STATS */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="card-grad-gradient border border-slate-700/50 rounded-[48px] aspect-[4/3] flex flex-col items-center justify-center p-8 filter-card-shadow relative overflow-hidden">
               <div className="w-72 h-72 border-[4px] border-dashed border-[#00e5ff]/30 rounded-full flex items-center justify-center relative animate-[spin_60s_linear_infinite]">
                 <div className="w-56 h-56 bg-[#00e5ff]/10 rounded-full absolute" />
               </div>
               <div className="absolute px-8 py-4 primary-cyan-gradient rounded-2xl text-slate-950 font-bold text-2xl z-10 shadow-[0_0_30px_rgba(0,229,255,0.4)]">
                 BEHOLD.
               </div>
            </div>
            <div className="space-y-10">
              <div className="w-40 h-4 bg-[#00e5ff]/80 rounded-full" />
              <div className="space-y-5">
                <div className="w-full h-10 bg-white rounded-xl" />
                <div className="w-4/5 h-10 bg-white rounded-xl" />
              </div>
              <div className="space-y-4">
                <div className="w-full h-3.5 bg-slate-700 rounded-full" />
                <div className="w-11/12 h-3.5 bg-slate-700 rounded-full" />
                <div className="w-5/6 h-3.5 bg-slate-700 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6">
                {[1,2,3].map(i => (
                  <div key={i}>
                    <div className={`w-full h-10 rounded-xl mb-3 ${i === 1 ? 'bg-[#00e5ff]' : 'bg-white'}`} />
                    <div className="w-3/4 h-3 bg-slate-600 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}