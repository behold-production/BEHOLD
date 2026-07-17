import React from 'react';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

const reviews = [
  {
    text: "The career mentoring I received here completely changed my perspective. I was confused about what to do after my 12th, but the C-DAT and my mentor's guidance gave me a clear path forward.",
    author: "Sneha Menon",
    role: "Student, Class 12",
    initial: "S",
    stars: 5,
    color: "bg-blue-600",
  },
  {
    text: "As a parent, seeing my son struggle with exam anxiety was heartbreaking. The psychological counseling at BEHOLD was a turning point. He's now confident, focused, and much happier.",
    author: "Rajesh K.",
    role: "Parent",
    initial: "R",
    stars: 5,
    color: "bg-indigo-600",
  },
  {
    text: "The safe, non-judgmental space provided by the therapists here helped me overcome a very tough phase in my life. I highly recommend Behold to anyone seeking mental health support.",
    author: "Anjali V.",
    role: "Young Professional",
    initial: "A",
    stars: 5,
    color: "bg-pink-600",
  },
];

function Stars({ count = 5 }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ siteSettings }) {
  const settings = siteSettings || {};
  const firstHeroStat = Array.isArray(settings.heroStats) && settings.heroStats.length > 0
    ? `${settings.heroStats[0].num} ${settings.heroStats[0].label}`
    : '500+ Students Guided';

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-baseline gap-1 mb-4">
            <span className="text-sm font-bold tracking-widest uppercase text-blue-600">Testimonials</span>
            <ScrollDot nextId="faq-title" label="Scroll to FAQ ↓" size="xs" inlineText={true} />
          </div>
          <h2 id="reviews-title" className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('What Our Community Says', 'faq-title', 'Scroll to FAQ ↓', 'md')}
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Real stories from students, parents, and professionals who found clarity and support through BEHOLD.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <Stars count={rev.stars} />
              <p className="text-gray-700 leading-relaxed mb-6 flex-1 text-base">
                &ldquo;{rev.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className={`w-11 h-11 ${rev.color} text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0`}>
                  {rev.initial}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{rev.author}</h4>
                  <p className="text-gray-400 text-xs font-semibold">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust row */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span>4.9 / 5 Average Rating</span>
          </div>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{firstHeroStat}</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span>100% Confidential Sessions</span>
        </div>

      </div>
    </section>
  );
}
