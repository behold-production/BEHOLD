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

  return (
    <div className="card-luxury border-none rounded-2xl shadow-sm overflow-hidden">
      {/* Top accent strip */}
      <div className="h-1 bg-brand w-full" />

      <div className="p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0 group">
            {profile.profilePic || user?.profilePic || user?.image ? (
              <img
                src={profile.profilePic || user?.profilePic || user?.image}
                alt={displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xl sm:text-2xl">
                {getInitials(profile.name, user?.name)}
              </div>
            )}
            <label className="absolute inset-0 rounded-2xl bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
              <Plus className="w-5 h-5 text-white" />
              <input
                type="file"
                onChange={handleProfilePicUpload}
                accept="image/*"
                className="hidden"
              />
            </label>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs text-zinc-400 font-medium mb-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
              <Sun className="w-3 h-3" /> {greeting}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              {displayName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start text-xs text-zinc-500">
              {profile.grade && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                  <GraduationCap className="w-3 h-3" /> {profile.grade}
                </span>
              )}
              {profile.schoolName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 max-w-[180px] truncate">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span className="truncate">{profile.schoolName}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                <Shield className="w-3 h-3" /> Verified
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start text-xs text-zinc-500">
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[180px]">{profile.email || user?.email || 'Add email'}</span>
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.phone}
                </span>
              )}
            </div>

            {/* Profile progress */}
            <div className="mt-3 max-w-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-zinc-400 font-medium capitalize ">Profile completion</span>
                <span className="text-xs font-semibold text-zinc-600">{totalProgress}%</span>
              </div>
              <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-700"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            {[
              { label: 'Upcoming', value: stats.upcoming },
              { label: 'Completed', value: stats.completed },
              { label: 'Hours', value: `${stats.hours}h` },
            ].map((s, i) => (
              <div key={i} className="text-center px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl min-w-[72px]">
                <p className="text-base font-bold text-zinc-900">{s.value}</p>
                <p className="text-xs text-zinc-500 font-medium capitalize ">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
