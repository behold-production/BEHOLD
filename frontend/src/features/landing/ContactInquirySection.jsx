import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import ApiService from '../../services/api';

export default function ContactInquirySection() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      setErrorMsg('Please fill in all required fields.');
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    try {
      const res = await ApiService.submitInquiry(formData);
      if (res?.success) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(res?.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.warn(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section id="inquiry" className="relative w-full py-24 sm:py-32 px-6 overflow-hidden font-sans bg-slate-50 border-t border-slate-100">
      
      {/* Decorative background glows */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[#00e5ff] rounded-full filter blur-[120px] opacity-[0.05] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-[#00e5ff] rounded-full filter blur-[150px] opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Info Panel */}
          <div className="lg:w-[40%] bg-slate-900 p-10 sm:p-16 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff] rounded-full filter blur-[80px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Get in <span className="text-[#00e5ff]">Touch.</span>
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Have questions about our services, booking process, or anything else? We'd love to hear from you.
              </p>
            </div>

            <div className="relative z-10 mt-12 lg:mt-24 space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[#00e5ff] group-hover:bg-[#00e5ff] group-hover:text-slate-900 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="font-bold">+91 99999 99999</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[#00e5ff] group-hover:bg-[#00e5ff] group-hover:text-slate-900 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Us</p>
                  <p className="font-bold">hello@behold.co.in</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-[#00e5ff] group-hover:bg-[#00e5ff] group-hover:text-slate-900 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="font-bold">Kochi, Kerala, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:w-[60%] p-10 sm:p-16">
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/30">
                  <CheckCircle2 className="w-10 h-10 text-[#00e5ff]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 font-medium">Thank you for reaching out. Our team will get back to you shortly.</p>
                </div>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm font-bold text-[#00e5ff] hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col h-full animate-fade-in">
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                      <input 
                        type="text" name="name" required
                        value={formData.name} onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
                      <input 
                        type="tel" name="phone" required
                        value={formData.phone} onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Message *</label>
                    <textarea 
                      name="message" required rows={4}
                      value={formData.message} onChange={handleChange}
                      placeholder="How can we help you today?"
                      className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/20 transition-all font-medium resize-none"
                    />
                  </div>
                  
                  {status === 'error' && (
                    <p className="text-sm font-semibold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {errorMsg}
                    </p>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-end">
                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 bg-[#00e5ff] hover:bg-[#00b2be] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(0,229,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,229,255,0.23)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                    {!status && <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
