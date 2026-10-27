import React from 'react';
import SEO from '../../components/common/SEO';
import heroLandscapeBg from '../../assets/header_landscape.jpg';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const settings = siteSettings || {};

  // Content defaults matching reference design exactly, with live dynamic siteSettings support
  const description = getFirstText(
    settings.heroSub,
    'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.'
  );

  const buttonText = getFirstText(settings.heroBtnText, "Let's Connect");

  // Determine split for "It's Okay to be" and cursive cyan "not okay"
  let mainTitle = "It's Okay to be";
  let scriptHighlight = "not okay";

  if (settings.heroTitle) {
    if (settings.heroTitle.toLowerCase().includes('not okay')) {
      const parts = settings.heroTitle.split(/not okay/i);
      mainTitle = parts[0]?.trim() || "It's Okay to be";
      scriptHighlight = "not okay";
    } else if (settings.heroTitle.includes('\n')) {
      const lines = settings.heroTitle.split('\n');
      mainTitle = lines.slice(0, -1).join(' ') || lines[0];
      scriptHighlight = lines[lines.length - 1];
    } else {
      mainTitle = settings.heroTitle;
      scriptHighlight = '';
    }
  }

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
        title={`${settings.siteName || 'BEHOLD'} | ${mainTitle} ${scriptHighlight}`.trim()}
        description={description}
        canonicalUrl="https://www.behold.co.in/"
      />
      <section
        className="bh-landscape-hero relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[720px] lg:min-h-[820px] xl:min-h-[880px] flex items-center overflow-hidden"
        id="home"
        aria-labelledby="bh-hero-title"
        style={{
          backgroundImage: `url(${heroLandscapeBg})`,
          backgroundPosition: 'center bottom',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Soft upper gradient to ensure navbar links and logo remain crystal clear */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

        {/* Hero Content Shell */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 lg:pb-28">
          <div className="max-w-xl lg:max-w-2xl text-left">
            <h1
              id="bh-hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-extrabold text-[#0f172a] tracking-tight leading-[1.08] font-sans"
            >
              <span>{mainTitle}</span>
              {scriptHighlight && (
                <span className="block mt-1 sm:mt-2 text-[#00E5FF] font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[78px] xl:text-[84px] font-script-hero leading-tight select-none relative inline-block">
                  {scriptHighlight}
                  {/* Delicate watercolor flourish underline stroke */}
                  <svg
                    className="w-full h-3 sm:h-4 text-[#00E5FF]/70 absolute -bottom-1 sm:-bottom-2 left-0 pointer-events-none"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 8 C 45 2, 95 10, 198 5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </h1>

            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-[17px] text-slate-700 font-normal leading-relaxed max-w-lg">
              {description}
            </p>

            <div className="mt-7 sm:mt-9 flex items-center gap-4">
              <button
                type="button"
                onClick={handleConnectClick}
                className="inline-flex items-center justify-center px-8 py-3.5 sm:px-9 sm:py-4 rounded-xl text-sm sm:text-base font-bold bg-[#00E5FF] hover:bg-[#00cbe2] text-slate-950 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] border-none"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
