import React from 'react';
import {
  User, GraduationCap, Users, Shield, Mail, Phone,
  BookOpen, Hash, Check, AlertCircle, Bell, Save, CheckCircle2,
  MapPin, Navigation, Search
} from 'lucide-react';
import { isNotificationSupported } from '../../../../shared/services/notificationHelper';

const ProfileDetailsTab = ({
  completion,
  handleSave,
  formData,
  handleChange,
  errors,
  permissionState,
  handleEnableNotifications,
  handleTestNotification,
  handleDiscard,
  isSaving,
  isSaved
}) => {
  const [prevLocationName, setPrevLocationName] = React.useState(formData.locationName);
  const [searchQuery, setSearchQuery] = React.useState(formData.locationName || '');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);

  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3 || searchQuery === formData.locationName) {
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
  }, [searchQuery, formData.locationName]);

  if (formData.locationName !== prevLocationName) {
    setPrevLocationName(formData.locationName);
    setSearchQuery(formData.locationName || '');
  }

  const setLocationFields = (locationName, latitude, longitude) => {
    handleChange({ target: { name: 'locationName', value: locationName } });
    handleChange({ target: { name: 'latitude', value: latitude } });
    handleChange({ target: { name: 'longitude', value: longitude } });
  };

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
            setLocationFields(data.display_name, lat, lng);
            setSearchQuery(data.display_name);
          } else {
            setLocationFields('', lat, lng);
          }
        } catch (err) {
          console.error("Reverse geocoding error", err);
          setLocationFields('', lat, lng);
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

  const sections = [
    {
      title: 'Personal Info',
      icon: User,
      hint: 'Used for booking and contact',
      accentColor: '#3b82f6',
      accentBg: '#eff6ff',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name', required: true, icon: User },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'name@email.com', required: true, icon: Mail, autoComplete: 'email', disabled: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. 8086664001', required: true, icon: Phone, autoComplete: 'tel' },
      ],
    },
    {
      title: 'Academic Details',
      icon: GraduationCap,
      hint: 'Optional but recommended',
      accentColor: '#8b5cf6',
      accentBg: '#f5f3ff',
      fields: [
        { name: 'schoolName', label: 'School Name', type: 'text', placeholder: 'Name of your school', required: false, icon: BookOpen },
        { name: 'grade', label: 'Grade / Class', type: 'select', options: ['', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'], required: false, icon: Hash },
        { name: 'groupCode', label: 'Group / School Code', type: 'text', placeholder: 'e.g. BEHOLD-CDAT-2026', required: false, icon: Hash },
      ],
    },
    {
      title: 'Guardian Information',
      icon: Users,
      hint: 'For students under 18',
      accentColor: '#10b981',
      accentBg: '#ecfdf5',
      fields: [
        { name: 'guardianName', label: 'Parent / Guardian Name', type: 'text', placeholder: 'Name of parent or guardian', required: true, icon: User },
        { name: 'guardianPhone', label: 'Guardian Phone', type: 'tel', placeholder: 'Guardian mobile number', required: false, icon: Phone, autoComplete: 'tel' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-surface-900 tracking-tight">My Profile</h2>
          <p className="text-sm text-surface-500 mt-0.5">Keep your details up to date.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black">
          <Shield className="w-3.5 h-3.5" /> Saved securely in Cloud
        </div>
      </div>

      {/* Progress — gradient bar */}
      <div
        className="rounded-[10px] p-5 bg-white border border-surface-200 shadow-square-light"
      >
        <div className="flex items-center justify-between mb-3">

          <div>
            <p className="text-sm font-black text-surface-900">Profile Strength</p>
            <p className="text-xs text-surface-500 mt-0.5">
              {completion < 50 ? 'Fill in more fields to strengthen your profile.' :
                completion < 100 ? 'Almost complete — just a few more fields.' :
                  '🎉 Your profile is complete!'}
            </p>
          </div>
          <span
            className="text-2xl font-black tracking-tight"
            style={{ color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#f43f5e' }}
          >{completion}%</span>
        </div>
        <div className="h-2 w-full bg-surface-100 rounded-[10px] overflow-hidden">
          <div
            className="h-full rounded-[10px] transition-all duration-700"
            style={{
              width: `${completion}%`,
              background: completion >= 80
                ? '#10b981'
                : completion >= 50
                  ? '#f59e0b'
                  : '#f43f5e'
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">0%</span>
          <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">100% Complete</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pb-24 lg:pb-16">
        {sections.map((section, sIdx) => {
          const SIcon = section.icon;
          return (
            <div
              key={sIdx}
              className="relative overflow-hidden rounded-[10px] p-5 border border-surface-200 bg-white shadow-square-light"
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-4 bottom-4 w-1 rounded-[10px]" style={{ background: section.accentColor }} />
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-surface-100 pl-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: section.accentBg, border: `1px solid ${section.accentColor}25` }}>
                  <SIcon className="w-[18px] h-[18px]" style={{ color: section.accentColor }} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-surface-900">{section.title}</h3>
                  <p className="text-xs text-surface-500 mt-0.5">{section.hint}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map(field => {
                  const FIcon = field.icon;
                  const hasError = !!errors[field.name];
                  const hasValue = !!formData[field.name];
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label htmlFor={`sp-${field.name}`} className="text-[10px] uppercase tracking-widest text-surface-600 font-bold flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="relative">
                        {FIcon && (
                          <FIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${hasError ? 'text-rose-400' : hasValue ? 'text-surface-600' : 'text-surface-300'
                            }`} />
                        )}
                        {field.type === 'select' ? (
                          <select
                            id={`sp-${field.name}`}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 border text-sm text-surface-900 font-medium rounded-[10px] outline-none transition-all appearance-none cursor-pointer ${hasError
                              ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                              : 'bg-surface-50 border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white'
                              }`}
                          >
                            {field.options.map((o, i) => (
                              <option key={i} value={o}>{o || 'Select ' + field.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`sp-${field.name}`}
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
                            disabled={field.disabled}
                            className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 text-sm font-medium rounded-[10px] outline-none transition-all ${field.disabled
                                ? 'bg-surface-100 border-surface-200 text-surface-500 cursor-not-allowed'
                                : hasError
                                  ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10 text-surface-900'
                                  : 'bg-surface-50 border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white text-surface-900'
                              }`}
                          />
                        )}
                        {hasValue && !hasError && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                          </div>
                        )}
                        {hasError && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          </div>
                        )}
                      </div>
                      {hasError ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1" role="alert">
                          <AlertCircle className="w-3 h-3" /> {errors[field.name]}
                        </p>
                      ) : (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-surface-400">{field.required ? 'Required' : 'Optional'}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Home Location & Address Card */}
        <div
          className="relative overflow-hidden rounded-[10px] p-5 border border-surface-200 bg-white shadow-square-light"
        >
          {/* Left accent border */}
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-[10px] bg-amber-500" />
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-surface-100 pl-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-amber-55/20 border border-amber-200/25">
                <MapPin className="w-[18px] h-[18px] text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-surface-900">Home Location & Address</h3>
                <p className="text-xs text-surface-500 mt-0.5">Used for calculating doorstep session booking feasibility (10 km limit)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="min-h-[32px] inline-flex items-center gap-1 px-3 py-1 bg-surface-900 hover:bg-surface-800 text-white rounded-[10px] uppercase tracking-widest text-[10px] font-black transition cursor-pointer border-none shadow-none disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Locating...' : 'Detect Location'}
            </button>
          </div>

          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Address Search Autocomplete Input */}
            <div className="space-y-1.5 text-left relative">
              <label htmlFor="student-location-search" className="text-[10px] uppercase tracking-widest text-surface-600 font-bold flex items-center gap-1">
                Search Home Address
              </label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    id="student-location-search"
                    type="text"
                    placeholder="Type to search and select your address... (e.g. Kozhikode, Kerala)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-9 py-2.5 text-sm font-medium rounded-[10px] outline-none transition-all bg-surface-50 border border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white text-surface-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddressSearch();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white text-[10px] uppercase tracking-widest font-black rounded-[10px] transition cursor-pointer border-none shadow-none"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-surface-200 rounded-[10px] max-h-48 overflow-y-auto z-50 shadow-xl divide-y divide-surface-100">
                  {searchResults.map((res, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setLocationFields(res.display_name, parseFloat(res.lat) || 0, parseFloat(res.lon) || 0);
                        setSearchQuery(res.display_name);
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-surface-700 hover:text-surface-900 hover:bg-surface-50 transition-colors block truncate border-none cursor-pointer"
                    >
                      {res.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Read/Write Coordinates Form Fields */}
            <div className="space-y-1.5">
              <label htmlFor="sp-locationName" className="text-[10px] uppercase tracking-widest text-surface-600 font-bold">Selected / Current Address</label>
              <input
                id="sp-locationName"
                type="text"
                name="locationName"
                placeholder="Selected address details"
                value={formData.locationName || ''}
                onChange={(e) => {
                  handleChange(e);
                  setSearchQuery(e.target.value);
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-[10px] outline-none transition-all bg-surface-50 border border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white text-surface-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sp-latitude" className="text-[10px] uppercase tracking-widest text-surface-600 font-bold">Latitude</label>
                <input
                  id="sp-latitude"
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="e.g., 11.2588"
                  value={formData.latitude || ''}
                  onChange={(e) => handleChange({ target: { name: 'latitude', value: parseFloat(e.target.value) || 0 } })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-[10px] outline-none transition-all bg-surface-50 border border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white text-surface-900"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sp-longitude" className="text-[10px] uppercase tracking-widest text-surface-600 font-bold">Longitude</label>
                <input
                  id="sp-longitude"
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="e.g., 75.7804"
                  value={formData.longitude || ''}
                  onChange={(e) => handleChange({ target: { name: 'longitude', value: parseFloat(e.target.value) || 0 } })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-medium rounded-[10px] outline-none transition-all bg-surface-50 border border-surface-200 focus:border-surface-900 focus:ring-0 focus:bg-white text-surface-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Browser Notification Settings Widget */}
        <div className="bg-white border border-surface-200 shadow-square-light rounded-[10px] p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-100">
            <div className="w-8 h-8 rounded-[10px] bg-surface-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-surface-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-surface-900">Desktop Alerts & Reminders</h3>
              <p className="text-xs text-surface-500">Receive real-time notifications for booking updates and messages</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-50 p-4 rounded-[10px] border border-surface-200 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-[10px] ${
                  !isNotificationSupported()
                    ? 'bg-rose-500'
                    : permissionState === 'granted'
                      ? 'bg-emerald-500 animate-pulse'
                      : permissionState === 'denied'
                        ? 'bg-rose-500'
                        : 'bg-surface-400'
                }`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-700">
                  {!isNotificationSupported()
                    ? 'Not Supported'
                    : permissionState === 'granted'
                      ? 'Active / Enabled'
                      : permissionState === 'denied'
                        ? 'Blocked'
                        : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-surface-500 font-medium leading-relaxed">
                {!isNotificationSupported()
                  ? 'Your browser does not support native desktop alerts.'
                  : permissionState === 'granted'
                    ? 'You will receive native desktop notifications for session updates, confirmations, and alerts.'
                    : permissionState === 'denied'
                      ? 'Desktop notifications are blocked. Reset permission in your browser address bar to enable alerts.'
                      : 'Enable browser notifications to stay updated about your coaching schedules and session links.'}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {isNotificationSupported() && permissionState === 'default' && (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="min-h-[36px] px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-[10px] text-[10px] uppercase tracking-widest font-black transition cursor-pointer border-none shadow-none"
                >
                  Enable Notifications
                </button>
              )}
              {isNotificationSupported() && permissionState === 'granted' && (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="min-h-[36px] px-4 py-2 bg-surface-50 border border-surface-200 text-surface-900 hover:bg-surface-100 rounded-[10px] text-[10px] uppercase tracking-widest font-black transition cursor-pointer shadow-none"
                >
                  Test Alert Notification
                </button>
              )}
              {isNotificationSupported() && permissionState === 'denied' && (
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest bg-rose-50 border border-rose-100 p-2 rounded-[10px] block max-w-[200px]">
                  🔒 Unblock in browser site settings
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-[72px] lg:bottom-0 z-30 flex items-center justify-end gap-2 p-3 bg-white border-t border-surface-200 rounded-[10px] shadow-square-light">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="min-h-[40px] px-4 py-2 border border-surface-200 hover:border-surface-300 rounded-[10px] text-[10px] uppercase tracking-widest font-black text-surface-900 hover:bg-surface-50 transition-colors bg-white shadow-none disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-5 py-2 bg-surface-900 hover:bg-surface-800 disabled:bg-surface-500 text-white text-[10px] uppercase tracking-widest font-black rounded-[10px] shadow-none transition-colors border-none"
          >
            {isSaving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><Save className="w-3.5 h-3.5" />Save Changes</>
            )}
          </button>
        </div>
      </form>

      {isSaved && (
        <div className="fixed bottom-[90px] lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-surface-900 text-white rounded-[10px] shadow-xl" role="status">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] uppercase tracking-widest font-black">Profile saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ProfileDetailsTab;
