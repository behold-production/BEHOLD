import React from 'react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs }) {
  const handleLogoClick = () => {
    navigateToSection('top');
  };

  return (
    <footer className="bg-black text-zinc-500 text-xs py-8 px-4 sm:px-6 border-t border-zinc-900 text-center select-none relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <span 
          onClick={handleLogoClick}
          className="font-header font-black text-2xl text-white hover:text-brand tracking-tighter cursor-pointer transition duration-300 inline-block"
        >
          {siteName || 'BEHOLD'}<span className="text-brand">.</span>
        </span>
        
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          <button onClick={() => navigateToSection('services')} className="hover:text-brand transition cursor-pointer bg-transparent border-none p-0">Services</button>
          <button onClick={() => window.spaNavigate('/booking')} className="hover:text-brand transition cursor-pointer bg-transparent border-none p-0">Booking</button>
          <button onClick={() => window.spaNavigate('/sample-test')} className="hover:text-brand transition cursor-pointer bg-transparent border-none p-0">Sample Test</button>
          <button onClick={() => navigateToSection('inquiry')} className="hover:text-brand transition cursor-pointer bg-transparent border-none p-0">Contact</button>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-light text-zinc-650 text-[10px]">
          <p>{siteCopyright || '© BEHOLD Ltd., 2026. All rights reserved.'}</p>
          <div className="flex gap-4 uppercase tracking-widest font-mono">
            <button 
              onClick={() => onOpenDocs('privacy')} 
              className="hover:text-brand transition bg-transparent border-none p-0 cursor-pointer text-zinc-600 hover:text-brand text-[10px] uppercase"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onOpenDocs('terms')} 
              className="hover:text-brand transition bg-transparent border-none p-0 cursor-pointer text-zinc-600 hover:text-brand text-[10px] uppercase"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
