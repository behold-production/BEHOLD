import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Inquiry({ testProfile }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        email: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="text-zinc-900 text-left">
      {/* 3. CALL TO ACTION BLOCK WITH INQUIRY FORM */}
      <section id="inquiry" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center border border-zinc-200/60 shadow-xs">
          <div className="p-5 sm:p-8 md:p-12 space-y-6">
            <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[10px] bg-zinc-900 text-white px-3.5 py-1 rounded-md uppercase tracking-wider font-extrabold w-fit block">
                get in touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 font-header uppercase leading-tight">Want to Know More</h2>
              <p className="text-zinc-600 font-light text-xs sm:text-sm max-w-sm font-sans">
                Submit your request to align parents, students, and coordinators for assessments and counselling sessions.
              </p>
            </div>
            
            {testProfile && (
              <div className="p-4 bg-brand/10 border border-brand/40 text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                Pre-filled with diagnostic test scores ({testProfile.dominantDomain} profile).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name-input" className="font-bold text-zinc-500 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    id="name-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Student Name"
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-brand transition text-zinc-900"
                  />
                  {formErrors.name && <p className="text-red-500 font-bold">{formErrors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="email-input" className="font-bold text-zinc-500 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-brand transition text-zinc-900"
                  />
                  {formErrors.email && <p className="text-red-500 font-bold">{formErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="message-textarea" className="font-bold text-zinc-500 uppercase tracking-wide">Your Message</label>
                <textarea
                  rows={4}
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
                className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-900 font-bold text-xs uppercase tracking-wider rounded-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-zinc-900/5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center font-bold text-xs">
                  ✓ Request sent successfully! Our coordinator will contact you shortly.
                </div>
              )}
            </form>
          </div>
          
          <div className="h-full min-h-[320px] bg-zinc-100 hidden md:block">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" alt="Students meeting" className="w-full h-full object-cover grayscale-[10%] contrast-[105%]" />
          </div>
        </div>
      </section>

      {/* 4. Stay Informed & Community */}
      <section className="max-w-xl mx-auto text-center px-4 sm:px-6 py-10 lg:py-16 space-y-6 flex flex-col items-center">
        <span className="text-[10px] bg-zinc-900 text-white px-3.5 py-1 rounded-md uppercase tracking-wider font-extrabold w-fit block">
          📢 Stay Informed
        </span>
        <div className="pt-2">
          <a 
            href="https://wa.me/919497174011" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-white transition flex items-center gap-1.5 border border-zinc-200 px-6 py-3.5 rounded-lg bg-white hover:bg-zinc-900"
          >
            <span>🔗 Connect with Our Community</span>
          </a>
        </div>
      </section>

    </div>
  );
}
