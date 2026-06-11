import React, { useState, useEffect } from 'react';
import { ArrowRight, Copy } from 'lucide-react';

export default function CdatSection({ setView }) {
  const [groupRegName, setGroupRegName] = useState('');
  const [groupRegPhone, setGroupRegPhone] = useState('');
  const [groupRegEmail, setGroupRegEmail] = useState('');

  const [generatedCode, setGeneratedCode] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-fill from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('behold_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setGroupRegName(parsed.name);
        if (parsed.phone) setGroupRegPhone(parsed.phone);
        if (parsed.email) setGroupRegEmail(parsed.email);
      } catch (e) {
        console.error("Error reading student profile", e);
      }
    }
  }, []);

  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!groupRegName.trim() || !groupRegPhone.trim() || !groupRegEmail.trim()) {
      setCopyMessage("Please fill in all fields.");
      return;
    }

    const HARDCODED_CODE = "BEHOLD-CDAT-2026";
    setGeneratedCode(HARDCODED_CODE);

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

    setCopyMessage("Code generated! Please copy the code below to proceed.");
  };

  const copyManually = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopyMessage("Code copied to clipboard! You can now register on CIGI.");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <section id="cdat" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-zinc-900 text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-lg glow-glow pointer-events-none" />

      {/* CDAT CARD */}
      {/* CDAT CARD */}
      <div
        id="card-aptitude"
        className="card-luxury card-luxury-hover p-5 sm:p-8 md:p-14 flex flex-col space-y-8 select-none border border-zinc-200/60 group rounded-lg"
      >
        {/* TOP: CIGI Differential Aptitude Test (CDAT) */}
        <div className="space-y-3 max-w-4xl text-left">
          <span className="inline-block text-[9px] bg-zinc-100 text-zinc-550 border border-zinc-200 px-3 py-1 rounded-md uppercase tracking-widest font-extrabold font-mono">
            scientific strengths mapping
          </span>
          <h3 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-zinc-900 mt-1 group-hover:text-brand transition-colors duration-500">
            CIGI Differential Aptitude Test (CDAT)
          </h3>
          <p className="text-zinc-650 font-sans text-sm md:text-base font-light leading-relaxed">
            C-DAT (CIGI-Differential Aptitude Test). This standardized tool effectively identifies the inherent capacities of high school and higher secondary students. C-DAT has guided many students from various states in India and abroad towards suitable academic and career paths.
          </p>
        </div>

        {/* MIDDLE: Registration & Group Code */}
        <div className="pt-6 border-t border-zinc-200 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <span className="inline-block text-[9px] bg-brand-light text-brand-dark px-3 py-1 rounded-md uppercase tracking-widest font-extrabold border border-brand/20">
                school & institution access
              </span>
              <h4 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-zinc-900 mt-1">
                Registration & Group Code
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            <div className="lg:col-span-5 space-y-2">
              <p className="text-zinc-650 font-sans text-sm md:text-base font-light leading-relaxed">
                Enter your details below to generate your group access code. Once generated and copied, proceed to the CIGI registration portal to complete your registration.
              </p>
            </div>
            <div className="lg:col-span-7 w-full">
              <form onSubmit={handleGenerateCode} className="space-y-4 bg-white/40 backdrop-blur-md border border-zinc-200/50 p-4 sm:p-5 rounded-lg w-full">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-2">
                  Generate Your Access Code
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
                      className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold placeholder-zinc-400 outline-none focus:border-brand transition"
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
                      className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold placeholder-zinc-400 outline-none focus:border-brand transition"
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
                      className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold placeholder-zinc-400 outline-none focus:border-brand transition"
                    />
                  </div>
                </div>

                {!generatedCode ? (
                  <div className="pt-1">
                    <button
                      type="submit"
                      className="min-h-[48px] px-6 py-3 bg-gradient-brand hover:opacity-95 text-zinc-955 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer shadow-sm border-none w-full sm:w-auto"
                    >
                      Generate Group Code
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 border border-brand/20 bg-brand-light rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-dark/70 font-bold block mb-1">Your Group Code</span>
                        <span className="text-lg font-mono font-black tracking-widest text-brand-dark">{generatedCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyManually}
                        className={`min-h-[40px] flex items-center justify-center gap-1.5 px-4 py-2 border rounded-lg text-[10px] uppercase font-bold transition cursor-pointer ${copied
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : 'bg-white border-zinc-200 hover:border-zinc-900 text-zinc-900'
                          }`}
                      >
                        {copied ? (
                          <>
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Code
                          </>
                        )}
                      </button>
                    </div>

                    <a
                      href="https://cigicareer.com/cdat-registration/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition cursor-pointer shadow-md"
                    >
                      <span>Proceed to CIGI Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {copyMessage && (
                  <p
                    className={`mt-2 text-[11px] font-bold uppercase tracking-wider font-mono ${copyMessage.includes('copied') || copyMessage.includes('generated') ? 'text-emerald-600' : 'text-rose-600'}`}
                    role={copyMessage.includes('Please') ? 'alert' : 'status'}
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
            <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wide block">
              Try a demo of our scientific assessment
            </span>
            <p className="text-xs text-zinc-550 font-light leading-relaxed">
              Experience the type of questions asked in the C-DAT exam with our simplified sample test.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.spaNavigate('/sample-test')}
            className="min-h-[48px] px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition cursor-pointer shadow-sm text-center shrink-0 w-full sm:w-auto flex items-center justify-center border-none"
          >
            Sample Test
          </button>
        </div>
      </div>
    </section>
  );
}
