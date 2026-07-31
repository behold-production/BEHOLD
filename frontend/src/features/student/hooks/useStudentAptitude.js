import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ApiService from '../../../shared/services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { useCustomDialog } from '../../../shared/context/CustomDialogContext';

/**
 * Hook to manage student CIGI aptitude test profile and uploads.
 *
 * @param {Function} updateProfile - Callback to update the main profile data
 * @returns {Object} Aptitude test state and handlers.
 */
export function useStudentAptitude(updateProfile) {
  const [testProfile, setTestProfile] = useState(null);
  
  const [cigiFile, setCigiFile] = useState(null);
  const [cigiDate, setCigiDate] = useState('');
  const [cigiTime, setCigiTime] = useState('');
  const [cigiNote, setCigiNote] = useState('');
  const [isCigiUploading, setIsCigiUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { user, isLoading: authLoading } = useAuth();
  const { showConfirm } = useCustomDialog();

  useEffect(() => {
    const fetchTestProfile = async () => {
      try {
        const testRes = await ApiService.getMyTestResults();
        if (testRes && testRes.success && Array.isArray(testRes.data) && testRes.data.length > 0) {
          const sorted = [...testRes.data].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setTestProfile(sorted[0]);
        } else {
          try {
            const stored = localStorage.getItem('behold_test_profile');
            if (stored) setTestProfile(JSON.parse(stored));
          } catch (e) { }
        }
      } catch (err) {
        console.error('Failed to load student test profile:', err);
      }
    };

    const hasToken = !!localStorage.getItem('behold_token');
    const isStudent = user && user.role?.toUpperCase() === 'USER';

    if (isStudent && hasToken && !authLoading) {
      fetchTestProfile();
    }
  }, [user, authLoading]);

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
        if (updateProfile) {
          updateProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
        }
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
        if (updateProfile) {
          updateProfile(prev => ({ ...prev, cigiResults: res.data.cigiResults }));
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete CIGI result');
    }
  };

  return {
    testProfile,
    cigiFile,
    cigiDate,
    cigiTime,
    cigiNote,
    isCigiUploading,
    fileInputRef,
    setCigiFile,
    setCigiDate,
    setCigiTime,
    setCigiNote,
    handleCigiUpload,
    handleCigiDelete
  };
}
