import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, ChevronRight, UserX, Compass, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
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

function AdvisorAvatar({ advisor, sizeClass = "w-16 h-16" }) {
    const [imgError, setImgError] = React.useState(false);

    return (
        <div className={`${sizeClass} rounded-full border-2 border-[#00E5FF] bg-white text-[#00E5FF] flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-sm`}>
            {advisor.profilePic && !imgError ? (
                <img
                    src={advisor.profilePic}
                    alt={advisor.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <span>{getInitials(advisor.name)}</span>
            )}
        </div>
    );
}

export default function Services({ setView, onBookTherapist, siteSettings, mode }) {
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

    const sectionId = mode === 'experts' ? 'counsellors' : 'services';

    return (
        <motion.section
            id={sectionId}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`max-w-7xl mx-auto px-4 sm:px-6 ${mode === 'experts' ? 'pt-4 md:pt-6' : 'pt-8 md:pt-16'} ${mode === 'intro' ? 'pb-4 md:pb-6' : 'pb-8 md:pb-16'} text-surface-900 relative`}
        >
            {/* DUAL COUPLING ROW */}
            {(!mode || mode === 'intro') && (
                <>
                    <div className="mb-10 text-center">
                        <SectionHeader
                            subtitle={settings.servicesSectionSub || "OUR MENTORSHIP SERVICES"}
                            title={settings.servicesSectionTitle || "Book Your Session"}
                            description={settings.servicesSectionDesc || "Access standard, expert counselling sessions and lifetime career mentoring."}
                            align="center"
                        />
                    </div>
                    <div className={`grid grid-cols-1 ${enableCareerMentoring && enablePsychology ? 'md:grid-cols-2' : ''} gap-8 items-stretch w-full mb-14`}>
                        {enableCareerMentoring && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-20px" }}
                                transition={{ duration: 0.5 }}
                                key="career"
                                id="card-career"
                                className="bg-white rounded-[8px] border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 p-5 sm:p-8 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs tracking-wider uppercase">
                                            <Compass className="w-4 h-4 text-slate-900" />
                                            <span>{settings.careerBadge || 'Career Mentoring'}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-[8px]">
                                            Lifetime Access
                                        </span>
                                    </div>

                                    {/* Main Title & Subtitle */}
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
                                        {settings.careerTitle || 'Career Clarity & Direction'}
                                    </h3>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-4">
                                        {settings.careerSubtitle || "Feeling Unsure About What's Next?"}
                                    </h4>

                                    {/* Description Paragraph */}
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        {settings.careerDesc || "Whether you're choosing a stream, exploring career options, or planning your future studies, we help you understand your strengths, interests, and opportunities so you can make confident decisions with clarity and direction."}
                                    </p>

                                    {/* Key Offerings List */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100 mb-8">
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Stream & Degree Selection Guidance</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Strengths & Aptitude Mapping</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Personalized Career Roadmap</span>
                                        </div>
                                    </div>
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
                                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-[8px] transition-all duration-200 cursor-pointer text-center shadow-xs flex items-center justify-center gap-2"
                                    >
                                        <span>{settings.careerBtnText || 'Book Your Mentor'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        )}

                        {enablePsychology && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-20px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                key="psychology"
                                id="card-psychology"
                                className="bg-white rounded-[8px] border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 p-5 sm:p-8 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                                        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs tracking-wider uppercase">
                                            <Heart className="w-4 h-4 text-rose-600" />
                                            <span>{settings.counselBadge || 'Psychological Counselling'}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-[8px]">
                                            Confidential & Safe
                                        </span>
                                    </div>

                                    {/* Main Title & Subtitle */}
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug mb-2">
                                        {settings.counselTitle || 'Emotional Wellbeing & Support'}
                                    </h3>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-4">
                                        {settings.counselSubtitle || "You Don't Have to Face It Alone."}
                                    </h4>

                                    {/* Description Paragraph */}
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        {settings.counselDesc || "When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference. Our counselling sessions provide a safe space to reflect, heal, grow, and move forward with confidence."}
                                    </p>

                                    {/* Key Offerings List */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100 mb-8">
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>Stress, Anxiety & Emotional Support</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>Licensed & Experienced Therapists</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                                            <span>100% Private & Non-Judgmental Space</span>
                                        </div>
                                    </div>
                                </div>

                                {enablePsychology && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onBookTherapist) {
                                                onBookTherapist('psychology_1');
                                            } else {
                                                window.spaNavigate('/booking?service=counseling');
                                            }
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-[8px] transition-all duration-200 cursor-pointer text-center shadow-xs flex items-center justify-center gap-2"
                                    >
                                        <span>{settings.counselBtnText || 'Book Your Therapist'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </div>
                </>
            )}

            {/* OUR EXPERTS SECTION */}
            {(!mode || mode === 'experts') && (
                <div id="our-experts" className={`${mode === 'experts' ? 'mt-0' : 'mt-20 md:mt-24'} space-y-8`}>
                    <SectionHeader
                        subtitle="OUR CLINICAL TEAM"
                        title="Meet Our Licensed Psychologists"
                        description="Professional, certified clinical professionals dedicated to supporting your recovery journey."
                        align="responsive"
                    />

                    {/* Dashboard-Style Toolbar */}
                    <div className="space-y-4 w-full">
                        {/* Tier 1: Category Filter Tabs */}
                        <div className="w-full bg-white border border-slate-200 shadow-xs p-3 px-4 rounded-[8px] overflow-hidden">
                            <div className="flex flex-row overflow-x-auto scrollbar-none snap-x gap-2 w-full min-w-0">
                                {['All', 'Consultant Psychologist', 'Clinical Psychologist', 'Psychiatrist', 'Career Mentor'].map(filter => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setActiveFilter(filter)}
                                        className={`flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 snap-start border rounded-[8px] shadow-none ${activeFilter === filter
                                            ? 'bg-surface-900 text-white border-surface-900'
                                            : 'bg-white text-surface-500 border-surface-200 hover:border-surface-400'
                                            }`}
                                    >
                                        {filter === 'All' ? 'All Roles' : filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tier 2: Search, Sort, and View Modes */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
                            {/* Search Box */}
                            <div className="relative w-full lg:w-[320px] shrink-0">
                                <input
                                    type="text"
                                    placeholder="Search experts or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 text-sm font-semibold focus:outline-none focus:border-surface-900 bg-white text-surface-900 transition-colors rounded-[8px] placeholder:text-surface-400 placeholder:normal-case placeholder:tracking-normal placeholder:font-medium"
                                />
                                <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>

                            {/* Sort Selector & View Toggles */}
                            <div className="flex flex-row items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 min-w-0">
                                <div className="relative flex-1 lg:w-[220px] lg:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 pr-10 py-2.5 border border-slate-200 text-sm font-semibold bg-white text-surface-900 focus:outline-none focus:border-surface-900 cursor-pointer appearance-none transition-colors rounded-[8px]"
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

                                <div className="flex border border-surface-200 bg-white shrink-0 rounded-[8px] p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('grid')}
                                        className={`w-10 h-[32px] transition-colors cursor-pointer flex items-center justify-center rounded-[6px] ${viewMode === 'grid' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-900 hover:bg-surface-50'}`}
                                        title="Grid View"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('list')}
                                        className={`w-10 h-[32px] transition-colors cursor-pointer flex items-center justify-center rounded-[6px] ${viewMode === 'list' ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-900 hover:bg-surface-50'}`}
                                        title="List View"
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Directory Grid / List */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-[8px] border border-slate-200 shadow-sm flex flex-col p-6 min-h-[300px] animate-pulse"
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
                            mobileContainerClassName="relative w-full max-w-[420px] mx-auto min-h-[540px]"
                            items={filteredAndSortedAdvisors.slice(0, visibleCount)}
                            renderItem={(advisor, idx) => (
                                <motion.div
                                    key={advisor.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                                    className="bg-white rounded-[8px] border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden group"
                                >
                                    <div>
                                        {/* Top Header: Avatar + Name & Role */}
                                        <div className="p-4 sm:p-6 pb-4 sm:pb-5 flex items-center gap-4 bg-white">
                                            <AdvisorAvatar advisor={advisor} sizeClass="w-16 h-16" />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                                                    {advisor.name}
                                                </h4>
                                                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 truncate">
                                                    {advisor.role || 'Consultant Psychologist'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100" />

                                        {/* Middle Section 1: Specialties & Bio Quote */}
                                        <div className="p-4 sm:p-6 py-3.5 sm:py-4 bg-white">
                                            <span className="text-xs font-bold text-slate-900 block mb-2.5">
                                                Specialties
                                            </span>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {(Array.isArray(advisor.specialties) && advisor.specialties.length > 0
                                                    ? advisor.specialties
                                                    : ['Stress', 'Anxiety', 'Relationship']
                                                ).slice(0, 3).map((spec, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-[8px]"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                                {Array.isArray(advisor.specialties) && advisor.specialties.length > 3 && (
                                                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-[8px]">
                                                        +{advisor.specialties.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm italic text-slate-600 leading-relaxed line-clamp-2">
                                                "{advisor.bio || 'Consultant psychologist specializing in mental health and well-being.'}"
                                            </p>
                                        </div>

                                        <div className="border-t border-slate-100" />

                                        {/* Middle Section 2: 3-Column Stats Grid */}
                                        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-100">
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center">
                                                <span className="font-bold text-lg sm:text-xl text-slate-900 leading-none">
                                                    {advisor.hours ? `${advisor.hours}+` : '2+'}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Hours</span>
                                            </div>
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center min-w-0">
                                                <span className="font-bold text-sm sm:text-base text-slate-900 leading-none truncate max-w-full px-1">
                                                    {advisor.lang ? advisor.lang.split(',')[0].trim() : 'Malayalam'}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Lang</span>
                                            </div>
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center">
                                                <span className="font-bold text-lg sm:text-xl text-slate-900 leading-none">
                                                    ₹{(advisor.price || 899).toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Cost</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Availability Badge + Profile & Book Buttons */}
                                    <div className="p-4 sm:p-6 pt-3.5 sm:pt-4 bg-white space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-700">Next open</span>
                                            <div className="flex items-center gap-2 bg-white px-3 py-1 border border-slate-200 rounded-full shadow-2xs">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="font-bold text-slate-800 text-xs">
                                                    {advisor.nextAvailable || 'Available Tomorrow'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.spaNavigate(`/advisor/${advisor.id}`);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm rounded-[8px] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer text-center flex items-center justify-center"
                                            >
                                                Profile
                                            </button>
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
                                                className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#26ebff] text-[#0a121e] font-black text-xs sm:text-sm rounded-[8px] transition-all cursor-pointer text-center flex items-center justify-center border-none shadow-[0_4px_15px_rgba(0,229,255,0.3)] active:scale-95"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        />
                    ) : (
                        <div className="flex flex-col gap-6">
                            {filteredAndSortedAdvisors.slice(0, visibleCount).map(advisor => (
                                <div
                                    key={advisor.id}
                                    className="bg-white rounded-[8px] border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div>
                                        {/* Top Header: Avatar + Name & Role */}
                                        <div className="p-4 sm:p-6 pb-4 sm:pb-5 flex items-center gap-4 bg-white">
                                            <AdvisorAvatar advisor={advisor} sizeClass="w-16 h-16" />
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-slate-700 transition-colors truncate">
                                                    {advisor.name}
                                                </h4>
                                                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 truncate">
                                                    {advisor.role || 'Consultant Psychologist'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100" />

                                        {/* Middle Section 1: Specialties & Bio Quote */}
                                        <div className="p-4 sm:p-6 py-3.5 sm:py-4 bg-white">
                                            <span className="text-xs font-bold text-slate-900 block mb-2.5">
                                                Specialties
                                            </span>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {(Array.isArray(advisor.specialties) && advisor.specialties.length > 0
                                                    ? advisor.specialties
                                                    : ['Stress', 'Anxiety', 'Relationship']
                                                ).slice(0, 3).map((spec, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-[8px]"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                                {Array.isArray(advisor.specialties) && advisor.specialties.length > 3 && (
                                                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-[8px]">
                                                        +{advisor.specialties.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs sm:text-sm italic text-slate-600 leading-relaxed line-clamp-2">
                                                "{advisor.bio || 'Consultant psychologist specializing in mental health and well-being.'}"
                                            </p>
                                        </div>

                                        <div className="border-t border-slate-100" />

                                        {/* Middle Section 2: 3-Column Stats Grid */}
                                        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-100">
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center">
                                                <span className="font-bold text-lg sm:text-xl text-slate-900 leading-none">
                                                    {advisor.hours ? `${advisor.hours}+` : '2+'}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Hours</span>
                                            </div>
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center min-w-0">
                                                <span className="font-bold text-sm sm:text-base text-slate-900 leading-none truncate max-w-full px-1">
                                                    {advisor.lang ? advisor.lang.split(',')[0].trim() : 'Malayalam'}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Lang</span>
                                            </div>
                                            <div className="p-3.5 sm:p-4 flex flex-col items-center justify-center text-center">
                                                <span className="font-bold text-lg sm:text-xl text-slate-900 leading-none">
                                                    ₹{(advisor.price || 899).toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-500 mt-1">Cost</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Availability Badge + Profile & Book Buttons */}
                                    <div className="p-4 sm:p-6 pt-3.5 sm:pt-4 bg-white space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-700">Next open</span>
                                            <div className="flex items-center gap-2 bg-white px-3 py-1 border border-slate-200 rounded-full shadow-2xs">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="font-bold text-slate-800 text-xs">
                                                    {advisor.nextAvailable || 'Available Tomorrow'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.spaNavigate(`/advisor/${advisor.id}`);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm rounded-[8px] hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer text-center flex items-center justify-center"
                                            >
                                                Profile
                                            </button>
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
                                                className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#26ebff] text-[#0a121e] font-black text-xs sm:text-sm rounded-[8px] transition-all cursor-pointer text-center flex items-center justify-center border-none shadow-[0_4px_15px_rgba(0,229,255,0.3)] active:scale-95"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredAndSortedAdvisors.length === 0 && (
                        <div className="text-center py-20 px-6 bg-white border border-slate-200 rounded-[8px] w-full shadow-sm my-8 animate-in fade-in duration-300">
                            <div className="mx-auto w-16 h-16 rounded-[8px] bg-slate-100 flex items-center justify-center text-slate-400 mb-4 ring-8 ring-slate-50">
                                <UserX className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-black text-slate-900 font-heading tracking-wide">
                                No Specialists Available
                            </h4>
                            <p className="text-slate-500 text-sm font-normal max-w-md mx-auto mt-2 leading-relaxed">
                                We couldn't find any professionals matching this filter right now. Try resetting your search query or role filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveFilter('All');
                                    setSearchTerm('');
                                }}
                                className="mt-6 px-7 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-[8px] text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer border-none"
                            >
                                Reset Filters
                            </button>
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
                </div>)}

        </motion.section>
    );
}
