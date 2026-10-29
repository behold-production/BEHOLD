import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Compass,
  GraduationCap,
  HeartHandshake,
  Home as HomeIcon,
  LineChart,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import SectionHeading from './SectionHeading';

const OFFER_ICONS = [HeartHandshake, HomeIcon, GraduationCap, LineChart, UserRound, ShieldCheck, BookOpen];

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

/**
 * Service tiles are assembled from the admin's service section copy plus the
 * dynamic "What we offer" cards they maintain in Settings.
 */
export default function ServicesShowcase({ siteSettings = {}, onOpenBooking }) {
  const navigate = useNavigate();

  const tiles = useMemo(() => {
    const settings = siteSettings || {};
    const list = [];

    if (settings.enablePsychology !== false) {
      list.push({
        id: 'counselling',
        icon: Brain,
        title: getFirstText(settings.counselTitle, 'Psychological Counselling'),
        description: getFirstText(settings.counselDesc),
        action: 'book',
      });
    }

    if (settings.enableCareerMentoring !== false) {
      list.push({
        id: 'career',
        icon: Compass,
        title: getFirstText(settings.careerTitle, 'Career Mentoring'),
        description: getFirstText(settings.careerDesc),
        action: 'book',
      });
    }

    if (settings.enableAptitude !== false) {
      list.push({
        id: 'aptitude',
        icon: Sparkles,
        title: getFirstText(settings.aptitudeSectionTitle, 'Aptitude Assessment'),
        description: getFirstText(settings.aptitudeSectionDesc),
        action: 'aptitude',
      });
    }

    // Admin maintains the offer list either as aboutCards or as offer1..offer6 fields.
    const offerCards = Array.isArray(settings.aboutCards) && settings.aboutCards.length > 0
      ? settings.aboutCards
      : [1, 2, 3, 4, 5, 6]
          .map((n) => ({
            title: settings[`offer${n}Title`] || '',
            desc: settings[`offer${n}Desc`] || '',
          }))
          .filter((card) => (card.title || '').trim());

    offerCards
      .filter((card) => card && (card.title || '').trim())
      .slice(0, 6)
      .forEach((card, idx) => {
        list.push({
          id: `offer-${idx}`,
          icon: OFFER_ICONS[idx % OFFER_ICONS.length],
          title: card.title.trim(),
          description: (card.desc || '').trim(),
          action: 'book',
        });
      });

    return list;
  }, [siteSettings]);

  if (tiles.length === 0) return null;

  const handleTileClick = (tile) => {
    if (tile.action === 'aptitude') {
      navigate('/aptitude');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (typeof onOpenBooking === 'function') onOpenBooking();
  };

  const description = getFirstText(
    siteSettings.servicesSectionDesc,
    siteSettings.aboutSub
  );

  return (
    <section
      id="services"
      aria-labelledby="bh-services-heading"
      className="relative w-full bg-[#FBF8F1] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={getFirstText(siteSettings.servicesSectionSub, 'Our Services')}
          title={getFirstText(siteSettings.servicesSectionTitle, 'Explore Our Services')}
          description={description}
        />

        <div className="mt-9 flex flex-wrap justify-center gap-3 sm:mt-12 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTileClick(tile)}
                title={tile.title}
                className="group flex w-[calc(50%-0.375rem)] flex-col items-start gap-3 rounded-xl border border-[#E6DFD0] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0E7490]/50 hover:shadow-[0_16px_30px_-22px_rgba(14,17,17,0.45)] cursor-pointer sm:w-[calc(33.333%-0.667rem)] sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF4F7] text-[#0E7490] transition-colors duration-200 group-hover:bg-[#0E7490] group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>

                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-[12.5px] font-semibold leading-snug text-[#0E1111] sm:text-[13px]">
                    {tile.title}
                  </span>
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8BFBD] transition-colors duration-200 group-hover:text-[#0E7490]" />
                </span>

                {tile.description && (
                  <span className="line-clamp-2 text-[11px] leading-relaxed text-[#6B7674]">
                    {tile.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
