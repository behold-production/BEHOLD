import React from 'react';

export default function Footer({ navigateToSection }) {
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
          BEHOLD<span className="text-brand">.</span>
        </span>
        
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          <button onClick={() => navigateToSection('services')} className="hover:text-brand transition cursor-pointer">Services</button>
          <button onClick={() => window.spaNavigate('/booking')} className="hover:text-brand transition cursor-pointer">Booking</button>
          <button onClick={() => window.spaNavigate('/sample-test')} className="hover:text-brand transition cursor-pointer">Sample Test</button>
          <button onClick={() => navigateToSection('inquiry')} className="hover:text-brand transition cursor-pointer">Contact</button>
        </div>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 font-light text-zinc-600 text-[10px]">
          <p>© BEHOLD Ltd., 2026. All rights reserved.</p>
          <div className="flex gap-4 uppercase tracking-widest">
            <a href="#" className="hover:text-brand transition">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
