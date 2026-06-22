import React, { useRef } from 'react';
import { Edit, Bell } from 'lucide-react';
import { isNotificationSupported } from '../../../../shared/services/notificationHelper';
import ApiService from '../../../../shared/services/api';

const ProfileTab = ({
  user,
  profile,
  editProfile,
  setEditProfile,
  handleProfileSave,
  avatarFileRef,
  isAvatarUploading,
  handleCounsellorAvatarUpload,
  permissionState,
  handleEnableNotifications,
  handleTestNotification,
  loadBookingsData
}) => {
  const shadowStyle = {
    background: '#ffffff',
    boxShadow: 'inset 0 0 0 1px rgba(11,20,36,0.05), 0 1px 3px rgba(11,20,36,0.04), 0 6px 20px -6px rgba(11,20,36,0.08)'
  };

  const ep = editProfile || profile;
  const setEp = (updater) => setEditProfile(prev => ({ ...(prev || profile), ...updater }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm">
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center">
        <h3 className="text-sm font-bold capitalize text-zinc-500">Consultant Psychologist Profile</h3>
        <span className="text-sm text-zinc-400 font-medium">Clinic Records</span>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex items-center gap-5 p-5 rounded-xl transition-all" style={shadowStyle}>
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 group-hover:border-brand/50 transition-colors shadow-sm">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                  <span className="text-zinc-400 font-bold text-2xl font-header">
                    {(() => { const c = (profile?.name || '').trim(); return c.length > 1 ? (c[0] + c[c.length - 1]).toUpperCase() : c.toUpperCase() || 'ST'; })()}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity cursor-pointer text-white backdrop-blur-[1px]"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-bold text-zinc-900">{profile.name || 'Unnamed Counsellor'}</p>
            <p className="text-xs text-zinc-500 font-medium">{user?.email || ''}</p>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCounsellorAvatarUpload(file);
              }}
            />
            <button
              type="button"
              disabled={isAvatarUploading}
              onClick={() => avatarFileRef.current?.click()}
              className="mt-2 px-3.5 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg cursor-pointer transition disabled:opacity-50 border border-zinc-200/50"
            >
              {isAvatarUploading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left font-medium p-5 rounded-xl transition-all" style={shadowStyle}>
          <div className="space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Display Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Sandra Tomy"
              value={ep.name || ''}
              onChange={(e) => setEp({ name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Education Credentials</label>
            <input
              type="text"
              placeholder="e.g. PhD Clinical Psychology"
              value={ep.education || ''}
              onChange={(e) => setEp({ education: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Session Fee (INR / Hour)</label>
            <input
              type="number"
              placeholder="1200"
              value={ep.price || ''}
              onChange={(e) => setEp({ price: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Languages Spoken</label>
            <input
              type="text"
              placeholder="Malayalam, English, Tamil"
              value={ep.lang || ''}
              onChange={(e) => setEp({ lang: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Therapy Hours</label>
            <input
              type="number"
              placeholder="0"
              value={ep.hours || 0}
              onChange={(e) => setEp({ hours: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Specialties (comma-separated)</label>
            <input
              type="text"
              placeholder="Anxiety, Relationship Dynamics, Career Stress"
              value={ep.specialties || ''}
              onChange={(e) => setEp({ specialties: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Default Google Meet Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={ep.defaultMeetLink || ''}
              onChange={(e) => setEp({ defaultMeetLink: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide block">Supported Session Modes</label>
            <div className="flex flex-wrap gap-4 pt-1">
              {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                const isSelected = ep.modes?.includes(mode);
                return (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm text-zinc-700 select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        let nextModes = [...(ep.modes || [])];
                        if (e.target.checked) {
                          if (!nextModes.includes(mode)) nextModes.push(mode);
                        } else {
                          nextModes = nextModes.filter(m => m !== mode);
                        }
                        setEp({ modes: nextModes });
                      }}
                      className="w-4 h-4 rounded border-zinc-300 text-brand focus:ring-brand/30 cursor-pointer accent-brand"
                    />
                    <span className="font-semibold">{mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-600 capitalize font-bold text-xs tracking-wide">Professional Bio</label>
            <textarea
              rows={4}
              placeholder="Describe your clinical expertise..."
              value={ep.bio || ''}
              onChange={(e) => setEp({ bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all resize-none"
            />
          </div>
          
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm capitalize rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>

      {/* Google Calendar Connection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-xl transition-all" style={shadowStyle}>
        <div className="space-y-1 text-left">
          <h4 className="text-sm font-bold text-zinc-900 capitalize">Google Calendar Sync</h4>
          <p className="text-xs text-zinc-500 font-medium">Automatically create Google Meet links for online bookings.</p>
        </div>
        {profile?.googleRefreshToken ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100">Connected ✅</span>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Are you sure you want to disconnect Google Calendar?")) {
                  try {
                    await ApiService.disconnectGoogleCalendar(user.id);
                    loadBookingsData();
                    import('react-hot-toast').then(mod => mod.toast.success('Disconnected'));
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 text-xs font-bold capitalize rounded-lg transition cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await ApiService.getGoogleAuthUrl(user.id);
                if (res.success && res.url) {
                  window.location.href = res.url;
                }
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold capitalize rounded-lg transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Connect Account
          </button>
        )}
      </div>

      {/* Browser Notification Settings Widget */}
      <div className="p-5 rounded-xl transition-all space-y-4" style={shadowStyle}>
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-header">Desktop Alerts & Reminders</h3>
            <p className="text-xs text-zinc-500 font-medium">Receive real-time notifications for client bookings.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                !isNotificationSupported()
                  ? 'bg-rose-500'
                  : permissionState === 'granted'
                    ? 'bg-emerald-500'
                    : permissionState === 'denied'
                      ? 'bg-rose-500'
                      : 'bg-zinc-400'
              }`} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                {!isNotificationSupported()
                  ? 'Not Supported'
                  : permissionState === 'granted'
                    ? 'Active / Enabled'
                    : permissionState === 'denied'
                      ? 'Blocked'
                      : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-lg">
              {!isNotificationSupported()
                ? 'Your browser does not support native desktop alerts.'
                : permissionState === 'granted'
                  ? 'You will receive native desktop notifications for session updates, confirmations, and alerts.'
                  : permissionState === 'denied'
                    ? 'Desktop notifications are blocked. Reset permission in your browser address bar to enable alerts.'
                    : 'Enable browser notifications to stay updated about your coaching schedules and session links.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {isNotificationSupported() && permissionState === 'default' && (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="min-h-[36px] px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 rounded-lg text-xs font-bold transition cursor-pointer border-none shadow-sm"
              >
                Enable Notifications
              </button>
            )}
            {isNotificationSupported() && permissionState === 'granted' && (
              <button
                type="button"
                onClick={handleTestNotification}
                className="min-h-[36px] px-4 py-2 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
              >
                Test Alert
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
