import React from 'react';
import { Sparkles, Brain, Compass, BookOpen, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const servicesList = [
    {
      id: 'counselling',
      icon: Brain,
      tag: 'Mental Health & Wellbeing',
      title: 'Psychological Counselling',
      subtitle: 'Safe, Confidential & Doorstep Care',
      description: 'One-on-one therapeutic sessions for anxiety, academic stress, depression, and personal growth guided by certified clinical psychologists.',
      features: [
        'Doorstep & Online Private Sessions',
        'Academic Stress & Burnout Recovery',
        'Anxiety, Depression & Emotional Healing',
        'Strictly Confidential & Safe Protocol'
      ],
      price: 'From ₹500 / Session',
      badge: 'POPULAR',
      actionText: 'Book Counselling'
    },
    {
      id: 'aptitude',
      icon: Compass,
      tag: 'Scientific Evaluation',
      title: 'C-DAT Aptitude Assessment',
      subtitle: 'Standardized Psychometric Testing',
      description: 'The CIGI Differential Aptitude Test evaluates 7 core cognitive domains to match students in Grades 8–12 with ideal stream and career options.',
      features: [
        '7-Domain Scientific Evaluation',
        'Comprehensive 15-Page Career Report',
        'Stream & Subject Selection Roadmap',
        '1:1 Psychologist Report Debrief'
      ],
      price: 'Scientific Protocol',
      badge: 'ASSESSMENT',
      actionText: 'Book Aptitude Test'
    },
    {
      id: 'mentorship',
      icon: BookOpen,
      tag: 'Career & University Pathway',
      title: '1:1 Career Mentorship',
      subtitle: 'Long-term Guidance & Action Plans',
      description: 'Personalized career mentoring to translate aptitude findings into achievable milestones, university selection, and skill building.',
      features: [
        'Stream & Degree Mapping',
        'University Admission Guidance',
        'Skill & Profile Enhancement',
        'Quarterly Goal Tracking'
      ],
      price: 'Customized Mentoring',
      badge: 'CAREER',
      actionText: 'Book Mentoring'
    },
    {
      id: 'workshops',
      icon: Users,
      tag: 'Institutional & School Care',
      title: 'School & Parent Workshops',
      subtitle: 'Campus Orientations & Guidance',
      description: 'Interactive workshops and orientations conducted at schools to build healthy learning environments and align parent expectations.',
      features: [
        'Student Mental Health Seminars',
        'Parenting & Friction Reduction',
        'Teacher Guidance Orientation',
        'Group Aptitude Drives'
      ],
      price: 'Institutional Care',
      badge: 'WORKSHOPS',
      actionText: 'Inquire for School'
    }
  ];

  const sectionId = mode === 'experts' ? 'counsellors' : 'services';

  return (
    <section id={sectionId} className="relative py-16 sm:py-24 overflow-hidden text-slate-900 select-none">
      {/* Background Image Layer with smooth mask gradient fade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-60 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-[#00e5ff] text-[11px] sm:text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.servicesSectionSub || 'UNFOLD WITH BEHOLD'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black uppercase text-slate-900 tracking-tight leading-none mb-4">
            {settings.servicesSectionTitle || 'Comprehensive Care for Your Mind & Future'}
            <span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
            {settings.servicesSectionDesc || 'True growth happens when emotional peace and career direction align. Behold Aspire brings both psychological counseling and scientific career mentoring into one cohesive model.'}
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {servicesList.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg hover:shadow-2xl hover:border-[#00e5ff]/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Decorative Top Gradient Line on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#00e5ff] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#00e5ff] group-hover:text-slate-950 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-[#00e5ff]/15 group-hover:text-slate-900 transition-colors">
                      {service.badge}
                    </span>
                  </div>

                  {/* Category Tag */}
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#00c9d6] block mb-1">
                    {service.tag}
                  </span>

                  {/* Service Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-[#00c9d6] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mb-4">
                    {service.subtitle}
                  </p>

                  {/* Service Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-6">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#00c9d6] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Price & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    {service.price}
                  </span>

                  <button
                    onClick={() => {
                      if (service.id === 'aptitude') {
                        window.spaNavigate?.('/aptitude-test');
                      } else if (onBookTherapist) {
                        onBookTherapist();
                      } else {
                        window.spaNavigate?.('/booking');
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-[#00e5ff] hover:text-slate-950 text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95 group/btn"
                  >
                    <span>{service.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Matrix: 4 Key Pillars */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-[#00e5ff]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#00e5ff]/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0 md:pr-6 space-y-1">
              <span className="text-3xl font-black text-[#00e5ff] font-sans">01.</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Dual Architecture</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">Clinical psychologists & career strategists under one roof.</p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6 space-y-1">
              <span className="text-3xl font-black text-[#00e5ff] font-sans">100%</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Scientific Protocols</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">CIGI assessment data & strictly private counseling.</p>
            </div>

            <div className="pt-4 md:pt-0 md:px-6 space-y-1">
              <span className="text-3xl font-black text-[#00e5ff] font-sans">C-DAT</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Aptitude Evaluation</h4>
              <p className="text-xs text-slate-400 font-normal leading-relaxed">Standardized cognitive testing for Grades 8–12.</p>
            </div>

            <div className="pt-4 md:pt-0 md:pl-6 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#00e5ff]">Ready to Begin?</span>
                <h4 className="text-sm font-bold text-white">Book Your First Session</h4>
              </div>
              <button
                onClick={() => { if (onBookTherapist) onBookTherapist(); }}
                className="w-full py-2.5 rounded-full bg-[#00e5ff] hover:bg-[#00c9d6] text-slate-950 font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md text-center"
              >
                Book Session Now
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
