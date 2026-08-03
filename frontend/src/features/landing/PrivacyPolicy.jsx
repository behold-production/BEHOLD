import React, { useEffect } from 'react';
import Navbar from '../../shared/components/Navbar';
import Footer from '../../shared/components/Footer';

const PrivacyPolicy = ({ siteSettings }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans selection:bg-brand/30">
      {/* Navbar spacer */}
      <div className="h-20 lg:h-24 bg-[#F5F5F5] w-full" />
      
      {/* Header Section */}
      <section className="bg-brand text-zinc-950 py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-zinc-800 max-w-2xl mx-auto font-medium">
            Learn how we collect, use, and protect your information.
          </p>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-950/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-8 md:p-12">
          
          <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-zinc-600 prose-li:text-zinc-600 whitespace-pre-wrap">
            {siteSettings?.privacyPolicy || 'Privacy policy not found.'}
          </div>
        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicy;
