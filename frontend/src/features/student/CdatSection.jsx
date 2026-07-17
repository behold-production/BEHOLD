import React, { useState, useEffect } from 'react';
import ApiService from '../../shared/services/api';

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
    <section id="cdat" className="py-24 bg-blue-600">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Info */}
          <div className="text-white">
            <span className="text-sm font-bold tracking-widest uppercase text-blue-200 block mb-4">
              {sectionSub}
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              {sectionTitle}
            </h2>
            <p className="text-blue-100 text-xl leading-relaxed mb-8">
              {sectionDesc}
            </p>

            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold text-blue-100 mb-10">
              Assessment partner — <strong className="text-white">CIGI</strong>
            </div>

            {/* Steps */}
            <div className="space-y-5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl shrink-0">{step.icon}</div>
                  <div>
                    <div className="font-bold text-white">{step.label}</div>
                    <div className="text-blue-200 text-sm">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
              className="mt-10 px-8 py-4 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition border-none cursor-pointer shadow-lg text-lg"
            >
              Try a Free Sample Test →
            </button>
          </div>

          {/* Right: Registration Form */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Register for the C-DAT</h3>
            <p className="text-gray-500 mb-6">Fill in your details to generate your registration Group Code.</p>

            {!generatedCode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text" placeholder="e.g. Devika S. Kumar"
                    value={groupRegName} onChange={e => setGroupRegName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel" placeholder="+91 00000 00000"
                    value={groupRegPhone} onChange={e => setGroupRegPhone(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={groupRegEmail} onChange={e => setGroupRegEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition text-lg border-none cursor-pointer">
                  Generate Group Code
                </button>
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="mx-4 text-gray-400 text-sm font-medium">or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <button
                  type="button"
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-3 border-2 border-gray-200 hover:border-blue-300 text-gray-700 font-semibold rounded-xl transition bg-white cursor-pointer"
                >
                  Try a Sample Test Instead
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Your Group Code</p>
                  <p className="text-3xl font-black text-blue-700 tracking-wider">{generatedCode}</p>
                </div>
                <button
                  onClick={copyCode}
                  className={`w-full py-3 rounded-xl font-bold transition border-2 cursor-pointer ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700'}`}
                >
                  {copied ? '✓ Copied to Clipboard!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => { window.spaNavigate?.('/sample-test'); window.scrollTo({ top: 0 }); }}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition border-none cursor-pointer"
                >
                  Proceed with Code →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
