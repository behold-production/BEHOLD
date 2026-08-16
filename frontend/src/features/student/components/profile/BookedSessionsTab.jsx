import React, { useState } from 'react';
import {
  Plus, Video, MapPin, Calendar, Clock, AlertCircle,
  ExternalLink, Lock, Download, RefreshCw, X as XIcon,
  CalendarDays, CheckCircle2, Star, Award, Trophy, Trash2,
  MessageSquare, Send, ChevronDown
} from 'lucide-react';
import { formatDateString } from "../../../../utils/dateFormatter";
import { formatCountdown } from '../../utils/utils';

// Inline feedback form for a single completed session
function SessionFeedbackForm({ session, onSubmit, alreadySubmitted }) {
  const [open, setOpen]         = useState(false);
  const [hovered, setHovered]   = useState(0);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (alreadySubmitted) {
    return (
      <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-[10px] px-3 py-2 w-fit">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-[10px] font-semibold tracking-widest">Review Submitted ✓</span>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await onSubmit(session, rating, comment);
    setSubmitting(false);
    setOpen(false);
  };

  return (
    <div className="mt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-[8px] transition-all cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          Leave a Review
          <ChevronDown className="w-3 h-3" />
        </button>
      ) : (
        <div className="border border-amber-200 bg-amber-50/60 rounded-[10px] p-3.5 space-y-3 animate-fade-scale">
          <p className="text-[10px] font-semibold tracking-widest text-surface-600">Rate your session with <span className="text-surface-900">{session.advisorName}</span></p>

          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    n <= (hovered || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-surface-100 text-surface-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-[10px] font-semibold text-surface-600 tracking-widest">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
              </span>
            )}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience (optional)…"
            rows={3}
            className="w-full text-xs font-medium text-surface-900 placeholder-surface-400 bg-white border border-surface-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-[8px] px-3 py-2 resize-none outline-none transition-all"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!rating || submitting}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500 px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer"
            >
              {submitting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setRating(0); setComment(''); }}
              className="text-[10px] font-semibold tracking-widest text-surface-500 hover:text-surface-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const BookedSessionsTab = ({
  sessionSubTab,
  setSessionSubTab,
  bookedSessions,
  completedSessions,
  enablePsychology,
  enableCareerMentoring,
  navigate,
  filterChips,
  setSessionFilter,
  sessionFilter,
  filteredBooked,
  getMeetLinkStatus,
  showAlert,
  handleCancelSession,
  downloadPDFReceiptForSession,
  downloadCertificatePDF,
  downloadConsultationReportPDF,
  onOpenBooking,
  submittedFeedbackIds = new Set(),
  onSubmitFeedback
}) => {
  return (
    <div className="space-y-5">
      {/* Sub-tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-1.5">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSessionSubTab('upcoming')}
            className={`pb-2 text-[10px] tracking-widest border-b-2 transition-all relative cursor-pointer whitespace-nowrap flex items-center ${sessionSubTab === 'upcoming'
              ? 'border-surface-900 text-surface-900 font-semibold'
              : 'border-transparent text-surface-400 hover:text-surface-600 font-semibold'
              }`}
          >
            Upcoming Sessions
            {bookedSessions.length > 0 && (
              <span className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-xl ${sessionSubTab === 'upcoming' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                {bookedSessions.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSessionSubTab('history')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${sessionSubTab === 'history'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            History & Timeline
            {completedSessions.length > 0 && (
              <span className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-xl ${sessionSubTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                {completedSessions.length}
              </span>
            )}
          </button>
        </div>

        {sessionSubTab === 'upcoming' && (enablePsychology || enableCareerMentoring) && (
          <button
            type="button"
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
              else navigate('/booking');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all border-none sm:self-center cursor-pointer hover-scale-btn shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Booking
          </button>
        )}
      </div>

      {sessionSubTab === 'upcoming' ? (
        <div className="space-y-4">
          {/* Filters */}
          {bookedSessions.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {filterChips.map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSessionFilter(chip.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[32px] rounded-[10px] tracking-widest text-[10px] font-semibold transition-all border ${sessionFilter === chip.id
                    ? 'bg-surface-900 text-white border-surface-900'
                    : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                    }`}
                >
                  {chip.label}
                  {chip.count > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 min-w-[18px] h-4 rounded-[10px] flex items-center justify-center ${sessionFilter === chip.id ? 'bg-white/20' : 'bg-surface-100 text-surface-600'
                      }`}>
                      {chip.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filteredBooked.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredBooked.map((session, idx) => {
                const meetStatus = getMeetLinkStatus(session);
                const cd = formatCountdown(session.date, session.time);
                const isConfirmed = session.status === 'CONFIRMED';
                return (
                  <div
                    key={session.id || idx}
                    className="bg-white border border-surface-200 rounded-[10px] shadow-square-light p-5 text-left"
                  >
                    {/* Status indicator */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-[10px] bg-surface-100 flex items-center justify-center shrink-0">
                          {session.mode === 'ONLINE' ? <Video className="w-5 h-5 text-surface-600" /> : <MapPin className="w-5 h-5 text-surface-600" />}
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1 tracking-widest text-[10px] px-2 py-0.5 rounded-[10px] font-semibold ${session.status === 'EXPIRED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-[10px] ${session.status === 'EXPIRED'
                              ? 'bg-rose-500'
                              : isConfirmed
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-amber-500'
                              }`} />
                            {session.status}
                          </span>
                          <p className="text-[10px] tracking-widest text-surface-500 font-semibold mt-1">
                            {session.service === 'counselling' ? 'Psychological' : 'Career'} · {session.mode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] tracking-widest text-surface-500 font-semibold">In</p>
                        <p className={`text-sm font-semibold ${cd.urgent ? 'text-amber-600' : 'text-surface-900'}`}>{cd.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {session.advisorProfilePic && (
                        <img src={session.advisorProfilePic} alt={session.advisorName} className="w-10 h-10 rounded-[10px] object-cover border border-surface-200 shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold tracking-widest text-surface-900 text-lg">{session.advisorName}</p>
                        <p className="text-[10px] tracking-widest text-surface-500 font-semibold mt-0.5">{session.advisorRole || 'Consultation'}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-surface-50 border border-surface-200 text-[10px] tracking-widest text-surface-600 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                        <span className="font-semibold truncate">{formatDateString(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-surface-50 border border-surface-200 text-[10px] tracking-widest text-surface-600 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                        <span className="font-semibold truncate">{session.time}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-100 flex flex-wrap gap-2">
                      {session.status === 'EXPIRED' ? (
                        <div className="w-full text-center text-[10px] tracking-widest font-semibold text-rose-650 bg-rose-50 border border-rose-100 py-3 rounded-[10px] flex items-center justify-center gap-1.5 px-4">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>This session expired because it wasn't joined within 1 hour.</span>
                        </div>
                      ) : (
                        <>
                          {session.mode === 'ONLINE' ? (
                            <a
                              href={session.meetLink || 'https://meet.google.com/behold-aspire-session'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand text-surface-900 hover:bg-brand-dark rounded-[10px] text-[10px] font-semibold tracking-widest transition-all duration-300 shadow-none border-none cursor-pointer text-decoration-none"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Session
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (session.mode === 'DOOR_STEP') {
                                  showAlert(
                                    `Your doorstep visit address: \n\n${session.clientLocationName || 'No address specified'}\n\nCoordinates: ${session.clientLatitude || 0}, ${session.clientLongitude || 0}`,
                                    'Doorstep Visit Location'
                                  );
                                } else {
                                  const address = session.counsellor?.locationName || session.clientLocationName || 'No address specified';
                                  showAlert(
                                    `Psychologist Office / Clinic Address: \n\n${address}`,
                                    'Center Visit Location'
                                  );
                                }
                              }}
                              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-surface-100 text-surface-700 border border-surface-200 rounded-[10px] text-[10px] tracking-widest font-semibold shadow-none cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5" /> View Location
                            </button>
                          )}
                          {(session.paymentStatus === 'PAID' || session.amountPaid > 0) && (
                            <button
                              type="button"
                              onClick={() => downloadPDFReceiptForSession(session)}
                              className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-surface-200 hover:border-surface-300 rounded-[10px] text-[10px] tracking-widest font-semibold shadow-none text-surface-600 hover:text-surface-900 transition-colors bg-white cursor-pointer"
                              title="Download Receipt PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-surface-500" /> Receipt
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              // 1. Check 1 hour lead time
                              try {
                                const [year, month, day] = session.date.split('-').map(Number);
                                const timeParts = session.time.split(' ');
                                let [hours, minutes] = timeParts[0].split(':').map(Number);
                                const meridiem = timeParts[1];
                                if (meridiem === 'PM' && hours < 12) hours += 12;
                                if (meridiem === 'AM' && hours === 12) hours = 0;

                                const sessionTime = new Date(year, month - 1, day, hours, minutes);
                                const now = new Date();
                                const diffMs = sessionTime - now;
                                const diffHours = diffMs / (1000 * 60 * 60);

                                if (diffHours < 1) {
                                  await showAlert('Cannot reschedule a session less than 1 hour before the scheduled time.', 'Error');
                                  return;
                                }
                              } catch (e) { }

                              // 2. Check per-appointment limit
                              if ((session.rescheduleCount || 0) >= 3) {
                                await showAlert('This session has already reached the maximum rescheduling limit (3 times).', 'Error');
                                return;
                              }

                              navigate(`/booking?reschedule=${session.id}`);
                            }}
                            className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-surface-200 hover:border-surface-300 rounded-[10px] text-[10px] tracking-widest font-semibold text-surface-650 hover:text-surface-900 shadow-none transition-colors bg-white cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelSession(session.id)}
                            className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-surface-200 hover:border-rose-200 hover:bg-rose-50 text-surface-500 hover:text-rose-600 rounded-[10px] text-[10px] tracking-widest font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-50 border border-dashed border-surface-300 rounded-[10px] p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-[10px] bg-surface-200 flex items-center justify-center mb-3">
                <CalendarDays className="w-6 h-6 text-surface-500" />
              </div>
              <p className="text-sm font-semibold text-surface-900 tracking-widest">No sessions found</p>
              <p className="text-xs text-surface-500 mt-1">
                {sessionFilter === 'all'
                  ? 'Book a session with one of our experts.'
                  : `No ${sessionFilter} sessions scheduled.`}
              </p>
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="mt-4 inline-flex items-center gap-1.5 min-h-[36px] px-5 py-2 bg-surface-900 text-white tracking-widest text-[10px] font-semibold rounded-[10px] hover:bg-surface-800 transition-colors border-none"
                >
                  <Plus className="w-3.5 h-3.5" /> Book a Session
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Completed sessions Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total Sessions', value: completedSessions.length + bookedSessions.length, icon: CalendarDays },
              { label: 'Completed', value: completedSessions.filter(s => !['EXPIRED', 'CANCELLED', 'REJECTED'].includes(s.status)).length, icon: CheckCircle2 },
              { label: 'Upcoming', value: bookedSessions.length, icon: Clock },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-surface-200 rounded-[10px] shadow-square-light p-4 text-left">
                  <div className="w-8 h-8 rounded-[10px] bg-surface-100 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-surface-600" />
                  </div>
                  <p className="text-lg font-semibold text-surface-900">
                    {s.value}{s.suffix && <span className="text-sm text-surface-400 font-semibold">{s.suffix}</span>}
                  </p>
                  <p className="text-[10px] text-surface-500 font-semibold tracking-widest mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>

          {completedSessions.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-200" />
              <div className="space-y-4">
                {completedSessions.map((session, sIdx) => (
                  <div key={session.id || sIdx} className="relative pl-12 text-left">
                    <div className="absolute left-0 top-3 w-8 h-8 rounded-[10px] border border-surface-200 bg-white flex items-center justify-center shadow-square-light">
                      <Award className="w-4 h-4 text-surface-500" />
                    </div>
                    <div className="bg-white border border-surface-200 rounded-[10px] shadow-square-light p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-[10px] font-semibold tracking-widest border ${session.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : session.status === 'EXPIRED' || session.status === 'CANCELLED' || session.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                              {session.status}
                            </span>
                            <span className="text-[10px] text-surface-500 font-semibold tracking-widest">{session.mode}</span>
                            {session.status === 'COMPLETED' && (
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <Star key={n} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 mb-1.5">
                            {session.advisorProfilePic && (
                              <img src={session.advisorProfilePic} alt={session.advisorName} className="w-10 h-10 rounded-[10px] object-cover border border-surface-200 shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-surface-900 tracking-widest text-lg leading-tight">{session.advisorName}</p>
                              <p className="text-[10px] text-surface-500 font-semibold tracking-widest mt-0.5">{session.advisorRole || 'Consultation'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-surface-600 bg-surface-50 border border-surface-200 px-2.5 py-1.5 rounded-[10px] shrink-0 w-fit font-semibold">
                          <Clock className="w-3.5 h-3.5 text-surface-400" />
                          <span className="font-semibold">{formatDateString(session.date)}</span>
                          <span className="text-surface-300">·</span>
                          <span>{session.time}</span>
                        </div>
                      </div>

                      {session.feedback && (
                        <div className="mt-3 p-3 bg-surface-50 border border-surface-200 rounded-[10px]">
                          <p className="text-[10px] font-semibold text-surface-500 tracking-widest mb-1.5">Psychologist Feedback</p>
                          <p className="text-xs text-surface-900 font-medium leading-relaxed">"{session.feedback}"</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-surface-400 font-semibold tracking-widest">Session #{completedSessions.length - sIdx}</span>
                        <div className="flex items-center gap-3">
                          {(session.paymentStatus === 'PAID' || session.amountPaid > 0) && (
                            <button
                              type="button"
                              onClick={() => downloadPDFReceiptForSession(session)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest text-surface-500 hover:text-surface-900 transition-colors cursor-pointer"
                              title="Download Receipt PDF"
                            >
                              <Download className="w-3.5 h-3.5" /> Receipt
                            </button>
                          )}
                          {session.status === 'COMPLETED' && (
                            <>
                              {downloadConsultationReportPDF && (
                                <button
                                  type="button"
                                  onClick={() => downloadConsultationReportPDF(session)}
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest text-brand hover:text-brand-dark transition-colors cursor-pointer bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-[6px]"
                                  title="Download Consultation Report PDF"
                                >
                                  <Download className="w-3.5 h-3.5" /> Download Report PDF
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => downloadCertificatePDF(session)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest text-surface-500 hover:text-surface-900 transition-colors cursor-pointer"
                                title="Download certificate"
                              >
                                <Download className="w-3.5 h-3.5" /> Certificate
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Inline feedback form for completed sessions */}
                      {session.status === 'COMPLETED' && onSubmitFeedback && (
                        <SessionFeedbackForm
                          session={session}
                          onSubmit={onSubmitFeedback}
                          alreadySubmitted={submittedFeedbackIds.has(session._id || session.id || session.bookingId)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-surface-50 border border-dashed border-surface-300 rounded-[10px] p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-[10px] bg-surface-200 flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-surface-500" />
              </div>
              <p className="text-sm font-semibold text-surface-900 tracking-widest">No completed sessions yet</p>
              <p className="text-xs text-surface-500 mt-1">Finished sessions will appear here with psychologist feedback.</p>
              {(enablePsychology || enableCareerMentoring) && (
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="mt-4 inline-flex items-center gap-1.5 min-h-[36px] px-5 py-2 bg-surface-900 text-white tracking-widest text-[10px] font-semibold rounded-[10px] hover:bg-surface-800 transition-colors border-none"
                >
                  <Plus className="w-3.5 h-3.5" /> Book First Session
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookedSessionsTab;
