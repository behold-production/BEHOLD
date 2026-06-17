import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ApiService from '../services/api';
import DateTimePicker from './booking/DateTimePicker';
import TimePicker from './booking/TimePicker';
import BookingAuthModal from './booking/BookingAuthModal';
import { jsPDF } from 'jspdf';
import { FileDown } from 'lucide-react';

const BOOKING_DRAFT_KEY = 'behold_booking_draft';

const COUNSELLING_FLOW = {
  online: [
    "Schedule Date, Time & choose consultant psychologist",
    "Fill student profile & process online payment fee",
    "Access Google Meet link, schedule, & WhatsApp notifications"
  ],
  doorstep: [
    "Schedule Date, Time & choose consultant psychologist",
    "Fill student profile & process online payment fee",
    "Receive doorstep counselor assignment & WhatsApp notifications"
  ],
  offline: [
    "Schedule Date, Time & choose consultant psychologist",
    "Fill student profile & process online payment fee",
    "Receive center address, instructions, & WhatsApp notifications"
  ]
};

const CAREER_FLOW = {
  online: [
    "Schedule Date, Time & choose career coach/advisor",
    "Fill student profile & process online payment fee",
    "Access Google Meet link, checklist, & WhatsApp notifications"
  ],
  doorstep: [
    "Schedule Date, Time & choose career coach/advisor",
    "Fill student profile & process online payment fee",
    "Receive doorstep advisor assignment & WhatsApp notifications"
  ],
  offline: [
    "Schedule Date, Time & choose career coach/advisor",
    "Fill student profile & process online payment fee",
    "Receive center address, preparation guide, & WhatsApp notifications"
  ]
};

