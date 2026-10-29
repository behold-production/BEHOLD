import React from 'react';
import { ArrowRight } from 'lucide-react';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

/**
 * About / "What we offer" split panel. Copy and numbers are fully admin-managed
 * (aboutTitle, aboutSub, aboutStats) with the hero image as the visual anchor.
 */
export default function HomeOfferSection({ siteSettings = {}, onOpenBooking }) {
  const settings = siteSettings || {};
  const title = getFirstText(settings.aboutTitle, 'What We Offer');
  const description = getFirstText(
    settings.aboutSub,
    'Personalised psychological care and career mentorship, delivered with clinical rigour and complete confidentiality.'
  );
  const ctaText = getFirstText(settings.counselBtnText, settings.heroBtnText);
  const stats = Array.isArray(settings.aboutStats)
    ? settings.aboutStats.filter((stat) => stat && (stat.value || stat.label)).slice(0, 4)
    : [];

  const handleBook = () => {
    if (typeof onOpenBooking === 'function') onOpenBooking();
    else window.spaNavigate?.('/booking');
  };

  return (
    <section id="about" className="relative w-full overflow-hidden bg-[#FBF8F1] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
          {/* Numbers panel — every figure comes from the admin's about stats */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -left-3 -top-3 h-full w-full rounded-2xl border border-[#CBE7EE] bg-[#EAF4F7]"
            />

            <div className="relative rounded-2xl border border-[#E6DFD0] bg-white p-6 shadow-[0_26px_54px_-38px_rgba(14,17,17,0.4)] sm:p-8">
              {stats.length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8">
                  {stats.map((stat, idx) => (
                    <div key={`${stat.label}-${idx}`} className="border-l-2 border-[#EAF4F7] pl-4">
                      <dd className="text-[26px] font-semibold leading-none tracking-tight text-[#0E7490] sm:text-[30px]">
                        {stat.value || stat.num}
                      </dd>
                      <dt className="mt-1.5 text-[11px] font-medium uppercase leading-snug tracking-[0.08em] text-[#55605F]">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs leading-relaxed text-[#55605F]">
                  Key numbers added from the admin panel will appear here.
                </p>
              )}

              <div className="mt-7 flex items-center gap-2 border-t border-[#EDE6D7] pt-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0E7490]" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#55605F]">
                  {settings.counselBadge?.trim() || 'BEHOLD'}
                </span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="pt-2 lg:pt-0">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E7490]">
              <span aria-hidden="true" className="h-[1px] w-6 bg-[#0E7490]/40" />
              About Us
            </span>

            <h2 className="mt-3 text-[24px] font-semibold leading-[1.18] tracking-tight text-[#0E1111] sm:text-[30px] md:text-[34px]">
              {title}
            </h2>

            <p className="mt-4 text-[13px] leading-[1.75] text-[#55605F] sm:text-sm">
              {description}
            </p>

            {ctaText && (
              <button
                type="button"
                onClick={handleBook}
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0E7490] px-6 py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0B5C73] cursor-pointer border-none sm:text-[13px]"
              >
                {ctaText}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
