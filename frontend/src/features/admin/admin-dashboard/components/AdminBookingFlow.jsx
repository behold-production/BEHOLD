import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, Share2, Calendar, Clock, User, Phone, Mail, DollarSign, ShieldCheck } from 'lucide-react';
import ApiService from '../../../../services/api';
import toast from 'react-hot-toast';

export default function AdminBookingFlow({ onClose, counsellorsDb = [], onComplete }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    clientName: '',
    whatsappNumber: '',
    email: '',
    psychologistId: '',
    service: 'Individual Counselling',
    mode: 'ONLINE',
    fee: '899',
    date: '',
    time: '',
    sessionDetails: '',
    markAsPaid: false
  });

  // Payment State
  const [bookingResponse, setBookingResponse] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PAYMENT_PENDING');
  const [manualReference, setManualReference] = useState('');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // Auto update default fee when psychologist changes
  const handlePsychologistChange = (e) => {
    const pId = e.target.value;
    const selectedCounsellor = counsellorsDb.find(c => String(c.id || c._id) === String(pId));
    setFormData(prev => ({
      ...prev,
      psychologistId: pId,
      fee: selectedCounsellor?.fee ? String(selectedCounsellor.fee) : (prev.fee || '899')
    }));
  };

  useEffect(() => {
    let interval;
    if (pollingActive && bookingResponse && paymentStatus === 'PAYMENT_PENDING') {
      interval = setInterval(async () => {
        try {
          const apptId = bookingResponse.appointment?.id || bookingResponse.appointment?._id;
          if (!apptId) return;
          const res = await ApiService.checkAdminBookingPaymentStatus(apptId);
          if (res.success && res.data.paymentStatus === 'PAID') {
            setPaymentStatus('PAYMENT_PAID');
            setPollingActive(false);
            toast.success('Payment verified successfully!');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [pollingActive, bookingResponse, paymentStatus]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.whatsappNumber || !formData.email || !formData.psychologistId || !formData.date || !formData.time) {
      toast.error('Please fill all required fields (Client Name, Phone, Email, Psychologist, Date, Time)');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await ApiService.createAdminBookingWithPayment(formData);
      if (res.success) {
        if (res.isPaid || formData.markAsPaid) {
          setPaymentStatus('PAYMENT_PAID');
          setStep(2);
          toast.success('Booking confirmed & WhatsApp/Email alerts sent!');
        } else {
          setBookingResponse(res.data);
          setStep(2);
          setPollingActive(true);
          toast.success('Booking created! Complete payment via QR or manual mark.');
        }
      } else {
        toast.error(res.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Admin booking submit error:', error);
      toast.error(error.response?.data?.message || 'Unable to create booking. Please check details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPaid = async () => {
    const apptId = bookingResponse?.appointment?.id || bookingResponse?.appointment?._id;
    if (!apptId) return;
    if (!window.confirm('Are you sure you want to mark this payment as PAID and dispatch notifications?')) {
      return;
    }
    setIsMarkingPaid(true);
    try {
      const res = await ApiService.markAdminBookingPaid(apptId, manualReference);
      if (res.success) {
        setPaymentStatus('PAYMENT_PAID');
        setPollingActive(false);
        toast.success('Payment marked as PAID. WhatsApp & Email alerts sent!');
      } else {
        toast.error(res.message || 'Failed to mark as paid');
      }
    } catch (error) {
      toast.error('Error marking as paid');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleWhatsAppShare = () => {
    const feeAmt = formData.fee || '899';
    const msg = `Hi ${formData.clientName},

Your booking request with BEHOLD Counselling is initialized.
Session Date: ${formData.date}
Session Time: ${formData.time}
Amount: ₹${feeAmt}

Please complete the payment using UPI/QR code to confirm your appointment.

Thank you,
BEHOLD Wellness`;
    const encodedMsg = encodeURIComponent(msg);
    const cleanPhone = formData.whatsappNumber.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    window.open(waLink, '_blank');
  };

  const upiFee = formData.fee || '899';
  const upiString = bookingResponse 
    ? `upi://pay?pa=behold@upi&pn=BEHOLD&tr=${bookingResponse.order?.id || 'rcpt'}&am=${upiFee}.00&cu=INR`
    : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-gray-100 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-teal-600" size={22} />
              {step === 1 ? 'Create Admin Session Booking' : 'Booking Confirmation & Payment'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {step === 1 ? 'Enter client & session details to schedule a booking' : 'Review status or send client payment link'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-white text-gray-900">
          {step === 1 && (
            <form id="admin-booking-form" onSubmit={handleCreateBooking} className="space-y-4">
              
              {/* Row 1: Client Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <User size={14} className="text-teal-600" /> Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-gray-400 shadow-xs font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Phone size={14} className="text-teal-600" /> WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-gray-400 shadow-xs font-medium"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
              </div>

              {/* Row 2: Email & Psychologist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Mail size={14} className="text-teal-600" /> Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-gray-400 shadow-xs font-medium"
                    placeholder="rahul@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <User size={14} className="text-teal-600" /> Psychologist *
                  </label>
                  <select
                    name="psychologistId"
                    value={formData.psychologistId}
                    onChange={handlePsychologistChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                  >
                    <option value="">Select Psychologist...</option>
                    {counsellorsDb.map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name} {c.title ? `(${c.title})` : ''} - ₹{c.fee || 899}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Service Type & Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Service Type *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                  >
                    <option value="Individual Counselling">Individual Counselling</option>
                    <option value="Couples Counselling">Couples Counselling</option>
                    <option value="Adolescent & Youth">Adolescent & Youth</option>
                    <option value="Clinical Therapy">Clinical Therapy</option>
                    <option value="Career & Stress">Career & Stress Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Consultation Mode *
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                  >
                    <option value="ONLINE">Online Video Call (Google Meet)</option>
                    <option value="OFFLINE">In-Person / Clinic Visit</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Date, Time & Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Calendar size={14} className="text-teal-600" /> Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock size={14} className="text-teal-600" /> Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <DollarSign size={14} className="text-teal-600" /> Fee (₹) *
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-xs font-medium"
                    placeholder="899"
                  />
                </div>
              </div>

              {/* Session Details */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Session Notes / Client Concerns
                </label>
                <textarea
                  name="sessionDetails"
                  value={formData.sessionDetails}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition placeholder-gray-400 shadow-xs font-normal"
                  placeholder="Enter details about client concerns, special requests..."
                />
              </div>

              {/* Mark as Paid Direct Option */}
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-teal-900 block">Mark Payment as PAID Immediately</span>
                  <span className="text-xs text-teal-700">Select if client paid directly in cash, clinic, or direct bank transfer. Auto-dispatches WhatsApp confirmation.</span>
                </div>
                <input
                  type="checkbox"
                  name="markAsPaid"
                  checked={formData.markAsPaid}
                  onChange={handleChange}
                  className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer accent-teal-600"
                />
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center space-y-6">
              {paymentStatus === 'PAYMENT_PENDING' ? (
                <>
                  <div className="text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Amount Due</span>
                    <h3 className="text-3xl font-extrabold text-teal-700">₹{formData.fee || 899}</h3>
                    <p className="text-gray-600 text-sm mt-1">Scan QR code or share WhatsApp link to collect payment</p>
                  </div>
                  
                  <div className="p-4 bg-white border-2 border-teal-200 rounded-2xl shadow-md">
                    <img src={qrUrl} alt="UPI QR Code" className="w-52 h-52 object-contain" />
                  </div>

                  <button 
                    onClick={handleWhatsAppShare}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
                  >
                    <Share2 size={18} />
                    <span>Share Payment Link via WhatsApp</span>
                  </button>

                  <div className="w-full flex flex-col items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center space-x-2 text-amber-800 mb-1">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="font-semibold text-sm">Payment Pending - Checking status automatically...</span>
                    </div>
                    <p className="text-xs text-amber-700 text-center">
                      Auto-checking Razorpay payment status every 5 seconds.
                    </p>
                  </div>

                  <div className="w-full pt-4 border-t border-gray-200 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Manual Verification (Admin Confirm)</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="UPI Txn Reference (Optional)"
                        value={manualReference}
                        onChange={(e) => setManualReference(e.target.value)}
                        className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        onClick={handleManualPaid}
                        disabled={isMarkingPaid}
                        className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition shadow-sm"
                      >
                        {isMarkingPaid ? 'Marking Paid...' : 'Confirm Paid & Send Alerts'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-1">
                    <CheckCircle className="text-teal-600" size={44} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Booking Confirmed & Notifications Sent! ✓</h3>
                  <p className="text-gray-600 max-w-md text-sm">
                    Appointment is successfully booked. Automated WhatsApp and Email confirmation messages have been dispatched to both the client and the psychologist.
                  </p>
                  <button 
                    onClick={() => {
                      if (onComplete) onComplete();
                      onClose();
                    }}
                    className="mt-4 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition shadow-md"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-booking-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 flex items-center text-sm transition"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {formData.markAsPaid ? 'Confirm & Book Session' : 'Proceed to Payment QR'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

