import React from 'react';
import { getInitials } from '../../utils/utils';

const HeroHeader = ({
  profile,
  user,
  displayName,
  greeting,
  handleProfilePicUpload
}) => {
  const avatarUrl = profile.profilePic || profile.profileImage || profile.avatar || profile.photoURL || profile.image || user?.profilePic || user?.profileImage || user?.avatar || user?.photoURL || user?.image;
  const joinDate = React.useMemo(() => new Date(profile.createdAt || user?.createdAt || '2025-01-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), [profile.createdAt, user?.createdAt]);

  return (
    <div className="card-grad-gradient border border-slate-700 rounded-3xl filter-card-shadow overflow-hidden relative">
      <div className="p-8 sm:p-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">

          {/* Left: Avatar & User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 flex-1 min-w-0 w-full">
            {/* Avatar with upload hover */}
            <div className="relative shrink-0 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-[3px] border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0f172a] border-[3px] border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center text-[#00e5ff] font-bold text-3xl uppercase">
                  {getInitials(profile.name, user?.name)}
                </div>
              )}
              <label className="absolute inset-0 rounded-full bg-slate-950/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[#00e5ff] gap-1">
                <span className="text-xs font-bold uppercase tracking-widest">Update</span>
                <input
                  type="file"
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 w-full py-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight truncate mb-2">
                {(displayName || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              
              <div className="text-[#00e5ff] font-bold text-sm tracking-wide mb-3 flex items-center justify-center sm:justify-start gap-2">
                Premium Member <span className="text-slate-600">•</span> Client ID: #BH-{profile._id?.slice(-5) || '89241'}
              </div>
              
              <div className="text-slate-400 font-medium text-sm">
                {profile.email || user?.email || 'Add email'} <span className="text-slate-600 px-2">•</span> Member since {joinDate}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto mt-4 lg:mt-8">
             <button onClick={() => window.location.href = '/booking'} className="w-full sm:w-auto px-8 py-3.5 primary-cyan-gradient text-slate-950 font-bold text-sm rounded-xl filter-glow hover:scale-105 transition-transform border-none cursor-pointer">
               + New Session
             </button>
             <button onClick={() => {
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('tab', 'details');
                window.history.pushState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
                window.dispatchEvent(new PopStateEvent('popstate'));
             }} className="w-full sm:w-auto px-8 py-3.5 bg-[#1e293b] text-white border border-slate-700 font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
               Edit Profile
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
