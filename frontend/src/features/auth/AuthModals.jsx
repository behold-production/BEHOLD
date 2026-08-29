import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Loader2, KeyRound, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateIndianPhone, parseIndianPhone } from '../../utils/validation';
import OtpPinInput from '../../components/common/OtpPinInput';
import { trackCompleteRegistration, setMetaUserData } from '../../utils/metaPixel';

const OTP_RESEND_SECONDS = 60;

export default function AuthModals({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);

  // OTP Login State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const startResendTimer = useCallback(() => {
    setResendTimer(OTP_RESEND_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleModalBack = useCallback(() => {
    if (isOtpSent) {
      setIsOtpSent(false);
      setOtpCode('');
      clearInterval(timerRef.current);
      setResendTimer(0);
      return;
    }
    onClose();
  }, [isOtpSent, onClose]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setOtpPhone('');
      setOtpCode('');
      setIsOtpSent(false);
      setRejectionReason(null);
      setResendTimer(0);
      clearInterval(timerRef.current);
    } else {
      document.body.style.overflow = '';
      clearInterval(timerRef.current);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Body scroll lock + Esc to close + popstate history back
  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const stateId = `auth_modal_${Date.now()}`;
    window.history.pushState({ modalState: stateId }, '');

    const handleEsc = (e) => {
      if (e.key === 'Escape') handleModalBack();
    };
    const handlePopState = () => {
      handleModalBack();
    };

    document.addEventListener('keydown', handleEsc);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.documentElement.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('popstate', handlePopState);
      clearInterval(timerRef.current);
    };
  }, [isOpen, handleModalBack]);

  if (!isOpen) return null;

  const showToast = (msg, type = 'error') => {
    import('react-hot-toast').then(mod => {
      if (type === 'success') mod.toast.success(msg);
      else mod.toast.error(msg);
    });
  };

  const sendOtp = async (phone) => {
    const cleanPhone = parseIndianPhone(phone).phone10;
    const res = await ApiService.sendOtp(cleanPhone);
    if (res.success) {
      return true;
    }
    throw new Error(res.message || 'Failed to send OTP');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loggedUser = null;

      if (!isOtpSent) {
        if (!otpPhone.trim()) throw new Error('Phone number is required');
        if (!validateIndianPhone(otpPhone)) throw new Error('Please enter a valid 10-digit Indian phone number');

        await sendOtp(otpPhone);
        setIsOtpSent(true);
        startResendTimer();
        showToast('OTP sent to your WhatsApp!', 'success');
        setIsLoading(false);
        return;
      } else {
        if (!otpCode.trim() || otpCode.length !== 6) throw new Error('Please enter the 6-digit code');
        const cleanPhone = parseIndianPhone(otpPhone).phone10;
        const res = await ApiService.verifyOtp(cleanPhone, otpCode, true, 'user');

        if (res.success && res.data && res.data.user) {
          loggedUser = res.data.user;

          // Track Meta Pixel CompleteRegistration & sync phone for Advanced Matching
          setMetaUserData({
            ph: cleanPhone,
            id: loggedUser.id,
            fn: loggedUser.name
          });
          trackCompleteRegistration({
            method: 'whatsapp_otp',
            role: loggedUser.role || 'user'
          });
        } else {
          throw new Error(res.message || 'Invalid OTP');
        }
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

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      await sendOtp(otpPhone);
      setOtpCode('');
      startResendTimer();
      showToast('OTP resent to your WhatsApp!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (s) => `0:${String(s).padStart(2, '0')}`;
  const canResend = resendTimer === 0 && !isResending;

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-zinc-900/60 backdrop-blur-md animate-backdrop-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-full overflow-y-auto animate-modal-in border border-zinc-200 m-auto flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
            <div className="flex items-center gap-3 min-w-0">
              {isOtpSent && (
                <button
                  type="button"
                  onClick={handleModalBack}
                  className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 text-[#0f172a] rounded-full transition-colors cursor-pointer flex items-center justify-center border-none"
                  aria-label="Back to Phone Input"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-[#0f172a]">
                  {rejectionReason ? 'Application Rejected' : isOtpSent ? 'Verify OTP' : 'Sign In'}
                </h2>
                <p className="text-xs text-surface-500 font-normal mt-1">
                  {rejectionReason
                    ? 'Your counselor application has been declined.'
                    : isOtpSent
                    ? `Code sent to WhatsApp +91 ${otpPhone}`
                    : 'Enter your WhatsApp number to sign in securely.'}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none">
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

          {/* Rejection state */}
          {rejectionReason ? (
            <div className="p-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                <p className="text-sm text-[#0f172a] leading-relaxed font-medium">
                  We regret to inform you that your professional counsellor application has been rejected by the system administrator.
                </p>
                <div className="bg-white border border-rose-100 p-3 rounded-xl">
                  <span className="text-[10px] font-semibold text-rose-600 tracking-wider block mb-1 uppercase">Reason for Rejection:</span>
                  <p className="text-sm text-zinc-800 italic leading-relaxed">"{rejectionReason}"</p>
                </div>
              </div>
              <button onClick={() => setRejectionReason(null)} className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer border border-[#00e5ff]/30">
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Phone input */}
              {!isOtpSent && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 block">WhatsApp Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4 h-4 text-zinc-400" />
                    <span className="absolute left-9 text-sm font-semibold text-zinc-700">+91</span>
                    <input
                      type="tel"
                      value={otpPhone}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* OTP input + resend */}
              {isOtpSent && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 block">6-Digit Verification Code</label>
                    <OtpPinInput
                      value={otpCode}
                      onChange={(code) => setOtpCode(code)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Resend row */}
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-xs text-zinc-400">Didn't receive the code?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                        Resend OTP
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-500 tabular-nums">
                        Resend in{' '}
                        <span className="text-brand font-semibold">{formatTimer(resendTimer)}</span>
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-0.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(resendTimer / OTP_RESEND_SECONDS) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{!isOtpSent ? 'Send OTP via WhatsApp' : 'Verify & Sign In'}</span>}
                </button>
              </div>

              {/* Back link */}
              {isOtpSent && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsOtpSent(false); setOtpCode(''); clearInterval(timerRef.current); setResendTimer(0); }}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    ← Change phone number
                  </button>
                </div>
              )}
            </form>
          )}

        </div>
      </div>
    </>,
    document.body
  );
}
