import React from 'react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring }) {
 const handleLogoClick = () => {
 navigateToSection('top');
 };

 return (
 <footer className="bg-[#050505] text-slate-400 py-16 px-6 relative z-10 border-t border-[#111]">
 <div className="max-w-4xl mx-auto flex flex-col items-center">
 
 {/* Logo */}
 <button
 type="button"
 onClick={handleLogoClick}
 className="font-heading font-black text-3xl text-white hover:text-brand tracking-tighter cursor-pointer transition-colors inline-block bg-transparent border-none p-0 mb-8"
 >
 {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
 </button>

 {/* Navigation Links */}
 <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-8">
 {(enablePsychology || enableCareerMentoring) && (
 <>
 <button type="button" onClick={() => navigateToSection('services')} className="text-base sm:text-lg text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium">Services</button>
 <button type="button" onClick={() => window.spaNavigate('/booking')} className="text-base sm:text-lg text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium">Booking</button>
 </>
 )}
 <button type="button" onClick={() => window.spaNavigate('/sample-test')} className="text-base sm:text-lg text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium">Sample Test</button>
 <button type="button" onClick={() => navigateToSection('inquiry')} className="text-base sm:text-lg text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium">Contact</button>
 </div>

 {/* Divider */}
 <div className="w-full h-px bg-slate-800/50 mb-8 max-w-2xl mx-auto"></div>

 {/* Copyright */}
 <p className="text-sm font-light text-slate-500 mb-4 text-center">
 {siteCopyright || '© BEHOLD LLP., 2026. All rights reserved.'}
 </p>

 {/* Legal Links */}
 <div className="flex items-center justify-center gap-6">
 <button
 type="button"
 onClick={() => onOpenDocs('privacy')}
 className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none font-light"
 >
 Privacy Policy
 </button>
 <button
 type="button"
 onClick={() => onOpenDocs('terms')}
 className="text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none font-light"
 >
 Terms Of Use
 </button>
 </div>

 </div>
 </footer>
 );
}
