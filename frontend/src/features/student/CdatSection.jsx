import { motion } from 'framer-motion';
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
    <motion.section initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} id="cdat" className="relative pt-16 md:pt-24 pb-16 md:pb-24 px-6 overflow-hidden">
      {/* Background Image & Glassmorphic Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-fixed scale-105"
          style={{ backgroundImage: "url('/students_kerala.png')" }}
        />
      </div>
      <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-lg pointer-events-none"></div>
      
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 lg:gap-12 items-stretch">
        
        {/* Text Side Card */}
        <motion.div 
          initial={{ opacity: 0, x: -80, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="square-card p-6 sm:p-8 flex-1 flex flex-col group"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-surface-900 leading-tight">
              CIGI Differential Aptitude Test (C-DAT)
            </h2>
            <img src="/CIGI.png" alt="CIGI Logo" className="h-16 sm:h-20 object-contain shrink-0 mix-blend-multiply sm:self-start mt-1" />
          </div>
          <p className="text-surface-700 text-base md:text-lg leading-relaxed mb-8 max-w-lg font-medium">
            C-DAT effectively identifies the inherent capacities of students, guiding them towards suitable academic and career paths with scientific precision.
          </p>
          <div className="mt-auto">
            <button
              type="button"
              onClick={() => document.getElementById('cdat-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-max px-8 py-3.5 bg-brand text-surface-900 font-bold text-sm sm:text-base rounded-full hover:bg-brand-dark transition-colors cursor-pointer border-none shadow-[0_4px_20px_rgba(0,229,255,0.3)]"
            >
              CIGI Aptitude Test
            </button>
          </div>
        </motion.div>
 
  {/* Form Side Card */}
  <motion.div 
    initial={{ opacity: 0, x: 80, scale: 0.96 }}
    whileInView={{ opacity: 1, x: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    id="cdat-form" 
    className="square-card p-6 sm:p-8 w-full md:w-[450px] lg:w-[480px] shrink-0 group"
  >
 <h3 className="font-black text-2xl mb-4 text-surface-900">Generate Group Code</h3>
 <form onSubmit={handleGenerateCode} className="space-y-3">
 
 <div>
 <label className="block text-sm font-bold text-surface-700 mb-1.5" htmlFor="cdat-name">Full Name</label>
 <input
 id="cdat-name"
 type="text"
 placeholder="Enter name"
 value={groupRegName}
 onChange={(e) => handleNameChange(e.target.value)}
 className={`w-full bg-surface-50 border rounded-[10px] px-4 py-2.5 text-base font-medium text-surface-900 focus:outline-none transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900 focus:bg-white'}`}
 />
 {errors.name && (
 <p className="text-sm text-red-600 font-bold mt-1.5 flex items-center gap-1">
 <AlertCircle className="w-4 h-4 shrink-0" /> {errors.name}
 </p>
 )}
 </div>
 
 <div>
 <label className="block text-sm font-bold text-surface-700 mb-1.5" htmlFor="cdat-phone">Phone Number</label>
 <input
 id="cdat-phone"
 type="tel"
 placeholder="Enter phone"
 value={groupRegPhone}
 onChange={(e) => handlePhoneChange(e.target.value)}
 className={`w-full bg-surface-50 border rounded-[10px] px-4 py-2.5 text-base font-medium text-surface-900 focus:outline-none transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900 focus:bg-white'}`}
 />
 {errors.phone && (
 <p className="text-sm text-red-600 font-bold mt-1.5 flex items-center gap-1">
 <AlertCircle className="w-4 h-4 shrink-0" /> {errors.phone}
 </p>
 )}
 </div>
 
 <div>
 <label className="block text-sm font-bold text-surface-700 mb-1.5" htmlFor="cdat-email">Email Address</label>
 <input
 id="cdat-email"
 type="email"
 placeholder="Enter email"
 value={groupRegEmail}
 onChange={(e) => handleEmailChange(e.target.value)}
 className={`w-full bg-surface-50 border rounded-[10px] px-4 py-2.5 text-base font-medium text-surface-900 focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-surface-200 focus:border-surface-900 focus:bg-white'}`}
 />
 {errors.email && (
 <p className="text-sm text-red-600 font-bold mt-1.5 flex items-center gap-1">
 <AlertCircle className="w-4 h-4 shrink-0" /> {errors.email}
 </p>
 )}
 </div>

 {!generatedCode ? (
 <button type="submit" className="w-full mt-3 px-6 py-3 bg-brand text-surface-900 font-bold text-sm sm:text-base rounded-full hover:bg-brand-dark transition-all cursor-pointer border-none shadow-none">
 Generate Code
 </button>
 ) : (
 <div className="pt-2 space-y-4 animate-in fade-in duration-300">
 <div className="p-4 bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-between gap-4 rounded-[10px]">
 <div className="min-w-0 flex-1">
 <span className="text-sm text-surface-700 font-bold block mb-1">Your Code</span>
 <span className="text-2xl sm:text-3xl font-black text-surface-900 block truncate" title={generatedCode}>{generatedCode}</span>
 </div>
 <button
 type="button"
 onClick={copyManually}
 className="shrink-0 px-4 py-2.5 bg-white border border-surface-200 hover:border-surface-900 hover:bg-surface-50 text-surface-900 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 rounded-full shadow-none"
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
 className="w-full px-6 py-3.5 bg-surface-900 text-white font-bold text-sm sm:text-base rounded-[10px] hover:bg-surface-800 transition-colors cursor-pointer flex justify-center border-none shadow-none"
 >
 Proceed to Portal
 </button>
 </div>
 )}
 </form>
 
 <div className="mt-6 pt-5 border-t border-surface-200">
 <p className="text-sm text-surface-700 font-bold mb-2.5 text-center">Want to try a practice test?</p>
 <button 
 type="button"
 onClick={() => window.spaNavigate('/sample-test')}
 className="w-full px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-white/60 text-surface-900 font-bold text-sm sm:text-base rounded-[10px] hover:bg-white transition-all cursor-pointer flex justify-center text-center shadow-none"
 >
 Sample Test
 </button>
 </div>
 </motion.div>

 </div>
 </motion.section>
 );
}
