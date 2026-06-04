import React, { useState, useEffect } from 'react';
import { 
  User, ShieldAlert, Award, Trash, Check, Plus, Lock, 
  Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck,
  Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus,
  MessageSquare, FileSpreadsheet, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    roleName: 'HR Coordinator'
  });
  const [selectedPermissions, setSelectedPermissions] = useState({
    MANAGE_USERS: true,
    MANAGE_PSYCHOLOGISTS: false,
    MANAGE_BOOKINGS: true
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
    education: 'MPhil Clinical Psychology',
    specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
    price: 1250,
    lang: 'Malayalam, English',
    bio: ''
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
    time: '09:30 AM',
    meetLink: '',
    status: 'CONFIRMED'
  });
  const [bookingFormError, setBookingFormError] = useState('');
  const [bookingFormSuccess, setBookingFormSuccess] = useState('');

  const [searchBooking, setSearchBooking] = useState('');

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
  };

  useEffect(() => {
    reloadData();
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
      bio: psyForm.bio || ''
    };
    localStorage.setItem(`behold_advisor_profile_${psyId}`, JSON.stringify(newProfile));

    setPsyFormSuccess("Psychologist added successfully!");
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
    reloadData();
    setTimeout(() => {
      setIsAddPsyOpen(false);
      setPsyFormSuccess('');
    }, 1500);
  };

  const handleOpenEditPsy = (psy) => {
    const saved = localStorage.getItem(`behold_advisor_profile_${psy.id}`);
    let profileDetails = {
      education: 'MPhil Clinical Psychology',
      specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
      price: 1250,
      lang: 'Malayalam, English',
      bio: ''
    };
    if (saved) {
      try {
        profileDetails = JSON.parse(saved);
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
      bio: profileDetails.bio || ''
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
    const updatedProfile = {
      name: psyForm.name.trim(),
      role: 'Consultant Psychologist',
      education: psyForm.education,
      specialties: psyForm.specialties,
      price: Number(psyForm.price) || 1200,
      lang: psyForm.lang,
      bio: psyForm.bio
    };
    localStorage.setItem(`behold_advisor_profile_${psyForm.id}`, JSON.stringify(updatedProfile));

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

    if (!bookingForm.userId || !bookingForm.advisorId || !bookingForm.date) {
      setBookingFormError("Student, Psychologist and Date are required.");
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        psyRole = parsed.role || psyRole;
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
      advisorName: psy.name,
      advisorRole: psyRole,
      status: bookingForm.status || 'CONFIRMED',
      meetLink: bookingForm.meetLink.trim()
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
      time: '09:30 AM',
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
      advisorId: advisorUser?.id || '',
      service: booking.service || 'counselling',
      mode: booking.mode || 'ONLINE',
      date: booking.date || '',
      time: booking.time || '09:30 AM',
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

    if (!bookingForm.date) {
      setBookingFormError("Date is required.");
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

    const permissionsArray = Object.keys(selectedPermissions).filter(p => selectedPermissions[p]);
    if (permissionsArray.length === 0) {
      setSubAdminError("Please select at least one permission scope.");
      setIsRegistering(false);
      return;
    }

    try {
      const fullName = `${subAdminForm.name} (${subAdminForm.roleName})`;
      await register(fullName, subAdminForm.email, subAdminForm.password, 'ADMIN', permissionsArray);
      
      setSubAdminSuccess(`Sub-admin account for ${subAdminForm.name} created successfully!`);
      setSubAdminForm({
        name: '',
        email: '',
        password: '',
        roleName: 'HR Coordinator'
      });
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans text-left flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Left Fixed Sidebar */}
      <div className="w-full lg:w-64 bg-zinc-900 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 relative z-20">
        <div className="space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <span className="font-header font-black text-lg tracking-tighter text-white">
              BEHOLD<span className="text-brand font-black">.</span>
            </span>
            <span className="text-[8px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              CONSOLE
            </span>
          </div>

          {/* User profile details */}
          <div className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 text-brand flex items-center justify-center font-header font-black text-sm border border-zinc-800">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight uppercase">
                {user.name}
              </h4>
              <span className="text-[8px] text-zinc-550 font-black tracking-wider uppercase">
                {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {isSuperAdmin && (
              <button
                onClick={() => setCurrentSection('overview')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'overview'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </button>
            )}

            {hasUserPermission && (
              <button
                onClick={() => setCurrentSection('users')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'users'
                    ? 'bg-brand text-zinc-950 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Student Database</span>
              </button>
            )}

            {hasPsyPermission && (
              <button
                onClick={() => setCurrentSection('psychologists')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'psychologists'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Psychologists DB</span>
              </button>
            )}

            {hasBookingPermission && (
              <button
                onClick={() => setCurrentSection('bookings')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                  currentSection === 'bookings'
                    ? 'bg-brand text-zinc-955 font-black'
                    : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Client Bookings</span>
              </button>
            )}

            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setCurrentSection('subadmins')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'subadmins'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Roles & Scopes</span>
                </button>

                <button
                  onClick={() => setCurrentSection('inquiries')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'inquiries'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Student Inquiries</span>
                </button>

                <button
                  onClick={() => setCurrentSection('testresults')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'testresults'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Aptitude Results</span>
                </button>

                <button
                  onClick={() => setCurrentSection('faqs')}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer border-none ${
                    currentSection === 'faqs'
                      ? 'bg-brand text-zinc-955 font-black'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>FAQ Manager</span>
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
            onClick={() => {
              logout();
              window.location.hash = '#/';
            }}
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
          {currentSection === 'overview' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Super Admin Command Center</h3>
                <span className="text-[8px] bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono">SYSTEM ROOT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-2">
                  <h4 className="font-header font-black text-zinc-400 uppercase tracking-wider">Sub-Admin Accounts</h4>
                  <p className="text-2xl font-black text-white">{subAdminsList.length}</p>
                  <span className="text-[8px] text-zinc-500 block font-semibold">Active staff with custom scopes</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-2">
                  <h4 className="font-header font-black text-zinc-400 uppercase tracking-wider">Total System Users</h4>
                  <p className="text-2xl font-black text-white">{usersDb.length}</p>
                  <span className="text-[8px] text-zinc-500 block font-semibold">Aggregate students and psychologists</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-2">
                  <h4 className="font-header font-black text-zinc-400 uppercase tracking-wider">Consultations Scheduled</h4>
                  <p className="text-2xl font-black text-white">{bookingsDb.length}</p>
                  <span className="text-[8px] text-zinc-500 block font-semibold">Total booked consultation slots</span>
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
                        <th className="p-3 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subAdminsList.map(admin => (
                        <tr key={admin.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-white">{admin.name}</td>
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
                              onClick={() => handleDeleteUser(admin.id)}
                              className="p-1.5 bg-rose-950/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                              title="Delete sub-admin account"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {subAdminsList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-5 text-center text-zinc-500 italic">No sub-admin accounts registered. Create accounts inside the "Roles & Scopes" tab.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {currentSection === 'users' && hasUserPermission && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Students Directory</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Register new student accounts, edit profiles, or terminate access</p>
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
                        <td className="p-3 text-center font-bold text-zinc-300">
                          {bookingsDb.filter(b => b.userId === student.id).length} Booked
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
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
                        <td colSpan={4} className="p-8 text-center text-zinc-500 italic">No student registries match the active query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-[9px] font-black uppercase font-mono">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                          </span>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-2">
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
                <p className="text-[10px] text-zinc-500 font-medium pt-1">Create sub-admin staff with custom database scopes</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Registration form */}
                <form onSubmit={handleCreateSubAdmin} className="lg:col-span-7 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4">
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
                        onChange={(e) => setSubAdminForm({ ...subAdminForm, roleName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="HR Coordinator">HR Coordinator</option>
                        <option value="State Coordinator">State Coordinator</option>
                        <option value="Finance Auditor">Finance Auditor</option>
                        <option value="Scheduler">Scheduler</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        required
                        placeholder="sandra@behold.com"
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

                {/* Scope selector */}
                <div className="lg:col-span-5 border border-zinc-850 p-5 rounded-xl bg-zinc-950/40 space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-brand" /> Assign Scope Permissions
                  </div>

                  <div className="space-y-3">
                    <div 
                      onClick={() => togglePermission('MANAGE_USERS')}
                      className={`p-3.5 border rounded-lg cursor-pointer transition flex items-center justify-between ${
                        selectedPermissions.MANAGE_USERS 
                          ? 'border-brand bg-brand/5' 
                          : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white block uppercase text-[10px]">Manage Students</span>
                        <span className="text-[9px] text-zinc-500 font-medium">List, search, delete student directory.</span>
                      </div>
                      <div className={`w-4 h-4 rounded border transition flex items-center justify-center shrink-0 ml-2 ${
                        selectedPermissions.MANAGE_USERS ? 'border-brand bg-brand' : 'border-zinc-800'
                      }`}>
                        {selectedPermissions.MANAGE_USERS && <Check className="w-3 h-3 text-zinc-950" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => togglePermission('MANAGE_PSYCHOLOGISTS')}
                      className={`p-3.5 border rounded-lg cursor-pointer transition flex items-center justify-between ${
                        selectedPermissions.MANAGE_PSYCHOLOGISTS 
                          ? 'border-brand bg-brand/5' 
                          : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white block uppercase text-[10px]">Manage Psychologists</span>
                        <span className="text-[9px] text-zinc-500 font-medium">Configure credentials, verify/unverify accounts.</span>
                      </div>
                      <div className={`w-4 h-4 rounded border transition flex items-center justify-center shrink-0 ml-2 ${
                        selectedPermissions.MANAGE_PSYCHOLOGISTS ? 'border-brand bg-brand' : 'border-zinc-800'
                      }`}>
                        {selectedPermissions.MANAGE_PSYCHOLOGISTS && <Check className="w-3 h-3 text-zinc-955" />}
                      </div>
                    </div>

                    <div 
                      onClick={() => togglePermission('MANAGE_BOOKINGS')}
                      className={`p-3.5 border rounded-lg cursor-pointer transition flex items-center justify-between ${
                        selectedPermissions.MANAGE_BOOKINGS 
                          ? 'border-brand bg-brand/5' 
                          : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/20'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white block uppercase text-[10px]">Manage Bookings</span>
                        <span className="text-[9px] text-zinc-500 font-medium">Monitor and reschedule session bookings.</span>
                      </div>
                      <div className={`w-4 h-4 rounded border transition flex items-center justify-center shrink-0 ml-2 ${
                        selectedPermissions.MANAGE_BOOKINGS ? 'border-brand bg-brand' : 'border-zinc-800'
                      }`}>
                        {selectedPermissions.MANAGE_BOOKINGS && <Check className="w-3 h-3 text-zinc-955" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT BOOKINGS DIRECTORY */}
          {currentSection === 'bookings' && hasBookingPermission && (
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
                      setBookingForm({
                        id: '',
                        userId: firstStudent?.id || '',
                        advisorId: firstPsy?.id || '',
                        service: 'counselling',
                        mode: 'ONLINE',
                        date: new Date().toISOString().split('T')[0],
                        time: '09:30 AM',
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

              <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-850 text-left">
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
                    {bookingsDb
                      .filter(b => 
                        b.userName.toLowerCase().includes(searchBooking.toLowerCase()) || 
                        b.advisorName.toLowerCase().includes(searchBooking.toLowerCase()) ||
                        b.status.toLowerCase().includes(searchBooking.toLowerCase())
                      )
                      .map(booking => (
                        <tr key={booking.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
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
                    {bookingsDb.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500 italic">No bookings scheduled in the system yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: STUDENT INQUIRIES & LEADS */}
          {currentSection === 'inquiries' && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white font-header">Student Inquiries & Leads</h3>
                  <p className="text-[10px] text-zinc-500 font-medium pt-1">Review contact requests submitted from the landing page</p>
                </div>
                <div className="relative w-full sm:max-w-[240px]">
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

              <div className="space-y-4">
                {filteredInquiries.map((inq) => (
                  <div 
                    key={inq.id}
                    className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-450'
                            : 'bg-amber-955/30 border border-amber-900/40 text-amber-500'
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
                    </div>

                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleResolveInquiry(inq.id)}
                        className={`px-4.5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition cursor-pointer flex items-center gap-1 border border-zinc-800 ${
                          inq.status === 'RESOLVED'
                            ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                            : 'bg-brand hover:bg-brand-dark text-zinc-950'
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

                      <div className="space-y-2 border-t border-zinc-850 pt-3">
                        <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-500 block">Cognitive Profile Breakdown</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {Object.entries(res.scores || {}).map(([key, val]) => (
                            <div key={key} className="bg-zinc-900 p-2 rounded border border-zinc-850 flex justify-between items-center font-bold">
                              <span className="text-zinc-400 capitalize">{key}</span>
                              <span className="text-white">{val}%</span>
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
                    placeholder="e.g. Muhammed Niyas"
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
                    placeholder="niyas@behold.com"
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
                  onChange={(e) => setBookingForm({ ...bookingForm, advisorId: e.target.value })}
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
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
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

    </div>
  );
}
