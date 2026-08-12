import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ApiService from '../../services/api';
import { renderTitleWithFullstopDot } from '../../components/common/BrandDot';

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
      <section className="py-20 sm:py-28 bg-[#0f172a] text-white relative border-b border-[#00e5ff]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-[#00c9d6] tracking-widest uppercase mb-3">
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
            {settings.inquirySectionSub || 'START YOUR JOURNEY'}
            <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
          </span>
          <h2 className="text-3xl sm:text-5xl font-sans font-semibold uppercase text-white mb-4 tracking-tight leading-none">
            {settings.inquirySectionTitle || 'Ready to Build Your Future'}
            <span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
          </h2>
          <p className="text-sm sm:text-base text-surface-300 font-normal max-w-xl mx-auto mb-10 leading-relaxed">
            {settings.inquirySectionDesc || 'Take the first step toward discovering your true potential. Our mentors are here to guide you through every stage of your academic and career journey.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => { const el = document.getElementById('inquiry'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
              className="px-8 py-3.5 bg-[#00e5ff] hover:bg-[#00cce6] text-[#0f172a] font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md border-none cursor-pointer"
            >
              Book Your Consultation
            </button>
            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-full border border-white/30 backdrop-blur-md transition-all cursor-pointer"
            >
              Take Aptitude Test
            </button>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="inquiry" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Form — 7 cols */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/40">
              <div className="mb-8">
                <span className="text-xs font-semibold text-[#00e5ff] flex items-center gap-1.5 mb-2">
                  Get In Touch
                </span>
                <h2 id="inquiry-title" className="text-3xl font-sans font-semibold text-[#0f172a] mb-3 leading-tight">
                  Want to Know More<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
                </h2>
                <p className="text-sm text-surface-600 font-normal leading-relaxed">
                  Submit your request and we'll match you with the right expert within 24 hours.
                </p>
              </div>

              {testProfile && (
                <div className="mb-6 p-4 bg-surface-50 border border-[#00e5ff]/40 rounded-xl text-[#0f172a] text-xs sm:text-sm font-semibold">
                  ✓ Pre-filled with your aptitude test results ({testProfile.dominantDomain} profile).
                </div>
              )}

              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-[#0f172a] text-[#00e5ff] rounded-full flex items-center justify-center mx-auto mb-4 font-semibold text-lg border border-[#00e5ff]/40">
                    ✓
                  </div>
                  <h3 className="text-xl font-sans font-semibold text-[#0f172a] mb-2">Request Sent.</h3>
                  <p className="text-surface-600 text-sm">Our coordinator will contact you shortly.</p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="mt-6 px-7 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-xs rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name-input" className="block text-xs font-semibold text-[#0f172a] mb-1.5">Full Name *</label>
                      <input
                        type="text" name="name" id="name-input"
                        value={formData.name} onChange={handleChange}
                        placeholder="e.g. Priya Nair"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all ${formErrors.name ? 'border-rose-400' : 'border-surface-200'}`}
                      />
                      {formErrors.name && <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email-input" className="block text-xs font-semibold text-[#0f172a] mb-1.5">Email Address *</label>
                      <input
                        type="email" name="email" id="email-input"
                        value={formData.email} onChange={handleChange}
                        placeholder="name@email.com"
                        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all ${formErrors.email ? 'border-rose-400' : 'border-surface-200'}`}
                      />
                      {formErrors.email && <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message-textarea" className="block text-xs font-semibold text-[#0f172a] mb-1.5">Your Message</label>
                    <textarea
                      rows={4} name="message" id="message-textarea"
                      value={formData.message} onChange={handleChange}
                      placeholder="Details regarding stream, class or queries..."
                      className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] transition-all resize-none"
                    />
                  </div>

                  {formErrors.submit && <p className="text-rose-600 text-xs font-semibold">{formErrors.submit}</p>}

                  <button
                    type="submit" disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-[#00c9d6] font-semibold text-sm rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Request'}
                  </button>
                </form>
              )}
            </div>

            {/* Info — 5 cols */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <h3 className="text-2xl font-sans font-semibold uppercase text-[#0f172a]">
                What Happens Next<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">.</span>
              </h3>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-[#0f172a] text-[#00e5ff] rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-[#00e5ff]/40">
                      {step.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-[#0f172a] mb-1 font-sans">{step.title}</h4>
                      <p className="text-xs text-surface-600 font-normal leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              {(settings.contactPhone || settings.contactEmail) && (
                <div className="mt-8 p-6 bg-white rounded-xl border border-surface-200 shadow-xs">
                  <h4 className="font-semibold text-[#0f172a] mb-3 text-xs uppercase tracking-widest">Reach Us Directly</h4>
                  {settings.contactPhone && (
                    <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 text-[#0f172a] font-semibold text-sm mb-2 hover:underline">
                      <svg className="w-4 h-4 text-[#00e5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.83h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.72 17z" /></svg>
                      {settings.contactPhone}
                    </a>
                  )}
                  {settings.contactEmail && (
                    <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 text-[#0f172a] font-semibold text-sm hover:underline">
                      <svg className="w-4 h-4 text-[#00e5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
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
