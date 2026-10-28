import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const programs = [
  {
    id: 'counselling',
    title: 'Psychological Counselling & Emotional Support',
    description: 'When anxiety, self-doubt, or life pressure feels overwhelming, our licensed psychologists provide a safe, confidential space to heal, reflect, and rebuild resilience.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    tag: 'Emotional Wellbeing',
  },
  {
    id: 'career-cdat',
    title: 'C-DAT Career Aptitude & Student Mentorship',
    description: 'Whether choosing an academic stream, preparing for university, or navigating career crossroads, our scientific assessments and mentors provide authentic clarity and purpose.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    tag: 'Career Mentoring',
  },
  {
    id: 'doorstep-care',
    title: 'Doorstep & In-Home Family Sessions',
    description: 'Qualified at-home consultations providing comfortable, discreet psychological support for adolescents, seniors, and families within eligible service zones.',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80',
    tag: 'At-Home Care',
  },
  {
    id: 'online-teletherapy',
    title: 'Secure Online Tele-Counselling',
    description: 'Connect from any location through end-to-end encrypted video appointments with certified clinical psychologists, complete with calendar links and post-session notes.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    tag: 'Virtual Sanctuary',
  },
];

export default function BookingStepsSection({ navigateToSection }) {
  const handleClick = () => {
    if (navigateToSection) {
      navigateToSection('services');
    } else {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative py-16 sm:py-24 bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20"
      aria-labelledby="bh-programs-heading"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Top Header matching reference layout: Left terracotta eyebrow, Right serif title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              Specialized Care
            </span>
          </div>
          <div>
            <h2
              id="bh-programs-heading"
              className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug"
            >
              Explore Tailored Programs
            </h2>
          </div>
        </div>

        {/* 4 Vertical Stacked Program Cards */}
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {programs.map((program) => (
            <article
              key={program.id}
              onClick={handleClick}
              className="group bg-white rounded-md p-4 sm:p-5 border border-[#ede7de] hover:border-[#b85438]/50 shadow-xs hover:shadow-sm transition-all duration-300 flex items-center gap-4 sm:gap-6 cursor-pointer"
            >
              {/* Thumbnail Image */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-sm overflow-hidden shrink-0 bg-[#f4eee6]">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[10px] font-bold text-[#b85438] uppercase tracking-wider block mb-1">
                  {program.tag}
                </span>
                <h3 className="font-serif-hero text-lg sm:text-xl font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors leading-snug mb-1 sm:mb-1.5 truncate sm:whitespace-normal">
                  {program.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed line-clamp-2">
                  {program.description}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#fbf9f5] group-hover:bg-[#1c2826] text-[#1c2826] group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300 border border-[#ede7de]">
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
