import React from 'react';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Expertise You Can Trust',
    desc: 'Our certified counselors and mentors provide research-backed guidance grounded in psychological science and career development.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'End-To-End Support',
    desc: 'From aptitude assessment and stream selection to university guidance, we manage every milestone of the student journey.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Student-Centric Approach',
    desc: "Every plan is tailored to the individual student's strengths, interests, and aspirations for a deeply personal experience.",
    color: 'bg-pink-50 text-pink-600',
  },
];

export default function WhyChooseUs({ siteSettings }) {
  return (
    <section id="why-choose-us" className="py-14 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-sm font-bold tracking-widest uppercase text-blue-600 block mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Built on Trust.<br className="hidden sm:inline" /> Driven by Excellence.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We combine psychological expertise, personalized mentorship, and efficient processes to deliver guidance that helps every student achieve their goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${feat.color}`}>
                {feat.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-2xl font-black text-white mb-1">Ready to get started?</h3>
            <p className="text-blue-200">Book your first session today — no commitment required.</p>
          </div>
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0 }); }}
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition shrink-0 border-none cursor-pointer shadow-lg"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
