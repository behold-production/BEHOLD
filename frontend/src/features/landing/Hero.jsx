import React from 'react';
import SEO from '../../components/common/SEO';
import { ArrowRight, Users } from 'lucide-react';
import heroLandscapeBg from '../../assets/header_landscape.jpg';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const settings = siteSettings || {};

  const headline = getFirstText(
    settings.heroTitle,
    'Where Mental Wellbeing Meets Mindful Living'
  );

  const description = getFirstText(
    settings.heroSub,
    'Personalized psychological counselling, emotional healing, and career mentorship tailored to your personal journey.'
  );

  const buttonText = getFirstText(settings.heroBtnText, 'Begin Your Journey');

  const handleConnectClick = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
    } else if (navigateToSection) {
      navigateToSection('services');
    } else {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    if (window.spaNavigate) window.spaNavigate('/psychologists');
    else window.location.href = '/psychologists';
  };

  return (
    <>
      <SEO
        title={`${settings.siteName || 'BEHOLD'} | ${headline}`}
        description={description}
        canonicalUrl="https://www.behold.co.in/"
      />

      <section
        id="home"
        aria-labelledby="bh-hero-title"
        className="relative w-full min-h-[88vh] sm:min-h-[94vh] flex items-end overflow-hidden bg-[#fbf9f5]"
      >
        {/* Full-bleed watercolor landscape background */}
        <img
          src={heroLandscapeBg}
          alt="Serene watercolor landscape of green hills and a calm river"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[center_22%] pointer-events-none select-none"
        />

        {/* Legibility + seamless blend into the page */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbf9f5]/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#fbf9f5] via-[#fbf9f5]/85 to-transparent pointer-events-none" />
        {/* Soft radial halo directly behind the headline for crisp contrast */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <div className="w-[80%] max-w-3xl h-[52%] translate-y-6 rounded-full bg-[#fbf9f5]/55 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 pt-32 sm:pt-40 text-center">
          <span className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#e5ddd0] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85438] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b85438] animate-pulse" />
            Clinical Care &amp; Mentorship
          </span>

          <h1
            id="bh-hero-title"
            className="font-serif-hero text-[2.5rem] sm:text-6xl md:text-7xl lg:text-[76px] font-medium text-[#1c2826] tracking-tight leading-[1.08] mb-5 sm:mb-6"
          >
            {headline}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#4c5b55] font-normal leading-relaxed mb-8 sm:mb-10">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleConnectClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-9 py-3.5 rounded-md text-sm font-semibold tracking-wide bg-[#1c2826] hover:bg-[#b85438] text-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98] border-none"
            >
              {buttonText}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={handleExploreClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-9 py-3.5 rounded-md text-sm font-semibold tracking-wide bg-white/70 hover:bg-white backdrop-blur-sm text-[#1c2826] border border-[#e5ddd0] hover:border-[#b85438]/40 shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.98]"
            >
              <Users className="w-4 h-4 text-[#b85438]" />
              Meet Our Psychologists
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#8a938e] font-semibold">Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-[#b85438]/60 to-transparent" />
        </div>
      </section>
    </>
  );
}
