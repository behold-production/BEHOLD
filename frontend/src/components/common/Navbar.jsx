import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import BrandIcon from './BrandIcon';
import { Menu, X, User } from 'lucide-react';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, onOpenBooking, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['home', 'services', 'experts', 'cdat', 'faqs', 'blog', 'inquiry'];
    const handleScrollSection = () => {
      const scrollPos = window.scrollY + 140;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            if (id === 'inquiry') setActiveSection('contact');
            else if (id === 'experts') setActiveSection('services');
            else setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSection, { passive: true });
    handleScrollSection();
    return () => window.removeEventListener('scroll', handleScrollSection);
  }, [location.pathname]);

  const goTo = (section) => {
    setMobileMenuOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.(section);
    }
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateToSection?.('top');
    }
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
    { label: 'Home', action: () => goTo('home'), sectionId: 'home', path: '/' },
    { label: 'Services', action: () => goTo('services'), sectionId: 'services', path: '/booking' },
    { label: 'About Us', action: () => goTo('/about'), sectionId: 'about', path: '/about' },
    { label: 'Blog', action: () => goTo('/blog'), sectionId: 'blog', path: '/blog' },
  ].filter(Boolean);

  const navRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const activeIndex = navLinks.findIndex(({ sectionId, path }) =>
    location.pathname === path || (location.pathname === '/' && activeSection === sectionId)
  );

  useEffect(() => {
    const targetEl = navRefs.current[activeIndex >= 0 ? activeIndex : 0];
    if (targetEl && activeIndex >= 0) {
      setIndicatorStyle({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1,
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, location.pathname, activeSection]);

  return (
    <>
      {/* Top Text-Only Announcement Bar - Only shows when Admin enables & assigns details */}
      {siteSettings?.showBanner && siteSettings?.bannerNotice && (
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 font-medium flex items-center justify-center gap-3 relative z-50">
          <span className="inline-block text-cyan-400 bg-slate-800 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-slate-700">
            {siteSettings.bannerNotice}
          </span>
          {siteSettings?.contactPhone && (
            <>
              <span className="hidden sm:inline text-slate-300">&middot;</span>
              <a
                href={`tel:${siteSettings.contactPhone}`}
                className="text-white hover:underline font-bold transition-colors"
              >
                Helpline: {siteSettings.contactPhone}
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
              ? 'bg-transparent border-none shadow-none text-slate-900'
              : 'bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm text-slate-900'
              }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">

              {/* Brand Title Logo */}
              <button
                onClick={handleLogoClick}
                className="flex items-center gap-2 text-left bg-transparent border-none cursor-pointer p-0"
              >
                <span className="text-2xl sm:text-3xl font-bold tracking-tight font-sans text-slate-900">
                  {(siteName || 'BEHOLD').replace(/\.$/, '')}
                  <span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,201,214,0.8)] font-bold">.</span>
                </span>
              </button>

              {/* Desktop Nav Links - Smooth Sliding Underline Indicator */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 relative py-1">
                {/* Smooth Sliding Active Underline Indicator Bar */}
                <span
                  className="absolute bottom-0 h-[2.5px] bg-[#00c9d6] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-[0_0_8px_rgba(0,201,214,0.6)]"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                    opacity: indicatorStyle.opacity,
                  }}
                />

                {navLinks.map(({ label, action }, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={label}
                      ref={(el) => (navRefs.current[idx] = el)}
                      onClick={action}
                      className={`text-xs font-bold tracking-wider transition-colors duration-200 bg-transparent cursor-pointer py-1 border-none ${isActive
                        ? 'text-[#00c9d6]'
                        : 'text-slate-700 hover:text-[#00c9d6]'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => { onOpenBooking(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-5 py-2.5 font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-sm cursor-pointer border bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 border-transparent hover-scale-btn"
                >
                  Book Session
                </button>

                {user ? (
                  <button
                    onClick={handleProfileClick}
                    title={`Logged in as ${user.name || user.email}`}
                    aria-label="User Profile"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all cursor-pointer border shrink-0 bg-slate-100/90 hover:bg-slate-200/90 text-slate-900 border-slate-200/80 shadow-xs hover-scale-btn"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#00c9d6]/10 flex items-center justify-center border border-[#00c9d6]/30">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-[#00c9d6] uppercase">{(user.name || user.email || 'U').charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col text-left leading-tight pr-1 hidden sm:flex">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user.name || 'Account'}</span>
                      {user.email && <span className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">{user.email}</span>}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth?.()}
                    className="px-5 py-2.5 font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 hover-scale-btn"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile/Tablet Hamburger Trigger */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-full transition-colors cursor-pointer border-none bg-transparent text-slate-900 hover:bg-slate-100"
                  aria-label="Open Menu"
                >
                  <Menu className="w-6 h-6 text-slate-900" />
                </button>
              </div>

            </div>

            {/* Mobile Navigation Sidebar Drawer overlay */}
            {mobileMenuOpen && createPortal(
              <div className="fixed inset-0 z-[9999]">
                <div
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <div className="fixed inset-y-0 right-0 z-[10000] w-80 max-w-[85vw] bg-white text-slate-900 shadow-2xl flex flex-col justify-between p-6 sm:p-8 border-l border-slate-200 animate-in slide-in-from-right duration-300 overflow-y-auto">

                  <div>
                    <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-4">
                      <span className="text-xl font-black tracking-tight font-sans uppercase text-slate-900">
                        {(siteName || 'BEHOLD').replace(/\.$/, '')}
                        <span className="text-[#00c9d6] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">.</span>
                      </span>
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center cursor-pointer border border-slate-200 transition-all p-0"
                      >
                        <X className="w-5 h-5 text-slate-900" />
                      </button>
                    </div>

                    {user && (
                      <div
                        onClick={() => { setMobileMenuOpen(false); handleProfileClick(); }}
                        className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:border-[#00c9d6] transition-all group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-[#00e5ff] flex items-center justify-center font-bold overflow-hidden shrink-0 border border-[#00e5ff]/40">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-black text-[#00e5ff] uppercase">{(user.name || user.email || 'U').charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#00c9d6] transition-colors">{user.name || 'Account'}</p>
                            {user.email && <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {navLinks.map(({ label, action }) => (
                        <button
                          key={label}
                          onClick={() => { action(); setMobileMenuOpen(false); }}
                          className="text-left py-2.5 text-sm font-bold uppercase tracking-widest text-slate-800 hover:text-[#00c9d6] transition-colors bg-transparent border-b border-slate-100 cursor-pointer"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex flex-col gap-3">
                    {user && (
                      <button
                        onClick={handleProfileClick}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/40 cursor-pointer shadow-xs text-center flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4 text-[#00e5ff]" />
                        <span>My Profile / Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
                      className={`w-full py-3 font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer text-center ${user
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                        : 'bg-[#00c9d6] hover:bg-[#00b2be] text-slate-900 border border-transparent shadow-xs'
                        }`}
                    >
                      Book Session
                    </button>
                    {user ? (
                      <button
                        onClick={() => { setMobileMenuOpen(false); setIsLogoutOpen(true); }}
                        className="w-full py-2.5 border border-rose-200 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-full transition bg-white hover:bg-rose-50 text-center cursor-pointer"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
                        className="w-full py-2.5 border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-full transition bg-slate-100 hover:bg-slate-200 text-center cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                  </div>

                </div>
              </div>,
              document.body
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
