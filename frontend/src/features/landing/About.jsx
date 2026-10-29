import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import SEO from '../../components/common/SEO';

const philosophyPillars = [
  {
    number: '01',
    title: 'Compassionate Empathy',
    description: 'Every individual is met with deep unconditional respect, safe listening, and a non-judgmental space to unpack life’s heaviest burdens.',
    icon: Heart,
  },
  {
    number: '02',
    title: 'Evidence-Based Care',
    description: 'Our clinical psychologists integrate scientifically proven therapies—CBT, mindfulness-based stress reduction, and tailored assessments.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Sanctuary of Trust',
    description: 'Complete ethical confidentiality, digital privacy, and licensed clinical governance safeguarding your healing journey with dignity.',
    icon: ShieldCheck,
  },
];

export default function About({ siteSettings, onOpenBooking }) {
  const navigate = useNavigate();
  const settings = siteSettings || {};

  const eyebrow = settings.aboutEyebrow || 'Our Philosophy';
  const heading = settings.aboutSectionTitle || 'A Mindful Path to Living Well';
  const description = settings.aboutSectionDesc || 'We believe true mental wellbeing begins when compassionate human connection meets clinical rigor in a safe, tranquil sanctuary.';

  const handleBookingAction = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
    } else {
      navigate('/booking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="Our Philosophy"
        description={description}
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin + '/about' : undefined}
      />

      <section
        id="about"
        aria-labelledby="bh-philosophy-heading"
        className="relative py-20 sm:py-28 bg-[#fbf8f1] text-[#0e1111] overflow-hidden scroll-mt-20"
      >
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header: Left terracotta eyebrow, Right serif heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16 pb-4 border-b border-[#e6dfd0]">
            <div>
              <span className="text-[#0e7490] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
                {eyebrow}
              </span>
            </div>
            <div>
              <h2
                id="bh-philosophy-heading"
                className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#0e1111] tracking-tight leading-snug"
              >
                {heading}
              </h2>
            </div>
          </div>

          {/* Forest Backdrop Container with 3 Floating Cards */}
          <div className="relative rounded-md overflow-hidden p-6 sm:p-10 md:p-12 shadow-sm border border-[#e6dfd0]">
            {/* Background Image: Serene Pine Trees / Forest Mist */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1600&q=80")',
              }}
            >
              {/* Soft tint overlay to let white cards stand out prominently */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050707]/80 via-[#0e1111]/40 to-transparent pointer-events-none" />
            </div>

            {/* 3 Floating White Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-24 sm:pt-36">
              {philosophyPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <article
                    key={pillar.number}
                    className="bg-white/95 backdrop-blur-md rounded-md p-6 sm:p-8 border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-mono font-bold text-[#0e7490] tracking-widest">
                          {pillar.number}
                        </span>
                        <div className="w-10 h-10 rounded-sm bg-[#f7f2e7] text-[#0e7490] flex items-center justify-center border border-[#cbe9f1]">
                          <IconComponent className="w-4 h-4 stroke-[2]" />
                        </div>
                      </div>

                      <h3 className="font-serif-hero text-xl sm:text-2xl font-semibold text-[#0e1111] mb-3 leading-snug">
                        {pillar.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#55605f] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#efe8db] flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#0e7490] uppercase tracking-wider">
                        Core Value
                      </span>
                      <span className="text-xs text-[#55605f] font-medium">BEHOLD</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
