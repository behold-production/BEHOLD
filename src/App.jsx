import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [view, setView] = useState('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [testProfile, setTestProfile] = useState(null);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);
  const [pendingScrollSection, setPendingScrollSection] = useState(null);
  const [viewingAdvisorId, setViewingAdvisorId] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const { user, isLoading } = useAuth();

  // Monitor user state for pending redirect to booking
  useEffect(() => {
    if (user && pendingRedirect) {
      setPendingRedirect(false);
      window.location.hash = '#/booking';
    }
  }, [user, pendingRedirect]);

  // Auto-redirect based on role when user logs in or page loads
  useEffect(() => {
    if (isLoading) return; // Wait for auth to resolve

    if (user) {
      const hash = window.location.hash;
      if (user.role === 'ADMIN') {
        // Admin anywhere except /admin → redirect
        if (hash !== '#/admin') {
          window.location.hash = '#/admin';
        } else {
          setView('admin');
        }
      } else if (user.role === 'PSYCHOLOGIST') {
        // Counsellor anywhere except /counsellor → redirect
        if (hash !== '#/counsellor' && hash !== '#/conceller') {
          window.location.hash = '#/counsellor';
        } else {
          setView('counsellor');
        }
      }
    }
  }, [user, isLoading]);

  // Hash-based Routing — only runs after auth is resolved
  useEffect(() => {
    if (isLoading) return; // Don't route until we know who the user is

    const handleHashChange = () => {
      const hash = window.location.hash;

      // ─── /sample-test ───────────────────────────────────────────────
      if (hash === '#/sample-test') {
        setView('test');
        setTimeout(() => window.scrollTo(0, 0), 10);
        return;
      }

      // ─── /booking ────────────────────────────────────────────────────
      if (hash === '#/booking') {
        if (!user) {
          // Guest → show auth modal then redirect
          setPendingRedirect(true);
          window.location.hash = '#/';
          setIsAuthModalOpen(true);
        } else if (user.role === 'USER') {
          setView('booking');
          setTimeout(() => window.scrollTo(0, 0), 10);
        } else if (user.role === 'ADMIN') {
          window.location.hash = '#/admin';
        } else if (user.role === 'PSYCHOLOGIST') {
          window.location.hash = '#/counsellor';
        }
        return;
      }

      // ─── /profile ────────────────────────────────────────────────────
      if (hash === '#/profile') {
        if (!user) {
          window.location.hash = '#/';
          setIsAuthModalOpen(true);
        } else if (user.role === 'ADMIN') {
          window.location.hash = '#/admin';
        } else if (user.role === 'PSYCHOLOGIST') {
          window.location.hash = '#/counsellor';
        } else {
          setView('profile');
          setTimeout(() => window.scrollTo(0, 0), 10);
        }
        return;
      }

      // ─── /admin ──────────────────────────────────────────────────────
      if (hash === '#/admin') {
        if (user && user.role === 'PSYCHOLOGIST') {
          // Counsellor must not access admin
          window.location.hash = '#/counsellor';
        } else if (user && user.role === 'USER') {
          // Student must not access admin
          window.location.hash = '#/profile';
        } else {
          // null user (guest) or ADMIN → show admin dashboard (with its own login gate for guests)
          setView('admin');
          setTimeout(() => window.scrollTo(0, 0), 10);
        }
        return;
      }

      // ─── /counsellor ─────────────────────────────────────────────────
      if (hash === '#/counsellor' || hash === '#/conceller') {
        if (user && user.role === 'ADMIN') {
          // Admin must not access counsellor portal
          window.location.hash = '#/admin';
        } else if (user && user.role === 'USER') {
          // Student must not access counsellor portal
          window.location.hash = '#/profile';
        } else {
          // null user (guest) or PSYCHOLOGIST → show counsellor dashboard (with its own login gate for guests)
          setView('counsellor');
          setTimeout(() => window.scrollTo(0, 0), 10);
        }
        return;
      }

      // ─── /advisor/:id ─────────────────────────────────────────────────
      if (hash.startsWith('#/advisor/')) {
        const id = hash.split('#/advisor/')[1];
        setViewingAdvisorId(id);
        setView('advisor');
        setTimeout(() => window.scrollTo(0, 0), 10);
        return;
      }

      // ─── default: landing ────────────────────────────────────────────
      setView('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    // Run on mount (after auth loaded)
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user, isLoading]);

  // Handle pending scrolls once landing view is active
  useEffect(() => {
    if (view === 'landing' && pendingScrollSection) {
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
  }, [view, pendingScrollSection]);

  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    window.location.hash = '#/booking';
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
      if (view === 'landing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setPendingScrollSection('top');
        window.location.hash = '#/';
      }
      return;
    }

    if (view === 'landing') {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
      }
    } else {
      setPendingScrollSection(sectionId);
      window.location.hash = '#/';
    }
  };

  // Show blank screen while auth is resolving to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased selection:bg-brand/30 min-h-screen relative text-zinc-900 bg-zinc-50">
      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Navbar — hidden on admin/counsellor full-screen dashboards */}
      {view !== 'admin' && view !== 'counsellor' && (
        <Navbar navigateToSection={navigateToSection} currentView={view} onOpenAuth={() => setIsAuthModalOpen(true)} />
      )}

      {/* ── Landing ─────────────────────────────────────────────────── */}
      {view === 'landing' && (
        <main className="fade-in-up">
          <Hero setView={setView} navigateToSection={navigateToSection} />
          <CdatSection setView={setView} />
          <Services setView={setView} onBookTherapist={handleBookTherapist} />
          <About setView={setView} />
          <Faq />
          <Inquiry testProfile={testProfile} />
        </main>
      )}

      {/* ── Aptitude Test ────────────────────────────────────────────── */}
      {view === 'test' && (
        <AptitudeTest onFinishTest={handleFinishTest} />
      )}

      {/* ── Booking ──────────────────────────────────────────────────── */}
      {view === 'booking' && user?.role === 'USER' && (
        <ServiceBooking
          preselectedAdvisorId={bookingAdvisor}
          clearPreselectedAdvisor={() => setBookingAdvisor(null)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* ── Student Profile ───────────────────────────────────────────── */}
      {view === 'profile' && user?.role === 'USER' && (
        <StudentProfile setView={setView} />
      )}

      {/* ── Admin Dashboard ───────────────────────────────────────────── */}
      {view === 'admin' && (
        <AdminDashboard setView={setView} />
      )}

      {/* ── Counsellor Dashboard ──────────────────────────────────────── */}
      {view === 'counsellor' && (
        <PsychologistDashboard setView={setView} />
      )}

      {/* ── Advisor Public Profile ────────────────────────────────────── */}
      {view === 'advisor' && (
        <AdvisorProfile
          advisorId={viewingAdvisorId}
          onBack={() => { window.location.hash = '#/'; setPendingScrollSection('services'); }}
          onBook={handleBookTherapist}
        />
      )}

      {/* Floating WhatsApp Button */}
      {view !== 'admin' && view !== 'counsellor' && (() => {
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
      {view !== 'admin' && view !== 'counsellor' && (
        <Footer navigateToSection={navigateToSection} />
      )}
    </div>
  );
}
