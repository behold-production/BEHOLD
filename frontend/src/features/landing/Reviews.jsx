import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import naturePathImg from '../../assets/nature_path.jpg';

const getInitials = (name = '') => {
  const clean = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'B';
  return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
};


export default function Reviews({ siteSettings = {} }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', role: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchFn = ApiService.getPublicReviews || ApiService.getReviews;
    if (typeof fetchFn === 'function') {
      fetchFn.call(ApiService)
        .then((res) => {
          if (!isMounted) return;
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data.map((r, idx) => ({
              id: r._id || r.id || `api-rev-${idx}`,
              name: r.name || 'Anonymous',
              role: r.role || 'Client',
              tag: r.category || 'Therapy & Guidance',
              quote: r.comment || r.text || '',
              avatar: typeof r.avatar === 'string' && r.avatar.trim() ? r.avatar : null,
              rating: Number(r.rating) || 5,
            })).filter(r => r.quote);

            setReviews(mapped);
          }
        })
        .catch(() => {})
        .finally(() => { if (isMounted) setLoading(false); });
    } else {
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, []);

  const activeStory = reviews[activeIndex] || reviews[0] || null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      setError('Please provide your name and reflection.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await ApiService.submitReview(form.name.trim(), form.role.trim(), form.rating, form.comment.trim());
      setSubmitted(true);
    } catch {
      setError('Could not submit review at this time. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="relative bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20">
      {/* SECTION 5: Nature Path Quote Banner */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="relative rounded-md overflow-hidden shadow-sm border border-[#ede7de]">
          {/* Nature Path Visual Asset */}
          <div
            className="w-full min-h-[340px] sm:min-h-[420px] bg-cover bg-center flex items-center justify-center p-6 sm:p-12 relative"
            style={{ backgroundImage: `url(${naturePathImg})` }}
          >
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />

            {/* Centered Floating Quote Card */}
            <div className="relative z-10 max-w-2xl bg-white/95 backdrop-blur-md rounded-md p-7 sm:p-10 border border-white/80 shadow-md text-center">
              <span className="text-[10px] font-bold text-[#b85438] uppercase tracking-[0.2em] block mb-3">
                Words of Sanctuary
              </span>
              <p className="font-serif-hero text-lg sm:text-2xl font-normal text-[#1c2826] leading-relaxed italic mb-4">
                &ldquo;Peace comes from within. Do not seek it without. Our compassionate team provides the sanctuary and guidance you need to rediscover harmony.&rdquo;
              </p>
              <span className="text-xs text-[#5c6b66] font-medium tracking-wide">
                — BEHOLD Clinical Sanctuary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Testimonials / Client Stories */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header: Left terracotta eyebrow, Right serif heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-14 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              Testimonials
            </span>
          </div>
          <div>
            <h2 className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug">
              Real Stories of Renewal &amp; Hope
            </h2>
          </div>
        </div>

        {/* 5 Avatars Spotlight Row */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm bg-[#f0eae1] animate-pulse" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          {reviews.slice(0, 5).map((rev, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={rev.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-sm transition-all duration-300 cursor-pointer p-0.5 border-2 ${
                  isSelected
                    ? 'border-[#b85438] scale-105 shadow-sm ring-2 ring-[#b85438]/20'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                title={`Read story from ${rev.name}`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm overflow-hidden bg-[#f4eee6] flex items-center justify-center">
                  {rev.avatar ? (
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#b85438]">{getInitials(rev.name)}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        ) : null}

        {/* Active Testimonial Card */}
        {loading ? (
          <div className="max-w-3xl mx-auto text-center px-4 py-6">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-[#f0eae1] animate-pulse" />
              ))}
            </div>
            <div className="space-y-3 max-w-xl mx-auto">
              <div className="h-5 w-full bg-[#f0eae1] rounded-sm animate-pulse mx-auto" />
              <div className="h-5 w-4/5 bg-[#f0eae1] rounded-sm animate-pulse mx-auto" />
              <div className="h-4 w-1/3 bg-[#f0eae1] rounded-sm animate-pulse mx-auto mt-5" />
            </div>
          </div>
        ) : activeStory ? (
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-4">
            {Array.from({ length: activeStory.rating || 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
            ))}
          </div>

          <p className="font-serif-hero text-xl sm:text-2xl md:text-3xl font-normal text-[#1c2826] leading-relaxed mb-6 italic">
            &ldquo;{activeStory.quote}&rdquo;
          </p>

          <div className="flex flex-col items-center justify-center">
            <span className="text-sm font-semibold text-[#1c2826]">
              {activeStory.name}
            </span>
            <span className="text-xs text-[#5c6b66] mt-0.5">
              {activeStory.role} {activeStory.tag ? `• ${activeStory.tag}` : ''}
            </span>
          </div>

          {/* Optional Action to Share Story */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  window.dispatchEvent(new CustomEvent('behold:open_auth'));
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium text-[#4c5b55] bg-white hover:bg-[#f6f2ec] border border-[#ede7de] shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#b85438]" />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center px-4 py-8">
            <p className="font-serif-hero text-lg sm:text-xl text-[#5c6b66] italic mb-2">
              A sanctuary of care, trusted by those who walk this path with us.
            </p>
            <p className="text-xs text-[#5c6b66] mb-6">
              Personal reflections from our community will appear here. Would you like to share yours?
            </p>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  window.dispatchEvent(new CustomEvent('behold:open_auth'));
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium text-[#4c5b55] bg-white hover:bg-[#f6f2ec] border border-[#ede7de] shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#b85438]" />
              <span>Share Your Experience</span>
            </button>
          </div>
        )}

        {/* Review Form Modal / Slide */}
        {showForm && (
          <div className="mt-8 max-w-lg mx-auto bg-white rounded-md p-6 sm:p-8 border border-[#ede7de] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-hero text-xl font-semibold text-[#1c2826]">Share Your Story</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded-sm text-[#a8a094] hover:text-[#4c5b55] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <span className="text-emerald-600 font-semibold text-sm">Thank you! Your reflection has been received.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {error && <div className="text-xs text-rose-600">{error}</div>}
                <div>
                  <label className="block text-xs font-semibold text-[#4c5b55] mb-1">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-md border border-[#ede7de] outline-none focus:border-[#b85438]"
                    placeholder="e.g. Maya S."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4c5b55] mb-1">Role or Area of Support</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-md border border-[#ede7de] outline-none focus:border-[#b85438]"
                    placeholder="e.g. Student, Parent, Individual Therapy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4c5b55] mb-1">Your Reflection</label>
                  <textarea
                    rows={3}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-md border border-[#ede7de] outline-none focus:border-[#b85438]"
                    placeholder="How did BEHOLD support your journey?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-md text-xs font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Reflection'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
