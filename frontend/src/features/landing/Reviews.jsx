import React, { useState, useEffect } from 'react';
import { renderTitleWithFullstopDot } from '../../shared/components/BrandDot';
import ApiService from '../../shared/services/api';

const AVATAR_COLORS = [
  'bg-[#00A8FF]', 'bg-indigo-500', 'bg-pink-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500',
];

const fallbackReviews = [
  {
    comment: "The career mentoring I received here completely changed my perspective. The C-DAT and my mentor's guidance gave me a clear path forward.",
    name: 'Sneha Menon',
    role: 'Student, Class 12',
    rating: 5,
  },
  {
    comment: "Seeing my son struggle with exam anxiety was heartbreaking. The psychological counseling at BEHOLD was a turning point — he's now confident and much happier.",
    name: 'Rajesh K.',
    role: 'Parent',
    rating: 5,
  },
  {
    comment: 'The safe, non-judgmental space provided by the therapists helped me overcome a very tough phase in my life. Highly recommend to anyone seeking support.',
    name: 'Anjali V.',
    role: 'Young Professional',
    rating: 5,
  },
];

function Stars({ count = 5, total = 5, interactive = false, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const filled = interactive ? i < (hovered ?? count) : i < count;
        return (
          <svg
            key={i}
            onClick={() => interactive && onSelect && onSelect(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={`w-5 h-5 transition-colors ${filled ? 'text-yellow-400' : 'text-gray-200'} fill-current ${interactive ? 'cursor-pointer' : ''}`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, idx }) {
  const initial = (review.name || review.author || '?')[0].toUpperCase();
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="mb-3">
        <Stars count={review.rating || review.stars || 5} />
      </div>
      <p className="text-gray-700 leading-relaxed mb-5 flex-1 text-sm sm:text-base">
        &ldquo;{review.comment || review.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-10 h-10 ${color} text-white rounded-full flex items-center justify-center font-black text-base shrink-0`}>
          {initial}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{review.name || review.author}</h4>
          <p className="text-gray-400 text-xs font-medium">{review.role || 'Student'}</p>
        </div>
      </div>
    </div>
  );
}

function SubmitReviewForm({ onSubmitSuccess }) {
  const [form, setForm] = useState({ name: '', role: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h4 className="text-lg font-black text-gray-900 mb-1">Thank you for your review!</h4>
        <p className="text-gray-500 text-sm">Your feedback will appear here once approved.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Name *</label>
          <input
            type="text"
            placeholder="e.g. Priya Nair"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/15 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Role</label>
          <input
            type="text"
            placeholder="e.g. Student, Parent"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/15 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Rating *</label>
        <Stars count={form.rating} interactive onSelect={r => setForm(f => ({ ...f, rating: r }))} />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1.5">Your Review *</label>
        <textarea
          rows={3}
          placeholder="Share your experience with BEHOLD Aspire..."
          value={form.comment}
          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00A8FF]/15 transition resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-[#00A8FF] hover:bg-[#0090e0] text-white font-black text-sm rounded-lg transition border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
      >
        {submitting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Submitting...
          </>
        ) : 'Submit Review'}
      </button>
    </form>
  );
}

export default function Reviews({ siteSettings }) {
  const settings = siteSettings || {};
  const firstHeroStat = Array.isArray(settings.heroStats) && settings.heroStats.length > 0
    ? `${settings.heroStats[0].num} ${settings.heroStats[0].label}`
    : '500+ Students Guided';

  const [apiReviews, setApiReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await ApiService.getPublicReviews();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setApiReviews(res.data);
      }
    } catch {
      // Silently fall back to static reviews
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const displayReviews = apiReviews.length > 0 ? apiReviews : fallbackReviews;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#00A8FF] block mb-3">Testimonials</span>
          <h2 id="reviews-title" className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('What Our Community Says', 'faq-title', 'Scroll to FAQ ↓', 'md')}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Real stories from students, parents, and professionals who found clarity and support through BEHOLD.
          </p>
        </div>

        {/* Review Cards */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#00A8FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayReviews.slice(0, 6).map((rev, i) => (
              <ReviewCard key={rev._id || i} review={rev} idx={i} />
            ))}
          </div>
        )}

        {/* Submit Review Toggle */}
        <div className="mt-10">
          {!showForm ? (
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3 font-medium">Had a great experience with us?</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#00A8FF]/30 text-[#00A8FF] font-bold text-sm rounded-lg hover:bg-[#00A8FF]/5 transition cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900">Share Your Experience</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SubmitReviewForm onSubmitSuccess={() => { fetchReviews(); }} />
            </div>
          )}
        </div>

        {/* Bottom trust row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-500 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            <span>4.9 / 5 Average Rating</span>
          </div>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span>{firstHeroStat}</span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
          <span>100% Confidential Sessions</span>
        </div>

      </div>
    </section>
  );
}
