import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useBookingViewModel, BOOKING_DRAFT_KEY } from './useBookingViewModel';

import TimePicker from './TimePicker';
import BookingAuthModal from './BookingAuthModal';
import { FileDown, X, ArrowLeft, ArrowRight, Lock, ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ExternalLink, Calendar as CalendarIcon, Trash2, Video as VideoIcon, Star } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
import { createGoogleCalendarUrl } from '../../utils/calendarUtils';
import { buildGoogleMeetUrl } from '../student/utils/utils';
import toast from 'react-hot-toast';
import { ScrollDot } from '../../components/common/BrandDot';
import SEO from '../../components/common/SEO';
import { useScrollLock } from '../../utils/scrollLock';

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const COUNSELLING_FLOW = {
    online: [
        "Choose psychologist, schedule date & time",
        "Fill user profile & process online payment fee",
        "Access Google Meet link, schedule, & WhatsApp notifications"
    ],
    doorstep: [
        "Choose psychologist, schedule date & time",
        "Fill user profile & process online payment fee",
        "Receive doorstep counselor assignment & WhatsApp notifications"
    ],
    offline: [
        "Choose psychologist, schedule date & time",
        "Fill user profile & process online payment fee",
        "Receive center address, instructions, & WhatsApp notifications"
    ]
};

const CAREER_FLOW = {
    online: [
        "Schedule Date, Time & choose career coach/advisor",
        "Fill user profile & process online payment fee",
        "Access Google Meet link, checklist, & WhatsApp notifications"
    ],
    doorstep: [
        "Schedule Date, Time & choose career coach/advisor",
        "Fill user profile & process online payment fee",
        "Receive doorstep advisor assignment & WhatsApp notifications"
    ],
    offline: [
        "Schedule Date, Time & choose career coach/advisor",
        "Fill user profile & process online payment fee",
        "Receive center address, preparation guide, & WhatsApp notifications"
    ]
};

