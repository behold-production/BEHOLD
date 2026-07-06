import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoClick = () => {
    if (currentView === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') {
      navigate('/admin');
    } else if (role === 'PSYCHOLOGIST' || role === 'COUNSELLOR') {
      navigate('/counsellor');
    } else {
      navigate('/profile');
    }
    setMobileMenuOpen(false);
  };

  const isSolid = isScrolled || currentView !== '/';
  const navClass = isScrolled
    ? "fixed w-full z-50 transition-all duration-300 lg:py-3 top-0"
    : "fixed w-full z-50 transition-all duration-300 lg:py-3 top-0 lg:top-8";

  return (
    <>
      {/* Top bar info */}
      <div className="bg-zinc-950 text-white/80 text-xs py-2 px-6 border-b border-white/5 relative z-50 hidden md:block">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-6">
            <a href={siteSettings?.contactPhone ? `tel:${siteSettings.contactPhone.replace(/\s+/g, '')}` : '#'} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              {siteSettings?.contactPhone ? siteSettings.contactPhone : 'Not Available'}
            </a>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {siteSettings?.openHours ? siteSettings.openHours : 'Not Available'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <nav id="navbar" className={navClass}>
        <div className="max-w-[1440px] mx-auto px-0 lg:px-12">
          <div className={`rounded-none lg:rounded-full px-5 sm:px-8 py-3 lg:py-2 flex items-center justify-between min-w-0 transition-all duration-500 ${!isSolid ? 'bg-transparent border-transparent shadow-none' : 'glass shadow-sm border-b border-gray-100 lg:border lg:border-gray-100'}`}>
            {/* Left Section: Hamburger + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Button */}
              <div className="flex lg:hidden items-center">
                <button
                  className={`p-1.5 -ml-2 rounded-xl transition-colors bg-transparent border-none cursor-pointer ${!isSolid ? 'text-white hover:bg-white/20' : 'text-zinc-950 hover:bg-gray-100/50'}`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                </button>
              </div>

              {/* Logo */}
              <button onClick={logoClick} className={`flex-shrink-0 flex items-center logo-text bg-transparent border-none p-0 cursor-pointer ${!isSolid ? 'text-white' : 'text-[#1f2937]'}`} style={{ lineHeight: 1 }}>
                {siteName || 'BEHOLD'}<span className="logo-dot" style={{ color: !isSolid ? '#00E5FF' : '#0ea5e9' }}>.</span>
              </button>
            </div>

            {/* Desktop Menu */}
            <div className={`hidden lg:flex items-center space-x-8 text-sm font-medium transition-colors duration-300 ${!isSolid ? 'text-white/90' : 'text-zinc-950'}`}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('home') || navigate('/'); }} className={`transition-colors ${!isSolid ? 'hover:text-[#00E5FF]' : 'hover:text-[#206173]'}`}>Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('services') || navigate('/'); }} className={`transition-colors flex items-center gap-1.5 ${!isSolid ? 'hover:text-[#00E5FF]' : 'hover:text-[#206173]'}`}>Services <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg></a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/sample-test'); }} className={`transition-colors ${!isSolid ? 'hover:text-[#00E5FF]' : 'hover:text-[#206173]'}`}>Sample Test</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('contact') || navigate('/'); }} className={`transition-colors ${!isSolid ? 'hover:text-[#00E5FF]' : 'hover:text-[#206173]'}`}>Contact</a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">

              {/* Desktop CTA Button */}
              <button
                onClick={() => navigate('/booking')}
                className={`hidden lg:block px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg cursor-pointer border-none hover:scale-105 active:scale-95 ${!isSolid ? 'bg-white text-zinc-950 hover:bg-gray-100 hover:shadow-white/20' : 'bg-brand text-zinc-950 hover:bg-brand-dark hover:shadow-brand/20'}`}
              >
                Book Appointment
              </button>

              {/* Profile Avatar (Mobile + Desktop) */}
              <div className="relative group flex items-center justify-center">
                <button
                  onClick={handleProfileClick}
                  className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border-none flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 ${!isSolid ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                >
                  {user ? (
                    user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm tracking-widest uppercase">
                        {user.name ? user.name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('') : 'U'}
                      </span>
                    )
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </button>
                <div className="absolute top-[110%] right-0 lg:left-1/2 lg:-translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg translate-y-2 group-hover:translate-y-0 before:content-[''] before:absolute before:-top-1 before:right-3 lg:before:left-1/2 lg:before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-gray-800">
                  {user ? 'My Profile' : 'Sign In'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Menu Slide-out */}
      <div id="mobile-menu" className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-white z-50 shadow-2xl lg:hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <button onClick={logoClick} className="flex-shrink-0 flex items-center logo-text bg-transparent border-none p-0 cursor-pointer text-black" style={{ lineHeight: 1 }}>
            {siteName || 'BEHOLD'}<span className="logo-dot" style={{ color: '#0ea5e9' }}>.</span>
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-2 border-none cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 sm:px-6">
          <div className="flex flex-col py-2">
            <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateToSection?.('home') || navigate('/'); }} className="group font-medium text-gray-800 hover:text-[#206173] py-4 border-b border-gray-100 flex items-center justify-between text-[17px]">
              Home
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#206173] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateToSection?.('services') || navigate('/'); }} className="group font-medium text-gray-800 hover:text-[#206173] py-4 border-b border-gray-100 flex items-center justify-between text-[17px]">
              Services
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#206173] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate('/sample-test'); }} className="group font-medium text-gray-800 hover:text-[#206173] py-4 border-b border-gray-100 flex items-center justify-between text-[17px]">
              Sample Test
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#206173] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigateToSection?.('contact') || navigate('/'); }} className="group font-medium text-gray-800 hover:text-[#206173] py-4 flex items-center justify-between text-[17px]">
              Contact Us
              <svg className="w-5 h-5 text-gray-300 group-hover:text-[#206173] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3 mt-auto">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (user) setIsLogoutOpen(true);
              else onOpenAuth?.();
            }}
            className="w-full bg-white text-gray-700 hover:bg-gray-100 py-3.5 rounded-xl font-medium shadow-sm active:scale-95 transition-all duration-300 border border-gray-200 flex justify-center items-center gap-2 cursor-pointer text-base"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            {user ? 'Sign Out' : 'Sign In'}
          </button>

          <a
            href="https://wa.link/4jpzfq"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white py-3.5 rounded-xl font-medium shadow-sm active:scale-95 transition-all duration-300 border-none flex justify-center items-center gap-2 text-base"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.46L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.118-2.91-6.997-1.881-1.879-4.36-2.912-6.998-2.913-5.443 0-9.868 4.425-9.873 9.873-.001 1.77.465 3.49 1.348 5.022L1.876 22.1l4.771-1.253zM17.43 14.93c-.313-.156-1.854-.915-2.141-1.018-.287-.104-.497-.156-.707.156-.21.312-.814 1.018-1 1.225-.186.208-.371.233-.684.078-1.597-.798-2.63-1.385-3.66-3.153-.271-.463-.271-.237.104-.613.337-.337.497-.52.684-.712.186-.193.186-.313.093-.52-.093-.208-.707-1.702-.97-2.327-.255-.612-.516-.529-.707-.539-.181-.01-.389-.01-.597-.01-.208 0-.547.078-.834.39-.287.312-1.097 1.07-1.097 2.611 0 1.54 1.12 3.031 1.277 3.239.156.208 2.203 3.364 5.337 4.717.745.322 1.328.513 1.78.657.749.238 1.431.205 1.97.124.6-.09 1.854-.758 2.114-1.492.26-.735.26-1.363.181-1.492-.078-.13-.287-.208-.6-.364z" />
            </svg>
            WhatsApp Us
          </a>
          <button
            onClick={() => { setMobileMenuOpen(false); navigate('/booking'); }}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-medium shadow-sm active:scale-95 transition-transform border-none cursor-pointer text-base"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <a
          href={siteSettings?.whatsapp || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851] flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-[0_8px_32px_rgba(37,211,102,0.3)] border border-white/20 cursor-pointer"
        >
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.46L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.118-2.91-6.997-1.881-1.879-4.36-2.912-6.998-2.913-5.443 0-9.868 4.425-9.873 9.873-.001 1.77.465 3.49 1.348 5.022L1.876 22.1l4.771-1.253zM17.43 14.93c-.313-.156-1.854-.915-2.141-1.018-.287-.104-.497-.156-.707.156-.21.312-.814 1.018-1 1.225-.186.208-.371.233-.684.078-1.597-.798-2.63-1.385-3.66-3.153-.271-.463-.271-.237.104-.613.337-.337.497-.52.684-.712.186-.193.186-.313.093-.52-.093-.208-.707-1.702-.97-2.327-.255-.612-.516-.529-.707-.539-.181-.01-.389-.01-.597-.01-.208 0-.547.078-.834.39-.287.312-1.097 1.07-1.097 2.611 0 1.54 1.12 3.031 1.277 3.239.156.208 2.203 3.364 5.337 4.717.745.322 1.328.513 1.78.657.749.238 1.431.205 1.97.124.6-.09 1.854-.758 2.114-1.492.26-.735.26-1.363.181-1.492-.078-.13-.287-.208-.6-.364z" />
          </svg>
        </a>
        <div className="absolute right-[110%] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-xl translate-x-2 group-hover:translate-x-0 mr-2 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-2 before:border-4 before:border-transparent before:border-l-gray-800">
          Chat on WhatsApp
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutOpen(false);
          setMobileMenuOpen(false);
        }}
      />
    </>
  );
}
