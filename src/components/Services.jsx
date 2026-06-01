import React from 'react';

export default function Services({ setView, onBookTherapist }) {
  return (
    <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-black text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand/5 rounded-[4px] glow-glow pointer-events-none" />

      {/* DUAL COUPLING ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch w-full">

        {/* SERVICE 2: CAREER COUNSELLING */}
        <div
          id="card-career"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[300px] md:min-h-[360px] group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-black text-white px-2.5 py-0.5 rounded-[4px] uppercase tracking-widest font-black font-mono">
                  Career Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                  Career Clarity & Direction
                </h3>
                <h4 className="text-xs font-bold text-black/50 italic mt-0.5">
                  Feeling Unsure About What’s Next?
                </h4>
              </div>
              <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-[4px] bg-white/50 backdrop-blur-xs font-mono">
                01
              </span>
            </div>
            <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
              Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('career_1'); // Pre-select a career advisor
              } else {
                window.location.hash = '#/booking';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md"
          >
            Book a Career Guidance Session
          </button>
        </div>

        {/* SERVICE 3: PSYCHOLOGICAL COUNSELLING */}
        <div
          id="card-mental"
          className="card-luxury card-luxury-hover p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[300px] md:min-h-[360px] group"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="inline-block text-[9px] bg-black text-white px-2.5 py-0.5 rounded-[4px] uppercase tracking-widest font-black font-mono">
                  Psychological Counselling
                </span>
                <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                  Emotional Wellbeing & Support
                </h3>
                <h4 className="text-xs font-bold text-black/50 italic mt-0.5">
                  You Don’t Have to Face It Alone.
                </h4>
              </div>
              <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-[4px] bg-white/50 backdrop-blur-xs font-mono">
                02
              </span>
            </div>
            <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
              When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.
            </p>
          </div>

          <button
            onClick={() => {
              if (onBookTherapist) {
                onBookTherapist('c3'); // Pre-select a personal counsellor
              } else {
                window.location.hash = '#/booking';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer w-full sm:w-auto text-center shadow-xs hover:shadow-md"
          >
            Talk to a Counsellor →
          </button>
        </div>

      </div>

    </section>
  );
}
