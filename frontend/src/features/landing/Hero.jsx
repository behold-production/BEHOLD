import React from "react";
import { useNavigate } from "react-router-dom";
import heroWatercolorBg from "../../assets/clarity_bg.png";

export default function Hero({ siteSettings, navigateToSection }) {
  const settings = siteSettings || {};

  const displayEyebrow = settings.heroEyebrow || "Whatever you feel,";
  const eyebrowLine1 = displayEyebrow.includes(",") ? displayEyebrow : "It's Okay to be";
  
  const displayTitle = settings.heroTitle || "not okay";
  const subtitleText = settings.heroSub || "A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.";
  const btnText = settings.heroBtnText || "Book a Session";

  const navigate = useNavigate();

  const handleConnectClick = () => {
    navigate('/book-session');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pt-24 pb-16 px-5 sm:px-10 lg:px-16"
      style={{
        backgroundImage: `url(${heroWatercolorBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      {/* Background left empty to show global App.jsx background */}
      <div className="absolute inset-0 z-0">
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 my-auto">
        
        {/* LEFT COLUMN: Typography & Action Button */}
        <div className="flex-1 flex flex-col items-start justify-center text-left space-y-5 max-w-2xl">
          
          {/* Main Title Block */}
          <div className="relative leading-none">
            {/* Serif Line 1 */}
            <h1 className="font-['Cormorant_Garamond',serif] text-slate-900 text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-medium tracking-tight leading-tight">
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
              className="bg-brand hover:bg-brand-dark active:scale-95 transition-all duration-300 text-slate-900 font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-base sm:text-lg font-bold px-8 py-3 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-slate-900/10 cursor-pointer"
            >
              {btnText}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Glassmorphism Circle Badge */}
        <div className="flex-1 flex items-center justify-center lg:justify-end w-full">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-[3px] border-slate-900 text-center group hover:scale-[1.02] transition-transform duration-500">
            
            {/* Concentric Inner Rings */}
            <div className="absolute inset-3 sm:inset-4 rounded-full border-4 border-white/70 pointer-events-none transition-transform duration-700 group-hover:rotate-12" />
            <div className="absolute inset-6 sm:inset-8 rounded-full border border-white/50 pointer-events-none transition-transform duration-700 group-hover:-rotate-12" />

            {/* Subtle Light Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none" />

            {/* Badge Text Content */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-1 sm:space-y-2 text-white font-sans font-black tracking-widest uppercase">
              <span className="text-3xl sm:text-4xl md:text-5xl leading-tight drop-shadow-md">
                WE HEAL
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl leading-tight drop-shadow-md">
                WE GROW
              </span>
              <span className="text-3xl sm:text-4xl md:text-5xl leading-tight drop-shadow-md">
                TOGETHER
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}