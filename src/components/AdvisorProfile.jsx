import React, { useEffect } from 'react';
import { ArrowLeft, Clock, Globe, Award, BookOpen, CheckCircle2, Calendar, MapPin, Sparkles, Heart } from 'lucide-react';

const ADVISORS_DB = {
  't1': { name: 'Josina Joseph', role: 'Consultant Psychologist', specialties: ['Mental Health Concerns', 'Anger & Emotional Regulation'], hours: 6000, lang: 'Malayalam', price: 1500, nextAvailable: '15 mins', education: 'MSc Psychology, PG Diploma in Counselling', bio: 'Josina is a compassionate consultant psychologist with over 6000+ hours of clinical experience. She specializes in helping individuals navigate complex emotional landscapes, develop healthier coping mechanisms, and overcome deep-seated anger issues. Her approach is rooted in empathy and evidence-based therapeutic practices.', type: 'counselling' },
  't2': { name: 'Muhammed Niyas S H', role: 'Consultant Psychologist', specialties: ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'], hours: 1000, lang: 'Malayalam', price: 1250, nextAvailable: 'Today at 7:00 PM', education: 'MPhil Clinical Psychology', bio: 'Muhammed specializes in cognitive behavioral approaches to managing severe anxiety and depressive disorders. He has a keen focus on relationship dynamics, helping couples and individuals find harmony and understanding in their interpersonal connections.', type: 'counselling' },
  't3': { name: 'Jahnavi Navami Rajesh', role: 'Clinical Psychologist', specialties: ['Relationship & Marital Issues', 'Anxiety Stress & Panic'], hours: 250, lang: 'Malayalam', price: 1000, nextAvailable: 'Today at 7:00 PM', education: 'MA Clinical Psychology', bio: 'Jahnavi is dedicated to fostering emotional resilience. She creates a warm, non-judgmental space for clients struggling with panic attacks and relationship stressors, guiding them towards a more centered and peaceful life.', type: 'counselling' },
  't4': { name: 'Hana Anvar M P', role: 'Career Counsellor', specialties: ['Work Career & Academic Concerns', 'Anger & Emotional'], hours: 400, lang: 'Malayalam', price: 1000, nextAvailable: 'Today at 7:00 PM', education: 'MSc Applied Psychology', bio: 'With a strong background in academic and career counseling, Hana helps young adults and professionals overcome burnout, navigate career transitions, and manage the intense emotions that often accompany high-pressure environments.', type: 'counselling' },
  't5': { name: 'Surbinas Rahman V P', role: 'Psychiatrist', specialties: ['Anxiety & Panic', 'Depression & Mood Concerns', 'Relationship & Marital'], hours: 3000, lang: 'Malayalam', price: 2000, nextAvailable: 'Today at 10:00 PM', education: 'MA Psychology, CBT Certified', bio: 'Surbinas brings a wealth of experience in treating mood disorders and complex relationship conflicts. His therapeutic style is collaborative and solution-focused, aiming to empower clients with practical tools for long-term mental wellbeing.', type: 'counselling' },
  't6': { name: 'Mary Santra Tomy', role: 'Consultant Psychologist', specialties: ['Relationship & Marital Issues', 'Self-Esteem & Personal Growth'], hours: 4000, lang: 'Malayalam', price: 1000, nextAvailable: 'Tomorrow at 12:00 AM', education: 'MSc Counselling Psychology', bio: 'Mary focuses on empowering individuals by rebuilding self-esteem and fostering deep personal growth. She is highly sought after for her expertise in marital counseling, helping couples rebuild trust and improve communication.', type: 'counselling' }
};

export default function AdvisorProfile({ advisorId, onBack, onBook }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [advisorId]);

  const advisor = ADVISORS_DB[advisorId];

  if (!advisor) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-zinc-50 text-center px-4">
        <h2 className="text-2xl font-black mb-4 text-zinc-900">Therapist Not Found</h2>
        <button onClick={onBack} className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-32 animate-in fade-in duration-500">
      {/* Cover Banner */}
      <div className="relative h-48 md:h-80 w-full bg-brand overflow-hidden">
        <button 
          onClick={onBack}
          className="absolute top-20 md:top-32 left-4 md:left-10 z-10 flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
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
                    <MapPin className="w-3.5 h-3.5" /> Online & Doorstep
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black text-zinc-900 tracking-tight leading-none uppercase">
                  {advisor.name}
                </h1>
                <p className="text-sm sm:text-lg text-zinc-650 font-semibold mt-1">{advisor.role}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Therapy Hours</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-zinc-900">
                    <Clock className="w-4 h-4 text-brand" /> {advisor.hours}+
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Languages</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-zinc-900">
                    <Globe className="w-4 h-4 text-brand" /> {advisor.lang}
                  </span>
                </div>
                <div className="w-px h-8 bg-zinc-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Session Fee</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-zinc-900">
                    <Sparkles className="w-4 h-4 text-brand" /> ₹{advisor.price.toLocaleString('en-IN')} / hr
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
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
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
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <span className="text-lg">🎓</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">{advisor.education}</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-bold">Verified by BEHOLD Quality Assurance</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white p-5 sm:p-6 rounded-lg border border-zinc-200 shadow-sm space-y-4 sm:space-y-6">
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 uppercase tracking-wide mb-1">Book a Session</h3>
                <p className="text-xs text-zinc-600">Schedule your 1-hour session directly with {advisor.name.split(' ')[0]}.</p>
              </div>

              <div className="p-3.5 sm:p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-zinc-600 font-semibold">Next Available</span>
                  <span className="font-extrabold text-zinc-900 bg-brand/20 px-2 py-0.5 rounded-md text-[10px] sm:text-xs">{advisor.nextAvailable}</span>
                </div>
                <div className="w-full h-px bg-zinc-200"></div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-zinc-600 font-semibold">Session Fee</span>
                  <span className="font-extrabold text-zinc-900">₹{advisor.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={() => onBook(advisorId)}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Book Now
              </button>

              <p className="text-[9px] sm:text-[10px] text-center text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
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
