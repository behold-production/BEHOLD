import React from 'react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology }) {
  const handleLogoClick = () => {
    navigateToSection('top');
  };

  return (
    <footer className="bg-black text-zinc-500 text-sm py-10 px-4 sm:px-6 border-t border-zinc-900 text-center select-none relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          type="button"
          onClick={handleLogoClick}
          className="font-header font-black text-2xl text-white hover:text-brand tracking-tighter cursor-pointer transition duration-300 inline-block bg-transparent border-none p-0"
        >
          {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
        </button>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2  text-sm capitalize  text-zinc-400">
          {enablePsychology && (
            <>
              <button type="button" onClick={() => navigateToSection('services')} className="py-1 hover:text-brand transition cursor-pointer bg-transparent border-none">Services</button>
              <button type="button" onClick={() => window.spaNavigate('/booking')} className="py-1 hover:text-brand transition cursor-pointer bg-transparent border-none">Booking</button>
            </>
          )}
          <button type="button" onClick={() => window.spaNavigate('/sample-test')} className="py-1 hover:text-brand transition cursor-pointer bg-transparent border-none">Sample Test</button>
          <button type="button" onClick={() => navigateToSection('inquiry')} className="py-1 hover:text-brand transition cursor-pointer bg-transparent border-none">Contact</button>
        </nav>

        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 font-light text-zinc-500 text-sm">
          <p className="leading-relaxed">{siteCopyright || '© BEHOLD Ltd., 2026. All rights reserved.'}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 capitalize  ">
            <button
              type="button"
              onClick={() => onOpenDocs('privacy')}
              className="py-1 hover:text-brand transition bg-transparent border-none cursor-pointer text-zinc-500 text-sm capitalize"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenDocs('terms')}
              className="py-1 hover:text-brand transition bg-transparent border-none cursor-pointer text-zinc-500 text-sm capitalize"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
