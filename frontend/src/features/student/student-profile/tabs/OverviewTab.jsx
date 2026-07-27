import React from 'react';
import { formatDateString } from '../../../../shared/utils/dateFormatter';
import { formatCountdown } from '../utils';

const OverviewTab = ({
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
  enableAptitude
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Overview & Guidance Dashboard</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {nextSession ? 'Your scheduled consultations and progress metrics.' : 'Track your counseling sessions and personal guidance path here.'}
          </p>
        </div>
        {(enablePsychology || enableCareerMentoring) && (
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="inline-block px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer border-none"
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
              <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-0.5">
                Next Scheduled Session &middot; {nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'Clinic Visit'}
              </p>
              <h3 className="font-bold text-slate-900 text-lg tracking-tight truncate">{nextSession.advisorName}</h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-bold text-slate-700">
                <span className="bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
                  {formatDateString(nextSession.date)}
                </span>
                <span className="bg-slate-50 px-3 py-1 rounded-md border border-slate-200">
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
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Starts in</p>
                  <p className={`text-lg font-bold tracking-tight ${cd.urgent ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{cd.text}</p>
                </div>
              );
            })()}

            {nextSession.mode === 'ONLINE' && nextSession.meetLink ? (
              <a
                href={nextSession.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none bg-slate-900 hover:bg-black text-white shadow-xs text-center"
              >
                Join Google Meet
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-lg font-bold text-slate-900 tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a 1-on-1 session with a certified clinical psychologist or career mentor for personal guidance.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-5 inline-block px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer border-none"
            >
              Schedule Consultation Now
            </button>
          )}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Expert Consultation */}
        <div className="bg-white rounded-3xl p-6 border border-[#d6cecb] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="px-3.5 py-1 bg-[#eae4dc] text-[#1c1514] font-bold text-[10px] rounded-full uppercase tracking-wider border border-[#d8d0c7] inline-block">
              Verified Specialists
            </span>
            <h3 className="text-lg font-bold uppercase text-[#1c1514] mt-3 tracking-tight">1-on-1 Psychological Care</h3>
            <p className="text-xs text-[#6e635e] font-normal mt-1 leading-relaxed">
              Connect with certified clinical psychologists for emotional support, stress relief, and mental wellness.
            </p>
          </div>
          <div className="pt-4 border-t border-[#eae4dc] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7c7069]">60-min personalized session</span>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="px-5 py-2 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] rounded-full font-bold text-xs uppercase tracking-wider transition-colors border-none cursor-pointer shadow-2xs"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* C-DAT Aptitude Card */}
        {enableAptitude && (
          <div className="bg-white rounded-3xl p-6 border border-[#d6cecb] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3.5 py-1 bg-[#eae4dc] text-[#1c1514] font-bold text-[10px] rounded-full uppercase tracking-wider border border-[#d8d0c7] inline-block">
                {testProfile ? 'Report Ready' : 'C-DAT Evaluation'}
              </span>
              <h3 className="text-lg font-bold uppercase text-[#1c1514] mt-3 tracking-tight">C-DAT Aptitude Assessment</h3>
              <p className="text-xs text-[#6e635e] font-normal mt-1 leading-relaxed">
                Comprehensive psychometric assessment uncovering natural aptitudes, learning styles, and suitable career tracks.
              </p>
            </div>
            <div className="pt-4 border-t border-[#eae4dc] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#7c7069]">{testProfile ? 'Verified Results' : '45-min scientific evaluation'}</span>
              <button
                type="button"
                onClick={() => handleSectionChange('cdat')}
                className="px-5 py-2 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] rounded-full font-bold text-xs uppercase tracking-wider transition-colors border-none cursor-pointer shadow-2xs"
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
        <div className="lg:col-span-2 rounded-3xl p-6 bg-white border border-[#d6cecb] shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#eae4dc] pb-3">
            <h4 className="text-sm font-bold uppercase tracking-tight text-[#1c1514]">Recent Session History</h4>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs text-[#7c7069] hover:text-[#1c1514] font-bold uppercase cursor-pointer border-0 bg-transparent tracking-wider"
            >
              View all
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-2.5">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#fcfbf9] border border-[#eae4dc] transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#1c1514]">{s.advisorName}</p>
                    <p className="text-[11px] text-[#6e635e] font-medium">{s.advisorRole || 'Consultation'} &middot; {formatDateString(s.date)}</p>
                  </div>
                  <span className="text-[10px] tracking-widest font-bold uppercase text-[#1c1514] bg-[#eae4dc] border border-[#d8d0c7] px-3 py-1 rounded-full">Completed</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#7c7069] border border-dashed border-[#d6cecb] rounded-2xl bg-[#f7f4ef]/50">
              <p className="text-xs font-bold text-[#1c1514] uppercase tracking-wider">No completed sessions yet</p>
              <p className="text-[11px] text-[#6e635e] font-normal mt-1">Finished session records and doctor notes will appear here.</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="rounded-3xl p-6 bg-white border border-[#d6cecb] shadow-xs">
          <div className="mb-4 border-b border-[#eae4dc] pb-3">
            <h4 className="text-sm font-bold uppercase tracking-tight text-[#1c1514]">Milestones</h4>
          </div>
          <div className="space-y-2">
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
                className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl border transition-colors ${a.done
                    ? 'bg-[#f7f4ef] border-[#d8d0c7] text-[#1c1514]'
                    : 'bg-[#f7f4ef]/40 border-[#eae4dc] text-[#7c7069]'
                  }`}
              >
                <span className={`truncate ${a.done ? 'font-bold text-[#1c1514]' : 'line-through text-[#7c7069]'}`}>
                  {a.label}
                </span>
                {a.done && <span className="text-[9px] font-bold uppercase tracking-widest text-[#f7f4ef] bg-[#2b211e] px-2.5 py-0.5 rounded-full shadow-2xs">Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
