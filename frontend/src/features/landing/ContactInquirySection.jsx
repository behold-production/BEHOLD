import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Clock, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import ApiService from '../../services/api';
import { trackContact, trackLead, setMetaUserData } from '../../utils/metaPixel';

const getFirstText = (...values) => values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';

export default function ContactInquirySection({ siteSettings = {}, onOpenBooking }) {
  const settings = siteSettings || {};
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const eyebrow = getFirstText(settings.inquirySectionSub, 'Get in touch');
  const heading = getFirstText(settings.inquirySectionTitle, 'Need Assistance?');
  const description = getFirstText(
    settings.inquirySectionDesc,
    'Whether you have a question or need help choosing the right psychologist, our care team will guide you within 24 hours.'
  );

  const phone = getFirstText(settings.contactPhone);
  const email = getFirstText(settings.contactEmail);
  const openHours = getFirstText(settings.openHours);
  const bookingCta = getFirstText(settings.heroBtnText, settings.counselBtnText, 'Book a Consultation');

  const whatsappHref = (() => {
    const input = settings.whatsapp;
    if (!input || input === '#' || input === false || input === 'disabled') return null;
    const str = String(input).trim();
    if (str.startsWith('http')) return str;
    const digits = str.replace(/\D/g, '');
    if (digits.length === 10) return `https://wa.me/91${digits}`;
    if (digits.length > 10) return `https://wa.me/${digits}`;
    return null;
  })();

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
        grade: 'General Inquiry',
      });

      // Update user match data & track Meta conversion events
      setMetaUserData({
        em: formData.email,
        fn: formData.name,
      });
      trackLead({
        content_name: 'General Contact Inquiry',
        content_category: 'Contact Form',
      });
      trackContact({
        method: 'inquiry_form',
        source: 'contact_section',
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

  const handleBookingCta = () => {
    if (typeof onOpenBooking === 'function') {
      onOpenBooking();
      return;
    }
    window.spaNavigate?.('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="inquiry" className="relative w-full overflow-hidden bg-[#0E1111] py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-[340px] w-[340px] rounded-full bg-[#0E7490]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-[280px] w-[280px] rounded-full bg-[#06B6D4]/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* Copy + contact details */}
        <div className="text-white">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7DD3E0]">
            <span aria-hidden="true" className="h-[1px] w-6 bg-[#7DD3E0]/60" />
            {eyebrow}
          </span>

          <h2 className="mt-3 text-[24px] font-semibold leading-[1.18] tracking-tight sm:text-[30px] md:text-[34px]">
            {heading}
          </h2>

          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/70 sm:text-sm">
            {description}
          </p>

          <ul className="mt-7 space-y-3">
            {phone && (
              <li>
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-3 text-sm text-white/90 no-underline transition-colors hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3E0]">
                    <Phone className="h-4 w-4" />
                  </span>
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-3 text-sm text-white/90 no-underline transition-colors hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3E0]">
                    <Mail className="h-4 w-4" />
                  </span>
                  {email}
                </a>
              </li>
            )}
            {whatsappHref && (
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-white/90 no-underline transition-colors hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#7DD3E0]">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  Chat on WhatsApp
                </a>
              </li>
            )}
            {openHours && (
              <li className="inline-flex items-start gap-3 text-[12.5px] leading-relaxed text-white/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#7DD3E0]">
                  <Clock className="h-4 w-4" />
                </span>
                {openHours}
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={handleBookingCta}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0E7490] px-6 py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0B5C73] cursor-pointer border-none sm:text-[13px]"
          >
            {bookingCta}
          </button>
        </div>

        {/* Inquiry form */}
        <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.8)] sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <h3 className="text-xl font-semibold text-[#0E1111]">Message received</h3>
              <p className="max-w-xs text-xs leading-relaxed text-[#55605F]">
                Thank you for reaching out. A member of our care team will contact you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-5 py-2.5 text-xs font-semibold text-[#0E1111] transition-colors hover:border-[#0E7490] hover:text-[#0B5C73] cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-semibold text-[#0E1111]">
                  Full Name <span className="text-[#0E7490]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-4 py-2.5 text-[13px] text-[#0E1111] outline-none transition-colors placeholder:text-[#9AA5A2] focus:border-[#0E7490] focus:bg-white"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-semibold text-[#0E1111]">
                  Email Address <span className="text-[#0E7490]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-4 py-2.5 text-[13px] text-[#0E1111] outline-none transition-colors placeholder:text-[#9AA5A2] focus:border-[#0E7490] focus:bg-white"
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-semibold text-[#0E1111]">
                  Message <span className="text-[#0E7490]">*</span>
                </label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can support you"
                  className="w-full resize-none rounded-lg border border-[#E6DFD0] bg-[#FBF8F1] px-4 py-2.5 text-[13px] text-[#0E1111] outline-none transition-colors placeholder:text-[#9AA5A2] focus:border-[#0E7490] focus:bg-white"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0E7490] py-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#0B5C73] disabled:opacity-50 cursor-pointer border-none sm:text-[13px]"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
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
