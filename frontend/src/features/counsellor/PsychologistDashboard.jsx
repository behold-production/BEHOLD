import React, { useState, useEffect } from 'react';
import {
 User, Calendar, Clock, BookOpen, Link, ShieldAlert, Award, Globe,
 Edit, Video, BarChart3, AlertCircle, Save, LogOut,
 X, ChevronRight, Mail, Shield, Menu, FileText, Send, Eye, EyeOff, Bell, Check, MapPin, Navigation
} from 'lucide-react';
import {
 isNotificationSupported,
 getNotificationPermission,
 requestNotificationPermission,
 sendLocalNotification
} from '../../shared/services/notificationHelper';
import { useAuth } from '../../shared/context/AuthContext';
import { useCustomDialog } from '../../shared/context/CustomDialogContext';
import LogoutConfirmModal from '../../shared/components/LogoutConfirmModal';
import ApiService from '../../shared/services/api';
import jsPDF from 'jspdf';

// Extracted Components
import SidebarNav from './psychologist-dashboard/tabs/SidebarNav';
import OverviewTab from './psychologist-dashboard/tabs/OverviewTab';
import ProfileTab from './psychologist-dashboard/tabs/ProfileTab';
import AvailabilityTab from './psychologist-dashboard/tabs/AvailabilityTab';
import BookingsTab from './psychologist-dashboard/tabs/BookingsTab';
import RevenueTab from './psychologist-dashboard/tabs/RevenueTab';

// Shared Utils
import {
 isSessionCompleted,
 downloadDiagnosticPDF,
 parseTimeToMinutes,
 formatMinutesToTime
} from './psychologist-dashboard/utils';
import { formatDateString } from '../../shared/utils/dateFormatter';
import toast from 'react-hot-toast';


