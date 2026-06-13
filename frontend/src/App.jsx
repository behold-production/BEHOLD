import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CdatSection from './components/CdatSection';
import Services from './components/Services';
import About from './components/About';
import Faq from './components/Faq';
import Inquiry from './components/Inquiry';
import Footer from './components/Footer';
import AuthModals from './components/AuthModals';
const ServiceBooking = lazy(() => import('./components/ServiceBooking'));
const AdvisorProfile = lazy(() => import('./components/AdvisorProfile'));
const StudentProfile = lazy(() => import('./components/users/StudentProfile'));
const PsychologistDashboard = lazy(() => import('./components/counsellors/PsychologistDashboard'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AptitudeTest = lazy(() => import('./components/AptitudeTest'));

import { useAuth } from './context/AuthContext';
import ApiService from './services/api';

function AdvisorProfileWrapper({ handleBookTherapist, setPendingScrollSection }) {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <AdvisorProfile
      advisorId={id}
      onBack={() => {
        navigate('/');
        setPendingScrollSection('services');
      }}
      onBook={handleBookTherapist}
    />
  );
}

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [testProfile, setTestProfile] = useState(null);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);
  const [pendingScrollSection, setPendingScrollSection] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  // Expanded site settings sync state
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'BEHOLD',
    siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
    showBanner: false,
    bannerNotice: '',
    termsOfUse: '',
    privacyPolicy: '',
    whatsapp: 'https://wa.me/919497174011',
    contactEmail: 'support@behold.com',
    enablePsychology: true
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
    loadSettings();

    const fetchGlobalSettings = async () => {
      try {
        const res = await ApiService.getSettings();
        if (res.success && res.data) {
          const parsed = res.data;
          setSiteSettings(prev => ({
            ...prev,
            ...parsed
          }));
          localStorage.setItem('behold_site_settings', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Failed to fetch global settings', err);
      }
    };
    fetchGlobalSettings();

    const handleStorageChange = (e) => {
      const key = e.key || (e.detail && e.detail.key);
      if (key === 'behold_site_settings' || !key) {
        loadSettings();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
    };
  }, []);

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Setup global SPA navigate helper for legacy or external components
  useEffect(() => {
    window.spaNavigate = (path) => {
      if (path) navigate(path);
    };
  }, [navigate]);

  // Role-based routing and redirection flow
  useEffect(() => {
    if (isLoading) return; // Wait for auth to resolve

    const path = location.pathname;

    if (user) {
      const userRole = user?.role?.toUpperCase();
      if (userRole === 'ADMIN') {
        // Admins can browse any page and are not force-redirected
      } else if (userRole === 'PSYCHOLOGIST' || userRole === 'COUNSELLOR') {
        if (path !== '/counsellor' && path !== '/conceller') {
          navigate('/counsellor', { replace: true });
        }
      } else if (userRole === 'USER') {
        if (path === '/counsellor' || path === '/conceller' || path.startsWith('/admin')) {
          navigate('/profile');
        }
      }
    } else {
      if (path === '/profile') {
        navigate('/');
        setIsAuthModalOpen(true);
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Handle pending scrolls once landing view is active
  useEffect(() => {
    if (location.pathname === '/' && pendingScrollSection) {
      if (pendingScrollSection === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setPendingScrollSection(null);
        return;
      }

      let attempts = 0;
      const tryScroll = () => {
        const element = document.getElementById(pendingScrollSection);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
          setPendingScrollSection(null);
        } else if (attempts < 15) {
          attempts++;
          setTimeout(tryScroll, 50);
        } else {
          setPendingScrollSection(null);
        }
      };
      tryScroll();
    }
  }, [location.pathname, pendingScrollSection]);

  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    navigate('/booking');
  };

  const handleFinishTest = async (dominantDomain, scores) => {
    setTestProfile({ dominantDomain, scores });

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
    } catch (err) {
      console.error('Failed to save test results', err);
    }

    navigateToSection('inquiry');
  };

  const navigateToSection = (sectionId) => {
    // Handle navigation to the booking page if requested as a section
    if (sectionId === 'booking' || sectionId === '/booking') {
      navigate('/booking');
      return;
    }

    if (sectionId === 'top') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const element = document.getElementById(sectionId);
    if (location.pathname === '/' && element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    } else {
      setPendingScrollSection(sectionId);
      navigate('/');
    }
  };

  // Show blank screen while auth is resolving to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-955 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hideNavbarAndFooter =
    location.pathname === '/admin' ||
    location.pathname === '/counsellor' ||
    location.pathname === '/conceller';

  return (
    <div className="font-sans antialiased selection:bg-brand/30 min-h-screen relative text-zinc-900 bg-zinc-50">

      {/* Top Banner Notice Alert */}
      {!hideNavbarAndFooter && siteSettings.showBanner && siteSettings.bannerNotice && (
        <div className="w-full bg-zinc-950 text-zinc-300 text-xs sm:text-xs font-bold py-2.5 px-4 text-center border-b border-zinc-900 relative z-50 flex items-center justify-center gap-2 tracking-wide capitalize  shadow-md animate-in slide-in-from-top duration-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
          <span>{siteSettings.bannerNotice}</span>
        </div>
      )}

      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Navbar — hidden on admin/counsellor dashboards */}
      {!hideNavbarAndFooter && (
        <Navbar
          navigateToSection={navigateToSection}
          currentView={location.pathname}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          siteName={siteSettings.siteName}
          siteSettings={siteSettings}
        />
      )}

      <Suspense fallback={
        <div className="min-h-screen bg-zinc-955 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          <main className="fade-in-up">
            <Hero setView={() => { }} navigateToSection={navigateToSection} siteSettings={siteSettings} />
            <CdatSection setView={() => { }} />
            {siteSettings.enablePsychology !== false && <Services setView={() => { }} onBookTherapist={handleBookTherapist} />}
            <About setView={() => { }} />
            <Faq />
            <Inquiry testProfile={testProfile} siteSettings={siteSettings} />
          </main>
        } />

        {/* Aptitude Test */}
        <Route path="/sample-test" element={
          <AptitudeTest onFinishTest={handleFinishTest} />
        } />

        {/* Booking — open to guests; auth is enforced inside at "Proceed to Payment" */}
        <Route path="/booking" element={
          <ServiceBooking
            preselectedAdvisorId={bookingAdvisor}
            clearPreselectedAdvisor={() => setBookingAdvisor(null)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        } />

        {/* Student Profile */}
        <Route path="/profile" element={
          user?.role?.toUpperCase() === 'USER' ? (
            <StudentProfile />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <AdminDashboard setView={() => { }} />
        } />

        {/* Counsellor Dashboard */}
        <Route path="/counsellor" element={
          <PsychologistDashboard setView={() => { }} />
        } />
        <Route path="/conceller" element={<Navigate to="/counsellor" replace />} />

        {/* Advisor Public Profile */}
        <Route path="/advisor/:id" element={
          <AdvisorProfileWrapper
            handleBookTherapist={handleBookTherapist}
            setPendingScrollSection={setPendingScrollSection}
          />
        } />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Floating WhatsApp Button */}
      {!hideNavbarAndFooter && !location.pathname.startsWith('/profile') && (() => {
        const whatsappUrl = siteSettings.whatsapp || "https://wa.me/919497174011";
        return (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-4 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[100px] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-50 cursor-pointer"
            aria-label="Contact support on WhatsApp"
            id="whatsapp-float-btn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>
        );
      })()}

      {/* Footer */}
      {!hideNavbarAndFooter && (
        <Footer
          navigateToSection={navigateToSection}
          siteName={siteSettings.siteName}
          siteCopyright={siteSettings.siteCopyright}
          onOpenDocs={(docType) => setActiveDocType(docType)}
        />
      )}

      {/* Terms & Privacy Documents Modal */}
      {activeDocType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
              <h3 className="text-sm font-bold capitalize  text-white font-header flex items-center gap-2">
                <span>{activeDocType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}</span>
                <span className="text-[7.5px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-black  capitalize ">DOC</span>
              </h3>
              <button
                onClick={() => setActiveDocType(null)}
                className="p-1 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer border-none shadow-sm flex items-center justify-center"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto text-left text-zinc-300 text-xs font-semibold leading-relaxed whitespace-pre-wrap font-sans max-h-[60vh] custom-scrollbar">
              {activeDocType === 'terms' ? siteSettings.termsOfUse : siteSettings.privacyPolicy}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end bg-zinc-955">
              <button
                onClick={() => setActiveDocType(null)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white hover:text-brand font-black text-xs capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
