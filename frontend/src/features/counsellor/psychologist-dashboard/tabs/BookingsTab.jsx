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
  const completedCount = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'EXPIRED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const filteredBookings = bookings.filter(b => {
    const status = b.status || 'CONFIRMED';
    if (activeBookingTab === 'CONFIRMED') {
      return status === 'CONFIRMED' || status === 'PENDING' || status === 'APPROVED';
    }
    if (activeBookingTab === 'COMPLETED') {
      return status === 'COMPLETED' || status === 'EXPIRED';
    }
    return status === activeBookingTab;
  });

  const shadowStyle = {
    background: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm text-left">
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold capitalize text-zinc-500">Student Booking Details & Rooms</h3>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Manage virtual consultations, update appointment statuses, and log clinic summaries.</p>
        </div>
        <span className="text-sm bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold capitalize">{bookings.length} Total</span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1.5 bg-zinc-50 border border-zinc-200/60 rounded-xl max-w-md">
        {[
          { id: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },
          { id: 'COMPLETED', label: 'Completed', count: completedCount },
          { id: 'CANCELLED', label: 'Cancelled', count: cancelledCount }
        ].map(tab => {
          const isActive = activeBookingTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBookingTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 border ${isActive
                ? 'bg-brand text-zinc-950 border-brand shadow-sm'
                : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-zinc-900/10 text-zinc-900 font-bold' : 'bg-zinc-100 text-zinc-400'}`}>
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
            className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden transition-all hover:-translate-y-0.5"
            style={shadowStyle}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {booking.status === 'EXPIRED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-600 rounded text-xs font-bold uppercase tracking-wider">
                    EXPIRED
                  </span>
                ) : (
                  <select
                    value={(booking.status === 'APPROVED' || booking.status === 'PENDING') ? 'CONFIRMED' : (booking.status || 'CONFIRMED')}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking.status)}
                    className={`px-2.5 py-1 border rounded outline-none text-sm font-bold capitalize cursor-pointer transition-all ${(booking.status === 'CONFIRMED' || booking.status === 'APPROVED' || booking.status === 'PENDING' || !booking.status)
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : booking.status === 'COMPLETED'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}
                  >
                    <option value="CONFIRMED" className="bg-white text-emerald-600">CONFIRMED</option>
                    <option value="COMPLETED" className="bg-white text-indigo-600">COMPLETED</option>
                    <option value="CANCELLED" className="bg-white text-rose-600">CANCELLED</option>
                  </select>
                )}
                <span className="text-xs bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded font-semibold capitalize">
                  {booking.service === 'counselling' ? 'Psychological Session' : 'Career Session'}
                </span>
                <span className="text-xs text-zinc-500 font-bold capitalize bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">{booking.mode}</span>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-header font-bold text-base capitalize text-zinc-900">{booking.userName}</h4>
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateString(booking.date)} at {booking.time}</span>
                </div>
              </div>

              {/* Room link status block */}
              <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-sm capitalize font-semibold text-zinc-500">Meeting Room:</span>
                {booking.status === 'EXPIRED' ? (
                  <span className="text-xs font-semibold text-rose-500 italic flex items-center gap-1">
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
                <div className="pt-4 mt-3 border-t border-zinc-100 space-y-3 w-full max-w-xl text-left">
                  <span className="text-sm capitalize font-bold text-zinc-600 block tracking-wide">
                    Diagnostic & Clinical Records:
                  </span>

                  {editingFeedbackId === booking.id ? (
                    <div className="space-y-3 font-sans bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                          Clinical Assessment & Observation Notes
                        </label>
                        <textarea
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Enter clinical assessments, observations, and primary findings..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-900 text-sm rounded-lg outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                          Recommendations & Feedback
                        </label>
                        <textarea
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Enter key recommendations, student guidance, and feedback..."
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-900 text-sm rounded-lg outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                          Next Session Approximate Time (Optional)
                        </label>
                        <input
                          type="text"
                          value={nextSessionInput}
                          onChange={(e) => setNextSessionInput(e.target.value)}
                          placeholder="e.g., In 2 weeks, Mid-July, or specific date"
                          className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-900 text-sm rounded-lg outline-none focus:border-brand font-semibold"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => saveFeedback(booking.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold capitalize cursor-pointer shadow-sm border-none"
                        >
                          Save Records
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFeedbackId(null)}
                          className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-xs font-bold capitalize cursor-pointer border-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Clinical Assessment & Observation Notes:
                        </span>
                        <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 italic leading-relaxed font-medium">
                          {booking.notes ? `"${booking.notes}"` : "No notes recorded yet."}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Recommendations & Feedback:
                        </span>
                        <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 italic leading-relaxed font-medium">
                          {booking.feedback ? `"${booking.feedback}"` : "No recommendations recorded yet."}
                        </p>
                      </div>

                      {booking.nextSession && booking.nextSession.trim() !== '' && booking.nextSession.trim().toLowerCase() !== 'n/a' && booking.nextSession.trim().toLowerCase() !== 'none' && booking.nextSession.trim().toLowerCase() !== 'no' && booking.nextSession.trim().toLowerCase() !== 'null' && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                            Next Session Approximate Time:
                          </span>
                          <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-200 leading-relaxed font-semibold">
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
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline capitalize flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
                              title="Download Clinical Report PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
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
                              className={`text-xs font-bold capitalize flex items-center gap-1.5 border-none p-0 ml-2 ${booking.sentToAdmin ? 'text-zinc-400 cursor-not-allowed bg-transparent' : 'text-blue-600 hover:text-blue-700 hover:underline cursor-pointer bg-transparent'}`}
                              title="Send Report to Admin"
                            >
                              <Send className={`w-3.5 h-3.5 ${booking.sentToAdmin ? 'text-zinc-400' : 'text-blue-600'}`} />
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <input
                      type="text"
                      placeholder="https://meet.google.com/..."
                      value={meetLinkInput}
                      onChange={(e) => {
                        setMeetLinkInput(e.target.value);
                        setMeetLinkError('');
                      }}
                      className="px-3.5 py-2.5 bg-white border border-zinc-200 text-zinc-900 text-sm rounded-md outline-none w-full sm:w-[240px] focus:border-brand shadow-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveMeetLink(booking.id)}
                        className="px-3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-sm font-bold capitalize cursor-pointer shadow-sm border-none"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBookingId(null)}
                        className="px-3 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-md text-sm font-bold capitalize cursor-pointer border-none"
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
                      className="px-4 py-2.5 bg-brand text-zinc-950 hover:bg-brand-dark rounded-lg text-sm font-black tracking-widest uppercase transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border-none"
                    >
                      <Video className="w-4 h-4 text-zinc-950" />
                      <span>Join Meet</span>
                    </a>
                  )}
                  <button
                    onClick={() => startEditMeetLink(booking)}
                    className="px-4.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-sm font-bold capitalize transition cursor-pointer flex items-center gap-1.5 shadow-sm"
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
          <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <Video className="w-8 h-8 text-zinc-300 mx-auto" />
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
