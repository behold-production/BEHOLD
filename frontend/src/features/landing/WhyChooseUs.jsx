import React from 'react';
import { motion } from 'framer-motion';

const capsules = [
  {
    title: 'Expertise You Can Trust',
    desc: 'Our certified counselors and mentors provide research-backed guidance grounded in psychological science and career development.',
  },
  {
    title: 'End-To-End Support',
    desc: 'From aptitude assessment and stream selection to university guidance, we manage every milestone of the student journey.',
  },
  {
    title: 'Doorstep & Online Sessions',
    desc: 'Available at home, in school, or online — expert counseling designed around your schedule and comfort.',
  },
  {
    title: 'Student-Centric Approach',
    desc: 'Every plan is tailored to the individual student\'s strengths, interests, and aspirations for a deeply personal experience.',
  },
];

export default function WhyChooseUs({ siteSettings }) {
  return (
    <section id="why-choose-us" className="py-16 md:py-28 bg-[#f9fafb] overflow-hidden scroll-mt-20">
      <div className="flex flex-col lg:flex-row items-stretch max-w-[1600px] mx-auto">

        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[45%] px-6 sm:px-10 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-0 py-4 lg:py-0 flex items-center order-2 lg:order-1"
        >
          <div className="w-full overflow-hidden shadow-2xl rounded-[16px] lg:rounded-r-none lg:rounded-l-[16px]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
              className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover object-center"
              alt="Behold mentorship workshop session"
            />
          </div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full lg:w-[55%] py-10 lg:py-16 px-6 sm:px-10
            lg:pr-[max(3rem,calc((100vw-80rem)/2+2rem))]
            lg:pl-16 order-1 lg:order-2 flex flex-col justify-center"
        >
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#00E5FF] block mb-4">
            WHY CHOOSE US
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[48px] font-normal text-slate-900 mb-4 leading-[1.14] tracking-tight">
            Built on Trust.<br />Driven by Excellence.
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal mb-8 max-w-lg">
            We combine psychological expertise, personalized mentorship, and efficient processes to deliver
            guidance that helps every student achieve their goals with confidence and clarity.
          </p>

          {/* Capsule Pills */}
          <div className="space-y-3 sm:space-y-4">
            {capsules.map((cap, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * idx }}
                className="bg-white py-1 pl-1 pr-5 sm:pr-7 rounded-full border border-gray-200 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#00E5FF]/40 transition-all duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00E5FF] flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 mb-0.5 leading-snug">{cap.title}</h4>
                  <p className="text-[#666] text-[11px] sm:text-[12px] leading-snug font-normal">{cap.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
