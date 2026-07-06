import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ApiService from '../../shared/services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    
    setIsSubmitting(true);
    try {
      const res = await ApiService.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password })
      });
      if (res.success) {
        toast.success("Password reset successfully. You can now log in.");
        setTimeout(() => navigate('/'), 2000);
      } else {
        toast.error(res.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="p-8 max-w-md bg-white rounded-2xl shadow-xl text-center border border-zinc-200">
          <h2 className="text-xl font-bold text-rose-500 mb-2">Invalid Link</h2>
          <p className="text-zinc-600 mb-6">No reset token found in the URL. Please use a valid reset link.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white rounded-2xl sm:rounded-[2rem] shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-brand font-header">Reset Password</h2>
          <p className="text-sm text-zinc-500 mt-2 font-medium">Create a new password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-medium"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-full font-bold text-sm shadow-xl shadow-brand/20 hover:shadow-brand/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
