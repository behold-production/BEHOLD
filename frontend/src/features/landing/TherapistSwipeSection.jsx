import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Star, UserRound } from 'lucide-react';
import ApiService from '../../services/api';
import SectionHeading from './SectionHeading';
import { formatExperience } from '../../utils/formatters';

const getInitial = (name = '') => {
  const cleanName = (typeof name === 'string' ? name : '').replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

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
    rating: counsellor.rating ? String(Number(counsellor.rating).toFixed(1)) : null,
    fee: Number.isFinite(fee) ? fee : null,
    hoursLabel: experience.hours,
    photo: typeof rawPhoto === 'string' && rawPhoto.trim() && !rawPhoto.includes('via.placeholder') ? rawPhoto : null,
    specialties: rawSpecialties.filter((v) => typeof v === 'string' && v.trim()),
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

export default function TherapistSwipeSection({ onBookTherapist }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    ApiService.getCounsellors({}, true)
      .then((response) => {
        if (!isMounted) return;
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          setAdvisors(response.data.filter(isPublicAdvisor).map(normalizeAdvisor));
        } else {
          setAdvisors([]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAdvisors([]);
          setFetchError(true);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Filter chips are derived from the focus areas the admin assigned to
  // each psychologist, so nothing is hardcoded on the public side.
  const filters = useMemo(() => {
    const counts = new Map();
    advisors.forEach((advisor) => {
      advisor.specialties.slice(0, 3).forEach((specialty) => {
        const label = specialty.trim();
        if (!label) return;
        counts.set(label, (counts.get(label) || 0) + 1);
      });
    });
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label]) => label);
    return ['All', ...top];
  }, [advisors]);

  const displayList = useMemo(() => {
    if (activeFilter === 'All') return advisors.slice(0, 8);
    const filtered = advisors.filter((advisor) =>
      advisor.specialties.some((specialty) => specialty.toLowerCase().includes(activeFilter.toLowerCase()))
      || advisor.designation.toLowerCase().includes(activeFilter.toLowerCase())
    );
    return (filtered.length > 0 ? filtered : advisors).slice(0, 8);
  }, [advisors, activeFilter]);

  const handleShowAll = () => {
    navigate('/psychologists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdvisorClick = (advisorId) => {
    if (!advisorId) return;
    navigate(`/advisor/${advisorId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="experts"
      aria-labelledby="bh-specialists-heading"
      className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Team"
          title="Meet Our Team"
        />

        {filters.length > 1 && (
          <div className="no-scrollbar mt-8 flex items-center justify-start gap-2 overflow-x-auto pb-1 sm:mt-10 sm:justify-center">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[11.5px] font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'border-[#0E7490] bg-[#0E7490] text-white'
                      : 'border-[#E6DFD0] bg-white text-[#55605F] hover:border-[#0E7490]/40 hover:text-[#0B5C73]'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="rounded-xl border border-[#EFE9DC] bg-white p-3">
                <div className="aspect-[4/5] w-full animate-pulse rounded-lg bg-[#F1EAD9]" />
                <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-[#F1EAD9]" />
                <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded bg-[#F1EAD9]" />
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#E6DFD0] bg-[#FBF8F1] px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0E7490]">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-[#0E1111]">
              {fetchError ? 'Unable to load our team right now' : 'Our team listing is being updated'}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[#55605F]">
              {fetchError
                ? 'We could not reach our servers. Please check your connection and try again shortly.'
                : 'Psychologists added from the admin panel will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10 sm:gap-5">
            {displayList.map((psychologist) => (
              <article
                key={psychologist.id}
                className="group flex w-[calc(50%-0.5rem)] flex-col overflow-hidden rounded-xl border border-[#E6DFD0] bg-[#FBF8F1] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0E7490]/45 hover:shadow-[0_18px_36px_-26px_rgba(14,17,17,0.5)] sm:w-[calc(33.333%-0.834rem)] lg:w-[calc(25%-0.9375rem)]"
              >
                <button
                  type="button"
                  onClick={() => handleAdvisorClick(psychologist.id)}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#EDF5F7] cursor-pointer border-none"
                  aria-label={`View profile of ${psychologist.name}`}
                >
                  {psychologist.photo ? (
                    <img
                      src={psychologist.photo}
                      alt={psychologist.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#0E7490]/50">
                      {getInitial(psychologist.name)}
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <button
                    type="button"
                    onClick={() => handleAdvisorClick(psychologist.id)}
                    className="text-left text-[13px] font-semibold leading-snug text-[#0E1111] transition-colors group-hover:text-[#0E7490] cursor-pointer bg-transparent border-none p-0"
                  >
                    {psychologist.name}
                  </button>

                  <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#55605F]">
                    <BadgeCheck className="h-3 w-3 text-[#0E7490]" />
                    {psychologist.designation}
                  </span>

                  {psychologist.specialties.length > 0 && (
                    <span className="mt-2 line-clamp-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-[#0B5C73]">
                      {psychologist.specialties.slice(0, 2).join(' • ')}
                    </span>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B7674]">
                    {psychologist.rating && (
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        {psychologist.rating}
                      </span>
                    )}
                    {psychologist.fee != null && (
                      <span className="font-medium">₹{psychologist.fee}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      type="button"
                      onClick={() => onBookTherapist?.(psychologist.id)}
                      className="w-full rounded-lg bg-[#0E1111] px-3 py-2 text-[11.5px] font-semibold text-white transition-colors duration-200 hover:bg-[#0E7490] cursor-pointer border-none"
                    >
                      Book Session
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center text-center sm:mt-12">
          <button
            type="button"
            onClick={handleShowAll}
            className="group inline-flex items-center gap-2 rounded-xl border border-[#DED8C9] bg-white px-6 py-3 text-xs font-semibold text-[#0E1111] transition-all duration-200 hover:border-[#0E7490] hover:text-[#0B5C73] cursor-pointer sm:text-sm"
          >
            View All Psychologists
            <ArrowRight className="h-4 w-4 text-[#0E7490] transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
