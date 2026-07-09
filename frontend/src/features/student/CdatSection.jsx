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

  return (
    <motion.section
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      id="cdat"
      className="relative py-8 md:py-16 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto mb-10 text-center relative z-20">
        <SectionHeader
          subtitle={settings?.aptitudeSectionSub || "CDAT APTITUDE ASSESSMENT"}
          title={settings?.aptitudeSectionTitle || "Register your Aptitude Test"}
          description={settings?.aptitudeSectionDesc || "Identify your potential with scientific, standardized career assessments."}
          align="center"
        />
      </div>
      <div className="relative z-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col lg:flex-row"
        >
          {/* ── LEFT COLUMN: Info & Assessment Details ─────────────────────────── */}
          <div className="p-8 sm:p-12 lg:w-7/12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
            <div>
              {/* Badge */}
              <div className="mb-6">
                <span className="inline-block text-[11px] font-black text-[#008899] bg-[#00E5FF]/10 border border-[#00E5FF]/40 px-3.5 py-1.5 rounded-lg uppercase tracking-widest leading-none">
                  Aptitude Assessment
                </span>
              </div>

              {/* Title and CIGI Logo */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight font-header">
                  CIGI Differential Aptitude Test (C-DAT)
                </h2>
                <img
                  src="/CIGI.png"
                  alt="CIGI Logo"
                  className="h-12 sm:h-14 object-contain mix-blend-multiply shrink-0"
                />
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                C-DAT effectively identifies the inherent capacities of students, guiding them towards suitable academic and career paths with scientific precision.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => document.getElementById('cdat-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-slate-900 hover:bg-[#008899] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer border-none"
              >
                <span>CIGI Aptitude Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Generate Group Code Form ────────────────────────── */}
          <div
            id="cdat-form"
            className="p-8 sm:p-12 lg:w-5/12 bg-slate-50/70 flex flex-col justify-between"
          >
            {/* Form Header */}
            <div className="mb-6">
              <h3 className="font-black text-xl sm:text-2xl text-slate-900 font-header leading-tight mb-1">
                Generate Group Code
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Fill in your details to receive your CIGI group code.</p>
            </div>

            <form onSubmit={handleGenerateCode} className="space-y-4 flex-1 flex flex-col">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-name">
                  Full Name
                </label>
                <input
                  id="cdat-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={groupRegName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-[#008899]'}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-phone">
                  Phone Number
                </label>
                <input
                  id="cdat-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={groupRegPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-[#008899]'}`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-email">
                  Email Address
                </label>
                <input
                  id="cdat-email"
                  type="email"
                  placeholder="Enter your email"
                  value={groupRegEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-slate-200 focus:border-[#008899]'}`}
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
                    className="w-full py-3.5 bg-slate-900 hover:bg-[#008899] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none shadow-md active:scale-[0.98]"
                  >
                    Generate Code
                  </button>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    {/* Generated Code Display */}
                    <div className="p-4 bg-white border border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Your Group Code</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900 block truncate tracking-tight" title={generatedCode}>
                          {generatedCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={copyManually}
                        className={`shrink-0 px-3.5 py-2 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 rounded-lg border ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 hover:border-slate-900 text-slate-900'}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    {/* Proceed Button */}
                    <button
                      type="button"
                      onClick={() => handleProceedWithCode(generatedCode)}
                      className="w-full py-3.5 bg-[#008899] hover:bg-[#006b7a] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
                    >
                      Proceed with {generatedCode}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Try a Sample Test Button */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  window.spaNavigate?.('/sample-test');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Try a Sample Test</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
