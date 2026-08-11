import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Loader2, KeyRound } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateIndianPhone, parseIndianPhone } from '../../utils/validation';

export default function AuthModals({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);

  // OTP Login State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setOtpPhone('');
      setOtpCode('');
      setIsOtpSent(false);
      setRejectionReason(null);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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

  const showToast = (msg, type = 'error') => {
    import('react-hot-toast').then(mod => {
      if (type === 'success') mod.toast.success(msg);
      else mod.toast.error(msg);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loggedUser = null;

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
        const res = await ApiService.verifyOtp(cleanPhone, otpCode, true, 'user');
        
        if (res.success && res.data && res.data.user) {
          loggedUser = res.data.user;
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

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-zinc-900/60 backdrop-blur-md animate-backdrop-in" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 sm:p-6 overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-full overflow-y-auto animate-modal-in border border-zinc-200 m-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex justify-between items-start gap-4 p-6 sm:p-7 border-b border-surface-200">
            <div className="min-w-0">
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase">
                {rejectionReason ? 'Application Rejected' : 'Sign In'}
              </h2>
              <p className="text-xs text-surface-500 font-normal mt-1">
                {rejectionReason ? 'Your counselor application has been declined.' : 'Enter your WhatsApp number to sign in securely.'}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="w-9 h-9 shrink-0 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer flex items-center justify-center border-none">
              <X className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>

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
              <button onClick={() => setRejectionReason(null)} className="w-full py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer border border-[#00e5ff]/30">
                Return to Login
              </button>
            </div>
          ) : (
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
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full pl-16 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    />
                  </div>
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
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-mono tracking-widest text-center"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={isLoading} className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold hover-scale-btn text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{!isOtpSent ? 'Send OTP' : 'Sign In'}</span>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </>,
    document.body
  );
}
