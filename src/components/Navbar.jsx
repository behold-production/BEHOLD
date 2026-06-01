import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ setView, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    if (currentView !== 'landing') {
      setActiveSection('');
      return;
    }

    const sections = ['services', 'about', 'faqs', 'inquiry', 'cdat'];

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
    window.location.hash = '#/';
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 w-full bg-white/60 backdrop-blur-md z-50 border-b border-black/[0.05] text-black transition-all relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Left Column: Logo & Nav Links */}
        <div className="flex items-center space-x-12">
          <span 
            onClick={handleLogoClick}
            className="font-header font-black text-xl tracking-tighter cursor-pointer text-black hover:text-black/80 transition"
            id="nav-logo"
          >
            BEHOLD<span className="text-black/35 font-light">.</span>
          </span>
          
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-black/50">
            {/* Added Home Link */}
            <button 
              onClick={handleLogoClick}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                currentView === 'landing' && activeSection === '' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Home
              {currentView === 'landing' && activeSection === '' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            <button 
              onClick={() => scrollToSection('services')}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                activeSection === 'services' && currentView === 'landing' ? 'text-black font-bold' : 'hover:text-black'
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
                currentView === 'test' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Sample Test
              {currentView === 'test' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            <button 
              onClick={() => scrollToSection('about')}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                activeSection === 'about' && currentView === 'landing' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              Why Us
              {activeSection === 'about' && currentView === 'landing' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>

            <button 
              onClick={() => scrollToSection('faqs')}
              className={`transition-all duration-300 cursor-pointer pb-1 relative ${
                activeSection === 'faqs' && currentView === 'landing' ? 'text-black font-bold' : 'hover:text-black'
              }`}
            >
              FAQs
              {activeSection === 'faqs' && currentView === 'landing' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand" />
              )}
            </button>
          </nav>
        </div>

        {/* Right Column: Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <button 
            onClick={() => window.location.hash = '#/profile'}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-[4px] border border-black/10 transition duration-300 cursor-pointer ${
              currentView === 'profile' 
                ? 'bg-black text-white' 
                : 'bg-white hover:bg-black hover:text-white text-black'
            }`}
          >
            Student Profile
          </button>
          <button 
            onClick={() => window.location.hash = '#/booking'}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-[4px] border border-black/10 transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
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
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-black/[0.05] px-4 sm:px-6 py-8 flex flex-col gap-6 text-xs font-bold uppercase tracking-wider text-black/60 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 rounded-none">
          <button
            onClick={handleLogoClick}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              currentView === 'landing' && activeSection === '' ? 'text-black' : 'hover:text-black'
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
          <button
            onClick={() => scrollToSection('about')}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              activeSection === 'about' && currentView === 'landing' ? 'text-black' : 'hover:text-black'
            }`}
          >
            Why Us
          </button>
          <button
            onClick={() => scrollToSection('faqs')}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              activeSection === 'faqs' && currentView === 'landing' ? 'text-black' : 'hover:text-black'
            }`}
          >
            FAQs
          </button>
          <button
            onClick={() => { window.location.hash = '#/profile'; setIsMenuOpen(false); }}
            className={`text-left border-b border-black/[0.03] pb-2 cursor-pointer ${
              currentView === 'profile' ? 'text-black' : 'hover:text-black'
            }`}
          >
            Student Profile
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
