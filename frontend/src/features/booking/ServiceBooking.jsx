import React, { useState, useEffect } from 'react';
import { useBookingViewModel } from './useBookingViewModel';
import DateTimePicker from './DateTimePicker';
import TimePicker from './TimePicker';
import BookingAuthModal from './BookingAuthModal';
import { FileDown } from 'lucide-react';
import { formatDateString } from '../../shared/utils/dateFormatter';
import toast from 'react-hot-toast';

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

export default function ServiceBooking({ preselectedAdvisorId, clearPreselectedAdvisor }) {
 const {
 user,
 bookingService,
 setBookingService,
 bookingMode,
 setBookingMode,
 bookingForm,
 setBookingForm,
 selectedDate,
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
 bookingStep,
 setBookingStep,
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
 getHaversineDistance
 } = useBookingViewModel({ preselectedAdvisorId, clearPreselectedAdvisor });

 const isAdvisorLocked = !!preselectedAdvisorId;
 const flowKey = bookingMode === 'DOOR_STEP' ? 'doorstep' : bookingMode.toLowerCase();
 const activeSteps = bookingService === 'counselling' ? COUNSELLING_FLOW[flowKey] : CAREER_FLOW[flowKey];

 const [clientSearchQuery, setClientSearchQuery] = useState(bookingForm.clientLocationName || '');
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

 const handleClientDetectLocation = () => {
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
 if (data && data.display_name) {
 setBookingForm(prev => ({
 ...prev,
 clientLatitude: lat.toString(),
 clientLongitude: lng.toString(),
 clientLocationName: data.display_name
 }));
 setClientSearchQuery(data.display_name);
 } else {
 setBookingForm(prev => ({
 ...prev,
 clientLatitude: lat.toString(),
 clientLongitude: lng.toString()
 }));
 }
 } catch (err) {
 console.error("Reverse geocoding error", err);
 setBookingForm(prev => ({
 ...prev,
 clientLatitude: lat.toString(),
 clientLongitude: lng.toString()
 }));
 }
 toast.success("Location coordinates & address detected!");
 setIsClientLocating(false);
 },
 (err) => {
 toast.dismiss(toastId);
 toast.error("Failed to detect coordinates: " + err.message);
 setIsClientLocating(false);
 }
 );
 };

 React.useEffect(() => {
 if (bookingMode === 'DOOR_STEP' && !bookingForm.clientLatitude && !bookingForm.clientLongitude) {
 const timer = setTimeout(() => {
 handleClientDetectLocation();
 }, 0);
 return () => clearTimeout(timer);
 }
 }, [bookingMode]);

 if (!enablePsychology && !isRescheduleParam) {
 return (
 <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-surface-50 font-sans select-none">
 <div className="max-w-md w-full bg-white border border-surface-200 p-8 rounded-[10px] shadow-square-light space-y-6 animate-in fade-in zoom-in-95 duration-500">
 <div className="w-16 h-16 bg-surface-100 border border-surface-200 rounded-[10px] flex items-center justify-center mx-auto text-surface-900 shadow-square-light">
 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>

 <div className="space-y-2">
 <span className="text-[10px] bg-surface-900 text-white px-3 py-1 rounded-[10px] font-bold w-fit mx-auto block">
 System Notice
 </span>
 <h2 className="text-xl sm:text-2xl font-black tracking-tight text-surface-900 ">
 Bookings Paused
 </h2>
 <p className="text-xs sm:text-sm text-surface-600 leading-relaxed font-bold ">
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
 className="px-6 py-3 min-h-[48px] bg-surface-900 hover:bg-surface-800 text-white text-[10px] font-black rounded-[10px] transition-all cursor-pointer shadow-none w-full sm:w-auto text-center border-none"
 >
 Home Page
 </button>
 <button
 type="button"
 onClick={() => {
 window.spaNavigate('/sample-test');
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }}
 className="px-6 py-3 min-h-[48px] bg-white border border-surface-200 hover:bg-surface-50 text-surface-900 text-[10px] font-black rounded-[10px] transition-all cursor-pointer w-full sm:w-auto text-center"
 >
 Take Sample Test
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20 bg-white text-surface-900 text-left font-sans border-b border-surface-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">

 {/* Header */}
 <div className="text-center flex flex-col items-center space-y-4">
 <span className="inline-block bg-surface-900 text-white px-3 py-1.5 text-[10px] font-black block mx-auto rounded-[10px]">
 {rescheduleSession ? 'reschedule session' : 'book a session'}
 </span>
 <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-none text-surface-900 ">
 {rescheduleSession ? 'Reschedule Your Session' : 'Book Your Session'}
 </h1>
 <p className="text-surface-600 max-w-xl mx-auto text-[10px] sm:text-xs md:text-xs font-bold leading-relaxed">
 {rescheduleSession
 ? `Reschedule your appointment with ${rescheduleSession.advisorName || rescheduleSession.counsellorName}. Pick a new date and time.`
 : 'Choose your service, pick a date and time, and confirm with a real advisor — it only takes a few minutes.'}
 </p>
 </div>

 {/* BOOKING FORM */}
 <div id="booking-console" className="space-y-6 sm:space-y-8 w-full">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-4">
 <h2 className="text-lg sm:text-xl font-black text-surface-900">
 Your Booking
 </h2>
 </div>

 {/* Step Progress */}
 {bookingStep !== 'success' && (() => {
 const stepMapping = { config: 0, payment: 1, success: 2 };
 const currentStepIdx = stepMapping[bookingStep] || 0;
 const stepLabels = ['Schedule & Advisor', 'Account & Payment', 'Session Confirmed'];
 return (
 <div className="bg-surface-50 border border-surface-200 p-4 sm:p-5 space-y-3 rounded-[10px] animate-in fade-in duration-300">
 {/* Mobile: compact progress bar */}
 <div className="flex sm:hidden items-center gap-2">
 <div className="flex items-center gap-1.5 flex-1 min-w-0">
 <span className="text-[10px] font-black text-surface-900 shrink-0">
 Step {currentStepIdx + 1} of 3
 </span>
 <div className="h-1 flex-1 bg-surface-200 rounded-[10px] overflow-hidden">
 <div
 className="h-full bg-surface-900 rounded-[10px] transition-all duration-500"
 style={{ width: `${(currentStepIdx / 3) * 100}%` }}
 />
 </div>
 </div>
 <span className="text-[10px] font-black text-surface-900 truncate">
 {stepLabels[currentStepIdx]}
 </span>
 </div>

 {/* Desktop/tablet: full stepper */}
 <div className="hidden sm:block">
 <div className="flex items-center justify-between gap-2 border-b border-surface-200 pb-3">
 <div className="flex items-center gap-2">
 <h3 className="font-black text-[10px] text-surface-900">
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
 <div className={`flex items-center justify-center w-8 h-8 rounded-[10px] font-black text-xs border transition-all duration-300 shrink-0 ${isCompleted
 ? 'bg-surface-900 border-surface-900 text-white'
 : isActive
 ? 'bg-surface-100 border-surface-900 text-surface-900'
 : 'bg-white border-surface-200 text-surface-400'
 }`}>
 {isCompleted ? '✓' : idx + 1}
 </div>
 {idx < activeSteps.length - 1 && (
 <div className={`hidden lg:block h-[1px] w-full ml-2 transition-all duration-300 ${isCompleted ? 'bg-surface-900' : 'bg-surface-200'
 }`} />
 )}
 </div>
 <div className="flex flex-col text-left min-w-0">
 <span className={`text-[10px] font-black ${isActive ? 'text-surface-900' : isCompleted ? 'text-surface-600' : 'text-surface-400'}`}>
 {stepLabels[idx]}
 </span>
 <span className={`text-[10px] font-bold transition-colors duration-300 mt-0.5 ${isActive ? 'text-surface-900' : 'text-surface-500'}`}>
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
 <div className="p-6 sm:p-10 bg-white border border-surface-200 rounded-[10px] max-w-2xl mx-auto shadow-square-light space-y-6 text-center animate-in fade-in duration-300">
 <style>{`
 @keyframes checkmark-circle {
 0% { transform: scale(0); opacity: 0; }
 100% { transform: scale(1); opacity: 1; }
 }
 @keyframes checkmark-draw {
 100% { stroke-dashoffset: 0; }
 }
 @keyframes scale-pop {
 0% { transform: translateY(15px); opacity: 0; }
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
 animation: scale-pop 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.5s forwards;
 }
 .animate-card-fade {
 opacity: 0;
 animation: scale-pop 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.7s forwards;
 }
 `}</style>

 <div className="w-20 h-20 bg-surface-50 border border-surface-200 rounded-[10px] flex items-center justify-center mx-auto text-surface-900 shadow-square-light animate-checkmark-circle">
 <svg className="w-10 h-10 text-surface-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
 <path className="animate-checkmark-path" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 </div>

 <div className="space-y-2 animate-scale-pop">
 <span className="text-[10px] bg-surface-900 text-white border border-surface-900 px-3 py-1 rounded-[10px] font-black w-fit mx-auto block">
 {rescheduleSession ? 'reschedule requested' : 'session confirmed'}
 </span>
 <h3 className="text-xl sm:text-2xl font-black text-surface-900 mt-2">
 {rescheduleSession ? 'Reschedule Requested' : "You're All Set!"}
 </h3>
 <p className="text-xs text-surface-600 max-w-md mx-auto leading-relaxed font-bold mt-2">
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
 <div className="bg-surface-50 border border-surface-200 rounded-[10px] p-5 text-left space-y-4 shadow-square-light animate-card-fade">
 <h4 className="text-[10px] font-black text-surface-900 border-b border-surface-200 pb-2">
 {rescheduleSession ? 'Reschedule Details' : 'Booking Confirmation'}
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] ">
 <div>
 <span className="text-surface-500 block font-bold mb-1">Advisor</span>
 <span className="font-black text-surface-900 text-xs block">{selectedAdvisor?.name || 'Assigned Advisor'}</span>
 <span className="text-surface-500 block font-bold">{selectedAdvisor?.role || 'Consultant Psychologist'}</span>
 </div>
 <div>
 <span className="text-surface-500 block font-bold mb-1">Service</span>
 <span className="font-black text-surface-900 text-xs block">
 {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
 </span>
 <span className="text-surface-500 block font-bold">Mode: {bookingMode === 'ONLINE' ? 'Video Call' : bookingMode === 'DOOR_STEP' ? 'Home Visit' : 'At Center'}</span>
 </div>
 <div>
 <span className="text-surface-500 block font-bold mb-1">New Date & Time Slot</span>
 <span className="font-black text-surface-900 text-xs block">
 {formatDateString(selectedDate)}
 </span>
 <span className="text-surface-500 block font-bold mt-0.5">
 {selectedTime}
 </span>
 </div>
 <div>
 <span className="text-surface-500 block font-bold mb-1">Status</span>
 <span className="font-black text-surface-900 text-xs block">
 {rescheduleSession ? 'Pending Approval' : 'Confirmed & Paid'}
 </span>
 </div>
 </div>

 {/* Google Meet Link if Online */}
 {bookingMode === 'ONLINE' && !rescheduleSession && (
 <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[10px] border border-surface-200 mt-2">
 <div>
 <span className="text-[10px] font-black text-surface-900 block mb-1">
 Google Meet Session Link
 </span>
 <span className="text-[10px] text-surface-600 font-bold truncate block max-w-[280px] sm:max-w-xs">
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
 className="px-4 py-2.5 min-h-[40px] bg-surface-900 hover:bg-surface-800 text-white text-[10px] font-black rounded-[10px] transition cursor-pointer flex items-center justify-center border-none shadow-none whitespace-nowrap"
 >
 {copiedMeet ? 'Copied!' : 'Copy Link'}
 </button>
 </div>
 )}
 </div>

 {/* Back to Profile / Restart buttons */}
 <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-semibold animate-card-fade">
 {rescheduleSession ? (
 <button
 type="button"
 onClick={() => {
 window.location.href = '/profile?tab=booked';
 }}
 className="px-6 py-3 bg-surface-900 hover:bg-surface-800 text-white text-[10px] font-black rounded-[10px] transition cursor-pointer w-full sm:w-auto text-center border-none shadow-none"
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
 className="px-6 py-3 bg-white border border-surface-200 text-surface-900 hover:bg-surface-50 text-[10px] font-black rounded-[10px] transition cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
 >
 <FileDown className="w-4 h-4 text-surface-700" />
 {downloadingPdf ? 'Generating PDF...' : 'Download PDF Receipt'}
 </button>

 <button
 type="button"
 onClick={resetBookingState}
 className="px-6 py-3 bg-surface-900 hover:bg-surface-800 text-white text-[10px] font-black rounded-[10px] transition cursor-pointer w-full sm:w-auto text-center border-none shadow-none"
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
 <div className="lg:col-span-8 text-left min-h-[380px] relative">

 {/* STEP 1: Schedule & Advisor */}
 {bookingStep === 'config' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="border-b border-surface-200 pb-3">
 <h3 className="text-[10px] font-black text-surface-900 flex items-center gap-2">
 <span className="w-6 h-6 rounded-[10px] bg-surface-900 text-white text-[10px] flex items-center justify-center shrink-0 font-black">1</span>
 Schedule & Advisor
 </h3>
 <p className="text-[10px] font-bold text-surface-500 mt-1">Select a date, choose your advisor, and pick a time.</p>
 </div>

 <div className="space-y-6">
 {/* Service Type Selection */}
 <div className="space-y-2">
 <label className="text-[10px] font-black text-surface-500 block">Select Service Type</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
 {[
 { id: 'counselling', label: 'Psychological Counselling' },
 { id: 'career', label: 'Career Mentoring' }
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
 className={`min-h-[48px] px-4 py-3 rounded-[10px] transition-all duration-300 cursor-pointer flex items-center justify-center text-center border-[2px] border-surface-900 text-[10px] font-black ${isSelected
 ? 'bg-surface-900 text-white'
 : 'bg-white text-surface-900 hover:bg-surface-50'
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
 <label className="text-[10px] font-black text-surface-500 block">Select Session Mode</label>
 <div className="grid grid-cols-3 gap-2.5 w-full">
 {(() => {
 let siteSettings = {};
 try {
 const stored = localStorage.getItem('behold_site_settings');
 if (stored) siteSettings = JSON.parse(stored);
 } catch (e) { }

 return [
 { id: 'ONLINE', label: 'Online', desc: 'Video call', active: siteSettings.enableOnline !== false },
 { id: 'DOOR_STEP', label: 'Doorstep', desc: 'Home visit', active: siteSettings.enableDoorstep !== false },
 { id: 'OFFLINE', label: 'Offline', desc: 'At center', active: siteSettings.enableOffline !== false }
 ].map((m) => {
 const isAvailable = m.active;
 return (
 <button
 type="button"
 key={m.id}
 disabled={!isAvailable || rescheduleSession}
 onClick={() => {
 if (rescheduleSession) return;
 setBookingMode(m.id);
 }}
 className={`flex flex-col items-center justify-center gap-1 px-3 py-2 border-[2px] rounded-[10px] transition cursor-pointer text-center min-h-[48px] leading-tight ${bookingMode === m.id
 ? 'bg-surface-100 text-surface-900 border-surface-900'
 : 'bg-white text-surface-600 border-surface-200 hover:border-surface-900 hover:text-surface-900'
 } ${(!isAvailable || rescheduleSession) ? 'opacity-40 cursor-not-allowed' : ''}`}
 >
 <span className="flex flex-col items-center">
 <span className="font-black text-[10px] text-surface-900 ">{m.label}</span>
 <span className="text-[10px] font-bold text-surface-500 mt-0.5">{m.desc}</span>
 {!isAvailable && <span className="text-[9px] text-rose-500 font-bold mt-1 ">Disabled</span>}
 </span>
 </button>
 );
 });
 })()}
 </div>
 </div>

 {/* DOORSTEP LOCATION INPUTS - CONFIG STEP */}
 {bookingMode === 'DOOR_STEP' && (
 <div className="space-y-4 p-0 sm:p-5 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-[10px] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
 <div className="border-b border-surface-200 pb-2 mb-2">
 <h4 className="text-[10px] font-black text-surface-900 flex items-center gap-1.5">
 <span className="w-1.5 h-3 bg-surface-900 rounded-[10px]"></span>
 Doorstep Visit Address & Geolocation
 </h4>
 <p className="text-[10px] font-bold text-surface-500 mt-1">
 Please provide your location to check for nearby psychologists within a 10 km service radius.
 </p>
 </div>

 {/* Search Location Address field */}
 <div className="space-y-1.5 text-left relative">
 <label className="text-[10px] font-black text-surface-500 block">Search Location Address</label>
 <div className="flex flex-col sm:flex-row gap-2">
 <input
 type="text"
 placeholder="Type your address to search... (e.g. Kozhikode, Kerala)"
 value={clientSearchQuery}
 onChange={(e) => setClientSearchQuery(e.target.value)}
 className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-surface-200 text-xs font-bold text-surface-900 outline-none focus:border-surface-900 rounded-[10px] transition"
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
 className="w-full sm:w-auto px-4 py-2.5 bg-surface-900 text-white text-[10px] font-black rounded-[10px] hover:bg-black transition cursor-pointer shrink-0 text-center border-none"
 >
 {isClientSearching ? 'Searching...' : 'Search'}
 </button>
 </div>

 {/* Autocomplete Dropdown */}
 {clientSearchResults.length > 0 && (
 <div className="absolute left-0 right-0 mt-1 bg-white border border-surface-200 rounded-[10px] max-h-40 overflow-y-auto z-50 shadow-square-light divide-y divide-surface-100">
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
 className="w-full text-left px-3.5 py-2.5 text-xs text-surface-600 font-bold hover:text-surface-900 hover:bg-surface-50 transition-colors block truncate"
 >
 {res.display_name}
 </button>
 ))}
 </div>
 )}
 </div>

 <div className="space-y-1 text-left">
 <label className="text-[10px] font-black text-surface-500 block">Your Delivery / Visit Address</label>
 <input
 type="text"
 name="clientLocationName"
 value={bookingForm.clientLocationName || ''}
 onChange={(e) => {
 handleInputChange(e);
 setClientSearchQuery(e.target.value);
 }}
 placeholder="e.g. Apartment/House No, Street Name, City, Pincode"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLocationName
 ? 'border-rose-500 bg-rose-50/50'
 : 'border-surface-200 bg-white'
 }`}
 />
 {errors.clientLocationName && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.clientLocationName}</p>}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1 text-left">
 <label className="text-[10px] font-black text-surface-500 block">Latitude</label>
 <input
 type="number"
 step="any"
 name="clientLatitude"
 value={bookingForm.clientLatitude || ''}
 onChange={handleInputChange}
 placeholder="e.g. 11.2588"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLatitude
 ? 'border-rose-500 bg-rose-50/50'
 : 'border-surface-200 bg-white'
 }`}
 />
 {errors.clientLatitude && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.clientLatitude}</p>}
 </div>
 <div className="space-y-1 text-left">
 <label className="text-[10px] font-black text-surface-500 block">Longitude</label>
 <input
 type="number"
 step="any"
 name="clientLongitude"
 value={bookingForm.clientLongitude || ''}
 onChange={handleInputChange}
 placeholder="e.g. 75.7804"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold text-surface-900 outline-none focus:border-surface-900 transition ${errors.clientLongitude
 ? 'border-rose-500 bg-rose-50/50'
 : 'border-surface-200 bg-white'
 }`}
 />
 {errors.clientLongitude && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.clientLongitude}</p>}
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 pt-2">
 <button
 type="button"
 disabled={isClientLocating}
 onClick={handleClientDetectLocation}
 className="px-4 py-2 border border-surface-200 hover:border-surface-300 text-surface-900 bg-white font-black text-[10px] rounded-[10px] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-none disabled:opacity-50 "
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
 <label className="text-[10px] font-black text-surface-900 block ">1. Select Date</label>
 <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-[10px]">
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
 ) : (
 <div className="p-4 sm:p-6 border border-dashed border-surface-200 rounded-[10px] bg-surface-50 text-surface-500 text-center font-bold text-[10px] mt-4">
 Please search or detect your location address to show available psychologists within 10 km.
 </div>
 )}

 {/* Step 2: Advisor Selection */}
 {(selectedDate || isAdvisorLocked) && (
 <div className="space-y-3 pt-6 border-t border-surface-200 animate-in fade-in slide-in-from-top-2 duration-300">
 <div className="flex items-center justify-between">
 <label className="text-[10px] font-black text-surface-900 block ">
 2. {isAdvisorLocked ? 'Advisor Pre-Selected' : (selectedAdvisor ? 'Selected Advisor' : 'Choose Advisor')}
 </label>
 {selectedAdvisor && !isAdvisorLocked && (
 <button
 type="button"
 onClick={() => { setSelectedAdvisor(null); setSelectedTime(''); }}
 className="text-[10px] text-surface-500 font-bold uppercase tracking-widest hover:text-surface-900 cursor-pointer"
 >
 Change
 </button>
 )}
 </div>
 {isAdvisorLocked && selectedAdvisor ? (
 <div className="p-4 border border-surface-900 bg-surface-50 shadow-square-light rounded-[10px]">
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1.5 text-left min-w-0 flex-1">
 <h4 className="font-black text-surface-900 text-sm sm:text-base leading-tight ">{selectedAdvisor.name}</h4>
 <p className="text-[10px] text-surface-500 font-bold ">{selectedAdvisor.role}</p>
 {bookingMode === 'OFFLINE' && selectedAdvisor.locationName && (
 <span className="text-[10px] text-surface-600 font-bold mt-1 block ">
 📍 Center: {selectedAdvisor.locationName}
 </span>
 )}
 <span className="text-[10px] font-black text-surface-900 mt-1 inline-block ">Pre-selected</span>
 </div>
 <div className="flex flex-col items-end gap-2 shrink-0">
 <span className="text-sm font-black text-surface-900 ">₹{selectedAdvisor.price}</span>
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-3">
 {(() => {
    const filteredAdvisors = advisors
      .filter(advisor => advisor.type === bookingService)
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
        <div className="p-4 border border-dashed border-surface-200 rounded-[10px] bg-surface-50 text-surface-500 text-center font-bold text-[10px]">
          No psychologists are available matching your criteria.
        </div>
      );
    }

    const availableAdvisors = filteredAdvisors.filter(advisor => getAdvisorSlotsForDate(advisor, selectedDate).length > 0);

    if (availableAdvisors.length === 0) {
      return (
        <div className="p-4 border border-dashed border-surface-200 rounded-[10px] bg-surface-50 text-surface-500 text-center font-bold text-[10px]">
          No psychologists are available on this selected date. Please choose another date.
        </div>
      );
    }

    const advisorsToRender = selectedAdvisor ? [selectedAdvisor] : availableAdvisors;

    return advisorsToRender.map((advisor) => {
      const slots = getAdvisorSlotsForDate(advisor, selectedDate);
      const isAvailable = slots.length > 0;
      const isSelected = selectedAdvisor?.id === advisor.id;

      if (isSelected) {
        return (
          <div key={advisor.id} className="border-[2px] border-brand rounded-[10px] bg-white overflow-hidden animate-in fade-in slide-in-from-top-2 text-left shadow-square-light relative">
            {/* TOP SECTION: Avatar + Name/Title */}
            <div className="p-4 sm:p-5 flex items-center gap-4 bg-surface-50 border-b border-surface-200">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-surface-200 bg-white shadow-square-light">
                <img src={advisor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(advisor.name)}&background=0f172a&color=fff&size=128`} alt={advisor.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-heading font-black text-xl text-surface-900 uppercase leading-none mb-1">{advisor.name}</h4>
                <p className="text-[10px] font-bold text-surface-900 uppercase tracking-widest">{advisor.role}</p>
              </div>
            </div>
            
            {/* MIDDLE SECTION 1: Specialties + Quote */}
            <div className="p-4 sm:p-5 border-b border-surface-200 space-y-4">
              <div>
                <span className="text-[10px] font-black text-surface-900 block mb-2.5 uppercase tracking-widest">Specialties</span>
                <div className="flex flex-wrap gap-2">
                  {advisor.specialties?.length > 0 ? advisor.specialties.map((spec, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white border border-surface-200 text-surface-900 text-[9px] sm:text-[10px] font-black rounded-[10px] uppercase tracking-wide">{spec}</span>
                  )) : (
                    <span className="px-3 py-1.5 bg-white border border-surface-200 text-surface-500 text-[10px] font-bold rounded-[10px] uppercase">General</span>
                  )}
                </div>
              </div>
              {advisor.bio && (
                <p className="text-sm font-medium text-surface-600 italic leading-relaxed">"{advisor.bio}"</p>
              )}
            </div>

            {/* MIDDLE SECTION 2: Grid Stats */}
            <div className="grid grid-cols-3 divide-x divide-surface-200 border-b border-surface-200 bg-surface-50">
              <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-surface-900 leading-none">{advisor.hours || '0'}+</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-surface-900 uppercase mt-1 tracking-widest">HOURS</span>
              </div>
              <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                <span className="font-heading font-black text-sm sm:text-lg text-surface-900 leading-none truncate w-full px-1">{advisor.lang || 'English'}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-surface-900 uppercase mt-1 tracking-widest">LANG</span>
              </div>
              <div className="p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                <span className="font-heading font-black text-xl sm:text-2xl text-surface-900 leading-none">₹{advisor.price}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-surface-900 uppercase mt-1 tracking-widest">SESSION</span>
              </div>
            </div>

            {/* BOTTOM SECTION: Availability + Buttons */}
            <div className="p-4 sm:p-5 bg-white">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest">Next Available</span>
                <div className="px-3 py-1.5 bg-white border border-surface-200 text-[9px] font-black text-surface-900 rounded-[10px] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  AVAILABLE TODAY
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    window.open(`/advisors/${advisor.id}`, '_blank');
                  }} 
                  className="flex-1 py-3.5 bg-white border-[2px] border-surface-200 text-surface-900 font-black text-[11px] uppercase rounded-[10px] hover:border-surface-900 hover:bg-surface-50 transition-colors text-center cursor-pointer shadow-none"
                >
                  PROFILE
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
                  className="flex-1 py-3.5 bg-surface-900 text-white font-black text-[11px] uppercase rounded-[10px] hover:bg-black transition-colors text-center border-[2px] border-surface-900 cursor-pointer shadow-square-light"
                >
                  BOOK NOW
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
          className={`p-4 sm:p-5 border-[2px] rounded-[10px] transition ${!isAvailable
            ? 'bg-surface-50 border-surface-200 opacity-50 cursor-not-allowed'
            : 'bg-white border-surface-200 hover:border-surface-900 hover:shadow-square-light cursor-pointer active:scale-[0.99]'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-[2px] ${!isAvailable ? 'border-surface-200 opacity-50' : 'border-surface-200 bg-white'}`}>
                <img src={advisor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(advisor.name)}&background=0f172a&color=fff&size=128`} alt={advisor.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 text-left min-w-0">
                <h4 className={`font-heading font-black text-base sm:text-lg uppercase leading-none truncate ${!isAvailable ? 'text-surface-400' : 'text-surface-900'}`}>
                  {advisor.name}
                </h4>
                <p className="text-[10px] font-bold text-surface-900 uppercase tracking-widest truncate">{advisor.role}</p>
                {bookingMode === 'OFFLINE' && advisor.locationName && (
                  <span className="text-[10px] font-bold mt-1.5 block leading-tight text-surface-600 truncate">
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
                      <span className="text-[10px] text-surface-900 font-black mt-1.5 block uppercase tracking-widest">
                        📍 Distance: {distance.toFixed(2)} km
                      </span>
                    );
                  }
                  return null;
                })()}
                {!isAvailable && (
                  <span className="text-[10px] text-rose-500 font-bold mt-1.5 inline-block uppercase tracking-widest">
                    Unavailable on this date
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`font-heading font-black text-xl sm:text-2xl ${!isAvailable ? 'text-surface-400' : 'text-surface-900'}`}>
                ₹{advisor.price}
              </span>
            </div>
          </div>
        </div>
      );
    });
  })()}
 {errors.advisor && <p className="text-[10px] text-rose-500 font-bold mt-1 ">{errors.advisor}</p>}
 </div>
 )}
 </div>
 )}

  {/* Step 3: Time Selection */}
  {selectedDate && selectedAdvisor && (
 <div className="space-y-3 pt-6 border-t border-surface-200 animate-in fade-in slide-in-from-top-2 duration-300">
 <label className="text-[10px] font-black text-surface-900 block ">3. Select Time</label>
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
 <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-4 border-t border-surface-200">
 {rescheduleSession ? (
 <button
 type="button"
 disabled={!selectedDate || !selectedTime || isSubmitting}
 onClick={handleRescheduleConfirm}
 className="px-6 py-3 min-h-[48px] bg-surface-900 text-white font-black text-[10px] rounded-[10px] transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
 >
 {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
 </button>
 ) : (
 <button
 type="button"
 disabled={!selectedDate || !selectedTime || !selectedAdvisor}
 onClick={() => handleStepChange('payment')}
 className="px-6 py-3 min-h-[48px] bg-surface-900 text-white font-black text-[10px] rounded-[10px] transition hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-none shadow-none w-full sm:w-auto"
 >
 Account & Payment
 </button>
 )}
 </div>
 </div>
 )}

 {/* STEP 3: Account & Payment */}
 {bookingStep === 'payment' && (
 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="border-b border-surface-200 pb-3 flex items-center justify-between">
 <div>
 <h3 className="text-[10px] font-black text-surface-900 flex items-center gap-2">
 <span className="w-6 h-6 rounded-[10px] bg-surface-900 text-white text-[10px] flex items-center justify-center shrink-0 font-black">2</span>
 Account Details
 </h3>
 <p className="text-[10px] font-bold text-surface-500 mt-1">
 {user
 ? 'Signed in. Confirm your details, then proceed to payment.'
 : 'Fill your details, then sign in or create a free account to continue.'}
 </p>
 </div>
 <button
 type="button"
 onClick={() => handleStepChange('config')}
 className="text-[10px] text-surface-900 hover:text-black font-black transition"
 >
 ← Back to Schedule
 </button>
 </div>

 {user && (
 <div className="bg-surface-50 border border-surface-200 rounded-[10px] p-4 flex items-center justify-between gap-3 animate-in fade-in duration-300 shadow-square-light">
 <div className="flex-1 min-w-0">
 <span className="text-[10px] font-black text-surface-900 block truncate">{user.name}</span>
 <span className="text-[10px] font-bold text-surface-600 truncate block">{user.email}</span>
 </div>
 <span className="shrink-0 text-[10px] font-black bg-surface-900 text-white px-2.5 py-1 rounded-[10px]">
 ✓ Authenticated
 </span>
 </div>
 )}

 {/* DOORSTEP LOCATION SUMMARY - PAYMENT STEP */}
 {bookingMode === 'DOOR_STEP' && (
 <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-[10px] text-left space-y-1 animate-in fade-in duration-300">
 <span className="font-black text-surface-900 block text-[10px]">
 Doorstep Visit Location
 </span>
 <p className="font-bold text-[10px] text-surface-900">{bookingForm.clientLocationName}</p>
 <p className="text-[10px] text-surface-500 font-bold">
 Coordinates: {bookingForm.clientLatitude}, {bookingForm.clientLongitude}
 </p>
 {(() => {
 const distance = getCalculatedDistance();
 if (distance !== null) {
 return (
 <span className="inline-block mt-1.5 font-black text-surface-900 bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-[10px] text-[10px]">
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
 <div className="p-0 sm:p-4 bg-transparent sm:bg-surface-50 border-0 sm:border border-surface-200 rounded-[10px] text-left space-y-1.5 animate-in fade-in duration-300">
 <span className="font-black text-surface-900 block text-[10px]">
 Office / Center Visit Address
 </span>
 <p className="font-bold text-[10px] text-surface-900 flex items-start gap-1.5 leading-relaxed ">
 <svg className="w-3.5 h-3.5 text-surface-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 <span>{selectedAdvisor.locationName || 'Clinic/Center address not set'}</span>
 </p>
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1 text-left">
 <label className="text-[10px] font-black text-surface-500 block">Full Name</label>
 <input
 type="text"
 name="name"
 value={bookingForm.name}
 onChange={handleInputChange}
 placeholder="Your full name"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold text-surface-900 outline-none focus:border-surface-900 transition ${errors.name
 ? 'border-rose-500 bg-rose-50/50'
 : 'border-surface-200 bg-white'
 }`}
 />
 {errors.name && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.name}</p>}
 </div>
 <div className="space-y-1 text-left">
 <label className="text-[10px] font-black text-surface-500 block">WhatsApp / Mobile</label>
 <input
 type="tel"
 name="phone"
 value={bookingForm.phone}
 onChange={handleInputChange}
 placeholder="e.g. 9876543210"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold text-surface-900 outline-none focus:border-surface-900 transition ${errors.phone
 ? 'border-rose-500 bg-rose-50/50'
 : 'border-surface-200 bg-white'
 }`}
 />
 {errors.phone && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
 </div>
 <div className="space-y-1 sm:col-span-2 text-left">
 <label className="text-[10px] font-black text-surface-500 block">
 Email Address {user && <span className="text-surface-900 font-bold">(verified)</span>}
 </label>
 <input
 type="email"
 name="email"
 value={bookingForm.email}
 onChange={handleInputChange}
 disabled={!!user}
 placeholder="you@example.com"
 className={`w-full px-3.5 py-2.5 border rounded-[10px] text-xs font-bold outline-none transition ${user
 ? 'bg-surface-50 border-surface-200 text-surface-500 cursor-not-allowed'
 : errors.email
 ? 'border-rose-500 bg-rose-50/50 text-surface-900'
 : 'border-surface-200 bg-white text-surface-900 focus:border-surface-900'
 }`}
 />
 {errors.email && !user && <p className="text-[9.5px] text-rose-500 font-bold mt-1">{errors.email}</p>}
 </div>
 </div>

 {!user && (
 <div className="bg-surface-50 border border-surface-200 p-3 rounded-[10px] text-[10px] font-bold text-surface-500 text-left">
 <span className="text-surface-900 font-black block">Account Required to Continue</span>
 You'll be asked to sign in or create a free account when you click "Proceed to Payment" — your booking details are saved automatically.
 </div>
 )}

 {user && (
 <div className="bg-surface-50 border border-surface-200 p-3 rounded-[10px] text-[10px] font-bold text-surface-500 text-left">
 <span className="text-surface-900 font-black block">Notification Reminders</span>
 Live session reminders will be sent to your verified email &amp; WhatsApp number.
 </div>
 )}

 {/* --- PAYMENT SECTION --- */}
 <div className="pt-4 border-t border-surface-200 mt-6">
 <div className="border-b border-surface-200 pb-3 mb-6">
 <h3 className="text-[10px] font-black text-surface-900 flex items-center gap-2">
 <span className="w-6 h-6 rounded-[10px] bg-surface-900 text-white text-[10px] flex items-center justify-center shrink-0 font-black">3</span>
 Payment & Confirm
 </h3>
 <p className="text-[10px] text-surface-500 font-bold mt-1">Choose payment method, apply any promo codes, and confirm your booking.</p>
 </div>

 <form onSubmit={handlePaymentSubmit} className="space-y-6">

 <div className="p-4 bg-surface-50 border border-surface-200 rounded-[10px] space-y-4">
 <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
 <div className="w-12 h-12 bg-white border border-surface-200 rounded-[10px] flex items-center justify-center shrink-0 shadow-square-light">
 <svg className="w-6 h-6 text-surface-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
 </svg>
 </div>
 <div>
 <h5 className="text-[10px] font-black text-surface-900 ">Secure Payment Gateway</h5>
 <p className="text-[10px] text-surface-500 font-bold mt-1">
 A secure Razorpay checkout overlay will open to complete your payment using UPI, Cards, Netbanking, or Wallet.
 </p>
 </div>
 </div>
 </div>

 <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200 mt-6">
 <button
 type="button"
 onClick={() => handleStepChange('config')}
 className="px-5 py-3 min-h-[44px] bg-white border border-surface-200 text-surface-900 hover:bg-surface-50 font-bold text-xs rounded-[10px] transition cursor-pointer w-full sm:w-auto text-center"
 >
 Back to Schedule
 </button>

 <button
 type="submit"
 disabled={isProcessingPayment}
 className="px-6 py-3 min-h-[48px] btn-primary text-xs rounded-[10px] transition flex items-center justify-center cursor-pointer disabled:opacity-50 w-full sm:w-auto "
 >
 {isProcessingPayment ? (
 <div className="w-4 h-4 border-2 border-surface-900/30 border-t-brand rounded-full animate-spin" />
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
 className="flex lg:hidden items-center justify-between w-full bg-surface-50 border border-surface-200 p-3 rounded-[10px] text-left shadow-none mb-3 hover:bg-surface-100 transition cursor-pointer"
 >
 <span className="text-[10px] font-black text-surface-900 flex items-center gap-2">
 <span>Booking Summary</span>
 {selectedAdvisor && (
 <span className="text-[9px] bg-surface-900 text-white px-2 py-0.5 rounded-[10px] font-black ">
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

 <div className={`space-y-5 ${showSummary ? 'block' : 'hidden'} lg:block`}>
 <div>
 <h3 className="text-[10px] font-black text-surface-900 border-b border-surface-200 pb-2 hidden lg:block">
 Booking Summary
 </h3>
 </div>

 <div className="space-y-4 text-[10px] font-bold ">
 {/* Service type & Mode */}
 <div>
 <span className="text-[9.5px] text-surface-400 block font-bold mb-0.5">Service & Mode</span>
 <span className="font-bold text-surface-900 block text-left">
 {bookingService === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring'}
 </span>
 <span className="text-xs text-surface-500 font-bold block mt-0.5 bg-white border border-surface-200 rounded-[10px] px-2 py-0.5 w-fit">
 {bookingMode.replace('_', ' ')}
 </span>
 </div>

 {/* Date & Time Slot */}
 <div>
 <span className="text-[9.5px] text-surface-400 block font-bold mb-0.5">Date & Time</span>
 {selectedDate && selectedTime ? (
 <div className="space-y-1 bg-white border border-surface-200 p-2 rounded-[10px] text-left">
 <span className="font-bold text-surface-900 block">
 {formatDateString(selectedDate)}
 </span>
 <span className="text-xs text-surface-500 block font-bold">
 {selectedTime}
 </span>
 </div>
 ) : (
 <span className="text-surface-400 italic font-semibold text-xs block text-left">Not configured yet</span>
 )}
 </div>

 {/* Selected Advisor */}
 <div>
 <span className="text-[9.5px] text-surface-400 block font-bold mb-0.5">Advisor</span>
 {selectedAdvisor ? (
 <div className="bg-white border border-surface-200 p-2.5 rounded-[10px] text-left">
 <span className="font-bold text-surface-900 block text-xs">{selectedAdvisor.name}</span>
 <span className="text-[9.5px] text-surface-500 block font-semibold">{selectedAdvisor.role}</span>
 </div>
 ) : (
 <span className="text-surface-400 italic font-semibold text-xs block text-left">No advisor selected</span>
 )}
 </div>

 {/* Coupon Promo code input box */}
 <div className="pt-3 border-t border-surface-200 space-y-2 text-left">
 <span className="text-[9.5px] text-surface-500 block font-black">Have a Promo Code?</span>
 <div className="flex gap-2">
 <input
 type="text"
 placeholder="e.g. BEHOLD100"
 value={couponInput}
 onChange={(e) => setCouponInput(e.target.value)}
 disabled={appliedDiscount > 0}
 className="flex-1 px-3 py-1.5 bg-white border border-surface-200 rounded-[10px] text-[10px] font-bold outline-none focus:border-surface-900 transition"
 />
 {appliedDiscount > 0 ? (
 <button
 type="button"
 onClick={handleRemoveCoupon}
 className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-[10px] text-xs font-bold transition cursor-pointer"
 >
 Remove
 </button>
 ) : (
 <button
 type="button"
 onClick={handleApplyCoupon}
 className="px-3.5 py-1.5 bg-surface-900 hover:bg-black text-white rounded-[10px] text-xs font-bold transition cursor-pointer border-none "
 >
 Apply
 </button>
 )}
 </div>
 {couponMsg.text && (
 <p className={`text-[10px] font-bold ${couponMsg.type === 'success' ? 'text-surface-900' : 'text-rose-500'}`}>
 {couponMsg.text}
 </p>
 )}
 </div>

 {/* Invoice ledger calculation breakdown */}
 <div className="pt-3 border-t border-surface-200 space-y-2">
 <span className="text-[9.5px] text-surface-400 block font-bold text-left">Pricing Breakdown</span>

 <div className="space-y-1.5 text-xs font-semibold text-surface-500">
 <div className="flex justify-between">
 <span>Session Fee</span>
 <span className="text-surface-900 font-bold">₹{baseFee}</span>
 </div>

 {gstEnabled && (
 <div className="flex justify-between">
 <span>GST ({gstPercent}%)</span>
 <span className="text-surface-900 font-bold">₹{gstAmount}</span>
 </div>
 )}

 {appliedDiscount > 0 && (
 <div className="flex justify-between text-surface-900 font-bold">
 <span>Promo Discount</span>
 <span>-₹{appliedDiscount}</span>
 </div>
 )}

 <div className="flex justify-between text-[10px] font-black text-surface-900 border-t border-surface-200 pt-2 mt-1">
 <span>Net Total</span>
 <span className="text-surface-900">₹{netTotal}</span>
 </div>
 </div>
 </div>

 {/* Security badge */}
 <div className="pt-4 border-t border-surface-200 text-[10px] font-bold text-surface-400 text-center w-full">
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
 <div className="bg-white border border-surface-200 rounded-[10px] w-full max-w-sm p-6 shadow-square-light space-y-4 text-center animate-in zoom-in-95 duration-200">
 <div className="w-12 h-12 bg-amber-50 border border-amber-255 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm text-xl font-bold ">
 !
 </div>
 <div className="space-y-1">
 <h3 className="text-base font-bold capitalize text-zinc-900 tracking-wide">
 No Counsellors Found
 </h3>
 <p className="text-xs text-zinc-505 leading-relaxed font-sans font-light">
 There are no counsellors available matching your selected service type or mode. Please adjust your session preferences and try again.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setShowNoCounsellorsModal(false)}
 className="w-full py-2.5 bg-surface-900 hover:bg-black text-white font-bold text-xs rounded-[10px] cursor-pointer transition border-none shadow-none"
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



