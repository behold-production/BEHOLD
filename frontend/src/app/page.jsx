'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../features/landing/Hero';
import TherapistSwipeSection from '../features/landing/TherapistSwipeSection';
import FaqBlogSection from '../features/landing/FaqBlogSection';
import ContactInquirySection from '../features/landing/ContactInquirySection';
import ServiceBooking from '../features/booking/ServiceBooking';
import AuthModals from '../features/auth/AuthModals';
import CompleteProfileModal from '../features/auth/CompleteProfileModal';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import globalBgTexture from '../assets/greygreen.png';

export default function HomePage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingAdvisor, setBookingAdvisor] = useState(null);
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await ApiService.getPublicSettings();
        if (res && res.success && res.data) {
          setSiteSettings(res.data);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('behold_site_settings', JSON.stringify(res.data)); } catch {}
          }
        }
      } catch (err) {
        console.warn('Failed to fetch site settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleBookTherapist = (advisorId) => {
    setBookingAdvisor(advisorId);
    setIsBookingModalOpen(true);
  };

  const navigateToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bgImageSrc = globalBgTexture?.src || globalBgTexture;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-[#00c9d6] selection:text-slate-950 font-sans">
      {/* Background Texture */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none opacity-50"
          style={{ backgroundImage: `url(${bgImageSrc})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4f8fc]/5 to-transparent pointer-events-none" />
      </div>

      <Navbar
        navigateToSection={navigateToSection}
        currentView="/"
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenBooking={() => setIsBookingModalOpen(true)}
        siteName={siteSettings.siteName || 'BEHOLD'}
        siteSettings={siteSettings}
      />

      <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingAdvisor(null);
        }}
        preselectedAdvisorId={bookingAdvisor}
        clearPreselectedAdvisor={() => setBookingAdvisor(null)}
      />

      <main className="flex-1 w-full">
        <Hero
          navigateToSection={navigateToSection}
          siteSettings={siteSettings}
          onOpenBooking={() => setIsBookingModalOpen(true)}
        />
        <TherapistSwipeSection
          onBookTherapist={handleBookTherapist}
          navigateToSection={navigateToSection}
        />
        <FaqBlogSection />
        <ContactInquirySection />
      </main>

      <Footer siteSettings={siteSettings} />
    </div>
  );
}
