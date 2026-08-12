import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBookingViewModel } from './useBookingViewModel';
import DateTimePicker from './DateTimePicker';
import TimePicker from './TimePicker';
import BookingAuthModal from './BookingAuthModal';
import { FileDown, X } from 'lucide-react';
import { formatDateString } from '../../utils/dateFormatter';
import toast from 'react-hot-toast';
import { ScrollDot } from '../../components/common/BrandDot';

const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const COUNSELLING_FLOW = {
    online: [
        "Schedule Date, Time & choose consultant psychologist",
        "Fill user profile & process online payment fee",
        "Access Google Meet link, schedule, & WhatsApp notifications"
    ],
    doorstep: [
        "Schedule Date, Time & choose consultant psychologist",
        "Fill user profile & process online payment fee",
        "Receive doorstep counselor assignment & WhatsApp notifications"
    ],
    offline: [
        "Schedule Date, Time & choose consultant psychologist",
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
        bookingForm,
        setBookingForm,
        selectedDate,
        selectedTime,
        setSelectedTime,
        selectedAdvisor,
        setSelectedAdvisor,
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

    const step2Ref = useRef(null);
    const step3Ref = useRef(null);
    const scrollContainerRef = useRef(null);

    const [expandedBios, setExpandedBios] = useState({});
    const [expandedSpecialties, setExpandedSpecialties] = useState({});
    const [termsAgreed, setTermsAgreed] = useState(false);

    const isAdvisorLocked = !!preselectedAdvisorId;
    const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
    const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

    const [clientSearchQuery, setClientSearchQuery] = useState(bookingForm.clientLocationName || '');
    const [advisorPage, setAdvisorPage] = useState(1);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto overscroll-contain animate-backdrop-in">
            <div id="booking-modal-scroll" ref={scrollContainerRef} className="relative w-full max-w-7xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden text-[#0f172a] text-left overscroll-contain animate-modal-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white border border-surface-200 shadow-sm hover:bg-surface-50 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5 text-surface-600" />
                </button>

                <div
                    className="min-h-full py-10 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]"
                >
                    <div className="space-y-8 sm:space-y-10">

                        {/* Header */}
                        <div className="text-center flex flex-col items-center space-y-3">
                            <span className="inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-[#00c9d6] tracking-widest uppercase mb-2 text-center">
                                <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
                                {rescheduleSession ? 'RESCHEDULE SESSION' : 'BOOK A CONFIDENTIAL SESSION'}
                                <span className="w-5 h-px bg-[#00c9d6]/60 inline-block" />
                            </span>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-semibold uppercase tracking-tight leading-none text-[#0f172a] flex items-center justify-center flex-wrap gap-1">
                                <span>{rescheduleSession ? 'Reschedule Your Session' : 'Book Your Session'}</span>
                                <ScrollDot nextId="booking-console" label="Scroll to booking form ↓" size="md" inlineText={true} />
                            </h1>
                            <p className="text-surface-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
                                {rescheduleSession
                                    ? `Reschedule your appointment with ${rescheduleSession.advisorName || rescheduleSession.counsellorName}. Pick a new date and time.`
                                    : 'Choose your service, pick a date and time, and confirm with a certified specialist.'}
                            </p>
                        </div>

                        {/* BOOKING FORM */}
                        <div id="booking-console" className="space-y-6 sm:space-y-8 w-full mt-6">
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
                                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full font-semibold w-fit mx-auto block shadow-xs">
                                            {rescheduleSession ? 'Reschedule Requested' : 'Session Confirmed & Paid'}
                                        </span>
                                        <h3 className="text-2xl sm:text-3xl font-semibold font-sans text-slate-900 tracking-tight mt-2">
                                            {rescheduleSession ? 'Reschedule Requested' : "Booking Confirmed!"}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-normal mt-1">
                                            {rescheduleSession ? (
                                                <>
                                                    Your reschedule request for <strong className="font-semibold text-slate-900">{bookingForm.name || user?.name || 'User'}</strong> has been submitted to <strong className="font-semibold text-slate-900">{selectedAdvisor?.name}</strong>.
                                                </>
                                            ) : (
                                                <>
                                                    Thank you, <strong className="font-semibold text-slate-900">{bookingForm.name || 'User'}</strong>. Your payment is verified and your session is successfully booked.
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
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
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
                                                <span className="text-slate-500 block font-medium text-[11px]">Date & Time Slot</span>
                                                <span className="font-semibold text-slate-900 text-sm block">
                                                    {formatDateString(confirmedBooking?.date || selectedDate)}
                                                </span>
                                                <span className="text-slate-500 block font-normal text-xs">
                                                    {confirmedBooking?.time || selectedTime}
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
                                                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition cursor-pointer text-center shadow-sm"
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
                                                            advisorName,
                                                            advisorRole,
                                                            date: confirmedBooking?.date || selectedDate,
                                                            time: confirmedBooking?.time || selectedTime,
                                                            clientName,
                                                            clientEmail,
                                                            clientPhone,
                                                            amount,
                                                            meetLink,
                                                            baseFee: confirmedBooking?.amountPaid ? (confirmedBooking?.amountPaid - (gstEnabled ? gstAmount : 0)) : baseFee,
                                                            gstPercent: gstEnabled ? gstPercent : 0,
                                                            gstAmount: gstEnabled ? gstAmount : 0,
                                                            appliedDiscount: appliedDiscount
                                                        });
                                                    }}
                                                    className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-semibold rounded-full transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                                                >
                                                    <FileDown className="w-4 h-4 text-slate-500" />
                                                    {downloadingPdf ? 'Generating PDF...' : 'Download Receipt'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        window.location.href = '/profile?tab=booked';
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition cursor-pointer text-center shadow-sm"
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

                                        {/* STEP 1: Schedule & Advisor */}
                                        {bookingStep === 'config' && (
                                            <div className="space-y-6 animate-in fade-in duration-300">
                                                <div className="border-b border-surface-200 pb-3">
                                                    <h3 className="text-base sm:text-lg font-semibold text-surface-900 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-md bg-surface-900 text-white text-xs flex items-center justify-center shrink-0 font-semibold">1</span>
                                                        Schedule & Advisor
                                                    </h3>
                                                    <p className="text-sm text-surface-600 mt-1">Select a date, choose your psychologist, and pick a time.</p>
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Selected Psychologist Banner Card */}
                                                    {selectedAdvisor && (
                                                        <div className="p-4 bg-gradient-to-r from-teal-50 via-cyan-50 to-sky-50 border-2 border-[#00c9d6] rounded-2xl flex items-center justify-between gap-4 shadow-sm mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                <div className="w-12 h-12 rounded-xl bg-white border border-teal-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                                                                    {selectedAdvisor.profilePic || selectedAdvisor.image ? (
                                                                        <img src={selectedAdvisor.profilePic || selectedAdvisor.image} alt={selectedAdvisor.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="font-semibold text-lg text-[#00c9d6] uppercase">{getInitials(selectedAdvisor.name)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 text-left">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2.5 py-0.5 bg-[#00c9d6] text-white text-[9.5px] font-semibold uppercase tracking-wider rounded-md">Selected Psychologist</span>
                                                                    </div>
                                                                    <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate mt-0.5">{selectedAdvisor.name}</h4>
                                                                    <p className="text-xs text-slate-600 font-medium truncate">{selectedAdvisor.role || 'Consultant Psychologist'}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedAdvisor(null);
                                                                    setSelectedTime('');
                                                                    clearPreselectedAdvisor?.();
                                                                }}
                                                                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-800 text-slate-800 hover:bg-slate-900 hover:text-white rounded-full text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Service Type Selection */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-surface-700 block">Select Service Type</label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                            {[
                                                                { id: 'counselling', label: 'Psychological Counselling', enabled: enablePsychology },
                                                                { id: 'career', label: 'Career Mentoring', enabled: enableCareerMentoring }
                                                            ].filter(s => s.enabled).map((s) => {
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
                                                                        className={`min-h-[48px] px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center text-center border text-sm font-semibold ${isSelected
                                                                            ? 'bg-[#0f172a] border-[#06b6d4] text-white shadow-xs'
                                                                            : 'bg-white border-surface-200 text-[#0f172a] hover:border-[#06b6d4] hover:bg-surface-50'
                                                                            } ${rescheduleSession ? 'opacity-65 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        {s.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/* Mode of Session Select */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-surface-700 block">Select Session Mode</label>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {(() => {
                                                                let siteSettings = {};
                                                                try {
                                                                    const stored = localStorage.getItem('behold_site_settings');
                                                                    if (stored) siteSettings = JSON.parse(stored);
                                                                } catch {
                                                                    // ignore
                                                                }

                                                                return [
                                                                    { id: 'ONLINE', label: 'Online', desc: 'Video call', active: siteSettings.enableOnline !== false },
                                                                    { id: 'DOOR_STEP', label: 'Doorstep', desc: 'Home visit', active: siteSettings.enableDoorstep !== false },
                                                                    { id: 'OFFLINE', label: 'Offline', desc: 'At center', active: siteSettings.enableOffline !== false }
                                                                ].filter(m => m.active).map((m) => {
                                                                    return (
                                                                        <button
                                                                            type="button"
                                                                            key={m.id}
                                                                            disabled={rescheduleSession}
                                                                            onClick={() => {
                                                                                if (rescheduleSession) return;
                                                                                setBookingMode(m.id);
                                                                            }}
                                                                            className={`flex-1 min-w-[120px] max-w-[160px] flex flex-col items-center justify-center gap-1 px-3 py-2 border rounded-xl transition cursor-pointer text-center min-h-[48px] leading-tight ${bookingMode === m.id
                                                                                ? 'bg-[#0f172a] text-white border-[#06b6d4] shadow-xs'
                                                                                : 'bg-white text-[#0f172a] border-surface-200 hover:border-[#06b6d4] hover:bg-surface-50'
                                                                                } ${rescheduleSession ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            <span className="flex flex-col items-center">
                                                                                <span className={`font-semibold text-sm ${bookingMode === m.id ? 'text-white' : 'text-[#0f172a]'}`}>{m.label}</span>
                                                                                <span className={`text-xs mt-0.5 ${bookingMode === m.id ? 'text-[#06b6d4]' : 'text-surface-500'}`}>{m.desc}</span>
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Session Duration Selector */}
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold text-surface-700 block">Select Session Duration</label>
                                                        <div className="grid grid-cols-2 gap-3 w-full">
                                                            {(() => {
                                                                const rawPrice = selectedAdvisor ? (selectedAdvisor.price || 899) : 899;
                                                                const halfPrice = rawPrice <= 899 ? 499 : rawPrice >= 1200 ? 699 : Math.round(rawPrice * 0.5);
                                                                const fullPrice = rawPrice;
                                                                return [
                                                                    { id: 30, label: '30 Minutes (Half Hour)', desc: `Half Session • ₹${halfPrice}` },
                                                                    { id: 60, label: '1 Hour (Full Session)', desc: `Full Session • ₹${fullPrice}` }
                                                                ].map((d) => (
                                                                    <button
                                                                        type="button"
                                                                        key={d.id}
                                                                        disabled={rescheduleSession}
                                                                        onClick={() => setBookingDuration(d.id)}
                                                                        className={`px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center border ${bookingDuration === d.id
                                                                            ? 'bg-[#0f172a] border-[#06b6d4] text-white shadow-xs'
                                                                            : 'bg-white border-surface-200 text-[#0f172a] hover:border-[#06b6d4] hover:bg-surface-50'
                                                                            } ${rescheduleSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <span className="font-semibold text-xs sm:text-sm">{d.label}</span>
                                                                        <span className={`text-[11px] mt-0.5 font-semibold ${bookingDuration === d.id ? 'text-[#06b6d4]' : 'text-surface-500'}`}>{d.desc}</span>
                                                                    </button>
                                                                ));
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* DOORSTEP LOCATION INPUTS - CONFIG STEP */}
                                                    {bookingMode === 'DOOR_STEP' && (
                                                        <div className="space-y-4 p-0 sm:p-5 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                                                            <div className="border-b border-surface-200 pb-2 mb-2">
                                                                <h4 className="text-sm font-semibold text-surface-900 flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-3 bg-surface-900 rounded-full"></span>
                                                                    Doorstep Visit Address & Geolocation
                                                                </h4>
                                                                <p className="text-sm text-surface-500 mt-1">
                                                                    Please provide your location to check for nearby psychologists within a 10 km service radius.
                                                                </p>
                                                            </div>

                                                            {/* Search Location Address field */}
                                                            <div className="space-y-1.5 text-left relative">
                                                                <label className="text-sm font-semibold text-surface-700 block">Search Location Address</label>
                                                                <div className="flex flex-col sm:flex-row gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Type your address to search... (e.g. Kozhikode, Kerala)"
                                                                        value={clientSearchQuery}
                                                                        onChange={(e) => setClientSearchQuery(e.target.value)}
                                                                        className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-surface-200 text-sm font-medium text-surface-900 outline-none focus:border-surface-900 rounded-xl transition"
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
                                                                        className="w-full sm:w-auto px-4 py-2.5 bg-surface-900 text-white text-sm font-semibold rounded-full hover:bg-black transition cursor-pointer shrink-0 text-center border-none"
                                                                    >
                                                                        {isClientSearching ? 'Searching...' : 'Search'}
                                                                    </button>
                                                                </div>

                                                                {/* Autocomplete Dropdown */}
                                                                {clientSearchResults.length > 0 && (
                                                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl max-h-40 overflow-y-auto z-50 shadow-sm divide-y divide-surface-100">
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
                                                                                    if (errors.clientLocationName) setErrors(prev => ({ ...prev, clientLocationName: null }));
                                                                                    if (errors.clientLatitude) setErrors(prev => ({ ...prev, clientLatitude: null }));
                                                                                    if (errors.clientLongitude) setErrors(prev => ({ ...prev, clientLongitude: null }));
                                                                                }}
                                                                                className="w-full text-left px-3.5 py-2.5 text-sm text-surface-600 font-medium hover:text-surface-900 hover:bg-surface-50 transition-colors block truncate"
                                                                            >
                                                                                {res.display_name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1 text-left">
                                                                <label className="text-sm font-semibold text-surface-700 block">Your Delivery / Visit Address</label>
                                                                <input
                                                                    type="text"
                                                                    name="clientLocationName"
                                                                    value={bookingForm.clientLocationName || ''}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e);
                                                                        setClientSearchQuery(e.target.value);
                                                                    }}
                                                                    placeholder="e.g. Apartment/House No, Street Name, City, Pincode"
                                                                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-medium text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLocationName
                                                                        ? 'border-rose-500 bg-rose-50/50'
                                                                        : 'border-surface-200 bg-white'
                                                                        }`}
                                                                />
                                                                {errors.clientLocationName && <p className="text-xs text-rose-500 font-medium mt-1">{errors.clientLocationName}</p>}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1 text-left">
                                                                    <label className="text-sm font-semibold text-surface-700 block">Latitude</label>
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        name="clientLatitude"
                                                                        value={bookingForm.clientLatitude || ''}
                                                                        onChange={handleInputChange}
                                                                        placeholder="e.g. 11.2588"
                                                                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-medium text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLatitude
                                                                            ? 'border-rose-500 bg-rose-50/50'
                                                                            : 'border-surface-200 bg-white'
                                                                            }`}
                                                                    />
                                                                    {errors.clientLatitude && <p className="text-xs text-rose-500 font-medium mt-1">{errors.clientLatitude}</p>}
                                                                </div>
                                                                <div className="space-y-1 text-left">
                                                                    <label className="text-sm font-semibold text-surface-700 block">Longitude</label>
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        name="clientLongitude"
                                                                        value={bookingForm.clientLongitude || ''}
                                                                        onChange={handleInputChange}
                                                                        placeholder="e.g. 75.7804"
                                                                        className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-medium text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLongitude
                                                                            ? 'border-rose-500 bg-rose-50/50'
                                                                            : 'border-surface-200 bg-white'
                                                                            }`}
                                                                    />
                                                                    {errors.clientLongitude && <p className="text-xs text-rose-500 font-medium mt-1">{errors.clientLongitude}</p>}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                                <button
                                                                    type="button"
                                                                    disabled={isClientLocating}
                                                                    onClick={handleClientDetectLocation}
                                                                    className="px-4 py-2 border border-surface-200 hover:border-surface-300 text-surface-900 bg-white font-semibold text-sm rounded-full transition cursor-pointer flex items-center justify-center gap-1.5 shadow-none disabled:opacity-50 "
                                                                >
                                                                    {isClientLocating ? (
                                                                        <>
                                                                            <div className="w-3 h-3 border border-zinc-400 border-t-brand rounded-full animate-spin" />
                                                                            Locating...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            </svg>
                                                                            Detect My Location & Address
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Step 1: Select Date */}
                                                {!(bookingMode === 'DOOR_STEP' && (!bookingForm.clientLatitude || !bookingForm.clientLongitude)) ? (
                                                    <div className="space-y-2 pt-4 border-t border-surface-200 animate-in fade-in duration-300">
                                                        <label className="text-sm font-semibold text-surface-900 block ">1. Select Date</label>
                                                        <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-xl">
                                                            <DateTimePicker
                                                                selectedDate={selectedDate}
                                                                selectedTime={selectedTime}
                                                                bookingDuration={bookingDuration}
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
                                                ) : (
                                                    <div className="p-4 sm:p-6 border border-dashed border-surface-200 rounded-xl bg-surface-50 text-surface-600 text-center font-medium text-sm mt-4">
                                                        Please search or detect your location address to show available psychologists within 10 km.
                                                    </div>
                                                )}

                                                {/* Step 2: Advisor Selection */}
                                                {(!selectedAdvisor && selectedDate) && (
                                                    <div ref={step2Ref} className="space-y-3 pt-6 border-t border-surface-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <label className="text-sm font-semibold text-surface-900 block ">
                                                                Choose Psychologist
                                                            </label>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(() => {
                                                                const filteredAdvisors = advisors
                                                                    .filter(advisor => {
                                                                        if (!advisor.type) return true;
                                                                        const r = (advisor.role || advisor.type || '').toLowerCase();
                                                                        if (bookingService === 'counselling') {
                                                                            return advisor.type === 'counselling' || advisor.type === 'counseling' || advisor.type === 'psychologist' || r.includes('psychologist') || r.includes('counsellor') || r.includes('counselor');
                                                                        }
                                                                        return advisor.type === 'career' || r.includes('career') || r.includes('mentor');
                                                                    })
                                                                    .filter(advisor => !advisor.modes || advisor.modes.includes(bookingMode))
                                                                    .filter(advisor => {
                                                                        if (bookingMode !== 'DOOR_STEP') return true;
                                                                        const clientLat = parseFloat(bookingForm.clientLatitude);
                                                                        const clientLng = parseFloat(bookingForm.clientLongitude);
                                                                        const advLat = Number(advisor.latitude);
                                                                        const advLng = Number(advisor.longitude);
                                                                        if (isNaN(clientLat) || isNaN(clientLng) || !advLat || !advLng) return false;
                                                                        const distance = getHaversineDistance(clientLat, clientLng, advLat, advLng);
                                                                        return distance <= 10;
                                                                    });

                                                                if (filteredAdvisors.length === 0) {
                                                                    return (
                                                                        <div className="p-4 border border-dashed border-surface-200 rounded-xl bg-surface-50 text-surface-600 text-center font-medium text-sm">
                                                                            No psychologists are available matching your criteria.
                                                                        </div>
                                                                    );
                                                                }

                                                                const availableAdvisors = filteredAdvisors.filter(advisor => getAdvisorSlotsForDate(advisor, selectedDate).length > 0);

                                                                if (availableAdvisors.length === 0) {
                                                                    return (
                                                                        <div className="p-4 border border-dashed border-surface-200 rounded-xl bg-surface-50 text-surface-600 text-center font-medium text-sm">
                                                                            No psychologists are available on this selected date. Please choose another date.
                                                                        </div>
                                                                    );
                                                                }

const totalPages = Math.max(1, Math.ceil(availableAdvisors.length / 4));
                                                                  const currentPage = Math.min(effectiveAdvisorPage, totalPages);
                                                                  const advisorsToRender = availableAdvisors.slice((currentPage - 1) * 4, currentPage * 4);

                                                                return (
                                                                    <>
                                                                        {advisorsToRender.map((advisor) => {
                                                                            const slots = getAdvisorSlotsForDate(advisor, selectedDate);
                                                                            const isAvailable = slots.length > 0;
                                                                            const isSelected = selectedAdvisor?.id === advisor.id;

                                                                            if (isSelected) {
                                                                                return (
                                                                                    <div key={advisor.id} className="border-[2px] border-brand rounded-xl bg-white overflow-hidden animate-in fade-in slide-in-from-top-2 text-left shadow-sm relative">
                                                                                        {/* TOP SECTION: Avatar + Name/Title */}
                                                                                        <div className="p-4 sm:p-5 flex items-center gap-4 bg-surface-50 border-b border-surface-200">
                                                                                            {(() => {
                                                                                                const avatarSrc = advisor.profilePic || advisor.image;
                                                                                                return (
                                                                                                    <div className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center border-2 border-cyan-500 bg-white shadow-sm overflow-hidden relative">
                                                                                                        {avatarSrc ? (
                                                                                                            <>
                                                                                                                <img
                                                                                                                    src={avatarSrc}
                                                                                                                    alt={advisor.name}
                                                                                                                    className="w-full h-full object-cover"
                                                                                                                    onError={(e) => {
                                                                                                                        e.currentTarget.style.display = 'none';
                                                                                                                        const fallback = e.currentTarget.nextElementSibling;
                                                                                                                        if (fallback) fallback.style.display = 'flex';
                                                                                                                    }}
                                                                                                                />
                                                                                                                <span style={{ display: 'none' }} className="font-semibold text-2xl text-cyan-600 items-center justify-center w-full h-full">
                                                                                                                    {getInitials(advisor.name)}
                                                                                                                </span>
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            <span className="font-semibold text-2xl text-cyan-600 flex items-center justify-center w-full h-full">
                                                                                                                {getInitials(advisor.name)}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                );
                                                                                            })()}
                                                                                            <div>
                                                                                                <h4 className="font-semibold text-xl text-surface-900 leading-none mb-1">{advisor.name}</h4>
                                                                                                <p className="text-sm font-medium text-surface-600">{advisor.role}</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* MIDDLE SECTION 1: Specialties + Quote */}
                                                                                        <div className="p-4 sm:p-5 border-b border-surface-200 space-y-4">
                                                                                            <div>
                                                                                                <span className="text-sm font-semibold text-surface-900 block mb-2">Specialties</span>
                                                                                                <div className="flex flex-wrap gap-2">
                                                                                                    {advisor.specialties?.length > 0 ? (
                                                                                                        <>
                                                                                                            {(expandedSpecialties[advisor.id] ? advisor.specialties : advisor.specialties.slice(0, 5)).map((spec, i) => (
                                                                                                                <span key={i} className="px-3 py-1 bg-white border border-surface-200 text-surface-700 text-xs font-medium rounded-lg">{spec}</span>
                                                                                                            ))}
                                                                                                            {advisor.specialties.length > 5 && (
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setExpandedSpecialties(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }));
                                                                                                                    }}
                                                                                                                    className="px-3 py-1 bg-surface-50 border border-surface-200 text-surface-700 text-xs font-semibold rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                                                                                                                >
                                                                                                                    {expandedSpecialties[advisor.id] ? '- Less' : `+ ${advisor.specialties.length - 5} More`}
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <span className="px-3 py-1 bg-white border border-surface-200 text-surface-500 text-xs font-medium rounded-lg">General</span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                            {advisor.bio && (
                                                                                                <div className="relative">
                                                                                                    <p className={`text-sm font-medium text-surface-600 italic leading-relaxed ${expandedBios[advisor.id] ? '' : 'line-clamp-2'}`}>
                                                                                                        "{advisor.bio}"
                                                                                                    </p>
                                                                                                    {advisor.bio.length > 100 && (
                                                                                                        <button
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                setExpandedBios(prev => ({ ...prev, [advisor.id]: !prev[advisor.id] }));
                                                                                                            }}
                                                                                                            className="text-brand-dark font-semibold hover:underline cursor-pointer text-[11px] mt-1 tracking-wider"
                                                                                                        >
                                                                                                            {expandedBios[advisor.id] ? 'Read Less' : 'Read More'}
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* MIDDLE SECTION 2: Grid Stats */}
                                                                                        <div className="grid grid-cols-3 divide-x divide-surface-200 border-b border-surface-200 bg-surface-50">
                                                                                            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                                                                                                <span className="font-semibold text-xl sm:text-2xl text-surface-900 leading-none">{advisor.hours || '100'}+</span>
                                                                                                <span className="text-xs font-medium text-surface-500 mt-1">Hours</span>
                                                                                            </div>
                                                                                            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                                                                                                <span className="font-semibold text-sm sm:text-lg text-surface-900 leading-none truncate w-full px-1">{advisor.lang || 'English'}</span>
                                                                                                <span className="text-xs font-medium text-surface-500 mt-1">Language</span>
                                                                                            </div>
                                                                                            <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                                                                                                <span className="font-semibold text-xl sm:text-2xl text-surface-900 leading-none">₹{advisor.price}</span>
                                                                                                <span className="text-xs font-medium text-surface-500 mt-1">Session</span>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* BOTTOM SECTION: Availability + Buttons */}
                                                                                        <div className="p-4 sm:p-5 bg-white">
                                                                                            <div className="flex items-center justify-between mb-5">
                                                                                                <span className="text-sm font-semibold text-surface-900">Next Available</span>
                                                                                                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 rounded-full flex items-center gap-2">
                                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                                                    Available Today
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="flex items-center gap-3">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        window.open(`/advisor/${advisor.id}`, '_blank');
                                                                                                    }}
                                                                                                    className="flex-1 py-3 bg-white border-2 border-surface-200 text-surface-900 font-semibold text-sm rounded-xl hover:border-surface-900 hover:bg-surface-50 transition-colors text-center cursor-pointer shadow-none"
                                                                                                >
                                                                                                    View Profile
                                                                                                </button>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        if (!selectedTime) {
                                                                                                            toast.error('Please select a time slot below to proceed.');
                                                                                                        } else {
                                                                                                            handleStepChange('payment');
                                                                                                        }
                                                                                                    }}
                                                                                                    className="flex-1 py-3 bg-surface-900 text-white font-semibold text-sm rounded-xl hover:bg-black transition-colors text-center border-2 border-surface-900 cursor-pointer shadow-sm"
                                                                                                >
                                                                                                    Book Now
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            return (
                                                                                <div
                                                                                    key={advisor.id}
                                                                                    onClick={() => {
                                                                                        if (!isAvailable) return;
                                                                                        setSelectedAdvisor(advisor);
                                                                                        setAdvisorConfirmed(false); // Reset confirmation so Step 3 hides
                                                                                        if (errors.advisor) setErrors(prev => ({ ...prev, advisor: null }));
                                                                                        if (advisor.modes && advisor.modes.length > 0 && !advisor.modes.includes(bookingMode)) {
                                                                                            setBookingMode(advisor.modes[0]);
                                                                                        }
                                                                                        setSelectedTime('');
                                                                                    }}
                                                                                    className={`group p-4 sm:p-5 border-[2px] rounded-2xl transition-all duration-300 relative overflow-hidden shadow-xs ${!isAvailable
                                                                                        ? 'bg-surface-50 border-surface-200 opacity-60 cursor-not-allowed'
                                                                                        : 'bg-white border-surface-200 hover:border-[#06b6d4] hover:shadow-md cursor-pointer hover:-translate-y-1'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                                                                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                                                                                            {(() => {
                                                                                                const avatarSrc = advisor.profilePic || advisor.image;
                                                                                                return (
                                                                                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shrink-0 flex items-center justify-center border-2 overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105 ${!isAvailable ? 'border-surface-200 bg-surface-50' : 'border-[#06b6d4] bg-white'}`}>
                                                                                                        {avatarSrc ? (
                                                                                                            <>
                                                                                                                <img
                                                                                                                    src={avatarSrc}
                                                                                                                    alt={advisor.name}
                                                                                                                    className="w-full h-full object-cover"
                                                                                                                    onError={(e) => {
                                                                                                                        e.currentTarget.style.display = 'none';
                                                                                                                        const fallback = e.currentTarget.nextElementSibling;
                                                                                                                        if (fallback) fallback.style.display = 'flex';
                                                                                                                    }}
                                                                                                                />
                                                                                                                <span style={{ display: 'none' }} className={`font-semibold text-xl sm:text-2xl items-center justify-center w-full h-full ${!isAvailable ? 'text-surface-400' : 'text-cyan-600'}`}>
                                                                                                                    {getInitials(advisor.name)}
                                                                                                                </span>
                                                                                                            </>
                                                                                                        ) : (
                                                                                                            <span className={`font-semibold text-xl sm:text-2xl flex items-center justify-center w-full h-full ${!isAvailable ? 'text-surface-400' : 'text-cyan-600'}`}>
                                                                                                                {getInitials(advisor.name)}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                );
                                                                                            })()}
                                                                                            <div className="space-y-1 text-left min-w-0 flex-1">
                                                                                                <h4 className={`font-semibold text-base sm:text-lg leading-tight truncate transition-colors duration-300 ${!isAvailable ? 'text-surface-400' : 'text-surface-900 group-hover:text-[#0f172a]'}`}>
                                                                                                    {advisor.name}
                                                                                                </h4>
                                                                                                <p className="text-xs sm:text-sm font-medium text-surface-600 truncate">{advisor.role}</p>

                                                                                                {advisor.specialties?.length > 0 && (
                                                                                                    <div className="hidden sm:flex flex-wrap gap-1.5 mt-2">
                                                                                                        {advisor.specialties.slice(0, 3).map((spec, i) => (
                                                                                                            <span key={i} className="px-2 py-0.5 bg-surface-50 border border-surface-200 text-surface-600 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                                                                                                                {spec}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                        {advisor.specialties.length > 3 && (
                                                                                                            <span className="px-2 py-0.5 bg-surface-50 border border-surface-200 text-surface-600 text-[10px] font-semibold rounded-md">
                                                                                                                +{advisor.specialties.length - 3}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}

                                                                                                {bookingMode === 'OFFLINE' && advisor.locationName && (
                                                                                                    <span className="text-xs font-medium mt-1.5 block leading-tight text-surface-500 truncate">
                                                                                                        📍 Center: {advisor.locationName}
                                                                                                    </span>
                                                                                                )}
                                                                                                {bookingMode === 'DOOR_STEP' && (() => {
                                                                                                    const clientLat = parseFloat(bookingForm.clientLatitude);
                                                                                                    const clientLng = parseFloat(bookingForm.clientLongitude);
                                                                                                    const advLat = Number(advisor.latitude);
                                                                                                    const advLng = Number(advisor.longitude);
                                                                                                    if (!isNaN(clientLat) && !isNaN(clientLng) && advLat && advLng) {
                                                                                                        const distance = getHaversineDistance(clientLat, clientLng, advLat, advLng);
                                                                                                        return (
                                                                                                            <span className="text-xs text-surface-900 font-semibold mt-1.5 block">
                                                                                                                📍 Distance: {distance.toFixed(2)} km
                                                                                                            </span>
                                                                                                        );
                                                                                                    }
                                                                                                    return null;
                                                                                                })()}
                                                                                                {!isAvailable && (
                                                                                                    <span className="text-xs text-rose-500 font-medium mt-1.5 inline-block">
                                                                                                        Unavailable on this date
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 border-surface-100 pt-3 sm:pt-0 mt-3 sm:mt-0">
                                                                                            <div className="text-left sm:text-right">
                                                                                                <span className={`font-semibold text-xl sm:text-2xl leading-none block ${!isAvailable ? 'text-surface-400' : 'text-surface-900'}`}>₹{advisor.price}</span>
                                                                                                <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mt-0.5 block">Per Session</span>
                                                                                            </div>
                                                                                            {isAvailable ? (
                                                                                                <div className="px-4 py-2 bg-surface-50 text-[#0f172a] text-xs font-semibold uppercase tracking-wider rounded-lg border border-surface-200 group-hover:bg-[#0f172a] group-hover:text-white group-hover:border-[#0f172a] transition-all duration-300 flex items-center gap-1.5 shadow-xs">
                                                                                                    <span>Select</span>
                                                                                                    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                                                                    </svg>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 uppercase tracking-wider">No Slots</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {!selectedAdvisor && Math.ceil(availableAdvisors.length / 4) > 1 && (
                                                                            <div className="flex items-center justify-center gap-2 pt-4">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setAdvisorPage(p => Math.max(1, p - 1))}
                                                                                    disabled={advisorPage === 1}
                                                                                    aria-label="Previous Page"
                                                                                    className={`w-8 h-8 rounded-full text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${advisorPage === 1
                                                                                        ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                                                                                        : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                                                                                        }`}
                                                                                >
                                                                                    ‹
                                                                                </button>
                                                                                {Array.from({ length: Math.ceil(availableAdvisors.length / 4) }, (_, i) => i + 1).map((num) => (
                                                                                    <button
                                                                                        key={num}
                                                                                        type="button"
                                                                                        onClick={() => setAdvisorPage(num)}
                                                                                        className={`w-8 h-8 rounded-full text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center ${advisorPage === num
                                                                                            ? 'bg-[#0f172a] text-[#06b6d4] border-[#06b6d4] shadow-xs'
                                                                                            : 'bg-white text-[#0f172a] border-surface-200 hover:border-[#06b6d4]'
                                                                                            }`}
                                                                                    >
                                                                                        {num}
                                                                                    </button>
                                                                                ))}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setAdvisorPage(p => Math.min(Math.ceil(availableAdvisors.length / 4), p + 1))}
                                                                                    disabled={advisorPage === Math.ceil(availableAdvisors.length / 4)}
                                                                                    aria-label="Next Page"
                                                                                    className={`w-8 h-8 rounded-full text-sm font-semibold transition-all cursor-pointer border flex items-center justify-center ${advisorPage === Math.ceil(availableAdvisors.length / 4)
                                                                                        ? 'border-surface-200 text-surface-400 bg-surface-100 cursor-not-allowed'
                                                                                        : 'border-[#0f172a] bg-[#0f172a] text-white hover:bg-[#1e293b]'
                                                                                        }`}
                                                                                >
                                                                                    ›
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}

                                                            {selectedAdvisor && !isAdvisorLocked && (
                                                                <div className="pt-3 pb-1 flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedAdvisor(null);
                                                                            setSelectedTime('');
                                                                            setTimeout(() => {
                                                                                step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                            }, 100);
                                                                        }}
                                                                        className="px-8 py-2.5 bg-white border-2 border-surface-200 text-brand font-semibold text-sm rounded-full hover:border-brand transition-colors cursor-pointer active:scale-[0.98]"
                                                                    >
                                                                        Change Advisor
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {errors.advisor && <p className="text-xs text-rose-500 font-medium mt-1 ">{errors.advisor}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Step 3: Time Selection */}
                                                {selectedDate && selectedAdvisor && (
                                                    <div ref={step3Ref} className="space-y-3 pt-6 border-t border-surface-200 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <label className="text-sm font-semibold text-surface-900 block ">{isAdvisorLocked ? '2' : '3'}. Select Time</label>
                                                        <TimePicker
                                                            selectedDate={selectedDate}
                                                            selectedTime={selectedTime}
                                                            bookingDuration={bookingDuration}
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

                                                {/* Navigation for Reschedule Sessions only */}
                                                {rescheduleSession && (
                                                    <div className="flex items-center justify-end pt-6 mt-4 border-t border-surface-200">
                                                        <button
                                                            type="button"
                                                            disabled={!selectedDate || !selectedTime || isSubmitting}
                                                            onClick={handleRescheduleConfirm}
                                                            className="px-6 py-2.5 min-h-[48px] bg-surface-900 text-white font-semibold text-sm rounded-full transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
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
                                                            <span className="w-6 h-6 rounded-md bg-surface-900 text-white text-xs flex items-center justify-center shrink-0 font-medium">2</span>
                                                            Payment & Confirm
                                                        </h3>
                                                        <p className="text-sm font-normal text-surface-600 mt-1">
                                                            {user ? 'Review your details and complete payment.' : 'You will be asked to sign in securely before completing payment.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {user && (
                                                    <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300 shadow-sm">
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm font-semibold text-surface-900 block truncate">{user.name}</span>
                                                            <span className="text-sm font-semibold text-surface-600 truncate block">{user.email}</span>
                                                            {user.phone && <span className="text-sm font-semibold text-surface-600 truncate block">{user.phone}</span>}
                                                        </div>
                                                        <span className="shrink-0 text-sm font-semibold bg-surface-900 text-white px-2.5 py-1 rounded-xl">
                                                            ✓ Authenticated
                                                        </span>
                                                    </div>
                                                )}

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

                                                    <div className="p-4 bg-surface-50 border border-surface-200 rounded-xl space-y-4">
                                                        <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                                                            <div className="w-12 h-12 bg-white border border-surface-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                                                <svg className="w-6 h-6 text-surface-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-surface-900 ">Secure Payment Gateway</h5>
                                                                <p className="text-sm text-surface-500 font-semibold mt-1">
                                                                    A secure Razorpay checkout overlay will open to complete your payment using UPI, Cards, Netbanking, or Wallet.
                                                                </p>
                                                                <div className="flex items-start gap-2.5 mt-3 pt-3 border-t border-surface-200/80">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="booking-terms-checkbox"
                                                                        checked={termsAgreed}
                                                                        onChange={(e) => setTermsAgreed(e.target.checked)}
                                                                        className="w-4 h-4 mt-0.5 rounded border-surface-300 text-brand focus:ring-brand accent-[#00c9d6] cursor-pointer shrink-0"
                                                                    />
                                                                    <label htmlFor="booking-terms-checkbox" className="text-xs text-surface-700 font-semibold leading-relaxed cursor-pointer select-none">
                                                                        By proceeding, you agree to our platform{' '}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => onOpenDocs?.('terms')}
                                                                            className="font-semibold text-[#00c9d6] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                        >
                                                                            Terms
                                                                        </button>{' '}
                                                                        and{' '}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => onOpenDocs?.('refund')}
                                                                            className="font-semibold text-[#00c9d6] hover:underline bg-transparent border-none p-0 cursor-pointer text-xs inline"
                                                                        >
                                                                            Return & Refund Policy
                                                                        </button>.
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200 mt-6">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStepChange('config')}
                                                            className="px-5 py-3 min-h-[44px] bg-white border border-surface-200 text-surface-900 hover:bg-surface-50 font-semibold text-xs rounded-full transition cursor-pointer w-full sm:w-auto text-center"
                                                        >
                                                            Back to Schedule
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={isProcessingPayment || !termsAgreed}
                                                            title={!termsAgreed ? "Please check the agreement box to proceed" : ""}
                                                            className={`px-8 py-3.5 min-h-[48px] font-semibold text-xs uppercase tracking-wider rounded-full transition flex items-center justify-center border-none w-full sm:w-auto ${
                                                                !termsAgreed || isProcessingPayment
                                                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                                                                    : 'bg-[#0f172a] hover:bg-black text-[#00c9d6] hover:text-white cursor-pointer active:scale-95 shadow-md'
                                                            }`}
                                                        >
                                                            {isProcessingPayment ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    <span>Processing Payment...</span>
                                                                </div>
                                                            ) : (
                                                                <span>Pay & Confirm (₹{netTotal})</span>
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
                                                        {bookingMode.replace('_', ' ')}
                                                    </span>
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
                                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-full text-xs font-semibold transition cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleApplyCoupon}
                                                                className="px-3.5 py-1.5 bg-surface-900 hover:bg-black text-white rounded-full text-xs font-semibold transition cursor-pointer border-none "
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
                                                            <span>Session Fee</span>
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

                                        {/* Standalone Action Button in right column for config step */}
                                        {bookingStep === 'config' && (
                                            <button
                                                type="button"
                                                disabled={isProcessingPayment}
                                                onClick={() => {
                                                    if (!selectedDate || !selectedTime || !selectedAdvisor) {
                                                        toast.error('Please select date, time slot, and psychologist to proceed.');
                                                    } else {
                                                        handleStepChange('payment');
                                                    }
                                                }}
                                                className="w-full py-4 bg-[#0f172a] hover:bg-slate-800 active:scale-[0.98] text-[#00c9d6] hover:text-white font-semibold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer text-center border-none block mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Proceed to Payment
                                            </button>
                                        )}
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

                {showNoCounsellorsModal && (
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
                                className="w-full py-2.5 bg-surface-900 hover:bg-black text-white font-semibold text-xs rounded-full cursor-pointer transition border-none shadow-none"
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


