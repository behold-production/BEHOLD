import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, GraduationCap } from 'lucide-react';

export default function AdvisorProfile({ advisorId, onBack, onBook }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [advisorId]);

  const getDynamicAdvisorDetails = (id) => {
    let foundAdvisor = null;
    
    // 1. Gather all registered psychologists
    let registeredPsychologists = [];
    try {
      const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
      registeredPsychologists = users.filter(u => u.role === 'PSYCHOLOGIST' && u.role !== 'ADMIN' && u.email !== 'admin@behold.com' && u.verified !== false);
    } catch (e) {
      console.error("Failed to load registered users", e);
    }

    // 2. Find matching psychologist
    const psy = registeredPsychologists.find(u => u.id === id);
    if (psy) {
      foundAdvisor = {
        id: psy.id,
        name: psy.name,
        role: 'Consultant Psychologist',
        specialties: ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'],
        hours: 0,
        lang: 'English',
        price: 1200,
        nextAvailable: 'Available Today',
        education: 'MPhil Clinical Psychology',
        bio: 'Dedicated consultant psychologist.',
        type: 'counselling',
        modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
      };
    }

    // 3. Resolve profile details dynamically
    if (foundAdvisor) {
      const savedProfile = localStorage.getItem(`behold_advisor_profile_${foundAdvisor.id}`);
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          const specialtiesArray = typeof profile.specialties === 'string'
            ? profile.specialties.split(',').map(s => s.trim()).filter(Boolean)
            : profile.specialties || foundAdvisor.specialties;

          foundAdvisor.name = profile.name || foundAdvisor.name;
          foundAdvisor.role = profile.role || foundAdvisor.role;
          foundAdvisor.education = profile.education || foundAdvisor.education;
          foundAdvisor.specialties = specialtiesArray;
          foundAdvisor.price = (profile.price !== undefined && profile.price !== '') ? Number(profile.price) : foundAdvisor.price;
          foundAdvisor.lang = profile.lang || foundAdvisor.lang;
          foundAdvisor.bio = profile.bio || foundAdvisor.bio;
          foundAdvisor.defaultMeetLink = profile.defaultMeetLink || '';
          foundAdvisor.modes = profile.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
          if (profile.hours !== undefined && profile.hours !== '') {
            foundAdvisor.hours = Number(profile.hours);
          }
        } catch (e) {
          console.error("Error parsing saved profile details", e);
        }
      }

      const savedAvailability = localStorage.getItem(`behold_advisor_availability_${foundAdvisor.id}`);
      if (savedAvailability) {
        try {
          const parsed = JSON.parse(savedAvailability);
          const daysMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
          const activeDaysList = Object.keys(parsed.activeDays || {})
            .filter(d => parsed.activeDays[d])
            .map(d => daysMap[d]);
          if (activeDaysList.length > 0) {
            foundAdvisor.nextAvailable = `Available: ${activeDaysList.join(', ')}`;
          } else {
            foundAdvisor.nextAvailable = 'No Active Days';
          }
        } catch (e) {}
      }

      // 4. Dynamically append completed booking hours to advisor hours
      const isSessionCompleted = (booking) => {
        if (booking.status === 'CANCELLED') return false;
        if (booking.status === 'COMPLETED') return true;
        
        if (booking.status === 'CONFIRMED') {
          try {
            const [year, month, day] = booking.date.split('-').map(Number);
            const timeParts = booking.time.split(' ');
            const [hoursStr, minutesStr] = timeParts[0].split(':');
            let hours = Number(hoursStr);
            const minutes = Number(minutesStr);
            const meridiem = timeParts[1];
            
            if (meridiem === 'PM' && hours < 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            
            const sessionEnd = new Date(year, month - 1, day, hours + 1, minutes);
            return new Date() > sessionEnd;
          } catch (e) {
            console.error("Error checking session completion", e);
          }
        }
        return false;
      };

      try {
        const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
        const completedCount = bookings.filter(b => 
          (b.advisorId && b.advisorId === foundAdvisor.id) ||
          (b.advisorName && b.advisorName.toLowerCase() === foundAdvisor.name.toLowerCase())
        ).filter(isSessionCompleted).length;
        foundAdvisor.hours += completedCount;
      } catch (e) {
        console.error("Failed to add booking hours to profile details", e);
      }
    }

    return foundAdvisor;
  };

  const advisor = getDynamicAdvisorDetails(advisorId);

  if (!advisor) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-zinc-50 text-center px-4">
        <h2 className="text-2xl font-black mb-4 text-zinc-900">Therapist Not Found</h2>
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-32 animate-in fade-in duration-500">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-80 w-full bg-brand overflow-hidden">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-20 md:top-32 left-4 md:left-10 z-10 min-h-[44px] flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Experts
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-12 md:-mt-32">
        {/* Profile Card Main */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4.5 sm:p-6 md:p-10 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-900 shrink-0">
              <span className="text-4xl sm:text-6xl md:text-8xl font-black">{advisor.name.charAt(0)}</span>
            </div>

            {/* Title & Info */}
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                    Verified Expert
                  </span>
                  <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase">
                    <MapPin className="w-3.5 h-3.5" /> {advisor.modes ? advisor.modes.map(m => m === 'DOOR_STEP' ? 'Doorstep' : m.charAt(0) + m.slice(1).toLowerCase()).join(' & ') : 'Online & Doorstep'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black text-zinc-900 tracking-tight leading-none uppercase">
                  {advisor.name}
                </h1>
                <p className="text-sm sm:text-lg text-zinc-650 font-semibold mt-1">{advisor.role}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Therapy Hours</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-zinc-900">
                    <Clock className="w-4 h-4 text-brand" /> {advisor.hours}+
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200" aria-hidden="true"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Languages</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-zinc-900">
                    <Globe className="w-4 h-4 text-brand" /> {advisor.lang}
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200" aria-hidden="true"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Session Fee</span>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-900">
                    ₹{advisor.price.toLocaleString('en-IN')} / hr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Section */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-zinc-900">
                <BookOpen className="w-5 h-5 text-brand" />
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-wide">About {advisor.name.split(' ')[0]}</h3>
              </div>
              <p className="text-zinc-600 leading-relaxed text-xs sm:text-sm md:text-base font-light">
                {advisor.bio}
              </p>
            </div>

            {/* Specializations */}
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-zinc-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-zinc-900">
                <Heart className="w-5 h-5 text-brand" />
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-wide">Core Specialties</h3>
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
                <h3 className="text-sm sm:text-lg font-black uppercase tracking-wide">Qualifications</h3>
              </div>
              <div className="flex items-start gap-4 p-4 border border-zinc-200 rounded-lg bg-white">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 text-zinc-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">{advisor.education}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Verified by BEHOLD Quality Assurance</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32 bg-white p-5 sm:p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4 sm:space-y-6">

              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 uppercase tracking-wide mb-1">Book a Session</h3>
                <p className="text-xs text-zinc-600">Schedule your 1-hour session directly with {advisor.name.split(' ')[0]}.</p>
              </div>

              <div className="p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-zinc-600 font-semibold">Next Available</span>
                  <span className="font-extrabold text-brand bg-brand-light border border-brand/20 px-2 py-0.5 rounded-md text-[10px] sm:text-xs">{advisor.nextAvailable}</span>
                </div>
                <div className="w-full h-px bg-zinc-200" aria-hidden="true"></div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-zinc-600 font-semibold">Session Fee</span>
                  <span className="font-extrabold text-zinc-900">₹{advisor.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onBook(advisorId)}
                className="min-h-[48px] w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Book Now
              </button>

              <p className="text-[10px] sm:text-[11px] text-center text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                You will not be charged until the session is confirmed.
                Secure transactions via Razorpay.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
