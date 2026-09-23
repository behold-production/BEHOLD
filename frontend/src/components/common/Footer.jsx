import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Globe, Camera, MessageCircle, Share2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Footer({ onOpenAuth, siteName, siteSettings }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Press & Media', path: '/press' },
        { label: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Psychological Care', path: '/booking' },
        { label: 'Career Mentoring', path: '/booking' },
        { label: 'Aptitude Tests', path: '/cdat' },
        { label: 'Corporate Wellness', path: '/corporate' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog & Articles', path: '/blog' },
        { label: 'Help Center & FAQs', path: '/faqs' },
        { label: 'Student Portal', path: '/profile' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Refund Policy', path: '/refund' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 font-sans pt-20 pb-10 overflow-hidden relative">
      {/* Subtle Background Elements */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00e5ff] opacity-[0.03] filter blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => handleNav('/')}>
              <span className="text-3xl font-black font-sans text-slate-900 tracking-tight">
                {(siteName || 'BEHOLD').replace(/\.$/, '')}
                <span className="text-[#00e5ff] font-black">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
              Empowering individuals through expert psychological care, mentoring, and continuous support to achieve lasting well-being.
            </p>
            
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Mail className="w-4 h-4 text-[#00e5ff]" />
                <a href="mailto:hello@behold.co.in" className="hover:text-[#00e5ff] transition-colors">hello@behold.co.in</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                <Phone className="w-4 h-4 text-[#00e5ff]" />
                <a href="tel:+919999999999" className="hover:text-[#00e5ff] transition-colors">+91 99999 99999</a>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <MapPin className="w-4 h-4 text-[#00e5ff] mt-0.5" />
                <span>Kochi, Kerala, India</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group, idx) => (
            <div key={idx} className="lg:col-span-1">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => handleNav(link.path)}
                      className="text-sm font-medium text-slate-500 hover:text-[#00e5ff] transition-colors bg-transparent border-none p-0 cursor-pointer text-left flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-[#00e5ff]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            &copy; {new Date().getFullYear()} {siteName || 'BEHOLD'}. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {[
              { icon: Globe, href: '#' },
              { icon: Camera, href: '#' },
              { icon: MessageCircle, href: '#' },
              { icon: Share2, href: '#' },
            ].map((social, idx) => {
              const Icon = social.icon;
              return (
                <a 
                  key={idx} 
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#00e5ff] hover:text-white hover:border-[#00e5ff] transition-all cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </footer>
  );
}
