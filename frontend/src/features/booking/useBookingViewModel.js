import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useCustomDialog } from '../../shared/context/CustomDialogContext';
import toast from 'react-hot-toast';
import ApiService from '../../shared/services/api';
import { jsPDF } from 'jspdf';
import { formatDateString, calculateNextAvailable } from '../../shared/utils/dateFormatter';
import { sendLocalNotification } from '../../shared/services/notificationHelper';

export const BOOKING_DRAFT_KEY = 'behold_booking_draft';

export const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

export function useBookingViewModel({ preselectedAdvisorId, clearPreselectedAdvisor }) {
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
  
  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [bookingService, setBookingService] = useState(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.bookingService) return draft.bookingService;
      }
      const queryParams = new URLSearchParams(window.location.search);
      const urlService = queryParams.get('service') || queryParams.get('type');
      if (urlService === 'career' || urlService === 'counselling') {
        return urlService;
      }
    } catch (e) {}
    return 'counselling';
  }); // counselling, career
  const [bookingMode, setBookingMode] = useState(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.bookingMode) return draft.bookingMode;
      }
    } catch (e) {}
    return 'ONLINE';
  }); // ONLINE, DOOR_STEP, OFFLINE
  const [bookingForm, setBookingForm] = useState(() => {
    const defaultForm = {
      name: '',
      phone: '',
      email: '',
      groupCode: '',
      clientLocationName: '',
      clientLatitude: '',
      clientLongitude: ''
    };
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.bookingForm) return { ...defaultForm, ...draft.bookingForm };
      }
    } catch (e) {}
    return defaultForm;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.selectedDate) return draft.selectedDate;
      }
    } catch (e) {}
    return '';
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.selectedTime) return draft.selectedTime;
      }
    } catch (e) {}
    return '';
  });

  // Auto-fallback booking mode if selected mode is disabled
  useEffect(() => {
    let settings = {};
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) settings = JSON.parse(stored);
    } catch (e) {}

    const isOnlineEnabled = settings.enableOnline !== false;
    const isOfflineEnabled = settings.enableOffline !== false;
    const isDoorstepEnabled = settings.enableDoorstep !== false;

    const timer = setTimeout(() => {
      if (bookingMode === 'ONLINE' && !isOnlineEnabled) {
        if (isOfflineEnabled) setBookingMode('OFFLINE');
        else if (isDoorstepEnabled) setBookingMode('DOOR_STEP');
      } else if (bookingMode === 'OFFLINE' && !isOfflineEnabled) {
        if (isOnlineEnabled) setBookingMode('ONLINE');
        else if (isDoorstepEnabled) setBookingMode('DOOR_STEP');
      } else if (bookingMode === 'DOOR_STEP' && !isDoorstepEnabled) {
        if (isOnlineEnabled) setBookingMode('ONLINE');
        else if (isOfflineEnabled) setBookingMode('OFFLINE');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [bookingMode]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [advisorConfirmed, setAdvisorConfirmed] = useState(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (typeof draft.advisorConfirmed === 'boolean') return draft.advisorConfirmed;
      }
    } catch (e) {}
    return false;
  });
  const [advisors, setAdvisors] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNoCounsellorsModal, setShowNoCounsellorsModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState(null);

  const [existingAppointments, setExistingAppointments] = useState([]);

  useEffect(() => {
    const initBookingData = async () => {
      try {
        let resolved = [];
        const res = await ApiService.getCounsellors();
        if (res.success && res.data) {
          resolved = res.data.map(c => {
            return {
              id: c.id || c._id,
              name: c.name,
              role: c.title || 'Consultant Psychologist',
              availability: calculateNextAvailable(c.availability, c.bookedSlots || []),
              type: c.type || (c.title?.toLowerCase().includes('career') || c.title?.toLowerCase().includes('mentor') ? 'career' : 'counselling'),
              defaultMeetLink: c.defaultMeetLink || '',
              price: Number(c.price) || 1200,
              modes: (Array.isArray(c.modes) ? c.modes : ['ONLINE', 'OFFLINE', 'DOOR_STEP']).filter(m => {
                const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
                if (m === 'ONLINE') return settings.enableOnline !== false;
                if (m === 'OFFLINE') return settings.enableOffline !== false;
                if (m === 'DOOR_STEP') return settings.enableDoorstep !== false;
                return true;
              }),
              availabilitySlots: c.availability || {},
              bookedSlots: c.bookedSlots || [],
              locationName: c.locationName || '',
              latitude: Number(c.latitude) || 0,
              longitude: Number(c.longitude) || 0,
              profilePic: c.profilePic || c.image || '',
              image: c.image || c.profilePic || '',
              specialties: c.specialties || [],
              bio: c.bio || '',
              hours: c.hours || 0,
              lang: c.lang || ''
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
                  availabilitySlots: {},
                  bookedSlots: []
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

  const [copiedMeet, setCopiedMeet] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Read GST & Promo settings from site settings
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
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 to 6

      // If a specific advisor is selected, prioritize their schedule
      if (selectedAdvisor) {
        const parsed = selectedAdvisor.availabilitySlots;
        if (parsed) {
          try {
            const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
            if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
              const bookings = selectedAdvisor.bookedSlots || [];
              const list = parsed.availableSlots.filter(slot => {
                if (dateStr === todayStr && isSlotInPast(slot)) {
                  return false;
                }
                return !bookings.some(b => 
                  b.date === dateStr && 
                  b.time === slot
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
              const bookings = advisor.bookedSlots || [];
              parsed.availableSlots.forEach(slot => {
                if (dateStr === todayStr && isSlotInPast(slot)) {
                  return;
                }
                const isBooked = bookings.some(b => 
                  b.date === dateStr && 
                  b.time === slot
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
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const parsed = advisor.availabilitySlots;
    if (!parsed) return [];
    try {
      const dayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
      if (dayActive && parsed.availableSlots && parsed.availableSlots.length > 0) {
        const bookings = advisor.bookedSlots || [];
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
            b.date === dateStr && 
            b.time === slot
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
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
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
    const bookings = advisor.bookedSlots || [];
    return bookings
      .filter(b => b.date === dateStr)
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
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    const advisor = advisors.find(a => a.id === advisorId);
    if (!advisor || !advisor.availabilitySlots) {
      return 'Unavailable';
    }

    try {
      const parsed = advisor.availabilitySlots;
      const isDayActive = parsed.activeDays && parsed.activeDays[dayOfWeek];
      const isSlotActive = parsed.availableSlots && parsed.availableSlots.includes(timeStr);
      if (isDayActive && isSlotActive) {
        const bookings = advisor.bookedSlots || [];
        const isAlreadyBooked = bookings.some(b => 
          b.date === dateStr && 
          b.time === timeStr
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
      setTimeout(() => {
        setBookingForm(prev => {
          const merged = {
            name: prev.name && prev.name.trim().length > 0 ? prev.name : user.name,
            email: user.email,
            phone: prev.phone || '',
            groupCode: prev.groupCode || '',
            clientLocationName: prev.clientLocationName || user.locationName || '',
            clientLatitude: prev.clientLatitude || user.latitude || '',
            clientLongitude: prev.clientLongitude || user.longitude || ''
          };
          return merged;
        });
        setIsAutofilled(true);
      }, 0);
    }
  }, [user]);

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
      if (preselectedAdvisorId === 'career_1' || preselectedAdvisorId === 'career') {
        setTimeout(() => {
          setBookingService('career');
          setSelectedAdvisor(null);
          setAdvisorConfirmed(false);
        }, 0);
        if (clearPreselectedAdvisor) {
          clearPreselectedAdvisor();
        }
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
        setTimeout(() => {
          setBookingService('counselling');
          setSelectedAdvisor(null);
          setAdvisorConfirmed(false);
        }, 0);
        if (clearPreselectedAdvisor) {
          clearPreselectedAdvisor();
        }
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

      if (advisors.length > 0) {
        const found = advisors.find(a => a.id === preselectedAdvisorId);
        if (found) {
          setTimeout(() => {
            setBookingService(found.type);
            setSelectedAdvisor(found);
            setAdvisorConfirmed(true);
            if (found.modes && found.modes.length > 0 && !found.modes.includes(bookingMode)) {
              setBookingMode(found.modes[0]);
            }
          }, 0);
          
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
  }, [preselectedAdvisorId, clearPreselectedAdvisor, advisors, bookingMode]);

  // Reset advisor if service type, mode, or location changes to avoid invalid combinations
  useEffect(() => {
    if (selectedAdvisor) {
      const isServiceMatch = selectedAdvisor.type === bookingService;
      const isModeMatch = !selectedAdvisor.modes || selectedAdvisor.modes.includes(bookingMode);
      
      let isDistanceMatch = true;
      if (bookingMode === 'DOOR_STEP') {
        const clientLat = parseFloat(bookingForm.clientLatitude);
        const clientLng = parseFloat(bookingForm.clientLongitude);
        const advLat = Number(selectedAdvisor.latitude);
        const advLng = Number(selectedAdvisor.longitude);
        if (isNaN(clientLat) || isNaN(clientLng) || !advLat || !advLng) {
          isDistanceMatch = false;
        } else {
          const distance = getHaversineDistance(clientLat, clientLng, advLat, advLng);
          if (distance > 10) {
            isDistanceMatch = false;
          }
        }
      }

      if (!isServiceMatch || !isModeMatch || !isDistanceMatch) {
        setTimeout(() => {
          setSelectedAdvisor(null);
          setAdvisorConfirmed(false);
          setSelectedDate('');
          setSelectedTime('');
        }, 0);
      }
    }
  }, [bookingService, bookingMode, selectedAdvisor, bookingForm.clientLatitude, bookingForm.clientLongitude]);

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
        couponCode: couponInput,
        clientLocationName: bookingForm.clientLocationName || '',
        clientLatitude: Number(bookingForm.clientLatitude) || 0,
        clientLongitude: Number(bookingForm.clientLongitude) || 0
      };

      const orderRes = await ApiService.createPaymentOrder(selectedAdvisor ? selectedAdvisor.id : '', bookingDetails);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const { keyId, orderId, amount, currency } = orderRes.data;

      setPaymentStepText("Awaiting payment...");

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
              couponCode: couponInput,
              clientLocationName: bookingForm.clientLocationName || '',
              clientLatitude: Number(bookingForm.clientLatitude) || 0,
              clientLongitude: Number(bookingForm.clientLongitude) || 0
            };

            const verifyRes = await ApiService.verifyPaymentAndBook(response, bookingDetails);
            if (verifyRes.success) {
              toast.success("Payment verified! Booking confirmed.");
              sendLocalNotification(
                "Booking Confirmed!",
                `Your session with ${selectedAdvisor?.name || 'Assigned Advisor'} on ${selectedDate} at ${selectedTime} is confirmed.`
              );
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
          color: "#06b6d4"
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
        sendLocalNotification(
          "Reschedule Requested",
          `Your reschedule request for ${selectedDate} at ${selectedTime} has been submitted.`
        );
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

  // getHaversineDistance moved to top of file

  const getCalculatedDistance = () => {
    if (bookingMode !== 'DOOR_STEP' || !selectedAdvisor) return null;
    const clientLat = parseFloat(bookingForm.clientLatitude);
    const clientLng = parseFloat(bookingForm.clientLongitude);
    const advLat = Number(selectedAdvisor.latitude);
    const advLng = Number(selectedAdvisor.longitude);
    if (isNaN(clientLat) || isNaN(clientLng) || !advLat || !advLng) return null;
    return getHaversineDistance(clientLat, clientLng, advLat, advLng);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const baseErrors = {};

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

    if (bookingMode === 'DOOR_STEP') {
      const clientLat = parseFloat(bookingForm.clientLatitude);
      const clientLng = parseFloat(bookingForm.clientLongitude);
      
      if (!bookingForm.clientLocationName?.trim()) {
        baseErrors.clientLocationName = 'Location Address is required for Doorstep sessions';
      }
      
      if (isNaN(clientLat) || clientLat < -90 || clientLat > 90) {
        baseErrors.clientLatitude = 'Please enter a valid Latitude (-90 to 90)';
      }
      if (isNaN(clientLng) || clientLng < -180 || clientLng > 180) {
        baseErrors.clientLongitude = 'Please enter a valid Longitude (-180 to 180)';
      }
      
      if (Object.keys(baseErrors).length === 0) {
        if (selectedAdvisor) {
          const advLat = Number(selectedAdvisor.latitude);
          const advLng = Number(selectedAdvisor.longitude);
          
          if (!advLat && !advLng) {
            baseErrors.clientLocationName = 'Doorstep booking is temporarily unavailable for this psychologist (missing coordinates)';
          } else {
            const distance = getHaversineDistance(clientLat, clientLng, advLat, advLng);
            if (distance > 10) {
              baseErrors.clientLocationName = `Your location is ${distance.toFixed(2)} km away. Doorstep service is only available within 10 km of the psychologist's location (${selectedAdvisor.locationName || 'their center'}).`;
            }
          }
        }
      }
    }

    if (Object.keys(baseErrors).length > 0) {
      setErrors(baseErrors);
      const firstErrorField = ['name', 'phone', 'email', 'clientLocationName', 'clientLatitude', 'clientLongitude'].find(
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

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    processPayment();
  };

  const resetBookingState = () => {
    setIsSuccess(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedAdvisor(null);
    setAdvisorConfirmed(false);
    setAppliedDiscount(0);
    setCouponInput('');
    setBookingStep('config');
    try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch (e) { /* ignore */ }
  };

  const handleApplyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    const foundPromo = sitePromoCodes.find(p => p.code.toUpperCase() === code && p.isActive !== false);
    if (foundPromo) {
       const discount = foundPromo.type === 'PERCENTAGE'
         ? Math.round((baseFee + gstAmount) * (foundPromo.value / 100))
         : foundPromo.value;
       if (foundPromo.type === 'PERCENTAGE') {
           setCouponMsg({ text: `${foundPromo.value}% discount applied!`, type: 'success' });
       } else {
           setCouponMsg({ text: `₹${foundPromo.value} discount applied!`, type: 'success' });
       }
       setAppliedDiscount(discount);
    } else {
      setCouponMsg({ text: 'Invalid promo code', type: 'error' });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(0);
    setCouponInput('');
    setCouponMsg({ text: '', type: '' });
  };

  return {
    user,
    bookingService,
    setBookingService,
    bookingMode,
    setBookingMode,
    bookingForm,
    setBookingForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedAdvisor,
    setSelectedAdvisor,
    advisorConfirmed,
    setAdvisorConfirmed,
    advisors,
    showAuthModal,
    setShowAuthModal,
    showNoCounsellorsModal,
    setShowNoCounsellorsModal,
    rescheduleSession,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    isSuccess,
    isAutofilled,
    bookingStep,
    setBookingStep,
    couponInput,
    setCouponInput,
    appliedDiscount,
    setAppliedDiscount,
    couponMsg,
    setCouponMsg,
    isProcessingPayment,
    paymentStepText,
    copiedMeet,
    setCopiedMeet,
    copiedReceipt,
    setCopiedReceipt,
    showSummary,
    setShowSummary,
    downloadingPdf,
    enablePsychology,
    isRescheduleParam,
    baseFee,
    gstEnabled,
    gstPercent,
    gstAmount,
    netTotal,
    sitePromoCodes,
    downloadPDFReceipt,
    getAvailableSlotsForDate,
    getAdvisorSlotsForDate,
    getAdvisorAllSlotsForDate,
    getAdvisorBookedSlotsForDate,
    handleDateChange,
    getAdvisorAvailabilityStatus,
    handleStepChange,
    handleInputChange,
    processPayment,
    handleRescheduleConfirm,
    handleAuthSuccess,
    handlePaymentSubmit,
    resetBookingState,
    handleApplyCoupon,
    handleRemoveCoupon,
    getCalculatedDistance,
    getHaversineDistance
  };
}
