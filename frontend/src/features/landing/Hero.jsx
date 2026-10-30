import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Phone, Video, MapPin, Home as HomeIcon, UserRound } from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import heroFallbackImage from '../../assets/hero-watercolor.jpg';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

export default function Hero({ siteSettings, navigateToSection, onOpenBooking }) {
  const settings = siteSettings || {};
  const navigate = useNavigate();
  const { user } = useAuth();

  const headline = getFirstText(
    settings.heroTitle,
    'Your Mental Wellness, From the Comfort of Your Home'
  )
    .replace(/\\n/g, '\n')
    .replace(/[{}]/g, '');

  const description = getFirstText(
    settings.heroSub,
    'Professional online counselling tailored to your needs — accessible, compassionate, and confidential.'
  );

  const buttonText = getFirstText(settings.heroBtnText, 'Book an Appointment');
  const eyebrow = getFirstText(settings.heroEyebrow, 'Licensed Clinical Psychologists').replace(/\s+/g, ' ');
  const heroImage = getFirstText(settings.heroBgImage) || heroFallbackImage;
  const phone = getFirstText(settings.contactPhone);
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;

  const stats = Array.isArray(settings.heroStats)
    ? settings.heroStats.filter((stat) => stat && (stat.num || stat.label)).slice(0, 3)
    : [];

  // The bar is built from however many stats the admin saved plus an optional
  // phone cell — the column count follows the cell count so no empty cell
  // (the beige gap colour) ever shows up.
  const statCells = stats.length + (phoneHref ? 1 : 0);
  const statsDesktopCols = statCells >= 4
    ? 'lg:grid-cols-4'
    : statCells === 3
      ? 'lg:grid-cols-3'
      : statCells === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-1';
  const statCellSpan = statCells % 2 === 1 ? 'col-span-2 lg:col-span-1' : '';
  // Only the trailing cell widens on the 2-column mobile grid when the count is odd.
  const lastStatSpan = (idx) =>
    !phoneHref && statCells % 2 === 1 && idx === stats.length - 1 ? statCellSpan : '';

  // Consultation modes come straight from the admin settings — never hardcoded.
  const modes = [
    settings.enableOnline !== false && { key: 'online', label: 'Online sessions', Icon: Video },
    settings.enableOffline !== false && { key: 'centre', label: 'In-centre sessions', Icon: MapPin },
    settings.enableDoorstep !== false && { key: 'doorstep', label: 'Doorstep visits', Icon: HomeIcon },
  ].filter(Boolean);

  const scrollToSection = (id) => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
    }
    navigateToSection?.(id);
  };

  const handleBookClick = () => {
    if (typeof onOpenBooking === 'function') onOpenBooking();
    else scrollToSection('services');
  };

  const handleAccountClick = () => {
    if (user) {
      navigate('/profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behold:open_auth'));
    }
  };

  return (
    <>
      <SEO
        title={`${settings.siteName || 'BEHOLD'} | ${headline.replace(/\n/g, ' ')}`}
        description={description}
        canonicalUrl="https://www.behold.co.in/"
      />

      <section id="home" aria-labelledby="bh-hero-title" className="relative isolate w-full overflow-hidden bg-[#FBF8F1]">
        {/* Admin background image, edge to edge */}
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_58%]"
        />

        {/* Legibility veils — strong cream behind the copy, artwork left clear on desktop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#FBF8F1]/92 via-[#FBF8F1]/74 to-[#FBF8F1]/38 lg:bg-gradient-to-r lg:from-[#FBF8F1] lg:via-[#FBF8F1]/72 lg:to-transparent"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#FBF8F1]/85 to-transparent" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#FBF8F1] via-[#FBF8F1]/70 to-transparent" />

        <div className="relative mx-auto flex min-h-[520px] max-w-6xl flex-col justify-center px-4 pb-10 pt-24 sm:min-h-[560px] sm:px-6 sm:pt-28 lg:min-h-[600px] lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-[36rem] text-center lg:mx-0 lg:text-left">
            {eyebrow && (
              <p className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-hand text-[26px] leading-none text-[#0B5C73] sm:text-[31px]">
                {eyebrow}
              </p>
            )}

            <h1
              id="bh-hero-title"
              className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 font-display-italic mt-3 whitespace-pre-line text-[2.35rem] leading-[1.12] tracking-tight text-[#0E1111] sm:mt-4 sm:text-[3.2rem] lg:text-[3.9rem]"
            >
              {headline}
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 duration-600 delay-200 mx-auto mt-5 max-w-xl text-[13.5px] leading-[1.8] text-[#3F4A49] sm:text-[15px] lg:mx-0">
              {description}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-600 delay-300 mt-7 flex flex-col items-stretch gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={handleBookClick}
                className="group inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E7490] px-6 py-2.5 text-[13px] font-semibold text-white shadow-[0_14px_30px_-16px_rgba(14,116,144,0.95)] transition-all duration-200 hover:bg-[#0B5C73] active:scale-[0.99] cursor-pointer border-none sm:px-7"
              >
                {buttonText}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={handleAccountClick}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D8D2C3] bg-white/85 px-5 py-2.5 text-[13px] font-semibold text-[#0E1111] backdrop-blur-sm transition-all duration-200 hover:border-[#0E7490]/45 hover:text-[#0B5C73] active:scale-[0.99] cursor-pointer sm:px-6"
              >
                <UserRound className="h-4 w-4 text-[#0E7490]" />
                {user ? 'My Account' : 'Login / Register'}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('services')}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-[13px] font-semibold text-[#0B5C73] underline decoration-[#0E7490]/30 decoration-1 underline-offset-4 transition-colors duration-200 hover:text-[#0E7490] hover:decoration-[#0E7490] cursor-pointer bg-transparent"
              >
                Explore Our Services
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {modes.length > 0 && (
              <ul className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
                {modes.map(({ key, label, Icon }) => (
                  <li key={key} className="inline-flex items-center gap-2 text-[11.5px] font-medium text-[#3F4A49] sm:text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-[#0E7490] shadow-[0_1px_3px_rgba(14,17,17,0.08)]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Admin trust stats bar, sitting on the artwork */}
        {(stats.length > 0 || phoneHref) && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
            <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/70 bg-[#E3DCCB] shadow-[0_26px_56px_-38px_rgba(14,17,17,0.55)] ${statsDesktopCols}`}>
              {stats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className={`bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5 ${lastStatSpan(idx)}`}
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-[21px] font-semibold leading-none tracking-tight text-[#0E7490] sm:text-[26px]">
                      {stat.num}
                    </span>
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-[#55605F] sm:text-[10.5px]">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}

              {phoneHref && (
                <a
                  href={phoneHref}
                  className={`group flex min-w-0 items-center gap-3 bg-[#0E1111] px-4 py-4 no-underline transition-colors duration-200 hover:bg-[#0B5C73] sm:px-6 sm:py-5 ${statCellSpan}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="hidden text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-white/55 sm:block sm:text-[9.5px]">
                      Talk to our team
                    </span>
                    <span className="whitespace-nowrap text-[13px] font-semibold text-white sm:mt-0.5">{phone}</span>
                  </span>
                </a>
              )}
            </dl>
          </div>
        )}
      </section>
    </>
  );
}
