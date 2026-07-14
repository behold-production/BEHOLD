import React, { useEffect, useState } from 'react';
import { ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, GraduationCap } from 'lucide-react';
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

 setAdvisor({
 id: psy._id || psy.id,
 name: psy.name,
 profilePic: psy.profilePic || '',
 role: psy.role || 'Consultant Psychologist',
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
 className="min-h-[44px] px-6 py-2.5 bg-zinc-900 text-white rounded-full font-bold"
 >
 Go Back
 </button>
 </div>
 );
 }

 return (
  <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans pb-16 animate-in fade-in duration-500">
    {/* Cover Banner (Premium Dark/Glass) */}
    <div className="relative h-56 md:h-[340px] w-full bg-slate-950 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[100px] opacity-70 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[120px] opacity-50 mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative h-full">
        <button
          type="button"
          onClick={onBack}
          className="absolute top-24 md:top-28 left-4 md:left-6 z-10 min-h-[40px] flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold transition-all cursor-pointer border border-white/10 hover:border-white/25 shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Experts
        </button>
      </div>
    </div>

  <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-16 md:-mt-24">
    {/* Profile Card Main */}
    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-12 relative overflow-hidden">
      
      {/* Subtle Background Accent inside Card */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center relative z-10">
        {/* Avatar */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-white ring-4 ring-white shadow-xl flex items-center justify-center text-slate-800 shrink-0 overflow-hidden relative group">
          {advisor.profilePic ? (
            <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <span className="text-4xl sm:text-5xl md:text-7xl font-black">{getInitials(advisor.name)}</span>
          )}
        </div>

        {/* Title & Info */}
        <div className="space-y-5 flex-1 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {advisor.modes ? advisor.modes.map(m => m === 'DOOR_STEP' ? 'Doorstep' : m.charAt(0) + m.slice(1).toLowerCase()).join(' & ') : 'Online & Doorstep'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {advisor.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-medium mt-2">{advisor.role}</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Experience</span>
              <span className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-800">
                <Clock className="w-4 h-4 text-brand" /> {advisor.hours}+ Hours
              </span>
            </div>
            <div className="w-px h-10 bg-slate-100" aria-hidden="true"></div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Languages</span>
              <span className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-800">
                <Globe className="w-4 h-4 text-brand" /> {advisor.lang}
              </span>
            </div>
            <div className="w-px h-10 bg-slate-100" aria-hidden="true"></div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Session Fee</span>
              <span className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-800">
                <span className="w-4 h-4 rounded-full bg-brand/20 text-brand flex items-center justify-center text-[10px]">₹</span>
                {advisor.price.toLocaleString('en-IN')} / hr
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
 
    {/* Left Column: Details */}
    <div className={enableBooking ? "lg:col-span-2 space-y-6 sm:space-y-8" : "lg:col-span-3 space-y-6 sm:space-y-8"}>
    
      {/* About Section */}
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-brand/10 rounded-xl">
            <BookOpen className="w-5 h-5 text-brand" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">About {advisor.name.split(' ')[0]}</h3>
        </div>
        <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-wrap">
          {advisor.bio}
        </p>
      </div>

      {/* Specializations */}
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-rose-500/10 rounded-xl">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Core Specialties</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {advisor.specialties.map((spec, i) => (
            <div key={i} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors rounded-xl">
              <span className="text-xs font-bold text-slate-700">{spec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Qualifications */}
      <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Qualifications</h3>
        </div>
        <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Highest Degree</span>
            <h4 className="font-bold text-base text-slate-900">{advisor.education}</h4>
          </div>
        </div>
      </div>

    </div>

    {/* Right Column: Sticky Booking Widget */}
    {enableBooking && (
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-32 bg-white p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">

          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Book a Session</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Schedule your 1-hour session directly with {advisor.name.split(' ')[0]}.</p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-slate-500 text-sm font-bold">Next Available</span>
              <span className="font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full text-xs">{advisor.nextAvailable}</span>
            </div>
            <div className="w-full h-px bg-slate-200/50" aria-hidden="true"></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm font-bold">Session Fee</span>
              <span className="font-black text-lg text-slate-900">₹{advisor.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onBook(advisorId)}
            className="w-full py-4 bg-brand hover:bg-[#00d0e6] text-slate-950 rounded-2xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5"
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
