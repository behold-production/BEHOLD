import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, enablePsychology, enableCareerMentoring, siteSettings }) {
  const handleLogoClick = () => {
    if (navigateToSection) {
      navigateToSection('top');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderSocialIcon = (name, logo) => {
    const logoVal = (logo || '').trim();
    const isImageUrl = logoVal && /\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(logoVal);
    if (isImageUrl) {
      return (
        <img
          src={logoVal}
          alt={name}
          className="w-4 h-4 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      );
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
    if (norm.includes('twitter') || norm.includes('x.com') || norm.includes('x')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    return (
      <svg className="w-4 h-4 fill-none stroke-currentColor strokeWidth-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    );
  };

  const socials = (Array.isArray(siteSettings?.socialLinks)
    ? siteSettings.socialLinks
    : []).filter(link => {
      const url = (link.url || '').trim();
      return url !== '' && url !== '#' && url !== 'https://' && url !== 'http://';
    });

  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail && settings.contactEmail.trim() !== '' ? settings.contactEmail : null;
  const phoneVal = settings.contactPhone && settings.contactPhone.trim() !== '' ? settings.contactPhone : null;
  const addressVal = settings.contactAddress && settings.contactAddress.trim() !== '' ? settings.contactAddress : null;

  return (
    <footer className="bg-neon-blue-deep text-white/60 pt-12 sm:pt-16 pb-24 sm:pb-12 px-5 sm:px-10 border-t border-white/5 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Executive Responsive Layout */}
        <div className="grid grid-cols-12 gap-y-10 gap-x-8 lg:gap-12 mb-12 sm:mb-14 text-left">
          
          {/* Column 1: BEHOLD Logo, Contact Info & Social Icons */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-5">
            <div className="inline-block cursor-pointer" onClick={handleLogoClick}>
              <div className="inline-flex items-baseline text-white font-header font-black text-2xl sm:text-3xl tracking-wider uppercase drop-shadow-sm" style={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
                <span style={{ fontWeight: 900 }}>{siteName || 'BEHOLD'}</span>
                <span className="text-[#00E5FF] font-black ml-0.5" style={{ fontWeight: 900, color: '#00E5FF' }}>.</span>
              </div>
            </div>

            {/* Contact details directly below BEHOLD */}
            <div className="space-y-3 text-xs sm:text-sm font-normal pt-1 font-sans">
              {addressVal && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-soft shrink-0 mt-0.5" />
                  <span className="text-white/60 leading-relaxed">
                    {addressVal}
                  </span>
                </div>
              )}

              {emailAddr && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gold-soft shrink-0" />
                  <a
                    href={`mailto:${emailAddr}`}
                    className="text-white/60 hover:text-white transition-colors truncate"
                  >
                    {emailAddr}
                  </a>
                </div>
              )}

              {phoneVal && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gold-soft shrink-0" />
                  <a
                    href={`tel:${phoneVal}`}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {phoneVal}
                  </a>
                </div>
              )}
            </div>

            {/* Social Circle Outlined Buttons */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2.5 pt-2">
                {socials.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 bg-neon-blue-soft/20 text-white/70 hover:text-gold-soft hover:border-gold-soft/30 transition-all flex items-center justify-center"
                    title={link.name}
                  >
                    {renderSocialIcon(link.name, link.logo)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Columns 2 & 3: Services & Company (Side-by-Side on Mobile & Desktop) */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 grid grid-cols-2 gap-6 sm:gap-12">
            {/* Services */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-gold-soft tracking-wider uppercase font-mono">
                Services
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-normal font-sans">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection ? navigateToSection('services') : window.spaNavigate('/booking')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Career Mentoring
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection ? navigateToSection('services') : window.spaNavigate('/booking?service=counseling')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Psychological Counselling
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.spaNavigate('/booking')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Stream & Degree Selection
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.spaNavigate('/booking')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Aptitude Mapping
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.spaNavigate('/sample-test')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Sample Aptitude Assessment
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-gold-soft tracking-wider uppercase font-mono">
                Company
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-normal font-sans">
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection && navigateToSection('top')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenDocs && onOpenDocs('privacy')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenDocs && onOpenDocs('terms')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigateToSection && navigateToSection('inquiry')}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Support & Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Bottom Links with Clearance for Floating Button */}
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/50 pr-16 sm:pr-24 font-sans">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => onOpenDocs && onOpenDocs('privacy')}
              className="text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenDocs && onOpenDocs('terms')}
              className="text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-medium"
            >
              Terms of Service
            </button>
          </div>
          <p className="leading-relaxed">
            {siteCopyright || '© 2026 Behold Aspire Educational & Mentorship Services. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
