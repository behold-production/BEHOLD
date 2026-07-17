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
    <div className="bg-white border border-slate-200/80 rounded-[28px] shadow-lg overflow-hidden relative transition-all duration-300">
      {/* Decorative top accent gradient bar */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 w-full" />

      {/* Subtle ambient light gradient background */}
      <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-blue-50/50 via-indigo-50/20 to-transparent pointer-events-none" />

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
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100 ring-2 ring-blue-500/20"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border-4 border-white shadow-xl ring-2 ring-blue-500/20 flex items-center justify-center text-white font-black text-3xl sm:text-4xl">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 text-white gap-1">
                <Plus className="w-6 h-6 text-cyan-300" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Photo</span>
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md" title="Verified Account">
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-xs text-blue-600 font-extrabold mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start tracking-wider uppercase">
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs font-bold">
                {profile.grade && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/80 text-blue-700 font-bold shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-slate-700 font-bold max-w-[220px] truncate shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{profile.schoolName}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Verified Student
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 justify-center sm:justify-start text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[240px] text-slate-700 font-semibold">{profile.email || user?.email || 'Add email'}</span>
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" /> {profile.phone}
                  </span>
                )}
              </div>

              {/* Profile completion progress bar */}
              <div className="mt-5 max-w-sm mx-auto sm:mx-0 bg-slate-50/80 border border-slate-200/80 rounded-lg p-3.5 shadow-2xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] text-slate-600 font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                    Profile Completion
                  </span>
                  <span className="text-xs font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">{totalProgress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-700 shadow-2xs"
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
                <div key={i} className={`flex flex-col sm:flex-row items-center gap-3.5 px-5 py-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-lg transition-all duration-200 min-w-[145px] shadow-xs hover:shadow-md group`}>
                  <div className={`w-11 h-11 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">{s.value}</p>
                    <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase mt-0.5">{s.label}</p>
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
