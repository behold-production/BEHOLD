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
import StudentProfile from './components/StudentProfile';
import AptitudeTest from './components/AptitudeTest';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'test', 'booking', 'profile'
  const [testProfile, setTestProfile] = useState(null);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);

  // Hash-based Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/sample-test') {
        setView('test');
      } else if (hash === '#/booking') {
        setView('booking');
      } else if (hash === '#/profile') {
        setView('profile');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check on mount
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    window.location.hash = '#/booking';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishTest = (dominantDomain, scores) => {
    // Save results
    setTestProfile({ dominantDomain, scores });
    // Navigate back to landing
    window.location.hash = '#/';

    // Smoothly scroll to inquiry section
    setTimeout(() => {
      const element = document.getElementById('inquiry');
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  const scrollToSection = (id) => {
    window.location.hash = '#/';
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  return (
    <div
      className="font-sans antialiased text-black bg-[#f3f3f3] selection:bg-gray-200 min-h-screen relative"
    >

      {/* Premium Navbar */}
      <Navbar setView={setView} currentView={view} />

      {/* Route Views */}
      {view === 'landing' && (
        <main className="fade-in-up">
          {/* Hero Section */}
          <Hero setView={setView} scrollToSection={scrollToSection} />

          {/* CIGI Differential Aptitude Test (CDAT) Section */}
          <CdatSection setView={setView} />

          {/* Services Section */}
          <Services setView={setView} onBookTherapist={handleBookTherapist} />

          {/* About Us & What We Offer Section (Combined) */}
          <About setView={setView} />

          {/* FAQs Accordion */}
          <Faq />

          {/* Inquiry / Booking Section */}
          <Inquiry testProfile={testProfile} />
        </main>
      )}

      {view === 'test' && (
        <AptitudeTest onFinishTest={handleFinishTest} />
      )}

      {view === 'booking' && (
        <ServiceBooking preselectedAdvisorId={bookingAdvisor} clearPreselectedAdvisor={() => setBookingAdvisor(null)} />
      )}

      {view === 'profile' && (
        <StudentProfile setView={setView} />
      )}

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/919497174011"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-2 right-2 w-14 h-14 bg-black hover:bg-gray-850 text-white rounded-[100px] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-50 cursor-pointer"
        aria-label="Contact support on WhatsApp"
        id="whatsapp-float-btn"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Premium Footer */}
      <Footer setView={setView} />
    </div>
  );
}
