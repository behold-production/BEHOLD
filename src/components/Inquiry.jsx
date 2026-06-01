import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Inquiry({ testProfile }) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    service: 'Career Guidance',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // If the user completed the test and was redirected here, pre-populate their profile
  useEffect(() => {
    if (testProfile) {
      const scoresString = Object.entries(testProfile.scores || {})
        .map(([cat, score]) => `${cat} ${score}%`)
        .join(', ');

      setFormData(prev => ({
        ...prev,
        service: 'Aptitude Test Booking',
        message: `I completed the online assessment! My dominant profile is: ${testProfile.dominantDomain}. Scores: ${scoresString}. I would like to book a detailed consultation.`
      }));
    }
  }, [testProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = "Full name must be at least 3 characters";
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile || !mobileRegex.test(formData.mobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        mobile: '',
        service: 'Career Guidance',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="text-black text-left">
      {/* 3. CALL TO ACTION BLOCK WITH INQUIRY FORM */}
      <section id="inquiry" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gray-50 rounded-[4px] overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center border border-gray-100 shadow-sm">
          <div className="p-5 md:p-12 space-y-6">
            <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-[4px] uppercase tracking-wider font-extrabold w-fit block">
                get in touch
              </span>
              <h2 className="text-3xl font-normal tracking-tight text-gray-900 font-header uppercase leading-tight">Want to Know More</h2>
              <p className="text-gray-500 font-light text-sm max-w-sm">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>
            
            {testProfile && (
              <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-[4px] text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name-input" className="font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition"
                  />
                  {formErrors.name && <p className="text-red-500 font-bold">{formErrors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="mobile-input" className="font-bold text-gray-500 uppercase tracking-wide">Mobile Number</label>
                  <input
                    required
                    type="tel"
                    name="mobile"
                    id="mobile-input"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-Digit Mobile"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition"
                  />
                  {formErrors.mobile && <p className="text-red-500 font-bold">{formErrors.mobile}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="service-select" className="font-bold text-gray-500 uppercase tracking-wide">Select Service</label>
                <select
                  name="service"
                  id="service-select"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition cursor-pointer"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Aptitude Test Booking">Aptitude Test Booking</option>
                  <option value="Psychology Support">Psychology Support</option>
                  <option value="School Collaboration">School Collaboration</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="message-textarea" className="font-bold text-gray-500 uppercase tracking-wide">Your Message</label>
                <textarea
                  rows={3}
                  name="message"
                  id="message-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Details regarding stream, class or queries..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-[4px] text-sm outline-none focus:border-brand transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-wider rounded-[4px] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Inquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-[4px] text-center font-bold text-xs">
                  ✓ Inquiry sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>
          
          <div className="h-full min-h-[320px] bg-gray-200 hidden md:block">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" alt="Students meeting" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER SIGNUP & COMMUNITY */}
      <section className="max-w-xl mx-auto text-center px-4 sm:px-6 py-10 lg:py-16 space-y-6 flex flex-col items-center">
        <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-[4px] uppercase tracking-wider font-extrabold w-fit block">
          Stay Informed
        </span>
        <h2 className="text-3xl font-normal tracking-tight text-gray-900 font-header uppercase leading-tight">
          Subscribe to Career Updates
        </h2>
        <div className="relative w-full max-w-md mx-auto pt-2">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full bg-transparent border-b border-gray-300 focus:border-brand py-3 px-1 text-sm outline-none transition text-center"
          />
          <button className="absolute right-1 bottom-3 text-gray-400 hover:text-brand transition cursor-pointer">
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4">
          <a 
            href="https://wa.me/919999999999" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-widest text-black hover:text-brand transition flex items-center gap-1.5"
          >
            <span>Connect with Our Community →</span>
          </a>
        </div>
      </section>

    </div>
  );
}
