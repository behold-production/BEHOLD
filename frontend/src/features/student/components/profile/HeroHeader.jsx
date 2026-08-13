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
    <div className="bg-white text-[#0f172a] border border-slate-200 rounded-2xl shadow-xs overflow-hidden relative">
      <div className="h-1.5 bg-gradient-to-r from-[#00c9d6] via-cyan-400 to-emerald-400 w-full" />

      <div className="p-5 sm:p-7 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 sm:gap-8">

          {/* Left: Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 min-w-0 w-full">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-md bg-slate-100 ring-2 ring-slate-200/80"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 border-2 border-white shadow-md ring-2 ring-slate-200/80 flex items-center justify-center text-[#00c9d6] font-bold text-2xl sm:text-3xl uppercase">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-slate-950/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[#00c9d6] gap-0.5 shadow-sm">
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
              <p className="text-xs text-[#00c9d6] font-bold mb-1 tracking-widest uppercase flex items-center justify-center sm:justify-start gap-1.5">
                {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>

              {/* Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs font-semibold">
                {profile.grade && (
                  <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold">
                    Grade {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold max-w-[220px] truncate">
                    {profile.schoolName}
                  </span>
                )}
                <span className="inline-block px-3.5 py-1 rounded-xl bg-slate-900 text-white font-bold text-xs border border-slate-800 shadow-2xs">
                  Verified User
                </span>
              </div>

              {/* Contact Info */}
              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 justify-center sm:justify-start text-xs sm:text-sm text-slate-600 font-medium">
                <span className="truncate max-w-[240px] text-slate-800 font-semibold">{profile.email || user?.email || 'Add email'}</span>
                {profile.phone && (
                  <span className="text-slate-700 font-semibold">&middot; {profile.phone}</span>
                )}
              </div>

              {/* Completion Bar */}
              <div className="mt-4 max-w-sm mx-auto sm:mx-0 bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-600 font-bold tracking-wider uppercase">
                    Profile Setup
                  </span>
                  <span className="text-xs font-bold text-slate-900">{totalProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/90 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-500"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats Summary Cards (Clean equal 3-column grid) */}
          <div className="grid grid-cols-3 lg:flex lg:flex-col gap-3 sm:gap-4 shrink-0 w-full lg:w-48 mt-2 lg:mt-0">
            {statItems.map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-xl text-center transition-all shadow-2xs hover:bg-slate-100/80">
                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-none mb-1">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
