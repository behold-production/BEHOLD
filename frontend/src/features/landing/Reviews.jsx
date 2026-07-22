import React, { useState, useEffect, useRef } from 'react';
import { renderTitleWithFullstopDot } from '../../shared/components/BrandDot';
import ApiService from '../../shared/services/api';
import { useAuth } from '../../shared/context/AuthContext';

const fallbackReviews = [
  {
    _id: 'f1',
    comment: "The career mentoring I received here completely changed my perspective. The C-DAT assessment and my mentor's guidance gave me a clear, confident path forward.",
    name: 'Sneha Menon',
    role: 'Student, Class 12',
    rating: 5,
  },
  {
    _id: 'f2',
    comment: "Seeing my son struggle with exam anxiety was heartbreaking. The psychological counseling at BEHOLD was a turning point — he's now confident, focused, and so much happier.",
    name: 'Rajesh K.',
    role: 'Parent',
    rating: 5,
  },
  {
    _id: 'f3',
    comment: 'The safe, non-judgmental space provided by the therapists helped me overcome a very tough phase. I highly recommend BEHOLD to anyone seeking real mental health support.',
    name: 'Anjali V.',
    role: 'Young Professional',
    rating: 5,
  },
  {
    _id: 'f4',
    comment: "My daughter was completely unsure about her stream after Class 10. BEHOLD's C-DAT gave us clarity we didn't expect. Best investment we've made in her future.",
    name: 'Divya R.',
    role: 'Parent',
    rating: 5,
  },
  {
    _id: 'f5',
    comment: 'The mentorship sessions felt personal and truly caring. My mentor understood my situation and helped me chart a university path that perfectly fits my strengths.',
    name: 'Arjun P.',
    role: 'Student, Class 11',
    rating: 5,
  },
];

/* ── Star Display / Picker ────────────────────────────────── */
function Stars({ count = 5, total = 5, interactive = false, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const filled = interactive ? i < (hovered ?? count) : i < count;
        return (
          <svg
            key={i}
            onClick={() => interactive && onSelect?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={`w-4 h-4 transition-colors ${filled ? 'text-yellow-400' : 'text-gray-200'} fill-current ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}

/* ── Single Review Card ───────────────────────────────────── */
function ReviewCard({ review }) {
  const initial = (review.name || '?')[0].toUpperCase();
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between shrink-0 p-6"
      style={{ width: '320px', minHeight: '220px' }}
    >
      <div>
        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-4 h-4 fill-current ${i < (review.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p className="text-gray-700 text-sm leading-relaxed mb-6 font-normal">
          &ldquo;{review.comment || review.text}&rdquo;
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="w-9 h-9 bg-gray-900 text-white font-serif font-bold rounded-full flex items-center justify-center text-sm shrink-0">
          {initial}
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm leading-tight">{review.name}</div>
          <div className="text-gray-500 text-xs font-normal mt-0.5">{review.role || 'Student'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Submit Review Form ───────────────────────────────────── */
function SubmitReviewForm({ onSubmitSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ 
    name: user ? user.name : '', 
    role: user ? (user.role === 'USER' ? 'Student' : user.role) : '', 
    rating: 5, 
    comment: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-xl shadow-sm flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-gray-900 font-serif mb-2">Login Required</h4>
        <p className="text-gray-500 text-sm mb-6 max-w-xs font-medium leading-relaxed">
          You must be logged in to share your experience with the BEHOLD community.
        </p>
        <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-full hover:bg-black hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          Login or Register
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      setError('Please fill in your name and review.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await ApiService.submitReview(form.name.trim(), form.role.trim(), form.rating, form.comment.trim());
      setSubmitted(true);
      onSubmitSuccess?.();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="font-bold text-gray-900 text-xl font-serif mb-2">Thank you!</h4>
        <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
          Your review has been successfully submitted and is currently pending admin approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Name *</label>
          <input
            type="text"
            placeholder="e.g. Priya Nair"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            readOnly={!!user?.name}
            className={`w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition ${user?.name ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Role</label>
          <input
            type="text"
            placeholder="e.g. Student, Parent"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-900 transition shadow-sm hover:border-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Rating *</label>
        <Stars count={form.rating} interactive onSelect={r => setForm(f => ({ ...f, rating: r }))} />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Review *</label>
        <textarea
          rows={3}
          placeholder="Share your experience with BEHOLD Aspire..."
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-900 transition shadow-sm hover:border-gray-300 resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold text-sm rounded-md transition border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

/* ── Main Reviews Component ───────────────────────────────── */
export default function Reviews({ siteSettings }) {
  const [apiReviews, setApiReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await ApiService.getPublicReviews();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiReviews(res.data);
      }
    } catch {
      // fall back to static
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [apiReviews]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const displayReviews = apiReviews.length > 0 ? apiReviews : fallbackReviews;

  return (
    <section className="py-16 sm:py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
            Testimonials
          </span>
          <h2
            id="reviews-title"
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight"
          >
            What Our Community Says.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-normal">
            Real stories from students, parents, and professionals who found clarity through BEHOLD.
          </p>
        </div>

        {/* Scroll Controls Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium hidden sm:block">Swipe horizontally or use arrows</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-md border flex items-center justify-center transition cursor-pointer ${canScrollLeft ? 'border-gray-900 text-gray-900 hover:bg-gray-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-md border flex items-center justify-center transition cursor-pointer ${canScrollRight ? 'border-gray-900 text-gray-900 hover:bg-gray-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Carousel */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {displayReviews.map((rev, i) => (
              <ReviewCard key={rev._id || i} review={rev} />
            ))}
            {/* Write Review CTA Card */}
            <div
              className="bg-white border border-gray-300 border-dashed rounded-lg flex flex-col items-center justify-center shrink-0 cursor-pointer hover:border-gray-900 transition p-6"
              style={{ width: '260px', minHeight: '220px' }}
              onClick={() => setShowForm(true)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-900 font-bold text-sm text-center">Share Your Experience</p>
              <p className="text-gray-500 text-xs text-center mt-1">Write a testimonial</p>
            </div>
          </div>
        )}

        {/* Submit Review Form Panel */}
        {showForm && (
          <div className="mt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-bold text-gray-900">Share Your Experience</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer border-none flex items-center justify-center transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SubmitReviewForm onSubmitSuccess={() => { fetchReviews(); setShowForm(false); }} />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
