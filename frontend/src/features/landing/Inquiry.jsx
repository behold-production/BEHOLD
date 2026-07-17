import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ApiService from '../../shared/services/api';
import { ScrollDot, renderTitleWithFullstopDot } from '../../shared/components/BrandDot';

const steps = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Quick Response',
    desc: 'Our coordinator will reach out within 24 hours to understand your unique needs.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Expert Mapping',
    desc: 'We review any C-DAT scores and match you with the right psychological mentor.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Schedule Session',
    desc: 'Book a personalized 1-on-1 counseling session at a time that works best for you.',
  },
];

export default function Inquiry({ testProfile, siteSettings }) {
  const settings = siteSettings || {};
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setIsSubmitting(true);
    try {
      await ApiService.submitInquiry(formData.name.trim(), formData.email.trim(), formData.message.trim());
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to submit request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Ready CTA Banner */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #00F0FF 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#00A8FF] block mb-3">Start Your Journey</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight flex items-center justify-center flex-wrap">
            {renderTitleWithFullstopDot('Ready To Build Your Future?', 'inquiry-title', 'Scroll to Form ↓', 'md')}
          </h2>
          <p className="text-base sm:text-lg text-gray-300 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
            Take the first step toward discovering your true potential. Our mentors are here to guide you through every stage of your academic and career journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { const el = document.getElementById('inquiry'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-10 py-4 bg-[#00A8FF] hover:bg-[#00F0FF] text-white font-black text-lg rounded-lg transition border-none cursor-pointer shadow-xl shadow-[#00A8FF]/30"
            >
              Book Your Consultation
            </button>
            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-lg transition border border-white/20 cursor-pointer"
            >
              Take Aptitude Test
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="inquiry" className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Form — 3 cols */}
            <div className="lg:col-span-3 bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="mb-8">
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#00A8FF] block mb-2">Get In Touch</span>
                <h2 id="inquiry-title" className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 flex items-center flex-wrap">
                  {renderTitleWithFullstopDot('Want to Know More?', 'footer-brand', 'Scroll to Footer ↓', 'md')}
                </h2>
                <p className="text-base text-gray-600 font-normal leading-relaxed">
                  Submit your request and we'll match you with the right expert within 24 hours.
                </p>
              </div>

              {testProfile && (
                <div className="mb-6 p-4 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-lg text-[#00A8FF] text-sm font-semibold">
                  ✓ Pre-filled with your aptitude test results ({testProfile.dominantDomain} profile).
                </div>
              )}

              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Request Sent!</h3>
                  <p className="text-gray-500">Our coordinator will contact you shortly.</p>
                  <button onClick={() => setSubmitStatus(null)} className="mt-6 px-6 py-2.5 bg-[#00A8FF] text-white rounded-lg font-bold border-none cursor-pointer">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name-input" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text" name="name" id="name-input"
                        value={formData.name} onChange={handleChange}
                        placeholder="Student Name"
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${formErrors.name ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#00A8FF] focus:ring-[#00F0FF]/20'}`}
                      />
                      {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email-input" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email" name="email" id="email-input"
                        value={formData.email} onChange={handleChange}
                        placeholder="name@email.com"
                        className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition ${formErrors.email ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#00A8FF] focus:ring-[#00F0FF]/20'}`}
                      />
                      {formErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message-textarea" className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
                    <textarea
                      rows={5} name="message" id="message-textarea"
                      value={formData.message} onChange={handleChange}
                      placeholder="Details regarding stream, class or queries..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition resize-none"
                    />
                  </div>

                  {formErrors.submit && <p className="text-red-500 text-sm font-bold">{formErrors.submit}</p>}

                  <button
                    type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-[#00A8FF] hover:bg-[#00F0FF] text-white font-black text-lg rounded-lg transition border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#00A8FF]/20"
                  >
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : 'Send Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Info — 2 cols */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <h3 className="text-2xl font-black text-gray-900 mb-8">What Happens Next?</h3>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-[#00A8FF] text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-[#00A8FF]/30">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              {(settings.contactPhone || settings.contactEmail) && (
                <div className="mt-8 p-6 bg-[#00F0FF]/10 rounded-lg border border-[#00F0FF]/30">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Or reach us directly</h4>
                  {settings.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 text-[#00A8FF] font-bold mb-2 hover:text-[#00F0FF]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.83h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17z" /></svg>
                      {settings.contactPhone}
                    </a>
                  )}
                  {settings.contactEmail && (
                    <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 text-[#00A8FF] font-bold hover:text-[#00F0FF]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      {settings.contactEmail}
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
