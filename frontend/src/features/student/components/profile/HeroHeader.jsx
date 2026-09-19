import React from 'react';
import { getInitials } from '../../utils/utils';

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
    { label: 'Upcoming', value: stats.upcoming || 0 },
    { label: 'Completed', value: stats.completed || 0 },
    { label: 'Guided Hours', value: `${stats.hours || 0}h` },
  ];

  return (
    <div className="bg-white text-[#0f172a] border border-slate-200 rounded-xl shadow-xs overflow-hidden relative">
      {/* Neon top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#00e5ff] via-cyan-400 to-emerald-400 w-full" />

      <div className="p-5 sm:p-7 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 sm:gap-8">

          {/* Left: Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 min-w-0 w-full">
            {/* Avatar with upload hover */}
            <div className="relative shrink-0 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-white shadow-md ring-2 ring-slate-200/80"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-900 border-2 border-white shadow-md ring-2 ring-slate-200/80 flex items-center justify-center text-[#00e5ff] font-bold text-2xl sm:text-3xl uppercase">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-xl bg-slate-950/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[#00e5ff] gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <p className="text-[11px] text-[#00e5ff] font-bold mb-1 tracking-widest uppercase flex items-center justify-center sm:justify-start gap-1.5">
                {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>

              {/* Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                {profile.grade && (
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                    Grade {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold max-w-[220px] truncate">
                    {profile.schoolName}
                  </span>
                )}
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-[#00e5ff] text-xs font-bold border border-slate-800">
                  Verified User
                </span>
              </div>

              {/* Contact Info */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs text-slate-600 font-medium">
                <span className="truncate max-w-[240px] text-slate-800 font-semibold">{profile.email || user?.email || 'Add email'}</span>
                {profile.phone && (
                  <span className="text-slate-500 font-semibold">&middot; {profile.phone}</span>
                )}
              </div>

              {/* Profile Completion Bar */}
              <div className="mt-4 max-w-sm mx-auto sm:mx-0 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                    Profile Setup
                  </span>
                  <span className="text-xs font-bold text-slate-900">{totalProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00e5ff] to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2.5 shrink-0 w-full lg:w-44 mt-2 lg:mt-0">
            {statItems.map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl text-center hover:bg-white hover:shadow-xs transition-all">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
