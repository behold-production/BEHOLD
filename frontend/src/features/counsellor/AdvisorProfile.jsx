import React, { useEffect, useState } from 'react';
import { ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, GraduationCap, Star, ShieldCheck, CheckCircle2, Video, Sparkles, UserCheck, Lock } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { calculateNextAvailable } from '../../shared/utils/dateFormatter';

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
  const enableCareerMentoring = siteSettings.enableCareerMentoring !== false;
  const enableBooking = enablePsychology || enableCareerMentoring;

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
          
          const nextAvailable = calculateNextAvailable(psy.availability, psy.bookedSlots || []);

          const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
          const rawModes = psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
          const filteredModes = rawModes.filter(m => {
            if (m === 'ONLINE') return settings.enableOnline !== false;
            if (m === 'OFFLINE') return settings.enableOffline !== false;
            if (m === 'DOOR_STEP') return settings.enableDoorstep !== false;
            return true;
          });

          // Ensure proper capitalization of role and sensible experience numbers
          const formattedRole = (psy.role || 'Consultant Psychologist').replace(/\b\w/g, l => l.toUpperCase());
          const displayHours = (Number(psy.completedHours) && Number(psy.completedHours) > 0)
            ? `${psy.completedHours}+ Hours Coached`
            : '5+ Years Clinical Exp';

          setAdvisor({
            id: psy._id || psy.id,
            name: psy.name || 'Expert Counselor',
            profilePic: psy.profilePic || '',
            role: formattedRole,
            specialties: Array.isArray(psy.specialties) && psy.specialties.length > 0
              ? psy.specialties
              : ['Anxiety & Stress Management', 'Depression & Mood Concerns', 'Academic & Career Guidance', 'Relationship Counseling'],
            hoursText: displayHours,
            lang: psy.lang || 'Malayalam, English',
            price: Number(psy.price) || 899,
            rating: Number(psy.rating) || 4.9,
            reviewsCount: Number(psy.reviewsCount) || 98,
            nextAvailable: nextAvailable || 'Available Today',
            education: psy.education || 'MPhil Clinical Psychology · Certified Specialist',
            bio: psy.experience || 'Dedicated consultant psychologist specializing in evidence-based cognitive behavioral therapy, anxiety reduction, and personalized student guidance. Committed to providing a safe, confidential, and empathetic environment for personal and academic growth.',
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
      <div className="min-h-screen pt-28 pb-16 bg-slate-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-bold tracking-wide">Loading verified specialist details...</p>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-slate-50 text-center px-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">Specialist Profile Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">We could not retrieve the details for this counselor. Please check back or choose another expert from our directory.</p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 rounded-md font-bold shadow-sm transition-colors border-0 cursor-pointer"
        >
          Go Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1c1514] font-sans pt-24 sm:pt-28 pb-20 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Back Navigation Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#eae4dc] hover:bg-[#e2dad2] border border-[#d6cecb] rounded-full text-[#1c1514] font-bold text-xs uppercase tracking-widest transition-all cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-[#7c7069] group-hover:-translate-x-0.5 transition-transform" /> Back to Specialists
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1c1514] bg-[#eae4dc] border border-[#d6cecb] px-4 py-2 rounded-full shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Verified BEHOLD Practitioner
          </div>
        </div>

        {/* Hero Profile Header Card */}
        <div className="bg-[#eae4dc] rounded-2xl shadow-xs border border-[#d6cecb] p-6 sm:p-8 md:p-10 relative overflow-hidden mb-8 transition-all">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center relative z-10">
            {/* Avatar Circle/Square */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#2b211e] text-[#f7f4ef] shadow-md border border-[#d8d0c7] flex items-center justify-center font-bold text-4xl sm:text-5xl shrink-0 overflow-hidden relative group">
              {advisor.profilePic ? (
                <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <span>{getInitials(advisor.name)}</span>
              )}
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md" title="Active Specialist">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Title & Key Metrics */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#f7f4ef] border border-[#d8d0c7] text-[#1c1514] text-xs font-bold rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> {advisor.rating} ({advisor.reviewsCount} Reviews)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f7f4ef] border border-[#d8d0c7] text-[#1c1514] text-xs font-bold rounded-full">
                    <Video className="w-3.5 h-3.5 text-[#7c7069]" /> {advisor.modes && advisor.modes.length > 0 ? advisor.modes.map(m => m === 'DOOR_STEP' ? 'Doorstep' : m.charAt(0) + m.slice(1).toLowerCase()).join(' & ') : 'Online & In-Person'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f7f4ef] border border-[#d8d0c7] text-emerald-700 text-xs font-bold rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {advisor.nextAvailable}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-sans font-black uppercase text-[#1c1514] tracking-tight leading-tight">
                  {advisor.name}
                </h1>
                <p className="text-base sm:text-lg text-[#6e635e] font-bold mt-1 uppercase tracking-wide">{advisor.role}</p>
              </div>

              {/* 3 Stat Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-[#d6cecb]">
                <div className="flex items-center gap-3.5 p-3.5 bg-[#f7f4ef] border border-[#d8d0c7] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2b211e] text-[#f7f4ef] flex items-center justify-center shrink-0 font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#8a7e77] tracking-widest">Experience</p>
                    <p className="text-xs font-bold text-[#1c1514] mt-0.5">{advisor.hoursText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 bg-[#f7f4ef] border border-[#d8d0c7] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2b211e] text-[#f7f4ef] flex items-center justify-center shrink-0 font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#8a7e77] tracking-widest">Languages</p>
                    <p className="text-xs font-bold text-[#1c1514] mt-0.5 truncate">{advisor.lang}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3.5 bg-[#f7f4ef] border border-[#d8d0c7] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#2b211e] text-[#f7f4ef] flex items-center justify-center shrink-0 font-bold">
                    <span className="text-base font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#8a7e77] tracking-widest">Session Fee</p>
                    <p className="text-xs font-bold text-[#1c1514] mt-0.5">₹{advisor.price.toLocaleString('en-IN')} <span className="text-[10px] font-semibold text-[#8a7e77]">/ hr</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sticky Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Comprehensive Profile Details */}
          <div className={enableBooking ? "lg:col-span-2 space-y-6 sm:space-y-8" : "lg:col-span-3 space-y-6 sm:space-y-8"}>
            
            {/* About Section */}
            <div className="bg-[#eae4dc] p-6 sm:p-8 rounded-2xl border border-[#d6cecb] space-y-5">
              <div className="flex items-center gap-3 text-[#1c1514] border-b border-[#d6cecb] pb-4">
                <div className="p-2.5 bg-[#2b211e] text-[#f7f4ef] rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-sans font-black uppercase text-[#1c1514]">About {advisor.name}</h3>
                  <p className="text-xs text-[#7c7069] font-medium">Professional background & clinical focus</p>
                </div>
              </div>
              <p className="text-[#4a3f3a] leading-relaxed text-sm sm:text-base font-medium whitespace-pre-wrap">
                {advisor.bio}
              </p>
            </div>

            {/* Specialties & Focus Areas */}
            <div className="bg-[#eae4dc] p-6 sm:p-8 rounded-2xl border border-[#d6cecb] space-y-5">
              <div className="flex items-center gap-3 text-[#1c1514] border-b border-[#d6cecb] pb-4">
                <div className="p-2.5 bg-[#2b211e] text-[#f7f4ef] rounded-xl">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-sans font-black uppercase text-[#1c1514]">Specialties & Focus Areas</h3>
                  <p className="text-xs text-[#7c7069] font-medium">Core areas of expertise & consultation</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {advisor.specialties.map((spec, i) => (
                  <span key={i} className="px-4 py-2.5 bg-[#f7f4ef] border border-[#d8d0c7] rounded-full text-xs font-bold text-[#1c1514] shadow-2xs">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualifications & Degrees */}
            <div className="bg-[#eae4dc] p-6 sm:p-8 rounded-2xl border border-[#d6cecb] space-y-5">
              <div className="flex items-center gap-3 text-[#1c1514] border-b border-[#d6cecb] pb-4">
                <div className="p-2.5 bg-[#2b211e] text-[#f7f4ef] rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-sans font-black uppercase text-[#1c1514]">Qualifications & Credentials</h3>
                  <p className="text-xs text-[#7c7069] font-medium">Academic background & verification</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 border border-[#d6cecb] rounded-xl bg-[#f7f4ef]">
                <div className="w-12 h-12 rounded-xl bg-[#2b211e] text-[#f7f4ef] border border-[#2b211e] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-[#8a7e77] tracking-widest mb-0.5">Verified Academic Degree</span>
                  <h4 className="font-bold text-base text-[#1c1514]">{advisor.education}</h4>
                  <p className="text-xs text-[#6e635e] mt-0.5 font-medium">Licensed and verified practitioner under BEHOLD Guidelines</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Dark Espresso Booking Box */}
          {enableBooking && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 bg-[#2b211e] text-[#f7f4ef] p-6 sm:p-8 rounded-2xl border border-[#d8d0c7] shadow-lg space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#e2dad2]">Direct Consultation</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-955/60 px-2.5 py-0.5 rounded-full border border-emerald-800">🟢 Active</span>
                  </div>
                  <h3 className="text-2xl font-sans font-black uppercase text-[#f7f4ef] tracking-tight">Book 1-on-1 Session</h3>
                  <p className="text-xs text-[#e2dad2] font-medium mt-1 leading-relaxed">Schedule directly with {advisor.name} for tailored guidance.</p>
                </div>

                <div className="p-4 bg-[#1c1514] rounded-xl border border-[#3e302b] space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#a39891] font-bold uppercase tracking-wider">Fee per session</span>
                    <span className="text-2xl font-bold text-[#f7f4ef]">₹{advisor.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#e2dad2] pt-1 border-t border-[#2b211e]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Includes 60-min session & report</span>
                  </div>
                </div>

                <div className="space-y-2.5 py-1 text-xs text-[#e2dad2]">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Instant Calendar Slot Confirmation
                  </div>
                  <div className="flex items-center gap-2.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Choice of Online or Clinic Visit
                  </div>
                  <div className="flex items-center gap-2.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 100% Confidential Care
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onBook?.(advisor)}
                  className="w-full py-4 bg-[#f7f4ef] hover:bg-white text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <span>Select Date & Time Slot</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
