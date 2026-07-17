import React, { useState, useEffect } from 'react';
import { ScrollDot } from '../../shared/components/BrandDot';
import jpg1 from '../../assets/jpg1.jpg';
import jpg2 from '../../assets/jpg2.jpg';
import jpg3 from '../../assets/jpg3.jpg';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};
  const title = settings.heroTitle || 'Bridging You \nTo Your {True Growth}';
  const subtitle = settings.heroSub || 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.';
  const btn1Text = settings.heroBtn1 || 'Book Your Session';
  const btn2Text = settings.heroBtn2 || 'Take Aptitude Test';
  const badge = settings.heroBadge || 'CIGI Certified Career Guidance';

  const [currentImgIdx, setCurrentImgIdx] = useState(1); // Default to jpg2 (Life Coaching)
  const images = [jpg1, jpg2, jpg3];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIdx((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleBook = () => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleExplore = () => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const stats = (Array.isArray(settings.heroStats) && settings.heroStats.length > 0)
    ? settings.heroStats
    : [
        { num: '500+', label: 'Students Guided' },
        { num: '98%', label: 'Clarity & Peace' },
        { num: '50+', label: 'Certified Mentors' },
      ];

  // Helper to parse \n line breaks, {accent text}, and attach ScrollDot full stop at baseline of the last word
  const renderTitleWithFullstopDot = (rawText) => {
    if (!rawText) return null;
    // Replace literal \n or \\n with newlines and split by lines
    const lines = rawText.replace(/\\n/g, '\n').split('\n');

    return lines.map((line, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;
      // Check if line contains {accent text}
      const parts = line.split(/(\{.*?\})/g);

      return (
        <React.Fragment key={lineIdx}>
          <span className="block">
            {parts.map((part, partIdx) => {
              const isAccent = part.startsWith('{') && part.endsWith('}');
              let cleanPart = isAccent ? part.slice(1, -1) : part;
              // Remove trailing period if it's the very last segment since ScrollDot is our period
              if (isLastLine && partIdx === parts.length - 1) {
                cleanPart = cleanPart.replace(/\.+$/, '');
              }

              // If this is the last segment of the last line, attach the ScrollDot baseline dot
              if (isLastLine && partIdx === parts.length - 1) {
                const words = cleanPart.trim().split(' ');
                const lastWord = words.pop() || '';
                const firstWords = words.join(' ');

                return (
                  <span key={partIdx} className={isAccent ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00A8FF] to-[#00F0FF]' : ''}>
                    {firstWords ? `${firstWords} ` : ''}
                    <span className="inline">
                      <span>{lastWord}</span>
                      <ScrollDot nextId="services-title" label="Scroll to Book Your Session ↓" size="md" inlineText={true} />
                    </span>
                  </span>
                );
              }

              return (
                <span key={partIdx} className={isAccent ? 'text-blue-600' : ''}>
                  {cleanPart}
                </span>
              );
            })}
          </span>
        </React.Fragment>
      );
    });
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-[#FDFBF7] via-[#F4F8FF] to-[#EFF6FF] overflow-hidden min-h-screen w-full flex items-center justify-center pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
      {/* Soft neon blue & cyan background glow tone */}
      <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-blue-300/30 rounded-full blur-3xl pointer-events-none translate-y-1/4 translate-x-1/4" />
      <div className="absolute top-1/2 left-0 w-[380px] h-[380px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT: Copy (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1 py-2">
            {/* Badge */}
            <div id="cdat-badge" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00A8FF] text-xs font-bold mb-5 w-fit shadow-2xl shadow-[#00F0FF]/10">
              <span>{badge}</span>
            </div>

            <h1 id="hero-title" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.12] mb-4 tracking-tight">
              {renderTitleWithFullstopDot(title, 'services-title', 'Scroll to Book Your Session ↓', 'md')}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed mb-6 max-w-xl font-normal">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleBook}
                className="px-6 py-3.5 bg-[#00F0FF] hover:bg-[#00d8e6] text-white font-black text-sm rounded-lg transition shadow-[0_0_15px_rgba(0,240,255,0.4)] border-none cursor-pointer flex items-center justify-center"
              >
                {btn1Text}
              </button>
              <button
                onClick={handleExplore}
                className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-lg transition border border-gray-200 hover:border-[#00F0FF] cursor-pointer shadow-sm flex items-center justify-center"
              >
                {btn2Text}
              </button>
            </div>

            {/* Trust Stats Bar */}
            <div className="flex items-center gap-6 sm:gap-8 pt-5 border-t border-gray-200/60">
              {stats.map(({ num, label }, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="text-lg sm:text-xl font-black text-[#00A8FF]">{num}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual Mockup / Laptop Screen Style (5 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center justify-center w-full py-2 sm:py-4">
            
            {/* Vibrant Organic Background Gradient Behind Laptop */}
            <div className="relative w-full max-w-[460px] sm:max-w-[530px] lg:max-w-[570px] flex flex-col items-center">
              
              {/* Curly Circular Neon Blue / Electric Cyan Blob Shape */}
              <div className="absolute -inset-6 sm:-inset-11 bg-gradient-to-tr from-[#00F0FF] via-[#0080FF] to-[#1E40AF] rounded-[48%_52%_62%_38%/53%_44%_56%_47%] opacity-85 blur-[4px] transform rotate-3 scale-95 transition-all duration-700 shadow-[0_0_60px_rgba(0,240,255,0.35)]" />
              {/* Secondary curly neon wave ring for rich electric depth */}
              <div className="absolute -inset-5 sm:-inset-9 border-[3px] sm:border-[4px] border-[#00F0FF]/50 rounded-[56%_44%_38%_62%/45%_55%_48%_52%] transform -rotate-6 blur-[1px] pointer-events-none" />

              {/* Laptop Display Screen Frame */}
              <div className="relative w-full bg-gray-900 rounded-t-2xl sm:rounded-t-3xl border-[6px] sm:border-[8px] border-gray-900 border-b-0 shadow-2xl overflow-hidden flex flex-col z-10 aspect-[16/10] sm:aspect-[16/10]">
                
                {/* Top Bezel with Camera Dot */}
                <div className="w-full bg-gray-900 pb-1 flex justify-center items-center relative shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-cyan-400/90" />
                  </div>
                </div>

                {/* Laptop Screen Content (Browser / Mentorship App View) */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                  
                  {/* App Navigation Header */}
                  <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-1.5 flex items-center justify-between shrink-0 text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      </div>
                      <div className="h-3 w-[1px] bg-slate-300 mx-0.5" />
                      <span className="text-xs font-black tracking-tight text-gray-900 flex items-center gap-0.5">
                        <span>BEHOLD</span>
                        <ScrollDot nextId="services-title" label="Scroll down ↓" size="xs" inlineText={true} />
                      </span>
                    </div>

                    {/* Fake URL Bar */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-slate-200 text-[10px] text-gray-500 font-medium shadow-2xs max-w-[170px] truncate">
                      <span className="text-green-600 font-bold text-[9px]">🔒</span>
                      <span className="truncate font-semibold text-gray-700">behold.co.in</span>
                    </div>

                    {/* Verified Badge */}
                    <div className="flex items-center gap-1 bg-[#00F0FF]/10 px-2 py-0.5 rounded-full border border-[#00F0FF]/30">
                      <span className="w-3 h-3 rounded-full bg-[#00F0FF] text-gray-950 flex items-center justify-center text-[7px] font-black shrink-0">✓</span>
                      <span className="text-[9px] font-bold text-[#00A8FF] whitespace-nowrap">CIGI Partner</span>
                    </div>
                  </div>

                  {/* Main Screen Visual Box (Landscape display of jpg2/jpg1/jpg3) */}
                  <div className="relative flex-1 overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={images[currentImgIdx]}
                      alt="Mentoring visual display"
                      className="w-full h-full object-cover object-center transition-all duration-700"
                    />

                    {/* Subtle dark overlay gradient at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent pointer-events-none" />

                    {/* Floating Audio Mentorship Card (Top-Right inside screen) */}
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-md rounded-lg p-1.5 sm:p-2 shadow-md border border-gray-100/90 flex items-center gap-1.5 sm:gap-2 max-w-[140px] sm:max-w-[155px] z-20 transition-all hover:scale-105">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#00F0FF] text-gray-950 flex items-center justify-center text-[8px] sm:text-[9px] shrink-0 font-black shadow-xs">▶</div>
                      <div className="overflow-hidden">
                        <div className="text-[8.5px] sm:text-[9.5px] font-bold text-gray-800 truncate">1-on-1 Mentorship</div>
                        <div className="flex items-center gap-0.5 h-3">
                          {[6, 12, 8, 14, 10, 16, 7, 13, 9, 15, 11, 8].map((h, idx) => (
                            <span key={idx} className="w-0.5 bg-[#00F0FF] rounded-full shrink-0" style={{ height: `${h}px` }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Floating Question Prompt Card (Bottom-Left overlay) */}
                    <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 bg-white/95 backdrop-blur-md rounded-lg p-2 sm:p-2.5 shadow-lg border border-gray-100/90 max-w-[170px] sm:max-w-[200px] z-20 text-left transition-all hover:scale-105">
                      <div className="text-[7.5px] sm:text-[8px] font-bold text-[#00A8FF] uppercase tracking-wider mb-0.5">Career vs Passion</div>
                      <div className="text-[9.5px] sm:text-[10.5px] font-black text-gray-900 leading-tight">
                        that’s a trick question — with C-DAT you master both!
                      </div>
                    </div>

                    {/* Location Badge (Bottom-Right overlay) */}
                    <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-gray-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 shadow z-20">
                      <span className="text-xs">📍</span>
                      <span>Kerala, India</span>
                    </div>
                  </div>

                  {/* Laptop Screen Bottom Status/Control Bar */}
                  <div className="bg-white border-t border-slate-200/80 px-3 py-1.5 flex items-center justify-between text-[11px] shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-gray-500 font-medium text-[10px] sm:text-[11px]">Displaying:</span>
                      <div className="flex gap-1 items-center">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImgIdx(i)}
                            className={`h-1 rounded-full transition-all border-none cursor-pointer ${currentImgIdx === i ? 'w-4.5 bg-[#00F0FF]' : 'w-1 bg-gray-300 hover:bg-gray-400'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="hidden sm:inline text-gray-500 font-semibold text-[10px]">CIGI Certified Guidance</span>
                      <button
                        onClick={handleBook}
                        className="px-2.5 py-1 bg-[#00F0FF] hover:bg-[#00d8e6] text-white font-black text-[10px] sm:text-[11px] rounded-md transition border-none cursor-pointer shadow-2xs"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Laptop Base / Hinge (The Keyboard Shelf below screen) */}
              <div className="relative w-[105%] max-w-[550px] sm:max-w-[620px] lg:max-w-[660px] h-3.5 sm:h-4 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-b-xl sm:rounded-b-2xl shadow-2xl border-t border-gray-400/80 flex justify-center items-start z-20">
                {/* Thumb notch indent on aluminum base */}
                <div className="w-16 sm:w-20 h-1 bg-gray-600/30 rounded-b-md" />
              </div>

              {/* Base shadow underneath */}
              <div className="w-[90%] h-4 bg-black/15 blur-md rounded-full -mt-1 pointer-events-none" />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
