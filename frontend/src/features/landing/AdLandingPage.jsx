import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
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
  GraduationCap
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { toast } from 'react-hot-toast';
import { trackLead, trackContact, trackViewContent, setMetaUserData } from '../../utils/metaPixel';
import { formatExperience } from '../../utils/formatters';
import clinicImage from '../../assets/luxury_clinic_room.png';
import headerBg from '../../assets/header.svg';

const getInitial = (name) => {
  if (!name) return 'P';
  const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, '').trim();
  return cleanName.charAt(0).toUpperCase() || 'P';
};

export default function AdLandingPage({ onOpenBooking, onSelectAdvisor, siteSettings, onOpenDocs }) {
  const settings = siteSettings || {};
  const whatsappNumber = (settings.whatsapp || 'https://wa.me/919400090106').replace(/[^\d]/g, '') || '919400090106';

  // Counsellor list state
  const [advisors, setAdvisors] = useState([]);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [expandedBios, setExpandedBios] = useState({});

  // Video interactive state
  const [activeStep, setActiveStep] = useState(0);

  // Inquiry Form State
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Carousel ref
  const carouselRef = useRef(null);

  useEffect(() => {
    trackViewContent({
      content_name: 'Ad Landing Page - Psychological Counselling',
      content_category: 'Ad Campaign'
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
              fee: Number(c.fee || c.price || 1200),
              halfSessionPrice: Number(c.halfSessionPrice || Math.round((c.fee || c.price || 1200) * 0.5)),
              hours: expData.rawHours,
              expYears: expData.years,
              bio: c.bio || 'Specializing in compassionate psychological counselling, stress management, and mental wellbeing.',
              specialties: Array.isArray(c.specialties) ? c.specialties : (c.tags ? (Array.isArray(c.tags) ? c.tags : [c.tags]) : ['Anxiety & Stress', 'Depression', 'Personal Growth']),
              photo: hasValidPhoto ? rawPhoto : null,
              languages: Array.isArray(c.lang) ? c.lang.join(', ') : (c.lang || (Array.isArray(c.languages) ? c.languages.join(', ') : (c.languages || c.language || 'English, Malayalam')))
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
              fee: 1200,
              halfSessionPrice: 600,
              hours: 1200,
              expYears: '1,200+ Hours Consulted',
              bio: 'Specializing in compassionate psychological counselling, stress management, and mental wellbeing.',
              specialties: ['Anxiety & Stress', 'Depression', 'Self Esteem'],
              photo: null,
              languages: 'English, Malayalam'
            },
            {
              id: 'c2',
              name: 'Dr. Rahul Varma',
              title: 'Counselling Psychologist & Mentor',
              designation: 'Counselling Psychologist & Mentor',
              fee: 1000,
              halfSessionPrice: 500,
              hours: 950,
              expYears: '950+ Hours Consulted',
              bio: 'Specializing in emotional resilience, burnout recovery, and personalized roadmap creation.',
              specialties: ['Career Stress', 'Relationship Guidance', 'Burnout'],
              photo: null,
              languages: 'English, Hindi'
            },
            {
              id: 'c3',
              name: 'Dr. Ananya Nair',
              title: 'Child & Adolescent Specialist',
              designation: 'Child & Adolescent Specialist',
              fee: 1400,
              halfSessionPrice: 700,
              hours: 1500,
              expYears: '1,500+ Hours Consulted',
              bio: 'Dedicated to helping individuals discover clarity, build self-worth, and thrive.',
              specialties: ['Emotional Resilience', 'Identity Concerns', 'Mindfulness'],
              photo: null,
              languages: 'English, Malayalam'
            }
          ]);
        }
      } catch (e) {
        console.warn('Failed to load advisors for ad landing page', e);
      } finally {
        setLoadingAdvisors(false);
      }
    };

    fetchAdvisors();
  }, []);

  const handleBook = (advisorId = null) => {
    if (advisorId && onSelectAdvisor) {
      onSelectAdvisor(advisorId);
    }
    if (onOpenBooking) {
      onOpenBooking();
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Hi BEHOLD, I saw your online counselling ad and would like to book a 1-on-1 confidential session.");
    trackContact({ method: 'whatsapp', source: 'ad_landing_page' });
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Please enter your name and contact phone number.');
      return;
    }
    setIsSubmitting(true);
    try {
      await ApiService.submitInquiry({
        studentName: formData.name,
        phone: formData.phone,
        email: formData.email || 'not-provided@lead.behold.co.in',
        comments: formData.message || 'Ad landing page lead submission',
        grade: 'Ad Campaign Lead'
      });

      setMetaUserData({
        em: formData.email,
        ph: formData.phone,
        fn: formData.name
      });
      trackLead({
        content_name: 'Ad Landing Page Lead',
        content_category: 'Advertising Campaign'
      });

      setFormSubmitted(true);
      toast.success('Your request has been received! Our team will contact you shortly.');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit ad inquiry', err);
      toast.error('Failed to submit. Please contact us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const bookingSteps = [
    {
      title: "1. Choose Your Psychologist",
      desc: "Browse verified psychologists based on specialization, language, and background.",
      badge: "Step 1"
    },
    {
      title: "2. Pick Date & Preferred Mode",
      desc: "Select a comfortable slot for Online Video, In-Clinic, or Doorstep visit.",
      badge: "Step 2"
    },
    {
      title: "3. Secure Instant Confirmation",
      desc: "Pay securely via UPI/Cards and receive private WhatsApp meeting details instantly.",
      badge: "Step 3"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans antialiased overflow-x-hidden">
      <SEO 
        title="BEHOLD | Professional Online Psychological Counselling & Therapy" 
        description="Confidential, evidence-based online psychological therapy with verified experts. Affordable pricing, flexible timings, and personalized one-to-one care." 
        canonicalUrl="https://www.behold.co.in/ad"
      />

      {/* ── TOP FOCUSED BRAND BAR (No distracting navigation leaks) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline">
              BEHOLD<span className="text-[#00c9d6] font-black text-2xl leading-none">.</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">WhatsApp</span>
            </button>
            <button
              onClick={() => handleBook()}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
            >
              <span>Book Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO SECTION (2-Column Wireframe Layout) ── */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle ambient light glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#00c9d6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Image / Visual Placeholder */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              <img
                src={clinicImage}
                alt="BEHOLD Professional Counselling Room"
                className="w-full h-[280px] xs:h-[340px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Floating Shield Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-800 tracking-wide">100% Confidential & Secure</span>
              </div>

              {/* Bottom Visual Highlights */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/40 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00c9d6]/20 border border-[#00c9d6]/40 flex items-center justify-center text-[#008b94] shrink-0 font-black">
                    4.9★
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Rated 4.9/5 by Clients</h4>
                    <p className="text-[11px] text-slate-600">Over 500+ therapy sessions conducted</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Online & Offline
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Session Copy & Call-to-Action */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6 text-left">
            <div className="space-y-2">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                Whatever you feel, <br />
                <span className="text-[#00c9d6] font-rough text-[50px] xs:text-[60px] sm:text-[72px] lg:text-[80px] font-normal leading-[0.9] block mt-1">
                  it’s okay to be not okay.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2 font-normal">
                Professional online psychological counselling for individuals seeking clarity, calm, and personal growth. Connect directly with certified psychologists from the comfort of your home.
              </p>
            </div>

            {/* Quick Feature Ticks */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified RCI Psychologists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Confidential 1-on-1 Video</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Wait Times</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Affordable & Transparent</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <button
                onClick={() => handleBook()}
                className="px-8 py-3.5 rounded-2xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>Book a Session Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsApp}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition-all shadow-2xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>All consultations are 100% private, encrypted, and ethical.</span>
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: COUNSELLOR / PSYCHOLOGIST CAROUSEL (Pixel-Perfect Alignment) ── */}
      <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] block mb-1">
                Verified Experts
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Meet Our Certified Psychologists
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Choose a qualified professional whose background and approach resonate with you.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end">
              <button
                onClick={() => handleScrollCarousel('left')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                aria-label="Previous psychologist"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                aria-label="Next psychologist"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel Scroll Container with Standardized Cards */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth px-1"
          >
            {advisors.map((advisor) => {
              const cardTitle = advisor.title || advisor.designation || 'Consultant Psychologist';
              const minFee = advisor.halfSessionPrice || Math.round(advisor.fee * 0.5) || 499;

              return (
                <div
                  key={advisor.id}
                  className="min-w-[300px] xs:min-w-[320px] sm:min-w-[350px] max-w-[350px] snap-start bg-white rounded-[24px] border border-slate-200/90 shadow-md hover:shadow-xl hover:border-[#00c9d6] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left group"
                >
                  {/* Top Gradient Header with Name, Designation, and Avatar */}
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

                    {/* Counsellor Profile Image / Avatar */}
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

                  {/* White Body Card with Fixed Structure */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    
                    {/* Specialties Tags Row */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialties:</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                        {advisor.specialties.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-800 text-[10.5px] font-semibold rounded-lg whitespace-nowrap shrink-0"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bio Snippet Box */}
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

                    {/* 3 Metric Stat Boxes */}
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
                        <span className="text-[9px] font-medium text-slate-500 block mt-1">Starting Fee</span>
                      </div>
                    </div>

                    {/* Card Footer: Next Available + Book Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-[9px] font-semibold text-slate-400 block tracking-wider uppercase">Next Available</span>
                        <span className="text-[11px] font-bold text-emerald-600 block mt-0.5 whitespace-nowrap">Available Today</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBook(advisor.id)}
                        className="bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
                      >
                        Book Session
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 3 & 4: HOW-TO-BOOK VIDEO & 4-5 KEY BENEFITS / USP (Side-by-Side Grid) ── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* COLUMN 1: LANDSCAPE BOOKING VIDEO / INTERACTIVE WALKTHROUGH */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] block mb-1">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How Booking Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Book in under 2 minutes with seamless WhatsApp updates and instant meeting links.
              </p>
            </div>

            {/* Landscape 16:9 Video Visual Card */}
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-200 shadow-xl flex items-center justify-center group">
              <img
                src={headerBg}
                alt="Booking Process"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="relative z-10 text-center p-6 space-y-3">
                <button
                  onClick={() => handleBook()}
                  className="w-16 h-16 rounded-full bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer"
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

            {/* 3 Step Interactive Progress Pills */}
            <div className="space-y-3 pt-2">
              {bookingSteps.map((step, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    activeStep === idx 
                      ? 'bg-white border-[#00c9d6] shadow-md ring-2 ring-[#00c9d6]/20' 
                      : 'bg-white/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    activeStep === idx ? 'bg-[#00c9d6] text-slate-950' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {step.badge}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-normal leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: 4-5 KEY BENEFITS / USP */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] block mb-1">
                Why Choose BEHOLD
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Key Benefits & Service USPs
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Designed to make mental wellbeing approachable, empathetic, and confidential.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  icon: <Video className="w-5 h-5 text-[#00c9d6]" />,
                  title: "Online Sessions",
                  desc: "Connect privately from anywhere using secure high-definition video consultations without clinic travel."
                },
                {
                  icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
                  title: "Affordable Pricing",
                  desc: "Transparent, student- and family-friendly pricing with zero hidden fees or locked subscriptions."
                },
                {
                  icon: <GraduationCap className="w-5 h-5 text-indigo-600" />,
                  title: "Qualified Professionals",
                  desc: "Certified clinical psychologists and experienced mental health practitioners with verified credentials."
                },
                {
                  icon: <Award className="w-5 h-5 text-amber-500" />,
                  title: "Specialised Support",
                  desc: "Tailored programs for anxiety, stress, depression, relationship conflict, and career roadmapping."
                },
                {
                  icon: <HeartHandshake className="w-5 h-5 text-rose-500" />,
                  title: "Personalised One-to-One Counselling",
                  desc: "Dedicated attention, personalized action plans, and complete confidentiality built around your pace."
                }
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-4.5 shadow-2xs hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{benefit.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick CTA Box */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-bold text-white">Ready to speak with a psychologist?</h4>
                <p className="text-xs text-slate-400 mt-0.5">Sessions start at just ₹499.</p>
              </div>
              <button
                onClick={() => handleBook()}
                className="px-6 py-2.5 rounded-full bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                Pick a Time Slot
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 5: CONTACT / ENQUIRY FORM ── */}
      <section className="py-16 sm:py-24 bg-slate-100/70 border-t border-slate-200/80 relative">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00c9d6] block mb-1">
              Have Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Get in Touch with Our Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Fill out this quick form and our counselling coordinator will reach out directly to guide you.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-left">
            {formSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Enquiry Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. We will contact you via WhatsApp/Phone within 24 hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#00c9d6] text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    How Can We Help You? <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Briefly tell us what you would like support with..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Consultation Request'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ── MINIMAL FOOTER ── */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} BEHOLD Ltd. All rights reserved. Confidential Psychological Care.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-400 text-[11px]">
            <button onClick={() => onOpenDocs?.('privacy')} className="hover:text-[#00c9d6] transition-colors cursor-pointer bg-transparent border-none p-0">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onOpenDocs?.('terms')} className="hover:text-[#00c9d6] transition-colors cursor-pointer bg-transparent border-none p-0">Terms & Conditions</button>
            <span>•</span>
            <button onClick={() => onOpenDocs?.('refund')} className="hover:text-[#00c9d6] transition-colors cursor-pointer bg-transparent border-none p-0">Refund Policy</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
