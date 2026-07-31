import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';
import { ScrollDot } from '../../shared/components/BrandDot';
import greenTexture from '../../assets/clarity_bg.png';

export default function CdatSection({ setView, siteSettings }) {
  const settings = siteSettings || JSON.parse(localStorage.getItem('behold_site_settings') || '{}');

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
      .catch(() => { });
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
    { num: '01', label: 'Take the C-DAT Test', desc: 'Complete the scientifically designed assessment.' },
    { num: '02', label: 'Get Your Results', desc: 'See your aptitude profile and innate strengths.' },
    { num: '03', label: 'Get Mentored', desc: 'Our experts build your personalized career roadmap.' },
  ];

  return (
    <section id="cdat" className="py-20 sm:py-28 bg-transparent text-surface-900 border-b border-surface-200"
      style={{
        backgroundImage: `url(${greenTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#d4f8fc'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#00e5ff] flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
                {sectionSub}
              </span>
              <h2 id="aptitude-title" className="text-3xl sm:text-5xl font-sans font-black uppercase text-[#0f172a] tracking-tight leading-[1.05]">
                <span>{settings.aptitudeSectionTitle ? settings.aptitudeSectionTitle.replace(/\s*\(C-DAT\)$/i, '') : 'Differential Aptitude Test'}</span>{' '}
                <span className="inline-block whitespace-nowrap">
                  (C-DAT)
                  <ScrollDot nextId="experts-title" label="Scroll to Meet Our Experts ↓" size="md" inlineText={true} />
                </span>
              </h2>
            </div>

            <p className="text-surface-600 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {sectionDesc}
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-surface-500">
              Assessment Partner &mdash; <span className="text-[#0f172a] font-black">CIGI</span>
            </p>

            {/* Steps */}
            <div className="space-y-4 pt-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#0f172a] text-[#00e5ff] border border-[#00e5ff]/30 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-[#0f172a] text-sm uppercase mb-1">{step.label}</div>
                    <div className="text-surface-600 text-xs font-normal leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-7 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer shadow-xs inline-flex items-center justify-center"
              >
                Try a Free Sample Test
              </button>
            </div>
          </div>

          {/* Right: Registration Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 sm:p-10 shadow-md border border-surface-200">
            <h3 className="text-xl sm:text-2xl font-sans font-black uppercase text-[#0f172a] mb-2">
              Register for the C-DAT<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">.</span>
            </h3>
            <p className="text-xs sm:text-sm text-surface-600 mb-6 font-normal">Fill in your details to generate your registration group code.</p>

            {!generatedCode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0f172a] uppercase mb-1.5">Full Name *</label>
                  <input
                    type="text" placeholder="e.g. Devika S. Kumar"
                    value={groupRegName} onChange={e => setGroupRegName(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all ${errors.name ? 'border-rose-400' : 'border-surface-200'}`}
                  />
                  {errors.name && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0f172a] uppercase mb-1.5">Phone Number *</label>
                  <input
                    type="tel" placeholder="+91 00000 00000"
                    value={groupRegPhone} onChange={e => setGroupRegPhone(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all ${errors.phone ? 'border-rose-400' : 'border-surface-200'}`}
                  />
                  {errors.phone && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0f172a] uppercase mb-1.5">Email Address *</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={groupRegEmail} onChange={e => setGroupRegEmail(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e5ff] transition-all ${errors.email ? 'border-rose-400' : 'border-surface-200'}`}
                  />
                  {errors.email && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer shadow-xs mt-2">
                  Generate Group Code
                </button>
                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-surface-200"></div>
                  <span className="mx-3 text-surface-400 text-xs font-normal uppercase">or</span>
                  <div className="flex-grow border-t border-surface-200"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full py-3 bg-surface-100 hover:bg-surface-200 text-[#0f172a] font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-surface-200 cursor-pointer"
                >
                  Try a Sample Test Instead
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="bg-surface-50 border border-surface-200 rounded-xl p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-2">Your Group Code</p>
                  <p className="text-2xl font-sans font-bold text-[#0f172a] tracking-wider select-all">{generatedCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className={`w-full py-2.5 rounded-full font-semibold transition text-sm border cursor-pointer ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-surface-200 hover:border-[#00e5ff] text-[#0f172a]'}`}
                >
                  {copied ? '✓ Copied to Clipboard!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold rounded-full transition text-sm border border-[#00e5ff]/30 cursor-pointer shadow-sm flex items-center justify-center"
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
