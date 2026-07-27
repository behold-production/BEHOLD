import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-[#d6cecb] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between h-full p-6 sm:p-7 w-full">
      <div className="flex-1 flex flex-col justify-between">
        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-4 h-4 fill-current ${i < (review.rating || 5) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p className="text-[#3a312d] text-sm leading-relaxed mb-6 font-normal">
          &ldquo;{review.comment || review.text}&rdquo;
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#eae4dc]">
        <div className="w-9 h-9 bg-[#1c1514] text-[#f7f4ef] font-sans font-bold rounded-full flex items-center justify-center text-sm shrink-0">
          {initial}
        </div>
        <div>
          <div className="font-bold text-[#1c1514] text-sm leading-tight">{review.name}</div>
          <div className="text-[#7c7069] text-xs font-normal mt-0.5">{review.role || 'Student'}</div>
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
  const [currentPage, setCurrentPage] = useState(1);
  const reviewScrollRef = useRef(null);
  const itemsPerPage = 3;

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

  const displayReviews = apiReviews.length > 0 ? apiReviews : fallbackReviews;
  const totalPages = Math.ceil(displayReviews.length / itemsPerPage);
  const paginatedReviews = displayReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const scrollReviews = (direction) => {
    if (reviewScrollRef.current) {
      const container = reviewScrollRef.current;
      const cards = container.children;
      if (!cards || cards.length === 0) return;

      const firstCardWidth = cards[0].offsetWidth;
      const gap = 24;
      const step = firstCardWidth + gap;

      const currentIndex = Math.round(container.scrollLeft / step);
      const targetIndex = direction === 'right'
        ? Math.min(currentIndex + 1, cards.length - 1)
        : Math.max(currentIndex - 1, 0);

      container.scrollTo({
        left: targetIndex * step,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#f7f4ef] border-b border-[#e2dad2]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-3">
            Testimonials
          </span>
          <h2
            id="reviews-title"
            className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-[#1c1514] mb-4 tracking-tight leading-tight uppercase"
          >
            What Our Community Says.
          </h2>
          <p className="text-sm sm:text-base text-[#6e635e] max-w-xl mx-auto leading-relaxed font-normal">
            Real stories from students, parents, and professionals who found clarity through BEHOLD.
          </p>
        </div>

        {/* Paginated Review Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#2b211e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-4 sm:px-6 lg:px-8 space-y-4">
            {/* Mobile Scroll Controls (<768px) */}
            <div className="flex md:hidden items-center justify-end px-1 mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollReviews('left')}
                  className="w-8 h-8 rounded-full bg-[#eae4dc] text-[#1c1514] flex items-center justify-center border border-[#d8d0c7] active:scale-95 transition-all p-0 shadow-2xs"
                  aria-label="Previous Testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollReviews('right')}
                  className="w-8 h-8 rounded-full bg-[#eae4dc] text-[#1c1514] flex items-center justify-center border border-[#d8d0c7] active:scale-95 transition-all p-0 shadow-2xs"
                  aria-label="Next Testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal 1-by-1 Carousel on Mobile (<768px) & Grid on Desktop (>=768px) */}
            <div
              ref={reviewScrollRef}
              className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none md:grid-cols-3 gap-6 items-stretch pb-4"
            >
              {displayReviews.map((rev, i) => (
                <div
                  key={rev._id || i}
                  className="w-full h-full flex flex-col shrink-0 snap-start snap-always md:w-auto md:max-w-none"
                >
                  <ReviewCard review={rev} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                    currentPage === 1
                      ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                      : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                      currentPage === num
                        ? 'bg-[#2b211e] text-[#f7f4ef] border-[#2b211e] shadow-xs'
                        : 'bg-white text-[#2b211e] border-[#d8d0c7] hover:border-[#1c1514]'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all cursor-pointer border flex items-center justify-center ${
                    currentPage === totalPages
                      ? 'border-[#d8d0c7] text-[#a39891] bg-[#ebe5df] cursor-not-allowed'
                      : 'border-[#2b211e] bg-[#2b211e] text-[#f7f4ef] hover:bg-[#1c1514]'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
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
