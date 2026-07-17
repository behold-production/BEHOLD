import React, { useState } from 'react';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const [expanded, setExpanded] = useState(false);
  const settings = siteSettings || {};

  // All defaults exactly match the admin panel's original values
  const aboutTitle = settings.aboutTitle || 'What We Offer';
  const aboutSub = settings.aboutSub || 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.';
  const para1 = settings.aboutPara1 || 'Behold Aspire is dedicated to helping students, families, and individuals navigate career planning and personal growth across Kerala. With expert psychological counseling, C-DAT assessments, and mentor-led programs, we make the journey purposeful and transformative.';
  const para2 = settings.aboutPara2 || 'From aptitude evaluations and career roadmaps to doorstep counseling and personalized school programs, our experienced team delivers solutions that reduce anxiety and ensure every student is ready to thrive.';

  const offers = [
    { title: settings.offer1Title || 'Extended Mentorship', desc: settings.offer1Desc || 'We guide students through milestones to turn assessment reports into real achievements.' },
    { title: settings.offer2Title || 'Doorstep & Online Counseling', desc: settings.offer2Desc || 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.' },
    { title: settings.offer3Title || 'Personalized School Programs', desc: settings.offer3Desc || 'We conduct orientations and workshops to build healthy learning environments in schools.' },
    { title: settings.offer4Title || 'C-DAT & Career Roadmaps', desc: settings.offer4Desc || 'We use aptitude evaluations to match university pathways with individual natural talents.' },
  ];

  const stats = [
    { value: '10+', label: 'Years Experience' },
    { value: '500+', label: 'Students Guided' },
    { value: '50+', label: 'Expert Mentors' },
    { value: '98%', label: 'Success Rate' },
  ];

  return (
    <section id="about" className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-10 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full translate-y-6 -translate-x-6 opacity-50"></div>

              {/* Stats Grid */}
              <div className="relative grid grid-cols-2 gap-4">
                {stats.map(({ value, label }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 text-center shadow-md">
                    <div className="text-3xl font-black text-blue-600 mb-1">{value}</div>
                    <div className="text-sm text-gray-500 font-medium">{label}</div>
                  </div>
                ))}
              </div>

              {/* Bottom badge */}
              <div className="relative mt-4 bg-blue-600 text-white rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm">CIGI Certified</div>
                  <div className="text-blue-200 text-xs">Trusted Aptitude Assessment Partner</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <span className="text-sm font-bold tracking-widest uppercase text-blue-600 block mb-4">
              About Behold
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {aboutTitle}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-3 max-w-prose">{aboutSub}</p>

            {/* Collapsible body */}
            <div
              style={{ maxHeight: expanded ? '300px' : '0', opacity: expanded ? 1 : 0 }}
              className="overflow-hidden transition-all duration-500 ease-in-out text-gray-600 text-sm leading-relaxed"
            >
              <p className="mb-3">{para1}</p>
              <p>{para2}</p>
            </div>

            <button
              onClick={() => setExpanded(e => !e)}
              className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold mb-6 bg-transparent border-none cursor-pointer p-0 hover:text-blue-700 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
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
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{offer.title}</div>
                    <div className="text-gray-500 text-xs leading-snug mt-0.5">{offer.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0 }); }}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all border-none cursor-pointer shadow-lg shadow-blue-100"
                >
                  Book a Session
                </button>
              )}
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300 cursor-pointer"
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
