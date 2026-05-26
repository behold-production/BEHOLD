import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Faq from './components/Faq';
import Inquiry from './components/Inquiry';
import FinalCTA from './components/FinalCTA';
import ServiceBooking from './components/ServiceBooking';
import Footer from './components/Footer';
import StudentProfile from './components/StudentProfile';
import TherapistDirectory from './components/TherapistDirectory';
import AptitudeTest from './components/AptitudeTest';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'test', or 'booking'
  const [testProfile, setTestProfile] = useState(null);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);


  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    setView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishTest = (dominantDomain, scores) => {
    // Save results
    setTestProfile({ dominantDomain, scores });
    // Navigate back to landing
    setView('landing');

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
    setView('landing');
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

      Premium Navbar
      <Navbar setView={setView} currentView={view} />

      Route Views
      {view === 'landing' && (
        <main className="fade-in-up">
          {/* Hero Section */}
          <Hero setView={setView} scrollToSection={scrollToSection} />

          {/* Services Section */}
          <Services setView={setView} onBookTherapist={handleBookTherapist} />

          {/* Therapist Directory Section */}
          <TherapistDirectory onBookTherapist={handleBookTherapist} />

          {/* Process Section */}
          <Process />

          {/* About Us & Testimonials Section */}
          <About setView={setView} />

          {/* Testimonials Carousel */}
          <Testimonials />

          {/* FAQs Accordion */}
          <Faq />

          {/* Inquiry / Booking Section */}
          <Inquiry testProfile={testProfile} />

          {/* Final Call to Action */}
          <FinalCTA setView={setView} />
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
