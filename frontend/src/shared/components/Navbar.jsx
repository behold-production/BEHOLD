import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import { Menu, X } from 'lucide-react';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTo = (section) => {
    setMobileMenuOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => navigateToSection?.(section), 100);
      } else {
        navigateToSection?.(section);
      }
    }
  };

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    if (!user) {
      onOpenAuth?.();
      return;
    }
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
    { label: 'Home', action: () => goTo('home'), path: '/' },
    { label: 'Services', action: () => goTo('services'), path: '/booking' },
    { label: 'Sample Test', action: () => goTo('/sample-test'), path: '/sample-test' },
    { label: 'Blog', action: () => goTo('/blog'), path: '/blog' },
    { label: 'Contact', action: () => goTo('contact'), path: '#contact' },
  ];

  return (
    <>
      {/* Top Text-Only Announcement Bar - Only shows when Admin enables & assigns details */}
      {siteSettings?.showBanner && siteSettings?.bannerNotice && (
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 font-medium flex items-center justify-center gap-3 relative z-50">
          <span className="inline-block text-cyan-400 bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-slate-700">
            {siteSettings.bannerNotice}
          </span>
          {siteSettings?.phone && (
            <>
              <span className="hidden sm:inline text-slate-300">&middot;</span>
              <a
                href={`tel:${siteSettings.phone}`}
                className="text-white hover:underline font-bold transition-colors"
              >
                Helpline: {siteSettings.phone}
              </a>
            </>
          )}
        </div>
      )}

      {/* Classic Clean Fixed Header - Luxury Editorial Aesthetic */}
      {(() => {
        const isHomeTop = location.pathname === '/' && !isScrolled;

        return (
          <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHomeTop
              ? 'bg-transparent border-b border-transparent text-white'
              : 'bg-[#f7f4ef]/95 backdrop-blur-md border-b border-[#e2dad2] shadow-xs text-[#1c1514]'
              }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

              {/* Logo - OURA & CO style */}
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 text-left bg-transparent border-none cursor-pointer p-0"
              >
                <span
                  className={`text-xl sm:text-2xl font-black tracking-tight font-sans uppercase transition-colors ${isHomeTop ? 'text-white' : 'text-[#1c1514]'
                    }`}
                >
                  {(siteName || 'BEHOLD').replace(/\.$/, '')}.
                </span>
              </button>

              {/* Desktop Nav Links - Uppercase Editorial */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map(({ label, action, path }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={label}
                      onClick={action}
                      className={`text-xs font-bold uppercase tracking-widest transition-colors bg-transparent border-none cursor-pointer p-0 ${isHomeTop
                        ? isActive
                          ? 'text-white font-extrabold border-b border-white pb-1'
                          : 'text-white/80 hover:text-white'
                        : isActive
                          ? 'text-[#1c1514] font-extrabold border-b border-[#1c1514] pb-1'
                          : 'text-[#6e635e] hover:text-[#1c1514]'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Right Action Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate('/booking')}
                  className={`px-6 py-2.5 font-bold text-[11px] uppercase tracking-widest rounded-full transition-all shadow-xs border-none cursor-pointer flex items-center gap-1.5 ${isHomeTop
                    ? 'bg-white hover:bg-[#f7f4ef] text-[#1c1514]'
                    : 'bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef]'
                    }`}
                >
                  <span>Book Appointment</span>
                </button>

                {user ? (
                  <button
                    onClick={handleProfileClick}
                    className={`w-9 h-9 rounded-full border text-xs flex items-center justify-center transition-all p-0 overflow-hidden cursor-pointer shrink-0 shadow-xs ${isHomeTop
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-[#d8d0c7] bg-[#ebe5df] text-[#1c1514]'
                      }`}
                    title={`${user.name || 'User'} Profile`}
                  >
                    {(user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image) ? (
                      <img
                        src={user.profilePic || user.avatar || user.profileImage || user.photoURL || user.image}
                        alt={user.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className={`font-bold ${isHomeTop ? 'text-white' : 'text-[#1c1514]'}`}>
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleProfileClick}
                    className={`px-4 py-2 border font-bold text-[11px] uppercase tracking-widest rounded-full transition-all cursor-pointer ${isHomeTop
                      ? 'border-white/40 hover:border-white text-white bg-white/10 hover:bg-white/20'
                      : 'border-[#d8d0c7] hover:border-[#1c1514] text-[#2b211e] bg-[#f7f4ef]'
                      }`}
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Hamburger */}
              <div className="md:hidden flex items-center gap-2">
                {user && (
                  <button
                    onClick={handleProfileClick}
                    className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-all p-0 overflow-hidden cursor-pointer ${isHomeTop ? 'border-white/30 bg-white/10 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'
                      }`}
                  >
                    <span className="font-bold">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                  </button>
                )}
                <button
                  className={`p-2 rounded-lg transition border-none cursor-pointer bg-transparent ${isHomeTop ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex flex-col gap-3">
                {navLinks.map(({ label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="text-left py-2 text-slate-700 hover:text-slate-900 font-semibold transition bg-transparent border-none cursor-pointer text-sm"
                  >
                    {label}
                  </button>
                ))}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/booking'); }}
                    className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg transition border-none cursor-pointer text-sm"
                  >
                    Book Appointment
                  </button>
                  {user ? (
                    <button
                      onClick={() => { setMobileMenuOpen(false); setIsLogoutOpen(true); }}
                      className="w-full py-2 border border-rose-200 text-rose-600 font-semibold rounded-lg transition bg-white text-xs"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
                      className="w-full py-2 border border-slate-200 text-slate-800 font-semibold rounded-lg transition bg-white text-xs"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            )}
          </header>
        );
      })()}

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => { logout(); setIsLogoutOpen(false); }}
      />
    </>
  );
}
