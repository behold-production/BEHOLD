import React, { useEffect, useState } from 'react';
import { ChevronLeft, Clock, Globe, Award, BookOpen, Calendar, MapPin, Heart, GraduationCap, Star, ShieldCheck, CheckCircle2, Video, Sparkles, UserCheck, Lock, Share2 } from 'lucide-react';
import ApiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { calculateNextAvailable } from '../../utils/dateFormatter';
import { formatExperience } from '../../utils/formatters';
import SEO from '../../components/common/SEO';
import { trackViewContent } from '../../utils/metaPixel';

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Profile link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Book a session with ${advisor?.name || 'this specialist'}`,
          text: `Check out ${advisor?.name || 'this specialist'}'s profile on Behold!`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        setLoading(true);
        const res = await ApiService.getCounsellorDetails(advisorId);
        if (res.success && res.data) {
          const psy = res.data;
          
          trackViewContent({
            content_name: psy.name || 'Specialist Profile',
            content_type: 'advisor_profile',
            content_id: advisorId
          });

          const nextAvailable = calculateNextAvailable(psy.availability, psy.bookedSlots || []);

          const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
          const rawModes = psy.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'];
          const filteredModes = rawModes.filter(m => {
            if (m === 'ONLINE') return settings.enableOnline !== false;
            if (m === 'OFFLINE') return settings.enableOffline !== false;
            if (m === 'DOOR_STEP') return settings.enableDoorstep !== false;
            return true;
          });

          // Format experience & consultation hours intelligently
          const rawHoursVal = (psy.hours !== undefined && psy.hours !== null && psy.hours !== '') ? Number(psy.hours) : (typeof psy.experience === 'number' ? psy.experience : (parseInt(psy.experience, 10) || 0));
          const expData = formatExperience(rawHoursVal);
          const rawRoleTitle = psy.title || (psy.role && psy.role.toLowerCase() !== 'counsellor' ? psy.role : 'Consultant Psychologist');
          const formattedRole = rawRoleTitle.replace(/\b\w/g, l => l.toUpperCase());
          const displayHours = `${expData.rawHours.toLocaleString()}+ Hours Consulted`;

          const rawPhoto = psy.profilePic || psy.photo || psy.avatar || psy.image || psy.user?.profilePic;
          const hasValidPhoto = rawPhoto && typeof rawPhoto === 'string' && rawPhoto.trim().length > 0 && !rawPhoto.includes('via.placeholder');

          const rawPrice = Number(psy.price);
          const rawHalf = Number(psy.halfSessionPrice);
          const validPrice = (Number.isFinite(rawPrice) && rawPrice >= 100) ? rawPrice : ((Number.isFinite(rawHalf) && rawHalf >= 100) ? rawHalf : 1200);

          const eduText = psy.education || (Array.isArray(psy.qualifications) && psy.qualifications.length > 0 ? psy.qualifications.join(' · ') : 'Certified Specialist');
          const bioText = psy.bio || (typeof psy.experience === 'string' && psy.experience.length > 20 ? psy.experience : 'Dedicated psychologist committed to providing compassionate, evidence-based psychological counselling and mental wellbeing support.');

          setAdvisor({
            id: psy._id || psy.id,
            name: psy.name || 'Expert Psychologist',
            profilePic: hasValidPhoto ? rawPhoto : '',
            role: formattedRole,
            expYears: expData.years,
            expHours: expData.hours,
            specs: Array.isArray(psy.specialties) && psy.specialties.length > 0
              ? psy.specialties
              : ['Anxiety & Stress Management', 'Depression & Mood Concerns', 'Academic & Career Guidance', 'Relationship Counseling'],
            hoursText: displayHours,
            lang: Array.isArray(psy.lang) ? psy.lang.join(', ') : (psy.lang || 'Malayalam, English'),
            price: validPrice,
            halfSessionPrice: (Number.isFinite(rawHalf) && rawHalf >= 100) ? rawHalf : (validPrice <= 899 ? 499 : validPrice >= 1200 ? 699 : Math.round(validPrice * 0.5)),
            rating: Number(psy.rating) || 5.0,
            reviewCount: Number(psy.reviewCount) || 0,
            nextAvailable: nextAvailable || 'Available Today',
            education: eduText,
            about: bioText,
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
      <div className="min-h-screen pt-28 pb-16 bg-transparent flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-bold tracking-wide">Loading verified specialist details...</p>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-transparent text-center px-4 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black mb-2 text-slate-900 tracking-tight">Specialist Profile Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">We could not retrieve the details for this counselor. Please check back or choose another expert from our directory.</p>
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm border border-[#06b6d4]/30 cursor-pointer"
        >
          Go Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pt-24 sm:pt-28 pb-20 animate-in fade-in duration-300">
      <SEO 
        title={advisor.name}
        description={`Book an online session with ${advisor.name}, ${advisor.role}. ${advisor.about ? advisor.about.substring(0, 100) + '...' : ''}`}
        canonicalUrl={`https://www.behold.co.in/advisor/${advisor.id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "Physician",
          "name": advisor.name,
          "description": advisor.about,
          "image": advisor.profilePic || "https://www.behold.co.in/favicon.png",
          "medicalSpecialty": "Psychiatric",
          "priceRange": `₹${advisor.price}`,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": advisor.rating.toString(),
            "reviewCount": advisor.reviewCount > 0 ? advisor.reviewCount.toString() : "1"
          }
        }}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Specialists</span>
          </button>
        </div>

        {/* Top Profile Card */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start relative">
            
            {/* Avatar Image */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm flex items-center justify-center font-black text-4xl text-slate-400">
              {advisor.profilePic ? (
                <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(advisor.name)}</span>
              )}
            </div>

            {/* Title & Info */}
            <div className="flex-1 w-full space-y-4">
              
              {/* Top Tags */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{advisor.rating}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-slate-500" />
                  <span>{advisor.modes && advisor.modes.length > 0 ? advisor.modes.map(m => m === 'DOOR_STEP' ? 'Doorstep' : m.charAt(0) + m.slice(1).toLowerCase()).join(' & ') : 'Online'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#00a680]">
                  <span className="w-2 h-2 rounded-full bg-[#00a680]" />
                  <span>{advisor.nextAvailable}</span>
                </span>
              </div>

              {/* Name & Role */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-sans font-black text-slate-900 tracking-tight">
                    {advisor.name}
                  </h1>
                  <p className="text-lg text-[#00a680] font-semibold mt-1">{advisor.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 text-slate-400 hover:text-[#00a680] hover:bg-[#E6F6F4] rounded-full transition-colors cursor-pointer border-none bg-transparent flex-shrink-0"
                  title="Share Profile"
                >
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-slate-100 my-4"></div>

              {/* Bottom Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                
                {/* Experience */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E6F6F4] text-[#00a680] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Experience</p>
                    <p className="text-sm font-bold text-slate-900">{advisor.hoursText}</p>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center gap-4 border-l border-slate-100 pl-0 sm:pl-6">
                  <div className="w-10 h-10 rounded-full bg-[#E6F6F4] text-[#00a680] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Languages</p>
                    <p className="text-sm font-bold text-slate-900">{advisor.lang}</p>
                  </div>
                </div>

                {/* Session Fee */}
                <div className="flex items-center gap-4 border-l border-slate-100 pl-0 sm:pl-6">
                  <div className="w-10 h-10 rounded-full bg-[#E6F6F4] text-[#00a680] flex items-center justify-center shrink-0 font-bold text-lg">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Session Fee</p>
                    <p className="text-sm font-bold text-slate-900">₹{advisor.price.toLocaleString('en-IN')} <span className="text-xs font-normal">/ hr</span></p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: About */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[#E6F6F4] text-[#00a680] rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">About {advisor.name}</h3>
                  <p className="text-sm text-slate-500">Professional background & clinical focus</p>
                </div>
              </div>
              <p className="text-[15px] text-slate-700 leading-relaxed">
                {advisor.about}
              </p>

              {/* Specialties */}
              {advisor.specs && advisor.specs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Specialties & Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {advisor.specs.map((spec, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Booking Card */}
          {enableBooking && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 bg-white p-6 rounded-xl border-2 border-[#00a680] shadow-[0_4px_20px_rgba(0,166,128,0.15)] space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00a680]">Direct Consultation</span>
                  <span className="text-[10px] font-bold text-[#00a680] bg-[#E6F6F4] px-2 py-0.5 rounded-md uppercase">Active</span>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Book 1-on-1 Session</h3>
                  <p className="text-sm text-slate-500 mt-1">Schedule directly with {advisor.name} for tailored guidance.</p>
                </div>

                <div className="pt-4 space-y-4">
                  
                  {/* Fee Block */}
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Fee per session</span>
                      <span className="text-xl font-black text-slate-900">₹{advisor.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#00a680]" />
                      <span>Includes 60-min session & report</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-sm text-slate-700 font-medium pb-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#00a680] shrink-0" /> 
                      <span>Instant Calendar Slot Confirmation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#00a680] shrink-0" /> 
                      <span>Choice of Online or Clinic Visit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#00a680] shrink-0" /> 
                      <span>100% Confidential Care</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    type="button"
                    onClick={() => onBook?.(advisor)}
                    className="w-full py-3.5 bg-[#00a680] hover:bg-[#008f6e] text-white font-bold text-sm rounded-lg transition-all shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Select Date & Time Slot</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
