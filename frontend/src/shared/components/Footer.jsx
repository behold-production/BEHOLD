import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ScrollDot } from './BrandDot';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring, siteSettings }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || null;
  const phoneVal = settings.contactPhone?.trim() || null;
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
    <footer className="bg-[#0f172a] text-white pt-16 sm:pt-20 pb-12 border-t border-[#00e5ff]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 w-full">
            <button
              id="footer-brand"
              onClick={() => navigateToSection?.('top')}
              className="text-2xl sm:text-3xl font-sans font-black text-white uppercase tracking-tight bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-0.5 mb-4"
            >
              <span>{(siteName || 'BEHOLD').replace(/\.$/, '')}<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">.</span></span>
            </button>
            <p className="text-surface-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal max-w-sm">
              Expert career mentoring and psychological counselling — helping students and individuals grow with clarity and confidence.
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
          </div>

          {/* Services */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 pt-6 md:pt-0 border-t border-surface-800 md:border-t-0 md:pl-4 lg:pl-8">
            <h4 className="text-white font-sans font-bold uppercase text-xs tracking-widest mb-4 md:mb-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
              Services
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'Career Mentoring', action: () => goTo('services') },
                { label: 'Psychological Counselling', action: () => goTo('services') },
                { label: 'Stream & Degree Selection', action: () => goTo('/booking') },
                // Aptitude Mapping shown only when admin enables aptitude
                settings?.enableAptitude !== false && { label: 'Aptitude Mapping', action: () => goTo('/booking') },
                // Sample test link shown only when admin enables both aptitude AND sample test
                settings?.enableAptitude !== false && settings?.enableSampleTest !== false &&
                  { label: 'Sample Aptitude Assessment', action: () => goTo('/sample-test') },
                { label: 'Book a Session', action: () => goTo('/book-session') },
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
              Company
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'About Us', action: () => goTo('/about') },
                { label: 'Articles & Insights', action: () => goTo('/blog') },
                { label: 'FAQs', action: () => goTo('/faqs') },
                { label: 'Privacy Policy', action: () => onOpenDocs?.('privacy') },
                { label: 'Terms of Service', action: () => onOpenDocs?.('terms') },
                { label: 'Return & Refund Policy', action: () => onOpenDocs?.('refund') },
                { label: 'Support & Contact', action: () => goTo('inquiry') },
              ].map(({ label, action }) => (
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
            © {new Date().getFullYear()} {siteCopyright || 'BEHOLD'}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onOpenDocs?.('privacy')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Privacy</button>
            <button onClick={() => onOpenDocs?.('terms')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Terms</button>
            <button onClick={() => onOpenDocs?.('refund')} className="hover:text-[#00e5ff] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Refund Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
