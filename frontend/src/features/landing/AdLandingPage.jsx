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
  Moon,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';
import { trackViewContent, trackInitiateCheckout } from '../../utils/metaPixel';
import { formatExperience } from '../../utils/formatters';
import { calculateNextAvailable } from '../../utils/dateFormatter';
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

  // Video interactive & playback state
  const videoRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');
  const [durationStr, setDurationStr] = useState('0:26');
  const [isEnded, setIsEnded] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setIsEnded(false);
      }).catch((err) => {
        console.warn('Playback prevented:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 26;
    setProgress((current / dur) * 100);
    setCurrentTimeStr(formatTime(current));

    // Dynamic step sync with video playback
    if (current < 8.5) {
      setActiveStep(0);
    } else if (current < 17) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDurationStr(formatTime(videoRef.current.duration || 26));
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = Math.max(0, Math.min(1, clickX / width)) * (videoRef.current.duration || 26);
    videoRef.current.currentTime = newTime;
    setProgress((newTime / (videoRef.current.duration || 26)) * 100);
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleFullscreen = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitEnterFullscreen) {
      videoRef.current.webkitEnterFullscreen();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setProgress(100);
  };

  const seekToStep = (idx) => {
    setActiveStep(idx);
    if (videoRef.current) {
      const stepTimes = [0, 8.5, 17];
      videoRef.current.currentTime = stepTimes[idx] || 0;
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setIsEnded(false);
        }).catch(() => {});
      }
    }
  };

  // FAQ Accordion State (first open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Carousel ref
  const carouselRef = useRef(null);

  // Scroll state to show sticky bottom bar only when past hero
  const [showMobileBottomBar, setShowMobileBottomBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileBottomBar(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              languages: Array.isArray(c.lang) ? c.lang.join(', ') : (c.lang || (Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'Malayalam, English'))),
              availability: c.availability || c.availabilitySlots || null,
              bookedSlots: c.bookedSlots || []
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

    if (advisorId) {
      if (onSelectAdvisor) {
        onSelectAdvisor(advisorId);
      } else if (onOpenBooking) {
        onOpenBooking();
      } else {
        navigate(`/booking?counsellorId=${advisorId}`);
      }
    } else {
      if (onOpenBooking) {
        onOpenBooking();
      } else {
        navigate('/booking');
      }
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
      desc: `വെറും ₹499-ന് ബുക്കിംഗ് പൂർത്തിയാക്കൂ. ലിങ്ക് WhatsApp/Email വഴി ഉടൻ ലഭിക്കും.`,
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
              className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-semibold bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.97] border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
            >
              <span>{heroBtnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO SECTION (VIDEO LEFT, TEXT RIGHT) ── */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle ambient light glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00c9d6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">

          {/* LEFT: Smartphone Mockup Video Player */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-[310px] sm:max-w-[330px] rounded-[36px] bg-slate-950 p-2.5 shadow-[0_25px_60px_-15px_rgba(0,201,214,0.25)] border-[3px] border-slate-800 ring-1 ring-[#00c9d6]/40 transition-transform duration-300 hover:scale-[1.01]">

              {/* Phone Top Island Bar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 font-semibold backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00c9d6] animate-ping"></div>
                <span>Behold Quick Guide</span>
              </div>

              {/* Video Container (9:16 Aspect Ratio) */}
              <div
                className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden bg-slate-900 cursor-pointer group select-none"
                onClick={handleTogglePlay}
              >
                <video
                  ref={videoRef}
                  playsInline
                  preload="metadata"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/behold_session_guide.mp4" type="video/mp4" />
                  <source src="/videos/behold_session_guide_light.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Subtle Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`} />

                {/* Top Right Audio Mute/Unmute Pill */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="absolute top-12 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00c9d6]" />}
                </button>

                {/* Center Play/Pause Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                  {!isPlaying ? (
                    <div className="flex flex-col items-center gap-2 pointer-events-auto transform transition-transform group-hover:scale-110">
                      <div className="w-16 h-16 rounded-full bg-[#00c9d6] text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(0,201,214,0.6)] ring-4 ring-[#00c9d6]/30">
                        {isEnded ? (
                          <RotateCcw className="w-7 h-7" />
                        ) : (
                          <Play className="w-7 h-7 fill-slate-950 ml-1" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-white bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 tracking-wide">
                        {isEnded ? 'വീണ്ടും കാണുക • Replay' : 'വാച്ച് വീഡിയോ • 26s'}
                      </span>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20">
                        <Pause className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Video Controls Bar */}
                <div
                  className={`absolute bottom-0 inset-x-0 p-3.5 z-30 space-y-2 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Scrubbable Progress Bar */}
                  <div
                    className="w-full h-1.5 bg-white/30 hover:h-2.5 rounded-full cursor-pointer transition-all relative overflow-hidden"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#008b94] to-[#00c9d6] rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-[11px] font-semibold">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTogglePlay}
                        className="hover:text-[#00c9d6] transition cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <span>{currentTimeStr} / {durationStr}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="hover:text-[#00c9d6] transition cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleFullscreen}
                        className="hover:text-[#00c9d6] transition cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Trust Indicators below video */}
            <div className="mt-3.5 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                100% സ്വകാര്യം
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-[#008b94]" />
                മലയാളം & English
              </span>
            </div>
          </div>

          {/* RIGHT: High-Converting Headline, Subtitle, & Primary CTA Button */}
          <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#008b94] bg-[#00c9d6]/10 px-4 py-1.5 rounded-full border border-[#00c9d6]/25 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#00c9d6] animate-pulse"></span>
                <span>Special Introductory Session • ₹499</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-950 tracking-tight leading-[1.3] space-y-2">
                <span className="block text-slate-900 font-extrabold">
                  {heroTitleLine1}
                </span>
                <span className="block text-[#008b94] font-extrabold">
                  {heroTitleLine2}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed font-medium pt-1 max-w-xl">
                {heroSub}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => handleBook()}
                className="px-9 py-4 rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-base tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5 text-center active:scale-[0.98] border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2"
              >
                <span>{heroBtnText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Guarantees under CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Google Meet link on WhatsApp & Email</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No app download needed • 100% Private</span>
              </span>
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00c9d6]">
                <GraduationCap className="w-5 h-5" />
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00c9d6]">
                <Lock className="w-5 h-5" />
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00c9d6]">
                <Languages className="w-5 h-5" />
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#00c9d6]">
                <CreditCard className="w-5 h-5" />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left mb-8">

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#00c9d6]/50 transition-all duration-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                rest എടുത്തിട്ടും, എപ്പോഴും ക്ഷീണം തോന്നാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#00c9d6]/50 transition-all duration-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                ചിന്തകൾ നിർത്താൻ പറ്റാതെ, രാത്രി ഉറക്കം കിട്ടാതിരിക്കാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#00c9d6]/50 transition-all duration-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                Work-ന്റെ stress വീട്ടിലേക്കും കൂടെ വരാറുണ്ടോ?
              </h3>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#00c9d6]/50 transition-all duration-200 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#008b94] shrink-0 mt-0.5">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                എന്തോ ഒന്ന് missing ആണെന്ന് തോന്നാറുണ്ടോ, പക്ഷെ എന്താണെന്ന് exactly അറിയില്ലേ?
              </h3>
            </div>
          </div>

        </div>

        {/* Reassuring Closing Line */}
        <div className="bg-[#00c9d6]/5 border border-[#00c9d6]/20 rounded-2xl p-5 sm:p-6 flex items-center justify-center gap-3">
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
                const nextAvail = calculateNextAvailable(advisor.availability, advisor.bookedSlots || []);
                const isAvailToday = nextAvail === 'Available Today';
                const isUnavailable = nextAvail === 'Unavailable';

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
                          <span className={`text-[11px] font-semibold block mt-0.5 whitespace-nowrap ${isUnavailable ? 'text-zinc-400' : isAvailToday ? 'text-emerald-600' : 'text-[#008b94]'}`}>
                            {nextAvail}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBook(advisor.id)}
                          className="bg-[#00c9d6] hover:bg-[#00b5c2] active:bg-[#009baa] text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-1"
                        >
                          Select Advisor
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
                onClick={() => seekToStep(idx)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${activeStep === idx
                    ? 'bg-white border-[#00c9d6] shadow-md ring-2 ring-[#00c9d6]/25'
                    : 'bg-white/80 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
              >
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${activeStep === idx ? 'bg-[#00c9d6] text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {step.badge}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950">{step.title}</h4>
                    {activeStep === idx && (
                      <span className="text-[10px] font-bold text-[#008b94] uppercase tracking-wider bg-[#00c9d6]/10 px-2 py-0.5 rounded-md">
                        Active Step
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Instant Action CTA Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 text-white shadow-xl border border-slate-800 space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c9d6] block">
                  Special Introductory Offer
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  Ready to start your first session?
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Get full personalized psychological consultation starting at ₹499.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-2xl font-extrabold text-[#00c9d6]">₹499</span>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Introductory Session</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant Google Meet link on WhatsApp & Email</span>
              </div>

              <button
                type="button"
                onClick={() => handleBook()}
                className="w-full sm:w-auto bg-[#00c9d6] hover:bg-[#00b5c2] active:bg-[#009baa] text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,201,214,0.4)] transition-all cursor-pointer whitespace-nowrap border-none flex items-center justify-center gap-2"
              >
                <span>{heroBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 mt-1">
                    <p className="pt-3 font-normal leading-relaxed">{faq.a}</p>
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

      {/* ── STICKY BOTTOM MOBILE CTA BAR (appears only after scrolling past hero) ── */}
      <nav
        aria-label="Sticky booking action bar"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:hidden transition-all duration-300 ease-out ${
          showMobileBottomBar
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
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
