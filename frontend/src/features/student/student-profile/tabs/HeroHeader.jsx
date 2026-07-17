import React from 'react';
import { Plus, Check, Sun, GraduationCap, BookOpen, Shield, Mail, Phone } from 'lucide-react';
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

  return (
    <div className="bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#0f172a] text-white border border-blue-500/20 rounded-3xl shadow-xl overflow-hidden relative">
      {/* Decorative ambient glowing lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      {/* Top accent glow line */}
      <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 w-full" />

      <div className="p-6 sm:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Circular Avatar */}
          <div className="relative shrink-0 group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-400/30 shadow-lg bg-blue-950"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 border-4 border-blue-400/30 shadow-lg flex items-center justify-center text-white font-black text-3xl sm:text-4xl">
                {getInitials(profile.name, user?.name)}
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 text-white gap-1">
              <Plus className="w-6 h-6 text-cyan-400" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Photo</span>
              <input
                type="file"
                onChange={handleProfilePicUpload}
                accept="image/*"
                className="hidden"
              />
            </label>
            <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0d1b2a] flex items-center justify-center shadow-md" title="Verified Account">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs text-cyan-300 font-bold mb-1 flex items-center gap-1.5 justify-center sm:justify-start tracking-wider uppercase">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> {greeting}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs text-blue-100">
              {profile.grade && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-bold text-xs shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> {profile.grade}
                </span>
              )}
              {profile.schoolName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-bold text-xs max-w-[220px] truncate shadow-xs">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{profile.schoolName}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs shadow-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Verified Student
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 justify-center sm:justify-start text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[220px]">{profile.email || user?.email || 'Add email'}</span>
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" /> {profile.phone}
                </span>
              )}
            </div>

            {/* Profile progress */}
            <div className="mt-5 max-w-sm">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-300 font-bold tracking-wider uppercase">Profile completion</span>
                <span className="text-xs font-black text-cyan-400">{totalProgress}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Glass Cards */}
          <div className="flex sm:flex-col gap-3 shrink-0 mt-4 sm:mt-0">
            {[
              { label: 'Upcoming', value: stats.upcoming },
              { label: 'Completed', value: stats.completed },
              { label: 'Hours', value: `${stats.hours}h` },
            ].map((s, i) => (
              <div key={i} className="text-center px-5 py-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl min-w-[85px] transition-all duration-200">
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] text-cyan-300 font-bold tracking-wider uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
