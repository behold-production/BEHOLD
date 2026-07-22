import React from 'react';

const features = [
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
    desc: "Every plan is tailored to the individual student's strengths, interests, and aspirations for a deeply personal experience.",
  },
];

export default function WhyChooseUs({ siteSettings }) {
  const stats = [
    { num: '10,000+', label: 'Sessions Completed' },
    { num: '500+',    label: 'Students Guided'    },
    { num: '98%',     label: 'Satisfaction Rate'  },
  ];

  return (
    <section id="why-choose-us" className="pt-16 sm:pt-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-gray-400 block mb-3">
            Why Choose Us
          </span>
          <h2
            id="why-choose-us-title"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight"
          >
            Built on Trust. Driven by Excellence.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
            We combine psychological expertise, personalized mentorship, and efficient processes to deliver guidance that helps every student achieve their goals.
          </p>
        </div>

        {/* 2x2 Feature Grid with clean borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-gray-200">
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-8 sm:p-10 border-b border-r border-gray-200 flex flex-col justify-between"
            >
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{feat.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Ready to get started CTA */}
        <div className="mt-16 flex flex-col items-start">
          <p className="text-sm sm:text-base text-gray-600 font-medium mb-4">Ready to get started?</p>
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-lg transition shadow-sm border-none cursor-pointer"
          >
            Book Appointment
          </button>
        </div>

      </div>

      {/* Full-width Black Stats Bar */}
      <div className="bg-gray-950 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-800">
            {stats.map(({ num, label }, idx) => (
              <div key={idx} className={`flex flex-col items-start ${idx > 0 ? 'pt-6 sm:pt-0 sm:pl-8' : ''}`}>
                <div className="text-4xl sm:text-5xl font-serif font-bold text-white mb-1 leading-none">{num}</div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
