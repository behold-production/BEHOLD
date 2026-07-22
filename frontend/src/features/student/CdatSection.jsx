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
    { num: '01', label: 'Take the C-DAT Test', desc: 'Complete the scientifically designed assessment.' },
    { num: '02', label: 'Get Your Results', desc: 'See your aptitude profile and innate strengths.' },
    { num: '03', label: 'Get Mentored', desc: 'Our experts build your personalized career roadmap.' },
  ];

  return (
    <section id="cdat" className="py-16 sm:py-24 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Info (7 cols) */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 block mb-3">
              {sectionSub}
            </span>
            <h2 id="aptitude-title" className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-tight">
              <span>{settings.aptitudeSectionTitle ? settings.aptitudeSectionTitle.replace(/\s*\(C-DAT\)$/i, '') : 'Differential Aptitude Test'}</span>
              <span className="inline ml-2">
                <span>(C-DAT)</span>
                <ScrollDot nextId="experts-title" label="Scroll to Meet Our Experts ↓" size="md" inlineText={true} />
              </span>
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl font-normal">
              {sectionDesc}
            </p>

            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-md text-xs font-semibold text-gray-700 mb-8">
              Assessment Partner — <strong className="text-gray-900 font-bold">CIGI</strong>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-base mb-1">{step.label}</div>
                    <div className="text-gray-600 text-xs sm:text-sm font-normal">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
              className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-md transition border-none cursor-pointer shadow-sm text-sm inline-flex items-center justify-center"
            >
              Try a Free Sample Test
            </button>
          </div>

          {/* Right: Registration Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-gray-200">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Register for the C-DAT.</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 font-normal">Fill in your details to generate your registration group code.</p>

            {!generatedCode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text" placeholder="e.g. Devika S. Kumar"
                    value={groupRegName} onChange={e => setGroupRegName(e.target.value)}
                    className={`w-full border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    type="tel" placeholder="+91 00000 00000"
                    value={groupRegPhone} onChange={e => setGroupRegPhone(e.target.value)}
                    className={`w-full border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.phone && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={groupRegEmail} onChange={e => setGroupRegEmail(e.target.value)}
                    className={`w-full border rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-gray-900 transition ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-md transition text-sm border-none cursor-pointer shadow-sm mt-2">
                  Generate Group Code
                </button>
                <div className="relative flex items-center my-3">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="mx-3 text-gray-400 text-xs font-normal">or</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-2.5 border border-gray-200 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-md transition text-xs bg-gray-50/50 hover:bg-gray-100 cursor-pointer"
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
