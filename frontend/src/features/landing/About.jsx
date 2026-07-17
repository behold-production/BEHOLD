import React, { useState } from 'react';
import { ScrollDot } from '../../shared/components/BrandDot';
import jpg3 from '../../assets/jpg3.jpg';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [isExpanded, setIsExpanded] = useState(false);
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
        <span className="inline">
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
        <span className="inline">
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
            <div className="bg-gradient-to-br from-slate-50 via-blue-50/60 to-sky-50/80 rounded-lg p-5 sm:p-6 relative overflow-hidden border border-blue-100 shadow-lg">
              {/* Main Visual Illustration */}
              <div className="relative h-64 sm:h-72 rounded-lg overflow-hidden mb-5 shadow-md bg-white border border-slate-100 flex items-center justify-center">
                <img
                  src={jpg3}
                  alt="Student and mentor support illustration"
                  className="w-full h-full object-cover object-center hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3.5 left-4 text-white">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF]">Personalized Mentorship</div>
                  <div className="text-xl font-bold text-white leading-tight">Expert Advice Tailored for You</div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-white rounded-lg border border-blue-100 text-center shadow-sm">
                {[
                  { num: '10,000+', label: 'Students Advised', value: settings.statsStudents },
                  { num: '500+', label: 'Careers Mapped', value: settings.statsCareers },
                  { num: '98%', label: 'Success Rate', value: settings.statsRate },
                ].map(({ num, label, value }) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-[#00A8FF] mb-0.5 tracking-tight">{value || num}</div>
                    <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>

              {/* Mini Banner */}
              <div className="bg-white text-gray-800 rounded-lg p-3.5 flex items-center gap-3 shadow-sm border border-blue-100 mt-4">
                <div className="w-9 h-9 rounded-lg bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#00A8FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[#00A8FF] text-[11px] font-bold">CIGI Certified Partnership</div>
                  <div className="text-gray-500 text-[11px] font-medium">Scientific & Data-Driven Career Guidance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content (7 cols) */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold tracking-widest uppercase text-[#00A8FF] block mb-3">
              {settings.aboutSectionSub || 'Why We Exist'}
            </span>
            <h2 id="about-title" className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 leading-tight mb-6 flex items-center flex-wrap gap-x-1.5">
              {renderTitleWithFullstopDot(settings.aboutSectionTitle || 'Pioneering Comprehensive Student Assessment & Mentorship', 'why-us-title', 'Scroll to Why Choose Us ↓', 'lg')}
            </h2>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
              {settings.aboutSectionDesc || "Every student possesses unique cognitive strengths and career aspirations. At Behold Aspire, our mission is to eliminate guesswork from education planning. We combine rigorous psychological assessment methods with real-world industry mentoring."}
            </p>

            {/* Collapsible details */}
            {isExpanded && (
              <div className="space-y-4 mb-4 text-gray-600 text-base sm:text-lg leading-relaxed animate-fadeIn">
                <p>
                  Our proprietary evaluation framework assesses cognitive abilities, spatial reasoning, verbal comprehension, and innate behavioral inclinations. We don't just hand you a score report; we build a concrete, multi-year developmental roadmap.
                </p>
                <p>
                  Whether selecting high school streams, targeting premier universities, or navigating career pivots, our multidisciplinary team of CIGI-certified advisors and clinical psychologists ensures each student reaches their fullest potential.
                </p>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-[#00A8FF] text-sm font-bold mb-6 bg-transparent border-none cursor-pointer p-0 hover:text-[#00F0FF] transition-colors"
            >
              <span>{isExpanded ? 'Read Less' : 'Read More About Our Methodology'}</span>
              <span className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-180' : ''}`}>↓</span>
            </button>

            {/* Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {(settings.aboutSectionBullets || [
                'CIGI-Certified Aptitude Assessment (C-DAT)',
                '1-on-1 Personalized Mentorship Sessions',
                'Comprehensive Psychometric Evaluation',
                'Holistic Career & Stream Roadmapping'
              ]).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 transition hover:bg-[#00F0FF]/20">
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-7 py-3.5 bg-[#00F0FF] hover:bg-[#00d8e6] text-white font-black text-sm rounded-lg transition shadow-[0_0_15px_rgba(0,240,255,0.4)] border-none cursor-pointer flex items-center justify-center"
                >
                  Book a Session
                </button>
              )}
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-7 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-lg transition border border-gray-200 hover:border-[#00A8FF] cursor-pointer shadow-sm flex items-center justify-center"
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
