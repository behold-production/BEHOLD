import React from 'react';
import luxuryClinicRoom from '../../assets/luxury_clinic_room.png';
import greyGreenBg from '../../assets/greygreen.png';
import { ArrowRight, ShieldCheck, Award, Users, Heart } from 'lucide-react';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const stats = [
    {
      value: settings.aboutStat1Value || '10+',
      label: settings.aboutStat1Label || 'Years into rewriting the rules of psychological care and student guidance.'
    },
    {
      value: settings.aboutStat2Value || '50+',
      label: settings.aboutStat2Label || 'Certified clinical psychologists & mentors who know their craft inside out.'
    },
    {
      value: settings.aboutStat3Value || '10k+',
      label: settings.aboutStat3Label || 'Students, individuals & families empowered with clarity and direction.'
    },
    {
      value: '100%',
      label: 'Private, non-judgmental & confidential care guaranteed under scientific standards.'
    }
  ];

  return (
    <section id="about" className="relative py-12 sm:py-20 text-slate-900 select-none overflow-hidden">
      {/* Background Image Layer with mask gradient fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-60 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bento Box Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
          
          {/* Cell 1: Intro Text (lg:col-span-5) */}
          <div className="md:col-span-2 lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/80 p-8 lg:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center reveal-on-scroll reveal-scale-in hover-scale-card">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#00c9d6] flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 bg-[#00c9d6] rounded-full"></span>
              AT BEHOLD
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-sans font-black uppercase text-slate-900 tracking-tight leading-[1.05] mb-5">
              BEHOLD<span className="text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">.</span>
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-medium">
              {settings.aboutSectionDesc || "We believe psychological care and career mentorship is more than just counseling — it's about creating mental clarity that inspires, functions beautifully, and reflects the true potential of every individual."}
            </p>
          </div>

          {/* Cell 2: Stat 1 (lg:col-span-3) */}
          <div className="md:col-span-1 lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover-scale-card transition-all duration-300 reveal-on-scroll reveal-scale-in reveal-delay-1">
            <Award className="w-6 h-6 text-[#00c9d6] mb-4 group-hover:scale-110 transition-transform" />
            <div>
              <span className="block text-4xl sm:text-5xl font-black text-slate-900 font-sans tracking-tight mb-2 group-hover:text-[#00c9d6] transition-colors">
                {stats[0].value}
              </span>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {stats[0].label}
              </p>
            </div>
          </div>

          {/* Cell 3: Stat 2 (lg:col-span-4) */}
          <div className="md:col-span-1 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover-scale-card transition-all duration-300 relative overflow-hidden reveal-on-scroll reveal-scale-in reveal-delay-2">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="w-32 h-32" />
            </div>
            <Users className="w-6 h-6 text-[#00c9d6] mb-4 relative z-10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <span className="block text-4xl sm:text-5xl font-black text-slate-900 font-sans tracking-tight mb-2 group-hover:text-[#00c9d6] transition-colors">
                {stats[1].value}
              </span>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-[200px]">
                {stats[1].label}
              </p>
            </div>
          </div>

          {/* Cell 4: Image (lg:col-span-5) */}
          <div className="md:col-span-2 lg:col-span-5 h-72 sm:h-80 lg:h-auto rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-xl relative group hover-scale-card reveal-on-scroll reveal-scale-in reveal-delay-3">
            <img
              src={luxuryClinicRoom}
              alt="BEHOLD Mentorship & Psychological Care"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#00e5ff] shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Safe & Inspiring Environment</h4>
              </div>
              <p className="text-xs text-slate-300 font-medium">Personalized in-person & doorstep counseling.</p>
            </div>
          </div>

          {/* Cell 5: Stat 3 (lg:col-span-4) */}
          <div className="md:col-span-1 lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <Heart className="w-6 h-6 text-[#00c9d6] mb-4" />
            <div>
              <span className="block text-4xl sm:text-5xl font-black text-slate-900 font-sans tracking-tight mb-2 group-hover:text-[#00c9d6] transition-colors">
                {stats[2].value}
              </span>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                {stats[2].label}
              </p>
            </div>
          </div>

          {/* Cell 6: Dark Card (lg:col-span-3) */}
          <div className="md:col-span-1 lg:col-span-3 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00e5ff] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed italic relative z-10">
              "{stats[3].label}<span className="text-[#00e5ff] not-italic font-black text-lg leading-none">.</span>"
            </p>

            <div className="mt-8 relative z-10">
              <button
                onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full flex items-center justify-between py-3 px-5 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-colors cursor-pointer group/btn"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-[#00e5ff]" />
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic What We Offer Cards */}
        {settings.aboutCards && settings.aboutCards.length > 0 && (
          <div className="mt-20 sm:mt-32">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] flex items-center justify-center gap-1.5 mb-2">
                OUR SERVICES
              </span>
              <h3 className="text-2xl sm:text-4xl font-sans font-black uppercase text-slate-900 tracking-tight leading-none">
                {settings.aboutTitle || 'WHAT WE OFFER'}<span className="text-[#00e5ff]">.</span>
              </h3>
              {settings.aboutSub && (
                <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                  {settings.aboutSub}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {settings.aboutCards.map((card, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-md border border-slate-200/90 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-[#00e5ff]/10 transition-colors">
                    <span className="text-lg font-black text-slate-400 font-sans group-hover:text-[#00c9d6]">0{idx + 1}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-3">{card.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
