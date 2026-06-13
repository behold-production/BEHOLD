import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    if (currentView !== '/') {
      setActiveSection('');
      return;
    }

    const sections = ['home', 'services', 'about', 'faqs', 'inquiry', 'cdat'];

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [currentView]);

  // Body scroll lock while the mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  // Close mobile drawer & dropdown automatically when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [currentView]);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e) => {
      if (
        desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target) &&
        mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const scrollToSection = (id) => {
    navigateToSection(id);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigateToSection('top');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    setIsMenuOpen(false);
    if (user) {
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'PSYCHOLOGIST' || role === 'COUNSELLOR') {
        navigate('/counsellor');
      } else {
        navigate('/profile');
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full bg-white/85 backdrop-blur-lg z-50 border-b border-zinc-200/60 text-zinc-900 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Left Column: Logo & Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-12 min-w-0">
            {/* Hamburger Menu Toggle on Left of Logo for Mobile */}
            <button
              id="mobile-menu-toggle"
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              className="lg:hidden text-zinc-900 hover:text-brand-dark hover:bg-zinc-50 transition rounded-lg w-11 h-11 -ml-2 flex items-center justify-center cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span
              onClick={handleLogoClick}
              className="font-header font-black text-lg sm:text-xl tracking-tighter cursor-pointer text-zinc-900 hover:text-brand transition duration-300 select-none truncate"
              id="nav-logo"
            >
              {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
            </span>

            <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold  text-zinc-500">
              <button
                onClick={handleLogoClick}
                className={`transition-all duration-300 cursor-pointer pb-1 relative capitalize ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') ? 'text-zinc-900 font-bold' : 'hover:text-zinc-900'
                  }`}
              >
                Home
                {currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>

              {siteSettings.enablePsychology !== false && (
                <button
                  onClick={() => scrollToSection('services')}
                  className={`transition-all duration-300 cursor-pointer pb-1 relative capitalize ${activeSection === 'services' && currentView === '/' ? 'text-zinc-900 font-bold' : 'hover:text-zinc-900'
                    }`}
                >
                  Services
                  {activeSection === 'services' && currentView === '/' && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                  )}
                </button>
              )}

              <button
                onClick={() => navigate('/sample-test')}
                className={`transition-all duration-300 cursor-pointer pb-1 relative capitalize ${currentView === '/sample-test' ? 'text-zinc-900 font-bold' : 'hover:text-zinc-900'
                  }`}
              >
                Sample Test
                {currentView === '/sample-test' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('inquiry')}
                className={`transition-all duration-300 cursor-pointer pb-1 relative capitalize ${activeSection === 'inquiry' && currentView === '/' ? 'text-zinc-900 font-bold' : 'hover:text-zinc-900'
                  }`}
              >
                Contact
                {activeSection === 'inquiry' && currentView === '/' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>
            </nav>
          </div>

          {/* Right Column: Actions */}
          <div className="hidden lg:flex items-center gap-3 relative">
            {user ? (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="Account menu"
                  aria-expanded={showDropdown}
                  className="w-10 h-10 rounded-full overflow-hidden bg-brand/10 text-brand-dark font-black flex items-center justify-center capitalize  text-sm shadow-xs border border-brand/20 hover:scale-105 transition-transform cursor-pointer"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-3 w-52 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-150">
                      <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-3 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" /> Your Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowDropdown(false); setIsLogoutConfirmOpen(true); }}
                      className="w-full text-left px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 h-10 text-xs font-bold text-zinc-900 hover:text-brand transition-colors cursor-pointer capitalize  rounded-lg hover:bg-zinc-50 flex items-center"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/booking')}
              className={`px-5 h-10 text-xs font-bold rounded-lg border transition-all duration-300 cursor-pointer flex items-center gap-1.5 capitalize  ${currentView === '/booking'
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-brand hover:bg-brand-dark text-zinc-900 shadow-xs border-brand/30'
                }`}
            >
              <span>Book Session</span>
            </button>
          </div>

          {/* Mobile Actions (Avatar only) */}
          <div className="flex items-center lg:hidden relative">
            <div className="relative" ref={mobileDropdownRef}>
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-label="Account menu"
                    aria-expanded={showDropdown}
                    className="w-10 h-10 rounded-full overflow-hidden bg-brand/10 text-brand-dark font-black flex items-center justify-center capitalize  text-xs shadow-xs border border-brand/20 cursor-pointer"
                  >
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-zinc-150">
                        <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-3 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" /> Your Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDropdown(false); setIsLogoutConfirmOpen(true); }}
                        className="w-full text-left px-4 py-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-10 h-10 rounded-full bg-brand text-zinc-900 flex items-center justify-center shadow-xs border border-brand/30 hover:scale-105 transition-transform cursor-pointer"
                  title="Sign In"
                  aria-label="Sign In"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Side Drawer - Glassmorphism UI */}
      <aside
        id="mobile-drawer"
        aria-hidden={!isMenuOpen}
        className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl transition-all duration-300 ease-in-out transform flex flex-col p-5 border-r border-zinc-200 ${isMenuOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible pointer-events-none'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-150 mb-5">
          <span
            onClick={() => { setIsMenuOpen(false); handleLogoClick(); }}
            className="font-header font-black text-lg tracking-tighter cursor-pointer text-zinc-900 hover:text-brand transition duration-300"
          >
            {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <button
            type="button"
            onClick={handleLogoClick}
            className={`w-full text-left px-3.5 py-3.5 rounded-lg text-xs font-bold capitalize  transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '')
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Home</span>
          </button>

          {siteSettings.enablePsychology !== false && (
            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className={`w-full text-left px-3.5 py-3.5 rounded-lg text-xs font-bold capitalize  transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'services' && currentView === '/'
                ? 'bg-brand/10 text-zinc-900 border-brand font-black'
                : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
                }`}
            >
              <span>Services</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { navigate('/sample-test'); setIsMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-3.5 rounded-lg text-xs font-bold capitalize  transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/sample-test'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Sample Test</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('inquiry')}
            className={`w-full text-left px-3.5 py-3.5 rounded-lg text-xs font-bold capitalize  transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'inquiry' && currentView === '/'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Contact</span>
          </button>

          <button
            type="button"
            onClick={() => { navigate('/booking'); setIsMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-3.5 rounded-lg text-xs font-bold capitalize  transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/booking'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Book Session</span>
          </button>
        </div>

        {/* Drawer Footer: User Profile Widget */}
        <div className="pt-4 border-t border-zinc-150 mt-auto">
          {user ? (
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand-dark font-black flex items-center justify-center text-xs shrink-0 shadow-inner border border-brand/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate leading-tight">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5 leading-none">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="py-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-900 rounded-md transition-colors text-center cursor-pointer capitalize  min-h-[40px]"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogoutConfirmOpen(true); setIsMenuOpen(false); }}
                  className="py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors text-center cursor-pointer capitalize  flex items-center justify-center gap-1 min-h-[40px]"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { onOpenAuth(); setIsMenuOpen(false); }}
              className="w-full py-3.5 bg-brand hover:bg-brand-dark text-zinc-900 font-extrabold text-xs capitalize  rounded-lg text-center transition cursor-pointer shadow-xs"
            >
              Sign In to Account
            </button>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          setShowDropdown(false);
          setIsMenuOpen(false);
          logout();
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
        theme="light"
      />
    </>
  );
}
