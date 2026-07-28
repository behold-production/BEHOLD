import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, KeyRound, ShieldCheck, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import ApiService from '../../shared/services/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;

export default function BookingAuthModal({ isOpen, onClose, onSuccess, bookingForm, setBookingForm }) {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      name: bookingForm?.name || '',
      email: bookingForm?.email || '',
      phone: bookingForm?.phone || '',
      password: '',
      confirmPassword: ''
    });
    setFieldErrors({});
    setMode('login');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isOpen, bookingForm]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (mode === 'otp') {
      if (!isOtpSent) {
        if (!otpPhone.trim()) err.otpPhone = 'Phone number is required';
        else if (!phoneRegex.test(otpPhone.trim())) err.otpPhone = 'Please enter a valid phone number';
      } else {
        if (!otpCode.trim() || otpCode.length !== 6) err.otpCode = 'Please enter the 6-digit code';
      }
      return err;
    }

    if (mode === 'register') {
      if (!form.name.trim()) err.name = 'Full name is required';
      else if (form.name.trim().length < 3) err.name = 'Name must be at least 3 characters';

      if (!form.phone.trim()) err.phone = 'Phone number is required';
      else if (!phoneRegex.test(form.phone.trim())) err.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!form.email.trim()) err.email = 'Email is required';
    else if (!emailRegex.test(form.email.trim())) err.email = 'Please enter a valid email address';

    if (!form.password) err.password = 'Password is required';
    else if (form.password.length < 6) err.password = 'Password must be at least 6 characters';

    if (mode === 'register' && form.password !== form.confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length > 0) {
      setFieldErrors(err);
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'otp') {
        if (!isOtpSent) {
          const res = await ApiService.sendOtp(otpPhone);
          if (res.success) {
            setIsOtpSent(true);
            import('react-hot-toast').then(mod => mod.toast.success('WhatsApp OTP sent successfully!'));
          } else {
            throw new Error(res.message || 'Failed to send OTP');
          }
        } else {
          const res = await ApiService.verifyOtp(otpPhone, otpCode, true);
          if (res.success) {
            if (setBookingForm) {
              setBookingForm((prev) => ({
                ...prev,
                name: prev.name || res.data.user.name,
                phone: otpPhone,
                email: prev.email || res.data.user.email
              }));
            }
            if (onSuccess) onSuccess(res.data);
          } else {
            throw new Error(res.message || 'Invalid OTP');
          }
        }
        setIsLoading(false);
        return;
      }

      let authData;
      if (mode === 'login') {
        authData = await login(form.email.trim(), form.password);
      } else {
        authData = await register(form.name.trim(), form.email.trim(), form.password, 'USER', { phone: form.phone.trim() });
      }

      if (setBookingForm) {
        setBookingForm((prev) => ({
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

      if (onSuccess) onSuccess(authData);
    } catch (err) {
      if (err.message && !err.message.includes('Status:')) {
        import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Authentication failed. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setFieldErrors({});
    setIsOtpSent(false);
    setOtpCode('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const inputBase = 'w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:bg-white focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none transition-all placeholder:text-zinc-400';
  const inputError = 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200';

  const tabs = [
    { id: 'login', label: 'Email Login', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'otp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { id: 'register', label: 'Register', icon: <User className="w-3.5 h-3.5" /> },
  ];

  const titles = {
    login: { title: 'Sign In to Continue', sub: 'Sign in to link this booking to your profile' },
    otp: { title: 'WhatsApp Fast Login', sub: 'Sign in securely using your WhatsApp number' },
    register: { title: 'Create Your Account', sub: 'Quick free registration — under 30 seconds' },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[125] flex items-start justify-center p-4 overflow-y-auto overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-auth-modal-title"
        onClick={onClose}
      >
        {/* Modal Card */}
        <div
          className="relative w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0f172a] via-[#00e5ff] to-[#0f172a]" />

          {/* Header */}
          <div className="flex justify-between items-start gap-4 px-6 pt-6 pb-5 border-b border-zinc-100">
            <div className="min-w-0">
              <h2
                id="booking-auth-modal-title"
                className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase"
              >
                {titles[mode].title}
              </h2>
              <p className="text-xs text-zinc-500 font-normal mt-1">
                {titles[mode].sub}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="w-9 h-9 shrink-0 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none"
            >
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-4">

            {/* Tab switcher */}
            <div className="flex rounded-full border border-zinc-200 bg-zinc-100 p-1 text-xs font-bold gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchMode(tab.id)}
                  className={`flex-1 px-2 min-h-[36px] rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 border-none ${
                    mode === tab.id
                      ? 'bg-[#0f172a] text-[#00e5ff] shadow-sm'
                      : 'text-zinc-500 hover:text-[#0f172a]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── OTP Mode ── */}
            {mode === 'otp' && (
              <>
                {!isOtpSent ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 block">WhatsApp Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        name="otpPhone"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className={`${inputBase} ${fieldErrors.otpPhone ? inputError : ''}`}
                      />
                    </div>
                    {fieldErrors.otpPhone && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpPhone}</p>}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 block">Enter 6-Digit Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        name="otpCode"
                        value={otpCode}
                        maxLength={6}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className={`${inputBase} pr-10 font-mono tracking-widest text-center ${fieldErrors.otpCode ? inputError : ''}`}
                      />
                    </div>
                    {fieldErrors.otpCode && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpCode}</p>}
                  </div>
                )}
              </>
            )}

            {/* ── Register fields (Name + Phone) ── */}
            {mode === 'register' && (
              <>
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
                      className={`${inputBase} ${fieldErrors.name ? inputError : ''}`}
                    />
                  </div>
                  {fieldErrors.name && <p className="text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 block">Mobile / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      maxLength={10}
                      className={`${inputBase} ${fieldErrors.phone ? inputError : ''}`}
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-xs font-medium text-rose-500">{fieldErrors.phone}</p>}
                </div>
              </>
            )}

            {/* ── Email ── */}
            {mode !== 'otp' && (
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
                    className={`${inputBase} ${fieldErrors.email ? inputError : ''}`}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs font-medium text-rose-500">{fieldErrors.email}</p>}
              </div>
            )}

            {/* ── Password ── */}
            {mode !== 'otp' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`${inputBase} pr-12 ${fieldErrors.password ? inputError : ''}`}
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

            {/* ── Confirm Password (register) ── */}
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
                    className={`${inputBase} pr-12 ${fieldErrors.confirmPassword ? inputError : ''}`}
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
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[48px] bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {mode === 'login' ? 'Signing in…' : mode === 'otp' ? 'Processing…' : 'Creating account…'}
                    </span>
                  </>
                ) : (
                  <span>
                    {mode === 'login' ? 'Login & Continue' : mode === 'otp' ? (isOtpSent ? 'Verify & Login' : 'Send Code') : 'Register & Continue'}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 border-t border-zinc-100 pt-4 space-y-3">
            <p className="text-xs text-zinc-600 font-medium text-center">
              {mode === 'login' || mode === 'otp' ? (
                <>Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => switchMode('register')} className="font-bold text-zinc-900 hover:text-[#00e5ff] transition-colors underline cursor-pointer border-none bg-transparent">
                    Register for free
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => switchMode('login')} className="font-bold text-zinc-900 hover:text-[#00e5ff] transition-colors underline cursor-pointer border-none bg-transparent">
                    Sign In
                  </button>
                </>
              )}
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold tracking-wide">
                <ShieldCheck className="w-3 h-3 text-[#00e5ff]" /> SSL Encrypted
              </span>
              <span className="text-zinc-200" aria-hidden="true">|</span>
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold tracking-wide">
                <Zap className="w-3 h-3 text-[#00e5ff]" /> No spam
              </span>
              <span className="text-zinc-200" aria-hidden="true">|</span>
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold tracking-wide">
                <Zap className="w-3 h-3 text-[#00e5ff]" /> Instant
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
