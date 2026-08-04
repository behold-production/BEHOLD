import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;

export default function BookingAuthModal({ isOpen, onClose, onSuccess, bookingForm, setBookingForm }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'phone'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setForm({
        name: bookingForm?.name || '',
        email: bookingForm?.email || '',
        phone: bookingForm?.phone || '',
        password: '',
        confirmPassword: ''
      });
      setFieldErrors({});
      setMode('login');
      setLoginMethod('email');
      setOtpPhone('');
      setOtpCode('');
      setIsOtpSent(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, bookingForm]);

  // Body scroll lock + Esc to close
  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};

    if (mode === 'login' && loginMethod === 'phone') {
      if (!isOtpSent) {
        if (!otpPhone.trim()) err.otpPhone = 'Phone number is required';
        else if (!phoneRegex.test(otpPhone.trim())) err.otpPhone = 'Please enter a valid phone number';
      } else {
        if (!otpCode.trim() || otpCode.length !== 6) err.otpCode = 'Please enter the 6-digit code';
      }
      if (Object.keys(err).length) { setFieldErrors(err); return; }
    } else if (mode === 'register') {
      if (!form.name.trim()) err.name = 'Full name is required';
      else if (form.name.trim().length < 3) err.name = 'Name must be at least 3 characters';
      if (!form.phone.trim()) err.phone = 'Phone number is required';
      else if (!phoneRegex.test(form.phone.trim())) err.phone = 'Please enter a valid 10-digit number';
      if (!form.email.trim()) err.email = 'Email is required';
      else if (!emailRegex.test(form.email.trim())) err.email = 'Please enter a valid email address';
      if (!form.password) err.password = 'Password is required';
      else if (form.password.length < 6) err.password = 'Minimum 6 characters';
      if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
      if (Object.keys(err).length) { setFieldErrors(err); return; }
    } else {
      if (!form.email.trim()) err.email = 'Email is required';
      else if (!emailRegex.test(form.email.trim())) err.email = 'Please enter a valid email address';
      if (!form.password) err.password = 'Password is required';
      if (Object.keys(err).length) { setFieldErrors(err); return; }
    }

    setIsLoading(true);
    try {
      if (mode === 'login' && loginMethod === 'phone') {
        if (!isOtpSent) {
          const res = await ApiService.sendOtp(otpPhone);
          if (res.success) {
            setIsOtpSent(true);
            import('react-hot-toast').then(mod => mod.toast.success('WhatsApp OTP sent!'));
          } else throw new Error(res.message || 'Failed to send OTP');
          setIsLoading(false);
          return;
        } else {
          const res = await ApiService.verifyOtp(otpPhone, otpCode, true);
          if (res.success) {
            if (setBookingForm) setBookingForm(prev => ({ ...prev, name: prev.name || res.data.user.name, phone: otpPhone, email: prev.email || res.data.user.email }));
            if (onSuccess) onSuccess(res.data);
          } else throw new Error(res.message || 'Invalid OTP');
          setIsLoading(false);
          return;
        }
      }

      let authData;
      if (mode === 'login') {
        authData = await login(form.email.trim(), form.password);
      } else {
        authData = await register(form.name.trim(), form.email.trim(), form.password, 'USER', { phone: form.phone.trim() });
      }

      if (setBookingForm) {
        setBookingForm(prev => ({
          ...prev,
          name: mode === 'register' ? form.name.trim() : (prev.name || authData.name),
          email: form.email.trim(),
          phone: mode === 'register' ? form.phone.trim() : prev.phone
        }));
      }

      try {
        localStorage.setItem('behold_student_profile', JSON.stringify({
          name: mode === 'register' ? form.name.trim() : (bookingForm?.name || authData.name),
          email: form.email.trim(),
          phone: mode === 'register' ? form.phone.trim() : (bookingForm?.phone || '')
        }));
        window.dispatchEvent(new CustomEvent('storage_update', { detail: { key: 'behold_student_profile' } }));
      } catch (_) { /* ignore */ }

      if (authData?.role === 'ADMIN') {
        window.location.href = '/admin';
        return;
      } else if (authData?.role === 'COUNSELLOR' || authData?.role === 'PSYCHOLOGIST') {
        window.location.href = '/counsellor';
        return;
      }

      if (onSuccess) onSuccess(authData);
    } catch (err) {
      if (err.message && !err.message.includes('Status:')) {
        import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Authentication failed.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const titles = {
    login: { title: 'Welcome Back', subtitle: 'Sign in to link this booking to your profile.' },
    register: { title: 'Create Account', subtitle: 'Join BEHOLD and book your sessions.' },
  };

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border ${fieldErrors[field]
      ? 'bg-rose-50/40 border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
      : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand'
    }`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[125] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-auth-modal-title"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div
          className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-surface-200 text-left"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
            <div className="min-w-0">
              <h2 id="booking-auth-modal-title" className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase">
                {titles[mode].title}
              </h2>
              <p className="text-xs text-surface-500 font-normal mt-1">
                {titles[mode].subtitle}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Login Method Toggle — only on login mode */}
            {mode === 'login' && (
              <div className="flex rounded-full border border-surface-200 bg-surface-100 p-1 text-xs font-bold mb-3">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setFieldErrors({}); }}
                  className={`flex-1 px-3 min-h-[36px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border-none ${loginMethod === 'email'
                    ? 'bg-[#0f172a] text-[#00e5ff] shadow-xs font-bold'
                    : 'text-surface-600 hover:text-[#0f172a]'
                    }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setFieldErrors({}); setIsOtpSent(false); setOtpCode(''); }}
                  className={`flex-1 px-3 min-h-[36px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center border-none ${loginMethod === 'phone'
                    ? 'bg-[#0f172a] text-[#00e5ff] shadow-xs font-bold'
                    : 'text-surface-600 hover:text-[#0f172a]'
                    }`}
                >
                  WhatsApp OTP
                </button>
              </div>
            )}

            {/* ── WhatsApp OTP — phone input ── */}
            {mode === 'login' && loginMethod === 'phone' && !isOtpSent && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">WhatsApp Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="Enter your 10-digit number"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border ${fieldErrors.otpPhone ? 'bg-rose-50/40 border-rose-400' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand'}`}
                  />
                </div>
                {fieldErrors.otpPhone && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpPhone}</p>}
              </div>
            )}

            {/* ── WhatsApp OTP — code input ── */}
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
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border font-mono tracking-widest text-center ${fieldErrors.otpCode ? 'bg-rose-50/40 border-rose-400' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand'}`}
                  />
                </div>
                {fieldErrors.otpCode && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpCode}</p>}
              </div>
            )}

            {/* ── Register: Full Name ── */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    autoComplete="name"
                    className={inputCls('name')}
                  />
                </div>
                {fieldErrors.name && <p className="text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
              </div>
            )}

            {/* ── Register: Phone ── */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                  <span className="absolute left-9 text-sm font-semibold text-zinc-700">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    maxLength={10}
                    className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  />
                </div>
                {fieldErrors.phone && <p className="text-xs font-medium text-rose-500">{fieldErrors.phone}</p>}
              </div>
            )}

            {/* ── Email — login (email) & register ── */}
            {(mode === 'register' || (mode === 'login' && loginMethod === 'email')) && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputCls('email')}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs font-medium text-rose-500">{fieldErrors.email}</p>}
              </div>
            )}

            {/* ── Password — login (email) & register ── */}
            {(mode === 'register' || (mode === 'login' && loginMethod === 'email')) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-500 block">Password</label>
                  {mode === 'login' && (
                    <span className="text-xs font-semibold text-brand cursor-default select-none">Forgot Password?</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`${inputCls('password')} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs font-medium text-rose-500">{fieldErrors.password}</p>}
              </div>
            )}

            {/* ── Confirm Password — register ── */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputCls('confirmPassword')} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-xs font-medium text-rose-500">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            {/* ── Submit ── */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>
                    {mode === 'login'
                      ? (loginMethod === 'phone' && !isOtpSent ? 'Send OTP' : 'Sign In')
                      : 'Sign Up'}
                  </span>
                )}
              </button>
            </div>

          </form>

          {/* Footer */}
          <div className="p-5 sm:p-6 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600 font-medium">
              {mode === 'login' ? (
                <>Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setFieldErrors({}); setShowPassword(false); }}
                    className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer border-none bg-transparent"
                  >
                    Register Now
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setFieldErrors({}); setShowPassword(false); setShowConfirmPassword(false); }}
                    className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer border-none bg-transparent"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
