import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MessageCircle, X, Download, ShieldAlert } from 'lucide-react';
import { Toaster, useToasterStore, toast } from 'react-hot-toast';
import Navbar from './shared/components/Navbar';
import Hero from './features/landing/Hero';
import CdatSection from './features/student/CdatSection';
import Services from './features/booking/Services';
import About from './features/landing/About';
import Faq from './features/landing/Faq';
import Inquiry from './features/landing/Inquiry';
import Footer from './shared/components/Footer';
import AuthModals from './features/auth/AuthModals';
const ServiceBooking = lazy(() => import('./features/booking/ServiceBooking'));
const AdvisorProfile = lazy(() => import('./features/counsellor/AdvisorProfile'));
const StudentProfile = lazy(() => import('./features/student/StudentProfile'));
const PsychologistDashboard = lazy(() => import('./features/counsellor/PsychologistDashboard'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const AptitudeTest = lazy(() => import('./features/student/AptitudeTest'));
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'));

import { useAuth } from './shared/context/AuthContext';
import ApiService from './shared/services/api';
import { requestNotificationPermission, syncAndNotifyLocal } from './shared/services/notificationHelper';

function ToastLimitManager() {
 const { toasts } = useToasterStore();
 useEffect(() => {
 const visibleToasts = toasts.filter((t) => t.visible);
 if (visibleToasts.length > 1) {
 visibleToasts.slice(0, -1).forEach((t) => toast.dismiss(t.id));
 }
 }, [toasts]);
 return null;
}

function AdvisorProfileWrapper({ handleBookTherapist, setPendingScrollSection }) {
 const { id } = useParams();
 const navigate = useNavigate();
 return (
 <AdvisorProfile
 advisorId={id}
 onBack={() => {
 navigate('/');
 setPendingScrollSection('services');
 }}
 onBook={handleBookTherapist}
 />
 );
}

export default function App() {
 const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
 const [testProfile, setTestProfile] = useState(null);
 const [bookingAdvisor, setBookingAdvisor] = useState(null);
 const [pendingScrollSection, setPendingScrollSection] = useState(null);

 // Expanded site settings sync state
 const [siteSettings, setSiteSettings] = useState(() => {
 const defaultSettings = {
 siteName: 'BEHOLD',
 siteCopyright: '© BEHOLD Ltd., 2026. All rights reserved.',
 showBanner: false,
 bannerNotice: '',
 termsOfUse: '',
 privacyPolicy: '',
 whatsapp: 'https://wa.me/919497174011',
 contactEmail: 'support@behold.com',
 enablePsychology: true,
 enableCareerMentoring: true,
 enableAptitude: true,
 gstEnabled: false,
 gstPercent: 0
 };
 try {
 const stored = localStorage.getItem('behold_site_settings');
 if (stored) {
 return { ...defaultSettings, ...JSON.parse(stored) };
 }
 } catch (e) { }
 return defaultSettings;
 });
 const [activeDocType, setActiveDocType] = useState(null); // 'terms' or 'privacy'

 const loadSettings = () => {
 try {
 const stored = localStorage.getItem('behold_site_settings');
 if (stored) {
 const parsed = JSON.parse(stored);
 setSiteSettings(prev => ({
 ...prev,
 ...parsed
 }));
 }
 } catch (e) { }
 };

 useEffect(() => {

 const fetchGlobalSettings = async () => {
 try {
 const res = await ApiService.getSettings();
 if (res.success && res.data) {
 const parsed = res.data;
 setSiteSettings(prev => ({
 ...prev,
 ...parsed
 }));
 localStorage.setItem('behold_site_settings', JSON.stringify(parsed));
 }
 } catch (err) {
 console.error('Failed to fetch global settings', err);
 }
 };
 fetchGlobalSettings();

 const handleStorageChange = (e) => {
 const key = e.key || (e.detail && e.detail.key);
 if (key === 'behold_site_settings' || !key) {
 loadSettings();
 }
 };
 window.addEventListener('storage', handleStorageChange);
 window.addEventListener('storage_update', handleStorageChange);
 return () => {
 window.removeEventListener('storage', handleStorageChange);
 window.removeEventListener('storage_update', handleStorageChange);
 };
 }, []);

 const { user, isLoading } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 // Setup global SPA navigate helper for legacy or external components
 useEffect(() => {
 window.spaNavigate = (path) => {
 if (path) navigate(path);
 };
 }, [navigate]);

 // Native desktop/device local notifications sync hook
 useEffect(() => {
 if (!user || !user.id) return;

 // 1. Request notification permission on login/first active session
 requestNotificationPermission();

 // 2. Initial sync
 syncAndNotifyLocal(user.id, user.role);

 // 3. Poll every 15 seconds to fetch new alerts and notify natively
 const interval = setInterval(() => {
 syncAndNotifyLocal(user.id, user.role);
 }, 15000);

 return () => clearInterval(interval);
 }, [user]);

 // Role-based routing and redirection flow
 useEffect(() => {
 if (isLoading) return; // Wait for auth to resolve

 const path = location.pathname;

 if (user) {
 const userRole = user?.role?.toUpperCase();
 if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'SUB_ADMIN') {
 if (!path.startsWith('/admin')) {
 navigate('/admin', { replace: true });
 }
 } else if (userRole === 'PSYCHOLOGIST' || userRole === 'COUNSELLOR') {
 if (path !== '/counsellor' && path !== '/conceller') {
 navigate('/counsellor', { replace: true });
 }
 } else if (userRole === 'USER') {
 if (path === '/counsellor' || path === '/conceller' || path.startsWith('/admin')) {
 navigate('/profile', { replace: true });
 }
 }
 } else {
 if (path === '/profile' || path.startsWith('/admin') || path.startsWith('/counsellor') || path.startsWith('/conceller')) {
 setTimeout(() => setIsAuthModalOpen(true), 0);
 }
 }
 }, [user, isLoading, location.pathname, navigate]);

 // Handle pending scrolls once landing view is active
 useEffect(() => {
 if (location.pathname === '/' && pendingScrollSection) {
 if (pendingScrollSection === 'top') {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 setTimeout(() => setPendingScrollSection(null), 0);
 return;
 }

 let attempts = 0;
 const tryScroll = () => {
 const element = document.getElementById(pendingScrollSection);
 if (element) {
 const offset = 80;
 const bodyRect = document.body.getBoundingClientRect().top;
 const elementRect = element.getBoundingClientRect().top;
 window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
 setPendingScrollSection(null);
 } else if (attempts < 15) {
 attempts++;
 setTimeout(tryScroll, 50);
 } else {
 setPendingScrollSection(null);
 }
 };
 tryScroll();
 }
 }, [location.pathname, pendingScrollSection]);

 const handleBookTherapist = (advisorId) => {
 setBookingAdvisor(advisorId);
 navigate('/booking');
 };

 const handleFinishTest = async (dominantDomain, scores) => {
 setTestProfile({ dominantDomain, scores });

 try {
 await ApiService.saveTestResult({
 userId: user ? user.id : 'guest',
 studentName: user ? user.name : 'Anonymous Student',
 studentEmail: user ? user.email : 'anonymous@behold.com',
 dominantDomain,
 scores,
 date: (() => {
 const d = new Date();
 return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
 })()
 });
 } catch (err) {
 console.error('Failed to save test results', err);
 }

 navigateToSection('inquiry');
 };

 const navigateToSection = (sectionId) => {
 // Handle navigation to the booking page if requested as a section
 if (sectionId === 'booking' || sectionId === '/booking') {
 navigate('/booking');
 return;
 }

 if (sectionId === 'top') {
 if (location.pathname === '/') {
 window.scrollTo({ top: 0, behavior: 'smooth' });
 } else {
 navigate('/');
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }
 return;
 }

 const element = document.getElementById(sectionId);
 if (location.pathname === '/' && element) {
 const offset = 80;
 const bodyRect = document.body.getBoundingClientRect().top;
 const elementRect = element.getBoundingClientRect().top;
 window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
 } else {
 setPendingScrollSection(sectionId);
 navigate('/');
 }
 };

 // Show blank screen while auth is resolving to avoid flash
 if (isLoading) {
 return (
 <div className="min-h-screen bg-zinc-955 flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 const handleDownloadPDF = async () => {
 try {
 const { jsPDF } = await import('jspdf');
 const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

 const title = activeDocType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
 const content = activeDocType === 'terms' ? siteSettings.termsOfUse : siteSettings.privacyPolicy;

 doc.setFont('Helvetica', 'bold');
 doc.setFontSize(16);
 doc.text(`BEHOLD - ${title}`, 20, 20);

 doc.setFont('Helvetica', 'normal');
 doc.setFontSize(10);

 const splitText = doc.splitTextToSize(content || 'No content available.', 170);
 let y = 30;
 for (let i = 0; i < splitText.length; i++) {
 if (y > 280) {
 doc.addPage();
 y = 20;
 }
 doc.text(splitText[i], 20, y);
 y += 6;
 }

 doc.save(`Behold_${activeDocType}.pdf`);
 } catch (err) {
 console.error('Failed to generate PDF', err);
 }
 };

 const hideNavbarAndFooter =
 location.pathname === '/admin' ||
 location.pathname === '/counsellor' ||
 location.pathname === '/conceller';

 return (
 <div className="font-sans antialiased selection:bg-brand/30 min-h-screen relative text-zinc-900 bg-zinc-50">

 {/* Global Toast Notifications */}
 <Toaster
 position="top-center"
 toastOptions={{
 duration: 4000,
 style: {
 background: '#18181b', // zinc-900
 color: '#fff',
 fontSize: '14px',
 fontWeight: '600',
 borderRadius: '12px',
 border: '1px solid #27272a', // zinc-800
 },
 }}
 />
 <ToastLimitManager />

 {/* Top Banner Notice Alert */}
 {!hideNavbarAndFooter && siteSettings.showBanner && siteSettings.bannerNotice && (
 <div className="w-full bg-zinc-950 text-zinc-300 text-xs sm:text-xs font-bold py-2.5 px-4 text-center border-b border-zinc-900 relative z-50 flex items-center justify-center gap-2 tracking-wide shadow-md animate-in slide-in-from-top duration-300">
 <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
 <span>{siteSettings.bannerNotice}</span>
 </div>
 )}

 <AuthModals isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

 {/* Navbar — hidden on admin/counsellor dashboards */}
 {!hideNavbarAndFooter && (
 <Navbar
 navigateToSection={navigateToSection}
 currentView={location.pathname}
 onOpenAuth={() => setIsAuthModalOpen(true)}
 siteName={siteSettings.siteName}
 siteSettings={siteSettings}
 />
 )}

 <Suspense fallback={
 <div className="min-h-screen bg-zinc-955 flex items-center justify-center">
 <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
 </div>
 }>
 <Routes>
 {/* Landing Page */}
 <Route path="/" element={
 <main className="fade-in-up">
 <Hero setView={() => { }} navigateToSection={navigateToSection} siteSettings={siteSettings} />
 <div className="relative z-10 bg-surface-50 w-full">
 {siteSettings.enableAptitude !== false && <CdatSection setView={() => { }} />}
 {(siteSettings.enablePsychology !== false || siteSettings.enableCareerMentoring !== false) && <Services setView={() => { }} onBookTherapist={handleBookTherapist} siteSettings={siteSettings} />}
 <About setView={() => { }} enablePsychology={siteSettings.enablePsychology !== false} enableCareerMentoring={siteSettings.enableCareerMentoring !== false} siteSettings={siteSettings} />
 <Faq />
 <Inquiry testProfile={testProfile} siteSettings={siteSettings} />
 </div>
 </main>
 } />

 {/* Aptitude Test */}
 {siteSettings.enableAptitude !== false && (
 <Route path="/sample-test" element={
 <AptitudeTest onFinishTest={handleFinishTest} />
 } />
 )}

 {/* Booking — open to guests; auth is enforced inside at "Proceed to Payment" */}
 <Route path="/booking" element={
 <ServiceBooking
 preselectedAdvisorId={bookingAdvisor}
 clearPreselectedAdvisor={() => setBookingAdvisor(null)}
 onOpenAuth={() => setIsAuthModalOpen(true)}
 />
 } />

 {/* Student Profile */}
 <Route path="/profile" element={
 user?.role?.toUpperCase() === 'USER' ? (
 <StudentProfile />
 ) : (
 <Navigate to="/" replace />
 )
 } />

 {/* Admin Dashboard */}
 <Route path="/admin" element={
 <div className="admin-console-theme">
 {user ? <AdminDashboard setView={() => { }} /> : <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
 <div className="animate-pulse flex flex-col items-center">
 <ShieldAlert className="w-12 h-12 text-zinc-700 mb-4" />
 <p className="text-zinc-500 font-medium tracking-widest text-sm">Authentication Required</p>
 </div>
 </div>}
 </div>
 } />

 {/* Counsellor Dashboard */}
 <Route path="/counsellor" element={
 <div className="counsellor-console-theme">
 {user ? <PsychologistDashboard setView={() => { }} /> : <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white">
 <div className="animate-pulse flex flex-col items-center">
 <ShieldAlert className="w-12 h-12 text-stone-700 mb-4" />
 <p className="text-stone-500 font-medium tracking-widest text-sm">Authentication Required</p>
 </div>
 </div>}
 </div>
 } />
 <Route path="/conceller" element={<Navigate to="/counsellor" replace />} />
 <Route path="/cousellor" element={<Navigate to="/counsellor" replace />} />

 {/* Advisor Public Profile */}
 <Route path="/advisor/:id" element={
 <AdvisorProfileWrapper
 handleBookTherapist={handleBookTherapist}
 setPendingScrollSection={setPendingScrollSection}
 />
 } />

 {/* Reset Password */}
 <Route path="/reset-password" element={<ResetPassword />} />

 {/* Catch-all fallback */}
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </Suspense>



 {/* Footer */}
 {!hideNavbarAndFooter && (
 <Footer
 navigateToSection={navigateToSection}
 siteName={siteSettings.siteName}
 siteCopyright={siteSettings.siteCopyright}
 onOpenDocs={(docType) => setActiveDocType(docType)}
 enablePsychology={siteSettings.enablePsychology !== false}
 enableCareerMentoring={siteSettings.enableCareerMentoring !== false}
 />
 )}

 {/* Terms & Privacy Documents Modal */}
 {activeDocType && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
 <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

 {/* Modal Header */}
 <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/40">
 <h3 className="text-sm font-bold text-white font-header flex items-center gap-2">
 <span>{activeDocType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}</span>
 <span className="text-[7.5px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-bold ">DOC</span>
 </h3>
 <button
 onClick={() => setActiveDocType(null)}
 className="p-1 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer border-none shadow-sm flex items-center justify-center"
 title="Close modal"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Modal Body */}
 <div className="p-6 overflow-y-auto text-left text-zinc-300 text-xs font-semibold leading-relaxed whitespace-pre-wrap font-sans max-h-[60vh] custom-scrollbar">
 {activeDocType === 'terms' ? siteSettings.termsOfUse : siteSettings.privacyPolicy}
 </div>

 {/* Modal Footer */}
 <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-955">
 <button
 onClick={handleDownloadPDF}
 className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white font-bold text-xs rounded-full cursor-pointer transition border border-zinc-700 shadow-md flex items-center gap-2"
 >
 <Download className="w-3.5 h-3.5" />
 Download PDF
 </button>
 <button
 onClick={() => setActiveDocType(null)}
 className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white hover:text-brand font-bold text-xs rounded-lg cursor-pointer transition border-none shadow-md"
 >
 Close Document
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
