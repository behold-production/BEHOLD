import React from 'react';
import { motion } from 'framer-motion';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  return (
    <section id="about" className="bg-white overflow-hidden scroll-mt-20">

      <div className="flex flex-col lg:flex-row items-stretch">

        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-1/2 py-16 md:py-24 px-6 sm:px-10
            lg:pl-[max(3rem,calc((100vw-80rem)/2+2rem))]
            lg:pr-16 flex flex-col justify-center"
        >
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#00E5FF] block mb-4">
            ABOUT BEHOLD
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-normal text-slate-900 mb-6 leading-[1.12] tracking-tight">
            {settings.aboutTitle || (
              <>Building Strong<br />Foundations For<br />Student Success</>
            )}
          </h2>

          <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-[1.8] font-normal mb-8 max-w-lg">
            <p>
              {settings.aboutPara1 || 'Behold Aspire is dedicated to helping students, families, and individuals navigate career planning and personal growth across Kerala. With expert psychological counseling, C-DAT assessments, and mentor-led programs, we make the journey purposeful and transformative.'}
            </p>
            <p>
              {settings.aboutPara2 || 'From aptitude evaluations and career roadmaps to doorstep counseling and personalized school programs, our experienced team delivers solutions that reduce anxiety and ensure every student is ready to thrive.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                if (enablePsychology || enableCareerMentoring) {
                  window.spaNavigate?.('/booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center justify-center px-7 py-3.5 bg-slate-900 hover:bg-[#00E5FF] hover:text-slate-900 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-[0_4px_20px_rgba(0,229,255,0.35)] transition-all duration-300 cursor-pointer border-none"
            >
              Book a Session
            </button>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-7 py-3.5 border-2 border-slate-200 hover:border-[#00E5FF] text-slate-700 hover:text-[#00E5FF] rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer bg-transparent"
            >
              Take Aptitude Test
            </button>
          </div>
        </motion.div>

        {/* Right: Image — flush to right edge on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-0 py-6 lg:py-0 flex-shrink-0"
        >
          <div className="w-full h-[340px] sm:h-[420px] lg:h-full min-h-[480px] relative overflow-hidden lg:rounded-l-[32px]">
            <img
              src="/students_kerala.png"
              className="w-full h-full object-cover object-center"
              alt="Behold Aspire students in mentorship session"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop';
              }}
            />
            {/* Subtle neon gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>

    </section>
  );
}