export default function ServiceBooking({ isOpen, onClose, preselectedAdvisorId, clearPreselectedAdvisor, onOpenDocs }) {
    const {
        user,
        bookingService,
        setBookingService,
        bookingMode,
        setBookingMode,
        bookingDuration,
        setBookingDuration,
        isIntroductoryEligible,
        bookingForm,
        setBookingForm,
        selectedDate,
        selectedTime,
        setSelectedTime,
        selectedAdvisor,
        setSelectedAdvisor,
        setAdvisorConfirmed,
        advisorConfirmed,
        advisors,
        isLoadingAdvisors,
        advisorLoadError,
        retryLoadAdvisors,
        showAuthModal,
        setShowAuthModal,
        showNoCounsellorsModal,
        setShowNoCounsellorsModal,
        rescheduleSession,
        errors,
        setErrors,
        isSubmitting,
        setIsSubmitting,
        bookingStep,
        couponInput,
        setCouponInput,
        appliedDiscount,
        couponMsg,
        isProcessingPayment,
        paymentStepText,
        copiedMeet,
        setCopiedMeet,
        showSummary,
        setShowSummary,
        downloadingPdf,
        enablePsychology,
        enableCareerMentoring,
        enableOnline,
        enableDoorstep,
        enableOffline,
        isRescheduleParam,
        baseFee,
        gstEnabled,
        gstPercent,
        gstAmount,
        netTotal,
        downloadPDFReceipt,
        getAvailableSlotsForDate,
        getAdvisorSlotsForDate,
        getAdvisorAllSlotsForDate,
        getAdvisorBookedSlotsForDate,
        getAdvisorEarliestAvailableDate,
        getAdvisorEarliestAvailableInfo,
        selectAdvisor,
        handleDateChange,
        handleStepChange,
        handleInputChange,
        handleRescheduleConfirm,
        handleAuthSuccess,
        handlePaymentSubmit,
        resetBookingState,
        handleApplyCoupon,
        handleRemoveCoupon,
        getCalculatedDistance,
        getHaversineDistance,
        confirmedMeetLink,
        confirmedBooking
    } = useBookingViewModel({ preselectedAdvisorId, clearPreselectedAdvisor });

    const stepServiceRef = useRef(null);
    const stepAdvisorRef = useRef(null);
    const step3TimeRef = useRef(null);
    const step3NextBtnRef = useRef(null);
    const stepSummaryRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const scrollAnimationIdRef = useRef(null);

    // Cancel any in-flight scroll animation when the modal closes or component unmounts
    useEffect(() => {
        if (!isOpen && scrollAnimationIdRef.current) {
            cancelAnimationFrame(scrollAnimationIdRef.current);
            scrollAnimationIdRef.current = null;
        }
        return () => {
            if (scrollAnimationIdRef.current) {
                cancelAnimationFrame(scrollAnimationIdRef.current);
                scrollAnimationIdRef.current = null;
            }
        };
    }, [isOpen]);

    const smoothScrollElement = useCallback((container, targetY, duration = 650) => {
        if (!container) return;
        if (scrollAnimationIdRef.current) {
            cancelAnimationFrame(scrollAnimationIdRef.current);
        }

        const startY = container.scrollTop;
        const difference = targetY - startY;
        if (Math.abs(difference) < 4) return;

        const startTime = performance.now();
        const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);

            container.scrollTop = startY + difference * easeProgress;

            if (progress < 1) {
                scrollAnimationIdRef.current = requestAnimationFrame(animate);
            } else {
                scrollAnimationIdRef.current = null;
            }
        };

        scrollAnimationIdRef.current = requestAnimationFrame(animate);
    }, []);

    const scrollToTarget = useCallback((targetRef, offsetAdjust = 24, duration = 650) => {
        let attempts = 0;
        const tryScroll = () => {
            const container = scrollContainerRef.current;
            const target = targetRef?.current;
            if (!container) return;
            if (!target) {
                // Wait for the step card to mount (animate-step-in) before measuring
                if (attempts < 10) {
                    attempts++;
                    requestAnimationFrame(tryScroll);
                }
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const targetOffset = targetRect.top - containerRect.top + container.scrollTop - offsetAdjust;
            smoothScrollElement(container, Math.max(0, targetOffset), duration);
        };

        requestAnimationFrame(tryScroll);
    }, [smoothScrollElement]);

    const [expandedBios, setExpandedBios] = useState({});
    const [expandedSpecialties, setExpandedSpecialties] = useState({});
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [showClearBookingConfirm, setShowClearBookingConfirm] = useState(false);

    const [wizardStep, setWizardStep] = useState(() => preselectedAdvisorId ? 2 : 1);
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    // Generate date strip for horizontal picker
    const dateStrip = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${dayNum}`;
            const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' });
            const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
            dates.push({ dateStr, dayNum: d.getDate(), dayLetter, dayShort });
        }
        return dates;
    }, []);

    // Reset, resume, or jump to the right step when the modal opens
    const wasOpenRef = useRef(false);
    useLayoutEffect(() => {
        const justOpened = isOpen && !wasOpenRef.current;
        wasOpenRef.current = isOpen;
        if (!justOpened) return;
        // Rescheduling always starts at date & time selection
        if (isRescheduleParam) {
            setWizardStep(3);
            return;
        }
        if (preselectedAdvisorId) {
            setWizardStep(2);
            return;
        }
        // Resume at step 3/4 when an in-progress draft was restored from sessionStorage
        let resumeStep = 1;
        try {
            const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
            const draft = raw ? JSON.parse(raw) : null;
            if (draft && draft.selectedAdvisorId) {
                resumeStep = draft.selectedDate && draft.selectedTime ? 4 : 3;
            }
        } catch { /* ignore */ }
        setWizardStep(resumeStep);
    }, [isOpen, preselectedAdvisorId, isRescheduleParam]);

    const isAdvisorLocked = !!preselectedAdvisorId;
    const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
    const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

    const [clientSearchQuery, setClientSearchQuery] = useState(bookingForm.clientLocationName || '');
    const [advisorPage, setAdvisorPage] = useState(1);

    const handleModalBack = useCallback(() => {
        if (bookingStep === 'payment') {
            handleStepChange('config');
            return;
        }
        if (wizardStep === 2 && isAdvisorLocked) {
            onClose();
            return;
        }
        if (wizardStep > 1) {
            setWizardStep(prev => prev - 1);
            return;
        }
        onClose();
    }, [bookingStep, wizardStep, isAdvisorLocked, handleStepChange, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const stateId = `booking_modal_${Date.now()}`;
        window.history.pushState({ modalState: stateId }, '');

        const handlePopState = () => {
            handleModalBack();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, handleModalBack]);

    // The wizard and the sheets stacked on top of it share one counted lock, so
    // the landing page never scrolls behind an open dialog and never unfreezes
    // while a shallower sheet is dismissed.
    useScrollLock(isOpen);

    // Instantly reset scroll to top on step change so each step starts cleanly.
    // (Manual scroll-to-target calls run after this via requestAnimationFrame.)
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            if (container) {
                if (scrollAnimationIdRef.current) {
                    cancelAnimationFrame(scrollAnimationIdRef.current);
                    scrollAnimationIdRef.current = null;
                }
                container.scrollTop = 0;
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [bookingStep, wizardStep]);

    const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false);
    useEffect(() => {
        if (selectedAdvisor && !hasAutoAdvanced && wizardStep === 1 && !isAdvisorLocked) {
            setWizardStep(2);
            setHasAutoAdvanced(true);
        }
    }, [selectedAdvisor, hasAutoAdvanced, wizardStep, isAdvisorLocked]);

    const effectiveAdvisorPage = Math.max(1, advisorPage);

    // When admin enables only one service/mode, show it as plain text instead of a selectable card
    const hasMultipleServices = enablePsychology && enableCareerMentoring;
    const hasMultipleModes = [enableOnline, enableDoorstep, enableOffline].filter(Boolean).length > 1;

    const [clientSearchResults, setClientSearchResults] = useState([]);
    const [isClientSearching, setIsClientSearching] = useState(false);
    const [isClientLocating, setIsClientLocating] = useState(false);

    useEffect(() => {
        if (!clientSearchQuery.trim() || clientSearchQuery.trim().length < 3 || clientSearchQuery === bookingForm.clientLocationName) {
            const timer = setTimeout(() => {
                setClientSearchResults([]);
            }, 0);
            return () => clearTimeout(timer);
        }
        const timer = setTimeout(async () => {
            setIsClientSearching(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clientSearchQuery)}`);
                const data = await res.json();
                setClientSearchResults(data);
            } catch (err) {
                console.error("Geocoding error", err);
            } finally {
                setIsClientSearching(false);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [clientSearchQuery, bookingForm.clientLocationName]);

    const handleClientAddressSearch = async () => {
        if (!clientSearchQuery.trim()) return;
        setIsClientSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clientSearchQuery)}`);
            const data = await res.json();
            setClientSearchResults(data);
            if (data.length === 0) {
                toast.error("No locations found.");
            }
        } catch (err) {
            console.error("Geocoding error", err);
            toast.error("Failed to search location.");
        } finally {
            setIsClientSearching(false);
        }
    };

    const handleClientDetectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported.");
            return;
        }

        setIsClientLocating(true);
        const toastId = toast.loading("Detecting current coordinates...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                toast.dismiss(toastId);
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    setBookingForm(prev => ({
                        ...prev,
                        clientLatitude: lat.toString(),
                        clientLongitude: lng.toString(),
                        clientLocationName: data?.display_name || prev.clientLocationName
                    }));

                    if (data?.display_name) {
                        setClientSearchQuery(data.display_name);
                    }
                } catch (err) {
                    console.error("Reverse geocoding error", err);
                    setBookingForm(prev => ({
                        ...prev,
                        clientLatitude: lat.toString(),
                        clientLongitude: lng.toString()
                    }));
                } finally {
                    setIsClientLocating(false);
                }
            },
            (err) => {
                toast.dismiss(toastId);
                toast.error("Failed to detect coordinates: " + err.message);
                setIsClientLocating(false);
            }
        );
    }, [setBookingForm, setClientSearchQuery]);

    useEffect(() => {
        if (bookingMode === 'DOOR_STEP' && !bookingForm.clientLatitude && !bookingForm.clientLongitude) {
            const timer = setTimeout(handleClientDetectLocation, 0);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [bookingMode, bookingForm.clientLatitude, bookingForm.clientLongitude, handleClientDetectLocation]);

    if (!isOpen) return null;

    if (!enablePsychology && !enableCareerMentoring && !isRescheduleParam) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden bg-black/60 backdrop-blur-sm">
                <div
                    className="relative my-auto flex max-h-full w-full max-w-md flex-col items-center justify-start overflow-y-auto overscroll-contain rounded-none bg-white text-center shadow-2xl select-none px-4 py-16 sm:rounded-md"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#f1eadc] hover:bg-[#e6dfd0] rounded-md flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                        <X className="w-5 h-5 text-[#55605f]" />
                    </button>
                    <div className="my-auto max-w-md w-full bg-white border border-[#e6dfd0] p-8 rounded-md shadow-sm space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-[#f1eadc] border border-[#e6dfd0] rounded-md flex items-center justify-center mx-auto text-[#0e1111] shadow-sm">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm bg-[#0e1111] text-white px-3 py-1 rounded-md font-semibold w-fit mx-auto block">
                                System Notice
                            </span>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0e1111]">
                                Bookings Paused
                            </h2>
                            <p className="text-xs sm:text-sm text-[#55605f] leading-relaxed font-semibold">
                                We are currently performing scheduled maintenance. Booking new sessions is temporarily offline.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#e6dfd0] flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-[#0e1111] hover:bg-[#0e7490] text-white text-sm font-semibold rounded-md transition-all cursor-pointer shadow-none w-full sm:w-auto text-center border-none"
                            >
                                Home Page
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/sample-test');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-white border border-[#e6dfd0] hover:bg-[#f6f1e6] text-[#0e1111] text-sm font-semibold rounded-md transition-all cursor-pointer w-full sm:w-auto text-center"
                            >
                                Take Sample Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bh-booking-overlay fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm overflow-hidden animate-backdrop-in">
            <SEO
                title="Book a Session | Psychological Counselling & Career Mentoring"
                description="Book an online, doorstep, or offline therapy session with certified clinical psychologists and career mentors on BEHOLD."
                canonicalUrl="https://www.behold.co.in/booking"
            />
            <div id="booking-modal-shell" className={`bh-booking-dialog relative w-full max-w-lg md:max-w-xl lg:max-w-2xl h-[92vh] sm:h-[90vh] bg-[#fbf8f1] rounded-t-lg sm:rounded-lg border border-[#e6dfd0] shadow-2xl overflow-hidden text-[#0e1111] text-left animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 transition-all duration-300 flex flex-col`}>

                {/* Mobile Drag Handle */}
                <div className="w-12 h-1 bg-[#e6dfd0] rounded-xs mx-auto mt-2.5 sm:hidden shrink-0" />

                {/* Secure Payment & Booking Verification Overlay
                    Portalled to <body>: inside the dialog it would be sized to the
                    full scroll height and drift off-screen the moment the wizard
                    scrolled, leaving a hard cut line across the middle of the sheet. */}
                {isProcessingPayment && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[#0e1111]/90 backdrop-blur-md text-white px-6 text-center animate-in fade-in duration-200" role="status" aria-live="polite">
                        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-[#0e7490]/20 border-t-[#0e7490] animate-spin" />
                            <Lock className="w-6 h-6 text-[#0e7490]" />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-white mb-1">Verifying &amp; Confirming Session</h3>
                        <p className="text-xs text-[#e6dfd0] max-w-xs text-center font-medium leading-relaxed">
                            {paymentStepText || 'Securing your appointment and reserving your session room...'}
                        </p>
                    </div>,
                    document.body
                )}

                {/* Mobile App Style Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#fbf8f1] border-b border-[#e6dfd0] shrink-0">
                    <button
                        type="button"
                        onClick={handleModalBack}
                        className="w-10 h-10 -ml-2 flex items-center justify-center text-[#0e1111] hover:text-[#0e7490] transition-colors cursor-pointer border-none bg-transparent"
                        aria-label="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    {/* Dotted Progress Indicator */}
                    {bookingStep !== 'success' && (
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((step) => {
                                const isActive = wizardStep === step || (bookingStep === 'payment' && step === 5);
                                const isDone = wizardStep > step;
                                return (
                                    <div key={step} className="flex items-center">
                                        <div className={`rounded-full transition-all duration-300 ${
                                            isActive ? 'w-3 h-3 bg-[#0e7490] dot-active ring-4 ring-[#0e7490]/20' :
                                            isDone   ? 'w-2 h-2 bg-[#0e7490]/60' :
                                                       'w-2 h-2 bg-[#e6dfd0]'
                                        }`} />
                                        {step < 5 && (
                                            <div className={`h-[2px] transition-all duration-500 ${isDone ? 'w-4 bg-[#0e7490]/40' : 'w-4 bg-[#e6dfd0]'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {bookingStep !== 'success' && (
                            <button
                                type="button"
                                onClick={() => setShowClearBookingConfirm(true)}
                                aria-label="Clear Booking Data"
                                title="Clear Booking Data"
                                className="w-9 h-9 flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors cursor-pointer border-none bg-transparent hover:bg-rose-50 rounded-full"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close Booking"
                            className="w-10 h-10 -mr-2 flex items-center justify-center text-[#7c8785] hover:text-[#0e1111] transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div id="booking-modal-scroll" ref={scrollContainerRef} className="bh-booking-content min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth-momentum pb-[env(safe-area-inset-bottom,16px)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#fbf8f1]">
                    <div className="space-y-8 sm:space-y-10">

                        {/* BOOKING FORM */}
                        <div id="booking-console" className="w-full">

                            {bookingStep === 'success' ? (
                                /* STEP 5: Success & Confirmation View - Centered & Perfectly Balanced */
                                <div className="p-6 sm:p-10 bg-white border border-[#e6dfd0] rounded-md max-w-xl mx-auto shadow-md space-y-6 text-center animate-step-in relative overflow-hidden">

                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#0e7490]/10 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative w-16 h-16 bg-[#0e7490]/10 border border-[#0e7490]/30 rounded-md flex items-center justify-center mx-auto text-[#0e7490] shadow-sm animate-checkmark-circle-pop z-10">
                                        <svg className="w-8 h-8 text-[#0e7490]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path className="animate-checkmark-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <div className="space-y-2 animate-success-content relative z-10 text-center flex flex-col items-center justify-center">
                                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-sm font-semibold w-fit mx-auto block shadow-xs">
                                            {rescheduleSession ? 'Reschedule Requested' : 'Session Confirmed & Paid'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0e1111] tracking-tight mt-2">
                                            {rescheduleSession ? 'Reschedule Requested' : "Booking Confirmed!"}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-[#55605f] max-w-md mx-auto leading-relaxed font-normal mt-1">
                                            {rescheduleSession ? (
                                                <>
                                                    Your reschedule request {bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>for <strong className="font-semibold text-[#0e1111]">{bookingForm.name}</strong> </> : ''}has been submitted to <strong className="font-semibold text-[#0e1111]">{selectedAdvisor?.name}</strong>.
                                                </>
                                            ) : (
                                                <>
                                                    Thank you{bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>, <strong className="font-semibold text-[#0e1111]">{bookingForm.name}</strong></> : ''}! Your payment is verified and your session is successfully booked.
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Invoice & Meeting Card */}
                                    <div className="bg-[#f6f1e6]/80 border border-[#e6dfd0]/80 rounded-xl p-5 sm:p-6 text-left space-y-4 shadow-xs animate-success-content relative z-10" style={{animationDelay: '0.75s'}}>
                                        <div className="flex items-center justify-between border-b border-[#e6dfd0]/80 pb-3 mb-2">
                                            <span className="text-xs font-semibold text-[#55605f]">
                                                {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation Summary'}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                                                ✓ Paid
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <span className="text-[#55605f] block font-medium text-[11px]">Psychologist</span>
                                                <span className="font-semibold text-[#0e1111] text-sm block">{selectedAdvisor?.name || 'Assigned Advisor'}</span>
                                                <span className="text-[#55605f] block font-normal text-xs">{selectedAdvisor?.role || 'Consultant Psychologist'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#55605f] block font-medium text-[11px]">Service & Mode</span>
                                                <span className="font-semibold text-[#0e1111] text-sm block">
                                                    {confirmedBooking?.service ? (confirmedBooking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring') : (bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring')}
                                                </span>
                                                <span className="text-[#55605f] block font-normal text-xs">{confirmedBooking?.mode === 'ONLINE' ? 'Video Call' : confirmedBooking?.mode === 'DOOR_STEP' ? 'Home Visit' : confirmedBooking?.mode === 'OFFLINE' ? 'At Center' : bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#55605f] block font-medium text-[11px]">Date & Schedule</span>
                                                <span className="font-semibold text-[#0e1111] text-sm block">
                                                    {formatDateString(confirmedBooking?.date || selectedDate)}
                                                </span>
                                                <span className="text-[#55605f] block font-normal text-xs">
                                                    {confirmedBooking?.time || selectedTime} • {confirmedBooking?.duration || (bookingDuration === 30 ? '30 Mins (Introductory Session)' : '1 Hour (Standard Session)')}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#55605f] block font-medium text-[11px]">Amount Paid</span>
                                                <span className="font-semibold text-[#0e1111] text-sm block">
                                                    ₹{confirmedBooking?.amountPaid || netTotal}
                                                </span>
                                                <span className="text-[#55605f] block font-normal text-xs">SSL Secure Payment</span>
                                            </div>
                                        </div>

                                        {bookingMode === 'ONLINE' && !rescheduleSession && (
                                            <div className="pt-4 border-t border-[#e6dfd0]/80 mt-3">
                                                {(() => {
                                                    const canonicalId = confirmedBooking?.appointmentId || confirmedBooking?.id || 'Session';
                                                    const resolvedMeetLink = (confirmedBooking?.meetLink && !confirmedBooking.meetLink.includes('meet.jit.si'))
                                                        || (confirmedMeetLink && !confirmedMeetLink.includes('meet.jit.si'))
                                                        || buildGoogleMeetUrl(canonicalId);
                                                    return (
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#e6dfd0] shadow-xs">
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[11px] font-semibold text-[#55605f] block mb-0.5">
                                                                    Google Meet Video Consultation Room
                                                                </span>
                                                                <span className="text-xs text-[#0e1111] font-semibold truncate block font-mono">
                                                                    {resolvedMeetLink}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <a
                                                                    href={resolvedMeetLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3.5 py-2 bg-[#0e7490] hover:bg-[#0e1111] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-xs no-underline"
                                                                    title="Join Google Meet Consultation"
                                                                >
                                                                    <VideoIcon className="w-3.5 h-3.5" />
                                                                    <span>Join Google Meet</span>
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(resolvedMeetLink);
                                                                        setCopiedMeet(true);
                                                                        setTimeout(() => setCopiedMeet(false), 2000);
                                                                    }}
                                                                    className="px-3 py-2 bg-[#f1eadc] hover:bg-[#e6dfd0] text-[#3c4747] text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center border border-[#e6dfd0] shadow-xs whitespace-nowrap"
                                                                >
                                                                    {copiedMeet ? 'Copied!' : 'Copy'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-semibold animate-card-fade pt-1 relative z-10">
                                        {rescheduleSession ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.location.href = '/profile?tab=booked';
                                                }}
                                                className="w-full sm:w-auto px-6 py-3 bg-[#0e7490] hover:bg-[#0b5c73] text-white text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)]"
                                            >
                                                Go to My Sessions
                                            </button>
                                        ) : (
                                            <>
                                                {(confirmedBooking?.mode === 'ONLINE' || bookingMode === 'ONLINE') && (() => {
                                                    const canonicalId = confirmedBooking?.appointmentId || confirmedBooking?.id || 'Session';
                                                    const calendarMeetLink = (confirmedBooking?.meetLink && !confirmedBooking.meetLink.includes('meet.jit.si'))
                                                        || (confirmedMeetLink && !confirmedMeetLink.includes('meet.jit.si'))
                                                        || buildGoogleMeetUrl(canonicalId);
                                                    return (
                                                        <a
                                                            href={createGoogleCalendarUrl({
                                                              title: `BEHOLD Counselling Session - ${confirmedBooking?.counsellorName || selectedAdvisor?.name || 'Psychologist'}`,
                                                              description: `Confidential Psychological Counselling Session via BEHOLD.\nGoogle Meet: ${calendarMeetLink}\nStudent: ${confirmedBooking?.clientName || bookingForm.name || 'User'}`,
                                                              location: calendarMeetLink,
                                                              meetLink: calendarMeetLink,
                                                              date: confirmedBooking?.date || selectedDate,
                                                              time: confirmedBooking?.time || selectedTime,
                                                              durationMinutes: bookingDuration
                                                            })}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full sm:w-auto px-6 py-3 bg-white border border-[#e6dfd0] hover:bg-[#f6f1e6] text-[#0e1111] text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-2 shadow-xs no-underline"
                                                        >
                                                            <CalendarIcon className="w-4 h-4 text-[#0e7490]" />
                                                            <span>Add to Calendar</span>
                                                        </a>
                                                    );
                                                })()}

                                                <button
                                                    type="button"
                                                    disabled={downloadingPdf}
                                                    onClick={() => {
                                                        const bookingId = confirmedBooking?.id || Date.now();
                                                        const advisorName = confirmedBooking?.counsellorName || selectedAdvisor?.name || 'Assigned Advisor';
                                                        const advisorRole = confirmedBooking?.counsellorRole || selectedAdvisor?.role || 'Consultant Psychologist';
                                                        const service = confirmedBooking?.service ? (confirmedBooking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring') : (bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring');
                                                        const mode = confirmedBooking?.mode === 'ONLINE' ? 'Video Call' : confirmedBooking?.mode === 'DOOR_STEP' ? 'Home Visit' : confirmedBooking?.mode === 'OFFLINE' ? 'At Center' : bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';
                                                        const amount = confirmedBooking?.amountPaid || netTotal;
                                                        const clientName = confirmedBooking?.clientName || bookingForm.name || 'User';
                                                        const clientEmail = confirmedBooking?.clientEmail || bookingForm.email;
                                                        const clientPhone = confirmedBooking?.clientPhone || bookingForm.phone;
                                                        const meetLink = bookingMode === 'ONLINE' ? (confirmedBooking?.meetLink || confirmedMeetLink || selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij') : null;

                                                        downloadPDFReceipt({
                                                            id: bookingId,
                                                            service,
                                                            mode,
                                                            duration: confirmedBooking?.duration || (bookingDuration === 30 ? '30 Minutes (Introductory Session)' : '1 Hour (60 Mins)'),
                                                            advisorName,
                                                            advisorRole,
                                                            date: confirmedBooking?.date || selectedDate,
                                                            time: confirmedBooking?.time || selectedTime,
                                                            clientName,
                                                            clientEmail,
                                                            clientPhone,
                                                            amount,
                                                            meetLink,
                                                            baseFee: confirmedBooking?.baseFee || (confirmedBooking?.amountPaid ? (confirmedBooking?.amountPaid - (gstEnabled ? gstAmount : 0)) : baseFee),
                                                            gstPercent: gstEnabled ? gstPercent : 0,
                                                            gstAmount: typeof confirmedBooking?.gstAmount === 'number' ? confirmedBooking.gstAmount : (gstEnabled ? gstAmount : 0),
                                                            appliedDiscount: appliedDiscount
                                                        });
                                                    }}
                                                    className="w-full sm:w-auto px-5 py-3 bg-white border border-[#e6dfd0] text-[#0e1111] hover:bg-[#f6f1e6] text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                                                >
                                                    <FileDown className="w-4 h-4 text-[#55605f]" />
                                                    {downloadingPdf ? 'Generating PDF...' : 'Download Receipt'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        window.location.href = '/profile?tab=booked';
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-[#0e7490] hover:bg-[#0b5c73] text-white text-xs font-semibold rounded-md transition cursor-pointer text-center shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)]"
                                                >
                                                    View My Sessions
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* STEP 1-4 Wizard flow — always single column, summary below form */
                                <div className="flex flex-col gap-6">

                                    {/* Active Step Form Panel */}
                                    <div className="text-left min-h-[380px] relative w-full">

                                        {/* STEP 1: Advisor & Schedule */}
                                        {bookingStep === 'config' && (
                                            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">

                                                {/* WIZARD PROGRESS BAR */}
                                                {!rescheduleSession && (
                                                    <div className="flex items-center justify-between px-2 mb-6 gap-2">
                                                        {[1, 2, 3, 4].map((step) => {
                                                            const effectiveStep = (wizardStep === 1 && isAdvisorLocked) ? 2 : wizardStep;
                                                            return (
                                                                <div key={step} role={effectiveStep > step ? 'button' : undefined} tabIndex={effectiveStep > step ? 0 : undefined} aria-label={effectiveStep > step ? `Go back to step ${step}` : undefined} onClick={effectiveStep > step ? () => setWizardStep(step) : undefined} onKeyDown={effectiveStep > step ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setWizardStep(step); } } : undefined} className={`flex flex-col items-center flex-1 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490]/40 ${effectiveStep > step ? 'group cursor-pointer' : ''}`}>
                                                                    <div className={`w-full h-1 rounded-full ${effectiveStep >= step ? 'bg-[#0e7490]' : 'bg-[#e6dfd0]'} transition-all duration-300`}></div>
                                                                    <span className={`text-[9px] sm:text-[10px] font-semibold mt-2 uppercase tracking-wider text-center transition-colors ${effectiveStep === step ? 'text-[#0e7490]' : effectiveStep > step ? 'text-[#0e1111] group-hover:text-[#0c6b83]' : 'text-[#55605f]/60'}`}>
                                                                        {step === 1 ? 'Advisor' : step === 2 ? 'Service' : step === 3 ? 'Time' : 'Summary'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* STEP 2 — SELECT SERVICE & SESSION PLAN */}
                                                {(wizardStep === 2 || (wizardStep === 1 && isAdvisorLocked)) && (
                                                    <div ref={stepServiceRef} className="bh-booking-step-card bg-white border border-[#e6dfd0] rounded-md p-5 sm:p-7 shadow-sm space-y-6 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-[#e6dfd0] pb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded-xs bg-[#0e7490] text-white text-xs flex items-center justify-center font-bold shadow-xs">
                                                                    2
                                                                </span>
                                                                <div>
                                                                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0e1111] leading-tight">
                                                                        Select Service & Session Plan
                                                                    </h3>
                                                                    <p className="text-xs text-[#55605f] font-normal">
                                                                        {selectedAdvisor ? `Booking with ${selectedAdvisor.name} — pick your service, mode and duration` : 'Choose your consultation service, delivery mode, and duration plan'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-[#0e7490] bg-[#0e7490]/10 px-2.5 py-0.5 rounded-xs uppercase tracking-wider hidden sm:inline-block">
                                                                Step 2
                                                            </span>
                                                        </div>

                                                        {isAdvisorLocked && !selectedAdvisor && (
                                                            <div className={`p-3 rounded-lg flex items-center justify-between gap-3 text-xs mb-2 ${advisorLoadError ? 'bg-rose-50 border border-rose-200' : 'bg-[#f7f2e7] border border-[#e6dfd0]'}`} role={advisorLoadError ? 'alert' : 'status'}>
                                                                <span className={`font-bold ${advisorLoadError ? 'text-rose-700' : 'text-[#55605f]'}`}>
                                                                    {isLoadingAdvisors
                                                                        ? 'Loading the selected psychologist and live availability…'
                                                                        : advisorLoadError
                                                                            ? advisorLoadError
                                                                            : 'This psychologist is no longer available. Close this window and choose another.'}
                                                                </span>
                                                                {advisorLoadError && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={retryLoadAdvisors}
                                                                        className="px-3 py-1.5 bg-[#0e1111] text-white text-xs font-bold rounded-md hover:bg-[#0e7490] transition cursor-pointer border-none shrink-0"
                                                                    >
                                                                        Retry
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedAdvisor && isAdvisorLocked && (
                                                            <div className="p-3 bg-[#f7f2e7] border border-[#e6dfd0] rounded-lg flex items-center justify-between gap-3 text-xs mb-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2 h-2 rounded-full bg-[#0e7490] animate-pulse shrink-0" />
                                                                    <span className="font-bold text-[#0e1111] truncate">
                                                                        Selected: <strong className="text-[#0e1111]">{selectedAdvisor.name}</strong>
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] font-bold text-[#3c4747] shrink-0 hidden sm:inline-block">
                                                                    Review pricing below ↓
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Service Type & Mode Selection — plain text when only one option exists */}
                                                        <div className={`${hasMultipleServices && hasMultipleModes ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-2.5'} pb-3 border-b border-[#f1eadc]`}>
                                                            {/* Service Type */}
                                                            <div className="space-y-2">
                                                                {hasMultipleServices ? (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-[#55605f] uppercase tracking-wider block">Service Type</span>
                                                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingService('counselling');
                                                                                }}
                                                                                className={`flex-1 p-3.5 rounded-md border text-left flex items-center gap-3 transition-all cursor-pointer ${bookingService === 'counselling'
                                                                                        ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 text-[#0e1111]'
                                                                                        : 'border-[#e6dfd0] bg-white text-[#0e1111] hover:border-[#0e7490]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-xl shrink-0">🧠</span>
                                                                                <div className="min-w-0">
                                                                                    <span className="text-xs font-bold block text-[#0e1111] leading-tight">Psychology Counselling</span>
                                                                                    <span className="text-[10px] text-[#55605f] block leading-tight mt-0.5">Clinical therapy & assessment</span>
                                                                                </div>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingService('career');
                                                                                }}
                                                                                className={`flex-1 p-3.5 rounded-md border text-left flex items-center gap-3 transition-all cursor-pointer ${bookingService === 'career'
                                                                                        ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 text-[#0e1111]'
                                                                                        : 'border-[#e6dfd0] bg-white text-[#0e1111] hover:border-[#0e7490]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-xl shrink-0">🧭</span>
                                                                                <div className="min-w-0">
                                                                                    <span className="text-xs font-bold block text-[#0e1111] leading-tight">Career Mentoring</span>
                                                                                    <span className="text-[10px] text-[#55605f] block leading-tight mt-0.5">Guidance & direction</span>
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-[#55605f] leading-tight">
                                                                        Service Type: <span className="font-bold text-[#0e1111]">{bookingService === 'career' ? 'Career Mentoring' : 'Psychology Counselling'}</span>
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Session Mode */}
                                                            <div className="space-y-2">
                                                                {hasMultipleModes ? (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-[#55605f] uppercase tracking-wider block">Session Mode</span>
                                                                        <div className="flex flex-wrap gap-2.5">
                                                                        <button
                                                                            type="button"
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                setBookingMode('ONLINE');
                                                                            }}
                                                                            className={`flex-1 min-w-[110px] p-3 rounded-md border flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer ${bookingMode === 'ONLINE'
                                                                                    ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 text-[#0e1111]'
                                                                                    : 'border-[#e6dfd0] bg-white text-[#0e1111] hover:border-[#0e7490]/40'
                                                                                }`}
                                                                        >
                                                                            <span className="text-base shrink-0">🎥</span>
                                                                            <span className="text-xs font-bold leading-tight">Online</span>
                                                                        </button>
                                                                        {enableDoorstep && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingMode('DOOR_STEP');
                                                                                }}
                                                                                className={`flex-1 min-w-[110px] p-3 rounded-md border flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer ${bookingMode === 'DOOR_STEP'
                                                                                        ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 text-[#0e1111]'
                                                                                        : 'border-[#e6dfd0] bg-white text-[#0e1111] hover:border-[#0e7490]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-base shrink-0">🏠</span>
                                                                                <span className="text-xs font-bold leading-tight">Doorstep</span>
                                                                            </button>
                                                                        )}
                                                                        {enableOffline && (
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingMode('OFFLINE');
                                                                                }}
                                                                                className={`flex-1 min-w-[110px] p-3 rounded-md border flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer ${bookingMode === 'OFFLINE'
                                                                                        ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 text-[#0e1111]'
                                                                                        : 'border-[#e6dfd0] bg-white text-[#0e1111] hover:border-[#0e7490]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-base shrink-0">🏢</span>
                                                                                <span className="text-xs font-bold leading-tight">In-Center</span>
                                                                            </button>
                                                                        )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-[#55605f] leading-tight">
                                                                        Session Mode: <span className="font-bold text-[#0e1111]">{bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : bookingMode === 'OFFLINE' ? 'In-Center Session' : 'Online'}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Session Plan Selector: Introductory vs Standard */}
                                                        <div className="space-y-3 pt-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-bold text-[#0e1111] uppercase tracking-wider block">
                                                                    Choose Session Plan
                                                                </label>
                                                                {!isIntroductoryEligible && (
                                                                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-xs flex items-center gap-1">
                                                                        <span>✓</span> Introductory Session Completed
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {isIntroductoryEligible ? (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingDuration(30);
                                                                        }}
                                                                        className={`p-5 rounded-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border relative ${bookingDuration === 30
                                                                                ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 shadow-sm'
                                                                                : 'border-[#e6dfd0] bg-white hover:border-[#0e7490]/40'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#0e7490]/10 text-[#0e7490] border border-[#0e7490]/20">
                                                                                ✨ Intro Offer
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-serif font-bold text-[#0e1111] shrink-0">
                                                                                {selectedAdvisor?.halfSessionPrice != null ? `₹${selectedAdvisor.halfSessionPrice}` : 'Price not configured'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-sm sm:text-base text-[#0e1111]">Introductory Session</h4>
                                                                                {bookingDuration === 30 ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-[#0e7490] shrink-0" />
                                                                                ) : (
                                                                                    <span className="w-4 h-4 rounded-xs border border-[#e6dfd0] shrink-0 block" />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#55605f] mt-1 leading-relaxed">
                                                                                30 Minutes • First session consultation & assessment
                                                                            </p>
                                                                        </div>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingDuration(60);
                                                                        }}
                                                                        className={`p-5 rounded-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border relative ${bookingDuration === 60
                                                                                ? 'border-[#0e7490] bg-[#f7f2e7] ring-1 ring-[#0e7490]/30 shadow-sm'
                                                                                : 'border-[#e6dfd0] bg-white hover:border-[#0e7490]/40'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#e6dfd0] text-[#0e1111]">
                                                                                Comprehensive
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-serif font-bold text-[#0e1111] shrink-0">
                                                                                {selectedAdvisor?.price != null ? `₹${selectedAdvisor.price}` : 'Price not configured'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-sm sm:text-base text-[#0e1111]">Standard Session</h4>
                                                                                {bookingDuration === 60 ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-[#0e7490] shrink-0" />
                                                                                ) : (
                                                                                    <span className="w-4 h-4 rounded-xs border border-[#e6dfd0] shrink-0 block" />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#55605f] mt-1 leading-relaxed">
                                                                                1 Hour (60 Minutes) • Full therapeutic consultation
                                                                            </p>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-[#f7f2e7] rounded-md border border-[#0e7490] ring-1 ring-[#0e7490]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#0e7490]/10 text-[#0e7490]">
                                                                                Full Therapeutic Care
                                                                            </span>
                                                                            <span className="text-xs text-[#55605f] font-medium">1 Hour (60 Mins)</span>
                                                                        </div>
                                                                        <h4 className="font-bold text-sm text-[#0e1111]">Standard Comprehensive Session</h4>
                                                                        <p className="text-xs text-[#55605f] mt-0.5">
                                                                            Introductory session already completed. Continuing with full standard consultation.
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-2xl font-serif font-bold text-[#0e1111]">
                                                                        {selectedAdvisor?.price != null ? `₹${selectedAdvisor.price}` : 'Price not configured'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* DOORSTEP LOCATION INPUTS */}
                                                        {bookingMode === 'DOOR_STEP' && (
                                                            <div className="space-y-4 p-4 bg-[#f6f1e6] border border-[#e6dfd0] rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                                                <div className="border-b border-[#e6dfd0] pb-2">
                                                                    <h4 className="text-xs font-bold text-[#0e1111] uppercase tracking-wider">
                                                                        Doorstep Visit Address
                                                                    </h4>
                                                                    <p className="text-xs text-[#55605f] mt-0.5">
                                                                        Please provide your location to check for nearby psychologists within service radius.
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-1.5 relative">
                                                                    <label className="text-xs font-semibold text-[#3c4747] block">Search Location Address</label>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Type your address to search... (e.g. Kozhikode, Kerala)"
                                                                            value={clientSearchQuery}
                                                                            onChange={(e) => setClientSearchQuery(e.target.value)}
                                                                            className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-[#e6dfd0] text-xs font-medium text-[#0e1111] outline-none focus:border-[#0e7490] rounded-lg transition"
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleClientAddressSearch();
                                                                                }
                                                                            }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleClientAddressSearch}
                                                                            disabled={isClientSearching}
                                                                            className="w-full sm:w-auto px-4 py-2.5 bg-[#0e1111] text-white text-xs font-bold rounded-lg hover:bg-[#0e7490] transition cursor-pointer shrink-0 border-none"
                                                                        >
                                                                            {isClientSearching ? 'Searching...' : 'Search'}
                                                                        </button>
                                                                    </div>

                                                                    {clientSearchResults.length > 0 && (
                                                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#e6dfd0] rounded-lg max-h-40 overflow-y-auto z-50 shadow-md divide-y divide-[#e6dfd0]">
                                                                            {clientSearchResults.map((res, index) => (
                                                                                <button
                                                                                    key={index}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setBookingForm(prev => ({
                                                                                            ...prev,
                                                                                            clientLocationName: res.display_name,
                                                                                            clientLatitude: parseFloat(res.lat).toString() || '0',
                                                                                            clientLongitude: parseFloat(res.lon).toString() || '0'
                                                                                        }));
                                                                                        setClientSearchQuery(res.display_name);
                                                                                        setClientSearchResults([]);
                                                                                    }}
                                                                                    className="w-full text-left px-3.5 py-2 text-xs text-[#3c4747] font-medium hover:bg-[#f6f1e6] transition-colors block truncate"
                                                                                >
                                                                                    {res.display_name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-6 border-t border-[#f1eadc] flex justify-between items-center gap-3">
                                                            {!isAdvisorLocked ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(1)}
                                                                    className="px-5 py-2.5 bg-[#f1eadc] hover:bg-[#e6dfd0] text-[#3c4747] font-bold text-xs sm:text-sm rounded-lg transition cursor-pointer border border-[#e6dfd0]"
                                                                >
                                                                    Back
                                                                </button>
                                                            ) : (
                                                                <div />
                                                            )}
                                                            <button type="button" onClick={() => setWizardStep(3)} disabled={!selectedAdvisor} title={!selectedAdvisor ? 'Select a psychologist to continue' : undefined} className="w-full sm:w-auto px-6 py-2.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white font-bold text-xs sm:text-sm rounded-lg shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)] flex items-center justify-center gap-2 cursor-pointer border border-[#0e7490] transition-all btn-booking-primary disabled:opacity-50 disabled:cursor-not-allowed">Continue to Date & Time <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 1 — SELECT PSYCHOLOGIST */}
                                                {wizardStep === 1 && !isAdvisorLocked && (
                                                    <div ref={stepAdvisorRef} className="bh-booking-step-card @container bg-white border border-[#e6dfd0] rounded-lg p-4 sm:p-6 shadow-xs space-y-5 text-left animate-step-in">
                                                        <div className="flex items-center justify-between gap-3 border-b border-[#f1eadc] pb-3">
                                                            <div className="flex min-w-0 items-center gap-2.5">
                                                                <span className="w-6 h-6 shrink-0 rounded-md bg-[#0e7490] text-white text-xs flex items-center justify-center font-extrabold shadow-xs">
                                                                    1
                                                                </span>
                                                                <div className="min-w-0">
                                                                    <h3 className="font-bold text-base sm:text-lg text-[#0e1111] leading-tight">
                                                                        Select Psychologist
                                                                    </h3>
                                                                    <p className="text-xs text-[#55605f] font-medium">
                                                                        Certified licensed clinical psychologists & therapeutic advisors
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="shrink-0 whitespace-nowrap text-[10px] font-extrabold text-[#3c4747] bg-[#f7f2e7] border border-[#e6dfd0] px-2.5 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
                                                                Step 1
                                                            </span>
                                                        </div>

                                                        {selectedAdvisor && (
                                                            <div className="p-3 bg-[#f7f2e7] border border-[#e6dfd0] rounded-lg flex items-center justify-between gap-3 text-xs">
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-[#0e7490] animate-pulse shrink-0" />
                                                                    {/* Two short lines instead of one long truncated one on phones */}
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-xs font-bold text-[#0e1111]">
                                                                            Selected: {selectedAdvisor.name}
                                                                        </p>
                                                                        <p className="mt-0.5 truncate text-[10.5px] font-medium text-[#7c8785]">
                                                                            ₹{bookingDuration === 30 ? selectedAdvisor.halfSessionPrice : selectedAdvisor.price} • {bookingDuration === 30 ? '30 min plan' : '1 hour plan'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(2)}
                                                                    className="px-3.5 py-1.5 bg-[#0e1111] hover:bg-[#0e7490] text-white font-bold text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shadow-xs border-none flex items-center justify-center gap-1.5"
                                                                >
                                                                    Continue <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const filtered = advisors.filter(adv => {
                                                                    const match = !bookingService || adv.type === bookingService || (bookingService === 'counselling' && adv.type !== 'career');
                                                                    return match;
                                                                });

                                                                const sortedAdvisors = [...filtered].sort((a, b) => {
                                                                    const aRank = Number(a.rank || 0);
                                                                    const bRank = Number(b.rank || 0);
                                                                    if (aRank !== bRank) return bRank - aRank;
                                                                    
                                                                    const aInfo = getAdvisorEarliestAvailableInfo(a);
                                                                    const bInfo = getAdvisorEarliestAvailableInfo(b);
                                                                    if (aInfo.available && !bInfo.available) return -1;
                                                                    if (bInfo.available && !aInfo.available) return 1;
                                                                    return bInfo.slotCount - aInfo.slotCount;
                                                                });

                                                                if (isLoadingAdvisors) {
                                                                    return (
                                                                        <div className="p-6 border border-[#e6dfd0] rounded-lg bg-[#f6f1e6] text-[#55605f] text-center text-sm" role="status" aria-live="polite">
                                                                            Loading psychologists and live availability…
                                                                        </div>
                                                                    );
                                                                }

                                                                if (advisorLoadError) {
                                                                    return (
                                                                        <div className="p-6 border border-rose-200 rounded-lg bg-rose-50 text-center" role="alert">
                                                                            <p className="text-sm font-semibold text-rose-800">Couldn’t load psychologists</p>
                                                                            <p className="mt-1 text-xs text-rose-700">{advisorLoadError}</p>
                                                                            <button
                                                                                type="button"
                                                                                onClick={retryLoadAdvisors}
                                                                                className="mt-3 px-4 py-2 bg-[#0e1111] text-white text-xs font-bold rounded-md hover:bg-[#0e7490] transition cursor-pointer border-none"
                                                                            >
                                                                                Try again
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (sortedAdvisors.length === 0) {
                                                                    return (
                                                                        <div className="p-6 border border-dashed border-[#e6dfd0] rounded-lg bg-[#f6f1e6] text-[#55605f] text-center font-medium text-xs" role="status">
                                                                            No psychologists are currently listed for this service. Please check back soon.
                                                                        </div>
                                                                    );
                                                                }

                                                                const totalPages = Math.max(1, Math.ceil(sortedAdvisors.length / 6));
                                                                const currentPage = Math.min(effectiveAdvisorPage, totalPages);
                                                                const advisorsToRender = sortedAdvisors.slice((currentPage - 1) * 6, currentPage * 6);

                                                                return (
                                                                    <React.Fragment>
                                                                        {/* Columns follow the panel width, not the viewport: this dialog maxes out
                                                                            at 672px, so xl:grid-cols-3 used to squeeze cards to ~165px. */}
                                                                        <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @min-[46rem]:grid-cols-3 items-stretch">
                                                                        {advisorsToRender.map((advisor) => {
                                                                            const info = getAdvisorEarliestAvailableInfo(advisor);
                                                                            const isAvailable = info.available;
                                                                            const isSelected = selectedAdvisor?.id === advisor.id;

                                                                            return (
                                                                                <div
                                                                                    key={advisor.id}
                                                                                    role={isAvailable ? 'button' : undefined}
                                                                                    tabIndex={isAvailable ? 0 : undefined}
                                                                                    aria-pressed={isAvailable ? isSelected : undefined}
                                                                                    aria-disabled={isAvailable ? undefined : true}
                                                                                    onKeyDown={isAvailable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } } : undefined}
                                                                                    onClick={() => {
                                                                                        if (!isAvailable) return;
                                                                                        if (selectAdvisor) {
                                                                                            selectAdvisor(advisor);
                                                                                        } else {
                                                                                            setSelectedAdvisor(advisor);
                                                                                            setAdvisorConfirmed(true);
                                                                                            const earliest = getAdvisorEarliestAvailableDate(advisor);
                                                                                            if (earliest) handleDateChange(earliest);
                                                                                            setSelectedTime('');
                                                                                        }
                                                                                        if (errors.advisor) setErrors(prev => ({ ...prev, advisor: null }));
                                                                                        setWizardStep(2);
                                                                                    }}
                                                                                    className={`group flex min-w-0 flex-col p-4 sm:p-5 border bg-white rounded-xl relative shadow-xs cursor-pointer booking-card transition-all ${isSelected
                                                                                            ? 'border-[#0e7490] ring-2 ring-[#0e7490]/20 bg-[#f7f2e7]/40 shadow-sm'
                                                                                            : isAvailable
                                                                                                ? 'border-[#e6dfd0] hover:border-[#0e7490]/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                                                                                                : 'border-[#f1eadc] opacity-60 hover:opacity-90'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex flex-col flex-1">
                                                                                        {/* Identity row — the role sits on its own line so long names never truncate */}
                                                                                        <div className="flex items-start gap-3">
                                                                                            <div className="relative shrink-0">
                                                                                                <div className={`flex h-13 w-13 items-center justify-center overflow-hidden rounded-lg border bg-[#f6f1e6] shadow-xs transition-colors ${isSelected ? 'border-[#0e7490]' : 'border-[#e6dfd0] group-hover:border-[#d5cdbb]'}`}>
                                                                                                    {advisor.profilePic || advisor.image ? (
                                                                                                        <img
                                                                                                            src={advisor.profilePic || advisor.image}
                                                                                                            alt={advisor.name}
                                                                                                            className="h-full w-full object-cover"
                                                                                                        />
                                                                                                    ) : (
                                                                                                        <span className="text-xl font-bold text-[#0c6b83]">
                                                                                                            {getInitials(advisor.name)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                {/* Corner star keeps the rating signal without covering the photo */}
                                                                                                {(advisor.isHighlighted || advisor.isTopFive) && (
                                                                                                    <span
                                                                                                        title="Top rated psychologist"
                                                                                                        aria-label="Top rated psychologist"
                                                                                                        className="absolute -right-1.5 -top-1.5 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0e7490] text-white shadow-sm ring-2 ring-white"
                                                                                                    >
                                                                                                        <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>

                                                                                            <div className="min-w-0 flex-1">
                                                                                                <h4 title={advisor.name} className={`truncate text-[15px] font-bold leading-snug transition-colors ${isSelected ? 'text-[#050707]' : 'text-[#0e1111] group-hover:text-[#3c4747]'}`}>
                                                                                                    {advisor.name}
                                                                                                </h4>
                                                                                                {/* Wraps instead of truncating: "Consultant Psychologist" is cut in every card otherwise */}
                                                                                                <p className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-snug text-[#7c8785]">
                                                                                                    {advisor.role || 'Consultant Psychologist'}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        {advisor.bio && (
                                                                                            <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-[#55605f]">
                                                                                                {advisor.bio}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* One chip + counter: two long chips got cut mid-word. */}
                                                                                        {advisor.specialties?.length > 0 && (
                                                                                            <div className="mt-2 flex items-center gap-1 overflow-hidden">
                                                                                                <span title={advisor.specialties[0]} className="min-w-0 truncate rounded-md border border-[#e6dfd0] bg-[#f6f1e6] px-2 py-0.5 text-[10px] font-semibold text-[#55605f]">
                                                                                                    {advisor.specialties[0]}
                                                                                                </span>
                                                                                                {advisor.specialties.length > 1 && (
                                                                                                    <span title={advisor.specialties.slice(1).join(', ')} className="shrink-0 rounded-md border border-[#e6dfd0] bg-[#f6f1e6] px-2 py-0.5 text-[10px] font-semibold text-[#55605f]">
                                                                                                        +{advisor.specialties.length - 1}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Availability reads as a chip so every card keeps the same rhythm */}
                                                                                        {isAvailable ? (
                                                                                            <span className="mt-2 inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-[10.5px] font-bold text-emerald-700">
                                                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                                                                <span className="truncate">{info.label}</span>
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="mt-2 inline-flex w-fit max-w-full items-center gap-1.5 rounded-md border border-rose-200/80 bg-rose-50 px-2 py-1 text-[10.5px] font-semibold text-rose-600">
                                                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                                                                                No upcoming slots
                                                                                            </span>
                                                                                        )}

                                                                                        <div className="flex items-center justify-between gap-2 shrink-0 border-t border-[#f1eadc] pt-3 mt-auto">
                                                                                            <div className="min-w-0 text-left">
                                                                                                <span className="font-extrabold text-xl text-[#0e1111] block leading-none tabular-nums">
                                                                                                    ₹{bookingDuration === 30 ? advisor.halfSessionPrice : advisor.price}
                                                                                                </span>
                                                                                                <span className="text-[9.5px] font-bold text-[#7c8785] uppercase tracking-wider mt-1 block">
                                                                                                    {bookingDuration === 30 ? '30 Mins Plan' : '1 Hour Plan'}
                                                                                                </span>
                                                                                            </div>

                                                                                            {isSelected ? (
                                                                                                <div className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#0e7490] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all">
                                                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                    <span>Selected</span>
                                                                                                </div>
                                                                                            ) : isAvailable ? (
                                                                                                <div className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#0e1111] px-3 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all group-hover:bg-[#0e7490]">
                                                                                                    <span>Select</span>
                                                                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <span className="shrink-0 whitespace-nowrap rounded-md bg-[#f1eadc] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#7c8785]">
                                                                                                    Unavailable
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        </div>

                                                                        {totalPages > 1 && (
                                                                            <div className="flex items-center justify-center gap-2 pt-3">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setAdvisorPage(p => Math.max(1, p - 1));
                                                                                    }}
                                                                                    disabled={advisorPage === 1}
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-[#e6dfd0] bg-white hover:bg-[#f6f1e6] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                                                                >
                                                                                    ‹
                                                                                </button>
                                                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                                                                    <button
                                                                                        key={num}
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setAdvisorPage(num);
                                                                                        }}
                                                                                        className={`w-8 h-8 rounded-full text-xs font-bold border flex items-center justify-center cursor-pointer ${advisorPage === num
                                                                                                ? 'bg-[#0e1111] text-white border-[#0e1111] shadow-xs'
                                                                                                : 'bg-white text-[#0e1111] border-[#e6dfd0] hover:border-[#0e7490]'
                                                                                            }`}
                                                                                    >
                                                                                        {num}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setAdvisorPage(p => Math.min(totalPages, p + 1));
                                                                                    }}
                                                                                    disabled={advisorPage === totalPages}
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-[#e6dfd0] bg-white hover:bg-[#f6f1e6] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                                                                >
                                                                                    ›
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </React.Fragment>
                                                                );
                                                            })()}
                                                        </div>

                                                        {errors.advisor && <p className="text-xs text-rose-500 font-medium">{errors.advisor}</p>}

                                                        <div className="pt-6 border-t border-[#f1eadc] flex justify-end">
                                                            <button type="button" onClick={() => setWizardStep(2)} disabled={!selectedAdvisor} className="w-full sm:w-auto px-6 py-2.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white font-bold text-xs sm:text-sm rounded-lg shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)] flex items-center justify-center gap-2 cursor-pointer border border-[#0e7490] transition-all btn-booking-primary disabled:opacity-50">Continue to Service Plan <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 3 & 4 — SCHEDULE THE SESSION & TIME SLOT */}
                                                {wizardStep === 3 && (
                                                    <div ref={step3TimeRef} className="space-y-4 animate-step-in">
                                                        <TimePicker
                                                            selectedDate={selectedDate}
                                                            selectedTime={selectedTime}
                                                            bookingDuration={bookingDuration}
                                                            onDateChange={(d) => handleDateChange(d)}
                                                            onTimeChange={(t) => {
                                                                setSelectedTime(t);
                                                                if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                                                                scrollToTarget(step3NextBtnRef, 40);
                                                            }}
                                                            availableSlots={getAdvisorSlotsForDate(selectedAdvisor, selectedDate)}
                                                            bookedSlots={getAdvisorBookedSlotsForDate(selectedAdvisor, selectedDate)}
                                                            selectedAdvisor={selectedAdvisor}
                                                            getAdvisorSlotsForDate={getAdvisorSlotsForDate}
                                                            getAdvisorEarliestAvailableDate={getAdvisorEarliestAvailableDate}
                                                            errors={errors}
                                                        />

                                                        <div ref={step3NextBtnRef} className={`pt-6 border-t border-[#f1eadc] justify-between items-center gap-3 ${rescheduleSession ? 'hidden' : 'flex'}`}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWizardStep(2)}
                                                                className="px-5 py-2.5 bg-[#f1eadc] hover:bg-[#e6dfd0] text-[#3c4747] font-bold text-xs sm:text-sm rounded-lg transition cursor-pointer border border-[#e6dfd0]"
                                                            >
                                                                Back
                                                            </button>
                                                            <button type="button" onClick={() => setWizardStep(4)} disabled={!selectedTime} className="w-full sm:w-auto px-6 py-2.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white font-bold text-xs sm:text-sm rounded-lg shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)] flex items-center justify-center gap-2 cursor-pointer border border-[#0e7490] transition-all btn-booking-primary disabled:opacity-50">Continue to Summary <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 4 — COMPACT BOOKING SUMMARY & PROCEED TO PAYMENT */}
                                                {wizardStep === 4 && (
                                                    <div ref={stepSummaryRef} className="p-5 sm:p-6 bg-white rounded-lg shadow-xs border border-[#e6dfd0] space-y-4 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-[#f1eadc] pb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-[#0e7490] animate-pulse" />
                                                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#0e1111]">
                                                                    Booking Summary Review
                                                                </h4>
                                                            </div>
                                                            <span className="text-xl font-extrabold text-[#0e1111]">
                                                                {netTotal === null ? 'Price not configured' : `₹${netTotal}`}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-1">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#7c8785] block">Psychologist</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#0e1111] text-sm truncate">{selectedAdvisor?.name}</span>
                                                                    {!isAdvisorLocked && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectedAdvisor(null); setSelectedTime(''); setHasAutoAdvanced(false); setWizardStep(1); }}
                                                                            className="text-[11px] text-[#0b5c73] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Change
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#7c8785] block">Service & Mode</span>
                                                                <span className="font-bold text-[#0e1111] text-sm block">
                                                                    {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} • {bookingMode === 'ONLINE' ? 'Online Video Call' : bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : 'In-Center'}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#7c8785] block">Session Plan</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#0e1111] text-sm">
                                                                        {bookingDuration === 30 ? 'Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                                    </span>
                                                                    {isIntroductoryEligible && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setBookingDuration(bookingDuration === 30 ? 60 : 30)}
                                                                            className="text-[11px] text-[#0b5c73] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Switch
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#7c8785] block">Date & Time</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#0e1111] text-sm">
                                                                        {formatDateString(selectedDate)} at {selectedTime}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="text-[11px] text-[#0b5c73] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!rescheduleSession && (
                                                            <div className="pt-3 border-t border-[#f1eadc] flex flex-col sm:flex-row items-center justify-between gap-4">
                                                                <div className="text-left w-full sm:w-auto">
                                                                    <span className="text-[11px] text-[#7c8785] block font-medium">Total Amount Payable</span>
                                                                    <span className="text-2xl font-extrabold text-[#0e1111]">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                                </div>

                                                                <div className="flex gap-2.5 w-full sm:w-auto mt-4 sm:mt-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="px-5 py-2.5 bg-[#f1eadc] hover:bg-[#e6dfd0] text-[#3c4747] font-bold text-xs sm:text-sm rounded-lg transition flex items-center justify-center cursor-pointer border border-[#e6dfd0]"
                                                                    >
                                                                        Back
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={!selectedAdvisor || !selectedDate || !selectedTime || baseFee === null}
                                                                        onClick={() => handleStepChange('payment')}
                                                                        className="w-full sm:w-auto flex-1 px-6 py-2.5 bg-[#0e7490] hover:bg-[#0b5c73] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-[0_12px_26px_-14px_rgba(14,116,144,0.75)] flex items-center justify-center gap-2 cursor-pointer border border-[#0e7490] btn-booking-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <span>{netTotal === null ? 'Price not configured' : `Proceed to Payment (₹${netTotal})`}</span>
                                                                        <ArrowRight className="w-4 h-4 stroke-[3] text-white" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {rescheduleSession && wizardStep >= 3 && (
                                                    <div className="flex items-center justify-end pt-4">
                                                        <button
                                                            type="button"
                                                            disabled={!selectedDate || !selectedTime || isSubmitting}
                                                            onClick={handleRescheduleConfirm}
                                                            className="px-6 py-3 bg-[#0e7490] text-white font-bold text-sm rounded-lg transition hover:bg-[#0b5c73] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-[0_10px_24px_-14px_rgba(14,116,144,0.7)] w-full sm:w-auto"
                                                        >
                                                            {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* STEP 2: Account & Payment */}
                                        {bookingStep === 'payment' && (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="border-b border-[#e6dfd0] pb-3 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-[#0e1111] flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-md bg-[#0e7490] text-white text-xs flex items-center justify-center shrink-0 font-medium shadow-xs">5</span>
                                                            Payment & Confirm
                                                        </h3>
                                                        <p className="text-sm font-normal text-[#55605f] mt-1">
                                                            {user ? 'Review your details and complete payment.' : 'Please enter your details to receive session link & confirmation.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="card-app-soft p-5 sm:p-6 space-y-5 text-left">
                                                    <div className="bg-[#0e1111] text-white rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7fd3e3] block mb-1">
                                                                {bookingDuration === 30 ? '✨ Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                            </span>
                                                            <span className="text-sm font-semibold text-[#e6dfd0]">
                                                                {selectedAdvisor?.name} • {formatDateString(selectedDate)} at {selectedTime}
                                                            </span>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="text-2xl font-serif font-bold text-white block">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                            <span className="text-[11px] text-[#e6dfd0]/70 block font-normal">Total Payable</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-[#e6dfd0] pb-3">
                                                        <h4 className="text-xs font-bold text-[#0e1111] uppercase tracking-wider">
                                                            Client & Booking Contact Details
                                                        </h4>
                                                        {user && (
                                                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-xs">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-semibold text-[#0e1111] block">
                                                                Full Name <span className="text-rose-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={bookingForm.name || ''}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                                                }}
                                                                placeholder="e.g. Rahul Sharma"
                                                                className={`w-full px-4 py-2.5 border rounded-md text-sm font-medium text-[#0e1111] outline-none transition ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-[#e6dfd0] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10 bg-white'}`}
                                                            />
                                                            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-semibold text-[#0e1111] block">
                                                                Email Address <span className="text-rose-500">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                value={bookingForm.email || ''}
                                                                onChange={(e) => {
                                                                    handleInputChange(e);
                                                                    if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                                                                }}
                                                                placeholder="you@example.com"
                                                                className={`w-full px-4 py-2.5 border rounded-md text-sm font-medium text-[#0e1111] outline-none transition ${errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-[#e6dfd0] focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/10 bg-white'}`}
                                                            />
                                                            {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                                    <div className="p-4 bg-[#f6f1e6] border border-[#e6dfd0] rounded-xl space-y-2">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="w-10 h-10 bg-white border border-[#e6dfd0] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                                                                <Lock className="w-5 h-5 text-[#0e1111]" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-[#0e1111]">Secure Payment Gateway</h5>
                                                                <p className="text-xs text-[#7c8785] font-medium">
                                                                    100% encrypted Razorpay gateway supporting UPI, Google Pay, PhonePe, Cards, Netbanking, and Wallets.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-[#f6f1e6] via-white to-[#f6f1e6]/80 border border-[#e6dfd0]/90 rounded-xl text-left space-y-4 shadow-xs">
                                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e6dfd0]/80">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center text-[#0b5c73]">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-bold text-[#0e1111] leading-tight">Informed Client Consent & Agreement</h5>
                                                                    <p className="text-[11px] text-[#55605f] font-medium mt-0.5">Please review the professional care disclosures before confirming</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f7f2e7] text-[#0c6b83] border border-[#bfe3ec]/60 px-2 py-0.5 rounded-md">
                                                                Required
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#e6dfd0]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0e7490] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#0e1111] block text-[11px]">Strict Confidentiality</span>
                                                                    <span className="text-[10.5px] text-[#55605f]">Session notes & discussions protected under clinical ethics.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#e6dfd0]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0e7490] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#0e1111] block text-[11px]">Voluntary Care</span>
                                                                    <span className="text-[10.5px] text-[#55605f]">Collaborative process with freedom to ask questions anytime.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#e6dfd0]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0e7490] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#0e1111] block text-[11px]">24-Hour Full Refund</span>
                                                                    <span className="text-[10.5px] text-[#55605f]">100% refund for cancellations made 24+ hours in advance.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#e6dfd0]/70">
                                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#0e1111] block text-[11px]">Crisis Disclaimer</span>
                                                                    <span className="text-[10.5px] text-[#55605f]">Scheduled consultations; not a 24/7 suicide crisis line.</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3 pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (onOpenDocs) {
                                                                        onOpenDocs('consent');
                                                                    } else {
                                                                        setShowConsentModal(true);
                                                                    }
                                                                }}
                                                                className="text-xs font-bold text-[#0b5c73] hover:text-[#0c6b83] underline flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Read Full Informed Consent Document</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-start gap-3 pt-3 border-t border-[#e6dfd0] bg-[#fbf8f1] p-3.5 rounded-md">
                                                            <input
                                                                type="checkbox"
                                                                id="booking-consent-checkbox"
                                                                checked={termsAgreed}
                                                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                                                className="w-4 h-4 mt-0.5 rounded border-[#e6dfd0] text-[#0e7490] focus:ring-[#0e7490] accent-[#0e7490] cursor-pointer shrink-0"
                                                            />
                                                            <label htmlFor="booking-consent-checkbox" className="text-xs text-[#55605f] font-normal leading-relaxed cursor-pointer select-none">
                                                                I confirm that I have read, understood, and voluntarily agree to the{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs ? onOpenDocs('consent') : setShowConsentModal(true)}
                                                                    className="font-semibold text-[#0e7490] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Informed Consent Agreement
                                                                </button>
                                                                ,{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('terms')}
                                                                    className="font-semibold text-[#0e7490] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Platform Terms
                                                                </button>
                                                                , and{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('refund')}
                                                                    className="font-semibold text-[#0e7490] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Return & Refund Policy
                                                                </button>
                                                                .
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e6dfd0] mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepChange('config')}
                                                            className="inline-flex items-center justify-center gap-1.5 text-xs text-[#55605f] hover:text-[#0e1111] font-semibold py-2.5 px-3 transition-colors cursor-pointer bg-transparent border-none order-2 sm:order-1"
                                                        >
                                                            <ArrowLeft className="w-3.5 h-3.5" />
                                                            <span>Back to Schedule</span>
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={isProcessingPayment || !termsAgreed}
                                                            title={!termsAgreed ? "Please check the agreement box to proceed" : ""}
                                                            className={`px-8 py-4 min-h-[48px] font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 border-none w-full sm:w-auto order-1 sm:order-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2 ${!termsAgreed || isProcessingPayment
                                                                ? 'bg-[#e6dfd0] text-[#55605f]/60 cursor-not-allowed opacity-60 shadow-none'
                                                                : 'bg-[#0e7490] hover:bg-[#0b5c73] text-white cursor-pointer active:scale-[0.98] shadow-[0_14px_30px_-14px_rgba(14,116,144,0.75)]'
                                                                }`}
                                                        >
                                                            {isProcessingPayment ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    <span>Processing Payment...</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <Lock className="w-4 h-4" />
                                                                    <span>{netTotal === null ? 'Price not configured' : `Pay & Confirm (₹${netTotal})`}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Dynamic Booking Sidebar Summary */}
                                    <div className="lg:sticky lg:top-20 text-left">
                                        <button
                                            type="button"
                                            onClick={() => setShowSummary(!showSummary)}
                                            className="flex lg:hidden items-center justify-between w-full bg-[#f6f1e6] border border-[#e6dfd0] p-3 rounded-xl text-left shadow-none mb-3 hover:bg-[#f1eadc] transition cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold text-[#0e1111] flex items-center gap-2">
                                                <span>Booking Summary</span>
                                                {selectedAdvisor && (
                                                    <span className="text-xs bg-[#0e7490] text-white px-2 py-0.5 rounded-xl font-semibold">
                                                        {bookingService === 'counselling' ? 'Counselling' : 'Career'}
                                                    </span>
                                                )}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-[#9aa29f] transition-transform duration-200 ${showSummary ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <div className={`space-y-5 ${showSummary ? 'block' : 'hidden'} lg:block bg-white/80 backdrop-blur-md border border-[#e6dfd0] shadow-xs rounded-xl p-5 sm:p-6 mb-6`}>
                                            <div>
                                                <h3 className="text-base font-semibold text-[#0e1111] border-b border-[#e6dfd0] pb-3 hidden lg:block">
                                                    Booking Summary
                                                </h3>
                                            </div>

                                            <div className="space-y-5 text-sm font-semibold">
                                                <div>
                                                    <span className="text-xs text-[#9aa29f] block font-semibold mb-0.5">Service & Mode</span>
                                                    <span className="font-semibold text-[#0e1111] block text-left">
                                                        {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                                                    </span>
                                                    <span className="text-xs text-[#7c8785] font-semibold block mt-0.5 bg-white border border-[#e6dfd0] rounded-xl px-2 py-0.5 w-fit">
                                                        {bookingMode === 'DOOR_STEP' ? 'Door Step' : bookingMode.charAt(0).toUpperCase() + bookingMode.slice(1).toLowerCase()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#9aa29f] block font-semibold mb-0.5">Session Plan</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-[#0e1111] block text-left">
                                                            {bookingDuration === 30 ? 'Introductory Session' : 'Standard Session'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bookingDuration === 30 ? 'bg-[#edf5f7] text-[#0b5c73] border border-[#c7e9f0]' : 'bg-[#f1eadc] text-[#3c4747] border border-[#e6dfd0]'}`}>
                                                            {bookingDuration === 30 ? '30 Mins' : '1 Hour'}
                                                        </span>
                                                    </div>
                                                    {bookingDuration === 30 && (
                                                        <span className="text-[11px] text-[#0b5c73] font-semibold mt-0.5 block">
                                                            {baseFee === null ? 'Price not configured' : `Session fee • ₹${baseFee}`}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#9aa29f] block font-semibold mb-0.5">Date & Time</span>
                                                    {selectedDate && selectedTime ? (
                                                        <div className="space-y-1 bg-white border border-[#e6dfd0] p-2 rounded-xl text-left">
                                                            <span className="font-semibold text-[#0e1111] block">
                                                                {formatDateString(selectedDate)}
                                                            </span>
                                                            <span className="text-xs text-[#7c8785] block font-semibold">
                                                                {selectedTime}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#9aa29f] italic font-semibold text-xs block text-left">Not configured yet</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#9aa29f] block font-semibold mb-0.5">Psychologist</span>
                                                    {selectedAdvisor ? (
                                                        <div className="bg-white border border-[#e6dfd0] p-2.5 rounded-xl text-left">
                                                            <span className="font-semibold text-[#0e1111] block text-xs">{selectedAdvisor.name}</span>
                                                            <span className="text-xs text-[#7c8785] block font-semibold">{selectedAdvisor.role}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#9aa29f] italic font-semibold text-xs block text-left">No psychologist selected</span>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-[#e6dfd0] space-y-2 text-left">
                                                    <span className="text-xs text-[#7c8785] block font-semibold">Have a Promo Code?</span>
                                                    <div className="flex items-stretch rounded-xl border border-[#e6dfd0] bg-white overflow-hidden focus-within:border-[#0e1111] focus-within:ring-1 focus-within:ring-[#0e1111] transition-all">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. BEHOLD100"
                                                            value={couponInput}
                                                            onChange={(e) => setCouponInput(e.target.value)}
                                                            disabled={appliedDiscount > 0}
                                                            className="flex-1 px-4 py-2.5 text-sm font-semibold outline-none bg-transparent min-w-0"
                                                        />
                                                        {appliedDiscount > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveCoupon}
                                                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer flex-shrink-0 border-l border-[#e6dfd0]"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyCoupon}
                                                                className="px-5 py-2.5 bg-[#0e1111] hover:bg-[#0e7490] text-white text-xs font-bold transition cursor-pointer border-none flex-shrink-0"
                                                            >
                                                                Apply
                                                            </button>
                                                        )}
                                                    </div>
                                                    {couponMsg.text && (
                                                        <p className={`text-sm font-semibold ${couponMsg.type === 'success' ? 'text-[#0e1111]' : 'text-rose-500'}`}>
                                                            {couponMsg.text}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-[#e6dfd0] space-y-2">
                                                    <span className="text-xs text-[#9aa29f] block font-semibold text-left">Pricing Breakdown</span>

                                                    <div className="space-y-1.5 text-xs font-semibold text-[#7c8785]">
                                                        <div className="flex justify-between">
                                                            <span>Session Fee ({bookingDuration === 30 ? 'Introductory' : 'Standard'})</span>
                                                            <span className="text-[#0e1111] font-semibold">{baseFee === null ? 'Price not configured' : `₹${baseFee}`}</span>
                                                        </div>

                                                        {gstEnabled && (
                                                            <div className="flex justify-between">
                                                                <span>GST ({gstPercent}%)</span>
                                                                <span className="text-[#0e1111] font-semibold">₹{gstAmount}</span>
                                                            </div>
                                                        )}

                                                        {appliedDiscount > 0 && (
                                                            <div className="flex justify-between text-[#0e1111] font-semibold">
                                                                <span>Promo Discount</span>
                                                                <span>-₹{appliedDiscount}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between text-sm font-semibold text-[#0e1111] border-t border-[#e6dfd0] pt-2 mt-1">
                                                            <span>Net Total</span>
                                                            <span className="text-[#0e1111]">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-[#e6dfd0] text-sm font-semibold text-[#9aa29f] text-center w-full">
                                                    <span>SSL Secure Checkout</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
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

                {showNoCounsellorsModal && typeof document !== 'undefined' && createPortal(
                    <div className="bh-booking-alert-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bh-booking-alert bg-white border border-[#e6dfd0] rounded-xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center animate-in zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-labelledby="booking-clear-title">
                            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm text-xl font-semibold">
                                !
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-[#0e1111] tracking-wide">
                                    No Counsellors Found
                                </h3>
                                <p className="text-xs text-[#7c8785] leading-relaxed font-sans font-light">
                                    There are no counsellors available matching your selected service type or mode. Please adjust your session preferences and try again.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNoCounsellorsModal(false)}
                                className="w-full py-2.5 bg-[#0e1111] hover:bg-[#0e7490] text-white font-semibold text-xs rounded-xl cursor-pointer transition border-none shadow-none"
                            >
                                OK
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                {showClearBookingConfirm && typeof document !== 'undefined' && createPortal(
                    <div className="bh-booking-alert-overlay fixed inset-0 z-[205] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bh-booking-alert bg-white border border-[#e6dfd0] rounded-xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                                <Trash2 size={20} aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                                <h3 id="booking-clear-title" className="text-lg font-semibold text-[#0e1111]">Start booking again?</h3>
                                <p className="text-xs text-[#55605f] leading-relaxed">Your selected service, expert, date and time will be cleared. You can choose them again in the next step.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setShowClearBookingConfirm(false)} className="bh-booking-alert-cancel w-full py-2.5 border border-[#e6dfd0] bg-white text-[#3c4747] font-semibold text-xs rounded-xl cursor-pointer transition">
                                    Keep booking
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetBookingState();
                                        setWizardStep(1);
                                        setShowClearBookingConfirm(false);
                                    }}
                                    className="bh-booking-alert-confirm w-full py-2.5 bg-[#0e1111] text-white font-semibold text-xs rounded-xl cursor-pointer transition border-none"
                                >
                                    Clear &amp; restart
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {showConsentModal && typeof document !== 'undefined' && createPortal(
                    <div className="bh-consent-overlay fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bh-consent-dialog bg-white border border-[#e6dfd0] rounded-md w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                            <div className="px-6 py-4 border-b border-[#e6dfd0] flex justify-between items-center bg-[#f6f1e6]/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center text-[#0b5c73]">
                                        <ShieldCheck className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#0e1111] leading-tight">Informed Consent Agreement</h3>
                                        <p className="text-[11px] text-[#55605f] font-medium">Professional Psychological Counselling & Mentorship</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConsentModal(false)}
                                    className="p-1 text-[#7c8785] hover:text-[#3c4747] rounded-md hover:bg-[#f1eadc] transition-colors cursor-pointer border-none bg-transparent"
                                    title="Close modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 p-6 overflow-y-auto overscroll-contain text-[#3c4747] text-xs font-medium leading-relaxed space-y-4 custom-scrollbar">
                                <div className="p-3 bg-[#f7f2e7] border border-[#bfe3ec]/60 rounded-md text-[#0e1111] text-[11px] leading-relaxed">
                                    <span className="font-bold block mb-1">Notice to Client / Guardian:</span>
                                    This informed consent document details your rights, ethical standards, confidentiality guidelines, and expectations regarding psychological consultations and mentorship at BEHOLD.
                                </div>

                                {(() => {
                                    let activeConsent = '';
                                    try {
                                        const raw = localStorage.getItem('behold_site_settings');
                                        if (raw) {
                                            const parsed = JSON.parse(raw);
                                            if (parsed && parsed.consentPolicy && parsed.consentPolicy.trim().length > 0) {
                                                activeConsent = parsed.consentPolicy;
                                            }
                                        }
                                    } catch (e) { }

                                    if (activeConsent) {
                                        return (
                                            <div className="text-[#3c4747] text-xs font-medium leading-relaxed whitespace-pre-wrap font-sans">
                                                {activeConsent}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 text-[#3c4747]">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">1. Nature of Services & Voluntary Participation</h4>
                                                <p>Psychological counselling and career mentorship are collaborative, goal-directed processes designed to enhance personal wellbeing and decision-making. Participation is voluntary, and you have the right to ask questions or discuss your session goals at any time.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">2. Confidentiality & Ethical Safeguards</h4>
                                                <p>All discussions, case notes, and personal information are strictly confidential and protected in accordance with professional clinical ethics. Information may only be disclosed without prior consent if mandated by law—namely, if there is clear, imminent danger of harm to yourself or others, suspected child or vulnerable adult abuse, or by formal court order.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">3. Tele-Consultation & Privacy Guidelines</h4>
                                                <p>For online video consultations, sessions are conducted through secure, end-to-end encrypted video channels. Please ensure you are in a private, quiet room with minimal distractions. Unauthorized audio or video recording of sessions by either party is strictly prohibited without explicit mutual written consent.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">4. Emergency & Crisis Notice</h4>
                                                <p>Behold provides scheduled appointment consultations and is not an emergency crisis or suicide intervention service. If you are experiencing an acute life-threatening emergency, please immediately reach out to national emergency services (112), KIRAN Helpline (1800-599-0019), or Tele-MANAS (14416).</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">5. Cancellation, Rescheduling & Refund Policy</h4>
                                                <p>Appointments can be cancelled up to 24 hours prior to scheduled start time for a 100% full refund. Rescheduling is available free of charge up to 12 hours before your appointment. Late cancellations or no-shows are non-refundable.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#0e1111]">6. Minor / Guardian Consent</h4>
                                                <p>For clients under 18 years of age, parent or legal guardian acknowledgment and consent is affirmed upon booking.</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="px-6 py-4 border-t border-[#e6dfd0] flex items-center justify-between gap-3 bg-[#f6f1e6]">
                                <button
                                    type="button"
                                    onClick={() => setShowConsentModal(false)}
                                    className="px-4 py-2.5 bg-white hover:bg-[#f1eadc] text-[#3c4747] font-semibold text-xs rounded-md cursor-pointer transition border border-[#d5cdbb] shadow-xs"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTermsAgreed(true);
                                        setShowConsentModal(false);
                                        toast.success('Informed Consent acknowledged and agreed.');
                                    }}
                                    className="px-6 py-3 bg-[#0e1111] hover:bg-[#0e7490] text-white font-medium text-xs rounded-md cursor-pointer transition border-none shadow-md flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>I Agree & Accept</span>
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            </div>
        </div>
    );
} 
