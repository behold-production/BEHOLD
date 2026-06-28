import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ApiService from '../../shared/services/api';

export default function Inquiry({ testProfile, siteSettings }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
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
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await ApiService.submitInquiry(
        formData.name.trim(),
        formData.email.trim(),
        formData.message.trim()
      );
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (err) {
      console.error("Failed to save inquiry", err);
      setFormErrors({ submit: err.message || "Failed to submit request" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-50">
      {/* 3. CALL TO ACTION BLOCK WITH INQUIRY FORM */}
      <section id="inquiry" className="py-10 md:py-20 px-6 max-w-7xl mx-auto">
        <div className="square-card p-0 flex flex-col md:flex-row overflow-hidden shadow-square-light bg-white border-surface-200">
          <div className="p-8 md:p-12 space-y-8 flex-1 border-b md:border-b-0 md:border-r border-surface-200">
            <div className="space-y-4 flex flex-col items-start text-left">
              <span className="inline-block bg-surface-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Get in touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-surface-900 uppercase leading-tight">Want to Know More</h2>
              <p className="text-slate-600 font-light text-sm max-w-md">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>

            {testProfile && (
              <div className="p-4 bg-brand/10 border-l-4 border-brand text-surface-900 text-xs font-semibold flex items-center gap-2">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    autoComplete="name"
                    className={`w-full px-4 py-3 bg-white border rounded-none text-sm outline-none transition-colors text-surface-900 ${
                      formErrors.name ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-brand'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-input" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3 bg-white border rounded-none text-sm outline-none transition-colors text-surface-900 ${
                      formErrors.email ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-brand'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message-textarea" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Message</label>
                <textarea
                  rows={5}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-4 py-3 bg-white border border-surface-200 rounded-none text-sm outline-none focus:border-brand transition-colors resize-none text-surface-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-surface-900" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Request</span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs uppercase tracking-wide" role="status">
                  Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>

          <div className="hidden md:block h-[300px] md:h-auto md:w-[350px] lg:w-[450px] shrink-0 bg-surface-200">
            <img src="/students_kerala.png" alt="Kerala students learning" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
          </div>
        </div>
      </section>

      {/* 4. Stay Informed & Community */}
      <section className="py-10 md:py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-8 flex flex-col items-center">
          <span className="inline-block bg-surface-900 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,229,255,1)]">
            Stay Informed
          </span>
          
          {/* Load site settings dynamically */}
          {(() => {
            const settings = siteSettings || {};
            const whatsappUrl = settings.whatsapp || "https://wa.me/919497174011";
            const emailAddr = settings.contactEmail || "support@behold.com";
            return (
              <div className="space-y-6 w-full max-w-md mx-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full flex items-center justify-center text-center"
                >
                  Connect with Our Community
                </a>
                <p className="text-sm md:text-base text-slate-600">
                  Or email us directly at: <br className="sm:hidden" /> <a href={`mailto:${emailAddr}`} className="text-surface-900 font-medium underline hover:text-brand transition-colors break-all mt-1 inline-block">{emailAddr}</a>
                </p>
              </div>
            );
          })()}
        </div>
      </section>

    </div>
  );
}
