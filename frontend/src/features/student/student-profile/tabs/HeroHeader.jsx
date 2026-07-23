import React from 'react';
import { Plus, Check, Sun, GraduationCap, BookOpen, Shield, Mail, Phone, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { getInitials } from '../utils';

const HeroHeader = ({
  completion,
  testProfile,
  stats,
  profile,
  user,
  displayName,
  greeting,
  handleProfilePicUpload
}) => {
  const totalProgress = Math.min(100, completion + (testProfile ? 15 : 0) + (stats.completed > 0 ? 10 : 0));
  const avatarUrl = profile.profilePic || profile.profileImage || profile.avatar || profile.photoURL || profile.image || user?.profilePic || user?.profileImage || user?.avatar || user?.photoURL || user?.image;

  const statItems = [
    { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100/80', border: 'border-blue-200/60' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/80', border: 'border-emerald-200/60' },
    { label: 'Hours', value: `${stats.hours}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/80', border: 'border-amber-200/60' },
  ];

  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-sm overflow-hidden relative">
      {/* Subtle top brand accent line */}
      <div className="h-1 bg-brand w-full" />

      <div className="p-6 sm:p-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 sm:gap-8">
          {/* Left: Avatar + User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-0">
            {/* Circular Avatar */}
            <div className="relative shrink-0 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md bg-surface-100 ring-1 ring-surface-200"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface-100 border-4 border-white shadow-md ring-1 ring-surface-200 flex items-center justify-center text-surface-600 font-bold text-3xl sm:text-4xl">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-surface-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 text-white gap-1">
                <Plus className="w-6 h-6 text-white" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Photo</span>
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-brand border-2 border-white flex items-center justify-center shadow-sm" title="Verified Account">
                <Check className="w-3.5 h-3.5 text-zinc-955" strokeWidth={3} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-xs text-surface-500 font-bold mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start tracking-wide uppercase">
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs font-medium">
                {profile.grade && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-100 border border-surface-200 text-surface-700">
                    <GraduationCap className="w-3.5 h-3.5 text-surface-500 shrink-0" /> {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-100 border border-surface-200 text-surface-700 max-w-[220px] truncate">
                    <BookOpen className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                    <span className="truncate">{profile.schoolName}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand/10 border border-brand/20 text-brand">
                  <Shield className="w-3.5 h-3.5 text-brand shrink-0" /> Verified Student
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 justify-center sm:justify-start text-xs text-surface-500 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  <span className="truncate max-w-[240px] text-surface-700 font-medium">{profile.email || user?.email || 'Add email'}</span>
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5 text-surface-700 font-medium">
                    <Phone className="w-3.5 h-3.5 text-surface-400 shrink-0" /> {profile.phone}
                  </span>
                )}
              </div>

              {/* Profile completion progress bar */}
              <div className="mt-5 max-w-sm mx-auto sm:mx-0 bg-surface-50 border border-surface-200 rounded-md p-3.5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-surface-600 font-bold tracking-wide uppercase flex items-center gap-1.5">
                    Profile Completion
                  </span>
                  <span className="text-xs font-bold text-surface-700">{totalProgress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats Glass Cards */}
          <div className="grid grid-cols-3 sm:flex lg:flex-col gap-3.5 shrink-0 w-full sm:w-auto mt-4 lg:mt-0">
            {statItems.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-3.5 px-4 py-3 bg-white hover:bg-surface-50 border border-surface-200 rounded-md transition-colors min-w-[140px] shadow-sm">
                  <div className="w-10 h-10 rounded-md bg-surface-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-surface-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-bold text-surface-900 leading-tight tracking-tight">{s.value}</p>
                    <p className="text-[10px] text-surface-500 font-bold uppercase mt-0.5">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
