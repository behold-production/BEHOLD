import React from 'react';
import { ArrowRight, Send } from 'lucide-react';

export default function Footer({ navigateToSection }) {
  const handleLogoClick = () => {
    navigateToSection('top');
  };

  return (
    <footer className="bg-black text-zinc-500 text-xs py-12 md:py-20 px-4 sm:px-6 border-t border-zinc-900 text-left select-none relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-12 pb-16 border-b border-zinc-900">
        
        {/* Brand column */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
          <span 
            onClick={handleLogoClick}
            className="font-header font-black text-lg text-white hover:text-brand tracking-tighter cursor-pointer transition duration-300"
          >
            BEHOLD<span className="text-brand">.</span>
          </span>
          <p className="text-zinc-650 max-w-sm font-light leading-relaxed">
            Elevating student psychological development and career directives through doorstep counselling and personalized mentoring.
          </p>
        </div>

        {/* Column 2: Services */}
        <div>
          <h5 className="text-zinc-200 font-bold uppercase tracking-wider mb-4 font-header text-[10px]">Services</h5>
          <ul className="space-y-3 font-light">
            <li><button onClick={() => navigateToSection('cdat')} className="hover:text-brand transition cursor-pointer text-left">Aptitude Test</button></li>
            <li><button onClick={() => navigateToSection('services')} className="hover:text-brand transition cursor-pointer text-left">Career Counselling</button></li>
            <li><button onClick={() => navigateToSection('services')} className="hover:text-brand transition cursor-pointer text-left">Psychological Counselling</button></li>
          </ul>
        </div>

        {/* Column 3: Booking */}
        <div>
          <h5 className="text-zinc-200 font-bold uppercase tracking-wider mb-4 font-header text-[10px]">Booking</h5>
          <ul className="space-y-3 font-light">
            <li><button onClick={() => window.location.hash = '#/booking'} className="hover:text-brand transition cursor-pointer text-left">Online Sessions</button></li>
            <li><button onClick={() => window.location.hash = '#/booking'} className="hover:text-brand transition cursor-pointer text-left">Doorstep Support</button></li>
            <li><button onClick={() => window.location.hash = '#/booking'} className="hover:text-brand transition cursor-pointer text-left">Office Consultations</button></li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div>
          <h5 className="text-zinc-200 font-bold uppercase tracking-wider mb-4 font-header text-[10px]">Company</h5>
          <ul className="space-y-3 font-light">
            <li><button onClick={() => navigateToSection('about')} className="hover:text-brand transition cursor-pointer text-left">Why Us</button></li>
            <li><a href="#" className="hover:text-brand transition block">Our Story</a></li>
            <li><a href="#" className="hover:text-brand transition block">Careers</a></li>
          </ul>
        </div>

        {/* Column 5: Newsletter */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-4">
          <h5 className="text-zinc-200 font-bold uppercase tracking-wider font-header text-[10px]">Newsletter</h5>
          <p className="text-zinc-600 font-light leading-relaxed">Subscribe to get stream updates and student guidance guides.</p>
          
          <form onSubmit={(e) => e.preventDefault()} className="relative max-w-sm pt-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-[4px] py-3.5 pl-5 pr-12 text-xs outline-none focus:border-brand transition text-zinc-300 font-sans"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 bottom-1.5 w-9 h-9 rounded-[4px] bg-brand text-black hover:bg-brand-dark flex items-center justify-center transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-light text-zinc-650">
        <p>© BEHOLD Ltd., 2026</p>
        
        <div className="flex gap-6 font-mono text-[9px] uppercase tracking-wider">
          <a href="#" className="hover:text-brand transition">Privacy Policy</a>
          <a href="#" className="hover:text-brand transition">Terms of Use</a>
          <a href="#" className="hover:text-brand transition">Support</a>
        </div>
      </div>
    </footer>
  );
}
