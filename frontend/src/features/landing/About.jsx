import React from 'react';
import { useNavigate } from 'react-router-dom';
import luxuryClinicRoom from '../../assets/luxury_clinic_room.png';
import greyGreenBg from '../../assets/greygreen.png';
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  GraduationCap,
  BrainCircuit,
  Compass,
  CheckCircle2,
  Lock,
  CalendarCheck
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export default function About({ siteSettings, onOpenBooking }) {
  const navigate = useNavigate();
  const settings = siteSettings || (() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('behold_site_settings');
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return {};
  })();

  const adminStats = Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0
    ? settings.aboutStats.filter(s => s && (s.value || s.label))
    : null;

  const stats = [
    {
      value: adminStats?.[0]?.value || settings.aboutStat1Value || '1,500+',
      label: adminStats?.[0]?.label || settings.aboutStat1Label || 'Hours of dedicated clinical psychology & student mentorship sessions.',
      icon: BrainCircuit,
      accent: 'teal'
    },
    {
      value: adminStats?.[1]?.value || settings.aboutStat2Value || '50+',
      label: adminStats?.[1]?.label || settings.aboutStat2Label || 'Licensed clinical psychologists & mentors providing guidance.',
      icon: Compass,
      accent: 'cyan'
    },
    {
      value: adminStats?.[2]?.value || settings.aboutStat3Value || '10k+',
      label: adminStats?.[2]?.label || settings.aboutStat3Label || 'Individuals and families supported toward emotional wellness.',
      icon: Heart,
      accent: 'rose'
    },
    {
      value: adminStats?.[3]?.value || '100%',
      label: adminStats?.[3]?.label || 'Private, end-to-end encrypted and confidential care under strict ethical standards.',
      icon: Lock,
      accent: 'emerald'
    }
  ];

  const handleBookingAction = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
    } else {
      navigate('/booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="About Us"
        description={settings.aboutSectionDesc || "Evidence-based psychological counseling, mental wellness support, and career mentorship designed to help individuals thrive."}
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin + "/about" : undefined}
      />
      <section
        id="about"
        aria-labelledby="bh-about-heading"
        className="relative py-16 sm:py-24 text-slate-900 overflow-hidden bg-[#faf9f5]/60 border-b border-slate-200/80 scroll-mt-20"
      >
        {/* Subtle Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <img
            src={greyGreenBg?.src || greyGreenBg}
            alt=""
            className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
              {settings.aboutEyebrow || 'About BEHOLD'}
              <span className="w-5 h-px bg-teal-600/40 inline-block" />
            </span>
            <h2
              id="bh-about-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 tracking-tight leading-tight"
            >
              {settings.aboutSectionTitle || 'Mental Wellbeing Begins With Feeling Understood'}<span className="text-[#0d827f]">.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {settings.aboutSectionDesc || "We believe psychological care is more than just counseling — it's about creating emotional safety, clarity, and personalized support tailored to each person's journey."}
            </p>
          </div>

          {/* Modern Clean Bento Box Grid (1px Borders & 12px Radii) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">

            {/* Cell 1: Mission & Core Philosophy (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-xl p-6 sm:p-8 md:p-10 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Our Clinical Mission</span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 tracking-tight leading-snug">
                  Safe, Judgment-Free Support for Real, Everyday Life.
                </h3>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  Whether you are navigating stress, anxiety, family dynamics, or seeking guidance for academic and career transitions, our certified practitioners work with you at your own pace without one-size-fits-all assumptions.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-xs font-semibold text-teal-900">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Evidence-Based Therapies
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" /> CDAT Aptitude & Career Mentorship
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Online & Clinic In-Person
                </span>
              </div>
            </div>

            {/* Cell 2: Primary Stat Card in Slate/Obsidian (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl p-6 sm:p-8 md:p-10 border border-slate-800 shadow-md flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-5 h-5 text-[#00e5ff]" />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                  {stats[0].value}
                </div>
                <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                  {stats[0].label}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-400">Scientifically validated clinical care outcomes.</span>
              </div>
            </div>

            {/* Cell 3: Clinic Photo Showcase (lg:col-span-5) */}
            <div className="lg:col-span-5 h-64 sm:h-72 lg:h-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs relative group text-left">
              <img
                src={luxuryClinicRoom?.src || luxuryClinicRoom}
                alt="BEHOLD Supportive Consultation Environment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00e5ff] shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Thoughtful & Supportive Space</h4>
                </div>
                <p className="text-xs text-slate-300 font-normal">
                  End-to-end encrypted virtual video rooms & private center appointments.
                </p>
              </div>
            </div>

            {/* Cell 4: Secondary Stat (lg:col-span-4) */}
            <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
                  <Compass className="w-5 h-5 text-teal-700" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {stats[1].value}
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                  {stats[1].label}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-teal-800">Multilingual: Malayalam & English</span>
              </div>
            </div>

            {/* Cell 5: Confidentiality Guarantee & CTA (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white/95 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center mb-5">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {stats[2].value}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {stats[2].label}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBookingAction}
                  className="w-full flex items-center justify-between py-2.5 px-4 bg-slate-900 hover:bg-[#0d827f] text-white rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-xs border-none group/btn"
                >
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-teal-300" />
                    Book Session
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Dynamic What We Offer Cards (if defined in Admin Settings) */}
          {Array.isArray(settings.aboutCards) && settings.aboutCards.length > 0 && (
            <div className="mt-16 sm:mt-24 pt-12 border-t border-slate-200/80">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-2">
                  <span className="w-5 h-px bg-teal-600/40 inline-block" />
                  OUR CORE PILLARS
                  <span className="w-5 h-px bg-teal-600/40 inline-block" />
                </span>
                <h3 className="text-2xl sm:text-3xl font-sans font-semibold text-slate-900 tracking-tight">
                  {settings.aboutTitle || 'What We Offer'}<span className="text-[#0d827f]">.</span>
                </h3>
                {settings.aboutSub && (
                  <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto font-normal">
                    {settings.aboutSub}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {settings.aboutCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white/95 backdrop-blur-sm border border-slate-200 p-6 sm:p-7 rounded-xl shadow-xs hover:shadow-md hover:border-teal-500/50 transition-all duration-200 group text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center mb-4 group-hover:bg-teal-50 transition-colors">
                        <span className="text-xs font-bold text-slate-500 group-hover:text-teal-700 font-sans">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 mb-2">{card.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
