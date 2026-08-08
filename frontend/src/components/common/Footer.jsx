import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { ScrollDot } from './BrandDot';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring, siteSettings, onOpenBooking }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || 'support@behold.co.in';
  const phoneVal = settings.contactPhone?.trim() || '+91 94000 90106';
  const addressVal = settings.contactAddress?.trim() || null;

  const goTo = (section) => {
    if (section.startsWith('/')) {
      window.spaNavigate?.(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.(section);
    }
  };

  return (
    <footer className="relative z-50 bg-[#0f172a] text-white pt-16 sm:pt-20 pb-12 border-t border-[#00e5ff]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 w-full">
            <button
              id="footer-brand"
              onClick={() => navigateToSection?.('top')}
              className="bg-transparent border-none cursor-pointer p-0 mb-4 flex items-center"
            >
              <BrandIcon variant="full" size="lg" darkBg={true} />
            </button>
            <p className="text-surface-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal max-w-sm">
              Professional online psychological counselling for individuals seeking better mental wellbeing. Confidential, evidence-based support from qualified psychologists—wherever you are.
            </p>
            <div className="space-y-3 text-xs font-normal">
              {emailAddr && (
                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2.5 text-surface-300 hover:text-[#00e5ff] transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-[#00e5ff]" />
                  <span>{emailAddr}</span>
                </a>
              )}
              {phoneVal && (
                <a href={`tel:${phoneVal}`} className="flex items-center gap-2.5 text-surface-300 hover:text-[#00e5ff] transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-[#00e5ff]" />
                  <span>{phoneVal}</span>
                </a>
              )}
              {addressVal && (
                <div className="flex items-start gap-2.5 text-surface-300">
                  <MapPin className="w-4 h-4 shrink-0 text-[#00e5ff] mt-0.5" />
                  <span>{addressVal}</span>
                </div>
              )}
            </div>
            
            {/* Social Links rendering */}
            {settings.socialLinks && Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0 && (
              <div className="mt-8">
                <h4 className="text-white font-sans font-bold uppercase text-xs tracking-widest mb-4">Social Links</h4>
                <div className="flex flex-wrap items-center gap-2 text-surface-400">
                  {settings.socialLinks.map((social, idx) => (
                    social.url ? (
                      <React.Fragment key={idx}>
                        <a 
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#00e5ff] transition-colors text-xs font-medium"
                          title={social.name}
                        >
                          {social.name}
                        </a>
                        {idx < settings.socialLinks.length - 1 && <span className="text-surface-600 px-1">•</span>}
                      </React.Fragment>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Services */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 pt-6 md:pt-0 border-t border-surface-800 md:border-t-0 md:pl-4 lg:pl-8">
            <h4 className="text-white font-sans font-bold uppercase text-xs tracking-widest mb-4 md:mb-5 flex items-center gap-1.5">
              Services
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'Psychological Counselling', action: () => goTo('services') },
                { label: 'Career Guidance', action: () => goTo('services') },
              ].filter(Boolean).map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-surface-300 hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 pt-6 md:pt-0 border-t border-surface-800 md:border-t-0 md:pl-4 lg:pl-8">
            <h4 className="text-white font-sans font-bold uppercase text-xs tracking-widest mb-4 md:mb-5 flex items-center gap-1.5">
              Company
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'About BEHOLD', action: () => goTo('/about') },
                { label: 'Articles & Insights', action: () => goTo('/blog') },
                { label: 'FAQs', action: () => goTo('/faqs') },
                { label: 'Contact Us', action: () => goTo('inquiry') },
              ].filter(Boolean).map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-surface-300 hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-400">
          <div>
            {(() => {
              const year = new Date().getFullYear();
              if (!siteCopyright) return `© ${year} BEHOLD Aspire LLP. All rights reserved.`;
              let clean = String(siteCopyright)
                .replace(/^©\s*/, '')
                .replace(/\.?\s*All rights reserved\.?$/i, '')
                .replace(/,?\s*\d{4}\.?$/, '')
                .trim();
              if (!clean) clean = 'BEHOLD Aspire LLP.';
              return `© ${year} ${clean}. All rights reserved.`;
            })()}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => onOpenDocs?.('privacy')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Privacy Policy</button>
            <span className="text-surface-600 px-1">•</span>
            <button onClick={() => onOpenDocs?.('terms')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Terms & Conditions</button>
            <span className="text-surface-600 px-1">•</span>
            <button onClick={() => onOpenDocs?.('refund')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Refund & Cancellation Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
