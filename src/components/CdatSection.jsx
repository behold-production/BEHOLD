import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Copy } from 'lucide-react';

export default function CdatSection({ setView }) {
  const [groupRegName, setGroupRegName] = useState('');
  const [groupRegPhone, setGroupRegPhone] = useState('');
  const [groupRegEmail, setGroupRegEmail] = useState('');

  const [generatedCode, setGeneratedCode] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');

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
      setCopyMessage("⚠️ Please fill in all fields.");
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

    // Copy to clipboard
    navigator.clipboard.writeText(HARDCODED_CODE).then(() => {
      setCopyMessage("🎉 Code copied to clipboard! You can now register on CIGI.");
    }).catch(() => {
      setCopyMessage("🎉 Code generated! Please copy it manually.");
    });
  };

  const copyManually = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode).then(() => {
        setCopyMessage("🎉 Code copied to clipboard! You can now register on CIGI.");
      });
    }
  };

  return (
    <section id="cdat" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-black text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand/5 rounded-xl glow-glow pointer-events-none" />

      {/* CDAT CARD */}
      <div
        id="card-aptitude"
        className="card-luxury card-luxury-hover p-5 sm:p-8 md:p-14 flex flex-col justify-between space-y-8 select-none border border-black/5 group"
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <span className="text-[9px] bg-brand text-black px-3 py-1 rounded-xl uppercase tracking-widest font-black font-mono">
                scientific strengths mapping
              </span>
              <h3 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                CIGI Differential Aptitude Test (CDAT)
              </h3>
            </div>

            <button
              onClick={() => window.location.hash = '#/sample-test'}
              className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-sm text-center shrink-0 w-full md:w-auto"
            >
              Sample Test
            </button>
          </div>

          <p className="text-black/60 font-sans text-sm md:text-base font-light leading-relaxed max-w-4xl">
            BEHOLD’s aptitude assessments help students discover their natural strengths, learning styles, interests, and hidden talents through scientifically designed evaluation methods. The assessment provides clear insights into suitable academic and career paths, helping students make informed future decisions with confidence.
          </p>


        </div>

        <div className="pt-6 border-t border-black/[0.05]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-2">
              <h4 className="text-sm font-header font-black uppercase tracking-wider text-black">
                Registration & Group Code
              </h4>
              <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
                Enter your details below to generate your group access code. Once generated and copied, proceed to the CIGI registration portal to complete your registration.
              </p>
            </div>
            <div className="lg:col-span-7">
              <form onSubmit={handleGenerateCode} className="space-y-4 bg-white/50 border border-black/5 p-4 sm:p-5 rounded-xl">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-black/60 mb-2">
                  Generate Your Access Code
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={groupRegName}
                      onChange={(e) => setGroupRegName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black text-xs font-semibold placeholder-black/35 outline-none focus:border-brand transition"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={groupRegPhone}
                      onChange={(e) => setGroupRegPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black text-xs font-semibold placeholder-black/35 outline-none focus:border-brand transition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={groupRegEmail}
                      onChange={(e) => setGroupRegEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 text-black text-xs font-semibold placeholder-black/35 outline-none focus:border-brand transition"
                    />
                  </div>
                </div>

                {!generatedCode ? (
                  <div className="pt-1">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-brand hover:bg-brand-dark text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer shadow-xs border border-black/5 w-full sm:w-auto"
                    >
                      Generate Group Code
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 border border-brand/40 bg-brand/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-black/60 font-bold block mb-1">Your Group Code</span>
                        <span className="text-lg font-mono font-black tracking-widest text-black">{generatedCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={copyManually}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-black/10 hover:border-black rounded-xl text-[10px] uppercase font-bold transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </button>
                    </div>

                    <a
                      href="https://cigicareer.com/cdat-registration/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer shadow-md"
                    >
                      <span>Proceed to CIGI Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {copyMessage && (
                  <p className={`mt-2 text-[10px] font-bold uppercase tracking-wider font-mono ${copyMessage.includes('copied') || copyMessage.includes('generated') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {copyMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
