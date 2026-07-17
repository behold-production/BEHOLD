import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import { ScrollDot } from './BrandDot';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (section) => {
    setMobileMenuOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
    } else {
      navigateToSection?.(section);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    if (!user) { onOpenAuth?.(); return; }
    const role = user.role?.toUpperCase();
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') navigate('/admin');
    else if (role === 'PSYCHOLOGIST' || role === 'COUNSELLOR') navigate('/counsellor');
    else navigate('/profile');
  };

  const whatsappUrl = (() => {
    const input = siteSettings?.whatsapp;
    if (!input || input === '#') return 'https://wa.link/4jpzfq';
    const str = String(input).trim();
    if (str.startsWith('http')) return str;
    const digits = str.replace(/\D/g, '');
    if (digits.length === 10) return `https://wa.me/91${digits}`;
    if (digits.length > 10) return `https://wa.me/${digits}`;
    return 'https://wa.link/4jpzfq';
  })();

  const navLinks = [
    { label: 'Home', action: () => goTo('home') },
    { label: 'Services', action: () => goTo('services') },
    { label: 'Sample Test', action: () => goTo('/sample-test') },
    { label: 'Blog', action: () => goTo('/blog') },
    { label: 'Contact', action: () => goTo('contact') },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md border-b border-gray-200' : 'bg-white/95 border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="text-2xl font-black tracking-wide text-gray-900 bg-transparent border-none cursor-pointer p-0 flex items-baseline gap-0.5"
            >
              <span>{siteName || 'BEHOLD'}</span>
              <ScrollDot nextId="cdat-badge" label="Scroll to CIGI Certificate ↓" size="md" inlineText={true} />
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-gray-700 hover:text-[#00A8FF] font-medium text-sm transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                title="Chat on WhatsApp"
              >
                <svg className="w-5 h-5 fill-current text-green-500" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span className="hidden lg:inline">WhatsApp</span>
              </a>

              {/* Book Appointment */}
              <button
                onClick={() => navigate('/booking')}
                className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00d8e6] text-white font-black text-sm rounded-lg transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] border-none cursor-pointer"
              >
                Book Appointment
              </button>

              {/* Sign In / Profile */}
              {user ? (
                <button
                  onClick={handleProfileClick}
                  className="w-10 h-10 rounded-full border-2 border-[#00F0FF] hover:border-[#00d8e6] bg-[#00F0FF]/10 text-[#00A8FF] font-black text-base flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_8px_rgba(0,240,255,0.3)] p-0 overflow-hidden cursor-pointer shrink-0"
                  title={`${user.name || 'User'} Profile`}
                >
                  {(user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image) ? (
                    <img
                      src={user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image}
                      alt={user.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleProfileClick}
                  className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold text-sm rounded transition-colors bg-transparent cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Hamburger & Profile */}
            <div className="md:hidden flex items-center gap-2.5">
              {user && (
                <button
                  onClick={handleProfileClick}
                  className="w-9 h-9 rounded-full border-2 border-[#00F0FF] bg-[#00F0FF]/10 text-[#00A8FF] font-black text-sm flex items-center justify-center transition-all shadow-[0_0_6px_rgba(0,240,255,0.3)] p-0 overflow-hidden cursor-pointer shrink-0"
                  title={`${user.name || 'User'} Profile`}
                >
                  {(user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image) ? (
                    <img
                      src={user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image}
                      alt={user.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </button>
              )}
              <button
                className="p-2 rounded text-gray-700 hover:bg-gray-100 transition border-none cursor-pointer bg-transparent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#00A8FF] font-medium rounded transition bg-transparent border-none cursor-pointer w-full"
                >
                  {label}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded font-medium"
                >
                  <svg className="w-5 h-5 fill-current text-green-500" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/booking'); }}
                  className="w-full py-3 bg-[#00F0FF] hover:bg-[#00d8e6] text-white font-black rounded-lg transition shadow-[0_0_12px_rgba(0,240,255,0.4)] border-none cursor-pointer"
                >
                  Book Appointment
                </button>
                {user ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleProfileClick(); }}
                      className="flex-1 py-3 bg-[#00F0FF]/10 text-[#00A8FF] font-bold rounded-lg transition hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#00F0FF] text-gray-950 flex items-center justify-center text-xs font-black overflow-hidden">
                        {(user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image) ? (
                          <img
                            src={user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image}
                            alt={user.name || 'Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsLogoutOpen(true); }}
                      className="py-3 px-4 border border-rose-300 text-rose-600 font-semibold rounded transition hover:bg-rose-50 bg-transparent cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded transition hover:bg-gray-50 bg-transparent cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => { logout(); setIsLogoutOpen(false); }}
      />
    </>
  );
}
