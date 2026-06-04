import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModals({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const { login, register } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setError('');
      setMode('login');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (mode === 'login') {
        if (!formData.email.trim() || !formData.password) throw new Error("Please fill in all fields");
        if (!emailRegex.test(formData.email)) throw new Error("Please enter a valid email address");
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) throw new Error("Please fill in all fields");
        if (!emailRegex.test(formData.email)) throw new Error("Please enter a valid email address");
        if (formData.password.length < 6) throw new Error("Password must be at least 6 characters");
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");
        await register(formData.name, formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl font-header font-black tracking-tight text-zinc-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {mode === 'login' ? 'Enter your details to sign in.' : 'Join BEHOLD and book your sessions.'}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-zinc-650" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-lg">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-650 font-medium">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-zinc-900 hover:text-brand transition-colors underline cursor-pointer"
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
