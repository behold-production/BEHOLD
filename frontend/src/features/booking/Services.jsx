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
      title: settings.psychTitle || 'Psychological Counselling',
      description: settings.psychDesc || 'One-on-one therapeutic sessions for anxiety, academic stress, depression, and personal wellbeing guided by certified clinical psychologists.',
      price: 'From ₹500 / Session',
      actionText: settings.psychBtnText || 'Book Your Therapist',
      onAction: () => {
        if (onBookTherapist) onBookTherapist();
        else window.spaNavigate?.('/booking');
      }
    },
    {
      id: 'mentoring',
      enabled: enableCareerMentoring,
      icon: Compass,
      title: settings.careerTitle || 'Career Mentoring',
      description: settings.careerDesc || 'Personalized 1:1 career guidance, stream selection, higher education roadmaps, and profile building with experienced education advisors.',
      price: 'From ₹800 / Session',
      actionText: settings.careerBtnText || 'Book Your Mentor',
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

  // Determine optimal max width & grid layout based on card count
  const getGridClasses = () => {
    if (visibleServices.length === 1) return 'max-w-2xl mx-auto grid grid-cols-1 gap-6';
    if (visibleServices.length === 2) return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8';
    if (visibleServices.length === 3) return 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
    return 'max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8';
  };

  return (
    <section id={sectionId} className="relative py-14 sm:py-20 overflow-hidden text-slate-900 select-none">
      {/* Background Image Layer with smooth mask gradient fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header - Centered & Balanced */}
        <div className="max-w-3xl mx-auto mb-12 text-center flex flex-col items-center reveal-on-scroll">
          <span className="text-xs font-bold tracking-widest text-[#00c9d6] flex items-center justify-center gap-1.5 mb-2">
            Book Your Session
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-slate-900 tracking-tight leading-tight mb-4">
            {settings.servicesSectionTitle && settings.servicesSectionTitle !== 'BOOK YOUR SESSION' ? settings.servicesSectionTitle : 'Book Your Session'}
            <span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.6)] font-bold">.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto">
            {settings.servicesSectionDesc || 'Access standard, expert counselling sessions and lifetime career mentoring.'}
          </p>
        </div>

        {/* Services Cards Grid — Centered & Dynamic */}
        <div className={getGridClasses()}>
          {visibleServices.map((service, idx) => {
            const Icon = service.icon;
            const delayClass = idx === 0 ? 'reveal-delay-1' : idx === 1 ? 'reveal-delay-2' : idx === 2 ? 'reveal-delay-3' : 'reveal-delay-4';
            const isSingle = visibleServices.length === 1;

            return (
              <div
                key={service.id}
                className={`group relative bg-white/95 backdrop-blur-md rounded-2xl ${isSingle ? 'p-8 sm:p-10' : 'p-6 sm:p-7'} border border-slate-200/90 shadow-md hover-scale-card hover:border-[#00c9d6]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden reveal-on-scroll reveal-scale-in ${delayClass}`}
              >
                <div>
                  {/* Top Bar: Icon */}
                  <div className={`${isSingle ? 'w-14 h-14' : 'w-11 h-11'} rounded-xl bg-[#00c9d6]/10 text-[#007078] flex items-center justify-center mb-5 group-hover:bg-[#00c9d6] group-hover:text-slate-950 group-hover:scale-110 transition-all duration-300 shadow-xs`}>
                    <Icon className={isSingle ? 'w-7 h-7' : 'w-5 h-5'} />
                  </div>

                  {/* Service Title */}
                  <h3 className={`${isSingle ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-slate-900 tracking-tight mb-2.5 group-hover:text-[#007078] transition-colors leading-snug`}>
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className={`${isSingle ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-slate-600 leading-relaxed font-normal mb-6`}>
                    {service.description}
                  </p>
                </div>

                {/* Bottom Bar: Price & Action CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 tracking-wider">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    onClick={service.onAction}
                    className={`${isSingle ? 'px-6 py-3 text-xs' : 'px-4.5 py-2.5 text-xs'} rounded-full bg-[#0f172a] hover:bg-[#00c9d6] hover:text-slate-950 text-white font-bold tracking-wider hover-scale-btn transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 group/btn shrink-0 border-none`}
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
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
