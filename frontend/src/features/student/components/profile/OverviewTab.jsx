import React from 'react';
import { Calendar, Video, Download, MapPin, Activity } from 'lucide-react';
import { formatDateString } from "../../../../utils/dateFormatter";
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
  bookedSessions,
  completedSessions,
  profile,
  onOpenBooking,
  downloadPDFReceiptForSession
}) {
  return (
    <div className="space-y-10 animate-fade-scale">
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-grad-gradient border border-slate-700 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#00e5ff]/15 rounded-2xl flex items-center justify-center mb-4 border border-[#00e5ff]/20">
            <div className="w-3 h-3 bg-[#00e5ff] rounded-full shadow-[0_0_10px_#00e5ff]" />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-wide uppercase mb-1">Upcoming Sessions</p>
          <h2 className="text-white font-black text-4xl tracking-tighter mb-4">{stats.upcoming || 0} <span className="text-xl font-bold text-slate-500">Active</span></h2>
          <p className="text-[#00e5ff] font-bold text-xs">
            {nextSession ? `Next: ${formatDateString(nextSession.date)} at ${nextSession.time}` : 'No upcoming sessions'}
          </p>
        </div>

        <div className="card-grad-gradient border border-slate-700 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#00e5ff]/15 rounded-2xl flex items-center justify-center mb-4 border border-[#00e5ff]/20">
            <div className="w-4 h-4 bg-[#00e5ff] rounded-md shadow-[0_0_10px_#00e5ff]" />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-wide uppercase mb-1">Completed Sessions</p>
          <h2 className="text-white font-black text-4xl tracking-tighter mb-4">{stats.completed || 0} <span className="text-xl font-bold text-slate-500">Total</span></h2>
          <p className="text-slate-400 font-bold text-xs">
            {stats.hours || 0} hrs total consultation time
          </p>
        </div>

        <div className="card-grad-gradient border border-slate-700 rounded-[24px] p-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-[#00e5ff]/15 rounded-2xl flex items-center justify-center mb-4 border border-[#00e5ff]/20">
            <Activity className="w-6 h-6 text-[#00e5ff] filter-glow" />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-wide uppercase mb-1">Wellness Tracker</p>
          <h2 className="text-white font-black text-4xl tracking-tighter mb-4">88% <span className="text-xl font-bold text-slate-500">Score</span></h2>
          <p className="text-[#00e5ff] font-bold text-xs">
            ↑ 5% Improvement this month
          </p>
        </div>
      </div>

      {/* SECTION 1: UPCOMING APPOINTMENTS */}
      <div>
        <h3 className="text-white font-black text-2xl tracking-tight mb-6">Upcoming Appointments</h3>
        
        {nextSession ? (
          <div className="card-grad-gradient border-2 border-[#00e5ff] rounded-[24px] p-6 filter-card-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-6 z-10 w-full md:w-auto">
              <div className="w-20 h-20 rounded-full bg-[#0f172a] border-2 border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center shrink-0">
                 {nextSession.advisorProfilePic ? (
                    <img src={nextSession.advisorProfilePic} alt="Doctor" className="w-full h-full rounded-full object-cover" />
                 ) : (
                    <div className="w-4 h-4 bg-[#00e5ff] rounded-full" />
                 )}
              </div>
              <div>
                <h4 className="text-white font-bold text-xl mb-1">{nextSession.advisorName}</h4>
                <p className="text-[#00e5ff] font-bold text-sm mb-2">{nextSession.advisorRole || 'Consultant Psychologist'}</p>
                <p className="text-slate-400 text-sm font-medium">
                  {formatDateString(nextSession.date)} • {nextSession.time}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full md:w-auto">
              <div className="px-4 py-1.5 bg-[#00e5ff]/15 border border-[#00e5ff] rounded-xl text-[#00e5ff] text-xs font-bold mr-0 sm:mr-4">
                Confirmed
              </div>
              
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <a
                  href={nextSession.meetLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-[200px] text-center px-6 py-3 primary-cyan-gradient text-[#030712] font-black text-sm rounded-xl filter-glow no-underline hover:scale-105 transition-transform"
                >
                  Join Video Link
                </a>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#1e293b] border border-slate-700 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#1e293b] border border-slate-700 text-rose-500 font-bold text-xs rounded-xl hover:bg-rose-950 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-700 rounded-[24px] p-10 flex flex-col items-center justify-center text-center bg-[#090d16]/50">
            <p className="text-white font-bold text-xl mb-2">No upcoming sessions</p>
            <p className="text-slate-400 text-sm mb-6 max-w-md">Schedule a consultation with a certified professional to continue your wellness journey.</p>
            <button onClick={() => window.location.href = '/booking'} className="px-8 py-3 primary-cyan-gradient text-slate-950 font-bold text-sm rounded-xl filter-glow hover:scale-105 transition-transform">
              Book a Session
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: MY CARE TEAM */}
      <div>
        <h3 className="text-white font-black text-2xl tracking-tight mb-6">My Care Team</h3>
        
        {completedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedSessions.slice(0, 2).map((session, i) => (
              <div key={i} className="card-grad-gradient border border-slate-700 rounded-[24px] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className={`w-16 h-16 rounded-full bg-[#0f172a] border-2 flex items-center justify-center shrink-0 ${i === 0 ? 'border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'border-slate-500'}`}>
                  {session.advisorProfilePic ? (
                     <img src={session.advisorProfilePic} alt="Doctor" className="w-full h-full rounded-full object-cover" />
                  ) : (
                     <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-[#00e5ff]' : 'bg-slate-500'}`} />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left w-full">
                  <h4 className="text-white font-bold text-lg mb-1">{session.advisorName}</h4>
                  <p className={`${i === 0 ? 'text-[#00e5ff]' : 'text-slate-400'} font-bold text-xs mb-3`}>{session.advisorRole || 'Primary Psychologist'}</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button onClick={() => window.location.href = `/booking?advisorId=${session.advisorId}`} className={`flex-1 py-2.5 px-4 font-bold text-xs rounded-xl transition-colors cursor-pointer ${i === 0 ? 'primary-cyan-gradient text-[#030712] border-none' : 'bg-[#1e293b] border border-slate-700 text-white hover:bg-slate-800'}`}>
                      Book Next Session
                    </button>
                    <button className="flex-1 py-2.5 px-4 bg-[#1e293b] border border-slate-700 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-slate-800 rounded-[24px] p-8 bg-[#090d16] text-slate-400 text-sm font-bold">
            You don't have a regular care team assigned yet. Once you complete your first sessions, your specialists will appear here.
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT HISTORY & RECEIPTS TABLE */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-2xl tracking-tight">Past Sessions & Receipts</h3>
          <button onClick={() => handleSectionChange('booked')} className="text-[#00e5ff] font-bold text-sm hover:underline cursor-pointer bg-transparent border-none">
            View All
          </button>
        </div>

        <div className="bg-[#0f172a] border border-slate-700 rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Service / Specialist</th>
                  <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {completedSessions.length > 0 ? completedSessions.slice(0, 3).map((session, i) => (
                  <tr key={i} className="hover:bg-[#1e293b]/50 transition-colors">
                    <td className="px-6 py-5 text-slate-300 font-medium text-sm whitespace-nowrap">
                      {formatDateString(session.date)}
                    </td>
                    <td className="px-6 py-5 text-slate-300 font-medium text-sm">
                      {session.service === 'career' ? 'Career Mentoring' : 'CBT Therapy'} • {session.advisorName}
                    </td>
                    <td className="px-6 py-5 text-slate-300 font-medium text-sm">
                      $120.00
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[#00e5ff] font-bold text-sm">Completed</span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => downloadPDFReceiptForSession && downloadPDFReceiptForSession(session)}
                        className="px-4 py-1.5 bg-[#1e293b] border border-slate-700 text-[#00e5ff] font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500 font-bold text-sm">
                      No past sessions available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
