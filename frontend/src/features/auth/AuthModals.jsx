import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateEmail, validateIndianPhone, parseIndianPhone } from '../../utils/validation';

export default function AuthModals({ isOpen, onClose }) {
 const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
 const { login, register } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
 const [isLoading, setIsLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [rejectionReason, setRejectionReason] = useState(null);

 // OTP Login State
 const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'phone'
 const [otpPhone, setOtpPhone] = useState('');
 const [otpCode, setOtpCode] = useState('');
 const [isOtpSent, setIsOtpSent] = useState(false);

 // Forgot Password State (3-step flow)
 const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'verify' | 'success'
 const [forgotEmail, setForgotEmail] = useState('');
 const [maskedPhone, setMaskedPhone] = useState('');
 const [resetOtp, setResetOtp] = useState('');
 const [newPassword, setNewPassword] = useState('');
 const [showNewPassword, setShowNewPassword] = useState(false);
 const [resetResendCooldown, setResetResendCooldown] = useState(0);

 useEffect(() => {
   if (isOpen) {
     document.body.style.overflow = 'hidden';
     setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
     setMode('login');
     setLoginMethod('email');
     setOtpPhone('');
     setOtpCode('');
     setIsOtpSent(false);
     setShowPassword(false);
     setShowConfirmPassword(false);
     setForgotStep('email');
     setForgotEmail('');
     setMaskedPhone('');
     setResetOtp('');
     setNewPassword('');
     setShowNewPassword(false);
     setResetResendCooldown(0);
     setRejectionReason(null);
   } else {
     document.body.style.overflow = '';
   }
   return () => {
     document.body.style.overflow = '';
   };
 }, [isOpen]);

 // Countdown timer for resend
 useEffect(() => {
   if (resetResendCooldown <= 0) return;
   const t = setTimeout(() => setResetResendCooldown(c => c - 1), 1000);
   return () => clearTimeout(t);
 }, [resetResendCooldown]);

 // Body scroll lock + Esc to close
 useEffect(() => {
   if (!isOpen) return;
   document.documentElement.classList.add('no-scroll');
   document.body.classList.add('no-scroll');
   const handleEsc = (e) => {
     if (e.key === 'Escape') onClose();
   };
   document.addEventListener('keydown', handleEsc);
   return () => {
     document.documentElement.classList.remove('no-scroll');
     document.body.classList.remove('no-scroll');
     document.removeEventListener('keydown', handleEsc);
   };
 }, [isOpen, onClose]);

 if (!isOpen) return null;

 const handleInputChange = (e) => {
   setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
 };

 const showToast = (msg, type = 'error') => {
   import('react-hot-toast').then(mod => {
     if (type === 'success') mod.toast.success(msg);
     else mod.toast.error(msg);
   });
 };

 // ── Forgot Password: Step 1 — send OTP ──────────────────────────
 const handleSendResetOtp = async () => {
   if (!forgotEmail.trim()) return showToast('Please enter your email address');
   if (!validateEmail(forgotEmail)) return showToast('Please enter a valid email address');
   setIsLoading(true);
   try {
     const res = await ApiService.forgotPassword(forgotEmail.trim());
     if (res.success) {
       setMaskedPhone(res.data?.maskedPhone || '');
       setForgotStep('verify');
       setResetResendCooldown(60);
     } else {
       showToast(res.message || 'Failed to send reset code. Please try again.');
     }
   } catch (err) {
     showToast(err.message || 'Something went wrong. Please try again.');
   } finally {
     setIsLoading(false);
   }
 };

 // ── Forgot Password: Step 2 — verify OTP + set new password ────
 const handleVerifyResetOtp = async () => {
   if (!resetOtp.trim() || resetOtp.length !== 6) return showToast('Please enter the 6-digit code');
   if (!newPassword || newPassword.length < 6) return showToast('New password must be at least 6 characters');
   setIsLoading(true);
   try {
     const res = await ApiService.resetPassword(forgotEmail.trim(), resetOtp.trim(), newPassword);
     if (res.success) {
       setForgotStep('success');
     } else {
       showToast(res.message || 'Invalid or expired code. Please try again.');
     }
   } catch (err) {
     showToast(err.message || 'Failed to reset password. Please try again.');
   } finally {
     setIsLoading(false);
   }
 };

 // ── Main form submit (login / register) ─────────────────────────
 const handleSubmit = async (e) => {
   e.preventDefault();
   setIsLoading(true);

   try {
     let loggedUser = null;

     if (mode === 'login') {
       if (loginMethod === 'email') {
         if (!formData.email.trim() || !formData.password) throw new Error('Please fill in all fields');
         if (!validateEmail(formData.email)) throw new Error('Please enter a valid email address');
         loggedUser = await login(formData.email, formData.password);
       } else {
         if (!isOtpSent) {
           if (!otpPhone.trim()) throw new Error('Phone number is required');
           if (!validateIndianPhone(otpPhone)) throw new Error('Please enter a valid 10-digit Indian phone number');
           const cleanPhone = parseIndianPhone(otpPhone).phone10;
           const res = await ApiService.sendOtp(cleanPhone);
           if (res.success) {
             setIsOtpSent(true);
             showToast('WhatsApp OTP sent successfully!', 'success');
           } else {
             throw new Error(res.message || 'Failed to send OTP');
           }
           setIsLoading(false);
           return;
         } else {
           if (!otpCode.trim() || otpCode.length !== 6) throw new Error('Please enter the 6-digit code');
           const cleanPhone = parseIndianPhone(otpPhone).phone10;
           const res = await ApiService.verifyOtp(cleanPhone, otpCode, true);
           if (res.success && res.data && res.data.user) {
             loggedUser = res.data.user;
           } else {
             throw new Error(res.message || 'Invalid OTP');
           }
         }
       }
     } else {
       if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) throw new Error('Please fill in all fields');
       if (!validateIndianPhone(formData.phone)) throw new Error('Please enter a valid 10-digit Indian phone number starting with 6-9');
       if (!validateEmail(formData.email)) throw new Error('Please enter a valid email address');
       if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
       if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
       
       const cleanPhone = parseIndianPhone(formData.phone).phone10;
       loggedUser = await register(formData.name.trim(), formData.email.trim(), formData.password, 'USER', { phone: cleanPhone });
     }

     onClose();

     if (loggedUser) {
       const role = loggedUser.role?.toUpperCase();
       if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUB_ADMIN') {
         navigate('/admin');
       } else if (role === 'PSYCHOLOGIST' || role === 'COUNSELLOR') {
         navigate('/counsellor');
       } else {
         const redirectPath = location.state?.from;
         if (redirectPath) {
           navigate(redirectPath);
         } else {
           const currentPath = location.pathname;
           const keepPagePaths = ['/', '/booking', '/sample-test'];
           const isAdvisorPath = currentPath.startsWith('/advisor/');
           if (!keepPagePaths.includes(currentPath) && !isAdvisorPath) {
             navigate('/profile');
           }
         }
       }
     }
   } catch (err) {
     if (err.message && err.message.startsWith('REJECTED_USER:')) {
       setRejectionReason(err.message.replace('REJECTED_USER:', ''));
     } else if (err.message && !err.message.includes('Status:')) {
       showToast(err.message);
     }
   } finally {
     setIsLoading(false);
   }
 };

 const titles = {
   login: { title: 'Welcome Back', subtitle: 'Enter your details to sign in.' },
   register: { title: 'Create Account', subtitle: 'Join BEHOLD and book your sessions.' },
   forgot: {
     email: { title: 'Forgot Password', subtitle: 'Enter your email to receive a reset code.' },
     verify: { title: 'Enter Reset Code', subtitle: `A 6-digit code was sent to your email and WhatsApp${maskedPhone ? ` (${maskedPhone})` : ''}.` },
     success: { title: 'Password Reset!', subtitle: 'Your password has been changed successfully.' }
   }
 };

 const getTitle = () => {
   if (mode === 'forgot') return titles.forgot[forgotStep].title;
   return titles[mode].title;
 };
 const getSubtitle = () => {
   if (mode === 'forgot') return titles.forgot[forgotStep].subtitle;
   return titles[mode].subtitle;
 };

 return (
   <>
     {/* Backdrop */}
     <div
       className="fixed inset-0 z-[110] bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-300"
       onClick={onClose}
       aria-hidden="true"
     />

     {/* Modal Container */}
     <div
       className="fixed inset-0 z-[115] flex items-start justify-center p-4 overflow-y-auto overscroll-contain"
       role="dialog"
       aria-modal="true"
       aria-labelledby="auth-modal-title"
       onClick={onClose}
     >
       {/* Modal Card */}
       <div
         className="relative w-full max-w-md my-auto bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-surface-200"
         onClick={(e) => e.stopPropagation()}
       >

         {/* Header */}
         <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
           <div className="min-w-0">
             <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase">
               {rejectionReason ? 'Application Rejected' : getTitle()}
             </h2>
             <p className="text-xs text-surface-500 font-normal mt-1">
               {rejectionReason ? 'Your counselor application has been declined.' : getSubtitle()}
             </p>
           </div>
           <button
             type="button"
             onClick={onClose}
             aria-label="Close dialog"
             className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none"
           >
             <X className="w-4 h-4 text-[#0f172a]" />
           </button>
         </div>

         {/* Form body */}
         {rejectionReason ? (
           <div className="p-6 space-y-4">
             <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
               <p className="text-sm text-[#0f172a] leading-relaxed font-medium">
                 We regret to inform you that your professional counsellor application has been rejected by the system administrator.
               </p>
               <div className="bg-white border border-rose-100 p-3 rounded-xl">
                 <span className="text-[10px] font-bold text-rose-600 tracking-wider block mb-1 uppercase">Reason for Rejection:</span>
                 <p className="text-sm text-zinc-800 italic leading-relaxed">"{rejectionReason}"</p>
               </div>
             </div>
             <button
               onClick={() => { setRejectionReason(null); setMode('login'); }}
               className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border border-[#00e5ff]/30"
             >
               Return to Login
             </button>
           </div>
         ) : mode === 'forgot' ? (
           /* ─── FORGOT PASSWORD FLOW ─── */
           <div className="p-6 space-y-5">

             {/* Step 1: Email Input */}
             {forgotStep === 'email' && (
               <>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-zinc-500 block">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                     <input
                       type="email"
                       value={forgotEmail}
                       onChange={e => setForgotEmail(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && !isLoading && handleSendResetOtp()}
                       placeholder="you@example.com"
                       autoComplete="email"
                       autoFocus
                       className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all"
                     />
                   </div>
                 </div>
                 <button
                   type="button"
                   disabled={isLoading}
                   onClick={handleSendResetOtp}
                   className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer border-none shadow-sm"
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Code'}
                 </button>
               </>
             )}

             {/* Step 2: OTP Code + New Password */}
             {forgotStep === 'verify' && (
               <>
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start gap-2.5">
                   <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                   <p className="text-xs text-blue-800 font-medium leading-relaxed">
                     A 6-digit code was sent to your email <strong>{forgotEmail}</strong>. Enter it below along with your new password.
                   </p>
                 </div>

                 {/* 6-digit OTP */}
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-zinc-500 block">6-Digit Reset Code</label>
                   <div className="relative">
                     <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                     <input
                       type="text"
                       maxLength={6}
                       value={resetOtp}
                       onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                       placeholder="123456"
                       autoFocus
                       className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all font-mono tracking-[0.3em] text-center"
                     />
                   </div>
                 </div>

                 {/* New Password */}
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-zinc-500 block">New Password</label>
                   <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                     <input
                       type={showNewPassword ? 'text' : 'password'}
                       value={newPassword}
                       onChange={e => setNewPassword(e.target.value)}
                       placeholder="Min. 6 characters"
                       autoComplete="new-password"
                       className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all"
                     />
                     <button
                       type="button"
                       onClick={() => setShowNewPassword(v => !v)}
                       className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors border-none bg-transparent"
                     >
                       {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>

                 <button
                   type="button"
                   disabled={isLoading}
                   onClick={handleVerifyResetOtp}
                   className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer border-none shadow-sm"
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                 </button>

                 {/* Resend code */}
                 <p className="text-center text-xs text-zinc-500">
                   Didn't receive the code?{' '}
                   {resetResendCooldown > 0 ? (
                     <span className="text-zinc-400">Resend in {resetResendCooldown}s</span>
                   ) : (
                     <button
                       type="button"
                       onClick={async () => {
                         setIsLoading(true);
                         try {
                           const res = await ApiService.forgotPassword(forgotEmail.trim());
                           if (res.success) {
                             showToast('New code sent!', 'success');
                             setResetResendCooldown(60);
                             setResetOtp('');
                           } else {
                             showToast(res.message || 'Failed to resend');
                           }
                         } catch {
                           showToast('Failed to resend code');
                         } finally {
                           setIsLoading(false);
                         }
                       }}
                       disabled={isLoading}
                       className="font-bold text-zinc-900 hover:text-[#00e5ff] cursor-pointer transition-colors disabled:opacity-50 border-none bg-transparent"
                     >
                       Resend Code
                     </button>
                   )}
                 </p>
               </>
             )}

             {/* Step 3: Success */}
             {forgotStep === 'success' && (
               <div className="flex flex-col items-center text-center py-6 gap-4">
                 <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                   <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                 </div>
                 <div>
                   <p className="font-bold text-zinc-900 text-lg">Password Reset!</p>
                   <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                     Your password has been updated successfully. You can now sign in with your new password.
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => { setMode('login'); setForgotStep('email'); setForgotEmail(''); setResetOtp(''); setNewPassword(''); }}
                   className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all cursor-pointer border-none"
                 >
                   Sign In Now
                 </button>
               </div>
             )}

             {/* Back to login footer (steps 1 & 2 only) */}
             {forgotStep !== 'success' && (
               <div className="pt-1 border-t border-zinc-100 text-center">
                 <p className="text-xs text-zinc-600 font-medium">
                   Remember your password?{' '}
                   <button
                     type="button"
                     onClick={() => { setMode('login'); setForgotStep('email'); setForgotEmail(''); setResetOtp(''); setNewPassword(''); }}
                     className="font-bold text-zinc-900 hover:text-[#00e5ff] transition-colors underline cursor-pointer border-none bg-transparent"
                   >
                     Sign In
                   </button>
                 </p>
               </div>
             )}
           </div>
         ) : (
           <form onSubmit={handleSubmit} className="p-6 space-y-4">

             {/* Login Method Toggle */}
             {mode === 'login' && (
               <div className="flex rounded-full border border-surface-200 bg-surface-100 p-1 text-xs font-bold mb-3">
                 <button
                   type="button"
                   onClick={() => setLoginMethod('email')}
                   className={`flex-1 px-3 min-h-[36px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border-none ${
                     loginMethod === 'email'
                       ? 'bg-[#0f172a] text-[#00e5ff] shadow-xs font-bold'
                       : 'text-surface-600 hover:text-[#0f172a]'
                   }`}
                 >
                   Email
                 </button>
                 <button
                   type="button"
                   onClick={() => setLoginMethod('phone')}
                   className={`flex-1 px-3 min-h-[36px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border-none ${
                     loginMethod === 'phone'
                       ? 'bg-[#0f172a] text-[#00e5ff] shadow-xs font-bold'
                       : 'text-surface-600 hover:text-[#0f172a]'
                   }`}
                 >
                   WhatsApp OTP
                 </button>
               </div>
             )}

             {/* WhatsApp OTP Phone Input */}
             {mode === 'login' && loginMethod === 'phone' && !isOtpSent && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">WhatsApp Phone Number</label>
                 <div className="relative flex items-center">
                   <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                   <span className="absolute left-9 text-sm font-semibold text-zinc-700">+91</span>
                   <input
                     type="tel"
                     value={otpPhone}
                     onChange={(e) => setOtpPhone(e.target.value)}
                     placeholder="10-digit number"
                     className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                 </div>
               </div>
             )}

             {/* WhatsApp OTP Code Input */}
             {mode === 'login' && loginMethod === 'phone' && isOtpSent && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">Enter 6-Digit Code</label>
                 <div className="relative">
                   <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input
                     type="text"
                     maxLength={6}
                     value={otpCode}
                     onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                     placeholder="123456"
                     className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-mono tracking-widest text-center"
                   />
                 </div>
               </div>
             )}

             {/* Full Name — register only */}
             {mode === 'register' && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">Full Name</label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input
                     type="text"
                     name="name"
                     value={formData.name}
                     onChange={handleInputChange}
                     placeholder="John Doe"
                     autoComplete="name"
                     className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                 </div>
               </div>
             )}

             {/* Phone Number — register only */}
             {mode === 'register' && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">Phone Number</label>
                 <div className="relative flex items-center">
                   <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                   <span className="absolute left-9 text-sm font-semibold text-zinc-700">+91</span>
                   <input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     placeholder="10-digit mobile number"
                     autoComplete="tel"
                     maxLength={10}
                     className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                 </div>
               </div>
             )}

             {/* Email — login (email method) & register */}
             {(mode === 'register' || (mode === 'login' && loginMethod === 'email')) && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="you@example.com"
                     autoComplete="email"
                     className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                 </div>
               </div>
             )}

             {/* Password — login & register */}
             {(mode === 'register' || (mode === 'login' && loginMethod === 'email')) && (
               <div className="space-y-1.5">
                 <div className="flex items-center justify-between">
                   <label className="text-xs font-bold text-zinc-500 block">Password</label>
                   {mode === 'login' && (
                     <button
                       type="button"
                       onClick={() => setMode('forgot')}
                       className="text-xs font-semibold text-brand hover:underline cursor-pointer border-none bg-transparent"
                     >
                       Forgot Password?
                     </button>
                   )}
                 </div>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input
                     type={showPassword ? 'text' : 'password'}
                     name="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     placeholder="••••••••"
                     autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                     className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(v => !v)}
                     aria-label={showPassword ? 'Hide password' : 'Show password'}
                     className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 focus:outline-none cursor-pointer transition-colors border-none bg-transparent"
                   >
                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                 </div>
               </div>
             )}

             {/* Confirm Password — register */}
             {mode === 'register' && (
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-zinc-500 block">Confirm Password</label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                   <input
                     type={showConfirmPassword ? 'text' : 'password'}
                     name="confirmPassword"
                     value={formData.confirmPassword}
                     onChange={handleInputChange}
                     placeholder="••••••••"
                     autoComplete="new-password"
                     className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(v => !v)}
                     className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors border-none bg-transparent"
                   >
                     {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                 </div>
               </div>
             )}

             {/* Submit */}
             <div className="pt-2">
               <button
                 type="submit"
                 disabled={isLoading}
                 className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
               >
                 {isLoading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   <span>
                     {mode === 'login' ? (loginMethod === 'phone' && !isOtpSent ? 'Send OTP' : 'Sign In') : 'Sign Up'}
                   </span>
                 )}
               </button>
             </div>

           </form>
         )}

         {/* Footer */}
         {!rejectionReason && mode !== 'forgot' && (
           <div className="p-5 sm:p-6 bg-zinc-50 border-t border-zinc-100 text-center">
             <p className="text-xs text-zinc-600 font-medium">
               {mode === 'login' && (
                 <>Don't have an account?{' '}
                   <button type="button" onClick={() => setMode('register')} className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer">
                     Register Now
                   </button>
                 </>
               )}
               {mode === 'register' && (
                 <>Already have an account?{' '}
                   <button type="button" onClick={() => setMode('login')} className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer">
                     Sign In
                   </button>
                 </>
               )}
             </p>
           </div>
         )}

       </div>
     </div>
   </>
 );
}
