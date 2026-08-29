import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MessageCircle, X, Download, ShieldAlert, Eye, EyeOff } from 'lucide-react'; //
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UnauthorizedFallback from '../features/admin/UnauthorizedFallback';
import Navbar from '../components/common/Navbar';
import BrandIcon from '../components/common/BrandIcon';
import Hero from '../features/landing/Hero';
import CdatSection from '../features/student/components/aptitude/CdatSection';
import Services from '../features/booking/Services';
import About from '../features/landing/About';
import Faq from '../features/landing/Faq';
import Inquiry from '../features/landing/Inquiry';
import Reviews from '../features/landing/Reviews';
import PrivacyPolicy from '../features/landing/PrivacyPolicy';
import Footer from '../components/common/Footer';
import AuthModals from '../features/auth/AuthModals';
import CompleteProfileModal from '../features/auth/CompleteProfileModal';
import TherapistSwipeSection from '../features/landing/TherapistSwipeSection';
import FaqBlogSection from '../features/landing/FaqBlogSection';
import ContactInquirySection from '../features/landing/ContactInquirySection';
import globalBg from '../assets/greygreen.png';
import globalBgTexture from '../assets/greygreen.png';

function lazyWithRetry(importFn) { //
  return lazy(() =>
    importFn().catch((error) => {
      const isChunkLoadFailed = error.message && (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
      );
      if (isChunkLoadFailed) {
        window.location.reload();
        return new Promise(() => { });
      }
      throw error;
    })
  );
}

const ServiceBooking = lazyWithRetry(() => import('../features/booking/ServiceBooking'));
const AdvisorProfile = lazyWithRetry(() => import('../features/counsellor/AdvisorProfile'));
const StudentProfile = lazyWithRetry(() => import('../features/student/components/profile/StudentProfile'));
const PsychologistDashboard = lazyWithRetry(() => import('../features/counsellor/PsychologistDashboard'));
const AdminDashboard = lazyWithRetry(() => import('../features/admin/AdminDashboard'));
const TestResultsTab = lazyWithRetry(() => import('../features/admin/admin-dashboard/tabs/TestResultsTab'));
const AptitudeTest = lazyWithRetry(() => import('../features/student/components/aptitude/AptitudeTest'));
const AptitudeLanding = lazyWithRetry(() => import('../features/student/components/aptitude/AptitudeLanding'));
const ResetPassword = lazyWithRetry(() => import('../features/auth/ResetPassword'));
const BlogList = lazyWithRetry(() => import('../features/blog/BlogList'));
const BlogPostDetail = lazyWithRetry(() => import('../features/blog/BlogPostDetail'));
const FaqsPage = lazyWithRetry(() => import('../features/faqs/FaqsPage'));
const GoogleCallbackRedirect = lazyWithRetry(() => import('../components/common/GoogleCallbackRedirect'));
const NotFound = lazyWithRetry(() => import('../components/common/NotFound'));
import BlogSection from '../features/landing/BlogSection';

import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { requestNotificationPermission, syncAndNotifyLocal } from '../services/notificationHelper';
import {
  trackPageView,
  captureUtmParameters,
  trackContact,
  trackLead,
  trackSubmitApplication,
  setMetaUserData
} from '../utils/metaPixel';
 
function ToastLimitManager() {
  const { toasts } = useToasterStore();
  useEffect(() => {
    const visibleToasts = toasts.filter((t) => t.visible);
    if (visibleToasts.length > 1) {
      visibleToasts.slice(0, -1).forEach((t) => toast.dismiss(t.id));
    }
  }, [toasts]);
  return null;
}

function AdvisorProfileWrapper({ handleBookTherapist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <AdvisorProfile
      advisorId={id}
      onBack={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/booking');
        }
      }}
      onBook={handleBookTherapist}
    />
  );
}



