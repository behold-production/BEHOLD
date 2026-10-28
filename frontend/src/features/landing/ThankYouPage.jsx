import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  Loader2,
  Sparkles
} from 'lucide-react';
import ApiService from '../../services/api';
import SEO from '../../components/common/SEO';
import { formatDateString } from '../../utils/dateFormatter';
import { createGoogleCalendarUrl } from '../../utils/calendarUtils';
import { trackPurchase } from '../../utils/metaPixel';
import { generateReceiptPDFDoc } from '../student/utils/utils';
import { toast } from 'react-hot-toast';

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  const isRescheduled = searchParams.get('type') === 'rescheduled';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Clean address bar: ensure clean /confirmed URL with no exposed query parameters or IDs
    if (window.location.search && (window.location.search.includes('id=') || window.location.search.includes('bookingId=') || window.location.search.includes('orderId=') || window.location.search.includes('appointmentId='))) {
      window.history.replaceState({}, '', '/confirmed' + (isRescheduled ? '?type=rescheduled' : ''));
    }

    const loadBooking = async () => {
      const paramId = searchParams.get('id') || searchParams.get('bookingId') || searchParams.get('appointmentId') || searchParams.get('orderId');

      let storedDetails = null;

      // Use session storage only to recover the booking ID, then verify details with the API.
      try {
        const stored = sessionStorage.getItem('last_booking_confirmation');
        if (stored) {
          storedDetails = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not parse last booking from session storage', e);
      }

      const targetId = paramId || storedDetails?.id || storedDetails?._id;
      let details = null;
      if (targetId) {
        try {
          setIsLoading(true);
          const res = await ApiService.getBookingConfirmation(targetId);
          if (res && res.success && res.data) {
            details = res.data;
          }
        } catch (err) {
          console.warn('Could not fetch backend confirmation', err);
        } finally {
          setIsLoading(false);
        }
      }

      setBookingData(details);

      if (!isRescheduled && details && ['PAID', 'CONFIRMED'].includes(String(details.paymentStatus || '').toUpperCase())) {
        trackPurchase({
          orderId: details.id || details._id,
          value: Number(details.amountPaid) || 0,
          currency: 'INR',
          content_name: 'Psychological Counselling Session',
          content_type: 'product'
        });
      }
    };

    loadBooking();
  }, [searchParams, isRescheduled]);

  const handleCopyLink = () => {
    if (bookingData?.meetLink) {
      navigator.clipboard.writeText(bookingData.meetLink);
      setCopied(true);
      toast.success('Meeting link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyRef = () => {
    if (bookingData?.id) {
      navigator.clipboard.writeText(String(bookingData.id));
      setCopiedRef(true);
      toast.success('Booking ID copied to clipboard!');
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!bookingData) return;
    try {
      await generateReceiptPDFDoc({
        id: bookingData.id || bookingData._id,
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

  const getInitials = (name) => {
    if (!name) return 'P';
    const clean = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '');
    return clean.charAt(0).toUpperCase();
  };

  if (!isLoading && !bookingData) {
    return (
      <>
        <SEO title="Booking details unavailable | BEHOLD" noIndex={true} />
        <main className="min-h-screen bg-[#fbf9f5] flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-serif-hero text-2xl font-semibold text-[#1c2826]">Booking details unavailable</h1>
            <p className="text-sm text-[#5c6b66]">We could not verify this booking with BEHOLD. Please check your booking link or contact support.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-[#1c2826] px-5 py-3 text-sm font-semibold text-white no-underline">
              Return to home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1c2826] antialiased flex flex-col justify-between relative overflow-x-hidden">
      <SEO
        title="Booking Confirmed | BEHOLD Psychological Counselling"
        description="Your confidential psychological counselling session is confirmed. We look forward to meeting you."
        canonicalUrl="https://www.behold.co.in/confirmed"
        noIndex={true}
      />

      {/* ── TOP FOCUSED BRAND BAR ── */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#ede7de] sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 no-underline text-inherit">
            <span className="text-xl sm:text-2xl font-bold text-[#1c2826] uppercase tracking-tight flex items-baseline">
              BEHOLD<span className="text-[#b85438] font-bold text-2xl leading-none">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919400898011?text=Hi%20BEHOLD%2C%20I%20have%20a%20question%20regarding%20my%20session%20booking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-[#1c2826] bg-white hover:bg-[#f6f2ec] border border-[#ede7de] transition-all cursor-pointer no-underline"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">WhatsApp Support</span>
              <span className="xs:hidden">Support</span>
            </a>
          </div>
        </div>
      </header>

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] bg-[#b85438]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 flex-1">

        {/* Animated Checkmark & Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-300 rounded-md flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/10 animate-pulse-gentle">
            <CheckCircle2 className="w-11 h-11" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isLoading ? 'Verifying booking' : (bookingData?.paymentStatus || bookingData?.status)}</span>
          </div>

          <h1 className="font-serif-hero text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1c2826] tracking-tight">
            {isLoading ? 'Verifying your booking...' : (isRescheduled ? 'Reschedule Request Submitted' : 'Booking details')}
          </h1>

          <p className="text-xs sm:text-sm text-[#5c6b66] max-w-md mx-auto leading-relaxed font-medium">
            {isRescheduled 
              ? 'Your requested time slot has been submitted for counselor confirmation. Review your appointment details below.'
              : 'Your confidential psychological counselling session is confirmed. Review your appointment details below.'}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-md border border-[#ede7de] shadow-lg shadow-[#1c2826]/5 p-6 sm:p-8 space-y-6 text-left">

          <div className="flex items-center justify-between border-b border-[#ede7de] pb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a938f] block">Appointment Summary</span>
              <p className="text-xs sm:text-sm font-semibold text-[#1c2826] mt-0.5">
                Private Consultation Session
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isLoading ? 'Verifying' : bookingData?.status}</span>
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-[#8a938f] space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#b85438]" />
              <p className="text-xs font-semibold">Loading booking details...</p>
            </div>
          ) : (
            <>
              {/* Psychologist info */}
              <div className="flex items-center gap-4 p-4 rounded-md bg-[#faf5f0] border border-[#eadfd0]">
                {bookingData?.advisorPhoto ? (
                  <img
                    src={bookingData.advisorPhoto}
                    alt={bookingData.advisorName}
                    className="w-12 h-12 rounded-md object-cover object-top shadow-sm border-2 border-white shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-[#b85438] text-white flex items-center justify-center font-semibold text-lg shrink-0 shadow-sm">
                    {getInitials(bookingData?.advisorName)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-[#1c2826] text-sm sm:text-base truncate">
                      {bookingData?.advisorName}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#b85438] shrink-0" title="Verified Professional" />
                  </div>
                  <p className="text-xs text-[#5c6b66] font-medium truncate">
                    {bookingData?.advisorRole}
                  </p>
                </div>
              </div>

              {/* Schedule grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#faf6ee] rounded-md border border-[#ede7de] text-left">
                  <div className="flex items-center gap-1.5 text-[#8a938f] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#b85438]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1c2826]">
                    {bookingData?.date ? formatDateString(bookingData.date) : ''}
                  </p>
                </div>

                <div className="p-3.5 bg-[#faf6ee] rounded-md border border-[#ede7de] text-left">
                  <div className="flex items-center gap-1.5 text-[#8a938f] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#b85438]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Time</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1c2826]">
                    {bookingData?.time}
                  </p>
                </div>

                <div className="p-3.5 bg-[#faf6ee] rounded-md border border-[#ede7de] text-left col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-[#8a938f] mb-1">
                    <Video className="w-3.5 h-3.5 text-[#b85438]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Mode</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#1c2826] truncate">
                    {bookingData?.mode}
                  </p>
                </div>
              </div>

              {/* Consultation Room Box */}
              {bookingData?.meetLink && (
                <div className="p-4 rounded-md bg-[#faf5f0] border border-[#eadfd0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#b85438]" />
                      <span className="text-xs font-semibold text-[#1c2826]">Private Video Consultation Room</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Direct Join · Encrypted
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-[#eadfd0]">
                    <span className="text-xs text-[#5c6b66] font-mono truncate flex-1 pl-1">
                      {bookingData.meetLink}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 text-xs font-semibold text-[#b85438] hover:text-white bg-white hover:bg-[#b85438] rounded-md flex items-center gap-1 cursor-pointer transition border border-[#eadfd0]"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <a
                    href={bookingData.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-bold rounded-md transition shadow-sm no-underline"
                    title="Join Google Meet Video Consultation Room"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet Consultation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* What happens next instructions */}
              <div className="p-4 rounded-md bg-[#faf6ee] border border-[#ede7de] space-y-3">
                <h3 className="text-xs font-semibold text-[#1c2826] uppercase tracking-wider">
                  What Happens Next
                </h3>

                <div className="space-y-2.5 text-sm text-[#5c6b66]">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your booking confirmation and session room link have been sent to your WhatsApp & Email.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Please join the secure Google Meet link 5 minutes prior to your session from a quiet, comfortable room.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Need to make changes? You can easily reschedule your session free of charge up to 1 hour beforehand.</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="flex items-center justify-between p-3.5 bg-[#faf6ee] rounded-md border border-[#ede7de] text-xs">
                <span className="font-semibold text-[#5c6b66]">Amount Paid (Included GST):</span>
                <span className="text-base font-semibold text-[#1c2826]">
                  {bookingData?.amountPaid != null ? `₹${bookingData.amountPaid}` : '—'}
                </span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {bookingData?.mode === 'ONLINE' && (
              <a
                href={createGoogleCalendarUrl({
                  title: `BEHOLD Counselling Session - ${bookingData?.advisorName || 'Psychologist'}`,
                  description: `Confidential Psychological Counselling Session via BEHOLD.\nGoogle Meet: ${bookingData?.meetLink || ''}\nStudent: ${bookingData?.clientName || ''}`,
                  location: bookingData?.meetLink || 'Google Meet',
                  date: bookingData?.date,
                  time: bookingData?.time,
                  durationMinutes: bookingData?.duration && String(bookingData.duration).includes('30') ? 30 : 60
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3.5 px-4 bg-[#faf5f0] hover:bg-[#f6e8e2] border border-[#eadfd0] text-[#1c2826] font-semibold text-sm rounded-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer no-underline"
              >
                <Calendar className="w-4 h-4 text-[#b85438] shrink-0" />
                <span>Add to Calendar</span>
              </a>
            )}

            <button
              onClick={handleDownloadReceipt}
              className="w-full sm:flex-1 py-3.5 px-4 bg-[#1c2826] hover:bg-[#b85438] text-white font-semibold text-sm rounded-md transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c2826] focus-visible:ring-offset-2"
            >
              <Download className="w-4 h-4 text-white shrink-0" />
              <span>Download Receipt</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-[#f6f2ec] text-[#1c2826] font-semibold text-sm rounded-md border border-[#ede7de] transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b85438] focus-visible:ring-offset-2"
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Return Home</span>
            </button>
          </div>

        </div>

        {/* Support note */}
        <p className="text-[13px] text-[#5c6b66] text-center leading-relaxed">
          Questions or need help?{' '}
          <a href="mailto:support@behold.co.in" className="text-[#b85438] font-semibold underline underline-offset-2 hover:text-[#b85438] transition-colors">
            support@behold.co.in
          </a>
        </p>

      </main>

      {/* ── MINIMAL COMPACT FOOTER ── */}
      <footer className="py-4 text-[#8a938f] text-xs text-center border-t border-[#ede7de] bg-white/50">
        <p>© {new Date().getFullYear()} BEHOLD. All rights reserved. Confidential Psychological Care.</p>
      </footer>

    </div>
  );
}
