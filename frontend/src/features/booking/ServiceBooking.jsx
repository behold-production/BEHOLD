import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useBookingViewModel } from './useBookingViewModel';

import TimePicker from './TimePicker';
import BookingAuthModal from './BookingAuthModal';
import { FileDown, X, ArrowLeft, ArrowRight, Lock, ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ExternalLink, Calendar as CalendarIcon, Trash2, Video as VideoIcon } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
import { createGoogleCalendarUrl } from '../../utils/calendarUtils';
import { buildGoogleMeetUrl } from '../student/utils/utils';
import toast from 'react-hot-toast';
import { ScrollDot } from '../../components/common/BrandDot';
import SEO from '../../components/common/SEO';

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

    // Reset or jump to the correct step when the modal opens
    useEffect(() => {
        if (isOpen) {
            setWizardStep(preselectedAdvisorId ? 2 : 1);
        }
    }, [isOpen, preselectedAdvisorId]);

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

        document.body.style.overflow = 'hidden';

        const stateId = `booking_modal_${Date.now()}`;
        window.history.pushState({ modalState: stateId }, '');

        const handlePopState = () => {
            handleModalBack();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, handleModalBack]);

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div
                    className="relative w-full max-w-md max-h-screen sm:max-h-[90vh] bg-white sm:rounded-md shadow-2xl overflow-y-auto flex flex-col items-center justify-center text-center px-4 py-16 select-none"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#f4eee6] hover:bg-[#ede7de] rounded-md flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                        <X className="w-5 h-5 text-[#5c6b66]" />
                    </button>
                    <div className="max-w-md w-full bg-white border border-[#ede7de] p-8 rounded-md shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-[#f4eee6] border border-[#ede7de] rounded-md flex items-center justify-center mx-auto text-[#1c2826] shadow-sm">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm bg-[#1c2826] text-white px-3 py-1 rounded-md font-semibold w-fit mx-auto block">
                                System Notice
                            </span>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1c2826]">
                                Bookings Paused
                            </h2>
                            <p className="text-xs sm:text-sm text-[#5c6b66] leading-relaxed font-semibold">
                                We are currently performing scheduled maintenance. Booking new sessions is temporarily offline.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#ede7de] flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-[#1c2826] hover:bg-[#b85438] text-white text-sm font-semibold rounded-md transition-all cursor-pointer shadow-none w-full sm:w-auto text-center border-none"
                            >
                                Home Page
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/sample-test');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-white border border-[#ede7de] hover:bg-[#faf6ee] text-[#1c2826] text-sm font-semibold rounded-md transition-all cursor-pointer w-full sm:w-auto text-center"
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
            <div id="booking-modal-scroll" ref={scrollContainerRef} className={`bh-booking-dialog relative w-full max-w-lg md:max-w-xl lg:max-w-2xl h-[92vh] sm:h-[90vh] bg-[#fbf9f5] rounded-t-lg sm:rounded-lg border border-[#ede7de] shadow-2xl overflow-y-auto overflow-x-hidden text-[#1c2826] text-left overscroll-contain animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 transition-all duration-300 flex flex-col scroll-smooth-momentum gpu-layer pb-[env(safe-area-inset-bottom,16px)]`}>

                {/* Mobile Drag Handle */}
                <div className="w-12 h-1 bg-[#ede7de] rounded-xs mx-auto mt-2.5 sm:hidden shrink-0" />

                {/* Secure Payment & Booking Verification Overlay */}
                {isProcessingPayment && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1c2826]/90 backdrop-blur-md text-white px-6 text-center animate-in fade-in duration-200">
                        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-[#b85438]/20 border-t-[#b85438] animate-spin" />
                            <Lock className="w-6 h-6 text-[#b85438]" />
                        </div>
                        <h3 className="text-xl font-bold font-serif text-white mb-1">Verifying &amp; Confirming Session</h3>
                        <p className="text-xs text-[#ede7de] max-w-xs text-center font-medium leading-relaxed">
                            {paymentStepText || 'Securing your appointment and reserving your session room...'}
                        </p>
                    </div>
                )}

                {/* Mobile App Style Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#fbf9f5] border-b border-[#ede7de] shrink-0">
                    <button
                        type="button"
                        onClick={handleModalBack}
                        className="w-10 h-10 -ml-2 flex items-center justify-center text-[#1c2826] hover:text-[#b85438] transition-colors cursor-pointer border-none bg-transparent"
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
                                            isActive ? 'w-3 h-3 bg-[#b85438] dot-active ring-4 ring-[#b85438]/20' :
                                            isDone   ? 'w-2 h-2 bg-[#b85438]/60' :
                                                       'w-2 h-2 bg-[#ede7de]'
                                        }`} />
                                        {step < 5 && (
                                            <div className={`h-[2px] transition-all duration-500 ${isDone ? 'w-4 bg-[#b85438]/40' : 'w-4 bg-[#ede7de]'}`} />
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
                            className="w-10 h-10 -mr-2 flex items-center justify-center text-[#8a938f] hover:text-[#1c2826] transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="bh-booking-content min-h-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#fbf9f5]">
                    <div className="space-y-8 sm:space-y-10">

                        {/* BOOKING FORM */}
                        <div id="booking-console" className="w-full">

                            {bookingStep === 'success' ? (
                                /* STEP 5: Success & Confirmation View - Centered & Perfectly Balanced */
                                <div className="p-6 sm:p-10 bg-white border border-[#ede7de] rounded-md max-w-xl mx-auto shadow-md space-y-6 text-center animate-step-in relative overflow-hidden">

                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#b85438]/10 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative w-16 h-16 bg-[#b85438]/10 border border-[#b85438]/30 rounded-md flex items-center justify-center mx-auto text-[#b85438] shadow-sm animate-checkmark-circle-pop z-10">
                                        <svg className="w-8 h-8 text-[#b85438]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path className="animate-checkmark-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <div className="space-y-2 animate-success-content relative z-10 text-center flex flex-col items-center justify-center">
                                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-sm font-semibold w-fit mx-auto block shadow-xs">
                                            {rescheduleSession ? 'Reschedule Requested' : 'Session Confirmed & Paid'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c2826] tracking-tight mt-2">
                                            {rescheduleSession ? 'Reschedule Requested' : "Booking Confirmed!"}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-[#5c6b66] max-w-md mx-auto leading-relaxed font-normal mt-1">
                                            {rescheduleSession ? (
                                                <>
                                                    Your reschedule request {bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>for <strong className="font-semibold text-[#1c2826]">{bookingForm.name}</strong> </> : ''}has been submitted to <strong className="font-semibold text-[#1c2826]">{selectedAdvisor?.name}</strong>.
                                                </>
                                            ) : (
                                                <>
                                                    Thank you{bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>, <strong className="font-semibold text-[#1c2826]">{bookingForm.name}</strong></> : ''}! Your payment is verified and your session is successfully booked.
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Invoice & Meeting Card */}
                                    <div className="bg-[#faf6ee]/80 border border-[#ede7de]/80 rounded-xl p-5 sm:p-6 text-left space-y-4 shadow-xs animate-success-content relative z-10" style={{animationDelay: '0.75s'}}>
                                        <div className="flex items-center justify-between border-b border-[#ede7de]/80 pb-3 mb-2">
                                            <span className="text-xs font-semibold text-[#5c6b66]">
                                                {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation Summary'}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                                                ✓ Paid
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <span className="text-[#5c6b66] block font-medium text-[11px]">Psychologist</span>
                                                <span className="font-semibold text-[#1c2826] text-sm block">{selectedAdvisor?.name || 'Assigned Advisor'}</span>
                                                <span className="text-[#5c6b66] block font-normal text-xs">{selectedAdvisor?.role || 'Consultant Psychologist'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#5c6b66] block font-medium text-[11px]">Service & Mode</span>
                                                <span className="font-semibold text-[#1c2826] text-sm block">
                                                    {confirmedBooking?.service ? (confirmedBooking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring') : (bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring')}
                                                </span>
                                                <span className="text-[#5c6b66] block font-normal text-xs">{confirmedBooking?.mode === 'ONLINE' ? 'Video Call' : confirmedBooking?.mode === 'DOOR_STEP' ? 'Home Visit' : confirmedBooking?.mode === 'OFFLINE' ? 'At Center' : bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#5c6b66] block font-medium text-[11px]">Date & Schedule</span>
                                                <span className="font-semibold text-[#1c2826] text-sm block">
                                                    {formatDateString(confirmedBooking?.date || selectedDate)}
                                                </span>
                                                <span className="text-[#5c6b66] block font-normal text-xs">
                                                    {confirmedBooking?.time || selectedTime} • {confirmedBooking?.duration || (bookingDuration === 30 ? '30 Mins (Introductory Session)' : '1 Hour (Standard Session)')}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[#5c6b66] block font-medium text-[11px]">Amount Paid</span>
                                                <span className="font-semibold text-[#1c2826] text-sm block">
                                                    ₹{confirmedBooking?.amountPaid || netTotal}
                                                </span>
                                                <span className="text-[#5c6b66] block font-normal text-xs">SSL Secure Payment</span>
                                            </div>
                                        </div>

                                        {bookingMode === 'ONLINE' && !rescheduleSession && (
                                            <div className="pt-4 border-t border-[#ede7de]/80 mt-3">
                                                {(() => {
                                                    const canonicalId = confirmedBooking?.appointmentId || confirmedBooking?.id || 'Session';
                                                    const resolvedMeetLink = (confirmedBooking?.meetLink && !confirmedBooking.meetLink.includes('meet.jit.si'))
                                                        || (confirmedMeetLink && !confirmedMeetLink.includes('meet.jit.si'))
                                                        || buildGoogleMeetUrl(canonicalId);
                                                    return (
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#ede7de] shadow-xs">
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[11px] font-semibold text-[#5c6b66] block mb-0.5">
                                                                    Google Meet Video Consultation Room
                                                                </span>
                                                                <span className="text-xs text-[#1c2826] font-semibold truncate block font-mono">
                                                                    {resolvedMeetLink}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <a
                                                                    href={resolvedMeetLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3.5 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-xs no-underline"
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
                                                                    className="px-3 py-2 bg-[#f4eee6] hover:bg-[#ede7de] text-[#4c5b55] text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center border border-[#ede7de] shadow-xs whitespace-nowrap"
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
                                                className="w-full sm:w-auto px-6 py-3 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-sm"
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
                                                            className="w-full sm:w-auto px-6 py-3 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-2 shadow-sm no-underline"
                                                        >
                                                            <CalendarIcon className="w-4 h-4 text-white" />
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
                                                    className="w-full sm:w-auto px-5 py-3 bg-white border border-[#ede7de] text-[#1c2826] hover:bg-[#faf6ee] text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                                                >
                                                    <FileDown className="w-4 h-4 text-[#5c6b66]" />
                                                    {downloadingPdf ? 'Generating PDF...' : 'Download Receipt'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        window.location.href = '/profile?tab=booked';
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-semibold rounded-md transition cursor-pointer text-center shadow-sm"
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
                                                                <div key={step} className="flex flex-col items-center flex-1">
                                                                    <div className={`w-full h-1 rounded-full ${effectiveStep >= step ? 'bg-[#b85438]' : 'bg-[#ede7de]'} transition-all duration-300`}></div>
                                                                    <span className={`text-[9px] sm:text-[10px] font-semibold mt-2 uppercase tracking-wider text-center transition-colors ${effectiveStep === step ? 'text-[#b85438]' : effectiveStep > step ? 'text-[#1c2826]' : 'text-[#5c6b66]/60'}`}>
                                                                        {step === 1 ? 'Expert' : step === 2 ? 'Service' : step === 3 ? 'Time' : 'Summary'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* STEP 2 — SELECT SERVICE & SESSION PLAN */}
                                                {(wizardStep === 2 || (wizardStep === 1 && isAdvisorLocked)) && (
                                                    <div ref={stepServiceRef} className="bh-booking-step-card bg-white border border-[#ede7de] rounded-md p-5 sm:p-7 shadow-sm space-y-6 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-[#ede7de] pb-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 rounded-xs bg-[#1c2826] text-white text-xs flex items-center justify-center font-bold">
                                                                    2
                                                                </span>
                                                                <div>
                                                                    <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1c2826] leading-tight">
                                                                        Select Service & Session Plan
                                                                    </h3>
                                                                    <p className="text-xs text-[#5c6b66] font-normal">
                                                                        Choose your consultation service, delivery mode, and duration plan
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-semibold text-[#b85438] bg-[#b85438]/10 px-2.5 py-0.5 rounded-xs uppercase tracking-wider hidden sm:inline-block">
                                                                Step 2
                                                            </span>
                                                        </div>

                                                        {isAdvisorLocked && !selectedAdvisor && (
                                                            <div className={`p-3 rounded-lg flex items-center justify-between gap-3 text-xs mb-2 ${advisorLoadError ? 'bg-rose-50 border border-rose-200' : 'bg-[#faf5f0] border border-[#ede7de]'}`} role={advisorLoadError ? 'alert' : 'status'}>
                                                                <span className={`font-bold ${advisorLoadError ? 'text-rose-700' : 'text-[#5c6b66]'}`}>
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
                                                                        className="px-3 py-1.5 bg-[#1c2826] text-white text-xs font-bold rounded-md hover:bg-[#b85438] transition cursor-pointer border-none shrink-0"
                                                                    >
                                                                        Retry
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedAdvisor && isAdvisorLocked && (
                                                            <div className="p-3 bg-[#faf5f0] border border-[#ede7de] rounded-lg flex items-center justify-between gap-3 text-xs mb-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2 h-2 rounded-full bg-[#b85438] animate-pulse shrink-0" />
                                                                    <span className="font-bold text-[#1c2826] truncate">
                                                                        Selected: <strong className="text-[#1c2826]">{selectedAdvisor.name}</strong>
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] font-bold text-[#4c5b55] shrink-0 hidden sm:inline-block">
                                                                    Review pricing below ↓
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Service Type & Mode Selection — plain text when only one option exists */}
                                                        <div className={`${hasMultipleServices && hasMultipleModes ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'flex flex-col gap-2.5'} pb-3 border-b border-[#f4eee6]`}>
                                                            {/* Service Type */}
                                                            <div className="space-y-2">
                                                                {hasMultipleServices ? (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-[#5c6b66] uppercase tracking-wider block">Service Type</span>
                                                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingService('counselling');
                                                                                }}
                                                                                className={`flex-1 p-3.5 rounded-md border text-left flex items-center gap-3 transition-all cursor-pointer ${bookingService === 'counselling'
                                                                                        ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 text-[#1c2826]'
                                                                                        : 'border-[#ede7de] bg-white text-[#1c2826] hover:border-[#b85438]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-xl shrink-0">🧠</span>
                                                                                <div className="min-w-0">
                                                                                    <span className="text-xs font-bold block text-[#1c2826] leading-tight">Psychology Counselling</span>
                                                                                    <span className="text-[10px] text-[#5c6b66] block leading-tight mt-0.5">Clinical therapy & assessment</span>
                                                                                </div>
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                disabled={rescheduleSession}
                                                                                onClick={() => {
                                                                                    setBookingService('career');
                                                                                }}
                                                                                className={`flex-1 p-3.5 rounded-md border text-left flex items-center gap-3 transition-all cursor-pointer ${bookingService === 'career'
                                                                                        ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 text-[#1c2826]'
                                                                                        : 'border-[#ede7de] bg-white text-[#1c2826] hover:border-[#b85438]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-xl shrink-0">🧭</span>
                                                                                <div className="min-w-0">
                                                                                    <span className="text-xs font-bold block text-[#1c2826] leading-tight">Career Mentoring</span>
                                                                                    <span className="text-[10px] text-[#5c6b66] block leading-tight mt-0.5">Guidance & direction</span>
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-[#5c6b66] leading-tight">
                                                                        Service Type: <span className="font-bold text-[#1c2826]">{bookingService === 'career' ? 'Career Mentoring' : 'Psychology Counselling'}</span>
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Session Mode */}
                                                            <div className="space-y-2">
                                                                {hasMultipleModes ? (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-[#5c6b66] uppercase tracking-wider block">Session Mode</span>
                                                                        <div className="flex flex-wrap gap-2.5">
                                                                        <button
                                                                            type="button"
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                setBookingMode('ONLINE');
                                                                            }}
                                                                            className={`flex-1 min-w-[110px] p-3 rounded-md border flex items-center justify-center sm:justify-start gap-2.5 transition-all cursor-pointer ${bookingMode === 'ONLINE'
                                                                                    ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 text-[#1c2826]'
                                                                                    : 'border-[#ede7de] bg-white text-[#1c2826] hover:border-[#b85438]/40'
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
                                                                                        ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 text-[#1c2826]'
                                                                                        : 'border-[#ede7de] bg-white text-[#1c2826] hover:border-[#b85438]/40'
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
                                                                                        ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 text-[#1c2826]'
                                                                                        : 'border-[#ede7de] bg-white text-[#1c2826] hover:border-[#b85438]/40'
                                                                                    }`}
                                                                            >
                                                                                <span className="text-base shrink-0">🏢</span>
                                                                                <span className="text-xs font-bold leading-tight">In-Center</span>
                                                                            </button>
                                                                        )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-[#5c6b66] leading-tight">
                                                                        Session Mode: <span className="font-bold text-[#1c2826]">{bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : bookingMode === 'OFFLINE' ? 'In-Center Session' : 'Online'}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Session Plan Selector: Introductory vs Standard */}
                                                        <div className="space-y-3 pt-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-bold text-[#1c2826] uppercase tracking-wider block">
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
                                                                                ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 shadow-sm'
                                                                                : 'border-[#ede7de] bg-white hover:border-[#b85438]/40'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#b85438]/10 text-[#b85438] border border-[#b85438]/20">
                                                                                ✨ Intro Offer
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-serif font-bold text-[#1c2826] shrink-0">
                                                                                {selectedAdvisor?.halfSessionPrice != null ? `₹${selectedAdvisor.halfSessionPrice}` : 'Price not configured'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-sm sm:text-base text-[#1c2826]">Introductory Session</h4>
                                                                                {bookingDuration === 30 ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-[#b85438] shrink-0" />
                                                                                ) : (
                                                                                    <span className="w-4 h-4 rounded-xs border border-[#ede7de] shrink-0 block" />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#5c6b66] mt-1 leading-relaxed">
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
                                                                                ? 'border-[#b85438] bg-[#faf5f0] ring-1 ring-[#b85438]/30 shadow-sm'
                                                                                : 'border-[#ede7de] bg-white hover:border-[#b85438]/40'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#ede7de] text-[#1c2826]">
                                                                                Comprehensive
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-serif font-bold text-[#1c2826] shrink-0">
                                                                                {selectedAdvisor?.price != null ? `₹${selectedAdvisor.price}` : 'Price not configured'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-sm sm:text-base text-[#1c2826]">Standard Session</h4>
                                                                                {bookingDuration === 60 ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-[#b85438] shrink-0" />
                                                                                ) : (
                                                                                    <span className="w-4 h-4 rounded-xs border border-[#ede7de] shrink-0 block" />
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#5c6b66] mt-1 leading-relaxed">
                                                                                1 Hour (60 Minutes) • Full therapeutic consultation
                                                                            </p>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-[#faf5f0] rounded-md border border-[#b85438] ring-1 ring-[#b85438]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-xs bg-[#b85438]/10 text-[#b85438]">
                                                                                Full Therapeutic Care
                                                                            </span>
                                                                            <span className="text-xs text-[#5c6b66] font-medium">1 Hour (60 Mins)</span>
                                                                        </div>
                                                                        <h4 className="font-bold text-sm text-[#1c2826]">Standard Comprehensive Session</h4>
                                                                        <p className="text-xs text-[#5c6b66] mt-0.5">
                                                                            Introductory session already completed. Continuing with full standard consultation.
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-2xl font-serif font-bold text-[#1c2826]">
                                                                        {selectedAdvisor?.price != null ? `₹${selectedAdvisor.price}` : 'Price not configured'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* DOORSTEP LOCATION INPUTS */}
                                                        {bookingMode === 'DOOR_STEP' && (
                                                            <div className="space-y-4 p-4 bg-[#faf6ee] border border-[#ede7de] rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                                                <div className="border-b border-[#ede7de] pb-2">
                                                                    <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
                                                                        Doorstep Visit Address
                                                                    </h4>
                                                                    <p className="text-xs text-[#5c6b66] mt-0.5">
                                                                        Please provide your location to check for nearby psychologists within service radius.
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-1.5 relative">
                                                                    <label className="text-xs font-semibold text-[#4c5b55] block">Search Location Address</label>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Type your address to search... (e.g. Kozhikode, Kerala)"
                                                                            value={clientSearchQuery}
                                                                            onChange={(e) => setClientSearchQuery(e.target.value)}
                                                                            className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-[#ede7de] text-xs font-medium text-[#1c2826] outline-none focus:border-[#b85438] rounded-lg transition"
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
                                                                            className="w-full sm:w-auto px-4 py-2.5 bg-[#1c2826] text-white text-xs font-bold rounded-lg hover:bg-[#b85438] transition cursor-pointer shrink-0 border-none"
                                                                        >
                                                                            {isClientSearching ? 'Searching...' : 'Search'}
                                                                        </button>
                                                                    </div>

                                                                    {clientSearchResults.length > 0 && (
                                                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-[#ede7de] rounded-lg max-h-40 overflow-y-auto z-50 shadow-md divide-y divide-[#ede7de]">
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
                                                                                    className="w-full text-left px-3.5 py-2 text-xs text-[#4c5b55] font-medium hover:bg-[#faf6ee] transition-colors block truncate"
                                                                                >
                                                                                    {res.display_name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-6 border-t border-[#f4eee6] flex justify-between items-center gap-3">
                                                            {!isAdvisorLocked ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(1)}
                                                                    className="px-5 py-2.5 bg-[#f4eee6] hover:bg-[#ede7de] text-[#4c5b55] font-bold text-xs sm:text-sm rounded-lg transition cursor-pointer border border-[#ede7de]"
                                                                >
                                                                    Back
                                                                </button>
                                                            ) : (
                                                                <div />
                                                            )}
                                                            <button type="button" onClick={() => setWizardStep(3)} className="w-full sm:w-auto px-6 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#1c2826] transition-all btn-booking-primary">Continue to Date & Time <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 1 — SELECT PSYCHOLOGIST */}
                                                {wizardStep === 1 && !isAdvisorLocked && (
                                                    <div ref={stepAdvisorRef} className="bh-booking-step-card bg-white border border-[#ede7de] rounded-lg p-4 sm:p-6 shadow-xs space-y-5 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-[#f4eee6] pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-6 h-6 rounded-md bg-[#1c2826] text-[#d69f86] text-xs flex items-center justify-center font-extrabold shadow-xs">
                                                                    1
                                                                </span>
                                                                <div>
                                                                    <h3 className="font-bold text-base sm:text-lg text-[#1c2826] leading-tight">
                                                                        Select Psychologist
                                                                    </h3>
                                                                    <p className="text-xs text-[#5c6b66] font-medium">
                                                                        Certified licensed clinical psychologists & therapeutic advisors
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-extrabold text-[#4c5b55] bg-[#faf5f0] border border-[#ede7de] px-2.5 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block">
                                                                Step 1
                                                            </span>
                                                        </div>

                                                        {selectedAdvisor && (
                                                            <div className="p-3 bg-[#faf5f0] border border-[#ede7de] rounded-lg flex items-center justify-between gap-3 text-xs">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2 h-2 rounded-full bg-[#b85438] animate-pulse shrink-0" />
                                                                    <span className="font-bold text-[#1c2826] truncate">
                                                                        Selected: <strong className="text-[#1c2826]">{selectedAdvisor.name}</strong> • {bookingDuration === 30 ? selectedAdvisor.halfSessionPrice : selectedAdvisor.price} ({bookingDuration === 30 ? '30m Plan' : '1h Plan'})
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(2)}
                                                                    className="px-3.5 py-1.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-bold text-xs rounded-md transition-all cursor-pointer whitespace-nowrap shadow-xs border-none flex items-center justify-center gap-1.5"
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
                                                                        <div className="p-6 border border-[#ede7de] rounded-lg bg-[#faf6ee] text-[#5c6b66] text-center text-sm" role="status" aria-live="polite">
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
                                                                                className="mt-3 px-4 py-2 bg-[#1c2826] text-white text-xs font-bold rounded-md hover:bg-[#b85438] transition cursor-pointer border-none"
                                                                            >
                                                                                Try again
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }

                                                                if (sortedAdvisors.length === 0) {
                                                                    return (
                                                                        <div className="p-6 border border-dashed border-[#ede7de] rounded-lg bg-[#faf6ee] text-[#5c6b66] text-center font-medium text-xs" role="status">
                                                                            No psychologists are currently listed for this service. Please check back soon.
                                                                        </div>
                                                                    );
                                                                }

                                                                const totalPages = Math.max(1, Math.ceil(sortedAdvisors.length / 6));
                                                                const currentPage = Math.min(effectiveAdvisorPage, totalPages);
                                                                const advisorsToRender = sortedAdvisors.slice((currentPage - 1) * 6, currentPage * 6);

                                                                return (
                                                                    <React.Fragment>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                                                                        {advisorsToRender.map((advisor) => {
                                                                            const info = getAdvisorEarliestAvailableInfo(advisor);
                                                                            const isAvailable = info.available;
                                                                            const isSelected = selectedAdvisor?.id === advisor.id;

                                                                            return (
                                                                                <div
                                                                                    key={advisor.id}
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
                                                                                    className={`group flex flex-col p-4 sm:p-5 border bg-white rounded-xl relative shadow-xs cursor-pointer booking-card transition-all ${isSelected
                                                                                            ? 'border-[#b85438] ring-2 ring-[#b85438]/20 bg-[#faf5f0]/40 shadow-sm'
                                                                                            : isAvailable
                                                                                                ? 'border-[#ede7de] hover:border-[#b85438]/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                                                                                                : 'border-[#f4eee6] opacity-60 hover:opacity-90'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex flex-col gap-3 flex-1">
                                                                                        <div className="flex items-start gap-3 min-w-0">
                                                                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg shrink-0 flex items-center justify-center border bg-white shadow-xs overflow-hidden relative transition-colors ${isSelected ? 'border-[#b85438]' : 'border-[#ede7de] group-hover:border-[#e0d8cb]'}`}>
                                                                                                {(advisor.isHighlighted || advisor.isTopFive) && (
                                                                                                    <div className="absolute top-0 left-0 right-0 bg-[#b85438] text-white text-[8px] font-bold text-center py-0.5 z-10 tracking-widest uppercase">
                                                                                                        Top Rated
                                                                                                    </div>
                                                                                                )}
                                                                                                {advisor.profilePic || advisor.image ? (
                                                                                                    <img
                                                                                                        src={advisor.profilePic || advisor.image}
                                                                                                        alt={advisor.name}
                                                                                                        className="w-full h-full object-cover"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <span className="font-bold text-xl text-[#9e432c]">
                                                                                                        {getInitials(advisor.name)}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>

                                                                                            <div className="space-y-1 min-w-0 flex-1">
                                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                                    <h4 className={`font-bold text-base sm:text-lg transition-colors truncate ${isSelected ? 'text-[#16201d] font-extrabold' : 'text-[#1c2826] group-hover:text-[#4c5b55]'}`}>
                                                                                                        {advisor.name}
                                                                                                    </h4>
                                                                                                    <span className="text-xs text-[#5c6b66] font-semibold">
                                                                                                        • {advisor.role || 'Consultant Psychologist'}
                                                                                                    </span>
                                                                                                </div>

                                                                                                {advisor.bio && (
                                                                                                    <p className="text-xs text-[#5c6b66] line-clamp-2 leading-relaxed">
                                                                                                        {advisor.bio}
                                                                                                    </p>
                                                                                                )}

                                                                                                {advisor.specialties?.length > 0 && (
                                                                                                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                                                                                        {advisor.specialties.slice(0, 2).map((spec, i) => (
                                                                                                            <span key={i} title={spec} className="max-w-[140px] truncate px-2 py-0.5 bg-[#faf6ee] border border-[#ede7de] text-[#5c6b66] text-[10px] font-semibold rounded-md">
                                                                                                                {spec}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                        {advisor.specialties.length > 2 && (
                                                                                                            <span className="shrink-0 px-2 py-0.5 bg-[#faf6ee] border border-[#ede7de] text-[#5c6b66] text-[10px] font-semibold rounded-md">
                                                                                                                +{advisor.specialties.length - 2}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}

                                                                                                {isAvailable ? (
                                                                                                    <span className="text-xs text-emerald-700 font-bold mt-1 inline-flex items-center gap-1.5">
                                                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                                                        {info.label}
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-xs text-rose-500 font-medium mt-1 inline-block">
                                                                                                        No upcoming slots
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex items-center justify-between gap-2 shrink-0 border-t border-[#f4eee6] pt-3 mt-auto">
                                                                                            <div className="text-left">
                                                                                                <span className="font-extrabold text-xl sm:text-2xl text-[#1c2826] block leading-none">
                                                                                                    {bookingDuration === 30 ? advisor.halfSessionPrice : advisor.price}
                                                                                                </span>
                                                                                                <span className="text-[10px] font-bold text-[#5c6b66] uppercase tracking-wider mt-0.5 block">
                                                                                                    {bookingDuration === 30 ? '30 Mins Plan' : '1 Hour Plan'}
                                                                                                </span>
                                                                                            </div>

                                                                                            {isSelected ? (
                                                                                                <div className="px-3.5 py-1.5 bg-[#b85438] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-xs">
                                                                                                    <span>✓ Selected</span>
                                                                                                </div>
                                                                                            ) : isAvailable ? (
                                                                                                <div className="px-3.5 py-1.5 bg-[#1c2826] text-white text-xs font-bold rounded-lg group-hover:bg-[#b85438] transition-all flex items-center gap-1 shadow-xs">
                                                                                                    <span>Select</span>
                                                                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <span className="text-xs font-semibold text-[#8a938f] bg-[#f4eee6] px-3 py-1.5 rounded-md">
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
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-[#ede7de] bg-white hover:bg-[#faf6ee] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
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
                                                                                                ? 'bg-[#1c2826] text-white border-[#1c2826] shadow-xs'
                                                                                                : 'bg-white text-[#1c2826] border-[#ede7de] hover:border-[#b85438]'
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
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-[#ede7de] bg-white hover:bg-[#faf6ee] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
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

                                                        <div className="pt-6 border-t border-[#f4eee6] flex justify-end">
                                                            <button type="button" onClick={() => setWizardStep(2)} disabled={!selectedAdvisor} className="w-full sm:w-auto px-6 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#1c2826] transition-all btn-booking-primary disabled:opacity-50">Continue to Service Plan <ArrowRight className="w-4 h-4" /></button>
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

                                                        <div ref={step3NextBtnRef} className="pt-6 border-t border-[#f4eee6] flex justify-between items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setWizardStep(2)}
                                                                className="px-5 py-2.5 bg-[#f4eee6] hover:bg-[#ede7de] text-[#4c5b55] font-bold text-xs sm:text-sm rounded-lg transition cursor-pointer border border-[#ede7de]"
                                                            >
                                                                Back
                                                            </button>
                                                            <button type="button" onClick={() => setWizardStep(4)} disabled={!selectedTime} className="w-full sm:w-auto px-6 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#1c2826] transition-all btn-booking-primary disabled:opacity-50">Continue to Summary <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 4 — COMPACT BOOKING SUMMARY & PROCEED TO PAYMENT */}
                                                {wizardStep === 4 && (
                                                    <div ref={stepSummaryRef} className="p-5 sm:p-6 bg-white rounded-lg shadow-xs border border-[#ede7de] space-y-4 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-[#f4eee6] pb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-[#b85438] animate-pulse" />
                                                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#1c2826]">
                                                                    Booking Summary Review
                                                                </h4>
                                                            </div>
                                                            <span className="text-xl font-extrabold text-[#1c2826]">
                                                                {netTotal === null ? 'Price not configured' : `₹${netTotal}`}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-1">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#8a938f] block">Psychologist</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#1c2826] text-sm truncate">{selectedAdvisor?.name}</span>
                                                                    {!isAdvisorLocked && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectedAdvisor(null); setSelectedTime(''); }}
                                                                            className="text-[11px] text-[#a0462e] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Change
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#8a938f] block">Service & Mode</span>
                                                                <span className="font-bold text-[#1c2826] text-sm block">
                                                                    {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} • {bookingMode === 'ONLINE' ? 'Online Video Call' : bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : 'In-Center'}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#8a938f] block">Session Plan</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#1c2826] text-sm">
                                                                        {bookingDuration === 30 ? 'Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                                    </span>
                                                                    {isIntroductoryEligible && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setBookingDuration(bookingDuration === 30 ? 60 : 30)}
                                                                            className="text-[11px] text-[#a0462e] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Switch
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-[#8a938f] block">Date & Time</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-[#1c2826] text-sm">
                                                                        {formatDateString(selectedDate)} at {selectedTime}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="text-[11px] text-[#a0462e] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!rescheduleSession && (
                                                            <div className="pt-3 border-t border-[#f4eee6] flex flex-col sm:flex-row items-center justify-between gap-4">
                                                                <div className="text-left w-full sm:w-auto">
                                                                    <span className="text-[11px] text-[#8a938f] block font-medium">Total Amount Payable</span>
                                                                    <span className="text-2xl font-extrabold text-[#1c2826]">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                                </div>

                                                                <div className="flex gap-2.5 w-full sm:w-auto mt-4 sm:mt-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="px-5 py-2.5 bg-[#f4eee6] hover:bg-[#ede7de] text-[#4c5b55] font-bold text-xs sm:text-sm rounded-lg transition flex items-center justify-center cursor-pointer border border-[#ede7de]"
                                                                    >
                                                                        Back
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={!selectedAdvisor || !selectedDate || !selectedTime || baseFee === null}
                                                                        onClick={() => handleStepChange('payment')}
                                                                        className="w-full sm:w-auto flex-1 px-6 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#1c2826] btn-booking-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <span>{netTotal === null ? 'Price not configured' : `Proceed to Payment (₹${netTotal})`}</span>
                                                                        <ArrowRight className="w-4 h-4 stroke-[3] text-[#d69f86]" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {rescheduleSession && (
                                                    <div className="flex items-center justify-between pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setWizardStep(3)}
                                                            className="px-6 py-3 bg-[#f4eee6] hover:bg-[#ede7de] text-[#4c5b55] font-bold rounded-xl transition cursor-pointer border-none"
                                                        >
                                                            Back
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={!selectedDate || !selectedTime || isSubmitting}
                                                            onClick={handleRescheduleConfirm}
                                                            className="px-6 py-3 bg-[#1c2826] text-white font-bold text-sm rounded-xl transition hover:bg-[#b85438] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
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
                                                <div className="border-b border-[#ede7de] pb-3 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-[#1c2826] flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-md bg-[#1c2826] text-white text-xs flex items-center justify-center shrink-0 font-medium">2</span>
                                                            Payment & Confirm
                                                        </h3>
                                                        <p className="text-sm font-normal text-[#5c6b66] mt-1">
                                                            {user ? 'Review your details and complete payment.' : 'Please enter your details to receive session link & confirmation.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="card-app-soft p-5 sm:p-6 space-y-5 text-left">
                                                    <div className="bg-[#1c2826] text-white rounded-md p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#b85438] block mb-1">
                                                                {bookingDuration === 30 ? '✨ Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                            </span>
                                                            <span className="text-sm font-semibold text-[#ede7de]">
                                                                {selectedAdvisor?.name} • {selectedDate} at {selectedTime}
                                                            </span>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="text-2xl font-serif font-bold text-white block">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                            <span className="text-[11px] text-[#ede7de]/70 block font-normal">Total Payable</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-[#ede7de] pb-3">
                                                        <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
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
                                                            <label className="text-xs font-semibold text-[#1c2826] block">
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
                                                                className={`w-full px-4 py-2.5 border rounded-md text-sm font-medium text-[#1c2826] outline-none transition ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-[#ede7de] focus:border-[#b85438] focus:ring-2 focus:ring-[#b85438]/10 bg-white'}`}
                                                            />
                                                            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-semibold text-[#1c2826] block">
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
                                                                className={`w-full px-4 py-2.5 border rounded-md text-sm font-medium text-[#1c2826] outline-none transition ${errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-[#ede7de] focus:border-[#b85438] focus:ring-2 focus:ring-[#b85438]/10 bg-white'}`}
                                                            />
                                                            {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                                    <div className="p-4 bg-[#faf6ee] border border-[#ede7de] rounded-xl space-y-2">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="w-10 h-10 bg-white border border-[#ede7de] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                                                                <Lock className="w-5 h-5 text-[#1c2826]" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-[#1c2826]">Secure Payment Gateway</h5>
                                                                <p className="text-xs text-[#8a938f] font-medium">
                                                                    100% encrypted Razorpay gateway supporting UPI, Google Pay, PhonePe, Cards, Netbanking, and Wallets.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-[#faf6ee] via-white to-[#faf6ee]/80 border border-[#ede7de]/90 rounded-xl text-left space-y-4 shadow-xs">
                                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#ede7de]/80">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-[#b85438]/10 border border-[#b85438]/20 flex items-center justify-center text-[#a0462e]">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-bold text-[#1c2826] leading-tight">Informed Client Consent & Agreement</h5>
                                                                    <p className="text-[11px] text-[#5c6b66] font-medium mt-0.5">Please review the professional care disclosures before confirming</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#faf5f0] text-[#9e432c] border border-[#eadfd0]/60 px-2 py-0.5 rounded-md">
                                                                Required
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#ede7de]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#b85438] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#1c2826] block text-[11px]">Strict Confidentiality</span>
                                                                    <span className="text-[10.5px] text-[#5c6b66]">Session notes & discussions protected under clinical ethics.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#ede7de]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#b85438] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#1c2826] block text-[11px]">Voluntary Care</span>
                                                                    <span className="text-[10.5px] text-[#5c6b66]">Collaborative process with freedom to ask questions anytime.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#ede7de]/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#b85438] shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#1c2826] block text-[11px]">24-Hour Full Refund</span>
                                                                    <span className="text-[10.5px] text-[#5c6b66]">100% refund for cancellations made 24+ hours in advance.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-[#ede7de]/70">
                                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-[#1c2826] block text-[11px]">Crisis Disclaimer</span>
                                                                    <span className="text-[10.5px] text-[#5c6b66]">Scheduled consultations; not a 24/7 suicide crisis line.</span>
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
                                                                className="text-xs font-bold text-[#a0462e] hover:text-[#9e432c] underline flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Read Full Informed Consent Document</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-start gap-3 pt-3 border-t border-[#ede7de] bg-[#fbf9f5] p-3.5 rounded-md">
                                                            <input
                                                                type="checkbox"
                                                                id="booking-consent-checkbox"
                                                                checked={termsAgreed}
                                                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                                                className="w-4 h-4 mt-0.5 rounded border-[#ede7de] text-[#b85438] focus:ring-[#b85438] accent-[#b85438] cursor-pointer shrink-0"
                                                            />
                                                            <label htmlFor="booking-consent-checkbox" className="text-xs text-[#5c6b66] font-normal leading-relaxed cursor-pointer select-none">
                                                                I confirm that I have read, understood, and voluntarily agree to the{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs ? onOpenDocs('consent') : setShowConsentModal(true)}
                                                                    className="font-semibold text-[#b85438] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Informed Consent Agreement
                                                                </button>
                                                                ,{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('terms')}
                                                                    className="font-semibold text-[#b85438] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Platform Terms
                                                                </button>
                                                                , and{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('refund')}
                                                                    className="font-semibold text-[#b85438] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Return & Refund Policy
                                                                </button>
                                                                .
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#ede7de] mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepChange('config')}
                                                            className="inline-flex items-center justify-center gap-1.5 text-xs text-[#5c6b66] hover:text-[#1c2826] font-semibold py-2.5 px-3 transition-colors cursor-pointer bg-transparent border-none order-2 sm:order-1"
                                                        >
                                                            <ArrowLeft className="w-3.5 h-3.5" />
                                                            <span>Back to Schedule</span>
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={isProcessingPayment || !termsAgreed}
                                                            title={!termsAgreed ? "Please check the agreement box to proceed" : ""}
                                                            className={`px-8 py-4 min-h-[48px] font-semibold text-sm rounded-md transition-all flex items-center justify-center gap-2 border-none w-full sm:w-auto order-1 sm:order-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b85438] focus-visible:ring-offset-2 ${!termsAgreed || isProcessingPayment
                                                                ? 'bg-[#ede7de] text-[#5c6b66]/60 cursor-not-allowed opacity-60 shadow-none'
                                                                : 'bg-[#1c2826] hover:bg-[#b85438] text-white cursor-pointer active:scale-[0.98] shadow-lg'
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
                                            className="flex lg:hidden items-center justify-between w-full bg-[#faf6ee] border border-[#ede7de] p-3 rounded-xl text-left shadow-none mb-3 hover:bg-[#f4eee6] transition cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold text-[#1c2826] flex items-center gap-2">
                                                <span>Booking Summary</span>
                                                {selectedAdvisor && (
                                                    <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-xl font-semibold">
                                                        {bookingService === 'counselling' ? 'Counselling' : 'Career'}
                                                    </span>
                                                )}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-[#a8a094] transition-transform duration-200 ${showSummary ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <div className={`space-y-5 ${showSummary ? 'block' : 'hidden'} lg:block bg-white/80 backdrop-blur-md border border-[#ede7de] shadow-xs rounded-xl p-5 sm:p-6 mb-6`}>
                                            <div>
                                                <h3 className="text-base font-semibold text-[#1c2826] border-b border-[#ede7de] pb-3 hidden lg:block">
                                                    Booking Summary
                                                </h3>
                                            </div>

                                            <div className="space-y-5 text-sm font-semibold">
                                                <div>
                                                    <span className="text-xs text-[#a8a094] block font-semibold mb-0.5">Service & Mode</span>
                                                    <span className="font-semibold text-[#1c2826] block text-left">
                                                        {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                                                    </span>
                                                    <span className="text-xs text-[#8a938f] font-semibold block mt-0.5 bg-white border border-[#ede7de] rounded-xl px-2 py-0.5 w-fit">
                                                        {bookingMode === 'DOOR_STEP' ? 'Door Step' : bookingMode.charAt(0).toUpperCase() + bookingMode.slice(1).toLowerCase()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#a8a094] block font-semibold mb-0.5">Session Plan</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-[#1c2826] block text-left">
                                                            {bookingDuration === 30 ? 'Introductory Session' : 'Standard Session'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bookingDuration === 30 ? 'bg-[#f6efe8] text-[#a0462e] border border-[#e3c4b7]' : 'bg-[#f4eee6] text-[#4c5b55] border border-[#ede7de]'}`}>
                                                            {bookingDuration === 30 ? '30 Mins' : '1 Hour'}
                                                        </span>
                                                    </div>
                                                    {bookingDuration === 30 && (
                                                        <span className="text-[11px] text-[#a0462e] font-semibold mt-0.5 block">
                                                            {baseFee === null ? 'Price not configured' : `Session fee • ₹${baseFee}`}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#a8a094] block font-semibold mb-0.5">Date & Time</span>
                                                    {selectedDate && selectedTime ? (
                                                        <div className="space-y-1 bg-white border border-[#ede7de] p-2 rounded-xl text-left">
                                                            <span className="font-semibold text-[#1c2826] block">
                                                                {formatDateString(selectedDate)}
                                                            </span>
                                                            <span className="text-xs text-[#8a938f] block font-semibold">
                                                                {selectedTime}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#a8a094] italic font-semibold text-xs block text-left">Not configured yet</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-[#a8a094] block font-semibold mb-0.5">Psychologist</span>
                                                    {selectedAdvisor ? (
                                                        <div className="bg-white border border-[#ede7de] p-2.5 rounded-xl text-left">
                                                            <span className="font-semibold text-[#1c2826] block text-xs">{selectedAdvisor.name}</span>
                                                            <span className="text-xs text-[#8a938f] block font-semibold">{selectedAdvisor.role}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#a8a094] italic font-semibold text-xs block text-left">No psychologist selected</span>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-[#ede7de] space-y-2 text-left">
                                                    <span className="text-xs text-[#8a938f] block font-semibold">Have a Promo Code?</span>
                                                    <div className="flex items-stretch rounded-xl border border-[#ede7de] bg-white overflow-hidden focus-within:border-[#1c2826] focus-within:ring-1 focus-within:ring-[#1c2826] transition-all">
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
                                                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer flex-shrink-0 border-l border-[#ede7de]"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyCoupon}
                                                                className="px-5 py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white text-xs font-bold transition cursor-pointer border-none flex-shrink-0"
                                                            >
                                                                Apply
                                                            </button>
                                                        )}
                                                    </div>
                                                    {couponMsg.text && (
                                                        <p className={`text-sm font-semibold ${couponMsg.type === 'success' ? 'text-[#1c2826]' : 'text-rose-500'}`}>
                                                            {couponMsg.text}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-[#ede7de] space-y-2">
                                                    <span className="text-xs text-[#a8a094] block font-semibold text-left">Pricing Breakdown</span>

                                                    <div className="space-y-1.5 text-xs font-semibold text-[#8a938f]">
                                                        <div className="flex justify-between">
                                                            <span>Session Fee ({bookingDuration === 30 ? 'Introductory' : 'Standard'})</span>
                                                            <span className="text-[#1c2826] font-semibold">{baseFee === null ? 'Price not configured' : `₹${baseFee}`}</span>
                                                        </div>

                                                        {gstEnabled && (
                                                            <div className="flex justify-between">
                                                                <span>GST ({gstPercent}%)</span>
                                                                <span className="text-[#1c2826] font-semibold">₹{gstAmount}</span>
                                                            </div>
                                                        )}

                                                        {appliedDiscount > 0 && (
                                                            <div className="flex justify-between text-[#1c2826] font-semibold">
                                                                <span>Promo Discount</span>
                                                                <span>-₹{appliedDiscount}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between text-sm font-semibold text-[#1c2826] border-t border-[#ede7de] pt-2 mt-1">
                                                            <span>Net Total</span>
                                                            <span className="text-[#1c2826]">{netTotal === null ? 'Price not configured' : `₹${netTotal}`}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-[#ede7de] text-sm font-semibold text-[#a8a094] text-center w-full">
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
                        <div className="bh-booking-alert bg-white border border-[#ede7de] rounded-xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center animate-in zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-labelledby="booking-clear-title">
                            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm text-xl font-semibold">
                                !
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-[#1c2826] tracking-wide">
                                    No Counsellors Found
                                </h3>
                                <p className="text-xs text-[#8a938f] leading-relaxed font-sans font-light">
                                    There are no counsellors available matching your selected service type or mode. Please adjust your session preferences and try again.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNoCounsellorsModal(false)}
                                className="w-full py-2.5 bg-[#1c2826] hover:bg-[#b85438] text-white font-semibold text-xs rounded-xl cursor-pointer transition border-none shadow-none"
                            >
                                OK
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                {showClearBookingConfirm && typeof document !== 'undefined' && createPortal(
                    <div className="bh-booking-alert-overlay fixed inset-0 z-[205] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bh-booking-alert bg-white border border-[#ede7de] rounded-xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                                <Trash2 size={20} aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                                <h3 id="booking-clear-title" className="text-lg font-semibold text-[#1c2826]">Start booking again?</h3>
                                <p className="text-xs text-[#5c6b66] leading-relaxed">Your selected service, expert, date and time will be cleared. You can choose them again in the next step.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setShowClearBookingConfirm(false)} className="bh-booking-alert-cancel w-full py-2.5 border border-[#ede7de] bg-white text-[#4c5b55] font-semibold text-xs rounded-xl cursor-pointer transition">
                                    Keep booking
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetBookingState();
                                        setWizardStep(1);
                                        setShowClearBookingConfirm(false);
                                    }}
                                    className="bh-booking-alert-confirm w-full py-2.5 bg-[#1c2826] text-white font-semibold text-xs rounded-xl cursor-pointer transition border-none"
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
                        <div className="bh-consent-dialog bg-white border border-[#ede7de] rounded-md w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                            <div className="px-6 py-4 border-b border-[#ede7de] flex justify-between items-center bg-[#faf6ee]/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-[#b85438]/10 border border-[#b85438]/20 flex items-center justify-center text-[#a0462e]">
                                        <ShieldCheck className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#1c2826] leading-tight">Informed Consent Agreement</h3>
                                        <p className="text-[11px] text-[#5c6b66] font-medium">Professional Psychological Counselling & Mentorship</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConsentModal(false)}
                                    className="p-1 text-[#8a938f] hover:text-[#4c5b55] rounded-md hover:bg-[#f4eee6] transition-colors cursor-pointer border-none bg-transparent"
                                    title="Close modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto text-[#4c5b55] text-xs font-medium leading-relaxed space-y-4 max-h-[60vh] custom-scrollbar">
                                <div className="p-3 bg-[#faf5f0] border border-[#eadfd0]/60 rounded-md text-[#1c2826] text-[11px] leading-relaxed">
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
                                            <div className="text-[#4c5b55] text-xs font-medium leading-relaxed whitespace-pre-wrap font-sans">
                                                {activeConsent}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 text-[#4c5b55]">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">1. Nature of Services & Voluntary Participation</h4>
                                                <p>Psychological counselling and career mentorship are collaborative, goal-directed processes designed to enhance personal wellbeing and decision-making. Participation is voluntary, and you have the right to ask questions or discuss your session goals at any time.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">2. Confidentiality & Ethical Safeguards</h4>
                                                <p>All discussions, case notes, and personal information are strictly confidential and protected in accordance with professional clinical ethics. Information may only be disclosed without prior consent if mandated by law—namely, if there is clear, imminent danger of harm to yourself or others, suspected child or vulnerable adult abuse, or by formal court order.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">3. Tele-Consultation & Privacy Guidelines</h4>
                                                <p>For online video consultations, sessions are conducted through secure, end-to-end encrypted video channels. Please ensure you are in a private, quiet room with minimal distractions. Unauthorized audio or video recording of sessions by either party is strictly prohibited without explicit mutual written consent.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">4. Emergency & Crisis Notice</h4>
                                                <p>Behold provides scheduled appointment consultations and is not an emergency crisis or suicide intervention service. If you are experiencing an acute life-threatening emergency, please immediately reach out to national emergency services (112), KIRAN Helpline (1800-599-0019), or Tele-MANAS (14416).</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">5. Cancellation, Rescheduling & Refund Policy</h4>
                                                <p>Appointments can be cancelled up to 24 hours prior to scheduled start time for a 100% full refund. Rescheduling is available free of charge up to 12 hours before your appointment. Late cancellations or no-shows are non-refundable.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-[#1c2826]">6. Minor / Guardian Consent</h4>
                                                <p>For clients under 18 years of age, parent or legal guardian acknowledgment and consent is affirmed upon booking.</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="px-6 py-4 border-t border-[#ede7de] flex items-center justify-between gap-3 bg-[#faf6ee]">
                                <button
                                    type="button"
                                    onClick={() => setShowConsentModal(false)}
                                    className="px-4 py-2.5 bg-white hover:bg-[#f4eee6] text-[#4c5b55] font-semibold text-xs rounded-md cursor-pointer transition border border-[#e0d8cb] shadow-xs"
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
                                    className="px-6 py-3 bg-[#1c2826] hover:bg-[#b85438] text-white font-medium text-xs rounded-md cursor-pointer transition border-none shadow-md flex items-center gap-1.5"
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
