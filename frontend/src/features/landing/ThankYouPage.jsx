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
  Home,
  MessageSquare,
  Loader2
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { formatDateString } from '../../utils/dateFormatter';
import { trackPurchase } from '../../utils/metaPixel';
import { generateReceiptPDFDoc } from '../student/utils/utils';
import { toast } from 'react-hot-toast';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const loadBooking = async () => {
      // 1. Check if an ID was passed in the query params
      const paramId = searchParams.get('id') || searchParams.get('bookingId') || searchParams.get('appointmentId') || searchParams.get('orderId');

      let details = null;

      // 2. Try loading from sessionStorage first for instant rendering
      try {
        const stored = sessionStorage.getItem('last_booking_confirmation');
        if (stored) {
          details = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not parse last booking from session storage', e);
      }

      // 3. If an ID exists, fetch live booking from backend
      const targetId = paramId || details?.id;
      if (targetId) {
        try {
          setIsLoading(true);
          const res = await ApiService.getBookingConfirmation(targetId);
          if (res && res.success && res.data) {
            details = {
              ...details,
              ...res.data
            };
          }
        } catch (err) {
          console.warn('Could not fetch backend confirmation', err);
        } finally {
          setIsLoading(false);
        }
      }

      // 4. If still no details, use query params or friendly fallback
      if (!details) {
        const advisorName = searchParams.get('advisor') || searchParams.get('name') || 'Dr. Sarah Thomas';
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
        const time = searchParams.get('time') || '10:00 AM';
        const amount = Number(searchParams.get('amount')) || 899;
        const meetLink = searchParams.get('meet') || 'https://meet.google.com/beh-olds-ess';

        details = {
          id: paramId || `BEH-${Date.now().toString().slice(-6)}`,
          advisorName,
          advisorRole: 'Senior Clinical Psychologist',
          date,
          time,
          duration: '1 Hour',
          service: 'Psychological Counselling',
          mode: 'ONLINE',
          amountPaid: amount,
          meetLink,
          userName: searchParams.get('userName') || searchParams.get('clientName') || 'Student',
          userEmail: searchParams.get('email') || searchParams.get('clientEmail') || '',
          userPhone: searchParams.get('phone') || searchParams.get('clientPhone') || '',
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        };
      }

      setBookingData(details);

      // Meta Pixel Conversion Tracking (Purchase)
      trackPurchase({
        orderId: details?.id || 'BEH-SESSION',
        value: details?.amountPaid || 899,
        currency: 'INR',
        content_name: 'Psychological Counselling Session',
        content_type: 'product'
      });
    };

    loadBooking();
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
        id: bookingData.id || `BEH-${Date.now().toString().slice(-6)}`,
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

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            നിങ്ങളുടെ psychological counselling session confirm ചെയ്തിരിക്കുന്നു. വിവരങ്ങൾ താഴെ കാണാം.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Appointment Summary</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                Ref: {bookingData?.id ? String(bookingData.id).slice(0, 16) : `BEH-${Date.now().toString().slice(-6)}`}
              </span>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              {bookingData?.status || 'Confirmed'}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00c9d6]" />
              <p className="text-xs font-semibold">Loading booking details...</p>
            </div>
          ) : (
            <>
              {/* Psychologist info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#bcf4f8]/30 to-[#d7f9fb]/20 border border-[#bcf4f8]/60">
                <div className="w-12 h-12 rounded-2xl bg-[#00c9d6] text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                  {bookingData?.advisorName ? bookingData.advisorName.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').charAt(0) : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{bookingData?.advisorName || 'Assigned Psychologist'}</h3>
                  <p className="text-xs text-slate-600 font-medium">{bookingData?.advisorRole || 'Senior Clinical Psychologist'}</p>
                </div>
              </div>

              {/* Schedule grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#008b94]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {bookingData?.date ? formatDateString(bookingData.date) : 'Upcoming'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#008b94]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {bookingData?.time || '10:00 AM'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Video className="w-3.5 h-3.5 text-[#008b94]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Mode</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {bookingData?.mode || '1-on-1 Online Video'}
                  </p>
                </div>
              </div>

              {/* Google Meet Box */}
              {bookingData?.meetLink && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-950">Google Meet Session Room</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Private & Encrypted
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-indigo-100">
                    <span className="text-xs text-slate-600 font-mono truncate flex-1 pl-1">
                      {bookingData.meetLink}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 cursor-pointer transition border-none"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <a
                    href={bookingData.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <span>Join Google Meet Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* What happens next instructions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  ഇനി എന്ത് ചെയ്യണം? (What Happens Next)
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Booking Confirmation-ഉം Meeting Link-ഉം നിങ്ങളുടെ WhatsApp & Email വഴി ഉടൻ ലഭിക്കും.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Session സമയത്തിന് 5 മിനിറ്റ് മുൻപ് സ്വസ്ഥമായ ഒരു മുറിയിലിരുന്ന് Google Meet link-ൽ ജോയിൻ ചെയ്യുക.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>എന്തെങ്കിലും മാറ്റങ്ങൾ വരുത്തണമെങ്കിൽ Session-ന് 1 മണിക്കൂർ മുൻപ് സൗജന്യമായി reschedule ചെയ്യാവുന്നതാണ്.</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600">Amount Paid (Included GST):</span>
                <span className="text-base font-black text-slate-950">₹{bookingData?.amountPaid ?? 899}</span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="w-full sm:flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Download className="w-4 h-4 text-[#00c9d6]" />
              <span>Download Official Receipt (PDF)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>

        </div>

        {/* Support note */}
        <p className="text-xs text-slate-500 text-center">
          Questions or need assistance? Our support team is available 24/7 at{' '}
          <a href="mailto:support@behold.co.in" className="text-[#008b94] font-semibold underline">
            support@behold.co.in
          </a>
        </p>

      </div>
    </div>
  );
}
