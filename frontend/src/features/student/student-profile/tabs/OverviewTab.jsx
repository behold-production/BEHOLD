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
            className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs tracking-wider font-black uppercase rounded-xl transition-all duration-200 shadow-md shadow-blue-500/20 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" /> Book Consultation
          </button>
        )}
      </div>

      {/* ── Next Session Card ── */}
      {nextSession ? (
        <div className="group relative overflow-hidden rounded-[24px] border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-6 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-blue-100/80 border-2 border-blue-300/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {nextSession.advisorProfilePic ? (
                <img src={nextSession.advisorProfilePic} alt={nextSession.advisorName} className="w-full h-full rounded-2xl object-cover" />
              ) : nextSession.mode === 'ONLINE' ? (
                <Video className="w-7 h-7 text-blue-600" />
              ) : (
                <MapPin className="w-7 h-7 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                Next Scheduled Session
              </p>
              <h3 className="font-black text-slate-900 text-xl tracking-tight truncate">{nextSession.advisorName}</h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium truncate">
                {nextSession.advisorRole || 'Consultant Psychologist'}
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-blue-600 font-bold">{nextSession.mode === 'ONLINE' ? 'Online Video Call' : 'In-Person Clinic Visit'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> {formatDateString(nextSession.date)}
                </span>
                <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> {nextSession.time}
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
              className="min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
            >
              View Details
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] p-10 text-center border border-dashed border-blue-200/80 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/60 shadow-sm flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tight">No upcoming sessions booked</p>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed font-medium">
            Schedule a 1-on-1 session with one of our certified clinical psychologists or career mentors to start your progress.
          </p>
          {(enablePsychology || enableCareerMentoring) && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs tracking-widest uppercase font-black rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" /> Schedule Consultation Now
            </button>
          )}
        </div>
      )}

      {/* ── KPI Stats Row — executive frosted white cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Upcoming', value: stats.upcoming, sub: 'booked sessions', accent: '#2563eb', bg: '#eff6ff', dot: '#3b82f6' },
          { icon: CheckCircle2, label: 'Completed', value: stats.completed, sub: 'finished sessions', accent: '#059669', bg: '#ecfdf5', dot: '#10b981' },
          { icon: BarChart3, label: 'C-DAT Assessment', value: testProfile ? 'Ready' : 'Pending', sub: testProfile ? 'report generated' : 'take assessment', accent: testProfile ? '#7c3aed' : '#d97706', bg: testProfile ? '#f5f3ff' : '#fffbeb', dot: testProfile ? '#8b5cf6' : '#f59e0b', condition: enableAptitude },
          { icon: Clock, label: 'Total Hours', value: `${stats.hours}h`, sub: '1-on-1 coaching', accent: '#e11d48', bg: '#fff1f2', dot: '#f43f5e' },
        ].filter(k => k.condition !== false).map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default group border border-slate-200/80 bg-white shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300" style={{ background: kpi.dot }} />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-110 shadow-2xs"
                style={{ background: kpi.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: kpi.accent }} />
              </div>
              <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">{kpi.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Action Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expert Consultation Action Card */}
        <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
              ★ 4.9 Rated Specialists
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-3 tracking-tight">1-on-1 Expert Consultation</h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Connect with verified clinical psychologists and career counselors for tailored academic, career, and emotional guidance.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">60-min personalized session</span>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-0"
            >
              Book Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* C-DAT Aptitude Card */}
        {enableAptitude && (
          <div className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                {testProfile ? 'Report Ready' : 'AI Assessment'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-3 tracking-tight">C-DAT Aptitude Assessment</h3>
              <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                Comprehensive psycho-diagnostic & career aptitude assessment to uncover your top strengths, skills, and ideal career tracks.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">{testProfile ? 'Verified Results' : '45-min scientific evaluation'}</span>
              <button
                type="button"
                onClick={() => handleSectionChange('cdat')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-0"
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
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="text-base font-black text-slate-900 tracking-tight">Recent Session History</h4>
            </div>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 font-bold tracking-wider uppercase cursor-pointer border-0 bg-transparent"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-slate-50 border border-slate-100 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{s.advisorName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.advisorRole || 'Consultation'} · {formatDateString(s.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] tracking-widest font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">Completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs">
                <History className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs tracking-widest uppercase font-black text-slate-500">No completed sessions yet</p>
              <p className="text-xs text-slate-400 font-medium">Your finished consultation records and notes will appear here.</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-base font-black text-slate-900 tracking-tight">Milestones</h4>
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
                className={`flex items-center gap-3 text-xs font-bold px-3.5 py-3 rounded-xl transition-all duration-200 border ${
                  a.done
                    ? 'bg-slate-50/80 border-slate-200/80 text-slate-900 shadow-2xs'
                    : 'bg-slate-50/40 border-slate-100 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    a.done ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {a.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <span>{a.emoji}</span>}
                </div>
                <span className={`flex-1 truncate ${a.done ? 'font-bold text-slate-800' : 'line-through text-slate-400'}`}>
                  {a.label}
                </span>
                {a.done && <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
