import React, { useState } from 'react';
import { renderTitleWithFullstopDot } from '../../shared/components/BrandDot';
import jpg3 from '../../assets/jpg3.jpg';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const settings = siteSettings || {};

  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Illustration & Stats (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm h-80 sm:h-96 relative mb-6">
              <img
                src={jpg3}
                alt="Student mentorship"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 block mb-1">Personalized Mentorship</span>
                <p className="text-lg font-serif font-bold leading-snug">Expert Advice Tailored for Your Growth</p>
              </div>
            </div>

            {/* Clean Stats Box */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center divide-x divide-gray-100">
              {[
                { num: '10,000+', label: 'Students Advised', value: settings.statsStudents },
                { num: '500+',    label: 'Careers Mapped',   value: settings.statsCareers  },
                { num: '98%',     label: 'Success Rate',     value: settings.statsRate     },
              ].map(({ num, label, value }, idx) => (
                <div key={label} className={idx > 0 ? 'pl-4' : ''}>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1 leading-none">{value || num}</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
                {settings.aboutSectionSub || 'Why We Exist'}
              </span>
              <h2 id="about-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-gray-900 leading-tight mb-6">
                {renderTitleWithFullstopDot(settings.aboutSectionTitle || 'Pioneering Comprehensive Student Assessment & Mentorship.', 'why-us-title', 'Scroll to Why Choose Us ↓', 'lg')}
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 font-normal">
                {settings.aboutSectionDesc || "Every student possesses unique cognitive strengths and career aspirations. At Behold Aspire, our mission is to eliminate guesswork from education planning. We combine rigorous psychological assessment methods with real-world industry mentoring."}
              </p>

              {/* Collapsible details */}
              {isExpanded && (
                <div className="space-y-4 mb-4 text-gray-600 text-sm sm:text-base leading-relaxed font-normal animate-fadeIn">
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
                className="inline-flex items-center gap-1.5 text-gray-900 text-xs font-semibold mb-8 bg-transparent border-none cursor-pointer p-0 underline hover:opacity-70 transition-opacity"
              >
                <span>{isExpanded ? 'Read less' : 'Read more about our methodology'}</span>
                <span className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-180' : ''}`}>↓</span>
              </button>

              {/* Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {(settings.aboutSectionBullets || [
                  'CIGI-Certified Aptitude Assessment (C-DAT)',
                  '1-on-1 Personalized Mentorship Sessions',
                  'Comprehensive Psychometric Evaluation',
                  'Holistic Career & Stream Roadmapping'
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-gray-900 mt-1.5 shrink-0"></span>
                    <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-lg transition shadow-sm border-none cursor-pointer"
                >
                  Book a Session
                </button>
              )}
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-sm rounded-lg transition border border-gray-300 cursor-pointer shadow-sm"
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
