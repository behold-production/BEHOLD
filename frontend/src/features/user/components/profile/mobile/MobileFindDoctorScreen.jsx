import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Search, SlidersHorizontal, Sparkles, 
  HeartHandshake, Users, Smile, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import ApiService from '../../../../../services/api';
import MobileTherapistCard from './MobileTherapistCard';

const SPECIALTIES = [
  { id: 'all', name: 'All' },
  { id: 'individual', name: 'Individual' },
  { id: 'anxiety', name: 'Anxiety' },
  { id: 'couples', name: 'Couples' },
  { id: 'child', name: 'Child Care' },
  { id: 'trauma', name: 'Healing' },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
            reviews: c.reviews || 28,
            photo: c.profilePic || c.photo || c.avatar,
            specialties: Array.isArray(c.specialties) ? c.specialties : [c.specialization || 'Therapy'],
            city: c.city || 'Kochi',
            price: c.price || 899,
          }))
        );
      })
      .catch(() => {})
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
    return therapists.filter((t) => {
      const matchesSpec = selectedSpecialty === 'All' ||
        t.specialties.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase())) ||
        t.designation.toLowerCase().includes(selectedSpecialty.toLowerCase());
      const matchesQuery = !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSpec && matchesQuery;
    });
  }, [therapists, selectedSpecialty, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      {/* App Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack || (() => navigate(-1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-transform"
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

        {/* Specialty Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.name;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setSelectedSpecialty(spec.name)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#0E7490] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80'
                }`}
              >
                {spec.name}
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            All Specialists
          </span>
          <span className="text-xs font-bold text-[#0E7490]">
            {filtered.length} Found
          </span>
        </div>

        {/* Doctor List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
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
              className="mt-3 rounded-xl bg-[#0E7490] px-4 py-2 text-xs font-bold text-white shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Wellness Diagnostic Promo Card (CarePro Visily checkup card) */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0E7490] to-[#083344] p-5 text-white shadow-md relative overflow-hidden">
          <h4 className="text-base font-bold">Comprehensive Wellness Review</h4>
          <p className="mt-1 text-xs text-cyan-100 leading-relaxed">
            Get matched with certified clinical specialists tailored to your schedule.
          </p>
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#0E7490] shadow-xs active:scale-95"
          >
            Schedule Diagnostic
          </button>
        </div>
      </div>
    </div>
  );
}
