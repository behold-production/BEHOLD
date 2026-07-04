import React from 'react';
import {
  Plus, Video, MapPin, Calendar, Clock, CalendarDays,
  CheckCircle2, BarChart3, Briefcase, Activity,
  ChevronRight, Award, Trophy, User, Mail, Phone, Check,
  History
} from 'lucide-react';
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
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-surface-900 tracking-tight">Overview</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {nextSession ? 'Your next session is coming up.' : 'Ready to start your journey?'}
          </p>
        </div>
        {(enablePsychology || enableCareerMentoring) && (
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 bg-surface-900 text-white text-[10px] uppercase tracking-widest font-black rounded-[10px] hover:bg-surface-800 transition-all duration-200 border-none shadow-none"
          >
            <Plus className="w-3.5 h-3.5" /> Book Session
          </button>
        )}
      </div>



      {/* ── Next Session Card ── */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-[10px] border border-surface-200 bg-white p-5 shadow-square-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0">
              {nextSession.advisorProfilePic ? (
                <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-12 h-12 rounded-[10px] object-cover" />
              ) : nextSession.mode === 'ONLINE'
                ? <Video className="w-5 h-5 text-surface-600" />
                : <MapPin className="w-5 h-5 text-surface-600" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-[10px] bg-emerald-500 animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                Next Scheduled Session
              </p>
              <p className="font-black text-surface-900 text-base tracking-tight">{nextSession.advisorName}</p>
              <p className="text-xs text-surface-500 mt-0.5 font-medium">
                {nextSession.advisorRole || 'Consultation'}
                <span className="mx-1.5 text-surface-300">·</span>
                <span className="text-surface-700 font-bold">{nextSession.mode === 'ONLINE' ? 'Online' : 'In-Person'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[10px] uppercase tracking-widest font-bold text-surface-600">
                <span className="flex items-center gap-1 bg-surface-50 px-2 py-1 rounded-[10px] border border-surface-200">
                  <Calendar className="w-3.5 h-3.5 text-surface-400" /> {formatDateString(nextSession.date)}
                </span>
                <span className="flex items-center gap-1 bg-surface-50 px-2 py-1 rounded-[10px] border border-surface-200">
                  <Clock className="w-3.5 h-3.5 text-surface-400" /> {nextSession.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-100">
            {(() => {
              const cd = formatCountdown(nextSession.date, nextSession.time);
              return (
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Starts in</p>
                  <p className={`text-xl sm:text-2xl font-black tracking-tight ${cd.urgent ? 'text-amber-600' : 'text-surface-900'}`}>{cd.text}</p>
                </div>
              );
            })()}
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
              className="min-h-[38px] px-4 py-2 rounded-[10px] text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer border border-surface-200 hover:border-surface-300 bg-white hover:bg-surface-50 text-surface-900 shadow-none"
            >
              View Details
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-[10px] p-7 text-center border border-dashed border-surface-200 bg-white"
        >
          <div className="w-14 h-14 mx-auto rounded-[10px] bg-white border border-surface-200 shadow-square-light flex items-center justify-center mb-4">
            <CalendarDays className="w-6 h-6 text-surface-400" />
          </div>
          <p className="text-sm font-black text-surface-900">No upcoming sessions</p>
          <p className="text-xs text-surface-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Schedule a session with one of our certified professionals to get started.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-5 inline-flex items-center gap-1.5 min-h-[40px] px-6 py-2 bg-surface-900 text-white text-[10px] uppercase tracking-widest font-black rounded-[10px] hover:bg-surface-800 transition-all border-none shadow-none"
            >
              <Plus className="w-3.5 h-3.5" /> Book a Session
            </button>
          )}
        </div>
      )}

      {/* ── KPI Stats Row — frosted glass with accent dots ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: 'Upcoming', value: stats.upcoming, sub: 'sessions', accent: '#0ea5e9', bg: '#eff6ff', dot: '#3b82f6' },
          { icon: CheckCircle2, label: 'Completed', value: stats.completed, sub: 'lifetime', accent: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
          { icon: BarChart3, label: 'C-DAT', value: testProfile ? 'Done' : 'Pending', sub: testProfile ? 'profile ready' : 'not taken', accent: testProfile ? '#8b5cf6' : '#f59e0b', bg: testProfile ? '#f5f3ff' : '#fffbeb', dot: testProfile ? '#8b5cf6' : '#f59e0b', condition: enableAptitude },
          { icon: Clock, label: 'Hours', value: `${stats.hours}h`, sub: 'coached', accent: '#f43f5e', bg: '#fff1f2', dot: '#f43f5e' },
        ].filter(k => k.condition !== false).map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-[10px] p-4 transition-all duration-300 hover:-translate-y-1 cursor-default group border border-surface-200 bg-white"
            >
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-[10px] transition-all duration-300" style={{ background: kpi.dot }} />
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: kpi.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.accent }} />
              </div>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-black text-surface-900 mt-0.5 tracking-tight">{kpi.value}</p>
              <p className="text-[10px] text-surface-400 mt-0.5 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Action Cards — gradient border reveal on hover ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expert Consultation Card */}
        <div
          className="group relative overflow-hidden rounded-[10px] p-5 transition-all duration-300 hover:-translate-y-1 border border-surface-200 bg-white"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(6,182,212,0.04) 100%)' }} />
          <div className="relative flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Briefcase className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-[10px] font-bold ${bookedSessions.length > 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-surface-50 text-surface-500 border border-surface-200'
              }`}>
              {bookedSessions.length > 0 ? `${bookedSessions.length} scheduled` : 'None booked'}
            </span>
          </div>
          <h4 className="relative font-black text-surface-900 text-base tracking-tight">Expert Consultation</h4>
          <p className="relative text-xs text-surface-500 mt-1.5 leading-relaxed font-medium">
            {bookedSessions.length > 0
              ? `Next session with ${bookedSessions[0].advisorName} on ${formatDateString(bookedSessions[0].date)}.`
              : 'Connect 1-on-1 with certified psychologists and career mentors.'}
          </p>
          {(bookedSessions.length > 0 || enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => {
                if (bookedSessions.length > 0) {
                  handleSectionChange('booked');
                  setSessionSubTab('upcoming');
                } else {
                  navigate('/booking');
                }
              }}
              className="relative mt-5 w-full min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] text-[10px] uppercase tracking-widest font-black transition-all border-none cursor-pointer"
              style={{
                background: bookedSessions.length > 0
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : '#18181b',
                color: 'white'
              }}
            >
              {bookedSessions.length > 0 ? 'View My Bookings' : 'Book a Session'}
            </button>
          )}
        </div>
      </div>



      {/* ── Recent Activity + Achievements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity — timeline style */}
        <div
          className="lg:col-span-2 rounded-[10px] p-5 bg-white border border-surface-200 shadow-square-light"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-surface-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-surface-500" />
              </div>
              <h4 className="text-sm font-black text-surface-900">Recent Activity</h4>
            </div>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-[10px] text-surface-400 hover:text-surface-900 transition-colors flex items-center gap-1 font-bold uppercase tracking-widest"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-0 border border-surface-200">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-[10px] transition-all duration-200 hover:bg-surface-50 border-b border-surface-100 last:border-b-0 group">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <Award className="w-4 h-4" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-surface-900 truncate">{s.advisorName}</p>
                    <p className="text-xs text-surface-500 mt-0.5 font-medium">{s.advisorRole || 'Consultation'} · {formatDateString(s.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[10px]">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-surface-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-[10px] bg-surface-50 border border-surface-200 flex items-center justify-center">
                <History className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-surface-500">No sessions yet</p>
              <p className="text-xs text-surface-400 font-medium">Completed sessions will appear here.</p>
            </div>
          )}
        </div>

        {/* Achievements — milestone badge design */}
        <div
          className="rounded-[10px] p-5 bg-white border border-surface-200 shadow-square-light"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid rgba(217,119,6,0.2)' }}>
              <Trophy className="w-4 h-4" style={{ color: '#d97706' }} />
            </div>
            <h4 className="text-sm font-black text-surface-900">Achievements</h4>
          </div>
          <div className="space-y-2">
            {[
              { icon: User, label: 'Profile Created', done: !!profile.name, emoji: '👤' },
              { icon: Mail, label: 'Email Added', done: !!profile.email, emoji: '📧' },
              { icon: Phone, label: 'Phone Added', done: !!profile.phone, emoji: '📱' },
              { icon: Calendar, label: 'First Booking', done: stats.total > 0, emoji: '📅' },
              { icon: BarChart3, label: 'C-DAT Completed', done: !!testProfile, emoji: '📊', condition: enableAptitude },
              { icon: Award, label: '5 Sessions Done', done: stats.completed >= 5, emoji: '🏆' },
            ].filter(a => a.condition !== false).map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 text-[10px] uppercase tracking-widest px-3 py-2.5 rounded-[10px] transition-all duration-200 border ${a.done
                  ? 'bg-white border-surface-200 shadow-square-light'
                  : 'bg-surface-50 border-surface-100'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 text-sm ${a.done ? 'bg-surface-900' : 'bg-surface-200'
                    }`}
                >
                  {a.done ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <span className="text-[10px] opacity-40">{a.emoji}</span>}
                </div>
                <span className={`font-bold ${a.done ? 'text-surface-900' : 'text-surface-400 line-through'
                  }`}>{a.label}</span>
                {a.done && <span className="ml-auto text-lg text-emerald-600 font-bold leading-none">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
