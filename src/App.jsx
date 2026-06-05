import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CdatSection from './components/CdatSection';
import Services from './components/Services';
import About from './components/About';
import Faq from './components/Faq';
import Inquiry from './components/Inquiry';
import ServiceBooking from './components/ServiceBooking';
import Footer from './components/Footer';
import StudentProfile from './components/users/StudentProfile';
import PsychologistDashboard from './components/counsellors/PsychologistDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AptitudeTest from './components/AptitudeTest';
import AuthModals from './components/AuthModals';
import AdvisorProfile from './components/AdvisorProfile';
import { useAuth } from './context/AuthContext';

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

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Monitor user state for pending redirect to booking
  useEffect(() => {
    if (user && pendingRedirect) {
      setPendingRedirect(false);
      navigate('/booking');
    }
  }, [user, pendingRedirect, navigate]);

  // Setup global SPA navigate helper for other components
  useEffect(() => {
    window.spaNavigate = (path) => {
      navigate(path);
    };
  }, [navigate]);

  // Role-based routing and redirection flow
  useEffect(() => {
    if (isLoading) return; // Wait for auth to resolve

    const path = location.pathname;

    if (user) {
      if (user.role === 'ADMIN') {
        if (path !== '/admin') {
          navigate('/admin', { replace: true });
        }
      } else if (user.role === 'PSYCHOLOGIST') {
        if (path !== '/counsellor' && path !== '/conceller') {
          navigate('/counsellor', { replace: true });
        }
      } else if (user.role === 'USER') {
        // Students cannot visit /admin or /counsellor
        if (path === '/admin' || path === '/counsellor' || path === '/conceller') {
          navigate('/profile', { replace: true });
        }
      }
    } else {
      // Guests visiting restricted user paths: /booking, /profile
      if (path === '/booking') {
        setPendingRedirect(true);
        navigate('/', { replace: true });
        setIsAuthModalOpen(true);
      } else if (path === '/profile') {
        navigate('/', { replace: true });
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

  const handleFinishTest = (dominantDomain, scores) => {
    setTestProfile({ dominantDomain, scores });

    try {
      const results = JSON.parse(localStorage.getItem('behold_test_results_db') || '[]');
      const newResult = {
        id: 'res_' + Date.now(),
        studentName: user ? user.name : 'Anonymous Student',
        studentEmail: user ? user.email : 'anonymous@behold.com',
        dominantDomain,
        scores,
        date: new Date().toISOString().split('T')[0]
      };
      results.push(newResult);
      localStorage.setItem('behold_test_results_db', JSON.stringify(results));
    } catch (err) {
      console.error('Failed to save test results', err);
    }

    navigateToSection('inquiry');
  };

  const navigateToSection = (sectionId) => {
    if (sectionId === 'top') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPendingScrollSection('top');
        navigate('/');
      }
      return;
    }

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
      }
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
      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Navbar — hidden on admin/counsellor full-screen dashboards */}
      {!hideNavbarAndFooter && (
        <Navbar navigateToSection={navigateToSection} currentView={location.pathname} onOpenAuth={() => setIsAuthModalOpen(true)} />
      )}

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={
          <main className="fade-in-up">
            <Hero setView={() => {}} navigateToSection={navigateToSection} />
            <CdatSection setView={() => {}} />
            <Services setView={() => {}} onBookTherapist={handleBookTherapist} />
            <About setView={() => {}} />
            <Faq />
            <Inquiry testProfile={testProfile} />
          </main>
        } />

        {/* Aptitude Test */}
        <Route path="/sample-test" element={
          <AptitudeTest onFinishTest={handleFinishTest} />
        } />

        {/* Booking */}
        <Route path="/booking" element={
          user?.role === 'USER' ? (
            <ServiceBooking
              preselectedAdvisorId={bookingAdvisor}
              clearPreselectedAdvisor={() => setBookingAdvisor(null)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Student Profile */}
        <Route path="/profile" element={
          user?.role === 'USER' ? (
            <StudentProfile setView={() => {}} />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Admin Dashboard */}
        <Route path="/admin" element={
          user && user.role !== 'ADMIN' ? (
            <Navigate to="/profile" replace />
          ) : (
            <AdminDashboard setView={() => {}} />
          )
        } />

        {/* Counsellor Dashboard */}
        <Route path="/counsellor" element={
          user && user.role !== 'PSYCHOLOGIST' ? (
            <Navigate to="/profile" replace />
          ) : (
            <PsychologistDashboard setView={() => {}} />
          )
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

      {/* Floating WhatsApp Button */}
      {!hideNavbarAndFooter && (() => {
        const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
        const whatsappUrl = settings.whatsapp || "https://wa.me/919497174011";
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
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
        );
      })()}

      {/* Footer */}
      {!hideNavbarAndFooter && (
        <Footer navigateToSection={navigateToSection} />
      )}
    </div>
  );
}
