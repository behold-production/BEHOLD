import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '1',
    title: 'Free Consultation',
    desc: 'We understand your goals, academic background, and aspirations, then recommend the best counseling or assessment solution.',
  },
  {
    num: '2',
    title: 'Assessment',
    desc: 'Students complete the C-DAT aptitude test or psychological screening, designed to reveal natural strengths and career domains.',
  },
  {
    num: '3',
    title: 'Personalized Roadmap',
    desc: 'Our mentors interpret results and build a tailored career roadmap — stream selection, university pathways, and goal milestones.',
  },
  {
    num: '4',
    title: 'Ongoing Mentorship',
    desc: 'Regular follow-up sessions, parent guidance, and goal tracking ensure the student stays on course and achieves their milestones.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-10 md:py-28 bg-white overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-neon-blue-mid block mb-4">
            OUR PROCESS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-normal text-neon-blue-deep mb-4 leading-[1.18] tracking-tight font-serif">
            A Simple Path To<br className="hidden sm:inline" /> Student Success
          </h2>
          <p className="text-ink-soft text-sm sm:text-base leading-relaxed font-normal max-w-2xl mx-auto font-sans">
            We make mentorship and career guidance straightforward with a clear, structured process —
            guiding every student from initial consultation to confident career clarity.
          </p>
        </motion.div>

        {/* Steps Grid with Dotted Connectors */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-6 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="text-center relative group"
            >
              {/* Horizontal dotted connector (desktop only, not last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[46px] left-[calc(50%+56px)] w-[calc(100%-112px)] border-t-[3px] border-dotted border-line" />
              )}

              {/* Circle Number */}
              <div className="w-[92px] h-[92px] rounded-full bg-paper flex items-center justify-center mx-auto mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-line group-hover:border-gold group-hover:shadow-[0_8px_30px_rgba(6,14,32,0.12)] transition-all duration-300">
                <span className="text-4xl sm:text-5xl font-black text-neon-blue-deep group-hover:text-gold-soft leading-none font-serif transition-colors">
                  {step.num}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-neon-blue-deep mb-3 tracking-tight font-sans">{step.title}</h3>
              <p className="text-ink-soft text-xs sm:text-sm leading-relaxed max-w-[250px] mx-auto font-normal font-sans">
                {step.desc}
              </p>

              {/* Vertical dotted connector (mobile/tablet only, not last item) */}
              {idx < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-6">
                  <div className="h-10 border-l-[3px] border-dotted border-line" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
