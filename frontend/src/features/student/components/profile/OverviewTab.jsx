import React from 'react';
import { Calendar, Video, Download, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { formatDateString, formatTimeString } from "../../../../utils/dateFormatter";
import { formatCountdown, buildGoogleMeetUrl } from '../../utils/utils';
import { createGoogleCalendarUrl } from '../../../../utils/calendarUtils';

export default function OverviewTab({
  nextSession,
  navigate,
  handleSectionChange,
  setSessionSubTab,
  stats = {},
  completedSessions = [],
  profile = {},
  onOpenBooking,
  downloadPDFReceiptForSession
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0e1111] tracking-tight">Overview & Sessions</h2>
          <p className="text-sm text-[#7c8785] font-medium mt-1">
            {nextSession
              ? 'Your scheduled consultations and guidance path.'
              : 'Track your personal counseling sessions and mental wellness journey.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onOpenBooking) onOpenBooking();
            else navigate('/booking');
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0e7490] hover:bg-[#0891b2] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none"
        >
          <span>Book Consultation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-2xl border border-[#e6dfd0] bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            {nextSession.advisorProfilePic && (
              <img
                src={nextSession.advisorProfilePic}
                alt={nextSession.advisorName}
                className="w-16 h-16 rounded-xl object-cover border border-[#e6dfd0] shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#7c8785] mb-0.5">
                Next Scheduled Session &middot; {nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'Clinic Visit'}
              </p>
              <h3 className="font-bold text-[#0e1111] text-lg sm:text-xl tracking-tight truncate">
                {nextSession.advisorName}
              </h3>
              <p className="text-xs sm:text-sm text-[#55605f] mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs sm:text-sm font-semibold text-[#3c4747]">
                <span className="bg-[#f6f1e6] px-3 py-1 rounded-lg border border-[#e6dfd0]">
                  {formatDateString(nextSession.date)}
                </span>
                <span className="bg-[#f6f1e6] px-3 py-1 rounded-lg border border-[#e6dfd0]">
                  {formatTimeString(nextSession.time)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f1eadc]">
            {(() => {
              const cd = formatCountdown(nextSession.date, nextSession.time);
              return (
                <div className="text-left sm:text-right mr-2">
                  <p className="text-xs text-[#9aa29f] font-semibold tracking-wider uppercase">Starts in</p>
                  <p className={`text-xl font-bold tracking-tight ${cd.urgent ? 'text-rose-600 animate-pulse' : 'text-[#0e1111]'}`}>
                    {cd.text}
                  </p>
                </div>
              );
            })()}

            {Boolean(downloadPDFReceiptForSession) && (
              <button
                type="button"
                onClick={() => downloadPDFReceiptForSession(nextSession)}
                className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#e6dfd0] bg-[#f6f1e6] hover:bg-[#f1eadc] text-[#3c4747] flex items-center gap-1.5"
                title="Download Booking Receipt PDF"
              >
                <Download className="w-4 h-4 text-[#55605f]" />
                <span>Receipt</span>
              </button>
            )}

            <a
              href={createGoogleCalendarUrl({
                title: `BEHOLD Counselling Session - ${nextSession.advisorName || 'Psychologist'}`,
                advisorName: nextSession.advisorName || 'Psychologist',
                studentName: profile?.name || 'Client',
                location: nextSession.meetLink || 'Google Meet',
                meetLink: nextSession.meetLink || '',
                service: 'Emotional Wellbeing & Counselling',
                date: nextSession.date,
                time: nextSession.time,
                durationMinutes: nextSession.duration && String(nextSession.duration).includes('30') ? 30 : 60
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#e6dfd0] bg-[#f6f1e6] hover:bg-[#f1eadc] text-[#3c4747] flex items-center gap-1.5 no-underline"
              title="Add to Google Calendar"
            >
              <Calendar className="w-4 h-4 text-[#0b5c73]" />
              <span>Calendar</span>
            </a>

            {nextSession.mode === 'ONLINE' ? (
              <a
                href={
                  nextSession.meetLink &&
                  nextSession.meetLink !== 'LOCKED' &&
                  !nextSession.meetLink.includes('behold-aspire-session') &&
                  !nextSession.meetLink.includes('meet.google.com/new') &&
                  !nextSession.meetLink.includes('meet.jit.si')
                    ? nextSession.meetLink
                    : buildGoogleMeetUrl(nextSession.appointmentId || nextSession.id || 'Session')
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border-none bg-[#0e7490] hover:bg-[#0e1111] text-white shadow-xs text-center no-underline flex items-center gap-1.5"
                title="Join Google Meet Video Consultation"
              >
                <Video className="w-4 h-4" />
                <span>Join Call</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleSectionChange('booked');
                  if (setSessionSubTab) setSessionSubTab('upcoming');
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-[#d5cdbb] bg-white hover:bg-[#f6f1e6] text-[#243033]"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-8 sm:p-10 text-center border border-dashed border-[#e6dfd0] bg-[#f6f1e6]/60">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-[#e6dfd0] flex items-center justify-center mb-3.5 text-[#0e7490]">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#0e1111] tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs sm:text-sm text-[#7c8785] mt-1 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a private 1-on-1 session with a certified clinical psychologist for personalized emotional support and counseling.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
              else navigate('/booking');
            }}
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[#0e7490] hover:bg-[#0891b2] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none"
          >
            <span>Schedule Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action / Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Psychological Care Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#e6dfd0] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="px-3 py-1 bg-[#f1eadc] text-[#0e1111] font-semibold text-xs rounded-lg border border-[#e6dfd0] inline-block">
              Clinical Care
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0e1111] mt-3 tracking-tight">
              1-on-1 Psychological Support
            </h3>
            <p className="text-xs sm:text-sm text-[#55605f] font-normal mt-1.5 leading-relaxed">
              Connect with certified clinical psychologists for personalized care, stress relief, emotional regulation, and wellbeing.
            </p>
          </div>
          <div className="pt-4 border-t border-[#f1eadc] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#7c8785]">60-min private session</span>
            <button
              type="button"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else navigate('/booking');
              }}
              className="px-5 py-2.5 bg-[#0e1111] hover:bg-[#123039] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#0e7490]/30 cursor-pointer shadow-2xs"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Sessions & Appointments Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#e6dfd0] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="px-3 py-1 bg-[#f1eadc] text-[#0e1111] font-semibold text-xs rounded-lg border border-[#e6dfd0] inline-block">
              My Appointments
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0e1111] mt-3 tracking-tight">
              Session Management & History
            </h3>
            <p className="text-xs sm:text-sm text-[#55605f] font-normal mt-1.5 leading-relaxed">
              View your appointment records, join active video consultations, download booking receipts, and leave feedback.
            </p>
          </div>
          <div className="pt-4 border-t border-[#f1eadc] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#7c8785]">
              {stats.total || 0} total consultation{(stats.total || 0) === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => handleSectionChange('booked')}
              className="px-5 py-2.5 bg-[#0e1111] hover:bg-[#123039] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#0e7490]/30 cursor-pointer shadow-2xs"
            >
              View Sessions
            </button>
          </div>
        </div>
      </div>

      {/* History & Journey Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Session History */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-[#e6dfd0] shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#f1eadc] pb-3">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#0e1111]">Recent Consultations</h4>
            <button
              type="button"
              onClick={() => {
                handleSectionChange('booked');
                if (setSessionSubTab) setSessionSubTab('history');
              }}
              className="text-xs sm:text-sm text-[#7c8785] hover:text-[#0e7490] font-semibold cursor-pointer border-0 bg-transparent tracking-wide"
            >
              View All
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-2.5">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#f6f1e6] border border-[#f1eadc] transition-colors"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#0e1111]">{s.advisorName}</p>
                    <p className="text-xs text-[#55605f] font-medium">
                      {s.advisorRole || 'Psychological Counselling'} &middot; {formatDateString(s.date)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0e1111] bg-[#f1eadc] border border-[#e6dfd0] px-3 py-1 rounded-md">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#7c8785] border border-dashed border-[#e6dfd0] rounded-xl bg-[#f6f1e6]/40">
              <p className="text-sm font-bold text-[#0e1111] tracking-wide">No past sessions yet</p>
              <p className="text-xs text-[#55605f] font-normal mt-1">
                Completed consultation records and notes will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Care & Privacy Summary */}
        <div className="rounded-2xl p-6 bg-white border border-[#e6dfd0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#f1eadc] pb-3">
              <ShieldCheck className="w-5 h-5 text-[#0e7490]" />
              <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#0e1111]">Care & Confidentiality</h4>
            </div>
            <div className="space-y-3 text-xs text-[#55605f]">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <p>All sessions and discussions are strictly private and confidential.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <p>Consultations are conducted by licensed clinical psychologists.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <p>Secure Google Meet encrypted video rooms for every appointment.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#f1eadc]">
            <button
              type="button"
              onClick={() => handleSectionChange('details')}
              className="w-full text-center text-xs font-semibold text-[#0e7490] hover:text-[#0b5c73] transition-colors cursor-pointer bg-transparent border-none py-1"
            >
              Update Profile Details &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
