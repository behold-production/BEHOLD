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

export default function About({ enablePsychology = true }) {
  return (
    <section id="about" className="py-8 md:py-12 px-4 sm:px-6 text-zinc-900 text-left grid-bg relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-brand/10 rounded-lg glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-20">

        {/* Header Column */}
        <div className="max-w-3xl mx-auto text-center space-y-3.5">
          <span className="text-xs bg-zinc-900 text-white px-3.5 py-1 rounded-md capitalize  font-semibold w-fit mx-auto block">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-5xl font-header font-black tracking-tight text-zinc-900 leading-[1.1] capitalize">
            What We Offer
          </h2>
          <p className="text-zinc-600 font-sans text-sm md:text-base font-light leading-relaxed">
            We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PILLARS.map((pillar, idx) => {
            return (
              <div
                key={idx}
                className="bg-white hover:bg-zinc-50/70 border border-zinc-200 rounded-lg lg:rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_-10px_rgba(9,14,26,0.20),0_2px_12px_-2px_rgba(0,209,209,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(9,14,26,0.30),0_6px_20px_-3px_rgba(0,209,209,0.16)] hover:border-brand/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group font-sans"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Typographic numbers instead of generic icons */}
                  <span className="font-header font-bold text-2xl sm:text-3xl text-zinc-300 group-hover:text-brand transition-colors duration-300">
                    {`0${idx + 1}`}
                  </span>
                  <div className="space-y-1.5 sm:space-y-2">
                    <h4 className="font-header font-bold text-lg sm:text-xl capitalize  text-zinc-900 group-hover:text-brand-dark transition-colors duration-300">
                      {pillar.title}
                    </h4>
                    <p className="text-zinc-550 font-sans text-sm sm:text-base font-normal leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="pt-4 flex justify-center w-full">
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
            className="min-h-[48px] px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs capitalize  rounded-lg transition-all duration-200 cursor-pointer shadow-sm w-full sm:w-auto text-center"
          >
            {enablePsychology ? 'Get Started with Behold' : 'Explore Aptitude Assessment'}
          </button>
        </div>

      </div>

    </section>
  );
}
