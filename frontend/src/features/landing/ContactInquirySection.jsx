import React, { useState } from 'react';
import ApiService from '../../services/api';
import { toast } from 'react-hot-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import greyGreenBg from '../../assets/greygreen.png';
import { trackLead, trackContact, setMetaUserData } from '../../utils/metaPixel';

export default function ContactInquirySection({ siteSettings = {} }) {
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

      // Update user match data & track Meta conversion events
      setMetaUserData({
        em: formData.email,
        fn: formData.name
      });
      trackLead({
        content_name: 'General Contact Inquiry',
        content_category: 'Contact Form'
      });
      trackContact({
        method: 'inquiry_form',
        source: 'contact_section'
      });

      setSubmitted(true);
      toast.success('Thank you! We will reach out to you shortly.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) { //
      console.error('Failed to submit contact inquiry', err);
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section
      id="inquiry"
      className="relative w-full flex items-center justify-center py-20 sm:py-28 px-4 sm:px-8 scroll-mt-20 bg-[#fbf9f5]"
    >
      <div className="relative z-10 w-full max-w-xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-[#b85438] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase block mb-3">
            {siteSettings.inquirySectionSub || 'Get In Touch'}
          </span>
          <h2 className="font-serif-hero text-3xl sm:text-4xl md:text-5xl font-medium text-[#1c2826] tracking-tight leading-snug">
            {siteSettings.inquirySectionTitle || 'Connect With Our Care Team'}<span className="text-[#b85438]">.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5c6b66] mt-3 max-w-md mx-auto leading-relaxed">
            {siteSettings.inquirySectionDesc || "Have questions about psychological counselling or career mentoring? Send us a message and our care team will reach out within 24 hours."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-md border border-[#ede7de] shadow-sm p-6 sm:p-10">

          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-hero text-2xl font-medium text-[#1c2826]">Message Received</h3>
              <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed max-w-sm">
                Thank you for reaching out. A Behold clinical coordinator will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 bg-[#1c2826] hover:bg-[#b85438] text-white font-semibold text-xs px-6 py-3 rounded-md transition-all cursor-pointer shadow-xs border-none"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Name */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#1c2826]">
                  Full Name <span className="text-[#b85438]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-[#fbf9f5] border border-[#ede7de] rounded-md px-4 py-3 text-sm text-[#1c2826] placeholder-[#9ca8a4] outline-none focus:border-[#b85438] focus:bg-white focus:ring-2 focus:ring-[#b85438]/10 transition-all font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#1c2826]">
                  Email Address <span className="text-[#b85438]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-[#fbf9f5] border border-[#ede7de] rounded-md px-4 py-3 text-sm text-[#1c2826] placeholder-[#9ca8a4] outline-none focus:border-[#b85438] focus:bg-white focus:ring-2 focus:ring-[#b85438]/10 transition-all font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-[#1c2826]">
                  Message <span className="text-[#b85438]">*</span>
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you with psychological care or student mentorship?"
                  className="w-full bg-[#fbf9f5] border border-[#ede7de] rounded-md px-4 py-3 text-sm text-[#1c2826] placeholder-[#9ca8a4] outline-none focus:border-[#b85438] focus:bg-white focus:ring-2 focus:ring-[#b85438]/10 transition-all resize-none font-medium"
                  disabled={loading}
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1c2826] hover:bg-[#b85438] text-white font-semibold text-xs sm:text-sm py-3.5 rounded-md shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border-none mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Send Message</span>
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
