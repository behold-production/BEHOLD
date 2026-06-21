import React, { useState, useEffect } from 'react';
import { ArrowRight, Copy, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';

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

  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!groupRegName.trim() || !groupRegPhone.trim() || !groupRegEmail.trim()) {
      setCopyMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(groupRegEmail.trim())) {
      setCopyMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
    if (!phoneRegex.test(groupRegPhone.trim())) {
      setCopyMessage("Please enter a valid 10-digit phone number.");
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
        className="relative bg-white/70 backdrop-blur-2xl shadow-dark-blue-lg border-[1.5px] border-[#0b1424] p-6 sm:p-10 md:p-16 flex flex-col select-none group rounded-2xl sm:rounded-[2rem] transition-all duration-700 overflow-hidden"
      >
        {/* Decorative inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

        {/* TOP: CIGI Differential Aptitude Test (C-DAT) */}
        <div className="relative z-10 flex flex-col justify-between gap-6 text-left w-full">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs bg-brand/10 text-brand-dark border border-brand/20 px-3.5 py-1.5 rounded-full capitalize font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-dark animate-pulse"></span>
                Scientific Strengths Mapping
              </span>
            </div>
            
            {/* Flex container for Title and Logo opposite to each other */}
            <div className="flex flex-row items-center justify-between gap-6 w-full">
              <h3 className="text-xl sm:text-3xl md:text-4xl font-header font-black capitalize tracking-tight text-zinc-900 group-hover:text-brand-dark transition-colors duration-500 flex-1 min-w-0">
                CIGI Differential Aptitude Test <span className="whitespace-nowrap">(C-DAT)</span>
              </h3>
              <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 flex items-center justify-center shrink-0 pointer-events-none">
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
            <div className="lg:col-span-7 w-full relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-brand-accent/20 rounded-2xl sm:rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-700 hidden sm:block"></div>
              <form onSubmit={handleGenerateCode} className="relative space-y-5 bg-transparent sm:bg-white/80 backdrop-blur-none sm:backdrop-blur-2xl border-none sm:border-[1.5px] border-[#0b1424] shadow-none sm:shadow-dark-blue p-0 sm:p-8 rounded-none sm:rounded-2xl w-full">
                <div className="text-sm font-black capitalize text-zinc-800 mb-2 flex items-center gap-2">
                  Generate Your Group Code
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="cdat-name" className="sr-only">Full Name</label>
                    <input
                      id="cdat-name"
                      type="text"
                      placeholder="Full Name"
                      value={groupRegName}
                      onChange={(e) => setGroupRegName(e.target.value)}
                      className="w-full px-5 py-3.5 min-h-[48px] rounded-xl bg-zinc-50/50 backdrop-blur-sm border border-zinc-200/80 text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm hover:bg-zinc-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="cdat-phone" className="sr-only">Phone Number</label>
                    <input
                      id="cdat-phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={groupRegPhone}
                      onChange={(e) => setGroupRegPhone(e.target.value)}
                      className="w-full px-5 py-3.5 min-h-[48px] rounded-xl bg-zinc-50/50 backdrop-blur-sm border border-zinc-200/80 text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm hover:bg-zinc-50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="cdat-email" className="sr-only">Email Address</label>
                    <input
                      id="cdat-email"
                      type="email"
                      placeholder="Email Address"
                      value={groupRegEmail}
                      onChange={(e) => setGroupRegEmail(e.target.value)}
                      className="w-full px-5 py-3.5 min-h-[48px] rounded-xl bg-zinc-50/50 backdrop-blur-sm border border-zinc-200/80 text-zinc-900 text-sm font-semibold placeholder-zinc-400 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm hover:bg-zinc-50"
                    />
                  </div>
                </div>

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
                  <div className="pt-2 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-5 border border-brand/20 bg-gradient-to-r from-brand-light/50 to-brand-light/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner text-center sm:text-left">
                      <div className="w-full sm:w-auto">
                        <span className="text-xs uppercase tracking-widest text-brand-dark/60 font-black block mb-1">Your Group Code</span>
                        <span className="text-2xl font-black text-zinc-900 tracking-tight">{generatedCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyManually}
                        className={`min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer shadow-sm ${copied
                          ? 'bg-rose-500 border-rose-500 text-white shadow-rose-500/25'
                          : 'bg-white border-zinc-200 hover:border-brand/30 hover:bg-brand/5 text-zinc-900 hover:text-brand-dark'
                          }`}
                      >
                        {copied ? (
                          <>
                            <span className="animate-in fade-in">Copied Successfully!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy Group Code
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={!hasCopied}
                      onClick={() => {
                        if (hasCopied) {
                          window.open("https://cigicareer.com/cdat-registration/", "_blank", "noopener,noreferrer");
                        }
                      }}
                      className={`relative overflow-hidden min-h-[52px] flex items-center justify-center gap-2 w-full px-8 py-3.5 font-bold text-sm tracking-wide rounded-xl transition-all duration-300 shadow-lg ${hasCopied
                        ? 'bg-brand text-zinc-950 cursor-pointer border-none hover:scale-[1.01] hover:shadow-brand/20 active:scale-100'
                        : 'bg-zinc-100/50 text-zinc-400 cursor-not-allowed border border-zinc-200 shadow-none'
                        }`}
                    >
                      {hasCopied && <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>}
                      <span className={`relative z-10 ${hasCopied ? 'text-zinc-950' : 'text-zinc-400'}`}>Proceed to Official Registration</span>
                    </button>
                    {!hasCopied && (
                      <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/60 text-amber-800 text-sm rounded-xl flex items-start sm:items-center gap-2.5 text-left animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm backdrop-blur-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-amber-600" />
                        <span className="font-semibold leading-relaxed">Please enter your group id on the dedicated column without fail.</span>
                      </div>
                    )}
                  </div>
                )}

                {copyMessage && (
                  <p
                    className={`mt-2 text-xs font-bold text-center sm:text-left ${
                      isError 
                        ? 'text-rose-650' 
                        : copyMessage.includes('copied') 
                          ? 'text-emerald-650' 
                          : 'text-amber-600'
                    }`}
                    role={isError ? 'alert' : 'status'}
                  >
                    {copyMessage}
                  </p>
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
