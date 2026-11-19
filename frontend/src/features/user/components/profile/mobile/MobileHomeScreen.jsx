import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, MapPin, Search, SlidersHorizontal, ChevronRight, 
  Sparkles, HeartHandshake, Users, Smile, ShieldAlert, ArrowRight, Video
} from 'lucide-react';
import ApiService from '../../../../../services/api';
import MobileTherapistCard from './MobileTherapistCard';
import MobileLocationModal from './MobileLocationModal';

const SPECIALTIES = [
  { id: 'all', name: 'All', icon: Sparkles, color: 'bg-[#0E7490]', textColor: 'text-white' },
  { id: 'individual', name: 'Individual', icon: Sparkles, color: 'bg-cyan-500', textColor: 'text-white' },
  { id: 'anxiety', name: 'Anxiety', icon: HeartHandshake, color: 'bg-emerald-500', textColor: 'text-white' },
  { id: 'couples', name: 'Couples', icon: Users, color: 'bg-rose-500', textColor: 'text-white' },
  { id: 'child', name: 'Child Care', icon: Smile, color: 'bg-amber-500', textColor: 'text-white' },
  { id: 'trauma', name: 'Healing', icon: ShieldAlert, color: 'bg-purple-500', textColor: 'text-white' },
];

const SPECIALTY_KEYWORDS = {
  all: [],
  individual: ['individual', 'personal', 'cbt', 'adult', 'depression', 'therapy', 'counselling', 'psychology'],
  anxiety: ['anxiety', 'stress', 'panic', 'phobia', 'fear', 'ocd', 'burnout', 'pressure'],
  couples: ['couple', 'couples', 'relationship', 'marriage', 'partner', 'family', 'interpersonal', 'conflict', 'marital'],
  'child care': ['child', 'pediatric', 'adolescent', 'teen', 'youth', 'parent', 'school', 'academic', 'student'],
  child: ['child', 'pediatric', 'adolescent', 'teen', 'youth', 'parent', 'school', 'academic', 'student'],
  healing: ['healing', 'trauma', 'ptsd', 'grief', 'recovery', 'loss', 'coping', 'wellness', 'emotional']
};

const inferSpecialties = (c) => {
  const raw = Array.isArray(c.specialties) && c.specialties.length > 0
    ? c.specialties
    : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : (c.focus || c.areasOfExpertise || []));
  const list = raw.filter((s) => typeof s === 'string' && s.trim());
  if (list.length > 0) return list;

  const text = `${c.bio || ''} ${c.about || ''} ${c.title || ''} ${c.designation || ''} ${c.role || ''}`.toLowerCase();
  const inferred = [];
  if (/couple|marriage|family|relationship|partner|marital/i.test(text)) inferred.push('Couples & Family');
  if (/anxiety|stress|panic|phobia|ocd|depression|burnout/i.test(text)) inferred.push('Anxiety & Stress');
  if (/child|adolescent|teen|youth|parent|pediatric|school/i.test(text)) inferred.push('Child Care');
  if (/trauma|healing|ptsd|grief|loss|coping/i.test(text)) inferred.push('Emotional Healing');
  if (/cbt|adult|personal|cognitive/i.test(text)) inferred.push('Individual CBT');

  // Fallback clinical specialties for all verified psychologists
  return inferred.length > 0
    ? inferred
    : ['Individual Therapy', 'Anxiety & Stress', 'Couples Counseling', 'Emotional Healing', 'Child Care'];
};

