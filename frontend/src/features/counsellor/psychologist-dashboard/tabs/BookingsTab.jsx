import React from 'react';
import { Clock, AlertCircle, Link, Video, FileText, Send, Edit } from 'lucide-react';
import { formatDateString } from '../../../../shared/utils/dateFormatter';
import ApiService from '../../../../shared/services/api';
import { toast } from 'react-hot-toast';

const BookingsTab = ({
  bookings,
  setBookings,
  activeBookingTab,
  setActiveBookingTab,
  updateBookingStatus,
  editingFeedbackId,
  setEditingFeedbackId,
  notesInput,
  setNotesInput,
  feedbackInput,
  setFeedbackInput,
  nextSessionInput,
  setNextSessionInput,
  saveFeedback,
  downloadDiagnosticPDF,
  editingBookingId,
  setEditingBookingId,
  meetLinkInput,
  setMeetLinkInput,
  setMeetLinkError,
  saveMeetLink,
  startEditMeetLink
}) => {
  const confirmedCount = bookings.filter(b => !b.status || b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'APPROVED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const expiredCount = bookings.filter(b => b.status === 'EXPIRED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const filteredBookings = bookings.filter(b => {
    const status = b.status || 'CONFIRMED';
    if (activeBookingTab === 'CONFIRMED') {
      return status === 'CONFIRMED' || status === 'PENDING' || status === 'APPROVED';
    }
    if (activeBookingTab === 'COMPLETED') {
      return status === 'COMPLETED';
    }
    if (activeBookingTab === 'EXPIRED') {
      return status === 'EXPIRED';
    }
    return status === activeBookingTab;
  });

  const shadowStyle = {
    background: '#18181b', // zinc-900
    border: '1px solid #27272a', // zinc-800
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm text-left">
      <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold capitalize text-zinc-500 font-header">Student Booking Details & Rooms</h3>
          <p className="text-sm text-zinc-400 mt-1 font-medium break-words">Manage virtual consultations, update appointment statuses, and log clinic summaries.</p>
        </div>
        <span className="text-sm bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold capitalize shrink-0">{bookings.length} Total</span>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-[10px] max-w-md w-full">
        {[
          { id: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },
          { id: 'COMPLETED', label: 'Completed', count: completedCount },
          { id: 'EXPIRED', label: 'Expired', count: expiredCount },
          { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount }
        ].map(tab => {
          const isActive = activeBookingTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBookingTab(tab.id)}
              className={`flex-1 min-w-[85px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-[10px] text-xs sm:text-sm font-bold capitalize transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 border ${isActive
                ? 'bg-brand text-zinc-955 border-brand shadow-sm'
                : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-850/60'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs shrink-0 ${isActive ? 'bg-zinc-955 text-brand font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-[10px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden transition-all hover:-translate-y-0.5"
            style={shadowStyle}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap text-left">
                {booking.status === 'EXPIRED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-955/20 border border-rose-900/30 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">
                    EXPIRED
                  </span>
                ) : (
                  <select
                    value={(booking.status === 'APPROVED' || booking.status === 'PENDING') ? 'CONFIRMED' : (booking.status || 'CONFIRMED')}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking.status)}
                    className={`px-2.5 py-1 border rounded outline-none text-sm font-bold capitalize cursor-pointer transition-all ${(booking.status === 'CONFIRMED' || booking.status === 'APPROVED' || booking.status === 'PENDING' || !booking.status)
                      ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-450'
                      : booking.status === 'COMPLETED'
                        ? 'bg-indigo-955/20 border-indigo-900/30 text-indigo-400'
                        : 'bg-rose-955/20 border-rose-900/30 text-rose-450'
                      }`}
                  >
                    <option value="CONFIRMED" className="bg-zinc-900 text-emerald-450">CONFIRMED</option>
                    <option value="COMPLETED" className="bg-zinc-900 text-indigo-400">COMPLETED</option>
                    <option value="CANCELLED" className="bg-zinc-900 text-rose-450">CANCELLED</option>
                  </select>
                )}
                <span className="text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-semibold capitalize">
                  {booking.service === 'counselling' ? 'Psychological Session' : 'Career Session'}
                </span>
                <span className="text-xs text-zinc-400 font-bold capitalize bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{booking.mode}</span>
              </div>

              <div className="space-y-0.5 text-left">
                <h4 className="font-header font-bold text-base capitalize text-white">{booking.userName}</h4>
                <div className="flex items-center gap-1.5 text-sm text-zinc-450 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-zinc-550" />
                  <span>{formatDateString(booking.date)} at {booking.time}</span>
                </div>
                {booking.mode === 'DOOR_STEP' && booking.clientLocationName && (
                  <p className="text-xs text-zinc-400 mt-1 font-semibold flex items-start gap-1">
                    <span className="text-zinc-500 shrink-0">📍 Doorstep Address:</span>
                    <span className="text-zinc-300 leading-normal">{booking.clientLocationName}</span>
                  </p>
                )}
                {booking.mode === 'OFFLINE' && (
                  <p className="text-xs text-zinc-400 mt-1 font-semibold flex items-start gap-1">
                    <span className="text-zinc-500 shrink-0">🏢 Session Location:</span>
                    <span className="text-zinc-300 leading-normal">{booking.counsellor?.locationName || 'Your clinic address'}</span>
                  </p>
                )}
              </div>

              {/* Room link status block */}
              <div className="pt-1.5 flex items-center gap-2 flex-wrap text-left">
                <span className="text-sm capitalize font-semibold text-zinc-500">Meeting Room:</span>
                {booking.status === 'EXPIRED' ? (
                  <span className="text-xs font-semibold text-rose-400 italic flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Access Expired
                  </span>
                ) : booking.meetLink ? (
                  <button
                    type="button"
                    onClick={() => window.open(booking.meetLink, '_blank')}
                    className="text-sm font-bold text-brand hover:underline transition flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
                  >
                    <Link className="w-3.5 h-3.5 text-brand shrink-0" /> Join Meet
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-zinc-500 italic flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Link Missing. Access Locked.
                  </span>
                )}
              </div>

              {/* Diagnostic Feedback Editor / Display */}
              {(booking.status === 'COMPLETED' || booking.status === 'EXPIRED') && (
                <div className="pt-4 mt-3 border-t border-zinc-800 space-y-3 w-full max-w-xl text-left">
                  <span className="text-sm capitalize font-bold text-zinc-450 block tracking-wide">
                    Diagnostic & Clinical Records:
                  </span>

                  {editingFeedbackId === booking.id ? (
                    <div className="space-y-3 font-sans bg-zinc-950 p-4 rounded-[10px] border border-zinc-800">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                          Clinical Assessment & Observation Notes
                        </label>
                        <textarea
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Enter clinical assessments, observations, and findings..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                          Recommendations & Feedback
                        </label>
                        <textarea
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Enter key recommendations, student guidance, and feedback..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                          Next Session Approximate Time (Optional)
                        </label>
                        <input
                          type="text"
                          value={nextSessionInput}
                          onChange={(e) => setNextSessionInput(e.target.value)}
                          placeholder="e.g., In 2 weeks, Mid-July, or specific date"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand font-semibold"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => saveFeedback(booking.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-955 rounded-[10px] text-xs font-bold capitalize cursor-pointer shadow-sm border-none"
                        >
                          Save Records
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFeedbackId(null)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[10px] text-xs font-bold capitalize cursor-pointer border-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                          Clinical Assessment & Observation Notes:
                        </span>
                        <p className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-[10px] border border-zinc-800 italic leading-relaxed font-medium">
                          {booking.notes ? `"${booking.notes}"` : "No notes recorded yet."}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                          Recommendations & Feedback:
                        </span>
                        <p className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-[10px] border border-zinc-800 italic leading-relaxed font-medium">
                          {booking.feedback ? `"${booking.feedback}"` : "No recommendations recorded yet."}
                        </p>
                      </div>

                      {booking.nextSession && booking.nextSession.trim() !== '' && booking.nextSession.trim().toLowerCase() !== 'n/a' && booking.nextSession.trim().toLowerCase() !== 'none' && booking.nextSession.trim().toLowerCase() !== 'no' && booking.nextSession.trim().toLowerCase() !== 'null' && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider block">
                            Next Session Approximate Time:
                          </span>
                          <p className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-[10px] border border-zinc-800 leading-relaxed font-semibold">
                            {booking.nextSession}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 items-center flex-wrap pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFeedbackId(booking.id);
                            setNotesInput(booking.notes || '');
                            setFeedbackInput(booking.feedback || '');
                            setNextSessionInput(booking.nextSession || '');
                          }}
                          className="text-xs font-bold text-brand hover:underline capitalize flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
                        >
                          Edit Records
                        </button>
                        {booking.status === 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadDiagnosticPDF(booking)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline capitalize flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
                              title="Download Clinical Report PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Download Report PDF</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await ApiService.sendReportToAdmin(booking.id);
                                  if(res.success) {
                                    toast.success('Report successfully submitted to administration.');
                                    const loadBookingsData = async () => {
                                      const appointments = await ApiService.getAppointments();
                                      if (appointments.success) setBookings(appointments.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
                                    };
                                    loadBookingsData();
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              disabled={booking.sentToAdmin}
                              className={`text-xs font-bold capitalize flex items-center gap-1.5 border-none p-0 ml-2 ${booking.sentToAdmin ? 'text-zinc-500 cursor-not-allowed bg-transparent' : 'text-sky-400 hover:text-sky-350 hover:underline cursor-pointer bg-transparent'}`}
                              title="Send Report to Admin"
                            >
                              <Send className={`w-3.5 h-3.5 ${booking.sentToAdmin ? 'text-zinc-500' : 'text-sky-450'}`} />
                              <span>{booking.sentToAdmin ? 'Report Sent to Admin' : 'Send Report to Admin'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Google Meet Input logic */}
            <div className="shrink-0 flex items-center gap-2">
              {editingBookingId === booking.id ? (
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto bg-zinc-950 p-2 rounded-[10px] border border-zinc-800">
                    <input
                      type="text"
                      placeholder="https://meet.google.com/..."
                      value={meetLinkInput}
                      onChange={(e) => {
                        setMeetLinkInput(e.target.value);
                        setMeetLinkError('');
                      }}
                      className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none w-full sm:w-[240px] focus:border-brand shadow-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveMeetLink(booking.id)}
                        className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-955 rounded-[10px] text-sm font-bold capitalize cursor-pointer shadow-sm border-none"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBookingId(null)}
                        className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[10px] text-sm font-bold capitalize cursor-pointer border-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {booking.meetLink && booking.mode === 'ONLINE' && (
                    <a
                      href={booking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-brand text-zinc-955 hover:bg-brand-dark rounded-[10px] text-sm font-black tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border-none animate-pulse"
                    >
                      <Video className="w-4 h-4 text-zinc-955" />
                      <span>Join Meet</span>
                    </a>
                  )}
                  <button
                    onClick={() => startEditMeetLink(booking)}
                    className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-[10px] text-sm font-bold capitalize transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{booking.meetLink ? 'Edit Link' : 'Set Meet Link'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-zinc-955/40 border border-zinc-800 rounded-[10px] space-y-3">
            <Video className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-500 font-bold text-sm capitalize">
              No {activeBookingTab.toLowerCase()} sessions registered for your account yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsTab;
