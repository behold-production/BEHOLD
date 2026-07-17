import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';
import { ScrollDot } from '../../shared/components/BrandDot';

export default function CdatSection({ setView, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

  // Defaults match admin panel values exactly
  const sectionTitle = settings.aptitudeSectionTitle || 'CIGI Differential Aptitude Test (C-DAT)';
  const sectionSub = settings.aptitudeSectionSub || 'Scientific Assessment';
  const sectionDesc = settings.aptitudeSectionDesc || "Developed in partnership with CIGI, the C-DAT maps a student's natural strengths across reasoning, language, and numerical ability — giving every roadmap a foundation in real data, not guesswork.";
  
  const [groupRegName, setGroupRegName] = useState('');
  const [groupRegPhone, setGroupRegPhone] = useState('');
  const [groupRegEmail, setGroupRegEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [errors, setErrors] = useState({});
  const [fetchedGroupCode, setFetchedGroupCode] = useState('cdat@behold');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    ApiService.getSettings()
      .then(data => { if (data.success && data.data?.cdatGroupCode) setFetchedGroupCode(data.data.cdatGroupCode); })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!groupRegName.trim()) newErrors.name = 'Required';
    if (!groupRegPhone.trim()) newErrors.phone = 'Required';
    if (!groupRegEmail.trim()) newErrors.email = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setGeneratedCode(fetchedGroupCode);
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const steps = [
    { icon: '🧠', label: 'Take the C-DAT Test', desc: 'Complete the scientifically designed assessment' },
    { icon: '📊', label: 'Get Your Results', desc: 'See your aptitude profile and strengths' },
    { icon: '🎯', label: 'Get Mentored', desc: 'Our experts build your personalised roadmap' },
  ];

  return (
    <section id="cdat" className="py-14 bg-gradient-to-br from-blue-50 via-sky-50/80 to-slate-50 border-y border-blue-100 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left: Info (7 cols) */}
          <div className="lg:col-span-7">
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#00A8FF] block mb-3">
              {sectionSub}
            </span>
            <h2 id="aptitude-title" className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight flex items-center flex-wrap gap-x-2">
              <span>{settings.aptitudeSectionTitle ? settings.aptitudeSectionTitle.replace(/\s*\(C-DAT\)$/i, '') : 'CIGI Differential Aptitude Test'}</span>
              <span className="inline">
                <span>(C-DAT)</span>
                <ScrollDot nextId="experts-title" label="Scroll to Meet Our Experts ↓" size="md" inlineText={true} />
              </span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-5 max-w-xl">
              {sectionDesc}
            </p>

            <div className="inline-flex items-center gap-2 bg-[#00A8FF]/10 border border-[#00A8FF]/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00A8FF] mb-6">
              Assessment partner — <strong className="text-gray-800">CIGI</strong>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-9 h-9 bg-[#00A8FF]/10 rounded-lg flex items-center justify-center text-lg shrink-0 border border-[#00A8FF]/20 text-[#00A8FF]">
                    {step.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{step.label}</div>
                    <div className="text-gray-500 text-xs">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
              className="px-6 py-3.5 bg-[#00A8FF] hover:bg-[#0090e0] text-white font-black rounded-lg transition border-none cursor-pointer shadow-md text-sm inline-flex items-center justify-center"
            >
              Try a Free Sample Test
            </button>
          </div>

          {/* Right: Registration Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-lg p-6 shadow-xl border border-gray-200">
            <h3 className="text-xl font-black text-gray-900 mb-1">Register for the C-DAT</h3>
            <p className="text-xs text-gray-500 mb-5">Fill in your details to generate your registration Group Code.</p>

            {!generatedCode ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text" placeholder="e.g. Devika S. Kumar"
                    value={groupRegName} onChange={e => setGroupRegName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition"
                  />
                  {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel" placeholder="+91 00000 00000"
                    value={groupRegPhone} onChange={e => setGroupRegPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition"
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={groupRegEmail} onChange={e => setGroupRegEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00A8FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition"
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-3 bg-[#00A8FF] hover:bg-[#0090e0] text-white font-black rounded-lg transition text-sm border-none cursor-pointer shadow-md mt-1">
                  Generate Group Code
                </button>
                <div className="relative flex items-center my-2">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="mx-3 text-gray-400 text-xs font-medium">or</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-2.5 border border-gray-200 hover:border-[#00A8FF] text-gray-700 hover:text-gray-950 font-semibold rounded-lg transition text-xs bg-gray-50/50 hover:bg-white cursor-pointer"
                >
                  Try a Sample Test Instead
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="bg-[#00A8FF]/10 border border-[#00A8FF]/20 rounded-lg p-5 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#00A8FF] mb-1.5">Your Group Code</p>
                  <p className="text-2xl font-black text-gray-900 tracking-wider select-all">{generatedCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className={`w-full py-2.5 rounded-lg font-bold transition text-sm border cursor-pointer ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-[#00A8FF] text-gray-700'}`}
                >
                  {copied ? '✓ Copied to Clipboard!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-3 bg-[#00A8FF] hover:bg-[#0090e0] text-white font-black rounded-lg transition text-sm border-none cursor-pointer shadow-md flex items-center justify-center"
                >
                  Proceed with Code
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
