import React, { useState, useEffect } from 'react';
import { Copy, AlertCircle } from 'lucide-react';
import ApiService from '../../shared/services/api';

export default function CdatSection({ setView }) {
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
    <section id="cdat" className="py-10 md:py-20 px-6 bg-surface-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-surface-200 shadow-square-light overflow-hidden flex flex-col md:flex-row rounded-[10px] mb-10">
          
          {/* Text Side */}
          <div className="p-6 sm:p-8 md:p-12 flex-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-surface-200 bg-white">
            <div className="flex flex-row items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-surface-900 leading-tight">
                CIGI Differential Aptitude Test (C-DAT)
              </h2>
              <img src="/CIGI.png" alt="CIGI Logo" className="h-16 sm:h-20 object-contain shrink-0" />
            </div>
            <p className="text-surface-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
              C-DAT effectively identifies the inherent capacities of students, guiding them towards suitable academic and career paths with scientific precision.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('cdat-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-max px-6 py-3 bg-surface-900 text-white font-black uppercase tracking-widest text-[10px] rounded-[10px] hover:bg-surface-800 transition-colors cursor-pointer border-none shadow-none"
            >
              CIGI Aptitude Test
            </button>
          </div>
          
          {/* Form Side */}
          <div id="cdat-form" className="p-8 md:p-12 bg-surface-50 w-full md:w-[450px] lg:w-[500px] shrink-0">
            <h3 className="font-black text-xl mb-6 text-surface-900 uppercase tracking-widest">Generate Group Code</h3>
            <form onSubmit={handleGenerateCode} className="space-y-5">
              
              <div>
                <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2" htmlFor="cdat-name">Full Name</label>
                <input
                  id="cdat-name"
                  type="text"
                  placeholder="Enter name"
                  value={groupRegName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full bg-white border rounded-[10px] px-4 py-3 text-sm font-medium text-surface-900 focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900'}`}
                />
                {errors.name && (
                  <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2" htmlFor="cdat-phone">Phone Number</label>
                <input
                  id="cdat-phone"
                  type="tel"
                  placeholder="Enter phone"
                  value={groupRegPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full bg-white border rounded-[10px] px-4 py-3 text-sm font-medium text-surface-900 focus:outline-none transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900'}`}
                />
                {errors.phone && (
                  <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.phone}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2" htmlFor="cdat-email">Email Address</label>
                <input
                  id="cdat-email"
                  type="email"
                  placeholder="Enter email"
                  value={groupRegEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full bg-white border rounded-[10px] px-4 py-3 text-sm font-medium text-surface-900 focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900'}`}
                />
                {errors.email && (
                  <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.email}
                  </p>
                )}
              </div>

              {!generatedCode ? (
                <button type="submit" className="w-full mt-4 px-6 py-3 bg-brand text-surface-900 font-black uppercase tracking-widest text-[10px] rounded-[10px] hover:bg-brand-dark transition-all cursor-pointer border-none shadow-none">
                  Generate Code
                </button>
              ) : (
                <div className="pt-2 space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-surface-100 border border-surface-200 flex items-center justify-between gap-4 rounded-[10px]">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-widest text-surface-500 font-bold block mb-1">Your Code</span>
                      <span className="text-xl sm:text-2xl font-black tracking-widest text-surface-900 block truncate" title={generatedCode}>{generatedCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyManually}
                      className="shrink-0 px-4 py-2 bg-white border border-surface-200 hover:border-surface-900 hover:bg-surface-50 text-surface-900 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2 rounded-[10px] shadow-none"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.open("https://cigicareer.com/cdat-registration/", "_blank", "noopener,noreferrer");
                    }}
                    className="w-full px-6 py-3 bg-surface-900 text-white font-black uppercase tracking-widest text-[10px] rounded-[10px] hover:bg-surface-800 transition-colors cursor-pointer flex justify-center border-none shadow-none"
                  >
                    Proceed to Portal
                  </button>
                </div>
              )}
            </form>
            
            <div className="mt-8 pt-6 border-t border-surface-200">
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mb-3 text-center">Want to try a practice test?</p>
              <button 
                type="button"
                onClick={() => window.spaNavigate('/sample-test')}
                className="w-full px-6 py-3 bg-white border border-surface-200 text-surface-900 font-black uppercase tracking-widest text-[10px] rounded-[10px] hover:bg-surface-50 transition-all cursor-pointer flex justify-center text-center shadow-none"
              >
                Sample Test
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
