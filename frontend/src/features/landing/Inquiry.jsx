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
      {/* ── CONTACT CTA SECTION (Dark BG like Prime Star) ── */}
      <section
        id="contact"
        className="relative py-12 md:py-28 overflow-hidden bg-[#060b13]"
      >
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover object-center opacity-30"
            alt="Students background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b13]/95 via-[#0a1220]/90 to-[#060b13]/95" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-normal text-white mb-5 leading-[1.15] tracking-tight">
            Ready To Build<br className="hidden sm:inline" /> Your Future?
          </h2>
          <p className="text-gray-200 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Take the first step toward discovering your true potential. Our mentors are here to
            guide you through every stage of your academic and career journey.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center items-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('inquiry');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-8 py-4 rounded-xl bg-[#00E5FF] hover:bg-[#1aebff] text-slate-900 font-bold text-sm sm:text-base shadow-lg transition-all duration-300 cursor-pointer border-none hover:shadow-[0_6px_30px_rgba(0,229,255,0.4)]"
            >
              Book Your Consultation
            </button>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl border-2 border-[#00E5FF]/60 hover:border-[#00E5FF] bg-transparent hover:bg-[#00E5FF]/10 text-[#00E5FF] font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer"
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
        className="py-10 md:py-20 px-4 sm:px-6 lg:px-8 bg-white max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-[8px] overflow-hidden shadow-sm hover:shadow-md border border-slate-200 flex flex-col md:flex-row transition-all duration-300">

          {/* Form Side */}
          <div className="p-8 md:p-12 space-y-8 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
            <div>
              <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#00E5FF] block mb-3">
                GET IN TOUCH
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal text-slate-900 mb-3 leading-tight tracking-tight">
                Want to Know More?
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-normal max-w-md">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>

            {testProfile && (
              <div className="p-4 bg-[#00E5FF]/10 border-l-4 border-[#00E5FF] text-slate-900 text-xs font-semibold flex items-center gap-2 rounded-r-lg">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="block text-xs font-bold uppercase text-gray-400 mb-2">
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
                    className={`w-full px-5 py-4 bg-white border rounded-[8px] text-sm outline-none transition-all text-slate-900 ${formErrors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/15'}`}
                  />
                  {formErrors.name && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-input" className="block text-xs font-bold uppercase text-gray-400 mb-2">
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
                    className={`w-full px-5 py-4 bg-white border rounded-[8px] text-sm outline-none transition-all text-slate-900 ${formErrors.email ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/15'}`}
                  />
                  {formErrors.email && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message-textarea" className="block text-xs font-bold uppercase text-gray-400 mb-2">
                  Your Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-[8px] text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/15 transition-all resize-none text-slate-900"
                />
              </div>

              {formErrors.submit && (
                <p className="text-red-500 font-bold text-xs" role="alert">{formErrors.submit}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-[8px] font-bold hover:bg-[#00E5FF] hover:text-slate-900 transition-all duration-300 shadow-sm active:scale-[0.98] border-none cursor-pointer flex justify-center items-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs rounded-[8px]" role="status">
                  Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>

          {/* Image Side */}
          <div className="hidden md:block h-[300px] md:h-auto md:w-[350px] lg:w-[450px] shrink-0 bg-slate-100 overflow-hidden">
            <img
              src="/students_kerala.png"
              alt="Kerala students in counseling session"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop';
              }}
            />
          </div>
        </div>
      </motion.section>
    </>
  );
}
