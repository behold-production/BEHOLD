import React, { useState } from 'react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring, siteSettings }) {
  const handleLogoClick = () => {
    navigateToSection('top');
  };

  const renderSocialIcon = (name, logo) => {
    const logoVal = (logo || '').trim();
    if (logoVal) {
      if (logoVal.startsWith('/') || logoVal.startsWith('http://') || logoVal.startsWith('https://')) {
        return <img src={logoVal} alt={name} className="w-4 h-4 object-contain" />;
      }
    }

    const norm = (logoVal || name || '').toLowerCase().trim();
    if (norm.includes('facebook')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
        </svg>
      );
    }
    if (norm.includes('instagram')) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    }
    if (norm.includes('linkedin')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    }
    if (norm.includes('youtube')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    }
    if (norm.includes('twitter') || norm.includes('x.com')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (norm.includes('whatsapp') || norm.includes('phone') || norm.includes('call')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.858.002-2.634-1.02-5.11-2.881-6.974-1.86-1.863-4.339-2.885-6.977-2.886-5.438 0-9.862 4.422-9.866 9.86-.001 1.779.485 3.514 1.411 5.048l-.924 3.376 3.45-.905zm12.355-7.114c-.307-.154-1.82-.9-2.102-1.002-.283-.102-.489-.153-.695.153-.205.307-.797.997-.977 1.203-.181.205-.361.23-.668.077-.307-.153-1.302-.48-2.48-1.531-.917-.818-1.536-1.83-1.716-2.137-.18-.307-.018-.472.135-.624.137-.137.307-.358.461-.537.153-.18.205-.307.307-.513.102-.205.051-.385-.026-.538-.077-.154-.695-1.675-.952-2.292-.25-.6-.523-.518-.71-.527-.181-.009-.389-.01-.598-.01-.208 0-.547.079-.834.393-.287.313-1.096 1.072-1.096 2.614 0 1.542 1.121 3.029 1.275 3.235.154.205 2.207 3.37 5.348 4.729.747.324 1.332.518 1.788.662.752.239 1.436.205 1.978.125.603-.09 1.82-.743 2.078-1.459.258-.717.258-1.33.181-1.459-.077-.129-.283-.205-.59-.359z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 fill-none stroke-currentColor strokeWidth-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    );
  };

  const defaultSocials = [
    { name: 'Facebook', url: 'https://facebook.com' },
    { name: 'Instagram', url: 'https://instagram.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'YouTube', url: 'https://youtube.com' }
  ];

  const socials = (Array.isArray(siteSettings?.socialLinks) && siteSettings.socialLinks.length > 0
    ? siteSettings.socialLinks
    : defaultSocials).filter(link => {
      const url = (link.url || '').trim();
      return url !== '' && url !== '#' && url !== 'https://' && url !== 'http://';
    });

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    import('react-hot-toast').then(mod => mod.toast.success('Successfully joined the community!'));
  };

  const settings = siteSettings || {};
  const whatsappUrl = settings.whatsapp || "https://wa.me/919497174011";
  const emailAddr = settings.contactEmail || "support@behold.com";

  return (
    <footer className="bg-[#050505] text-slate-400 pt-8 pb-6 px-4 relative z-10 border-t border-[#111]">
      <div className="max-w-5xl mx-auto flex flex-col items-center">

        {/* Super Footer: Stay Informed & Community */}
        <div className="w-full text-center flex flex-col items-center mb-6 pb-6 border-b border-slate-800/30">
          <h3 className="font-heading font-black text-xs tracking-widest text-white uppercase mb-3">
            Stay Informed & Connect
          </h3>
          
          <form onSubmit={handleSubscribe} className="w-full max-w-sm space-y-2.5">
            {/* Email Input with Arrow */}
            <div className="relative w-full">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-brand/50 focus:border-brand rounded-full py-2.5 pl-5 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-[0_0_12px_rgba(0,229,255,0.08)]"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
                aria-label="Subscribe"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-brand hover:bg-[#00B3CC] text-[#050505] font-black text-xs uppercase tracking-wider rounded-full transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,229,255,0.25)] border-none cursor-pointer"
            >
              Join Our Community
            </button>
          </form>

          <p className="text-[11px] sm:text-xs text-slate-400 font-light mt-2.5">
            Or email us directly: <a href={`mailto:${emailAddr}`} className="text-white hover:text-brand font-medium underline transition-colors break-all inline-block ml-1">{emailAddr}</a>
          </p>
        </div>

        {/* Middle Columns: Logo & Nav Columns */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left mb-6">
          {/* Logo & Description Column */}
          <div className="sm:col-span-2 space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <button
              type="button"
              onClick={handleLogoClick}
              className="font-heading font-black text-2xl text-white hover:text-brand tracking-tighter cursor-pointer transition-colors inline-block bg-transparent border-none p-0"
            >
              {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
            </button>
            <p className="text-xs text-slate-400 leading-relaxed font-light max-w-sm">
              Empowering communities through innovative solutions.
            </p>
            {/* Social Icons row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              {socials.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#111] hover:bg-brand text-[#00E5FF] hover:text-[#050505] transition-all flex items-center justify-center border border-zinc-800/80 hover:border-transparent cursor-pointer shadow-sm hover:scale-105"
                  title={link.name}
                >
                  {renderSocialIcon(link.name, link.logo)}
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links Column */}
          <div className="space-y-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
              Explore
            </h4>
            <div className="flex flex-row flex-wrap items-center justify-center sm:flex-col sm:items-start gap-x-4 gap-y-1 sm:gap-0 sm:space-y-2">
              {(enablePsychology || enableCareerMentoring) && (
                <>
                  <button type="button" onClick={() => navigateToSection('services')} className="text-center sm:text-left text-sm text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium p-0">Services</button>
                  <button type="button" onClick={() => window.spaNavigate('/booking')} className="text-center sm:text-left text-sm text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium p-0">Booking</button>
                </>
              )}
            </div>
          </div>

          {/* Support Links Column */}
          <div className="space-y-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
              Support
            </h4>
            <div className="flex flex-row flex-wrap items-center justify-center sm:flex-col sm:items-start gap-x-4 gap-y-1 sm:gap-0 sm:space-y-2">
              <button type="button" onClick={() => window.spaNavigate('/sample-test')} className="text-center sm:text-left text-sm text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium p-0">Sample Test</button>
              <button type="button" onClick={() => navigateToSection('inquiry')} className="text-center sm:text-left text-sm text-slate-300 hover:text-brand transition-colors cursor-pointer bg-transparent border-none font-medium p-0">Contact</button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & docs row */}
        <div className="w-full pt-4 border-t border-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs font-light text-slate-500">
            {siteCopyright || '© BEHOLD Ltd., 2026. All rights reserved.'}
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-4 text-xs font-light text-slate-500">
            <button
              type="button"
              onClick={() => onOpenDocs('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-light"
            >
              Privacy Policy
            </button>
            <span className="select-none">•</span>
            <button
              type="button"
              onClick={() => onOpenDocs('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-none p-0 font-light"
            >
              Terms Of Use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
