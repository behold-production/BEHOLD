import React from 'react';

const PILLARS = [
  {
    title: 'Extended Mentorship',
    desc: 'We guide students through milestones to turn assessment reports into real achievements.'
  },
  {
    title: 'Doorstep & Online Counseling',
    desc: 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.'
  },
  {
    title: 'Personalized School Programs',
    desc: 'We conduct orientations and workshops to build healthy learning environments in schools.'
  },
  {
    title: 'C-DAT & Career Roadmaps',
    desc: 'We use aptitude evaluations to match university pathways with individual natural talents.'
  },
  {
    title: 'Goal Tracking',
    desc: 'We provide continuous reviews to keep students on track with their long-term goals.'
  },
  {
    title: 'Parent Guidance',
    desc: 'We guide parents to reduce academic friction and relieve student stress.'
  }
];

export default function About({ enablePsychology = true, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const pillars = [
    {
      title: settings.offer1Title || 'Extended Mentorship',
      desc: settings.offer1Desc || 'We guide students through milestones to turn assessment reports into real achievements.'
    },
    {
      title: settings.offer2Title || 'Doorstep & Online Counseling',
      desc: settings.offer2Desc || 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.'
    },
    {
      title: settings.offer3Title || 'Personalized School Programs',
      desc: settings.offer3Desc || 'We conduct orientations and workshops to build healthy learning environments in schools.'
    },
    {
      title: settings.offer4Title || 'C-DAT & Career Roadmaps',
      desc: settings.offer4Desc || 'We use aptitude evaluations to match university pathways with individual natural talents.'
    },
    {
      title: settings.offer5Title || 'Goal Tracking',
      desc: settings.offer5Desc || 'We provide continuous reviews to keep students on track with their long-term goals.'
    },
    {
      title: settings.offer6Title || 'Parent Guidance',
      desc: settings.offer6Desc || 'We guide parents to reduce academic friction and relieve student stress.'
    }
  ];

  return (
    <section id="about" className="py-4 md:py-6 px-4 sm:px-6 text-zinc-900 text-left grid-bg relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Header Column */}
        <div className="max-w-3xl mx-auto text-center space-y-1.5">
          <span className="text-xs bg-zinc-900 text-white px-3.5 py-1 rounded-md capitalize  font-semibold w-fit mx-auto block">
            Why Choose Us
          </span>
          <h2 className="text-2xl md:text-3xl font-header font-black tracking-tight text-zinc-900 leading-[1.1] capitalize">
            {settings.aboutTitle || 'What We Offer'}
          </h2>
          <p className="text-zinc-650 font-sans text-xs sm:text-sm font-light leading-relaxed">
            {settings.aboutSub || 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.'}
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {pillars.map((pillar, idx) => {
            return (
              <div
                key={idx}
                className="bg-white hover:bg-zinc-50/70 border-neon-glow border-neon-glow-hover rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group font-sans"
              >
                <div className="space-y-1">
                  {/* Typographic numbers instead of generic icons */}
                  <span className="font-header font-bold text-base sm:text-lg text-zinc-300 group-hover:text-brand transition-colors duration-300 block">
                    {`0${idx + 1}`}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-header font-bold text-sm sm:text-base capitalize  text-zinc-900 group-hover:text-brand-dark transition-colors duration-300">
                      {pillar.title}
                    </h4>
                    <p className="text-zinc-550 font-sans text-xs font-normal leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="pt-1 flex justify-center w-full">
          <button
            type="button"
            onClick={() => {
              if (enablePsychology) {
                window.spaNavigate('/booking');
              } else {
                window.spaNavigate('/sample-test');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="min-h-[40px] px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs capitalize  rounded-lg transition-all duration-200 cursor-pointer shadow-sm w-full sm:w-auto text-center border-none"
          >
            {enablePsychology ? 'Get Started with Behold' : 'Explore Aptitude Assessment'}
          </button>
        </div>

      </div>

    </section>
  );
}
