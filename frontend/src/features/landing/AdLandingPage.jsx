import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight,
  Lock,
  CreditCard,
  GraduationCap,
  Languages,
  X,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  HelpCircle,
  Smile,
  Moon
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';
import { trackViewContent, trackInitiateCheckout } from '../../utils/metaPixel';
import { formatExperience } from '../../utils/formatters';
import clinicImage from '../../assets/luxury_clinic_room.png';
import headerBg from '../../assets/header.svg';

const getInitial = (name) => {
  if (!name) return 'P';
  const cleanName = String(name).replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

export default function AdLandingPage({ onOpenBooking, onSelectAdvisor, siteSettings, onOpenDocs }) {
  const navigate = useNavigate();
  const settings = siteSettings || {};

  // Dynamic Content with Fallbacks
  const heroTitleLine1 = "നിങ്ങളെ നിങ്ങളായി മനസ്സിലാക്കാൻ ഒരു ഇടം.";
  const heroTitleLine2 = "നിങ്ങൾക്ക് വേണ്ടത് ഒന്ന് തുറന്നു സംസാരിക്കാൻ ഒരാളാണ്.";
  const heroSub = settings.adHeroSub || "Qualified psychologists – നൊപ്പം,ഒന്ന് തുറന്നു സംസാരിക്കാം.";
  const heroPrice = Number(settings.adHeroPrice) || 899;
  const heroBtnText = "Book My Session";
  const heroImg = settings.adHeroImage || clinicImage;

  // Reflection Section Content
  const reflectionTitle = "ഇങ്ങനെ നിങ്ങൾക്കും അനുഭവപ്പെട്ടിട്ടുണ്ടോ?";
  const reflectionSub = "Does this feel familiar?";
  const reflectionClosing = "ഇത് weakness അല്ല. ഇത് ഒന്ന് സംസാരിക്കേണ്ട സമയമാണ്.";

  // Psychologists Showcase Content
  const psychologistHeading = "നിങ്ങളോടൊപ്പം ഇവരുണ്ട്.";
  const psychologistIntro = "Qualified. Experienced. Judgment-free. നിങ്ങളുടെ concern-ന് ചേരുന്ന ഒരാളെ തിരഞ്ഞെടുക്കൂ.";

  // FAQ Content
  const faqs = [
    {
      q: "ഇത് confidential ആണോ?",
      a: "100%. നിങ്ങളുടെ വിവരങ്ങൾ ആരുമായും share ചെയ്യില്ല. എല്ലാ സെഷനുകളും പൂർണ്ണമായും സ്വകാര്യവും പ്രൊഫഷണൽ എത്തിക്സ് പ്രകാരം സുരക്ഷിതവുമാണ്."
    },
    {
      q: "Session reschedule/cancel ചെയ്യാൻ പറ്റുമോ?",
      a: "Yes, 4 hours മുൻപ് notice തന്നാൽ reschedule ചെയ്യാം."
    },
    {
      q: "Payment കഴിഞ്ഞാൽ എന്ത് സംഭവിക്കും?",
      a: "Booking confirm ആയി, session link WhatsApp/Email വഴി ലഭിക്കും."
    },
    {
      q: "എനിക്ക് ഇഷ്ടമുള്ള psychologist-നെ choose ചെയ്യാൻ പറ്റുമോ?",
      a: "തീർച്ചയായും. Concern-ന് അനുസരിച്ച് ആളെ select ചെയ്യാം."
    },
    {
      q: "Sessions Malayalam-ൽ മാത്രമേ ഉള്ളൂവോ?",
      a: "ഇല്ല, Malayalam-ലും English-ലും sessions ലഭ്യമാണ്."
    }
  ];

  // Counsellor list state
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [expandedBios, setExpandedBios] = useState({});

  // Video interactive state
  const [activeStep, setActiveStep] = useState(0);

  // FAQ Accordion State (first open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Carousel ref
  const carouselRef = useRef(null);

  // Sequential dual-popup state
  const [activePopup, setActivePopup] = useState(null); // null | 1 | 2
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);

  const popups = [
    {
      id: 1,
      label: 'A Gentle Reminder',
      message: 'You deserve better sleep.',
      icon: Moon,
    },
    {
      id: 2,
      label: 'Just for You',
      message: 'You deserve a better smile.',
      icon: Smile,
    }
  ];

  // Sequential popup orchestration: popup 1 at 4s, popup 2 at 11s
  useEffect(() => {
    if (popupDismissed) return;

    // Popup 1: appear at 4s, auto-hide at 9s
    const show1 = setTimeout(() => {
      setActivePopup(1);
      setPopupVisible(true);
    }, 4000);

    const hide1 = setTimeout(() => {
      setPopupVisible(false);
      setTimeout(() => setActivePopup(null), 400);
    }, 9000);

    // Popup 2: appear at 11s, auto-hide at 16s
    const show2 = setTimeout(() => {
      setActivePopup(2);
      setPopupVisible(true);
    }, 11000);

    const hide2 = setTimeout(() => {
      setPopupVisible(false);
      setTimeout(() => setActivePopup(null), 400);
    }, 16000);

    return () => {
      clearTimeout(show1);
      clearTimeout(hide1);
      clearTimeout(show2);
      clearTimeout(hide2);
    };
  }, [popupDismissed]);

  const handleDismissPopup = () => {
    setPopupVisible(false);
    setTimeout(() => setActivePopup(null), 400);
    setPopupDismissed(true);
  };


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
    } else {
      navigate('/booking' + (advisorId ? `?counsellorId=${advisorId}` : ''));
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
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden flex flex-col justify-between">
      <SEO
        title={`BEHOLD | ${heroTitleLine1} - Confidential Online Counselling`}
        description={heroSub}
        canonicalUrl="https://www.behold.co.in/bookmysession"
      />

      {/* ── TOP FOCUSED BRAND BAR (Clean, Distraction-Free) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight flex items-baseline">
              {(settings.siteName || 'BEHOLD').replace(/\.$/, '')}<span className="text-[#00c9d6] font-semibold text-2xl leading-none">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBook()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-semibold bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.97] border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
            >
              <span>{heroBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO SECTION ── */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* RIGHT: High-Converting Headline & Subtitle (No internal trust badges) */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="space-y-4">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-950 tracking-tight leading-[1.3] space-y-2">
                <span className="block text-slate-900 font-extrabold">
                  {heroTitleLine1}
                </span>
                <span className="block text-[#008b94] font-extrabold">
                  {heroTitleLine2}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-900 leading-relaxed font-bold pt-1">
                {heroSub}
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={() => handleBook()}
                className="px-8 py-4 rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-semibold text-base tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5 text-center active:scale-[0.98] border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
              >
                <span>{heroBtnText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: DEDICATED TRUST BAR ── */}
      <section className="w-full bg-slate-950 text-white py-6 border-y border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">

            {/* Trust Item 1 */}
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-11 h-11 rounded-2xl bg-[#00c9d6]/15 border border-[#00c9d6]/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-[#00c9d6]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Qualified Psychologists
                </h4>
                <p className="text-[11px] text-slate-400">Certified & Verified Experts</p>
              </div>
            </div>

            {/* Trust Item 2 */}
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  100% Confidential
                </h4>
                <p className="text-[11px] text-slate-400">Strict Privacy Ethics</p>
              </div>
            </div>

            {/* Trust Item 3 */}
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Malayalam & English Sessions
                </h4>
                <p className="text-[11px] text-slate-400">Speak In Your Comfort Language</p>
              </div>
            </div>

            {/* Trust Item 4 */}
            <div className="flex items-center gap-3 p-2 text-left">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Secure Online Payment
                </h4>
                <p className="text-[11px] text-slate-400">UPI, Cards & NetBanking</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: PROBLEM REFLECTION SECTION ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">

        <div className="mb-10 text-center space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#008b94] bg-[#00c9d6]/10 px-3.5 py-1 rounded-full border border-[#00c9d6]/25">
            {reflectionSub}
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            {reflectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#00c9d6]/50 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                rest എടുത്തിട്ടും, എപ്പോഴും ക്ഷീണം തോന്നാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#00c9d6]/50 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                ചിന്തകൾ നിർത്താൻ പറ്റാതെ, രാത്രി ഉറക്കം കിട്ടാതിരിക്കാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#00c9d6]/50 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                Work-ന്റെ stress വീട്ടിലേക്കും കൂടെ വരാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#00c9d6]/50 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-snug">
                എന്തോ ഒന്ന് missing ആണെന്ന് തോന്നാറുണ്ടോ, പക്ഷെ എന്താണെന്ന് exactly അറിയില്ലേ?
              </h3>
            </div>
          </div>

        </div>

        {/* Reassuring Closing Line */}
        <div className="bg-gradient-to-r from-teal-50 via-[#e6fafc] to-emerald-50 border border-[#00c9d6]/30 rounded-2xl p-5 sm:p-6 flex items-center justify-center gap-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-[#008b94] shrink-0" />
          <p className="text-sm sm:text-base md:text-lg font-bold text-slate-950 tracking-tight">
            {reflectionClosing}
          </p>
        </div>

      </section>

      {/* ── SECTION 4: MEET THE PSYCHOLOGISTS ── */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header container */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
                {psychologistHeading}
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 mt-1.5 max-w-2xl font-bold leading-relaxed">
                {psychologistIntro}
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

          {/* Carousel container */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto py-4 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
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
                          <h3 className="font-sans text-base sm:text-lg font-semibold text-slate-900 leading-tight line-clamp-1">
                            {advisor.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-[#008b94] shrink-0" title="Verified Professional" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-semibold text-slate-700 tracking-wide line-clamp-1">
                          {cardTitle}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/80 text-[#008b94] shadow-2xs">
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
                            <span className="font-semibold text-xl text-[#00c9d6]">
                              {getInitial(advisor.name)}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'none' }} className="w-14 h-14 rounded-2xl bg-white/95 shadow-md items-center justify-center mb-2 border border-white">
                          <span className="font-semibold text-xl text-[#00c9d6]">
                            {getInitial(advisor.name)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Specialties:</span>
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
                        <p className={`text-xs text-slate-700 font-normal leading-relaxed ${expandedBios[advisor.id] ? 'max-h-[90px] overflow-y-auto pr-1' : 'line-clamp-2'}`}>
                          "{advisor.bio || 'Specializing in compassionate psychological counselling and mental wellbeing.'}"
                        </p>
                        {advisor.bio && advisor.bio.length > 50 && (
                          <button
                            type="button"
                            onClick={() => setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }))}
                            className="text-[10px] font-semibold text-[#00c9d6] hover:text-[#008b94] cursor-pointer mt-1 inline-block bg-transparent border-none p-0"
                          >
                            {expandedBios[advisor.id] ? 'Read Less ▲' : 'Read More ▼'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 shrink-0">
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left">
                          <span className="text-xs font-semibold text-slate-900 block leading-none">
                            {advisor.hours ? `${advisor.hours.toLocaleString()}+` : '500+'}
                          </span>
                          <span className="text-[9px] font-medium text-slate-500 block mt-1">Consult Hours</span>
                        </div>
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left min-w-0" title={advisor.languages}>
                          <span className="text-xs font-semibold text-slate-900 block leading-tight truncate">
                            {advisor.languages}
                          </span>
                          <span className="text-[9px] font-medium text-slate-500 block mt-1">Languages</span>
                        </div>
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 text-left">
                          <span className="text-xs font-semibold text-slate-900 block leading-none">₹{minFee}</span>
                          <span className="text-[9px] font-medium text-slate-500 block mt-1">Fee per session</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="text-left">
                          <span className="text-[9px] font-semibold text-slate-400 block tracking-wider uppercase">Next Available</span>
                          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5 whitespace-nowrap">Available Today</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBook(advisor.id)}
                          className="bg-[#00c9d6] hover:bg-[#00b5c2] active:bg-[#009baa] text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-1"
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
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <div className="space-y-6 text-left">

          <div className="space-y-2">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#008b94] bg-[#00c9d6]/10 px-3.5 py-1 rounded-full border border-[#00c9d6]/25">
              Simple 3-Step Booking
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              ലളിതമായ 3 ഘട്ടങ്ങളിലൂടെ ഒരു session ബുക്ക് ചെയ്യാം.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {bookingSteps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${activeStep === idx
                    ? 'bg-white border-[#00c9d6] shadow-md ring-2 ring-[#00c9d6]/20'
                    : 'bg-white/80 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
              >
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${activeStep === idx ? 'bg-[#00c9d6] text-slate-950' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {step.badge}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-950">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: FAQ SECTION ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <div className="text-center mb-10 space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#008b94] bg-[#00c9d6]/10 px-3.5 py-1 rounded-full border border-[#00c9d6]/25">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
            സെഷനെക്കുറിച്ചും ബുക്കിംഗിനെക്കുറിച്ചുമുള്ള പ്രധാന വിവരങ്ങൾ താഴെ കാണാം.
          </p>
        </div>

        <div className="space-y-3.5 text-left">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                    ? 'bg-white border-[#00c9d6]/80 shadow-md ring-1 ring-[#00c9d6]/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer bg-transparent border-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#00c9d6]/15 text-[#008b94] text-xs font-bold flex items-center justify-center shrink-0">
                      Q
                    </span>
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-slate-800 text-xs sm:text-sm leading-relaxed border-t border-slate-100 mt-1">
                    <div className="pt-3 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <p className="font-normal text-slate-700 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final CTA below FAQ */}
        <div className="pt-10 text-center space-y-3">
          <button
            onClick={() => handleBook()}
            className="inline-flex items-center gap-2 px-8 py-4 min-h-[44px] rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer border-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
          >
            <span>{heroBtnText}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-500">
            100% Confidential • Professional Support • Secure Online Booking
          </p>
        </div>
      </section>

      {/* ── FOCUSED FOOTER (Flushes to the bottom, zero white gap) ── */}
      <footer className="w-full bg-slate-950 text-slate-400 pt-10 pb-28 sm:pb-10 border-t border-slate-800/90 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="text-white font-semibold text-sm tracking-tight flex items-baseline">
              BEHOLD<span className="text-[#00c9d6] font-bold text-base leading-none">.</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-400">
              © {new Date().getFullYear()} BEHOLD. All rights reserved. Confidential Online Psychological Counselling.
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => onOpenDocs ? onOpenDocs('privacy') : window.open('/privacy', '_blank')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-xs p-0 underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => onOpenDocs ? onOpenDocs('terms') : window.open('/terms', '_blank')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-xs p-0 underline-offset-4 hover:underline"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* ── SEQUENTIAL DUAL POPUP (bottom-right, auto-dismissed) ── */}
      {activePopup !== null && (() => {
        const popup = popups.find(p => p.id === activePopup);
        const Icon = popup?.icon;
        return (
          <aside
            aria-live="polite"
            aria-label={popup?.label}
            className={`fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 max-w-[300px] sm:max-w-[320px] pointer-events-auto transition-all duration-400 ${popupVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
          >
            <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-200/80 ring-1 ring-slate-900/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00c9d6]/10 border border-[#00c9d6]/25 flex items-center justify-center shrink-0 mt-0.5">
                {Icon && <Icon className="w-4.5 h-4.5 text-[#008b94]" />}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#008b94] block">
                  {popup?.label}
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-snug mt-0.5">
                  {popup?.message}
                </p>
              </div>

              <button
                onClick={handleDismissPopup}
                className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer border-none bg-transparent shrink-0 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        );
      })()}

      {/* ── STICKY BOTTOM MOBILE CTA BAR ── */}
      <nav
        aria-label="Sticky booking action bar"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:hidden"
      >
        <button
          onClick={() => handleBook()}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#00c9d6] active:bg-[#00b5c2] text-slate-950 font-semibold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
        >
          <span>{heroBtnText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

    </div>
  );
}
