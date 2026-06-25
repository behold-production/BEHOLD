import React, { useEffect, useState } from 'react';
import { ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, GraduationCap } from 'lucide-react';
import ApiService from '../../shared/services/api';

function getInitials(name) {
  if (!name) return 'EX';
  const clean = name.trim();
  if (clean.length === 0) return 'EX';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words[0].toUpperCase();
}

export default function AdvisorProfile({ advisorId, onBack, onBook }) {
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);

  const siteSettings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
  const enablePsychology = siteSettings.enablePsychology !== false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [advisorId]);

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        setLoading(true);
        const res = await ApiService.getCounsellorDetails(advisorId);
        if (res.success && res.data) {
          const psy = res.data;
          
          let nextAvailable = 'No Active Days';
          if (psy.availability && psy.availability.activeDays) {
            const daysMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
            const activeDaysList = Object.keys(psy.availability.activeDays)
              .filter(d => psy.availability.activeDays[d])
              .map(d => daysMap[d]);
            if (activeDaysList.length > 0) {
              nextAvailable = `Available: ${activeDaysList.join(', ')}`;
            }
          }

          const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
          const rawModes = psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
          const filteredModes = rawModes.filter(m => {
            if (m === 'ONLINE') return settings.enableOnline !== false;
            if (m === 'OFFLINE') return settings.enableOffline !== false;
            if (m === 'DOOR_STEP') return settings.enableDoorstep !== false;
            return true;
          });

          setAdvisor({
            id: psy._id || psy.id,
            name: psy.name,
            profilePic: psy.profilePic || '',
            role: 'Consultant Psychologist',
            specialties: Array.isArray(psy.specialties) ? psy.specialties : ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'],
            hours: psy.completedHours || 0, // Mock hours
            lang: psy.lang || 'English',
            price: Number(psy.price) || 1200,
            nextAvailable: nextAvailable,
            education: psy.education || 'MPhil Clinical Psychology',
            bio: psy.experience || 'Dedicated consultant psychologist.',
            type: 'counselling',
            modes: filteredModes
          });
        }
      } catch (err) {
        console.error("Failed to load advisor details", err);
      } finally {
        setLoading(false);
      }
    };

    if (advisorId) {
      fetchAdvisor();
    }
  }, [advisorId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-zinc-50 flex items-center justify-center px-4">
        <p className="text-zinc-600 font-bold">Loading therapist profile...</p>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-zinc-50 text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">Therapist Not Found</h2>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-16 animate-in fade-in duration-500">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-80 w-full bg-brand overflow-hidden">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-20 md:top-32 left-4 md:left-10 z-10 min-h-[44px] flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold capitalize  transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Experts
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-12 md:-mt-32">
        {/* Profile Card Main */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4.5 sm:p-6 md:p-10 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-900 shrink-0 overflow-hidden">
              {advisor.profilePic ? (
                <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl sm:text-6xl md:text-8xl font-black">{getInitials(advisor.name)}</span>
              )}
            </div>

            {/* Title & Info */}
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-bold capitalize  rounded-md">
                    Verified Expert
                  </span>
                  <span className="flex items-center gap-1 text-xs sm:text-xs font-bold text-zinc-500 capitalize">
                    <MapPin className="w-3.5 h-3.5" /> {advisor.modes ? advisor.modes.map(m => m === 'DOOR_STEP' ? 'Doorstep' : m.charAt(0) + m.slice(1).toLowerCase()).join(' & ') : 'Online & Doorstep'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black text-zinc-900 tracking-tight leading-none capitalize">
                  {advisor.name}
                </h1>
                <p className="text-sm sm:text-lg text-zinc-650 font-semibold mt-1">{advisor.role}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold capitalize  mb-1">Therapy Hours</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900">
                    <Clock className="w-4 h-4 text-brand" /> {advisor.hours}+
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200" aria-hidden="true"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold capitalize  mb-1">Languages</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900">
                    <Globe className="w-4 h-4 text-brand" /> {advisor.lang}
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200" aria-hidden="true"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold capitalize  mb-1">Session Fee</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900">
                    ₹{advisor.price.toLocaleString('en-IN')} / hr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          
          {/* Left Column: Details */}
          <div className={enablePsychology ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
            
            {/* About Section */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <BookOpen className="w-5 h-5 text-brand" />
                <h3 className="text-sm sm:text-lg font-bold capitalize tracking-wide">About {advisor.name.split(' ')[0]}</h3>
              </div>
              <p className="text-zinc-600 leading-relaxed text-xs sm:text-sm md:text-base font-light">
                {advisor.bio}
              </p>
            </div>

            {/* Specializations */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-zinc-900">
                <Heart className="w-5 h-5 text-brand" />
                <h3 className="text-sm sm:text-lg font-bold capitalize tracking-wide">Core Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {advisor.specialties.map((spec, i) => (
                  <div key={i} className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <span className="text-xs font-bold text-zinc-900">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Qualifications */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <Award className="w-5 h-5 text-brand" />
                <h3 className="text-sm sm:text-lg font-bold capitalize tracking-wide">Qualifications</h3>
              </div>
              <div className="flex items-start gap-4 p-4 border border-zinc-200 rounded-lg bg-white">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 text-zinc-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex items-center">
                  <h4 className="font-bold text-sm sm:text-base text-zinc-900">{advisor.education}</h4>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          {enablePsychology && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-32 bg-white p-5 sm:p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4 sm:space-y-6">

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 capitalize tracking-wide mb-1">Book a Session</h3>
                  <p className="text-xs text-zinc-650">Schedule your 1-hour session directly with {advisor.name.split(' ')[0]}.</p>
                </div>

                <div className="p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs sm:text-sm">
                    <span className="text-zinc-600 font-semibold shrink-0">Next Available</span>
                    <span className="font-semibold text-brand bg-brand-light border border-brand/20 px-2 py-0.5 rounded-md text-xs sm:text-xs">{advisor.nextAvailable}</span>
                  </div>
                  <div className="w-full h-px bg-zinc-200" aria-hidden="true"></div>
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-zinc-600 font-semibold shrink-0">Session Fee</span>
                    <span className="font-semibold text-zinc-900">₹{advisor.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBook(advisorId)}
                  className="min-h-[48px] w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold capitalize  shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Book Now
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
