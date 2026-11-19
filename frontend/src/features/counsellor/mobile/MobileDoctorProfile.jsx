import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, Star, Award, Users, ShieldCheck, 
  MapPin, CheckCircle2, Share2, Bookmark, Info, Calendar, Plus
} from 'lucide-react';

/**
 * MobileDoctorProfile
 * Direct 1:1 mobile implementation of CarePro DoctorProfileScreen (care_pro)
 */
export default function MobileDoctorProfile({
  advisor = {},
  onBack,
  onBook,
  isBookmarked = false,
  onToggleBookmark,
  reviews = [],
}) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const availabilityDays = [
    { day: 'MON', date: '16', available: true },
    { day: 'TUE', date: '17', available: true },
    { day: 'WED', date: '18', available: true },
    { day: 'THU', date: '19', available: true },
    { day: 'FRI', date: '20', available: true },
    { day: 'SAT', date: '21', available: true },
  ];

  const initial = (advisor?.name || 'D').charAt(0).toUpperCase();
  const bio = advisor.about || advisor.bio || 'Compassionate licensed clinical psychologist specializing in cognitive behavioral therapy, anxiety management, and personal growth counseling.';
  const shortBio = bio.length > 160 ? bio.substring(0, 160) + '...' : bio;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h1 className="text-base font-bold text-slate-900">Doctor Profile</h1>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleBookmark}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isBookmarked
                ? 'border-amber-300 bg-amber-50 text-amber-600'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
            aria-label="Bookmark"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3.5 space-y-4">
        {/* Doctor Main Info Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex items-start gap-3.5">
            {/* Avatar with Online Indicator */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-cyan-50 border border-cyan-100 text-[#0E7490] font-bold text-2xl shadow-xs">
                {advisor.profilePic || advisor.image ? (
                  <img
                    src={advisor.profilePic || advisor.image}
                    alt={advisor.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-base font-extrabold text-slate-900">
                  {advisor.name}
                </h2>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0E7490] fill-[#0E7490]/10" />
              </div>

              <p className="mt-0.5 text-xs font-semibold text-[#0E7490]">
                {advisor.role || advisor.title || 'Clinical Psychologist'}
              </p>

              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{advisor.hospital || 'Behold Wellness Clinic • Video & In-Person'}</span>
              </div>

              <div className="mt-2 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-800">{advisor.rating || '4.9'}</span>
                <span className="text-[11px] text-slate-400">({advisor.reviewsCount || 124} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-[#0E7490]">
              <Users className="h-4 w-4" />
            </div>
            <span className="mt-1.5 block text-[10px] font-medium text-slate-400">Clients</span>
            <span className="block text-xs font-bold text-slate-900">1,200+</span>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
            <span className="mt-1.5 block text-[10px] font-medium text-slate-400">Experience</span>
            <span className="block text-xs font-bold text-slate-900">{advisor.experienceYears || '8+'} Yrs</span>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-xs">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <span className="mt-1.5 block text-[10px] font-medium text-slate-400">Rating</span>
            <span className="block text-xs font-bold text-slate-900">{advisor.rating || '4.9'} ★</span>
          </div>
        </div>

        {/* About Doctor */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">About Doctor</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {isBioExpanded ? bio : shortBio}
          </p>
          {bio.length > 160 && (
            <button
              type="button"
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="mt-1.5 text-xs font-bold text-[#0E7490]"
            >
              {isBioExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Working Hours / Availability */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Working Hours</h3>
            <span className="text-[11px] font-semibold text-[#0E7490]">Available Slots</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availabilityDays.map((item, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={`${item.day}-${item.date}`}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#0E7490] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <span className="text-[10px] font-medium">{item.day}</span>
                  <span className="text-sm font-extrabold mt-0.5">{item.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Reviews &amp; Ratings</h3>
            <span className="text-xs font-bold text-[#0E7490]">
              {reviews.length} Reviews
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="border-t border-slate-100 pt-2.5 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{rev.author}</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{rev.date}</span>
                  <p className="mt-1 text-xs text-slate-600 italic">
                    "{rev.content}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No verified reviews yet.</p>
          )}
        </div>
      </div>

      {/* Fixed Bottom Booking Bar (Portal attached to body to prevent any scroll jitter) */}
      {typeof document !== 'undefined' && createPortal(
        <aside className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/80 px-5 py-3.5 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                CONSULTATION FEE
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{(advisor.price || 899).toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#0E7490] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#0B5C73] active:scale-95 cursor-pointer border-none"
            >
              <span>Book Consultation</span>
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </aside>,
        document.body
      )}
    </div>
  );
}
