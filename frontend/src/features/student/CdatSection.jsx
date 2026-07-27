import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';
import { ScrollDot } from '../../shared/components/BrandDot';

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
    <section id="cdat" className="py-20 sm:py-28 bg-[#f7f4ef] text-[#1c1514] border-b border-[#e2dad2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#7c7069] block mb-2">
                {sectionSub}
              </span>
              <h2 id="aptitude-title" className="text-3xl sm:text-5xl font-sans font-bold uppercase text-[#1c1514] tracking-tight leading-[1.05]">
                <span>{settings.aptitudeSectionTitle ? settings.aptitudeSectionTitle.replace(/\s*\(C-DAT\)$/i, '') : 'Differential Aptitude Test'}</span>{' '}
                <span className="inline-block whitespace-nowrap">
                  (C-DAT)
                  <ScrollDot nextId="experts-title" label="Scroll to Meet Our Experts ↓" size="md" inlineText={true} />
                </span>
              </h2>
            </div>

            <p className="text-[#6e635e] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {sectionDesc}
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-[#7c7069]">
              Assessment Partner &mdash; <span className="text-[#1c1514] font-black">CIGI</span>
            </p>

            {/* Steps */}
            <div className="space-y-4 pt-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#2b211e] text-[#f7f4ef] rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-[#1c1514] text-sm uppercase mb-1">{step.label}</div>
                    <div className="text-[#6e635e] text-xs font-normal leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-7 py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-xs inline-flex items-center justify-center"
              >
                Try a Free Sample Test
              </button>
            </div>
          </div>

          {/* Right: Registration Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-[#d6cecb]">
            <h3 className="text-xl sm:text-2xl font-sans font-bold uppercase text-[#1c1514] mb-2">Register for the C-DAT.</h3>
            <p className="text-xs sm:text-sm text-[#6e635e] mb-6 font-normal">Fill in your details to generate your registration group code.</p>

            {!generatedCode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1c1514] uppercase mb-1.5">Full Name *</label>
                  <input
                    type="text" placeholder="e.g. Devika S. Kumar"
                    value={groupRegName} onChange={e => setGroupRegName(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c1514] transition-all ${errors.name ? 'border-rose-400' : 'border-[#d8d0c7]'}`}
                  />
                  {errors.name && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1c1514] uppercase mb-1.5">Phone Number *</label>
                  <input
                    type="tel" placeholder="+91 00000 00000"
                    value={groupRegPhone} onChange={e => setGroupRegPhone(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c1514] transition-all ${errors.phone ? 'border-rose-400' : 'border-[#d8d0c7]'}`}
                  />
                  {errors.phone && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1c1514] uppercase mb-1.5">Email Address *</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={groupRegEmail} onChange={e => setGroupRegEmail(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1c1514] transition-all ${errors.email ? 'border-rose-400' : 'border-[#d8d0c7]'}`}
                  />
                  {errors.email && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-3.5 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-xs mt-2">
                  Generate Group Code
                </button>
                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-[#eae4dc]"></div>
                  <span className="mx-3 text-[#a39891] text-xs font-normal uppercase">or</span>
                  <div className="flex-grow border-t border-[#eae4dc]"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full py-3 bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#d8d0c7] cursor-pointer"
                >
                  Try a Sample Test Instead
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Your Group Code</p>
                  <p className="text-2xl font-serif font-bold text-gray-900 tracking-wider select-all">{generatedCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className={`w-full py-2.5 rounded-md font-semibold transition text-sm border cursor-pointer ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700'}`}
                >
                  {copied ? '✓ Copied to Clipboard!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-md transition text-sm border-none cursor-pointer shadow-sm flex items-center justify-center"
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
