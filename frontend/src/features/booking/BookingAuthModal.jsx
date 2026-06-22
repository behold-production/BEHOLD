import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';

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
      let authData;
      if (mode === 'login') {
        authData = await login(form.email.trim(), form.password);
      } else {
        authData = await register(form.name.trim(), form.email.trim(), form.password, 'USER');
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
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
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
          className="relative w-full max-w-md my-auto bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-brand-accent to-brand" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition cursor-pointer font-bold text-base"
          aria-label="Close sign in dialog"
        >
          ✕
        </button>

        <div className="p-5 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pr-10 text-left font-sans">
            <div className="min-w-0">
              <h3 id="booking-auth-modal-title" className="text-base sm:text-lg font-bold capitalize tracking-wide text-zinc-900 leading-tight">
                {mode === 'login' ? 'Sign In to Continue' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {mode === 'login'
                  ? 'Sign in to link this booking to your profile'
                  : 'Quick free registration — under 30 seconds'}
              </p>
            </div>
          </div>

          <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-xs font-bold capitalize">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 px-3 min-h-[40px] rounded-lg cursor-pointer transition-all duration-200  flex items-center justify-center ${
                mode === 'login'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 px-3 min-h-[40px] rounded-lg cursor-pointer transition-all duration-200  flex items-center justify-center ${
                mode === 'register'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full legal name"
                    autoComplete="name"
                    className={`w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border rounded-lg text-xs font-medium text-zinc-850 outline-none focus:bg-white transition ${
                      fieldErrors.name ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'
                    }`}
                  />
                  {fieldErrors.name && <p className="text-xs text-rose-500 font-bold">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                    className={`w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border rounded-lg text-xs font-medium text-zinc-850 outline-none focus:bg-white transition ${
                      fieldErrors.phone ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'
                    }`}
                  />
                  {fieldErrors.phone && <p className="text-xs text-rose-500 font-bold">{fieldErrors.phone}</p>}
                </div>
              </>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border rounded-lg text-xs font-medium text-zinc-850 outline-none focus:bg-white transition ${
                  fieldErrors.email ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'
                }`}
              />
              {fieldErrors.email && <p className="text-xs text-rose-500 font-bold">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className={`w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border rounded-lg text-xs font-semibold text-zinc-850 outline-none focus:bg-white transition ${
                  fieldErrors.password ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'
                }`}
              />
              {fieldErrors.password && <p className="text-xs text-rose-500 font-bold">{fieldErrors.password}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full px-3.5 py-2.5 min-h-[44px] bg-zinc-50 border rounded-lg text-xs font-semibold text-zinc-850 outline-none focus:bg-white transition ${
                    fieldErrors.confirmPassword ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'
                  }`}
                />
                {fieldErrors.confirmPassword && <p className="text-xs text-rose-500 font-bold">{fieldErrors.confirmPassword}</p>}
              </div>
            )}



            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 min-h-[48px] bg-gradient-brand text-zinc-955 font-bold capitalize  text-xs rounded-lg transition flex items-center justify-center cursor-pointer shadow-md border-none disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-zinc-955/30 border-t-zinc-955 rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                <span>{mode === 'login' ? 'Login & Continue' : 'Register & Continue'}</span>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs font-bold text-brand-dark hover:underline bg-transparent border-none cursor-pointer py-2 min-h-[36px]"
            >
              {mode === 'login'
                ? "Don't have an account? Register for free"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-3 border-t border-zinc-100">
            <span className="text-xs text-zinc-500 font-bold capitalize tracking-wide">
              SSL Encrypted
            </span>
            <span className="text-zinc-200 select-none" aria-hidden="true">|</span>
            <span className="text-xs text-zinc-550 font-bold capitalize tracking-wide">
              No spam
            </span>
            <span className="text-zinc-200 select-none" aria-hidden="true">|</span>
            <span className="text-xs text-zinc-550 font-bold capitalize tracking-wide">
              Instant
            </span>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
