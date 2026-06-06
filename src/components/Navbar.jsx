import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const { user, logout } = useAuth();

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
      if (user.role === 'ADMIN') {
        window.spaNavigate('/admin');
      } else if (user.role === 'PSYCHOLOGIST') {
        window.spaNavigate('/counsellor');
      } else {
        window.spaNavigate('/profile');
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-zinc-200/50 text-zinc-900 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Left Column: Logo & Nav Links */}
          <div className="flex items-center space-x-3.5 lg:space-x-12">
            {/* Hamburger Menu Toggle on Left of Logo for Mobile */}
            <button
              id="mobile-menu-toggle"
              className="lg:hidden text-zinc-900 hover:text-zinc-650 transition p-1 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span
              onClick={handleLogoClick}
              className="font-header font-black text-xl tracking-tighter cursor-pointer text-zinc-900 hover:text-brand transition duration-300"
              id="nav-logo"
            >
              {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
            </span>

            <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-wider text-zinc-500">
              <button
                onClick={handleLogoClick}
                className={`transition-all duration-300 cursor-pointer pb-1 relative uppercase ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') ? 'text-zinc-955 font-bold' : 'hover:text-zinc-950'
                  }`}
              >
                Home
                {currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('services')}
                className={`transition-all duration-300 cursor-pointer pb-1 relative uppercase ${activeSection === 'services' && currentView === '/' ? 'text-zinc-950 font-bold' : 'hover:text-zinc-950'
                  }`}
              >
                Services
                {activeSection === 'services' && currentView === '/' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>

              <button
                onClick={() => window.spaNavigate('/sample-test')}
                className={`transition-all duration-300 cursor-pointer pb-1 relative uppercase ${currentView === '/sample-test' ? 'text-zinc-950 font-bold' : 'hover:text-zinc-950'
                  }`}
              >
                Sample Test
                {currentView === '/sample-test' && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
                )}
              </button>

              <button
                onClick={() => scrollToSection('inquiry')}
                className={`transition-all duration-300 cursor-pointer pb-1 relative uppercase ${activeSection === 'inquiry' && currentView === '/' ? 'text-zinc-950 font-bold' : 'hover:text-zinc-950'
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
          <div className="hidden lg:flex items-center space-x-4 relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full overflow-hidden bg-brand/10 text-brand-dark font-black flex items-center justify-center uppercase tracking-widest text-sm shadow-xs border border-brand/20 hover:scale-105 transition-transform cursor-pointer"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-zinc-200/50 shadow-xl rounded-lg overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-zinc-150">
                      <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" /> Your Profile
                    </button>
                    <button
                      onClick={() => { setShowDropdown(false); setIsLogoutConfirmOpen(true); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-450" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-bold text-zinc-900 hover:text-brand transition-colors cursor-pointer uppercase tracking-wider"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => window.spaNavigate('/booking')}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg border border-zinc-200/50 transition-all duration-300 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider ${currentView === '/booking'
                ? 'bg-zinc-950 text-white'
                : 'bg-brand hover:bg-brand-dark text-zinc-955 shadow-xs'
                }`}
            >
              <span>Book Session</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Actions (Avatar only) */}
          <div className="flex items-center lg:hidden relative">
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-8 h-8 rounded-full overflow-hidden bg-brand/10 text-brand-dark font-black flex items-center justify-center uppercase tracking-widest text-[11px] shadow-xs border border-brand/20 cursor-pointer"
                  >
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </button>
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-zinc-200/50 shadow-xl rounded-lg overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-zinc-150">
                        <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" /> Your Profile
                      </button>
                      <button
                        onClick={() => { setShowDropdown(false); setIsLogoutConfirmOpen(true); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-450" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-8 h-8 rounded-full bg-brand text-zinc-950 flex items-center justify-center shadow-xs border border-brand/20 hover:scale-105 transition-transform cursor-pointer"
                  title="Sign In"
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
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Side Drawer - Glassmorphism UI */}
      <div className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-white/95 backdrop-blur-md z-50 lg:hidden shadow-2xl transition-all duration-300 ease-in-out transform flex flex-col p-5 border-r border-zinc-200/50 ${isMenuOpen ? 'translate-x-0 opacity-100 visible' : '-translate-x-full opacity-0 invisible pointer-events-none'
        }`}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-150 mb-5">
          <span
            onClick={() => { setIsMenuOpen(false); handleLogoClick(); }}
            className="font-header font-black text-lg tracking-tighter cursor-pointer text-zinc-900 hover:text-brand transition duration-300"
          >
            {siteName || 'BEHOLD'}<span className="text-brand font-black">.</span>
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-900" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          <button
            onClick={handleLogoClick}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '')
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => scrollToSection('services')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'services' && currentView === '/'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Services</span>
          </button>

          <button
            onClick={() => { window.spaNavigate('/sample-test'); setIsMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/sample-test'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Sample Test</span>
          </button>

          <button
            onClick={() => scrollToSection('inquiry')}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${activeSection === 'inquiry' && currentView === '/'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Contact</span>
          </button>

          <button
            onClick={() => { window.spaNavigate('/booking'); setIsMenuOpen(false); }}
            className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between cursor-pointer border-l-4 ${currentView === '/booking'
              ? 'bg-brand/10 text-zinc-900 border-brand font-black'
              : 'text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
              }`}
          >
            <span>Book Session</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Footer: User Profile Widget */}
        <div className="pt-4 border-t border-zinc-150 mt-auto">
          {user ? (
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/60 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand/10 text-brand-dark font-black flex items-center justify-center text-xs shrink-0 shadow-inner border border-brand/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5 leading-none">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleProfileClick}
                  className="py-2 text-[10px] font-bold text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-900 rounded-md transition-colors text-center cursor-pointer uppercase tracking-wider"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setIsLogoutConfirmOpen(true); setIsMenuOpen(false); }}
                  className="py-2 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setIsMenuOpen(false); }}
              className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-extrabold text-xs uppercase tracking-widest rounded-lg text-center transition cursor-pointer shadow-xs"
            >
              Sign In to Account
            </button>
          )}
        </div>
      </div>

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
