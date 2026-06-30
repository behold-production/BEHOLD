import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowUpRight, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

function getInitials(name) {
  if (!name) return 'ST';
  const clean = name.trim();
  if (clean.length === 0) return 'ST';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words[0].toUpperCase();
}

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    if (currentView !== '/') {
      setTimeout(() => setActiveSection(''), 0);
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

  // Track scroll position for dynamic styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer & dropdown automatically when route changes
  useEffect(() => {
    setTimeout(() => {
      setIsMenuOpen(false);
      setShowDropdown(false);
    }, 0);
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
    setIsMenuOpen(false);
    // Delay scrolling slightly to allow the no-scroll lock to be removed from the body first
    setTimeout(() => {
      navigateToSection(id);
    }, 50);
  };

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigateToSection('top');
    }, 50);
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

  const isDarkTheme = currentView === '/' && !isScrolled;

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isDarkTheme ? 'bg-transparent border-transparent' : 'bg-white/90 backdrop-blur-md border-b border-surface-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Mobile Left Side: Hamburger + Logo */}
            <div className="flex items-center gap-3 lg:gap-0">
              {/* Mobile Menu Toggle (Moved to left) */}
              <button
                id="mobile-menu-toggle"
                type="button"
                className={`lg:hidden p-2 -ml-2 cursor-pointer transition-colors ${isDarkTheme ? 'text-white' : 'text-surface-900'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <span
                onClick={handleLogoClick}
                className={`logo-text cursor-pointer select-none ${isDarkTheme ? 'text-white' : ''}`}
                id="nav-logo"
              >
                {siteName || 'BEHOLD'}<span className="logo-dot">.</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden lg:flex items-center gap-8 font-heading font-semibold text-sm tracking-wide ${isDarkTheme ? 'text-zinc-300' : 'text-slate-600'}`}>
              <button
                onClick={handleLogoClick}
                className={`relative group transition-colors uppercase cursor-pointer ${isDarkTheme ? 'hover:text-white' : 'hover:text-surface-900'}`}
              >
                HOME
                <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-brand transition-transform origin-left ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>

              {siteSettings.enablePsychology !== false && (
                <button
                  onClick={() => scrollToSection('services')}
                  className={`relative group transition-colors uppercase cursor-pointer ${isDarkTheme ? 'hover:text-white' : 'hover:text-surface-900'}`}
                >
                  SERVICES
                  <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-brand transition-transform origin-left ${activeSection === 'services' && currentView === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </button>
              )}

              {siteSettings.enableAptitude !== false && (
                <button
                  onClick={() => navigate('/sample-test')}
                  className={`relative group transition-colors uppercase cursor-pointer ${isDarkTheme ? 'hover:text-white' : 'hover:text-surface-900'}`}
                >
                  SAMPLE TEST
                  <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-brand transition-transform origin-left ${currentView === '/sample-test' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </button>
              )}

              <button
                onClick={() => scrollToSection('inquiry')}
                className={`relative group transition-colors uppercase cursor-pointer ${isDarkTheme ? 'hover:text-white' : 'hover:text-surface-900'}`}
              >
                CONTACT
                <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-brand transition-transform origin-left ${activeSection === 'inquiry' && currentView === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            </nav>

            {/* Right Column: Actions */}
            <div className="flex items-center gap-3 lg:gap-4 relative">
              {!user ? (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden flex items-center justify-center border-2 transition-colors cursor-pointer ${isDarkTheme ? 'bg-white/10 text-white border-white/20 hover:border-brand' : 'bg-surface-50 text-surface-900 border-surface-200 hover:border-brand'}`}
                  aria-label="Sign In"
                >
                  <User className="w-5 h-5 lg:w-6 lg:h-6" />
                </button>
              ) : (
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden font-bold flex items-center justify-center text-sm border-2 transition-colors cursor-pointer ${isDarkTheme ? 'bg-white/10 text-white border-white/20 hover:border-brand' : 'bg-surface-50 text-surface-900 border-surface-200 hover:border-brand'}`}
                  >
                    {user.profilePic || user.image ? (
                      <img src={user.profilePic || user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-white border-2 border-surface-200 shadow-square-light py-1 z-50">
                      <div className="px-4 py-3 border-b border-surface-200">
                        <p className="text-sm font-heading font-bold text-surface-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase hover:bg-surface-50 hover:text-brand transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" /> Your Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDropdown(false); setIsLogoutConfirmOpen(true); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 uppercase hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {siteSettings.enablePsychology !== false && (
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="hidden lg:block btn-primary text-xs py-2.5 px-6"
                >
                  Book Session
                </button>
              )}
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

      {/* Mobile Side Drawer */}
      <aside
        id="mobile-drawer"
        aria-hidden={!isMenuOpen}
        className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl transition-all duration-300 ease-in-out transform flex flex-col p-6 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-6 border-b border-surface-200 mb-6">
          <span
            onClick={() => { setIsMenuOpen(false); handleLogoClick(); }}
            className="logo-text cursor-pointer"
          >
            {siteName || 'BEHOLD'}<span className="logo-dot">.</span>
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
            className="w-10 h-10 flex items-center justify-center border border-surface-200 hover:border-surface-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-surface-900" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 font-heading">
          <button
            type="button"
            onClick={handleLogoClick}
            className={`w-full text-left px-4 py-4 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '')
              ? 'bg-surface-50 text-brand border-brand'
              : 'text-slate-600 hover:text-surface-900 hover:bg-surface-50 border-transparent'
              }`}
          >
            <span>Home</span>
          </button>

          {siteSettings.enablePsychology !== false && (
            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className={`w-full text-left px-4 py-4 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'services' && currentView === '/'
                ? 'bg-surface-50 text-brand border-brand'
                : 'text-slate-600 hover:text-surface-900 hover:bg-surface-50 border-transparent'
                }`}
            >
              <span>Services</span>
            </button>
          )}

          {siteSettings.enableAptitude !== false && (
            <button
              type="button"
              onClick={() => { navigate('/sample-test'); setIsMenuOpen(false); }}
              className={`w-full text-left px-4 py-4 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/sample-test'
                  ? 'bg-brand/10 text-brand border-brand'
                  : 'border-transparent text-surface-900 hover:bg-surface-50'
                }`}
            >
              <span>Sample Test</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${currentView === '/sample-test' ? 'translate-x-1' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => scrollToSection('inquiry')}
            className={`w-full text-left px-4 py-4 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'inquiry' && currentView === '/'
              ? 'bg-surface-50 text-brand border-brand'
              : 'text-slate-600 hover:text-surface-900 hover:bg-surface-50 border-transparent'
              }`}
          >
            <span>Contact</span>
          </button>

          {siteSettings.enablePsychology !== false && (
            <button
              type="button"
              onClick={() => { navigate('/booking'); setIsMenuOpen(false); }}
              className={`w-full text-left px-4 py-4 text-sm font-bold uppercase transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/booking'
                ? 'bg-surface-50 text-brand border-brand'
                : 'text-slate-600 hover:text-surface-900 hover:bg-surface-50 border-transparent'
                }`}
            >
              <span>Book Session</span>
            </button>
          )}
        </div>

        {/* Drawer Footer: User Profile Widget */}
        <div className="pt-6 border-t border-surface-200 mt-auto">
          {user ? (
            <div className="bg-surface-50 p-4 border border-surface-200 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-surface-200 text-surface-900 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden bg-white">
                  {user.profilePic || user.image ? (
                    <img src={user.profilePic || user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-heading font-bold text-surface-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="py-2.5 text-xs font-bold text-surface-900 bg-white border-2 border-surface-200 hover:border-brand transition-colors text-center cursor-pointer uppercase min-h-[40px]"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogoutConfirmOpen(true); setIsMenuOpen(false); }}
                  className="py-2.5 text-xs font-bold text-surface-900 bg-white border-2 border-surface-200 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-colors text-center cursor-pointer uppercase flex items-center justify-center gap-1 min-h-[40px]"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { onOpenAuth(); setIsMenuOpen(false); }}
              className="btn-primary w-full"
            >
              Sign In
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
