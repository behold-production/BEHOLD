import React, { useState, useEffect } from 'react';
import { ArrowRight, Copy, AlertCircle } from 'lucide-react';
import ApiService from '../../shared/services/api';

export default function CdatSection({ setView }) {
  const [groupRegName, setGroupRegName] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.name || '';
      }
    } catch (e) {}
    return '';
  });
  const [groupRegPhone, setGroupRegPhone] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.phone || '';
      }
    } catch (e) {}
    return '';
  });
  const [groupRegEmail, setGroupRegEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.email || '';
      }
    } catch (e) {}
    return '';
  });

  const [generatedCode, setGeneratedCode] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [errors, setErrors] = useState({ name: '', phone: '', email: '' });

  const [fetchedGroupCode, setFetchedGroupCode] = useState('cdat@behold');

  // Auto-fill from local storage if available
  useEffect(() => {
    // Fetch settings to get dynamic group code
    ApiService.getSettings()
      .then(data => {
        if (data.success && data.data && data.data.cdatGroupCode) {
          setFetchedGroupCode(data.data.cdatGroupCode);
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const handleNameChange = (val) => {
    setGroupRegName(val);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePhoneChange = (val) => {
    setGroupRegPhone(val);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleEmailChange = (val) => {
    setGroupRegEmail(val);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleGenerateCode = (e) => {
    e.preventDefault();
    const newErrors = { name: '', phone: '', email: '' };
    let hasErr = false;

    if (!groupRegName.trim()) {
      newErrors.name = "Full Name is required.";
      hasErr = true;
    }

    if (!groupRegPhone.trim()) {
      newErrors.phone = "Phone Number is required.";
      hasErr = true;
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(groupRegPhone.trim())) {
        newErrors.phone = "Please enter a valid 10-digit phone number.";
        hasErr = true;
      }
    }

    if (!groupRegEmail.trim()) {
      newErrors.email = "Email Address is required.";
      hasErr = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(groupRegEmail.trim())) {
        newErrors.email = "Please enter a valid email address.";
        hasErr = true;
      }
    }

    setErrors(newErrors);

    if (hasErr) {
      setCopyMessage("Please correct the errors in the form.");
      setIsError(true);
      return;
    }

    const HARDCODED_CODE = fetchedGroupCode;
    setGeneratedCode(HARDCODED_CODE);
    setHasCopied(false);

    // Save to local storage
    const saved = localStorage.getItem('behold_student_profile');
    let profileData = {};
    if (saved) {
      try {
        profileData = JSON.parse(saved);
      } catch (err) { }
    }
    profileData.name = groupRegName.trim();
    profileData.phone = groupRegPhone.trim();
    profileData.email = groupRegEmail.trim();
    profileData.confirmEmail = groupRegEmail.trim();
    profileData.groupCode = HARDCODED_CODE;
    localStorage.setItem('behold_student_profile', JSON.stringify(profileData));

    setCopyMessage("Action Required: Please copy your group code first to unlock the registration portal.");
    setIsError(false);
  };

  const copyManually = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopyMessage("Code copied to clipboard! You can now register on CIGI.");
        setIsError(false);
        setCopied(true);
        setHasCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <section id="cdat" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12 text-zinc-900 text-left relative">
      {/* High-End Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply" />

      {/* CDAT CARD */}
      <div
        id="card-aptitude"
        className="relative bg-white/70 backdrop-blur-2xl border-neon-glow border-neon-glow-hover p-5 sm:p-8 md:p-10 flex flex-col select-none group rounded-2xl sm:rounded-[2rem] transition-all duration-700 overflow-hidden"
      >
        {/* Decorative inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

        {/* TOP: CIGI Differential Aptitude Test (C-DAT) */}
        <div className="relative z-10 flex flex-col justify-between gap-4 text-left w-full">
          <div className="space-y-3">

            
            {/* Flex container for Title and Logo opposite to each other */}
            <div className="flex flex-row items-center justify-between gap-4 w-full">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-header font-black capitalize tracking-tight text-zinc-900 group-hover:text-brand-dark transition-colors duration-500 flex-1 min-w-0">
                CIGI Differential Aptitude Test <span className="whitespace-nowrap">(C-DAT)</span>
              </h3>
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0 pointer-events-none">
                <img
                  src="/CIGI.png"
                  alt="CIGI Differential Aptitude Test (C-DAT) Logo"
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Paragraph below title & logo */}
            <p className="text-zinc-650 font-sans text-sm md:text-base font-medium leading-relaxed max-w-4xl">
              C-DAT (CIGI-Differential Aptitude Test) effectively identifies the inherent capacities of students, guiding them towards suitable academic and career paths.
            </p>

            {/* Scroll navigation button to registration section */}
            <div className="pt-2 flex">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('registration-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl transition duration-300 cursor-pointer shadow-sm border-none"
              >
                CIGI Aptitude Test
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE: Registration & Group Code */}
        <div id="registration-section" className="relative z-10 pt-8 border-t border-zinc-200/80 space-y-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <span className="inline-block text-xs bg-zinc-900 text-white px-3 py-1.5 rounded-md capitalize font-bold tracking-wide shadow-md">
                School & Institution Access
              </span>
              <h4 className="text-lg sm:text-2xl font-header font-black capitalize tracking-tight text-zinc-900 mt-1">
                Registration & Group Code
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-2">
              <p className="text-zinc-600 font-sans text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                Enter your details to generate your group code. Then, proceed to the official CIGI portal to finalize registration.
              </p>
            </div>
            <div className="lg:col-span-7 w-full">
              <form onSubmit={handleGenerateCode} className="space-y-4 w-full text-left">
                <div className="text-sm font-black capitalize text-zinc-800 mb-2">
                  Generate Your Group Code
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  <div>
                    <label htmlFor="cdat-name" className="sr-only">Full Name</label>
                    <input
                      id="cdat-name"
                      type="text"
                      placeholder="Full Name"
                      value={groupRegName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`w-full px-5 py-3.5 min-h-[48px] rounded-xl border text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none transition-all shadow-sm ${
                        errors.name
                          ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                          : 'border-zinc-200/80 bg-zinc-50/50 focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-zinc-50'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cdat-phone" className="sr-only">Phone Number</label>
                    <input
                      id="cdat-phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={groupRegPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full px-5 py-3.5 min-h-[48px] rounded-xl border text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none transition-all shadow-sm ${
                        errors.phone
                          ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                          : 'border-zinc-200/80 bg-zinc-50/50 focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-zinc-50'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cdat-email" className="sr-only">Email Address</label>
                    <input
                      id="cdat-email"
                      type="email"
                      placeholder="Email Address"
                      value={groupRegEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={`w-full px-5 py-3.5 min-h-[48px] rounded-xl border text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none transition-all shadow-sm ${
                        errors.email
                          ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/10'
                          : 'border-zinc-200/80 bg-zinc-50/50 focus:border-brand focus:ring-4 focus:ring-brand/10 hover:bg-zinc-50'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {copyMessage && (
                  <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border flex items-start gap-2 ${
                    isError 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    <AlertCircle className={`w-4 h-4 shrink-0 ${isError ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <span>{copyMessage}</span>
                  </div>
                )}

                {!generatedCode ? (
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="min-h-[52px] px-4 sm:px-8 py-3.5 bg-gradient-brand hover:scale-[1.02] active:scale-[0.98] text-zinc-955 font-bold text-[13px] sm:text-sm tracking-wide rounded-xl transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto border-none whitespace-nowrap"
                    >
                      Generate Group Code for C-DAT
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                      {/* Group Code Display */}
                      <div className="flex-1 p-3 bg-brand-light border border-brand/20 rounded-xl flex items-center justify-between min-h-[48px]">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-brand-dark/70 font-bold block">Your Group Code</span>
                          <span className="text-lg font-bold text-zinc-900">{generatedCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={copyManually}
                          className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:border-brand/40 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Proceed button */}
                      <button
                        type="button"
                        onClick={() => {
                          window.open("https://cigicareer.com/cdat-registration/", "_blank", "noopener,noreferrer");
                        }}
                        className="px-6 min-h-[48px] bg-brand text-zinc-950 hover:bg-brand-dark font-bold text-sm rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 border-none shrink-0"
                      >
                        Proceed to Registration
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">
                      * Please copy this group code and enter it on the official CIGI portal during registration.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM: Sample Test */}
        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-450 capitalize tracking-wide block">
              Try a demo of our scientific assessment
            </span>
            <p className="text-xs text-zinc-550 font-light leading-relaxed">
              Experience the type of questions asked in the C-DAT exam with our simplified sample test.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.spaNavigate('/sample-test')}
            className="min-h-[48px] px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs capitalize  rounded-lg transition cursor-pointer shadow-sm text-center shrink-0 w-full sm:w-auto flex items-center justify-center border-none"
          >
            Sample Test
          </button>
        </div>
      </div>
    </section>
  );
}
