import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, MapPin, Search, ChevronRight, 
  Sparkles, HeartHandshake, Users, Smile, ShieldAlert, ArrowRight, Video, User
} from 'lucide-react';
import ApiService from '../../../../../services/api';
import { formatDateString } from '../../../../../utils/dateFormatter';
import MobileTherapistCard from './MobileTherapistCard';
import MobileLocationModal from './MobileLocationModal';

const SPECIALTIES = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'individual', name: 'Individual', icon: User },
  { id: 'anxiety', name: 'Anxiety', icon: HeartHandshake },
  { id: 'couples', name: 'Couples', icon: Users },
  { id: 'child', name: 'Child Care', icon: Smile },
  { id: 'trauma', name: 'Healing', icon: ShieldAlert },
];

const SPECIALTY_KEYWORDS = {
  all: [],
  individual: ['individual', 'personal', 'cbt', 'adult', 'depression', 'therapy', 'counselling', 'psychology', 'clinical'],
  anxiety: ['anxiety', 'stress', 'panic', 'phobia', 'fear', 'ocd', 'burnout', 'pressure', 'worry'],
  couples: ['couple', 'couples', 'relationship', 'marriage', 'partner', 'family', 'interpersonal', 'conflict', 'marital', 'adult'],
  'child care': ['child', 'pediatric', 'adolescent', 'teen', 'youth', 'parent', 'school', 'academic', 'parenting'],
  child: ['child', 'pediatric', 'adolescent', 'teen', 'youth', 'parent', 'school', 'academic', 'parenting'],
  healing: ['healing', 'trauma', 'ptsd', 'grief', 'recovery', 'loss', 'coping', 'wellness', 'emotional', 'mindfulness']
};

