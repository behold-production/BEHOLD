import React from 'react';
import { ScrollDot } from '../../shared/components/BrandDot';
import jpg1 from '../../assets/jpg1.jpg';
import jpg2 from '../../assets/jpg2.jpg';
import jpg3 from '../../assets/jpg3.jpg';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};
  const title    = settings.heroTitle || 'Bridging You \nTo Your True Growth';
  const subtitle = settings.heroSub   || 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.';
  const btn1Text = settings.heroBtn1  || 'Book Your Session';
  const btn2Text = settings.heroBtn2  || 'Take Aptitude Test';
  const badge    = settings.heroBadge || 'CIGI CERTIFIED CAREER GUIDANCE';

  const handleBook    = () => { window.spaNavigate?.('/booking');     window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleExplore = () => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const stats = (Array.isArray(settings.heroStats) && settings.heroStats.length > 0)
    ? settings.heroStats
    : [
        { num: '500+', label: 'Students Guided' },
        { num: '98%',  label: 'Clarity & Peace'  },
        { num: '50+',  label: 'Certified Mentors' },
      ];

  /* Parses title with clean editorial serif formatting */
  const renderHeroTitle = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.replace(/\\n/g, '\n').split('\n');
    return lines.map((line, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;
      const parts = line.split(/(\{.*?\})/g);
      return (
        <span key={lineIdx} className={`block ${lineIdx === 1 ? 'italic font-serif text-gray-800 font-normal' : ''}`}>
          {parts.map((part, partIdx) => {
            const isAccent = part.startsWith('{') && part.endsWith('}');
            let clean = isAccent ? part.slice(1, -1) : part;
            if (isLastLine && partIdx === parts.length - 1) clean = clean.replace(/\.+$/, '');
            if (isLastLine && partIdx === parts.length - 1) {
              const words = clean.trim().split(' ');
              const last  = words.pop() || '';
              const rest  = words.join(' ');
              return (
                <span key={partIdx} className={isAccent ? 'italic font-serif font-normal text-gray-800' : ''}>
                  {rest ? `${rest} ` : ''}
                  <span className="inline">
                    <span>{last}</span>
                    <ScrollDot nextId="why-choose-us" label="Scroll down ↓" size="md" inlineText={true} />
                  </span>
                </span>
              );
            }
            return (
              <span key={partIdx} className={isAccent ? 'italic font-serif font-normal text-gray-800' : ''}>
                {clean}
              </span>
            );
          })}
        </span>
      );
    });
  };

  return (
    <section
      id="home"
      className="relative bg-white w-full pt-28 sm:pt-36 pb-16 border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Eyebrow / Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">—</span>
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-gray-500">{badge}</span>
        </div>

        {/* Headline */}
        <h1
          id="hero-title"
          className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 tracking-tight leading-[1.1] mb-6 max-w-4xl"
        >
          {renderHeroTitle(title)}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl font-sans font-normal">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
          <button
            onClick={handleBook}
            className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-lg transition shadow-sm border-none cursor-pointer flex items-center justify-center"
          >
            {btn1Text}
          </button>
          <button
            onClick={handleExplore}
            className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm rounded-lg transition border border-gray-300 cursor-pointer flex items-center justify-center"
          >
            {btn2Text}
          </button>
        </div>

        {/* 3-Photo Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {[jpg1, jpg2, jpg3].map((img, idx) => (
            <div
              key={idx}
              className="relative h-64 sm:h-72 md:h-80 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shadow-sm group"
            >
              <img
                src={img}
                alt={`Behold session ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 pt-16 mt-12 border-t border-gray-200">
          {stats.map(({ num, label }, idx) => (
            <div key={idx} className="flex flex-col items-start">
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-none mb-2">{num}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium leading-tight">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
