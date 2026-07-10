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
          <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#00E5FF] block mb-3">
            OUR PROCESS
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-normal text-slate-900 mb-4 leading-[1.18] tracking-tight">
            A Simple Path To<br className="hidden sm:inline" /> Student Success
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-normal max-w-2xl mx-auto">
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
              className="text-center relative"
            >
              {/* Horizontal dotted connector (desktop only, not last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[46px] left-[calc(50%+56px)] w-[calc(100%-112px)] border-t-2 border-dotted border-[#00E5FF]/50" />
              )}

              {/* Circle Number */}
              <div className="w-[92px] h-[92px] rounded-full bg-[#00E5FF]/15 flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#00E5FF]/20">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-none font-header">
                  {step.num}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 tracking-tight">{step.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[250px] mx-auto font-normal">
                {step.desc}
              </p>

              {/* Vertical dotted connector (mobile/tablet only, not last item) */}
              {idx < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-5">
                  <div className="h-10 border-l-[3px] border-dotted border-[#00E5FF]/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
