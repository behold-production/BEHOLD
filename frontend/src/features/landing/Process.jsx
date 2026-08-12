import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Choose Service & Expert',
    desc: 'Select Psychological Counselling, Career Mentoring, or Aptitude Testing, and pick your preferred certified advisor.',
  },
  {
    num: '02',
    title: 'Pick Slot & Secure Checkout',
    desc: 'Choose a date and time slot that suits your schedule. Pay seamlessly and safely via Razorpay.',
  },
  {
    num: '03',
    title: '1-on-1 Confidential Session',
    desc: 'Join your private video session via instant Google Meet delivery from your email or personal student portal.',
  },
  {
    num: '04',
    title: 'Action Plan & Ongoing Growth',
    desc: 'Receive personalized recommendations, assessment reports, and follow-up guidance for lasting peace of mind.',
  },
];

export default function Process() {
  return (
    <section id="process" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#00c9d6] tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
            How It Works
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
          </span>
          <h2 id="process-title" className="text-3xl sm:text-5xl font-sans font-bold text-[#0f172a] mb-4 tracking-tight leading-none">
            Four Steps To Clarity<span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.8)] font-bold">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-600 font-medium leading-relaxed">
            Zero cognitive friction. A clear, stress-free pathway from initial selection to ongoing mentorship.
          </p>
        </div>

        {/* Steps Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const delayClass = idx === 0 ? 'reveal-delay-1' : idx === 1 ? 'reveal-delay-2' : idx === 2 ? 'reveal-delay-3' : 'reveal-delay-4';
            return (
              <div
                key={idx}
                className={`flex flex-col justify-between p-7 rounded-xl bg-white border border-surface-200 hover-scale-card hover:border-[#00c9d6] transition-all duration-300 min-h-[220px] shadow-xs group reveal-on-scroll reveal-scale-in ${delayClass}`}
              >
              <div>
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-4xl font-bold text-[#0f172a] font-sans group-hover:text-[#00c9d6] transition-colors">
                    {step.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00c9d6] shadow-[0_0_6px_#00c9d6]" />
                </div>

                <h3 className="text-base font-bold text-[#0f172a] mb-2 font-sans">{step.title}</h3>
                <p className="text-surface-600 text-xs leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-surface-100 mt-4">
                <span className="text-[10px] font-bold tracking-widest text-[#007078]">Step {step.num}</span>
              </div>
            </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-8 py-3.5 bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold text-xs tracking-wider rounded-full transition-all cursor-pointer border-none shadow-sm inline-flex items-center gap-2 hover-scale-btn"
          >
            <span>Start Your Session Today</span>
            <span className="text-xs text-[#00c9d6]">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
