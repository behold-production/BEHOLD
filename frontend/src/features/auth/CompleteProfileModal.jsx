import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';

export default function CompleteProfileModal({ isOpen, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Assuming updateProfile can update name and email for the current user
      const res = await ApiService.updateProfile({ 
        name: formData.name.trim(), 
        email: cleanEmail 
      });
      
      if (res.success) {
        toast.success('Profile updated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop (solid to prevent closing) */}
      <div className="fixed inset-0 z-[200] bg-zinc-900/80 backdrop-blur-md animate-backdrop-in" aria-hidden="true" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-modal-in border border-zinc-200 flex flex-col">
          
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-surface-200 text-center">
            <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#0f172a] uppercase">
              Complete Your Profile
            </h2>
            <p className="text-xs text-surface-500 font-normal mt-2 leading-relaxed">
              Welcome! Since this is your first time signing in with WhatsApp, please enter your name and email to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Full Name */}
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
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold hover-scale-btn text-sm rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>,
    document.body
  );
}
