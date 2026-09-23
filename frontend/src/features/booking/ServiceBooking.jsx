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

    const step1Ref = useRef(null);
    const step2AdvisorRef = useRef(null);
    const step3TimeRef = useRef(null);
    const step3NextBtnRef = useRef(null);
    const stepSummaryRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const scrollAnimationIdRef = useRef(null);

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
        setTimeout(() => {
            const container = scrollContainerRef.current;
            if (!container) return;

            let attempts = 0;
            const checkAndScroll = () => {
                const target = targetRef?.current;
                if (!target) {
                    if (attempts < 8) {
                        attempts++;
                        setTimeout(checkAndScroll, 50);
                    }
                    return;
                }

                const containerRect = container.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const targetOffset = targetRect.top - containerRect.top + container.scrollTop - offsetAdjust;
                smoothScrollElement(container, Math.max(0, targetOffset), duration);
            };

            checkAndScroll();
        }, 80);
    }, [smoothScrollElement]);

    const [expandedBios, setExpandedBios] = useState({});
    const [expandedSpecialties, setExpandedSpecialties] = useState({});
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);

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

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [bookingStep, wizardStep]);

    const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false);
    useEffect(() => {
        if (selectedAdvisor && !hasAutoAdvanced && wizardStep === 1 && !isAdvisorLocked) {
            setWizardStep(2);
            setHasAutoAdvanced(true);
        }
    }, [selectedAdvisor, hasAutoAdvanced, wizardStep, isAdvisorLocked]);

    const effectiveAdvisorPage = Math.max(1, advisorPage);

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
                    className="relative w-full max-w-md max-h-screen sm:max-h-[90vh] bg-white sm:rounded-xl shadow-2xl overflow-y-auto flex flex-col items-center justify-center text-center px-4 py-16 font-sans select-none"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-100 hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                        <X className="w-5 h-5 text-slate-700" />
                    </button>
                    <div className="max-w-md w-full bg-white border border-slate-200/50 p-8 rounded-xl shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-slate-100 border border-slate-200/50 rounded-xl flex items-center justify-center mx-auto text-slate-900 shadow-md">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm bg-white text-slate-900 px-3 py-1 rounded-xl font-semibold w-fit mx-auto block">
                                System Notice
                            </span>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                                Bookings Paused
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                                We are currently performing scheduled maintenance. Booking new sessions is temporarily offline.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-200/50 flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-[#00e5ff] text-white font-bold hover:scale-105 border-none text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-none w-full sm:w-auto text-center border-none"
                            >
                                Home Page
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/sample-test');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-white border border-slate-200/50 hover:bg-white text-slate-900 text-sm font-semibold rounded-xl transition-all cursor-pointer w-full sm:w-auto text-center"
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-sm overflow-hidden animate-backdrop-in">
            <SEO
                title="Book a Session | Psychological Counselling & Career Mentoring"
                description="Book an online, doorstep, or offline therapy session with certified clinical psychologists and career mentors on BEHOLD."
                canonicalUrl="https://www.behold.co.in/booking"
            />
            <div id="booking-modal-scroll" ref={scrollContainerRef} className={`relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl h-[92vh] sm:h-[90vh] bg-white rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden text-slate-900 text-left overscroll-contain animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 transition-all duration-300 scroll-smooth flex flex-col scroll-smooth-momentum gpu-layer pb-[env(safe-area-inset-bottom,16px)]`}>

                {/* Mobile Drag Handle */}
                <div className="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

                {/* Secure Payment & Booking Verification Overlay */}
                {isProcessingPayment && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-slate-900 px-6 text-center animate-in fade-in duration-200">
                        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-[#00e5ff]/20 border-t-[#00e5ff] animate-spin" />
                            <Lock className="w-6 h-6 text-[#00e5ff]" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 font-sans">Verifying &amp; Confirming Session</h3>
                        <p className="text-xs text-slate-700 max-w-xs text-center font-medium leading-relaxed">
                            {paymentStepText || 'Securing your appointment and reserving your session room...'}
                        </p>
                    </div>
                )}

                {/* Mobile App Style Header */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={handleModalBack}
                        className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-900 transition-colors cursor-pointer border-none bg-transparent"
                        aria-label="Go Back"
                    >
                        <ArrowLeft className="w-6 h-6" />
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
                                            isActive ? 'w-3 h-3 bg-[#00e5ff] dot-active' :
                                            isDone   ? 'w-2 h-2 bg-[#00e5ff]/60' :
                                                       'w-2 h-2 bg-slate-700'
                                        }`} />
                                        {step < 5 && (
                                            <div className={`h-[2px] transition-all duration-500 ${isDone ? 'w-4 bg-[#00e5ff]/40' : 'w-4 bg-slate-700'}`} />
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
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear all booking data and start over?')) {
                                        resetBookingState();
                                        setWizardStep(1);
                                    }
                                }}
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
                            className="w-10 h-10 -mr-2 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="min-h-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
                    <div className="space-y-8 sm:space-y-10">

                        {/* BOOKING FORM */}
                        <div id="booking-console" className="w-full">

                            {bookingStep === 'success' ? (
                                /* STEP 5: Success & Confirmation View - Centered & Perfectly Balanced */
                                <div className="p-6 sm:p-10 bg-white border border-slate-200/50 rounded-xl max-w-xl mx-auto shadow-xl shadow-slate-200/40 space-y-6 text-center animate-step-in relative overflow-hidden">

                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />


                                    <div className="relative w-20 h-20 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full flex items-center justify-center mx-auto text-[#00e5ff] shadow-md animate-checkmark-circle-pop z-10">
                                        <svg className="w-10 h-10 text-[#00e5ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path className="animate-checkmark-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <div className="space-y-2 animate-success-content relative z-10 text-center flex flex-col items-center justify-center">
                                        <span className="text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 px-3.5 py-1 rounded-md font-semibold w-fit mx-auto block shadow-md">
                                            {rescheduleSession ? 'Reschedule Requested' : 'Session Confirmed & Paid'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-semibold font-sans text-slate-900 tracking-tight mt-2">
                                            {rescheduleSession ? 'Reschedule Requested' : "Booking Confirmed!"}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed font-normal mt-1">
                                            {rescheduleSession ? (
                                                <>
                                                    Your reschedule request {bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>for <strong className="font-semibold text-slate-900">{bookingForm.name}</strong> </> : ''}has been submitted to <strong className="font-semibold text-slate-900">{selectedAdvisor?.name}</strong>.
                                                </>
                                            ) : (
                                                <>
                                                    Thank you{bookingForm.name && bookingForm.name !== 'New User' && !bookingForm.name.includes('Behold User') ? <>, <strong className="font-semibold text-slate-900">{bookingForm.name}</strong></> : ''}! Your payment is verified and your session is successfully booked.
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Invoice & Meeting Card */}
                                    <div className="bg-white/80 border border-slate-200/50/80 rounded-xl p-5 sm:p-6 text-left space-y-4 shadow-md animate-success-content relative z-10" style={{animationDelay: '0.75s'}}>
                                        <div className="flex items-center justify-between border-b border-slate-200/50/80 pb-3 mb-2">
                                            <span className="text-xs font-semibold text-slate-500">
                                                {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation Summary'}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                                                ✓ Paid
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <span className="text-slate-500 block font-medium text-[11px]">Psychologist</span>
                                                <span className="font-semibold text-slate-900 text-sm block">{selectedAdvisor?.name || 'Assigned Advisor'}</span>
                                                <span className="text-slate-500 block font-normal text-xs">{selectedAdvisor?.role || 'Consultant Psychologist'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-500 block font-medium text-[11px]">Service & Mode</span>
                                                <span className="font-semibold text-slate-900 text-sm block">
                                                    {confirmedBooking?.service ? (confirmedBooking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring') : (bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring')}
                                                </span>
                                                <span className="text-slate-500 block font-normal text-xs">{confirmedBooking?.mode === 'ONLINE' ? 'Video Call' : confirmedBooking?.mode === 'DOOR_STEP' ? 'Home Visit' : confirmedBooking?.mode === 'OFFLINE' ? 'At Center' : bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-500 block font-medium text-[11px]">Date & Schedule</span>
                                                <span className="font-semibold text-slate-900 text-sm block">
                                                    {formatDateString(confirmedBooking?.date || selectedDate)}
                                                </span>
                                                <span className="text-slate-500 block font-normal text-xs">
                                                    {confirmedBooking?.time || selectedTime} • {confirmedBooking?.duration || (bookingDuration === 30 ? '30 Mins (Introductory Session)' : '1 Hour (Standard Session)')}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-slate-500 block font-medium text-[11px]">Amount Paid</span>
                                                <span className="font-semibold text-slate-900 text-sm block">
                                                    ₹{confirmedBooking?.amountPaid || netTotal}
                                                </span>
                                                <span className="text-slate-500 block font-normal text-xs">SSL Secure Payment</span>
                                            </div>
                                        </div>

                                        {bookingMode === 'ONLINE' && !rescheduleSession && (
                                            <div className="pt-4 border-t border-slate-200/50/80 mt-3">
                                                {(() => {
                                                    const canonicalId = confirmedBooking?.appointmentId || confirmedBooking?.id || 'Session';
                                                    const resolvedMeetLink = (confirmedBooking?.meetLink && !confirmedBooking.meetLink.includes('meet.jit.si'))
                                                        || (confirmedMeetLink && !confirmedMeetLink.includes('meet.jit.si'))
                                                        || buildGoogleMeetUrl(canonicalId);
                                                    return (
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/50 shadow-md">
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                                                                    Google Meet Video Consultation Room
                                                                </span>
                                                                <span className="text-xs text-slate-900 font-semibold truncate block font-mono">
                                                                    {resolvedMeetLink}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <a
                                                                    href={resolvedMeetLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3.5 py-2 bg-[#00e5ff] text-white font-bold border-none hover:bg-[#00e5ff] text-white font-bold border-none-dark text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 border-none shadow-md no-underline"
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
                                                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-700 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center border border-slate-200/50 shadow-md whitespace-nowrap"
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
                                                className="w-full sm:w-auto px-6 py-3 bg-[#00e5ff] text-white font-bold hover:scale-105 border-none text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-md"
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
                                                            className="w-full sm:w-auto px-5 py-3 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-teal-950 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md no-underline"
                                                        >
                                                            <CalendarIcon className="w-4 h-4 text-teal-400" />
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
                                                    className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200/50 text-slate-100 hover:bg-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                                                >
                                                    <FileDown className="w-4 h-4 text-slate-500" />
                                                    {downloadingPdf ? 'Generating PDF...' : 'Download Receipt'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        window.location.href = '/profile?tab=booked';
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-[#00e5ff] text-white font-bold hover:scale-105 border-none text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-md"
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
                                                    <div className="flex items-center justify-between px-2 mb-6 gap-1">
                                                        {[1, 2, 3, 4].map((step) => {
                                                            const effectiveStep = (wizardStep === 1 && isAdvisorLocked) ? 2 : wizardStep;
                                                            return (
                                                                <div key={step} className="flex flex-col items-center flex-1">
                                                                    <div className={`w-full h-1 rounded-full ${effectiveStep >= step ? 'bg-[#00e5ff]' : 'bg-slate-700'} transition-all duration-300`}></div>
                                                                    <span className={`text-[9px] sm:text-[10px] font-bold mt-2 uppercase tracking-widest text-center transition-colors ${effectiveStep === step ? 'text-[#00e5ff]' : effectiveStep > step ? 'text-slate-700' : 'text-slate-500'}`}>
                                                                        {step === 1 ? 'Expert' : step === 2 ? 'Service' : step === 3 ? 'Time' : 'Summary'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* STEP 2 — SELECT SERVICE & SESSION PLAN */}
                                                {(wizardStep === 2 || (wizardStep === 1 && isAdvisorLocked)) && (
                                                    <div ref={step1Ref} className="bg-white border border-slate-200/50 rounded-xl p-4 sm:p-6 shadow-md space-y-5 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-7 h-7 rounded-xl bg-white text-[#00e5ff] text-xs flex items-center justify-center font-extrabold shadow-md">
                                                                    2
                                                                </span>
                                                                <div>
                                                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                                                                        Select Service & Session Plan
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500 font-medium">
                                                                        Choose your consultation service, delivery mode, and duration plan
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-extrabold text-teal-400 bg-teal-900/30 border border-teal-700/50/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
                                                                Step 2
                                                            </span>
                                                        </div>

                                                        {isAdvisorLocked && !selectedAdvisor && (
                                                            <div className="p-3 bg-gradient-to-r from-teal-50/80 via-cyan-50/40 to-white border border-[#00e5ff]/40 rounded-xl flex items-center justify-between gap-3 text-xs mb-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse shrink-0" />
                                                                    <span className="font-bold text-slate-500 truncate">
                                                                        Loading Selected Expert...
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedAdvisor && isAdvisorLocked && (
                                                            <div className="p-3 bg-gradient-to-r from-teal-50/80 via-cyan-50/40 to-white border border-[#00e5ff]/40 rounded-xl flex items-center justify-between gap-3 text-xs mb-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse shrink-0" />
                                                                    <span className="font-bold text-slate-900 truncate">
                                                                        Selected: <strong className="text-[#00e5ff]">{selectedAdvisor.name}</strong>
                                                                    </span>
                                                                </div>
                                                                <span className="text-[11px] font-bold text-teal-400 shrink-0 hidden sm:inline-block">
                                                                    Review pricing below ↓
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Service Type & Mode Selection */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                                                            {/* Service Type */}
                                                            <div className="space-y-2">
                                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Service Type</span>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingService('counselling');
                                                                        }}
                                                                        className={`p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${bookingService === 'counselling'
                                                                                ? 'card-app-soft-active'
                                                                                : 'card-app-soft hover:bg-white/50'
                                                                            }`}
                                                                    >
                                                                        <span className="text-2xl">🧠</span>
                                                                        <span className="text-xs font-bold text-center">Psychology<br/>Counselling</span>
                                                                    </button>
                                                                    {enableCareerMentoring && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                setBookingService('career');
                                                                            }}
                                                                            className={`p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${bookingService === 'career'
                                                                                    ? 'card-app-soft-active'
                                                                                    : 'card-app-soft hover:bg-white/50'
                                                                                }`}
                                                                        >
                                                                            <span className="text-2xl">🧭</span>
                                                                            <span className="text-xs font-bold text-center">Career<br/>Mentoring</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Session Mode */}
                                                            <div className="space-y-3">
                                                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Session Mode</span>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingMode('ONLINE');
                                                                        }}
                                                                        className={`p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${bookingMode === 'ONLINE'
                                                                                ? 'card-app-soft-active'
                                                                                : 'card-app-soft hover:bg-white/50'
                                                                            }`}
                                                                    >
                                                                        <span>🎥</span>
                                                                        <span className="text-xs font-bold">Online</span>
                                                                    </button>
                                                                    {enableDoorstep && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                setBookingMode('DOOR_STEP');
                                                                            }}
                                                                            className={`p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${bookingMode === 'DOOR_STEP'
                                                                                    ? 'card-app-soft-active'
                                                                                    : 'card-app-soft hover:bg-white/50'
                                                                                }`}
                                                                        >
                                                                            <span>🏠</span>
                                                                            <span className="text-xs font-bold">Doorstep</span>
                                                                        </button>
                                                                    )}
                                                                    {enableOffline && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                setBookingMode('OFFLINE');
                                                                            }}
                                                                            className={`p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${bookingMode === 'OFFLINE'
                                                                                    ? 'card-app-soft-active'
                                                                                    : 'card-app-soft hover:bg-white/50'
                                                                                }`}
                                                                        >
                                                                            <span>🏢</span>
                                                                            <span className="text-xs font-bold">In-Center</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Session Plan Selector: Introductory vs Standard */}
                                                        <div className="space-y-3 pt-1">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                                                    Choose Session Plan
                                                                </label>
                                                                {!isIntroductoryEligible && (
                                                                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                                                        <span>✓</span> Introductory Session Completed
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {isIntroductoryEligible ? (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingDuration(30);
                                                                        }}
                                                                        className={`p-4 sm:p-5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border-2 relative ${bookingDuration === 30
                                                                                ? 'border-[#00e5ff] bg-teal-900/30/30 ring-2 ring-[#00e5ff]/30 shadow-md'
                                                                                : 'border-slate-200/50 bg-white hover:border-slate-300 hover:bg-white/50'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-teal-900/50/80 text-[#00e5ff] border border-teal-700/50/60">
                                                                                ✨ One-Time Intro Offer
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 shrink-0">
                                                                                ₹{selectedAdvisor ? (selectedAdvisor.halfSessionPrice || 499) : 499}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-base text-slate-900">Introductory Session</h4>
                                                                                {bookingDuration === 30 && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
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
                                                                        className={`p-4 sm:p-5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border-2 relative ${bookingDuration === 60
                                                                                ? 'border-[#00e5ff] bg-teal-900/30/30 ring-2 ring-[#00e5ff]/30 shadow-md'
                                                                                : 'border-slate-200/50 bg-white hover:border-slate-300 hover:bg-white/50'
                                                                            }`}
                                                                    >
                                                                        <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/50">
                                                                                Comprehensive
                                                                            </span>
                                                                            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 shrink-0">
                                                                                ₹{selectedAdvisor ? (selectedAdvisor.price || 899) : 899}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <h4 className="font-bold text-base text-slate-900">Standard Session</h4>
                                                                                {bookingDuration === 60 && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                                                1 Hour (60 Minutes) • Full comprehensive therapeutic consultation
                                                                            </p>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-4 bg-teal-900/30/40 rounded-xl border-2 border-[#00e5ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-900/50 text-[#00e5ff] border border-teal-700/50">
                                                                                Full Therapeutic Care
                                                                            </span>
                                                                            <span className="text-xs text-slate-700 font-semibold">1 Hour (60 Mins)</span>
                                                                        </div>
                                                                        <h4 className="font-bold text-sm text-slate-900">Standard Comprehensive Session</h4>
                                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                                            Introductory session already completed. Continuing with full standard consultation.
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-2xl font-extrabold text-slate-900">
                                                                        ₹{selectedAdvisor?.price || 899}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* DOORSTEP LOCATION INPUTS */}
                                                        {bookingMode === 'DOOR_STEP' && (
                                                            <div className="space-y-4 p-4 bg-white border border-slate-200/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                                                <div className="border-b border-slate-200/50 pb-2">
                                                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                                                        Doorstep Visit Address
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                                        Please provide your location to check for nearby psychologists within service radius.
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-1.5 relative">
                                                                    <label className="text-xs font-semibold text-slate-700 block">Search Location Address</label>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Type your address to search... (e.g. Kozhikode, Kerala)"
                                                                            value={clientSearchQuery}
                                                                            onChange={(e) => setClientSearchQuery(e.target.value)}
                                                                            className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200/50 text-xs font-medium text-slate-900 outline-none focus:border-[#00e5ff] rounded-xl transition"
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
                                                                            className="w-full sm:w-auto px-4 py-2.5 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-black transition cursor-pointer shrink-0 border-none"
                                                                        >
                                                                            {isClientSearching ? 'Searching...' : 'Search'}
                                                                        </button>
                                                                    </div>

                                                                    {clientSearchResults.length > 0 && (
                                                                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200/50 rounded-xl max-h-40 overflow-y-auto z-50 shadow-md divide-y divide-slate-100">
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
                                                                                    className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 font-medium hover:bg-white transition-colors block truncate"
                                                                                >
                                                                                    {res.display_name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="pt-6 border-t border-slate-100 flex justify-between">
                                                            {!isAdvisorLocked ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(1)}
                                                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold rounded-xl transition cursor-pointer border-none"
                                                                >
                                                                    Back
                                                                </button>
                                                            ) : (
                                                                <div />
                                                            )}
                                                            <button type="button" onClick={() => setWizardStep(3)} className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-black text-slate-900 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer border-none btn-booking-primary">Continue to Date & Time <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 1 — SELECT PSYCHOLOGIST */}
                                                {wizardStep === 1 && !isAdvisorLocked && (
                                                    <div ref={step2AdvisorRef} className="bg-white border border-slate-200/50 rounded-2xl p-4 sm:p-6 shadow-md space-y-5 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="w-7 h-7 rounded-xl bg-white text-[#00e5ff] text-xs flex items-center justify-center font-extrabold shadow-md">
                                                                    1
                                                                </span>
                                                                <div>
                                                                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                                                                        Select Psychologist
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500 font-medium">
                                                                        Certified licensed clinical psychologists & therapeutic advisors
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-extrabold text-teal-400 bg-teal-900/30 border border-teal-700/50/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
                                                                Step 1
                                                            </span>
                                                        </div>

                                                        {selectedAdvisor && (
                                                            <div className="p-3 bg-gradient-to-r from-teal-50/80 via-cyan-50/40 to-white border border-[#00e5ff]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse shrink-0" />
                                                                    <span className="font-bold text-slate-900 truncate">
                                                                        Selected: <strong className="text-[#00e5ff]">{selectedAdvisor.name}</strong> • ₹{bookingDuration === 30 ? (selectedAdvisor.halfSessionPrice || 499) : (selectedAdvisor.price || 899)} ({bookingDuration === 30 ? '30m Plan' : '1h Plan'})
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setWizardStep(2)}
                                                                    className="px-4 py-2 bg-white hover:bg-black text-slate-900 font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-md border-none flex items-center justify-center gap-1.5"
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

                                                                if (sortedAdvisors.length === 0) {
                                                                    return (
                                                                        <div className="p-6 border border-dashed border-slate-200/50 rounded-xl bg-white text-slate-700 text-center font-medium text-xs">
                                                                            No psychologists found. Please try refreshing or clearing filter settings.
                                                                        </div>
                                                                    );
                                                                }

                                                                const totalPages = Math.max(1, Math.ceil(sortedAdvisors.length / 5));
                                                                const currentPage = Math.min(effectiveAdvisorPage, totalPages);
                                                                const advisorsToRender = sortedAdvisors.slice((currentPage - 1) * 5, currentPage * 5);

                                                                return (
                                                                    <React.Fragment>
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
                                                                                        scrollToTarget(step1Ref);
                                                                                    }}
                                                                                    className={`group p-4 sm:p-5 border-2 bg-white rounded-xl relative overflow-hidden shadow-md cursor-pointer booking-card transition-all ${isSelected
                                                                                            ? 'border-[#00e5ff] ring-2 ring-[#00e5ff]/50 bg-teal-900/30/30 shadow-md'
                                                                                            : isAvailable
                                                                                                ? 'border-slate-200/50 hover:border-teal-500 hover:shadow-md'
                                                                                                : 'border-slate-100 opacity-70 hover:opacity-100'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                                                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl shrink-0 flex items-center justify-center border-2 bg-white shadow-md overflow-hidden relative transition-colors ${isSelected ? 'border-[#00e5ff]' : 'border-slate-200/50 group-hover:border-[#00e5ff]'}`}>
                                                                                                {(advisor.isHighlighted || advisor.isTopFive) && (
                                                                                                    <div className="absolute top-0 left-0 right-0 bg-[#3a0ca3] text-slate-900 text-[8px] font-bold text-center py-0.5 z-10 tracking-widest uppercase">
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
                                                                                                    <span className="font-bold text-xl text-teal-400">
                                                                                                        {getInitials(advisor.name)}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>

                                                                                            <div className="space-y-1 min-w-0 flex-1">
                                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                                    <h4 className={`font-bold text-base sm:text-lg transition-colors truncate ${isSelected ? 'text-teal-950 font-extrabold' : 'text-slate-900 group-hover:text-teal-400'}`}>
                                                                                                        {advisor.name}
                                                                                                    </h4>
                                                                                                    <span className="text-xs text-slate-500 font-semibold">
                                                                                                        • {advisor.role || 'Consultant Psychologist'}
                                                                                                    </span>
                                                                                                </div>

                                                                                                {advisor.bio && (
                                                                                                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                                                                                                        {advisor.bio}
                                                                                                    </p>
                                                                                                )}

                                                                                                {advisor.specialties?.length > 0 && (
                                                                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                                                                        {advisor.specialties.slice(0, 3).map((spec, i) => (
                                                                                                            <span key={i} className="px-2 py-0.5 bg-white border border-slate-200/50 text-slate-700 text-[10px] font-semibold rounded-md">
                                                                                                                {spec}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                        {advisor.specialties.length > 3 && (
                                                                                                            <span className="px-2 py-0.5 bg-white border border-slate-200/50 text-slate-500 text-[10px] font-semibold rounded-md">
                                                                                                                +{advisor.specialties.length - 3}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}

                                                                                                {isAvailable ? (
                                                                                                    <span className="text-xs text-emerald-400 font-bold mt-1 inline-flex items-center gap-1.5">
                                                                                                        <span className="w-2 h-2 rounded-full bg-emerald-900/300 animate-pulse" />
                                                                                                        {info.label}
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="text-xs text-rose-500 font-medium mt-1 inline-block">
                                                                                                        No upcoming slots
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                                                                                            <div className="text-left sm:text-right">
                                                                                                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 block leading-none">
                                                                                                    ₹{bookingDuration === 30 ? (advisor.halfSessionPrice || 499) : (advisor.price || 899)}
                                                                                                </span>
                                                                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 block">
                                                                                                    {bookingDuration === 30 ? '30 Mins Plan' : '1 Hour Plan'}
                                                                                                </span>
                                                                                            </div>

                                                                                            {isSelected ? (
                                                                                                <div className="px-4 py-2 bg-[#00e5ff] text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 shadow-md">
                                                                                                    <span>✓ Selected</span>
                                                                                                </div>
                                                                                            ) : isAvailable ? (
                                                                                                <div className="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl group-hover:bg-[#00e5ff] group-hover:text-white transition-all flex items-center gap-1 shadow-md">
                                                                                                    <span>Select</span>
                                                                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                                                                    Unavailable
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {totalPages > 1 && (
                                                                            <div className="flex items-center justify-center gap-2 pt-3">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setAdvisorPage(p => Math.max(1, p - 1));
                                                                                    }}
                                                                                    disabled={advisorPage === 1}
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-slate-200/50 bg-white hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
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
                                                                                        className={`w-8 h-8 rounded-lg text-xs font-bold border flex items-center justify-center cursor-pointer ${advisorPage === num
                                                                                                ? 'bg-white text-[#00e5ff] border-slate-200 shadow-md'
                                                                                                : 'bg-white text-slate-100 border-slate-200/50 hover:border-slate-400'
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
                                                                                    className="w-8 h-8 rounded-lg text-sm font-bold border border-slate-200/50 bg-white hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
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

                                                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                                                            <button type="button" onClick={() => setWizardStep(2)} disabled={!selectedAdvisor} className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-black text-slate-900 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer border-none btn-booking-primary disabled:opacity-50">Continue to Service Plan <ArrowRight className="w-4 h-4" /></button>
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

                                                        <div ref={step3NextBtnRef} className="pt-6 border-t border-slate-100 flex justify-between">
                                                            <button
                                                                type="button"
                                                                onClick={() => setWizardStep(2)}
                                                                className="px-6 py-3 bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold rounded-xl transition cursor-pointer border-none"
                                                            >
                                                                Back
                                                            </button>
                                                            <button type="button" onClick={() => setWizardStep(4)} disabled={!selectedTime} className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-black text-slate-900 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer border-none btn-booking-primary disabled:opacity-50">Continue to Summary <ArrowRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* STEP 4 — COMPACT BOOKING SUMMARY & PROCEED TO PAYMENT */}
                                                {wizardStep === 4 && (
                                                    <div ref={stepSummaryRef} className="p-5 sm:p-6 bg-white rounded-xl shadow-md border-2 border-slate-200/50 space-y-4 text-left animate-step-in">
                                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
                                                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
                                                                    Booking Summary Review
                                                                </h4>
                                                            </div>
                                                            <span className="text-xl font-extrabold text-slate-900">
                                                                ₹{netTotal}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs py-1">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Psychologist</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-slate-900 text-sm truncate">{selectedAdvisor?.name}</span>
                                                                    {!isAdvisorLocked && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setSelectedAdvisor(null); setSelectedTime(''); }}
                                                                            className="text-[11px] text-teal-400 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Change
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Service & Mode</span>
                                                                <span className="font-bold text-slate-900 text-sm block">
                                                                    {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} • {bookingMode === 'ONLINE' ? 'Online Video Call' : bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : 'In-Center'}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Session Plan</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-slate-900 text-sm">
                                                                        {bookingDuration === 30 ? 'Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                                    </span>
                                                                    {isIntroductoryEligible && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setBookingDuration(bookingDuration === 30 ? 60 : 30)}
                                                                            className="text-[11px] text-teal-400 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                        >
                                                                            Switch
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Date & Time</span>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-bold text-slate-900 text-sm">
                                                                        {formatDateString(selectedDate)} at {selectedTime}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="text-[11px] text-teal-400 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!rescheduleSession && (
                                                            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                                <div className="text-left w-full sm:w-auto">
                                                                    <span className="text-[11px] text-slate-500 block font-medium">Total Amount Payable</span>
                                                                    <span className="text-2xl font-extrabold text-slate-900">₹{netTotal}</span>
                                                                </div>

                                                                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setWizardStep(3)}
                                                                        className="px-6 py-4 bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold rounded-xl transition flex items-center justify-center cursor-pointer border-none"
                                                                    >
                                                                        Back
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={!selectedAdvisor || !selectedDate || !selectedTime}
                                                                        onClick={() => handleStepChange('payment')}
                                                                        className="w-full sm:w-auto flex-1 px-8 py-4 bg-white hover:bg-black text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer border-none btn-booking-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <span>Proceed to Payment (₹{netTotal})</span>
                                                                        <ArrowRight className="w-4 h-4 stroke-[3] text-[#00e5ff]" />
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
                                                            className="px-6 py-3 bg-slate-100 hover:bg-slate-700 text-slate-700 font-bold rounded-xl transition cursor-pointer border-none"
                                                        >
                                                            Back
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={!selectedDate || !selectedTime || isSubmitting}
                                                            onClick={handleRescheduleConfirm}
                                                            className="px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
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
                                                <div className="border-b border-surface-200 pb-3 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-surface-900 flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-md bg-surface-900 text-slate-900 text-xs flex items-center justify-center shrink-0 font-medium">2</span>
                                                            Payment & Confirm
                                                        </h3>
                                                        <p className="text-sm font-normal text-surface-600 mt-1">
                                                            {user ? 'Review your details and complete payment.' : 'Please enter your details to receive session link & confirmation.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="card-app-soft p-5 sm:p-6 space-y-5 text-left">
                                                    <div className="bg-white text-slate-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff] block mb-1">
                                                                {bookingDuration === 30 ? '✨ Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                            </span>
                                                            <span className="text-sm font-semibold text-slate-100">
                                                                {selectedAdvisor?.name} • {selectedDate} at {selectedTime}
                                                            </span>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="text-xl font-black text-[#00e5ff]">₹{netTotal}</span>
                                                            <span className="text-[11px] text-slate-500 block font-medium">Total Payable</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-surface-100 pb-2.5">
                                                        <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider">
                                                            Client & Booking Contact Details
                                                        </h4>
                                                        {user && (
                                                            <span className="text-[11px] font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 px-2.5 py-0.5 rounded-md">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-zinc-700 block">
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
                                                                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium text-zinc-900 outline-none transition ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-200 focus:border-[#00e5ff] bg-zinc-50 focus:bg-white'}`}
                                                            />
                                                            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs font-semibold text-zinc-700 block">
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
                                                                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium text-zinc-900 outline-none transition ${errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-200 focus:border-[#00e5ff] bg-zinc-50 focus:bg-white'}`}
                                                            />
                                                            {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                                    <div className="p-4 bg-surface-50 border border-surface-200 rounded-xl space-y-2">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="w-10 h-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                                                                <Lock className="w-5 h-5 text-surface-900" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-surface-900">Secure Payment Gateway</h5>
                                                                <p className="text-xs text-surface-500 font-medium">
                                                                    100% encrypted Razorpay gateway supporting UPI, Google Pay, PhonePe, Cards, Netbanking, and Wallets.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 border border-slate-200/50 rounded-xl text-left space-y-4 shadow-md">
                                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/50/80">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-teal-900/300/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-bold text-slate-900 leading-tight">Informed Client Consent & Agreement</h5>
                                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Please review the professional care disclosures before confirming</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-900/30 text-teal-400 border border-teal-700/50/60 px-2 py-0.5 rounded-md">
                                                                Required
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/50/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-100 block text-[11px]">Strict Confidentiality</span>
                                                                    <span className="text-[10.5px] text-slate-500">Session notes & discussions protected under clinical ethics.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/50/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-100 block text-[11px]">Voluntary Care</span>
                                                                    <span className="text-[10.5px] text-slate-500">Collaborative process with freedom to ask questions anytime.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/50/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-100 block text-[11px]">24-Hour Full Refund</span>
                                                                    <span className="text-[10.5px] text-slate-500">100% refund for cancellations made 24+ hours in advance.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/50/70">
                                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-100 block text-[11px]">Crisis Disclaimer</span>
                                                                    <span className="text-[10.5px] text-slate-500">Scheduled consultations; not a 24/7 suicide crisis line.</span>
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
                                                                className="text-xs font-bold text-teal-400 hover:text-teal-400 underline flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Read Full Informed Consent Document</span>
                                                            </button>
                                                        </div>

                                                        <div className="flex items-start gap-3 pt-3 border-t border-slate-200/50/80 bg-white/50 p-3 rounded-xl">
                                                            <input
                                                                type="checkbox"
                                                                id="booking-consent-checkbox"
                                                                checked={termsAgreed}
                                                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-400 focus:ring-teal-500 accent-[#00e5ff] cursor-pointer shrink-0"
                                                            />
                                                            <label htmlFor="booking-consent-checkbox" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer select-none">
                                                                I confirm that I have read, understood, and voluntarily agree to the{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs ? onOpenDocs('consent') : setShowConsentModal(true)}
                                                                    className="font-bold text-teal-400 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Informed Consent Agreement
                                                                </button>
                                                                ,{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('terms')}
                                                                    className="font-bold text-teal-400 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Platform Terms
                                                                </button>
                                                                , and{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('refund')}
                                                                    className="font-bold text-teal-400 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Return & Refund Policy
                                                                </button>
                                                                .
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepChange('config')}
                                                            className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold py-2.5 px-3 transition-colors cursor-pointer bg-transparent border-none order-2 sm:order-1"
                                                        >
                                                            <ArrowLeft className="w-3.5 h-3.5" />
                                                            <span>Back to Schedule</span>
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={isProcessingPayment || !termsAgreed}
                                                            title={!termsAgreed ? "Please check the agreement box to proceed" : ""}
                                                            className={`px-8 py-4 min-h-[48px] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-none w-full sm:w-auto order-1 sm:order-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e5ff] focus-visible:ring-offset-2 ${!termsAgreed || isProcessingPayment
                                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                                                                : 'bg-white hover:bg-black text-[#00e5ff] hover:text-slate-900 cursor-pointer active:scale-[0.98] shadow-lg'
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
                                                                    <span>Pay & Confirm (₹{netTotal})</span>
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
                                            className="flex lg:hidden items-center justify-between w-full bg-surface-50 border border-surface-200 p-3 rounded-xl text-left shadow-none mb-3 hover:bg-surface-100 transition cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                                                <span>Booking Summary</span>
                                                {selectedAdvisor && (
                                                    <span className="text-xs bg-[#00e5ff] text-white font-bold border-none text-slate-900 px-2 py-0.5 rounded-xl font-semibold">
                                                        {bookingService === 'counselling' ? 'Counselling' : 'Career'}
                                                    </span>
                                                )}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${showSummary ? 'rotate-180' : ''}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <div className={`space-y-5 ${showSummary ? 'block' : 'hidden'} lg:block bg-white/80 backdrop-blur-md border border-surface-200 shadow-md rounded-xl p-5 sm:p-6 mb-6`}>
                                            <div>
                                                <h3 className="text-base font-semibold text-surface-900 border-b border-surface-200 pb-3 hidden lg:block">
                                                    Booking Summary
                                                </h3>
                                            </div>

                                            <div className="space-y-5 text-sm font-semibold">
                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Service & Mode</span>
                                                    <span className="font-semibold text-surface-900 block text-left">
                                                        {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                                                    </span>
                                                    <span className="text-xs text-surface-500 font-semibold block mt-0.5 bg-white border border-surface-200 rounded-xl px-2 py-0.5 w-fit">
                                                        {bookingMode === 'DOOR_STEP' ? 'Door Step' : bookingMode.charAt(0).toUpperCase() + bookingMode.slice(1).toLowerCase()}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Session Plan</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-surface-900 block text-left">
                                                            {bookingDuration === 30 ? 'Introductory Session' : 'Standard Session'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bookingDuration === 30 ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200' : 'bg-slate-100 text-slate-700 border border-slate-200/50'}`}>
                                                            {bookingDuration === 30 ? '30 Mins' : '1 Hour'}
                                                        </span>
                                                    </div>
                                                    {bookingDuration === 30 && (
                                                        <span className="text-[11px] text-[#0891b2] font-semibold mt-0.5 block">
                                                            Special First-Time Client Fee • ₹{baseFee}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Date & Time</span>
                                                    {selectedDate && selectedTime ? (
                                                        <div className="space-y-1 bg-white border border-surface-200 p-2 rounded-xl text-left">
                                                            <span className="font-semibold text-surface-900 block">
                                                                {formatDateString(selectedDate)}
                                                            </span>
                                                            <span className="text-xs text-surface-500 block font-semibold">
                                                                {selectedTime}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-surface-400 italic font-semibold text-xs block text-left">Not configured yet</span>
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Psychologist</span>
                                                    {selectedAdvisor ? (
                                                        <div className="bg-white border border-surface-200 p-2.5 rounded-xl text-left">
                                                            <span className="font-semibold text-surface-900 block text-xs">{selectedAdvisor.name}</span>
                                                            <span className="text-xs text-surface-500 block font-semibold">{selectedAdvisor.role}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-surface-400 italic font-semibold text-xs block text-left">No psychologist selected</span>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-surface-200 space-y-2 text-left">
                                                    <span className="text-xs text-surface-500 block font-semibold">Have a Promo Code?</span>
                                                    <div className="flex items-stretch rounded-xl border border-surface-200 bg-white overflow-hidden focus-within:border-surface-900 focus-within:ring-1 focus-within:ring-surface-900 transition-all">
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
                                                                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer flex-shrink-0 border-l border-surface-200"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyCoupon}
                                                                className="px-5 py-2.5 bg-surface-900 hover:bg-black text-slate-900 text-xs font-bold transition cursor-pointer border-none flex-shrink-0"
                                                            >
                                                                Apply
                                                            </button>
                                                        )}
                                                    </div>
                                                    {couponMsg.text && (
                                                        <p className={`text-sm font-semibold ${couponMsg.type === 'success' ? 'text-surface-900' : 'text-rose-500'}`}>
                                                            {couponMsg.text}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-surface-200 space-y-2">
                                                    <span className="text-xs text-surface-400 block font-semibold text-left">Pricing Breakdown</span>

                                                    <div className="space-y-1.5 text-xs font-semibold text-surface-500">
                                                        <div className="flex justify-between">
                                                            <span>Session Fee ({bookingDuration === 30 ? 'Introductory' : 'Standard'})</span>
                                                            <span className="text-surface-900 font-semibold">₹{baseFee}</span>
                                                        </div>

                                                        {gstEnabled && (
                                                            <div className="flex justify-between">
                                                                <span>GST ({gstPercent}%)</span>
                                                                <span className="text-surface-900 font-semibold">₹{gstAmount}</span>
                                                            </div>
                                                        )}

                                                        {appliedDiscount > 0 && (
                                                            <div className="flex justify-between text-surface-900 font-semibold">
                                                                <span>Promo Discount</span>
                                                                <span>-₹{appliedDiscount}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between text-sm font-semibold text-surface-900 border-t border-surface-200 pt-2 mt-1">
                                                            <span>Net Total</span>
                                                            <span className="text-surface-900">₹{netTotal}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-surface-200 text-sm font-semibold text-surface-400 text-center w-full">
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
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white border border-surface-200 rounded-xl w-full max-w-sm p-6 shadow-md space-y-4 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-whitember-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-md text-xl font-semibold">
                                !
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-zinc-900 tracking-wide">
                                    No Counsellors Found
                                </h3>
                                <p className="text-xs text-zinc-505 leading-relaxed font-sans font-light">
                                    There are no counsellors available matching your selected service type or mode. Please adjust your session preferences and try again.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNoCounsellorsModal(false)}
                                className="w-full py-2.5 bg-surface-900 hover:bg-black text-slate-900 font-semibold text-xs rounded-xl cursor-pointer transition border-none shadow-none"
                            >
                                OK
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

                {showConsentModal && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white border border-slate-200/50 rounded-xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                            <div className="px-6 py-4 border-b border-slate-200/50 flex justify-between items-center bg-white/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-teal-900/300/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                                        <ShieldCheck className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">Informed Consent Agreement</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Professional Psychological Counselling & Mentorship</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConsentModal(false)}
                                    className="p-1 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                                    title="Close modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto text-slate-700 text-xs font-medium leading-relaxed space-y-4 max-h-[60vh] custom-scrollbar">
                                <div className="p-3 bg-teal-900/30/60 border border-teal-700/50/60 rounded-xl text-teal-900 text-[11px] leading-relaxed">
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
                                            <div className="text-slate-700 text-xs font-medium leading-relaxed whitespace-pre-wrap font-sans">
                                                {activeConsent}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 text-slate-700">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">1. Nature of Services & Voluntary Participation</h4>
                                                <p>Psychological counselling and career mentorship are collaborative, goal-directed processes designed to enhance personal wellbeing and decision-making. Participation is voluntary, and you have the right to ask questions or discuss your session goals at any time.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">2. Confidentiality & Ethical Safeguards</h4>
                                                <p>All discussions, case notes, and personal information are strictly confidential and protected in accordance with professional clinical ethics. Information may only be disclosed without prior consent if mandated by law—namely, if there is clear, imminent danger of harm to yourself or others, suspected child or vulnerable adult abuse, or by formal court order.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">3. Tele-Consultation & Privacy Guidelines</h4>
                                                <p>For online video consultations, sessions are conducted through secure, end-to-end encrypted video channels. Please ensure you are in a private, quiet room with minimal distractions. Unauthorized audio or video recording of sessions by either party is strictly prohibited without explicit mutual written consent.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">4. Emergency & Crisis Notice</h4>
                                                <p>Behold provides scheduled appointment consultations and is not an emergency crisis or suicide intervention service. If you are experiencing an acute life-threatening emergency, please immediately reach out to national emergency services (112), KIRAN Helpline (1800-599-0019), or Tele-MANAS (14416).</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">5. Cancellation, Rescheduling & Refund Policy</h4>
                                                <p>Appointments can be cancelled up to 24 hours prior to scheduled start time for a 100% full refund. Rescheduling is available free of charge up to 12 hours before your appointment. Late cancellations or no-shows are non-refundable.</p>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-900">6. Minor / Guardian Consent</h4>
                                                <p>For clients under 18 years of age, parent or legal guardian acknowledgment and consent is affirmed upon booking.</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="px-6 py-4 border-t border-slate-200/50 flex items-center justify-between gap-3 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowConsentModal(false)}
                                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition border border-slate-300 shadow-md"
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
                                    className="px-5 py-2.5 bg-white hover:bg-black text-[#00e5ff] hover:text-slate-900 font-bold text-xs rounded-xl cursor-pointer transition border-none shadow-md flex items-center gap-1.5"
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
