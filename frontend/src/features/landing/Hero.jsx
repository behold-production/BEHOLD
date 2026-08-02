import React from "react";
import { useNavigate } from "react-router-dom";
import headerBg from "../../assets/header.svg";

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const settings = siteSettings || {};

  const displayEyebrow = settings.heroEyebrow || "Whatever you feel,";
  const eyebrowLine1 = displayEyebrow.includes(",") ? displayEyebrow : "It's Okay to be";

  const displayTitle = settings.heroTitle || "not okay";
  const subtitleText = settings.heroSub || "A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.";
  const btnText = settings.heroBtnText || "Book a Session";

  const navigate = useNavigate();

  const handleConnectClick = () => {
    if (onOpenBooking) onOpenBooking();
    else navigate('/booking');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16 px-5 sm:px-10 lg:px-16 bg-transparent"
    >
      {/* Hero Background SVG with Floating & Ambient Pulse Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Soft Ambient Radial Glow behind Hero SVG */}
        <div className="absolute w-[45rem] h-[45rem] bg-[#00c9d6]/20 rounded-full blur-[140px] animate-hero-pulse pointer-events-none" />

        <img
          src={headerBg}
          alt="Hero Background"
          className="w-full h-full object-cover object-center opacity-95 transition-all duration-700 animate-hero-float pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4f8fc]/10 to-[#d4f8fc]/20 pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 my-auto">

        {/* COLUMN: Typography & Action Button */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-5 max-w-2xl mx-auto md:mx-0 transition-transform duration-500">

          {/* Main Title Block */}
          <div className="relative leading-none flex flex-col items-center md:items-start group">
            {/* Line 1 - Slender & Elegant */}
            <h1 className="font-sans font-medium text-slate-800 text-3xl sm:text-4xl md:text-4xl lg:text-[44px] tracking-normal leading-tight transition-all duration-300">
              {eyebrowLine1}
            </h1>

            {/* Accent Line 2 - Custom Cursive Font (Balanced size for md/lg >768px) */}
            <div className="relative inline-block mt-2 sm:mt-4">
              <span className="font-rough text-[#00c9d6] text-[72px] sm:text-[82px] md:text-[88px] lg:text-[98px] font-normal tracking-tight [word-spacing:6px] block leading-[0.95] drop-shadow-sm select-none animate-hero-pulse">
                {displayTitle.toLowerCase()}
              </span>

              {/* Turquoise Brush Underline Graphic with Subtle Pulse */}
              <svg
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 w-3/5 h-4 sm:h-5 text-[#00c9d6]/80 pointer-events-none animate-pulse"
                viewBox="0 0 200 20"
                fill="currentColor"
                preserveAspectRatio="none"
              >
                <path d="M 0 10 Q 50 2, 100 10 T 200 8 Q 150 16, 80 12 Z" />
              </svg>
            </div>
          </div>

          {/* Subtitle Paragraph - Refined Compact Size */}
          <p className="font-sans text-center md:text-left text-slate-700/90 text-sm sm:text-base md:text-base font-normal leading-relaxed max-w-lg">
            {subtitleText}
          </p>

          {/* Action Button */}
          <div className="pt-2 flex justify-center md:justify-start w-full">
            <button
              onClick={handleConnectClick}
              className="bg-brand hover:bg-brand-dark active:scale-95 hover:scale-105 transition-all duration-300 text-slate-900 font-sans text-lg sm:text-xl font-bold px-10 py-4 rounded-full shadow-md hover:shadow-xl flex items-center justify-center border border-slate-900/10 cursor-pointer"
            >
              {btnText}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}