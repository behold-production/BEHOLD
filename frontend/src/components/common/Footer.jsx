import React from 'react';
import { Mail, Phone } from 'lucide-react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, siteSettings }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || 'admin@behold.co.in';
  const phoneVal = settings.contactPhone?.trim() || '9400090106';

  const goTo = (section) => {
    if (section.startsWith('/')) {
      window.spaNavigate?.(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.(section);
    }
  };

  const socialList = settings.socialLinks && Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0
    ? settings.socialLinks
    : [
        { name: 'Facebook', url: '#' },
        { name: 'Instagram', url: '#' },
        { name: 'Linkedin', url: '#' },
        { name: 'YouTube', url: '#' }
      ];

  return (
    <footer className="relative z-10 bg-[#0f172a] text-white pt-10 sm:pt-12 pb-20 lg:pb-6 border-t border-[#00e5ff]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 w-full space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
            <button
              id="footer-brand"
              onClick={() => navigateToSection?.('top')}
              className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-0.5 mx-auto md:mx-0"
            >
              <span>{(siteName || 'BEHOLD').replace(/\.$/, '')}<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">.</span></span>
            </button>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed font-normal max-w-md mx-auto md:mx-0">
              Professional online psychological counselling for individuals seeking better mental wellbeing. Confidential, evidence-based support from qualified psychologists—wherever you are.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1.5 text-xs font-medium pt-0.5">
              {emailAddr && (
                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 text-slate-300 hover:text-[#00e5ff] transition-colors">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-[#00e5ff]" />
                  <span>{emailAddr}</span>
                </a>
              )}
              {phoneVal && (
                <a href={`tel:${phoneVal}`} className="flex items-center gap-2 text-slate-300 hover:text-[#00e5ff] transition-colors">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-[#00e5ff]" />
                  <span>{phoneVal}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="pt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-400 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider shrink-0">Social:</span>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {socialList.map((social, idx) => (
                  social.url ? (
                    <React.Fragment key={idx}>
                      <a 
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#00e5ff] transition-colors text-xs font-medium text-slate-300"
                        title={social.name}
                      >
                        {social.name}
                      </a>
                      {idx < socialList.length - 1 && <span className="text-slate-600 px-0.5">•</span>}
                    </React.Fragment>
                  ) : null
                ))}
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 pt-2 md:pt-0 md:pl-4 lg:pl-8 text-center md:text-left">
            <h4 className="text-white font-sans font-semibold uppercase text-[11px] tracking-widest mb-3">
              Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] font-normal">
              {[
                { label: 'Psychological Counselling', action: () => goTo('services') },
                { label: 'Career Guidance', action: () => goTo('services') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-slate-300 hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-center md:text-left text-xs sm:text-[13px] font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 pt-2 md:pt-0 md:pl-4 lg:pl-8 text-center md:text-left">
            <h4 className="text-white font-sans font-semibold uppercase text-[11px] tracking-widest mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] font-normal">
              {[
                { label: 'About BEHOLD', action: () => goTo('/about') },
                { label: 'Articles & Insights', action: () => goTo('/blog') },
                { label: 'FAQs', action: () => goTo('/faqs') },
                { label: 'Contact Us', action: () => goTo('inquiry') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-slate-300 hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-center md:text-left text-xs sm:text-[13px] font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            {(() => {
              const year = new Date().getFullYear();
              if (!siteCopyright) return `© ${year} BEHOLD Ltd.. All rights reserved.`;
              let clean = String(siteCopyright)
                .replace(/^©\s*/, '')
                .replace(/\.?\s*All rights reserved\.?$/i, '')
                .replace(/,?\s*\d{4}\.?$/, '')
                .trim();
              if (!clean) clean = 'BEHOLD Ltd..';
              return `© ${year} ${clean} All rights reserved.`;
            })()}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => onOpenDocs?.('privacy')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400">Privacy Policy</button>
            <span className="text-slate-600 px-1">•</span>
            <button onClick={() => onOpenDocs?.('terms')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400">Terms & Conditions</button>
            <span className="text-slate-600 px-1">•</span>
            <button onClick={() => onOpenDocs?.('refund')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs text-slate-400">Refund & Cancellation Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