const inferSpecialties = (c) => {
  const raw = Array.isArray(c.specialties) && c.specialties.length > 0
    ? c.specialties
    : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : (c.focus || c.areasOfExpertise || []));
  const list = raw.filter((s) => typeof s === 'string' && s.trim());

  const clinicalCompetencies = [
    'Individual CBT',
    'Anxiety & Stress',
    'Couples Counseling',
    'Child Care',
    'Emotional Healing'
  ];

  if (list.length > 0) {
    return Array.from(new Set([...list, ...clinicalCompetencies]));
  }

  const text = `${c.bio || ''} ${c.about || ''} ${c.title || ''} ${c.designation || ''} ${c.role || ''}`.toLowerCase();
  const inferred = [];
  if (/couple|marriage|family|relationship|partner|marital/i.test(text)) inferred.push('Couples Counseling');
  if (/anxiety|stress|panic|phobia|ocd|depression|burnout/i.test(text)) inferred.push('Anxiety & Stress');
  if (/child|adolescent|teen|youth|parent|pediatric|school/i.test(text)) inferred.push('Child Care');
  if (/trauma|healing|ptsd|grief|loss|coping/i.test(text)) inferred.push('Emotional Healing');
  if (/cbt|adult|personal|cognitive/i.test(text)) inferred.push('Individual CBT');

  return Array.from(new Set([...inferred, ...clinicalCompetencies]));
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
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem('behold_selected_location') || 'Kochi, Kerala';
    } catch {
      return 'Kochi, Kerala';
    }
  });
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
    const handleLocationSync = (e) => {
      if (e.detail && typeof e.detail === 'string') {
        setSelectedLocation(e.detail);
      }
    };
    window.addEventListener('behold_location_changed', handleLocationSync);
    return () => window.removeEventListener('behold_location_changed', handleLocationSync);
  }, []);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    try {
      localStorage.setItem('behold_selected_location', loc);
      window.dispatchEvent(new CustomEvent('behold_location_changed', { detail: loc }));
    } catch {}
  };

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
            city: c.city || c.locationName || 'Kochi, Kerala',
            modes: c.modes || ['ONLINE', 'OFFLINE'],
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
    const cityName = (selectedLocation.split(',')[0] || selectedLocation).trim().toLowerCase();
    const isOnlineOnly = cityName.includes('online') || cityName.includes('worldwide');

    const matched = therapists.filter((t) => {
      const specKey = selectedSpecialty.toLowerCase();
      const keywords = SPECIALTY_KEYWORDS[specKey] || [specKey];

      const searchTarget = [
        ...(t.specialties || []),
        t.designation || '',
        t.bio || '',
        t.name || '',
        t.city || '',
      ].join(' ').toLowerCase();

      const matchesSpec = selectedSpecialty === 'All' ||
        keywords.some((k) => searchTarget.includes(k));

      const matchesQuery = !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specialties || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.city || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpec && matchesQuery;
    });

    // If search text was typed explicitly and 0 matched, return []
    if (searchQuery.trim() && matched.length === 0) return [];

    const baseList = matched.length > 0 ? matched : therapists;

    // Prioritize therapists in selected city
    if (!isOnlineOnly) {
      return [...baseList].sort((a, b) => {
        const aCity = (a.city || '').toLowerCase();
        const bCity = (b.city || '').toLowerCase();
        const aMatchesCity = aCity.includes(cityName) ? 1 : 0;
        const bMatchesCity = bCity.includes(cityName) ? 1 : 0;
        return bMatchesCity - aMatchesCity;
      });
    }

    return baseList;
  }, [therapists, selectedSpecialty, searchQuery, selectedLocation]);

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
              {formatDateString(nextSession.date || nextSession.slotDate)}
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

        <div className="-mx-4 px-4 flex gap-3.5 overflow-x-auto pt-3 pb-2 scrollbar-none overscroll-x-contain">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.name;
            const Icon = spec.icon;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setSelectedSpecialty(isSelected ? 'All' : spec.name)}
                className="flex flex-col items-center gap-2 shrink-0 transition-all duration-200 active:scale-95 cursor-pointer border-none bg-transparent group w-[64px]"
              >
                <div
                  className={`flex h-[58px] w-[58px] items-center justify-center rounded-[22px] transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0E7490] text-white shadow-md shadow-[#0E7490]/25 ring-2 ring-[#0E7490] ring-offset-2 ring-offset-[#F8FAFC]'
                      : 'bg-white text-[#0E7490] border border-slate-200/90 shadow-2xs group-hover:border-[#0E7490]/40 group-hover:bg-[#0E7490]/5'
                  }`}
                >
                  <Icon className="h-6 w-6 transition-transform duration-200 group-hover:scale-105" />
                </div>
                <span className={`text-[12px] whitespace-nowrap transition-colors tracking-tight text-center ${
                  isSelected ? 'text-[#0E7490] font-bold' : 'text-slate-600 font-medium'
                }`}>
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
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Top Psychologists</h3>
            <span className="text-[11px] text-slate-500 font-normal">
              Showing specialists available for {selectedLocation.split(',')[0]} & Online
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenFindDoctor ? onOpenFindDoctor(selectedSpecialty) : onOpenBooking()}
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
            <p className="text-xs text-slate-500 font-medium">No psychologists match your search query.</p>
            <button
              type="button"
              onClick={() => { setSelectedSpecialty('All'); setSearchQuery(''); }}
              className="mt-2 text-xs font-bold text-[#0E7490] cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Promo Care Banner (CarePro Aesthetic with Behold Brand Colors) */}
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#0E7490] via-[#0B5C73] to-[#083344] p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-white/10 pointer-events-none">
          <ShieldAlert className="w-28 h-28" />
        </div>
        <div className="relative z-10">
          <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-cyan-100 backdrop-blur-xs">
            100% Confidential
          </span>
          <h4 className="mt-2 text-base font-bold">Mental Wellbeing Care</h4>
          <p className="mt-1 text-xs text-cyan-100/90 leading-relaxed max-w-[240px]">
            Schedule doorstep visits or private online therapy with certified clinical psychologists.
          </p>
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#0E7490] shadow-sm hover:bg-slate-50 active:scale-95 transition-all cursor-pointer border-none"
          >
            <span>Book Appointment</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <MobileLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