export default function ServiceBooking({ preselectedAdvisorId, clearPreselectedAdvisor, onOpenAuth }) {
  const { user, login, register } = useAuth();
  
  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [bookingService, setBookingService] = useState('counselling'); // counselling, career
  const [bookingMode, setBookingMode] = useState('ONLINE'); // ONLINE, DOOR_STEP, OFFLINE
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    groupCode: ''
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [advisorConfirmed, setAdvisorConfirmed] = useState(false);
  const [advisors, setAdvisors] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNoCounsellorsModal, setShowNoCounsellorsModal] = useState(false);

  const [existingAppointments, setExistingAppointments] = useState([]);

  useEffect(() => {
    const initBookingData = async () => {
      try {
        const res = await ApiService.getCounsellors();
        if (res.success && res.data) {
          const resolved = res.data.map(c => {
            return {
              id: c.id || c._id,
              name: c.name,
              role: c.title || 'Consultant Psychologist',
              availability: 'Available Today',
              type: c.type || 'counselling',
              defaultMeetLink: c.defaultMeetLink || '',
              price: Number(c.price) || 1200,
              modes: Array.isArray(c.modes) ? c.modes : ['ONLINE', 'OFFLINE'],
              availabilitySlots: c.availability || {}
            };
          });
          setAdvisors(resolved);
        }

        if (user) {
          const apptsRes = await ApiService.getAppointments();
          if (apptsRes.success && apptsRes.data) {
            setExistingAppointments(apptsRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load booking details:', err);
      }
    };

    initBookingData();
  }, [user]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);
  
  const isAdvisorLocked = !!preselectedAdvisorId;
  const [bookingStep, setBookingStep] = useState('config'); // 'config' | 'payment' | 'success'

  // Payment checkout states
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');

  // Payment form states
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiAddress, setUpiAddress] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const downloadPDFReceipt = (bookingDetails) => {
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top Banner Accent Bar
      doc.setFillColor(6, 182, 212); // brandCyan
      doc.rect(0, 0, 210, 8, 'F');

      // Header Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(9, 9, 11);
      doc.text('BEHOLD.', 20, 25);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text('Session Booking Receipt', 20, 30);

      // Divider Line
      doc.setDrawColor(228, 228, 231);
      doc.line(20, 36, 190, 36);

      // Booking details & status badge
      doc.setFillColor(240, 253, 250); // Light teal background
      doc.roundedRect(138, 20, 52, 10, 2, 2, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136); // Teal text
      doc.text('✓ CONFIRMED & PAID', 144, 26.5);

      // Left Column - Booking Info
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(39, 39, 42);
      doc.text('BOOKING DETAILS', 20, 48);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(82, 82, 91);
      
      const details = [
        { label: 'Booking ID:', val: `sb_${bookingDetails.id}` },
        { label: 'Service:', val: bookingDetails.service },
        { label: 'Session Mode:', val: bookingDetails.mode },
        { label: 'Advisor:', val: bookingDetails.advisorName },
        { label: 'Advisor Role:', val: bookingDetails.advisorRole },
        { label: 'Date & Time:', val: `${bookingDetails.date} at ${bookingDetails.time}` }
      ];

      let currentY = 55;
      details.forEach(item => {
        doc.setFont('Helvetica', 'bold');
        doc.text(item.label, 20, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(item.val, 55, currentY);
        currentY += 7.5;
      });

      // Right Column / Box - Student Info & Payment
      doc.setFillColor(248, 250, 252); // soft slate background
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(120, 45, 70, 48, 2, 2, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('CLIENT DETAILS', 125, 52);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Name: ${bookingDetails.clientName}`, 125, 59);
      doc.text(`Email: ${bookingDetails.clientEmail}`, 125, 65);
      doc.text(`Phone: ${bookingDetails.clientPhone}`, 125, 71);

      // Divider inside slate box
      doc.line(125, 76, 185, 76);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Paid:', 125, 83);
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136); // Teal price
      doc.text(`INR ${bookingDetails.amount}`, 148, 83);

      // Google Meet info block if online
      let finalY = 110;
      if (bookingDetails.meetLink) {
        doc.setFillColor(244, 244, 245);
        doc.roundedRect(20, 105, 170, 18, 2, 2, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(39, 39, 42);
        doc.text('Google Meet Session Link:', 25, 111);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(6, 182, 212); // Blue link color
        doc.text(bookingDetails.meetLink, 25, 117);
        
        finalY = 135;
      }

      // Footer / Terms
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170);
      doc.text('This is a computer-generated confirmation. No physical signature is required.', 20, finalY);
      doc.text('Need help? Contact support at support@beholdaspire.com or reply on WhatsApp.', 20, finalY + 5);

      doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Please try copying receipt instead.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getAvailableSlotsForDate = (dateStr, serviceType) => {
    if (!dateStr) return [];

    const todayStr = getLocalTodayString();
    const isSlotInPast = (timeStr) => {
      try {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const now = new Date();
        const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        return now >= slotDate;
      } catch (e) {
        return false;
      }
    };

    try {
      const dayOfWeek = new Date(dateStr).getDay(); // 0 to 6

      // If a specific advisor is selected, prioritize their schedule
      if (selectedAdvisor) {
        const parsed = selectedAdvisor.availabilitySlots;
        if (parsed) {
          try {
            const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
            if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
              const bookings = existingAppointments;
              const list = parsed.availableSlots.filter(slot => {
                if (dateStr === todayStr && isSlotInPast(slot)) {
                  return false;
                }
                return !bookings.some(b => 
                  b.counsellorId === selectedAdvisor.id && 
                  b.date === dateStr && 
                  b.time === slot && 
                  (b.status === 'APPROVED' || b.status === 'PENDING')
                );
              });
              const parseTimeToMinutes = (timeStr) => {
                const [time, meridiem] = timeStr.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (meridiem === 'PM' && hours !== 12) hours += 12;
                if (meridiem === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
              };
              return list.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
            }
            return [];
          } catch (e) {
            console.error("Error parsing advisor availability in booking", e);
          }
        }
        return [];
      }

      // Collect union of available slots across matching advisors
      const activeSlotsSet = new Set();
      const matchingAdvisors = advisors.filter(a => a.type === serviceType && (!a.modes || a.modes.includes(bookingMode)));

      matchingAdvisors.forEach(advisor => {
        const parsed = advisor.availabilitySlots;
        if (parsed) {
          try {
            const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
            if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
              const bookings = existingAppointments;
              parsed.availableSlots.forEach(slot => {
                if (dateStr === todayStr && isSlotInPast(slot)) {
                  return;
                }
                const isBooked = bookings.some(b => 
                  b.counsellorId === advisor.id && 
                  b.date === dateStr && 
                  b.time === slot && 
                  (b.status === 'APPROVED' || b.status === 'PENDING')
                );
                if (!isBooked) {
                  activeSlotsSet.add(slot);
                }
              });
            }
          } catch (e) {}
        }
      });

      if (activeSlotsSet.size > 0) {
        const list = Array.from(activeSlotsSet);
        const parseTimeToMinutes = (timeStr) => {
          const [time, meridiem] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (meridiem === 'PM' && hours !== 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        return list.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
      }

      return [];
    } catch (err) {
      console.error("Error generating dynamic slots", err);
      return [];
    }
  };

  const getAdvisorSlotsForDate = (advisor, dateStr) => {
    if (!dateStr || !advisor) return [];
    if (advisor.modes && !advisor.modes.includes(bookingMode)) {
      return [];
    }
    const dayOfWeek = new Date(dateStr).getDay();
    const parsed = advisor.availabilitySlots;
    if (!parsed) return [];
    try {
      const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
      if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
        const bookings = existingAppointments;
        const todayStr = getLocalTodayString();
        const isSlotInPast = (timeStr) => {
          try {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            const now = new Date();
            const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            return now >= slotDate;
          } catch (e) {
            return false;
          }
        };
        return parsed.availableSlots.filter(slot => {
          if (dateStr === todayStr && isSlotInPast(slot)) {
            return false;
          }
          return !bookings.some(b => 
            b.counsellorId === advisor.id && 
            b.date === dateStr && 
            b.time === slot && 
            (b.status === 'APPROVED' || b.status === 'PENDING')
          );
        });
      }
    } catch (e) {
      console.error("Error checking slots for advisor:", e);
    }
    return [];
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime('');
    if (errors.date) setErrors(prev => ({ ...prev, date: null }));

    if (!isAdvisorLocked && selectedAdvisor) {
      const slots = getAdvisorSlotsForDate(selectedAdvisor, newDate);
      if (slots.length === 0) {
        setSelectedAdvisor(null);
        setAdvisorConfirmed(false);
      }
    }
  };

  const getAdvisorAvailabilityStatus = (advisorId, dateStr, timeStr) => {
    if (!dateStr || !timeStr) return 'Available';
    const dayOfWeek = new Date(dateStr).getDay();

    const advisor = advisors.find(a => a.id === advisorId);
    if (!advisor || !advisor.availabilitySlots) {
      return 'Unavailable';
    }

    try {
      const parsed = advisor.availabilitySlots;
      const isDayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
      const isSlotActive = parsed.availableSlots && parsed.availableSlots.includes(timeStr);
      if (isDayActive && isSlotActive) {
        const bookings = existingAppointments;
        const isAlreadyBooked = bookings.some(b => 
          b.counsellorId === advisorId && 
          b.date === dateStr && 
          b.time === timeStr && 
          (b.status === 'APPROVED' || b.status === 'PENDING')
        );
        if (isAlreadyBooked) {
          return 'Booked';
        }
        return 'Available';
      }
    } catch (e) {}

    return 'Unavailable';
  };

  // History tracking popstate listener
  useEffect(() => {
    // Set initial state on mount if it's booking view
    window.history.replaceState({ component: 'booking', step: 'config' }, '');

    const handlePopState = (e) => {
      if (e.state && e.state.component === 'booking' && e.state.step) {
        setBookingStep(e.state.step);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStepChange = (newStep) => {
    if (newStep === 'advisor') {
      const matchingAdvisors = advisors.filter(
        advisor => advisor.type === bookingService && (!advisor.modes || advisor.modes.includes(bookingMode))
      );
      if (matchingAdvisors.length === 0) {
        setShowNoCounsellorsModal(true);
        return;
      }
    }
    setBookingStep(newStep);
    window.history.pushState({ component: 'booking', step: newStep }, '');
  };



  // Autofill form from Auth user
  useEffect(() => {
    if (user) {
      setBookingForm(prev => {
        const merged = {
          name: prev.name && prev.name.trim().length > 0 ? prev.name : user.name,
          email: user.email,
          phone: prev.phone || '',
          groupCode: prev.groupCode || ''
        };
        return merged;
      });
      setIsAutofilled(true);
    }
  }, [user]);

  // Restore booking draft from session storage (date, time, advisor, mode, service)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.bookingService) setBookingService(draft.bookingService);
        if (draft.bookingMode) setBookingMode(draft.bookingMode);
        if (draft.selectedDate) setSelectedDate(draft.selectedDate);
        if (draft.selectedTime) setSelectedTime(draft.selectedTime);
        if (typeof draft.advisorConfirmed === 'boolean') setAdvisorConfirmed(draft.advisorConfirmed);
        if (draft.bookingForm) {
          setBookingForm(prev => ({ ...prev, ...draft.bookingForm }));
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Persist booking draft whenever core selections change
  useEffect(() => {
    try {
      const draft = {
        bookingService,
        bookingMode,
        selectedDate,
        selectedTime,
        selectedAdvisorId: selectedAdvisor ? selectedAdvisor.id : null,
        advisorConfirmed,
        bookingForm
      };
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) { /* ignore */ }
  }, [bookingService, bookingMode, selectedDate, selectedTime, selectedAdvisor, advisorConfirmed, bookingForm]);

  useEffect(() => {
    if (preselectedAdvisorId) {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        draft.selectedAdvisorId = preselectedAdvisorId;
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
      } catch (e) { /* ignore */ }
    }
  }, [preselectedAdvisorId]);

  // Handle preselected advisor redirecting from landing page
  useEffect(() => {
    if (preselectedAdvisorId && advisors.length > 0) {
      const found = advisors.find(a => a.id === preselectedAdvisorId);
      if (found) {
        setBookingService(found.type); // Dynamically set based on advisor type (counselling or career)
        setSelectedAdvisor(found);
        setAdvisorConfirmed(true);
        if (found.modes && found.modes.length > 0 && !found.modes.includes(bookingMode)) {
          setBookingMode(found.modes[0]);
        }
        
        // Auto-scroll to the booking console form
        setTimeout(() => {
          const element = document.getElementById('booking-console');
          if (element) {
            const offset = 85;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 150);
      }
      if (clearPreselectedAdvisor) {
        clearPreselectedAdvisor();
      }
    }
  }, [preselectedAdvisorId, clearPreselectedAdvisor, advisors]);

  // Reset advisor if service type or mode changes to avoid invalid combinations
  useEffect(() => {
    if (selectedAdvisor) {
      const isServiceMatch = selectedAdvisor.type === bookingService;
      const isModeMatch = !selectedAdvisor.modes || selectedAdvisor.modes.includes(bookingMode);
      if (!isServiceMatch || !isModeMatch) {
        setSelectedAdvisor(null);
        setAdvisorConfirmed(false);
        setSelectedTime('');
      }
    }
  }, [bookingService, bookingMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => {
      const updated = { ...prev, [name]: value };
      return updated;
    });
    setIsAutofilled(false);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!bookingForm.name.trim()) {
      err.name = "Name is required";
    } else if (bookingForm.name.trim().length < 3) {
      err.name = "Name must be at least 3 characters";
    }
    
    if (!bookingForm.phone.trim()) {
      err.phone = "Phone number is required";
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(bookingForm.phone)) {
        err.phone = "Please enter a valid phone number (e.g. 8086664001)";
      }
    }
    
    if (!bookingForm.email.trim()) {
      err.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingForm.email)) {
        err.email = "Please enter a valid email address";
      }
    }
    
    if (!selectedDate) {
      err.date = "Please select a date";
    } else {
      const today = getLocalTodayString();
      if (selectedDate < today) {
        err.date = "Cannot book a date in the past";
      }
    }
    
    if (!selectedTime) {
      err.time = "Please select a time slot";
    } else if (selectedDate) {
      const todayStr = getLocalTodayString();
      if (selectedDate === todayStr) {
        try {
          const [time, modifier] = selectedTime.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          
          const now = new Date();
          const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
          if (now >= slotDate) {
            err.time = "This time slot has already passed today";
          }
        } catch (e) {}
      }
    }
    
    if (!selectedAdvisor) err.advisor = "Please select an advisor";
    if (!advisorConfirmed) err.confirm = "Please confirm the advisor selection";
    return err;
  };

  const loadRazorpayScript = () => {
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

  const processPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentStepText("Initializing secure checkout...");

    try {
      // 1. Load Razorpay SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay Payment Gateway. Check your connection.");
        setIsProcessingPayment(false);
        return;
      }

      setPaymentStepText("Creating payment order...");
      // 2. Create order on backend
      const orderRes = await ApiService.createPaymentOrder(selectedAdvisor ? selectedAdvisor.id : '');
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const { keyId, orderId, amount, currency } = orderRes.data;

      setPaymentStepText("Awaiting payment...");

      // 3. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "BEHOLD.",
        description: `${bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} Session`,
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80",
        order_id: orderId,
        handler: async function (response) {
          try {
            setPaymentStepText("Verifying payment signature...");
            
            const bookingDetails = {
              counsellorId: selectedAdvisor ? selectedAdvisor.id : '',
              date: selectedDate,
              time: selectedTime,
              mode: bookingMode,
              service: bookingService
            };

            const verifyRes = await ApiService.verifyPaymentAndBook(response, bookingDetails);
            if (verifyRes.success) {
              toast.success("Payment verified! Booking confirmed.");
              setIsProcessingPayment(false);
              setIsSuccess(true);
              handleStepChange('success');
            } else {
              throw new Error(verifyRes.message || "Verification failed");
            }
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            toast.error(verifyErr.message || "Failed to verify payment and complete booking.");
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone
        },
        theme: {
          color: "#06b6d4" // brand cyan color
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled by user.");
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      toast.error(err.message || 'Failed to initialize payment');
      setIsProcessingPayment(false);
    }
  };

  const handleAuthSuccess = (authData) => {
    setShowAuthModal(false);
    setIsSubmitting(false);
    processPayment();
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const baseErrors = {};

    // Validate Account Profile Details
    if (!bookingForm.name.trim()) baseErrors.name = 'Name is required';
    else if (bookingForm.name.trim().length < 3) baseErrors.name = 'Name must be at least 3 characters';

    if (!bookingForm.phone.trim()) {
      baseErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(bookingForm.phone)) {
        baseErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!bookingForm.email.trim()) {
      baseErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingForm.email)) {
        baseErrors.email = 'Please enter a valid email address';
      }
    }

    // Validate Payment Fields
    if (paymentMethod === 'card') {
      if (!cardName.trim()) baseErrors.cardName = "Cardholder name is required";
      if (!cardNum.trim() || cardNum.replace(/\s/g, '').length !== 16) {
        baseErrors.cardNum = "Please enter a valid 16-digit card number";
      }
      if (!cardExpiry.trim() || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        baseErrors.cardExpiry = "Expiry date must be in MM/YY format";
      }
      if (!cardCvv.trim() || cardCvv.length < 3 || cardCvv.length > 4) {
        baseErrors.cardCvv = "CVV must be 3 or 4 digits";
      }
    } else if (paymentMethod === 'upi') {
      if (!upiAddress.trim() || !upiAddress.includes('@')) {
        baseErrors.upiAddress = "Please enter a valid UPI address (e.g. name@okhdfc)";
      }
    }

    if (Object.keys(baseErrors).length > 0) {
      setErrors(baseErrors);
      const firstErrorField = ['name', 'phone', 'email', 'cardName', 'cardNum', 'cardExpiry', 'cardCvv', 'upiAddress'].find(
        (k) => baseErrors[k]
      );
      if (firstErrorField) {
        const el = document.getElementsByName(firstErrorField)[0] || document.getElementById('booking-console');
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Save Draft
    try {
      const draft = {
        bookingService,
        bookingMode,
        selectedDate,
        selectedTime,
        selectedAdvisorId: selectedAdvisor ? selectedAdvisor.id : null,
        advisorConfirmed,
        bookingForm
      };
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) { /* ignore */ }

    // Enforce Authentication
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // All valid and authenticated, process payment!
    processPayment();
  };

  const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
  const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20 bg-white text-zinc-900 text-left font-sans border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

        {/* Header */}
        <div className="text-center flex flex-col items-center space-y-4">
          <span className="text-xs bg-zinc-900 text-white px-3.5 py-1 rounded-md capitalize  font-semibold w-fit block">
            book a session
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black tracking-tight leading-none text-zinc-900 capitalize">
            Book Your Session
          </h1>
          <p className="text-zinc-650 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed font-light">
            Choose your service, pick a date and time, and confirm with a real advisor — it only takes a few minutes.
          </p>
        </div>

        {/* BOOKING FORM */}
        <div id="booking-console" className="border-0 sm:border border-zinc-200/80 p-0 sm:p-8 bg-transparent sm:bg-white/70 backdrop-blur-none sm:backdrop-blur-md space-y-6 sm:space-y-8 rounded-none sm:rounded-xl shadow-none sm:shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold capitalize tracking-wide text-zinc-900">
              Your Booking
            </h2>
          </div>

          {/* Step Progress */}
          {bookingStep !== 'success' && (() => {
            const stepMapping = { config: 0, payment: 1, success: 2 };
            const currentStepIdx = stepMapping[bookingStep] || 0;
            const stepLabels = ['Schedule & Advisor', 'Account & Payment', 'Session Confirmed'];
            return (
            <div className="bg-zinc-50 border border-zinc-200 p-3 sm:p-5 rounded-lg space-y-3 animate-in fade-in duration-300">
              {/* Mobile: compact progress bar */}
              <div className="flex sm:hidden items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-xs font-bold text-zinc-900 shrink-0">
                    Step {currentStepIdx + 1} of 3
                  </span>
                  <div className="h-1.5 flex-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-dark truncate">
                  {stepLabels[currentStepIdx]}
                </span>
              </div>

              {/* Desktop/tablet: full stepper */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold capitalize  text-xs text-zinc-900">
                      {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} &middot; {bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}
                    </h3>
                  </div>
                </div>

                <div className="flex overflow-x-auto snap-x scrollbar-none gap-3 lg:gap-4 pb-2 mt-3 lg:grid lg:grid-cols-3 lg:gap-6 w-full">
                  {activeSteps.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;

                    return (
                      <div key={idx} className="flex lg:flex-col items-start gap-3 lg:gap-2 relative shrink-0 snap-start w-[200px] sm:w-[220px] lg:w-auto">
                        <div className="flex items-center lg:w-full">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 shrink-0 ${
                            isCompleted
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : isActive
                                ? 'bg-brand border-brand text-zinc-900 shadow-xs ring-2 ring-brand/10 font-bold'
                                : 'bg-white border-zinc-200 text-zinc-400'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          {idx < activeSteps.length - 1 && (
                            <div className={`hidden lg:block h-0.5 w-full ml-2 transition-all duration-300 ${
                              isCompleted ? 'bg-zinc-900' : 'bg-zinc-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className={`text-xs font-bold capitalize  ${isActive ? 'text-brand-dark' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                            {stepLabels[idx]}
                          </span>
                          <span className={`text-xs font-light leading-snug transition-colors duration-300 mt-0.5 ${isActive ? 'text-zinc-900 font-normal' : 'text-zinc-650'}`}>
                            {step}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })()}

          {bookingStep === 'success' ? (
            /* STEP 5: Success & Confirmation View */
            <div className="p-4 sm:p-10 bg-transparent sm:bg-zinc-50 border-0 sm:border border-zinc-200 rounded-none sm:rounded-xl max-w-2xl mx-auto animate-in fade-in duration-500 space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-650 shadow-sm text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md capitalize  font-semibold w-fit mx-auto block">
                  session confirmed
                </span>
                <h3 className="text-xl sm:text-2xl font-bold capitalize text-zinc-900 tracking-wide mt-2">
                  You're All Set!
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{bookingForm.name || 'Student'}</strong>. Your payment is confirmed and your session is booked. Here's your booking summary:
                </p>
              </div>

              {/* Invoice & Meeting Card */}
              <div className="bg-white border border-zinc-200/80 rounded-xl p-5 text-left space-y-4 shadow-xs">
                <h4 className="text-xs font-semibold capitalize  text-zinc-400 border-b border-zinc-100 pb-2">
                  Booking Confirmation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-light">Advisor</span>
                    <span className="font-bold text-zinc-800">{selectedAdvisor?.name || 'Assigned Advisor'}</span>
                    <span className="text-xs text-zinc-500 block">{selectedAdvisor?.role || 'Consultant Psychologist'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-light">Service</span>
                    <span className="font-semibold text-zinc-800 capitalize">
                      {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                    </span>
                    <span className="text-xs text-zinc-500 block">Mode: {bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-light">Date & Time Slot</span>
                    <span className="font-bold text-zinc-800 block">
                      {selectedDate}
                    </span>
                    <span className="text-xs text-zinc-500  block mt-0.5">
                      {selectedTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-light">Payment</span>
                    <span className="font-semibold text-zinc-800 capitalize block">
                      {paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking'}
                    </span>
                    <span className="text-xs text-zinc-500 block">Amount Paid: ₹{(selectedAdvisor?.price || 1200) + Math.round((selectedAdvisor?.price || 1200) * 0.18) - appliedDiscount}</span>
                  </div>
                </div>

                {/* Google Meet Link if Online */}
                {bookingMode === 'ONLINE' && (
                  <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200 mt-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-700 block capitalize tracking-wide">
                        Google Meet Session Link
                      </span>
                      <span className="text-xs text-zinc-500 truncate block  max-w-[280px] sm:max-w-xs">
                        {selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij');
                        setCopiedMeet(true);
                        setTimeout(() => setCopiedMeet(false), 2000);
                      }}
                      className="px-4 py-2.5 min-h-[40px] bg-zinc-900 text-white text-xs font-bold capitalize  rounded-lg hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center border-none shadow-xs whitespace-nowrap"
                    >
                      {copiedMeet ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>

              {/* Receipt Exporter (PDF) & Restart buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  type="button"
                  disabled={downloadingPdf}
                  onClick={() => {
                    const bookingId = Date.now();
                    const advisorName = selectedAdvisor?.name || 'Assigned Advisor';
                    const advisorRole = selectedAdvisor?.role || 'Consultant Psychologist';
                    const service = bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
                    const mode = bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';
                    const amount = (selectedAdvisor?.price || 1200) + Math.round((selectedAdvisor?.price || 1200) * 0.18) - appliedDiscount;
                    const clientName = bookingForm.name || 'Student';
                    const clientEmail = bookingForm.email;
                    const clientPhone = bookingForm.phone;
                    const meetLink = bookingMode === 'ONLINE' ? (selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij') : null;

                    downloadPDFReceipt({
                      id: bookingId,
                      service,
                      mode,
                      advisorName,
                      advisorRole,
                      date: selectedDate,
                      time: selectedTime,
                      clientName,
                      clientEmail,
                      clientPhone,
                      amount,
                      meetLink
                    });
                  }}
                  className="px-6 py-3 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 text-xs font-bold capitalize rounded-lg transition cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <FileDown className="w-4 h-4 text-zinc-700" />
                  {downloadingPdf ? 'Generating PDF...' : 'Download PDF Receipt'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setSelectedDate('');
                    setSelectedTime('');
                    setSelectedAdvisor(null);
                    setAdvisorConfirmed(false);
                    setAppliedDiscount(0);
                    setCouponInput('');
                    setCardNum('');
                    setCardName('');
                    setCardExpiry('');
                    setCardCvv('');
                    setUpiAddress('');
                    setBookingStep('config');
                    try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch (e) { /* ignore */ }
                  }}
                  className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold capitalize  rounded-lg transition cursor-pointer w-full sm:w-auto text-center border-none shadow-md"
                >
                  Book Another Session
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1-4 Wizard flow Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Active Step Form Panel */}
              <div className="lg:col-span-8 lg:bg-white bg-transparent border-0 lg:border border-zinc-200/85 p-0 sm:p-4 lg:p-7 rounded-none lg:rounded-xl space-y-6 shadow-none lg:shadow-xs text-left min-h-[380px] relative">
                
                {/* STEP 1: Schedule & Advisor */}
                {bookingStep === 'config' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-zinc-100 pb-3">
                      <h3 className="text-sm font-semibold capitalize  text-zinc-850 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                        Schedule & Advisor
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Select a date, choose your advisor, and pick a time.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Service Type Selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Service Type</label>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {[
                            { id: 'counselling', label: 'Psychological' },
                            { id: 'career', label: 'Career' }
                          ].map((s) => (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => setBookingService(s.id)}
                              className={`px-3 py-3 text-xs capitalize font-bold border rounded-xl transition cursor-pointer text-center min-h-[56px] leading-tight ${
                                bookingService === s.id
                                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-xs font-bold'
                                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                              }`}
                            >
                              <span className="flex flex-col items-center">
                                <span>{s.label}</span>
                                <span className="text-xs font-normal normal-case text-zinc-400">
                                  {s.id === 'counselling' ? 'Counselling' : 'Mentoring'}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Mode of Session Select */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Session Mode</label>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[
                            { id: 'ONLINE', label: 'Online', desc: 'Video call' },
                            { id: 'DOOR_STEP', label: 'Doorstep', desc: 'Home visit' },
                            { id: 'OFFLINE', label: 'Offline', desc: 'At center' }
                          ].map((m) => (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => setBookingMode(m.id)}
                              className={`flex flex-col items-center justify-center gap-1 px-2 py-3.5 text-xs capitalize font-semibold border rounded-xl transition cursor-pointer text-center min-h-[56px] leading-tight ${
                                bookingMode === m.id
                                  ? 'bg-brand/10 text-brand-dark border-brand/30 shadow-xs font-bold'
                                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                              }`}
                            >
                              <span className="flex flex-col items-center">
                                <span>{m.label}</span>
                                <span className="text-xs font-normal normal-case text-zinc-400">{m.desc}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Select Date */}
                    <div className="space-y-2 pt-4 border-t border-zinc-100">
                      <label className="text-sm font-bold text-zinc-700 block">1. Select Date</label>
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <DateTimePicker
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onDateChange={handleDateChange}
                          onTimeChange={(t) => {
                            setSelectedTime(t);
                            if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                          }}
                          getAvailableSlotsForDate={(date) => getAvailableSlotsForDate(date, bookingService)}
                          errors={errors}
                          selectedMode={bookingMode}
                        />
                      </div>
                    </div>

                    {/* Step 2: Advisor Selection */}
                    {(selectedDate || isAdvisorLocked) && (
                      <div className="space-y-3 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold text-zinc-700 block">
                          2. {isAdvisorLocked ? 'Advisor Pre-Selected' : 'Choose Advisor'}
                        </label>
                        {isAdvisorLocked && selectedAdvisor ? (
                          <div className="p-4 border border-brand bg-brand/5 shadow-sm ring-1 ring-brand/10 rounded-xl">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1.5 text-left min-w-0 flex-1">
                                <h4 className="font-semibold text-zinc-900 text-sm sm:text-base leading-tight">{selectedAdvisor.name}</h4>
                                <p className="text-xs sm:text-xs text-zinc-500 font-medium">{selectedAdvisor.role}</p>
                                <span className="text-xs font-semibold text-brand-dark mt-1 inline-block">Pre-selected</span>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="text-sm font-bold text-zinc-900">₹{selectedAdvisor.price}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {advisors
                              .filter(advisor => advisor.type === bookingService)
                              .filter(advisor => !advisor.modes || advisor.modes.includes(bookingMode))
                              .map((advisor) => {
                                const slots = getAdvisorSlotsForDate(advisor, selectedDate);
                                const isAvailable = slots.length > 0;

                                return (
                                  <div
                                    key={advisor.id}
                                    onClick={() => {
                                      if (!isAvailable) return;
                                      setSelectedAdvisor(advisor);
                                      setAdvisorConfirmed(true);
                                      if (errors.advisor) setErrors(prev => ({ ...prev, advisor: null }));
                                      if (errors.confirm) setErrors(prev => ({ ...prev, confirm: null }));
                                      if (advisor.modes && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
                                        setBookingMode(advisor.modes[0]);
                                      }
                                      // Clear selected time if they change advisor
                                      setSelectedTime('');
                                    }}
                                    className={`p-4 border rounded-xl transition ${
                                      !isAvailable
                                        ? 'bg-zinc-50 border-zinc-150 opacity-50 cursor-not-allowed'
                                        : selectedAdvisor?.id === advisor.id
                                          ? 'bg-brand/5 border-brand shadow-sm ring-1 ring-brand/10 cursor-pointer active:scale-[0.98]'
                                          : 'bg-white border-zinc-200 hover:border-brand/40 hover:bg-zinc-50 cursor-pointer active:scale-[0.98]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="space-y-1.5 text-left min-w-0 flex-1">
                                        <h4 className={`font-semibold text-sm sm:text-base leading-tight ${!isAvailable ? 'text-zinc-400' : 'text-zinc-900'}`}>
                                          {advisor.name}
                                        </h4>
                                        <p className="text-xs sm:text-xs text-zinc-500 font-medium">{advisor.role}</p>
                                        {!isAvailable && (
                                          <span className="text-[10px] text-rose-500 font-semibold mt-1 inline-block">
                                            Unavailable on this date
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className={`text-sm font-bold ${!isAvailable ? 'text-zinc-400' : 'text-zinc-900'}`}>
                                          ₹{advisor.price}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            {errors.advisor && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.advisor}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Time Selection */}
                    {selectedDate && selectedAdvisor && (
                      <div className="space-y-3 pt-6 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold text-zinc-700 block">3. Select Time</label>
                        <TimePicker
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                          onTimeChange={(t) => {
                            setSelectedTime(t);
                            if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                          }}
                          availableSlots={getAdvisorSlotsForDate(selectedAdvisor, selectedDate)}
                          errors={errors}
                        />
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-4 border-t border-zinc-200">
                      <button
                        type="button"
                        disabled={!selectedDate || !selectedTime || !selectedAdvisor}
                        onClick={() => handleStepChange('payment')}
                        className="px-6 py-3 min-h-[48px] bg-zinc-900 text-white font-bold capitalize  text-xs rounded-lg transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-xs w-full sm:w-auto"
                      >
                        Account & Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Account & Payment */}
                {bookingStep === 'payment' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="border-b border-zinc-100 pb-3">
                      <h3 className="text-sm font-semibold capitalize  text-zinc-850 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                        Your Details & Account
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {user
                          ? 'Signed in. Confirm your details, then proceed to payment.'
                          : 'Fill your details, then sign in or create a free account to continue.'}
                      </p>
                    </div>

                    {user && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-emerald-800 block truncate">{user.name}</span>
                          <span className="text-xs text-emerald-600  truncate block">{user.email}</span>
                        </div>
                        <span className="shrink-0 text-xs font-bold capitalize  bg-emerald-100 border border-emerald-300 text-emerald-700 px-2.5 py-1 rounded-lg">
                          ✓ Authenticated
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={bookingForm.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs font-medium text-zinc-850 outline-none focus:border-brand transition ${
                            errors.name ? 'border-rose-300' : 'border-zinc-200'
                          }`}
                        />
                        {errors.name && <p className="text-[9.5px] text-rose-500 font-bold">{errors.name}</p>}
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">WhatsApp / Mobile</label>
                        <input
                          type="tel"
                          name="phone"
                          value={bookingForm.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. 9876543210"
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-xs font-medium text-zinc-850 outline-none focus:border-brand transition ${
                            errors.phone ? 'border-rose-300' : 'border-zinc-200'
                          }`}
                        />
                        {errors.phone && <p className="text-[9.5px] text-rose-500 font-bold">{errors.phone}</p>}
                      </div>
                      <div className="space-y-1 sm:col-span-2 text-left">
                        <label className="text-xs font-bold text-zinc-500 capitalize tracking-wide block">
                          Email Address {user && <span className="text-emerald-600 normal-case font-bold">(verified)</span>}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={bookingForm.email}
                          onChange={handleInputChange}
                          disabled={!!user}
                          placeholder="you@example.com"
                          className={`w-full px-3.5 py-2.5 border rounded-lg text-xs font-medium outline-none transition ${
                            user
                              ? 'bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed'
                              : `bg-white text-zinc-850 ${errors.email ? 'border-rose-300 focus:border-rose-400' : 'border-zinc-200 focus:border-brand'}`
                          }`}
                        />
                        {errors.email && !user && <p className="text-[9.5px] text-rose-500 font-bold">{errors.email}</p>}
                      </div>
                    </div>

                    {!user && (
                      <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-xs text-zinc-500 text-left">
                        <span className="text-zinc-800 font-semibold block">Account Required to Continue</span>
                        You'll be asked to sign in or create a free account when you click "Proceed to Payment" — your booking details are saved automatically.
                      </div>
                    )}

                    {user && (
                      <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-xs text-zinc-500 text-left">
                        <span className="text-zinc-800 font-semibold block">Notification Reminders</span>
                        Live session reminders will be sent to your verified email &amp; WhatsApp number.
                      </div>
                    )}


                    {/* --- PAYMENT SECTION --- */}
                    <div className="pt-4 border-t border-zinc-200 mt-6">
                      <div className="border-b border-zinc-100 pb-3 mb-6">
                        <h3 className="text-sm font-semibold capitalize  text-zinc-850 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center shrink-0 font-bold">4</span>
                          Payment & Confirm
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Choose payment method, apply any promo codes, and confirm your booking.</p>
                      </div>

                      <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      
                       
                      {/* Payment Methods tabs selector */}
                      <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Select Payment Method</label>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[
                            { id: 'card', label: 'Card Pay', desc: 'Credit/Debit' },
                            { id: 'upi', label: 'UPI / QR', desc: 'Instant Pay' },
                            { id: 'netbanking', label: 'Net Banking', desc: 'Bank Portal' }
                          ].map((m) => {
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setPaymentMethod(m.id);
                                  setErrors({});
                                }}
                                className={`flex flex-col items-center justify-center gap-1 p-2 border rounded-xl transition cursor-pointer text-center min-h-[56px] leading-tight ${
                                  paymentMethod === m.id
                                    ? 'bg-zinc-900 border-zinc-900 text-white font-semibold shadow-sm'
                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand/40'
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <span className="text-xs sm:text-xs capitalize  font-bold">{m.label}</span>
                                  <span className="text-xs text-zinc-400 font-normal normal-case">{m.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Payment inputs fields */}
                      <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
                        
                        {/* CARD CHECKOUT FORM */}
                        {paymentMethod === 'card' && (
                          <div className="space-y-3.5 animate-in fade-in duration-300 text-left">
                            <span className="text-[9.5px] text-zinc-400 block  capitalize font-semibold">Card Details</span>
                            
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-550 block">Cardholder Name</label>
                              <input
                                type="text"
                                value={cardName}
                                onChange={(e) => {
                                  setCardName(e.target.value);
                                  if (errors.cardName) setErrors(prev => ({ ...prev, cardName: null }));
                                }}
                                placeholder="e.g. John Doe"
                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                              />
                              {errors.cardName && <p className="text-xs text-rose-500 font-bold">{errors.cardName}</p>}
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-550 block">16-Digit Card Number</label>
                              <input
                                type="text"
                                maxLength="19"
                                value={cardNum}
                                onChange={(e) => {
                                  // Auto format with spaces: xxxx xxxx xxxx xxxx
                                  const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                  const matches = v.match(/\d{4,16}/g);
                                  const match = matches && matches[0] || '';
                                  const parts = [];
                                  for (let i=0, len=match.length; i<len; i+=4) {
                                    parts.push(match.substring(i, i+4));
                                  }
                                  if (parts.length > 0) {
                                    setCardNum(parts.join(' '));
                                  } else {
                                    setCardNum(v);
                                  }
                                  if (errors.cardNum) setErrors(prev => ({ ...prev, cardNum: null }));
                                }}
                                placeholder="xxxx xxxx xxxx xxxx"
                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-850  outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                              />
                              {errors.cardNum && <p className="text-xs text-rose-500 font-bold">{errors.cardNum}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-550 block">Expiry Date</label>
                                <input
                                  type="text"
                                  maxLength="5"
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    // format: MM/YY
                                    let v = e.target.value.replace(/\D/g, '');
                                    if (v.length > 2) {
                                      v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                    }
                                    setCardExpiry(v);
                                    if (errors.cardExpiry) setErrors(prev => ({ ...prev, cardExpiry: null }));
                                  }}
                                  placeholder="MM/YY"
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-850  outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                                />
                                {errors.cardExpiry && <p className="text-xs text-rose-500 font-bold">{errors.cardExpiry}</p>}
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-555 block">CVV Code</label>
                                <input
                                  type="password"
                                  maxLength="4"
                                  value={cardCvv}
                                  onChange={(e) => {
                                    setCardCvv(e.target.value.replace(/\D/g, ''));
                                    if (errors.cardCvv) setErrors(prev => ({ ...prev, cardCvv: null }));
                                  }}
                                  placeholder="•••"
                                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-850  outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                                />
                                {errors.cardCvv && <p className="text-xs text-rose-500 font-bold">{errors.cardCvv}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* UPI CHECKOUT FORM */}
                        {paymentMethod === 'upi' && (
                          <div className="space-y-4 animate-in fade-in duration-300 text-left">
                            <span className="text-[9.5px] text-zinc-400 block  capitalize font-semibold">UPI Payment</span>
                            
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-550 block">Enter UPI ID</label>
                              <input
                                type="text"
                                value={upiAddress}
                                onChange={(e) => {
                                  setUpiAddress(e.target.value);
                                  if (errors.upiAddress) setErrors(prev => ({ ...prev, upiAddress: null }));
                                }}
                                placeholder="name@upi (or name@okhdfc)"
                                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-850 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                              />
                              {errors.upiAddress && <p className="text-xs text-rose-500 font-bold">{errors.upiAddress}</p>}
                            </div>

                            {/* PREMIUM STYLE QR SCAN CARD */}
                            <div className="border border-zinc-200/80 bg-zinc-50 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left">
                              {/* QR Image Vector simulation */}
                              <div className="w-28 h-28 bg-white border border-zinc-250 p-2 rounded-lg relative overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                <div className="absolute inset-0 bg-brand/5 pointer-events-none" />
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand animate-scan z-10" />
                                <svg width="84" height="84" viewBox="0 0 100 100" className="text-zinc-900 fill-current">
                                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <rect x="10" y="10" width="15" height="15" />
                                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <rect x="75" y="10" width="15" height="15" />
                                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                                  <rect x="10" y="75" width="15" height="15" />
                                  
                                  <rect x="42" y="42" width="16" height="16" fill="#18181b" rx="2" />
                                  <circle cx="50" cy="50" r="3" fill="#ffffff" />
                                  
                                  <rect x="40" y="10" width="8" height="8" />
                                  <rect x="52" y="15" width="6" height="12" />
                                  <rect x="15" y="40" width="8" height="12" />
                                  <rect x="10" y="55" width="12" height="6" />
                                  <rect x="42" y="70" width="14" height="8" />
                                  <rect x="72" y="45" width="10" height="15" />
                                  <rect x="80" y="72" width="15" height="15" />
                                  <rect x="65" y="65" width="8" height="8" />
                                  <rect x="50" y="82" width="15" height="6" />
                                </svg>
                              </div>
                              <div className="space-y-1 text-center sm:text-left">
                                <h5 className="text-xs font-bold capitalize text-zinc-800 ">Scan QR Code</h5>
                                <p className="text-[9.5px] text-zinc-550 leading-relaxed font-light">
                                  Open BHIM, GooglePay, Paytm, or PhonePe and scan this code to pay.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* NET BANKING CHECKOUT FORM */}
                        {paymentMethod === 'netbanking' && (
                          <div className="space-y-3.5 animate-in fade-in duration-300 text-left">
                            <span className="text-[9.5px] text-zinc-400 block  capitalize font-semibold">Net Banking</span>
                            
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-555 block">Select Bank Partner</label>
                              <select
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition cursor-pointer"
                              >
                                <option value="SBI">State Bank of India (SBI)</option>
                                <option value="HDFC">HDFC Bank</option>
                                <option value="ICICI">ICICI Bank</option>
                                <option value="AXIS">Axis Bank</option>
                                <option value="KOTAK">Kotak Mahindra Bank</option>
                              </select>
                              <p className="text-[9.5px] text-zinc-400 mt-1 italic leading-snug">
                                You will be redirected to {selectedBank === 'SBI' ? 'State Bank of India' : selectedBank === 'HDFC' ? 'HDFC Bank' : selectedBank === 'ICICI' ? 'ICICI Bank' : selectedBank === 'AXIS' ? 'Axis Bank' : 'Kotak Mahindra Bank'}'s portal for authorization.
                              </p>
                            </div>
                          </div>
                        )}

                      </div>



                      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200 mt-6">
                        <button
                          type="button"
                          onClick={() => handleStepChange('config')}
                          className="px-5 py-3 min-h-[44px] bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-bold capitalize  text-xs rounded-lg transition cursor-pointer w-full sm:w-auto text-center"
                        >
                          Back to Schedule
                        </button>

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="px-6 py-3 min-h-[48px] bg-gradient-brand text-zinc-900 font-bold capitalize  text-xs rounded-lg transition flex items-center justify-center cursor-pointer shadow-md border-none disabled:opacity-50 w-full sm:w-auto"
                        >
                          {isProcessingPayment ? (
                            <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                          ) : (
                            <span>Pay & Confirm</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Booking Sidebar Summary */}
              <div className="lg:col-span-4 lg:sticky lg:top-20 text-left">
                {/* Mobile toggle */}
                <button
                  type="button"
                  onClick={() => setShowSummary(!showSummary)}
                  className="flex lg:hidden items-center justify-between w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-left shadow-xs mb-3 hover:bg-zinc-100 transition cursor-pointer"
                >
                  <span className="text-xs font-bold capitalize  text-zinc-850 flex items-center gap-2">
                    <span>Booking Summary</span>
                    {selectedAdvisor && (
                      <span className="text-xs bg-brand/10 text-brand-dark px-2 py-0.5 rounded font-bold">
                        {bookingService === 'counselling' ? 'Counselling' : 'Career'}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showSummary ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className={`bg-transparent lg:bg-zinc-50 border-0 lg:border border-zinc-200 p-0 lg:p-5 rounded-none lg:rounded-xl space-y-5 shadow-none lg:shadow-xs ${showSummary ? 'block' : 'hidden'} lg:block`}>
                <div>
                  <h3 className="text-xs font-bold capitalize  text-zinc-850 border-b border-zinc-200 pb-2 hidden lg:block">
                    Booking Summary
                  </h3>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  {/* Service type & Mode */}
                  <div>
                    <span className="text-[9.5px] text-zinc-400 capitalize tracking-wide block font-semibold mb-0.5">Service & Mode</span>
                    <span className="font-bold text-zinc-800 block text-left">
                      {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                    </span>
                    <span className="text-xs text-zinc-500 font-semibold capitalize block mt-0.5 bg-white border border-zinc-150 rounded px-2 py-0.5 w-fit">
                      {bookingMode.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Date & Time Slot */}
                  <div>
                    <span className="text-[9.5px] text-zinc-400 capitalize tracking-wide block font-semibold mb-0.5">Date & Time</span>
                    {selectedDate && selectedTime ? (
                      <div className="space-y-1 bg-white border border-zinc-150 p-2 rounded-lg text-left">
                        <span className="font-bold text-zinc-800 block">
                          {selectedDate}
                        </span>
                        <span className="text-xs text-zinc-500  block">
                          {selectedTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic font-light text-xs block text-left">Not configured yet</span>
                    )}
                  </div>

                  {/* Selected Advisor */}
                  <div>
                    <span className="text-[9.5px] text-zinc-400 capitalize tracking-wide block font-semibold mb-0.5">Advisor</span>
                    {selectedAdvisor ? (
                      <div className="bg-white border border-zinc-150 p-2.5 rounded-lg text-left">
                        <span className="font-bold text-zinc-800 block text-xs">{selectedAdvisor.name}</span>
                        <span className="text-[9.5px] text-zinc-500 block font-normal">{selectedAdvisor.role}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic font-light text-xs block text-left">No advisor selected</span>
                    )}
                  </div>

                  {/* Invoice ledger calculation breakdown */}
                  {(() => {
                    // Read GST settings from site settings (persisted by App.jsx)
                    let gstEnabled = false;
                    let gstPercent = 0;
                    try {
                      const stored = localStorage.getItem('behold_site_settings');
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        gstEnabled = parsed.gstEnabled === true;
                        gstPercent = typeof parsed.gstPercent === 'number' ? parsed.gstPercent : 0;
                      }
                    } catch (e) {}

                    const baseFee = selectedAdvisor ? (selectedAdvisor.price || 0) : 0;
                    const gstAmount = gstEnabled && gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
                    const netTotal = Math.max(0, baseFee + gstAmount - appliedDiscount);

                    return (
                      <div className="pt-3 border-t border-zinc-200 space-y-2">
                        <span className="text-[9.5px] text-zinc-400 capitalize tracking-wide block font-semibold text-left">Pricing Breakdown</span>
                        
                        {/* Fee list */}
                        <div className="space-y-1.5 text-xs font-semibold text-zinc-650">
                          <div className="flex justify-between">
                            <span>Session Fee</span>
                            <span className="text-zinc-800 font-bold">₹{baseFee}</span>
                          </div>
                          
                          {gstEnabled && (
                            <div className="flex justify-between">
                              <span>GST ({gstPercent}%)</span>
                              <span className="text-zinc-800 font-bold">₹{gstAmount}</span>
                            </div>
                          )}

                          {appliedDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                              <span>Promo Discount</span>
                              <span>-₹{appliedDiscount}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-xs font-bold text-zinc-900 border-t border-zinc-200 pt-2 mt-1">
                            <span>Net Total</span>
                            <span className="text-brand-dark">₹{netTotal}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Security badge */}
                  <div className="pt-4 border-t border-zinc-200 text-xs font-bold text-zinc-400 capitalize text-center w-full">
                    <span>SSL Secure Checkout</span>
                  </div>

                </div>

              </div>
              </div>

            </div>
          )}

        </div>

        <BookingAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setIsSubmitting(false);
          }}
          onSuccess={handleAuthSuccess}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
        />

        {showNoCounsellorsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-amber-50 border border-amber-250 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm text-xl font-bold ">
                !
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold capitalize text-zinc-900 tracking-wide">
                  No Counsellors Found
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans font-light">
                  There are no counsellors available matching your selected service type or mode. Please adjust your session preferences and try again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNoCounsellorsModal(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs capitalize  rounded-lg cursor-pointer transition border-none shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
