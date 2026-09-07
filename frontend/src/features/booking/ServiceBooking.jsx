import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBookingViewModel } from './useBookingViewModel';
import DateTimePicker from './DateTimePicker';
import TimePicker from './TimePicker';
import BookingAuthModal from './BookingAuthModal';
import { FileDown, X, ArrowLeft, ArrowRight, Lock, ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
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
        // Buttery-smooth cubic easing for elegant, non-abrupt motion
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
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
        if (selectedTime) {
            setSelectedTime('');
            scrollToTarget(step3TimeRef);
            return;
        }
        if (selectedAdvisor && !isAdvisorLocked) {
            setSelectedAdvisor(null);
            setAdvisorConfirmed(false);
            scrollToTarget(step2AdvisorRef);
            return;
        }
        onClose();
    }, [bookingStep, selectedTime, selectedAdvisor, isAdvisorLocked, handleStepChange, setSelectedTime, setSelectedAdvisor, setAdvisorConfirmed, scrollToTarget, onClose]);

    // Handle Browser / Mobile Hardware Back Button (popstate)
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

    // Scroll to top when step changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [bookingStep]);

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

    // Keep every hook above this guard. The modal can be opened after an
    // initially closed render, and returning before hooks would violate React's
    // hook ordering and crash the booking flow.
    if (!isOpen) return null;

    if (!enablePsychology && !enableCareerMentoring && !isRescheduleParam) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div
                    className="relative w-full max-w-md max-h-screen sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto flex flex-col items-center justify-center text-center px-4 py-16 font-sans select-none"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface-100 hover:bg-surface-200 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                        <X className="w-5 h-5 text-surface-600" />
                    </button>
                    <div className="max-w-md w-full bg-white border border-surface-200 p-8 rounded-xl shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-surface-100 border border-surface-200 rounded-xl flex items-center justify-center mx-auto text-surface-900 shadow-sm">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm bg-surface-900 text-white px-3 py-1 rounded-xl font-semibold w-fit mx-auto block">
                                System Notice
                            </span>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-surface-900 ">
                                Bookings Paused
                            </h2>
                            <p className="text-xs sm:text-sm text-surface-600 leading-relaxed font-semibold ">
                                We are currently performing scheduled maintenance. Booking new sessions is temporarily offline.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-surface-900 hover:bg-surface-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-none w-full sm:w-auto text-center border-none"
                            >
                                Home Page
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    window.spaNavigate('/sample-test');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-3 min-h-[48px] bg-white border border-surface-200 hover:bg-surface-50 text-surface-900 text-sm font-semibold rounded-xl transition-all cursor-pointer w-full sm:w-auto text-center"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md overflow-hidden animate-backdrop-in">
            <SEO
                title="Book a Session | Psychological Counselling & Career Mentoring"
                description="Book an online, doorstep, or offline therapy session with certified clinical psychologists and career mentors on BEHOLD."
                canonicalUrl="https://www.behold.co.in/booking"
            />
            <div id="booking-modal-scroll" ref={scrollContainerRef} className={`relative w-full ${bookingStep === 'success' ? 'max-w-3xl' : 'max-w-7xl'} h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden text-[#0f172a] text-left overscroll-contain animate-modal-in transition-all duration-300 scroll-smooth`}>
                {/* Top Action Bar (Back & Close) */}
                <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-surface-200">
                    <button
                        type="button"
                        onClick={handleModalBack}
                        className="min-h-[38px] px-4 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-900 border border-surface-200 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs hover-scale-btn"
                        aria-label="Go Back"
                    >
                        <ArrowLeft className="w-4 h-4 text-surface-700" />
                        <span>Back</span>
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close Booking"
                        className="w-9 h-9 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer border-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div
                    className="min-h-full py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]"
                >
                    <div className="space-y-8 sm:space-y-10">

                        {/* BOOKING FORM */}
                        <div id="booking-console" className="space-y-6 sm:space-y-8 w-full">
                            <div className="flex flex-col items-center justify-center text-center gap-2 border-b border-surface-200 pb-4">
                                <h2 className="text-xl sm:text-2xl font-sans font-semibold uppercase text-[#0f172a] flex items-center justify-center gap-1">
                                    <span>Your Booking</span>
                                    <ScrollDot nextId="booking-console" label="Scroll down ↓" size="md" inlineText={true} />
                                </h2>
                            </div>

                            {/* Step Progress Banner */}
                            {bookingStep !== 'success' && (() => {
                                const stepMapping = { config: 0, payment: 1, success: 2 };
                                const currentStepIdx = stepMapping[bookingStep] || 0;
                                const stepLabels = ['Schedule & Advisor', 'Account & Payment', 'Session Confirmed'];
                                return (
                                    <div className="bg-white border border-surface-200 p-5 sm:p-6 space-y-5 rounded-xl shadow-xs animate-in fade-in duration-300">
                                        {/* Mobile: compact progress bar */}
                                        <div className="flex sm:hidden items-center gap-2">
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                <span className="text-xs font-semibold text-[#0f172a] shrink-0">
                                                    Step {currentStepIdx + 1} of 3
                                                </span>
                                                <div className="h-2 flex-1 bg-surface-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4] rounded-full transition-all duration-500"
                                                        style={{ width: `${((currentStepIdx + 1) / 3) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-[#0f172a] truncate">
                                                {stepLabels[currentStepIdx]}
                                            </span>
                                        </div>

                                        {/* Desktop/tablet: full stepper */}
                                        <div className="hidden sm:block">
                                            <div className="grid grid-cols-3 gap-6 w-full">
                                                {activeSteps.map((step, idx) => {
                                                    const isCompleted = idx < currentStepIdx;
                                                    const isActive = idx === currentStepIdx;

                                                    return (
                                                        <div key={idx} className="flex flex-col items-start gap-2 relative">
                                                            <div className="flex items-center w-full">
                                                                <div className={`flex items-center justify-center w-8 h-8 rounded-xl font-semibold text-xs border transition-all duration-300 shrink-0 ${isCompleted
                                                                    ? 'bg-[#0f172a] border-[#06b6d4] text-[#06b6d4] shadow-xs'
                                                                    : isActive
                                                                        ? 'bg-[#0f172a] border-[#06b6d4] text-[#06b6d4] shadow-sm ring-4 ring-[#06b6d4]/20'
                                                                        : 'bg-surface-100 border-surface-200 text-surface-400'
                                                                    }`}>
                                                                    {isCompleted ? '✓' : idx + 1}
                                                                </div>
                                                                {idx < activeSteps.length - 1 && (
                                                                    <div className={`h-[2px] w-full ml-3 transition-all duration-300 rounded-full ${isCompleted || isActive ? 'bg-[#0f172a]' : 'bg-surface-200'
                                                                        }`} />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col text-left min-w-0 mt-1">
                                                                <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-[#0f172a]' : isCompleted ? 'text-[#0f172a]' : 'text-surface-400'}`}>
                                                                    {stepLabels[idx]}
                                                                </span>
                                                                <span className={`text-[11px] transition-colors duration-300 mt-0.5 leading-relaxed ${isActive ? 'text-surface-600 font-medium' : 'text-surface-400'}`}>
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
                                /* STEP 5: Success & Confirmation View - Centered & Perfectly Balanced */
                                <div className="p-6 sm:p-10 bg-white border border-slate-200/90 rounded-3xl max-w-xl mx-auto shadow-xl shadow-slate-200/40 space-y-6 text-center animate-in fade-in duration-300 relative overflow-hidden">

                                    {/* Decorative background ambient glow */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00c9d6]/10 rounded-full blur-3xl pointer-events-none" />

                                    <style>{`
 @keyframes checkmark-circle {
 0% { transform: scale(0); opacity: 0; }
 100% { transform: scale(1); opacity: 1; }
 }
 @keyframes checkmark-draw {
 100% { stroke-dashoffset: 0; }
 }
 @keyframes scale-pop {
 0% { transform: translateY(12px); opacity: 0; }
 100% { transform: translateY(0); opacity: 1; }
 }
 .animate-checkmark-circle {
 animation: checkmark-circle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
 }
 .animate-checkmark-path {
 stroke-dasharray: 48;
 stroke-dashoffset: 48;
 animation: checkmark-draw 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
 }
 .animate-scale-pop {
 opacity: 0;
 animation: scale-pop 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.4s forwards;
 }
 .animate-card-fade {
 opacity: 0;
 animation: scale-pop 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.6s forwards;
 }
 `}</style>

                                    <div className="relative w-20 h-20 bg-[#00c9d6]/10 border border-[#00c9d6]/30 rounded-full flex items-center justify-center mx-auto text-[#00c9d6] shadow-sm animate-checkmark-circle z-10">
                                        <svg className="w-10 h-10 text-[#00c9d6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path className="animate-checkmark-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    <div className="space-y-2 animate-scale-pop relative z-10 text-center flex flex-col items-center justify-center">
                                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-md font-semibold w-fit mx-auto block shadow-xs">
                                            {rescheduleSession ? 'Reschedule Requested' : 'Session Confirmed & Paid'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-semibold font-sans text-slate-900 tracking-tight mt-2">
                                            {rescheduleSession ? 'Reschedule Requested' : "Booking Confirmed!"}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-normal mt-1">
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
                                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-xs animate-card-fade relative z-10">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-2">
                                            <span className="text-xs font-semibold text-slate-500">
                                                {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation Summary'}
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
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

                                        {/* Google Meet Link if Online */}
                                        {bookingMode === 'ONLINE' && !rescheduleSession && (
                                            <div className="pt-4 border-t border-slate-200/80 mt-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                                                            Google Meet Link
                                                        </span>
                                                        <span className="text-xs text-slate-900 font-semibold truncate block">
                                                            {confirmedBooking?.meetLink || confirmedMeetLink || selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const linkToCopy = confirmedBooking?.meetLink || confirmedMeetLink || selectedAdvisor?.defaultMeetLink || 'https://meet.google.com/abc-defg-hij';
                                                            navigator.clipboard.writeText(linkToCopy);
                                                            setCopiedMeet(true);
                                                            setTimeout(() => setCopiedMeet(false), 2000);
                                                        }}
                                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center border-none shadow-xs whitespace-nowrap shrink-0"
                                                    >
                                                        {copiedMeet ? 'Copied!' : 'Copy Link'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-semibold animate-card-fade pt-1 relative z-10">
                                        {rescheduleSession ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    window.location.href = '/profile?tab=booked';
                                                }}
                                                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-sm"
                                            >
                                                Go to My Sessions
                                            </button>
                                        ) : (
                                            <>
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
                                                    className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                                                >
                                                    <FileDown className="w-4 h-4 text-slate-500" />
                                                    {downloadingPdf ? 'Generating PDF...' : 'Download Receipt'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        window.location.href = '/profile?tab=booked';
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer text-center shadow-sm"
                                                >
                                                    View My Sessions
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* STEP 1-4 Wizard flow Grid */
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                                    {/* Left Column: Active Step Form Panel */}
                                    <div className="lg:col-span-8 text-left min-h-[380px] relative">
                                        {/* STEP 1: Advisor & Schedule */}
                                        {bookingStep === 'config' && (
                                            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                                                
                                                {/* STEP 1 — SELECT SERVICE & SESSION PLAN */}
                                                <div ref={step1Ref} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 text-left">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="w-7 h-7 rounded-xl bg-slate-900 text-[#00c9d6] text-xs flex items-center justify-center font-extrabold shadow-xs">
                                                                1
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
                                                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
                                                            Step 1
                                                        </span>
                                                    </div>

                                                    {/* Service Type & Mode Selection (Clean Flat Segmented Controls) */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                                                        {/* Service Type */}
                                                        <div className="space-y-2">
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Service Type</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={rescheduleSession}
                                                                    onClick={() => {
                                                                        setBookingService('counselling');
                                                                        scrollToTarget(step2AdvisorRef);
                                                                    }}
                                                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                        bookingService === 'counselling'
                                                                            ? 'bg-slate-900 text-[#00c9d6] shadow-sm ring-2 ring-[#00c9d6]/50'
                                                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                                                    }`}
                                                                >
                                                                    <span>🧠 Psychological Counselling</span>
                                                                </button>
                                                                {enableCareerMentoring && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingService('career');
                                                                            scrollToTarget(step2AdvisorRef);
                                                                        }}
                                                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                            bookingService === 'career'
                                                                                ? 'bg-slate-900 text-[#00c9d6] shadow-sm ring-2 ring-[#00c9d6]/50'
                                                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                                                        }`}
                                                                    >
                                                                        <span>🧭 Career Mentoring</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Session Mode */}
                                                        <div className="space-y-2">
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Session Mode</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={rescheduleSession}
                                                                    onClick={() => {
                                                                        setBookingMode('ONLINE');
                                                                        scrollToTarget(step2AdvisorRef);
                                                                    }}
                                                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                        bookingMode === 'ONLINE'
                                                                            ? 'bg-slate-900 text-[#00c9d6] shadow-sm ring-2 ring-[#00c9d6]/50'
                                                                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                                                    }`}
                                                                >
                                                                    <span>🎥 Online — Video Call</span>
                                                                </button>
                                                                {enableDoorstep && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingMode('DOOR_STEP');
                                                                            scrollToTarget(step2AdvisorRef);
                                                                        }}
                                                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                            bookingMode === 'DOOR_STEP'
                                                                                ? 'bg-slate-900 text-[#00c9d6] shadow-sm ring-2 ring-[#00c9d6]/50'
                                                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                                                        }`}
                                                                    >
                                                                        <span>🏠 Doorstep Visit</span>
                                                                    </button>
                                                                )}
                                                                {enableOffline && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => {
                                                                            setBookingMode('OFFLINE');
                                                                            scrollToTarget(step2AdvisorRef);
                                                                        }}
                                                                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                                                            bookingMode === 'OFFLINE'
                                                                                ? 'bg-slate-900 text-[#00c9d6] shadow-sm ring-2 ring-[#00c9d6]/50'
                                                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                                                        }`}
                                                                    >
                                                                        <span>🏢 In-Center Visit</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Session Plan Selector: Introductory (₹499) vs Standard (₹899) */}
                                                    <div className="space-y-3 pt-1">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                                                                Choose Session Plan
                                                            </label>
                                                            {!isIntroductoryEligible && (
                                                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                                                    <span>✓</span> Introductory Session Completed
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isIntroductoryEligible ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {/* 1. Introductory Session */}
                                                                <button
                                                                    type="button"
                                                                    disabled={rescheduleSession}
                                                                    onClick={() => {
                                                                        setBookingDuration(30);
                                                                        scrollToTarget(step2AdvisorRef);
                                                                    }}
                                                                    className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border-2 relative ${
                                                                        bookingDuration === 30
                                                                            ? 'border-[#00c9d6] bg-teal-50/30 ring-2 ring-[#00c9d6]/30 shadow-xs'
                                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                                    }`}
                                                                >
                                                                    <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-teal-100/80 text-teal-800 border border-teal-200/60">
                                                                            ✨ One-Time Intro Offer
                                                                        </span>
                                                                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 shrink-0">
                                                                            ₹{selectedAdvisor ? (selectedAdvisor.halfSessionPrice || 499) : 499}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <h4 className="font-bold text-base text-slate-900">Introductory Session</h4>
                                                                            {bookingDuration === 30 && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                                            30 Minutes • First session consultation & assessment
                                                                        </p>
                                                                    </div>
                                                                </button>

                                                                {/* 2. Standard Session */}
                                                                <button
                                                                    type="button"
                                                                    disabled={rescheduleSession}
                                                                    onClick={() => {
                                                                        setBookingDuration(60);
                                                                        scrollToTarget(step2AdvisorRef);
                                                                    }}
                                                                    className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left border-2 relative ${
                                                                        bookingDuration === 60
                                                                            ? 'border-[#00c9d6] bg-teal-50/30 ring-2 ring-[#00c9d6]/30 shadow-xs'
                                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                                    }`}
                                                                >
                                                                    <div className="w-full flex items-center justify-between gap-2 mb-3">
                                                                        <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                                            Comprehensive
                                                                        </span>
                                                                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 shrink-0">
                                                                            ₹{selectedAdvisor ? (selectedAdvisor.price || 899) : 899}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <h4 className="font-bold text-base text-slate-900">Standard Session</h4>
                                                                            {bookingDuration === 60 && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                                            1 Hour (60 Minutes) • Full comprehensive therapeutic consultation
                                                                        </p>
                                                                    </div>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-teal-50/40 rounded-2xl border-2 border-[#00c9d6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                                                                            Full Therapeutic Care
                                                                        </span>
                                                                        <span className="text-xs text-slate-600 font-semibold">1 Hour (60 Mins)</span>
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

                                                    {/* DOORSTEP LOCATION INPUTS IF ACTIVE */}
                                                    {bookingMode === 'DOOR_STEP' && (
                                                        <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                                            <div className="border-b border-slate-200 pb-2">
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
                                                                        className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-[#00c9d6] rounded-xl transition"
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
                                                                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition cursor-pointer shrink-0 border-none"
                                                                    >
                                                                        {isClientSearching ? 'Searching...' : 'Search'}
                                                                    </button>
                                                                </div>

                                                                {clientSearchResults.length > 0 && (
                                                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto z-50 shadow-md divide-y divide-slate-100">
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
                                                                                className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 font-medium hover:bg-slate-50 transition-colors block truncate"
                                                                            >
                                                                                {res.display_name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* STEP 2 — SELECT PSYCHOLOGIST */}
                                                <div ref={step2AdvisorRef} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 text-left">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="w-7 h-7 rounded-xl bg-slate-900 text-[#00c9d6] text-xs flex items-center justify-center font-extrabold shadow-xs">
                                                                2
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
                                                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-lg uppercase tracking-wider hidden sm:inline-block">
                                                            Step 2
                                                        </span>
                                                    </div>

                                                    {/* Active Selection Quick Banner */}
                                                    {selectedAdvisor && (
                                                        <div className="p-3 bg-gradient-to-r from-teal-50/80 via-cyan-50/40 to-white border border-[#00c9d6]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="w-2.5 h-2.5 rounded-full bg-[#00c9d6] animate-pulse shrink-0" />
                                                                <span className="font-bold text-slate-900 truncate">
                                                                    Selected: <strong className="text-teal-800">{selectedAdvisor.name}</strong> • ₹{bookingDuration === 30 ? (selectedAdvisor.halfSessionPrice || 499) : (selectedAdvisor.price || 899)} ({bookingDuration === 30 ? '30m Plan' : '1h Plan'})
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] font-bold text-teal-700 shrink-0 hidden sm:inline-block">
                                                                Choose Date & Time below ↓
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Psychologist Cards List */}
                                                    <div className="space-y-3">
                                                        {(() => {
                                                            const filtered = advisors.filter(adv => {
                                                                const match = !bookingService || adv.type === bookingService || (bookingService === 'counselling' && adv.type !== 'career');
                                                                return match;
                                                            });

                                                            if (filtered.length === 0) {
                                                                return (
                                                                    <div className="p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-600 text-center font-medium text-xs">
                                                                        No psychologists found matching your selection.
                                                                    </div>
                                                                );
                                                            }

                                                            const sortedAdvisors = [...filtered].sort((a, b) => {
                                                                const aInfo = getAdvisorEarliestAvailableInfo(a);
                                                                const bInfo = getAdvisorEarliestAvailableInfo(b);
                                                                if (aInfo.available && !bInfo.available) return -1;
                                                                if (bInfo.available && !aInfo.available) return 1;
                                                                return bInfo.slotCount - aInfo.slotCount;
                                                            });

                                                            const totalPages = Math.max(1, Math.ceil(sortedAdvisors.length / 4));
                                                            const currentPage = Math.min(effectiveAdvisorPage, totalPages);
                                                            const advisorsToRender = sortedAdvisors.slice((currentPage - 1) * 4, currentPage * 4);

                                                            return (
                                                                <>
                                                                    {advisorsToRender.map((advisor) => {
                                                                        const info = getAdvisorEarliestAvailableInfo(advisor);
                                                                        const isAvailable = info.available;
                                                                        const isSelected = selectedAdvisor?.id === advisor.id;

                                                                        return (
                                                                            <div
                                                                                key={advisor.id}
                                                                                onClick={() => {
                                                                                    if (!isAvailable) return;
                                                                                    setSelectedAdvisor(advisor);
                                                                                    setAdvisorConfirmed(true);
                                                                                    setSelectedTime('');
                                                                                    if (errors.advisor) setErrors(prev => ({ ...prev, advisor: null }));
                                                                                    scrollToTarget(step3TimeRef);
                                                                                }}
                                                                                className={`group p-4 sm:p-5 border-2 bg-white rounded-2xl transition-all duration-300 relative overflow-hidden shadow-xs cursor-pointer hover:-translate-y-0.5 ${
                                                                                    isSelected
                                                                                        ? 'border-[#00c9d6] ring-2 ring-[#00c9d6]/50 bg-teal-50/30 shadow-md'
                                                                                        : isAvailable
                                                                                        ? 'border-slate-200 hover:border-teal-500 hover:shadow-md'
                                                                                        : 'border-slate-100 opacity-70 hover:opacity-100'
                                                                                }`}
                                                                            >
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                                                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0 flex items-center justify-center border-2 bg-white shadow-xs overflow-hidden relative transition-colors ${isSelected ? 'border-[#00c9d6]' : 'border-slate-200 group-hover:border-[#00c9d6]'}`}>
                                                                                            {advisor.profilePic || advisor.image ? (
                                                                                                <img
                                                                                                    src={advisor.profilePic || advisor.image}
                                                                                                    alt={advisor.name}
                                                                                                    className="w-full h-full object-cover"
                                                                                                />
                                                                                            ) : (
                                                                                                <span className="font-bold text-xl text-teal-600">
                                                                                                    {getInitials(advisor.name)}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="space-y-1 min-w-0 flex-1">
                                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                                <h4 className={`font-bold text-base sm:text-lg transition-colors truncate ${isSelected ? 'text-teal-950 font-extrabold' : 'text-slate-900 group-hover:text-teal-700'}`}>
                                                                                                    {advisor.name}
                                                                                                </h4>
                                                                                                <span className="text-xs text-slate-500 font-semibold">
                                                                                                    • {advisor.role || 'Consultant Psychologist'}
                                                                                                </span>
                                                                                            </div>

                                                                                            {advisor.bio && (
                                                                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                                                                    {advisor.bio}
                                                                                                </p>
                                                                                            )}

                                                                                            {advisor.specialties?.length > 0 && (
                                                                                                <div className="flex flex-wrap gap-1 pt-1">
                                                                                                    {advisor.specialties.slice(0, 3).map((spec, i) => (
                                                                                                        <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-md">
                                                                                                            {spec}
                                                                                                        </span>
                                                                                                    ))}
                                                                                                    {advisor.specialties.length > 3 && (
                                                                                                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold rounded-md">
                                                                                                            +{advisor.specialties.length - 3}
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
                                                                                            <div className="px-4 py-2 bg-[#00c9d6] text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 shadow-xs">
                                                                                                <span>✓ Selected</span>
                                                                                            </div>
                                                                                        ) : isAvailable ? (
                                                                                            <div className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl group-hover:bg-[#00c9d6] group-hover:text-slate-950 transition-all flex items-center gap-1 shadow-xs">
                                                                                                <span>Select</span>
                                                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
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
                                                                                className="w-8 h-8 rounded-lg text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
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
                                                                                    className={`w-8 h-8 rounded-lg text-xs font-bold border flex items-center justify-center cursor-pointer ${
                                                                                        advisorPage === num
                                                                                            ? 'bg-slate-900 text-[#00c9d6] border-slate-900 shadow-xs'
                                                                                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
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
                                                                                className="w-8 h-8 rounded-lg text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                                                                            >
                                                                                ›
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {errors.advisor && <p className="text-xs text-rose-500 font-medium">{errors.advisor}</p>}
                                                </div>

                                                {/* STEP 3 & 4 — SCHEDULE THE SESSION & TIME SLOT */}
                                                {selectedAdvisor && (
                                                    <div ref={step3TimeRef} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {/* TimePicker with Today slots by default and Choose Another Date button */}
                                                        <TimePicker
                                                            selectedDate={selectedDate}
                                                            selectedTime={selectedTime}
                                                            bookingDuration={bookingDuration}
                                                            onDateChange={(d) => handleDateChange(d)}
                                                            onTimeChange={(t) => {
                                                                setSelectedTime(t);
                                                                if (errors.time) setErrors(prev => ({ ...prev, time: null }));
                                                                scrollToTarget(stepSummaryRef);
                                                            }}
                                                            availableSlots={getAdvisorSlotsForDate(selectedAdvisor, selectedDate)}
                                                            bookedSlots={getAdvisorBookedSlotsForDate(selectedAdvisor, selectedDate)}
                                                            errors={errors}
                                                            onOpenDatePicker={() => setIsDatePickerOpen(true)}
                                                        />

                                                        {/* Modal Date Picker (On-Demand, does not clutter main screen) */}
                                                        <DateTimePicker
                                                            isOpen={isDatePickerOpen}
                                                            onClose={() => setIsDatePickerOpen(false)}
                                                            selectedDate={selectedDate}
                                                            selectedAdvisorName={selectedAdvisor.name}
                                                            onDateChange={(d) => {
                                                                handleDateChange(d);
                                                                setIsDatePickerOpen(false);
                                                            }}
                                                            getAvailableSlotsForDate={(date) => getAdvisorSlotsForDate(selectedAdvisor, date)}
                                                        />

                                                        {/* STEP 6 & 7 — COMPACT BOOKING SUMMARY & PROCEED TO PAYMENT */}
                                                        {selectedTime && (
                                                            <div ref={stepSummaryRef} className="p-5 sm:p-6 bg-white rounded-2xl shadow-sm border-2 border-slate-200 space-y-4 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#00c9d6] animate-pulse" />
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
                                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Psychologist</span>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-bold text-slate-900 text-sm truncate">{selectedAdvisor.name}</span>
                                                                            {!isAdvisorLocked && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => { setSelectedAdvisor(null); setSelectedTime(''); }}
                                                                                    className="text-[11px] text-teal-600 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Service & Mode</span>
                                                                        <span className="font-bold text-slate-900 text-sm block">
                                                                            {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'} • {bookingMode === 'ONLINE' ? 'Online Video Call' : bookingMode === 'DOOR_STEP' ? 'Doorstep Visit' : 'In-Center'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Session Plan</span>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-bold text-slate-900 text-sm">
                                                                                {bookingDuration === 30 ? 'Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                                            </span>
                                                                            {isIntroductoryEligible && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setBookingDuration(bookingDuration === 30 ? 60 : 30)}
                                                                                    className="text-[11px] text-teal-600 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                                >
                                                                                    Switch
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-bold text-slate-900 text-sm">
                                                                                {formatDateString(selectedDate)} at {selectedTime}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setIsDatePickerOpen(true)}
                                                                                className="text-[11px] text-teal-600 hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                                                            >
                                                                                Change
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Primary Proceed Action */}
                                                                {!rescheduleSession && (
                                                                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                                        <div className="text-left w-full sm:w-auto">
                                                                            <span className="text-[11px] text-slate-400 block font-medium">Total Amount Payable</span>
                                                                            <span className="text-2xl font-extrabold text-slate-900">₹{netTotal}</span>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            disabled={!selectedAdvisor || !selectedDate || !selectedTime}
                                                                            onClick={() => handleStepChange('payment')}
                                                                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            <span>Proceed to Payment (₹{netTotal})</span>
                                                                            <ArrowRight className="w-4 h-4 stroke-[3] text-[#00c9d6]" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Reschedule confirmation button */}
                                                        {rescheduleSession && (
                                                            <div className="flex items-center justify-end pt-4">
                                                                <button
                                                                    type="button"
                                                                    disabled={!selectedDate || !selectedTime || isSubmitting}
                                                                    onClick={handleRescheduleConfirm}
                                                                    className="px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
                                                                >
                                                                    {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                                                                </button>
                                                            </div>
                                                        )}
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
                                                            <span className="w-6 h-6 rounded-md bg-surface-900 text-white text-xs flex items-center justify-center shrink-0 font-medium">2</span>
                                                            Payment & Confirm
                                                        </h3>
                                                        <p className="text-sm font-normal text-surface-600 mt-1">
                                                            {user ? 'Review your details and complete payment.' : 'Please enter your details to receive session link & confirmation.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Contact Details Card */}
                                                <div className="bg-white border border-surface-200 rounded-xl p-4 sm:p-5 space-y-4 text-left shadow-xs">
                                                    {/* Session Overview Pill */}
                                                    <div className="bg-[#0f172a] text-white rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#00c9d6] block">
                                                                {bookingDuration === 30 ? '✨ Introductory Session (30 Mins)' : 'Standard Session (1 Hour)'}
                                                            </span>
                                                            <span className="text-xs font-semibold text-slate-200">
                                                                {selectedAdvisor?.name} • {selectedDate} at {selectedTime}
                                                            </span>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="text-base font-extrabold text-[#00c9d6]">₹{netTotal}</span>
                                                            <span className="text-[10px] text-slate-400 block">Total Payable</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-b border-surface-100 pb-2.5">
                                                        <h4 className="text-xs font-bold text-surface-900 uppercase tracking-wider">
                                                            Client & Booking Contact Details
                                                        </h4>
                                                        {user && (
                                                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                                                ✓ Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {/* Full Name */}
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
                                                                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium text-zinc-900 outline-none transition ${errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-200 focus:border-[#00c9d6] bg-zinc-50 focus:bg-white'
                                                                    }`}
                                                            />
                                                            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                                                        </div>

                                                        {/* Email Address */}
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
                                                                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-medium text-zinc-900 outline-none transition ${errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-zinc-200 focus:border-[#00c9d6] bg-zinc-50 focus:bg-white'
                                                                    }`}
                                                            />
                                                            {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* DOORSTEP LOCATION SUMMARY - PAYMENT STEP */}
                                                {bookingMode === 'DOOR_STEP' && (
                                                    <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-xl text-left space-y-1 animate-in fade-in duration-300">
                                                        <span className="font-semibold text-surface-900 block text-sm">
                                                            Doorstep Visit Location
                                                        </span>
                                                        <p className="font-semibold text-sm text-surface-900">{bookingForm.clientLocationName}</p>
                                                        <p className="text-sm text-surface-500 font-semibold">
                                                            Coordinates: {bookingForm.clientLatitude}, {bookingForm.clientLongitude}
                                                        </p>
                                                        {(() => {
                                                            const distance = getCalculatedDistance();
                                                            if (distance !== null) {
                                                                return (
                                                                    <span className="inline-block mt-1.5 font-semibold text-surface-900 bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-xl text-sm">
                                                                        ✓ Distance: {distance.toFixed(2)} km away
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}

                                                {/* OFFLINE LOCATION SUMMARY - PAYMENT STEP */}
                                                {bookingMode === 'OFFLINE' && selectedAdvisor && (
                                                    <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-xl text-left space-y-1.5 animate-in fade-in duration-300">
                                                        <span className="font-semibold text-surface-900 block text-sm">
                                                            Office / Center Visit Address
                                                        </span>
                                                        <p className="font-semibold text-sm text-surface-900 flex items-start gap-1.5 leading-relaxed ">
                                                            <svg className="w-3.5 h-3.5 text-surface-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>{selectedAdvisor.locationName || 'Clinic/Center address not set'}</span>
                                                        </p>
                                                    </div>
                                                )}

                                                <form onSubmit={handlePaymentSubmit} className="space-y-6">

                                                    {/* Razorpay Gateway Notice */}
                                                    <div className="p-4 bg-surface-50 border border-surface-200 rounded-xl space-y-2">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="w-10 h-10 bg-white border border-surface-200 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
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

                                                    {/* Informed Client Consent & Agreement Card */}
                                                    <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 border border-slate-200/90 rounded-2xl text-left space-y-4 shadow-xs">
                                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-sm font-bold text-slate-900 leading-tight">Informed Client Consent & Agreement</h5>
                                                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Please review the professional care disclosures before confirming</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 px-2 py-0.5 rounded-md">
                                                                Required
                                                            </span>
                                                        </div>

                                                        {/* Summary Key Points */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-800 block text-[11px]">Strict Confidentiality</span>
                                                                    <span className="text-[10.5px] text-slate-500">Session notes & discussions protected under clinical ethics.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-800 block text-[11px]">Voluntary Care</span>
                                                                    <span className="text-[10.5px] text-slate-500">Collaborative process with freedom to ask questions anytime.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-800 block text-[11px]">24-Hour Full Refund</span>
                                                                    <span className="text-[10.5px] text-slate-500">100% refund for cancellations made 24+ hours in advance.</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                                                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                                <div className="leading-snug">
                                                                    <span className="font-bold text-slate-800 block text-[11px]">Crisis Disclaimer</span>
                                                                    <span className="text-[10.5px] text-slate-500">Scheduled consultations; not a 24/7 suicide crisis line.</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Read Full Form Link */}
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
                                                                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span>Read Full Informed Consent Document</span>
                                                            </button>
                                                        </div>

                                                        {/* Agreement Checkbox */}
                                                        <div className="flex items-start gap-3 pt-3 border-t border-slate-200/80 bg-slate-50/50 p-3 rounded-xl">
                                                            <input
                                                                type="checkbox"
                                                                id="booking-consent-checkbox"
                                                                checked={termsAgreed}
                                                                onChange={(e) => setTermsAgreed(e.target.checked)}
                                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-[#00c9d6] cursor-pointer shrink-0"
                                                            />
                                                            <label htmlFor="booking-consent-checkbox" className="text-xs text-slate-700 font-medium leading-relaxed cursor-pointer select-none">
                                                                I confirm that I have read, understood, and voluntarily agree to the{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs ? onOpenDocs('consent') : setShowConsentModal(true)}
                                                                    className="font-bold text-teal-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Informed Consent Agreement
                                                                </button>
                                                                ,{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('terms')}
                                                                    className="font-bold text-teal-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                >
                                                                    Platform Terms
                                                                </button>
                                                                , and{' '}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onOpenDocs?.('refund')}
                                                                    className="font-bold text-teal-600 hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
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
                                                            className={`px-8 py-4 min-h-[48px] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-none w-full sm:w-auto order-1 sm:order-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9d6] focus-visible:ring-offset-2 ${!termsAgreed || isProcessingPayment
                                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                                                                    : 'bg-[#0f172a] hover:bg-black text-[#00c9d6] hover:text-white cursor-pointer active:scale-[0.98] shadow-lg'
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
                                    <div className="lg:col-span-4 lg:sticky lg:top-20 text-left">
                                        {/* Mobile toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setShowSummary(!showSummary)}
                                            className="flex lg:hidden items-center justify-between w-full bg-surface-50 border border-surface-200 p-3 rounded-xl text-left shadow-none mb-3 hover:bg-surface-100 transition cursor-pointer"
                                        >
                                            <span className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                                                <span>Booking Summary</span>
                                                {selectedAdvisor && (
                                                    <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-xl font-semibold ">
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

                                        <div className={`space-y-5 ${showSummary ? 'block' : 'hidden'} lg:block bg-white/80 backdrop-blur-md border border-surface-200 shadow-xs rounded-2xl p-5 sm:p-6 mb-6`}>
                                            <div>
                                                <h3 className="text-base font-semibold text-surface-900 border-b border-surface-200 pb-3 hidden lg:block">
                                                    Booking Summary
                                                </h3>
                                            </div>

                                            <div className="space-y-5 text-sm font-semibold ">
                                                {/* Service type & Mode */}
                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Service & Mode</span>
                                                    <span className="font-semibold text-surface-900 block text-left">
                                                        {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
                                                    </span>
                                                    <span className="text-xs text-surface-500 font-semibold block mt-0.5 bg-white border border-surface-200 rounded-xl px-2 py-0.5 w-fit">
                                                        {bookingMode === 'DOOR_STEP' ? 'Door Step' : bookingMode.charAt(0).toUpperCase() + bookingMode.slice(1).toLowerCase()}
                                                    </span>
                                                </div>

                                                {/* Session Plan & Duration */}
                                                <div>
                                                    <span className="text-xs text-surface-400 block font-semibold mb-0.5">Session Plan</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-surface-900 block text-left">
                                                            {bookingDuration === 30 ? 'Introductory Session' : 'Standard Session'}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${bookingDuration === 30 ? 'bg-cyan-50 text-[#0891b2] border border-cyan-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                                            {bookingDuration === 30 ? '30 Mins' : '1 Hour'}
                                                        </span>
                                                    </div>
                                                    {bookingDuration === 30 && (
                                                        <span className="text-[11px] text-[#0891b2] font-semibold mt-0.5 block">
                                                            Special First-Time Client Fee • ₹{baseFee}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Date & Time Slot */}
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

                                                {/* Selected Advisor */}
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

                                                {/* Coupon Promo code input box */}
                                                <div className="pt-3 border-t border-surface-200 space-y-2 text-left">
                                                    <span className="text-xs text-surface-500 block font-semibold">Have a Promo Code?</span>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. BEHOLD100"
                                                            value={couponInput}
                                                            onChange={(e) => setCouponInput(e.target.value)}
                                                            disabled={appliedDiscount > 0}
                                                            className="flex-1 px-3 py-1.5 bg-white border border-surface-200 rounded-xl text-sm font-semibold outline-none focus:border-surface-900 transition"
                                                        />
                                                        {appliedDiscount > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveCoupon}
                                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyCoupon}
                                                                className="px-3.5 py-1.5 bg-surface-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition cursor-pointer border-none "
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

                                                {/* Invoice ledger calculation breakdown */}
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

                                                {/* Security badge */}
                                                <div className="pt-4 border-t border-surface-200 text-sm font-semibold text-surface-400 text-center w-full">
                                                    <span>SSL Secure Checkout</span>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* Mobile Sticky Quick-Proceed Action Bar */}
                            {bookingStep === 'config' && selectedAdvisor && selectedTime && !rescheduleSession && (
                                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
                                    <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
                                        <div className="text-left min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-extrabold text-white text-xs truncate">
                                                    {selectedAdvisor.name}
                                                </span>
                                                <span className="text-[10px] text-[#00c9d6] font-bold">
                                                    • {selectedTime}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 block">
                                                Total: <strong className="text-[#00c9d6] text-sm">₹{netTotal}</strong>
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleStepChange('payment')}
                                            className="px-5 py-2.5 bg-[#00c9d6] hover:bg-[#00b5c0] text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer border-none shrink-0"
                                        >
                                            <span>Proceed</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                                        </button>
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
                        <div className="bg-white border border-surface-200 rounded-xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm text-xl font-semibold ">
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
                                className="w-full py-2.5 bg-surface-900 hover:bg-black text-white font-semibold text-xs rounded-xl cursor-pointer transition border-none shadow-none"
                            >
                                OK
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
                {/* Standalone Informed Consent Modal */}
                {showConsentModal && typeof document !== 'undefined' && createPortal(
                    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
                                        <ShieldCheck className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">Informed Consent Agreement</h3>
                                        <p className="text-[11px] text-slate-500 font-medium">Professional Psychological Counselling & Mentorship</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConsentModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                                    title="Close modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto text-slate-700 text-xs font-medium leading-relaxed space-y-4 max-h-[60vh] custom-scrollbar">
                                <div className="p-3 bg-teal-50/60 border border-teal-200/60 rounded-xl text-teal-900 text-[11px] leading-relaxed">
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
                                    } catch (e) {}

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

                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setShowConsentModal(false)}
                                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition border border-slate-300 shadow-xs"
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
                                    className="px-5 py-2.5 bg-[#0f172a] hover:bg-black text-[#00c9d6] hover:text-white font-bold text-xs rounded-xl cursor-pointer transition border-none shadow-sm flex items-center gap-1.5"
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


