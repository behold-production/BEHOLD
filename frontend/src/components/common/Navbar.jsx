import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ navigateToSection, onOpenAuth, onOpenBooking, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (location.pathname !== '/') return;
    const sectionIds = ['home', 'services', 'experts', 'inquiry'];
    const handleScrollSection = () => {
      const scrollPos = window.scrollY + 140;
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
    return () => window.removeEventListener('scroll', handleScrollSection);
  }, [location.pathname]);

  const goTo = (section) => {
    setMobileMenuOpen(false);
    if (section.startsWith('/')) {
      navigate(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
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

  const navLinks = [
    { label: 'Home', action: () => goTo('home'), sectionId: 'home', path: '/' },
    { label: 'Experts', action: () => goTo('experts'), sectionId: 'experts', path: '/' },
    { label: 'Services', action: () => goTo('services'), sectionId: 'services', path: '/booking' },
    { label: 'About Us', action: () => goTo('/about'), sectionId: 'about', path: '/about' },
    { label: 'Blog', action: () => goTo('/blog'), sectionId: 'blog', path: '/blog' },
  ];

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
      {siteSettings?.showBanner && siteSettings?.bannerNotice && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-center gap-3 relative z-50 shadow-sm">
          <span className="inline-block text-slate-900 bg-[#00e5ff] px-2.5 py-0.5 rounded-md text-[11px] font-bold">
            {siteSettings.bannerNotice}
          </span>
          {siteSettings?.contactPhone && (
            <>
              <span className="hidden sm:inline text-slate-500">&middot;</span>
              <a href={`tel:${siteSettings.contactPhone}`} className="text-white hover:text-[#00e5ff] font-semibold transition-colors">
                Helpline: {siteSettings.contactPhone}
              </a>
            </>
          )}
        </div>
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || siteSettings?.showBanner ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors border-none cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={handleLogoClick} className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0">
              <span className="text-2xl font-black font-sans text-slate-900 tracking-tight">
                {(siteName || 'BEHOLD').replace(/\.$/, '')}
                <span className="text-[#00e5ff] font-black">.</span>
              </span>
            </button>
          </div>

          <button onClick={handleLogoClick} className="hidden lg:flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0">
            <span className="text-3xl font-black font-sans text-slate-900 tracking-tight">
              {(siteName || 'BEHOLD').replace(/\.$/, '')}
              <span className="text-[#00e5ff] font-black">.</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-8 relative py-1">
            <span
              className="absolute bottom-0 h-1 bg-[#00e5ff] rounded-t-lg transition-all duration-300 ease-out pointer-events-none"
              style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }}
            />
            {navLinks.map(({ label, action }, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={label}
                  ref={(el) => (navRefs.current[idx] = el)}
                  onClick={action}
                  className={`text-[15px] font-semibold transition-colors duration-200 bg-transparent cursor-pointer py-1.5 px-2 rounded-md border-none ${isActive ? 'text-[#00e5ff]' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => { onOpenBooking(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-6 py-2.5 rounded-xl border-none cursor-pointer bg-[#00e5ff] hover:bg-[#00b2be] text-white font-bold transition-all shadow-[0_4px_14px_0_rgba(0,229,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,229,255,0.23)] hover:-translate-y-0.5"
            >
              Book Session
            </button>

            {user ? (
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2.5 px-2 py-1.5 pr-4 rounded-full bg-white border border-slate-200 shadow-sm hover:border-[#00e5ff] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-slate-600">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900 hidden xl:block line-clamp-1 max-w-[120px]">
                  {user.name?.split(' ')[0] || 'Profile'}
                </span>
              </button>
            ) : (
              <button onClick={() => onOpenAuth?.()} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors border-none cursor-pointer">
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <span className="text-xl font-black font-sans text-slate-900 tracking-tight">
                {(siteName || 'BEHOLD').replace(/\.$/, '')}<span className="text-[#00e5ff] font-black">.</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-slate-100 text-slate-600 border-none cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {navLinks.map(({ label, action }, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={label}
                    onClick={action}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors border-none cursor-pointer ${isActive ? 'bg-[#00e5ff]/10 text-[#00e5ff]' : 'bg-transparent text-slate-700 hover:bg-slate-50'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 border-t border-slate-100 space-y-3">
              <button onClick={() => { setMobileMenuOpen(false); onOpenBooking(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full px-5 py-3 rounded-xl bg-[#00e5ff] text-white font-bold border-none shadow-md">
                Book Session
              </button>
              <button onClick={handleProfileClick} className="w-full px-5 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold border-none hover:bg-slate-200">
                {user ? 'My Profile' : 'Log In / Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
