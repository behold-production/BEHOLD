import React from 'react';
import { 
  Compass, HeartHandshake, Users, GraduationCap, CheckCircle2, Heart 
} from 'lucide-react';

const PILLARS = [
  {
    icon: Compass,
    title: 'Extended Mentorship',
    desc: 'We support students across academic quarters, mapping milestones that translate assessment reports into real higher education achievements.'
  },
  {
    icon: HeartHandshake,
    title: 'Doorstep & Online Counselling',
    desc: 'By visiting students directly inside their homes or providing virtual sessions, we alleviate clinical barriers and ensure complete emotional privacy.'
  },
  {
    icon: Users,
    title: 'Personalized School Programs',
    desc: 'Conducting in-school orientations, student alignments, and focus workshops to configure healthy learning environments.'
  },
  {
    icon: GraduationCap,
    title: 'CDAT & Career Roadmaps',
    desc: 'Rigorous stream mapping and aptitude evaluations matching university pathways with individual natural talents.'
  },
  {
    icon: CheckCircle2,
    title: 'Goal Tracking',
    desc: 'Continuous checks and developmental reviews ensuring students stay oriented toward their long-term developmental milestones.'
  },
  {
    icon: Heart,
    title: 'Parent Guidance',
    desc: 'Aligning family environments to reduce academic friction, stream-selection conflicts, and stress.'
  }
];

export default function About() {
  return (
    <section id="about" className="py-12 md:py-24 px-4 sm:px-6 text-black text-left grid-bg relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 md:space-y-24">
        
        {/* Header Column */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-[4px] uppercase tracking-wider font-extrabold w-fit mx-auto block">
            Why Us & What We Offer
          </span>
          <h2 className="text-3xl md:text-5xl font-header font-black tracking-tight text-gray-900 leading-[1.1] uppercase">
            Why Choose Us & What We Offer
          </h2>
          <p className="text-black/60 font-sans text-sm md:text-base font-light leading-relaxed">
            At BEHOLD, we go beyond traditional career guidance by offering extended mentorship, doorstep psychological counselling, and personalized career support directly within schools and student spaces.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center shrink-0 bg-white hover:bg-white/95 border border-black/5 rounded-[4px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div className="space-y-6">
                  <div className="w-10 h-10 rounded-[4px] bg-black/5 text-black flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-black group-hover:text-brand">
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-header font-bold text-xs uppercase tracking-wider text-black group-hover:text-brand transition-colors duration-300">
                      {pillar.title}
                    </h4>
                    <p className="text-black/55 font-sans text-[11px] font-light leading-relaxed">
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
            onClick={() => {
              window.location.hash = '#/booking';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-[4px] transition-all duration-200 cursor-pointer shadow-sm w-full sm:w-auto text-center"
          >
            Get Started with Behold
          </button>
        </div>

      </div>

    </section>
  );
}
