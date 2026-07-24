import React from 'react';

export default function WhyChooseUs({ siteSettings }) {
  const pillars = [
    {
      badge: 'Certified Care',
      title: 'Expertise Grounded in Psychological Science',
      desc: 'Our CIGI-certified psychologists and mentors bring structured guidance to relieve stress and establish personal clarity.'
    },
    {
      badge: '100% Confidential',
      title: 'Private & Secure Online Sessions',
      desc: 'Every session takes place in a confidential environment with instant Google Meet delivery and strict data protection.'
    },
    {
      badge: 'Scientific Assessment',
      title: 'Proven C-DAT Aptitude Mapping',
      desc: 'Discover strengths in verbal, numerical, spatial, and mechanical reasoning through empirical psychometric evaluation.'
    },
    {
      badge: 'Lifelong Growth',
      title: 'Personalized Career & Academic Mentoring',
      desc: 'Tailored stream selection for Class 8–12 and college planning with lifetime progress tracking in your personal portal.'
    }
  ];

  return (
    <section id="why-choose-us" className="py-16 sm:py-20 bg-white text-slate-900 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold mb-3">
            Why Choose BEHOLD
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
            Built on Trust. Grounded in Psychological Science.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed font-normal">
            We provide a calm, reassuring, and scientifically backed environment to help students and parents make confident choices without stress.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mb-5">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center text-slate-900 text-xs font-semibold">
                <span>Learn how we support you</span>
              </div>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="mt-10 bg-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 text-white">Ready to take the first step towards peace & clarity?</h3>
            <p className="text-slate-300 text-xs max-w-xl font-normal">
              Book a confidential 1-on-1 session with a certified psychologist or career advisor today.
            </p>
          </div>
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-lg transition-colors shrink-0 border-none cursor-pointer"
          >
            Book Appointment
          </button>
        </div>

      </div>
    </section>
  );
}
