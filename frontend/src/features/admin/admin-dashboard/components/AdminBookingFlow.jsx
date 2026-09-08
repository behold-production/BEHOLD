import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2, QrCode, Share2, AlertCircle } from 'lucide-react';
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
    date: '',
    time: '',
    sessionDetails: ''
  });

  // Payment State
  const [bookingResponse, setBookingResponse] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('PAYMENT_PENDING');
  const [manualReference, setManualReference] = useState('');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  useEffect(() => {
    let interval;
    if (pollingActive && bookingResponse && paymentStatus === 'PAYMENT_PENDING') {
      interval = setInterval(async () => {
        try {
          const res = await ApiService.checkAdminBookingPaymentStatus(bookingResponse.appointment.id);
          if (res.success && res.data.paymentStatus === 'PAID') {
            setPaymentStatus('PAYMENT_PAID');
            setPollingActive(false);
            toast.success('Payment automatically verified!');
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [pollingActive, bookingResponse, paymentStatus]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.whatsappNumber || !formData.email || !formData.psychologistId || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await ApiService.createAdminBookingWithPayment(formData);
      if (res.success) {
        setBookingResponse(res.data);
        setStep(2);
        setPollingActive(true);
        toast.success('Booking initialized, awaiting payment');
      } else {
        toast.error(res.message || 'Failed to initialize booking');
      }
    } catch (error) {
      toast.error('Unable to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPaid = async () => {
    if (!window.confirm('Are you sure you want to manually mark this payment as Paid?')) {
      return;
    }
    setIsMarkingPaid(true);
    try {
      const res = await ApiService.markAdminBookingPaid(bookingResponse.appointment.id, manualReference);
      if (res.success) {
        setPaymentStatus('PAYMENT_PAID');
        setPollingActive(false);
        toast.success('Payment marked as paid manually');
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
    if (!bookingResponse) return;
    const msg = `Hi ${formData.clientName},

Please use the QR code or BEHOLD UPI to complete your session payment of ₹899.

Once the payment is completed, your booking will be confirmed.

Thank you,
BEHOLD`;
    const encodedMsg = encodeURIComponent(msg);
    const waLink = `https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;
    window.open(waLink, '_blank');
  };

  // Generate UPI QR string
  // Assuming a generic Behold UPI string if Razorpay doesn't give a dynamic QR URL directly
  const upiString = bookingResponse 
    ? `upi://pay?pa=behold@upi&pn=BEHOLD&tr=${bookingResponse.order.id}&am=899.00&cu=INR`
    : '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Admin Booking Creation' : 'Session Payment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 && (
            <form id="admin-booking-form" onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="+91 9999999999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Psychologist *</label>
                  <select
                    name="psychologistId"
                    value={formData.psychologistId}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="">Select Psychologist</option>
                    {counsellorsDb.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Details</label>
                <textarea
                  name="sessionDetails"
                  value={formData.sessionDetails}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Additional notes for this session..."
                />
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center space-y-6">
              {paymentStatus === 'PAYMENT_PENDING' ? (
                <>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">₹899</h3>
                    <p className="text-gray-500 text-sm mt-1">Scan the QR code below to complete payment</p>
                  </div>
                  
                  <div className="p-4 bg-white border-2 border-teal-100 rounded-xl shadow-sm">
                    <img src={qrUrl} alt="UPI QR Code" className="w-56 h-56 object-contain" />
                  </div>

                  <button 
                    onClick={handleWhatsAppShare}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium rounded-lg transition"
                  >
                    <Share2 size={18} />
                    <span>Share via WhatsApp</span>
                  </button>

                  <div className="w-full flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center space-x-2 text-yellow-700 mb-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span className="font-medium text-sm">Payment Pending - Awaiting verification...</span>
                    </div>
                    <p className="text-xs text-yellow-600 text-center px-4">
                      The system is checking for successful payment automatically.
                    </p>
                  </div>

                  <div className="w-full pt-4 border-t border-gray-100 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Manual Verification (Fallback)</p>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="UPI Reference ID (Optional)"
                        value={manualReference}
                        onChange={(e) => setManualReference(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        onClick={handleManualPaid}
                        disabled={isMarkingPaid}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg disabled:opacity-50 transition"
                      >
                        {isMarkingPaid ? 'Confirming...' : 'Mark as Paid'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="text-teal-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Successful ✓</h3>
                  <p className="text-gray-500">Booking Confirmed. The After-Payment flow has been triggered successfully.</p>
                  <button 
                    onClick={() => {
                      if (onComplete) onComplete();
                      onClose();
                    }}
                    className="mt-4 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              form="admin-booking-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Proceed to Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
