import React from 'react';
import jpg1 from '../../assets/jpg1.jpg';
import jpg2 from '../../assets/jpg2.jpg';
import jpg3 from '../../assets/jpg3.jpg';

export default function Hero({ setView, navigateToSection, siteSettings }) {
  const settings = siteSettings || {};
  const title = settings.heroTitle || 'Every Mind Matters';
  const subtitle = settings.heroSub || 'A personal development and mentoring ecosystem — combining psychological care, self-discovery, and career guidance to help you grow with confidence and peace of mind.';

  const handleBook = () => {
    window.spaNavigate?.('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplore = () => {
    window.spaNavigate?.('/sample-test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = (Array.isArray(settings.heroStats) && settings.heroStats.length > 0)
    ? settings.heroStats
    : [
        { num: '5,000+', label: 'Students & Parents Guided' },
        { num: '99.4%', label: 'Confidentiality Rate' },
        { num: '50+', label: 'Certified Psychologists' }
      ];

  return (
    <section id="home" className="bg-white text-slate-900 w-full py-16 sm:py-20 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Text-Only Confidential Badge */}
        <div className="inline-block px-3.5 py-1 rounded-md bg-black text-white text-xs font-semibold mb-6">
          100% Confidential & Certified Psychological Care
        </div>

        {/* 2-Column Balanced Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal mb-8 max-w-xl">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleBook}
                className="px-6 py-3.5 bg-black hover:bg-slate-900 text-white font-bold text-sm rounded-lg transition-colors shadow-xs cursor-pointer border-none text-center"
              >
                Book Consultation
              </button>
              <button
                onClick={handleExplore}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg transition-colors border border-slate-200 cursor-pointer shadow-xs text-center"
              >
                Know Yourself (Aptitude Test)
              </button>
            </div>

            {/* Quick Checks */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span>Certified Psychologists</span>
              <span>&middot;</span>
              <span>Direct Google Meet Link</span>
              <span>&middot;</span>
              <span>Instant Reports</span>
            </div>
          </div>

          {/* Right Column: Healing / Growth Emotional Visual Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden mb-5 bg-slate-200">
                <img
                  src={jpg1}
                  alt="Personal Growth and Mental Wellness Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-black text-[#00E5FF] text-[10px] font-bold uppercase tracking-wider mb-1">
                    Healing & Growth Space
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight">Guided 1-on-1 Psychological Support</h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900">Psychological Counselling</span>
                  <span className="text-slate-500">60 mins &middot; Confidential</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900">C-DAT Aptitude Assessment</span>
                  <span className="text-slate-500">45 mins &middot; Scientific</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3-Photo Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          {[
            { img: jpg1, title: 'Confidential 1-on-1 Sessions', badge: 'Empathy & Support' },
            { img: jpg2, title: 'Scientific Aptitude Mapping', badge: 'Psychometric Testing' },
            { img: jpg3, title: 'Lifetime Personal Mentoring', badge: 'Career Clarity' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative h-56 sm:h-64 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs group"
            >
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-black text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                  {item.badge}
                </span>
                <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-slate-100">
          {stats.map(({ num, label }, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5">{num}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
