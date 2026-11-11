import React, { useEffect } from 'react';
import { Brain, Compass, ArrowRight } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';
import SEO from '../../components/common/SEO';
import { trackViewContent } from '../../utils/metaPixel';

export default function Services({ onBookTherapist, siteSettings }) {
  useEffect(() => {
    trackViewContent({
      content_name: 'Services & Consultations',
      content_type: 'service_catalog'
    });
  }, []);

  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const enablePsychology = settings.enablePsychology !== false;
  const enableCareerMentoring = settings.enableCareerMentoring !== false;

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
      description: settings.careerDesc || 'Personalized 1:1 guidance, stream selection, and roadmap planning with experienced counselors.',
      price: 'From ₹800 / Session',
      actionText: settings.careerBtnText || 'Book Your Mentor',
      onAction: () => {
        if (onBookTherapist) onBookTherapist();
        else window.spaNavigate?.('/booking');
      }
    }
  ];

  // Filter only admin-enabled services
  const visibleServices = allServices.filter(s => s.enabled);

  // Determine optimal max width & grid layout based on card count
  const getGridClasses = () => {
    if (visibleServices.length === 1) return 'max-w-2xl mx-auto grid grid-cols-1 gap-6';
    if (visibleServices.length === 2) return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8';
    return 'max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
  };

  const rawDesc = settings.servicesSectionDesc || '';
  const cleanDesc = /career mentoring|aptitude|cdat/i.test(rawDesc)
    ? 'Access standard, confidential counselling sessions with certified clinical psychologists.'
    : rawDesc || 'Access standard, confidential counselling sessions with certified clinical psychologists.';

  return (
    <>
      <SEO 
        title="Services & Appointments" 
        description="Book a session for Psychological Counselling and mental wellbeing." 
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin + "/booking" : "https://www.behold.co.in/booking"}
      />
      <section id="services" className="relative py-20 sm:py-28 bg-[#fbf8f1] text-[#0e1111] overflow-hidden scroll-mt-20 border-t border-[#e6dfd0] reveal-on-scroll">
      {/* Background Image Layer with smooth mask gradient fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg?.src || greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-25 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header - Centered & Balanced */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-14 text-center flex flex-col items-center reveal-on-scroll">
          <span className="inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold text-[#0e7490] tracking-[0.2em] uppercase mb-4 text-center">
            <span className="w-6 h-px bg-[#0e7490]/50 inline-block" />
            Our Services
            <span className="w-6 h-px bg-[#0e7490]/50 inline-block" />
          </span>
          <h2 className="font-serif-hero text-3xl sm:text-4xl md:text-5xl font-normal text-[#0e1111] tracking-tight leading-tight mb-3">
            {settings.servicesSectionTitle && settings.servicesSectionTitle !== 'BOOK YOUR SESSION' ? settings.servicesSectionTitle : 'Book Your Session'}
          </h2>

          <p className="text-sm sm:text-base text-[#55605f] font-normal leading-relaxed max-w-xl mx-auto">
            {cleanDesc}
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
                className={`group relative bg-white rounded-md ${isSingle ? 'p-8 sm:p-10' : 'p-6 sm:p-7'} border border-[#e6dfd0] shadow-2xs hover:border-[#0e7490]/50 hover:shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden reveal-on-scroll reveal-scale-in ${delayClass}`}
              >
                <div>
                  {/* Top Bar: Icon */}
                  <div className={`${isSingle ? 'w-14 h-14' : 'w-11 h-11'} rounded-md bg-[#f7f2e7] text-[#0e7490] border border-[#e6dfd0] flex items-center justify-center mb-5 group-hover:bg-[#0e7490] group-hover:text-white group-hover:border-[#0e7490] transition-all duration-300 shadow-2xs`}>
                    <Icon className={isSingle ? 'w-7 h-7' : 'w-5 h-5'} />
                  </div>

                  {/* Service Title */}
                  <h3 className={`${isSingle ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-serif-hero font-semibold text-[#0e1111] tracking-tight mb-2.5 group-hover:text-[#0e7490] transition-colors leading-snug`}>
                    {service.title}
                  </h3>

                  {/* Service Description */}
                  <p className={`${isSingle ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-[#55605f] leading-relaxed font-normal mb-6`}>
                    {service.description}
                  </p>
                </div>

                {/* Bottom Bar: Price & Action CTA */}
                <div className="pt-4 border-t border-[#e6dfd0] flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-[#55605f]">
                    {service.price}
                  </span>

                  <button
                    type="button"
                    onClick={service.onAction}
                    className={`${isSingle ? 'px-6 py-3 text-xs' : 'px-5 py-2.5 text-xs'} rounded-md bg-[#0e1111] hover:bg-[#0e7490] text-white font-semibold hover-scale-btn transition-all duration-200 cursor-pointer shadow-2xs flex items-center gap-1.5 group/btn shrink-0 border-none`}
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
    </>
  );
}
