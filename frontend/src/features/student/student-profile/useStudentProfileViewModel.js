import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

import { useAuth } from '../../../shared/context/AuthContext';
import { useCustomDialog } from '../../../shared/context/CustomDialogContext';
import ApiService from '../../../shared/services/api';
import { formatDateString } from '../../../shared/utils/dateFormatter';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendLocalNotification
} from '../../../shared/services/notificationHelper';

import { INITIAL_STATE } from './studentProfileConstants';
import {
  getGreeting, calculateCompletion, isSessionCompleted, getMeetLinkStatus,
  downloadPDFReceiptForSession
} from './utils';

export function useStudentProfileViewModel() {
  const [profile, setProfile] = useState(INITIAL_STATE);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const formLoadedRef = useRef(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [testProfile, setTestProfile] = useState(null);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSubTab, setSessionSubTab] = useState('upcoming');
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const { showAlert, showConfirm, showPrompt } = useCustomDialog();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // CIGI Aptitude Test uploads state
  const [cigiFile, setCigiFile] = useState(null);
  const [cigiDate, setCigiDate] = useState('');
  const [cigiTime, setCigiTime] = useState('');
  const [cigiNote, setCigiNote] = useState('');
  const [isCigiUploading, setIsCigiUploading] = useState(false);
  const fileInputRef = useRef(null);
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

  const currentSection = useMemo(() => searchParams.get('tab') || 'overview', [searchParams]);

  const enablePsychology = useMemo(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.enablePsychology !== false;
      }
    } catch (e) {}
    return true;
  }, []);

  const enableCareerMentoring = useMemo(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.enableCareerMentoring !== false;
      }
    } catch (e) {}
    return true;
  }, []);

  const enableAptitude = useMemo(() => {
    try {
      const settings = localStorage.getItem('behold_site_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.enableAptitude !== false;
      }
    } catch (e) {
      console.error("Error reading site settings", e);
    }
    return true;
  }, []);

  const completion = useMemo(() => calculateCompletion(formData), [formData]);
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = profile.name || user?.name || 'Student';

  const downloadCertificatePDF = async (session) => {
    const toastId = toast.loading('Generating completion certificate...');
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const studentName = profile.name || user?.name || 'Student';
      const advisorName = session.advisorName || 'Consultant Psychologist';
      const serviceTitle = session.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
      const dateStr = formatDateString(session.date);

      // Border Design
      doc.setDrawColor(13, 148, 136); // Teal
      doc.setLineWidth(1.5);
      doc.rect(5, 5, 287, 200, 'S');

      doc.setDrawColor(217, 119, 6); // Gold Inner Border
      doc.setLineWidth(0.5);
      doc.rect(8, 8, 281, 194, 'S');

      // Top Corner Decorations
      doc.setFillColor(13, 148, 136);
      doc.triangle(8, 8, 25, 8, 8, 25, 'F');
      doc.triangle(289, 8, 272, 8, 289, 25, 'F');
      doc.triangle(8, 202, 25, 202, 8, 185, 'F');
      doc.triangle(289, 202, 272, 202, 289, 185, 'F');

      // Brand Header Logo
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('BEHOLD.', 148, 30, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('Premium Career Guidance & Mental Health Platform', 148, 36, { align: 'center' });

      // Certificate Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(13, 148, 136); // Teal
      doc.text('CERTIFICATE OF COMPLETION', 148, 60, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('This is proudly presented to', 148, 75, { align: 'center' });

      // Student Name
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 42);
      doc.text(studentName.toUpperCase(), 148, 92, { align: 'center' });

      // Underline under Student Name
      doc.setDrawColor(217, 119, 6); // Gold
      doc.setLineWidth(1.2);
      doc.line(78, 97, 218, 97);

      // Certificate Body Text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text('for successfully completing a professional career guidance & mental health session.', 148, 112, { align: 'center' });

      // Detail fields
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'bold');
      doc.text('SESSION DETAILS', 148, 126, { align: 'center' });

      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.line(90, 130, 206, 130);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Service Type: ${serviceTitle}`, 148, 137, { align: 'center' });
      doc.text(`Consultant Advisor: ${advisorName}`, 148, 143, { align: 'center' });
      doc.text(`Date of Completion: ${dateStr}`, 148, 149, { align: 'center' });

      // Signatures
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.4);
      doc.line(40, 178, 100, 178);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(advisorName, 70, 183, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Consultant Specialist', 70, 187, { align: 'center' });

      // Right Signature (Managing Director)
      doc.line(197, 178, 257, 178);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Director, BEHOLD.', 227, 183, { align: 'center' });
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Authority', 227, 187, { align: 'center' });

      // Certificate ID Footer
      const displayId = (session.appointmentId || session.id || 'N/A').toString().substring(0, 8);
      doc.setFontSize(7.5);
      doc.text(`Certificate Verification ID: BH-CERT-${displayId}`, 148, 194, { align: 'center' });

      doc.save(`Behold_Certificate_${studentName.replace(/\s+/g, '_')}_${displayId}.pdf`);
      toast.success('Certificate downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Certificate PDF.', { id: toastId });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes, testRes] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getSessions(),
          ApiService.getMyTestResults()
        ]);

        if (profileRes.success && profileRes.data) {
          const data = { ...INITIAL_STATE, ...profileRes.data };
          Object.keys(INITIAL_STATE).forEach(key => {
            if (data[key] === null) data[key] = '';
          });
          setProfile(data);
          if (!formLoadedRef.current) {
            formLoadedRef.current = true;
            setFormData(data);
          }
        }

        if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
          const list = sessionsRes.data;
          setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
          setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
        }

        if (testRes && testRes.success && Array.isArray(testRes.data) && testRes.data.length > 0) {
          const sorted = [...testRes.data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setTestProfile(sorted[0]);
        } else {
          try {
            const stored = localStorage.getItem('behold_test_profile');
            if (stored) setTestProfile(JSON.parse(stored));
          } catch (_) { }
        }
      } catch (err) {
        console.error('Failed to load student dashboard info:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const hasToken = !!localStorage.getItem('behold_token');
    const isStudent = user && user.role?.toUpperCase() === 'USER';

    if (isStudent && hasToken && !authLoading) {
      setTimeout(() => setIsLoading(true), 0);
      fetchData();
    } else if (!authLoading) {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [user, authLoading]);

  const handleSectionChange = (sectionId) => {
    setSearchParams({ tab: sectionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDiscard = () => {
    setFormData({ ...profile });
    setErrors({});
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = 'Required';
    else if (formData.name.trim().length < 3) err.name = 'Min 3 characters';
    if (!formData.email.trim()) err.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = 'Invalid email';
    if (!formData.phone.trim()) err.phone = 'Required';
    else if (!/^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/.test(formData.phone.trim())) err.phone = 'Invalid phone';
    if (!formData.guardianName.trim()) err.guardianName = 'Required';
    if (formData.guardianPhone.trim()) {
      if (!/^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/.test(formData.guardianPhone.trim())) {
        err.guardianPhone = 'Invalid phone';
      }
    }
    return err;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    setIsSaving(true);
    try {
      const res = await ApiService.updateProfile(formData);
      setProfile({ ...formData });

      if (res.success && res.data && user) {
        updateUser({
          ...user,
          name: formData.name,
          phone: formData.phone
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      const errMsg = error.message || 'Failed to update profile';
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    const reason = await showPrompt('Please provide a reason for cancelling this session:', '', 'Cancel Session', 'Enter reason here...');
    if (reason === null) return;

    try {
      const session = bookedSessions.find(b => b.id === sessionId);
      if (session) {
        if (isSessionCompleted(session)) {
          await showAlert('Cannot cancel a session that is already in the past or completed.', 'Error');
          return;
        }

        try {
          const [year, month, day] = session.date.split('-').map(Number);
          const timeParts = session.time.split(' ');
          let [hours, minutes] = timeParts[0].split(':').map(Number);
          const meridiem = timeParts[1];
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          
          const sessionTime = new Date(year, month - 1, day, hours, minutes);
          const now = new Date();
          const diffMs = sessionTime - now;
          const diffHours = diffMs / (1000 * 60 * 60);
          
          if (diffHours < 1) {
            await showAlert('Cannot cancel a session less than 1 hour before the scheduled time.', 'Error');
            return;
          }
        } catch (e) {
          console.error("Error parsing session datetime for cancel check", e);
        }
      }

      await ApiService.cancelAppointment(sessionId, reason);

      const sessionsRes = await ApiService.getSessions();
      if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
        const list = sessionsRes.data;
        setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
        setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
      }
    } catch (error) {
      await showAlert(error.message || 'Failed to cancel session', 'Error');
    }
  };

  const filteredBooked = useMemo(() => {
    if (sessionFilter === 'all') return bookedSessions;
    if (sessionFilter === 'online') return bookedSessions.filter(s => s.mode === 'ONLINE');
    if (sessionFilter === 'offline') return bookedSessions.filter(s => s.mode !== 'ONLINE');
    if (sessionFilter === 'pending') return bookedSessions.filter(s => s.status === 'PENDING');
    return bookedSessions;
  }, [bookedSessions, sessionFilter]);

  const filterChips = useMemo(() => [
    { id: 'all', label: 'All', count: bookedSessions.length },
    { id: 'online', label: 'Online', count: bookedSessions.filter(s => s.mode === 'ONLINE').length },
    { id: 'offline', label: 'In-Person', count: bookedSessions.filter(s => s.mode !== 'ONLINE').length },
    { id: 'pending', label: 'Pending', count: bookedSessions.filter(s => s.status === 'PENDING').length },
  ], [bookedSessions]);

  const [, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const nextSession = bookedSessions[0];
  const actualCompletedCount = completedSessions.filter(s => !['EXPIRED', 'CANCELLED', 'REJECTED'].includes(s.status)).length;
  const stats = {
    total: bookedSessions.length + completedSessions.length,
    completed: actualCompletedCount,
    upcoming: bookedSessions.length,
    hours: actualCompletedCount,
  };

  const handleCigiUpload = async (e) => {
    e.preventDefault();
    if (!cigiFile) {
      toast.error('Please select a result file (Image or PDF)');
      return;
    }
    
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExt = cigiFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Only JPG, JPEG, PNG, and PDF files are allowed.');
      return;
    }

    setIsCigiUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', cigiFile);
      formDataToSend.append('testDate', cigiDate);
      formDataToSend.append('testTime', cigiTime);
      formDataToSend.append('note', cigiNote);

      const res = await ApiService.uploadCigiResult(formDataToSend);
      if (res.success) {
        toast.success('CIGI result uploaded successfully');
        setProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
        setCigiFile(null);
        setCigiDate('');
        setCigiTime('');
        setCigiNote('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload CIGI result');
    } finally {
      setIsCigiUploading(false);
    }
  };

  const handleCigiDelete = async (resultId) => {
    if (!(await showConfirm('Are you sure you want to delete this CIGI result?', 'Delete CIGI Result'))) return;
    try {
      const res = await ApiService.deleteCigiResult(resultId);
      if (res.success) {
        toast.success('CIGI result deleted successfully');
        setProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete CIGI result');
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profilePic', file);

      const res = await ApiService.updateProfilePic(formDataToSend);
      if (res.success) {
        toast.success('Profile picture updated!', { id: toastId });
        setProfile(prev => ({ 
          ...prev, 
          profilePic: res.data.profilePic, 
          profilePicPublicId: res.data.profilePicPublicId 
        }));
        
        if (user) {
          updateUser({
            ...user,
            profilePic: res.data.profilePic
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile picture', { id: toastId });
    }
  };

  return {
    profile,
    formData,
    isSaved,
    isSaving,
    errors,
    isLoading,
    bookedSessions,
    completedSessions,
    testProfile,
    sessionFilter,
    sessionSubTab,
    cigiFile,
    cigiDate,
    cigiTime,
    cigiNote,
    isCigiUploading,
    permissionState,
    fileInputRef,
    user,
    authLoading,
    showAlert,
    showConfirm,
    showPrompt,
    navigate,
    currentSection,
    enablePsychology,
    enableCareerMentoring,
    enableAptitude,
    completion,
    greeting,
    displayName,
    downloadCertificatePDF,
    handleEnableNotifications,
    handleTestNotification,
    handleSectionChange,
    handleChange,
    handleDiscard,
    handleSave,
    handleCancelSession,
    filteredBooked,
    filterChips,
    setSessionFilter,
    setSessionSubTab,
    handleCigiUpload,
    handleCigiDelete,
    handleProfilePicUpload,
    setCigiFile,
    setCigiDate,
    setCigiTime,
    setCigiNote
  };
}
