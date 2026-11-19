import React from 'react';
import { Star, Heart, MapPin, Video } from 'lucide-react';

export default function MobileTherapistCard({
  therapist,
  isFavorite = false,
  onToggleFavorite,
  onBookTap,
  onCardTap,
}) {
  const initial = (therapist?.name || 'P').charAt(0).toUpperCase();

  return (
    <div className="mb-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(17,24,39,0.04)] transition-all active:scale-[0.99]">
      <div className="flex items-start gap-3.5">
        {/* Avatar with Online Indicator */}
        <div className="relative shrink-0 cursor-pointer" onClick={onCardTap}>
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-cyan-50 border border-cyan-100 text-[#0E7490] font-bold text-xl">
            {therapist.photo ? (
              <img
                src={therapist.photo}
                alt={therapist.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              initial
            )}
          </div>
          {/* Online green indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-xs" />
        </div>

        {/* Details Column */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0 flex-1 cursor-pointer" onClick={onCardTap}>
              <span className="block text-[11.5px] font-bold uppercase tracking-wider text-[#0E7490]">
                {therapist.designation || 'Clinical Psychologist'}
              </span>
              <h4 className="truncate text-[15px] font-bold text-slate-900 leading-snug">
                {therapist.name}
              </h4>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold">{therapist.rating || '4.9'}</span>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-[11.5px]">
              <MapPin className="h-3 w-3 text-slate-400" />
              {therapist.city || 'Kochi'}
            </span>
            <span>•</span>
            <span className="text-[11.5px] text-slate-400">
              ({therapist.reviews || 24} reviews)
            </span>
          </div>

          {/* Bottom Row: Favorite Heart + Book Now button */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50'
                  : 'text-slate-400 hover:text-slate-600 bg-slate-50'
              }`}
              aria-label="Add to favorites"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onBookTap}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E7490] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0B5C73] active:scale-95"
            >
              <Video className="h-3.5 w-3.5" />
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
