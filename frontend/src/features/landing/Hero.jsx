import React from 'react';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};
  const title = (settings.heroTitle || 'Bridging You \nTo Your {True Growth.}').replace(/\{|\}/g, '');
  const subtitle = settings.heroSub || 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.';
  const btn1Text = settings.heroBtn1 || 'Book an Assessment';
  const btn2Text = settings.heroBtn2 || 'Take Free Test';
  const badge = settings.heroBadge || 'CIGI Certified Career Guidance';

  const handleBook = () => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleExplore = () => navigateToSection?.('cdat');

  const stats = [
    { num: '500+', label: 'Students' },
    { num: '98%', label: 'Satisfaction' },
    { num: '50+', label: 'Mentors' },
  ];

  const cards = [
    { icon: '🎯', bg: 'bg-white border border-gray-100', title: 'Career Clarity', desc: 'Find the right career path' },
    { icon: '📊', bg: 'bg-blue-600', title: 'Aptitude Test', desc: 'CIGI-certified assessment', dark: true },
    { icon: '👥', bg: 'bg-indigo-50 border border-indigo-100', title: 'Expert Mentors', desc: 'Certified counsellors' },
    { icon: '✅', bg: 'bg-green-50 border border-green-100', title: '100% Clarity', desc: 'Personalised roadmap' },
  ];

  return (
    <section id="home" className="relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Soft blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-center">

          {/* LEFT: Text */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            {/* Badge */}
            <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              {badge}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4" style={{ whiteSpace: 'pre-line' }}>
              {title}
            </h1>

            <p className="text-base text-gray-500 leading-relaxed mb-7 max-w-md">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleBook}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-200 border-none cursor-pointer"
              >
                {btn1Text}
              </button>
              <button
                onClick={handleExplore}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm rounded-xl transition border border-gray-200 hover:border-blue-200 cursor-pointer"
              >
                {btn2Text}
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {stats.map(({ num, label }, i) => (
                <React.Fragment key={label}>
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-600">{num}</div>
                    <div className="text-xs text-gray-400 font-medium">{label}</div>
                  </div>
                  {i < stats.length - 1 && <span className="w-px h-7 bg-gray-200 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT: Cards */}
          <div className="relative order-1 lg:order-2 flex justify-center py-2">
            <div className="absolute inset-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl opacity-50 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-3 w-full max-w-xs">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className={`${card.bg} rounded-2xl p-4 shadow-md flex flex-col gap-2 ${i === 1 ? 'translate-y-4' : ''} ${i === 3 ? 'translate-y-2' : ''}`}
                >
                  <span className="text-xl">{card.icon}</span>
                  <div>
                    <div className={`font-bold text-sm ${card.dark ? 'text-white' : 'text-gray-900'}`}>{card.title}</div>
                    <div className={`text-xs leading-snug mt-0.5 ${card.dark ? 'text-blue-100' : 'text-gray-500'}`}>{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
