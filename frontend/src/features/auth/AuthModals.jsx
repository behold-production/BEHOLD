import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import ApiService from '../../shared/services/api';

export default function AuthModals({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', resetToken: '', newPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(null); // stores { resetToken }
  const [resetSuccess, setResetSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);

  // OTP State
  const [loginMethod, setLoginMethod] = useState('email'); // 'email', 'phone'
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '', resetToken: '', newPassword: '' });
      setMode('login');
      setLoginMethod('email');
      setOtpPhone('');
      setOtpCode('');
      setIsOtpSent(false);
      setShowPassword(false);
      setForgotSuccess(null);
      setResetSuccess(false);
      setRejectionReason(null);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (mode === 'forgot') {
        if (!formData.email.trim()) throw new Error('Please enter your email address');
        if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');
        const res = await ApiService.forgotPassword(formData.email);
        if (res.success && res.data?.resetToken) {
          setForgotSuccess(res.data);
        }
        return;
      }

      if (mode === 'reset') {
        if (!formData.resetToken.trim()) throw new Error('Please enter the reset token');
        if (!formData.newPassword || formData.newPassword.length < 6) throw new Error('New password must be at least 6 characters');
        await ApiService.resetPassword(formData.resetToken.trim(), formData.newPassword);
        setResetSuccess(true);
        setTimeout(() => {
          setMode('login');
          setResetSuccess(false);
          setFormData(prev => ({ ...prev, resetToken: '', newPassword: '' }));
        }, 2000);
        return;
      }

      let loggedUser = null;

      if (mode === 'login') {
        if (loginMethod === 'email') {
          if (!formData.email.trim() || !formData.password) throw new Error('Please fill in all fields');
          if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');
          loggedUser = await login(formData.email, formData.password);
        } else {
          // WhatsApp OTP Login
          const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
          if (!isOtpSent) {
            if (!otpPhone.trim()) throw new Error('Phone number is required');
            if (!phoneRegex.test(otpPhone.trim())) throw new Error('Please enter a valid phone number');
            const res = await ApiService.sendOtp(otpPhone);
            if (res.success) {
              setIsOtpSent(true);
              import('react-hot-toast').then(mod => mod.toast.success('WhatsApp OTP sent successfully!'));
            } else {
              throw new Error(res.message || 'Failed to send OTP');
            }
            setIsLoading(false);
            return; // Don't close modal yet
          } else {
            if (!otpCode.trim() || otpCode.length !== 6) throw new Error('Please enter the 6-digit code');
            const res = await ApiService.verifyOtp(otpPhone, otpCode, true);
            if (res.success && res.data && res.data.user) {
              loggedUser = res.data.user;
            } else {
              throw new Error(res.message || 'Invalid OTP');
            }
          }
        }
      } else {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) throw new Error('Please fill in all fields');
        if (!emailRegex.test(formData.email)) throw new Error('Please enter a valid email address');
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
        loggedUser = await register(formData.name, formData.email, formData.password);
      }

      onClose();

      if (loggedUser) {
        const role = loggedUser.role?.toUpperCase();
        if (role === 'ADMIN') {
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
        import('react-hot-toast').then(mod => mod.toast.error(err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const titles = {
    login:    { title: 'Welcome Back',    subtitle: 'Enter your details to sign in.' },
    register: { title: 'Create Account',  subtitle: 'Join BEHOLD and book your sessions.' },
    forgot:   { title: 'Forgot Password', subtitle: 'Enter your email to receive a reset token.' },
    reset:    { title: 'Reset Password',  subtitle: 'Enter the reset token and your new password.' },
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
          className="relative w-full max-w-md my-auto bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200"
          onClick={(e) => e.stopPropagation()}
        >

        {/* Header */}
        <div className="flex justify-between items-start gap-4 p-5 sm:p-6 border-b border-zinc-100">
          <div className="min-w-0">
            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-header font-bold tracking-tight text-zinc-900">
              {rejectionReason ? 'Application Rejected' : titles[mode].title}
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {rejectionReason ? 'Your counselor application has been declined.' : titles[mode].subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 shrink-0 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Form body */}
        {rejectionReason ? (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
              <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                We regret to inform you that your professional counsellor application has been rejected by the system administrator.
              </p>
              <div className="bg-white border border-rose-100 p-3 rounded-lg">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mb-1">Reason for Rejection:</span>
                <p className="text-sm text-zinc-800 italic leading-relaxed">"{rejectionReason}"</p>
              </div>
            </div>
            <button
              onClick={() => { setRejectionReason(null); setMode('login'); }}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-lg transition-all cursor-pointer border-none"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">

          {/* Login Method Toggle */}
          {mode === 'login' && (
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 text-sm font-semibold mb-2">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setForgotSuccess(null); }}
                className={`flex-1 px-1 min-h-[36px] rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  loginMethod === 'email'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setForgotSuccess(null); }}
                className={`flex-1 px-1 min-h-[36px] rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center ${
                  loginMethod === 'phone'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
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
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  placeholder="Enter your 10-digit number"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
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

          {/* Forgot → success: show token box */}
          {mode === 'forgot' && forgotSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-sm font-semibold text-emerald-900">Reset token generated!</p>
              </div>
              <p className="text-xs text-emerald-700">Copy this token and use it in the Reset Password form:</p>
              <div className="bg-white border border-emerald-200 rounded-lg p-3 flex items-center gap-2 justify-between">
                <code className="text-xs text-zinc-800 break-all flex-1">{forgotSuccess.resetToken}</code>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(forgotSuccess.resetToken)
                      .then(() => import('react-hot-toast').then(m => m.toast.success('Token copied!')))
                  }
                  className="text-xs font-bold text-brand hover:underline shrink-0 cursor-pointer border-none bg-transparent"
                >
                  Copy
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setMode('reset'); setForgotSuccess(null); }}
                className="w-full mt-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <KeyRound className="w-3.5 h-3.5" /> Go to Reset Password
              </button>
            </div>
          )}

          {/* Reset success state */}
          {mode === 'reset' && resetSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Password reset successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">Redirecting to sign in…</p>
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

          {/* Email — login, register, forgot (but not after success) */}
          {(mode === 'register' || mode === 'forgot' || (mode === 'login' && loginMethod === 'email')) && !forgotSuccess && (
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

          {/* Reset Token — reset mode only */}
          {mode === 'reset' && !resetSuccess && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 block">Reset Token</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  name="resetToken"
                  value={formData.resetToken}
                  onChange={handleInputChange}
                  placeholder="Paste your reset token here"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all font-mono"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 focus:outline-none cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password — reset mode */}
          {mode === 'reset' && !resetSuccess && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer transition-colors"
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
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          {!forgotSuccess && !resetSuccess && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login'    ? (loginMethod === 'phone' && !isOtpSent ? 'Send OTP' : 'Sign In')         :
                       mode === 'register' ? 'Sign Up'         :
                       mode === 'forgot'   ? 'Get Reset Token' :
                                            'Reset Password'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

        </form>
        )}

        {/* Footer */}
        {!rejectionReason && (
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
            {(mode === 'forgot' || mode === 'reset') && (
              <>Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setForgotSuccess(null); setResetSuccess(false); }}
                  className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer"
                >
                  Sign In
                </button>
                {mode === 'forgot' && !forgotSuccess && (
                  <>{' '}&bull;{' '}
                    <button type="button" onClick={() => setMode('reset')} className="font-bold text-brand hover:underline cursor-pointer">
                      Have a token?
                    </button>
                  </>
                )}
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
