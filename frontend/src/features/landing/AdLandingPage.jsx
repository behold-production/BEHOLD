import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Send, 
  User, 
  Mail, 
  Phone, 
  HeartHandshake, 
  Video, 
  CreditCard, 
  Award, 
  GraduationCap,
  Globe,
  Languages,
  X,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';
import { trackLead, trackContact, trackViewContent, setMetaUserData, trackInitiateCheckout } from '../../utils/metaPixel';
import { formatExperience } from '../../utils/formatters';
import clinicImage from '../../assets/luxury_clinic_room.png';
import headerBg from '../../assets/header.svg';

const getInitial = (name) => {
  if (!name) return 'P';
  const cleanName = String(name).replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

// Social proof booking activity list for high conversion
const RECENT_BOOKINGS = [
  { name: 'Swalih', time: 'Just now', location: 'Calicut' },
  { name: 'Karthika', time: '4m ago', location: 'Kochi' },
  { name: 'Jasir', time: '8m ago', location: 'Malappuram' },
  { name: 'Fathima', time: '12m ago', location: 'Trivandrum' },
  { name: 'Rahul', time: '15m ago', location: 'Kannur' },
  { name: 'Anjali', time: '19m ago', location: 'Thrissur' }
];



export default function AdLandingPage({ onOpenBooking, onSelectAdvisor, siteSettings, onOpenDocs }) {
  const settings = siteSettings || {};

  // Dynamic Content with Fallbacks
  const heroTitle = settings.adHeroTitle || "മനസ്സിലാക്കപ്പെടുന്നത് ഇവിടെ തുടങ്ങുന്നു.";
  const heroSub = settings.adHeroSub || "Qualified psychologists-നൊപ്പം, വീട്ടിലിരുന്ന് തന്നെ ഒന്ന് തുറന്നു സംസാരിക്കാം. വെറും ₹" + (settings.adHeroPrice || 899) + "-ന് ഒരു session ബുക്ക് ചെയ്യാം.";
  const heroPrice = Number(settings.adHeroPrice) || 899;
  const heroBtnText = settings.adHeroBtnText || "Book My Session";
  const heroImg = settings.adHeroImage || clinicImage;

  const trustBadge1Title = settings.adTrustBadge1Title || "11 Qualified";
  const trustBadge1Sub = settings.adTrustBadge1Sub || "Psychologists";
  const trustBadge2Title = settings.adTrustBadge2Title || "100% Confidential";
  const trustBadge2Sub = settings.adTrustBadge2Sub || "Strict Privacy Ethics";
  const trustBadge3Title = settings.adTrustBadge3Title || "Malayalam & English";
  const trustBadge3Sub = settings.adTrustBadge3Sub || "Sessions Available";
  const trustBadge4Title = settings.adTrustBadge4Title || "Secure Online Payment";
  const trustBadge4Sub = settings.adTrustBadge4Sub || "Instant UPI & Cards";

  const reflectionTitle = settings.adReflectionTitle || "ഇത് നിങ്ങൾക്ക് പരിചയമുള്ളതാണോ?";
  const reflectionPrompt1 = settings.adReflectionPrompt1 || "എപ്പോഴും ക്ഷീണം തോന്നാറുണ്ടോ, rest എടുത്തിട്ടും?";
  const reflectionPrompt2 = settings.adReflectionPrompt2 || "ചിന്തകൾ നിർത്താൻ പറ്റാതെ, രാത്രി ഉറക്കം കിട്ടാതെ ആണോ?";
  const reflectionPrompt3 = settings.adReflectionPrompt3 || "Work-ന്റെ stress വീട്ടിലേക്കും കൂടെ വരാറുണ്ടോ?";
  const reflectionPrompt4 = settings.adReflectionPrompt4 || "എന്തോ ഒന്ന് missing ആണെന്ന് തോന്നാറുണ്ടോ, പക്ഷെ എന്താണെന്ന് exactly അറിയില്ലേ?";

  const psychologistTitle = settings.adPsychologistTitle || "നിങ്ങൾക്കൊപ്പം സംസാരിക്കുന്നത് ഇവരാണ്";
  const psychologistSub = settings.adPsychologistSub || "Qualified. Experienced. Judgment-free. നിങ്ങളുടെ concern-ന് ചേരുന്ന ഒരാളെ തിരഞ്ഞെടുക്കൂ.";

  const videoTitle = settings.adVideoTitle || "How It Works";
  const videoSub = settings.adVideoSub || "ലളിതമായ 3 ഘട്ടങ്ങളിലൂടെ ഒരു session ബുക്ക് ചെയ്യാം.";
  const videoUrl = settings.adVideoUrl || "";


  // Counsellor list state
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [expandedBios, setExpandedBios] = useState({});

  // Video interactive state
  const [activeStep, setActiveStep] = useState(0);



  // Social Proof Toast State
  const [currentSocialIndex, setCurrentSocialIndex] = useState(0);
  const [showSocialToast, setShowSocialToast] = useState(false);
  const [socialToastDismissed, setSocialToastDismissed] = useState(false);

  // Carousel ref
  const carouselRef = useRef(null);

  // Social Proof Auto-Rotation Loop
  useEffect(() => {
    if (socialToastDismissed) return;

    const initialTimer = setTimeout(() => {
      setShowSocialToast(true);
    }, 2500);

    const interval = setInterval(() => {
      setShowSocialToast(false);
      setTimeout(() => {
        setCurrentSocialIndex((prev) => (prev + 1) % RECENT_BOOKINGS.length);
        setShowSocialToast(true);
      }, 1000);
    }, 7000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [socialToastDismissed]);

  useEffect(() => {
    trackViewContent({
      content_name: 'Ad Landing Page - Malayalam Psychological Counselling',
      content_category: 'Healthcare Paid Campaign'
    });

    const fetchAdvisors = async () => {
      try {
        const res = await ApiService.getCounsellors();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const list = res.data.map(c => {
            const rawPhoto = c.profilePic || c.photo || c.avatar || c.profilePicture || c.image || c.user?.profilePic;
            const hasValidPhoto = rawPhoto && typeof rawPhoto === 'string' && rawPhoto.trim().length > 0 && !rawPhoto.includes('via.placeholder');
            const rawHoursVal = (c.hours !== undefined && c.hours !== null && c.hours !== '') ? Number(c.hours) : (typeof c.experience === 'number' ? c.experience : (parseInt(c.experience, 10) || 0));
            const expData = formatExperience(rawHoursVal);
            const customTitle = c.title || (c.designation && c.designation.toLowerCase() !== 'counsellor' ? c.designation : null) || (c.role && c.role.toLowerCase() !== 'counsellor' ? c.role : null) || 'Consultant Psychologist';
            
            return {
              id: c.id || c._id,
              name: c.name || c.user?.name || c.fullName || 'Consultant Psychologist',
              title: customTitle,
              designation: customTitle,
              fee: Number(c.fee || c.price || heroPrice),
              halfSessionPrice: Number(c.halfSessionPrice || Math.round((c.fee || c.price || heroPrice) * 0.5)),
              hours: expData.rawHours,
              expYears: expData.years,
              bio: c.bio || 'Specializing in compassionate psychological counselling, stress management, and mental wellbeing.',
              specialties: Array.isArray(c.specialties) ? c.specialties : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : ['Anxiety & Stress', 'Depression', 'Personal Growth']),
              photo: hasValidPhoto ? rawPhoto : null,
              languages: Array.isArray(c.lang) ? c.lang.join(', ') : (c.lang || (Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'Malayalam, English')))
            };
          });
          setAdvisors(list);
        } else {
          setAdvisors([
            {
              id: 'c1',
              name: 'Dr. Sarah Thomas',
              title: 'Senior Clinical Psychologist',
              designation: 'Senior Clinical Psychologist',
              fee: heroPrice,
              halfSessionPrice: 499,
              hours: 1200,
              expYears: '1,200+ Hours Consulted',
              bio: 'Specializing in compassionate psychological counselling, stress management, and mental wellbeing.',
              specialties: ['Anxiety & Stress', 'Depression', 'Self Esteem'],
              photo: null,
              languages: 'Malayalam, English'
            },
            {
              id: 'c2',
              name: 'Dr. Rahul Varma',
              title: 'Counselling Psychologist & Mentor',
              designation: 'Counselling Psychologist & Mentor',
              fee: heroPrice,
              halfSessionPrice: 499,
              hours: 950,
              expYears: '950+ Hours Consulted',
              bio: 'Specializing in emotional resilience, burnout recovery, and personalized roadmap creation.',
              specialties: ['Career Stress', 'Relationship Guidance', 'Burnout'],
              photo: null,
              languages: 'Malayalam, English'
            },
            {
              id: 'c3',
              name: 'Dr. Ananya Nair',
              title: 'Child & Adolescent Specialist',
              designation: 'Child & Adolescent Specialist',
              fee: heroPrice,
              halfSessionPrice: 499,
              hours: 1500,
              expYears: '1,500+ Hours Consulted',
              bio: 'Dedicated to helping individuals discover clarity, build self-worth, and thrive.',
              specialties: ['Emotional Resilience', 'Identity Concerns', 'Mindfulness'],
              photo: null,
              languages: 'Malayalam, English'
            }
          ]);
        }
      } catch (e) {
        console.warn('Failed to load advisors for ad landing page', e);
        setAdvisors([
          {
            id: 'c1',
            name: 'Dr. Sarah Thomas',
            title: 'Senior Clinical Psychologist',
            fee: heroPrice,
            halfSessionPrice: 499,
            hours: 1200,
            bio: 'Specializing in compassionate psychological counselling, stress management, and mental wellbeing.',
            specialties: ['Anxiety & Stress', 'Depression', 'Self Esteem'],
            photo: null,
            languages: 'Malayalam, English'
          }
        ]);
      } finally {
        setLoadingAdvisors(false);
      }
    };

    fetchAdvisors();
  }, [heroPrice]);

  const handleBook = (advisorId = null) => {
    trackInitiateCheckout({
      content_name: 'Book My Session Click',
      content_category: 'Ad Campaign CTA',
      value: heroPrice,
      currency: 'INR'
    });

    if (advisorId && onSelectAdvisor) {
      onSelectAdvisor(advisorId);
    }
    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  const handleScrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 374;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const bookingSteps = [
    {
      title: "1. Psychologist-നെ തിരഞ്ഞെടുക്കുക",
      desc: "നിങ്ങളുടെ പ്രത്യേക വിഷയം, ഭാഷ, അനുഭവം എന്നിവയ്ക്കനുസരിച്ച് വിദഗ്ദ്ധരെ തിരഞ്ഞെടുക്കൂ.",
      badge: "Step 1"
    },
    {
      title: "2. തീയതിയും സമയവും നിശ്ചയിക്കുക",
      desc: "വീട്ടിലിരുന്ന് സുരക്ഷിതമായ ഓൺലൈൻ വീഡിയോ വഴി സംസാരിക്കാനുള്ള സമയം തിരഞ്ഞെടുക്കൂ.",
      badge: "Step 2"
    },
    {
      title: "3. സുരക്ഷിതമായി ബുക്ക് ചെയ്യുക",
      desc: `വെറും ₹${heroPrice}-ന് ബുക്കിംഗ് പൂർത്തിയാക്കൂ. ലിങ്ക് WhatsApp/Email വഴി ഉടൻ ലഭിക്കും.`,
      badge: "Step 3"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden pb-28 sm:pb-12">
      <SEO 
        title={`BEHOLD | ${heroTitle} - Confidential Online Counselling`} 
        description={heroSub} 
        canonicalUrl="https://www.behold.co.in/bookmysession"
      />

      {/* ── TOP FOCUSED BRAND BAR (Clean & Direct) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline">
              {(settings.siteName || 'BEHOLD').replace(/\.$/, '')}<span className="text-[#00c9d6] font-black text-2xl leading-none">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBook()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95 border-none"
            >
              <span>{heroBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO SECTION ── */}
      <section className="relative pt-8 sm:pt-14 pb-10 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle ambient light glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00c9d6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Image / Visual Card */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              <img
                src={heroImg}
                alt="BEHOLD Calm & Confidential Counselling Room"
                className="w-full h-[280px] xs:h-[340px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* RIGHT: High-Converting Headline & Subtitle */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00c9d6]/15 border border-[#00c9d6]/30 text-slate-900 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#008b94]" />
                <span>{settings.adHeroEyebrow || "Professional Mental Wellbeing Care"}</span>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.25]">
                {heroTitle.includes(" ") ? (
                  <>
                    {heroTitle.split(" ").slice(0, -2).join(" ")} <br className="hidden sm:inline" />
                    <span className="text-[#008b94] font-black underline decoration-[#00c9d6]/50 underline-offset-4">
                      {heroTitle.split(" ").slice(-2).join(" ")}
                    </span>
                  </>
                ) : (
                  <span className="text-[#008b94] font-black">{heroTitle}</span>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal pt-1">
                {heroSub}
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => handleBook()}
                className="px-8 py-4 rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-black text-base tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5 text-center active:scale-98 border-none"
              >
                <span>{heroBtnText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Private, Judgment-Free, & Secure Online Booking.</span>
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: DEDICATED TRUST BAR ── */}
      <section className="w-full bg-slate-900 text-white py-6 border-y border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
            
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#00c9d6]/10 border border-[#00c9d6]/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-[#00c9d6]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{trustBadge1Title}</h4>
                <p className="text-[11px] text-slate-400">{trustBadge1Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{trustBadge2Title}</h4>
                <p className="text-[11px] text-slate-400">{trustBadge2Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{trustBadge3Title}</h4>
                <p className="text-[11px] text-slate-400">{trustBadge3Sub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{trustBadge4Title}</h4>
                <p className="text-[11px] text-slate-400">{trustBadge4Sub}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: PROBLEM REFLECTION SECTION ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        
        <div className="mb-10 text-center">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {reflectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {reflectionPrompt1}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Constant emotional fatigue that sleep alone doesn't fix.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {reflectionPrompt2}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Overthinking cycles disrupting your peace and restful sleep.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {reflectionPrompt3}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Workplace pressure spilling over into personal and family life.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {reflectionPrompt4}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Feeling a quiet void or confusion without knowing the exact root cause.
              </p>
            </div>
          </div>

        </div>



      </section>

      {/* ── SECTION 4: MEET THE PSYCHOLOGISTS ── */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden">
        {/* Header container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {psychologistTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl font-normal leading-relaxed">
                {psychologistSub}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                onClick={() => handleScrollCarousel('left')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
                aria-label="Previous psychologist"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs hover:shadow-sm transition-all cursor-pointer active:scale-95"
                aria-label="Next psychologist"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width carousel track with edge fades and smooth padding */}
        <div className="relative w-full">
          {/* Left Edge Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          
          {/* Right Edge Fade Mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto py-4 px-4 sm:px-6 md:px-8 lg:px-[max(calc((100vw-80rem)/2+2rem),2rem)] scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {advisors.map((advisor) => {
              const cardTitle = advisor.title || advisor.designation || 'Consultant Psychologist';
              const minFee = advisor.fee || heroPrice;

              return (
                <div
                  key={advisor.id}
                  className="min-w-[300px] xs:min-w-[320px] sm:min-w-[350px] max-w-[350px] snap-start bg-white rounded-[24px] border border-slate-200/90 shadow-md hover:shadow-xl hover:border-[#00c9d6] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left group shrink-0"
                >
                  <div className="relative w-full h-[120px] sm:h-[135px] p-4 bg-gradient-to-r from-[#bcf4f8] via-[#d7f9fb] to-[#a8eff4] flex items-start justify-between overflow-hidden shrink-0 rounded-t-[24px]">
                    <div className="pr-2 space-y-1 z-10 max-w-[65%]">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-sans text-base sm:text-lg font-extrabold text-slate-900 leading-tight line-clamp-1">
                          {advisor.name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-[#008b94] shrink-0" title="Verified Professional" />
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-700 tracking-wide line-clamp-1">
                        {cardTitle}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-[#008b94] shadow-2xs">
                          ★ 4.9 Rating
                        </span>
                      </div>
                    </div>

                    <div className="w-[100px] sm:w-[115px] h-[120px] sm:h-[135px] absolute right-2 bottom-0 z-10 flex items-end justify-center pointer-events-none">
                      {advisor.photo ? (
                        <img
                          src={advisor.photo}
                          alt={advisor.name}
                          className="w-full h-full object-cover object-top filter brightness-[1.02] drop-shadow-sm rounded-t-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/95 shadow-md flex items-center justify-center mb-2 border border-white">
                          <span className="font-bold text-xl text-[#00c9d6]">
                            {getInitial(advisor.name)}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'none' }} className="w-14 h-14 rounded-2xl bg-white/95 shadow-md items-center justify-center mb-2 border border-white">
                        <span className="font-bold text-xl text-[#00c9d6]">
                          {getInitial(advisor.name)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialties:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                        {Array.isArray(advisor.specialties) && advisor.specialties.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-800 text-[10.5px] font-semibold rounded-lg whitespace-nowrap shrink-0"
                          >
                            {typeof spec === 'string' ? spec : (spec?.name || String(spec))}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                      <p className={`text-[11px] text-slate-700 italic font-medium leading-relaxed ${expandedBios[advisor.id] ? 'max-h-[90px] overflow-y-auto pr-1' : 'line-clamp-2'}`}>
                        "{advisor.bio || 'Specializing in compassionate psychological counselling and mental wellbeing.'}"
                      </p>
                      {advisor.bio && advisor.bio.length > 50 && (
                        <button
                          type="button"
                          onClick={() => setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                          className="text-[10px] font-bold text-[#00c9d6] hover:text-[#008b94] cursor-pointer mt-1 inline-block"
                        >
                          {expandedBios[advisor.id] ? 'Read Less ▲' : 'Read More ▼'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 shrink-0">
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left">
                        <span className="text-xs font-bold text-slate-900 block leading-none">
                          {advisor.hours ? `${advisor.hours.toLocaleString()}+` : '500+'}
                        </span>
                        <span className="text-[9px] font-medium text-slate-500 block mt-1">Consult Hours</span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left min-w-0" title={advisor.languages}>
                        <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                          {advisor.languages}
                        </span>
                        <span className="text-[9px] font-medium text-slate-500 block mt-1">Languages</span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left">
                        <span className="text-xs font-bold text-slate-900 block leading-none">₹{minFee}</span>
                        <span className="text-[9px] font-medium text-slate-500 block mt-1">Fee per session</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-[9px] font-semibold text-slate-400 block tracking-wider uppercase">Next Available</span>
                        <span className="text-[11px] font-bold text-emerald-600 block mt-0.5 whitespace-nowrap">Available Today</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBook(advisor.id)}
                        className="bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap border-none"
                      >
                        {heroBtnText}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: VIDEO & HOW IT WORKS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6 text-left">
          
          {/* VIDEO OR INTERACTIVE WALKTHROUGH */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {videoTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {videoSub}
            </p>
          </div>

          {videoUrl ? (
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-200 shadow-xl">
              <iframe
                src={videoUrl}
                title={videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-200 shadow-xl flex items-center justify-center group">
              <img
                src={settings.adVideoPoster || headerBg}
                alt="Booking Process"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="relative z-10 text-center p-6 space-y-3">
                <button
                  onClick={() => handleBook()}
                  className="w-16 h-16 rounded-full bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer border-none"
                  aria-label="Start Booking"
                >
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                </button>
                <div className="text-white">
                  <h4 className="text-sm sm:text-base font-bold">Interactive Booking Walkthrough</h4>
                  <p className="text-xs text-slate-400">Click to start picking a session slot now</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3.5 pt-2">
            {bookingSteps.map((step, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  activeStep === idx 
                    ? 'bg-white border-[#00c9d6] shadow-md ring-2 ring-[#00c9d6]/20' 
                    : 'bg-white/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  activeStep === idx ? 'bg-[#00c9d6] text-slate-950' : 'bg-slate-100 text-slate-600'
                }`}>
                  {step.badge}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 font-normal leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleBook()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              <span>{heroBtnText} Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>



      {/* ── LIVE SOCIAL PROOF POPUP NOTIFICATION ── */}
      {showSocialToast && !socialToastDismissed && (
        <aside 
          aria-live="polite"
          aria-label="Recent booking notification"
          className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-200/90 flex items-center gap-3.5 max-w-[320px] text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  {RECENT_BOOKINGS[currentSocialIndex].name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  ✓ Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Booked a Confidential Session
              </p>
              <p className="text-[10px] text-slate-400">
                {RECENT_BOOKINGS[currentSocialIndex].time} • {RECENT_BOOKINGS[currentSocialIndex].location}
              </p>
            </div>

            <button
              onClick={() => setSocialToastDismissed(true)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer border-none bg-transparent"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ── STICKY BOTTOM MOBILE CTA BAR (High Mobile Conversion & Safe Area Support) ── */}
      <nav 
        aria-label="Sticky booking action bar"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center sm:hidden"
      >
        <button
          onClick={() => handleBook()}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#00c9d6] active:bg-[#00b5c2] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border-none"
        >
          <span>{heroBtnText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

    </div>
  );
}
