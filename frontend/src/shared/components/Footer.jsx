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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <button
              id="footer-brand"
              onClick={() => navigateToSection?.('top')}
              className="text-2xl font-serif font-bold text-white bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-0.5 mb-4"
            >
              <span>{siteName || 'BEHOLD'}</span>
              <ScrollDot nextId="top" label="Scroll back to Top ↑" size="md" inlineText={true} />
            </button>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
              Expert career guidance, psychological counselling, and aptitude assessments for students across Kerala.
            </p>
            <div className="space-y-3 text-xs sm:text-sm font-normal">
              {emailAddr && (
                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-gray-500" />
                  <span>{emailAddr}</span>
                </a>
              )}
              {phoneVal && (
                <a href={`tel:${phoneVal}`} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-gray-500" />
                  <span>{phoneVal}</span>
                </a>
              )}
              {addressVal && (
                <div className="flex items-start gap-2.5 text-gray-400">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-500 mt-0.5" />
                  <span>{addressVal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-serif font-bold uppercase text-xs tracking-widest mb-5">Services</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
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
                    className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-serif font-bold uppercase text-xs tracking-widest mb-5">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-normal">
              {[
                { label: 'About Us', action: () => goTo('about') },
                { label: 'Articles & Insights', action: () => goTo('/blog') },
                { label: 'Privacy Policy', action: () => onOpenDocs?.('privacy') },
                { label: 'Terms of Service', action: () => onOpenDocs?.('terms') },
                { label: 'Support & Contact', action: () => goTo('inquiry') },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left text-xs sm:text-sm font-normal"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white font-serif font-bold uppercase text-xs tracking-widest mb-5">Get Started</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 leading-relaxed font-normal">
              Ready to discover your true potential? Book a session or take the free sample aptitude test.
            </p>
            <button
              onClick={() => goTo('/booking')}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-md transition mb-3 border-none cursor-pointer shadow-sm"
            >
              Book Appointment
            </button>
            <button
              onClick={() => goTo('/sample-test')}
              className="w-full py-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold text-sm rounded-md transition cursor-pointer"
            >
              Take Sample Test
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500 font-normal">
          <p>{siteCopyright || '© BEHOLD Aspire, 2026. All rights reserved.'}</p>
          <div className="flex gap-6">
            <button
              onClick={() => onOpenDocs?.('privacy')}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-gray-500 text-xs sm:text-sm font-normal"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenDocs?.('terms')}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-gray-500 text-xs sm:text-sm font-normal"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
