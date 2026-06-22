import React from 'react';
import {
  Plus, Video, MapPin, Calendar, Clock, CalendarDays,
  CheckCircle2, BarChart3, Briefcase, Users, Activity,
  ChevronRight, Award, Trophy, User, Mail, Phone, Check,
  History
} from 'lucide-react';
import { formatDateString } from '../../../../shared/utils/dateFormatter';
import { formatCountdown } from '../utils';

const OverviewTab = ({
  nextSession,
  enablePsychology,
  navigate,
  handleSectionChange,
  setSessionSubTab,
  stats,
  testProfile,
  bookedSessions,
  completedSessions,
  profile
}) => {
  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Overview</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {nextSession ? 'Your next session is coming up.' : 'Ready to start your journey?'}
          </p>
        </div>
        {enablePsychology && (
          <button
            type="button"
            onClick={() => navigate('/booking')}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 bg-zinc-950 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all duration-200 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> Book Session
          </button>
        )}
      </div>

      {/* ── Next Session Card — deep slate gradient with cyan glow ── */}
      {nextSession ? (
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0f172a 100%)',
            boxShadow: '0 8px 32px -4px rgba(0,209,209,0.18), 0 4px 16px -4px rgba(10,20,60,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        >
          {/* Decorative glow blobs */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #00D1D1 0%, transparent 70%)' }} />
          <div className="absolute -bottom-6 left-10 w-24 h-24 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

          <p className="relative text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            Next Scheduled Session
          </p>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
              >
                {nextSession.mode === 'ONLINE'
                  ? <Video className="w-5 h-5 text-cyan-300" />
                  : <MapPin className="w-5 h-5 text-cyan-300" />}
              </div>
              <div>
                <p className="font-bold text-white text-base tracking-tight">{nextSession.advisorName}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {nextSession.advisorRole || 'Consultation'}
                  <span className="mx-1.5 text-zinc-600">·</span>
                  <span className="text-cyan-400 font-semibold">{nextSession.mode === 'ONLINE' ? 'Online' : 'In-Person'}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/8">
                    <Calendar className="w-3.5 h-3.5 text-cyan-500" /> {formatDateString(nextSession.date)}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/8">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" /> {nextSession.time}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {(() => {
                const cd = formatCountdown(nextSession.date, nextSession.time);
                return (
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Starts in</p>
                    <p className={`text-2xl font-black tracking-tight ${cd.urgent ? 'text-amber-400' : 'text-white'}`}>{cd.text}</p>
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={() => { handleSectionChange('booked'); setSessionSubTab('upcoming'); }}
                className="min-h-[38px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-white border-white/15 hover:bg-white/10 hover:border-white/25"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl p-7 text-center border border-dashed border-zinc-300"
          style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' }}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-4">
            <CalendarDays className="w-6 h-6 text-zinc-400" />
          </div>
          <p className="text-sm font-bold text-zinc-800">No upcoming sessions</p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Schedule a session with one of our certified professionals to get started.
          </p>
          {enablePsychology && (
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="mt-5 inline-flex items-center gap-1.5 min-h-[40px] px-6 py-2 bg-zinc-950 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all border-none shadow-md"
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
          { icon: BarChart3, label: 'C-DAT', value: testProfile ? 'Done' : 'Pending', sub: testProfile ? 'profile ready' : 'not taken', accent: testProfile ? '#8b5cf6' : '#f59e0b', bg: testProfile ? '#f5f3ff' : '#fffbeb', dot: testProfile ? '#8b5cf6' : '#f59e0b' },
          { icon: Clock, label: 'Hours', value: `${stats.hours}h`, sub: 'coached', accent: '#f43f5e', bg: '#fff1f2', dot: '#f43f5e' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-default group"
              style={{
                background: '#ffffff',
                boxShadow: `inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 2px rgba(11,20,36,0.04), 0 4px 16px -4px rgba(11,20,36,0.07)`
              }}
            >
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all duration-300" style={{ background: kpi.dot }} />
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: kpi.bg }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.accent }} />
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-black text-zinc-900 mt-0.5 tracking-tight">{kpi.value}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Action Cards — gradient border reveal on hover ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* C-DAT Action Card */}
        <div
          className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: '#ffffff',
            boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
          }}
        >
          {/* Gradient hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(14,165,233,0.04) 100%)' }} />
          <div className="relative flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <BarChart3 className="w-5 h-5" style={{ color: '#7c3aed' }} />
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
              testProfile
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {testProfile ? '✓ Completed' : '⏳ Pending'}
            </span>
          </div>
          <h4 className="relative font-bold text-zinc-900 text-base tracking-tight">Aptitude Test</h4>
          <p className="relative text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {testProfile
              ? `Your dominant domain is ${testProfile.dominantDomain}. View your full results.`
              : 'Map your natural strengths across 7 key domains. Takes ~15 minutes.'}
          </p>
          <button
            type="button"
            onClick={() => testProfile ? handleSectionChange('results') : navigate('/sample-test')}
            className="relative mt-5 w-full min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
            style={{
              background: testProfile ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              boxShadow: testProfile ? '0 4px 12px rgba(124,58,237,0.3)' : '0 4px 12px rgba(15,23,42,0.25)'
            }}
          >
            {testProfile ? '📊 View Full Results' : '🎯 Start Test Now'}
          </button>
        </div>

        {/* Expert Consultation Card */}
        <div
          className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: '#ffffff',
            boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(6,182,212,0.04) 100%)' }} />
          <div className="relative flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Briefcase className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
              bookedSessions.length > 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-50 text-zinc-500 border border-zinc-200'
            }`}>
              {bookedSessions.length > 0 ? `${bookedSessions.length} scheduled` : 'None booked'}
            </span>
          </div>
          <h4 className="relative font-bold text-zinc-900 text-base tracking-tight">Expert Consultation</h4>
          <p className="relative text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {bookedSessions.length > 0
              ? `Next session with ${bookedSessions[0].advisorName} on ${formatDateString(bookedSessions[0].date)}.`
              : 'Connect 1-on-1 with certified psychologists and career mentors.'}
          </p>
          {(bookedSessions.length > 0 || enablePsychology) && (
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
              className="relative mt-5 w-full min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
              style={{
                background: bookedSessions.length > 0
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                boxShadow: bookedSessions.length > 0 ? '0 4px 12px rgba(5,150,105,0.3)' : '0 4px 12px rgba(15,23,42,0.25)'
              }}
            >
              {bookedSessions.length > 0 ? '📅 View My Bookings' : '✨ Book a Session'}
            </button>
          )}
        </div>
      </div>

      {/* ── Available Services — differentiated dual-theme cards ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-zinc-900 tracking-tight">Available Services</h4>
          <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Career Mentoring — light cream theme */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-1 group"
            style={{
              background: 'linear-gradient(145deg, #fffdf7 0%, #fefce8 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(217,119,6,0.12), 0 2px 4px rgba(11,20,36,0.04), 0 6px 24px -6px rgba(217,119,6,0.1)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest" style={{ background: 'rgba(217,119,6,0.12)', color: '#b45309', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <Briefcase className="w-3 h-3" /> Career Mentoring
                </div>
                <span className="text-[10px] text-amber-400 font-black border border-amber-200 px-1.5 py-0.5 rounded-md bg-amber-50">01</span>
              </div>
              <h4 className="text-sm font-black text-zinc-900 leading-snug">Career Clarity<br />&amp; Direction</h4>
              <p className="text-[10px] font-bold text-amber-600/70 italic">Feeling Unsure About What's Next?</p>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Whether you're choosing a stream, exploring career options, or planning your future studies — we help you make confident, informed decisions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { navigate('/booking?service=career'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full min-h-[40px] rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: 'white', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
            >
              🎯 Book Career Session
            </button>
          </div>

          {/* Psychological Counselling — deep navy theme */}
          <div
            className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all duration-300 hover:-translate-y-1 group"
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.15), 0 4px 12px rgba(10,20,60,0.15), 0 12px 32px -8px rgba(99,102,241,0.12)'
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <Users className="w-3 h-3" /> Psychological Counselling
                </div>
                <span className="text-[10px] text-indigo-400 font-black border border-indigo-800 px-1.5 py-0.5 rounded-md bg-indigo-950/50">02</span>
              </div>
              <h4 className="text-sm font-black text-white leading-snug">Emotional Wellbeing<br />&amp; Support</h4>
              <p className="text-[10px] font-bold text-indigo-400/70 italic">You Don't Have to Face It Alone.</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                A safe space to reflect, heal, and grow. Our counselling sessions provide professional emotional and mental health support.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { navigate('/booking?service=counselling'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full min-h-[40px] rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            >
              💬 Talk to a Counsellor
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Activity + Achievements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity — timeline style */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: '#ffffff',
            boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 2px rgba(11,20,36,0.03), 0 4px 16px -4px rgba(11,20,36,0.07)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-zinc-500" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Recent Activity</h4>
            </div>
            <button
              type="button"
              onClick={() => { handleSectionChange('booked'); setSessionSubTab('history'); }}
              className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1 font-semibold"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 hover:bg-zinc-50 group" style={{ border: '1px solid transparent' }}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <Award className="w-4 h-4" style={{ color: '#059669' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{s.advisorName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{s.advisorRole || 'Consultation'} · {formatDateString(s.date)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-400 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <History className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-medium text-zinc-500">No sessions yet</p>
              <p className="text-xs text-zinc-400">Completed sessions will appear here.</p>
            </div>
          )}
        </div>

        {/* Achievements — milestone badge design */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(145deg, #fafafa 0%, #f4f4f5 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 2px rgba(11,20,36,0.03), 0 4px 12px -4px rgba(11,20,36,0.06)'
          }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid rgba(217,119,6,0.2)' }}>
              <Trophy className="w-4 h-4" style={{ color: '#d97706' }} />
            </div>
            <h4 className="text-sm font-bold text-zinc-900">Achievements</h4>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: User, label: 'Profile Created', done: !!profile.name, emoji: '👤' },
              { icon: Mail, label: 'Email Added', done: !!profile.email, emoji: '📧' },
              { icon: Phone, label: 'Phone Added', done: !!profile.phone, emoji: '📱' },
              { icon: Calendar, label: 'First Booking', done: stats.total > 0, emoji: '📅' },
              { icon: BarChart3, label: 'C-DAT Completed', done: !!testProfile, emoji: '📊' },
              { icon: Award, label: '5 Sessions Done', done: stats.completed >= 5, emoji: '🏆' },
            ].map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  a.done
                    ? 'bg-white border border-zinc-200 shadow-sm'
                    : 'bg-zinc-100/60 border border-transparent'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                    a.done ? 'bg-zinc-900 shadow-sm' : 'bg-zinc-200'
                  }`}
                >
                  {a.done ? <Check className="w-3 h-3 text-white" strokeWidth={3} /> : <span className="text-[10px] opacity-40">{a.emoji}</span>}
                </div>
                <span className={`font-semibold ${
                  a.done ? 'text-zinc-900' : 'text-zinc-400 line-through'
                }`}>{a.label}</span>
                {a.done && <span className="ml-auto text-[10px] text-emerald-600 font-bold">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
