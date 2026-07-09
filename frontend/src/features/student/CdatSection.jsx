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
      <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row gap-5 md:gap-10 items-stretch">

        {/* ── LEFT: Info Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 sm:p-8 flex-1 flex flex-col"
        >
          {/* Badge */}
          <div className="mb-4">
            <span className="inline-block text-[10px] font-black text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-[8px] uppercase tracking-widest leading-none">
              Aptitude Assessment
            </span>
          </div>

          {/* Title and Logo Opposite */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-surface-900 leading-tight font-header">
              CIGI Differential Aptitude Test (C-DAT)
            </h2>
            <img
              src="/CIGI.png"
              alt="CIGI Logo"
              className="h-12 sm:h-14 md:h-16 object-contain mix-blend-multiply shrink-0"
            />
          </div>

          {/* Description */}
          <p className="text-surface-600 text-sm sm:text-base leading-relaxed mb-6 flex-1">
            C-DAT effectively identifies the inherent capacities of students, guiding them towards suitable academic and career paths with scientific precision.
          </p>

          {/* CTA */}
          <button
            type="button"
            onClick={() => document.getElementById('cdat-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 self-start px-6 py-3.5 bg-slate-900 text-white font-bold text-sm rounded-[8px] hover:bg-slate-800 transition-colors cursor-pointer border-none shadow-xs w-full sm:w-auto"
          >
            CIGI Aptitude Test
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* ── RIGHT: Form Card ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.85, ease: "easeOut", delay: 0.1 }}
          id="cdat-form"
          className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4 sm:p-8 w-full md:w-[420px] lg:w-[460px] shrink-0 flex flex-col"
        >
          {/* Form Header */}
          <div className="mb-5">
            <h3 className="font-black text-xl sm:text-2xl text-surface-900 font-header leading-tight mb-1">
              Generate Group Code
            </h3>
            <p className="text-xs text-surface-500 font-medium">Fill in your details to receive your CIGI group code.</p>
          </div>

          <form onSubmit={handleGenerateCode} className="space-y-3.5 flex-1 flex flex-col">

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-name">
                Full Name
              </label>
              <input
                id="cdat-name"
                type="text"
                placeholder="Enter your full name"
                value={groupRegName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full bg-surface-50 border rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-surface-900 placeholder:text-surface-400 focus:outline-none transition-colors ${errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-surface-200 focus:border-slate-400 focus:bg-white'}`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-phone">
                Phone Number
              </label>
              <input
                id="cdat-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={groupRegPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full bg-surface-50 border rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-surface-900 placeholder:text-surface-400 focus:outline-none transition-colors ${errors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-surface-200 focus:border-slate-400 focus:bg-white'}`}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1.5 tracking-wide uppercase" htmlFor="cdat-email">
                Email Address
              </label>
              <input
                id="cdat-email"
                type="email"
                placeholder="Enter your email"
                value={groupRegEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full bg-surface-50 border rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-surface-900 placeholder:text-surface-400 focus:outline-none transition-colors ${errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-surface-200 focus:border-slate-400 focus:bg-white'}`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                </p>
              )}
            </div>

            {/* Submit / Generated Code */}
            <div className="mt-auto pt-1">
              {!generatedCode ? (
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-[8px] hover:bg-slate-800 transition-all cursor-pointer border-none shadow-xs active:scale-[0.98]"
                >
                  Generate Code
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {/* Generated Code Display */}
                  <div className="p-3.5 bg-white border border-slate-300 rounded-[8px] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-0.5">Your Group Code</span>
                      <span className="text-xl sm:text-2xl font-black text-surface-900 block truncate tracking-tight" title={generatedCode}>
                        {generatedCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyManually}
                      className={`shrink-0 px-3 py-2 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 rounded-[8px] border ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-surface-200 hover:border-surface-900 text-surface-900'}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* Proceed Button */}
                  <button
                    type="button"
                    onClick={() => window.open("https://cigicareer.com/cdat-registration/", "_blank", "noopener,noreferrer")}
                    className="w-full py-3 bg-surface-900 text-white font-bold text-sm rounded-[8px] hover:bg-surface-800 transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    Proceed to Portal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Sample Test Footer */}
          <div className="mt-4 pt-4 border-t border-surface-200">
            <button
              type="button"
              onClick={() => window.spaNavigate('/sample-test')}
              className="w-full py-2.5 bg-white border border-surface-200 text-surface-700 font-bold text-sm rounded-[8px] hover:bg-slate-50 hover:border-surface-300 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4 text-slate-700" />
              Try a Sample Test
            </button>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
