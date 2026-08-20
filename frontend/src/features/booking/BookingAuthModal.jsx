import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, KeyRound, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import ApiService from '../../services/api';
import OtpPinInput from '../../components/common/OtpPinInput';

const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
const OTP_RESEND_SECONDS = 60;

export default function BookingAuthModal({ isOpen, onClose, onSuccess, bookingForm, setBookingForm }) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // OTP State
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
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFieldErrors({});
      setOtpPhone(bookingForm?.phone || '');
      setOtpCode('');
      setIsOtpSent(false);
      setResendTimer(0);
      clearInterval(timerRef.current);
    } else {
      document.body.style.overflow = '';
      clearInterval(timerRef.current);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, bookingForm]);

  // Body scroll lock + Esc to close + popstate history back
  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const stateId = `booking_auth_modal_${Date.now()}`;
    window.history.pushState({ modalState: stateId }, '');

    const handleEsc = (e) => { if (e.key === 'Escape') handleModalBack(); };
    const handlePopState = () => { handleModalBack(); };

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

  const sendOtp = async (phone) => {
    const res = await ApiService.sendOtp(phone);
    if (res.success) return true;
    throw new Error(res.message || 'Failed to send OTP');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};

    if (!isOtpSent) {
      if (!otpPhone.trim()) err.otpPhone = 'Phone number is required';
      else if (!phoneRegex.test(otpPhone.trim())) err.otpPhone = 'Please enter a valid phone number';
    } else {
      if (!otpCode.trim() || otpCode.length !== 6) err.otpCode = 'Please enter the 6-digit code';
    }

    if (Object.keys(err).length) { setFieldErrors(err); return; }

    setIsLoading(true);
    try {
      if (!isOtpSent) {
        await sendOtp(otpPhone);
        setIsOtpSent(true);
        startResendTimer();
        import('react-hot-toast').then(mod => mod.toast.success('OTP sent to your WhatsApp!'));
        setIsLoading(false);
        return;
      } else {
        const res = await ApiService.verifyOtp(otpPhone, otpCode, true, 'user');
        if (res.success) {
          if (setBookingForm) {
            setBookingForm(prev => ({
              ...prev,
              name: (res.data.user?.name && !res.data.user.name.includes('Behold User')) ? res.data.user.name : prev.name,
              phone: otpPhone,
              email: (res.data.user?.email && !res.data.user.email.includes('@temp.behold')) ? res.data.user.email : prev.email,
              age: res.data.user?.age || prev.age || '',
              feelingLately: res.data.user?.feelingLately || prev.feelingLately || '',
              hadPriorTherapy: res.data.user?.hadPriorTherapy || prev.hadPriorTherapy || '',
              priorTherapyDetails: res.data.user?.priorTherapyDetails || prev.priorTherapyDetails || ''
            }));
          }
          if (onSuccess) onSuccess(res.data.user);
        } else throw new Error(res.message || 'Invalid OTP');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      if (err.message && !err.message.includes('Status:')) {
        import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Authentication failed.'));
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
      import('react-hot-toast').then(mod => mod.toast.success('OTP resent to your WhatsApp!'));
    } catch (err) {
      import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Failed to resend OTP'));
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (s) => `0:${String(s).padStart(2, '0')}`;
  const canResend = resendTimer === 0 && !isResending;

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[120] bg-zinc-900/60 backdrop-blur-md animate-backdrop-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[125] flex items-start sm:items-center justify-center min-h-screen p-4 pt-12 sm:pt-4 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="booking-auth-modal-title" onClick={onClose}>
        <div className="relative w-full max-w-md max-h-[calc(100vh-4rem)] bg-white rounded-xl shadow-2xl overflow-y-auto animate-modal-in border border-surface-200 text-left" onClick={(e) => e.stopPropagation()}>

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
                <h2 id="booking-auth-modal-title" className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-[#0f172a]">
                  {isOtpSent ? 'Verify OTP' : 'Sign In'}
                </h2>
                <p className="text-xs text-surface-500 font-normal mt-1">
                  {isOtpSent
                    ? `Code sent to WhatsApp +91 ${otpPhone}`
                    : 'Verify your WhatsApp number to link this booking securely.'}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none">
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

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
                    onChange={(e) => {
                      setOtpPhone(e.target.value);
                      if (fieldErrors.otpPhone) setFieldErrors(prev => ({ ...prev, otpPhone: null }));
                    }}
                    placeholder="10-digit number"
                    className={`w-full pl-16 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border ${fieldErrors.otpPhone ? 'bg-rose-50/40 border-rose-400' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'}`}
                  />
                </div>
                {fieldErrors.otpPhone && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpPhone}</p>}
              </div>
            )}

            {/* OTP input + resend */}
            {isOtpSent && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 block">6-Digit Verification Code</label>
                  <OtpPinInput
                    value={otpCode}
                    onChange={(code) => {
                      setOtpCode(code);
                      if (fieldErrors.otpCode) setFieldErrors(prev => ({ ...prev, otpCode: null }));
                    }}
                    hasError={!!fieldErrors.otpCode}
                    disabled={isLoading}
                  />
                  {fieldErrors.otpCode && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpCode}</p>}
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
              <button type="submit" disabled={isLoading} className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{!isOtpSent ? 'Send OTP via WhatsApp' : 'Verify & Sign In'}</span>
                )}
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
        </div>
      </div>
    </>,
    document.body
  );
}
