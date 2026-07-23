import React from 'react';
import {
  Plus, Video, MapPin, Calendar, Clock, CalendarDays,
  CheckCircle2, BarChart3, Briefcase, Activity,
  ChevronRight, Award, Trophy, User, Mail, Phone, Check,
  History, Sparkles, ArrowRight
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
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Overview</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {nextSession ? 'Your scheduled consultations and progress metrics at a glance.' : 'Track your counseling sessions and assessments right here.'}
          </p>
        </div>
        {(enablePsychology || enableCareerMentoring) && (
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 text-xs tracking-wider font-bold uppercase rounded-md transition-colors shadow-sm cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" /> Book Consultation
          </button>
        )}
      </div>

      {/* ── Next Session Card ── */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-md border border-surface-200 bg-white p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-16 h-16 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
              {nextSession.advisorProfilePic ? (
                <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-full h-full rounded-md object-cover" />
              ) : nextSession.mode === 'ONLINE' ? (
                <Video className="w-7 h-7 text-brand" />
              ) : (
                <MapPin className="w-7 h-7 text-brand" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Next Scheduled Session
              </p>
              <h3 className="font-black text-slate-900 text-xl tracking-tight truncate">{nextSession.advisorName}</h3>
              <p className="text-xs text-surface-600 mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
                <span className="mx-2 text-surface-300">·</span>
                <span className="text-brand font-bold">{nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'In-Person Clinic Visit'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-bold text-surface-700">
                <span className="flex items-center gap-1.5 bg-surface-50 px-3.5 py-1.5 rounded-md border border-surface-200">
                  <Calendar className="w-3.5 h-3.5 text-brand" /> {formatDateString(nextSession.date)}
                </span>
                <span className="flex items-center gap-1.5 bg-surface-50 px-3.5 py-1.5 rounded-md border border-surface-200">
                  <Clock className="w-3.5 h-3.5 text-brand" /> {nextSession.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
            {(() => {
              const cd = formatCountdown(nextSession.date, nextSession.time);
              return (
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Starts in</p>
                  <p className={`text-xl sm:text-2xl font-black tracking-tight ${cd.urgent ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{cd.text}</p>
                </div>
              );
            })()}
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
              className="min-h-[42px] px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-brand bg-brand hover:bg-brand-dark text-zinc-955 shadow-sm"
            >
              View Details
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-md p-10 text-center border border-dashed border-surface-200 bg-surface-50">
          <div className="w-16 h-16 mx-auto rounded-md bg-surface-100 border border-surface-200 flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7 text-surface-500" />
          </div>
          <p className="text-xl font-bold text-surface-900 tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs text-surface-500 mt-1.5 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a 1-on-1 session with one of our certified clinical psychologists or career mentors to start your progress.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 text-xs tracking-widest uppercase font-bold rounded-md transition-colors shadow-sm cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" /> Schedule Consultation Now
            </button>
          )}
        </div>
      )}

      {/* ── KPI Stats Row — executive frosted white cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Upcoming', value: stats.upcoming, sub: 'booked sessions', accent: '#00E5FF', bg: 'var(--color-surface-100)', dot: '#00E5FF' },
          { icon: CheckCircle2, label: 'Completed', value: stats.completed, sub: 'finished sessions', accent: '#10b981', bg: 'var(--color-surface-100)', dot: '#10b981' },
          { icon: BarChart3, label: 'C-DAT Assessment', value: testProfile ? 'Ready' : 'Pending', sub: testProfile ? 'report generated' : 'take assessment', accent: testProfile ? '#8b5cf6' : '#f59e0b', bg: 'var(--color-surface-100)', dot: testProfile ? '#8b5cf6' : '#f59e0b', condition: enableAptitude },
          { icon: Clock, label: 'Total Hours', value: `${stats.hours}h`, sub: '1-on-1 coaching', accent: '#f43f5e', bg: 'var(--color-surface-100)', dot: '#f43f5e' },
        ].filter(k => k.condition !== false).map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-md p-5 transition-shadow hover:shadow-md cursor-default group border border-surface-200 bg-white shadow-sm"
            >
              <div className="absolute top-0 left-0 right-0 h-1 transition-colors" style={{ background: kpi.dot }} />
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center mb-3.5"
                style={{ background: kpi.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: kpi.accent }} />
              </div>
              <p className="text-[10px] text-surface-500 font-bold tracking-widest uppercase">{kpi.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 mt-1 tracking-tight">{kpi.value}</p>
              <p className="text-xs text-surface-400 mt-1 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Action Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expert Consultation Action Card */}
        <div className="bg-white rounded-md p-6 border border-surface-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-brand" />
            </div>
            <span className="px-2.5 py-1 bg-surface-100 text-surface-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
              ★ 4.9 Rated Specialists
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-3 tracking-tight">1-on-1 Expert Consultation</h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Connect with verified clinical psychologists and career counselors for tailored academic, career, and emotional guidance.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-between">
            <span className="text-xs font-bold text-surface-600">60-min personalized session</span>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border-0"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* C-DAT Aptitude Card */}
        {enableAptitude && (
          <div className="bg-white rounded-md p-6 border border-surface-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-md bg-surface-900 border border-surface-800 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="px-2.5 py-1 bg-surface-100 text-surface-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                {testProfile ? 'Report Ready' : 'AI Assessment'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-3 tracking-tight">C-DAT Aptitude Assessment</h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                Comprehensive psycho-diagnostic & career aptitude assessment to uncover your top strengths, skills, and ideal career tracks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-between">
              <span className="text-xs font-bold text-surface-600">{testProfile ? 'Verified Results' : '45-min scientific evaluation'}</span>
              <button
                type="button"
                onClick={() => handleSectionChange('cdat')}
                className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border-0"
              >
                {testProfile ? 'View Report' : 'Take Assessment'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Activity + Achievements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-md p-6 bg-white border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-surface-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-bold text-surface-900 tracking-tight">Recent Session History</h4>
            </div>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs text-brand hover:text-brand-dark transition-colors flex items-center gap-1 font-bold tracking-wider uppercase cursor-pointer border-0 bg-transparent"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-md transition-colors hover:bg-surface-50 border border-surface-100">
                  <div className="w-10 h-10 rounded-md bg-surface-100 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-surface-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-900 truncate">{s.advisorName}</p>
                    <p className="text-xs text-surface-500 mt-0.5 font-medium">{s.advisorRole || 'Consultation'} · {formatDateString(s.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] tracking-widest font-bold uppercase text-surface-700 bg-surface-100 border border-surface-200 px-2.5 py-1 rounded-full">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-surface-400 space-y-3 border border-dashed border-surface-200 rounded-md bg-surface-50/50">
              <div className="w-14 h-14 mx-auto rounded-md bg-white border border-surface-200 flex items-center justify-center shadow-sm">
                <History className="w-6 h-6 text-surface-400" />
              </div>
              <p className="text-xs tracking-widest uppercase font-bold text-surface-500">No completed sessions yet</p>
              <p className="text-xs text-surface-400 font-medium">Your finished consultation records and notes will appear here.</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="rounded-md p-6 bg-white border border-surface-200 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-surface-100 pb-4">
            <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-base font-bold text-surface-900 tracking-tight">Milestones</h4>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: User, label: 'Profile Created', done: !!profile.name, emoji: '👤' },
              { icon: Mail, label: 'Email Verified', done: !!profile.email, emoji: '📧' },
              { icon: Phone, label: 'Phone Linked', done: !!profile.phone, emoji: '📱' },
              { icon: Calendar, label: 'First Booking', done: stats.total > 0, emoji: '📅' },
              { icon: BarChart3, label: 'C-DAT Assessment', done: !!testProfile, emoji: '📊', condition: enableAptitude },
              { icon: Award, label: '5 Sessions Goal', done: stats.completed >= 5, emoji: '🏆' },
            ].filter(a => a.condition !== false).map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-xs font-bold px-3.5 py-3 rounded-md transition-colors border ${
                  a.done
                    ? 'bg-surface-50 border-surface-200 text-surface-900'
                    : 'bg-surface-50 border-surface-100 text-surface-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${
                    a.done ? 'bg-brand text-zinc-955' : 'bg-surface-200 text-surface-400'
                  }`}
                >
                  {a.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <span>{a.emoji}</span>}
                </div>
                <span className={`flex-1 truncate ${a.done ? 'font-bold text-surface-800' : 'line-through text-surface-400'}`}>
                  {a.label}
                </span>
                {a.done && <span className="text-xs font-bold text-surface-700 bg-surface-100 px-2 py-0.5 rounded-md border border-surface-200">Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
