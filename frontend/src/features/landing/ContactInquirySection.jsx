import React, { useState } from 'react';
import ApiService from '../../shared/services/api';
import { toast } from 'react-hot-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import greenTexture from '../../assets/clarity_bg.png';

export default function ContactInquirySection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
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
      className="relative min-h-[85vh] w-full flex items-center justify-center py-20 px-4 sm:px-8 lg:px-16 overflow-hidden text-[#0f172a] bg-transparent"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      {/* Background Overlay */}

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center space-y-12">
        
        {/* Header Title */}
        <h2 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-widest text-[#0f172a] uppercase drop-shadow-md">
          WANT TO KNOW MORE
        </h2>

        {submitted ? (
          <div className="bg-white/20 backdrop-blur-md border-2 border-[#0f172a]/20 rounded-xl p-10 max-w-xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto" />
            <h3 className="font-['Cormorant_Garamond',serif] text-3xl font-bold text-[#0f172a]">
              Message Received
            </h3>
            <p className="text-sm text-[#0f172a]/90 font-light leading-relaxed">
              Thank you for connecting with us. Our care team will get back to you via email very soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 bg-[#f3fbd9] hover:bg-white text-[#729754] font-bold text-xs px-6 py-2.5 rounded-full transition shadow-md"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-6 sm:space-y-8">
            
            {/* ROW 1: NAME & MAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* NAME Container Pill */}
              <div className="border-2 border-[#0f172a]/20 rounded-xl p-3 sm:p-4 bg-white/10 backdrop-blur-xs flex items-center gap-4 shadow-lg hover:border-[#0f172a]/40 transition">
                <span className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold tracking-wider text-[#0f172a] shrink-0 pl-3 uppercase">
                  NAME
                </span>
                <div className="flex-1 bg-white/20 border border-[#0f172a]/20 rounded-full px-4 py-2 sm:py-2.5">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name..."
                    className="w-full bg-transparent text-[#0f172a] placeholder-[#0f172a]/50 text-sm sm:text-base font-light focus:outline-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* MAIL Container Pill */}
              <div className="border-2 border-[#0f172a]/20 rounded-xl p-3 sm:p-4 bg-white/10 backdrop-blur-xs flex items-center gap-4 shadow-lg hover:border-[#0f172a]/40 transition">
                <span className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold tracking-wider text-[#0f172a] shrink-0 pl-3 uppercase">
                  MAIL
                </span>
                <div className="flex-1 bg-white/20 border border-[#0f172a]/20 rounded-full px-4 py-2 sm:py-2.5">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email..."
                    className="w-full bg-transparent text-[#0f172a] placeholder-[#0f172a]/50 text-sm sm:text-base font-light focus:outline-none"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

            </div>

            {/* ROW 2: YOUR MESSAGE Container Pill */}
            <div className="border-2 border-[#0f172a]/20 rounded-xl p-3 sm:p-4 bg-white/10 backdrop-blur-xs flex items-start gap-4 shadow-lg hover:border-[#0f172a]/40 transition">
              <span className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold tracking-wider text-[#0f172a] shrink-0 pl-3 pt-2 sm:pt-3 uppercase">
                YOUR MESSAGE
              </span>
              <div className="flex-1 bg-white/20 border border-[#0f172a]/20 rounded-2xl px-5 py-3 sm:py-4">
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full bg-transparent text-[#0f172a] placeholder-[#0f172a]/50 text-sm sm:text-base font-light focus:outline-none resize-none"
                  disabled={loading}
                  required
                ></textarea>
              </div>
            </div>

            {/* ROW 3: LETS CONNECT Pale Yellow Pill Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#f3fbd9] hover:bg-white active:scale-95 transition-all duration-300 text-[#6a904d] font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-sm sm:text-base font-bold uppercase tracking-wider px-10 py-3.5 rounded-full shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#6a904d] border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    <span>LETS CONNECT</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </section>
  );
}
