import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Copy, AlertCircle, ArrowRight, FlaskConical } from 'lucide-react';
import ApiService from '../../shared/services/api';
import SectionHeader from '../../shared/components/SectionHeader';

export default function CdatSection({ setView }) {
  const [settings, setSettings] = useState(null);
  const [groupRegName, setGroupRegName] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.name || '';
      }
    } catch (e) { }
    return '';
  });
  const [groupRegPhone, setGroupRegPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.phone || '';
      }
    } catch (e) { }
    return '';
  });
  const [groupRegEmail, setGroupRegEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.email || '';
      }
    } catch (e) { }
    return '';
  });

  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [errors, setErrors] = useState({ name: '', phone: '', email: '' });
  const [fetchedGroupCode, setFetchedGroupCode] = useState('cdat@behold');

  useEffect(() => {
    ApiService.getSettings()
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
          if (data.data.cdatGroupCode) {
            setFetchedGroupCode(data.data.cdatGroupCode);
          }
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const handleNameChange = (val) => {
    setGroupRegName(val);
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };
  const handlePhoneChange = (val) => {
    setGroupRegPhone(val);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };
  const handleEmailChange = (val) => {
    setGroupRegEmail(val);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handleGenerateCode = (e) => {
    e.preventDefault();
    const newErrors = { name: '', phone: '', email: '' };
    let hasErr = false;
    if (!groupRegName.trim()) { newErrors.name = "Full Name is required."; hasErr = true; }
    if (!groupRegPhone.trim()) {
      newErrors.phone = "Phone Number is required."; hasErr = true;
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(groupRegPhone.trim())) {
        newErrors.phone = "Please enter a valid 10-digit phone number."; hasErr = true;
      }
    }
    if (!groupRegEmail.trim()) {
      newErrors.email = "Email Address is required."; hasErr = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(groupRegEmail.trim())) {
        newErrors.email = "Please enter a valid email address."; hasErr = true;
      }
    }
    setErrors(newErrors);
    if (hasErr) return;

    const HARDCODED_CODE = fetchedGroupCode;
    setGeneratedCode(HARDCODED_CODE);
    setHasCopied(false);
    const saved = localStorage.getItem('behold_student_profile');
    let profileData = {};
    if (saved) { try { profileData = JSON.parse(saved); } catch (err) { } }
    profileData.name = groupRegName.trim();
    profileData.phone = groupRegPhone.trim();
    profileData.email = groupRegEmail.trim();
    profileData.confirmEmail = groupRegEmail.trim();
    profileData.groupCode = HARDCODED_CODE;
    localStorage.setItem('behold_student_profile', JSON.stringify(profileData));
  };

  const copyManually = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopied(true);
        setHasCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleProceedWithCode = (code) => {
    window.spaNavigate?.('/sample-test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      id="cdat"
      className="relative bg-gradient-to-br from-neon-blue-soft to-neon-blue-deep text-white py-16 md:py-24 px-4 sm:px-6 md:px-12 overflow-hidden"
    >
      <div className="relative z-20 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* ── LEFT COLUMN: Info & Assessment Details ─────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            {/* Eyebrow */}
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#E4C87A] font-semibold flex items-center gap-2 before:content-[''] before:w-4 before:h-[1px] before:bg-current mb-4">
              Scientific Assessment
            </span>

            {/* Title and Partner */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-5">
              CIGI Differential Aptitude Test (C-DAT)
            </h2>

            {/* Description */}
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-8 max-w-[48ch]">
              Developed in partnership with CIGI, the C-DAT maps a student's natural strengths across reasoning, language, and numerical ability — giving every roadmap a foundation in real data, not guesswork.
            </p>

            {/* Partner Badge */}
            <div className="inline-flex items-center gap-2.5 border border-white/20 px-4 py-2.5 text-xs text-white/80 mb-8 hover:border-[#E4C87A] transition-colors rounded-[2px]">
              <span>Assessment partner —</span>
              <span className="font-serif text-[#E4C87A] font-bold">CIGI</span>
              <img
                src="/CIGI.png"
                alt="CIGI Logo"
                className="h-5 object-contain ml-1 brightness-0 invert"
              />
            </div>
          </div>

          {/* CTA */}
          <div>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 border border-white/40 hover:border-white text-white hover:bg-white/10 text-sm font-semibold rounded-[2px] transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>Try a Sample Test</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Registration Card ────────────────────────── */}
        <div
          id="cdat-form"
          className="lg:col-span-5 bg-white text-slate-900 p-8 sm:p-10 border-t-4 border-[#C89B3C] shadow-2xl rounded-[2px] flex flex-col justify-between"
        >
          <div>
            <h4 className="font-serif text-xl sm:text-2xl font-semibold text-neon-blue-deep mb-1.5">
              Register for the C-DAT
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              Fill in your details to generate your registration Group Code.
            </p>

            <form onSubmit={handleGenerateCode} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2" htmlFor="cdat-name">
                  Full Name
                </label>
                <input
                  id="cdat-name"
                  type="text"
                  placeholder="e.g. Devika S. Kumar"
                  value={groupRegName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full border bg-slate-50/50 focus:bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all rounded-[2px] ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-neon-blue-mid focus:ring-2 focus:ring-neon-blue-mid/10'}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2" htmlFor="cdat-phone">
                  Phone Number
                </label>
                <input
                  id="cdat-phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  value={groupRegPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full border bg-slate-50/50 focus:bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all rounded-[2px] ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-neon-blue-mid focus:ring-2 focus:ring-neon-blue-mid/10'}`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2" htmlFor="cdat-email">
                  Email Address
                </label>
                <input
                  id="cdat-email"
                  type="email"
                  placeholder="you@example.com"
                  value={groupRegEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full border bg-slate-50/50 focus:bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all rounded-[2px] ${errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-neon-blue-mid focus:ring-2 focus:ring-neon-blue-mid/10'}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Submit / Generated Code */}
              <div className="mt-4 pt-2">
                {!generatedCode ? (
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#C89B3C] hover:bg-[#E4C87A] text-neon-blue-deep font-semibold text-sm rounded-[2px] transition-all duration-300 cursor-pointer text-center shadow-md active:translate-y-[1px]"
                  >
                    Generate Group Code
                  </button>
                ) : (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    {/* Generated Code Display */}
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-[2px] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Your Group Code</span>
                        <span className="text-xl sm:text-2xl font-mono font-semibold text-neon-blue-deep block truncate tracking-wider" title={generatedCode}>
                          {generatedCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={copyManually}
                        className={`shrink-0 px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 rounded-[2px] border ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 hover:border-slate-900 text-slate-900'}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Proceed Button */}
                    <button
                      type="button"
                      onClick={() => handleProceedWithCode(generatedCode)}
                      className="w-full py-3.5 bg-neon-blue-mid hover:bg-neon-blue-deep text-white font-semibold text-sm rounded-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
                    >
                      Proceed with {generatedCode}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Try a Sample Test Instead Button */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-[10px] text-slate-400 uppercase tracking-widest before:content-[''] before:flex-1 before:h-[1px] before:bg-slate-200 after:content-[''] after:flex-1 after:h-[1px] after:bg-slate-200">
              or
            </div>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate?.('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3.5 border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-semibold text-sm rounded-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try a Sample Test Instead</span>
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
