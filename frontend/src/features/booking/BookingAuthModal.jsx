import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, User, Mail, Loader2, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import ApiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { validateIndianPhone, parseIndianPhone, validateEmail } from '../../utils/validation';
import OtpPinInput from '../../components/common/OtpPinInput';
import { trackCompleteRegistration, setMetaUserData } from '../../utils/metaPixel';

const OTP_RESEND_SECONDS = 60;

export default function BookingAuthModal({ isOpen, onClose, onSuccess, bookingForm, setBookingForm }) {
  const { updateUser } = useAuth();

  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp' | 'details'
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Details State
  const [detailsForm, setDetailsForm] = useState({ name: '', email: '' });
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

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
    if (authStep === 'details') {
      setAuthStep('otp');
      return;
    }
    if (authStep === 'otp') {
      setAuthStep('phone');
      setOtpCode('');
      clearInterval(timerRef.current);
      setResendTimer(0);
      return;
    }
    onClose();
  }, [authStep, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAuthStep('phone');
      setFieldErrors({});

      const initialPhone = bookingForm?.phone ? parseIndianPhone(bookingForm.phone).phone10 : '';
      const initialName = (bookingForm?.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') && !bookingForm.name.toLowerCase().includes('test student')) ? bookingForm.name : '';
      const initialEmail = (bookingForm?.email && !bookingForm.email.includes('@temp.behold') && bookingForm.email.includes('@')) ? bookingForm.email : '';

      setOtpPhone(initialPhone);
      setOtpCode('');
      setDetailsForm({ name: initialName, email: initialEmail });
      setAuthenticatedUser(null);
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

  const showToast = (msg, type = 'error') => {
    import('react-hot-toast').then(mod => {
      if (type === 'success') mod.toast.success(msg);
      else mod.toast.error(msg);
    });
  };

  const sendOtp = async (phone) => {
    const cleanPhone = parseIndianPhone(phone).phone10;
    const res = await ApiService.sendOtp(cleanPhone);
    if (res.success) return true;
    throw new Error(res.message || 'Failed to send OTP');
  };

  // Step 1 (Phone) & Step 2 (OTP) Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (authStep === 'phone') {
        const cleanPhone = parseIndianPhone(otpPhone).phone10;
        if (!cleanPhone) throw new Error('Phone number is required');
        if (!validateIndianPhone(cleanPhone)) throw new Error('Please enter a valid 10-digit Indian phone number');

        await sendOtp(cleanPhone);
        setAuthStep('otp');
        startResendTimer();
        showToast('OTP sent to your WhatsApp!', 'success');
        setIsLoading(false);
        return;
      } else if (authStep === 'otp') {
        if (!otpCode.trim() || otpCode.length !== 6) throw new Error('Please enter the 6-digit code');
        const cleanPhone = parseIndianPhone(otpPhone).phone10;
        const res = await ApiService.verifyOtp(cleanPhone, otpCode, true, 'user');

        if (res.success && res.data && res.data.user) {
          const loggedUser = res.data.user;
          setAuthenticatedUser(loggedUser);

          // Update Auth context immediately so user session is valid
          if (updateUser) {
            updateUser(loggedUser);
          }

          setMetaUserData({
            ph: cleanPhone,
            id: loggedUser.id,
            fn: loggedUser.name
          });
          trackCompleteRegistration({
            method: 'whatsapp_otp',
            role: loggedUser.role || 'user'
          });

          // Pre-fill with existing name & email if available, and ALWAYS transition to Details step so user confirms/saves
          const validFormName = (bookingForm?.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') && !bookingForm.name.toLowerCase().includes('test student')) ? bookingForm.name.trim() : '';
          const validFormEmail = (bookingForm?.email && !bookingForm.email.includes('@temp.behold') && bookingForm.email.includes('@')) ? bookingForm.email.trim().toLowerCase() : '';
          const validUserName = (loggedUser.name && loggedUser.name !== 'New User' && !loggedUser.name.includes('Behold User') && !loggedUser.name.toLowerCase().includes('test student')) ? loggedUser.name.trim() : '';
          const validUserEmail = (loggedUser.email && !loggedUser.email.includes('@temp.behold') && loggedUser.email.includes('@')) ? loggedUser.email.trim().toLowerCase() : '';

          const resolvedName = validFormName || validUserName;
          const resolvedEmail = validFormEmail || validUserEmail;

          // Always show details popup with existing data prefilled so user can review/save it
          setDetailsForm({
            name: resolvedName || '',
            email: resolvedEmail || ''
          });
          setAuthStep('details');
          setIsLoading(false);
          return;
        } else {
          throw new Error(res.message || 'Invalid OTP');
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('Status:')) {
        showToast(err.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3 (Details) Submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const cleanName = (detailsForm.name || '').trim();
    const cleanEmail = (detailsForm.email || '').trim().toLowerCase();
    const cleanPhone = parseIndianPhone(otpPhone).phone10;

    if (!cleanName) {
      errs.name = 'Full name is required for booking confirmation';
    } else if (cleanName.length < 2) {
      errs.name = 'Please enter a valid full name (at least 2 characters)';
    } else if (
      cleanName.toLowerCase() === 'new user' ||
      cleanName.toLowerCase() === 'test student' ||
      cleanName.toLowerCase() === 'student' ||
      cleanName.toLowerCase().startsWith('behold user')
    ) {
      errs.name = 'Please enter your actual real name';
    }

    if (!cleanEmail) {
      errs.email = 'Valid email is required for session confirmations & receipts';
    } else if (!validateEmail(cleanEmail) || cleanEmail.includes('@temp.behold') || cleanEmail.includes('temp.behold.co.in')) {
      errs.email = 'Please enter a valid, active email address';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErr = Object.values(errs)[0];
      showToast(firstErr);
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        isProfileCompleted: true
      };

      const res = await ApiService.updateProfile(updatePayload);
      const finalUser = {
        ...(authenticatedUser || {}),
        ...(res?.data || {}),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        isProfileCompleted: true
      };

      if (updateUser) {
        updateUser(finalUser);
      }

      if (setBookingForm) {
        setBookingForm(prev => ({
          ...prev,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone
        }));
      }

      setMetaUserData({
        em: cleanEmail,
        fn: cleanName,
        id: finalUser.id,
        ph: finalUser.phone
      });

      showToast(`Welcome, ${cleanName}! Details confirmed.`, 'success');
      if (onSuccess) onSuccess(finalUser);
      onClose();
    } catch (err) {
      showToast(err.message || 'Error saving booking details');
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

  return createPortal(
    <>
      <div className="fixed inset-0 z-[120] bg-zinc-900/60 backdrop-blur-md animate-backdrop-in" onClick={authStep === 'details' ? undefined : onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[125] flex items-start sm:items-center justify-center min-h-screen p-4 pt-12 sm:pt-4 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="booking-auth-modal-title" onClick={authStep === 'details' ? undefined : onClose}>
        <div className="relative w-full max-w-md max-h-[calc(100vh-4rem)] bg-white rounded-xl shadow-2xl overflow-y-auto animate-modal-in border border-surface-200 text-left" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
            <div className="flex items-center gap-3 min-w-0">
              {authStep !== 'phone' && (
                <button
                  type="button"
                  onClick={handleModalBack}
                  className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 text-[#0f172a] rounded-full transition-colors cursor-pointer flex items-center justify-center border-none"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <h2 id="booking-auth-modal-title" className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-[#0f172a]">
                  {authStep === 'details'
                    ? 'Enter Your Details'
                    : authStep === 'otp'
                    ? 'Verify OTP'
                    : 'Verify WhatsApp'}
                </h2>
                <p className="text-xs text-surface-500 font-normal mt-1">
                  {authStep === 'details'
                    ? 'Please enter your name and email to link and confirm your booking.'
                    : authStep === 'otp'
                    ? `Code sent to WhatsApp +91 ${otpPhone}`
                    : 'Verify your WhatsApp number to link this booking securely.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (authStep === 'details') {
                  ApiService.logout();
                  if (updateUser) updateUser(null);
                  try {
                    localStorage.removeItem('behold_auth_user');
                    localStorage.removeItem('behold_token');
                    localStorage.removeItem('behold_refresh_token');
                    window.dispatchEvent(new Event('storage'));
                  } catch {}
                  showToast('Booking cancelled. Please enter details to book.');
                }
                onClose();
              }}
              aria-label="Close dialog"
              className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none"
            >
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

          {authStep === 'details' ? (
            /* Step 3: Mandatory Details Entry */
            <form onSubmit={handleDetailsSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">Phone Verified: +91 {otpPhone}</p>
                  <p className="text-[11px] text-slate-500">Only the details you enter will be saved for this booking.</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={detailsForm.name}
                    onChange={(e) => {
                      setDetailsForm(prev => ({ ...prev, name: e.target.value }));
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null }));
                    }}
                    placeholder="e.g. Rahul Sharma"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-zinc-900 outline-none transition border ${
                      fieldErrors.name
                        ? 'bg-rose-50/40 border-rose-400'
                        : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={detailsForm.email}
                    onChange={(e) => {
                      setDetailsForm(prev => ({ ...prev, email: e.target.value }));
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-zinc-900 outline-none transition border ${
                      fieldErrors.email
                        ? 'bg-rose-50/40 border-rose-400'
                        : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs font-medium text-rose-500">{fieldErrors.email}</p>}
                <p className="text-[11px] text-zinc-400">Used for session calendar invites & confirmation receipts.</p>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Details & Continue to Booking</span>}
                </button>
              </div>
            </form>
          ) : (
            /* Step 1 & 2: Phone Input & OTP Verification */
            <form onSubmit={handleOtpSubmit} className="p-6 space-y-4">

              {/* Phone input */}
              {authStep === 'phone' && (
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
                      autoFocus
                      className={`w-full pl-16 pr-4 py-3 rounded-lg text-sm text-zinc-900 outline-none transition-all border ${fieldErrors.otpPhone ? 'bg-rose-50/40 border-rose-400' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20'}`}
                    />
                  </div>
                  {fieldErrors.otpPhone && <p className="text-xs font-medium text-rose-500">{fieldErrors.otpPhone}</p>}
                </div>
              )}

              {/* OTP input + resend */}
              {authStep === 'otp' && (
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
                    <span>{authStep === 'phone' ? 'Send OTP via WhatsApp' : 'Verify & Continue'}</span>
                  )}
                </button>
              </div>

              {/* Back link */}
              {authStep === 'otp' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('phone');
                      setOtpCode('');
                      clearInterval(timerRef.current);
                      setResendTimer(0);
                    }}
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
