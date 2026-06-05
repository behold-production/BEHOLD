import React, { useState, useEffect } from 'react';
import { 
  User, ShieldAlert, Award, Trash, Check, Plus, Lock, 
  Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck,
  Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus,
  MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, Mail, Shield, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../LogoutConfirmModal';

export default function AdminDashboard({ setView }) {
  const { user, login, register, logout } = useAuth();
  
  // Tab Section: default to overview or users if sub-admin
  const [currentSection, setCurrentSection] = useState('overview');
  
  // List states
  const [usersDb, setUsersDb] = useState([]);
  const [bookingsDb, setBookingsDb] = useState([]);
  const [inquiriesDb, setInquiriesDb] = useState([]);
  const [testResultsDb, setTestResultsDb] = useState([]);
  const [faqsDb, setFaqsDb] = useState([]);
  const [rolesDb, setRolesDb] = useState([]);

  // Custom role title manager states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState({
    MANAGE_USERS: false,
    MANAGE_PSYCHOLOGISTS: false,
    MANAGE_BOOKINGS: false
  });
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  // Search terms
  const [searchUser, setSearchUser] = useState('');
  const [searchPsy, setSearchPsy] = useState('');
  const [searchInquiry, setSearchInquiry] = useState('');
  const [searchTestResult, setSearchTestResult] = useState('');

  // FAQ Modal/Form states
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [isEditFaqOpen, setIsEditFaqOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ index: -1, question: '', answer: '' });
  const [faqFormError, setFaqFormError] = useState('');
  const [faqFormSuccess, setFaqFormSuccess] = useState('');

  // Login Gate form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sub-admin creation state
  const [subAdminForm, setSubAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    roleName: ''
  });
  const [selectedPermissions, setSelectedPermissions] = useState({
    MANAGE_USERS: false,
    MANAGE_PSYCHOLOGISTS: false,
    MANAGE_BOOKINGS: false
  });
  const [subAdminError, setSubAdminError] = useState('');
  const [subAdminSuccess, setSubAdminSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Modals / Add / Edit states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', password: '' });
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');

  const [isAddPsyOpen, setIsAddPsyOpen] = useState(false);
  const [isEditPsyOpen, setIsEditPsyOpen] = useState(false);
  const [psyForm, setPsyForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    education: '',
    specialties: '',
    price: '',
    lang: '',
    bio: '',
    defaultMeetLink: ''
  });
  const [psyFormError, setPsyFormError] = useState('');
  const [psyFormSuccess, setPsyFormSuccess] = useState('');

  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    id: '',
    userId: '',
    advisorId: '',
    service: 'counselling',
    mode: 'ONLINE',
    date: new Date().toISOString().split('T')[0],
    time: '',
    meetLink: '',
    status: 'CONFIRMED'
  });
  const [bookingFormError, setBookingFormError] = useState('');
  const [bookingFormSuccess, setBookingFormSuccess] = useState('');

  const [searchBooking, setSearchBooking] = useState('');

  // View modals states
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingPsychologist, setViewingPsychologist] = useState(null);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState({
    MANAGE_USERS: false,
    MANAGE_PSYCHOLOGISTS: false,
    MANAGE_BOOKINGS: false
  });
  const [editSubAdminError, setEditSubAdminError] = useState('');
  const [editSubAdminSuccess, setEditSubAdminSuccess] = useState('');

  // Bookings enhancements
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);

  // Site Settings state
  const [settingsForm, setSettingsForm] = useState({
    heroTitle: '',
    heroSub: '',
    whatsapp: '',
    contactEmail: ''
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Inquiry notes temporary state
  const [inquiryNotesText, setInquiryNotesText] = useState({});

  // Profile drawer + logout confirmation
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Load database lists
  const reloadData = () => {
    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    setUsersDb(users);

    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    setBookingsDb(bookings);

    const inquiries = JSON.parse(localStorage.getItem('behold_inquiries_db') || '[]');
    setInquiriesDb(inquiries);

    const testResults = JSON.parse(localStorage.getItem('behold_test_results_db') || '[]');
    setTestResultsDb(testResults);

    const faqs = JSON.parse(localStorage.getItem('behold_faqs') || '[]');
    setFaqsDb(faqs);

    // Load roles
    let roles = [];
    const storedRoles = localStorage.getItem('behold_roles_db');
    if (storedRoles) {
      try {
        roles = JSON.parse(storedRoles);
        // Clean up legacy hardcoded system roles from local storage automatically
        const systemIds = ['role_hr', 'role_state', 'role_scheduler', 'role_finance'];
        const filteredRoles = roles.filter(r => !systemIds.includes(r.id));
        if (filteredRoles.length !== roles.length) {
          roles = filteredRoles;
          localStorage.setItem('behold_roles_db', JSON.stringify(roles));
        }
      } catch (e) {}
    } else {
      localStorage.setItem('behold_roles_db', JSON.stringify([]));
    }
    setRolesDb(roles);

    // Dynamic role sync in the registration form
    if (roles.length > 0) {
      setSubAdminForm(prev => {
        const currentRoleExists = roles.some(r => r.name === prev.roleName);
        if (!prev.roleName || !currentRoleExists) {
          const defaultRole = roles[0];
          const nextPerms = {
            MANAGE_USERS: defaultRole.permissions.includes('MANAGE_USERS'),
            MANAGE_PSYCHOLOGISTS: defaultRole.permissions.includes('MANAGE_PSYCHOLOGISTS'),
            MANAGE_BOOKINGS: defaultRole.permissions.includes('MANAGE_BOOKINGS')
          };
          setTimeout(() => setSelectedPermissions(nextPerms), 0);
          return { ...prev, roleName: defaultRole.name };
        }
        return prev;
      });
    } else {
      setSubAdminForm(prev => ({ ...prev, roleName: '' }));
      setTimeout(() => setSelectedPermissions({
        MANAGE_USERS: false,
        MANAGE_PSYCHOLOGISTS: false,
        MANAGE_BOOKINGS: false
      }), 0);
    }

    const settings = JSON.parse(localStorage.getItem('behold_site_settings') || '{}');
    setSettingsForm({
      heroTitle: settings.heroTitle || 'Bridging You \nTo Your {True Growth.}',
      heroSub: settings.heroSub || 'Professional psychological counseling, aptitude assessment, and career mentorship designed to help individuals thrive with confidence and purpose.',
      whatsapp: settings.whatsapp || 'https://wa.me/919497174011',
      contactEmail: settings.contactEmail || 'support@behold.com'
    });
  };

  const getAdvisorSlotsForBookingForm = () => {
    let slots = [];
    if (bookingForm.advisorId) {
      const saved = localStorage.getItem(`behold_advisor_availability_${bookingForm.advisorId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.availableSlots && parsed.availableSlots.length > 0) {
            slots = [...parsed.availableSlots];
          }
        } catch (e) {}
      }
    }
    // Make sure current booking's time is always available in options to prevent empty selection
    if (bookingForm.time && !slots.includes(bookingForm.time)) {
      slots.push(bookingForm.time);
    }
    return slots;
  };

  useEffect(() => {
    reloadData();

    const handleSync = () => {
      reloadData();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('storage_update', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('storage_update', handleSync);
    };
  }, [user]);

  // Determine sub-admin permissions
  const isSuperAdmin = user?.role === 'ADMIN' && !user?.permissions;
  const hasUserPermission = isSuperAdmin || (user?.permissions && user.permissions.includes('MANAGE_USERS'));
  const hasPsyPermission = isSuperAdmin || (user?.permissions && user.permissions.includes('MANAGE_PSYCHOLOGISTS'));
  const hasBookingPermission = isSuperAdmin || (user?.permissions && user.permissions.includes('MANAGE_BOOKINGS'));

  // Automatically switch tab if sub-admin doesn't have permission for Overview
  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      if (!isSuperAdmin) {
        if (hasUserPermission) {
          setCurrentSection('users');
        } else if (hasPsyPermission) {
          setCurrentSection('psychologists');
        } else if (hasBookingPermission) {
          setCurrentSection('bookings');
        } else {
          setCurrentSection('users');
        }
      } else {
        setCurrentSection('overview');
      }
    }
  }, [user]);

  const handleNavClick = (section) => {
    setCurrentSection(section);
    setIsMobileMenuOpen(false);
  };

  // Admin login handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      if (loggedInUser.role !== 'ADMIN') {
        logout();
        setLoginError('Access Denied: Account does not have Administrator privileges.');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Student Actions
  const handleCreateUser = (e) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password) {
      setUserFormError("All fields are required.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    if (users.some(u => u.email === userForm.email)) {
      setUserFormError("Email is already registered.");
      return;
    }

    const newUser = {
      id: 'u_student_' + Date.now(),
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      password: userForm.password,
      role: 'USER'
    };

    users.push(newUser);
    localStorage.setItem('behold_users_db', JSON.stringify(users));
    setUserFormSuccess("Student created successfully!");
    setUserForm({ id: '', name: '', email: '', password: '' });
    reloadData();
    setTimeout(() => {
      setIsAddUserOpen(false);
      setUserFormSuccess('');
    }, 1500);
  };

  const handleOpenEditUser = (student) => {
    setUserForm({
      id: student.id,
      name: student.name,
      email: student.email,
      password: student.password || ''
    });
    setUserFormError('');
    setUserFormSuccess('');
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUserFormError('');
    setUserFormSuccess('');

    if (!userForm.name.trim() || !userForm.email.trim()) {
      setUserFormError("Name and Email are required.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const index = users.findIndex(u => u.id === userForm.id);
    if (index === -1) {
      setUserFormError("User not found.");
      return;
    }

    if (users.some((u, i) => u.email === userForm.email && i !== index)) {
      setUserFormError("Email is already registered by another user.");
      return;
    }

    users[index] = {
      ...users[index],
      name: userForm.name.trim(),
      email: userForm.email.trim()
    };
    if (userForm.password) {
      users[index].password = userForm.password;
    }

    localStorage.setItem('behold_users_db', JSON.stringify(users));
    setUserFormSuccess("Student details updated!");
    reloadData();
    setTimeout(() => {
      setIsEditUserOpen(false);
      setUserFormSuccess('');
    }, 1500);
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem('behold_users_db', JSON.stringify(updated));
    reloadData();
  };

  // Psychologist Actions
  const handleCreatePsy = (e) => {
    e.preventDefault();
    setPsyFormError('');
    setPsyFormSuccess('');

    if (!psyForm.name.trim() || !psyForm.email.trim() || !psyForm.password) {
      setPsyFormError("Name, Email, and Password are required.");
      return;
    }

    if (psyForm.defaultMeetLink && !psyForm.defaultMeetLink.trim().startsWith('https://')) {
      setPsyFormError("Please enter a valid Google Meet link beginning with https://");
      return;
    }

    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    if (users.some(u => u.email === psyForm.email)) {
      setPsyFormError("Email is already registered.");
      return;
    }

    const psyId = 'u_psy_' + Date.now();
    const newUser = {
      id: psyId,
      name: psyForm.name.trim(),
      email: psyForm.email.trim(),
      password: psyForm.password,
      role: 'PSYCHOLOGIST'
    };

    users.push(newUser);
    localStorage.setItem('behold_users_db', JSON.stringify(users));

    // Save profile details
    const newProfile = {
      name: psyForm.name.trim(),
      role: 'Consultant Psychologist',
      education: psyForm.education || 'MPhil Clinical Psychology',
      specialties: psyForm.specialties || 'Anxiety, Depression',
      price: Number(psyForm.price) || 1200,
      lang: psyForm.lang || 'English',
      bio: psyForm.bio || '',
      defaultMeetLink: psyForm.defaultMeetLink || '',
      modes: ['ONLINE', 'OFFLINE', 'DOOR_STEP']
    };
    localStorage.setItem(`behold_advisor_profile_${psyId}`, JSON.stringify(newProfile));

    setPsyFormSuccess("Psychologist added successfully!");
    setPsyForm({
      id: '',
      name: '',
      email: '',
      password: '',
      education: '',
      specialties: '',
      price: '',
      lang: '',
      bio: '',
      defaultMeetLink: ''
    });
    reloadData();
    setTimeout(() => {
      setIsAddPsyOpen(false);
      setPsyFormSuccess('');
    }, 1500);
  };

  const handleOpenEditPsy = (psy) => {
    const saved = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
    let profileDetails = {
      education: '',
      specialties: '',
      price: '',
      lang: '',
      bio: '',
      defaultMeetLink: ''
    };
    if (saved) {
      try {
        profileDetails = { ...profileDetails, ...JSON.parse(saved) };
      } catch (e) {}
    }

    setPsyForm({
      id: psy.id,
      name: psy.name,
      email: psy.email,
      password: psy.password || '',
      education: profileDetails.education || '',
      specialties: profileDetails.specialties || '',
      price: profileDetails.price || 1200,
      lang: profileDetails.lang || '',
      bio: profileDetails.bio || '',
      defaultMeetLink: profileDetails.defaultMeetLink || ''
    });
    setPsyFormError('');
    setPsyFormSuccess('');
    setIsEditPsyOpen(true);
  };

  const handleUpdatePsy = (e) => {
    e.preventDefault();
    setPsyFormError('');
    setPsyFormSuccess('');

    if (!psyForm.name.trim() || !psyForm.email.trim()) {
      setPsyFormError("Name and Email are required.");
      return;
    }

    if (psyForm.defaultMeetLink && !psyForm.defaultMeetLink.trim().startsWith('https://')) {
      setPsyFormError("Please enter a valid Google Meet link beginning with https://");
      return;
    }

    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const index = users.findIndex(u => u.id === psyForm.id);
    if (index === -1) {
      setPsyFormError("Psychologist not found.");
      return;
    }

    if (users.some((u, i) => u.email === psyForm.email && i !== index)) {
      setPsyFormError("Email is already registered by another account.");
      return;
    }

    users[index] = {
      ...users[index],
      name: psyForm.name.trim(),
      email: psyForm.email.trim()
    };
    if (psyForm.password) {
      users[index].password = psyForm.password;
    }

    localStorage.setItem('behold_users_db', JSON.stringify(users));

    // Save profile details
    let existingProfile = {};
    const saved = localStorage.getItem(`behold_advisor_profile_${psyForm.id}`);
    if (saved) {
      try {
        existingProfile = JSON.parse(saved);
      } catch (e) {}
    }

    const updatedProfile = {
      ...existingProfile,
      name: psyForm.name.trim(),
      role: 'Consultant Psychologist',
      education: psyForm.education,
      specialties: psyForm.specialties,
      price: Number(psyForm.price) || 1200,
      lang: psyForm.lang,
      bio: psyForm.bio,
      defaultMeetLink: psyForm.defaultMeetLink || ''
    };
    localStorage.setItem(`behold_advisor_profile_${psyForm.id}`, JSON.stringify(updatedProfile));

    // Propagate defaultMeetLink to all matching bookings
    try {
      const stored = localStorage.getItem('behold_booked_sessions');
      if (stored) {
        let bookings = JSON.parse(stored);
        let updated = false;
        const newMeetLink = psyForm.defaultMeetLink || '';
        const updatedBookings = bookings.map(b => {
          const matchesId = b.advisorId === psyForm.id;
          const matchesName = b.advisorName && psyForm.name && b.advisorName.toLowerCase().trim() === psyForm.name.toLowerCase().trim();
          if (matchesId || matchesName) {
            if (b.meetLink !== newMeetLink) {
              updated = true;
              return { ...b, meetLink: newMeetLink, advisorId: psyForm.id };
            }
          }
          return b;
        });
        if (updated) {
          localStorage.setItem('behold_booked_sessions', JSON.stringify(updatedBookings));
        }
      }
    } catch (e) {
      console.error("Admin failed to propagate meet link update:", e);
    }

    setPsyFormSuccess("Psychologist details updated!");
    reloadData();
    setTimeout(() => {
      setIsEditPsyOpen(false);
      setPsyFormSuccess('');
    }, 1500);
  };

  const handleDeletePsy = (psyId) => {
    if (!window.confirm("Are you sure you want to remove this psychologist?")) return;
    const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const updated = users.filter(u => u.id !== psyId);
    localStorage.setItem('behold_users_db', JSON.stringify(updated));
    reloadData();
  };

  // Booking Actions
  const handleCreateBooking = (e) => {
    e.preventDefault();
    setBookingFormError('');
    setBookingFormSuccess('');

    if (!bookingForm.userId || !bookingForm.advisorId || !bookingForm.date || !bookingForm.time) {
      setBookingFormError("Student, Psychologist, Date and Time Slot are required.");
      return;
    }

    const students = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const student = students.find(u => u.id === bookingForm.userId);
    const psy = students.find(u => u.id === bookingForm.advisorId);

    if (!student || !psy) {
      setBookingFormError("Student or Psychologist record invalid.");
      return;
    }

    const saved = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
    let psyRole = 'Consultant Psychologist';
    let defaultMeetLink = '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        psyRole = parsed.role || psyRole;
        defaultMeetLink = parsed.defaultMeetLink || '';
      } catch (err) {}
    }

    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    const newBooking = {
      id: 'sb_' + Date.now(),
      userId: bookingForm.userId,
      userName: student.name,
      service: bookingForm.service,
      mode: bookingForm.mode,
      date: bookingForm.date,
      time: bookingForm.time,
      advisorId: bookingForm.advisorId,
      advisorName: psy.name,
      advisorRole: psyRole,
      status: bookingForm.status || 'CONFIRMED',
      meetLink: bookingForm.meetLink.trim() || defaultMeetLink
    };

    bookings.push(newBooking);
    localStorage.setItem('behold_booked_sessions', JSON.stringify(bookings));

    setBookingFormSuccess("Appointment scheduled successfully!");
    setBookingForm({
      id: '',
      userId: '',
      advisorId: '',
      service: 'counselling',
      mode: 'ONLINE',
      date: new Date().toISOString().split('T')[0],
      time: '',
      meetLink: '',
      status: 'CONFIRMED'
    });
    reloadData();
    setTimeout(() => {
      setIsAddBookingOpen(false);
      setBookingFormSuccess('');
    }, 1500);
  };

  const handleOpenEditBooking = (booking) => {
    const students = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const studentUser = students.find(u => u.name === booking.userName && (u.role === 'USER' || !u.role));
    const advisorUser = students.find(u => u.name === booking.advisorName && u.role === 'PSYCHOLOGIST');

    setBookingForm({
      id: booking.id,
      userId: studentUser?.id || booking.userId || '',
      advisorId: booking.advisorId || advisorUser?.id || '',
      service: booking.service || 'counselling',
      mode: booking.mode || 'ONLINE',
      date: booking.date || '',
      time: booking.time || '',
      meetLink: booking.meetLink || '',
      status: booking.status || 'CONFIRMED'
    });

    setBookingFormError('');
    setBookingFormSuccess('');
    setIsEditBookingOpen(true);
  };

  const handleUpdateBooking = (e) => {
    e.preventDefault();
    setBookingFormError('');
    setBookingFormSuccess('');

    if (!bookingForm.date || !bookingForm.time) {
      setBookingFormError("Date and Time Slot are required.");
      return;
    }

    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    const index = bookings.findIndex(b => b.id === bookingForm.id);
    if (index === -1) {
      setBookingFormError("Booking not found.");
      return;
    }

    const students = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
    const student = students.find(u => u.id === bookingForm.userId);
    const psy = students.find(u => u.id === bookingForm.advisorId);

    let psyRole = 'Consultant Psychologist';
    if (psy) {
      const saved = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          psyRole = parsed.role || psyRole;
        } catch (err) {}
      }
    }

    bookings[index] = {
      ...bookings[index],
      userId: bookingForm.userId || bookings[index].userId,
      userName: student ? student.name : bookings[index].userName,
      advisorId: bookingForm.advisorId || bookings[index].advisorId || '',
      advisorName: psy ? psy.name : bookings[index].advisorName,
      advisorRole: psy ? psyRole : bookings[index].advisorRole,
      service: bookingForm.service,
      mode: bookingForm.mode,
      date: bookingForm.date,
      time: bookingForm.time,
      meetLink: bookingForm.meetLink.trim(),
      status: bookingForm.status
    };

    localStorage.setItem('behold_booked_sessions', JSON.stringify(bookings));
    setBookingFormSuccess("Appointment details updated!");
    reloadData();
    setTimeout(() => {
      setIsEditBookingOpen(false);
      setBookingFormSuccess('');
    }, 1500);
  };

  const handleDeleteBooking = (bookingId) => {
    if (!window.confirm("Are you sure you want to remove this booking?")) return;
    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    const updated = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('behold_booked_sessions', JSON.stringify(updated));
    reloadData();
  };

  const handleRoleChangeInForm = (roleName) => {
    setSubAdminForm(prev => ({ ...prev, roleName }));
    const foundRole = rolesDb.find(r => r.name === roleName);
    if (foundRole) {
      const nextPerms = {
        MANAGE_USERS: foundRole.permissions.includes('MANAGE_USERS'),
        MANAGE_PSYCHOLOGISTS: foundRole.permissions.includes('MANAGE_PSYCHOLOGISTS'),
        MANAGE_BOOKINGS: foundRole.permissions.includes('MANAGE_BOOKINGS')
      };
      setSelectedPermissions(nextPerms);
    }
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    setRoleError('');
    setRoleSuccess('');

    const trimmed = newRoleName.trim();
    if (!trimmed) {
      setRoleError("Role Title name is required.");
      return;
    }

    const roles = JSON.parse(localStorage.getItem('behold_roles_db') || '[]');
    if (roles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      setRoleError("A role with this title already exists.");
      return;
    }

    const newRole = {
      id: 'role_' + Date.now(),
      name: trimmed,
      permissions: Object.keys(newRolePermissions).filter(p => newRolePermissions[p])
    };

    const updated = [...roles, newRole];
    localStorage.setItem('behold_roles_db', JSON.stringify(updated));
    setRolesDb(updated);

    // Auto-select if no role is currently selected
    if (!subAdminForm.roleName) {
      setSubAdminForm(prev => ({ ...prev, roleName: trimmed }));
      const nextPerms = {
        MANAGE_USERS: newRole.permissions.includes('MANAGE_USERS'),
        MANAGE_PSYCHOLOGISTS: newRole.permissions.includes('MANAGE_PSYCHOLOGISTS'),
        MANAGE_BOOKINGS: newRole.permissions.includes('MANAGE_BOOKINGS')
      };
      setSelectedPermissions(nextPerms);
    }

    setRoleSuccess(`Role "${trimmed}" created successfully!`);
    setNewRoleName('');
    setNewRolePermissions({
      MANAGE_USERS: false,
      MANAGE_PSYCHOLOGISTS: false,
      MANAGE_BOOKINGS: false
    });
    setTimeout(() => setRoleSuccess(''), 3000);
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
  };

  const executeDeleteRole = (roleId) => {
    const roles = JSON.parse(localStorage.getItem('behold_roles_db') || '[]');
    const updated = roles.filter(r => r.id !== roleId);
    localStorage.setItem('behold_roles_db', JSON.stringify(updated));
    setRolesDb(updated);

    // Reset selection if the deleted role was currently selected
    const deletedRole = roles.find(r => r.id === roleId);
    if (deletedRole) {
      setRoleSuccess(`Role "${deletedRole.name}" deleted successfully!`);
      setTimeout(() => setRoleSuccess(''), 3000);

      if (subAdminForm.roleName === deletedRole.name) {
        if (updated.length > 0) {
          setSubAdminForm(prev => ({ ...prev, roleName: updated[0].name }));
          setSelectedPermissions({
            MANAGE_USERS: updated[0].permissions.includes('MANAGE_USERS'),
            MANAGE_PSYCHOLOGISTS: updated[0].permissions.includes('MANAGE_PSYCHOLOGISTS'),
            MANAGE_BOOKINGS: updated[0].permissions.includes('MANAGE_BOOKINGS')
          });
        } else {
          setSubAdminForm(prev => ({ ...prev, roleName: '' }));
          setSelectedPermissions({
            MANAGE_USERS: false,
            MANAGE_PSYCHOLOGISTS: false,
            MANAGE_BOOKINGS: false
          });
        }
      }
    }
    setRoleToDelete(null);
  };

  // Sub-admin creation handler
  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    setSubAdminError('');
    setSubAdminSuccess('');
    setIsRegistering(true);

    if (!subAdminForm.name.trim() || !subAdminForm.email.trim() || !subAdminForm.password) {
      setSubAdminError("Please fill in all fields.");
      setIsRegistering(false);
      return;
    }

    if (!subAdminForm.roleName) {
      setSubAdminError("Please select a Role Title. If none exist, please create one above.");
      setIsRegistering(false);
      return;
    }

    const permissionsArray = Object.keys(selectedPermissions).filter(p => selectedPermissions[p]);
    if (permissionsArray.length === 0) {
      setSubAdminError("Please select a role title that has at least one permission scope, or configure permissions for this role.");
      setIsRegistering(false);
      return;
    }

    try {
      const registeredUser = await register(
        subAdminForm.name.trim(),
        subAdminForm.email.trim(),
        subAdminForm.password,
        'ADMIN',
        permissionsArray
      );
      
      // Update the user record in localStorage to include customRoleTitle
      const users = JSON.parse(localStorage.getItem('behold_users_db') || '[]');
      const index = users.findIndex(u => u.id === registeredUser.id);
      if (index !== -1) {
        users[index].customRoleTitle = subAdminForm.roleName;
        localStorage.setItem('behold_users_db', JSON.stringify(users));
      }

      setSubAdminSuccess(`Sub-admin account for ${subAdminForm.name} created successfully!`);
      
      const defaultRole = rolesDb.length > 0 ? rolesDb[0] : null;
      setSubAdminForm({
        name: '',
        email: '',
        password: '',
        roleName: defaultRole ? defaultRole.name : ''
      });
      if (defaultRole) {
        handleRoleChangeInForm(defaultRole.name);
      } else {
        setSelectedPermissions({
          MANAGE_USERS: false,
          MANAGE_PSYCHOLOGISTS: false,
          MANAGE_BOOKINGS: false
        });
      }
      reloadData();
    } catch (err) {
      setSubAdminError(err.message || "Failed to create account.");
    } finally {
      setIsRegistering(false);
    }
  };

  const togglePermission = (perm) => {
    setSelectedPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
  };

  const toggleNewRolePermission = (perm) => {
    setNewRolePermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
  };

  const parseStaffDetails = (admin) => {
    let cleanName = admin.name;
    let roleTitle = admin.customRoleTitle || '';

    if (!roleTitle) {
      // Backwards compatibility for parenthesized formats like "Sandra Tomy (HR Coordinator)"
      const matches = admin.name.match(/^(.*?)\s*\((.*?)\)\s*$/);
      if (matches) {
        cleanName = matches[1];
        roleTitle = matches[2];
      } else {
        roleTitle = 'Sub Admin';
      }
    }
    return { cleanName, roleTitle };
  };

  // Filter listings
  const studentsList = usersDb.filter(u => 
    (u.role === 'USER' || !u.role) && 
    (u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
  );

  const psychologistsList = usersDb.filter(u => 
    u.role === 'PSYCHOLOGIST' && 
    (u.name.toLowerCase().includes(searchPsy.toLowerCase()) || u.email.toLowerCase().includes(searchPsy.toLowerCase()))
  );

  const subAdminsList = usersDb.filter(u => 
    u.role === 'ADMIN' && u.permissions // Only custom sub-admins
  );

  // Inquiries Actions
  const handleResolveInquiry = (inqId) => {
    const inquiries = JSON.parse(localStorage.getItem('behold_inquiries_db') || '[]');
    const updated = inquiries.map(inq => {
      if (inq.id === inqId) {
        return { ...inq, status: inq.status === 'RESOLVED' ? 'PENDING' : 'RESOLVED' };
      }
      return inq;
    });
    localStorage.setItem('behold_inquiries_db', JSON.stringify(updated));
    reloadData();
  };

  const handleDeleteInquiry = (inqId) => {
    if (!window.confirm("Are you sure you want to delete this student inquiry?")) return;
    const inquiries = JSON.parse(localStorage.getItem('behold_inquiries_db') || '[]');
    const updated = inquiries.filter(inq => inq.id !== inqId);
    localStorage.setItem('behold_inquiries_db', JSON.stringify(updated));
    reloadData();
  };

  // Student active/suspended status toggle
  const handleToggleStudentStatus = (studentId, currentStatus) => {
    const updated = usersDb.map(u => {
      if (u.id === studentId) {
        return { ...u, status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    });
    localStorage.setItem('behold_users_db', JSON.stringify(updated));
    reloadData();
  };

  // Psychologist verification toggle
  const handleTogglePsyVerification = (psyId, currentVerified) => {
    const updated = usersDb.map(u => {
      if (u.id === psyId) {
        return { ...u, verified: !currentVerified };
      }
      return u;
    });
    localStorage.setItem('behold_users_db', JSON.stringify(updated));
    reloadData();
  };

  // Site Settings save handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    localStorage.setItem('behold_site_settings', JSON.stringify(settingsForm));
    setSettingsSuccess("Site Settings updated successfully!");
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('behold_faqs_updated'));
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  // Sub-Admin edit permissions
  const handleOpenEditSubAdmin = (admin) => {
    setEditingSubAdmin(admin);
    setEditSubAdminError('');
    setEditSubAdminSuccess('');
    setEditPermissions({
      MANAGE_USERS: admin.permissions ? admin.permissions.includes('MANAGE_USERS') : false,
      MANAGE_PSYCHOLOGISTS: admin.permissions ? admin.permissions.includes('MANAGE_PSYCHOLOGISTS') : false,
      MANAGE_BOOKINGS: admin.permissions ? admin.permissions.includes('MANAGE_BOOKINGS') : false
    });
  };

  const handleSaveSubAdminPermissions = (e) => {
    e.preventDefault();
    setEditSubAdminError('');
    setEditSubAdminSuccess('');

    const permsArray = [];
    if (editPermissions.MANAGE_USERS) permsArray.push('MANAGE_USERS');
    if (editPermissions.MANAGE_PSYCHOLOGISTS) permsArray.push('MANAGE_PSYCHOLOGISTS');
    if (editPermissions.MANAGE_BOOKINGS) permsArray.push('MANAGE_BOOKINGS');

    if (permsArray.length === 0) {
      setEditSubAdminError("Please select at least one permission scope.");
      return;
    }

    const updated = usersDb.map(u => {
      if (u.id === editingSubAdmin.id) {
        return { ...u, permissions: permsArray };
      }
      return u;
    });
    localStorage.setItem('behold_users_db', JSON.stringify(updated));
    setEditSubAdminSuccess("Permissions updated successfully!");
    reloadData();
    setTimeout(() => {
      setEditingSubAdmin(null);
      setEditSubAdminSuccess('');
    }, 1500);
  };

  // Inquiry Reply/Notes
  const handleSaveInquiryNote = (inqId, noteText) => {
    const inquiries = JSON.parse(localStorage.getItem('behold_inquiries_db') || '[]');
    const updated = inquiries.map(inq => {
      if (inq.id === inqId) {
        return { ...inq, note: noteText };
      }
      return inq;
    });
    localStorage.setItem('behold_inquiries_db', JSON.stringify(updated));
    reloadData();
    alert("Internal note updated!");
  };

  const handleBulkClearResolvedInquiries = () => {
    if (!window.confirm("Are you sure you want to delete all resolved inquiries?")) return;
    const inquiries = JSON.parse(localStorage.getItem('behold_inquiries_db') || '[]');
    const updated = inquiries.filter(inq => inq.status !== 'RESOLVED');
    localStorage.setItem('behold_inquiries_db', JSON.stringify(updated));
    reloadData();
  };

  // Aptitude results export
  const handleExportAptitudeResults = (res) => {
    const breakdown = Object.entries(res.scores || {})
      .map(([key, val]) => `  - ${key.toUpperCase()}: ${val}%`)
      .join('\n');
    const txt = `BEHOLD APTITUDE TEST REPORT\n=========================\nStudent Name: ${res.studentName}\nEmail: ${res.studentEmail}\nDate Completed: ${res.date}\nDominant Domain: ${res.dominantDomain.toUpperCase()}\n\nCognitive Breakdown:\n${breakdown}\n`;
    navigator.clipboard.writeText(txt);
    alert("Test report copied to clipboard!");
  };

  // Bookings Bulk Actions
  const handleToggleSelectBooking = (bookingId) => {
    setSelectedBookingIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleBulkBookingStatus = (status) => {
    if (selectedBookingIds.length === 0) return;
    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    const updated = bookings.map(b => {
      if (selectedBookingIds.includes(b.id)) {
        return { ...b, status };
      }
      return b;
    });
    localStorage.setItem('behold_booked_sessions', JSON.stringify(updated));
    setSelectedBookingIds([]);
    reloadData();
    alert(`Selected bookings updated to ${status}!`);
  };

  const handleBulkDeleteBookings = () => {
    if (selectedBookingIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedBookingIds.length} selected bookings?`)) return;
    const bookings = JSON.parse(localStorage.getItem('behold_booked_sessions') || '[]');
    const updated = bookings.filter(b => !selectedBookingIds.includes(b.id));
    localStorage.setItem('behold_booked_sessions', JSON.stringify(updated));
    setSelectedBookingIds([]);
    reloadData();
    alert("Selected bookings deleted!");
  };

  // Test Results Actions
  const handleDeleteTestResult = (resId) => {
    if (!window.confirm("Are you sure you want to delete this test result?")) return;
    const results = JSON.parse(localStorage.getItem('behold_test_results_db') || '[]');
    const updated = results.filter(res => res.id !== resId);
    localStorage.setItem('behold_test_results_db', JSON.stringify(updated));
    reloadData();
  };

  // FAQ Desk Actions
  const handleCreateFaq = (e) => {
    e.preventDefault();
    setFaqFormError('');
    setFaqFormSuccess('');

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqFormError("Both question and answer are required.");
      return;
    }

    const currentFaqs = JSON.parse(localStorage.getItem('behold_faqs') || '[]');
    currentFaqs.push({
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim()
    });

    localStorage.setItem('behold_faqs', JSON.stringify(currentFaqs));
    window.dispatchEvent(new Event('behold_faqs_updated'));
    setFaqFormSuccess("FAQ added successfully!");
    setFaqForm({ index: -1, question: '', answer: '' });
    reloadData();
    setTimeout(() => {
      setIsAddFaqOpen(false);
      setFaqFormSuccess('');
    }, 1500);
  };

  const handleOpenEditFaq = (faq, index) => {
    setFaqForm({
      index,
      question: faq.question,
      answer: faq.answer
    });
    setFaqFormError('');
    setFaqFormSuccess('');
    setIsEditFaqOpen(true);
  };

  const handleUpdateFaq = (e) => {
    e.preventDefault();
    setFaqFormError('');
    setFaqFormSuccess('');

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqFormError("Both question and answer are required.");
      return;
    }

    const currentFaqs = JSON.parse(localStorage.getItem('behold_faqs') || '[]');
    if (faqForm.index < 0 || faqForm.index >= currentFaqs.length) {
      setFaqFormError("FAQ record not found.");
      return;
    }

    currentFaqs[faqForm.index] = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim()
    };

    localStorage.setItem('behold_faqs', JSON.stringify(currentFaqs));
    window.dispatchEvent(new Event('behold_faqs_updated'));
    setFaqFormSuccess("FAQ updated successfully!");
    reloadData();
    setTimeout(() => {
      setIsEditFaqOpen(false);
      setFaqFormSuccess('');
    }, 1500);
  };

  const handleDeleteFaq = (index) => {
    if (!window.confirm("Are you sure you want to delete this FAQ question?")) return;
    const currentFaqs = JSON.parse(localStorage.getItem('behold_faqs') || '[]');
    const updated = currentFaqs.filter((_, idx) => idx !== index);
    localStorage.setItem('behold_faqs', JSON.stringify(updated));
    window.dispatchEvent(new Event('behold_faqs_updated'));
    reloadData();
  };

  // Filter inquiries
  const filteredInquiries = inquiriesDb.filter(inq => 
    inq.name.toLowerCase().includes(searchInquiry.toLowerCase()) || 
    inq.email.toLowerCase().includes(searchInquiry.toLowerCase()) ||
    inq.message.toLowerCase().includes(searchInquiry.toLowerCase())
  );

  // Filter test results
  const filteredTestResults = testResultsDb.filter(res => 
    res.studentName.toLowerCase().includes(searchTestResult.toLowerCase()) || 
    res.studentEmail.toLowerCase().includes(searchTestResult.toLowerCase()) ||
    res.dominantDomain.toLowerCase().includes(searchTestResult.toLowerCase())
  );

  // --- LOGIN UI GATE ---
  const isUserAdmin = user && user.role === 'ADMIN';

  if (!isUserAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Soft glows in background */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-header font-black tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">ADMINISTRATOR CONTROL GATE</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6 text-left">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Sign In to Dashboard</h2>
              <p className="text-[10px] text-zinc-500 leading-none">Security clearance required for system administration.</p>
            </div>
            
            {/* Submit Button */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="admin@behold.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Password</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
              >
                {isLoggingIn ? 'Verifying Credentials...' : 'Enter Admin Console'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- DEDICATED LOGGED-IN ADMIN DASHBOARD UI ---
  return (
    <div className="min-h-screen bg-zinc-955 text-white font-sans text-left flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Top Navbar (Visible only on lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-805 px-5 py-4 w-full">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Icon */}
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
            title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="font-header font-black text-md tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </span>
            <span className="text-[7.5px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1 py-0.2 rounded font-black tracking-widest uppercase font-mono">
              CONSOLE
            </span>
          </div>
        </div>

        {/* Profile Icon / Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileDrawerOpen(true)}
          className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-brand/30 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
          title="Open Profile Menu"
        >
          <User className="w-4 h-4 text-brand" />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop (Overlay) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Left Fixed Sidebar (Drawer on Mobile, static on Desktop) */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:flex`}>
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-header font-black text-lg tracking-tighter text-white">
                BEHOLD<span className="text-brand font-black">.</span>
              </span>
              <span className="text-[8px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                CONSOLE
              </span>
            </div>
            {/* Close Button inside Drawer (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User profile details — click to open drawer */}
          {(() => {
            const { cleanName, roleTitle } = parseStaffDetails(user);
            return (
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                className="w-full flex items-center gap-3 bg-zinc-955/60 hover:bg-zinc-950 p-3 rounded-xl border border-zinc-850 hover:border-brand/30 transition-all cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-black text-sm shrink-0">
                  {(cleanName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate leading-tight uppercase">
                    {cleanName}
                  </h4>
                  <span className="text-[8px] text-zinc-500 font-black tracking-wider uppercase">
                    {isSuperAdmin ? 'SUPER ADMIN' : (roleTitle || 'SUB ADMIN')}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              </button>
            );
          })()}

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {isSuperAdmin && (
              <button
                onClick={() => handleNavClick('overview')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'overview'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                }`}
              >
                <BarChart3 className="w-4 h-4 font-bold" />
                <span>Overview</span>
              </button>
            )}

            {hasUserPermission && (
              <button
                onClick={() => handleNavClick('users')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'users'
                    ? 'bg-brand text-zinc-950 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Student Database</span>
              </button>
            )}

            {hasPsyPermission && (
              <button
                onClick={() => handleNavClick('psychologists')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'psychologists'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Psychologists DB</span>
              </button>
            )}

            {hasBookingPermission && (
              <button
                onClick={() => handleNavClick('bookings')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'bookings'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Client Bookings</span>
              </button>
            )}

            {isSuperAdmin && (
              <>
                <button
                  onClick={() => handleNavClick('subadmins')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'subadmins'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Roles & Scopes</span>
                </button>

                <button
                  onClick={() => handleNavClick('inquiries')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'inquiries'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Student Inquiries</span>
                </button>

                <button
                  onClick={() => handleNavClick('testresults')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'testresults'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Aptitude Results</span>
                </button>

                <button
                  onClick={() => handleNavClick('faqs')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'faqs'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQ Manager</span>
                </button>

                <button
                  onClick={() => handleNavClick('analytics')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'analytics'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics Console</span>
                </button>

                <button
                  onClick={() => handleNavClick('settings')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'settings'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-855'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Site Settings</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-zinc-800 mt-6 lg:mt-0">
          <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
            <span className="text-[8px] uppercase font-black tracking-wider text-zinc-500 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-brand" /> System Guard
            </span>
            <p className="text-[9px] text-zinc-500 leading-relaxed pt-1.5">
              Root access matches dynamically with sub-admin permission checklists.
            </p>
          </div>
          <button 
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out Portal
          </button>
        </div>
      </div>

      {/* 2. Main Content Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-6 relative z-10 text-left">
        
        {/* Workspace Banner */}
        <div className="bg-zinc-900 border border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-header font-black tracking-wide uppercase">
                {user.name}
              </h1>
              <span className="text-[8px] bg-brand text-zinc-955 px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">
                {isSuperAdmin ? 'ROOT SECURITY LEVEL' : 'HR DEPT CLEARANCE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Active Console Session: {user.email}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto shrink-0 relative z-10 text-center">
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Students</span>
              <p className="text-sm font-black text-brand mt-0.5">{studentsList.length}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Advisors</span>
              <p className="text-sm font-black text-brand mt-0.5">{psychologistsList.length}</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 rounded-xl min-w-[75px]">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Bookings</span>
              <p className="text-sm font-black text-brand mt-0.5">{bookingsDb.length}</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE CONTENT ROUTER */}
        <div className="bg-zinc-900 border border-zinc-855 rounded-2xl p-5 sm:p-8 shadow-md">
          {/* TAB 1: OVERVIEW PANEL */}
          {currentSection === 'overview' && isSuperAdmin && (() => {
            const studentsCount = usersDb.filter(u => u.role === 'USER' || !u.role).length;
            const psyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST').length;
            const pendingInquiriesCount = inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).length;
            const completedSessionsCount = bookingsDb.filter(b => b.status === 'COMPLETED').length;

            const totalRevenue = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'COMPLETED') return acc;
              const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
              let price = 1250;
              if (advisor) {
                const savedProfile = localStorage.getItem(`behold_advisor_profile_${advisor.id}`);
                if (savedProfile) {
                  try {
                    price = JSON.parse(savedProfile).price || price;
                  } catch (e) {}
                }
              }
              return acc + Number(price);
            }, 0);

            // Storage usage calculation
            let totalChars = 0;
            for (let key in localStorage) {
              if (localStorage.hasOwnProperty(key)) {
                totalChars += key.length + localStorage[key].length;
              }
            }
            const kbUsed = (totalChars / 1024).toFixed(2);

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Super Admin Command Center</h3>
                  <span className="text-[8px] bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">SYSTEM ROOT</span>
                </div>

                {/* KPI stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Students</span>
                    <p className="text-xl font-black text-white">{studentsCount}</p>
                    <span className="text-[7.5px] text-zinc-655 font-bold block uppercase">Registered</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Psychologists</span>
                    <p className="text-xl font-black text-white">{psyCount}</p>
                    <span className="text-[7.5px] text-zinc-655 font-bold block uppercase">{usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.verified !== false).length} Verified</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Total Bookings</span>
                    <p className="text-xl font-black text-white">{bookingsDb.length}</p>
                    <span className="text-[7.5px] text-zinc-655 font-bold block uppercase">Sessions</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Inquiries</span>
                    <p className="text-xl font-black text-amber-500">{pendingInquiriesCount}</p>
                    <span className="text-[7.5px] text-amber-900/60 font-bold block uppercase">Pending</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Completed</span>
                    <p className="text-xl font-black text-brand">{completedSessionsCount}</p>
                    <span className="text-[7.5px] text-zinc-655 font-bold block uppercase">Sessions</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Revenue Est.</span>
                    <p className="text-xl font-black text-emerald-450">₹{totalRevenue}</p>
                    <span className="text-[7.5px] text-zinc-655 font-bold block uppercase">INR Completed</span>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-zinc-955 border border-zinc-855 p-4.5 rounded-xl space-y-3">
                  <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500 block">Quick Action Gateways</span>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setUserForm({ id: '', name: '', email: '', password: '' });
                        setUserFormError('');
                        setUserFormSuccess('');
                        setIsAddUserOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-brand" /> Provision Student
                    </button>
                    <button
                      onClick={() => {
                        setPsyForm({
                          id: '', name: '', email: '', password: '',
                          education: 'MPhil Clinical Psychology',
                          specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                          price: 1250, lang: 'Malayalam, English', bio: ''
                        });
                        setPsyFormError('');
                        setPsyFormSuccess('');
                        setIsAddPsyOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand" /> Register Psychologist
                    </button>
                    <button
                      onClick={() => {
                        const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                        const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                        let firstSlot = '';
                        if (firstPsy) {
                          const saved = localStorage.getItem(`behold_advisor_availability_${firstPsy.id}`);
                          if (saved) {
                            try {
                              const parsed = JSON.parse(saved);
                              if (parsed.availableSlots && parsed.availableSlots.length > 0) {
                                firstSlot = parsed.availableSlots[0];
                              }
                            } catch (err) {}
                          }
                        }
                        setBookingForm({
                          id: '', userId: firstStudent?.id || '', advisorId: firstPsy?.id || '',
                          service: 'counselling', mode: 'ONLINE',
                          date: new Date().toISOString().split('T')[0], time: firstSlot,
                          meetLink: '', status: 'CONFIRMED'
                        });
                        setBookingFormError('');
                        setBookingFormSuccess('');
                        setIsAddBookingOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Schedule Booking
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Recent activities feed */}
                  <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Live Activity Feed</span>
                      <span className="text-[8px] text-zinc-500 font-mono uppercase">Sync OK • {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[8.5px] uppercase font-black text-zinc-500 tracking-wider block">Latest Bookings</span>
                      <div className="space-y-2">
                        {bookingsDb.slice(0, 3).map(b => (
                          <div key={b.id} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-855 flex justify-between items-center text-[10px]">
                            <div>
                              <span className="font-bold text-white uppercase">{b.userName}</span>
                              <span className="text-zinc-550"> booked with </span>
                              <span className="font-bold text-brand uppercase">{b.advisorName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-400 font-medium block">{b.date} • {b.time}</span>
                              <span className={`text-[8px] px-1 rounded uppercase font-black ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-955/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>{b.status}</span>
                            </div>
                          </div>
                        ))}
                        {bookingsDb.length === 0 && <p className="text-zinc-500 italic text-[10px]">No recent bookings.</p>}
                      </div>

                      <span className="text-[8.5px] uppercase font-black text-zinc-500 tracking-wider block pt-2">Latest Inquiries</span>
                      <div className="space-y-2">
                        {inquiriesDb.slice(0, 2).map(i => (
                          <div key={i.id} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-855 text-[10px] space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-white uppercase">{i.name} ({i.email})</span>
                              <span className="text-zinc-500 font-mono text-[8.5px]">{i.date}</span>
                            </div>
                            <p className="text-zinc-400 font-medium truncate italic">"{i.message}"</p>
                          </div>
                        ))}
                        {inquiriesDb.length === 0 && <p className="text-zinc-500 italic text-[10px]">No recent inquiries.</p>}
                      </div>
                    </div>
                  </div>

                  {/* System health state */}
                  <div className="lg:col-span-4 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4 text-[10px]">
                    <div className="border-b border-zinc-900 pb-2">
                      <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Database & System Health</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 font-bold uppercase">Sandbox Storage</span>
                        <span className="text-white font-black font-mono">{kbUsed} KB Used</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                        <div className="bg-brand h-full rounded-full" style={{ width: `${Math.min(100, Number(kbUsed) * 2)}%` }} />
                      </div>

                      <div className="space-y-2.5 pt-2 font-bold uppercase text-[9px] tracking-wide">
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Seed Accounts Intact</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Local Auth Resolver OK</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Security Gate Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-admins list table */}
                <div className="pt-4 space-y-3">
                  <h4 className="font-header font-black text-zinc-300 text-xs uppercase tracking-wider">Active Sub-Admin Personnel</h4>
                  <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-850 text-left">
                          <th className="p-3">Staff Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Scopes Enabled</th>
                          <th className="p-3 text-center">Edit Scopes</th>
                          <th className="p-3 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subAdminsList.map(admin => {
                          const { cleanName, roleTitle } = parseStaffDetails(admin);
                          return (
                            <tr key={admin.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                              <td className="p-3">
                                <span className="font-bold text-white block">{cleanName}</span>
                                {roleTitle && (
                                  <span className="text-[8px] bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded font-black tracking-wider uppercase font-mono inline-block mt-1">
                                    {roleTitle}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-zinc-400">{admin.email}</td>
                              <td className="p-3 flex flex-wrap gap-1">
                                {admin.permissions.map(p => (
                                  <span key={p} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                                    {p.replace('MANAGE_', '')}
                                  </span>
                                ))}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleOpenEditSubAdmin(admin)}
                                  className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-855 transition cursor-pointer text-[8px] font-black uppercase tracking-wider"
                                >
                                  Edit
                                </button>
                              </td>
                              <td className="p-3 text-center">
                                <button 
                                  onClick={() => handleDeleteUser(admin.id)}
                                  className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                  title="Delete sub-admin account"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {subAdminsList.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-5 text-center text-zinc-500 italic">No sub-admin accounts registered. Create accounts inside the "Roles & Scopes" tab.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {currentSection === 'users' && hasUserPermission && (() => {
            const handleExportStudentsCSV = () => {
              const headers = "ID,Name,Email,Status,BookingsCount\n";
              const rows = studentsList.map(s => {
                const count = bookingsDb.filter(b => b.userId === s.id).length;
                return `"${s.id}","${s.name}","${s.email}","${s.status || 'ACTIVE'}",${count}`;
              }).join('\n');
              navigator.clipboard.writeText(headers + rows);
              alert("Student directory CSV copied to clipboard!");
            };

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Students Directory</h3>
                    <p className="text-[10px] text-zinc-500 font-medium pt-1">Register new student accounts, edit profiles, suspend/unsuspend access</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input 
                        type="text" 
                        placeholder="Search students..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    <button 
                      onClick={handleExportStudentsCSV}
                      className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded-lg transition-colors cursor-pointer uppercase shrink-0"
                    >
                      Export CSV
                    </button>
                    <button 
                      onClick={() => {
                        setUserForm({ id: '', name: '', email: '', password: '' });
                        setUserFormError('');
                        setUserFormSuccess('');
                        setIsAddUserOpen(true);
                      }}
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 uppercase shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Student
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-850 text-left">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Consultations</th>
                        <th className="p-3 text-center font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map(student => (
                        <tr key={student.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                          <td className="p-3">
                            <span className="font-bold text-white block leading-tight">{student.name}</span>
                            <span className="text-[8px] text-zinc-500">ID: {student.id}</span>
                          </td>
                          <td className="p-3 text-zinc-350 font-medium">{student.email}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleStudentStatus(student.id, student.status || 'ACTIVE')}
                              className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition cursor-pointer border ${
                                (student.status || 'ACTIVE') === 'ACTIVE'
                                  ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450 hover:bg-rose-955/20 hover:border-rose-900 hover:text-rose-500'
                                  : 'bg-rose-955/20 border-rose-900/40 text-rose-500 hover:bg-emerald-955/20 hover:border-emerald-900 hover:text-emerald-450'
                              }`}
                              title={ (student.status || 'ACTIVE') === 'ACTIVE' ? "Click to Suspend Student" : "Click to Unsuspend Student" }
                            >
                              {student.status || 'ACTIVE'}
                            </button>
                          </td>
                          <td className="p-3 text-center font-bold text-zinc-300">
                            {bookingsDb.filter(b => b.userId === student.id).length} Booked
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setViewingStudent(student)}
                              className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-[8px] font-black uppercase tracking-wider"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => handleOpenEditUser(student)}
                              className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(student.id)}
                              className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {studentsList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No student registries match the active query.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: PSYCHOLOGISTS DIRECTORY */}
          {currentSection === 'psychologists' && hasPsyPermission && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Psychologists Directory</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Register psychologist staff, update clinic credentials, or remove accounts</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:max-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Search advisors..."
                      value={searchPsy}
                      onChange={(e) => setSearchPsy(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                  <button 
                    onClick={() => {
                      setPsyForm({
                        id: '',
                        name: '',
                        email: '',
                        password: '',
                        education: 'MPhil Clinical Psychology',
                        specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                        price: 1250,
                        lang: 'Malayalam, English',
                        bio: ''
                      });
                      setPsyFormError('');
                      setPsyFormSuccess('');
                      setIsAddPsyOpen(true);
                    }}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 uppercase shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Psychologist
                  </button>
                </div>
              </div>

              <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-850 text-left">
                      <th className="p-3">Psychologist Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3 text-center">Clearance Status</th>
                      <th className="p-3 text-center font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psychologistsList.map(psy => (
                      <tr key={psy.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                        <td className="p-3">
                          <span className="font-bold text-white block leading-tight">{psy.name}</span>
                          <span className="text-[8px] text-zinc-500">ID: {psy.id} • Active Profile</span>
                        </td>
                        <td className="p-3 text-zinc-350 font-medium">{psy.email}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleTogglePsyVerification(psy.id, psy.verified)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[9px] font-black uppercase font-mono transition cursor-pointer ${
                              psy.verified
                                ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450 hover:bg-rose-955/20 hover:border-rose-900 hover:text-rose-500'
                                : 'bg-amber-955/20 border-amber-900/40 text-amber-500 hover:bg-emerald-955/20 hover:border-emerald-900/40 hover:text-emerald-450'
                            }`}
                            title={psy.verified ? "Click to Mark Unverified" : "Click to Verify Advisor"}
                          >
                            {psy.verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setViewingPsychologist(psy)}
                            className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-[8px] font-black uppercase tracking-wider"
                          >
                            Details
                          </button>
                          <a
                            href={`#/advisor/${psy.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-[8px] font-black uppercase tracking-wider inline-block text-center"
                          >
                            Preview
                          </a>
                          <button 
                            onClick={() => handleOpenEditPsy(psy)}
                            className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                            title="Edit Psychologist"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeletePsy(psy.id)}
                            className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                            title="Remove Psychologist"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {psychologistsList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-zinc-500 italic">No psychologist registries match the active query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
                 {/* TAB 4: SUB-ADMIN CREATOR & ROLES */}
          {currentSection === 'subadmins' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-805 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Staff Roles & Permissions Scopes</h3>
                <p className="text-[10px] text-zinc-500 font-medium pt-1">Create sub-admin staff, configure dynamic role titles, and adjust access permissions</p>
              </div>

              {/* Dynamic Roles Definition Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-zinc-800 pb-6 mb-2">
                {/* Role Creator Form */}
                <form onSubmit={handleCreateRole} className="lg:col-span-5 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-brand" /> Create Custom Role Title
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Role Title Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Admissions Lead"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Default Scope Permissions</label>
                      <div className="space-y-2">
                        {['MANAGE_USERS', 'MANAGE_PSYCHOLOGISTS', 'MANAGE_BOOKINGS'].map(scope => (
                          <label key={scope} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-350 select-none">
                            <input
                              type="checkbox"
                              checked={newRolePermissions[scope]}
                              onChange={() => toggleNewRolePermission(scope)}
                              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                            />
                            <span>{scope === 'MANAGE_USERS' ? 'Manage Students' : scope === 'MANAGE_PSYCHOLOGISTS' ? 'Manage Psychologists' : 'Manage Bookings'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {roleError && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase font-mono">{roleError}</p>
                  )}
                  {roleSuccess && (
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{roleSuccess}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition border border-brand/20 hover:border-brand flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Custom Role
                  </button>
                </form>

                {/* Roles Registry List */}
                <div className="lg:col-span-7 border border-zinc-850 p-5 rounded-xl bg-zinc-950/40 space-y-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-brand" /> Active Custom Roles Registry
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {rolesDb.map(role => {
                      const isProtected = ['role_hr', 'role_state', 'role_scheduler', 'role_finance'].includes(role.id);
                      return (
                        <div key={role.id} className="bg-zinc-900 border border-zinc-850 p-3 rounded-lg flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-white uppercase text-[10.5px] truncate">{role.name}</span>
                              {isProtected ? (
                                <span className="text-[7px] text-zinc-550 border border-zinc-800 bg-zinc-950 px-1 py-0.2 rounded uppercase font-black font-mono shrink-0">System</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(role)}
                                  className="text-rose-500 hover:text-rose-455 font-bold text-[8.5px] uppercase tracking-wide cursor-pointer flex items-center border-none bg-transparent"
                                  title="Delete role title"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.length > 0 ? (
                                role.permissions.map(p => (
                                  <span key={p} className="px-1.5 py-0.5 rounded bg-zinc-950 text-[7.5px] text-zinc-450 uppercase tracking-wider font-mono border border-zinc-850">
                                    {p.replace('MANAGE_', '')}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[8px] text-zinc-600 italic">No permissions</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Staff Provisioning Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Registration form */}
                <form onSubmit={handleCreateSubAdmin} className="lg:col-span-7 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-brand" /> Register Staff Profile
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Staff Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Sandra Tomy"
                        value={subAdminForm.name}
                        onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Role Title</label>
                      <select 
                        value={subAdminForm.roleName}
                        onChange={(e) => handleRoleChangeInForm(e.target.value)}
                        disabled={rolesDb.length === 0}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rolesDb.length === 0 ? (
                          <option value="">-- No Roles Defined --</option>
                        ) : (
                          rolesDb.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="staff@example.com"
                        value={subAdminForm.email}
                        onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={subAdminForm.password}
                        onChange={(e) => setSubAdminForm({ ...subAdminForm, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {subAdminError && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase font-mono">{subAdminError}</p>
                  )}

                  {subAdminSuccess && (
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{subAdminSuccess}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-950" /> Register Sub-Admin Profile
                  </button>
                </form>

                {/* Role Scopes Viewer */}
                <div className="lg:col-span-5 border border-zinc-850 p-5 rounded-xl bg-zinc-955/40 space-y-4 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-brand" /> Role Scope Permissions
                  </div>

                  {rolesDb.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs rounded-xl space-y-2">
                      <p className="font-bold">No Custom Roles Defined</p>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        To register sub-admin staff, you must first define a role title and assign its permission scopes using the "Create Custom Role Title" form above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Inherited Scopes for {subAdminForm.roleName}</p>
                      
                      <div className="space-y-2.5">
                        {/* MANAGE_USERS */}
                        <div className={`p-3 border rounded-xl flex items-center justify-between transition-colors duration-200 ${
                          selectedPermissions.MANAGE_USERS ? 'border-brand/30 bg-brand/5 text-white' : 'border-zinc-900 bg-zinc-950/20 text-zinc-500'
                        }`}>
                          <div className="text-xs">
                            <span className="font-bold block">Manage Students</span>
                            <span className="text-[9.5px] text-zinc-500 leading-tight block mt-0.5">List, search, delete student directory.</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border transition flex items-center justify-center shrink-0 ml-2 ${
                            selectedPermissions.MANAGE_USERS ? 'border-brand bg-brand text-zinc-955' : 'border-zinc-800 text-zinc-800'
                          }`}>
                            {selectedPermissions.MANAGE_USERS && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* MANAGE_PSYCHOLOGISTS */}
                        <div className={`p-3 border rounded-xl flex items-center justify-between transition-colors duration-200 ${
                          selectedPermissions.MANAGE_PSYCHOLOGISTS ? 'border-brand/30 bg-brand/5 text-white' : 'border-zinc-900 bg-zinc-950/20 text-zinc-500'
                        }`}>
                          <div className="text-xs">
                            <span className="font-bold block">Manage Psychologists</span>
                            <span className="text-[9.5px] text-zinc-500 leading-tight block mt-0.5">Configure credentials, verify/unverify accounts.</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border transition flex items-center justify-center shrink-0 ml-2 ${
                            selectedPermissions.MANAGE_PSYCHOLOGISTS ? 'border-brand bg-brand text-zinc-955' : 'border-zinc-800 text-zinc-800'
                          }`}>
                            {selectedPermissions.MANAGE_PSYCHOLOGISTS && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* MANAGE_BOOKINGS */}
                        <div className={`p-3 border rounded-xl flex items-center justify-between transition-colors duration-200 ${
                          selectedPermissions.MANAGE_BOOKINGS ? 'border-brand/30 bg-brand/5 text-white' : 'border-zinc-900 bg-zinc-950/20 text-zinc-500'
                        }`}>
                          <div className="text-xs">
                            <span className="font-bold block">Manage Bookings</span>
                            <span className="text-[9.5px] text-zinc-555 leading-tight block mt-0.5">Monitor and reschedule session bookings.</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border transition flex items-center justify-center shrink-0 ml-2 ${
                            selectedPermissions.MANAGE_BOOKINGS ? 'border-brand bg-brand text-zinc-955' : 'border-zinc-800 text-zinc-800'
                          }`}>
                            {selectedPermissions.MANAGE_BOOKINGS && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

                   {currentSection === 'bookings' && hasBookingPermission && (() => {
            const filteredBookings = bookingsDb.filter(b => {
              const matchesSearch = b.userName.toLowerCase().includes(searchBooking.toLowerCase()) || 
                                    (b.advisorName && b.advisorName.toLowerCase().includes(searchBooking.toLowerCase())) ||
                                    (b.status && b.status.toLowerCase().includes(searchBooking.toLowerCase()));
              if (bookingStatusFilter === 'ALL') return matchesSearch;
              return matchesSearch && b.status === bookingStatusFilter;
            });

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Consultation Bookings</h3>
                    <p className="text-[10px] text-zinc-500 font-medium pt-1">Schedule new consultations, manage session statuses, and meeting links</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input 
                        type="text" 
                        placeholder="Search bookings..."
                        value={searchBooking}
                        onChange={(e) => setSearchBooking(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    <button 
                      onClick={() => {
                        const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                        const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                        let firstSlot = '';
                        if (firstPsy) {
                          const saved = localStorage.getItem(`behold_advisor_availability_${firstPsy.id}`);
                          if (saved) {
                            try {
                              const parsed = JSON.parse(saved);
                              if (parsed.availableSlots && parsed.availableSlots.length > 0) {
                                firstSlot = parsed.availableSlots[0];
                              }
                            } catch (err) {}
                          }
                        }
                        setBookingForm({
                          id: '',
                          userId: firstStudent?.id || '',
                          advisorId: firstPsy?.id || '',
                          service: 'counselling',
                          mode: 'ONLINE',
                          date: new Date().toISOString().split('T')[0],
                          time: firstSlot,
                          meetLink: '',
                          status: 'CONFIRMED'
                        });
                        setBookingFormError('');
                        setBookingFormSuccess('');
                        setIsAddBookingOpen(true);
                      }}
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 uppercase shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-955" /> Schedule Booking
                    </button>
                  </div>
                </div>

                {/* Status Filter Tabs & Revenue Estimate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setBookingStatusFilter(status); setSelectedBookingIds([]); }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition cursor-pointer border ${
                          bookingStatusFilter === status
                            ? 'bg-brand text-zinc-955 border-brand font-black'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {status} ({
                          status === 'ALL'
                            ? bookingsDb.length
                            : bookingsDb.filter(b => b.status === status).length
                        })
                      </button>
                    ))}
                  </div>

                  <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-right">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Estimated Revenue</span>
                    <span className="text-sm font-black text-emerald-450">₹{
                      filteredBookings.reduce((acc, b) => {
                        if (b.status !== 'COMPLETED') return acc;
                        const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
                        let price = 1250;
                        if (advisor) {
                          const savedProfile = localStorage.getItem(`behold_advisor_profile_${advisor.id}`);
                          if (savedProfile) {
                            try {
                              price = JSON.parse(savedProfile).price || price;
                            } catch (e) {}
                          }
                        }
                        return acc + Number(price);
                      }, 0)
                    } Completed</span>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {selectedBookingIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 animate-in slide-in-from-top duration-200">
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand font-mono">{selectedBookingIds.length} Selected</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkBookingStatus('CONFIRMED')}
                        className="px-2.5 py-1 bg-emerald-955/20 text-emerald-400 hover:bg-emerald-900 hover:text-white rounded border border-emerald-900/30 transition text-[8px] font-bold uppercase cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('COMPLETED')}
                        className="px-2.5 py-1 bg-indigo-955/20 text-indigo-400 hover:bg-indigo-900 hover:text-white rounded border border-indigo-900/30 transition text-[8px] font-bold uppercase cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('CANCELLED')}
                        className="px-2.5 py-1 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition text-[8px] font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDeleteBookings}
                        className="px-2.5 py-1 bg-rose-950/40 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/50 transition text-[8px] font-bold uppercase cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-850 text-left">
                        <th className="p-3 text-center w-10">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookingIds(filteredBookings.map(b => b.id));
                              } else {
                                setSelectedBookingIds([]);
                              }
                            }}
                            checked={filteredBookings.length > 0 && selectedBookingIds.length === filteredBookings.length}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Psychologist</th>
                        <th className="p-3">Service / Mode</th>
                        <th className="p-3">Schedule</th>
                        <th className="p-3">Meeting Room</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedBookingIds.includes(booking.id)}
                              onChange={() => handleToggleSelectBooking(booking.id)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white block leading-tight">{booking.userName}</span>
                            <span className="text-[8px] text-zinc-500">ID: {booking.userId}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-white block leading-tight">{booking.advisorName}</span>
                            <span className="text-[8px] text-zinc-500">{booking.advisorRole}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block uppercase text-white leading-tight">
                              {booking.service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}
                            </span>
                            <span className="text-[8px] text-zinc-550 font-bold uppercase">{booking.mode}</span>
                          </td>
                          <td className="p-3 font-semibold text-zinc-300">
                            <span className="block">{booking.date}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">{booking.time}</span>
                          </td>
                          <td className="p-3">
                            {booking.meetLink ? (
                              <a 
                                href={booking.meetLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-brand hover:underline font-bold inline-flex items-center gap-1 text-[10px]"
                              >
                                <Link className="w-3 h-3" /> Virtual Room
                              </a>
                            ) : (
                              <span className="text-zinc-550 italic text-[10px]">No Link Set</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono tracking-wider ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-450'
                                : booking.status === 'COMPLETED'
                                ? 'bg-indigo-950/30 border border-indigo-900/40 text-indigo-400'
                                : booking.status === 'CANCELLED'
                                ? 'bg-rose-955/30 border border-rose-900/40 text-rose-500'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-450'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleOpenEditBooking(booking)}
                              className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                              title="Edit / Reschedule"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                              title="Cancel Booking"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-zinc-500 italic">No bookings scheduled in the system matching the active filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB: STUDENT INQUIRIES & LEADS */}
          {currentSection === 'inquiries' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Student Inquiries & Leads</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Review contact requests submitted from the landing page</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {inquiriesDb.some(i => i.status === 'RESOLVED') && (
                    <button
                      onClick={handleBulkClearResolvedInquiries}
                      className="px-3.5 py-2 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-[9px] font-black uppercase tracking-widest shrink-0"
                    >
                      Clear Resolved
                    </button>
                  )}
                  <div className="relative w-full sm:max-w-[200px]">
                    <input 
                      type="text" 
                      placeholder="Search messages..."
                      value={searchInquiry}
                      onChange={(e) => setSearchInquiry(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div 
                    key={inq.id}
                    className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-955/20 border border-emerald-900/40 text-emerald-450'
                            : 'bg-amber-955/20 border border-amber-900/40 text-amber-500'
                        }`}>
                          {inq.status || 'PENDING'}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{inq.date}</span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-header font-black text-sm uppercase text-white truncate">{inq.name}</h4>
                        <p className="text-[10px] text-brand font-semibold font-mono">{inq.email}</p>
                      </div>

                      <p className="text-[11px] text-zinc-400 font-medium leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap">
                        {inq.message}
                      </p>

                      {/* Internal Notes field */}
                      <div className="pt-3 border-t border-zinc-900 mt-2 space-y-2">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-500 block">Internal Staff Notes</span>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Add diagnostic notes or followup details..."
                            defaultValue={inq.note || ''}
                            id={`note-${inq.id}`}
                            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-850 focus:border-brand rounded text-[11px] text-white outline-none font-semibold"
                          />
                          <button
                            onClick={() => {
                              const noteVal = document.getElementById(`note-${inq.id}`).value;
                              handleSaveInquiryNote(inq.id, noteVal);
                            }}
                            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300 hover:text-brand hover:border-brand rounded font-black uppercase transition cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleResolveInquiry(inq.id)}
                        className={`px-4.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1 border border-zinc-800 ${
                          inq.status === 'RESOLVED'
                            ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                            : 'bg-brand hover:bg-brand-dark text-zinc-955'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{inq.status === 'RESOLVED' ? 'Re-open' : 'Mark Resolved'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="px-3 py-2.5 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-[9px] font-black uppercase tracking-widest"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredInquiries.length === 0 && (
                  <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                    <MessageSquare className="w-8 h-8 text-zinc-650 mx-auto" />
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No student inquiries submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: APTITUDE TEST RESULTS */}
          {currentSection === 'testresults' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Aptitude Test Results</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Monitor student diagnostic assessment outcomes and profiles</p>
                </div>
                <div className="relative w-full sm:max-w-[240px]">
                  <input 
                    type="text" 
                    placeholder="Search results..."
                    value={searchTestResult}
                    onChange={(e) => setSearchTestResult(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-xs font-semibold focus:border-brand text-white outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTestResults.map((res) => (
                  <div 
                    key={res.id}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[8px] bg-brand text-zinc-955 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                            Dominant: {res.dominantDomain}
                          </span>
                          <h4 className="font-header font-black text-sm uppercase text-white truncate pt-1">{res.studentName}</h4>
                          <span className="text-[9.5px] text-zinc-550 block font-medium truncate leading-none">{res.studentEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleExportAptitudeResults(res)}
                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-brand rounded font-black uppercase transition text-[8px] tracking-wider shrink-0 cursor-pointer"
                            title="Export Diagnostic Log"
                          >
                            Copy Report
                          </button>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">{res.date}</span>
                          <button
                            onClick={() => handleDeleteTestResult(res.id)}
                            className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                            title="Delete Result Log"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3.5 border-t border-zinc-850 pt-3">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-500 block">Cognitive Profile Breakdown</span>
                        <div className="space-y-2 text-[10px]">
                          {Object.entries(res.scores || {}).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-zinc-400 capitalize">{key}</span>
                                <span className="text-brand font-mono">{val}%</span>
                              </div>
                              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                                <div 
                                  className="bg-brand h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${val}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTestResults.length === 0 && (
                  <div className="col-span-2 text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                    <FileSpreadsheet className="w-8 h-8 text-zinc-655 mx-auto" />
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No aptitude tests completed yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FAQ DESK MANAGER */}
          {currentSection === 'faqs' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Frequently Asked Questions (FAQ)</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Manage standard questions displayed on the landing page</p>
                </div>
                <button 
                  onClick={() => {
                    setFaqForm({ index: -1, question: '', answer: '' });
                    setFaqFormError('');
                    setFaqFormSuccess('');
                    setIsAddFaqOpen(true);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 uppercase shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add FAQ Item
                </button>
              </div>

              <div className="space-y-4">
                {faqsDb.map((faq, index) => (
                  <div 
                    key={index}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <h4 className="font-header font-black text-sm uppercase text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-brand flex items-center justify-center font-bold shrink-0">{index + 1}</span>
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium leading-relaxed pl-7 font-sans">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-start">
                      <button 
                        onClick={() => handleOpenEditFaq(faq, index)}
                        className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFaq(index)}
                        className="p-2 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {faqsDb.length === 0 && (
                  <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                    <HelpCircle className="w-8 h-8 text-zinc-650 mx-auto" />
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-wider">No FAQs defined.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SITE SETTINGS */}
          {currentSection === 'settings' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Site Configuration Panel</h3>
                <p className="text-[10px] text-zinc-500 font-medium pt-1">Manage global landing page titles, subheadings, and contact support endpoints</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-zinc-955 border border-zinc-850 p-6 rounded-xl space-y-5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-black text-zinc-400">Hero Section Heading</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none"
                    placeholder="e.g. Bridging You To Your {True Growth.}"
                  />
                  <span className="text-[8.5px] text-zinc-550 block font-medium">Use curly braces `{}` around words you want highlighted with the neon gradient.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-black text-zinc-400">Hero Section Subtitle</label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.heroSub}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSub: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold"
                    placeholder="Write a compelling landing subheading..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-black text-zinc-400">WhatsApp Support Endpoint Link</label>
                    <input
                      type="url"
                      required
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-mono font-semibold"
                      placeholder="e.g. https://wa.me/919497174011"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-black text-zinc-400">Contact Support Email Address</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-mono font-semibold"
                      placeholder="e.g. support@behold.com"
                    />
                  </div>
                </div>

                {settingsSuccess && (
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{settingsSuccess}</p>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  Save Global Configurations
                </button>
              </form>
            </div>
          )}

          {/* TAB: ANALYTICS COMMAND CENTER */}
          {currentSection === 'analytics' && isSuperAdmin && (() => {
            const monthlyCounts = bookingsDb.reduce((acc, b) => {
              if (!b.date) return acc;
              const month = b.date.substring(0, 7); // YYYY-MM
              acc[month] = (acc[month] || 0) + 1;
              return acc;
            }, {});
            const sortedMonths = Object.entries(monthlyCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

            const advisorCounts = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'COMPLETED') return acc;
              acc[b.advisorName] = (acc[b.advisorName] || 0) + 1;
              return acc;
            }, {});
            const sortedAdvisors = Object.entries(advisorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

            const serviceCounts = bookingsDb.reduce((acc, b) => {
              acc[b.service] = (acc[b.service] || 0) + 1;
              return acc;
            }, { counselling: 0, career: 0 });
            
            const maxBookings = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m[1])) : 1;

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-xs">
                <div className="border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Platform Analytics & Insights</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Analyze platform booking volume, consultant loads, and product performance</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Monthly bookings vertical chart */}
                  <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
                    <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 block border-b border-zinc-900 pb-2">Monthly Booking Volumes</span>
                    <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
                      {sortedMonths.map(([month, count]) => {
                        const pct = ((count / maxBookings) * 100).toFixed(0);
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <span className="text-[8.5px] text-brand font-black opacity-0 group-hover:opacity-100 transition-opacity font-mono">{count} Booking(s)</span>
                            <div 
                              className="w-full bg-brand/15 hover:bg-brand border border-brand/30 hover:border-brand rounded-t transition-all duration-500 relative" 
                              style={{ height: `${pct}%`, minHeight: '6%' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
                            </div>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase font-mono">{month}</span>
                          </div>
                        );
                      })}
                      {sortedMonths.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 italic">No bookings registered for monthly logging.</div>
                      )}
                    </div>
                  </div>

                  {/* Right: Service and psychologist breakdown */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Service Type Breakdown */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
                      <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 block border-b border-zinc-900 pb-2">Service Breakdown</span>
                      <div className="space-y-3 text-[10px]">
                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-400">Emotional Wellbeing</span>
                            <span className="text-white font-mono">{serviceCounts.counselling} booked</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                            <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.counselling / (bookingsDb.length || 1)) * 100}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-zinc-400">Career Mapping</span>
                            <span className="text-white font-mono">{serviceCounts.career} booked</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                            <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.career / (bookingsDb.length || 1)) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top psychologist list */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
                      <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 block border-b border-zinc-900 pb-2">Top Performers (Completed)</span>
                      <div className="space-y-2 text-[10px]">
                        {sortedAdvisors.map(([name, count], idx) => (
                          <div key={name} className="flex items-center justify-between p-2 bg-zinc-900/40 rounded border border-zinc-855">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 text-brand text-[8px] font-black flex items-center justify-center font-mono">#{idx+1}</span>
                              <span className="font-bold text-white uppercase truncate max-w-[120px]">{name}</span>
                            </div>
                            <span className="text-brand font-black uppercase font-mono text-[9px]">{count} Sessions</span>
                          </div>
                        ))}
                        {sortedAdvisors.length === 0 && (
                          <div className="text-zinc-650 italic text-center py-4">No completed consultations.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* 1. STUDENT ADD / EDIT MODAL */}
      {(isAddUserOpen || isEditUserOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-header">
                {isAddUserOpen ? 'Register Student' : 'Edit Student Details'}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">
                {isAddUserOpen ? 'Provision a new student account.' : 'Modify account registry records.'}
              </p>
            </div>

            <form onSubmit={isAddUserOpen ? handleCreateUser : handleUpdateUser} className="space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">
                  Password {isEditUserOpen && <span className="text-zinc-500 lowercase font-normal">(leave blank to keep unchanged)</span>}
                </label>
                <input 
                  type="password" 
                  required={isAddUserOpen}
                  placeholder={isEditUserOpen ? "••••••••" : "Enter password"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              {userFormError && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{userFormError}</p>
              )}

              {userFormSuccess && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{userFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddUserOpen ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PSYCHOLOGIST ADD / EDIT MODAL */}
      {(isAddPsyOpen || isEditPsyOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
          />
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-header">
                {isAddPsyOpen ? 'Register Psychologist' : 'Edit Psychologist details'}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">
                {isAddPsyOpen ? 'Register a clinical professional profile.' : 'Modify credentials, rates, and bios.'}
              </p>
            </div>

            <form onSubmit={isAddPsyOpen ? handleCreatePsy : handleUpdatePsy} className="space-y-4 font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Sandra Tomy"
                    value={psyForm.name}
                    onChange={(e) => setPsyForm({ ...psyForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="counsellor@example.com"
                    value={psyForm.email}
                    onChange={(e) => setPsyForm({ ...psyForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">
                    Password {isEditPsyOpen && <span className="text-zinc-500 lowercase font-normal">(blank keeps same)</span>}
                  </label>
                  <input 
                    type="password" 
                    required={isAddPsyOpen}
                    placeholder={isEditPsyOpen ? "••••••••" : "Enter password"}
                    value={psyForm.password}
                    onChange={(e) => setPsyForm({ ...psyForm, password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Education qualifications</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MPhil Clinical Psychology"
                    value={psyForm.education}
                    onChange={(e) => setPsyForm({ ...psyForm, education: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Hourly price (INR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1250"
                    value={psyForm.price}
                    onChange={(e) => setPsyForm({ ...psyForm, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Languages Spoken</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Malayalam, English"
                    value={psyForm.lang}
                    onChange={(e) => setPsyForm({ ...psyForm, lang: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Default Google Meet Link (optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={psyForm.defaultMeetLink}
                    onChange={(e) => setPsyForm({ ...psyForm, defaultMeetLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Specialties (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="Anxiety, Stress Management, Mood Disorders"
                    value={psyForm.specialties}
                    onChange={(e) => setPsyForm({ ...psyForm, specialties: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Professional Bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Write clinical experience details..."
                    value={psyForm.bio}
                    onChange={(e) => setPsyForm({ ...psyForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {psyFormError && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{psyFormError}</p>
              )}

              {psyFormSuccess && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{psyFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddPsyOpen(false); setIsEditPsyOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddPsyOpen ? 'Save Psychologist' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. BOOKING ADD / EDIT MODAL */}
      {(isAddBookingOpen || isEditBookingOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddBookingOpen(false); setIsEditBookingOpen(false); }}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-header">
                {isAddBookingOpen ? 'Schedule Consultation' : 'Update Appointment'}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">
                {isAddBookingOpen ? 'Configure slot details and associate clients.' : 'Edit scheduled date, time slot, and meeting link.'}
              </p>
            </div>

            <form onSubmit={isAddBookingOpen ? handleCreateBooking : handleUpdateBooking} className="space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Select Student</label>
                <select 
                  required
                  disabled={isEditBookingOpen}
                  value={bookingForm.userId}
                  onChange={(e) => setBookingForm({ ...bookingForm, userId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select a student --</option>
                  {usersDb.filter(u => u.role === 'USER' || !u.role).map(student => (
                    <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Select Psychologist</label>
                <select 
                  required
                  disabled={isEditBookingOpen}
                  value={bookingForm.advisorId}
                  onChange={(e) => {
                    const nextAdvisorId = e.target.value;
                    const saved = localStorage.getItem(`behold_advisor_availability_${nextAdvisorId}`);
                    let firstSlot = '';
                    if (saved) {
                      try {
                        const parsed = JSON.parse(saved);
                        if (parsed.availableSlots && parsed.availableSlots.length > 0) {
                          firstSlot = parsed.availableSlots[0];
                        }
                      } catch (err) {}
                    }
                    setBookingForm({ ...bookingForm, advisorId: nextAdvisorId, time: firstSlot });
                  }}
                  className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Select psychologist --</option>
                  {usersDb.filter(u => u.role === 'PSYCHOLOGIST').map(psy => (
                    <option key={psy.id} value={psy.id}>{psy.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Service Category</label>
                  <select 
                    value={bookingForm.service}
                    onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="counselling">Emotional Wellbeing</option>
                    <option value="career">Career Mapping</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Mode</label>
                  <select 
                    value={bookingForm.mode}
                    onChange={(e) => setBookingForm({ ...bookingForm, mode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Booking Date</label>
                  <input 
                    type="date" 
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Time Slot</label>
                  <select 
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select time slot --</option>
                    {getAdvisorSlotsForBookingForm().map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Meeting Room URL (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://meet.google.com/abc-def-ghi"
                    value={bookingForm.meetLink}
                    onChange={(e) => setBookingForm({ ...bookingForm, meetLink: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Booking Status</label>
                  <select 
                    value={bookingForm.status}
                    onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {bookingFormError && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{bookingFormError}</p>
              )}

              {bookingFormSuccess && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{bookingFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddBookingOpen(false); setIsEditBookingOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddBookingOpen ? 'Confirm Slot' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. FAQ ADD / EDIT MODAL */}
      {(isAddFaqOpen || isEditFaqOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => { setIsAddFaqOpen(false); setIsEditFaqOpen(false); }}
          />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-header">
                {isAddFaqOpen ? 'Create FAQ Record' : 'Update FAQ Record'}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">
                {isAddFaqOpen ? 'Publish a new question and answer to the public landing page.' : 'Modify the existing question or answer detail.'}
              </p>
            </div>

            <form onSubmit={isAddFaqOpen ? handleCreateFaq : handleUpdateFaq} className="space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">FAQ Question</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. How does the aptitude assessment work?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Detailed Answer</label>
                <textarea 
                  rows={5}
                  required
                  placeholder="Provide a detailed, helpful answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-xs text-white outline-none transition-colors resize-none"
                />
              </div>

              {faqFormError && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{faqFormError}</p>
              )}

              {faqFormSuccess && (
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{faqFormSuccess}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddFaqOpen(false); setIsEditFaqOpen(false); }}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                >
                  {isAddFaqOpen ? 'Create FAQ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. STUDENT VIEW DETAILS MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setViewingStudent(null)}
          />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-header flex items-center gap-2">
                  <User className="w-5 h-5 text-brand" /> Student Profile Details
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">Registry records, booking history, and diagnostic aptitude profiles.</p>
              </div>
              <button 
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account details */}
              <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3">
                <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block">Registry Metadata</span>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Account ID</span>
                    <span className="font-mono text-zinc-300">{viewingStudent.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Full Name</span>
                    <span className="font-bold text-white">{viewingStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Email Address</span>
                    <span className="font-bold text-zinc-350">{viewingStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Account Status</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      (viewingStudent.status || 'ACTIVE') === 'ACTIVE'
                        ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
                        : 'bg-rose-955/20 border border-rose-900/30 text-rose-500'
                    }`}>
                      {viewingStudent.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consultation Stats */}
              <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block mb-3">Consultation Summary</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
                      <p className="text-xl font-black text-brand">
                        {bookingsDb.filter(b => b.userId === viewingStudent.id).length}
                      </p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Total Bookings</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
                      <p className="text-xl font-black text-emerald-400">
                        {bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'COMPLETED').length}
                      </p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-900 text-[10px] text-zinc-400">
                  {(() => {
                    const pendingBookings = bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'PENDING').length;
                    const confirmedBookings = bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'CONFIRMED').length;
                    return `Scheduled slots: ${confirmedBookings} active, ${pendingBookings} awaiting approval`;
                  })()}
                </div>
              </div>
            </div>

            {/* Booking History List */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block">Consultation History Log</span>
              <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
                <table className="w-full text-[10px] border-collapse text-left">
                  <thead>
                    <tr className="bg-zinc-900/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-855">
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Advisor</th>
                      <th className="p-2.5">Service Type</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const studentBookings = bookingsDb.filter(b => b.userId === viewingStudent.id);
                      if (studentBookings.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-zinc-600 italic">No consult history for this student.</td>
                          </tr>
                        );
                      }
                      return studentBookings.map(b => {
                        const psychologist = usersDb.find(u => u.id === b.advisorId);
                        return (
                          <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
                            <td className="p-2.5">
                              <span className="text-white block font-semibold">{b.date}</span>
                              <span className="text-zinc-500 text-[8.5px]">{b.time}</span>
                            </td>
                            <td className="p-2.5 text-zinc-300 font-medium">
                              {psychologist ? psychologist.name : 'Unknown Advisor'}
                            </td>
                            <td className="p-2.5 text-zinc-400 capitalize font-medium">
                              {b.service === 'counselling' ? 'Wellbeing' : 'Career Mapping'} ({b.mode})
                            </td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
                                b.status === 'COMPLETED' ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450' :
                                b.status === 'CANCELLED' ? 'bg-rose-955/20 border border-rose-900/30 text-rose-500' :
                                'bg-zinc-800 border border-zinc-700 text-zinc-400'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aptitude Results Details */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block">Diagnostic Aptitude Reports</span>
              {(() => {
                const studentTests = testResultsDb.filter(res => res.studentEmail?.toLowerCase() === viewingStudent.email?.toLowerCase());
                if (studentTests.length === 0) {
                  return (
                    <div className="p-5 bg-zinc-950/30 border border-zinc-850/60 rounded-xl text-center text-zinc-650 italic text-[10px]">
                      No aptitude assessment reports logged.
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {studentTests.map(res => (
                      <div key={res.id} className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                          <div>
                            <span className="text-[8px] bg-brand text-zinc-955 px-2 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                              Dominant: {res.dominantDomain}
                            </span>
                            <span className="text-zinc-500 text-[9px] font-bold block mt-1 uppercase font-mono">Date Completed: {res.date}</span>
                          </div>
                          <button
                            onClick={() => handleExportAptitudeResults(res)}
                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-brand rounded font-black uppercase text-[8px] tracking-wider cursor-pointer border-none"
                          >
                            Copy Report
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                          {Object.entries(res.scores || {}).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-zinc-400 capitalize">{key}</span>
                                <span className="text-brand font-mono">{val}%</span>
                              </div>
                              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                                <div 
                                  className="bg-brand h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${val}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center border-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PSYCHOLOGIST VIEW DETAILS MODAL */}
      {viewingPsychologist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setViewingPsychologist(null)}
          />
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-header flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand" /> Psychologist Profile Details
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1">Credentials, availability, rates, and booking history logs.</p>
              </div>
              <button 
                onClick={() => setViewingPsychologist(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const profileKey = `behold_advisor_profile_${viewingPsychologist.id}`;
              const profileData = JSON.parse(localStorage.getItem(profileKey) || '{}');
              const education = profileData.education || viewingPsychologist.education || 'MPhil Clinical Psychology';
              const specialties = profileData.specialties || viewingPsychologist.specialties || 'Anxiety, Stress Management, Mood Disorders';
              const price = profileData.price || viewingPsychologist.price || 1200;
              const lang = profileData.lang || viewingPsychologist.lang || 'English, Malayalam';
              const bio = profileData.bio || viewingPsychologist.bio || 'Professional clinical therapist committed to student wellbeing.';

              return (
                <div className="space-y-6">
                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Professional Info */}
                    <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-3.5 text-xs">
                      <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block font-mono">Advisor Credentials</span>
                      <div className="space-y-2.5">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Full Name</span>
                          <span className="font-bold text-white">{viewingPsychologist.name}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Email Address</span>
                          <span className="font-semibold text-zinc-300">{viewingPsychologist.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Education Qualification</span>
                          <span className="font-bold text-zinc-350">{education}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Consultation Fee</span>
                          <span className="font-black text-brand">₹{price} / hour</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase">Languages Spoken</span>
                          <span className="font-medium text-zinc-300">{lang}</span>
                        </div>
                        <div className="flex gap-2 items-center pt-1">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            viewingPsychologist.verified
                              ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
                              : 'bg-amber-955/20 border border-amber-900/30 text-amber-500'
                          }`}>
                            {viewingPsychologist.verified ? 'Verified' : 'Pending Verification'}
                          </span>
                          <a
                            href={`#/advisor/${viewingPsychologist.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 hover:text-brand rounded text-[8px] font-black uppercase tracking-widest transition"
                          >
                            Preview Profile
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Availability */}
                    <div className="space-y-4">
                      {/* Bio */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2 text-xs">
                        <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block font-mono">Therapist Bio</span>
                        <p className="text-zinc-300 leading-relaxed italic text-[11px]">
                          "{bio}"
                        </p>
                      </div>

                      {/* Specialties List */}
                      <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-4 space-y-2">
                        <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block font-mono">Areas of Expertise</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {specialties.split(',').map(spec => (
                            <span 
                              key={spec.trim()} 
                              className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[8.5px] font-bold text-zinc-400 uppercase tracking-wide"
                            >
                              {spec.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consult bookings count */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-black text-zinc-500 block font-mono">Consultation Schedule History</span>
                      <span className="text-[9.5px] text-brand font-bold uppercase tracking-wider font-mono">
                        {bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase())).length} consultations booked
                      </span>
                    </div>

                    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
                      <table className="w-full text-[10px] border-collapse text-left">
                        <thead>
                          <tr className="bg-zinc-900/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-855">
                            <th className="p-2.5">Client Student</th>
                            <th className="p-2.5">Date & Time</th>
                            <th className="p-2.5">Type & Mode</th>
                            <th className="p-2.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const psyBookings = bookingsDb.filter(b => b.advisorId === viewingPsychologist.id || (b.advisorName && b.advisorName.toLowerCase() === viewingPsychologist.name.toLowerCase()));
                            if (psyBookings.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-zinc-650 italic">No scheduled slot logs.</td>
                                </tr>
                              );
                            }
                            return psyBookings.map(b => {
                              const student = usersDb.find(u => u.id === b.userId);
                              return (
                                <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
                                  <td className="p-2.5">
                                    <span className="text-white block font-semibold">{student ? student.name : 'Unknown Student'}</span>
                                    <span className="text-zinc-500 text-[8.5px] truncate block max-w-[150px]">{student ? student.email : ''}</span>
                                  </td>
                                  <td className="p-2.5">
                                    <span className="text-zinc-300 block font-semibold">{b.date}</span>
                                    <span className="text-zinc-500 text-[8.5px]">{b.time}</span>
                                  </td>
                                  <td className="p-2.5 text-zinc-400 capitalize font-medium">
                                    {b.service === 'counselling' ? 'Wellbeing' : 'Career'} ({b.mode})
                                  </td>
                                  <td className="p-2.5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                      b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
                                      b.status === 'COMPLETED' ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450' :
                                      b.status === 'CANCELLED' ? 'bg-rose-955/20 border border-rose-900/30 text-rose-500' :
                                      'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                    }`}>
                                      {b.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingPsychologist(null)}
                className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center border-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-ADMIN EDIT PERMISSIONS MODAL */}
      {editingSubAdmin && (() => {
        const { cleanName, roleTitle } = parseStaffDetails(editingSubAdmin);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
              onClick={() => setEditingSubAdmin(null)}
            />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-header flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand" /> Edit Access Scopes
                </h3>
                <p className="text-[10px] text-zinc-500 leading-none mt-1">
                  Modify permission scopes for sub-admin: <span className="text-zinc-300 font-bold">{cleanName}</span> {roleTitle && <span className="text-brand font-semibold font-mono text-[9px] uppercase ml-1">({roleTitle})</span>}
                </p>
              </div>

              <form onSubmit={handleSaveSubAdminPermissions} className="space-y-5 font-medium">
                <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Assigned Scopes</label>
                  
                  <div className="space-y-2.5">
                    {/* MANAGE_USERS */}
                    <label className="flex items-start gap-3 p-3 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 rounded-xl cursor-pointer transition-colors select-none">
                      <input 
                        type="checkbox" 
                        checked={editPermissions.MANAGE_USERS}
                        onChange={(e) => setEditPermissions({ ...editPermissions, MANAGE_USERS: e.target.checked })}
                        className="mt-0.5 accent-brand rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-white block">Students Registry</span>
                        <span className="text-[9.5px] text-zinc-500 leading-tight block mt-0.5">
                          Permission to view, add, modify details, and toggle suspension status on students.
                        </span>
                      </div>
                    </label>

                    {/* MANAGE_PSYCHOLOGISTS */}
                    <label className="flex items-start gap-3 p-3 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 rounded-xl cursor-pointer transition-colors select-none">
                      <input 
                        type="checkbox" 
                        checked={editPermissions.MANAGE_PSYCHOLOGISTS}
                        onChange={(e) => setEditPermissions({ ...editPermissions, MANAGE_PSYCHOLOGISTS: e.target.checked })}
                        className="mt-0.5 accent-brand rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-white block">Psychologists Registry</span>
                        <span className="text-[9.5px] text-zinc-500 leading-tight block mt-0.5">
                          Permission to register profiles, edit credentials, and toggle staff verification status.
                        </span>
                      </div>
                    </label>

                    {/* MANAGE_BOOKINGS */}
                    <label className="flex items-start gap-3 p-3 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-850 rounded-xl cursor-pointer transition-colors select-none">
                      <input 
                        type="checkbox" 
                        checked={editPermissions.MANAGE_BOOKINGS}
                        onChange={(e) => setEditPermissions({ ...editPermissions, MANAGE_BOOKINGS: e.target.checked })}
                        className="mt-0.5 accent-brand rounded cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-white block">Consultation Bookings</span>
                        <span className="text-[9.5px] text-zinc-555 leading-tight block mt-0.5">
                          Permission to schedule new appointments, update slots/meet links, and manage statuses.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {editSubAdminError && (
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide font-mono">{editSubAdminError}</p>
                )}

                {editSubAdminSuccess && (
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wide">{editSubAdminSuccess}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSubAdmin(null)}
                    className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
                  >
                    Save Scopes
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ── PROFILE DRAWER ──────────────────────────────────────────── */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsProfileDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="w-80 bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-header">My Profile</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Administrator Account</p>
              </div>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + Name */}
            {(() => {
              const { cleanName, roleTitle } = parseStaffDetails(user);
              return (
                <div className="px-6 py-6 flex flex-col items-center text-center space-y-3 border-b border-zinc-800">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-black text-2xl shadow-xl">
                    {(cleanName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white uppercase tracking-wide font-header">{cleanName}</h2>
                    <span className={`inline-block mt-1 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${
                      isSuperAdmin
                        ? 'bg-brand/15 border border-brand/30 text-brand'
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                    }`}>
                      {isSuperAdmin ? '⭐ Super Admin' : `🔐 ${roleTitle || 'Sub Admin'}`}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Profile Details */}
            <div className="px-6 py-5 space-y-4 flex-1">
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Account Information</p>

                <div className="bg-zinc-950/60 rounded-xl p-4 space-y-3 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Email</p>
                      <p className="text-xs text-white font-semibold truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Security Level</p>
                      <p className="text-xs text-white font-semibold">{isSuperAdmin ? 'Root Administrator' : 'Scoped Staff Member'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-brand" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider text-zinc-500">Account ID</p>
                      <p className="text-[10px] text-zinc-400 font-mono truncate">{user.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions (sub-admin) */}
              {!isSuperAdmin && user.permissions && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Assigned Permissions</p>
                  <div className="space-y-2">
                    {user.permissions.map(p => (
                      <div key={p} className="flex items-center gap-2 bg-zinc-950/60 rounded-lg px-3 py-2 border border-zinc-800">
                        <Check className="w-3 h-3 text-brand shrink-0" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                          {p.replace('MANAGE_', '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats (super admin) */}
              {isSuperAdmin && (
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">System Overview</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-black text-brand">{usersDb.filter(u => u.role === 'USER' || !u.role).length}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Students</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-black text-brand">{usersDb.filter(u => u.role === 'PSYCHOLOGIST').length}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Advisors</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-black text-brand">{bookingsDb.length}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Bookings</p>
                    </div>
                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800 text-center">
                      <p className="text-lg font-black text-brand">{inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).length}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Pending</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-5 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => { setIsProfileDrawerOpen(false); setIsLogoutConfirmOpen(true); }}
                className="w-full py-2.5 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-bold text-[9px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLE DELETION CONFIRMATION ──────────────────────────────── */}
      {roleToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-955/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setRoleToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-header">
                  Delete Role Title?
                </h3>
                <p className="text-[11px] text-zinc-350 leading-relaxed">
                  Are you sure you want to delete the role <span className="text-white font-bold font-mono">"{roleToDelete.name}"</span>?
                </p>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                  Existing sub-admins assigned to this role will keep their current permissions, but the role option will be removed from registration and cannot be selected anymore.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="flex-1 py-2.5 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteRole(roleToDelete.id)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg cursor-pointer transition border-none shadow-md"
              >
                Confirm Delete
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
