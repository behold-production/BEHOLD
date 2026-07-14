import React from 'react';
import { motion } from 'framer-motion';

export default function Reviews() {
  const testimonials = [
    {
      id: 1,
      text: "The career mentoring I received here completely changed my perspective. I was confused about what to do after my 12th, but the C-DAT and my mentor's guidance gave me a clear path forward.",
      author: "Sneha Menon",
      role: "Student",
    },
    {
      id: 2,
      text: "As a parent, seeing my son struggle with exam anxiety was heartbreaking. The psychological counseling at Behold Aspire was a turning point. He's now confident, focused, and much happier.",
      author: "Rajesh K.",
      role: "Parent",
    },
    {
      id: 3,
      text: "The safe, non-judgmental space provided by the therapists here helped me overcome a very tough phase in my life. I highly recommend Behold to anyone seeking mental health support.",
      author: "Anjali V.",
      role: "Professional",
    }
  ];

  return (
    <section id="reviews" className="py-20 md:py-28 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#C89B3C] font-bold block mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-neon-blue-deep mb-6 leading-tight">
            What Our Community Says
          </h2>
          <p className="text-ink-soft text-sm md:text-base leading-relaxed">
            Read about the experiences of students, parents, and individuals who have found clarity and healing through Behold Aspire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-[#E9EDE4] flex flex-col justify-between"
            >
              <div>
                <svg className="w-8 h-8 text-[#C89B3C]/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <p className="text-ink-soft leading-relaxed text-sm md:text-base mb-8">
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-[#E9EDE4] pt-5">
                <div className="w-10 h-10 rounded-full bg-[#152B52]/5 flex items-center justify-center text-[#152B52] font-bold text-sm">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#152B52] text-sm">{testimonial.author}</h4>
                  <p className="text-xs text-ink-soft">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
