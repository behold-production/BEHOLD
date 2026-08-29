import { useState, useMemo, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ApiService from '../../../services/api';
import { INITIAL_STATE } from '../utils/studentProfileConstants';
import { getGreeting, calculateCompletion } from '../utils/utils';
import { useAuth } from '../../../context/AuthContext';
import { validateEmail, validateIndianPhone, parseIndianPhone } from '../../../utils/validation';

/**
 * Hook to manage student profile data, form state, and updates.
 *
 * @returns {Object} Profile state and handlers.
 */
export function useStudentProfile() {
  const [profile, setProfile] = useState(INITIAL_STATE);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const formLoadedRef = useRef(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { user, updateUser, isLoading: authLoading } = useAuth();

  const completion = useMemo(() => calculateCompletion(formData), [formData]);
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = profile.name || user?.name || 'Student';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await ApiService.getProfile();
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
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const hasToken = !!localStorage.getItem('behold_token');
    const isStudent = user && user.role?.toUpperCase() === 'USER';

    if (isStudent && hasToken && !authLoading) {
      fetchProfile();
    } else if (!authLoading) {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [user, authLoading]);

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
    if (!formData.name?.trim()) err.name = 'Full Name is required';
    else if (formData.name.trim().length < 3) err.name = 'Name must be at least 3 characters';
    if (!formData.email?.trim()) err.email = 'Email is required';
    else if (!validateEmail(formData.email)) err.email = 'Invalid email address';
    if (formData.phone?.trim() && !validateIndianPhone(formData.phone)) {
      err.phone = 'Please enter a valid 10-digit Indian phone number';
    }
    if (formData.guardianPhone?.trim() && !validateIndianPhone(formData.guardianPhone)) {
      err.guardianPhone = 'Please enter a valid 10-digit Indian guardian phone number';
    }
    return err;
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      const firstError = Object.values(err)[0];
      toast.error(`Please check your details: ${firstError}`);
      return;
    }
    setIsSaving(true);
    try {
      const res = await ApiService.updateProfile(formData);
      setProfile({ ...formData });

      if (res.success && res.data && user) {
        updateUser({
          ...user,
          ...res.data,
          isProfileCompleted: true
        });
      }

      setIsSaved(true);
      toast.success('Profile saved successfully!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
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
    setProfile,
    formData,
    isSaved,
    isSaving,
    errors,
    isLoading,
    completion,
    greeting,
    displayName,
    handleChange,
    handleDiscard,
    handleSave,
    handleProfilePicUpload
  };
}