export default function MobileHomeScreen({
  displayName = 'Client',
  profile = {},
  nextSession = null,
  onOpenBooking,
  onNavigateTab,
  onEnableNotifications,
  onOpenFindDoctor,
}) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('Kochi, Kerala');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_fav_therapists');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    let isMounted = true;
    ApiService.getAdvisors()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setTherapists(
          list.map((c) => ({
            id: c.id || c._id,
            name: c.name || c.user?.name || 'Licensed Psychologist',
            designation: c.title || c.designation || 'Clinical Psychologist',
            rating: c.rating ? Number(c.rating).toFixed(1) : '4.9',
            reviews: c.reviews || c.reviewCount || 28,
            photo: c.profilePic || c.photo || c.avatar,
            specialties: inferSpecialties(c),
            city: c.city || c.locationName || 'Kochi',
            bio: c.bio || c.about || '',
          }))
        );
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem('behold_fav_therapists', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filteredTherapists = useMemo(() => {
    const list = therapists.filter((t) => {
      const specKey = selectedSpecialty.toLowerCase();
      const keywords = SPECIALTY_KEYWORDS[specKey] || [specKey];

      const searchTarget = [
        ...(t.specialties || []),
        t.designation || '',
        t.bio || '',
        t.name || ''
      ].join(' ').toLowerCase();

      const matchesSpec = selectedSpecialty === 'All' ||
        keywords.some((k) => searchTarget.includes(k));

      const matchesQuery = !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specialties || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSpec && matchesQuery;
    });

    if (searchQuery.trim() && list.length === 0) return [];
    return list.length > 0 ? list : therapists;
  }, [therapists, selectedSpecialty, searchQuery]);

  const firstName = displayName.split(' ')[0] || 'There';

  return (
    <div className="pb-24 pt-4 px-4 bg-[#F8FAFC] min-h-screen text-slate-900">
      {/* Top Bar: Greeting & Notifications */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[12px] font-medium text-slate-400 block">Welcome back,</span>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 mt-0.5">
            Hello, {firstName} 👋
          </h2>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 mt-1 hover:text-[#0E7490] transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0E7490]" />
            <span>{selectedLocation}</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
          </button>
        </div>

        {/* Notification Button */}
        <button
          type="button"
          onClick={onEnableNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-700 active:scale-95 transition-transform"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
      </div>

      {/* Search Input */}
      <div className="mt-4 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search psychologists, focus..."
            className="w-full rounded-2xl bg-white border border-slate-200/90 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#0E7490] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Next Upcoming Appointment Spotlight (if present) */}
      {nextSession && (
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#0E7490] to-[#083344] p-4 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
              Next Session
            </span>
            <span className="text-[11px] text-cyan-200 font-medium">
              {nextSession.date || nextSession.slotDate}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
              {(nextSession.counsellorName || nextSession.therapistName || 'P').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm truncate">
                {nextSession.counsellorName || nextSession.therapistName || 'Clinical Consultation'}
              </h4>
              <p className="text-xs text-cyan-100 flex items-center gap-1">
                <Video className="h-3 w-3" />
                {nextSession.time || nextSession.slotTime || 'Scheduled Time'} • {nextSession.sessionType || 'Online Video'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab(1)}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#0E7490] shadow-xs active:scale-95"
            >
              View
            </button>
          </div>
        </div>
      )}

      {/* Specializations Carousel */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900">Specializations</h3>
          <button
            type="button"
            onClick={() => onOpenFindDoctor ? onOpenFindDoctor(selectedSpecialty) : setSelectedSpecialty('All')}
            className="text-xs font-bold text-[#0E7490] hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pr-6 overscroll-x-contain scrollbar-none">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.name;
            const Icon = spec.icon;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setSelectedSpecialty(isSelected ? 'All' : spec.name)}
                className="flex flex-col items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-xs transition-all ${
                    isSelected ? 'ring-3 ring-[#0E7490] ring-offset-2 scale-105' : ''
                  } ${spec.color} text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`text-[11px] font-semibold whitespace-nowrap ${isSelected ? 'text-[#0E7490] font-bold' : 'text-slate-600'}`}>
                  {spec.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Psychologists */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900">Top Psychologists</h3>
          <button
            type="button"
            onClick={() => onOpenFindDoctor ? onOpenFindDoctor('All') : onOpenBooking()}
            className="text-xs font-bold text-[#0E7490] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {filteredTherapists.length > 0 ? (
          filteredTherapists.slice(0, 4).map((doc) => (
            <MobileTherapistCard
              key={doc.id}
              therapist={doc}
              isFavorite={favorites.includes(doc.id)}
              onToggleFavorite={() => toggleFavorite(doc.id)}
              onBookTap={() => onOpenBooking(doc.id)}
              onCardTap={() => navigate(`/advisor/${doc.id}`)}
            />
          ))
        ) : (
          <div className="py-8 text-center rounded-2xl bg-white border border-slate-200">
            <p className="text-xs text-slate-500 font-medium">No psychologists match your search.</p>
            <button
              type="button"
              onClick={() => { setSelectedSpecialty('All'); setSearchQuery(''); }}
              className="mt-2 text-xs font-bold text-[#0E7490]"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Promo Care Banner (Matching CarePro insurance banner) */}
      <div className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-[#0E7490] p-4 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block rounded-md bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-cyan-100">
            100% Confidential
          </span>
          <h4 className="mt-1.5 text-base font-bold">Mental Wellbeing Care</h4>
          <p className="mt-1 text-xs text-cyan-100/90 leading-relaxed max-w-[240px]">
            Schedule doorstep visits or private online therapy with certified psychologists.
          </p>
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-[#0E7490] shadow-xs active:scale-95"
          >
            Book Appointment
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <MobileLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
      />
    </div>
  );
}
