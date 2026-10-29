import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquarePlus, Quote, Star, X } from 'lucide-react';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SectionHeading from './SectionHeading';

const getInitials = (name = '') => {
  const clean = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'B';
  return (parts[0].charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
};

const PAGE_SIZE = 4;

export default function Reviews({ siteSettings = {} }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
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
            })).filter((r) => r.quote);
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

  const visibleReviews = useMemo(() => {
    if (reviews.length <= PAGE_SIZE) return reviews;
    const windowed = [];
    for (let i = 0; i < PAGE_SIZE; i += 1) {
      windowed.push(reviews[(startIndex + i) % reviews.length]);
    }
    return windowed;
  }, [reviews, startIndex]);

  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);

  const openShareForm = () => {
    if (!user) {
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('behold:open_auth'));
      return;
    }
    setShowForm((prev) => !prev);
  };

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
    <section
      id="reviews"
      aria-labelledby="bh-reviews-heading"
      className="relative w-full overflow-hidden bg-[#FBF8F1] py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title={siteSettings.reviewsSectionTitle || 'What Our Clients Say'}
          description={siteSettings.reviewsSectionSub || undefined}
        />

        {loading ? (
          <div className="mt-9 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-xl border border-[#E6DFD0] bg-white p-5">
                <div className="h-3 w-20 animate-pulse rounded bg-[#F1EAD9]" />
                <div className="mt-4 space-y-2">
                  <div className="h-2.5 w-full animate-pulse rounded bg-[#F1EAD9]" />
                  <div className="h-2.5 w-5/6 animate-pulse rounded bg-[#F1EAD9]" />
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-[#F1EAD9]" />
                </div>
                <div className="mt-5 flex items-center gap-2.5">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-[#F1EAD9]" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-[#F1EAD9]" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="mx-auto mt-10 max-w-lg rounded-xl border border-[#E6DFD0] bg-white px-6 py-12 text-center">
            <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF4F7] text-[#0E7490]">
              <MessageSquarePlus className="h-5 w-5" />
            </span>
            <p className="text-base font-semibold text-[#0E1111]">Be the first to share your experience</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#55605F]">
              Reflections shared by our clients appear here after review.
            </p>
            <button
              type="button"
              onClick={openShareForm}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0E7490] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0B5C73] cursor-pointer border-none"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Share Your Experience
            </button>
          </div>
        ) : (
          <>
            <div className="mt-9 flex flex-wrap justify-center gap-4 sm:mt-12">
              {visibleReviews.map((review, idx) => (
                <article
                  key={`${review.id}-${idx}`}
                  className="group relative flex w-full flex-col rounded-xl border border-[#E6DFD0] bg-white p-5 transition-all duration-200 hover:border-[#0E7490]/40 hover:shadow-[0_18px_36px_-28px_rgba(14,17,17,0.5)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
                >
                  <Quote aria-hidden="true" className="h-5 w-5 text-[#0E7490]/25" />

                  <div className="mt-2 flex items-center gap-0.5">
                    {Array.from({ length: Math.min(review.rating, 5) }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
                    ))}
                  </div>

                  <p className="mt-3 line-clamp-6 flex-1 text-[12.5px] leading-relaxed text-[#4A5555]">
                    {review.quote}
                  </p>

                  <div className="mt-5 flex items-center gap-2.5 border-t border-[#F0EBDF] pt-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAF4F7] text-[11px] font-semibold text-[#0E7490]">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        getInitials(review.name)
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-[#0E1111]">{review.name}</span>
                      <span className="block truncate text-[10.5px] text-[#6B7674]">
                        {[review.role, review.tag].filter(Boolean).join(' • ')}
                      </span>
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <button
                type="button"
                onClick={openShareForm}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DED8C9] bg-white px-4 py-2.5 text-[11.5px] font-semibold text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0B5C73] cursor-pointer"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-[#0E7490]" />
                Share Your Experience
              </button>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStartIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
                    aria-label="Previous testimonials"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED8C9] bg-white text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0E7490] cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] font-medium text-[#6B7674]">
                    {reviews.length} reviews
                  </span>
                  <button
                    type="button"
                    onClick={() => setStartIndex((prev) => (prev + 1) % reviews.length)}
                    aria-label="Next testimonials"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DED8C9] bg-white text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0E7490] cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {showForm && (
          <div className="mx-auto mt-8 max-w-lg rounded-xl border border-[#E6DFD0] bg-white p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0E1111]">Share Your Story</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close review form"
                className="rounded-md p-1 text-[#9AA29F] transition-colors hover:text-[#0E1111] cursor-pointer bg-transparent border-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-6 text-center">
                <span className="text-sm font-semibold text-emerald-600">Thank you! Your reflection has been received.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {error && <div className="text-xs text-rose-600">{error}</div>}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#3C4747]">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#0E7490] focus:bg-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#3C4747]">Role or Area of Support</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#0E7490] focus:bg-white"
                    placeholder="Student, Parent, Individual Therapy"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#3C4747]">Your Reflection</label>
                  <textarea
                    rows={3}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full resize-none rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-[#0E7490] focus:bg-white"
                    placeholder="How did your sessions support your journey?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#0E1111] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0E7490] disabled:opacity-50 cursor-pointer border-none"
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
