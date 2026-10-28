import React from 'react';
import { Calendar, Video, Download, MapPin } from 'lucide-react';
import { formatDateString, formatTimeString } from "../../../../utils/dateFormatter";
import { formatCountdown, buildGoogleMeetUrl } from '../../utils/utils';
import { createGoogleCalendarUrl } from '../../../../utils/calendarUtils';

export default function OverviewTab({
  nextSession,
  enablePsychology,
  enableCareerMentoring,
  navigate,
  handleSectionChange,
  setSessionSubTab,
  stats,
  testProfile,
  bookedSessions,
  completedSessions,
  profile,
  enableAptitude,
  onOpenBooking,
  downloadPDFReceiptForSession
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1c2826] tracking-tight">Overview & Guidance Dashboard</h2>
          <p className="text-sm text-[#8a938f] font-medium mt-1">
            {nextSession ? 'Your scheduled consultations and progress metrics.' : 'Track your counseling sessions and personal guidance path here.'}
          </p>
        </div>
        {(enablePsychology || enableCareerMentoring) && (
          <button
            type="button"
            onClick={() => {
              if (onOpenBooking) onOpenBooking();
              else navigate('/booking');
            }}
            className="inline-block px-5 py-2.5 bg-[#b85438] hover:bg-[#00b2be] text-[#16201d] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none hover-scale-btn"
          >
            Book Consultation
          </button>
        )}
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-xl border border-[#ede7de] bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            {nextSession.advisorProfilePic && (
              <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-16 h-16 rounded-xl object-cover border border-[#ede7de] shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#8a938f] mb-0.5">
                Next Scheduled Session &middot; {nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'Clinic Visit'}
              </p>
              <h3 className="font-bold text-[#1c2826] text-lg sm:text-xl tracking-tight truncate">{nextSession.advisorName}</h3>
              <p className="text-xs sm:text-sm text-[#5c6b66] mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs sm:text-sm font-semibold text-[#4c5b55]">
                <span className="bg-[#faf6ee] px-3 py-1 rounded-lg border border-[#ede7de]">
                  {formatDateString(nextSession.date)}
                </span>
                <span className="bg-[#faf6ee] px-3 py-1 rounded-lg border border-[#ede7de]">
                  {formatTimeString(nextSession.time)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#f4eee6]">
            {(() => {
              const cd = formatCountdown(nextSession.date, nextSession.time);
              return (
                <div className="text-left sm:text-right mr-2">
                  <p className="text-xs text-[#a8a094] font-semibold tracking-wider uppercase">Starts in</p>
                  <p className={`text-xl font-bold tracking-tight ${cd.urgent ? 'text-rose-600 animate-pulse' : 'text-[#1c2826]'}`}>{cd.text}</p>
                </div>
              );
            })()}

            {Boolean(downloadPDFReceiptForSession) && (
              <button
                type="button"
                onClick={() => downloadPDFReceiptForSession(nextSession)}
                className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#ede7de] bg-[#faf6ee] hover:bg-[#f4eee6] text-[#4c5b55] flex items-center gap-1.5"
                title="Download Booking Receipt PDF"
              >
                <Download className="w-4 h-4 text-[#5c6b66]" />
                <span>Receipt</span>
              </button>
            )}

            <a
              href={createGoogleCalendarUrl({
                title: `BEHOLD Counselling Session - ${nextSession.advisorName || 'Psychologist'}`,
                advisorName: nextSession.advisorName || 'Psychologist',
                studentName: profile?.name || 'Student',
                location: nextSession.meetLink || 'Google Meet',
                meetLink: nextSession.meetLink || '',
                service: nextSession.service === 'career' ? 'Career Mapping & Guidance' : 'Emotional Wellbeing & Counselling',
                date: nextSession.date,
                time: nextSession.time,
                durationMinutes: nextSession.duration && String(nextSession.duration).includes('30') ? 30 : 60
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-[#ede7de] bg-[#faf6ee] hover:bg-[#f4eee6] text-[#4c5b55] flex items-center gap-1.5 no-underline"
              title="Add to Google Calendar"
            >
              <Calendar className="w-4 h-4 text-[#a0462e]" />
              <span>Calendar</span>
            </a>

            {nextSession.mode === 'ONLINE' ? (
              <a
                href={
                  nextSession.meetLink && nextSession.meetLink !== 'LOCKED' && !nextSession.meetLink.includes('behold-aspire-session') && !nextSession.meetLink.includes('meet.google.com/new') && !nextSession.meetLink.includes('meet.jit.si')
                    ? nextSession.meetLink
                    : buildGoogleMeetUrl(nextSession.appointmentId || nextSession.id || 'Session')
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border-none bg-brand hover:bg-brand-dark text-white shadow-xs text-center no-underline flex items-center gap-1.5"
                title="Join Google Meet Video Consultation"
              >
                <Video className="w-4 h-4" />
                <span>Join Google Meet</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-[#e0d8cb] bg-white hover:bg-[#faf6ee] text-[#33413d]"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center border border-dashed border-[#ede7de] bg-[#faf6ee]/50">
          <p className="text-lg sm:text-xl font-bold text-[#1c2826] tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs sm:text-sm text-[#8a938f] mt-1 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a 1-on-1 session with a certified clinical psychologist or career mentor for personal guidance.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else navigate('/booking');
              }}
              className="mt-5 inline-block px-6 py-2.5 bg-[#b85438] hover:bg-[#00b2be] text-[#16201d] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none hover-scale-btn"
            >
              Schedule Consultation Now
            </button>
          )}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Expert Consultation */}
        <div className="bg-white rounded-xl p-6 border border-[#ede7de] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="px-3.5 py-1 bg-[#f4eee6] text-[#1c2826] font-semibold text-xs sm:text-sm rounded-lg border border-[#ede7de] inline-block">
              Verified Specialists
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#1c2826] mt-3 tracking-tight">1-on-1 Psychological Care</h3>
            <p className="text-xs sm:text-sm text-[#5c6b66] font-normal mt-1.5 leading-relaxed">
              Connect with certified clinical psychologists for emotional support, stress relief, and mental wellness.
            </p>
          </div>
          <div className="pt-4 border-t border-[#f4eee6] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-[#8a938f]">60-min personalized session</span>
            <button
              type="button"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else navigate('/booking');
              }}
              className="px-5 py-2.5 bg-[#1c2826] hover:bg-[#2b3a37] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#b85438]/30 cursor-pointer shadow-2xs"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* C-DAT Aptitude Card */}
        {enableAptitude && (
          <div className="bg-white rounded-xl p-6 border border-[#ede7de] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3.5 py-1 bg-[#f4eee6] text-[#1c2826] font-semibold text-xs sm:text-sm rounded-lg border border-[#ede7de] inline-block">
                {testProfile ? 'Report Ready' : 'C-DAT Evaluation'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#1c2826] mt-3 tracking-tight">C-DAT Aptitude Assessment</h3>
              <p className="text-xs sm:text-sm text-[#5c6b66] font-normal mt-1.5 leading-relaxed">
                Comprehensive psychometric assessment uncovering natural aptitudes, learning styles, and suitable career tracks.
              </p>
            </div>
            <div className="pt-4 border-t border-[#f4eee6] flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#8a938f]">{testProfile ? 'Verified Results' : '45-min scientific evaluation'}</span>
              <button
                type="button"
                onClick={() => {
                  if (testProfile) {
                    handleSectionChange('results');
                  } else {
                    navigate('/sample-test');
                  }
                }}
                className="px-5 py-2.5 bg-[#1c2826] hover:bg-[#2b3a37] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#b85438]/30 cursor-pointer shadow-2xs"
              >
                {testProfile ? 'View Report' : 'Take Assessment'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History & Achievements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Session History */}
        <div className="lg:col-span-2 rounded-xl p-6 bg-white border border-[#ede7de] shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#f4eee6] pb-3">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#1c2826]">Recent Session History</h4>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs sm:text-sm text-[#8a938f] hover:text-[#b85438] font-semibold cursor-pointer border-0 bg-transparent tracking-wide"
            >
              View All
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-2.5">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#faf6ee] border border-[#f4eee6] transition-colors">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#1c2826]">{s.advisorName}</p>
                    <p className="text-xs text-[#5c6b66] font-medium">{s.advisorRole || 'Consultation'} &middot; {formatDateString(s.date)}</p>
                  </div>
                  <span className="text-xs font-bold text-[#1c2826] bg-[#f4eee6] border border-[#ede7de] px-3 py-1 rounded-md">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#8a938f] border border-dashed border-[#ede7de] rounded-xl bg-[#faf6ee]/50">
              <p className="text-sm font-bold text-[#1c2826] tracking-wide">No completed sessions yet</p>
              <p className="text-xs text-[#5c6b66] font-normal mt-1">Finished session records and doctor notes will appear here.</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="rounded-xl p-6 bg-white border border-[#ede7de] shadow-xs">
          <div className="mb-4 border-b border-[#f4eee6] pb-3">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#1c2826]">Milestones</h4>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const isSet = (val) => val && String(val).trim() !== '' && String(val).trim().toLowerCase() !== 'undefined' && String(val).trim().toLowerCase() !== 'null';
              return [
                { label: 'Profile Created', done: isSet(profile.name) },
                { label: 'Email Verified', done: isSet(profile.email) },
                { label: 'Phone Linked', done: isSet(profile.phone) },
                { label: 'First Booking', done: stats.total > 0 },
                { label: 'C-DAT Assessment', done: !!testProfile, condition: enableAptitude },
              ].filter(a => a.condition !== false).map((a, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border transition-colors ${a.done
                    ? 'bg-[#faf6ee] border-[#ede7de] text-[#1c2826]'
                    : 'bg-[#faf6ee]/40 border-[#f4eee6] text-[#a8a094]'
                  }`}
              >
                <span className={`truncate ${a.done ? 'font-semibold text-[#1c2826]' : 'font-medium text-[#8a938f]'}`}>
                  {a.label}
                </span>
                {a.done ? (
                  <span className="text-[10px] sm:text-xs font-bold text-[#b85438] bg-[#1c2826] px-2.5 py-0.5 rounded-md shadow-2xs border border-[#b85438]/30">Done</span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-bold text-[#8a938f] bg-[#f4eee6] px-2.5 py-0.5 rounded-md border border-[#ede7de]">Pending</span>
                )}
              </div>
            ))
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
