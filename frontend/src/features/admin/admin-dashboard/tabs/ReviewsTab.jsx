import React, { useState, useEffect } from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { Check, Trash, Search, MessageSquare, AlertCircle } from 'lucide-react';
import ApiService from '../../../../shared/services/api';
import toast from 'react-hot-toast';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await ApiService.getAdminReviews();
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this review for public display?")) return;
    try {
      const res = await ApiService.approveReview(id);
      if (res.success) {
        toast.success("Review approved");
        fetchReviews();
      } else {
        toast.error(res.message || "Failed to approve");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await ApiService.deleteReview(id);
      if (res.success) {
        toast.success("Review deleted");
        fetchReviews();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const filteredReviews = reviews.filter(r => 
    (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / limit));
  const pagedReviews = filteredReviews.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-header flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand" />
            Reviews & Testimonials
          </h2>
          <p className="text-sm text-zinc-500 font-medium pt-1">Approve or remove reviews submitted by users</p>
        </div>
      </div>

      <div className="bg-zinc-900/60 rounded-xl border border-zinc-850 p-4 space-y-4 shadow-xl relative overflow-hidden">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by name or content..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-inner">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-zinc-900/80 text-zinc-400 font-bold border-b border-zinc-800">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 w-1/3">Comment</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <SkeletonTableRows rows={3} cols={6} />
                ) : pagedReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-500 font-medium">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  pagedReviews.map(review => (
                    <tr key={review._id} className="border-b border-zinc-850 hover:bg-zinc-900 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {review.name}
                        {review.userId && <div className="text-[10px] text-zinc-500 font-mono mt-1">{review.userId.email}</div>}
                      </td>
                      <td className="p-4 text-zinc-400">{review.role}</td>
                      <td className="p-4 font-bold text-amber-500">{review.rating} / 5</td>
                      <td className="p-4 text-zinc-300 text-xs line-clamp-2" title={review.comment}>
                        {review.comment}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                          review.isApproved ? 'bg-emerald-955/30 text-emerald-450 border border-emerald-900/40' : 'bg-amber-955/30 text-amber-500 border border-amber-900/40'
                        }`}>
                          {review.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!review.isApproved && (
                            <button
                              onClick={() => handleApprove(review._id)}
                              className="p-1.5 bg-emerald-955/20 text-emerald-500 hover:bg-emerald-955/40 hover:text-emerald-400 rounded transition border border-emerald-900/30"
                              title="Approve Review"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-955/40 hover:text-rose-400 rounded transition border border-rose-900/30"
                            title="Delete Review"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <PaginationBar page={page} totalPages={totalPages} setPage={setPage} totalItems={filteredReviews.length} limit={limit} />
      </div>
    </div>
  );
}
