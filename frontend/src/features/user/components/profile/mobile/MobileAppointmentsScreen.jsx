import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Video, FileText, Download, Star, XCircle, RefreshCw } from 'lucide-react';

export default function MobileAppointmentsScreen({
  bookedSessions = [],
  completedSessions = [],
  onOpenBooking,
  handleCancelSession,
  downloadPDFReceiptForSession,
  downloadConsultationReportPDF,
  onSubmitFeedback,
  submittedFeedbackIds = new Set(),
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [ratingModalSession, setRatingModalSession] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const upcomingList = useMemo(() => {
    return bookedSessions.filter((s) => {
      const status = (s.status || '').toLowerCase();
      return status !== 'completed' && status !== 'cancelled' && status !== 'refunded';
    });
  }, [bookedSessions]);

  const completedList = useMemo(() => {
    return completedSessions.length > 0
      ? completedSessions
      : bookedSessions.filter((s) => (s.status || '').toLowerCase() === 'completed');
  }, [completedSessions, bookedSessions]);

  const cancelledList = useMemo(() => {
    return bookedSessions.filter((s) => {
      const status = (s.status || '').toLowerCase();
      return status === 'cancelled' || status === 'refunded';
    });
  }, [bookedSessions]);

  const displayedList = activeSubTab === 'upcoming'
    ? upcomingList
    : activeSubTab === 'completed'
      ? completedList
      : cancelledList;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!ratingModalSession) return;
    onSubmitFeedback?.(ratingModalSession, ratingScore, ratingComment);
    setRatingModalSession(null);
    setRatingComment('');
  };

  return (
    <div className="pb-24 pt-4 px-4 bg-[#F8FAFC] min-h-screen text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Appointments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your scheduled sessions</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenBooking()}
          className="rounded-xl bg-[#0E7490] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
        >
          + New
        </button>
      </div>

      {/* Segmented Control Bar (CarePro matching) */}
      <div className="mt-4 flex rounded-2xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('upcoming')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'upcoming' ? 'bg-white text-[#0E7490] shadow-xs' : 'text-slate-600'
          }`}
        >
          Upcoming
          {upcomingList.length > 0 && (
            <span className="rounded-full bg-[#0E7490]/10 px-1.5 py-0.2 text-[10px] text-[#0E7490]">
              {upcomingList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('completed')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'completed' ? 'bg-white text-[#0E7490] shadow-xs' : 'text-slate-600'
          }`}
        >
          Completed
          {completedList.length > 0 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
              {completedList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cancelled')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'cancelled' ? 'bg-white text-[#0E7490] shadow-xs' : 'text-slate-600'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      <div className="mt-4 space-y-3.5">
        {displayedList.length > 0 ? (
          displayedList.map((session) => {
            const sid = session._id || session.id || session.bookingId;
            const therapistName = session.counsellorName || session.therapistName || session.advisorName || 'Clinical Psychologist';
            const initial = therapistName.charAt(0);
            const dateStr = session.date || session.slotDate || 'Scheduled Date';
            const timeStr = session.time || session.slotTime || 'Scheduled Time';
            const mode = session.sessionType || session.mode || 'Online Video';
            const isReviewed = submittedFeedbackIds?.has?.(sid);

            return (
              <div
                key={sid}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_16px_rgba(17,24,39,0.03)]"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 font-bold text-lg text-[#0E7490] border border-cyan-100">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 truncate">{therapistName}</h4>
                        <span className="text-[11px] font-semibold text-[#0E7490] block">Clinical Psychologist</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeSubTab === 'upcoming'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : activeSubTab === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700'
                      }`}>
                        {session.status || (activeSubTab === 'upcoming' ? 'Confirmed' : activeSubTab)}
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {timeStr}
                      </span>
                    </div>

                    <div className="mt-1 text-[11.5px] text-slate-500 flex items-center gap-1">
                      <Video className="h-3 w-3 text-[#0E7490]" />
                      <span>{mode}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-slate-100">
                      {activeSubTab === 'upcoming' && (
                        <>
                          {session.meetLink ? (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 rounded-xl bg-[#0E7490] py-2 text-center text-xs font-bold text-white shadow-xs active:scale-95"
                            >
                              Join Session
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenBooking()}
                              className="flex-1 rounded-xl bg-[#0E7490] py-2 text-xs font-bold text-white shadow-xs active:scale-95"
                            >
                              View Details
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCancelSession?.(session)}
                            className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-600 active:scale-95"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {activeSubTab === 'completed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => downloadPDFReceiptForSession?.(session)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadConsultationReportPDF?.(session)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Report
                          </button>
                          <button
                            type="button"
                            disabled={isReviewed}
                            onClick={() => setRatingModalSession(session)}
                            className={`flex-1 rounded-xl py-1.5 text-xs font-bold active:scale-95 ${
                              isReviewed
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[#0E7490] text-white shadow-xs'
                            }`}
                          >
                            {isReviewed ? 'Reviewed' : 'Rate'}
                          </button>
                        </>
                      )}

                      {activeSubTab === 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => onOpenBooking()}
                          className="flex-1 rounded-xl bg-[#0E7490] py-2 text-xs font-bold text-white shadow-xs active:scale-95"
                        >
                          Book Another
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 p-6">
            <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No {activeSubTab} appointments</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {activeSubTab === 'upcoming'
                ? 'You do not have any upcoming consultations scheduled.'
                : 'No past consultations found in this category.'}
            </p>
            {activeSubTab === 'upcoming' && (
              <button
                type="button"
                onClick={() => onOpenBooking()}
                className="mt-4 rounded-xl bg-[#0E7490] px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Book Your First Session
              </button>
            )}
          </div>
        )}
      </div>

      {/* Star Rating Bottom Sheet Modal */}
      {ratingModalSession && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up"
          >
            <h3 className="text-base font-bold text-slate-900">Rate Your Consultation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              With {ratingModalSession.counsellorName || 'Psychologist'}
            </p>

            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="p-1.5"
                >
                  <Star className={`h-8 w-8 ${star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="How was your session experience?"
              className="mt-4 w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#0E7490] focus:outline-hidden"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setRatingModalSession(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#0E7490] py-2.5 text-xs font-bold text-white shadow-xs"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
