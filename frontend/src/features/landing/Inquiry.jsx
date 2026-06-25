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
    <div className="text-zinc-900 text-left">
      {/* 3. CALL TO ACTION BLOCK WITH INQUIRY FORM */}
      <section id="inquiry" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl sm:rounded-[2rem] overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center border-neon-glow border-neon-glow-hover">
          <div className="p-5 sm:p-8 md:p-12 space-y-6">
            <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-xs bg-brand-light text-brand-dark border border-brand/20 px-3.5 py-1 rounded-md capitalize  font-semibold w-fit block">
                get in touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-header capitalize leading-tight">Want to Know More</h2>
              <p className="text-zinc-600 font-light text-xs sm:text-sm max-w-sm font-sans">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>

            {testProfile && (
              <div className="p-4 bg-brand-light border border-brand/20 text-brand-dark rounded-lg text-xs font-semibold flex items-center gap-2">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name-input" className="font-bold text-zinc-500 capitalize tracking-wide text-xs">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    autoComplete="name"
                    className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-sm outline-none transition text-zinc-900 ${
                      formErrors.name
                        ? 'border border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                        : 'bg-white border border-zinc-200 focus:border-brand'
                    }`}
                  />
                  {formErrors.name && <p className="text-rose-500 font-bold text-xs mt-0.5" role="alert">{formErrors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="email-input" className="font-bold text-zinc-500 capitalize tracking-wide text-xs">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-sm outline-none transition text-zinc-900 ${
                      formErrors.email
                        ? 'border border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                        : 'bg-white border border-zinc-200 focus:border-brand'
                    }`}
                  />
                  {formErrors.email && <p className="text-rose-500 font-bold text-xs mt-0.5" role="alert">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="message-textarea" className="font-bold text-zinc-500 capitalize tracking-wide text-xs">Your Message</label>
                <textarea
                  rows={7}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-brand transition resize-none text-zinc-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[48px] w-full py-3 bg-gradient-brand hover:opacity-95 text-zinc-955 font-bold text-xs capitalize  rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-brand/20 border-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-955" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Request</span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center font-bold text-xs" role="status">
                  Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>

          <div className="h-full min-h-[320px] bg-zinc-150 hidden md:block">
            <img src="/students_kerala.png" alt="Kerala students learning" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 4. Stay Informed & Community */}
      <section className="max-w-xl mx-auto text-center px-4 sm:px-6 py-10 lg:py-16 space-y-6 flex flex-col items-center">
        <span className="text-xs bg-zinc-900 text-white px-3.5 py-1 rounded-md capitalize  font-semibold w-fit block">
          Stay Informed
        </span>
        
        {/* Load site settings dynamically */}
        {(() => {
          const settings = siteSettings || {};
          const whatsappUrl = settings.whatsapp || "https://wa.me/919497174011";
          const emailAddr = settings.contactEmail || "support@behold.com";
          return (
            <div className="pt-2 space-y-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[48px] text-xs font-bold capitalize  text-zinc-900 hover:text-white transition flex items-center gap-1.5 border border-zinc-200 px-6 py-3.5 rounded-lg bg-white hover:bg-zinc-900 justify-center"
              >
                <span>Connect with Our Community</span>
              </a>
              <p className="text-xs text-zinc-500 font-bold capitalize ">
                Or email us directly at: <a href={`mailto:${emailAddr}`} className="text-zinc-900 underline hover:text-brand transition break-all">{emailAddr}</a>
              </p>
            </div>
          );
        })()}
      </section>

    </div>
  );
}
