import React, { useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

const PrivacyPolicy = () => {
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
            At BEHOLD., we take your privacy seriously. Learn how we collect, use, and protect your information.
          </p>
          <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
            Last Updated: August 2026
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-950/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-zinc-200/60 p-8 md:p-12">
          
          <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-zinc-600 prose-li:text-zinc-600">
            <p className="text-lg leading-relaxed text-zinc-700 font-medium mb-8">
              BEHOLD. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>behold.co.in</strong> and use our services.
            </p>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">1. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect includes:
            </p>
            <ul className="space-y-2 mt-4 list-disc list-inside">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and phone number that you voluntarily give to us when you register for an account or book an appointment.</li>
              <li><strong>Booking Information:</strong> Details regarding your appointments, therapy sessions, and assessments.</li>
              <li><strong>Google OAuth Data:</strong> For counsellors and users syncing their calendars, we securely access Google Calendar data (specifically to create Google Meet links for sessions). We only access scopes explicitly authorized by you.</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">2. How We Use Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use information collected about you to:
            </p>
            <ul className="space-y-2 mt-4 list-disc list-inside">
              <li>Create and manage your account.</li>
              <li>Process your appointments and therapy sessions.</li>
              <li>Generate secure Google Meet links for online sessions via Google Calendar integration.</li>
              <li>Send you confirmation emails, SMS notifications, and reminders.</li>
              <li>Improve our platform and user experience.</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">3. Google Calendar Integration & OAuth</h2>
            <p>
              Our application uses Google OAuth to connect with your Google Calendar. 
            </p>
            <ul className="space-y-2 mt-4 list-disc list-inside">
              <li><strong>What we access:</strong> We request access to view and manage your calendar events (<code>https://www.googleapis.com/auth/calendar.events</code>) solely for the purpose of scheduling appointments and generating Google Meet video links.</li>
              <li><strong>Data Usage:</strong> We do not read, share, or sell your personal calendar events. We only create and modify events created through our platform.</li>
              <li><strong>Data Storage:</strong> We securely store the OAuth refresh token to maintain the connection, which you can revoke at any time from your dashboard or via your Google Account security settings.</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="space-y-2 mt-4 list-disc list-inside">
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay), email/SMS delivery (Meta WhatsApp), and hosting services.</li>
            </ul>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2 className="text-2xl mt-12 mb-4 text-zinc-900 border-b border-zinc-100 pb-2">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-zinc-50 p-6 rounded-2xl mt-4 border border-zinc-100">
              <p className="font-semibold text-zinc-900 mb-1">BEHOLD.</p>
              <p className="text-zinc-600 mb-1">Email: support@behold.co.in</p>
              <p className="text-zinc-600">Website: https://www.behold.co.in</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicy;
