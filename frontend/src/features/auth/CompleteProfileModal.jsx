import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Mail, User, Calendar, Heart, AlertCircle, X } from 'lucide-react';
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

export default function CompleteProfileModal({ isOpen, onSuccess, onClose }) {
  const { user, updateUser } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name && user.name !== 'New User' && !user.name.includes('Behold User') ? user.name : '',
    email: user?.email && !user.email.includes('@temp.behold') ? user.email : '',
    age: user?.age || '',
    feelingLately: user?.feelingLately || '',
    hadPriorTherapy: user?.hadPriorTherapy || '',
    priorTherapyDetails: user?.priorTherapyDetails || ''
  });
  const [errors, setErrors] = useState({});
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
      setErrors({});
    }
  }, [user, isOpen]);

  // If user completed their profile or dismissed this session, don't show
  const isProfileActuallyComplete = Boolean(
    user?.isProfileCompleted ||
    (user?.name &&
      user.name !== 'New User' &&
      !user.name.includes('Behold User') &&
      user?.email &&
      !user.email.includes('@temp.behold') &&
      !user.email.includes('temp.behold.co.in'))
  );

  useEffect(() => {
    if (isProfileActuallyComplete && isOpen) {
      if (onClose) onClose();
    }
  }, [isProfileActuallyComplete, isOpen, onClose]);

  if (!isOpen || isDismissed || !user || user.role === 'admin' || user.role === 'counsellor' || isProfileActuallyComplete) {
    return null;
  }

  const handleCloseModal = () => {
    setIsDismissed(true);
    if (onClose) onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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

  const validateForm = () => {
    const newErrors = {};

    // Name is mandatory
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid full name (at least 2 characters).';
    }

    // Email is mandatory
    const cleanEmail = (formData.email || '').trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = 'Email address is required for session confirmations & receipts.';
    } else if (!validateEmail(cleanEmail) || cleanEmail.includes('@temp.behold')) {
      newErrors.email = 'Please enter a valid, active email address.';
    }

    // Age is optional, but if entered, must be valid
    if (formData.age && String(formData.age).trim() !== '') {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
        newErrors.age = 'Please enter a valid age between 5 and 120.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    setIsLoading(true);
    try {
      const campaign = getStoredCampaignData();
      const payload = { 
        name: formData.name.trim(), 
        email: cleanEmail,
        age: formData.age ? String(formData.age).trim() : '',
        feelingLately: (formData.feelingLately || '').trim(),
        hadPriorTherapy: (formData.hadPriorTherapy || '').trim(),
        priorTherapyDetails: (formData.priorTherapyDetails || '').trim(),
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
          name: formData.name.trim(),
          email: cleanEmail,
          age: formData.age ? String(formData.age).trim() : '',
          isProfileCompleted: true
        };
        
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

        setIsDismissed(true);
        toast.success('Profile completed successfully!');
        if (onSuccess) onSuccess(updatedUser);
        if (onClose) onClose();
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
      <div 
        className="fixed inset-0 z-[200] bg-zinc-900/80 backdrop-blur-md animate-backdrop-in" 
        onClick={handleCloseModal}
        aria-hidden="true" 
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain">
        <div 
          className="relative w-full max-w-md my-auto bg-white rounded-2xl shadow-2xl animate-modal-in border border-zinc-200 flex flex-col max-h-[92vh] overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="relative p-5 sm:p-6 border-b border-surface-200 text-center bg-gradient-to-b from-slate-50 to-white shrink-0">
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close profile modal"
              className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg sm:text-xl font-sans font-bold tracking-tight text-[#0f172a] uppercase pr-6">
              Complete Your Profile
            </h2>
            <p className="text-xs text-surface-500 font-normal mt-1.5 leading-relaxed max-w-xs mx-auto">
              Please enter your details to personalize your experience and confirm your sessions.
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 border border-amber-200/60 rounded-full text-[11px] text-amber-800 font-medium">
              <span className="text-rose-500 font-bold text-xs">*</span>
              <span>Fields marked with red star are mandatory</span>
            </div>
          </div>

          {/* Form with clean internal scrolling */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            
            {/* Full Name - MANDATORY */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center">
                <span>Full Name</span>
                <span className="text-rose-500 font-bold ml-1 text-sm leading-none">*</span>
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.name ? 'text-rose-400' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-50 border rounded-xl text-sm text-zinc-900 focus:bg-white focus:ring-2 outline-none transition-all font-medium ${
                    errors.name 
                      ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200' 
                      : 'border-zinc-200 focus:border-brand focus:ring-brand/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email Address - MANDATORY */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center">
                <span>Email Address</span>
                <span className="text-rose-500 font-bold ml-1 text-sm leading-none">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? 'text-rose-400' : 'text-zinc-400'}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-50 border rounded-xl text-sm text-zinc-900 focus:bg-white focus:ring-2 outline-none transition-all font-medium ${
                    errors.email 
                      ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200' 
                      : 'border-zinc-200 focus:border-brand focus:ring-brand/20'
                  }`}
                />
              </div>
              {errors.email ? (
                <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-400">Used for session links, Google Meet invites and booking receipts.</p>
              )}
            </div>

            {/* Age - OPTIONAL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                <span>Age</span>
                <span className="text-[11px] font-normal text-zinc-400 font-sans">(Optional)</span>
              </label>
              <div className="relative">
                <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.age ? 'text-rose-400' : 'text-zinc-400'}`} />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g. 24"
                  min="5"
                  max="120"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-50 border rounded-xl text-sm text-zinc-900 focus:bg-white focus:ring-2 outline-none transition-all font-medium ${
                    errors.age 
                      ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200' 
                      : 'border-zinc-200 focus:border-brand focus:ring-brand/20'
                  }`}
                />
              </div>
              {errors.age && (
                <p className="text-[11px] font-medium text-rose-500 flex items-center gap-1 mt-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* How have you been feeling lately? - OPTIONAL */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                <span>How have you been feeling lately?</span>
                <span className="text-[11px] font-normal text-zinc-400 font-sans">(Optional)</span>
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
                <Heart className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  name="feelingLately"
                  value={formData.feelingLately}
                  onChange={handleInputChange}
                  placeholder="Or describe briefly in your own words..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-brand outline-none font-medium"
                />
              </div>
            </div>

            {/* Prior Therapy Experience - OPTIONAL */}
            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Prior Therapy Experience
                </h3>
                <span className="text-[11px] font-normal text-zinc-400 font-sans">(Optional)</span>
              </div>

              {/* 1. Have you had any prior therapy experience? */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 block">
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
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
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
                  <label className="text-xs font-medium text-zinc-600 block">
                    2. If yes, please tell us more about it
                  </label>
                  <textarea
                    name="priorTherapyDetails"
                    rows={2}
                    value={formData.priorTherapyDetails}
                    onChange={handleInputChange}
                    placeholder="Tell us a little more about your prior therapy experience..."
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:bg-white focus:border-brand outline-none font-medium resize-none"
                  />
                </div>
              )}
            </div>

            {/* Submit & Dismiss Row */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 min-h-[46px] bg-zinc-900 hover:bg-zinc-800 text-white font-semibold hover-scale-btn text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
              </button>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2 text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer bg-transparent border-none text-center"
              >
                Skip for now & continue
              </button>
            </div>
          </form>

        </div>
      </div>
    </>,
    document.body
  );
}
