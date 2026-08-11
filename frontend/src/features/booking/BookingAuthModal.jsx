import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, KeyRound, Loader2 } from 'lucide-react';
import ApiService from '../../services/api';

const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;

export default function BookingAuthModal({ isOpen, onClose, onSuccess, bookingForm, setBookingForm }) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFieldErrors({});
      setOtpPhone(bookingForm?.phone || '');
      setOtpCode('');
      setIsOtpSent(false);
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
        const res = await ApiService.sendOtp(otpPhone);
        if (res.success) {
          setIsOtpSent(true);
          import('react-hot-toast').then(mod => mod.toast.success('WhatsApp OTP sent!'));
        } else throw new Error(res.message || 'Failed to send OTP');
        setIsLoading(false);
        return;
      } else {
        const res = await ApiService.verifyOtp(otpPhone, otpCode, true, 'user');
        if (res.success) {
          if (setBookingForm) setBookingForm(prev => ({ ...prev, name: prev.name || res.data.user.name, phone: otpPhone, email: prev.email || res.data.user.email }));
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

  return createPortal(
    <>
      <div className="fixed inset-0 z-[120] bg-zinc-900/60 backdrop-blur-md animate-backdrop-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[125] flex items-start sm:items-center justify-center min-h-screen p-4 pt-12 sm:pt-4 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="booking-auth-modal-title" onClick={onClose}>
        <div className="relative w-full max-w-md max-h-[calc(100vh-4rem)] bg-white rounded-xl shadow-2xl overflow-y-auto animate-modal-in border border-surface-200 text-left" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
            <div className="min-w-0">
              <h2 id="booking-auth-modal-title" className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase">Sign In</h2>
              <p className="text-xs text-surface-500 font-normal mt-1">Verify your WhatsApp number to link this booking securely.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none">
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isOtpSent && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">WhatsApp Phone Number</label>
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

            {isOtpSent && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 block">Enter 6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.otpCode) setFieldErrors(prev => ({ ...prev, otpCode: null }));
                    }}
                    placeholder="123456"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border font-mono tracking-widest text-center ${fieldErrors.otpCode ? 'bg-rose-50/40 border-rose-400' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'}`}
                  />
                </div>
                {fieldErrors.otpCode && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpCode}</p>}
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{!isOtpSent ? 'Send OTP' : 'Sign In'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
