import React from "react";
import heroWatercolorBg from "../../assets/hero_watercolor_bg.png";

export default function Hero({ siteSettings, navigateToSection }) {
  const settings = siteSettings || {};

  const displayEyebrow = settings.heroEyebrow || "Whatever you feel,";
  const eyebrowLine1 = displayEyebrow.includes(",") ? displayEyebrow : "It's Okay to be";
  
  const displayTitle = settings.heroTitle || "not okey";
  const subtitleText = settings.heroSub || "A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.";
  const btnText = settings.heroBtnText || "Let's Connect";

  const handleConnectClick = () => {
    const contactEl = document.getElementById("inquiry");
    if (contactEl) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = contactEl.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: "smooth" });
    } else {
      navigateToSection?.("contact");
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16 px-5 sm:px-10 lg:px-16"
    >
      {/* Background Watercolor Painting */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroBgImage || heroWatercolorBg}
          alt="Watercolor Landscape"
          className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[0.98]"
        />
        {/* Soft lighting overlay to blend nicely with surrounding UI */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/30 via-transparent to-emerald-900/10 pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 my-auto">
        
        {/* LEFT COLUMN: Typography & Action Button */}
        <div className="flex-1 flex flex-col items-start justify-center text-left space-y-5 max-w-2xl">
          
          {/* Main Title Block */}
          <div className="relative leading-none">
            {/* Serif Line 1 */}
            <h1 className="font-['Cormorant_Garamond',serif] text-[#1c7974] text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-medium tracking-tight leading-tight">
              {eyebrowLine1}
            </h1>

            {/* Script Cursive Line 2 */}
            <div className="relative inline-block mt-0 sm:mt-1">
              <span className="font-['Caveat','Dancing_Script',cursive] text-[#00c9d6] text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-bold tracking-wide block leading-[0.85] drop-shadow-sm select-none">
                {displayTitle.toLowerCase()}
              </span>

              {/* Turquoise Brush Underline Graphic */}
              <svg
                className="absolute -bottom-2 left-0 w-3/5 h-4 sm:h-5 text-[#00c9d6]/70 pointer-events-none"
                viewBox="0 0 200 20"
                fill="currentColor"
                preserveAspectRatio="none"
              >
                <path d="M 0 10 Q 50 2, 100 10 T 200 8 Q 150 16, 80 12 Z" />
              </svg>
            </div>
          </div>

          {/* Subtitle Paragraph */}
          <p className="text-left text-slate-700/90 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-xl">
            {subtitleText}
          </p>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleConnectClick}
              className="bg-[#3f9d95] hover:bg-[#348981] active:scale-95 transition-all duration-300 text-white font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-base sm:text-lg font-medium px-8 py-3 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-white/20 cursor-pointer"
            >
              {btnText}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Circular Sage-Green Badge / Seal */}
        <div className="flex-1 flex items-center justify-center lg:justify-end w-full">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-[#87be9f]/90 backdrop-blur-xs flex flex-col items-center justify-center shadow-xl border-4 border-[#76b08e] p-6 text-center group hover:scale-[1.02] transition-transform duration-500">
            
            {/* Inner & Outer Hand-drawn stroke circles */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none text-white/40"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="180 8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.7"
              />
            </svg>

            {/* Badge Text Content */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-white font-['Cormorant_Garamond',serif] tracking-wider uppercase">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-xs">
                WE HEAL
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-xs">
                WE GROW
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-xs">
                  TOGETHER
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}