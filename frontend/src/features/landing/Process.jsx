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
    <section id="process" className="py-16 sm:py-20 bg-white text-slate-900 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold mb-3">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
            How Your Journey to Peace & Growth Works
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed font-normal">
            Zero cognitive friction. A clear, stress-free pathway from initial selection to ongoing mentorship.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col items-start p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-slate-900 text-white">
                  Step {step.num}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-block px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border-none shadow-xs"
          >
            Start Your Session Today
          </button>
        </div>

      </div>
    </section>
  );
}
