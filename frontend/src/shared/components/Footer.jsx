import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ScrollDot } from './BrandDot';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring, siteSettings }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || null;
  const phoneVal = settings.contactPhone?.trim() || null;
  const addressVal = settings.contactAddress?.trim() || null;

  const goTo = (section) => {
    if (section.startsWith('/')) window.spaNavigate?.(section);
    else navigateToSection?.(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1c1514] text-[#e2dad2] border-t border-[#2b211e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 w-full">
            <button
              id="footer-brand"
              onClick={() => navigateToSection?.('top')}
              className="text-2xl sm:text-3xl font-sans font-black text-[#f7f4ef] uppercase tracking-tight bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-1 mb-4"
            >
              <span>{(siteName || 'BEHOLD').replace(/\.$/, '')}.</span>
            </button>
            <p className="text-[#a39891] text-xs sm:text-sm leading-relaxed mb-6 font-normal max-w-sm">
              Expert career guidance, psychological care, and aptitude assessments for students and individuals.
            </p>
            <div className="space-y-3 text-xs font-normal">
              {emailAddr && (
                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2.5 text-[#e2dad2] hover:text-white transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-[#8a7e77]" />
                  <span>{emailAddr}</span>
                </a>
              )}
              {phoneVal && (
                <a href={`tel:${phoneVal}`} className="flex items-center gap-2.5 text-[#e2dad2] hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-[#8a7e77]" />
                  <span>{phoneVal}</span>
                </a>
              )}
              {addressVal && (
                <div className="flex items-start gap-2.5 text-[#e2dad2]">
                  <MapPin className="w-4 h-4 shrink-0 text-[#8a7e77] mt-0.5" />
                  <span>{addressVal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 pt-6 md:pt-0 border-t border-[#2b211e] md:border-t-0 md:pl-4 lg:pl-8">
            <h4 className="text-[#f7f4ef] font-sans font-bold uppercase text-xs tracking-widest mb-4 md:mb-5">Services</h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'Career Mentoring', action: () => goTo('services') },
                { label: 'Psychological Counselling', action: () => goTo('services') },
                { label: 'Stream & Degree Selection', action: () => goTo('/booking') },
                { label: 'Aptitude Mapping', action: () => goTo('/booking') },
                { label: 'Sample Aptitude Assessment', action: () => goTo('/sample-test') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-[#a39891] hover:text-[#f7f4ef] transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 pt-6 md:pt-0 border-t border-[#2b211e] md:border-t-0 md:pl-4 lg:pl-8">
            <h4 className="text-[#f7f4ef] font-sans font-bold uppercase text-xs tracking-widest mb-4 md:mb-5">Company</h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal">
              {[
                { label: 'Articles & Insights', action: () => goTo('/blog') },
                { label: 'Privacy Policy', action: () => onOpenDocs?.('privacy') },
                { label: 'Terms of Service', action: () => onOpenDocs?.('terms') },
                { label: 'Return & Refund Policy', action: () => onOpenDocs?.('refund') },
                { label: 'Support & Contact', action: () => goTo('inquiry') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-[#a39891] hover:text-[#f7f4ef] transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#2b211e] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a7e77]">
          <div>
            © {new Date().getFullYear()} {siteCopyright || 'BEHOLD'}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onOpenDocs?.('privacy')} className="hover:text-[#f7f4ef] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Privacy</button>
            <button onClick={() => onOpenDocs?.('terms')} className="hover:text-[#f7f4ef] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Terms</button>
            <button onClick={() => onOpenDocs?.('refund')} className="hover:text-[#f7f4ef] transition-colors bg-transparent border-none cursor-pointer p-0 text-xs">Refund Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
