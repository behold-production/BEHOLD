import React, { useState } from 'react';
import { ScrollDot } from '../../shared/components/BrandDot';
import jpg3 from '../../assets/jpg3.jpg';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [expanded, setExpanded] = useState(false);
  const settings = siteSettings || {};

  // All defaults exactly match the admin panel's original values
  const aboutTitle = settings.aboutTitle || 'What We Offer';
  const aboutSub = settings.aboutSub || 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.';
  const para1 = settings.aboutPara1 || 'BEHOLD is dedicated to helping students, families, and individuals navigate career planning and personal growth across Kerala. With expert psychological counseling, C-DAT assessments, and mentor-led programs, we make the journey purposeful and transformative.';
  const para2 = settings.aboutPara2 || 'From aptitude evaluations and career roadmaps to doorstep counseling and personalized school programs, our experienced team delivers solutions that reduce anxiety and ensure every student is ready to thrive.';

  const offers = [
    { title: settings.offer1Title || 'Extended Mentorship', desc: settings.offer1Desc || 'We guide students through milestones to turn assessment reports into real achievements.' },
    { title: settings.offer2Title || 'Doorstep & Online Counseling', desc: settings.offer2Desc || 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.' },
    { title: settings.offer3Title || 'Personalized School Programs', desc: settings.offer3Desc || 'We conduct orientations and workshops to build healthy learning environments in schools.' },
    { title: settings.offer4Title || 'C-DAT & Career Roadmaps', desc: settings.offer4Desc || 'We use aptitude evaluations to match university pathways with individual natural talents.' },
  ];

  const stats = (Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0)
    ? settings.aboutStats
    : [
        { value: '10+', label: 'Years Experience' },
        { value: '500+', label: 'Students Guided' },
        { value: '50+', label: 'Expert Mentors' },
        { value: '98%', label: 'Success Rate' },
      ];

  // Helper to keep the last word and the ScrollDot attached so the full stop dot never wraps onto its own line
  const renderTitleWithFullstopDot = (text) => {
    const words = text.trim().split(' ');
    if (words.length <= 1) {
      return (
        <span className="whitespace-nowrap inline-flex items-baseline">
          <span>{text}</span>
          <ScrollDot nextId="reviews-title" label="Scroll to Student Reviews ↓" size="md" inlineText={true} />
        </span>
      );
    }
    const lastWord = words.pop();
    const firstPart = words.join(' ');
    return (
      <span className="inline">
        <span>{firstPart} </span>
        <span className="whitespace-nowrap inline-flex items-baseline">
          <span>{lastWord}</span>
          <ScrollDot nextId="reviews-title" label="Scroll to Student Reviews ↓" size="md" inlineText={true} />
        </span>
      </span>
    );
  };

  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left: Perfectly proportioned illustration & stats container (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-br from-[#F8FAFF] via-blue-50/70 to-indigo-50/80 rounded-3xl p-5 sm:p-6 relative overflow-hidden border border-blue-100/80 shadow-xl">
              {/* Main Visual Illustration (No awkward cropping, clean and warm) */}
              <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-5 shadow-md bg-white border border-slate-100 flex items-center justify-center">
                <img
                  src={jpg3}
                  alt="Student and mentor support illustration"
                  className="w-full h-full object-cover object-center hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-3.5 left-4 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Personalized Mentorship</div>
                  <div className="text-sm sm:text-base font-black leading-tight">Empowering Students Across Kerala</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {stats.map(({ value, num, label }, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3.5 text-center shadow-sm border border-gray-100 transition-transform hover:-translate-y-0.5">
                    <div className="text-2xl font-black text-blue-600 mb-0.5 tracking-tight">{value || num}</div>
                    <div className="text-xs text-gray-500 font-semibold">{label}</div>
                  </div>
                ))}
              </div>

              {/* Bottom badge */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3.5 flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xs">CIGI Certified Partnership</div>
                  <div className="text-blue-100 text-[11px] font-medium">Scientific & Data-Driven Career Guidance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content (7 cols) */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600 block mb-3">
              About Behold
            </span>
            <h2 id="about-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {renderTitleWithFullstopDot(aboutTitle)}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-4 max-w-prose font-normal">{aboutSub}</p>

            {/* Collapsible body */}
            <div
              style={{ maxHeight: expanded ? '350px' : '0', opacity: expanded ? 1 : 0 }}
              className="overflow-hidden transition-all duration-500 ease-in-out text-gray-600 text-sm leading-relaxed"
            >
              <p className="mb-3">{para1}</p>
              <p>{para2}</p>
            </div>

            <button
              onClick={() => setExpanded(e => !e)}
              className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-bold mb-6 bg-transparent border-none cursor-pointer p-0 hover:text-blue-700 transition-colors"
            >
              <span>{expanded ? 'Show less' : 'Read more'}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>


            {/* Offer cards — driven by admin siteSettings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {offers.map((offer, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100/80 transition hover:bg-blue-50">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{offer.title}</div>
                    <div className="text-gray-500 text-xs leading-snug mt-0.5 font-normal">{offer.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-500/20 border-none cursor-pointer flex items-center justify-center"
                >
                  Book a Session
                </button>
              )}
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-xl transition border border-gray-200 hover:border-blue-300 cursor-pointer shadow-sm flex items-center justify-center"
              >
                Take Aptitude Test
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
