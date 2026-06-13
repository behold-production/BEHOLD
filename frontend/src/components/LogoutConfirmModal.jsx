import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

/**
 * LogoutConfirmModal
 * Props:
 *   isOpen  - boolean
 *   onConfirm - () => void  (actually log out)
 *   onCancel  - () => void  (close modal)
 *   theme   - 'dark' | 'light'  (default: 'dark')
 */
export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel, theme = 'dark' }) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('no-scroll');
    const handleEsc = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-zinc-900 border border-zinc-800'
            : 'bg-white border border-zinc-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close sign out confirmation"
          className={`absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg transition cursor-pointer border-none ${
            isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 text-center space-y-5">
          {/* Warning icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
            isDark ? 'bg-rose-950/40 border border-rose-900/40' : 'bg-rose-50 border border-rose-200'
          }`}>
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 id="logout-confirm-title" className={`text-base font-bold uppercase tracking-wider font-header ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              Sign Out?
            </h3>
            <p className={`text-[11px] leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              You are about to end your current session. You'll need to sign in again to access your dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className={`min-h-[44px] flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer border ${
                isDark
                  ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  : 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              Stay Signed In
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="min-h-[44px] flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition cursor-pointer border-none bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
