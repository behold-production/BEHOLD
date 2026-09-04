import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomDialog } from '../../context/CustomDialogContext';
import toast from 'react-hot-toast';
import ApiService from '../../services/api';
import { jsPDF } from 'jspdf';
import { formatDateString, calculateNextAvailable, getScheduleForDay } from '../../utils/dateFormatter';
import { sendLocalNotification } from '../../services/notificationHelper';
import { validateEmail, validateIndianPhone, parseIndianPhone } from '../../utils/validation';
import { trackInitiateCheckout, trackPurchase, trackSchedule, getStoredCampaignData } from '../../utils/metaPixel';

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
  const { user, updateUser } = useAuth();
  const { showAlert } = useCustomDialog();

  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('behold_site_settings') : null;
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    ApiService.getSettings().then(res => {
      if (res && res.success && res.data) {
        setSiteSettings(res.data);
        try { localStorage.setItem('behold_site_settings', JSON.stringify(res.data)); } catch {}
      }
    }).catch(() => {});
  }, []);

  const enablePsychology = siteSettings.enablePsychology !== false;
  const enableCareerMentoring = siteSettings.enableCareerMentoring !== false;
  const isRescheduleParam = typeof window !== 'undefined' ? !!(new URLSearchParams(window.location.search).get('reschedule')) : false;

  const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [bookingService, setBookingService] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.bookingService) return draft.bookingService;
        }
        const queryParams = new URLSearchParams(window.location.search);
        const urlService = queryParams.get('service') || queryParams.get('type');
        if (urlService === 'career' || urlService === 'counselling' || urlService === 'counseling') {
          return urlService === 'counseling' ? 'counselling' : urlService;
        }
      } catch { }
    }
    return 'counselling';
  }); // counselling, career
  const [bookingMode, setBookingMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.bookingMode) return draft.bookingMode;
        }
      } catch { }
    }
    return 'ONLINE';
  }); // ONLINE, DOOR_STEP, OFFLINE
  const [bookingDuration, setBookingDuration] = useState(() => {
    if (user && user.hasUsedIntroductory) return 60;
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.bookingDuration) {
            if (draft.bookingDuration === 30 && user?.hasUsedIntroductory) return 60;
            return draft.bookingDuration;
          }
        }
      } catch { }
    }
    return 60; // 30 mins (Introductory) or 60 mins (Standard)
  });
  const [isIntroductoryEligible, setIsIntroductoryEligible] = useState(() => {
    if (user && user.hasUsedIntroductory) return false;
    return true;
  });
  const [bookingForm, setBookingForm] = useState(() => {
    const defaultForm = {
      name: '',
      phone: '',
      email: '',
      age: '',
      feelingLately: '',
      hadPriorTherapy: '',
      priorTherapyDetails: '',
      groupCode: '',
      clientLocationName: '',
      clientLatitude: '',
      clientLongitude: ''
    };
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.bookingForm) return { ...defaultForm, ...draft.bookingForm };
        }
      } catch { }
    }
    return defaultForm;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.selectedDate) return draft.selectedDate;
        }
      } catch { }
    }
    return '';
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft.selectedTime) return draft.selectedTime;
        }
      } catch { }
    }
    return '';
  });

  // Auto-fallback booking mode if selected mode is disabled
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let settings = {};
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) settings = JSON.parse(stored);
    } catch { }

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
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (typeof draft.advisorConfirmed === 'boolean') return draft.advisorConfirmed;
        }
      } catch { }
    }
    return false;
  });
  const [advisors, setAdvisors] = useState(() => {
    try {
      const cached = localStorage.getItem('behold_counsellors_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            id: c.id || c._id,
            name: c.name,
            role: c.title || c.role || 'Consultant Psychologist',
            availability: calculateNextAvailable(c.availability, c.bookedSlots || []),
            type: c.type || (c.title?.toLowerCase().includes('career') || c.title?.toLowerCase().includes('mentor') ? 'career' : 'counselling'),
            defaultMeetLink: c.defaultMeetLink || '',
            price: Number(c.price) || 899,
            halfSessionPrice: Number(c.halfSessionPrice) || 499,
            modes: Array.isArray(c.modes) ? c.modes : ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
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
            lang: c.lang || '',
            rating: Number(c.rating) || 5.0,
            reviewCount: Number(c.reviewCount) || 0
          }));
        }
      }
    } catch { }
    return [];
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNoCounsellorsModal, setShowNoCounsellorsModal] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState(null);

  useEffect(() => {
    const initBookingData = async () => {
      try {
        let resolved = [];
        const res = await ApiService.getCounsellors({}, true);
        if (res && res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
          resolved = res.data.map(c => {
            return {
              id: c.id || c._id,
              name: c.name,
              role: c.title || c.role || 'Consultant Psychologist',
              availability: calculateNextAvailable(c.availability, c.bookedSlots || []),
              type: c.type || (c.title?.toLowerCase().includes('career') || c.title?.toLowerCase().includes('mentor') ? 'career' : 'counselling'),
              defaultMeetLink: c.defaultMeetLink || '',
              price: Number(c.price) || 899,
              halfSessionPrice: c.halfSessionPrice !== undefined && Number(c.halfSessionPrice) > 0
                ? Number(c.halfSessionPrice)
                : (Number(c.price) <= 899 ? 499 : Number(c.price) >= 1200 ? 699 : Math.round((Number(c.price) || 899) * 0.5)),
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
              hours: c.hours || c.completedHours || 0,
              lang: c.lang || '',
              rating: Number(c.rating) || 5.0,
              reviewCount: Number(c.reviewCount) || 0
            };
          });
          setAdvisors(resolved);

          // Update cache with real database records
          try {
            localStorage.setItem('behold_counsellors_cache', JSON.stringify(res.data));
          } catch { }
        }

        if (user) {
          await ApiService.getAppointments();
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

  // Monitor introductory session eligibility for user or entered email/phone
  useEffect(() => {
    let isMounted = true;
    if (user && user.hasUsedIntroductory) {
      setIsIntroductoryEligible(false);
      if (bookingDuration === 30) {
        setBookingDuration(60);
      }
      return;
    }

    const checkPhone = bookingForm.phone || user?.phone;
    const checkEmail = bookingForm.email || user?.email;
    if (checkPhone || checkEmail || user) {
      const timer = setTimeout(async () => {
        try {
          const res = await ApiService.checkIntroductoryEligibility({
            phone: checkPhone,
            email: checkEmail
          });
          if (isMounted && res && res.success) {
            if (res.eligible === false || res.hasUsedIntroductory === true) {
              setIsIntroductoryEligible(false);
              if (bookingDuration === 30) {
                setBookingDuration(60);
                toast.info('You have already taken your one-time Introductory Session. Switched to Standard Session (1 Hour).');
              }
            } else {
              setIsIntroductoryEligible(true);
            }
          }
        } catch {
          // Keep current eligibility on network fail
        }
      }, 400);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [user, bookingForm.phone, bookingForm.email, bookingDuration]);

  // Auto-preselect advisor when preselectedAdvisorId prop or URL param ?advisor= / ?counsellor= is present
  useEffect(() => {
    if (!advisors || advisors.length === 0) return;

    const queryParams = new URLSearchParams(window.location.search);
    const targetAdvisorId = preselectedAdvisorId || queryParams.get('advisor') || queryParams.get('counsellor') || queryParams.get('psychologist');

    if (targetAdvisorId) {
      const match = advisors.find(a => String(a.id) === String(targetAdvisorId) || String(a._id) === String(targetAdvisorId));
      if (match) {
        setTimeout(() => {
          setSelectedAdvisor(match);
          setAdvisorConfirmed(true);
          if (match.modes && match.modes.length > 0 && !match.modes.includes(bookingMode)) {
            setBookingMode(match.modes[0]);
          }
          setSelectedDate(prevDate => {
            if (prevDate && getAdvisorSlotsForDate(match, prevDate).length > 0) {
              return prevDate;
            }
            return getAdvisorEarliestAvailableDate(match) || prevDate || '';
          });
        }, 0);
      }
    }
  }, [preselectedAdvisorId, advisors, bookingMode]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);

  const isAdvisorLocked = !!preselectedAdvisorId;
  const [bookingStep, setBookingStep] = useState('config'); // 'config' | 'payment' | 'success'
  const [confirmedMeetLink, setConfirmedMeetLink] = useState(''); // meet link from server after payment
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStepText, setPaymentStepText] = useState('');

  const [copiedMeet, setCopiedMeet] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Read GST & Promo settings from reactive site settings
  const gstEnabled = siteSettings.gstEnabled === true;
  const gstPercent = typeof siteSettings.gstPercent === 'number' ? siteSettings.gstPercent : 0;
  const sitePromoCodes = Array.isArray(siteSettings.promoCodes) ? siteSettings.promoCodes : [];

  const getDurationPrice = (advisor, duration) => {
    const fullPrice = advisor ? (Number(advisor.price) || 899) : 899;
    if (duration === 60) return fullPrice;
    if (advisor && advisor.halfSessionPrice && Number(advisor.halfSessionPrice) > 0) {
      return Number(advisor.halfSessionPrice);
    }
    if (fullPrice <= 899) return 499;
    if (fullPrice >= 1200) return 699;
    return Math.round(fullPrice * 0.5);
  };

  const rawPrice = selectedAdvisor ? (selectedAdvisor.price || 899) : 899;
  const baseFee = getDurationPrice(selectedAdvisor, bookingDuration);
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
      if (bookingDetails.duration) {
        doc.text(`Duration: ${bookingDetails.duration}`, 120, 104);
      }

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
      const feeDesc = bookingDetails.duration ? `${bookingDetails.service} Session Fee (${bookingDetails.duration})` : `${bookingDetails.service} Session Booking Fee`;
      doc.text(feeDesc, 24, tableY);
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
        doc.setTextColor(0, 229, 255); // neon blue
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
      const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (_isIOS) {
        window.open(doc.output('bloburl'), '_blank');
      } else {
        doc.save(`Behold_Session_Receipt_${bookingDetails.id}.pdf`);
      }
    } catch (e) {
      console.error(e);
      await showAlert("Failed to generate PDF receipt. Please contact platform support.", "Export Error");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getAdvisorSlotsForDate = (advisor, dateStr) => {
    if (!dateStr || !advisor) return [];
    if (advisor.modes && Array.isArray(advisor.modes) && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
      return [];
    }

    const DEFAULT_SLOTS = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
      '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const rawAvailability = advisor.availabilitySlots || advisor.availability || {};
      
      const { isDayActive, slots, hasConfig } = getScheduleForDay(rawAvailability, dayOfWeek);
      if (!isDayActive) return [];

      const activeSlots = slots.length > 0 ? slots : (!hasConfig ? DEFAULT_SLOTS : []);

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
        } catch { return false; }
      };

      const parseTimeToMinutes = (timeStr) => {
        const [time, meridiem] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      return activeSlots
        .filter(slot => {
          if (dateStr === todayStr && isSlotInPast(slot)) {
            return false;
          }
          return !bookings.some(b => b.date === dateStr && b.time === slot);
        })
        .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    } catch (e) {
      console.error("Error checking slots for advisor:", e);
      return [];
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
      } catch {
        return false;
      }
    };

    const DEFAULT_SLOTS = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
      '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    const parseTimeToMinutes = (timeStr) => {
      const [time, meridiem] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    try {
      // If a specific advisor is selected, prioritize their schedule
      if (selectedAdvisor) {
        return getAdvisorSlotsForDate(selectedAdvisor, dateStr);
      }

      // Collect union of available slots across matching advisors or defaults
      const activeSlotsSet = new Set();
      const currentService = serviceType || bookingService;
      const matchingAdvisors = advisors.filter(a => {
        const isServiceMatch = !currentService || a.type === currentService || (currentService === 'counselling' && a.type !== 'career');
        const isModeMatch = !a.modes || a.modes.length === 0 || a.modes.includes(bookingMode);
        return isServiceMatch && isModeMatch;
      });

      if (matchingAdvisors.length > 0) {
        matchingAdvisors.forEach(advisor => {
          const slots = getAdvisorSlotsForDate(advisor, dateStr);
          slots.forEach(slot => activeSlotsSet.add(slot));
        });
      } else {
        DEFAULT_SLOTS.forEach(slot => {
          if (dateStr === todayStr && isSlotInPast(slot)) return;
          activeSlotsSet.add(slot);
        });
      }

      const list = Array.from(activeSlotsSet);
      return list.sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    } catch (err) {
      console.error("Error generating dynamic slots", err);
      return [];
    }
  };

  const getAdvisorAllSlotsForDate = (advisor, dateStr) => {
    if (!dateStr || !advisor) return [];
    if (advisor.modes && Array.isArray(advisor.modes) && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
      return [];
    }

    const DEFAULT_SLOTS = [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
      '06:00 PM', '07:00 PM', '08:00 PM'
    ];

    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const rawAvailability = advisor.availabilitySlots || advisor.availability || {};
      
      const { isDayActive, slots, hasConfig } = getScheduleForDay(rawAvailability, dayOfWeek);
      if (!isDayActive) return [];

      const activeSlots = slots.length > 0 ? slots : (!hasConfig ? DEFAULT_SLOTS : []);

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
        } catch { return false; }
      };

      const parseTimeToMinutes = (timeStr) => {
        const [time, meridiem] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      return activeSlots
        .filter(slot => !(dateStr === todayStr && isSlotInPast(slot)))
        .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));
    } catch (e) {
      console.error("Error checking all slots for advisor:", e);
      return [];
    }
  };

  const getAdvisorBookedSlotsForDate = (advisor, dateStr) => {
    if (!dateStr || !advisor) return [];
    const bookings = advisor.bookedSlots || [];
    return bookings
      .filter(b => b.date === dateStr)
      .map(b => b.time);
  };

  const getAdvisorEarliestAvailableDate = (advisor, preferredDate = null) => {
    if (!advisor) return null;
    if (preferredDate && getAdvisorSlotsForDate(advisor, preferredDate).length > 0) {
      return preferredDate;
    }
    const today = new Date();
    for (let i = 0; i <= 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const slots = getAdvisorSlotsForDate(advisor, dateStr);
      if (slots.length > 0) {
        return dateStr;
      }
    }
    return null;
  };

  const getAdvisorEarliestAvailableInfo = (advisor) => {
    if (!advisor) return { available: false, dateStr: null, slotCount: 0, label: 'Unavailable' };
    const todayStr = getLocalTodayString();
    const todaySlots = getAdvisorSlotsForDate(advisor, todayStr);
    if (todaySlots.length > 0) {
      return {
        available: true,
        dateStr: todayStr,
        slotCount: todaySlots.length,
        label: `Available Today (${todaySlots.length} ${todaySlots.length === 1 ? 'slot' : 'slots'})`
      };
    }

    const today = new Date();
    for (let i = 1; i <= 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const slots = getAdvisorSlotsForDate(advisor, dateStr);
      if (slots.length > 0) {
        const isTomorrow = i === 1;
        const formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          available: true,
          dateStr,
          slotCount: slots.length,
          label: isTomorrow
            ? `Available Tomorrow (${slots.length} ${slots.length === 1 ? 'slot' : 'slots'})`
            : `Available ${formattedDate} (${slots.length} ${slots.length === 1 ? 'slot' : 'slots'})`
        };
      }
    }
    return { available: false, dateStr: null, slotCount: 0, label: 'No upcoming slots' };
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime('');
    if (errors.date) setErrors(prev => ({ ...prev, date: null }));
  };

  const getAdvisorAvailabilityStatus = (advisorId, dateStr, timeStr) => {
    if (!dateStr || !timeStr) return 'Available';
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();

    const advisor = advisors.find(a => a.id === advisorId);
    if (!advisor) {
      return 'Available';
    }

    try {
      const rawAvailability = advisor.availabilitySlots || advisor.availability || {};
      const { isDayActive, slots, hasConfig } = getScheduleForDay(rawAvailability, dayOfWeek);
      
      const slotsForDay = slots.length > 0 ? slots : (!hasConfig ? [timeStr] : []);
      const isSlotActive = slotsForDay.includes(timeStr);
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
    } catch { }

    return 'Unavailable';
  };

  // History tracking popstate listener
  // IMPORTANT: We use a ref to track bookingStep so the popstate handler always
  // has the latest value without causing re-renders, and we NEVER override 'success'.
  const bookingStepRef = React.useRef(bookingStep);
  useEffect(() => {
    bookingStepRef.current = bookingStep;
  }, [bookingStep]);

  useEffect(() => {
    window.history.replaceState({ component: 'booking', step: 'config' }, '');

    const handlePopState = (e) => {
      // Never allow popstate to override a confirmed success state
      // Razorpay manipulates browser history when its overlay closes,
      // which would otherwise reset the step back to 'payment' or 'config'.
      if (bookingStepRef.current === 'success') return;
      if (e.state && e.state.component === 'booking' && e.state.step && e.state.step !== 'success') {
        setBookingStep(e.state.step);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStepChange = (newStep) => {
    if (newStep === 'payment') {
      if (!selectedAdvisor || !selectedDate || !selectedTime) {
        toast.error("Please select a date, time slot, and psychologist to proceed.");
        return;
      }
      const status = getAdvisorAvailabilityStatus(selectedAdvisor.id, selectedDate, selectedTime);
      if (status === 'Booked' || status === 'Unavailable') {
        toast.error("This slot is already booked for this counsellor. Please select another slot.");
        return;
      }

      // If user is not authenticated, prompt WhatsApp OTP sign in first
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // Track InitiateCheckout on entering checkout / payment step
      trackInitiateCheckout({
        service: bookingService,
        mode: bookingMode,
        duration: bookingDuration,
        value: netTotal,
        currency: 'INR'
      });
    }

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
          const validUserName = user.name && user.name !== 'New User' && !user.name.includes('Behold User') ? user.name : '';
          const validUserEmail = user.email && !user.email.includes('@temp.behold') ? user.email : '';
          const merged = {
            name: prev.name && prev.name.trim().length > 0 ? prev.name : validUserName,
            email: prev.email && prev.email.trim().length > 0 ? prev.email : validUserEmail,
            phone: prev.phone && prev.phone.trim().length > 0 ? prev.phone : (user.phone || ''),
            groupCode: prev.groupCode || user.groupCode || '',
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
        bookingDuration,
        selectedDate,
        selectedTime,
        selectedAdvisorId: selectedAdvisor ? selectedAdvisor.id : null,
        advisorConfirmed,
        bookingForm
      };
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    } catch { /* ignore */ }
  }, [bookingService, bookingMode, bookingDuration, selectedDate, selectedTime, selectedAdvisor, advisorConfirmed, bookingForm]);

  useEffect(() => {
    if (preselectedAdvisorId) {
      try {
        const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
        const draft = raw ? JSON.parse(raw) : {};
        draft.selectedAdvisorId = preselectedAdvisorId;
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
      } catch { /* ignore */ }
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
      if (preselectedAdvisorId === 'c3' || preselectedAdvisorId === 'counselling' || preselectedAdvisorId === 'counseling' || preselectedAdvisorId === 'psychology_1') {
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
            setSelectedDate(prevDate => {
              if (prevDate && getAdvisorSlotsForDate(found, prevDate).length > 0) {
                return prevDate;
              }
              return getAdvisorEarliestAvailableDate(found) || prevDate || '';
            });
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

  // Ensure service and mode compatibility when advisor or mode changes
  useEffect(() => {
    if (selectedAdvisor) {
      const isServiceMatch = !selectedAdvisor.type || selectedAdvisor.type === bookingService || bookingService === 'counselling' || selectedAdvisor.type === 'counselling';
      const isModeMatch = !selectedAdvisor.modes || selectedAdvisor.modes.length === 0 || selectedAdvisor.modes.includes(bookingMode);

      if (selectedAdvisor.modes && Array.isArray(selectedAdvisor.modes) && selectedAdvisor.modes.length > 0 && !selectedAdvisor.modes.includes(bookingMode)) {
        setBookingMode(selectedAdvisor.modes[0]);
        return;
      }

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

      if (!isServiceMatch || (!isModeMatch && (!selectedAdvisor.modes || selectedAdvisor.modes.length === 0)) || !isDistanceMatch) {
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
    setBookingStep('payment');
    window.history.pushState({ component: 'booking', step: 'payment' }, '');
    setIsProcessingPayment(true);
    setPaymentStepText("Initializing secure checkout...");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error("Unable to load payment gateway SDK. Please check your internet connection and try again.");
      }

      const clientEmail = bookingForm.email || user?.email || '';
      const clientPhone = bookingForm.phone || user?.phone || '';

      if (clientEmail && !validateEmail(clientEmail)) {
        throw new Error("Please enter a valid email address.");
      }

      if (clientPhone && !validateIndianPhone(clientPhone)) {
        throw new Error("Please enter a valid 10-digit Indian phone number.");
      }

      const status = getAdvisorAvailabilityStatus(selectedAdvisor?.id, selectedDate, selectedTime);
      if (status === 'Booked' || status === 'Unavailable') {
        throw new Error("This slot is already booked for this counsellor. Please select another slot.");
      }

      const campaign = getStoredCampaignData();

      const bookingDetails = {
        counsellorId: selectedAdvisor ? selectedAdvisor.id : '',
        date: selectedDate,
        time: selectedTime,
        duration: bookingDuration,
        bookingDuration: bookingDuration,
        mode: bookingMode,
        service: bookingService,
        couponCode: couponInput,
        appliedDiscount: appliedDiscount,
        baseFee: baseFee,
        gstAmount: gstAmount,
        amount: netTotal,
        clientName: (bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User'))
          ? bookingForm.name
          : ((user?.name && user.name !== 'New User' && !user.name.includes('Behold User')) ? user.name : ''),
        clientEmail: (bookingForm.email && !bookingForm.email.includes('@temp.behold'))
          ? bookingForm.email
          : ((user?.email && !user.email.includes('@temp.behold')) ? user.email : ''),
        clientPhone: bookingForm.phone || user?.phone || '',
        clientLocationName: bookingForm.clientLocationName || '',
        clientLatitude: Number(bookingForm.clientLatitude) || 0,
        clientLongitude: Number(bookingForm.clientLongitude) || 0,
        utmSource: campaign.utm_source || '',
        utmMedium: campaign.utm_medium || '',
        utmCampaign: campaign.utm_campaign || '',
        utmContent: campaign.utm_content || '',
        utmTerm: campaign.utm_term || '',
        fbclid: campaign.fbclid || ''
      };

      if (netTotal === 0) {
        setPaymentStepText("Processing free booking...");
        const bookRes = await ApiService.bookAppointment(bookingDetails.counsellorId, bookingDetails);
        if (bookRes.success) {
          toast.success("Booking confirmed!");
          sendLocalNotification(
            "Booking Confirmed!",
            `Your session with ${selectedAdvisor?.name || 'Assigned Advisor'} on ${selectedDate} at ${selectedTime} is confirmed.`
          );

          // Meta Pixel conversion tracking for free appointment
          trackPurchase({
            orderId: bookRes.data?.id || 'free_booking',
            value: 0.00,
            currency: 'INR',
            service: bookingService,
            mode: bookingMode
          });
          trackSchedule({
            advisorId: selectedAdvisor?.id,
            advisorName: selectedAdvisor?.name,
            date: selectedDate,
            time: selectedTime,
            mode: bookingMode,
            service: bookingService
          });

          const bookingId = bookRes.data?.id || `BEH-${Date.now().toString().slice(-6)}`;
          setConfirmedBooking(bookRes.data || null);
          setConfirmedMeetLink(bookRes.data?.meetLink || '');
          try {
            sessionStorage.setItem('last_booking_confirmation', JSON.stringify({
              id: bookingId,
              advisorName: selectedAdvisor?.name || 'Assigned Psychologist',
              advisorRole: selectedAdvisor?.role || selectedAdvisor?.title || 'Consultant Psychologist',
              advisorPhoto: selectedAdvisor?.photo || '',
              advisorId: selectedAdvisor?.id || '',
              date: selectedDate,
              time: selectedTime,
              duration: bookingDuration === 30 ? '30 Mins (Introductory Session)' : '1 Hour (Standard Session)',
              service: bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring',
              mode: bookingMode,
              amountPaid: 0,
              meetLink: bookRes.data?.meetLink || '',
              userName: bookingForm.name || user?.name || 'Student',
              userEmail: bookingForm.email || user?.email || '',
              userPhone: bookingForm.phone || user?.phone || '',
              status: 'CONFIRMED',
              paymentStatus: 'FREE'
            }));
          } catch (e) {}
          setIsProcessingPayment(false);
          setIsSuccess(true);
          setBookingStep('success');
          window.location.href = '/confirmed';
          return;
        } else {
          throw new Error(bookRes.message || "Failed to confirm free booking.");
        }
      }

      setPaymentStepText("Initializing Razorpay checkout...");

      // 1. Create Razorpay order via backend
      const orderRes = await ApiService.createOrder({
        amount: netTotal,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        counsellorId: selectedAdvisor ? selectedAdvisor.id : '',
        date: selectedDate,
        time: selectedTime,
        duration: bookingDuration,
        bookingDuration: bookingDuration,
        mode: bookingMode,
        service: bookingService,
        couponCode: couponInput,
        clientLocationName: bookingForm.clientLocationName || '',
        clientLatitude: Number(bookingForm.clientLatitude) || 0,
        clientLongitude: Number(bookingForm.clientLongitude) || 0,
        utmSource: campaign.utm_source || '',
        utmMedium: campaign.utm_medium || '',
        utmCampaign: campaign.utm_campaign || '',
        utmContent: campaign.utm_content || '',
        utmTerm: campaign.utm_term || '',
        fbclid: campaign.fbclid || ''
      });

      if (!orderRes || !orderRes.success || (!orderRes.order && !orderRes.order_id && !orderRes.data?.orderId)) {
        throw new Error(orderRes?.message || "Failed to initialize payment gateway.");
      }

      const orderId = orderRes.order?.id || orderRes.order_id || orderRes.data?.orderId;
      const keyId = orderRes.order?.keyId || orderRes.data?.keyId || orderRes.keyId || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_RAZORPAY_KEY_ID : '') || 'rzp_test_THJcTWUaeHzOnn';

      // 2. Open Razorpay checkout modal
      const options = {
        key: keyId,
        amount: Math.round(netTotal * 100),
        currency: "INR",
        name: "BEHOLD.",
        description: `${bookingService.toUpperCase()} Consultation with ${selectedAdvisor?.name || 'Psychologist'}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setPaymentStepText("Verifying payment signature with server...");

            const bookingDetails = {
              counsellorId: selectedAdvisor ? selectedAdvisor.id : '',
              date: selectedDate,
              time: selectedTime,
              duration: bookingDuration,
              bookingDuration: bookingDuration,
              mode: bookingMode,
              service: bookingService,
              couponCode: couponInput,
              appliedDiscount: appliedDiscount,
              baseFee: baseFee,
              gstAmount: gstAmount,
              amount: netTotal,
              clientName: (bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User'))
                ? bookingForm.name
                : ((user?.name && user.name !== 'New User' && !user.name.includes('Behold User')) ? user.name : ''),
              clientEmail: (bookingForm.email && !bookingForm.email.includes('@temp.behold'))
                ? bookingForm.email
                : ((user?.email && !user.email.includes('@temp.behold')) ? user.email : ''),
              clientPhone: bookingForm.phone || user?.phone || '',
              clientLocationName: bookingForm.clientLocationName || '',
              clientLatitude: Number(bookingForm.clientLatitude) || 0,
              clientLongitude: Number(bookingForm.clientLongitude) || 0,
              utmSource: campaign.utm_source || '',
              utmMedium: campaign.utm_medium || '',
              utmCampaign: campaign.utm_campaign || '',
              utmContent: campaign.utm_content || '',
              utmTerm: campaign.utm_term || '',
              fbclid: campaign.fbclid || ''
            };

            const verifyRes = await ApiService.verifyPaymentAndBook(response, bookingDetails);
            if (verifyRes.success) {
              toast.success("Payment verified! Booking confirmed.");
              sendLocalNotification(
                "Booking Confirmed!",
                `Your session with ${selectedAdvisor?.name || 'Assigned Advisor'} on ${selectedDate} at ${selectedTime} is confirmed.`
              );

              const serverBooking = verifyRes.data || null;
              const serverMeetLink = serverBooking?.meetLink || '';

              // Meta Pixel conversion tracking for paid appointment
              trackPurchase({
                orderId: serverBooking?.id || orderId,
                value: netTotal,
                currency: 'INR',
                service: bookingService,
                mode: bookingMode
              });
              trackSchedule({
                advisorId: selectedAdvisor?.id,
                advisorName: selectedAdvisor?.name,
                date: selectedDate,
                time: selectedTime,
                mode: bookingMode,
                service: bookingService
              });

              setConfirmedBooking(serverBooking);
              if (serverMeetLink) setConfirmedMeetLink(serverMeetLink);
              const bookingId = verifyRes.data?.bookingId || verifyRes.data?.id || serverBooking?.id || `BEH-${Date.now().toString().slice(-6)}`;
              try {
                sessionStorage.setItem('last_booking_confirmation', JSON.stringify({
                  id: bookingId,
                  advisorName: selectedAdvisor?.name || 'Assigned Psychologist',
                  advisorRole: selectedAdvisor?.role || selectedAdvisor?.title || 'Consultant Psychologist',
                  advisorPhoto: selectedAdvisor?.photo || '',
                  advisorId: selectedAdvisor?.id || '',
                  date: selectedDate,
                  time: selectedTime,
                  duration: bookingDuration === 30 ? '30 Mins (Introductory Session)' : '1 Hour (Standard Session)',
                  service: bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring',
                  mode: bookingMode,
                  amountPaid: netTotal,
                  meetLink: serverMeetLink || '',
                  userName: bookingForm.name || user?.name || 'Student',
                  userEmail: bookingForm.email || user?.email || '',
                  userPhone: bookingForm.phone || user?.phone || '',
                  status: 'CONFIRMED',
                  paymentStatus: 'PAID'
                }));
              } catch (e) {}
              setIsProcessingPayment(false);
              setIsSuccess(true);
              setBookingStep('success');
              window.location.href = '/confirmed';
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
          name: (bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User'))
            ? bookingForm.name
            : ((user?.name && user.name !== 'New User' && !user.name.includes('Behold User')) ? user.name : ''),
          email: (bookingForm.email && !bookingForm.email.includes('@temp.behold'))
            ? bookingForm.email
            : ((user?.email && !user.email.includes('@temp.behold')) ? user.email : ''),
          contact: bookingForm.phone || user?.phone || ''
        },
        theme: {
          color: "#00E5FF"
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled by user.");
            setIsProcessingPayment(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        toast.error(response.error?.description || "Payment failed. Please try again.");
        setIsProcessingPayment(false);
      });
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
        try {
          sessionStorage.setItem('last_booking_confirmation', JSON.stringify({
            id: apptId,
            advisorName: rescheduleSession.advisorName || selectedAdvisor?.name || 'Assigned Psychologist',
            advisorRole: selectedAdvisor?.role || selectedAdvisor?.title || 'Consultant Psychologist',
            date: selectedDate,
            time: selectedTime,
            duration: '1 Hour',
            service: 'Psychological Counselling',
            mode: 'ONLINE',
            amountPaid: 0,
            status: 'RESCHEDULE_REQUESTED',
            paymentStatus: 'PAID'
          }));
        } catch (e) {}
        setIsSuccess(true);
        setBookingStep('success');
        window.location.href = '/confirmed?type=rescheduled';
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

    if (authData) {
      if (updateUser) updateUser(authData);
      const validUserName = authData.name && authData.name !== 'New User' && !authData.name.includes('Behold User') ? authData.name : '';
      const validUserEmail = authData.email && !authData.email.includes('@temp.behold') ? authData.email : '';
      setBookingForm(prev => ({
        ...prev,
        name: prev.name && prev.name.trim().length > 0 ? prev.name : validUserName,
        email: prev.email && prev.email.trim().length > 0 ? prev.email : validUserEmail,
        phone: authData.phone || prev.phone || '',
        clientLocationName: prev.clientLocationName || authData.locationName || '',
        clientLatitude: prev.clientLatitude || authData.latitude || '',
        clientLongitude: prev.clientLongitude || authData.longitude || ''
      }));
    }

    // Always navigate to Step 2 ("payment" screen) so user can enter/verify basic details before paying
    setBookingStep('payment');
    window.history.pushState({ component: 'booking', step: 'payment' }, '');

    trackInitiateCheckout({
      service: bookingService,
      mode: bookingMode,
      duration: bookingDuration,
      value: netTotal,
      currency: 'INR'
    });
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

  const handlePaymentSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setErrors({});

    const baseErrors = {};

    const rawName = (bookingForm.name || user?.name || '').trim();
    const rawEmail = (bookingForm.email || user?.email || '').trim();
    const resolvedPhone = (bookingForm.phone || user?.phone || '').trim();

    const isPlaceholderName = !rawName || rawName === 'New User' || rawName.includes('Behold User');
    const isPlaceholderEmail = !rawEmail || rawEmail.includes('@temp.behold') || !validateEmail(rawEmail);

    const resolvedName = isPlaceholderName ? '' : rawName;
    const resolvedEmail = isPlaceholderEmail ? '' : rawEmail;

    if (!resolvedName) {
      baseErrors.name = 'Full name is required for booking confirmation';
    }

    if (!resolvedEmail) {
      baseErrors.email = 'Valid email is required for session confirmations & receipts';
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
      const firstError = Object.values(baseErrors)[0];
      toast.error(firstError);
      return;
    }

    setBookingForm(prev => ({
      ...prev,
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone
    }));

    // Store / sync user basic details to backend profile so their account is permanently updated
    if (user) {
      const profileUpdates = {};
      if (resolvedName && user.name !== resolvedName) profileUpdates.name = resolvedName;
      if (resolvedEmail && user.email !== resolvedEmail) profileUpdates.email = resolvedEmail;
      if (resolvedPhone && user.phone !== resolvedPhone) profileUpdates.phone = resolvedPhone;
      if (bookingForm.clientLocationName && user.locationName !== bookingForm.clientLocationName) {
        profileUpdates.locationName = bookingForm.clientLocationName;
        profileUpdates.latitude = Number(bookingForm.clientLatitude) || 0;
        profileUpdates.longitude = Number(bookingForm.clientLongitude) || 0;
      }
      if (Object.keys(profileUpdates).length > 0) {
        try {
          const updateRes = await ApiService.updateProfile(profileUpdates);
          if (updateRes && updateRes.success && updateRes.data) {
            const updatedUserObj = { ...user, ...updateRes.data };
            if (updateUser) updateUser(updatedUserObj);
          }
        } catch (profErr) {
          console.warn('[User Profile Update Error in Booking]:', profErr);
        }
      }
    }

    try {
      const draft = {
        bookingService,
        bookingMode,
        bookingDuration,
        selectedDate,
        selectedTime,
        selectedAdvisorId: selectedAdvisor ? selectedAdvisor.id : null,
        advisorConfirmed,
        bookingForm: {
          ...bookingForm,
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone
        }
      };
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
    } catch { /* ignore */ }

    processPayment();
  };

  const resetBookingState = () => {
    setIsSuccess(false);
    setConfirmedBooking(null);
    setConfirmedMeetLink('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedAdvisor(null);
    setAdvisorConfirmed(false);
    setAppliedDiscount(0);
    setCouponInput('');
    setBookingStep('config');
    try { sessionStorage.removeItem(BOOKING_DRAFT_KEY); } catch { /* ignore */ }
  };

  const handleApplyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if (!code) {
      setCouponMsg({ text: 'Please enter a promo code', type: 'error' });
      return;
    }
    const foundPromo = sitePromoCodes.find(p => p.code && p.code.toUpperCase() === code && p.isActive !== false);
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
    bookingDuration,
    setBookingDuration,
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
    enableCareerMentoring,
    enableOnline: siteSettings.enableOnline !== false,
    enableDoorstep: siteSettings.enableDoorstep !== false,
    enableOffline: siteSettings.enableOffline !== false,
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
    getAdvisorEarliestAvailableDate,
    getAdvisorEarliestAvailableInfo,
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
    getHaversineDistance,
    confirmedMeetLink,
    confirmedBooking,
    isIntroductoryEligible,
    hasUsedIntroductory: !isIntroductoryEligible,
    getDurationPrice
  };
}
