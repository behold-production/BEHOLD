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
    <section id="why-choose-us" className="py-20 sm:py-24 bg-[#f7f4ef] text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7c7069] block mb-2">
            WHAT WE DO & WHY BEHOLD
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-semibold text-[#1c1514] uppercase tracking-wide leading-tight mb-4">
            Grounded in Psychological Science.
          </h2>
          <p className="text-[#6e635e] text-sm leading-relaxed font-normal">
            We provide a calm, reassuring, and scientifically backed environment to help students and parents make confident choices with complete peace of mind.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#eae4dc] rounded-2xl p-7 sm:p-8 border border-[#d6cecb] hover:border-[#2b211e] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#f7f4ef] text-[#2b211e] border border-[#d8d0c7] inline-block">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1c1514] uppercase mb-2 font-sans">{item.title}</h3>
                <p className="text-[#6e635e] text-xs sm:text-sm leading-relaxed font-normal mb-6">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#d6cecb] flex items-center text-[#2b211e] text-xs font-bold uppercase tracking-widest">
                <span>Learn how we support you</span>
                <span className="ml-1 text-xs">›</span>
              </div>
            </div>
          ))}
        </div>

        {/* Banner - Dark Espresso Highlight Card */}
        <div className="mt-12 bg-[#2b211e] text-[#f7f4ef] rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-[#d8d0c7]">
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight mb-2 text-[#f7f4ef]">Ready to experience peace & clarity?</h3>
            <p className="text-[#e2dad2] text-xs max-w-xl font-normal leading-relaxed">
              Book a confidential 1-on-1 session with a certified psychologist or career advisor today.
            </p>
          </div>
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-8 py-3.5 bg-[#f7f4ef] hover:bg-white text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shrink-0 border-none cursor-pointer shadow-sm"
          >
            GET STARTED ›
          </button>
        </div>

      </div>
    </section>
  );
}
