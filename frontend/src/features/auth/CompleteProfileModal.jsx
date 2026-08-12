import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Mail, User, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';

const FEELING_OPTIONS = [
  '😊 Good & Calm',
  '😰 Anxious & Stressed',
  '😔 Low & Overwhelmed',
  '🤔 Seeking Guidance',
  '😴 Exhausted / Burnout'
];

export default function CompleteProfileModal({ isOpen, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name && !user.name.includes('Behold User') ? user.name : '',
    email: user?.email && !user.email.includes('@temp.behold') ? user.email : '',
    age: user?.age || '',
    feelingLately: user?.feelingLately || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectFeeling = (opt) => {
    setFormData(prev => ({ ...prev, feelingLately: opt }));
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
    
    if (!validateEmail(cleanEmail) || cleanEmail.includes('@temp.behold')) {
      toast.error('Please enter a valid real email address');
      return;
    }

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 5 || Number(formData.age) > 100) {
      toast.error('Please enter a valid age (between 5 and 100)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiService.updateProfile({ 
        name: formData.name.trim(), 
        email: cleanEmail,
        age: String(formData.age).trim(),
        feelingLately: formData.feelingLately.trim()
      });
      
      if (res.success) {
        toast.success('Profile completed successfully!');
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
      {/* Backdrop */}
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
              Please enter your details to personalize your experience and confirm your appointments.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 block">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 block">Age *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 24"
                  min="5"
                  max="100"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* How have you been feeling lately? (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 flex items-center justify-between">
                <span>How have you been feeling lately?</span>
                <span className="text-[10px] text-zinc-400 font-normal">(Optional)</span>
              </label>
              
              {/* Quick Select Pills */}
              <div className="flex flex-wrap gap-1.5">
                {FEELING_OPTIONS.map((opt) => {
                  const selected = formData.feelingLately === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectFeeling(selected ? '' : opt)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#0f172a] text-[#00c9d6] border-[#00c9d6]'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="relative pt-1">
                <Heart className="absolute left-3 top-4 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  name="feelingLately"
                  value={formData.feelingLately}
                  onChange={handleInputChange}
                  placeholder="Or describe briefly in your own words..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-brand outline-none font-medium"
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
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue to Payment'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>,
    document.body
  );
}
