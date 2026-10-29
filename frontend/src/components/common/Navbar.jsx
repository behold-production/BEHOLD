import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom'; //
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import BrandIcon from './BrandIcon';
import { Menu, X, User, Phone } from 'lucide-react';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, onOpenBooking, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, logout } = useAuth(); //
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

  const [activeSection, setActiveSection] = useState('home'); //

  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['home', 'why-choose-us', 'services', 'experts', 'about', 'faqs', 'blog', 'inquiry'];
    const handleScrollSection = () => {
      const scrollPos = window.scrollY + 160;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSection, { passive: true });
    handleScrollSection();
    return () => window.removeEventListener('scroll', handleScrollSection); //
  }, [location.pathname]);

  const goTo = (section) => {
    setMobileMenuOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Scroll on the current page when the section exists here, otherwise fall back
    // to the app-level navigation helper (which knows about cross-page routes).
    const el = typeof document !== 'undefined' ? document.getElementById(section) : null;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }
    navigateToSection?.(section);
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
    const input = siteSettings?.whatsapp; //
    if (!input || input === '#') return 'https://wa.link/4jpzfq';
    const str = String(input).trim();
    if (str.startsWith('http')) return str;
    const digits = str.replace(/\D/g, '');
    if (digits.length === 10) return `https://wa.me/91${digits}`;
    if (digits.length > 10) return `https://wa.me/${digits}`;
    return 'https://wa.link/4jpzfq';
  })();

  const isHome = location.pathname === '/';
  
  const navLinks = [
    {
      label: 'Home',
      action: () => goTo('home'),
      isActive: isHome && (!activeSection || activeSection === 'home'),
    },
    {
      label: 'Services',
      action: () => goTo('services'),
      isActive: isHome
        ? ['services', 'why-choose-us'].includes(activeSection)
        : location.pathname === '/booking',
    },
    {
      label: 'Psychologists',
      action: () => goTo('/psychologists'),
      isActive: location.pathname.startsWith('/psychologists') || location.pathname.startsWith('/advisor'),
    },
    {
      label: 'About Us',
      action: () => goTo('/about'),
      isActive: location.pathname === '/about',
    },
    {
      label: 'Contact',
      action: () => goTo('/contact'),
      isActive: location.pathname === '/contact',
    },
  ];
 
  const navRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const activeIndex = navLinks.findIndex((link) => link.isActive);

  useEffect(() => { //
    if (activeIndex < 0) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return undefined;
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const targetEl = navRefs.current[activeIndex];
        if (!targetEl) return;
        setIndicatorStyle({
          left: targetEl.offsetLeft,
          width: targetEl.offsetWidth,
          opacity: 1,
        });
      });
    };

    measure();
    window.addEventListener('resize', measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [activeIndex, location.pathname, activeSection]);

  return (
    <>
      {/* Top Text-Only Announcement Bar - Only shows when Admin enables & assigns details */}
      {siteSettings?.showBanner && siteSettings?.bannerNotice && (
        <div className="bg-[#0e1111] text-[#d5cdbb] text-xs py-2 px-4 border-b border-[#050707] font-medium flex items-center justify-center gap-3 relative z-50">
          <span className="inline-block text-[#a5deea] bg-[#123039] px-2.5 py-0.5 rounded-md text-[11px] font-semibold border border-[#3c4747]">
            {siteSettings.bannerNotice}
          </span>
          {siteSettings?.contactPhone && (
            <>
              <span className="hidden sm:inline text-[#bdb6a6]">&middot;</span>
              <a
                href={`tel:${siteSettings.contactPhone}`}
                className="text-white hover:underline font-semibold transition-colors"
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${location.pathname === '/' ? 'bh-home-nav' : ''} ${isHomeTop
              ? 'bg-transparent border-none shadow-none text-[#0e1111]'
              : 'bg-white/90 backdrop-blur-md border-b border-[#e6dfd0]/60 shadow-sm text-[#0e1111]'
              }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

              {/* Mobile/Tablet Left Controls: Hamburger Menu Trigger + Brand Title Logo */}
              <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-md transition-colors cursor-pointer border-none bg-[#f1eadc]/80 hover:bg-[#e6dfd0]/80 text-[#0e1111] flex items-center justify-center"
                  aria-label="Open Navigation Drawer"
                >
                  <Menu className="w-5.5 h-5.5 text-[#0e1111]" />
                </button>

                <button
                  onClick={handleLogoClick}
                  className="flex items-center gap-1.5 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <span className="text-xl sm:text-2xl font-black text-[#0e1111] uppercase tracking-tight">
                    {(siteName || 'BEHOLD').replace(/\.$/, '')}
                    <span className="text-[#0e7490] font-black">.</span>
                  </span>
                </button>
              </div>

              {/* Desktop Brand Title Logo (visible on lg+) */}
              <button
                onClick={handleLogoClick}
                className="hidden lg:flex items-center gap-2 text-left bg-transparent border-none cursor-pointer p-0"
              >
                <span className="text-2xl sm:text-3xl font-black text-[#0e1111] uppercase tracking-tight">
                  {(siteName || 'BEHOLD').replace(/\.$/, '')}
                  <span className="text-[#0e7490] font-black">.</span>
                </span>
              </button>

              {/* Desktop Nav Links - Smooth Sliding Underline Indicator */}
              <nav className="hidden lg:flex items-center gap-7 xl:gap-9 relative py-1">
                {/* Smooth Sliding Active Underline Indicator Bar */}
                <span
                  className="absolute bottom-0 h-[2.5px] bg-[#0e7490] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
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
                      className={`text-sm font-medium tracking-wide transition-colors duration-200 bg-transparent cursor-pointer py-1 px-1 rounded-md border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] ${isActive
                        ? 'text-[#0e7490] font-semibold'
                        : 'text-[#3c4747] hover:text-[#0e7490]'
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                {siteSettings?.contactPhone && (
                  <a
                    href={`tel:${String(siteSettings.contactPhone).replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-md border border-[#DED8C9] bg-white/80 px-4 py-2 text-xs font-semibold text-[#0E1111] no-underline transition-colors hover:border-[#0E7490]/50 hover:text-[#0B5C73]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#0E7490]" />
                    {siteSettings.contactPhone}
                  </a>
                )}
              
                <button
                  onClick={() => { onOpenBooking(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-6 py-2.5 font-semibold text-xs sm:text-sm rounded-md transition-all duration-300 shadow-sm cursor-pointer border-none bg-[#0E7490] hover:bg-[#0B5C73] text-white hover-scale-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] focus-visible:ring-offset-2"
                >
                  Book Session
                </button>

                {user ? (
                  <button
                    onClick={handleProfileClick}
                    title={`Logged in as ${user.name || user.email}`}
                    aria-label="User Profile"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all cursor-pointer border shrink-0 bg-white/90 hover:bg-white text-[#0e1111] border-[#e6dfd0]/80 shadow-xs hover-scale-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2"
                  >
                    <div className="w-7 h-7 rounded-sm overflow-hidden shrink-0 bg-[#0e7490]/10 flex items-center justify-center border border-[#0e7490]/20">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-semibold text-[#0e7490] uppercase">{String(user.name || user.email || 'U').charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col text-left leading-tight pr-1 hidden sm:flex">
                      <span className="text-xs font-semibold text-[#0e1111] truncate max-w-[120px]">{user.name || 'Account'}</span>
                      {user.email && <span className="text-[10px] text-[#55605f] font-medium truncate max-w-[130px]">{user.email}</span>}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth?.()}
                    className="px-5 py-2 font-medium text-xs sm:text-sm rounded-md transition-all cursor-pointer border bg-white/80 hover:bg-white text-[#0e1111] border-[#e6dfd0]/80 hover-scale-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Right Controls: User Profile Avatar / Sign In */}
              <div className="flex items-center gap-2 lg:hidden">
                {user ? (
                  <button
                    onClick={handleProfileClick}
                    title={`Logged in as ${user.name || user.email}`}
                    aria-label="User Profile"
                    className="flex items-center gap-1.5 p-0.5 rounded-md transition-all cursor-pointer border bg-white/90 hover:bg-white text-[#0e1111] border-[#e6dfd0]/80 shadow-xs active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0 bg-[#0e7490] flex items-center justify-center text-white font-bold text-sm shadow-xs border-2 border-white">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{String(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth?.()}
                    className="px-4 py-1.5 font-bold text-xs rounded-md transition-all cursor-pointer border-none bg-[#0e7490] hover:bg-[#0b5c73] text-white shadow-xs"
                  >
                    Sign In
                  </button>
                )}
              </div>

            </div>
          </header>
        );
      })()}

      {/* Mobile Slide-out Menu via Portal */}
      {typeof document !== 'undefined' && mobileMenuOpen && createPortal(
        <div
          className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-[#0e1111]/40 backdrop-blur-sm transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Left-Side Drawer Panel */}
          <div
            className={`absolute top-0 left-0 bottom-0 w-full max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between border-r border-[#e6dfd0] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#e6dfd0]">
                <span className="text-2xl font-serif font-bold text-[#0e1111] tracking-tight">
                  {(siteName || 'BEHOLD').replace(/\.$/, '')}
                  <span className="text-[#0e7490] font-bold">.</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#55605f] hover:text-[#0e1111] transition rounded-sm hover:bg-[#e6dfd0]/50 border-none bg-transparent cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-6">
                {navLinks.map(({ label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="text-left py-2.5 px-3 rounded-md text-sm font-medium text-[#0e1111] hover:text-[#0e7490] hover:bg-[#e6dfd0]/40 transition border-none bg-transparent cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#e6dfd0] flex flex-col gap-3">
              {user && (
                <button
                  onClick={handleProfileClick}
                  className="w-full py-3 bg-[#0e1111] hover:bg-[#0e7490] text-white font-medium text-sm rounded-md transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-2 border-none"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>My Profile / Dashboard</span>
                </button>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
                className={`w-full py-3 font-medium text-sm rounded-md transition-all cursor-pointer text-center border-none shadow-sm ${user
                  ? 'bg-white hover:bg-[#e6dfd0]/40 text-[#0e1111] border border-[#e6dfd0]'
                  : 'bg-[#0e7490] hover:bg-[#0b5c73] text-white'
                  }`}
              >
                Book Session
              </button>
              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); setIsLogoutOpen(true); }}
                  className="w-full py-2.5 border border-rose-200 text-rose-600 font-medium text-sm rounded-md transition bg-white hover:bg-rose-50 text-center cursor-pointer"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
                  className="w-full py-2.5 border border-[#e6dfd0] text-[#0e1111] font-semibold text-sm rounded-md transition bg-[#f1eadc] hover:bg-[#e6dfd0] text-center cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => { logout(); setIsLogoutOpen(false); }}
      />
    </>
  );
}
