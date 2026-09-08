import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, UploadCloud, CheckCircle, Lock, Phone } from 'lucide-react';
import ApiService from '../../services/api';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../services/api';
import BrandIcon from '../../components/common/BrandIcon';

export default function ActivitySheetView() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [worksheet, setWorksheet] = useState(null);
  
  // OTP Auth States
  const [authChecking, setAuthChecking] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp
  const [authLoading, setAuthLoading] = useState(false);
  
  // Submission State
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Check auth and load worksheet
  useEffect(() => {
    checkAccess();
  }, [token]);

  async function checkAccess() {
    try {
      setAuthChecking(true);
      const res = await ApiService.getClientWorksheetByToken(token);
      
      if (res.success) {
        setWorksheet(res.data);
        setNeedsAuth(false);
      } else {
        // If 401 or 403, we probably need OTP
        setNeedsAuth(true);
      }
    } catch (err) {
      if (err.message && err.message.includes('403')) {
        setNeedsAuth(true);
      } else if (err.message && err.message.includes('401')) {
        setNeedsAuth(true);
      } else {
        toast.error('Failed to load activity sheet. It may be expired.');
      }
    } finally {
      setAuthChecking(false);
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error('Please enter your WhatsApp number');
    
    setAuthLoading(true);
    try {
      const res = await ApiService.requestLoginOTP(phone);
      if (res.success) {
        toast.success('OTP sent to your WhatsApp');
        setStep('otp');
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Error sending OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    
    setAuthLoading(true);
    try {
      const res = await ApiService.verifyLoginOTP(phone, otp);
      if (res.success && res.data && res.data.accessToken) {
        toast.success('Verified successfully');
        // Token is already stored by ApiService
        setNeedsAuth(false);
        checkAccess(); // reload worksheet
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Error verifying OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitFile) return toast.error('Please select your completed PDF file.');
    
    try {
      setSubmitting(true);
      const res = await ApiService.submitCompletedWorksheet(token, submitFile);
      if (res.success) {
        toast.success('Activity sheet submitted successfully!');
        setWorksheet({ ...worksheet, status: 'SUBMITTED', completedAt: res.data.completedAt });
      } else {
        toast.error(res.message || 'Failed to submit');
      }
    } catch (err) {
      toast.error('Error submitting worksheet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadOriginal = () => {
    const jwt = localStorage.getItem('behold_token');
    fetch(`${getApiUrl()}/worksheets/client/${token}/file`, {
      headers: { 'Authorization': `Bearer ${jwt}` }
    })
    .then(res => res.blob())
    .then(blob => {
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = worksheet.originalFileName;
       a.click();
    })
    .catch(() => toast.error('Error downloading file'));
  };

  // --- RENDERS ---

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <BrandIcon className="w-12 h-12 text-emerald-500 animate-pulse mb-6" />
        <p className="text-zinc-400">Verifying access...</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Secure Access</h2>
          <p className="text-sm text-zinc-400 mb-8">
            Please verify your identity to access this activity sheet.
          </p>
          
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-zinc-400 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter registered number"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {authLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-zinc-400 mb-1">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors text-center tracking-widest text-lg font-mono"
                />
              </div>
              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {authLoading ? 'Verifying...' : 'Access Activity Sheet'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="text-xs text-zinc-500 hover:text-zinc-300 w-full mt-4"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <p className="text-zinc-400">Activity sheet not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8 flex justify-center items-start pt-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <BrandIcon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-xl font-bold text-white">BEHOLD Activity Sheet</h1>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="text-2xl font-bold text-white mb-2">{worksheet.originalFileName}</h2>
            {worksheet.optionalMessage && (
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl mt-4">
                <p className="text-sm text-zinc-300 italic">"{worksheet.optionalMessage}"</p>
              </div>
            )}
            
            <button 
              onClick={handleDownloadOriginal}
              className="mt-6 flex items-center justify-center gap-2 w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-colors border border-zinc-700"
            >
              <Download className="w-5 h-5" /> Download Worksheet
            </button>
          </div>
          
          <div className="p-6 sm:p-8">
            {worksheet.status === 'SUBMITTED' ? (
              <div className="bg-emerald-900/20 border border-emerald-900/50 rounded-xl p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Successfully Submitted</h3>
                <p className="text-sm text-zinc-400">
                  Your completed activity sheet has been securely submitted to your psychologist.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" /> Upload Completed Worksheet
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  Once you have completed the activity sheet, upload the PDF file here.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => setSubmitFile(e.target.files[0])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting || !submitFile}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-xl transition-colors text-sm sm:text-base shadow-lg shadow-emerald-900/20 flex justify-center items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Submit Completed Worksheet'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
