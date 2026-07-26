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
    <section id="process" className="py-20 sm:py-28 bg-[#eae4dc] text-[#1c1514] border-b border-[#d8d0c7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7c7069] block mb-2">
            OUR PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-black text-[#1c1514] uppercase tracking-tight leading-tight mb-4">
            How Your Journey Works.
          </h2>
          <p className="text-[#6e635e] text-sm leading-relaxed font-normal">
            Zero cognitive friction. A clear, stress-free pathway from initial selection to ongoing mentorship.
          </p>
        </div>

        {/* Steps Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 rounded-2xl bg-[#f7f4ef] border border-[#d6cecb] hover:border-[#2b211e] transition-all duration-300 min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="text-4xl font-black text-[#2b211e] font-sans">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1c1514] uppercase mb-2 font-sans">{step.title}</h3>
                <p className="text-[#6e635e] text-xs leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e2dad2] mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a7e77]">STEP {step.num}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <button
            onClick={() => { window.spaNavigate?.('/booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-8 py-3.5 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border-none shadow-sm inline-flex items-center gap-2"
          >
            <span>Start Your Session Today</span>
            <span className="text-xs">›</span>
          </button>
        </div>

      </div>
    </section>
  );
}
