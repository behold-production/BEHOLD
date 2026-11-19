import React from 'react';
import { Star, Heart, MapPin, Video, Building2, Home } from 'lucide-react';

function formatCityLabel(rawCity) {
  if (!rawCity) return 'Kochi, Kerala';
  const str = String(rawCity).trim();
  if (str.length > 25) {
    if (/kochi/i.test(str) && /calicut/i.test(str)) return 'Kochi & Calicut, Kerala';
    if (/kochi/i.test(str)) return 'Kochi, Kerala';
    if (/calicut/i.test(str)) return 'Calicut, Kerala';
    if (/trivandrum/i.test(str)) return 'Trivandrum, Kerala';
    if (/bangalore|bengaluru/i.test(str)) return 'Bengaluru, Karnataka';
    return str.split(',')[0].trim();
  }
  return str;
}

export default function MobileTherapistCard({
  therapist,
  isFavorite = false,
  onToggleFavorite,
  onBookTap,
  onCardTap,
}) {
  const initial = (therapist?.name || 'P').charAt(0).toUpperCase();
  const modes = Array.isArray(therapist?.modes) && therapist.modes.length > 0
    ? therapist.modes
    : ['ONLINE', 'OFFLINE'];

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
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#0E7490]">
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

          {/* Location & Reviews */}
          <div className="mt-1 flex items-center gap-x-1.5 text-xs text-slate-500 overflow-hidden">
            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-700 truncate max-w-[175px]">
              <MapPin className="h-3 w-3 shrink-0 text-[#0E7490]" />
              <span className="truncate">{formatCityLabel(therapist.city)}</span>
            </span>
            <span className="text-slate-300 shrink-0">•</span>
            <span className="text-[11px] text-slate-400 shrink-0">
              ({therapist.reviews || 24} reviews)
            </span>
          </div>

          {/* Service Mode Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {modes.includes('ONLINE') && (
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200/80">
                <Video className="h-2.5 w-2.5 text-[#0E7490]" />
                Online
              </span>
            )}
            {modes.includes('OFFLINE') && (
              <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#0E7490] border border-teal-200/80">
                <Building2 className="h-2.5 w-2.5 text-[#0E7490]" />
                In-Person
              </span>
            )}
            {modes.includes('DOOR_STEP') && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80">
                <Home className="h-2.5 w-2.5 text-emerald-600" />
                Doorstep
              </span>
            )}
          </div>

          {/* Bottom Row: Favorite Heart + Book Now button */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors cursor-pointer ${
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E7490] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#0B5C73] active:scale-95 cursor-pointer border-none"
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
