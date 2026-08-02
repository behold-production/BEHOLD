import React from 'react';
import { Brain, Compass, FileText, Sparkles, ArrowRight } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const enablePsychology = settings.enablePsychology !== false;
  const enableCareerMentoring = settings.enableCareerMentoring !== false;
  const enableAptitude = settings.enableAptitude !== false;
  const enableSampleTest = enableAptitude && settings.enableSampleTest !== false;

  const allServices = [
    {
      id: 'counselling',
      enabled: enablePsychology,
      icon: Brain,
      title: 'Psychological Counselling',
      description: 'One-on-one therapeutic sessions for anxiety, academic stress, depression, and personal wellbeing guided by certified clinical psychologists.',
      price: 'From ₹500 / Session',
      actionText: 'Book Counselling',
      onAction: () => {
        if (onBookTherapist) onBookTherapist();
        else window.spaNavigate?.('/booking');
      }
    },
    {
      id: 'mentoring',
      enabled: enableCareerMentoring,
      icon: Compass,
      title: 'Career Mentoring',
      description: 'Personalized 1:1 career guidance, stream selection, higher education roadmaps, and profile building with experienced education advisors.',
      price: 'From ₹800 / Session',
      actionText: 'Book Mentoring',
      onAction: () => {
        if (onBookTherapist) onBookTherapist();
        else window.spaNavigate?.('/booking');
      }
    },
    {
      id: 'aptitude',
      enabled: enableAptitude,
      icon: Sparkles,
      title: 'C-DAT Aptitude Assessment',
      description: 'The CIGI Differential Aptitude Test evaluates 7 core cognitive domains to match students in Grades 8–12 with ideal career options.',
      price: 'Scientific Protocol',
      actionText: 'Register C-DAT',
      onAction: () => {
        window.spaNavigate?.('/aptitude-test');
      }
    },
    {
      id: 'sample-test',
      enabled: enableSampleTest,
      icon: FileText,
      title: 'C-DAT Sample & Demo Test',
      description: 'Take a free interactive sample test preview to explore C-DAT question formats, domain logic, and instant scoring feedback before registration.',
      price: '100% Free Demo',
      actionText: 'Try Sample Test',
      onAction: () => {
        window.spaNavigate?.('/aptitude-test');
      }
    }
  ];

  // Filter only admin-enabled services
  const visibleServices = allServices.filter(s => s.enabled);

  const sectionId = mode === 'experts' ? 'counsellors' : 'services';

  return (
    <section id={sectionId} className="relative py-12 sm:py-16 overflow-hidden text-slate-900 select-none">
      {/* Background Image Layer with smooth mask gradient fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-50 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black uppercase text-slate-900 tracking-tight leading-none mb-3">
            {settings.servicesSectionTitle || 'Our Core Services'}
            <span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.5)]">.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
            {settings.servicesSectionDesc || 'Comprehensive psychological care and scientific career guidance designed for personal clarity and academic success.'}
          </p>
        </div>

        {/* Services Cards Grid — Responsive Dynamic Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${visibleServices.length >= 3 ? 'lg:grid-cols-3' : ''} ${visibleServices.length === 4 ? 'xl:grid-cols-4' : ''} gap-6 lg:gap-8`}>
          {visibleServices.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-md hover:shadow-xl hover:border-[#00c9d6]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Top Bar: Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#00c9d6]/10 text-[#007078] flex items-center justify-center mb-5 group-hover:bg-[#00c9d6] group-hover:text-slate-950 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Service Title */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-[#007078] transition-colors leading-snug">
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Bar: Price & Action CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    onClick={service.onAction}
                    className="px-4 py-2 rounded-full bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-extrabold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95 group/btn shrink-0 border-none"
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
