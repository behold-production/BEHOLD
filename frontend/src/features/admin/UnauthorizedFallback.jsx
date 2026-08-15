import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function UnauthorizedFallback({ roleRequired }) {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password, 'admin');
      if (loggedUser) {
        const role = loggedUser.role?.toUpperCase();
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'SUB_ADMIN') {
          setError('Unauthorized. This portal is restricted to administrators.');
          logout();
        } else {
          navigate('/admin');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      logout();
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden text-left'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 pointer-events-none'
        style={{ background: 'radial-gradient(circle at 35% 45%, rgba(0, 229, 255, 0.08), transparent 50%), radial-gradient(circle at 65% 55%, rgba(99, 102, 241, 0.05), transparent 50%)' }} />

      <div className='text-center mb-8 relative z-10'>
        <h1 className='text-3xl font-extrabold tracking-wider text-white font-header'>
          BEHOLD<span className='text-[#00E5FF]'>.</span>
        </h1>
        <p className='text-[10px] tracking-[0.25em] font-semibold text-slate-400 mt-2 uppercase'>
          Administrator Control Gate
        </p>
      </div>

      <div className='relative z-10 w-full max-w-[420px] bg-[#0c1424]/95 backdrop-blur-xl border border-slate-800/80 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300'>
        <div className='p-8'>
          <div>
            <h2 className='text-lg font-semibold text-white text-left font-header'>
              Sign In To Dashboard
            </h2>
            <p className='text-xs text-slate-500 text-left mt-1.5 mb-6 leading-relaxed'>
              Security clearance required for system administration.
            </p>

            {error && (
              <div className='mb-5 p-3.5 bg-red-955/30 border border-red-900/50 rounded-lg text-red-200 text-xs font-medium text-left'>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className='space-y-5 text-left'>
              <div>
                <label className='block text-xs font-medium text-slate-400 mb-2'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                  placeholder='Enter Your Email Id'
                  disabled={loading}
                />
              </div>

              <div>
                <label className='block text-xs font-medium text-slate-400 mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] pr-10 transition duration-200'
                    placeholder='••••••••'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition cursor-pointer bg-transparent border-none outline-none'
                  >
                    {showPassword ? <EyeOff className='w-4.5 h-4.5' /> : <Eye className='w-4.5 h-4.5' />}
                  </button>
                </div>
              </div>

              <div className='pt-2 flex flex-col gap-3'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-[#00E5FF] hover:bg-[#00bccc] text-slate-950 font-semibold py-3 rounded-lg text-sm transition duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00E5FF]/10'
                >
                  {loading ? (
                    <div className='w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto' />
                  ) : (
                    'Enter Admin Console'
                  )}
                </button>

                <button
                  type='button'
                  onClick={() => navigate('/')}
                  className='w-full text-center text-xs text-slate-500 hover:text-slate-350 transition pt-2 cursor-pointer active:scale-[0.98] bg-transparent border-none outline-none'
                >
                  Back to Homepage
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
