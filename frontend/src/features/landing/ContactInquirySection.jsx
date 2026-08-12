import React, { useState } from 'react';
import ApiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';

export default function ContactInquirySection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    setLoading(true);
    try {
      await ApiService.submitInquiry({
        studentName: formData.name,
        email: formData.email,
        comments: formData.message,
        phone: 'Not provided',
        grade: 'General Inquiry'
      });
      setSubmitted(true);
      toast.success('Thank you! We will reach out to you shortly.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Failed to submit contact inquiry', err);
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section
      id="inquiry"
      className="relative w-full flex items-center justify-center py-20 sm:py-28 px-4 sm:px-8"
    >
      {/* Background Image with smooth mask-image fade (no cutout lines) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={greyGreenBg}
          alt=""
          className="w-full h-full object-cover object-center opacity-55 [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]"
        />
      </div>
      <div className="relative z-10 w-full max-w-xl mx-auto reveal-on-scroll reveal-scale-in">

        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-[#00c9d6] block mb-2">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-sans">
            Want to Know More<span className="text-[#00c9d6]">.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            Have questions about psychological care or career mentoring? Send us a message and we'll reach out within 24 hours.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-9">

          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-sans">
                Message Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                Thank you for reaching out. Our counseling coordinator will contact you via email shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 bg-[#00c9d6] hover:bg-[#00b2be] text-slate-900 font-semibold text-xs px-6 py-3 rounded-full transition-all cursor-pointer shadow-xs border-none"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Name */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:bg-white focus:ring-4 focus:ring-[#00c9d6]/10 transition-all font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:bg-white focus:ring-4 focus:ring-[#00c9d6]/10 transition-all font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:bg-white focus:ring-4 focus:ring-[#00c9d6]/10 transition-all resize-none font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00c9d6] hover:bg-[#00b2be] text-slate-950 font-semibold text-sm py-3.5 rounded-full shadow-md hover-scale-btn transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border-none mt-1"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Let's Connect</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </div>
    </section>
  );
}
