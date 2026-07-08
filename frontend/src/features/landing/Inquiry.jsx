import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ApiService from '../../shared/services/api';
import SectionHeader from '../../shared/components/SectionHeader';

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
    <div className="bg-transparent">
      {/* 3. CALL TO ACTION BLOCK WITH INQUIRY FORM */}
      <motion.section
        id="inquiry"
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="py-8 md:py-14 px-6 max-w-7xl mx-auto"
      >
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,229,255,0.04)] border border-slate-200/60 flex flex-col md:flex-row transition-all duration-300">
          <div className="p-8 md:p-12 space-y-8 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="space-y-4 mb-4 flex flex-col items-start text-left">
              <SectionHeader
                subtitle="Get in touch"
                title="Want to Know More"
                description="Submit your request to align parents, students, and coordinators for assessments and counselling sessions."
                align="left"
              />
            </div>

            {testProfile && (
              <div className="p-4 bg-[#00E5FF]/10 border-l-4 border-[#00E5FF] text-slate-900 text-xs font-semibold flex items-center gap-2 rounded-r-lg">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name-input" className="block text-xs font-bold uppercase text-gray-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    autoComplete="name"
                    className={`w-full px-5 py-4 bg-white border rounded-2xl text-sm outline-none transition-all text-surface-900 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20'}`}
                  />
                  {formErrors.name && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email-input" className="block text-xs font-bold uppercase text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    autoComplete="email"
                    className={`w-full px-5 py-4 bg-white border rounded-2xl text-sm outline-none transition-all text-surface-900 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20'}`}
                  />
                  {formErrors.email && <p className="text-red-500 font-bold text-xs mt-1" role="alert">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message-textarea" className="block text-xs font-bold uppercase text-gray-400 mb-2">Your Message</label>
                <textarea
                  rows={5}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 transition-all resize-none text-surface-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F172A] text-white py-4 rounded-full font-bold hover:bg-[#00E5FF] hover:text-[#0F172A] transition-all duration-300 shadow-md hover:shadow-[#00E5FF]/10 active:scale-[0.98] border-none cursor-pointer flex justify-center items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white group-hover:text-slate-900" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Request</span>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-bold text-xs rounded-xl" role="status">
                  Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>

          <div className="hidden md:block h-[300px] md:h-auto md:w-[350px] lg:w-[450px] shrink-0 bg-surface-200">
            <img src="/students_kerala.png" alt="Kerala students learning" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
          </div>
        </div></motion.section>
    </div>
  );
}
