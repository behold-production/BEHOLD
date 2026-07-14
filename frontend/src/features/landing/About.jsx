import React from 'react';
import { motion } from 'framer-motion';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  return (
    <section id="about" className="bg-[#F2F4EF] overflow-hidden scroll-mt-20 border-t border-line">

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
          <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-gold block mb-4 font-mono">
            ABOUT BEHOLD
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-semibold text-neon-blue-deep mb-6 leading-[1.12] tracking-tight font-serif">
            {settings.aboutTitle || (
              <>Building Strong<br />Foundations For<br />Student Success</>
            )}
          </h2>

          <div className="space-y-4 text-ink-soft text-sm sm:text-base leading-[1.8] font-normal mb-8 max-w-lg font-sans">
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
              className="inline-flex items-center justify-center px-7 py-3.5 bg-neon-blue-deep hover:bg-neon-blue-mid text-white rounded-sm font-semibold text-sm shadow-sm transition-all duration-300 cursor-pointer border-none active:translate-y-[1px]"
            >
              Book a Session
            </button>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-7 py-3.5 border border-line hover:border-gold text-ink-soft hover:text-gold rounded-sm font-semibold text-sm transition-all duration-300 cursor-pointer bg-transparent active:translate-y-[1px]"
            >
              Take Aptitude Test
            </button>
          </div>
        </motion.div>

        {/* Right: Image — centered with proper padding and containment */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-12 py-8 lg:py-16 flex items-center justify-center flex-shrink-0"
        >
          <div className="w-full max-w-[520px] relative flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-[360px] lg:h-[480px] object-cover shadow-2xl rounded-[32px]"
              alt="Behold Aspire mentorship session"
            />
            {/* Soft decorative blob */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C89B3C]/20 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#152B52]/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>
        </motion.div>
      </div>

    </section>
  );
}
