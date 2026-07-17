import React, { useState } from 'react';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Expertise You Can Trust',
    desc: 'Our certified counselors and mentors provide research-backed guidance grounded in psychological science and career development.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'End-To-End Support',
    desc: 'From aptitude assessment and stream selection to university guidance, we manage every milestone of the student journey.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'Doorstep & Online Sessions',
    desc: 'Available at home, in school, or online — expert counseling designed around your schedule and comfort.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Student-Centric Approach',
    desc: "Every plan is tailored to the individual student's strengths, interests, and aspirations for a deeply personal experience.",
    color: 'bg-pink-50 text-pink-600',
  },
];

/* Inline clamp helper */
function ReadMore({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p
        className="text-gray-500 text-xs leading-relaxed"
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: open ? 'unset' : 2,
          overflow: 'hidden',
        }}
      >
        {text}
      </p>
      <button
        onClick={() => setOpen(o => !o)}
        className="mt-0.5 text-[10px] font-semibold text-blue-500 bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-0.5 hover:opacity-70 transition-opacity"
      >
        {open ? 'Less' : 'More'}
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

export default function WhyChooseUs({ siteSettings }) {
  const count = features.length;
  // ≤4 items: 2-col grid; >4 items: wrap centered flex
  const useWrap = count > 4;

  return (
    <section id="why-choose-us" className="py-14 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-blue-600 block mb-3">
            Why Choose Us
          </span>
          <h2 id="why-choose-us-title" className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('Built on Trust. Driven by Excellence', 'aptitude-title', 'Scroll to C-DAT Assessment ↓', 'md')}
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            We combine psychological expertise, personalized mentorship, and efficient processes to deliver guidance that helps every student achieve their goals.
          </p>
        </div>

        {/* Feature cards */}
        {useWrap ? (
          /* Wrap + center when >4 */
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-3 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.33%-11px)]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                  {feat.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{feat.title}</h3>
                  <ReadMore text={feat.desc} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2-col grid for ≤4 items */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                  {feat.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{feat.title}</h3>
                  <ReadMore text={feat.desc} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA strip */}
        <div className="mt-8 bg-blue-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-black text-white mb-0.5">Ready to get started?</h3>
            <p className="text-blue-200 text-sm">Book your first session today — no commitment required.</p>
          </div>
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0 }); }}
            className="px-6 py-3 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition shrink-0 border-none cursor-pointer shadow-lg"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
