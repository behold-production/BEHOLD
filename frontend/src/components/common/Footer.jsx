import React from 'react';
import { Mail, Phone, ArrowRight, Globe } from 'lucide-react';
import heroLandscapeBg from '../../assets/header_landscape.jpg';

// Inline brand SVGs (lucide-react dropped brand icons in this version)
const BRAND_PATHS = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
};

// Map common admin-entered variants / abbreviations to a canonical BRAND_PATHS key
const SOCIAL_ALIASES = {
  fb: 'facebook',
  insta: 'instagram',
  ig: 'instagram',
  tw: 'twitter',
  x: 'twitter',
  li: 'linkedin',
  yt: 'youtube',
};

function SocialIcon({ name, className }) {
  const key = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
  const resolved = SOCIAL_ALIASES[key] || key;
  const path = BRAND_PATHS[resolved];
  if (!path) return <Globe className={className} />;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, onOpenBooking, siteSettings }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || 'beholdoffice@gmail.com';
  const phoneVal = settings.contactPhone?.trim() || '+91 92070 75151';

  // Normalize WhatsApp from admin settings (accepts a raw number or a full wa.me URL); hide when disabled
  const whatsappHref = (() => {
    const input = settings.whatsapp;
    if (!input || input === '#' || input === false || input === 'disabled') return null;
    const str = String(input).trim();
    if (str.startsWith('http')) return str;
    const digits = str.replace(/\D/g, '');
    if (digits.length === 10) return `https://wa.me/91${digits}`;
    if (digits.length > 10) return `https://wa.me/${digits}`;
    return null;
  })();
  const whatsappDisplay = (() => {
    if (!whatsappHref) return null;
    let digits = (whatsappHref.match(/(\d+)\s*$/)?.[1]) || '';
    if (!digits) return null;
    let cc = '';
    if (digits.length > 10) {
      cc = digits.slice(0, digits.length - 10);
      digits = digits.slice(-10);
    }
    const body = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return `+${cc || '91'} ${body}`;
  })();

  const goTo = (section) => {
    if (section.startsWith('/')) {
      window.spaNavigate?.(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.(section);
    }
  };

  const handleBookingCTA = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
      return;
    }
    if (navigateToSection) {
      navigateToSection('services');
      return;
    }
    if (window.spaNavigate) window.spaNavigate('/booking');
    else window.location.href = '/booking';
  };

  const socialList = Array.isArray(settings.socialLinks)
    ? settings.socialLinks.filter((social) => social?.name && social?.url && social.url !== '#')
    : [];

  return (
    <>
      {/* SECTION 9: Pre-Footer CTA Banner matching Mockup */}
      <section className="relative w-full py-20 sm:py-28 bg-[#fbf9f5] overflow-hidden border-t border-[#ece6dc]">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-md overflow-hidden shadow-sm border border-[#ede7de]">
            {/* Watercolor Mountain Landscape Background */}
            <div
              className="w-full min-h-[300px] sm:min-h-[360px] bg-cover bg-center flex items-center justify-center p-8 sm:p-12 relative"
              style={{ backgroundImage: `url(${heroLandscapeBg})` }}
            >
              {/* Soft Ambient Overlay for crystal clear typography */}
              <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] pointer-events-none" />

              {/* Centered CTA Content */}
              <div className="relative z-10 max-w-xl text-center">
                <h2 className="font-serif-hero text-3xl sm:text-4xl md:text-5xl font-medium text-[#1c2826] tracking-tight leading-tight mb-4">
                  Begin Your Journey to Better Balance
                </h2>
                <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed mb-6 sm:mb-8">
                  Connect with licensed clinical psychologists and student mentors dedicated to your emotional health and lifelong clarity.
                </p>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleBookingCTA}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-xs sm:text-sm font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white shadow-sm hover:shadow transition-all duration-300 cursor-pointer active:scale-95 border-none"
                  >
                    <span>Schedule Consultation</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: Clean Minimalist Warm Footer matching Mockup */}
      <footer className="relative z-10 bg-[#f7f4ee] text-[#1c2826] pt-12 sm:pt-16 pb-12 border-t border-[#ece6dc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-10 border-b border-[#ede7de]">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-5 space-y-3">
              <button
                id="footer-brand"
                onClick={() => navigateToSection?.('top')}
                className="text-2xl sm:text-3xl font-black font-sans text-[#1c2826] uppercase tracking-tight bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-0.5"
              >
                <span>{(siteName || 'BEHOLD').replace(/\.$/, '')}</span>
                <span className="text-[#b85438] font-black">.</span>
              </button>
              <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed max-w-sm">
                {settings.footerDescription || 'A dedicated clinical sanctuary integrating compassionate psychological counseling, emotional regulation, and student career mentorship.'}
              </p>
              <div className="flex flex-col gap-1.5 pt-2 text-xs text-[#5c6b66]">
                {emailAddr && (
                  <a href={`mailto:${emailAddr}`} className="hover:text-[#b85438] transition-colors inline-flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#b85438]" />
                    <span>{emailAddr}</span>
                  </a>
                )}
                <a
                  href={`tel:${phoneVal.replace(/\s+/g, '')}`}
                  className="hover:text-[#b85438] transition-colors inline-flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#b85438]" />
                  <span>Helpline: {phoneVal}</span>
                </a>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#b85438] transition-colors inline-flex items-center gap-2 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>WhatsApp: {whatsappDisplay}</span>
                  </a>
                )}
              </div>

              {socialList.length > 0 && (
                <div className="flex items-center gap-2.5 pt-1">
                  {socialList.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        title={social.name}
                        className="w-8 h-8 rounded-md border border-[#e5ddd0] bg-white text-[#5c6b66] hover:text-white hover:bg-[#b85438] hover:border-[#b85438] transition-colors flex items-center justify-center"
                      >
                        <SocialIcon name={social.name} className="w-4 h-4" />
                      </a>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Column */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="text-[#b85438] font-bold uppercase text-[11px] tracking-[0.18em] mb-4">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5c6b66]">
                <li>
                  <button onClick={() => goTo('home')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/about')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Our Philosophy
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/psychologists')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Clinical Psychologists
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/blog')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Journal &amp; Insights
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/faqs')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    FAQ Directory
                  </button>
                </li>
              </ul>
            </div>

            {/* Care Services Column */}
            <div className="col-span-1 md:col-span-4">
              <h4 className="text-[#b85438] font-bold uppercase text-[11px] tracking-[0.18em] mb-4">
                Care Services
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5c6b66]">
                <li>
                  <button onClick={() => goTo('services')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Psychological Counselling &amp; Emotional Support
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    C-DAT Career Aptitude &amp; Mentorship
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Doorstep In-Home Therapy (Kerala)
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="text-left hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Secure Online Tele-Counselling
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Policy Links */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7d8b85]">
            <div>
              {siteCopyright?.trim() || `\u00a9 ${new Date().getFullYear()} ${siteName || 'BEHOLD'}. All rights reserved.`}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenDocs?.('privacy')}
                className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer text-xs text-[#7d8b85]"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenDocs?.('terms')}
                className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer text-xs text-[#7d8b85]"
              >
                Terms of Use
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onOpenDocs?.('refund')}
                className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer text-xs text-[#7d8b85]"
              >
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
