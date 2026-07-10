import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar({ navigateToSection, currentView, onOpenAuth, siteName, siteSettings }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const location = useLocation();

  const renderSocialIcon = (name, logo) => {
    const logoVal = (logo || '').trim();
    const isImageUrl = logoVal && /\.(png|jpe?g|svg|webp|gif|ico)(\?.*)?$/i.test(logoVal);
    if (isImageUrl) {
      return (
        <img
          src={logoVal}
          alt={name}
          className="w-3.5 h-3.5 object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      );
    }

    const norm = (logoVal || name || '').toLowerCase().trim();
    if (norm.includes('facebook')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
        </svg>
      );
    }
    if (norm.includes('instagram')) {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    }
    if (norm.includes('linkedin')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      );
    }
    if (norm.includes('youtube')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    }
    if (norm.includes('twitter') || norm.includes('x.com')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    }
    if (norm.includes('whatsapp') || norm.includes('phone') || norm.includes('call')) {
      return (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 2C6.446 2 1.922 6.524 1.922 12.11c0 1.912.528 3.76 1.531 5.387L2 22l4.67-1.229a10.03 10.03 0 0 0 5.361 1.54h.005c5.581 0 10.105-4.524 10.105-10.11C22.141 6.524 17.618 2 12.03 2zm0 18.52c-1.705 0-3.378-.458-4.85-1.326l-.348-.207-3.6 1.05 1.05-3.51-.227-.36a8.21 8.21 0 0 1-1.26-4.382c0-4.547 3.7-8.245 8.245-8.245 2.202 0 4.272.86 5.829 2.418a8.17 8.17 0 0 1 2.418 5.835c-.006 4.55-3.702 8.248-8.257 8.248zm4.526-6.183c-.248-.124-1.467-.724-1.694-.807-.227-.083-.393-.124-.558.124-.166.248-.641.807-.786.973-.145.166-.29.186-.538.062a7.07 7.07 0 0 1-1.996-1.23 7.8 7.8 0 0 1-1.382-1.722c-.145-.248-.015-.382.11-.506.11-.11.248-.29.372-.435.124-.145.166-.248.248-.414.083-.166.04-.31-.02-.435-.062-.124-.558-1.345-.765-1.841-.2-.483-.403-.414-.558-.422-.145-.008-.31-.008-.476-.008a.92.92 0 0 0-.662.31c-.227.248-.869.849-.869 2.07 0 1.221.89 2.401.993 2.546.103.145 1.751 2.673 4.243 3.748.593.256 1.056.409 1.417.524.597.19 1.14.163 1.569.099.479-.072 1.467-.6 1.674-1.18.207-.58.207-1.077.145-1.18-.062-.104-.227-.166-.476-.29z"/>
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 fill-none stroke-currentColor strokeWidth-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    );
  };

  const defaultSocials = [
    { name: 'Facebook', url: '#' },
    { name: 'Instagram', url: '#' },
    { name: 'LinkedIn', url: '#' },
    { name: 'YouTube', url: '#' }
  ];

  const socials = (Array.isArray(siteSettings?.socialLinks) && siteSettings.socialLinks.length > 0
    ? siteSettings.socialLinks
    : defaultSocials).filter(link => {
      const url = (link.url || '').trim();
      return url !== '' && url !== '#' && url !== 'https://' && url !== 'http://';
    });

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

  const useTransparentHeader = (currentView === '/' || location.pathname === '/') && !isScrolled;
  const navClass = isScrolled
    ? "fixed w-full z-40 transition-all duration-300 lg:py-3 top-0"
    : "fixed w-full z-40 transition-all duration-300 lg:py-3 top-0 md:top-[33px]";

 return (
 <>
 {/* Top bar info */}
 <div className="bg-[#0F172A] text-white/80 text-xs py-2 px-6 border-b border-white/5 relative z-50 hidden md:block">
 <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4">
 <div className="flex items-center gap-6">
    {siteSettings?.contactPhone && siteSettings.contactPhone.trim() !== '' && (
      <a href={`tel:${siteSettings.contactPhone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
        </svg>
        {siteSettings.contactPhone}
      </a>
    )}
    {siteSettings?.contactPhone && siteSettings?.openHours && (
      <span className="text-white/20">|</span>
    )}
    {siteSettings?.openHours && siteSettings.openHours.trim() !== '' && (
      <span className="flex items-center gap-1.5 text-gray-400">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {siteSettings.openHours}
      </span>
    )}
 </div>
  <div className="flex items-center gap-4">
    {socials.map((link, idx) => (
      <a
        key={idx}
        href={link.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-brand transition-colors flex items-center gap-1.5 text-[11px] text-gray-400 font-bold"
      >
        {renderSocialIcon(link.name, link.logo)}
        <span className="hidden sm:inline">{link.name}</span>
      </a>
    ))}
  </div>
 </div>
 </div>

 {/* Navigation Header */}
 <nav id="navbar" className={navClass}>
   <div className="max-w-[1440px] mx-auto px-0 lg:px-12">
     <div className={useTransparentHeader 
       ? "w-full lg:mx-0 lg:my-0 px-5 sm:px-8 py-3 lg:py-2 flex items-center justify-between min-w-0 transition-all duration-300 bg-transparent border-none shadow-none" 
       : "w-full lg:rounded-full lg:mx-0 lg:my-0 px-5 sm:px-8 py-3 lg:py-2 flex items-center justify-between min-w-0 transition-all duration-300 glass border-b border-gray-100/60 lg:border lg:shadow-sm"
     }>
      {/* Left Section: Hamburger + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center">
          <button
            className={useTransparentHeader ? "p-1.5 -ml-2 rounded-full transition-colors bg-transparent border-none cursor-pointer text-white hover:bg-white/10" : "p-1.5 -ml-2 rounded-full transition-colors bg-transparent border-none cursor-pointer text-zinc-950 hover:bg-gray-100/50"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
          </button>
        </div>

        {/* Logo */}
        <button
          onClick={logoClick}
          className={useTransparentHeader ? "flex-shrink-0 inline-flex items-baseline font-black text-2xl sm:text-3xl tracking-wider uppercase bg-transparent border-none p-0 cursor-pointer text-white font-header drop-shadow-sm" : "flex-shrink-0 inline-flex items-baseline font-black text-2xl sm:text-3xl tracking-wider uppercase bg-transparent border-none p-0 cursor-pointer text-[#0f172a] font-header"}
          style={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}
        >
          <span style={{ fontWeight: 900 }}>{siteName || 'BEHOLD'}</span>
          <span className="text-[#00E5FF] font-black ml-0.5" style={{ fontWeight: 900, color: '#00E5FF' }}>.</span>
        </button>
      </div>

      {/* Desktop Menu */}
      <div className={useTransparentHeader ? "hidden lg:flex items-center space-x-8 text-sm font-semibold text-white/90 transition-colors duration-300" : "hidden lg:flex items-center space-x-8 text-sm font-semibold text-zinc-800 transition-colors duration-300"}>
        <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('home') || navigate('/'); }} className="transition-colors hover:text-[#00E5FF]">Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('services') || navigate('/'); }} className="transition-colors flex items-center gap-1.5 hover:text-[#00E5FF]">Services <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg></a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/sample-test'); }} className="transition-colors hover:text-[#00E5FF]">Sample Test</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} className="transition-colors hover:text-[#00E5FF]">Blog</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigateToSection?.('contact') || navigate('/'); }} className="transition-colors hover:text-[#00E5FF]">Contact</a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">

        {/* Desktop CTA Button */}
        <button 
          onClick={() => navigate('/booking')}
          className={useTransparentHeader ? "hidden" : "hidden lg:flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer border-none hover:scale-105 active:scale-95 shadow-md bg-[#0F172A] text-white hover:bg-[#00E5FF] hover:text-[#0f172a] shadow-[#0F172A]/10"}
        >
          Book Appointment
        </button>

        {/* Profile Avatar (Mobile + Desktop) */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={handleProfileClick}
            className={useTransparentHeader ? "w-11 h-11 lg:w-12 lg:h-12 rounded-full border-2 border-[#00E5FF]/60 hover:border-[#00E5FF] flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 bg-[#0a121e]/80 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)] overflow-hidden" : "w-11 h-11 lg:w-12 lg:h-12 rounded-full border-2 border-[#00E5FF] flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 bg-[#0a121e] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)] overflow-hidden"}
          >
            {user ? (
              (user.profilePic || user.image || user.photoURL || user.avatar) ? (
                <img
                  src={user.profilePic || user.image || user.photoURL || user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="font-black text-sm tracking-widest text-[#00E5FF]">
                  {user.name ? user.name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('') : 'U'}
                </span>
              )
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#00E5FF]">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </button>
          <div className="absolute top-[110%] right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg translate-y-2 group-hover:translate-y-0 before:content-[''] before:absolute before:-top-1 before:right-4 before:border-4 before:border-transparent before:border-b-gray-800">
            {user ? 'My Profile' : 'Sign In'}
          </div>
        </div>

      </div></div>
 </div>
 </nav>

 {/* Mobile Menu Overlay */}
 {mobileMenuOpen && (
 <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
 )}

 {/* Mobile Drawer — Dark Navy Premium */}
 <div
 id="mobile-menu"
 className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] z-50 shadow-2xl lg:hidden flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
 mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
 }`}
 style={{ background: 'linear-gradient(160deg, #0f172a 0%, #111827 60%, #0c1a2e 100%)' }}
 >
 {/* ── Header ── */}
 <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-white/8">
 <button
 onClick={logoClick}
 className="flex items-baseline gap-0.5 bg-transparent border-none p-0 cursor-pointer"
 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1, color: '#fff', letterSpacing: '0.04em' }}
 >
 {siteName || 'BEHOLD'}
 <span style={{ color: '#00E5FF', fontWeight: 900 }}>.</span>
 </button>
 <button
 onClick={() => setMobileMenuOpen(false)}
 className="w-9 h-9 rounded-full flex items-center justify-center bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all border-none cursor-pointer"
 >
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
 <line x1="18" y1="6" x2="6" y2="18" />
 <line x1="6" y1="6" x2="18" y2="18" />
 </svg>
 </button>
 </div>

 {/* ── Nav Links ── */}
 <div className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
 {[
 { label: 'Home', action: () => { setMobileMenuOpen(false); navigateToSection?.('home') || navigate('/'); } },
 { label: 'Services', action: () => { setMobileMenuOpen(false); navigateToSection?.('services') || navigate('/'); } },
 { label: 'About Us', action: () => { setMobileMenuOpen(false); navigateToSection?.('about') || navigate('/'); } },
 { label: 'Aptitude Test', action: () => { setMobileMenuOpen(false); navigate('/sample-test'); } },
 { label: 'Blog', action: () => { setMobileMenuOpen(false); navigate('/blog'); } },
 { label: 'Contact Us', action: () => { setMobileMenuOpen(false); navigateToSection?.('contact') || navigate('/'); } },
 ].map(({ label, action }) => (
 <button
 key={label}
 onClick={action}
 className="w-full text-left flex items-center justify-between px-4 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/7 transition-all duration-200 group text-[15px] font-medium cursor-pointer border-none bg-transparent"
 >
 <span>{label}</span>
 <svg className="w-4 h-4 text-white/25 group-hover:text-[#00E5FF] group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
 </svg>
 </button>
 ))}

 {/* Divider */}
 <div className="mx-4 my-4 border-t border-white/8" />

 {/* Social Links */}
 {socials.length > 0 && (
 <div className="px-4 pb-2">
 <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-3">Follow Us</p>
 <div className="flex items-center gap-2 flex-wrap">
 {socials.map((link, idx) => (
 <a
 key={idx}
 href={link.url || '#'}
 target="_blank"
 rel="noopener noreferrer"
 className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all duration-200"
 >
 {renderSocialIcon(link.name, link.logo)}
 </a>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* ── Footer Actions ── */}
 <div className="px-5 pb-6 pt-4 border-t border-white/8 flex flex-col gap-3">
 {/* Contact Info */}
 {siteSettings?.contactPhone && (
 <a
 href={`tel:${siteSettings.contactPhone.replace(/\s+/g, '')}`}
 className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm cursor-pointer"
 >
 <svg className="w-4 h-4 text-[#00E5FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548A1 1 0 0119 9.28V12a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
 </svg>
 <span className="font-medium">{siteSettings.contactPhone}</span>
 </a>
 )}

 {/* Sign In / Sign Out */}
 <button
 onClick={() => { setMobileMenuOpen(false); if (user) setIsLogoutOpen(true); else onOpenAuth?.(); }}
 className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white/80 hover:text-white bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 </svg>
 {user ? 'Sign Out' : 'Sign In'}
 </button>

 {/* WhatsApp Icon + Book Appointment — Single Row */}
 <div className="flex items-center gap-3">
   {/* WhatsApp icon-only square button */}
   <a
     href={(() => {
       const input = siteSettings?.whatsapp;
       if (!input || input === '#') return 'https://wa.link/4jpzfq';
       const str = String(input).trim();
       if (str.startsWith('http')) return str;
       const digits = str.replace(/\D/g, '');
       return digits.length >= 10 ? `https://wa.me/${digits}` : 'https://wa.link/4jpzfq';
     })()}
     target="_blank"
     rel="noopener noreferrer"
     className="shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/25 border border-[#25D366]/25 hover:border-[#25D366]/50 text-[#25D366] transition-all cursor-pointer"
     aria-label="WhatsApp Us"
   >
     <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
     </svg>
   </a>

   {/* Book Appointment — fills remaining space */}
   <button
     onClick={() => { setMobileMenuOpen(false); navigate('/booking'); }}
     className="flex-1 h-14 flex items-center justify-center rounded-xl font-black text-sm text-slate-900 border-none cursor-pointer transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,229,255,0.35)] hover:shadow-[0_6px_28px_rgba(0,229,255,0.55)]"
     style={{ background: '#00E5FF' }}
   >
     Book Appointment
   </button>
 </div>
 </div>
 </div>

  {/* Floating WhatsApp Button Matching Reference Exactly */}
  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
    <a
      href={(() => {
        const input = siteSettings?.whatsapp;
        if (!input || input === '#') return 'https://wa.link/4jpzfq';
        const str = String(input).trim();
        if (str.startsWith('http://') || str.startsWith('https://')) return str;
        const digits = str.replace(/\D/g, '');
        if (digits.length >= 10) return `https://wa.me/${digits}`;
        return 'https://wa.link/4jpzfq';
      })()}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex items-center justify-center p-1.5 sm:p-2 rounded-full bg-[#0d361e]/95 border-2 border-[#1d8045]/70 shadow-[0_6px_25px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-105 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-inner">
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current shrink-0"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
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
