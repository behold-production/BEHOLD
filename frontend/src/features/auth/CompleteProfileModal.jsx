import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Mail, User, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';
import { validateEmail } from '../../utils/validation';
import toast from 'react-hot-toast';
import { trackCompleteRegistration, setMetaUserData, getStoredCampaignData } from '../../utils/metaPixel';

const FEELING_OPTIONS = [
  '😊 Good & Calm',
  '😰 Anxious & Stressed',
  '😔 Low & Overwhelmed',
  '🤔 Seeking Guidance',
  '😴 Exhausted / Burnout'
];

export default function CompleteProfileModal({ isOpen, onSuccess }) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name && user.name !== 'New User' && !user.name.includes('Behold User') ? user.name : '',
    email: user?.email && !user.email.includes('@temp.behold') ? user.email : '',
    age: user?.age || '',
    feelingLately: user?.feelingLately || '',
    hadPriorTherapy: user?.hadPriorTherapy || '',
    priorTherapyDetails: user?.priorTherapyDetails || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name && user.name !== 'New User' && !user.name.includes('Behold User') ? user.name : '',
        email: user?.email && !user.email.includes('@temp.behold') ? user.email : '',
        age: user?.age || '',
        feelingLately: user?.feelingLately || '',
        hadPriorTherapy: user?.hadPriorTherapy || '',
        priorTherapyDetails: user?.priorTherapyDetails || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user || user.role === 'admin' || user.role === 'counsellor' || user.isProfileCompleted) return null;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectFeeling = (opt) => {
    setFormData(prev => ({ ...prev, feelingLately: opt }));
  };

  const handleSelectPriorTherapy = (val) => {
    setFormData(prev => ({
      ...prev,
      hadPriorTherapy: val,
      priorTherapyDetails: val === 'No' ? '' : prev.priorTherapyDetails
    }));
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
      const campaign = getStoredCampaignData();
      const payload = { 
        name: formData.name.trim(), 
        email: cleanEmail,
        age: String(formData.age).trim(),
        feelingLately: formData.feelingLately.trim(),
        hadPriorTherapy: formData.hadPriorTherapy.trim(),
        priorTherapyDetails: formData.priorTherapyDetails.trim(),
        isProfileCompleted: true,
        utmSource: campaign.utm_source || '',
        utmCampaign: campaign.utm_campaign || '',
        utmMedium: campaign.utm_medium || '',
        fbclid: campaign.fbclid || ''
      };

      const res = await ApiService.updateProfile(payload);
      
      if (res.success && res.data) {
        const updatedUser = {
          ...user,
          ...res.data,
          isProfileCompleted: true
        };
        
        // Instantly update AuthContext & localStorage to ensure the modal never shows again
        if (updateUser) {
          updateUser(updatedUser);
        }
        try {
          localStorage.setItem('behold_auth_user', JSON.stringify(updatedUser));
        } catch {}

        setMetaUserData({
          em: cleanEmail,
          fn: formData.name.trim(),
          id: updatedUser.id,
          ph: updatedUser.phone
        });
        trackCompleteRegistration({
          method: 'profile_completion'
        });

        toast.success('Profile completed successfully!');
        if (onSuccess) onSuccess(updatedUser);
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[200] bg-zinc-900/80 backdrop-blur-md animate-backdrop-in" aria-hidden="true" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-modal-in border border-zinc-200 flex flex-col">
          
          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-surface-200 text-center">
            <h2 className="text-xl sm:text-2xl font-sans font-semibold tracking-tight text-[#0f172a] uppercase">
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
              <label className="text-xs font-semibold text-zinc-500 block">Full Name *</label>
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
              <label className="text-xs font-semibold text-zinc-500 block">Email Address *</label>
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
              <label className="text-xs font-semibold text-zinc-500 block">Age *</label>
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
              <label className="text-xs font-semibold text-zinc-500 flex items-center justify-between">
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

            {/* Prior Therapy Experience */}
            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Prior Therapy Experience
              </h3>

              {/* 1. Have you had any prior therapy experience? */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 block">
                  1. Have you had any prior therapy experience?
                </label>
                <div className="flex gap-2">
                  {['Yes', 'No'].map((opt) => {
                    const selected = formData.hadPriorTherapy === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectPriorTherapy(opt)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#0f172a] text-[#00c9d6] border-[#00c9d6] shadow-sm'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. If yes, please tell us more about it */}
              {formData.hadPriorTherapy === 'Yes' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className="text-xs font-semibold text-zinc-600 block">
                    2. If yes, please tell us more about it
                  </label>
                  <textarea
                    name="priorTherapyDetails"
                    rows={2}
                    value={formData.priorTherapyDetails}
                    onChange={handleInputChange}
                    placeholder="Tell us a little more about your prior therapy experience..."
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:bg-white focus:border-brand outline-none font-medium resize-none"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold hover-scale-btn text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
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
