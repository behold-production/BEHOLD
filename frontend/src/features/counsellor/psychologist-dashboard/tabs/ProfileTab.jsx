import React, { useRef, useState, useEffect } from 'react';
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
    background: '#18181b', // zinc-900
    border: '1px solid #27272a', // zinc-800
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4), 0 6px 20px -6px rgba(0,0,0,0.6)'
  };

  const ep = editProfile || profile;
  const setEp = (updater) => setEditProfile(prev => ({ ...(prev || profile), ...updater }));

  const [searchQuery, setSearchQuery] = useState(ep.locationName || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3 || searchQuery === ep.locationName) {
      const timer = setTimeout(() => {
        setSearchResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, ep.locationName]);

  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
      if (data.length === 0) {
        import('react-hot-toast').then(m => m.toast.error("No locations found."));
      }
    } catch (err) {
      console.error("Geocoding error", err);
      import('react-hot-toast').then(m => m.toast.error("Failed to search location."));
    } finally {
      setIsSearching(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      import('react-hot-toast').then(m => m.toast.error("Geolocation not supported."));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setEp({
              latitude: lat,
              longitude: lng,
              locationName: data.display_name
            });
            setSearchQuery(data.display_name);
          } else {
            setEp({ latitude: lat, longitude: lng });
          }
        } catch (err) {
          console.error("Reverse geocoding error", err);
          setEp({ latitude: lat, longitude: lng });
        }
        import('react-hot-toast').then(m => m.toast.success("Location auto-detected!"));
        setIsLocating(false);
      },
      (err) => {
        import('react-hot-toast').then(m => m.toast.error("Failed to detect coordinates: " + err.message));
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-sm">
      <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
        <h3 className="text-sm font-bold capitalize text-zinc-500 font-header">Consultant Psychologist Profile</h3>
        <span className="text-sm text-zinc-500 font-medium">Clinic Records</span>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex items-center gap-5 p-5 rounded-[10px] transition-all" style={shadowStyle}>
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-[10px] overflow-hidden border border-zinc-800 group-hover:border-brand/50 transition-colors shadow-sm">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                  <span className="text-zinc-500 font-bold text-2xl font-header">
                    {(() => { const c = (profile?.name || '').trim(); return c.length > 1 ? (c[0] + c[c.length - 1]).toUpperCase() : c.toUpperCase() || 'ST'; })()}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 opacity-0 group-hover:opacity-100 rounded-[10px] transition-opacity cursor-pointer text-white backdrop-blur-[1px]"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 space-y-1.5 text-left">
            <p className="text-sm font-bold text-white">{profile.name || 'Unnamed Counsellor'}</p>
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
              className="mt-2 px-3.5 py-1.5 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-[10px] cursor-pointer transition disabled:opacity-50 border border-zinc-800"
            >
              {isAvatarUploading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left font-medium p-5 rounded-[10px] transition-all" style={shadowStyle}>
          <div className="space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Display Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Sandra Tomy"
              value={ep.name || ''}
              onChange={(e) => setEp({ name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Education Credentials</label>
            <input
              type="text"
              placeholder="e.g. PhD Clinical Psychology"
              value={ep.education || ''}
              onChange={(e) => setEp({ education: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Session Fee (INR / Hour)</label>
            <input
              type="number"
              placeholder="1200"
              value={ep.price || ''}
              onChange={(e) => setEp({ price: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Languages Spoken</label>
            <input
              type="text"
              placeholder="Malayalam, English, Tamil"
              value={ep.lang || ''}
              onChange={(e) => setEp({ lang: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Therapy Hours</label>
            <input
              type="number"
              placeholder="0"
              value={ep.hours || 0}
              onChange={(e) => setEp({ hours: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Specialties (comma-separated)</label>
            <input
              type="text"
              placeholder="Anxiety, Relationship Dynamics, Career Stress"
              value={ep.specialties || ''}
              onChange={(e) => setEp({ specialties: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Default Google Meet Link</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={ep.defaultMeetLink || ''}
              onChange={(e) => setEp({ defaultMeetLink: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
            />
          </div>

          <div className="sm:col-span-2 space-y-4 p-5 bg-zinc-900 border border-zinc-800 rounded-[10px]">
            <h4 className="text-xs font-bold text-brand uppercase tracking-wider">Practice / Geographic Location</h4>
            
            {/* Search address input */}
            <div className="space-y-1.5 text-left relative">
              <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide block">Search Location Address</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Type an address to search... (e.g. Kozhikode, Kerala)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddressSearch();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching}
                  className="w-full sm:w-auto px-4 py-2.5 bg-brand text-zinc-955 text-xs font-extrabold rounded-[10px] hover:bg-brand-dark transition cursor-pointer shrink-0 flex items-center justify-center"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-[10px] max-h-48 overflow-y-auto z-50 shadow-xl divide-y divide-zinc-850">
                  {searchResults.map((res, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setEp({
                          locationName: res.display_name,
                          latitude: parseFloat(res.lat) || 0,
                          longitude: parseFloat(res.lon) || 0
                        });
                        setSearchQuery(res.display_name);
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-850 transition-colors block truncate"
                    >
                      {res.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">
                Clinic / Center / Office Address {(ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && <span className="text-rose-500 font-bold">*</span>}
              </label>
              <input
                type="text"
                placeholder="e.g. 123 Main St, Calicut, Kerala"
                value={ep.locationName || ''}
                onChange={(e) => {
                  setEp({ locationName: e.target.value });
                  setSearchQuery(e.target.value);
                }}
                className={`w-full px-3.5 py-2.5 bg-zinc-950 border text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all ${
                  (ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && !ep.locationName?.trim()
                    ? 'border-rose-800 focus:border-rose-600'
                    : 'border-zinc-800'
                }`}
              />
              {(ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && !ep.locationName?.trim() && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  * Address is required for Offline (At center) / Doorstep sessions.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">
                  Latitude {(ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && <span className="text-rose-500 font-bold">*</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 11.2588"
                  value={ep.latitude || ''}
                  onChange={(e) => setEp({ latitude: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all ${
                    (ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && !ep.latitude
                      ? 'border-rose-800 focus:border-rose-600'
                      : 'border-zinc-800'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">
                  Longitude {(ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && <span className="text-rose-500 font-bold">*</span>}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 75.7804"
                  value={ep.longitude || ''}
                  onChange={(e) => setEp({ longitude: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2.5 bg-zinc-950 border text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all ${
                    (ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && !ep.longitude
                      ? 'border-rose-800 focus:border-rose-600'
                      : 'border-zinc-800'
                  }`}
                />
              </div>
            </div>
            {(ep.modes?.includes('OFFLINE') || ep.modes?.includes('DOOR_STEP')) && (!ep.latitude || !ep.longitude) && (
              <p className="text-[11px] text-rose-500 font-semibold mt-1">
                * Coordinates are required. Please select a search result or use "Detect My Location".
              </p>
            )}
            <button
              type="button"
              disabled={isLocating}
              onClick={handleDetectLocation}
              className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-305 text-xs font-bold capitalize rounded-[10px] transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <div className="w-3 h-3 border border-zinc-400 border-t-brand rounded-full animate-spin" />
                  Auto-Locating...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Detect My Location & Address
                </>
              )}
            </button>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide block">Supported Session Modes</label>
            <div className="flex flex-wrap gap-4 pt-1">
              {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                const isSelected = ep.modes?.includes(mode);
                let siteSettings = {};
                try {
                  const stored = localStorage.getItem('behold_site_settings');
                  if (stored) siteSettings = JSON.parse(stored);
                } catch (e) {}
                const isGloballyEnabled = 
                  mode === 'ONLINE' ? siteSettings.enableOnline !== false :
                  mode === 'OFFLINE' ? siteSettings.enableOffline !== false :
                  mode === 'DOOR_STEP' ? siteSettings.enableDoorstep !== false : true;
                return (
                  <label key={mode} className={`flex items-center gap-2 text-sm select-none ${isGloballyEnabled ? 'cursor-pointer text-zinc-300' : 'cursor-not-allowed text-zinc-500'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected && isGloballyEnabled}
                      disabled={!isGloballyEnabled}
                      onChange={(e) => {
                        let nextModes = [...(ep.modes || [])];
                        if (e.target.checked) {
                          if (!nextModes.includes(mode)) nextModes.push(mode);
                        } else {
                          nextModes = nextModes.filter(m => m !== mode);
                        }
                        setEp({ modes: nextModes });
                      }}
                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="font-semibold">
                      {mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                      {!isGloballyEnabled && <span className="text-[10px] text-red-500 font-bold ml-1">(Paused by Admin)</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">
              Razorpay Linked Account ID (for split payouts)
            </label>
            <input
              type="text"
              placeholder="e.g. acc_N1z829Snd023"
              value={ep.razorpayAccountId || ''}
              onChange={(e) => setEp({ razorpayAccountId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all font-semibold"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Required to receive direct split payouts. Create a linked account in your Razorpay Dashboard.
            </p>
          </div>

          <div className="sm:col-span-2 border-t border-zinc-850 pt-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Bank Account Details (Alternative / Payout Repay)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Doe"
                  value={ep.bankAccountName || ''}
                  onChange={(e) => setEp({ bankAccountName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 5010023485938"
                  value={ep.bankAccountNumber || ''}
                  onChange={(e) => setEp({ bankAccountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">IFSC Code</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000123"
                  value={ep.bankIfscCode || ''}
                  onChange={(e) => setEp({ bankIfscCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-zinc-400 capitalize font-bold text-xs tracking-wide">Professional Bio</label>
            <textarea
              rows={4}
              placeholder="Describe your clinical expertise..."
              value={ep.bio || ''}
              onChange={(e) => setEp({ bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 text-sm text-white rounded-[10px] outline-none focus:border-brand transition-all resize-none"
            />
          </div>
          
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize rounded-[10px] transition-colors cursor-pointer border-none shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>

      {/* Google Calendar Connection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-[10px] transition-all" style={shadowStyle}>
        <div className="space-y-1 text-left">
          <h4 className="text-sm font-bold text-white capitalize">Google Calendar Sync</h4>
          <p className="text-xs text-zinc-500 font-medium">Automatically create Google Meet links for online bookings.</p>
        </div>
        {profile?.googleRefreshToken ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-450 font-bold capitalize flex items-center gap-1 bg-emerald-955/20 px-3 py-1.5 rounded-[10px] border border-emerald-900/30">Connected ✅</span>
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
              className="px-3.5 py-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 border border-rose-900/30 text-xs font-bold capitalize rounded-[10px] transition cursor-pointer"
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
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold capitalize rounded-[10px] transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Connect Account
          </button>
        )}
      </div>

      {/* Browser Notification Settings Widget */}
      <div className="p-5 rounded-[10px] transition-all space-y-4" style={shadowStyle}>
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 text-left">
          <div className="w-10 h-10 rounded-[10px] bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-header">Desktop Alerts & Reminders</h3>
            <p className="text-xs text-zinc-500 font-medium">Receive real-time notifications for client bookings.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-[10px] border border-zinc-800/60 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                !isNotificationSupported()
                  ? 'bg-rose-500'
                  : permissionState === 'granted'
                    ? 'bg-emerald-500'
                    : permissionState === 'denied'
                      ? 'bg-rose-500'
                      : 'bg-zinc-600'
              }`} />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-450">
                {!isNotificationSupported()
                  ? 'Not Supported'
                  : permissionState === 'granted'
                    ? 'Active / Enabled'
                    : permissionState === 'denied'
                      ? 'Blocked'
                      : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-zinc-550 font-medium leading-relaxed max-w-lg">
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
                className="min-h-[36px] px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 rounded-[10px] text-xs font-bold transition cursor-pointer border-none shadow-md"
              >
                Enable Notifications
              </button>
            )}
            {isNotificationSupported() && permissionState === 'granted' && (
              <button
                type="button"
                onClick={handleTestNotification}
                className="min-h-[36px] px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-355 hover:text-white hover:bg-zinc-800 rounded-[10px] text-xs font-bold transition cursor-pointer shadow-sm"
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
