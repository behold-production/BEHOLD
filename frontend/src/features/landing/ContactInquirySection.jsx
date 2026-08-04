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
      <div className="relative z-10 w-full max-w-xl mx-auto">

        {/* Section Title */}
        <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold tracking-widest text-[#0f172a] uppercase text-center mb-10">
          Want to Know More
        </h2>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-9">

          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <CheckCircle2 className="w-12 h-12 text-[#00c9d6]" />
              <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#0f172a]">
                Message Received!
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Our team will get back to you via email very soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 bg-[#00c9d6] hover:bg-[#00b2be] text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-all active:scale-95"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/10 transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/10 transition-all"
                  disabled={loading}
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#00c9d6] focus:ring-2 focus:ring-[#00c9d6]/10 transition-all resize-none"
                  disabled={loading}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00f0ff] to-[#00c9d6] hover:opacity-90 active:scale-95 text-[#060e20] font-bold text-sm uppercase tracking-widest py-3.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#060e20] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
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
