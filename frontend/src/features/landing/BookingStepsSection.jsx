import React from 'react';
import { ArrowDown, CalendarDays, HeartHandshake, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';

const bookingSteps = [
  {
    number: '01',
    eyebrow: 'Care Matching',
    title: 'Find Your Psychologist',
    description: 'Browse licensed clinical psychologists by focus area, session style, and background that resonates with your personal needs.',
    Icon: HeartHandshake,
    accent: 'teal',
  },
  {
    number: '02',
    eyebrow: 'Flexible Booking',
    title: 'Choose Time & Format',
    description: 'Pick a day, a time, and a way to meet that fits into your life—convenient Online video, private Clinic visits, or supportive Doorstep sessions.',
    Icon: CalendarDays,
    accent: 'cyan',
  },
  {
    number: '03',
    eyebrow: 'Confidential Care',
    title: 'Begin in a Safe Space',
    description: 'Show up as you are. This is your safe, 100% private and confidential space, and your healing journey moves at your own pace.',
    Icon: Sparkles,
    accent: 'emerald',
  },
];

export default function BookingStepsSection({ navigateToSection }) {
  const handleScrollToExperts = () => {
    if (navigateToSection) {
      navigateToSection('experts');
    } else {
      document.getElementById('experts')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-[#fafaf7]/90 text-slate-900 border-b border-slate-200/80 overflow-hidden scroll-mt-20"
      aria-labelledby="bh-steps-title"
    >
      {/* Soft background texture matching About and FAQ */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
        <img
          src={greyGreenBg?.src || greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-teal-700 tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
            Simple & Thoughtful By Design
            <span className="w-5 h-px bg-teal-600/40 inline-block" />
          </span>
          <h2
            id="bh-steps-title"
            className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold text-slate-900 mb-4 tracking-tight leading-tight"
          >
            Starting Can Be the Hardest Part<span className="text-[#00e5ff]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-xl mx-auto leading-relaxed">
            We make the next steps simple, transparent, and respectful of your pace.
          </p>
        </div>

        {/* 3 Step Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {bookingSteps.map(({ number, eyebrow, title, description, Icon }, idx) => (
            <article
              key={number}
              className="group bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 hover:border-[#00e5ff]/70 p-7 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle accent border line on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Step Top Meta Row */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-[#00e5ff] text-[11px] font-mono font-bold tracking-wider shadow-xs">
                    STEP {number}
                  </span>

                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-100/80 group-hover:bg-[#00e5ff]/15 group-hover:text-teal-950 transition-colors shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>

                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block mb-1.5">
                  {eyebrow}
                </span>

                <h3 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug group-hover:text-teal-950 transition-colors">
                  {title}
                </h3>

                <p className="text-sm text-slate-600 mt-3 leading-relaxed font-normal">
                  {description}
                </p>
              </div>

              {/* Card Footer Progress Micro-Indicator */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-teal-800 transition-colors">
                <span className="text-[11px] uppercase tracking-wider">Phase {idx + 1} of 3</span>
                <span className="text-[11px] inline-flex items-center gap-1 text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA to Action */}
        <div className="mt-14 sm:mt-16 text-center">
          <button
            type="button"
            onClick={handleScrollToExperts}
            className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2.5 border-none hover-scale-btn"
          >
            <span>Explore Licensed Psychologists</span>
            <ArrowDown className="w-4 h-4 text-[#00e5ff] animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}
