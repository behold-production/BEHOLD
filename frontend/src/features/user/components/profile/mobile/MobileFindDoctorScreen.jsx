import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Search, MapPin, ChevronDown
} from 'lucide-react';
import ApiService from '../../../../../services/api';
import { DEFAULT_FALLBACK_COUNSELLORS } from '../../../../../utils/fallbackSpecialists';
import MobileTherapistCard from './MobileTherapistCard';
import MobileLocationModal from './MobileLocationModal';

const SPECIALTIES = [
  { id: 'all', name: 'All' },
  { id: 'individual', name: 'Individual' },
  { id: 'anxiety', name: 'Anxiety' },
  { id: 'couples', name: 'Couples' },
  { id: 'child', name: 'Child Care' },
  { id: 'trauma', name: 'Healing' },
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

/**
 * MobileFindDoctorScreen
 * 1:1 mobile implementation of CarePro FindDoctorScreen (care_pro)
 */
export default function MobileFindDoctorScreen({
  initialSpecialty = 'All',
  onBack,
  onOpenBooking,
}) {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem('behold_selected_location') || 'Kochi, Kerala';
    } catch {
      return 'Kochi, Kerala';
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_counsellors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
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
            price: c.price || 899,
          }));
        }
      }
    } catch {}
    return DEFAULT_FALLBACK_COUNSELLORS.map((c) => ({
      id: c.id || c._id,
      name: c.name,
      designation: c.title,
      rating: Number(c.rating).toFixed(1),
      reviews: c.reviews,
      photo: c.profilePic || '',
      specialties: inferSpecialties(c),
      city: c.city,
      modes: c.modes,
      bio: c.bio,
      price: c.price,
    }));
  });

  const [isLoading, setIsLoading] = useState(() => therapists.length === 0);
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
        if (list.length > 0) {
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
              price: c.price || 899,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Specialist live list notice:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem('behold_fav_therapists', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
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

    if (searchQuery.trim() && matched.length === 0) return [];
    const baseList = matched.length > 0 ? matched : therapists;

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      {/* App Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack || (() => navigate(-1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-transform cursor-pointer border-none"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h1 className="text-base font-bold text-slate-900">Find Specialists</h1>

        <div className="w-9" />
      </header>

      <div className="px-4 pt-3.5 space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search psychologists, focus..."
            className="w-full rounded-2xl bg-white border border-slate-200/90 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#0E7490] focus:outline-hidden"
          />
        </div>

        {/* Location Selector Pill */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#0E7490]/50 transition-colors cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-[#0E7490]" />
            <span>{selectedLocation}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          <span className="text-[11px] text-slate-400 font-medium">
            {filtered.length} specialists available
          </span>
        </div>

        {/* Specialty Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.name;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setSelectedSpecialty(spec.name)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0E7490] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {spec.name}
              </button>
            );
          })}
        </div>

        {/* Doctor List */}
        {isLoading && filtered.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-6 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-8 w-28 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <MobileTherapistCard
                key={doc.id}
                therapist={doc}
                isFavorite={favorites.includes(doc.id)}
                onToggleFavorite={() => toggleFavorite(doc.id)}
                onBookTap={() => onOpenBooking(doc.id)}
                onCardTap={() => navigate(`/advisor/${doc.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-white border border-slate-200 p-6">
            <p className="text-sm font-bold text-slate-800">No psychologists found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filters or search keywords.</p>
            <button
              type="button"
              onClick={() => { setSelectedSpecialty('All'); setSearchQuery(''); }}
              className="mt-3 rounded-xl bg-[#0E7490] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer border-none"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Wellness Diagnostic Promo Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0E7490] to-[#083344] p-5 text-white shadow-md relative overflow-hidden">
          <h4 className="text-base font-bold">Comprehensive Wellness Review</h4>
          <p className="mt-1 text-xs text-cyan-100 leading-relaxed">
            Get matched with certified clinical specialists tailored to your schedule and location.
          </p>
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#0E7490] shadow-xs active:scale-95 cursor-pointer border-none"
          >
            Schedule Diagnostic
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