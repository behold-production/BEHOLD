import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCustomDialog } from '../context/CustomDialogContext';
import toast from 'react-hot-toast';
import ApiService from '../services/api';
import DateTimePicker from './booking/DateTimePicker';
import TimePicker from './booking/TimePicker';
import BookingAuthModal from './booking/BookingAuthModal';
import { jsPDF } from 'jspdf';
import { FileDown } from 'lucide-react';
import { formatDateString } from '../utils/dateFormatter';

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
  const { showAlert } = useCustomDialog();

  let enablePsychology = true;
  try {
    const stored = localStorage.getItem('behold_site_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      enablePsychology = parsed.enablePsychology !== false;
    }
  } catch (err) {}

  const isRescheduleParam = !!(new URLSearchParams(window.location.search).get('reschedule'));

  if (!enablePsychology && !isRescheduleParam) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-zinc-50 font-sans select-none">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md border border-zinc-200/80 p-8 rounded-2xl sm:rounded-3xl shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto text-brand-dark shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] bg-zinc-900 text-white px-3 py-1 rounded-md capitalize font-bold w-fit mx-auto block tracking-wide">
              system notice
            </span>
            <h2 className="text-xl sm:text-2xl font-header font-black tracking-tight text-zinc-900 capitalize">
              Bookings are Temporarily Paused
            </h2>
            <p className="text-xs sm:text-sm text-zinc-650 leading-relaxed font-light">
              We are currently performing scheduled maintenance on our scheduling database. During this time, booking new consulting sessions is temporarily offline. We apologize for the inconvenience!
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-150 flex flex-col sm:flex-row gap-3 justify-center items-center font-semibold">
            <button
              type="button"
              onClick={() => {
                window.spaNavigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 min-h-[48px] bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold capitalize rounded-lg transition-all cursor-pointer shadow-md w-full sm:w-auto text-center border-none"
            >
              Go to Home Page
            </button>
            <button
              type="button"
              onClick={() => {
                window.spaNavigate('/sample-test');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 min-h-[48px] bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer w-full sm:w-auto text-center"
            >
              Take Sample Test
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [bookingService, setBookingService] = useState(() => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const urlService = queryParams.get('service') || queryParams.get('type');
      if (urlService === 'career' || urlService === 'counselling') {
        return urlService;
      }
    } catch (e) {}
    return 'counselling';
  }); // counselling, career
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
  const [rescheduleSession, setRescheduleSession] = useState(null);

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

        // Process reschedule param if present
        const queryParams = new URLSearchParams(window.location.search);
        const rescheduleId = queryParams.get('reschedule');
        if (rescheduleId) {
          const sessionsRes = await ApiService.getSessions();
          if (sessionsRes.success && sessionsRes.data) {
            const actualSessionId = rescheduleId;
            const foundSession = sessionsRes.data.find(s => s.id === actualSessionId || s.appointmentId === actualSessionId || s.id === 'mock_session_' + actualSessionId);
            if (foundSession) {
              setRescheduleSession(foundSession);
              setBookingService(foundSession.service || 'counselling');
              setBookingMode(foundSession.mode || 'ONLINE');
              
              // Resolve counsellor object
              const matchedCounsellor = resolved.find(a => a.id === foundSession.counsellorId);
              if (matchedCounsellor) {
                setSelectedAdvisor(matchedCounsellor);
                setAdvisorConfirmed(true);
              } else {
                const tempAdvisor = {
                  id: foundSession.counsellorId,
                  name: foundSession.counsellorName || foundSession.advisorName || 'Your Psychologist',
                  role: foundSession.advisorRole || 'Consultant Psychologist',
                  price: foundSession.amountPaid || 1200,
                  modes: [foundSession.mode || 'ONLINE'],
                  availabilitySlots: {}
                };
                setSelectedAdvisor(tempAdvisor);
                setAdvisorConfirmed(true);
              }
            }
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

  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');

  // Payment form states

  const [copiedMeet, setCopiedMeet] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Read GST & Promo settings from site settings (persisted by App.jsx)
  let gstEnabled = false;
  let gstPercent = 0;
  let sitePromoCodes = [];
  try {
    const stored = localStorage.getItem('behold_site_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      gstEnabled = parsed.gstEnabled === true;
      gstPercent = typeof parsed.gstPercent === 'number' ? parsed.gstPercent : 0;
      sitePromoCodes = parsed.promoCodes || [];
    }
  } catch (err) {}

  const baseFee = selectedAdvisor ? (selectedAdvisor.price || 0) : 0;
  const gstAmount = gstEnabled && gstPercent > 0 ? Math.round(baseFee * (gstPercent / 100)) : 0;
  const netTotal = Math.max(0, baseFee + gstAmount - appliedDiscount);

  const downloadPDFReceipt = async (bookingDetails) => {
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top Banner Accent Bar (Teal brand color #06b6d4)
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 210, 8, 'F');

      // Header Brand Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('BEHOLD.', 20, 25);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text('Premium Career Guidance & Mental Health Platform', 20, 30);

      // Status Badge
      doc.setFillColor(240, 253, 250); // light teal background
      doc.roundedRect(142, 18, 48, 10, 2, 2, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136); // Teal text
      doc.text('CONFIRMED & PAID', 147, 24.5);

      // Divider Line
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.line(20, 36, 190, 36);

      // Client & Billing Info Grid
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42); // zinc-800
      doc.text('CLIENT DETAILS', 20, 46);
      doc.text('RECEIPT METADATA', 120, 46);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91); // zinc-600
      
      // Client info
      doc.text(`Name: ${bookingDetails.clientName}`, 20, 52);
      doc.text(`Email: ${bookingDetails.clientEmail || 'N/A'}`, 20, 58);
      doc.text(`Phone: ${bookingDetails.clientPhone || 'N/A'}`, 20, 64);

      // Receipt Metadata info
      const displayId = bookingDetails.id ? bookingDetails.id.toString().substring(Math.max(0, bookingDetails.id.toString().length - 6)) : 'N/A';
      doc.text(`Receipt ID: REC-${displayId}`, 120, 52);
      doc.text(`Booking ID: SB-${bookingDetails.id || 'N/A'}`, 120, 58);
      doc.text(`Date of Issue: ${formatDateString(new Date())}`, 120, 64);

      // Divider Line
      doc.line(20, 70, 190, 70);

      // Booking Specifics
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('SESSION DETAILS', 20, 80);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      doc.text(`Service Type: ${bookingDetails.service}`, 20, 86);
      doc.text(`Advisor Assigned: ${bookingDetails.advisorName} (${bookingDetails.advisorRole})`, 20, 92);
      doc.text(`Session Schedule: ${formatDateString(bookingDetails.date)} at ${bookingDetails.time}`, 20, 98);
      doc.text(`Session Mode: ${bookingDetails.mode}`, 20, 104);

      // Divider Line
      doc.line(20, 110, 190, 110);

      // Pricing Breakdown Table
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('CHARGES BREAKDOWN', 20, 120);

      // Table Header Background
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.rect(20, 124, 170, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(63, 63, 70); // zinc-700
      doc.text('Description', 24, 129.5);
      doc.text('Amount', 160, 129.5);

      // Table Rows
      let tableY = 138;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(82, 82, 91);

      // Resolve breakdown metrics dynamically
      const detailsBaseFee = typeof bookingDetails.baseFee === 'number' ? bookingDetails.baseFee : baseFee;
      const detailsGstPercent = typeof bookingDetails.gstPercent === 'number' ? bookingDetails.gstPercent : (gstEnabled ? gstPercent : 0);
      const detailsGstAmount = typeof bookingDetails.gstAmount === 'number' ? bookingDetails.gstAmount : (gstEnabled && gstPercent > 0 ? Math.round(detailsBaseFee * (detailsGstPercent / 100)) : 0);
      const detailsDiscount = typeof bookingDetails.appliedDiscount === 'number' ? bookingDetails.appliedDiscount : appliedDiscount;
      const detailsNetTotal = typeof bookingDetails.amount === 'number' ? bookingDetails.amount : Math.max(0, detailsBaseFee + detailsGstAmount - detailsDiscount);

      // 1. Base fee
      doc.text(`${bookingDetails.service} Session Booking Fee`, 24, tableY);
      doc.text(`Rs. ${detailsBaseFee.toFixed(2)}`, 160, tableY);
      tableY += 8;

      // 2. GST (if enabled)
      if (detailsGstAmount > 0) {
        doc.text(`GST (${detailsGstPercent}%)`, 24, tableY);
        doc.text(`Rs. ${detailsGstAmount.toFixed(2)}`, 160, tableY);
        tableY += 8;
      }

      // 3. Discount (if applied)
      if (detailsDiscount > 0) {
        doc.setTextColor(22, 163, 74); // green
        doc.text(`Promo Discount Code`, 24, tableY);
        doc.text(`-Rs. ${detailsDiscount.toFixed(2)}`, 160, tableY);
        tableY += 8;
        doc.setTextColor(82, 82, 91); // reset to zinc-600
      }

      // Border line for total
      doc.setDrawColor(228, 228, 231);
      doc.line(20, tableY - 4, 190, tableY - 4);

      // Total Row
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('Net Total Paid', 24, tableY + 2);
      doc.setTextColor(13, 148, 136); // Teal color for total price
      doc.setFontSize(10.5);
      doc.text(`INR ${detailsNetTotal.toFixed(2)}`, 160, tableY + 2);
      
      tableY += 16;

      // Google Meet Session Link if Online
      if (bookingDetails.meetLink) {
        doc.setFillColor(240, 253, 250); // Light teal bg
        doc.roundedRect(20, tableY, 170, 18, 2, 2, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text('Google Meet Session Link (Online Video Call):', 25, tableY + 6);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(6, 182, 212); // blue-link
        doc.text(bookingDetails.meetLink, 25, tableY + 12);
        
        tableY += 28;
      } else {
        tableY += 10;
      }

      // Footer Notes
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text('This is a secure computer-generated booking receipt. No physical signature is required.', 20, tableY);
      doc.text('For rescheduling queries, cancellations, or support, please reply to your coordinator on WhatsApp.', 20, tableY + 5);

      // Save document
      doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
    } catch (e) {
      console.error(e);
      await showAlert("Failed to generate PDF receipt. Please contact platform support.", "Export Error");
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
  
  const getAdvisorAllSlotsForDate = (advisor, dateStr) => {
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
          return true;
        });
      }
    } catch (e) {
      console.error("Error checking all slots for advisor:", e);
    }
    return [];
  };

  const getAdvisorBookedSlotsForDate = (advisor, dateStr) => {
    if (!dateStr || !advisor) return [];
    const bookings = existingAppointments;
    return bookings
      .filter(b => 
        b.counsellorId === advisor.id && 
        b.date === dateStr && 
        (b.status === 'APPROVED' || b.status === 'PENDING' || b.status === 'CONFIRMED')
      )
      .map(b => b.time);
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
    if (preselectedAdvisorId) {
      // Check if it's a known service type indicator directly without waiting for advisors load
      if (preselectedAdvisorId === 'career_1' || preselectedAdvisorId === 'career') {
        setBookingService('career');
        setSelectedAdvisor(null);
        setAdvisorConfirmed(false);
        if (clearPreselectedAdvisor) {
          clearPreselectedAdvisor();
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
        return;
      }
      if (preselectedAdvisorId === 'c3' || preselectedAdvisorId === 'counselling') {
        setBookingService('counselling');
        setSelectedAdvisor(null);
        setAdvisorConfirmed(false);
        if (clearPreselectedAdvisor) {
          clearPreselectedAdvisor();
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
        return;
      }

      // Otherwise, it is a real advisor ID, wait for advisors to load
      if (advisors.length > 0) {
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
      
      const bookingDetails = {
        counsellorId: selectedAdvisor ? selectedAdvisor.id : '',
        date: selectedDate,
        time: selectedTime,
        mode: bookingMode,
        service: bookingService,
        couponCode: couponInput
      };

      // 2. Create order on backend
      const orderRes = await ApiService.createPaymentOrder(selectedAdvisor ? selectedAdvisor.id : '', bookingDetails);
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
              service: bookingService,
              couponCode: couponInput
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

  const handleRescheduleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time slot first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const apptId = rescheduleSession.appointmentId;
      const res = await ApiService.rescheduleAppointment(apptId, selectedDate, selectedTime);
      if (res.success) {
        toast.success(res.message || "Reschedule requested! Pending counsellor approval.");
        setIsSuccess(true);
        setBookingStep('success');
      } else {
        toast.error(res.message || "Rescheduling failed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reschedule session.");
    } finally {
      setIsSubmitting(false);
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

    // (Payment fields removed because Razorpay checkout handles them)

    if (Object.keys(baseErrors).length > 0) {
      setErrors(baseErrors);
      const firstErrorField = ['name', 'phone', 'email'].find(
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
            {rescheduleSession ? 'reschedule session' : 'book a session'}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-header font-black tracking-tight leading-none text-zinc-900 capitalize">
            {rescheduleSession ? 'Reschedule Your Session' : 'Book Your Session'}
          </h1>
          <p className="text-zinc-650 max-w-xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed font-light">
            {rescheduleSession
              ? `Reschedule your appointment with ${rescheduleSession.advisorName || rescheduleSession.counsellorName}. Pick a new date and time.`
              : 'Choose your service, pick a date and time, and confirm with a real advisor — it only takes a few minutes.'}
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
                  {rescheduleSession ? 'reschedule requested' : 'session confirmed'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold capitalize text-zinc-900 tracking-wide mt-2">
                  {rescheduleSession ? 'Reschedule Requested' : "You're All Set!"}
                </h3>
                <p className="text-xs text-zinc-650 max-w-md mx-auto leading-relaxed">
                  {rescheduleSession ? (
                    <>
                      Your reschedule request for <strong>{bookingForm.name || user?.name || 'Student'}</strong> has been submitted.
                      The counsellor <strong>{selectedAdvisor?.name}</strong> has been notified and needs to approve this request.
                    </>
                  ) : (
                    <>
                      Thank you, <strong>{bookingForm.name || 'Student'}</strong>. Your payment is confirmed and your session is booked. Here's your booking summary:
                    </>
                  )}
                </p>
              </div>

              {/* Invoice & Meeting Card */}
              <div className="bg-white border border-zinc-200/80 rounded-xl p-5 text-left space-y-4 shadow-xs">
                <h4 className="text-xs font-semibold capitalize  text-zinc-400 border-b border-zinc-100 pb-2">
                  {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation'}
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
                    <span className="text-zinc-400 block font-light">New Date & Time Slot</span>
                    <span className="font-bold text-zinc-800 block">
                      {formatDateString(selectedDate)}
                    </span>
                    <span className="text-xs text-zinc-500  block mt-0.5">
                      {selectedTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-light">Status</span>
                    <span className="font-semibold text-zinc-800 capitalize block text-brand-dark">
                      {rescheduleSession ? 'Pending Approval' : 'Confirmed & Paid'}
                    </span>
                  </div>
                </div>

                {/* Google Meet Link if Online */}
                {bookingMode === 'ONLINE' && !rescheduleSession && (
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

              {/* Back to Profile / Restart buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-semibold">
                {rescheduleSession ? (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/profile?tab=booked';
                    }}
                    className="px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold capitalize  rounded-lg transition cursor-pointer w-full sm:w-auto text-center border-none shadow-md"
                  >
                    Go to My Sessions
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={downloadingPdf}
                      onClick={() => {
                        const bookingId = Date.now();
                        const advisorName = selectedAdvisor?.name || 'Assigned Advisor';
                        const advisorRole = selectedAdvisor?.role || 'Consultant Psychologist';
                        const service = bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
                        const mode = bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';
                        const amount = netTotal;
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
                          meetLink,
                          baseFee: baseFee,
                          gstPercent: gstEnabled ? gstPercent : 0,
                          gstAmount: gstAmount,
                          appliedDiscount: appliedDiscount
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
                  </>
                )}
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

                    <div className="space-y-6">
                      {/* Service Type Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Select Service Type</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          {[
                            {
                              id: 'counselling',
                              num: '02',
                              tag: 'Psychological Counselling',
                              title: 'Emotional Wellbeing & Support',
                              subtitle: 'You Don’t Have to Face It Alone.',
                              desc: 'When stress, anxiety, self-doubt, or personal challenges begin to feel overwhelming, having the right support can make all the difference.'
                            },
                            {
                              id: 'career',
                              num: '01',
                              tag: 'Career Mentoring',
                              title: 'Career Clarity & Direction',
                              subtitle: 'Feeling Unsure About What’s Next?',
                              desc: 'Whether you’re choosing a stream, exploring career options, or planning your studies, we help you understand your strengths and opportunities.'
                            }
                          ].map((s) => {
                            const isSelected = bookingService === s.id;
                            return (
                              <button
                                type="button"
                                key={s.id}
                                disabled={rescheduleSession}
                                onClick={() => {
                                  if (rescheduleSession) return;
                                  setBookingService(s.id);
                                }}
                                className={`text-left p-4 rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3.5 border-2 ${
                                  isSelected
                                    ? 'bg-slate-50 border-[#0b1e36] ring-2 ring-[#0b1e36]/10 shadow-[0_10px_25px_rgba(11,30,54,0.14),0_2px_8px_rgba(14,165,233,0.12)] font-bold'
                                    : 'bg-white hover:bg-slate-50/50 border-[#0b1e36]/20 hover:border-[#0b1e36]/45 shadow-[0_8px_20px_rgba(11,30,54,0.06),0_4px_12px_rgba(14,165,233,0.06)]'
                                } ${rescheduleSession ? 'opacity-65 cursor-not-allowed' : ''}`}
                              >
                                <div className="space-y-2 w-full">
                                  <div className="flex justify-between items-start w-full">
                                    <span className={`inline-block text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-extrabold tracking-wide uppercase ${
                                      isSelected
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {s.tag}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-white">
                                      {s.num}
                                    </span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide mt-1">
                                    {s.title}
                                  </h4>
                                  <h5 className="text-[9px] sm:text-[10px] font-bold text-slate-400 italic">
                                    {s.subtitle}
                                  </h5>
                                  <p className="text-slate-600 text-[10px] sm:text-xs leading-relaxed font-light">
                                    {s.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mode of Session Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-550 capitalize tracking-wide block">Select Session Mode</label>
                        <div className="grid grid-cols-3 gap-2.5 w-full">
                          {[
                            { id: 'ONLINE', label: 'Online', desc: 'Video call' },
                            { id: 'DOOR_STEP', label: 'Doorstep', desc: 'Home visit' },
                            { id: 'OFFLINE', label: 'Offline', desc: 'At center' }
                          ].map((m) => (
                            <button
                              type="button"
                              key={m.id}
                              onClick={() => {
                                if (rescheduleSession) return;
                                setBookingMode(m.id);
                              }}
                              className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-xs capitalize font-semibold border rounded-xl transition cursor-pointer text-center min-h-[64px] leading-tight ${
                                bookingMode === m.id
                                  ? 'bg-brand/10 text-brand-dark border-brand/30 shadow-xs font-bold'
                                  : 'bg-white text-zinc-650 border-zinc-200 hover:border-brand/40 hover:text-brand-dark'
                              } ${rescheduleSession ? 'opacity-65 cursor-not-allowed' : ''}`}
                            >
                              <span className="flex flex-col items-center">
                                <span className="font-bold text-xs sm:text-sm text-zinc-900">{m.label}</span>
                                <span className="text-[10px] sm:text-xs font-normal normal-case text-zinc-400 mt-0.5">{m.desc}</span>
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
                          availableSlots={getAdvisorAllSlotsForDate(selectedAdvisor, selectedDate)}
                          bookedSlots={getAdvisorBookedSlotsForDate(selectedAdvisor, selectedDate)}
                          errors={errors}
                        />
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-4 border-t border-zinc-200">
                      {rescheduleSession ? (
                        <button
                          type="button"
                          disabled={!selectedDate || !selectedTime || isSubmitting}
                          onClick={handleRescheduleConfirm}
                          className="px-6 py-3 min-h-[48px] bg-zinc-900 text-white font-bold capitalize text-xs rounded-lg transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-xs w-full sm:w-auto"
                        >
                          {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!selectedDate || !selectedTime || !selectedAdvisor}
                          onClick={() => handleStepChange('payment')}
                          className="px-6 py-3 min-h-[48px] bg-zinc-900 text-white font-bold capitalize  text-xs rounded-lg transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-xs w-full sm:w-auto"
                        >
                          Account & Payment
                        </button>
                      )}
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
                      
                       
                      {/* Simplified Payment Section */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                          <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                            <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-zinc-800">Secure Payment Gateway</h5>
                            <p className="text-xs text-zinc-500 mt-1">
                              You will be securely redirected to Razorpay to choose your preferred payment method (UPI, Cards, Netbanking, etc.).
                            </p>
                          </div>
                        </div>
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
                          {formatDateString(selectedDate)}
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

                  {/* Coupon Promo code input box */}
                  <div className="pt-3 border-t border-zinc-200 space-y-2 text-left">
                    <span className="text-[9.5px] text-zinc-400 capitalize tracking-wide block font-semibold">Have a Promo Code?</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. BEHOLD100"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={appliedDiscount > 0}
                        className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-semibold uppercase outline-none focus:border-brand transition"
                      />
                      {appliedDiscount > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedDiscount(0);
                            setCouponInput('');
                            setCouponMsg({ text: '', type: '' });
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const code = couponInput.toUpperCase().trim();
                            const foundPromo = sitePromoCodes.find(p => p.code.toUpperCase() === code && p.isActive !== false);
                            if (foundPromo) {
                               let discount = 0;
                               if (foundPromo.type === 'PERCENTAGE') {
                                   discount = Math.round((baseFee + gstAmount) * (foundPromo.value / 100));
                                   setCouponMsg({ text: `${foundPromo.value}% discount applied!`, type: 'success' });
                               } else {
                                   discount = foundPromo.value;
                                   setCouponMsg({ text: `₹${foundPromo.value} discount applied!`, type: 'success' });
                               }
                               setAppliedDiscount(discount);
                            } else {
                              setCouponMsg({ text: 'Invalid promo code', type: 'error' });
                            }
                          }}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition cursor-pointer border-none"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                    {couponMsg.text && (
                      <p className={`text-[10px] font-bold ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {couponMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Invoice ledger calculation breakdown */}
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
