import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Star, UserRound } from 'lucide-react';
import ApiService from '../../services/api';
import { formatExperience } from '../../utils/formatters';

const getInitial = (name = '') => {
  const cleanName = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

const fallbackPsychologists = [
  {
    id: 'athira-v',
    name: 'Athira V',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Counselling Psychology',
    rating: '5.0',
    years: 5,
    mode: 'Online & Clinic',
    specialties: ['Career Mentoring', 'Adjustment Difficulties', 'Youth Care'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'arya-k',
    name: 'Arya K',
    designation: 'Consultant Psychologist',
    credential: 'M.Phil Clinical Psychology',
    rating: '5.0',
    years: 6,
    mode: 'Online & Doorstep',
    specialties: ['Parent and Child Care', 'Anxiety issues', 'Depression'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1594824813576-9043328e930f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'arushi-s',
    name: 'ARUSHI S',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Clinical Psychology',
    rating: '5.0',
    years: 5,
    mode: 'Online & Clinic',
    specialties: ['Anxiety & Stress', 'Relationship Challenges', 'Career Guidance'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'fathima-n',
    name: 'Fathima N.',
    designation: 'Consultant Psychologist',
    credential: 'M.Sc Applied Psychology',
    rating: '5.0',
    years: 7,
    mode: 'Online Video',
    specialties: ['Workplace Burnout', 'Self-Esteem & Confidence', 'Stress Relief'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'anand-m',
    name: 'Anand M.',
    designation: 'Consultant Psychologist',
    credential: 'M.Phil Clinical Psychology',
    rating: '4.9',
    years: 8,
    mode: 'Clinic & Doorstep',
    specialties: ['Family Dynamics', 'Adjustment & Emotional Difficulties', 'CBT Therapy'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'divya-r',
    name: 'Divya R.',
    designation: 'Consultant Psychologist',
    credential: 'Certified Psychological Counselor',
    rating: '5.0',
    years: 6,
    mode: 'Online Video',
    specialties: ['Mindfulness & Calm', 'Anxiety & Stress', 'Emotional Healing'],
    fee: 899,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  },
];

function normalizeAdvisor(counsellor) {
  const rawPhoto = counsellor.profilePic || counsellor.photo || counsellor.avatar
    || counsellor.profilePicture || counsellor.image || counsellor.user?.profilePic;
  const hoursValue = counsellor.hours !== undefined && counsellor.hours !== null && counsellor.hours !== ''
    ? Number(counsellor.hours)
    : (typeof counsellor.experience === 'number' ? counsellor.experience : (parseInt(counsellor.experience, 10) || 0));
  const experience = formatExperience(Number.isFinite(hoursValue) ? hoursValue : 0);
  const designation = counsellor.title
    || (counsellor.designation && counsellor.designation.toLowerCase() !== 'counsellor' ? counsellor.designation : null)
    || (counsellor.role && counsellor.role.toLowerCase() !== 'counsellor' ? counsellor.role : null)
    || 'Clinical Psychologist';
  const rawFee = counsellor.fee ?? counsellor.price;
  const fee = rawFee === null || rawFee === undefined || rawFee === '' ? null : Number(rawFee);
  const rawSpecialties = Array.isArray(counsellor.specialties)
    ? counsellor.specialties
    : (counsellor.tags ? (Array.isArray(counsellor.tags) ? counsellor.tags : [counsellor.tags]) : (counsellor.focus || []));

  return {
    id: counsellor.id || counsellor._id?.toString(),
    name: counsellor.name || counsellor.user?.name || counsellor.fullName || '',
    designation,
    credential: counsellor.credential || 'Licensed Psychologist',
    rating: counsellor.rating ? String(Number(counsellor.rating).toFixed(1)) : '5.0',
    fee: Number.isFinite(fee) ? fee : 1299,
    years: counsellor.years || (typeof counsellor.experience === 'string' ? parseInt(counsellor.experience, 10) : 7),
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter(v => typeof v === 'string' && v.trim()),
    mode: Array.isArray(counsellor.modes) && counsellor.modes.length > 0 ? counsellor.modes.join(' & ') : 'Online & Clinic',
  };
}

function isPublicAdvisor(advisor) {
  const status = String(advisor?.status || '').toUpperCase();
  return advisor
    && (advisor.id || advisor._id)
    && String(advisor.name || advisor.user?.name || advisor.fullName || '').trim()
    && advisor.isActive !== false
    && advisor.isDeleted !== true
    && !['REJECTED', 'DELETED', 'PAUSED'].includes(status);
}

export default function TherapistSwipeSection({ onBookTherapist, siteSettings = {} }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Clinical Psychology',
    'Career Guidance',
    'Anxiety & Stress',
    'Adolescent Care',
    'Couples & Family',
  ];

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((response) => {
        if (!isMounted) return;
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          const publicOnly = response.data.filter(isPublicAdvisor);
          if (publicOnly.length > 0) {
            setAdvisors(publicOnly.map(normalizeAdvisor));
          } else {
            setAdvisors(fallbackPsychologists);
          }
        } else {
          setAdvisors(fallbackPsychologists);
        }
      })
      .catch(() => {
        if (isMounted) setAdvisors(fallbackPsychologists);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const displayList = useMemo(() => {
    const list = advisors.length > 0 ? advisors : fallbackPsychologists;
    if (activeCategory === 'All') return list.slice(0, 6);
    return list.filter((a) => {
      const matchSpecialty = a.specialties?.some(s => s.toLowerCase().includes(activeCategory.toLowerCase()));
      const matchDesignation = a.designation?.toLowerCase().includes(activeCategory.toLowerCase());
      return matchSpecialty || matchDesignation;
    }).slice(0, 6);
  }, [advisors, activeCategory]);

  const handleShowAll = () => {
    navigate('/psychologists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvisorClick = (advisorId) => {
    if (advisorId) {
      navigate(`/advisor/${advisorId}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="experts"
      aria-labelledby="bh-specialists-heading"
      className="relative py-20 sm:py-28 bg-[#fbf9f5] text-[#1c2826] overflow-hidden scroll-mt-20 border-t border-[#ece6dc]"
    >
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Left terracotta eyebrow, Right serif heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#ece6dc]">
          <div>
            <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
              Our Specialists
            </span>
          </div>
          <div>
            <h2
              id="bh-specialists-heading"
              className="font-serif-hero text-2xl sm:text-3xl md:text-4xl font-normal text-[#1c2826] tracking-tight leading-snug"
            >
              Meet Your Dedicated Psychologists
            </h2>
          </div>
        </div>

        {/* Category Filter Pills Row */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-md text-xs font-medium tracking-wide transition-all duration-200 shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-[#b85438] text-white border-[#b85438] shadow-xs'
                    : 'bg-white text-slate-700 hover:text-[#1c2826] hover:bg-[#f6f2ec] border-[#ede7de]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Stack of Horizontal Rows matching modern professional layout */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {displayList.map((psychologist) => (
            <div
              key={psychologist.id}
              className="group bg-white rounded-md px-5 py-3.5 sm:py-3.5 border border-[#ede7de] hover:border-[#b85438]/50 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
            >
              {/* Left Column: Format & Session Type */}
              <div className="sm:w-1/4">
                <span className="text-[11px] font-bold text-[#b85438] uppercase tracking-wider block">
                  {psychologist.mode || 'Online & Clinic'}
                </span>
                <span className="text-xs text-[#5c6b66] font-medium block">
                  {psychologist.years > 0 ? `${psychologist.years}+ Years Experience` : 'Accredited Specialist'}
                </span>
              </div>

              {/* Middle Column: Primary Focus / Credentials */}
              <div className="sm:w-1/3">
                <span className="text-xs font-medium text-slate-800 line-clamp-1">
                  {psychologist.specialties?.slice(0, 2).join(' • ') || psychologist.credential}
                </span>
                <span className="text-[11px] text-[#5c6b66]">
                  {psychologist.designation}
                </span>
              </div>

              {/* Middle-Right Column: Avatar & Doctor Name */}
              <div
                onClick={() => handleAdvisorClick(psychologist.id)}
                className="flex items-center gap-3 sm:w-1/3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-sm overflow-hidden shrink-0 bg-[#f4eee6] border border-[#ede7de]">
                  {psychologist.photo ? (
                    <img
                      src={psychologist.photo}
                      alt={psychologist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#b85438]">
                      {getInitial(psychologist.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1c2826] group-hover:text-[#b85438] transition-colors truncate">
                    {psychologist.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{psychologist.rating || '5.0'}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-normal">₹{psychologist.fee}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Book Button */}
              <div className="sm:w-auto shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onBookTherapist?.(psychologist.id)}
                  className="w-full sm:w-auto px-5 py-2 rounded-md text-xs font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white transition-colors duration-200 shadow-2xs cursor-pointer border-none"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Button linking to /psychologists */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-[#5c6b66] mb-3">
            Showing top clinical psychologists ready to support your mental wellness.
          </p>
          <button
            type="button"
            onClick={handleShowAll}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md text-xs sm:text-sm font-semibold bg-[#1c2826] hover:bg-[#b85438] text-white shadow-sm hover:shadow transition-all duration-300 cursor-pointer active:scale-95 border-none"
          >
            <span>View All Psychologists</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </section>
  );
}
