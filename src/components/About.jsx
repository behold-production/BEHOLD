import React, { useState } from 'react';
import { ShieldCheck, Award, HeartHandshake, Compass, Users } from 'lucide-react';

const STORY_TABS = [
  {
    id: 'mentorship',
    icon: Compass,
    title: 'Extended Mentorship',
    desc: 'We support students across academic quarters, mapping milestones that translate assessment reports into real higher education achievements.'
  },
  {
    id: 'doorstep',
    icon: HeartHandshake,
    title: 'Doorstep Counselling',
    desc: 'By visiting students directly inside their homes or preferred learning environments, we alleviate clinical barriers and ensure complete emotional privacy.'
  },
  {
    id: 'school',
    icon: Users,
    title: 'Personalized Career Support',
    desc: 'Conducting in-school orientations, parent alignments, and focus workshops to configure healthy environments for student career decisions.'
  }
];

export default function About({ setView }) {
  const [activeTab, setActiveTab] = useState('mentorship');

  return (
    <section id="about" className="py-24 md:py-32 px-4 sm:px-6 text-black text-left grid-bg relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Text & Tab Selector */}
        <div className="lg:col-span-6 space-y-8">
          
          <div className="space-y-4">
            <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-[4px] uppercase tracking-wider font-extrabold w-fit block">
              our core purpose
            </span>
            <h2 className="text-4xl md:text-5xl font-header font-black tracking-tight text-gray-900 leading-[1.1] uppercase">
              Why Choose BEHOLD
            </h2>
            <p className="text-black/60 font-sans text-sm md:text-base font-light leading-relaxed">
              At BEHOLD, we go beyond traditional career guidance by offering extended mentorship, doorstep psychological counselling, and personalized career support directly within schools and student spaces. Our student-first approach combines scientific assessment, emotional support, and continuous guidance to help adolescents grow with clarity, confidence, and direction.
            </p>
          </div>

          {/* Interactive Feature Selectors */}
          <div className="space-y-3">
            {STORY_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <div 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-6 border transition-all duration-300 cursor-pointer text-left rounded-[4px] ${
                    isActive 
                      ? 'bg-white border-black/10 shadow-lg scale-[1.01]' 
                      : 'bg-transparent border-transparent hover:border-black/[0.04] hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-black text-brand' : 'bg-black/5 text-black'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-header font-bold text-xs uppercase tracking-wider text-black">{tab.title}</h4>
                      <p className="text-black/50 text-[11px] font-light leading-relaxed">{tab.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setView('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-[4px] transition-all duration-200 cursor-pointer shadow-sm w-full sm:w-auto text-center"
            >
              Get Started with Behold
            </button>
          </div>

        </div>

        {/* Right Column: Immersive visual block */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          
          {/* Main Visual Container */}
          <div className="w-full aspect-square md:aspect-[4/3] rounded-[4px] overflow-hidden border border-black/5 shadow-2xl relative bg-zinc-200">
            <img 
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80" 
              alt="Emotional student representation" 
              className="w-full h-full object-cover grayscale-10 contrast-105"
            />
            {/* Visual Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating UI Achievement */}
          <div className="absolute bottom-8 -left-8 bg-white/95 backdrop-blur-md border border-black/[0.04] p-5 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[240px] z-20 pointer-events-none">
            <div className="w-9 h-9 rounded-[4px] bg-brand flex items-center justify-center text-black shadow-inner shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Student First</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">Continuous psychological check-in roadmaps</p>
            </div>
          </div>

          {/* Floating UI Trusted */}
          <div className="absolute top-1/3 -right-8 bg-white/95 backdrop-blur-md border border-black/[0.04] p-4 rounded-[4px] shadow-xl hidden lg:flex items-center gap-3.5 max-w-[200px] z-20 pointer-events-none">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-black">Safe Environment</p>
              <p className="text-[9px] font-light text-black/55 mt-0.5">100% encrypted, confidential advisory records</p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
