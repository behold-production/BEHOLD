import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StackSlider from '../../shared/components/StackSlider';
import SectionHeader from '../../shared/components/SectionHeader';

export default function About({ enablePsychology = true, enableCareerMentoring = true, siteSettings }) {
 const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

 const pillars = [
 {
 title: settings.offer1Title || 'Extended Mentorship',
 desc: settings.offer1Desc || 'We guide students through milestones to turn assessment reports into real achievements.'
 },
 {
 title: settings.offer2Title || 'Doorstep & Online Counseling',
 desc: settings.offer2Desc || 'We provide at-home and virtual counseling to ensure emotional privacy and comfort.'
 },
 {
 title: settings.offer3Title || 'Personalized School Programs',
 desc: settings.offer3Desc || 'We conduct orientations and workshops to build healthy learning environments in schools.'
 },
 {
 title: settings.offer4Title || 'C-DAT & Career Roadmaps',
 desc: settings.offer4Desc || 'We use aptitude evaluations to match university pathways with individual natural talents.'
 },
 {
 title: settings.offer5Title || 'Goal Tracking',
 desc: settings.offer5Desc || 'We provide continuous reviews to keep students on track with their long-term goals.'
 },
 {
 title: settings.offer6Title || 'Parent Guidance',
 desc: settings.offer6Desc || 'We guide parents to reduce academic friction and relieve student stress.'
 }
 ];

 return (
 <section id="about"className="py-12 md:py-24 px-6 bg-surface-50 relative">
      {/* Mobile Beautiful Background */}
      <div className="absolute inset-0 z-0 bg-[url('/hero_clay.png')] bg-cover bg-center opacity-30 md:hidden pointer-events-none"></div>

 <div className="max-w-7xl mx-auto space-y-8 md:space-y-16">

 {/* Header Column */}
 <motion.div 
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:"-100px"}}
 transition={{ duration: 0.6 }}
 className="w-full"
 >
    <SectionHeader 
        subtitle="Why Choose Us"
        title={settings.aboutTitle || 'What We Offer'}
        description={settings.aboutSub || 'We go beyond traditional guidance by offering mentorship, doorstep counseling, and personalized support in schools.'}
        align="responsive"
    />
 </motion.div>

 {/* 6-Card Grid / Stack Slider */}
 <StackSlider
 desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch"
 mobileContainerClassName="relative w-full mx-auto h-[220px] sm:h-[240px]"
 items={pillars.map((pillar, idx) => (
 <div
 key={idx}
 className="h-full p-5 sm:p-6 bg-white border border-surface-200 shadow-square-light hover:shadow-square-hover flex flex-col group transition-all duration-300 relative overflow-hidden rounded-[10px] select-none"
 >
 {/* Decorative Accent */}
 <div className="absolute top-0 right-0 w-16 h-16 bg-surface-50 border-l border-b border-surface-200 transform translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 rounded-bl-[10px]"></div>

 <div className="relative z-10 flex-1 flex flex-col pointer-events-none">
 <div className="flex items-center gap-3 mb-3">
 <span className="font-heading font-black text-4xl text-surface-200 group-hover:text-brand transition-colors duration-300 leading-none shrink-0">
 {`0${idx + 1}`}
 </span>
 <h4 className="font-heading font-bold text-lg text-surface-900 leading-tight">
 {pillar.title}
 </h4>
 </div>
 <p className="text-slate-600 font-light leading-relaxed text-sm">
 {pillar.desc}
 </p>
 </div>
 
 <div className="mt-5 flex justify-end pointer-events-none">
 <div className="w-8 h-8 bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-900 group-hover:bg-brand group-hover:border-brand transition-colors rounded-[10px]">
 <ArrowRight className="w-4 h-4"/>
 </div>
 </div>
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
 className="flex justify-center w-full"
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
 className="btn-primary w-full sm:w-auto px-12"
 >
 {(enablePsychology || enableCareerMentoring) ? 'Get Started with Behold' : 'Explore Aptitude Assessment'}
 </button>
 </motion.div>
 )}

 </div>

 </section>
 );
}
