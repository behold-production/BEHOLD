import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Free Consultation',
    desc: 'We understand your goals, academic background, and aspirations, then recommend the best counseling or assessment solution.',
  },
  {
    num: '02',
    title: 'C-DAT Assessment',
    desc: 'Students complete the C-DAT aptitude test or psychological screening, designed to reveal natural strengths and career domains.',
  },
  {
    num: '03',
    title: 'Personalized Roadmap',
    desc: 'Our mentors interpret results and build a tailored career roadmap — stream selection, university pathways, and goal milestones.',
  },
  {
    num: '04',
    title: 'Ongoing Mentorship',
    desc: 'Regular follow-up sessions, parent guidance, and goal tracking ensure the student stays on course and achieves their milestones.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight">
            A Simple Path to Student Success.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal max-w-xl mx-auto">
            We make mentorship and career guidance straightforward with a clear, structured process from initial consultation to confident career clarity.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-start relative group p-6 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-900 text-white flex items-center justify-center font-serif font-bold text-lg mb-6 shadow-sm">
                {step.num}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
