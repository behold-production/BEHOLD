import React from 'react';
import { motion } from 'framer-motion';
import StackSlider from '../../shared/components/StackSlider';
import SectionHeader from '../../shared/components/SectionHeader';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  const pillars = [
    {
      title: settings.offer1Title || 'Extended Mentorship',
      desc: settings.offer1Desc || 'We guide students through milestones to turn assessment reports into real achievements.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 017.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 019.918 5.846 50.58 50.58 0 00-2.658.813M4.26 10.147L12 14.653l7.74-4.506M12 14.653v8.083" />
        </svg>
      )
    },
    {
      title: settings.offer2Title || 'Doorstep & Online Counseling',
      desc: settings.offer2Desc || 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.084.18.13.378.13.588v5.303c0 .24-.115.468-.312.606l-2.636 1.845a2.238 2.238 0 01-1.286.41h-2.148l-2.736 1.915a.75.75 0 01-1.185-.616v-1.3H6.75a2.25 2.25 0 01-2.25-2.25V9.1c0-1.242 1.008-2.25 2.25-2.25h11.25c1.242 0 2.25 1.008 2.25 2.25v.411z" />
        </svg>
      )
    },
    {
      title: settings.offer3Title || 'Personalized School Programs',
      desc: settings.offer3Desc || 'We conduct orientations and workshops to build healthy learning environments in schools.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      )
    },
    {
      title: settings.offer4Title || 'C-DAT & Career Roadmaps',
      desc: settings.offer4Desc || 'We use aptitude evaluations to match university pathways with individual natural talents.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    },
    {
      title: settings.offer5Title || 'Goal Tracking',
      desc: settings.offer5Desc || 'We provide continuous reviews to keep students on track with their long-term goals.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )
    },
    {
      title: settings.offer6Title || 'Parent Guidance',
      desc: settings.offer6Desc || 'We guide parents to reduce academic friction and relieve student stress.',
      icon: (
        <svg className="w-7 h-7 text-[#206173]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    }
  ];

  return (
    <section id="about" className="py-12 md:py-20 bg-gradient-to-b from-white to-slate-50 relative">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <SectionHeader
            subtitle="Why Choose Us"
            title={settings.aboutTitle || 'What We Offer'}
            description={settings.aboutSub || 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.'}
            align="center"
          />
        </motion.div>

        {/* 6-Card Grid */}
        <StackSlider
          desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          mobileContainerClassName="relative w-full mx-auto h-[220px] sm:h-[240px]"
          items={pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="h-full p-6 bg-white border border-gray-100/70 shadow-sm hover:shadow-[0_20px_40px_rgba(32,97,115,0.08)] hover:-translate-y-1 flex flex-col group transition-all duration-300 relative overflow-hidden rounded-3xl select-none"
            >
              {/* Top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#23949c] to-[#206173] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-3xl" />

              {/* Icon */}
              <div className="mb-4 transition-transform group-hover:scale-110 duration-300">
                {pillar.icon}
              </div>

              <span className="text-[10px] font-bold text-[#206173] bg-[#206173]/10 px-2.5 py-1 rounded-full w-max mb-3">
                0{idx + 1}
              </span>

              <h4 className="text-lg font-bold text-[#163a44] mb-2 group-hover:text-[#206173] transition-colors">
                {pillar.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed font-light flex-1">
                {pillar.desc}
              </p>
            </div>
          ))}
          renderItem={(item) => item}
        />

        {/* CTA Button */}
        {(enablePsychology || enableCareerMentoring || settings.enableAptitude !== false) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center w-full mt-10"
          >
            <button
              type="button"
              onClick={() => {
                if (enablePsychology || enableCareerMentoring) {
                  window.spaNavigate('/booking');
                } else {
                  window.spaNavigate('/sample-test');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary px-10"
            >
              {(enablePsychology || enableCareerMentoring) ? 'Get Started with Behold' : 'Explore Aptitude Assessment'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