export default function PsychologistDashboard({ setView }) {
 const { user, login, register, logout, isLoading, updateUser } = useAuth();
 const { showPrompt } = useCustomDialog();

 const [currentSection, setCurrentSection] = useState('overview'); // overview, profile, availability, bookings
 const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
 const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
 const [permissionState, setPermissionState] = useState(getNotificationPermission());

 const handleEnableNotifications = async () => {
 const result = await requestNotificationPermission();
 setPermissionState(result);
 if (result === 'granted') {
 toast.success('Browser notifications enabled successfully!');
 sendLocalNotification('Notifications Active!', 'You will now receive desktop alerts from BEHOLD.');
 } else if (result === 'denied') {
 toast.error('Notification permission was denied. You may need to enable it in your browser settings.');
 }
 };

 const handleTestNotification = () => {
 const sent = sendLocalNotification('Test Notification', 'Hello! This is a test notification from BEHOLD.');
 if (sent) {
 toast.success('Test notification sent successfully!');
 } else {
 toast.error('Failed to send test notification. Make sure permissions are granted.');
 }
 };

 const handleNavClick = (section) => {
 setCurrentSection(section);
 setIsMobileMenuOpen(false);
 };

 // Profile state (server truth — updated by loadBookingsData)
 const [profile, setProfile] = useState({
 name: user?.name || '',
 role: user?.title || 'Consultant Psychologist',
 education: '',
 specialties: '',
 price: '',
 lang: '',
 bio: '',
 defaultMeetLink: '',
 hours: 0,
 modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
 locationName: '',
 latitude: 0,
 longitude: 0,
 
 bankAccountNumber: '',
 bankIfscCode: '',
 bankAccountName: ''
 });
 const [counsellorStatus, setCounsellorStatus] = useState(user?.status || 'PENDING');
 const [counsellorRejectionReason, setCounsellorRejectionReason] = useState(user?.rejectionReason || '');
 // Separate edit state — what the form binds to, so background refreshes don't clear the user's typing
 const [editProfile, setEditProfile] = useState(null);

 const isCounsellorVerified = () => {
 return counsellorStatus === 'APPROVED' || counsellorStatus === 'ACTIVE' || (user && (user.isVerified === true || user.status === 'APPROVED' || user.status === 'ACTIVE'));
 };

 const [isProfileSaved, setIsProfileSaved] = useState(false);
 const [bookings, setBookings] = useState([]);

 // Availability state
 const [activeDays, setActiveDays] = useState({
 1: true, // Monday
 2: true, // Tuesday
 3: true, // Wednesday
 4: true, // Thursday
 5: true, // Friday
 6: false, // Saturday
 0: false // Sunday
 });
 const [availableSlots, setAvailableSlots] = useState([]);
 const [allSlots, setAllSlots] = useState([]);
 const [customHour, setCustomHour] = useState('09');
 const [customMinute, setCustomMinute] = useState('00');
 const [customPeriod, setCustomPeriod] = useState('AM');
 const setSlotError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
 const slotError = '';
 const [isAvailabilitySaved, setIsAvailabilitySaved] = useState(false);

 // Input meeting link state per booking
 const [editingBookingId, setEditingBookingId] = useState(null);
 const [meetLinkInput, setMeetLinkInput] = useState('');
 const setMeetLinkError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
 const meetLinkError = '';
 const [editingFeedbackId, setEditingFeedbackId] = useState(null);
 const [notesInput, setNotesInput] = useState('');
 const [feedbackInput, setFeedbackInput] = useState('');
 const [nextSessionInput, setNextSessionInput] = useState('');
 const [activeBookingTab, setActiveBookingTab] = useState('CONFIRMED'); // CONFIRMED, COMPLETED, CANCELLED

 // Login form states
 const [loginEmail, setLoginEmail] = useState('');
 const [loginPassword, setLoginPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [showRegPassword, setShowRegPassword] = useState(false);
 const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
 const setLoginError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
 const loginError = '';
 const [isLoggingIn, setIsLoggingIn] = useState(false);

 // Onboarding & Registration Gate states
 const [gateMode, setGateMode] = useState('login'); // 'login' or 'register'
 const [onboardingStep, setOnboardingStep] = useState(1); // 1, 2, or 3

 // Registration Form States
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
    locationName: '',
    latitude: 0,
    longitude: 0
  });
 const setRegError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
 const regError = '';
 const [regActiveDays, setRegActiveDays] = useState({
 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
 });
 const [regAvailableSlots, setRegAvailableSlots] = useState([]);
 const [regAllSlots, setRegAllSlots] = useState([]);
 const [regCustomHour, setRegCustomHour] = useState('09');
 const [regCustomMinute, setRegCustomMinute] = useState('00');
 const [regCustomPeriod, setRegCustomPeriod] = useState('AM');
 const setRegSlotError = (msg) => { if (msg && !msg.includes('Status:')) import('react-hot-toast').then(mod => mod.toast.error(msg)) };
 const regSlotError = '';

 // Availability time range state
 const [fromHour, setFromHour] = useState('09');
 const [fromMinute, setFromMinute] = useState('00');
 const [fromPeriod, setFromPeriod] = useState('AM');
 const [toHour, setToHour] = useState('05');
 const [toMinute, setToMinute] = useState('00');
 const [toPeriod, setToPeriod] = useState('PM');

 // Registration onboarding time range state
 const [regFromHour, setRegFromHour] = useState('09');
 const [regFromMinute, setRegFromMinute] = useState('00');
 const [regFromPeriod, setRegFromPeriod] = useState('AM');
 const [regToHour, setRegToHour] = useState('05');
 const [regToMinute, setRegToMinute] = useState('00');
 const [regToPeriod, setRegToPeriod] = useState('PM');

 // Profile picture upload state
 const [profilePicFile, setProfilePicFile] = useState(null);
 const [isAvatarUploading, setIsAvatarUploading] = useState(false);
 const avatarFileRef = React.useRef(null);

 const handleCounsellorAvatarUpload = async (file) => {
 if (!file) return;
 const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
 if (!allowed.includes(file.type)) {
 import('react-hot-toast').then(mod => mod.toast.error('Only JPG/PNG images are allowed for profile picture.'));
 return;
 }
 setIsAvatarUploading(true);
 try {
 const fd = new FormData();
 fd.append('profilePic', file);
 const res = await ApiService.updateCounsellorProfilePic(fd);
 if (res.success) {
 import('react-hot-toast').then(mod => mod.toast.success('Profile picture updated!'));
 if (updateUser && user && res.data) updateUser({ ...user, profilePic: res.data.profilePic });
 setProfilePicFile(null);
 }
 } catch (err) {
 import('react-hot-toast').then(mod => mod.toast.error(err.message || 'Failed to upload picture.'));
 } finally {
 setIsAvatarUploading(false);
 }
 };

 const [isLoadingData, setIsLoadingData] = useState(true);

 const loadBookingsData = async (silent = false) => {
 try {
 const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');
 const hasToken = !!localStorage.getItem('behold_token');
 if (!isCounsellor || !hasToken) return;
 if (!silent) setIsLoadingData(true);

 // Fetch both profile and bookings concurrently
 const [profileRes, bookingsRes] = await Promise.all([
 ApiService.getCounsellorProfile(),
 ApiService.getAppointments()
 ]);

 // Load profile
 if (profileRes.success && profileRes.data) {
 const c = profileRes.data;
 setCounsellorStatus(c.status || 'PENDING');
 setCounsellorRejectionReason(c.rejectionReason || '');
 const specialtiesStr = c.specialties
 ? (Array.isArray(c.specialties) ? c.specialties.join(', ') : c.specialties)
 : '';
 setProfile({
 name: c.name || user.name || '',
 role: c.title || 'Consultant Psychologist',
 education: c.education || '',
 specialties: specialtiesStr,
 price: c.price !== undefined ? c.price : 1200,
 lang: c.lang || 'English, Malayalam',
 bio: c.bio || '',
 defaultMeetLink: c.defaultMeetLink || '',
 hours: c.hours || 0,
 modes: c.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
 locationName: c.locationName || '',
 latitude: c.latitude || 0,
 longitude: c.longitude || 0,
 
 bankAccountNumber: c.bankAccountNumber || '',
 bankIfscCode: c.bankIfscCode || '',
 bankAccountName: c.bankAccountName || ''
 });

 // Load availability
 if (c.availability) {
 const avail = c.availability;
 if (avail.activeDays) setActiveDays(avail.activeDays);
 if (avail.availableSlots) {
 setAvailableSlots(avail.availableSlots);
 // Ensure slots are added to the list of displayed slots
 setAllSlots(prev => {
 const merged = [...prev];
 avail.availableSlots.forEach(slot => {
 if (!merged.includes(slot)) {
 merged.push(slot);
 }
 });
 return merged;
 });
 }
 }
 }

 // Load bookings
 if (bookingsRes.success && bookingsRes.data) {
 const list = bookingsRes.data;
 const myBookings = list.map(b => ({
 ...b,
 id: b.id,
 userId: b.userId,
 userName: b.studentName || 'Student Name',
 advisorId: b.counsellorId,
 advisorName: b.counsellorName || user.name,
 date: b.date,
 time: b.time,
 mode: b.mode,
 status: b.status,
 meetLink: b.meetLink || '',
 feedback: b.feedback || '',
 service: b.service || 'counselling'
 })).sort((a, b) => {
 if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
 if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
 const isAConfirmed = a.status === 'CONFIRMED' || a.status === 'APPROVED';
 const isBConfirmed = b.status === 'CONFIRMED' || b.status === 'APPROVED';
 if (isAConfirmed && !isBConfirmed && b.status !== 'PENDING') return -1;
 if (isBConfirmed && !isAConfirmed && a.status !== 'PENDING') return 1;
 return (b.date || '').localeCompare(a.date || '');
 });
 setBookings(myBookings);
 } else {
 throw new Error(bookingsRes.message || "Failed to fetch appointments");
 }
 } catch (err) {
 console.error("Failed loading counsellor profile & bookings from API", err);
 toast.error("Failed to load dashboard data. Please try again.");
 } finally {
 setIsLoadingData(false);
 }
 };

 const downloadDiagnosticPDF = async (booking) => {
 try {
 const doc = new jsPDF({
 orientation: 'portrait',
 unit: 'mm',
 format: 'a4'
 });

 // Colors
 const brandDark = '#0f172a'; // slate-900
 const brandTeal = '#0d9488'; // teal-600
 const textGray = '#4b5563'; // gray-600

 // Top Accent Line
 doc.setFillColor(13, 148, 136); // Teal
 doc.rect(0, 0, 210, 10, 'F');

 // Clinical Header Title
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(22);
 doc.setTextColor(15, 23, 42); // Slate-900
 doc.text('BEHOLD.', 20, 25);

 doc.setFontSize(9);
 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(100, 116, 139); // slate-500
 doc.text('A Personal Development and Mentoring Ecosystem', 20, 30);

 // Document Type Tag
 doc.setFillColor(240, 253, 250); // Light teal bg
 doc.roundedRect(138, 18, 52, 11, 2, 2, 'F');
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(9);
 doc.setTextColor(13, 148, 136); // Teal text
 doc.text('CLINICAL REPORT', 144, 25);

 // Divider
 doc.setDrawColor(226, 232, 240); // slate-200
 doc.line(20, 36, 190, 36);

 // 1. Counsellor (Practitioner) Details - Left side
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(10);
 doc.setTextColor(15, 23, 42);
 doc.text('PRACTITIONER DETAILS', 20, 45);

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(8.5);
 doc.setTextColor(71, 85, 105); // slate-600

 const cName = booking.counsellorName || (booking.counsellor && booking.counsellor.name) || 'Consultant Psychologist';
 const cTitle = (booking.counsellor && booking.counsellor.title) || 'Consultant Psychologist';
 const cEdu = (booking.counsellor && booking.counsellor.education) || 'Professional Degree';
 const cPhone = (booking.counsellor && booking.counsellor.phone) || 'N/A';
 const cEmail = (booking.counsellor && booking.counsellor.email) || 'N/A';

 doc.text(`Name: ${cName}`, 20, 51);
 doc.text(`Title: ${cTitle}`, 20, 56);
 doc.text(`Education: ${cEdu}`, 20, 61);
 doc.text(`Contact: ${cPhone} | ${cEmail}`, 20, 66);

 // 2. Student (Client) Details - Right side
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(10);
 doc.setTextColor(15, 23, 42);
 doc.text('STUDENT DETAILS', 115, 45);

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(8.5);
 doc.setTextColor(71, 85, 105);

 const sName = booking.studentName || (booking.student && booking.student.name) || 'N/A';
 const sSchool = (booking.student && booking.student.schoolName) || 'N/A';
 const sGrade = (booking.student && booking.student.grade) || 'N/A';
 const sGName = (booking.student && booking.student.guardianName) || 'N/A';
 const sGPhone = (booking.student && booking.student.guardianPhone) || 'N/A';

 doc.text(`Name: ${sName}`, 115, 51);
 doc.text(`School: ${sSchool}`, 115, 56);
 doc.text(`Grade: ${sGrade}`, 115, 61);
 doc.text(`Guardian: ${sGName} (${sGPhone})`, 115, 66);

 // Divider
 doc.line(20, 72, 190, 72);

 // Metadata Info Box
 doc.setFillColor(248, 250, 252); // slate-50 bg
 doc.rect(20, 77, 170, 15, 'F');
 doc.setDrawColor(241, 245, 249);
 doc.rect(20, 77, 170, 15, 'S');

 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(8);
 doc.setTextColor(100, 116, 139); // slate-500
 doc.text('REPORT ID:', 24, 82);
 doc.text('SESSION SCHEDULE:', 80, 82);
 doc.text('DATE GENERATED:', 145, 82);

 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(15, 23, 42);
 const displayId = booking.id ? booking.id.toString().substring(Math.max(0, booking.id.toString().length - 6)) : 'N/A';
 doc.text(`CL-REP-${displayId}`, 24, 88);
 doc.text(`${formatDateString(booking.date)} at ${booking.time}`, 80, 88);
 doc.text(`${formatDateString(new Date())}`, 145, 88);

 // Clinical Notes / Diagnostics Header
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(14);
 doc.setTextColor(13, 148, 136); // Teal Rx symbol
 doc.text('Rx', 20, 103);

 doc.setFontSize(11);
 doc.text('CLINICAL ASSESSMENT & DIAGNOSTICS', 27, 103);

 doc.setDrawColor(13, 148, 136);
 doc.setLineWidth(0.3);
 doc.line(20, 105, 190, 105);

 // Section Content Auto-Pagebreak System
 let y = 112;
 const bottomLimit = 265;

 const printTextSection = (titleText, bodyText, gapBeforeTitle = 10) => {
 // Check if title fits on current page
 if (y + gapBeforeTitle > bottomLimit) {
 doc.addPage();
 doc.setFillColor(13, 148, 136);
 doc.rect(0, 0, 210, 8, 'F');

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184);
 doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
 doc.line(20, 17, 190, 17);

 y = 25;
 } else {
 y += gapBeforeTitle;
 }

 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.setTextColor(15, 23, 42);
 doc.text(titleText, 20, y);
 y += 6;

 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(51, 65, 85);
 doc.setFontSize(8.5);

 const lines = doc.splitTextToSize(bodyText, 170);
 for (let i = 0; i < lines.length; i++) {
 if (y > bottomLimit) {
 doc.addPage();
 doc.setFillColor(13, 148, 136);
 doc.rect(0, 0, 210, 8, 'F');

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184);
 doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
 doc.line(20, 17, 190, 17);

 y = 25;
 }
 // Restore font style for text lines after page break
 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(51, 65, 85);
 doc.setFontSize(8.5);

 doc.text(lines[i], 20, y);
 y += 4.5;
 }
 };

 // 1. Clinical Assessment Notes
 const clinicalNotes = booking.notes || 'No clinical/diagnostic notes recorded for this session.';
 printTextSection('Clinical Assessment & Observation Notes:', clinicalNotes, 8);

 // 2. Recommendations & Feedback
 const feedbackText = booking.feedback || 'No student-facing feedback or recommendations recorded.';
 printTextSection('Recommendations & Feedback:', feedbackText, 10);

 // 3. Next Session (Optional)
 const hasNextSession = booking.nextSession &&
 booking.nextSession.trim() !== '' &&
 booking.nextSession.trim().toLowerCase() !== 'n/a' &&
 booking.nextSession.trim().toLowerCase() !== 'none' &&
 booking.nextSession.trim().toLowerCase() !== 'no' &&
 booking.nextSession.trim().toLowerCase() !== 'null';

 if (hasNextSession) {
 if (y + 12 > bottomLimit) {
 doc.addPage();
 doc.setFillColor(13, 148, 136);
 doc.rect(0, 0, 210, 8, 'F');

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184);
 doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
 doc.line(20, 17, 190, 17);

 y = 25;
 } else {
 y += 10;
 }

 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(9.5);
 doc.setTextColor(15, 23, 42);
 doc.text('Next Session Approximate Time:', 20, y);
 y += 5.5;

 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(51, 65, 85);
 doc.setFontSize(8.5);
 doc.text(booking.nextSession.trim(), 20, y);
 y += 5;
 }

 // Footer / Prescription style signature line
 let sigY = y + 18;
 if (sigY > 250) {
 doc.addPage();
 doc.setFillColor(13, 148, 136);
 doc.rect(0, 0, 210, 8, 'F');

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184);
 doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
 doc.line(20, 17, 190, 17);

 sigY = 35;
 }

 doc.setDrawColor(203, 213, 225); // slate-300
 doc.setLineWidth(0.3);
 doc.line(130, sigY, 190, sigY);
 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(8.5);
 doc.setTextColor(15, 23, 42);
 doc.text('Authorized Signature', 142, sigY + 5);
 doc.setFont('Helvetica', 'normal');
 doc.setTextColor(100, 116, 139);
 doc.text(`${cName}, ${cTitle}`, 130, sigY + 9, { maxWidth: 60 });

 // Footer Notice
 doc.setFontSize(7.5);
 doc.text('This is a confidential medical-styled diagnostic document issued by the consultant psychologist.', 20, sigY + 18);
 doc.text('Please secure this document. For inquiries, reach out to contact@beholdaspire.com.', 20, sigY + 22);

 // Post-process: Add centered page numbers on all pages
 const totalPages = doc.internal.getNumberOfPages();
 for (let i = 1; i <= totalPages; i++) {
 doc.setPage(i);
 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(7.5);
 doc.setTextColor(148, 163, 184);
 doc.text(`Page ${i} of ${totalPages}`, 105, 288, { align: 'center' });
 }

 doc.save(`Clinical_Report_${sName.replace(/\s+/g, '_')}_${displayId}.pdf`);
 } catch (e) {
 console.error(e);
 toast.error("Failed to generate Clinical Diagnostic PDF: " + e.message);
 }
 };

 // Load advisor details & bookings from API
 useEffect(() => {
 const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');
 const hasToken = !!localStorage.getItem('behold_token');
 if (isCounsellor && hasToken) {
 loadBookingsData(false);
 }
 }, [user]);

 // Handle Google Auth Return Params
 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 const googleStatus = params.get('google');
 if (googleStatus) {
 if (googleStatus === 'success') {
 import('react-hot-toast').then(mod => mod.toast.success('Google Calendar Connected!'));
 } else if (googleStatus === 'error') {
 import('react-hot-toast').then(mod => mod.toast.error('Failed to connect Google Calendar'));
 }
 // Remove query param
 window.history.replaceState({}, document.title, window.location.pathname);
 }
 }, []);

 // Auto-refresh bookings silently when switching to bookings or overview tab
 useEffect(() => {
 if (currentSection === 'bookings' || currentSection === 'overview') {
 loadBookingsData(true);
 }
 // When entering the profile edit section, sync editProfile from latest server data
 if (currentSection === 'profile') {
 setEditProfile({ ...profile });
 }
 }, [currentSection]);

 // Onboarding Step Handlers
 const handleStepOneNext = (e) => {
 e.preventDefault();
 setRegError('');

 if (!regForm.name.trim() || !regForm.email.trim() || !regForm.password || !regForm.confirmPassword) {
 setRegError("All fields are required.");
 return;
 }
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(regForm.email)) {
 setRegError("Please enter a valid email address.");
 return;
 }
 if (regForm.password.length < 6) {
 setRegError("Password must be at least 6 characters.");
 return;
 }
 if (regForm.password !== regForm.confirmPassword) {
 setRegError("Passwords do not match.");
 return;
 }

 setOnboardingStep(2);
 };

 const handleStepTwoNext = (e) => {
 e.preventDefault();
 setRegError('');

 if (!regForm.education.trim() || !regForm.specialties.trim() || !regForm.bio.trim()) {
 setRegError("Education, Specialties, and Bio are required.");
 return;
 }
 if (!regForm.modes || regForm.modes.length === 0) {
 setRegError("Please select at least one supported session mode.");
 return;
 }
 if (Number(regForm.price) <= 0) {
 setRegError("Hourly price must be greater than 0.");
 return;
 }

 setOnboardingStep(3);
 };

 const handleCompleteOnboarding = async (e) => {
 e.preventDefault();
 setRegError('');
 setIsLoggingIn(true);

 if (!regAvailableSlots || regAvailableSlots.length === 0) {
 setRegError("Please configure at least one availability slot to complete registration.");
 setIsLoggingIn(false);
 return;
 }

 try {
 // Convert specialties string to array
 const specialtiesArr = regForm.specialties
 ? regForm.specialties.split(',').map(s => s.trim()).filter(Boolean)
 : [];

    const extraPayload = {
      education: regForm.education.trim(),
      specialties: specialtiesArr,
      price: Number(regForm.price) || 1200,
      lang: regForm.lang.trim(),
      bio: regForm.bio.trim(),
      defaultMeetLink: regForm.defaultMeetLink.trim(),
      hours: Number(regForm.hours) || 0,
      modes: regForm.modes || ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
      title: 'Consultant Psychologist',
      locationName: regForm.locationName.trim(),
      latitude: Number(regForm.latitude) || 0,
      longitude: Number(regForm.longitude) || 0,
      availability: {
        activeDays: regActiveDays,
        availableSlots: regAvailableSlots
      }
    };

 await register(
 regForm.name.trim(),
 regForm.email.trim(),
 regForm.password,
 'PSYCHOLOGIST',
 extraPayload
 );

  setRegForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: '',
    hours: 0,
    modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP'],
    locationName: '',
    latitude: 0,
    longitude: 0
  });
 setOnboardingStep(1);
 setGateMode('login');
 } catch (err) {
 setRegError(err.message || "Failed to complete counsellor onboarding.");
 } finally {
 setIsLoggingIn(false);
 }
 };

 const toggleRegDay = (dayIndex) => {
 setRegActiveDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
 };

 // Auth Submit Handlers
 const handleCounsellorLogin = async (e) => {
 e.preventDefault();
 setLoginError('');
 setIsLoggingIn(true);
 try {
 const loggedInUser = await login(loginEmail, loginPassword);
 const roleUpper = loggedInUser.role?.toUpperCase();
 if (roleUpper !== 'PSYCHOLOGIST' && roleUpper !== 'COUNSELLOR') {
 logout();
 setLoginError('Access Denied: Account does not have Counsellor privileges.');
 }
 } catch (err) {
 setLoginError(err.message || 'Invalid counsellor credentials.');
 } finally {
 setIsLoggingIn(false);
 }
 };

 const handleProfileSave = async (e) => {
 e.preventDefault();
 const formData = editProfile || profile;
 try {
 const specialtiesArr = formData.specialties
 ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
 : [];

 const payload = {
 name: formData.name,
 education: formData.education,
 specialties: specialtiesArr,
 price: Number(formData.price) || 1200,
 lang: formData.lang,
 bio: formData.bio,
 defaultMeetLink: formData.defaultMeetLink,
 hours: Number(formData.hours) || 0,
 modes: formData.modes,
 locationName: formData.locationName || '',
 latitude: Number(formData.latitude) || 0,
 longitude: Number(formData.longitude) || 0,
 
 bankAccountNumber: formData.bankAccountNumber || '',
 bankIfscCode: formData.bankIfscCode || '',
 bankAccountName: formData.bankAccountName || ''
 };

 if ((payload.modes.includes('DOOR_STEP') || payload.modes.includes('OFFLINE')) && (!payload.locationName.trim() || !payload.latitude || !payload.longitude)) {
 toast.error("Clinic / Office Address and coordinates are required when Offline or Doorstep modes are enabled.");
 return;
 }

 const res = await ApiService.updateCounsellorProfile(payload);
 if (res.success) {
 setIsProfileSaved(true);
 setTimeout(() => setIsProfileSaved(false), 3000);
 if (updateUser && user) {
 updateUser({
 ...user,
 name: payload.name
 });
 }
 await loadBookingsData();
 }
 } catch (err) {
 console.error("Failed to save counsellor profile via API", err);
 }
 };

 const handleAvailabilitySave = async (e) => {
 e.preventDefault();
 setSlotError('');
 if (!availableSlots || availableSlots.length === 0) {
 setSlotError("Please configure at least one availability slot to save.");
 return;
 }
 try {
 const payload = { activeDays, availableSlots };
 const res = await ApiService.updateAvailability(payload);
 if (res.success) {
 setIsAvailabilitySaved(true);
 setTimeout(() => setIsAvailabilitySaved(false), 3000);
 await loadBookingsData();
 }
 } catch (err) {
 console.error("Failed to save counsellor availability via API", err);
 setSlotError(err.message || "Failed to save availability.");
 }
 };

 const parseTimeToMinutes = (timeStr) => {
 const [time, period] = timeStr.split(' ');
 let [hours, minutes] = time.split(':').map(Number);
 if (period === 'PM' && hours !== 12) hours += 12;
 if (period === 'AM' && hours === 12) hours = 0;
 return hours * 60 + minutes;
 };

 const formatMinutesToTime = (minutes) => {
 let hours = Math.floor(minutes / 60);
 const mins = minutes % 60;
 const period = hours >= 12 ? 'PM' : 'AM';
 if (hours > 12) hours -= 12;
 if (hours === 0) hours = 12;
 const hourStr = String(hours).padStart(2, '0');
 const minStr = String(mins).padStart(2, '0');
 return `${hourStr}:${minStr} ${period}`;
 };

 const addTimeRangeSlots = (fromStr, toStr, isReg = false) => {
 const fromMins = parseTimeToMinutes(fromStr);
 const toMins = parseTimeToMinutes(toStr);
 if (fromMins >= toMins) {
 const err = 'Start time must be before end time.';
 if (isReg) setRegSlotError(err); else setSlotError(err);
 return;
 }

 const generated = [];
 // Generate every 60 minutes (1 hour)
 for (let m = fromMins; m <= toMins; m += 60) {
 generated.push(formatMinutesToTime(m));
 }

 if (isReg) {
 setRegAllSlots(prev => {
 const merged = [...prev];
 generated.forEach(slot => {
 if (!merged.includes(slot)) merged.push(slot);
 });
 return merged;
 });
 setRegAvailableSlots(prev => {
 const merged = [...prev];
 generated.forEach(slot => {
 if (!merged.includes(slot)) merged.push(slot);
 });
 return merged;
 });
 } else {
 setAllSlots(prev => {
 const merged = [...prev];
 generated.forEach(slot => {
 if (!merged.includes(slot)) merged.push(slot);
 });
 return merged;
 });
 setAvailableSlots(prev => {
 const merged = [...prev];
 generated.forEach(slot => {
 if (!merged.includes(slot)) merged.push(slot);
 });
 return merged;
 });
 }
 };

 const handleAddCustomSlot = () => {
 setSlotError('');
 const slotStr = `${customHour}:${customMinute} ${customPeriod}`;
 if (allSlots.includes(slotStr)) {
 setSlotError('This slot already exists.');
 return;
 }
 setAllSlots(prev => [...prev, slotStr]);
 setAvailableSlots(prev => [...prev, slotStr]); // Add and select it
 };

 const handleRemoveSlot = (slot) => {
 setAllSlots(prev => prev.filter(s => s !== slot));
 setAvailableSlots(prev => prev.filter(s => s !== slot));
 };

 const handleAddRegCustomSlot = () => {
 setRegSlotError('');
 const slotStr = `${regCustomHour}:${regCustomMinute} ${regCustomPeriod}`;
 if (regAllSlots.includes(slotStr)) {
 setRegSlotError('This slot already exists.');
 return;
 }
 setRegAllSlots(prev => [...prev, slotStr]);
 setRegAvailableSlots(prev => [...prev, slotStr]);
 };

 const handleRemoveRegSlot = (slot) => {
 setRegAllSlots(prev => prev.filter(s => s !== slot));
 setRegAvailableSlots(prev => prev.filter(s => s !== slot));
 };

 // Google Meet Link editing
 const startEditMeetLink = (booking) => {
 setEditingBookingId(booking.id);
 setMeetLinkInput(booking.meetLink || profile.defaultMeetLink || '');
 setMeetLinkError('');
 };

 const saveMeetLink = async (bookingId) => {
 const trimmed = meetLinkInput.trim();
 if (trimmed && !trimmed.startsWith('https://')) {
 setMeetLinkError('Please enter a valid URL beginning with https://');
 return;
 }
 setMeetLinkError('');

 try {
 const res = await ApiService.updateAppointmentMeetLink(bookingId, trimmed);
 if (res.success) {
 await loadBookingsData();
 setEditingBookingId(null);
 } else {
 setMeetLinkError(res.message || 'Failed to update meeting link');
 }
 } catch (err) {
 console.error("Failed to save Meet link", err);
 setMeetLinkError(err.message || 'Failed to update meeting link');
 }
 };

 const updateBookingStatus = async (bookingId, newStatus, currentStatus) => {
 try {
 let res;
 if (newStatus === 'CONFIRMED' || newStatus === 'APPROVED') {
 if (currentStatus === 'COMPLETED') {
 const reason = await showPrompt("Please enter a reason for reverting this session back to Confirmed:", '', 'Revert Session', 'Enter reason...');
 if (reason === null) return;
 res = await ApiService.revertToConfirmed(bookingId, reason);
 } else {
 res = await ApiService.approveAppointment(bookingId);
 }
 } else if (newStatus === 'CANCELLED') {
 const reason = await showPrompt("Please enter a reason for cancelling this session:", '', 'Cancel Session', 'Enter cancellation reason...');
 if (reason === null) return;
 res = await ApiService.cancelAppointment(bookingId, reason);
 } else if (newStatus === 'COMPLETED') {
 const notes = await showPrompt("Please enter Clinical Assessment & Observation Notes to complete this session:", '', 'Complete Session', 'Enter Clinical Notes...', true);
 if (!notes) {
 import('react-hot-toast').then(mod => mod.toast.error('Clinical Assessment & Observation Notes are required to complete a session.'));
 return;
 }
 res = await ApiService.completeAppointment(bookingId, {
 notes: notes.trim(),
 feedback: '',
 nextSession: ''
 });
 } else if (newStatus === 'REJECTED') {
 const reason = await showPrompt("Please enter a reason for declining this request:", '', 'Decline Request', 'Enter decline reason...');
 if (reason === null) return;
 res = await ApiService.rejectAppointment(bookingId, reason);
 }

 if (res && res.success) {
 // Trigger a local desktop notification for the counsellor's feedback
 const targetBooking = bookings.find(b => b.id === bookingId);
 const clientName = targetBooking ? targetBooking.userName : 'Client';
 let alertTitle = "Session Updated";
 let alertMsg = `Session status updated to ${newStatus}.`;
 if (newStatus === 'CONFIRMED' || newStatus === 'APPROVED') {
 alertTitle = "Session Approved";
 alertMsg = `You approved the session request for ${clientName}.`;
 } else if (newStatus === 'CANCELLED') {
 alertTitle = "Session Cancelled";
 alertMsg = `You cancelled the session for ${clientName}.`;
 } else if (newStatus === 'COMPLETED') {
 alertTitle = "Session Completed";
 alertMsg = `Session with ${clientName} marked as completed successfully.`;
 } else if (newStatus === 'REJECTED') {
 alertTitle = "Session Declined";
 alertMsg = `You declined the session request for ${clientName}.`;
 }
 sendLocalNotification(alertTitle, alertMsg);

 await loadBookingsData();
 }
 } catch (err) {
 console.error("Failed to update booking status via API", err);
 }
 };

 const saveFeedback = async (bookingId) => {
 try {
 const res = await ApiService.updateAppointmentFeedback(bookingId, {
 notes: notesInput.trim(),
 feedback: feedbackInput.trim(),
 nextSession: nextSessionInput.trim()
 });
 if (res.success) {
 await loadBookingsData();
 setEditingFeedbackId(null);
 }
 } catch (err) {
 console.error("Failed to save feedback via API", err);
 }
 };

 const toggleDay = (dayIndex) => {
 setActiveDays(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
 };

 const DAYS_OF_WEEK = [
 { label: 'Monday', index: 1 },
 { label: 'Tuesday', index: 2 },
 { label: 'Wednesday', index: 3 },
 { label: 'Thursday', index: 4 },
 { label: 'Friday', index: 5 },
 { label: 'Saturday', index: 6 },
 { label: 'Sunday', index: 0 }
 ];

 // --- LOGIN GATE UI ---
 const isCounsellor = user && (user?.role?.toUpperCase() === 'PSYCHOLOGIST' || user?.role?.toUpperCase() === 'COUNSELLOR');

 if (isLoading) {
 return (
 <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
 <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full"></div>
 </div>
 );
 }
  // --- 1. COUNSELLOR PORTAL LOGIN GATE ---
  if (!isCounsellor) {
    return (
      <div className='min-h-screen bg-[#030712] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden text-left'>
        {/* Ambient background glows */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 pointer-events-none'
             style={{ background: 'radial-gradient(circle at 35% 45%, rgba(0, 229, 255, 0.08), transparent 50%), radial-gradient(circle at 65% 55%, rgba(99, 102, 241, 0.05), transparent 50%)' }} />
        
        {/* Logo Header outside the card */}
        <div className='text-center mb-8 relative z-10'>
          <h1 className='text-3xl font-extrabold tracking-wider text-white font-header'>
            BEHOLD<span className='text-[#00E5FF]'>.</span>
          </h1>
          <p className='text-[10px] tracking-[0.25em] font-bold text-[#818CF8] mt-2 uppercase'>
            Counsellor Central Portal
          </p>
        </div>

        <div className='relative z-10 w-full max-w-[460px] bg-[#0c1424]/95 backdrop-blur-xl border border-slate-800/80 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300'>
          {/* Tabs */}
          <div className='flex border-b border-slate-800/80'>
            <button
              type='button'
              onClick={() => setGateMode('login')}
              className={`w-1/2 py-4 text-center font-bold text-sm transition relative cursor-pointer ${
                gateMode === 'login' ? 'text-white' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Sign In
              {gateMode === 'login' && (
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-[#00E5FF] shadow-[0_2px_8px_rgba(0,229,255,0.4)]' />
              )}
            </button>
            <button
              type='button'
              onClick={() => { setGateMode('register'); setOnboardingStep(1); setRegError(''); }}
              className={`w-1/2 py-4 text-center font-bold text-sm transition relative cursor-pointer ${
                gateMode === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              Register Consultant
              {gateMode === 'register' && (
                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-[#00E5FF] shadow-[0_2px_8px_rgba(0,229,255,0.4)]' />
              )}
            </button>
          </div>

          <div className='p-8'>
            {gateMode === 'login' ? (
              <div>
                <h2 className='text-lg font-bold text-white text-left font-header'>Counsellor Sign In</h2>
                <p className='text-xs text-slate-500 text-left mt-1.5 mb-6 leading-relaxed'>
                  Access schedules, update clinic slots, and edit video rooms.
                </p>

                {regError && (
                  <div className='mb-5 p-3.5 bg-red-955/30 border border-red-900/50 rounded-lg text-red-200 text-xs font-medium text-left'>
                    {regError}
                  </div>
                )}

                <form onSubmit={handleCounsellorLogin} className='space-y-5 text-left'>
                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      required
                      placeholder='enter your mail id'
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      disabled={isLoggingIn}
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-slate-400 mb-2'>
                      Password
                    </label>
                    <div className='relative'>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder='••••••••'
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] pr-10 transition duration-200'
                        disabled={isLoggingIn}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(v => !v)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition cursor-pointer bg-transparent border-none outline-none'
                      >
                        {showPassword ? <EyeOff className='w-4.5 h-4.5' /> : <Eye className='w-4.5 h-4.5' />}
                      </button>
                    </div>
                  </div>

                  <div className='pt-2'>
                    <button
                      type='submit'
                      disabled={isLoggingIn}
                      className='w-full bg-[#00E5FF] hover:bg-[#00bccc] text-slate-950 font-bold py-3 rounded-lg text-sm transition duration-200 cursor-pointer shadow-lg shadow-[#00E5FF]/10 active:scale-[0.98] border-none flex items-center justify-center gap-1'
                    >
                      {isLoggingIn ? (
                        <div className='w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto' />
                      ) : (
                        'Enter Consultant Desk'
                      )}
                    </button>
                    
                    <a href='/' className='w-full text-center text-xs text-slate-500 hover:text-slate-350 transition pt-4 cursor-pointer block'>
                      Back to Homepage
                    </a>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                {/* Steps tracker */}
                <div className='flex items-center justify-start gap-2 mb-6 text-xs font-semibold'>
                  <span className={onboardingStep === 1 ? 'text-[#818CF8]' : 'text-slate-500'}>
                    1. Account Details
                  </span>
                  <span className='text-slate-600'>&gt;</span>
                  <span className={onboardingStep === 2 ? 'text-[#818CF8]' : 'text-slate-500'}>
                    2. Qualifications
                  </span>
                  <span className='text-slate-600'>&gt;</span>
                  <span className={onboardingStep === 3 ? 'text-[#818CF8]' : 'text-slate-500'}>
                    3. Schedule
                  </span>
                </div>

                {regError && (
                  <div className='mb-5 p-3.5 bg-red-955/30 border border-red-900/50 rounded-lg text-red-200 text-xs font-medium text-left'>
                    {regError}
                  </div>
                )}

                {/* STEP 1: Account Details */}
                {onboardingStep === 1 && (
                  <form onSubmit={handleStepOneNext} className='space-y-4.5 text-left'>
                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Full Name
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='e.g. Dr. Sandra Tomy'
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        required
                        placeholder='counsellor@example.com'
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div className='flex gap-4'>
                      <div className='w-1/2'>
                        <label className='block text-xs font-medium text-slate-400 mb-2'>
                          Password
                        </label>
                        <div className='relative'>
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            placeholder='••••••••'
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] pr-9 transition duration-200'
                          />
                          <button
                            type='button'
                            onClick={() => setShowRegPassword(v => !v)}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition cursor-pointer bg-transparent border-none outline-none'
                          >
                            {showRegPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                          </button>
                        </div>
                      </div>

                      <div className='w-1/2'>
                        <label className='block text-xs font-medium text-slate-400 mb-2'>
                          Confirm
                        </label>
                        <div className='relative'>
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder='••••••••'
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                            className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] pr-9 transition duration-200'
                          />
                          <button
                            type='button'
                            onClick={() => setShowRegConfirmPassword(v => !v)}
                            className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition cursor-pointer bg-transparent border-none outline-none'
                          >
                            {showRegConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className='pt-4'>
                      <button
                        type='submit'
                        className='w-full bg-[#00E5FF] hover:bg-[#00bccc] text-slate-950 font-bold py-3 rounded-lg text-sm transition duration-200 cursor-pointer shadow-lg shadow-[#00E5FF]/10 active:scale-[0.98] border-none'
                      >
                        Next: Clinical Details
                      </button>
                      
                      <a href='/' className='w-full text-center text-xs text-slate-500 hover:text-slate-350 transition pt-4 cursor-pointer block'>
                        Back to Homepage
                      </a>
                    </div>
                  </form>
                )}

                {/* STEP 2: Qualifications & Clinical details */}
                {onboardingStep === 2 && (
                  <form onSubmit={handleStepTwoNext} className='space-y-4.5 text-left'>
                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Education / Degree
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='e.g. PhD Clinical Psychology'
                        value={regForm.education}
                        onChange={(e) => setRegForm({ ...regForm, education: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div className='flex gap-4'>
                      <div className='w-1/2'>
                        <label className='block text-xs font-medium text-slate-400 mb-2'>
                          Hourly Session Fee (INR)
                        </label>
                        <input
                          type='number'
                          required
                          placeholder='1200'
                          value={regForm.price}
                          onChange={(e) => setRegForm({ ...regForm, price: e.target.value })}
                          className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                        />
                      </div>
                      <div className='w-1/2'>
                        <label className='block text-xs font-medium text-slate-400 mb-2'>
                          Experience (Years)
                        </label>
                        <input
                          type='number'
                          required
                          placeholder='5'
                          value={regForm.hours}
                          onChange={(e) => setRegForm({ ...regForm, hours: e.target.value })}
                          className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Languages Spoken
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='Malayalam, English, Tamil'
                        value={regForm.lang}
                        onChange={(e) => setRegForm({ ...regForm, lang: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Specialties (comma-separated)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='Anxiety, Relationship Dynamics, Career Stress'
                        value={regForm.specialties}
                        onChange={(e) => setRegForm({ ...regForm, specialties: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Default Google Meet Link (optional)
                      </label>
                      <input
                        type='url'
                        placeholder='https://meet.google.com/abc-defg-hij'
                        value={regForm.defaultMeetLink}
                        onChange={(e) => setRegForm({ ...regForm, defaultMeetLink: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                      />
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Supported Session Modes
                      </label>
                      <div className='flex gap-4 pt-1 justify-start text-left'>
                        {['ONLINE', 'OFFLINE', 'DOOR_STEP'].map(mode => {
                          const isSelected = regForm.modes?.includes(mode);
                          return (
                            <label key={mode} className='flex items-center gap-1.5 cursor-pointer text-sm text-white select-none'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={(e) => {
                                  let nextModes = [...(regForm.modes || [])];
                                  if (e.target.checked) {
                                    if (!nextModes.includes(mode)) nextModes.push(mode);
                                  } else {
                                    nextModes = nextModes.filter(m => m !== mode);
                                  }
                                  setRegForm({ ...regForm, modes: nextModes });
                                }}
                                className='w-3.5 h-3.5 rounded border-slate-800 bg-[#050811] text-[#00E5FF] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00E5FF]'
                              />
                              <span>{mode === 'DOOR_STEP' ? 'Doorstep' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className='border-t border-slate-800/80 pt-4 space-y-4'>
                      <h5 className='text-xs font-bold text-[#00E5FF] tracking-wider flex items-center gap-1.5'>
                        <MapPin className='w-3.5 h-3.5' /> Location & Practice Center
                      </h5>
                      <div>
                        <label className='block text-xs font-medium text-slate-400 mb-2'>
                          Clinic / Practice Center Address
                        </label>
                        <input
                          type='text'
                          required
                          placeholder='e.g. BEHOLD Mental Health Space, Cochin, Kerala'
                          value={regForm.locationName}
                          onChange={(e) => setRegForm({ ...regForm, locationName: e.target.value })}
                          className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                        />
                      </div>
                      <div className='flex gap-4 items-end'>
                        <div className='w-1/2'>
                          <label className='block text-xs font-medium text-slate-400 mb-2'>
                            Latitude
                          </label>
                          <input
                            type='number'
                            step='any'
                            required
                            placeholder='e.g. 9.9816'
                            value={regForm.latitude}
                            onChange={(e) => setRegForm({ ...regForm, latitude: e.target.value })}
                            className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                          />
                        </div>
                        <div className='w-1/2'>
                          <label className='block text-xs font-medium text-slate-400 mb-2'>
                            Longitude
                          </label>
                          <input
                            type='number'
                            step='any'
                            required
                            placeholder='e.g. 76.2999'
                            value={regForm.longitude}
                            onChange={(e) => setRegForm({ ...regForm, longitude: e.target.value })}
                            className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200'
                          />
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                setRegForm(prev => ({
                                  ...prev,
                                  latitude: parseFloat(position.coords.latitude.toFixed(6)),
                                  longitude: parseFloat(position.coords.longitude.toFixed(6))
                                }));
                                toast.success("Location coordinates fetched successfully!");
                              },
                              (error) => {
                                console.error(error);
                                toast.error("Failed to auto-fetch location. Please enter manually.");
                              }
                            );
                          } else {
                            toast.error("Geolocation is not supported by this browser.");
                          }
                        }}
                        className='w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-800 cursor-pointer flex items-center justify-center gap-1.5'
                      >
                        <Navigation className='w-3.5 h-3.5 text-[#00E5FF]' /> Auto-Detect Coordinates
                      </button>
                    </div>

                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Professional Bio
                      </label>
                      <textarea
                        rows='3'
                        required
                        placeholder='Describe your clinical expertise and background...'
                        value={regForm.bio}
                        onChange={(e) => setRegForm({ ...regForm, bio: e.target.value })}
                        className='w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-655 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] transition duration-200 resize-none'
                      />
                    </div>

                    <div className='pt-4 flex gap-3'>
                      <button
                        type='button'
                        onClick={() => setOnboardingStep(1)}
                        className='w-1/3 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-bold text-sm py-3 transition cursor-pointer active:scale-[0.98] bg-transparent'
                      >
                        Back
                      </button>
                      <button
                        type='submit'
                        className='w-2/3 bg-[#00E5FF] hover:bg-[#00bccc] text-slate-950 font-bold py-3 rounded-lg text-sm transition duration-200 cursor-pointer shadow-lg shadow-[#00E5FF]/10 active:scale-[0.98] border-none'
                      >
                        Next: Calendar
                      </button>
                    </div>
                    
                    <a href='/' className='w-full text-center text-xs text-slate-500 hover:text-slate-350 transition pt-2 cursor-pointer block'>
                      Back to Homepage
                    </a>
                  </form>
                )}

                {/* STEP 3: Timing Slots & Custom Scheduling */}
                {onboardingStep === 3 && (
                  <form onSubmit={handleCompleteOnboarding} className='space-y-5 text-left max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar'>
                    <div>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Operational Days
                      </label>
                      <div className='flex flex-wrap gap-1.5'>
                        {DAYS_OF_WEEK.map(day => {
                          const active = regActiveDays[day.index];
                          return (
                            <button
                              key={day.index}
                              type='button'
                              onClick={() => toggleRegDay(day.index)}
                              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                                active
                                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40'
                                  : 'bg-[#050811] border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {day.label.substring(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className='space-y-2 border-t border-slate-800/80 pt-4'>
                      <label className='block text-xs font-medium text-slate-400 mb-2'>
                        Timing Slots (Active)
                      </label>
                      <div className='grid grid-cols-2 gap-2'>
                        {regAllSlots.map(slot => {
                          const exists = regAvailableSlots.includes(slot);
                          return (
                            <div key={slot} className='flex items-center gap-1.5 w-full'>
                              <button
                                type='button'
                                onClick={() => {
                                  if (exists) {
                                    setRegAvailableSlots(prev => prev.filter(s => s !== slot));
                                  } else {
                                    setRegAvailableSlots(prev => [...prev, slot]);
                                  }
                                }}
                                className={`flex-1 py-2 border rounded-lg font-bold transition cursor-pointer text-xs ${
                                  exists
                                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40'
                                    : 'bg-[#050811] border-slate-800 text-slate-500 hover:text-slate-350'
                                }`}
                              >
                                {slot}
                              </button>
                              <button
                                type='button'
                                onClick={() => handleRemoveRegSlot(slot)}
                                className='px-2.5 py-2 bg-transparent border border-slate-800 hover:bg-rose-955/40 hover:border-rose-900 text-slate-500 hover:text-rose-450 rounded-lg text-xs font-bold transition cursor-pointer shrink-0'
                                title='Remove Slot'
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                        {regAllSlots.length === 0 && (
                          <div className='col-span-2 py-4 bg-[#050811] border border-dashed border-slate-800 rounded-lg text-slate-500 italic text-xs text-center w-full'>
                            No timing slots configured. Use the controls below to add custom slots or generate from a time range.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='space-y-3 border-t border-slate-800/80 pt-4'>
                      <label className='block text-xs font-medium text-slate-400'>Add Custom Timing Slot</label>
                      <div className='flex gap-2 items-end'>
                        <div className='flex-1 space-y-1.5'>
                          <label className='text-[10px] text-slate-500 font-bold block'>Hour</label>
                          <select
                            value={regCustomHour}
                            onChange={(e) => setRegCustomHour(e.target.value)}
                            className='w-full bg-[#050811] border border-slate-805 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                          >
                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className='flex-1 space-y-1.5'>
                          <label className='text-[10px] text-slate-500 font-bold block'>Minute</label>
                          <select
                            value={regCustomMinute}
                            onChange={(e) => setRegCustomMinute(e.target.value)}
                            className='w-full bg-[#050811] border border-slate-805 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className='flex-1 space-y-1.5'>
                          <label className='text-[10px] text-slate-500 font-bold block'>AM/PM</label>
                          <select
                            value={regCustomPeriod}
                            onChange={(e) => setRegCustomPeriod(e.target.value)}
                            className='w-full bg-[#050811] border border-slate-805 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                          >
                            <option value='AM'>AM</option>
                            <option value='PM'>PM</option>
                          </select>
                        </div>
                        <button
                          type='button'
                          onClick={handleAddRegCustomSlot}
                          className='bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-slate-950 px-3.5 py-2 text-xs font-bold rounded-lg transition border border-[#00E5FF]/30 hover:border-none cursor-pointer shrink-0 h-[34px] flex items-center justify-center font-header'
                        >
                          Add Slot
                        </button>
                      </div>
                    </div>

                    <div className='space-y-3 border-t border-slate-800/80 pt-4'>
                      <label className='block text-xs font-medium text-slate-400'>Add Custom Time Range (From / To)</label>
                      <div className='flex flex-col gap-3'>
                        <div className='flex gap-2 items-center'>
                          <span className='text-xs text-slate-500 font-bold tracking-wide w-10 text-left'>From:</span>
                          <div className='flex-1'>
                            <select
                              value={regFromHour}
                              onChange={(e) => setRegFromHour(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex-1'>
                            <select
                              value={regFromMinute}
                              onChange={(e) => setRegFromMinute(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex-1'>
                            <select
                              value={regFromPeriod}
                              onChange={(e) => setRegFromPeriod(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              <option value='AM'>AM</option>
                              <option value='PM'>PM</option>
                            </select>
                          </div>
                        </div>

                        <div className='flex gap-2 items-center'>
                          <span className='text-xs text-slate-500 font-bold tracking-wide w-10 text-left'>To:</span>
                          <div className='flex-1'>
                            <select
                              value={regToHour}
                              onChange={(e) => setRegToHour(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(h => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex-1'>
                            <select
                              value={regToMinute}
                              onChange={(e) => setRegToMinute(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              {['00', '15', '30', '45'].map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div className='flex-1'>
                            <select
                              value={regToPeriod}
                              onChange={(e) => setRegToPeriod(e.target.value)}
                              className='w-full bg-[#050811] border border-slate-800 focus:border-[#00E5FF] rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer'
                            >
                              <option value='AM'>AM</option>
                              <option value='PM'>PM</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type='button'
                          onClick={() => {
                            setRegSlotError('');
                            const fromStr = `${regFromHour}:${regFromMinute} ${regFromPeriod}`;
                            const toStr = `${regToHour}:${regToMinute} ${regToPeriod}`;
                            addTimeRangeSlots(fromStr, toStr, true);
                          }}
                          className='w-full bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-slate-950 py-2.5 text-xs font-bold rounded-lg transition border border-[#00E5FF]/30 hover:border-none cursor-pointer flex items-center justify-center font-header'
                        >
                          Generate Hourly Slots from Range
                        </button>
                      </div>
                    </div>

                    <div className='pt-6 flex gap-3'>
                      <button
                        type='button'
                        onClick={() => setOnboardingStep(2)}
                        className='w-1/3 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-bold text-sm py-3 transition cursor-pointer active:scale-[0.98] bg-transparent'
                      >
                        Back
                      </button>
                      <button
                        type='submit'
                        disabled={isLoggingIn}
                        className='w-2/3 bg-[#00E5FF] hover:bg-[#00bccc] text-slate-950 font-bold py-3 rounded-lg text-sm transition duration-200 cursor-pointer shadow-lg shadow-[#00E5FF]/10 active:scale-[0.98] border-none'
                      >
                        {isLoggingIn ? (
                          <div className='w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto' />
                        ) : (
                          'Complete & Launch'
                        )}
                      </button>
                    </div>
                    
                    <a href='/' className='w-full text-center text-xs text-slate-500 hover:text-slate-350 transition pt-2 cursor-pointer block'>
                      Back to Homepage
                    </a>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
 if (counsellorStatus === 'REJECTED' || user?.status === 'REJECTED') {
 return (
 <div className="min-h-screen bg-zinc-955 flex items-center justify-center p-4 relative overflow-hidden text-left">
 <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-rose-900/5 rounded-full blur-3xl pointer-events-none" />

 <div className="w-full max-w-md bg-zinc-900/60 border border-rose-900/30 rounded-[10px] p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl space-y-6">
 <div className="text-center space-y-3">
 <div className="w-16 h-16 mx-auto rounded-full bg-rose-955/20 border border-rose-900/30 flex items-center justify-center text-rose-500">
 <ShieldAlert className="w-8 h-8 animate-pulse" />
 </div>
 <h2 className="text-xl font-bold tracking-tight text-white font-header">Application Rejected</h2>
 <p className="text-sm text-zinc-500 font-medium">
 We regret to inform you that your professional counsellor application has been rejected by the system administrator.
 </p>
 </div>

 <div className="bg-rose-955/15 border border-rose-900/20 p-4 rounded-[10px] space-y-1.5">
 <span className="text-xs font-bold text-rose-400 tracking-wider block">Rejection Reason:</span>
 <p className="text-sm text-zinc-300 italic leading-relaxed">
 "{counsellorRejectionReason || user?.rejectionReason || 'Credentials did not meet verification standards.'}"
 </p>
 </div>

 <div className="space-y-4">
 <p className="text-xs text-zinc-500 text-center leading-relaxed">
 If you believe this was in error or would like to submit additional credentials, please contact our support team at <a href="mailto:support@behold.com" className="text-brand hover:underline">support@behold.com</a>.
 </p>

 <button
 onClick={() => logout()}
 className="w-full py-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-rose-450 hover:text-rose-400 font-bold text-sm rounded-[10px] transition cursor-pointer flex items-center justify-center gap-1.5"
 >
 <LogOut className="w-4 h-4" /> Sign Out
 </button>
 </div>
 </div>
 </div>
 );
 }

 // --- 2. DEDICATED LOGGED-IN COUNSELLOR CONSOLE ---
 return (
 <div className="h-screen overflow-hidden bg-zinc-955 text-white text-left flex flex-col lg:flex-row relative">

 {/* Background Soft Glows */}
 <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
 <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

 {/* Mobile Top Navbar (Visible only on lg:hidden) */}
 <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-805 px-5 py-4 w-full shadow-sm">
 <div className="flex items-center gap-3">
 {/* Hamburger Menu Icon */}
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="p-1.5 bg-zinc-955 border border-zinc-850 text-zinc-400 hover:text-white rounded-[10px] transition-colors cursor-pointer border-none"
 title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
 >
 {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
 </button>

 <div className="flex items-center gap-1.5">
 <span className="font-header font-bold text-base tracking-tighter text-white">
 BEHOLD<span className="text-brand font-bold">.</span>
 </span>
 </div>
 </div>

 {/* Profile Icon / Trigger */}
 <button
 type="button"
 onClick={() => setIsProfileDrawerOpen(true)}
 className="w-8 h-8 rounded-[10px] bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-brand/30 flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
 title="Open Profile Menu"
 >
 <User className="w-4 h-4 text-brand" />
 </button>
 </div>

 <SidebarNav
 user={user}
 profile={profile}
 currentSection={currentSection}
 isMobileMenuOpen={isMobileMenuOpen}
 setIsMobileMenuOpen={setIsMobileMenuOpen}
 setIsProfileDrawerOpen={setIsProfileDrawerOpen}
 handleNavClick={handleNavClick}
 setIsLogoutConfirmOpen={setIsLogoutConfirmOpen}
 />

 {/* 2. Main Content Workspace */}
 <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-6 relative z-10 text-left">

 {/* Workspace Banner */}
 <div className="bg-zinc-900 border border-zinc-850 p-5 sm:p-8 rounded-[10px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),_0_1px_3px_rgba(11,20,36,0.04),_0_6px_20px_-6px_rgba(11,20,36,0.08)] flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

 <div className="space-y-1 relative z-10 w-full sm:w-auto text-left">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="text-xl sm:text-2xl font-header font-bold tracking-wide text-white flex items-center gap-2">
 {profile.name}
 {counsellorStatus === 'PENDING' && (
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-955/20 border border-amber-900/30 text-amber-500 tracking-wider">
 Pending
 </span>
 )}
 {(counsellorStatus === 'APPROVED' || counsellorStatus === 'ACTIVE') && (
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-955/20 border border-emerald-900/30 text-emerald-450 tracking-wider">
 Verified
 </span>
 )}
 {counsellorStatus === 'REJECTED' && (
 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-955/20 border border-rose-900/30 text-rose-500 tracking-wider">
 Rejected
 </span>
 )}
 </h1>
 </div>
 <p className="text-sm text-zinc-500 font-medium">
 Role: {profile.role} • Hourly Fee: ₹{profile.price}
 </p>
 </div>

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center">
 <div className="bg-zinc-950 border border-zinc-850 px-5 py-2.5 rounded-[10px]">
 <span className="text-sm text-zinc-500 font-bold block">Upcoming Slots</span>
 <p className="text-sm font-bold text-brand mt-0.5">{bookings.filter(b => (b.status === 'CONFIRMED' || b.status === 'APPROVED' || b.status === 'PENDING') && !isSessionCompleted(b)).length} Bookings</p>
 </div>
 <div className="bg-zinc-950 border border-zinc-850 px-5 py-2.5 rounded-[10px]">
 <span className="text-sm text-zinc-500 font-bold block">Hours Completed</span>
 <p className="text-sm font-bold text-brand mt-0.5">{bookings.filter(isSessionCompleted).length + Number(profile.hours || 0)}+ Hrs</p>
 </div>
 </div>
 </div>

 {/* Verification Status Alert Banner */}
 {counsellorStatus === 'REJECTED' || user?.status === 'REJECTED' ? (
 <div className="bg-rose-955/20 border border-rose-900/60 p-4 rounded-[10px] flex items-center gap-3 text-rose-350 text-sm animate-in slide-in-from-top duration-300">
 <ShieldAlert className="w-5 h-5 text-rose-455 shrink-0" />
 <div className="text-left">
 <span className="font-bold block mb-0.5 text-rose-455">Application Rejected</span>
 Your professional counsellor profile application has been rejected by the administrator.
 {(counsellorRejectionReason || user?.rejectionReason) && (
 <div className="mt-2 text-xs font-semibold text-rose-400">
 <span className="font-bold">Reason:</span> {counsellorRejectionReason || user.rejectionReason}
 </div>
 )}
 </div>
 </div>
 ) : !isCounsellorVerified() ? (
 <div className="bg-amber-955/20 border border-amber-900/60 p-4 rounded-[10px] flex items-center gap-3 text-amber-300 text-sm animate-in slide-in-from-top duration-300">
 <ShieldAlert className="w-5 h-5 text-amber-450 shrink-0" />
 <div className="text-left">
 <span className="font-bold block mb-0.5">Account Pending Verification</span>
 Your consultant profile is registered but pending admin acceptance. It will not be shown on the public Experts directory or Booking engine until verified by an administrator.
 </div>
 </div>
 ) : null}

 {/* WORKSPACE CONTENT ROUTER */}
 <div className="bg-zinc-900 border border-zinc-850 rounded-[10px] p-5 sm:p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),_0_1px_3px_rgba(11,20,36,0.04),_0_6px_20px_-6px_rgba(11,20,36,0.08)]">
 {isLoadingData ? (
 <div className="animate-pulse space-y-6">
 <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
 <div className="h-4 bg-zinc-800 rounded w-48"></div>
 <div className="h-6 bg-zinc-800 rounded w-24"></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="bg-zinc-955 border border-zinc-850 rounded-[10px] p-5 min-h-[160px] space-y-4">
 <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
 <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
 <div className="h-4 bg-zinc-800 rounded w-1/2 mt-6"></div>
 </div>
 <div className="bg-zinc-955 border border-zinc-850 rounded-[10px] p-5 min-h-[160px] space-y-4">
 <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
 <div className="h-4 bg-zinc-800 rounded w-full mt-4"></div>
 <div className="h-4 bg-zinc-800 rounded w-full"></div>
 <div className="h-4 bg-zinc-800 rounded w-full"></div>
 </div>
 </div>
 </div>
 ) : (
 <>
 {currentSection === 'overview' && (
 <OverviewTab
 bookings={bookings}
 profile={profile}
 isSessionCompleted={isSessionCompleted}
 setCurrentSection={setCurrentSection}
 />
 )}

 {currentSection === 'profile' && (
 <ProfileTab
 profile={profile}
 editProfile={editProfile}
 setEditProfile={setEditProfile}
 handleProfileSave={handleProfileSave}
 isAvatarUploading={isAvatarUploading}
 avatarFileRef={avatarFileRef}
 handleCounsellorAvatarUpload={handleCounsellorAvatarUpload}
 user={user}
 isProfileSaved={isProfileSaved}
 />
 )}

 {currentSection === 'availability' && (
 <AvailabilityTab
 activeDays={activeDays}
 toggleDay={toggleDay}
 allSlots={allSlots}
 availableSlots={availableSlots}
 setAvailableSlots={setAvailableSlots}
 handleRemoveSlot={handleRemoveSlot}
 customHour={customHour}
 setCustomHour={setCustomHour}
 customMinute={customMinute}
 setCustomMinute={setCustomMinute}
 customPeriod={customPeriod}
 setCustomPeriod={setCustomPeriod}
 handleAddCustomSlot={handleAddCustomSlot}
 fromHour={fromHour}
 setFromHour={setFromHour}
 fromMinute={fromMinute}
 setFromMinute={setFromMinute}
 fromPeriod={fromPeriod}
 setFromPeriod={setFromPeriod}
 toHour={toHour}
 setToHour={setToHour}
 toMinute={toMinute}
 setToMinute={setToMinute}
 toPeriod={toPeriod}
 setToPeriod={setToPeriod}
 setSlotError={setSlotError}
 addTimeRangeSlots={addTimeRangeSlots}
 handleAvailabilitySave={handleAvailabilitySave}
 isAvailabilitySaved={isAvailabilitySaved}
 />
 )}

 {currentSection === 'bookings' && (
 <BookingsTab
 bookings={bookings}
 setBookings={setBookings}
 activeBookingTab={activeBookingTab}
 setActiveBookingTab={setActiveBookingTab}
 updateBookingStatus={updateBookingStatus}
 editingFeedbackId={editingFeedbackId}
 setEditingFeedbackId={setEditingFeedbackId}
 notesInput={notesInput}
 setNotesInput={setNotesInput}
 feedbackInput={feedbackInput}
 setFeedbackInput={setFeedbackInput}
 nextSessionInput={nextSessionInput}
 setNextSessionInput={setNextSessionInput}
 saveFeedback={saveFeedback}
 downloadDiagnosticPDF={downloadDiagnosticPDF}
 editingBookingId={editingBookingId}
 setEditingBookingId={setEditingBookingId}
 meetLinkInput={meetLinkInput}
 setMeetLinkInput={setMeetLinkInput}
 setMeetLinkError={setMeetLinkError}
 saveMeetLink={saveMeetLink}
 startEditMeetLink={startEditMeetLink}
 />
 )}

 {currentSection === 'revenue' && (
 <RevenueTab
 bookings={bookings}
 profile={profile}
 downloadDiagnosticPDF={downloadDiagnosticPDF}
 />
 )}
 </>
 )}
 </div>
 </div>

 {/* ── COUNSELLOR PROFILE DRAWER ──────────────────────────────── */}
 {isProfileDrawerOpen && (
 <div className="fixed inset-0 z-[60] flex">
 {/* Backdrop */}
 <div
 className="flex-1 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
 onClick={() => setIsProfileDrawerOpen(false)}
 />
 {/* Drawer panel */}
 <div className="w-80 bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
 <div>
 <h3 className="text-sm font-bold text-white font-header font-bold">My Profile</h3>
 <p className="text-sm text-zinc-500 mt-0.5">Clinical Staff Profile</p>
 </div>
 <button
 onClick={() => setIsProfileDrawerOpen(false)}
 className="p-2 rounded-[10px] text-zinc-500 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Avatar + Name */}
 <div className="px-6 py-6 flex flex-col items-center text-center space-y-3 border-b border-zinc-800">
 <div className="w-20 h-20 rounded-[10px] bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-header font-bold text-2xl shadow-xl">
 {(profile?.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
 </div>
 <div>
 <h2 className="text-base font-bold text-white tracking-wide font-header font-bold">{profile.name}</h2>
 <span className="inline-block mt-1 text-sm px-2.5 py-1 rounded-full font-bold bg-indigo-950 border border-indigo-900 text-indigo-400 ">
 Consultant Psychologist
 </span>
 </div>
 </div>

 {/* Profile Details */}
 <div className="px-6 py-5 space-y-4 flex-1">
 <p className="text-sm font-bold text-zinc-500 ">Professional Details</p>
 <div className="bg-zinc-955/60 rounded-[10px] p-4 space-y-3 border border-zinc-800">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
 <Mail className="w-3.5 h-3.5 text-indigo-400" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-bold text-zinc-500 ">Email Address</p>
 <p className="text-sm text-white font-semibold truncate">{user?.email}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
 <Award className="w-3.5 h-3.5 text-indigo-400" />
 </div>
 <div>
 <p className="text-sm font-bold text-zinc-500 ">Education</p>
 <p className="text-sm text-white font-semibold">{profile.education}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
 <Shield className="w-3.5 h-3.5 text-indigo-400" />
 </div>
 <div>
 <p className="text-sm font-bold text-zinc-500 ">Session Fee</p>
 <p className="text-sm text-white font-semibold">₹{profile.price} / Hour</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-[10px] bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
 <Globe className="w-3.5 h-3.5 text-indigo-400" />
 </div>
 <div>
 <p className="text-sm font-bold text-zinc-500 ">Languages</p>
 <p className="text-sm text-white font-semibold">{profile.lang}</p>
 </div>
 </div>
 </div>

 {/* Specialties */}
 {profile.specialties && (
 <div className="space-y-2">
 <p className="text-sm font-bold text-zinc-500">Specialties</p>
 <div className="flex flex-wrap gap-1.5">
 {(Array.isArray(profile.specialties) ? profile.specialties : (typeof profile.specialties === 'string' ? profile.specialties.split(',') : [])).map((s, i) => (
 <span key={i} className="text-sm px-2 py-1 bg-indigo-955 border border-indigo-900 text-indigo-300 rounded-full font-semibold">
 {typeof s === 'string' ? s.trim() : s}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Drawer Footer */}
 <div className="px-6 py-5 border-t border-zinc-800 space-y-2">
 <button
 onClick={() => { handleNavClick('profile'); setIsProfileDrawerOpen(false); }}
 className="w-full py-2.5 border border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-white font-bold text-sm rounded-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-zinc-900"
 >
 <Edit className="w-3.5 h-3.5 text-brand" /> Edit Profile
 </button>
 <button
 onClick={() => { setIsProfileDrawerOpen(false); setIsLogoutConfirmOpen(true); }}
 className="w-full py-2.5 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-955/20 hover:bg-rose-900 hover:text-white font-bold text-sm rounded-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" /> Sign Out
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ── LOGOUT CONFIRMATION ─────────────────────────────────────── */}
 <LogoutConfirmModal
 isOpen={isLogoutConfirmOpen}
 onConfirm={() => {
 setIsLogoutConfirmOpen(false);
 logout();
 window.spaNavigate('/');
 }}
 onCancel={() => setIsLogoutConfirmOpen(false)}
 theme="dark"
 />

 </div>
 );
}
