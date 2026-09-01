import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Video,
  Calendar,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Download,
  HeartHandshake,
  User,
  Mail,
  Phone,
  FileText,
  Home
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { formatDateString } from '../../utils/dateFormatter';
import { trackPurchase } from '../../utils/metaPixel';
import { generateReceiptPDFDoc } from '../student/utils/utils';
import { toast } from 'react-hot-toast';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Retrieve last booking details from sessionStorage or URL query params
    let details = null;
    try {
      const stored = sessionStorage.getItem('last_booking_confirmation');
      if (stored) {
        details = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not parse last booking from session storage', e);
    }

    if (!details) {
      // Fallback from URL params or default placeholder for direct preview
      const advisorName = searchParams.get('advisor') || 'Dr. Sarah Thomas';
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const time = searchParams.get('time') || '10:00 AM';
      const amount = Number(searchParams.get('amount')) || 899;
      const meetLink = searchParams.get('meet') || 'https://meet.google.com/beh-olds-ess';

      details = {
        advisorName,
        advisorRole: 'Senior Clinical Psychologist',
        date,
        time,
        duration: '1 Hour',
        service: 'Psychological Counselling',
        mode: 'ONLINE',
        amountPaid: amount,
        meetLink,
        userName: searchParams.get('name') || 'Student',
        userEmail: searchParams.get('email') || '',
        userPhone: searchParams.get('phone') || ''
      };
    }

    setBookingData(details);

    // Meta Pixel Conversion Tracking (Purchase)
    trackPurchase({
      value: details?.amountPaid || 899,
      currency: 'INR',
      content_name: 'Psychological Counselling Session',
      content_type: 'product'
    });
  }, [searchParams]);

  const handleCopyLink = () => {
    if (bookingData?.meetLink) {
      navigator.clipboard.writeText(bookingData.meetLink);
      setCopied(true);
      toast.success('Meeting link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!bookingData) return;
    try {
      await generateReceiptPDFDoc({
        id: `BEH-${Date.now().toString().slice(-6)}`,
        counsellor: { name: bookingData.advisorName, role: bookingData.advisorRole },
        date: bookingData.date,
        time: bookingData.time,
        service: bookingData.service,
        mode: bookingData.mode,
        amount: bookingData.amountPaid,
        studentName: bookingData.userName,
        studentPhone: bookingData.userPhone,
        studentEmail: bookingData.userEmail
      }, (msg) => toast.error(msg));
      toast.success('Receipt downloaded successfully!');
    } catch (e) {
      console.error('Failed to download receipt', e);
      toast.error('Could not generate PDF receipt.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      <SEO
        title="Booking Confirmed | BEHOLD Psychological Counselling"
        description="Your confidential psychological counselling session is confirmed. We look forward to meeting you."
        canonicalUrl="https://www.behold.co.in/thank-you"
        noIndex={true}
      />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] bg-[#00c9d6]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-6">

        {/* Animated Checkmark & Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/10 animate-bounce duration-1000">
            <CheckCircle2 className="w-11 h-11" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Confirmed & Paid</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            ബുക്കിംഗ് വിജയകരമായി പൂർത്തിയായി!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-normal leading-relaxed">
            Thank you for taking this important step. Your confidential session with <strong className="text-slate-900 font-bold">{bookingData?.advisorName || 'your psychologist'}</strong> has been scheduled.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Appointment Summary</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {bookingData?.service || 'Psychological Counselling'}
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#00c9d6]/15 text-[#008b94] rounded-full border border-[#00c9d6]/30">
              {bookingData?.mode === 'ONLINE' ? 'Online Video' : 'In-Person'}
            </span>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">Psychologist</span>
              <span className="font-bold text-slate-900 text-sm block">{bookingData?.advisorName}</span>
              <span className="text-slate-500 text-[11px]">{bookingData?.advisorRole}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">Date & Time</span>
              <span className="font-bold text-slate-900 text-sm block">
                {formatDateString(bookingData?.date)}
              </span>
              <span className="text-slate-500 text-[11px]">{bookingData?.time} ({bookingData?.duration})</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">Amount Paid</span>
              <span className="font-bold text-emerald-600 text-sm block">₹{bookingData?.amountPaid}</span>
              <span className="text-slate-500 text-[11px]">Online Payment Verified</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 space-y-1">
              <span className="text-slate-400 font-semibold block text-[11px]">Client Name</span>
              <span className="font-bold text-slate-900 text-sm block">{bookingData?.userName || 'You'}</span>
              <span className="text-slate-500 text-[11px]">Confidential Client ID</span>
            </div>
          </div>

          {/* Google Meet Link Box */}
          {bookingData?.mode === 'ONLINE' && (
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#00c9d6]" />
                  <span className="text-xs font-bold text-white">Google Meet Session Link</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Ready to join</span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-300 truncate font-mono select-all">
                  {bookingData?.meetLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <a
                href={bookingData?.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#00c9d6] hover:bg-[#00b5c2] text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-center shadow-md cursor-pointer"
              >
                <span>Join Google Meet Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* What Happens Next Checklist */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ഇനി എന്ത് ചെയ്യണം? (What Happens Next)
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>WhatsApp & Email confirmation:</strong> നിങ്ങളുടെ booking വിവരങ്ങളും Google Meet ലിങ്കും WhatsApp/Email-ലേക്ക് അയച്ചിട്ടുണ്ട്.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Quiet & Private Space:</strong> മികച്ച അനുഭവത്തിനായി ശബ്ദകോലാഹലങ്ങളില്ലാത്ത സ്വകാര്യമായ ഒരിടത്തിരുന്ന് ഇയർഫോൺ ഉപയോഗിച്ച് സെഷനിൽ പങ്കെടുക്കുക.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Free Rescheduling:</strong> ആവശ്യമെങ്കിൽ സെഷൻ തുടങ്ങുന്നതിന് 1 മണിക്കൂർ മുൻപ് വരെ സൗജന്യമായി മറ്റൊരു സമയത്തേക്ക് മാറ്റാവുന്നതാണ്.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Receipt (PDF)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
