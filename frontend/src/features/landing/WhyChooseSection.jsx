import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeading from './SectionHeading';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

/**
 * "Why choose us" story carousel. Every slide is assembled from the copy the
 * admin maintains for counselling, career mentoring and the aptitude assessment.
 */
export default function WhyChooseSection({ siteSettings = {}, onOpenBooking }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    const settings = siteSettings || {};
    const list = [];

    if (settings.enablePsychology !== false) {
      list.push({
        key: 'counselling',
        tag: getFirstText(settings.counselBadge),
        title: getFirstText(settings.counselTitle),
        hook: getFirstText(settings.counselSubtitle),
        body: getFirstText(settings.counselDesc),
        cta: getFirstText(settings.counselBtnText),
        action: 'book',
      });
    }

    if (settings.enableCareerMentoring !== false) {
      list.push({
        key: 'career',
        tag: getFirstText(settings.careerBadge),
        title: getFirstText(settings.careerTitle),
        hook: getFirstText(settings.careerSubtitle),
        body: getFirstText(settings.careerDesc),
        cta: getFirstText(settings.careerBtnText),
        action: 'book',
      });
    }

    if (settings.enableAptitude !== false) {
      list.push({
        key: 'aptitude',
        tag: getFirstText(settings.aptitudeSectionSub),
        title: getFirstText(settings.aptitudeSectionTitle),
        hook: '',
        body: getFirstText(settings.aptitudeSectionDesc),
        cta: '',
        action: 'aptitude',
      });
    }

    return list.filter((slide) => slide.title || slide.body);
  }, [siteSettings]);

  if (slides.length === 0) return null;

  const safeIndex = Math.min(activeIndex, slides.length - 1);
  const slide = slides[safeIndex];
  const image = getFirstText(siteSettings.whyChooseUsImage);
  // A second column only makes sense when the admin supplied artwork or there
  // is more than one story to navigate — otherwise the copy gets the full width.
  const hasImage = Boolean(image);
  const hasSidePanel = hasImage || slides.length > 1;
  const total = String(slides.length).padStart(2, '0');
  const current = String(safeIndex + 1).padStart(2, '0');

  const goPrev = () => setActiveIndex(safeIndex === 0 ? slides.length - 1 : safeIndex - 1);
  const goNext = () => setActiveIndex(safeIndex === slides.length - 1 ? 0 : safeIndex + 1);

  const handleCta = () => {
    if (slide.action === 'aptitude') {
      navigate('/aptitude');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (typeof onOpenBooking === 'function') onOpenBooking();
  };

  return (
    <section id="why-choose-us" className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why Choose Us" title="Care That Puts You First" />

        <div
          className={`reveal-on-scroll reveal-delay-1 mt-10 grid gap-8 sm:mt-12 sm:gap-10 ${
            hasSidePanel ? 'items-stretch lg:grid-cols-2 lg:gap-14' : 'mx-auto max-w-3xl'
          }`}
        >
          {/* Copy panel */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-[#E6DFD0] bg-[#FBF8F1] p-6 sm:p-8 lg:p-9">
              {slide.tag && (
                <span className="inline-flex items-center rounded-full bg-[#EAF4F7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B5C73]">
                  {slide.tag}
                </span>
              )}

              {slide.title && (
                <h3 className="mt-4 text-[22px] font-semibold leading-snug tracking-tight text-[#0E1111] sm:text-[26px]">
                  {slide.title}
                </h3>
              )}

              {slide.hook && (
                <p className="mt-1.5 text-[13px] font-medium text-[#0E7490] sm:text-sm">
                  {slide.hook}
                </p>
              )}

              {slide.body && (
                <p className="mt-4 text-[13px] leading-[1.75] text-[#55605F] sm:text-sm">
                  {slide.body}
                </p>
              )}

              {slide.cta && (
                <button
                  type="button"
                  onClick={handleCta}
                  className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0E1111] px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0E7490] cursor-pointer border-none"
                >
                  {slide.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}

              {slides.length > 1 && (
                <div className="mt-7 flex items-center justify-between border-t border-[#E6DFD0] pt-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Previous highlight"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED8C9] bg-white text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0E7490] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next highlight"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED8C9] bg-white text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0E7490] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-[#0E1111]">
                      {current}/{total}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {slides.map((item, idx) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setActiveIndex(idx)}
                          aria-label={`Show highlight ${idx + 1}`}
                          aria-current={idx === safeIndex}
                          className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer border-none ${
                            idx === safeIndex ? 'w-5 bg-[#0E7490]' : 'w-1.5 bg-[#D6D0C1] hover:bg-[#0E7490]/50'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual — admin image when provided, otherwise an editorial chapter panel */}
          {hasSidePanel && (
            <div className="relative order-1 lg:order-2">
              {hasImage ? (
                <div className="relative h-full overflow-hidden rounded-2xl border border-white shadow-[0_24px_50px_-30px_rgba(14,17,17,0.35)]">
                  <img
                    src={image}
                    alt={slide.title || 'Care at BEHOLD'}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0E1111] p-6 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#0E7490]/40 blur-2xl"
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Highlights
                    </span>
                    <span className="text-[30px] font-semibold leading-none tracking-tighter text-white/20">
                      {current}
                    </span>
                  </div>

                  <ul className="relative mt-5 flex-1 space-y-1.5">
                    {slides.map((item, idx) => {
                      const isActive = idx === safeIndex;
                      return (
                        <li key={item.key}>
                          <button
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 cursor-pointer border-none bg-transparent ${
                              isActive ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <span
                              className={`text-[10.5px] font-semibold tracking-[0.12em] ${
                                isActive ? 'text-[#7DD3E8]' : 'text-white/35'
                              }`}
                            >
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={`flex-1 text-[12.5px] font-medium leading-snug ${
                                isActive ? 'text-white' : 'text-white/55 group-hover:text-white/80'
                              }`}
                            >
                              {item.title}
                            </span>
                            {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7DD3E8]" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
