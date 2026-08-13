import React from 'react';
import { formatDateString } from "../../../../utils/dateFormatter";
import { formatCountdown } from '../../utils/utils';

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
  onOpenBooking
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Overview & Guidance Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
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
            className="inline-block px-5 py-2.5 bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none hover-scale-btn"
          >
            Book Consultation
          </button>
        )}
      </div>

      {/* Next Session Card */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-shadow hover:shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            {nextSession.advisorProfilePic && (
              <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-0.5">
                Next Scheduled Session &middot; {nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'Clinic Visit'}
              </p>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight truncate">{nextSession.advisorName}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  {formatDateString(nextSession.date)}
                </span>
                <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  {nextSession.time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {(() => {
              const cd = formatCountdown(nextSession.date, nextSession.time);
              return (
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Starts in</p>
                  <p className={`text-xl font-bold tracking-tight ${cd.urgent ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{cd.text}</p>
                </div>
              );
            })()}

            {nextSession.mode === 'ONLINE' && nextSession.meetLink ? (
              <a
                href={nextSession.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border-none bg-slate-900 hover:bg-black text-[#00c9d6] shadow-xs text-center"
              >
                Join Google Meet
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer border border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a 1-on-1 session with a certified clinical psychologist or career mentor for personal guidance.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else navigate('/booking');
              }}
              className="mt-5 inline-block px-6 py-2.5 bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer border-none hover-scale-btn"
            >
              Schedule Consultation Now
            </button>
          )}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Expert Consultation */}
        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="px-3.5 py-1 bg-surface-100 text-[#0f172a] font-semibold text-xs sm:text-sm rounded-lg border border-surface-200 inline-block">
              Verified Specialists
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mt-3 tracking-tight">1-on-1 Psychological Care</h3>
            <p className="text-xs sm:text-sm text-surface-600 font-normal mt-1.5 leading-relaxed">
              Connect with certified clinical psychologists for emotional support, stress relief, and mental wellness.
            </p>
          </div>
          <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-surface-500">60-min personalized session</span>
            <button
              type="button"
              onClick={() => {
                if (onOpenBooking) onOpenBooking();
                else navigate('/booking');
              }}
              className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#00e5ff]/30 cursor-pointer shadow-2xs"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* C-DAT Aptitude Card */}
        {enableAptitude && (
          <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3.5 py-1 bg-surface-100 text-[#0f172a] font-semibold text-xs sm:text-sm rounded-lg border border-surface-200 inline-block">
                {testProfile ? 'Report Ready' : 'C-DAT Evaluation'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] mt-3 tracking-tight">C-DAT Aptitude Assessment</h3>
              <p className="text-xs sm:text-sm text-surface-600 font-normal mt-1.5 leading-relaxed">
                Comprehensive psychometric assessment uncovering natural aptitudes, learning styles, and suitable career tracks.
              </p>
            </div>
            <div className="pt-4 border-t border-surface-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-surface-500">{testProfile ? 'Verified Results' : '45-min scientific evaluation'}</span>
              <button
                type="button"
                onClick={() => handleSectionChange('cdat')}
                className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl font-bold text-xs sm:text-sm transition-colors border border-[#00e5ff]/30 cursor-pointer shadow-2xs"
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
        <div className="lg:col-span-2 rounded-xl p-6 bg-white border border-surface-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-surface-100 pb-3">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#0f172a]">Recent Session History</h4>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs sm:text-sm text-surface-500 hover:text-[#00c9d6] font-semibold cursor-pointer border-0 bg-transparent tracking-wide"
            >
              View All
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-2.5">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-surface-50 border border-surface-100 transition-colors">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#0f172a]">{s.advisorName}</p>
                    <p className="text-xs text-surface-600 font-medium">{s.advisorRole || 'Consultation'} &middot; {formatDateString(s.date)}</p>
                  </div>
                  <span className="text-xs font-bold text-[#0f172a] bg-surface-100 border border-surface-200 px-3 py-1 rounded-full">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500 border border-dashed border-surface-200 rounded-xl bg-surface-50/50">
              <p className="text-sm font-bold text-[#0f172a] tracking-wide">No completed sessions yet</p>
              <p className="text-xs text-surface-600 font-normal mt-1">Finished session records and doctor notes will appear here.</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="rounded-xl p-6 bg-white border border-surface-200 shadow-xs">
          <div className="mb-4 border-b border-surface-100 pb-3">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-[#0f172a]">Milestones</h4>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Profile Created', done: !!profile.name },
              { label: 'Email Verified', done: !!profile.email },
              { label: 'Phone Linked', done: !!profile.phone },
              { label: 'First Booking', done: stats.total > 0 },
              { label: 'C-DAT Assessment', done: !!testProfile, condition: enableAptitude },
              { label: '5 Sessions Goal', done: stats.completed >= 5 },
            ].filter(a => a.condition !== false).map((a, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border transition-colors ${a.done
                    ? 'bg-surface-50 border-surface-200 text-[#0f172a]'
                    : 'bg-surface-50/40 border-surface-100 text-surface-400'
                  }`}
              >
                <span className={`truncate ${a.done ? 'font-semibold text-[#0f172a]' : 'line-through text-surface-400'}`}>
                  {a.label}
                </span>
                {a.done && <span className="text-xs font-bold text-[#00c9d6] bg-slate-900 px-2.5 py-0.5 rounded-full shadow-2xs border border-[#00c9d6]/30">Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
