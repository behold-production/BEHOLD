import React from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import heroLandscapeBg from '../../assets/header_landscape.jpg';

export default function Footer({ navigateToSection, siteName, siteCopyright, onOpenDocs, siteSettings }) {
  const settings = siteSettings || {};
  const emailAddr = settings.contactEmail?.trim() || 'beholdoffice@gmail.com';
  const phoneVal = settings.contactPhone?.trim() || '+91 92070 75151';
  const whatsappUrl = 'https://wa.me/919497174011';

  const goTo = (section) => {
    if (section.startsWith('/')) {
      window.spaNavigate?.(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.(section);
    }
  };

  const handleBookingCTA = () => {
    if (navigateToSection) {
      navigateToSection('services');
    } else {
      window.location.href = '/booking';
    }
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
                {phoneVal && (
                  <a href={`tel:${phoneVal.replace(/\s+/g, '')}`} className="hover:text-[#b85438] transition-colors inline-flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#b85438]" />
                    <span>Helpline: {phoneVal}</span>
                  </a>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#b85438] transition-colors inline-flex items-center gap-2 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>WhatsApp: +91 94971 74011</span>
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="col-span-1 md:col-span-3">
              <h4 className="text-[#1c2826] font-semibold uppercase text-[11px] tracking-widest mb-3.5">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5c6b66]">
                <li>
                  <button onClick={() => goTo('home')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/about')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Our Philosophy
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/psychologists')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Clinical Psychologists
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/blog')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Journal &amp; Insights
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('/faqs')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    FAQ Directory
                  </button>
                </li>
              </ul>
            </div>

            {/* Care Services Column */}
            <div className="col-span-1 md:col-span-4">
              <h4 className="text-[#1c2826] font-semibold uppercase text-[11px] tracking-widest mb-3.5">
                Care Services
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5c6b66]">
                <li>
                  <button onClick={() => goTo('services')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Psychological Counselling &amp; Emotional Support
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    C-DAT Career Aptitude &amp; Mentorship
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Doorstep In-Home Therapy (Kerala)
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('services')} className="hover:text-[#b85438] transition-colors bg-transparent border-none p-0 cursor-pointer">
                    Secure Online Tele-Counselling
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Policy Links */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7d8b85]">
            <div>
              &copy; {new Date().getFullYear()} {siteName || 'BEHOLD'}. All rights reserved.
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
