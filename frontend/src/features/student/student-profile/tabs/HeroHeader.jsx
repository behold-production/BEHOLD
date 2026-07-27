import React from 'react';
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
    { label: 'Upcoming', value: stats.upcoming },
    { label: 'Completed', value: stats.completed },
    { label: 'Guided Hours', value: `${stats.hours}h` },
  ];

  return (
    <div className="bg-white text-[#1c1514] border border-[#d6cecb] rounded-3xl shadow-xs overflow-hidden relative">
      <div className="h-1 bg-[#2b211e] w-full" />

      <div className="p-6 sm:p-7 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">

          {/* Left: Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-sm bg-[#eae4dc] ring-1 ring-[#d6cecb]"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#2b211e] border-2 border-white shadow-sm ring-1 ring-[#d6cecb] flex items-center justify-center text-[#f7f4ef] font-bold text-2xl sm:text-3xl uppercase">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-[#1c1514]/75 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[#f7f4ef] gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Update</span>
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-xs text-[#7c7069] font-bold mb-1 tracking-widest uppercase">
                {greeting}
              </p>
              <h1 className="text-2xl font-bold text-[#1c1514] tracking-tight">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>

              {/* Text-Only Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs font-semibold">
                {profile.grade && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#eae4dc] border border-[#d8d0c7] text-[#1c1514] text-[10px] font-bold uppercase tracking-wider">
                    Grade {profile.grade}
                  </span>
                )}
                {profile.schoolName && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#eae4dc] border border-[#d8d0c7] text-[#1c1514] text-[10px] font-bold uppercase tracking-wider max-w-[200px] truncate">
                    {profile.schoolName}
                  </span>
                )}
                <span className="inline-block px-3 py-1 rounded-full bg-[#2b211e] text-[#f7f4ef] text-[10px] font-bold uppercase tracking-widest shadow-2xs">
                  Verified Student
                </span>
              </div>

              {/* Contact Info */}
              <div className="mt-2.5 flex flex-wrap items-center gap-4 justify-center sm:justify-start text-xs text-slate-500 font-medium">
                <span className="truncate max-w-[220px] text-slate-700">{profile.email || user?.email || 'Add email'}</span>
                {profile.phone && (
                  <span className="text-slate-700">&middot; {profile.phone}</span>
                )}
              </div>

              {/* Completion Bar */}
              <div className="mt-3.5 max-w-xs mx-auto sm:mx-0 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-600 font-bold tracking-wide uppercase">
                    Profile Setup
                  </span>
                  <span className="text-xs font-bold text-slate-900">{totalProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats Summary Cards */}
          <div className="grid grid-cols-3 sm:flex lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto mt-2 lg:mt-0">
            {statItems.map((s, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg transition-all min-w-[120px]">
                <div className="text-center sm:text-left">
                  <p className="text-base font-bold text-slate-900 leading-tight">{s.value}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
