import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ApiService from '../services/api';

/**
 * RazorpayCheckoutButton
 * Reusable component to trigger Razorpay Standard Web Checkout
 *
 * @param {number} amount - Amount in paise (minimum 100 paise = ₹1)
 * @param {string} currency - Currency code, default 'INR'
 * @param {string} buttonText - Text displayed on button
 * @param {object} notes - Optional metadata notes
 * @param {object} prefill - Prefill details { name, email, contact }
 * @param {function} onSuccess - Callback when payment signature is verified
 * @param {function} onError - Callback when payment fails or errors
 * @param {string} className - Optional custom CSS classes
 */
export default function RazorpayCheckoutButton({
  amount = 50000,
  currency = 'INR',
  buttonText = 'Pay with Razorpay',
  notes = {},
  prefill = {},
  onSuccess,
  onError,
  className = ''
}) {
  const [loading, setLoading] = useState(false);

  const loadScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      if (amount < 100) {
        toast.error('Amount must be at least 100 paise (₹1)');
        setLoading(false);
        return;
      }

      // 1. Ensure Razorpay checkout script is loaded
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Call backend order creation endpoint (/api/create-order)
      const orderRes = await ApiService.createOrder({
        amount,
        currency,
        notes
      });

      if (!orderRes || !orderRes.success) {
        throw new Error(orderRes?.message || 'Failed to create payment order');
      }

      const orderId = orderRes.order_id || orderRes.data?.orderId;
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || orderRes.data?.keyId || 'rzp_test_THJcTWUaeHzOnn';

      // 3. Configure Razorpay modal options
      const options = {
        key: keyId,
        amount: orderRes.amount || amount,
        currency: orderRes.currency || currency,
        name: 'BEHOLD.',
        description: 'Payment Checkout',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend (/api/verify-payment)
            const verifyRes = await ApiService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes && verifyRes.success) {
              toast.success('Payment verified successfully!');
              if (onSuccess) onSuccess(response, verifyRes);
            } else {
              throw new Error(verifyRes?.message || 'Signature verification failed');
            }
          } catch (err) {
            console.error('[Razorpay Verify Error]:', err);
            toast.error(err.message || 'Payment signature verification failed');
            if (onError) onError(err);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || ''
        },
        theme: {
          color: '#00E5FF'
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled by user');
            setLoading(false);
            if (onError) onError(new Error('User cancelled payment modal'));
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        console.error('[Razorpay Payment Failed]:', response.error);
        toast.error(response.error?.description || 'Payment process failed');
        setLoading(false);
        if (onError) onError(response.error);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('[Razorpay Checkout Error]:', err);
      toast.error(err.message || 'Failed to initiate Razorpay payment');
      setLoading(false);
      if (onError) onError(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={
        className ||
        'w-full py-3 px-6 rounded-xl font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
      }
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
          Processing...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
}
