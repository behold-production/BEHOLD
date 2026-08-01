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

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Column: AT BEHOLD Content & Clinic Card */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] flex items-center gap-1.5 mb-2">
                AT
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black uppercase text-slate-900 tracking-tight leading-none">
                BEHOLD<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              {settings.aboutSectionDesc || "We believe psychological care and career mentorship is more than just counseling — it's about creating mental clarity that inspires, functions beautifully, and reflects the true potential of every individual."}
            </p>

            {/* Featured Image Asset */}
            <div className="pt-2">
              <div className="w-full h-60 sm:h-72 lg:h-80 rounded-3xl overflow-hidden bg-slate-900 border border-[#00e5ff]/30 shadow-xl relative group">
                <img
                  src={luxuryClinicRoom}
                  alt="BEHOLD Mentorship & Psychological Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">Safe & Inspiring Environment</h4>
                    <p className="text-[11px] text-slate-300 font-normal">Personalized in-person & doorstep counseling.</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-[#00e5ff] shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Thin-Border Matrix */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-200/90 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md shadow-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">

              {/* Stat 1 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-48 sm:h-56 group hover:bg-white transition-all">
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  {stats[0].label}
                </p>
                <div className="text-right flex items-center justify-between pt-4 border-t border-slate-100">
                  <Award className="w-5 h-5 text-[#00c9d6]" />
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 font-sans group-hover:text-[#00c9d6] transition-colors">
                    {stats[0].value}
                  </span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-48 sm:h-56 group hover:bg-white transition-all border-t sm:border-t-0">
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  {stats[1].label}
                </p>
                <div className="text-right flex items-center justify-between pt-4 border-t border-slate-100">
                  <Users className="w-5 h-5 text-[#00c9d6]" />
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 font-sans group-hover:text-[#00c9d6] transition-colors">
                    {stats[1].value}
                  </span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-6 sm:p-8 flex flex-col justify-between h-48 sm:h-56 group hover:bg-white transition-all border-t divide-slate-200/80">
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  {stats[2].label}
                </p>
                <div className="text-right flex items-center justify-between pt-4 border-t border-slate-100">
                  <Heart className="w-5 h-5 text-[#00c9d6]" />
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 font-sans group-hover:text-[#00c9d6] transition-colors">
                    {stats[2].value}
                  </span>
                </div>
              </div>

              {/* Stat 4: Dark Highlight Card */}
              <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col justify-between h-48 sm:h-56 border-t border-slate-200/80 shadow-inner">
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed italic">
                  "{stats[3].label}<span className="text-[#00e5ff] not-italic font-bold">.</span>"
                </p>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs font-extrabold uppercase tracking-widest text-[#00e5ff] hover:text-white bg-transparent border-none p-0 cursor-pointer flex items-center gap-1.5 transition-colors group/btn"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