export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [testProfile, setTestProfile] = useState(null);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);
  const [pendingScrollSection, setPendingScrollSection] = useState(null);

  // Expanded site settings sync state
  const [siteSettings, setSiteSettings] = useState(() => {
    const defaultSettings = {
      siteName: 'BEHOLD',
      siteCopyright: 'BEHOLD Ltd.',
      showBanner: false,
      bannerNotice: '',
      termsOfUse: '',
      privacyPolicy: '',
      whatsapp: 'https://wa.me/919497174011',
      contactEmail: 'support@behold.com',
      enablePsychology: true,
      enableCareerMentoring: true,
      enableAptitude: true,
      gstEnabled: false,
      gstPercent: 0,
      sectionOrder: ['counselling-intro', 'whyChooseUs', 'aptitude', 'counsellors', 'about', 'reviews', 'faq', 'blog']
    };
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) { }
    return defaultSettings;
  });
  const [activeDocType, setActiveDocType] = useState(null); // 'terms' or 'privacy'
 
  const loadSettings = () => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSiteSettings(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (e) { }
  };

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const res = await ApiService.getSettings();
        if (res.success && res.data) {
          const parsed = res.data;
          setSiteSettings(prev => ({
            ...prev,
            ...parsed
          })); //
          localStorage.setItem('behold_site_settings', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Failed to fetch global settings', err);
      }
    };
    fetchGlobalSettings();

    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setSiteSettings(prev => ({
          ...prev, //
          ...e.detail
        }));
        localStorage.setItem('behold_site_settings', JSON.stringify(e.detail));
      } else {
        fetchGlobalSettings();
      }
    };

    const handleStorageChange = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      if (key === 'behold_site_settings' || !key) {
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    window.addEventListener('behold_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
      window.removeEventListener('behold_settings_updated', handleSettingsUpdate);
    };
  }, []); //

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Capture UTM / fbclid campaign parameters on app mount & route change
  useEffect(() => {
    captureUtmParameters();
  }, [location.search]);

  // Dynamic Meta Pixel SPA PageView Tracking
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Sync user properties for Meta Advanced Matching
  useEffect(() => {
    if (user && user.id) {
      setMetaUserData({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name
      });
    }
  }, [user]);

  // Setup global SPA navigate helper for legacy or external components
  useEffect(() => {
    window.spaNavigate = (path) => {
      if (path) navigate(path); //
    };
  }, [navigate]);

  // Native desktop/device local notifications sync hook
  useEffect(() => {
    if (!user || !user.id) return;

    // 1. Request notification permission on login/first active session //
    requestNotificationPermission();

    // 2. Initial sync
    syncAndNotifyLocal(user.id, user.role);

    // 3. Poll every 15 seconds to fetch new alerts and notify natively
    const interval = setInterval(() => {
      syncAndNotifyLocal(user.id, user.role);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]); //

  // Role-based routing and strict portal isolation flow
  useEffect(() => {
    if (isLoading) return; // Wait for auth resolution

    const path = location.pathname;

    if (user) {
      const userRole = user?.role?.toUpperCase();

      // STRICT ADMIN LOCK: Admin users must stay inside /admin portal
      if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUB_ADMIN') {
        if (!path.startsWith('/admin')) {
          navigate('/admin', { replace: true });
          return;
        }
      }

      // STRICT COUNSELLOR LOCK: Counsellor users must stay inside /counsellor portal
      if (userRole === 'PSYCHOLOGIST' || userRole === 'COUNSELLOR') {
        if (path !== '/counsellor' && path !== '/conceller' && path !== '/cousellor') {
          navigate('/counsellor', { replace: true });
          return;
        }
      }

      // STRICT USER LOCK: Regular student/user accounts cannot access admin/counsellor portals
      if (userRole === 'USER') {
        if (path === '/counsellor' || path === '/conceller' || path === '/cousellor' || path.startsWith('/admin')) {
          toast.error('Access Denied: You do not have permission to access this portal.', { id: 'user-access-denied' });
          navigate('/profile', { replace: true });
          return;
        }
      }
    } else {
      if (path === '/profile') {
        setTimeout(() => setIsAuthModalOpen(true), 0);
      }
    }
  }, [user, isLoading, location.pathname, navigate]); //

  // Handle pending scrolls once landing or booking view is active
  useEffect(() => {
    if (!pendingScrollSection) return;

    if (location.pathname === '/booking' && (pendingScrollSection === 'services' || pendingScrollSection === 'aptitude' || pendingScrollSection === 'cdat')) {
      let targetId = pendingScrollSection === 'aptitude' ? 'cdat' : pendingScrollSection;
      let attempts = 0;
      const tryScroll = () => {
        const element = document.getElementById(targetId); //
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
          setPendingScrollSection(null);
        } else if (attempts < 15) {
          attempts++;
          setTimeout(tryScroll, 60);
        } else {
          setPendingScrollSection(null);
        }
      };
      setTimeout(tryScroll, 100);
      return;
    }

    if (location.pathname === '/') {
      if (pendingScrollSection === 'top' || pendingScrollSection === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPendingScrollSection(null);
        return;
      }

      let attempts = 0;
      const tryScroll = () => {
        let targetId = pendingScrollSection;
        if (targetId === 'contact') targetId = 'inquiry';
        if (targetId === 'counselling-intro') targetId = 'services';
        if (targetId === 'faq') targetId = 'faqs';
        if (targetId === 'whyChooseUs') targetId = 'why-choose-us';

        const element = document.getElementById(targetId); //
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
          setPendingScrollSection(null);
        } else if (attempts < 15) {
          attempts++;
          setTimeout(tryScroll, 60);
        } else {
          setPendingScrollSection(null);
        }
      };
      setTimeout(tryScroll, 100);
    } //
  }, [location.pathname, pendingScrollSection]);

  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    setIsBookingModalOpen(true);
  };

  const handleFinishTest = async (dominantDomain, scores) => { //
    setTestProfile({
      dominantDomain,
      scores,
      date: (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })()
    });
 
    try {
      await ApiService.saveTestResult({
        userId: user ? user.id : 'guest',
        studentName: user ? user.name : 'Anonymous Student',
        studentEmail: user ? user.email : 'anonymous@behold.com',
        dominantDomain,
        scores,
        date: (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })()
      });

      // Track Meta Pixel standard events for aptitude test completion
      trackSubmitApplication({ dominantDomain });
      trackLead({
        content_name: 'C-DAT Assessment Submission',
        content_category: 'Aptitude Test'
      });
    } catch (err) {
      console.error('Failed to save test results', err);
    }

    navigateToSection('inquiry');
  };

  const navigateToSection = (sectionId) => { //
    if (!sectionId) return;

    if (sectionId === 'booking' || sectionId === '/booking') {
      if (location.pathname !== '/booking') {
        navigate('/booking');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; //
    }

    if (sectionId === 'services' || sectionId === 'aptitude') {
      const targetId = sectionId === 'aptitude' ? 'cdat' : 'services';
      if (location.pathname === '/booking') {
        const el = document.getElementById(targetId);
        if (el) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
          return; //
        }
      } else {
        setPendingScrollSection(sectionId);
        navigate('/booking');
        return;
      }
    }

    if (sectionId === 'top' || sectionId === 'home') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPendingScrollSection('top'); //
        navigate('/');
      }
      return;
    }

    let targetId = sectionId;
    if (targetId === 'contact') targetId = 'inquiry';
    if (targetId === 'counselling-intro') targetId = 'services';
    if (targetId === 'faq') targetId = 'faqs';
    if (targetId === 'whyChooseUs') targetId = 'why-choose-us';

    const element = document.getElementById(targetId); //
    if (location.pathname === '/' && element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    } else {
      setPendingScrollSection(sectionId);
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }; //

  // Show blank screen while auth is resolving to avoid flash
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md transition-all duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-3 border-[#00e5ff]/20 border-t-[#00e5ff] animate-spin shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
            <span className="absolute font-sans font-semibold text-xs text-slate-900 tracking-widest uppercase">
              B<span className="text-[#00e5ff]">.</span>
            </span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600 animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => { //
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const title = activeDocType === 'terms' ? 'Terms & Conditions' : activeDocType === 'refund' ? 'Return & Refund Policy' : 'Privacy Policy';
      const content = activeDocType === 'terms' ? siteSettings.termsOfUse : activeDocType === 'refund' ? siteSettings.refundPolicy : siteSettings.privacyPolicy;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`BEHOLD - ${title}`, 20, 20);
 
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);

      const splitText = doc.splitTextToSize(content || 'No content available.', 170);
      let y = 30;
      for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], 20, y); //
        y += 6;
      }

      const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (_isIOS) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`Behold_${activeDocType}.pdf`);
      }
    } catch (err) { //
      console.error('Failed to generate PDF', err);
    }
  };

  const userRole = user?.role?.toUpperCase();
  const isSpecialRole =
    userRole === 'ADMIN' ||
    userRole === 'SUPER_ADMIN' ||
    userRole === 'SUB_ADMIN' ||
    userRole === 'PSYCHOLOGIST' ||
    userRole === 'COUNSELLOR';

  const hideNavbarAndFooter =
    isSpecialRole ||
    location.pathname === '/admin' ||
    location.pathname.startsWith('/admin/') ||
    location.pathname === '/counsellor' ||
    location.pathname === '/conceller' || //
    location.pathname === '/cousellor';

  return (
    <div className="font-sans antialiased selection:bg-brand/30 min-h-screen relative text-zinc-900 bg-zinc-50">

      {/* Global Toast Notifications */}
      <Toaster
        position="top-center" //
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            border: '1px solid #27272a', // zinc-800
          },
        }}
      />
      <ToastLimitManager />
 
      {/* Top Banner Notice Alert */}
      {!hideNavbarAndFooter && siteSettings.showBanner && siteSettings.bannerNotice && (
        <div className="w-full bg-zinc-950 text-zinc-300 text-xs sm:text-xs font-semibold py-2.5 px-4 text-center border-b border-zinc-900 relative z-50 flex items-center justify-center gap-2 tracking-wide shadow-md animate-in slide-in-from-top duration-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
          <span>{siteSettings.bannerNotice}</span>
        </div>
      )}

      {/* Global Fixed Background Image Layer for all sections */} {/* */}
      {!hideNavbarAndFooter && (
        <div
          className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none opacity-50"
            style={{
              backgroundImage: `url(${globalBgTexture})`,
            }}
          />
          {/* Subtle Ambient Light Overlay */} {/* */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4f8fc]/5 to-transparent pointer-events-none" />
        </div>
      )}

      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Mandatory profile completion for WhatsApp auto-registered or incomplete student users */}
      <CompleteProfileModal 
        isOpen={Boolean(
          user &&
          (user.role === 'user' || !user.role) &&
          !user.isProfileCompleted &&
          (
            !user.name ||
            user.name === 'New User' ||
            user.name.includes('Behold User') ||
            !user.email ||
            user.email.includes('@temp.behold') ||
            !user.age
          )
        )} 
        onSuccess={() => {
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new Event('storage'));
          }
        }} 
      />

      <ServiceBooking
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedAdvisorId={bookingAdvisor}
        clearPreselectedAdvisor={() => setBookingAdvisor(null)}
        onOpenDocs={setActiveDocType}
      />
 
      {/* Navbar — hidden on admin/counsellor dashboards */}
      {!hideNavbarAndFooter && (
        <Navbar
          navigateToSection={navigateToSection}
          currentView={location.pathname}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenBooking={() => setIsBookingModalOpen(true)}
          siteName={siteSettings.siteName}
          siteSettings={siteSettings}
        />
      )}
 

      <Suspense fallback={
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-3 border-[#00e5ff]/20 border-t-[#00e5ff] animate-spin shadow-[0_0_15px_rgba(0,229,255,0.4)]" />
              <span className="absolute font-sans font-semibold text-xs text-slate-900 tracking-widest uppercase">
                B<span className="text-[#00e5ff]">.</span>
              </span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-600 animate-pulse">
              Loading...
            </span>
          </div>
        </div>
      }>
        <Routes>
          {/* Landing Page - Exactly 4 Sections */}
          <Route path="/" element={ //
            <main className="fade-in-up">
              <Hero setView={() => { }} navigateToSection={navigateToSection} siteSettings={siteSettings} onOpenBooking={() => setIsBookingModalOpen(true)} />
              <TherapistSwipeSection onBookTherapist={handleBookTherapist} navigateToSection={navigateToSection} />
              <FaqBlogSection />
              <ContactInquirySection />
            </main>
          } />

          {/* About Page Route */}
          <Route path="/about" element={
            <main className="fade-in-up pt-16 sm:pt-20 bg-transparent min-h-screen">
              <About siteSettings={siteSettings} />
              <Reviews siteSettings={siteSettings} />
            </main>
          } />

          {/* Contact Page Route */}
          <Route path="/contact" element={
            <main className="fade-in-up pt-16 sm:pt-20 bg-transparent min-h-screen">
              <ContactInquirySection />
            </main>
          } />

          {/* Reviews Route */}
          <Route path="/reviews" element={
            <main className="fade-in-up pt-16 sm:pt-20 bg-transparent min-h-screen">
              <Reviews siteSettings={siteSettings} />
            </main>
          } />

          {/* Blog & FAQ Routes */}
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blogs" element={<Navigate to="/blog" replace />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/faq" element={<Navigate to="/faqs" replace />} />
          <Route path="/test" element={<AptitudeTest onFinishTest={handleFinishTest} />} />
          <Route path="/results/:testId" element={<TestResultsTab />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<PrivacyPolicy />} />

          {/* Aptitude routes: only active when admin enables aptitude */}
          {siteSettings.enableAptitude !== false ? (
            <Route path="/aptitude" element={<AptitudeLanding />} />
          ) : (
            <Route path="/aptitude" element={<Navigate to="/booking" replace />} />
          )}
          {siteSettings.enableAptitude !== false && siteSettings.enableSampleTest !== false ? (
            <Route path="/sample-test" element={
              <AptitudeTest onFinishTest={handleFinishTest} />
            } />
          ) : (
            <Route path="/sample-test" element={<Navigate to="/booking" replace />} />
          )}

          {/* Services Page — Career Mentoring + Psychological Counselling + Expert Listing */}
          <Route path="/booking" element={
            <main className="fade-in-up pt-16 sm:pt-20 bg-transparent">
              <Services setView={() => { }} onBookTherapist={handleBookTherapist} siteSettings={siteSettings} />
              {siteSettings.enableAptitude !== false && (
                <CdatSection setView={() => { }} siteSettings={siteSettings} />
              )}
            </main>
          } />
          <Route path="/services" element={<Navigate to="/booking" replace />} />
          <Route path="/service" element={<Navigate to="/booking" replace />} />
          <Route path="/counselling" element={<Navigate to="/booking" replace />} />
          <Route path="/counsellors" element={<Navigate to="/booking" replace />} />
          <Route path="/therapists" element={<Navigate to="/booking" replace />} />
          <Route path="/advisors" element={<Navigate to="/booking" replace />} />



          {/* Student Profile */}
          <Route path="/profile" element={ //
            <ProtectedRoute allowedRoles={['USER']}>
              <StudentProfile onOpenBooking={() => setIsBookingModalOpen(true)} />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <div className="admin-console-theme">
              {user && ['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'].includes(user.role?.toUpperCase()) ? (
                <AdminDashboard setView={() => { }} />
              ) : (
                <UnauthorizedFallback roleRequired="ADMIN" />
              )}
            </div>
          } />

          {/* Counsellor Dashboard */}
          <Route path="/counsellor" element={
            <div className="counsellor-console-theme">
              <PsychologistDashboard setView={() => { }} />
            </div>
          } />
          <Route path="/conceller" element={<Navigate to="/counsellor" replace />} />
          <Route path="/cousellor" element={<Navigate to="/counsellor" replace />} />

          {/* Advisor Public Profile */}
          <Route path="/advisor/:id" element={ //
            <AdvisorProfileWrapper
              handleBookTherapist={handleBookTherapist}
              setPendingScrollSection={setPendingScrollSection}
            />
          } />

          {/* Reset Password */}
          <Route path="/reset-password" element={<ResetPassword />} />
 
          {/* Intercept Google OAuth Callback if hitting frontend directly */}
          <Route path="/api/google/callback" element={<GoogleCallbackRedirect />} />

          {/* Catch-all fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes> {/* */}
      </Suspense>



      {/* Footer */}
      {!hideNavbarAndFooter && (
        <Footer
          navigateToSection={navigateToSection}
          siteName={siteSettings.siteName}
          siteCopyright={siteSettings.siteCopyright}
          onOpenDocs={(docType) => setActiveDocType(docType)}
          enablePsychology={siteSettings.enablePsychology !== false}
          enableCareerMentoring={siteSettings.enableCareerMentoring !== false}
          siteSettings={siteSettings}
          onOpenBooking={() => setIsBookingModalOpen(true)}
        />
      )}
 
      {/* Terms & Privacy Documents Modal */}
      {activeDocType && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
              <h3 className="text-sm font-semibold text-white font-header flex items-center gap-2">
                <span>{activeDocType === 'terms' ? 'Terms & Conditions' : activeDocType === 'refund' ? 'Return & Refund Policy' : 'Privacy Policy'}</span> {/* */}
                <span className="text-[7.5px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-semibold ">DOC</span>
              </h3>
              <button
                onClick={() => setActiveDocType(null)}
                className="p-1 bg-zinc-955 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer border-none shadow-sm flex items-center justify-center"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
 
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto text-left text-zinc-300 text-xs font-semibold leading-relaxed whitespace-pre-wrap font-sans max-h-[60vh] custom-scrollbar">
              {activeDocType === 'terms' ? siteSettings.termsOfUse : activeDocType === 'refund' ? siteSettings.refundPolicy : siteSettings.privacyPolicy}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-955">
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold text-xs rounded-xl cursor-pointer transition border border-zinc-700 shadow-md flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={() => setActiveDocType(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white hover:text-brand font-semibold text-xs rounded-lg cursor-pointer transition border-none shadow-md"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Icon */}
      {siteSettings?.whatsapp && !hideNavbarAndFooter && (() => {
        const input = siteSettings.whatsapp;
        let href = 'https://wa.me/919497174011';
        if (input && input !== '#') {
          const str = String(input).trim();
          if (str.startsWith('http')) {
            href = str;
          } else {
            const digits = str.replace(/\D/g, '');
            if (digits.length === 10) href = `https://wa.me/91${digits}`;
            else if (digits.length > 10) href = `https://wa.me/${digits}`;
          }
        }
        const isProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/profile');
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContact({ method: 'whatsapp', source: 'floating_button' })}
            className={`fixed ${isProfilePage ? 'bottom-20 lg:bottom-6' : 'bottom-6 sm:bottom-6'} right-4 sm:right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:p-4 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group`}
            title="Chat with us on WhatsApp"
            aria-label="Chat with us on WhatsApp"
          >
            <span className="absolute -top-10 right-0 bg-zinc-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-zinc-800">
              Chat on WhatsApp
            </span>
            <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>
        );
      })()}
    </div>
  );
}
