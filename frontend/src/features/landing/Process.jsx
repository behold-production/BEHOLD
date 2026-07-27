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
    <section id="process" className="py-20 sm:py-28 bg-white text-surface-900 border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-[#00e5ff] flex items-center justify-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            HOW IT WORKS
          </span>
          <h2 id="process-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#0f172a] mb-4 tracking-tight leading-none">
            Four Steps To Clarity<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-600 font-normal leading-relaxed">
            Zero cognitive friction. A clear, stress-free pathway from initial selection to ongoing mentorship.
          </p>
        </div>

        {/* Steps Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 rounded-2xl bg-white border border-surface-200 hover:border-[#00e5ff] transition-all duration-300 min-h-[220px] shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-4xl font-black text-[#0f172a] font-sans group-hover:text-[#00e5ff] transition-colors">
                    {step.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                </div>

                <h3 className="text-base font-bold text-[#0f172a] uppercase mb-2 font-sans">{step.title}</h3>
                <p className="text-surface-600 text-xs leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-surface-100 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00e5ff]">STEP {step.num}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-8 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border border-[#00e5ff]/30 shadow-sm inline-flex items-center gap-2"
          >
            <span>Start Your Session Today</span>
            <span className="text-xs text-[#00e5ff]">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
