import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ navigateToSection, currentView, onOpenAuth }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (currentView !== 'landing') {
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

  return (
    <header className="sticky top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-black/[0.05] text-black transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Left Column: Logo & Nav Links */}
        <div className="flex items-center space-x-12">
          <span 
            onClick={handleLogoClick}
            className="font-header font-black text-xl tracking-tighter cursor-pointer text-black hover:text-brand transition duration-300"
            id="nav-logo"
          >
            BEHOLD<span className="text-brand font-black">.</span>
          </span>
          
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider text-black/50">
            {/* Added Home Link */}
            <button 
              onClick={handleLogoClick}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                currentView === 'landing' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') ? 'text-black font-bold font-semibold' : 'hover:text-black'
              }`}
            >
              Home
              {currentView === 'landing' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            <button 
              onClick={() => scrollToSection('services')}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                activeSection === 'services' && currentView === 'landing' ? 'text-black font-bold font-semibold' : 'hover:text-black'
              }`}
            >
              Services
              {activeSection === 'services' && currentView === 'landing' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            {/* Renamed Aptitude Test to Sample Test */}
            <button 
              onClick={() => window.location.hash = '#/sample-test'}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                currentView === 'test' ? 'text-black font-bold font-semibold' : 'hover:text-black'
              }`}
            >
              Sample Test
              {currentView === 'test' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            {/* "Your Profile" is now removed from here, handled in user avatar */}

            <button 
              onClick={() => scrollToSection('inquiry')}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                activeSection === 'inquiry' && currentView === 'landing' ? 'text-black font-bold font-semibold' : 'hover:text-black'
              }`}
            >
              Contact
              {activeSection === 'inquiry' && currentView === 'landing' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>
          </nav>
        </div>

        {/* Right Column: Actions */}
        <div className="hidden md:flex items-center space-x-4 relative">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full bg-brand text-black font-black flex items-center justify-center uppercase tracking-widest text-sm shadow-sm border border-black/5 hover:scale-105 transition-transform"
              >
                {user.name.charAt(0)}
              </button>
              
              {showDropdown && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-black/5 shadow-xl rounded-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-black/[0.05]">
                    <p className="text-xs font-bold text-black truncate">{user.name}</p>
                    <p className="text-[10px] text-black/50 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowDropdown(false); window.location.hash = '#/profile'; }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-black/70 hover:bg-black/5 hover:text-black transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" /> Your Profile
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold text-black hover:text-brand transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={() => window.location.hash = '#/booking'}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl border border-black/10 transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'booking' 
                ? 'bg-black text-white' 
                : 'bg-brand hover:bg-brand-dark text-black shadow-xs'
            }`}
          >
            <span>Book Session</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden text-black hover:text-black/80 transition p-1 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu (Edge-to-edge aligned under sticky header) */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-black/[0.05] px-4 sm:px-6 py-8 flex flex-col gap-6 text-xs font-bold text-black/60 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 rounded-none">
          <button
            onClick={handleLogoClick}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              currentView === 'landing' && (activeSection === 'home' || activeSection === 'cdat' || activeSection === '') ? 'text-black' : 'hover:text-black'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('services')}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              activeSection === 'services' && currentView === 'landing' ? 'text-black' : 'hover:text-black'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => { window.location.hash = '#/sample-test'; setIsMenuOpen(false); }}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              currentView === 'test' ? 'text-black' : 'hover:text-black'
            }`}
          >
            Sample Test
          </button>
          {/* Mobile Profile handling */}
          {user ? (
            <>
              <button
                onClick={() => { window.location.hash = '#/profile'; setIsMenuOpen(false); }}
                className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer flex items-center gap-2 ${
                  currentView === 'profile' ? 'text-black' : 'hover:text-black'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-brand text-black font-black flex items-center justify-center text-[10px]">
                  {user.name.charAt(0)}
                </div>
                Your Profile
              </button>
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="text-left border-b border-black/[0.03] pb-2 cursor-pointer text-rose-600 hover:text-rose-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setIsMenuOpen(false); }}
              className="text-left border-b border-black/[0.03] pb-2 cursor-pointer hover:text-brand text-black"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => scrollToSection('inquiry')}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              activeSection === 'inquiry' && currentView === 'landing' ? 'text-black' : 'hover:text-black'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => { window.location.hash = '#/booking'; setIsMenuOpen(false); }}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer flex items-center justify-between ${
              currentView === 'booking' ? 'text-black' : 'hover:text-black'
            }`}
          >
            <span>Book Session</span>
            <ArrowUpRight className="w-4 h-4 text-brand" />
          </button>
        </div>
      )}
    </header>
  );
}
