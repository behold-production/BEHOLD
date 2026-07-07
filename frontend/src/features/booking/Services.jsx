import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ApiService from '../../shared/services/api';
import { calculateNextAvailable } from '../../shared/utils/dateFormatter';
import StackSlider from '../../shared/components/StackSlider';
import SectionHeader from '../../shared/components/SectionHeader';

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

export default function Services({ setView, onBookTherapist, siteSettings }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Recommended');
    const [visibleCount, setVisibleCount] = useState(5);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [expandedBios, setExpandedBios] = useState({});
    const [expandedSpecialties, setExpandedSpecialties] = useState({});

    const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
    const enablePsychology = settings.enablePsychology !== false;
    const enableCareerMentoring = settings.enableCareerMentoring !== false;

    // Reset visibleCount when search or filter changes
    const [prevSearch, setPrevSearch] = useState(searchTerm);
    const [prevFilter, setPrevFilter] = useState(activeFilter);
    const [prevSort, setPrevSort] = useState(sortBy);

    if (searchTerm !== prevSearch || activeFilter !== prevFilter || sortBy !== prevSort) {
        setPrevSearch(searchTerm);
        setPrevFilter(activeFilter);
        setPrevSort(sortBy);
        setVisibleCount(5);
    }

    const [advisors, setAdvisors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCounsellors = async () => {
            try {
                setIsLoading(true);
                const res = await ApiService.getCounsellors();
                if (res.success && res.data) {
                    const mapped = res.data.map(c => {
                        // Map Mongoose/backend fields to expected keys in the UI cards
                        return {
                            id: c.id,
                            name: c.name,
                            profilePic: c.profilePic || '',
                            role: c.title || 'Consultant Psychologist',
                            specialties: c.specialties && c.specialties.length > 0
                                ? c.specialties
                                : ['Anxiety Stress & Panic', 'Depression & Mood Concerns', 'Relationship'],
                            hours: c.hours || 0,
                            lang: c.lang || 'English, Malayalam',
                            price: c.price || 1200,
                            nextAvailable: calculateNextAvailable(c.availability, c.bookedSlots || []),
                            rating: c.rating || 5.0,
                            modes: c.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
                            isTopFive: c.isTopFive || false,
                            bio: c.bio || ''
                        };
                    });
                    setAdvisors(mapped);
                }
            } catch (err) {
                console.error("Failed to load counsellors from backend", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCounsellors();
    }, []);

    const filteredAndSortedAdvisors = advisors.filter(adv => {
        // Search by name or specialty
        const searchLower = searchTerm.toLowerCase();
        const specialtiesArr = Array.isArray(adv.specialties)
            ? adv.specialties
            : typeof adv.specialties === 'string'
                ? adv.specialties.split(',').map(s => s.trim()).filter(Boolean)
                : [];
        const matchesSearch =
            (adv.name && adv.name.toLowerCase().includes(searchLower)) ||
            specialtiesArr.some(s => s.toLowerCase().includes(searchLower)) ||
            (adv.role && adv.role.toLowerCase().includes(searchLower));

        // Filter by role category
        const matchesFilter = activeFilter === 'All' || (adv.role && adv.role.includes(activeFilter));
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Featured Top 5 psychologists always sorted first
        if (a.isTopFive && !b.isTopFive) return -1;
        if (!a.isTopFive && b.isTopFive) return 1;

        if (sortBy === 'Price: Low to High') return a.price - b.price;
        if (sortBy === 'Price: High to Low') return b.price - a.price;
        if (sortBy === 'Experience') return b.hours - a.hours;
        return 0; // Recommended (default order)
    });

    return (
        <motion.section
            id="services"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-12 pb-10 md:pb-24 text-surface-900 relative"
        >
            {/* DUAL COUPLING ROW */}
            <div className={`grid grid-cols-1 ${enableCareerMentoring && enablePsychology ? 'md:grid-cols-2' : ''} gap-8 items-stretch w-full mb-10`}>
                {enableCareerMentoring && (
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        key="career"
                        id="card-career"
                        className="bg-white border border-surface-200 rounded-[10px] shadow-square-light p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group h-full transition-shadow duration-300 hover:shadow-square-hover"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <span className="inline-block bg-surface-900 text-white px-3 py-1 text-sm font-semibold rounded-full">
                                        {settings.careerBadge || 'Career Mentoring'}
                                    </span>
                                    <h3 className="text-3xl sm:text-4xl font-black text-surface-900 group-hover:text-surface-600 transition-colors duration-300 leading-tight">
                                        {settings.careerTitle || 'Career Clarity & Direction'}
                                    </h3>
                                    <h4 className="text-sm font-bold text-surface-500">
                                        {settings.careerSubtitle || 'Feeling Unsure About What’s Next?'}
                                    </h4>
                                </div>
                            </div>
                            <p className="text-surface-600 text-base leading-relaxed font-normal">
                                {settings.careerDesc || 'Whether you’re choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction.'}
                            </p>
                        </div>

                        {enableCareerMentoring && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onBookTherapist) {
                                        onBookTherapist('career_1');
                                    } else {
                                        window.spaNavigate('/booking?service=career');
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full px-6 py-4 bg-brand text-surface-900 font-bold text-sm rounded-full hover:bg-brand-dark transition-all cursor-pointer text-center shadow-[0_4px_20px_rgba(0,229,255,0.3)] border-none"
                            >
                                {settings.careerBtnText || 'Book Your Mentor'}
                            </button>
                        )}
                    </motion.div>
                )}

                {enablePsychology && (
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        key="psychology"
                        id="card-psychology"
                        className="bg-surface-50 border border-surface-200 rounded-[10px] shadow-square-light p-6 sm:p-8 md:p-12 flex flex-col justify-between space-y-8 select-none group h-full transition-shadow duration-300 hover:shadow-square-hover"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <span className="inline-block bg-surface-200 text-surface-900 px-3 py-1 text-sm font-semibold rounded-full">
                                        {settings.counselBadge || 'Psychological Counselling'}
                                    </span>
                                    <h3 className="text-3xl sm:text-4xl font-black text-surface-900 group-hover:text-surface-600 transition-colors duration-300 leading-tight">
                                        {settings.counselTitle || 'Emotional Wellbeing & Support'}
                                    </h3>
                                    <h4 className="text-sm font-bold text-surface-500">
                                        {settings.counselSubtitle || 'You Don’t Have to Face It Alone.'}
                                    </h4>
                                </div>
                            </div>
                            <p className="text-surface-600 text-base leading-relaxed font-normal">
                                {settings.counselDesc || 'When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence.'}
                            </p>
                        </div>

                        {enablePsychology && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onBookTherapist) {
                                        onBookTherapist('counselling_1');
                                    } else {
                                        window.spaNavigate('/booking?service=counselling');
                                    }
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full px-6 py-4 bg-brand text-surface-900 font-bold text-sm rounded-full hover:bg-brand-dark transition-all cursor-pointer text-center border-none shadow-[0_4px_20px_rgba(0,229,255,0.3)]"
                            >
                                {settings.counselBtnText || 'Book Your Therapist'}
                            </button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* OUR EXPERTS SECTION */}
            <div id="our-experts" className="mt-20 md:mt-24 space-y-8">
                <SectionHeader
                    subtitle="OUR CLINICAL TEAM"
                    title="Meet Our Licensed Psychologists"
                    description="Professional, certified clinical professionals dedicated to supporting your recovery journey."
                    align="responsive"
                />

                {/* Dashboard-Style Toolbar */}
                <div className="bg-white border border-surface-200 p-4 flex flex-col xl:flex-row xl:items-center gap-4 w-full rounded-[10px]">
                    {/* Search Box */}
                    <div className="relative w-full xl:w-[260px] shrink-0">
                        <input
                            type="text"
                            placeholder="Search experts or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-surface-200 text-sm font-semibold focus:outline-none focus:border-surface-900 bg-white text-surface-900 transition-colors rounded-[10px] placeholder:text-surface-400 placeholder:normal-case placeholder:tracking-normal placeholder:font-medium"
                        />
                        <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Filter Tabs - scrollable horizontally on all sizes if needed */}
                    <div className="flex flex-row overflow-x-auto scrollbar-none snap-x gap-2 w-full flex-1 pb-1 xl:pb-0 min-w-0">
                        {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Psychiatrist', 'Career Mentor'].map(filter => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`flex items-center justify-center px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 snap-start border rounded-[10px] shadow-none ${activeFilter === filter
                                    ? 'bg-surface-900 text-white border-surface-900'
                                    : 'bg-surface-50 text-surface-500 border-surface-200 hover:border-surface-400'
                                    }`}
                            >
                                {filter === 'All' ? 'All Roles' : filter}
                            </button>
                        ))}
                    </div>

                    {/* Sort Selector & Grid/List View Toggles */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full xl:w-auto shrink-0">
                        <div className="relative flex-1 sm:w-[200px] shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 pr-10 py-3 border border-surface-200 text-sm font-semibold bg-white text-surface-900 focus:outline-none focus:border-surface-900 cursor-pointer appearance-none transition-colors rounded-[10px]"
                            >
                                <option value="Recommended">Sort: Recommended</option>
                                <option value="Price: Low to High">Price: Low to High</option>
                                <option value="Price: High to Low">Price: High to Low</option>
                                <option value="Experience">Experience (Most Hours)</option>
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-surface-400">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>

                        <div className="flex border border-surface-200 bg-white shrink-0 rounded-[10px]">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                                className={`w-12 h-[38px] transition-colors cursor-pointer flex items-center justify-center border-r border-surface-200 rounded-[10px] ${viewMode === 'grid' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-900 hover:bg-surface-50'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                                className={`w-12 h-[38px] transition-colors cursor-pointer flex items-center justify-center rounded-[10px] ${viewMode === 'list' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-900 hover:bg-surface-50'}`}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Directory Grid / List */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="square-card flex flex-col p-6 border-surface-200 bg-white min-h-[300px] animate-pulse"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-surface-200 rounded-[10px] shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 bg-surface-200 w-3/4" />
                                        <div className="h-4 bg-surface-200 w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <div className="h-4 bg-surface-100 w-full" />
                                    <div className="h-4 bg-surface-100 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : viewMode === 'grid' ? (
                    <StackSlider
                        desktopClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        mobileContainerClassName="relative w-full max-w-[400px] mx-auto h-[580px]"
                        items={filteredAndSortedAdvisors.slice(0, visibleCount)}
                        renderItem={(advisor) => (
                            <div
                                key={advisor.id}
                                className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 w-full flex flex-col h-full"
                            >
                                {/* Image Container */}
                                <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0">
                                    {advisor.profilePic ? (
                                        <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-4xl text-brand border-b border-gray-100 bg-surface-50">
                                            {getInitials(advisor.name)}
                                        </div>
                                    )}
                                    {/* Floating pill for experience */}
                                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/20">
                                        <span className="text-[10px] font-bold text-[#0F172A]">{advisor.hours >= 1000 ? '8+' : '5+'} Yrs Exp</span>
                                    </div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 flex flex-col flex-1">
                                    {/* Role Pill */}
                                    <div className="mb-4">
                                        <span className="inline-block bg-[#f4f8f9] text-[#0F172A] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider w-fit">
                                            {advisor.role || 'CONSULTANT PSYCHOLOGIST'}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-[#0F172A] mb-1.5">{advisor.name}</h3>

                                    {/* Languages */}
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-4">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                        {advisor.lang || 'English, Malayalam'}
                                    </div>

                                    {/* Bio */}
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1 mb-6">
                                        {advisor.bio || 'Professional consultant specializing in cognitive and behavioral assessments.'}
                                    </p>

                                    {/* CTA Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onBookTherapist) {
                                                onBookTherapist(advisor.id);
                                            } else {
                                                window.spaNavigate('/booking');
                                            }
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-3 rounded-[20px] border border-gray-200 bg-white text-[#0F172A] font-bold text-xs flex justify-center items-center hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer mt-auto shadow-sm"
                                    >
                                        Book Consultation
                                    </button>
                                </div>
                            </div>
                        )}
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        {filteredAndSortedAdvisors.slice(0, visibleCount).map(advisor => (
                            <div
                                key={advisor.id}
                                className="bg-white border border-surface-200 rounded-[10px] p-0 flex flex-col lg:flex-row group shadow-square-light hover:border-surface-300 transition-all duration-300"
                            >
                                {/* Left Column: Avatar & Name */}
                                <div className="p-6 flex lg:flex-col items-center lg:items-start gap-4 border-b lg:border-b-0 lg:border-r border-surface-200 bg-surface-50 lg:w-[250px] shrink-0">
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white text-brand flex items-center justify-center font-black text-2xl lg:text-3xl shrink-0 overflow-hidden border-[2px] border-brand rounded-full shadow-square-light">
                                        {advisor.profilePic ? (
                                            <img src={advisor.profilePic} alt={advisor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(advisor.name)
                                        )}
                                    </div>
                                    <div className="flex flex-col text-left space-y-1 min-w-0">
                                        <h4 className="font-black text-surface-900 text-xl leading-tight group-hover:text-surface-600 transition-colors duration-300">
                                            {advisor.name}
                                        </h4>
                                        <span className="inline-block text-[10px] font-bold text-surface-500">
                                            {advisor.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Middle Column: Specialties & Bio */}
                                <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-surface-200 bg-white">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black text-surface-900 mb-2 block">Specialties</span>
                                        <div className="flex flex-wrap gap-2">
                                            {(expandedSpecialties[advisor.id] ? advisor.specialties : advisor.specialties.slice(0, 2)).map((spec, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-surface-50 border border-surface-200 text-[10px] font-bold text-surface-600 rounded-[10px]"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                            {advisor.specialties.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedSpecialties(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                                                    className="px-2 py-1 bg-white border border-surface-200 text-[10px] font-black text-brand-dark rounded-[10px] hover:bg-surface-50 transition-colors cursor-pointer"
                                                >
                                                    {expandedSpecialties[advisor.id] ? '- Less' : `+ ${advisor.specialties.length - 2} More`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-surface-600 leading-relaxed">
                                        <p className={`italic ${expandedBios[advisor.id] ? '' : 'line-clamp-3'}`}>
                                            "{advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.'}"
                                        </p>
                                        {(advisor.bio || 'Consultant psychologist specializing in guidance and mental wellbeing.').length > 100 && (
                                            <button
                                                onClick={() => setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                                                className="text-brand-dark font-black hover:underline cursor-pointer text-[10px] mt-2"
                                            >
                                                {expandedBios[advisor.id] ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Stats & Actions Panel */}
                                <div className="flex flex-col lg:w-[220px] shrink-0 bg-surface-50">
                                    <div className="grid grid-cols-3 lg:grid-cols-1 lg:divide-y lg:divide-x-0 divide-x divide-surface-200 border-b border-surface-200 p-4">
                                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-2 px-1 lg:px-2 text-center lg:text-left">
                                            <span className="text-[10px] font-bold text-surface-500 order-last lg:order-first mt-1 lg:mt-0">Hours</span>
                                            <span className="font-black text-surface-900 text-lg tracking-tight">{advisor.hours.toLocaleString()}+</span>
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-2 px-1 lg:px-2 text-center lg:text-left">
                                            <span className="text-[10px] font-bold text-surface-500 order-last lg:order-first mt-1 lg:mt-0">Lang</span>
                                            <span className="font-black text-surface-900 text-sm tracking-tight truncate max-w-[80px]">{advisor.lang.split(',')[0]}</span>
                                        </div>
                                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-2 px-1 lg:px-2 text-center lg:text-left">
                                            <span className="text-[10px] font-bold text-surface-500 order-last lg:order-first mt-1 lg:mt-0">Cost</span>
                                            <span className="font-black text-surface-900 text-lg tracking-tight">₹{advisor.price.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col justify-center space-y-4 flex-1">
                                        {enablePsychology && (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-bold text-surface-500">Next open</span>
                                                <div className="flex items-center gap-2 bg-white px-2 py-1 border border-surface-200 rounded-[10px]">
                                                    <span className="w-2 h-2 bg-surface-900 rounded-[10px] animate-pulse" />
                                                    <span className="font-black text-surface-900 text-[10px]">{advisor.nextAvailable}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 mt-auto">
                                            <button
                                                type="button"
                                                onClick={() => window.spaNavigate(`/advisor/${advisor.id}`)}
                                                className={`px-4 py-3 bg-white border border-surface-200 text-surface-900 font-black text-[10px] rounded-[10px] hover:bg-surface-50 hover:border-surface-300 transition-colors cursor-pointer text-center flex items-center justify-center shadow-none`}
                                            >
                                                Profile
                                            </button>
                                            {enablePsychology && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (onBookTherapist) {
                                                            onBookTherapist(advisor.id);
                                                        } else {
                                                            window.spaNavigate('/booking');
                                                        }
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="px-4 py-3 bg-surface-900 text-white font-black text-[10px] rounded-[10px] hover:bg-surface-800 transition-colors cursor-pointer text-center flex items-center justify-center border-none shadow-none"
                                                >
                                                    Book
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredAndSortedAdvisors.length === 0 && (
                    <div className="text-center py-16 bg-surface-50 border border-surface-200">
                        <p className="text-slate-500 font-heading font-bold text-lg">No professionals found.</p>
                    </div>
                )}

                {!isLoading && filteredAndSortedAdvisors.length > visibleCount && (
                    <div className="flex justify-center mt-12">
                        <button
                            type="button"
                            onClick={() => {
                                setVisibleCount(prev => prev + 5);
                            }}
                            className="px-6 py-3 bg-white border border-surface-200 text-surface-900 font-black text-[10px] rounded-[10px] hover:bg-surface-50 hover:border-surface-300 transition-colors cursor-pointer text-center shadow-none"
                        >
                            Load More Professionals
                        </button>
                    </div>
                )}
            </div>

        </motion.section>
    );
}
