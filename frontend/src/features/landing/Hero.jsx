import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/common/SEO";
import { ArrowRight, Star, HeartPulse, Activity } from 'lucide-react';
import luxuryBg from "../../assets/luxury_clinic_room.png"; 

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
      <div className="relative min-h-[100vh] bg-white overflow-hidden -mt-[80px] pt-[80px] pb-24 flex items-center justify-center font-sans">
        
        {/* Soft Neon Blue Glows (Background) */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#00e5ff] rounded-full opacity-[0.04] filter blur-[100px] pointer-events-none" />
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#00e5ff] rounded-full opacity-[0.03] filter blur-[120px] pointer-events-none" />
        
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6bTEgMWgxOHYxOEgxVjF6IiBmaWxsPSIjZjFmNWY5IiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-[0.5] pointer-events-none z-0" />
        
        {/* HERO CONTENT */}
        <section className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-10 items-center">
          
          {/* Left: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-scale mt-10 lg:mt-0">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
              <div className="relative flex items-center justify-center w-4 h-4">
                <span className="absolute w-2 h-2 rounded-full bg-[#00e5ff] animate-ping opacity-75"></span>
                <span className="relative w-2 h-2 rounded-full bg-[#00e5ff]"></span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide">Premium Mental Healthcare</span>
            </div>
            
            <div className="space-y-5 max-w-2xl mx-auto lg:mx-0">
              <h1 className="text-[44px] sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 drop-shadow-sm">
                Clarity for your <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b2be] to-[#00e5ff] pb-2 block">Peace of Mind.</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-medium">
                Expert psychological counseling and career mentoring delivered in a secure, confidential environment designed for your growth.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <button 
                onClick={handleConnectClick} 
                className="bg-[#00e5ff] text-white px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl hover:bg-[#00b2be] transition-all shadow-[0_4px_14px_0_rgba(0,229,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,229,255,0.23)] hover:-translate-y-0.5 flex items-center justify-center gap-3 border-none cursor-pointer"
              >
                Book Your Session <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigateToSection ? navigateToSection('services') : navigate('/about')} 
                className="bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                Explore Services
              </button>
            </div>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 lg:gap-6">
              <div className="flex -space-x-4">
                {['https://i.pravatar.cc/100?img=1', 'https://i.pravatar.cc/100?img=2', 'https://i.pravatar.cc/100?img=3', 'https://i.pravatar.cc/100?img=4'].map((img, index) => (
                  <div key={index} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                    <img src={img} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current text-yellow-400/50" />
                  <span className="ml-2 font-bold text-slate-900 text-sm">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loved by 10,000+ users</p>
              </div>
            </div>
          </div>
          
          {/* Right: Modern Aesthetic Composition */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:h-[600px] flex items-center justify-center animate-fade-down">
            {/* The Main floating card */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-w-[420px] rounded-[40px] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] overflow-hidden z-10 transform lg:rotate-2 hover:rotate-0 transition-all duration-700">
              
              <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent z-0" />
              
              <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
                    <HeartPulse className="w-7 h-7 text-[#00e5ff]" />
                  </div>
                  <span className="px-3 py-1 bg-white shadow-sm border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Available Now
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
                  Talk to a <br />Professional.
                </h3>
                <p className="text-sm font-medium text-slate-500 mb-8">
                  Connect with licensed therapists through high-quality video sessions or private chat.
                </p>
                
                <div className="mt-auto space-y-4">
                  <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#00e5ff]/50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" className="w-full h-full object-cover" alt="Therapist" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. Sarah Jenkins</h4>
                      <p className="text-xs text-slate-500 font-medium">Clinical Psychologist</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-[#00e5ff] text-white rounded-2xl p-4 shadow-md flex items-center justify-center font-bold text-sm">
                    Schedule Appointment
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Accents */}
            <div className="absolute -bottom-6 -left-6 sm:-left-12 w-48 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl z-20 animate-float hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 uppercase">Growth</h5>
                  <p className="text-lg font-black text-[#00e5ff]">+42%</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-10 -right-6 sm:-right-10 w-24 h-24 bg-white border border-slate-100 rounded-3xl shadow-lg z-20 flex items-center justify-center animate-float-delayed hidden sm:flex">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">
                B.
              </div>
            </div>
            
          </div>
          
        </section>
      </div>
    </>
  );
}