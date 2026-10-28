import React from 'react';
import SEO from '../../components/common/SEO';
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
        className="relative w-full pt-28 sm:pt-36 pb-0 bg-[#fbf9f5] overflow-hidden"
      >
        {/* Centered Editorial Text Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
          <h1
            id="bh-hero-title"
            className="font-serif-hero text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-medium text-[#1c2826] tracking-tight leading-[1.12] mb-5 sm:mb-6"
          >
            {headline}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#5c6b66] font-normal leading-relaxed mb-7 sm:mb-9">
            {description}
          </p>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleConnectClick}
              className="inline-flex items-center justify-center px-8 sm:px-9 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-[#1c2826] hover:bg-[#b85438] text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95 border-none"
            >
              {buttonText}
            </button>
          </div>
        </div>

        {/* Panoramic Watercolor Landscape Illustration with Organic Wave Transition */}
        <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#eee7dc]/80">
            <img
              src={heroLandscapeBg}
              alt="Where Mental Wellbeing Meets Mindful Living"
              className="w-full h-auto max-h-[480px] sm:max-h-[560px] md:max-h-[640px] object-cover object-bottom block"
              loading="eager"
            />

            {/* Organic Deckled / Torn Wave Bottom Edge blending into page */}
            <div className="absolute inset-x-0 bottom-0 pointer-events-none">
              <svg
                viewBox="0 0 1440 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="w-full h-10 sm:h-16 md:h-20 text-[#fbf9f5] fill-current"
              >
                <path d="M0,60 C160,85 280,30 460,65 C640,95 780,35 960,60 C1140,85 1280,30 1440,65 L1440,100 L0,100 Z" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
