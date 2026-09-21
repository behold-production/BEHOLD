import React from 'react';
import { Clock, AlertCircle, Link, Video, FileText, Send, Edit, ShieldCheck, Lock } from 'lucide-react';
import { formatDateString } from '../../../../utils/dateFormatter';
import ApiService from '../../../../services/api';
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
  adminNotesInput,
  setAdminNotesInput,
  saveFeedback,
  handleSendReportToAdmin,
  downloadDiagnosticPDF,
  editingBookingId,
  setEditingBookingId,
  meetLinkInput,
  setMeetLinkInput,
  setMeetLinkError,
  saveMeetLink,
  startEditMeetLink
}) => {
  const uniqueBookingsMap = new Map();
  (bookings || []).forEach(b => {
    const key = b.id || b._id || ((b.razorpayOrderId && b.razorpayOrderId.trim()) 
      ? b.razorpayOrderId 
      : `${b.counsellorId || b.advisorId || ''}_${b.date || ''}_${b.time || ''}`);
    if (!uniqueBookingsMap.has(key)) {
      uniqueBookingsMap.set(key, b);
    } else {
      const prev = uniqueBookingsMap.get(key);
      if (b.paymentStatus === 'PAID' && prev.paymentStatus !== 'PAID') {
        uniqueBookingsMap.set(key, b);
      }
    }
  });

  const uniqueBookings = Array.from(uniqueBookingsMap.values());
  const confirmedCount = uniqueBookings.filter(b => !b.status || b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'APPROVED').length;
  const completedCount = uniqueBookings.filter(b => b.status === 'COMPLETED').length;
  const expiredCount = uniqueBookings.filter(b => b.status === 'EXPIRED').length;
  const cancelledCount = uniqueBookings.filter(b => b.status === 'CANCELLED').length;

  const filteredBookings = uniqueBookings.filter(b => {
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
          <h3 className="text-sm font-bold text-zinc-500 font-header">User Booking Details & Rooms</h3>
          <p className="text-sm text-zinc-400 mt-1 font-medium break-words">Manage virtual consultations, update appointment statuses, and log clinic summaries.</p>
        </div>
        <span className="text-sm bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded font-bold shrink-0">{bookings.length} Total</span>
      </div>

      {/* Tab switcher */}
      <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-955 border border-zinc-800 rounded-xl max-w-full overflow-x-auto">
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
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap border select-none ${
                isActive
                  ? 'bg-brand text-zinc-955 border-brand shadow-sm font-black'
                  : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-855/60'
              }`}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 transition-colors ${
                isActive
                  ? 'bg-zinc-955 text-cyan-400 border border-cyan-400/20 font-black'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-955/20 border border-rose-900/30 text-rose-400 rounded text-xs font-bold tracking-wider">
                    EXPIRED
                  </span>
                ) : (
                  <select
                    value={(booking.status === 'APPROVED' || booking.status === 'PENDING') ? 'CONFIRMED' : (booking.status || 'CONFIRMED')}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking.status)}
                    className={`px-2.5 py-1 border rounded outline-none text-sm font-bold cursor-pointer transition-all ${(booking.status === 'CONFIRMED' || booking.status === 'APPROVED' || booking.status === 'PENDING' || !booking.status)
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
                <span className="text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-semibold ">
                  {booking.service === 'counselling' ? 'Psychological Session' : 'Career Session'}
                </span>
                <span className="text-xs text-zinc-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">{booking.mode}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${booking.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : booking.paymentStatus === 'FAILED' ? 'bg-rose-950 text-rose-400 border-rose-900' : 'bg-amber-950 text-amber-400 border-amber-900'}`}>{booking.paymentStatus || 'PENDING'}</span>
              </div>

              <div className="space-y-0.5 text-left">
                <h4 className="font-header font-bold text-base text-white">{booking.userName}</h4>
                {(booking.age || booking.feelingLately) && (
                  <p className="text-xs text-zinc-400 mt-0.5 mb-1.5 leading-relaxed bg-zinc-900/50 p-2 rounded-md border border-zinc-800/50">
                    {booking.age && <><span className="font-semibold text-zinc-300">Age:</span> {booking.age}</>}
                    {booking.age && booking.feelingLately && <span className="mx-2 text-zinc-600">|</span>}
                    {booking.feelingLately && <><span className="font-semibold text-zinc-300">Issue:</span> {booking.feelingLately}</>}
                  </p>
                )}
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
              {booking.mode === 'ONLINE' && (
                <div className="pt-2 flex flex-col gap-2 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-400">Meeting Room:</span>
                    {editingBookingId === booking.id ? (
                      <span className="text-xs text-brand font-semibold">Editing link below</span>
                    ) : booking.status === 'EXPIRED' ? (
                      <span className="text-xs font-semibold text-rose-400 italic flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Access Expired
                      </span>
                    ) : booking.meetLink ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => window.open(booking.meetLink, '_blank')}
                          className="text-xs font-bold bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          title="Direct 1-Click Consultation Room (No knocking or admission needed)"
                        >
                          <Video className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>Direct Join Now</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(booking.meetLink);
                            toast.success('Meeting link copied to clipboard!');
                          }}
                          className="text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                          title="Copy Link to Clipboard"
                        >
                          Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditMeetLink(booking)}
                          className="text-xs font-semibold text-zinc-400 hover:text-white underline cursor-pointer bg-transparent border-none p-0 ml-1"
                        >
                          Edit Link
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-amber-500 italic flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Missing Link
                        </span>
                        <button
                          type="button"
                          onClick={() => saveMeetLink(booking.id, `https://meet.jit.si/BEHOLD-Consultation-${booking.id}`)}
                          className="text-xs font-bold bg-brand hover:bg-brand-dark text-zinc-955 px-3 py-1.5 rounded-lg cursor-pointer transition shadow-sm border-none"
                          title="Generate instant 1-click zero-knocking room"
                        >
                          ⚡ Generate Direct Room
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditMeetLink(booking)}
                          className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 px-2.5 py-1.5 rounded-lg cursor-pointer transition shadow-sm"
                        >
                          Custom Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Editor when editing */}
                  {editingBookingId === booking.id && (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2.5 mt-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          value={meetLinkInput}
                          onChange={(e) => {
                            setMeetLinkInput(e.target.value);
                            setMeetLinkError('');
                          }}
                          placeholder="https://meet.jit.si/BEHOLD-... or https://meet.google.com/abc-defg-hij"
                          className="px-3 py-2 bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg outline-none focus:border-brand flex-1 min-w-[240px]"
                        />
                        <button
                          type="button"
                          onClick={() => saveMeetLink(booking.id)}
                          className="px-3.5 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-xs font-bold rounded-lg cursor-pointer border-none shadow-sm"
                        >
                          Save Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBookingId(null)}
                          className="px-3 py-2 bg-zinc-850 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold rounded-lg cursor-pointer border border-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <button
                          type="button"
                          onClick={() => setMeetLinkInput(`https://meet.jit.si/BEHOLD-Consultation-${booking.id}`)}
                          className="px-2.5 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
                          title="Generate instant 1-click room URL"
                        >
                          ⚡ Auto Direct Room (Recommended)
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open('https://meet.google.com/new', '_blank')}
                          className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                          title="Open Google Meet to create room, then paste the URL above"
                        >
                          🎥 Open Google Meet ↗
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-tight">
                        Tip: Direct rooms allow both user & psychologist to join with 1 click without knocking or Google login. If using Google Meet, start the call, copy the room URL (e.g. meet.google.com/abc-defg-hij), and paste it above.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnostic Feedback Editor / Display */}
              {(booking.status === 'COMPLETED' || booking.status === 'EXPIRED') && (
                <div className="pt-4 mt-3 border-t border-zinc-800 space-y-3 w-full max-w-xl text-left">
                  <span className="text-sm font-bold text-zinc-450 block tracking-wide">
                    Diagnostic & Clinical Records:
                  </span>

                  {editingFeedbackId === booking.id ? (
                    <div className="space-y-4 font-sans bg-zinc-950 p-4 rounded-[10px] border border-zinc-800">
                      <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-brand uppercase tracking-wider">Report 1: Student Consultation Report (User-Facing)</span>
                        <span className="text-[10px] text-zinc-450 italic">Visible & downloadable by Student</span>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300 tracking-wider block">
                          Clinical Observations & Findings
                        </label>
                        <textarea
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="Enter clinical observations and findings for the student..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300 tracking-wider block">
                          Student Guidance & Actionable Recommendations
                        </label>
                        <textarea
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Enter key guidance, advice, and recommendations for student download..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand resize-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-300 tracking-wider block">
                          Next Recommended Session Time (Optional)
                        </label>
                        <input
                          type="text"
                          value={nextSessionInput}
                          onChange={(e) => setNextSessionInput(e.target.value)}
                          placeholder="e.g., In 2 weeks, Mid-August, or specific date"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-[10px] outline-none focus:border-brand font-semibold"
                        />
                      </div>

                      <div className="border-t border-b border-zinc-800 py-3 my-2 space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" /> Report 2: Confidential Admin Clinical Report (Admin-Facing)
                          </span>
                          <span className="text-[10px] text-amber-400/70 italic">Hidden from Student · Strictly for Admin</span>
                        </div>
                        <textarea
                          value={adminNotesInput}
                          onChange={(e) => setAdminNotesInput(e.target.value)}
                          placeholder="Enter confidential internal case notes strictly for System Administration..."
                          rows={3}
                          className="w-full px-3 py-2 bg-zinc-900 border border-amber-500/20 text-amber-100 text-sm rounded-[10px] outline-none focus:border-amber-400 resize-none font-medium"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => saveFeedback(booking.id)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-955 rounded-[10px] text-xs font-bold cursor-pointer shadow-sm border-none flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Save & Send to Student
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReportToAdmin(booking.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-955 rounded-[10px] text-xs font-bold cursor-pointer shadow-sm border-none flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Submit Confidential Report to Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingFeedbackId(null)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-[10px] text-xs font-bold cursor-pointer border-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-zinc-450 tracking-wider block">
                          Student Consultation Report & Guidance:
                        </span>
                        <p className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-[10px] border border-zinc-800 italic leading-relaxed font-medium">
                          {booking.feedback || booking.notes ? `"${booking.feedback || booking.notes}"` : "No student report recorded yet."}
                        </p>
                      </div>

                      {booking.adminNotes && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-400" /> Confidential Admin Report:
                          </span>
                          <p className="text-xs text-amber-200/90 bg-amber-950/20 p-3 rounded-[10px] border border-amber-500/30 italic leading-relaxed font-medium">
                            "{booking.adminNotes}"
                          </p>
                        </div>
                      )}

                      {booking.nextSession && booking.nextSession.trim() !== '' && booking.nextSession.trim().toLowerCase() !== 'n/a' && booking.nextSession.trim().toLowerCase() !== 'none' && booking.nextSession.trim().toLowerCase() !== 'no' && booking.nextSession.trim().toLowerCase() !== 'null' && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-450 tracking-wider block">
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
                            setAdminNotesInput(booking.adminNotes || '');
                          }}
                          className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent p-0"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit Consultation & Admin Reports
                        </button>
                        {booking.status === 'COMPLETED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => downloadDiagnosticPDF(booking)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0"
                              title="Download Report PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Download PDF Report</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await ApiService.sendReportToAdmin(booking.id);
                                  if (res.success) {
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
                              className={`text-xs font-bold flex items-center gap-1.5 border-none p-0 ml-2 ${booking.sentToAdmin ? 'text-zinc-500 cursor-not-allowed bg-transparent' : 'text-sky-400 hover:text-sky-350 hover:underline cursor-pointer bg-transparent'}`}
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

            {/* Action buttons */}
            <div className="shrink-0 flex items-center gap-2">
              {booking.meetLink && booking.mode === 'ONLINE' && (
                <a
                  href={booking.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-brand text-zinc-955 hover:bg-brand-dark rounded-[10px] text-xs font-black tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border-none"
                  title="Direct 1-Click Consultation Room"
                >
                  <Video className="w-4 h-4 text-zinc-955" />
                  <span>Direct Join</span>
                </a>
              )}
              {booking.mode === 'ONLINE' && editingBookingId !== booking.id && (
                <button
                  type="button"
                  onClick={() => startEditMeetLink(booking)}
                  className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-[10px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{booking.meetLink ? 'Edit Link' : 'Set Room'}</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-zinc-955/40 border border-zinc-800 rounded-[10px] space-y-3">
            <Video className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-500 font-bold text-sm ">
              No {activeBookingTab.toLowerCase()} sessions registered for your account yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsTab;
