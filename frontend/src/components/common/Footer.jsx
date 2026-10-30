import React from 'react';
import { ArrowRight, Globe, Mail, MapPin, Phone } from 'lucide-react';
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

export default function Footer({
  navigateToSection,
  siteName,
  siteCopyright,
  onOpenDocs,
  onOpenBooking,
  siteSettings,
  hideCta = false,
}) {
  const settings = siteSettings || {};
  const ctaBg = (typeof settings.heroBgImage === 'string' && settings.heroBgImage.trim()) || heroLandscapeBg;
  const emailAddr = settings.contactEmail?.trim() || '';
  const phoneVal = settings.contactPhone?.trim() || '';

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

  const goTo = (section) => {
    if (section.startsWith('/')) {
      window.spaNavigate?.(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = typeof document !== 'undefined' ? document.getElementById(section) : null;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    navigateToSection?.(section);
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
    window.spaNavigate?.('/booking');
  };

  const socialList = Array.isArray(settings.socialLinks)
    ? settings.socialLinks.filter((social) => social?.name && social?.url && social.url !== '#')
    : [];

  // Care services come from the admin service copy — never hardcoded.
  const careLinks = [
    settings.enablePsychology !== false && settings.counselTitle && {
      label: settings.counselTitle,
      onClick: handleBookingCTA,
    },
    settings.enableCareerMentoring !== false && settings.careerTitle && {
      label: settings.careerTitle,
      onClick: handleBookingCTA,
    },
    settings.enableAptitude !== false && settings.aptitudeSectionTitle && {
      label: settings.aptitudeSectionTitle,
      onClick: () => { window.spaNavigate?.('/aptitude'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    },
  ].filter(Boolean);

  const ctaHeading = settings.counselSubtitle?.trim() || 'You Don’t Have to Face It Alone.';
  const ctaDescription = settings.counselDesc?.trim()
    || 'Connect with licensed clinical psychologists and student mentors dedicated to your emotional health and lifelong clarity.';
  const ctaButton = settings.heroBtnText?.trim() || settings.counselBtnText?.trim() || 'Book a Session';

  return (
    <>
      {!hideCta && (
        <section className="relative w-full bg-[#FBF8F1] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#D8E8EC]">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${ctaBg})` }}
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[#0E1111]/72" />
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full bg-[#0E7490]/40 blur-3xl" />

            <div className="relative flex flex-col flex-wrap items-start gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-white sm:text-[28px]">
                  {ctaHeading}
                </h2>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/75 sm:text-[13.5px]">
                  {ctaDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={handleBookingCTA}
                className="group inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E7490] px-6 py-2.5 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-[#0B5C73] cursor-pointer border-none"
              >
                {ctaButton}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      <footer className="relative z-10 border-t border-[#E6DFD0] bg-[#FBF8F1] pb-8 pt-12 sm:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 gap-9 pb-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-5">
              <button
                onClick={() => navigateToSection?.('top')}
                className="flex items-baseline bg-transparent p-0 text-left text-2xl font-black uppercase tracking-tight text-[#0E1111] cursor-pointer border-none sm:text-3xl"
              >
                <span>{(siteName || 'BEHOLD').replace(/\.$/, '')}</span>
                <span className="text-[#0E7490]">.</span>
              </button>

              <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-[#55605F]">
                {settings.footerDescription
                  || 'Compassionate psychological counselling and career mentorship, delivered by licensed professionals in complete confidence.'}
              </p>

              <div className="mt-4 flex flex-col gap-2 text-[12px] text-[#55605F]">
                {phoneVal && (
                  <a
                    href={`tel:${phoneVal.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-2 no-underline transition-colors hover:text-[#0E7490]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#0E7490]" />
                    {phoneVal}
                  </a>
                )}
                {emailAddr && (
                  <a
                    href={`mailto:${emailAddr}`}
                    className="inline-flex items-center gap-2 no-underline transition-colors hover:text-[#0E7490]"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#0E7490]" />
                    {emailAddr}
                  </a>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 no-underline transition-colors hover:text-[#0E7490]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    WhatsApp support
                  </a>
                )}
                {settings.openHours && (
                  <span className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0E7490]" />
                    {settings.openHours}
                  </span>
                )}
              </div>

              {socialList.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  {socialList.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      title={social.name}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2DCCC] bg-white text-[#55605F] transition-colors hover:border-[#0E7490] hover:bg-[#0E7490] hover:text-white"
                    >
                      <SocialIcon name={social.name} className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Main links */}
            <div className="lg:col-span-3">
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#0E1111]">
                Main Links
              </h4>
              <ul className="mt-3.5 space-y-2 text-[12.5px] text-[#55605F]">
                <li>
                  <button onClick={() => goTo('home')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/psychologists')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Psychologists
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/about')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/blog')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/contact')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact / care */}
            <div className="lg:col-span-4">
              <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#0E1111]">
                Care Services
              </h4>
              <ul className="mt-3.5 space-y-2 text-[12.5px] text-[#55605F]">
                {careLinks.map((link, idx) => (
                  <li key={`${link.label}-${idx}`}>
                    <button onClick={link.onClick} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={() => goTo('/faqs')} className="cursor-pointer border-none bg-transparent p-0 text-left transition-colors hover:text-[#0E7490]">
                    Frequently Asked Questions
                  </button>
                </li>
              </ul>

              {phoneVal && (
                <a
                  href={`tel:${phoneVal.replace(/[^\d+]/g, '')}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0E7490] px-4 py-2.5 text-[11.5px] font-semibold text-white no-underline transition-colors hover:bg-[#0B5C73]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Now
                </a>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E6DFD0] pt-6 text-[11.5px] text-[#6B7674] sm:flex-row">
            <div>
              {siteCopyright?.trim() || `\u00a9 ${new Date().getFullYear()} ${siteName || 'BEHOLD'}. All rights reserved.`}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenDocs?.('privacy')}
                className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] text-[#6B7674] transition-colors hover:text-[#0E7490]"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => onOpenDocs?.('terms')}
                className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] text-[#6B7674] transition-colors hover:text-[#0E7490]"
              >
                Terms of Use
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => onOpenDocs?.('refund')}
                className="cursor-pointer border-none bg-transparent p-0 text-[11.5px] text-[#6B7674] transition-colors hover:text-[#0E7490]"
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
