import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ApiService from '../../services/api';
import { renderTitleWithFullstopDot } from '../../components/common/BrandDot';
import { trackLead, trackContact, setMetaUserData } from '../../utils/metaPixel';

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
      
      setMetaUserData({
        em: formData.email.trim(),
        fn: formData.name.trim()
      });
      trackLead({
        content_name: 'Inquiry Form Submission',
        content_category: 'Lead'
      });
      trackContact({
        method: 'inquiry_form',
        source: 'inquiry_component'
      });

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
      <section className="py-20 sm:py-28 bg-[#0e1111] text-white relative border-b border-[#0e7490]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#0e7490] tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-[#0e7490]/60 inline-block" />
            {settings.inquirySectionSub || 'START YOUR JOURNEY'}
            <span className="w-5 h-px bg-[#0e7490]/60 inline-block" />
          </span>
          <h2 className="font-serif-hero text-3xl sm:text-5xl font-normal text-white mb-4 tracking-tight leading-[1.05]">
            {settings.inquirySectionTitle || 'Ready to Build Your Future'}
            <span className="text-[#0e7490] drop-shadow-[0_0_8px_rgba(14,116,144,0.8)]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-[#d5cdbb] font-normal max-w-xl mx-auto mb-10 leading-relaxed">
            {settings.inquirySectionDesc || 'Take the first step toward discovering your true potential. Our mentors are here to guide you through every stage of your academic and career journey.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => { const el = document.getElementById('inquiry'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#0e7490] px-7 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-all shadow-md border-none cursor-pointer hover:bg-[#0b5c73]"
            >
              Book Your Consultation
            </button>
            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-7 py-2.5 text-xs font-semibold uppercase tracking-widest text-white border border-white/30 backdrop-blur-md transition-all cursor-pointer hover:bg-white/20"
            >
              Take Aptitude Test
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="inquiry" className="py-20 sm:py-28 bg-transparent text-[#0e1111] border-b border-[#e6dfd0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Form — 7 cols */}
            <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-10 border border-[#e6dfd0] shadow-xl shadow-[#e6dfd0]/40">
              <div className="mb-8">
                <span className="text-xs font-semibold text-[#0e7490] flex items-center gap-1.5 mb-2">
                  Get In Touch
                </span>
                <h2 id="inquiry-title" className="font-serif-hero text-3xl font-semibold text-[#0e1111] mb-3 leading-tight">
                  Want to Know More<span className="text-[#0e7490] drop-shadow-[0_0_8px_rgba(14,116,144,0.8)]">.</span>
                </h2>
                <p className="text-sm text-[#55605f] font-normal leading-relaxed">
                  Submit your request and we'll match you with the right expert within 24 hours.
                </p>
              </div>

              {testProfile && (
                <div className="mb-6 p-4 bg-[#f6f1e6] border border-[#0e7490]/40 rounded-xl text-[#0e1111] text-xs sm:text-sm font-semibold">
                  ✓ Pre-filled with your aptitude test results ({testProfile.dominantDomain} profile).
                </div>
              )}

              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-[#0e1111] text-[#0e7490] rounded-full flex items-center justify-center mx-auto mb-4 font-semibold text-lg border border-[#0e7490]/40">
                    ✓
                  </div>
                  <h3 className="font-serif-hero text-xl font-semibold text-[#0e1111] mb-2">Request Sent.</h3>
                  <p className="text-[#55605f] text-sm">Our coordinator will contact you shortly.</p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="mt-6 px-7 py-3 bg-[#0e1111] hover:bg-[#123039] text-white font-semibold text-xs rounded-full transition-all border border-[#0e7490]/30 cursor-pointer"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name-input" className="block text-xs font-semibold text-[#0e1111] mb-1.5">Full Name *</label>
                      <input
                        type="text" name="name" id="name-input"
                        value={formData.name} onChange={handleChange}
                        placeholder="e.g. Priya Nair"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all ${formErrors.name ? 'border-rose-400' : 'border-[#e6dfd0]'}`}
                      />
                      {formErrors.name && <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email-input" className="block text-xs font-semibold text-[#0e1111] mb-1.5">Email Address *</label>
                      <input
                        type="email" name="email" id="email-input"
                        value={formData.email} onChange={handleChange}
                        placeholder="name@email.com"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all ${formErrors.email ? 'border-rose-400' : 'border-[#e6dfd0]'}`}
                      />
                      {formErrors.email && <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message-textarea" className="block text-xs font-semibold text-[#0e1111] mb-1.5">Your Message</label>
                    <textarea
                      rows={4} name="message" id="message-textarea"
                      value={formData.message} onChange={handleChange}
                      placeholder="Details regarding stream, class or queries..."
                      className="w-full border border-[#e6dfd0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all resize-none"
                    />
                  </div>

                  {formErrors.submit && <p className="text-rose-600 text-xs font-semibold">{formErrors.submit}</p>}

                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#0e1111] px-4 py-2.5 text-[13px] font-semibold text-[#0e7490] transition-all border border-[#0e7490]/30 cursor-pointer disabled:opacity-60 shadow-xs hover:bg-[#123039]"
                  >
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Info — 5 cols */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <h3 className="font-serif-hero text-2xl font-semibold text-[#0e1111]">
                What Happens Next<span className="text-[#0e7490] drop-shadow-[0_0_8px_rgba(14,116,144,0.8)]">.</span>
              </h3>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-[#0e1111] text-[#0e7490] rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-[#0e7490]/40">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-[#0e1111] mb-1 font-sans">{step.title}</h4>
                      <p className="text-xs text-[#55605f] font-normal leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              {(settings.contactPhone || settings.contactEmail) && (
                <div className="mt-8 p-6 bg-white rounded-xl border border-[#e6dfd0] shadow-xs">
                  <h4 className="font-semibold text-[#0e1111] mb-3 text-xs uppercase tracking-widest">Reach Us Directly</h4>
                  {settings.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 text-[#0e1111] font-semibold text-sm mb-2 hover:underline">
                      <svg className="w-4 h-4 text-[#0e7490]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.83h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17z" /></svg>
                      {settings.contactPhone}
                    </a>
                  )}
                  {settings.contactEmail && (
                    <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 text-[#0e1111] font-semibold text-sm hover:underline">
                      <svg className="w-4 h-4 text-[#0e7490]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
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
