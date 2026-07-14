import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ApiService from '../../shared/services/api';

export default function Inquiry({ testProfile, siteSettings }) {
  const settings = siteSettings || {};
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const [prevTestProfile, setPrevTestProfile] = useState(testProfile);
  if (testProfile !== prevTestProfile) {
    setPrevTestProfile(testProfile);
    if (testProfile) {
      const scoresString = Object.entries(testProfile.scores || {})
        .map(([cat, score]) => `${cat} ${score}%`)
        .join(', ');
      setFormData(prev => ({
        ...prev,
        message: `I completed the online assessment! My dominant profile is: ${testProfile.dominantDomain}. Scores: ${scoresString}. I would like to book a detailed consultation.`
      }));
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    else if (formData.name.trim().length < 3) errors.name = 'Full name must be at least 3 characters';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await ApiService.submitInquiry(formData.name.trim(), formData.email.trim(), formData.message.trim());
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to save inquiry', err);
      setFormErrors({ submit: err.message || 'Failed to submit request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── CONTACT CTA SECTION ── */}
      <section
        id="contact"
        className="relative py-12 md:py-28 overflow-hidden bg-neon-blue-deep border-t border-line"
      >
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover object-center opacity-15"
            alt="Students background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue-deep/95 via-neon-blue-mid/90 to-neon-blue-deep/95" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-semibold text-white mb-5 leading-[1.15] tracking-tight font-serif">
            Ready To Build<br className="hidden sm:inline" /> Your Future?
          </h2>
          <p className="text-white/75 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-normal font-sans">
            Take the first step toward discovering your true potential. Our mentors are here to
            guide you through every stage of your academic and career journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('inquiry');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-gold hover:bg-gold-soft text-neon-blue-deep font-semibold text-sm sm:text-base shadow-md shadow-gold/10 hover:shadow-gold/25 transition-all duration-300 cursor-pointer border-none active:translate-y-[1px]"
            >
              Book Your Consultation
            </button>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm border border-gold-soft/50 hover:border-gold bg-transparent hover:bg-gold/5 text-gold-soft hover:text-gold font-semibold text-sm sm:text-base transition-all duration-300 cursor-pointer active:translate-y-[1px]"
            >
              Take Aptitude Test
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── INQUIRY FORM SECTION ── */}
      <motion.section
        id="inquiry"
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
        className="py-10 md:py-20 px-4 sm:px-6 lg:px-8 bg-transparent max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-sm overflow-hidden shadow-sm border border-line flex flex-col md:flex-row transition-all duration-300">

          {/* Form Side */}
          <div className="p-8 md:p-12 space-y-8 flex-1 border-b md:border-b-0 md:border-r border-line">
            <div>
              <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-gold block mb-3 font-mono">
                GET IN TOUCH
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-neon-blue-deep mb-3 leading-tight tracking-tight font-serif">
                Want to Know More?
              </h2>
              <p className="text-ink-soft text-sm sm:text-base leading-relaxed font-normal max-w-md font-sans">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>

            {testProfile && (
              <div className="p-4 bg-gold/5 border-l-4 border-gold text-neon-blue-deep text-xs font-semibold flex items-center gap-2 rounded-r-sm font-mono">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="block text-xs font-bold uppercase text-ink-soft mb-2 font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    autoComplete="name"
                    className={`w-full px-5 py-4 bg-white border rounded-sm text-sm outline-none transition-all text-ink ${formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-gold focus:ring-2 focus:ring-gold/15'}`}
                  />
                  {formErrors.name && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-input" className="block text-xs font-bold uppercase text-ink-soft mb-2 font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    autoComplete="email"
                    className={`w-full px-5 py-4 bg-white border rounded-sm text-sm outline-none transition-all text-ink ${formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-line focus:border-gold focus:ring-2 focus:ring-gold/15'}`}
                  />
                  {formErrors.email && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message-textarea" className="block text-xs font-bold uppercase text-ink-soft mb-2 font-mono">
                  Your Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-5 py-4 bg-white border border-line rounded-sm text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all resize-none text-ink"
                />
              </div>

              {formErrors.submit && (
                <p className="text-red-500 font-bold text-xs" role="alert">{formErrors.submit}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neon-blue-deep text-white py-4 rounded-sm font-semibold hover:bg-neon-blue-mid transition-all duration-300 shadow-sm active:scale-[0.98] border-none cursor-pointer flex justify-center items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-[1px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Request</span>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-neon-blue-deep/5 border border-neon-blue-deep/15 text-neon-blue-deep text-center font-semibold text-xs rounded-sm" role="status">
                  Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>

          {/* Information Side */}
          <div className="hidden md:flex flex-col justify-center h-[300px] md:h-auto md:w-[350px] lg:w-[450px] shrink-0 bg-neon-blue-deep text-white p-8 lg:p-12 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue-mid rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-serif font-semibold mb-8">What Happens Next?</h3>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-gold-soft">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1.5 font-sans">Quick Response</h4>
                    <p className="text-white/70 text-xs leading-relaxed font-sans">Our coordinator will reach out within 24 hours to understand your unique needs.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-gold-soft">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1.5 font-sans">Expert Mapping</h4>
                    <p className="text-white/70 text-xs leading-relaxed font-sans">We review any C-DAT scores and match you with the right psychological mentor.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-gold-soft">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1.5 font-sans">Schedule Session</h4>
                    <p className="text-white/70 text-xs leading-relaxed font-sans">Book a personalized 1-on-1 counseling session at a time that works best for you.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}
