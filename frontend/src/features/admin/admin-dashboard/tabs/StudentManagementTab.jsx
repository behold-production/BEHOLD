import React, { useState, useRef } from 'react';
import ApiService from '../../../../shared/services/api';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';

export default function StudentManagementTab(props) {
 
  const { usersDb, bookingsDb, reloadData, isSuperAdmin, hasUserPermission, getInitials, showAlert, showConfirm, showPrompt, handleExportPDF, handleExportImage, canAddStudents, canEditStudents, canDeleteStudents, isDbLoading } = props;

  const [searchUser, setSearchUser] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '', profilePic: '', locationName: '', latitude: 0, longitude: 0 });
  const [userFormError, setUserFormError] = useState('');
  const [userFormSuccess, setUserFormSuccess] = useState('');
  const [userProfilePicFile, setUserProfilePicFile] = useState(null);
  const [isUserPicUploading, setIsUserPicUploading] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  
  const [viewingStudent, setViewingStudent] = useState(null);
  const [adminCigiDate, setAdminCigiDate] = useState('');
  const [adminCigiTime, setAdminCigiTime] = useState('');
  const [adminCigiNote, setAdminCigiNote] = useState('');
  const [adminCigiEditingId, setAdminCigiEditingId] = useState(null);
  const [adminCigiFile, setAdminCigiFile] = useState(null);
  const [isAdminCigiUploading, setIsAdminCigiUploading] = useState(false);
  const adminCigiFileInputRef = useRef(null);
  const userProfilePicRef = useRef(null);
  const [isAdminUserLocating, setIsAdminUserLocating] = useState(false);
  const [adminUserSearchQuery, setAdminUserSearchQuery] = useState('');
  const [adminUserSearchResults, setAdminUserSearchResults] = useState([]);

  // Filter students based on search query
  const studentsList = usersDb.filter(u => {
    if (u.role === 'SUPER_ADMIN') return false;
    const matchesSearch = !searchUser || 
      (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase())) || 
      (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase())) ||
      (u.id && u.id.toLowerCase().includes(searchUser.toLowerCase()));
    return matchesSearch;
  });

  const handleAdminUserDetectLocation = () => {
    // Mock implementation for now to prevent breaking
    showAlert("Location detection is currently unavailable in this context.");
  };

  const handleToggleStudentStatus = async (studentId, currentStatus) => {
    if (!hasUserPermission) {
      await showAlert("Access Denied: You do not have permission to manage students.");
      return;
    }
    const student = usersDb.find(u => u.id === studentId);
    if (!student) return;
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await ApiService.updateAdminUser(
        studentId,
        student.name,
        student.email,
        undefined,
        student.role,
        student.permissions,
        student.customRoleTitle,
        newStatus
      );
      reloadData();
    } catch (err) {
      await showAlert(err.message || "Failed to update status.");
    }
  };



const handleCreateUser = async (e) => {
 e.preventDefault();
 if (!hasUserPermission) {
 setUserFormError("Access Denied: You do not have permission to manage students.");
 return;
 }
 setUserFormError('');
 setUserFormSuccess('');

 if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password) {
 setUserFormError("All fields are required.");
 return;
 }

 setIsSavingForm(true);
 try {
 await ApiService.createAdminUser(
 userForm.name.trim(),
 userForm.email.trim(),
 userForm.password,
 'user',
 [],
 '',
 {
 phone: userForm.phone,
 schoolName: userForm.schoolName,
 grade: userForm.grade,
 guardianName: userForm.guardianName,
 guardianPhone: userForm.guardianPhone,
 groupCode: userForm.groupCode,
 locationName: userForm.locationName,
 latitude: userForm.latitude,
 longitude: userForm.longitude
 }
 );
 setUserFormSuccess("Student created successfully!");
 setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '', profilePic: '', locationName: '', latitude: 0, longitude: 0 });
 setUserProfilePicFile(null);
 reloadData();
 setTimeout(() => {
 setIsAddUserOpen(false);
 setUserFormSuccess('');
 }, 1500);
 } catch (err) {
 setUserFormError(err.message || "Failed to create user.");
 } finally {
 setIsSavingForm(false);
 }
 };

 const handleOpenAddUser = () => {
 setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '', profilePic: '', locationName: '', latitude: 0, longitude: 0 });
 setAdminUserSearchQuery('');
 setAdminUserSearchResults([]);
 setUserProfilePicFile(null);
 setUserFormError('');
 setUserFormSuccess('');
 setIsAddUserOpen(true);
 };

 const handleOpenEditUser = (student) => {
 setUserForm({
 id: student.id,
 name: student.name,
 email: student.email,
 password: student.password || '',
 phone: student.phone || '',
 schoolName: student.schoolName || '',
 grade: student.grade || '',
 guardianName: student.guardianName || '',
 guardianPhone: student.guardianPhone || '',
 groupCode: student.groupCode || '',
 profilePic: student.profilePic || student.image || '',
 locationName: student.locationName || '',
 latitude: student.latitude || 0,
 longitude: student.longitude || 0
 });
 setUserProfilePicFile(null);
 setUserFormError('');
 setUserFormSuccess('');
 setIsEditUserOpen(true);
 };

 const handleUpdateUser = async (e) => {
 e.preventDefault();
 if (!hasUserPermission) {
 setUserFormError("Access Denied: You do not have permission to manage students.");
 return;
 }
 setUserFormError('');
 setUserFormSuccess('');

 if (!userForm.name.trim() || !userForm.email.trim()) {
 setUserFormError("Name and Email are required.");
 return;
 }

 setIsSavingForm(true);
 try {
 await ApiService.updateAdminUser(
 userForm.id,
 userForm.name.trim(),
 userForm.email.trim(),
 userForm.password || undefined,
 undefined,
 undefined,
 undefined,
 undefined,
 {
 phone: userForm.phone,
 schoolName: userForm.schoolName,
 grade: userForm.grade,
 guardianName: userForm.guardianName,
 guardianPhone: userForm.guardianPhone,
 groupCode: userForm.groupCode,
 locationName: userForm.locationName,
 latitude: userForm.latitude,
 longitude: userForm.longitude
 }
 );
 if (userProfilePicFile) {
 setIsUserPicUploading(true);
 const fd = new FormData();
 fd.append('profilePic', userProfilePicFile);
 await ApiService.adminUpdateUserProfilePic(userForm.id, fd);
 setIsUserPicUploading(false);
 }
 setUserFormSuccess("Student details updated!");
 setUserProfilePicFile(null);
 reloadData();
 setTimeout(() => {
 setIsEditUserOpen(false);
 setUserFormSuccess('');
 }, 1500);
 } catch (err) {
 setIsUserPicUploading(false);
 setUserFormError(err.message || "Failed to update user.");
 } finally {
 setIsSavingForm(false);
 }
 };

 const handleDeleteUser = async (userId) => {
 if (!hasUserPermission) {
 await showAlert("Access Denied: You do not have permission to manage students.");
 return;
 }
 if (!await showConfirm("Are you sure you want to delete this account?")) return;
 try {
 await ApiService.deleteAdminUser(userId);
 reloadData();
 } catch (err) {
 await showAlert(err.message || "Failed to delete user.");
 }
 };

 const handleGenerateResetToken = async (email) => {
 try {
 const res = await ApiService.request('/auth/forgot-password', {
 method: 'POST',
 body: JSON.stringify({ email })
 });
 if (res.success && res.resetToken) {
 const link = window.location.origin + '/reset-password?token=' + res.resetToken;
 await showPrompt("Password reset link generated. Copy it below to share:", link);
 } else {
 await showAlert(res.message || "Failed to generate token.");
 }
 } catch (err) {
 await showAlert(err.message || "An error occurred.");
 }
 };

const handleAdminCigiUpload = async (e) => {
 e.preventDefault();
 if (!viewingStudent) return;
 if (!adminCigiFile && !adminCigiEditingId) {
 await showAlert('Please select a file to upload');
 return;
 }

 if (adminCigiFile) {
 const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
 const fileExt = adminCigiFile.name.split('.').pop().toLowerCase();
 if (!allowedExtensions.includes(fileExt)) {
 await showAlert('Only JPG, JPEG, PNG, and PDF files are allowed.');
 return;
 }
 }

 setIsAdminCigiUploading(true);
 try {
 const formData = new FormData();
 if (adminCigiFile) {
 formData.append('file', adminCigiFile);
 }
 formData.append('testDate', adminCigiDate);
 formData.append('testTime', adminCigiTime);
 formData.append('note', adminCigiNote);

 let res;
 if (adminCigiEditingId) {
 res = await ApiService.adminUpdateCigiResult(viewingStudent.id, adminCigiEditingId, formData);
 } else {
 res = await ApiService.adminUploadCigiResult(viewingStudent.id, formData);
 }

 if (res.success) {
 await showAlert(adminCigiEditingId ? 'CIGI result updated successfully' : 'CIGI result uploaded successfully');

 // Update local database list
 const updatedUser = res.data;
 setUsersDb(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));

 // Update modal state
 setViewingStudent(prev => prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev);

 // Reset inputs
 setAdminCigiFile(null);
 setAdminCigiDate('');
 setAdminCigiTime('');
 setAdminCigiNote('');
 setAdminCigiEditingId(null);
 if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
 }
 } catch (err) {
 await showAlert(err.message || 'Failed to manage CIGI result');
 } finally {
 setIsAdminCigiUploading(false);
 }
 };

 const handleAdminCigiDelete = async (resultId) => {
 if (!viewingStudent) return;
 if (!await showConfirm('Are you sure you want to delete this CIGI result?')) return;
 try {
 const res = await ApiService.adminDeleteCigiResult(viewingStudent.id, resultId);
 if (res.success) {
 await showAlert('CIGI result deleted successfully');
 const updatedUser = res.data;
 setUsersDb(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
 setViewingStudent(prev => prev && prev.id === updatedUser.id ? { ...prev, ...updatedUser } : prev);
 }
 } catch (err) {
 await showAlert(err.message || 'Failed to delete CIGI result');
 }
 };

 const handleAdminStartEditCigi = (result) => {
 setAdminCigiEditingId(result.id);
 setAdminCigiDate(result.testDate || '');
 setAdminCigiTime(result.testTime || '');
 setAdminCigiNote(result.note || '');
 setAdminCigiFile(null);
 if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
 };

 const handleAdminCancelEditCigi = () => {
 setAdminCigiEditingId(null);
 setAdminCigiDate('');
 setAdminCigiTime('');
 setAdminCigiNote('');
 setAdminCigiFile(null);
 if (adminCigiFileInputRef.current) adminCigiFileInputRef.current.value = '';
 };




 const handleExportStudentsCSV = async () => {
 const headers = "ID,Name,Email,Status,BookingsCount\n";
 const rows = studentsList.map(s => {
 const count = bookingsDb.filter(b => b.userId === s.id).length;
 return `"${s.id}","${s.name}","${s.email}","${s.status || 'ACTIVE'}",${count}`;
 }).join('\n');
 navigator.clipboard.writeText(headers + rows);
 await showAlert("Student directory CSV copied to clipboard!");
 };

 return (
 <div className="space-y-6 animate-in fade-in duration-200 text-sm">
 <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h3 className="text-sm font-bold text-white font-header">Students Directory</h3>
 <p className="text-sm text-zinc-500 font-medium pt-1">Register new student accounts, edit profiles, suspend/unsuspend access</p>
 </div>
 <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
 <div className="relative w-full sm:max-w-[200px]">
 <input
 type="text"
 placeholder="Search students..."
 value={searchUser}
 onChange={(e) => setSearchUser(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
 />
 <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
 </div>
 <button
 onClick={handleExportStudentsCSV}
 className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-full transition-colors cursor-pointer shrink-0"
 >
 Export CSV
 </button>
 <button onClick={() => handleExportPDF('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer shrink-0">
 Export PDF
 </button>
 <button onClick={() => handleExportImage('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer shrink-0">
 Export Image
 </button>
 {canAddStudents && (
 <button
 onClick={handleOpenAddUser}
 className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-sm font-bold rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
 >
 <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Student
 </button>
 )}
 </div>
 </div>

 <div className="border-0 sm:border border-zinc-850 rounded-none sm:rounded-lg overflow-hidden bg-transparent sm:bg-zinc-950">
 <div className="overflow-x-auto w-full">
 <table id="students-table" className="w-full text-sm border-collapse min-w-[700px]">
 <thead>
 <tr className="bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-850 text-left">
 <th className="p-3 whitespace-nowrap">Student Name</th>
 <th className="p-3 whitespace-nowrap">Email Address</th>
 <th className="p-3 text-center whitespace-nowrap">Status</th>
 <th className="p-3 text-center whitespace-nowrap">Consultations</th>
 <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
 </tr>
 </thead>
 <tbody>
 {isDbLoading ? (
 <SkeletonTableRows cols={5} />
 ) : studentsList.length === 0 ? (
 <tr>
 <td colSpan={5} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No student registries match the active query.</td>
 </tr>
 ) : (
 studentsList.slice((studentPage - 1) * studentLimit, studentPage * studentLimit).map(student => (
 <tr key={student.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
 <td className="p-3 whitespace-nowrap">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
 {student.profilePic || student.image ? (
 <img src={student.profilePic || student.image} alt={student.name} className="w-full h-full object-cover" />
 ) : (
 getInitials(student.name)
 )}
 </div>
 <div>
 <span className="font-bold text-white block leading-tight">{student.name}</span>
 <span className="text-sm text-zinc-500 break-all">ID: {student.id}</span>
 </div>
 </div>
 </td>
 <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{student.email}</td>
 <td className="p-3 text-center whitespace-nowrap">
 <button
 onClick={() => handleToggleStudentStatus(student.id, student.status || 'ACTIVE')}
 className={`px-2 py-0.5 rounded text-sm font-bold transition cursor-pointer border ${(student.status || 'ACTIVE') === 'ACTIVE'
 ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450 hover:bg-rose-955/20 hover:border-rose-900 hover:text-rose-500'
 : 'bg-rose-955/20 border-rose-900/40 text-rose-500 hover:bg-emerald-955/20 hover:border-emerald-900 hover:text-emerald-450'
 }`}
 title={(student.status || 'ACTIVE') === 'ACTIVE' ? "Click to Suspend Student" : "Click to Unsuspend Student"}
 >
 {student.status || 'ACTIVE'}
 </button>
 </td>
 <td className="p-3 text-center font-bold text-zinc-300 whitespace-nowrap">
 {bookingsDb.filter(b => b.userId === student.id).length} Booked
 </td>
 <td className="p-3 whitespace-nowrap">
 <div className="flex items-center justify-center gap-2">
 <button
 onClick={() => setViewingStudent(student)}
 className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold "
 >
 Details
 </button>
 {canEditStudents && (
 <button
 onClick={() => handleOpenEditUser(student)}
 className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
 title="Edit Student"
 >
 <Edit className="w-3.5 h-3.5" />
 </button>
 )}
 {canEditStudents && (
 <button
 onClick={() => handleGenerateResetToken(student.email)}
 className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer"
 title="Generate Password Reset Link"
 >
 <KeyRound className="w-3.5 h-3.5" />
 </button>
 )}
 {canDeleteStudents && (
 <button
 onClick={() => handleDeleteUser(student.id)}
 className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
 title="Delete Student"
 >
 <Trash className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 <PaginationBar
 total={studentsList.length}
 page={studentPage}
 limit={studentLimit}
 onPageChange={setStudentPage}
 onLimitChange={setStudentLimit}
 />
 

{(isAddUserOpen || isEditUserOpen) && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
 onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }}
 />
 <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
 <div>
 <h3 className="text-base font-bold text-white font-header">
 {isAddUserOpen ? 'Register Student' : 'Edit Student Details'}
 </h3>
 <p className="text-sm text-zinc-500 leading-none mt-1">
 {isAddUserOpen ? 'Provision a new student account.' : 'Modify account registry records.'}
 </p>
 </div>
 <form onSubmit={isAddUserOpen ? handleCreateUser : handleUpdateUser} className="space-y-4 font-medium">
 {isEditUserOpen && (
 <div className="space-y-2">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Profile Picture</label>
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-brand font-bold text-lg">
 {userProfilePicFile ? (
 <img src={URL.createObjectURL(userProfilePicFile)} alt="Preview" className="w-full h-full object-cover" />
 ) : userForm.profilePic ? (
 <img src={userForm.profilePic} alt="Profile" className="w-full h-full object-cover" />
 ) : (
 getInitials(userForm.name)
 )}
 </div>
 <div className="flex-1 space-y-1">
 <input ref={userProfilePicRef} type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUserProfilePicFile(file); }} />
 <button type="button" onClick={() => userProfilePicRef.current?.click()} className="px-3 py-2 text-xs font-bold bg-zinc-955 border border-zinc-800 hover:border-brand text-zinc-300 hover:text-white rounded-lg cursor-pointer transition bg-transparent">
 {userProfilePicFile ? 'Change Image' : 'Upload Photo'}
 </button>
 {userProfilePicFile && (<p className="text-xs text-zinc-500 truncate max-w-[180px]">{userProfilePicFile.name}</p>)}
 </div>
 </div>
 </div>
 )}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Full Name</label>
 <input type="text" required placeholder="e.g. John Doe" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Email Address</label>
 <input type="email" required placeholder="john@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 </div>
 <div className="space-y-1">
 <label className="text-sm font-bold text-zinc-400">
 Password {isEditUserOpen && <span className="text-zinc-500 lowercase font-normal">(leave blank to keep unchanged)</span>}
 </label>
 <input type="password" required={isAddUserOpen} placeholder={isEditUserOpen ? "••••••••" : "Enter password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 {isEditUserOpen && (
 <>
 <div className="border-t border-zinc-800 pt-3">
 <p className="text-xs font-bold text-zinc-500 tracking-widest mb-3">Student Information</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Phone Number</label>
 <input type="tel" placeholder="e.g. 9876543210" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Grade / Class</label>
 <input type="text" placeholder="e.g. Grade 10" value={userForm.grade} onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 <div className="sm:col-span-2 space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">School Name</label>
 <input type="text" placeholder="e.g. St. Mary's School" value={userForm.schoolName} onChange={(e) => setUserForm({ ...userForm, schoolName: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 </div>
 </div>
 <div className="border-t border-zinc-800 pt-3">
 <p className="text-xs font-bold text-zinc-500 tracking-widest mb-3">Guardian Information</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Guardian Name</label>
 <input type="text" placeholder="e.g. Mary Doe" value={userForm.guardianName} onChange={(e) => setUserForm({ ...userForm, guardianName: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Guardian Phone</label>
 <input type="tel" placeholder="e.g. 9876543211" value={userForm.guardianPhone} onChange={(e) => setUserForm({ ...userForm, guardianPhone: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Group / Batch Code</label>
 <input type="text" placeholder="e.g. CIGI-2024-A" value={userForm.groupCode} onChange={(e) => setUserForm({ ...userForm, groupCode: e.target.value })} className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors" />
 </div>
 </div>
 </div>

 <div className="border-t border-zinc-800 pt-3 text-left">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-bold text-zinc-500 tracking-widest">Home Location & Address</p>
 <button
 type="button"
 onClick={handleAdminUserDetectLocation}
 disabled={isAdminUserLocating}
 className="px-2 py-1 bg-zinc-950 border border-zinc-850 hover:border-brand text-zinc-300 hover:text-white rounded-full text-xs font-bold cursor-pointer transition flex items-center gap-1"
 >
 {isAdminUserLocating ? 'Locating...' : 'Detect GPS'}
 </button>
 </div>

 <div className="space-y-3.5">
 {/* Search Input */}
 <div className="space-y-1.5 relative">
 <label className="text-zinc-400 font-bold text-xs tracking-wide block">Search Location Address</label>
 <div className="flex flex-col sm:flex-row gap-2">
 <input
 type="text"
 placeholder="Type to search address... (e.g. Kozhikode, Kerala)"
 value={adminUserSearchQuery}
 onChange={(e) => setAdminUserSearchQuery(e.target.value)}
 className="flex-1 min-w-0 px-3 py-2 bg-zinc-955 border border-zinc-850 text-sm text-white rounded-lg outline-none focus:border-brand transition-colors"
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleAdminUserAddressSearch();
 }
 }}
 />
 <button
 type="button"
 onClick={handleAdminUserAddressSearch}
 disabled={isAdminUserSearching}
 className="w-full sm:w-auto px-3 py-2 bg-brand text-zinc-950 text-xs font-bold rounded-full hover:bg-brand-dark transition cursor-pointer border-none shrink-0 flex items-center justify-center"
 >
 {isAdminUserSearching ? 'Searching...' : 'Search'}
 </button>
 </div>

 {/* Search results dropdown */}
 {adminUserSearchResults.length > 0 && (
 <div className="absolute left-0 right-0 mt-1 bg-zinc-950 border border-zinc-850 rounded-lg max-h-40 overflow-y-auto z-50 shadow-xl divide-y divide-zinc-850">
 {adminUserSearchResults.map((res, index) => (
 <button
 key={index}
 type="button"
 onClick={() => {
 setUserForm({
 ...userForm,
 locationName: res.display_name,
 latitude: parseFloat(res.lat) || 0,
 longitude: parseFloat(res.lon) || 0
 });
 setAdminUserSearchQuery(res.display_name);
 setAdminUserSearchResults([]);
 }}
 className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-350 hover:text-white hover:bg-zinc-850 transition-colors block truncate border-none cursor-pointer"
 >
 {res.display_name}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Display / edit fields */}
 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Selected Address Name</label>
 <input
 type="text"
 placeholder="Address Name"
 value={userForm.locationName || ''}
 onChange={(e) => {
 setUserForm({ ...userForm, locationName: e.target.value });
 setAdminUserSearchQuery(e.target.value);
 }}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Latitude</label>
 <input
 type="number"
 step="any"
 placeholder="e.g. 11.2588"
 value={userForm.latitude || ''}
 onChange={(e) => setUserForm({ ...userForm, latitude: parseFloat(e.target.value) || 0 })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-zinc-400 font-bold text-xs tracking-wide">Longitude</label>
 <input
 type="number"
 step="any"
 placeholder="e.g. 75.7804"
 value={userForm.longitude || ''}
 onChange={(e) => setUserForm({ ...userForm, longitude: parseFloat(e.target.value) || 0 })}
 className="w-full px-3 py-2.5 bg-zinc-955 border border-zinc-855 focus:border-brand rounded-lg text-sm text-white outline-none transition-colors"
 />
 </div>
 </div>
 </div>
 </div>
 </>
 )}
 {userFormError && (<p className="text-sm text-rose-500 font-bold tracking-wide">{userFormError}</p>)}
 {userFormSuccess && (<p className="text-sm text-emerald-500 font-bold tracking-wide">{userFormSuccess}</p>)}
 {isUserPicUploading && (<p className="text-xs text-brand font-bold animate-pulse">Uploading profile picture...</p>)}
 <div className="flex gap-3 pt-2">
 <button type="button" onClick={() => { setIsAddUserOpen(false); setIsEditUserOpen(false); }} className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center bg-transparent">Cancel</button>
 <button
 type="submit"
 disabled={isSavingForm}
 className="flex-1 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm rounded-full cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSavingForm && <Loader2 className="w-4 h-4 animate-spin" />}
 {isAddUserOpen ? 'Create Account' : 'Save Changes'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

{viewingStudent && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div
 className="absolute inset-0 bg-zinc-955/80 backdrop-blur-xs animate-in fade-in duration-300"
 onClick={() => setViewingStudent(null)}
 />
 <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6 text-left text-white z-10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-lg bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
 {viewingStudent.profilePic || viewingStudent.image ? (
 <img src={viewingStudent.profilePic || viewingStudent.image} alt={viewingStudent.name} className="w-full h-full object-cover" />
 ) : (
 getInitials(viewingStudent.name)
 )}
 </div>
 <div>
 <h3 className="text-base font-bold text-white font-header flex items-center gap-2">
 <User className="w-5 h-5 text-brand" /> Student Profile Details
 </h3>
 <p className="text-sm text-zinc-500 mt-1">Registry records, booking history, and diagnostic aptitude profiles.</p>
 </div>
 </div>
 <button
 onClick={() => setViewingStudent(null)}
 className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer border-none bg-transparent"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Account details */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-3">
 <span className="text-sm font-bold text-zinc-500 block">Registry Metadata</span>
 <div className="space-y-2.5 text-sm">
 <div>
 <span className="text-zinc-500 block text-sm ">Account ID</span>
 <span className="text-zinc-300">{viewingStudent.id}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Full Name</span>
 <span className="font-bold text-white">{viewingStudent.name}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Email Address</span>
 <span className="font-bold text-zinc-350">{viewingStudent.email}</span>
 </div>
 <div>
 <span className="text-zinc-500 block text-sm ">Account Status</span>
 <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-sm font-bold ${(viewingStudent.status || 'ACTIVE') === 'ACTIVE'
 ? 'bg-emerald-955/20 border border-emerald-900/30 text-emerald-450'
 : 'bg-rose-955/20 border border-rose-900/30 text-rose-500'
 }`}>
 {viewingStudent.status || 'ACTIVE'}
 </span>
 </div>
 </div>
 </div>

 {/* Consultation Stats */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 flex flex-col justify-between">
 <div>
 <span className="text-sm font-bold text-zinc-500 block mb-3">Consultation Summary</span>
 <div className="grid grid-cols-2 gap-2 text-center">
 <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
 <p className="text-xl font-bold text-brand">
 {bookingsDb.filter(b => b.userId === viewingStudent.id).length}
 </p>
 <p className="text-sm text-zinc-500 font-bold mt-0.5">Total Bookings</p>
 </div>
 <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-850">
 <p className="text-xl font-bold text-emerald-400">
 {bookingsDb.filter(b => b.userId === viewingStudent.id && b.status === 'COMPLETED').length}
 </p>
 <p className="text-sm text-zinc-500 font-bold mt-0.5">Completed</p>
 </div>
 </div>
 </div>
 <div className="pt-3 border-t border-zinc-900 text-sm text-zinc-400">
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
 <span className="text-sm font-bold text-zinc-500 block">Consultation History Log</span>
 <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-955 max-h-[160px] overflow-y-auto">
 <div className="overflow-x-auto w-full">
 <table className="w-full text-sm border-collapse text-left min-w-[420px]">
 <thead>
 <tr className="bg-zinc-900/50 text-zinc-500 font-bold border-b border-zinc-855">
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
 <td colSpan={4} className="p-4 text-center text-zinc-650 italic">No consult history for this student.</td>
 </tr>
 );
 }
 return studentBookings.map(b => {
 const psychologist = usersDb.find(u => u.id === b.advisorId);
 return (
 <tr key={b.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/30">
 <td className="p-2.5">
 <span className="text-white block font-semibold">{b.date}</span>
 <span className="text-zinc-500 text-sm">{b.time}</span>
 </td>
 <td className="p-2.5 text-zinc-300 font-medium">
 {psychologist ? psychologist.name : 'Unknown Advisor'}
 </td>
 <td className="p-2.5 text-zinc-400 font-medium">
 {b.service === 'counselling' ? 'Wellbeing' : 'Career Mapping'} ({b.mode})
 </td>
 <td className="p-2.5 text-center">
 <span className={`px-2 py-0.5 rounded text-sm font-bold ${b.status === 'CONFIRMED' ? 'bg-indigo-950/20 border border-indigo-900/30 text-indigo-400' :
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

 {/* Aptitude Results Details */}
 <div className="space-y-3">
 <span className="text-sm font-bold text-zinc-500 block">Diagnostic Aptitude Reports</span>
 {(() => {
 const studentTests = testResultsDb.filter(res => res.studentEmail?.toLowerCase() === viewingStudent.email?.toLowerCase());
 if (studentTests.length === 0) {
 return (
 <div className="p-5 bg-zinc-950/30 border border-zinc-850/60 rounded-lg text-center text-zinc-650 italic text-sm">
 No aptitude assessment reports logged.
 </div>
 );
 }
 return (
 <div className="space-y-4">
 {studentTests.map(res => (
 <div key={res.id} className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-3">
 <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
 <div>
 <span className="text-sm bg-brand text-zinc-955 px-2 py-0.5 rounded font-bold ">
 Dominant: {res.dominantDomain}
 </span>
 <span className="text-zinc-500 text-sm font-bold block mt-1 ">Date Completed: {res.date}</span>
 </div>
 <button
 onClick={() => handleExportAptitudeResults(res)}
 className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:text-brand rounded font-bold text-sm cursor-pointer border-none bg-transparent"
 >
 Copy Report
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
 {Object.entries(res.scores || {}).map(([key, val]) => (
 <div key={key} className="space-y-1">
 <div className="flex justify-between items-center font-bold">
 <span className="text-zinc-400 ">{key}</span>
 <span className="text-brand">{val}%</span>
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

 {/* CIGI Differential Aptitude Test Results Management */}
 <div className="space-y-4 pt-4 border-t border-zinc-800">
 <span className="text-sm font-bold text-zinc-550 block">CIGI Differential Aptitude Test (C-DAT) Results</span>

 {/* Existing uploads */}
 <div className="space-y-2">
 {(!viewingStudent.cigiResults || viewingStudent.cigiResults.length === 0) ? (
 <div className="p-4 bg-zinc-950/30 border border-zinc-850/60 rounded-lg text-center text-zinc-650 italic text-xs">
 No CIGI results uploaded for this student yet.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
 {viewingStudent.cigiResults.map(res => (
 <div key={res.id} className="p-3 bg-zinc-955 border border-zinc-850 rounded-lg flex items-center justify-between gap-3 text-sm">
 <div className="min-w-0 flex-1 space-y-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${res.fileType === 'pdf' ? 'bg-rose-955/40 border border-rose-900/30 text-rose-450' : 'bg-blue-955/40 border border-blue-900/30 text-blue-400'}`}>
 {res.fileType}
 </span>
 {(res.testDate || res.testTime) && (
 <span className="text-xs text-zinc-400 font-medium">
 Date: {res.testDate} {res.testTime}
 </span>
 )}
 </div>
 {res.note && (
 <p className="text-xs text-zinc-400 italic truncate" title={res.note}>
 "{res.note}"
 </p>
 )}
 <span className="text-[10px] text-zinc-500 block">
 Uploaded at: {new Date(res.uploadedAt).toLocaleString()}
 </span>
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 <a
 href={res.fileUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition"
 title="View File"
 >
 <Link className="w-3.5 h-3.5" />
 </a>
 <button
 type="button"
 onClick={() => handleAdminStartEditCigi(res)}
 className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-brand hover:text-brand-light transition cursor-pointer border-none"
 title="Edit Result Info"
 >
 <Edit className="w-3.5 h-3.5" />
 </button>
 <button
 type="button"
 onClick={() => handleAdminCigiDelete(res.id)}
 className="p-1.5 bg-zinc-900 hover:bg-rose-955/20 border border-zinc-800 hover:border-rose-900/30 rounded-lg text-rose-500 hover:text-rose-455 transition cursor-pointer border-none"
 title="Delete Result"
 >
 <Trash className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Form to Add/Edit Result */}
 <form onSubmit={handleAdminCigiUpload} className="bg-zinc-955 border border-zinc-850 rounded-lg p-4 space-y-3">
 <span className="text-xs font-bold text-zinc-400 block">
 {adminCigiEditingId ? 'Edit CIGI Result Metadata / Replace File' : 'Add CIGI Result Record'}
 </span>

 <div className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-bold text-zinc-500 block mb-1">
 Result File {adminCigiEditingId ? '(Optional)' : '(Required)'}
 </label>
 <input
 type="file"
 ref={adminCigiFileInputRef}
 onChange={(e) => setAdminCigiFile(e.target.files[0])}
 accept="image/*,application/pdf"
 required={!adminCigiEditingId}
 className="w-full text-xs text-zinc-400 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer p-1.5 border border-zinc-800 rounded bg-zinc-900 focus:outline-none"
 />
 <p className="text-[9px] text-zinc-500 mt-0.5">Images and PDFs up to 5MB</p>
 </div>
 <div>
 <label className="text-[10px] font-bold text-zinc-500 block mb-1">Remarks / Notes</label>
 <input
 type="text"
 placeholder="e.g. Scored 85% logical"
 value={adminCigiNote}
 onChange={(e) => setAdminCigiNote(e.target.value)}
 className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-bold text-zinc-500 block mb-1">Date Taken</label>
 <input
 type="date"
 value={adminCigiDate}
 onChange={(e) => setAdminCigiDate(e.target.value)}
 className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-zinc-500 block mb-1">Time Taken</label>
 <input
 type="time"
 value={adminCigiTime}
 onChange={(e) => setAdminCigiTime(e.target.value)}
 className="w-full p-2 bg-zinc-900 border border-zinc-800 focus:border-brand rounded text-xs text-white outline-none transition-colors"
 />
 </div>
 </div>

 <div className="flex gap-2 pt-1.5 justify-end">
 {adminCigiEditingId && (
 <button
 type="button"
 onClick={handleAdminCancelEditCigi}
 className="px-3.5 py-1.5 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-semibold cursor-pointer border-none bg-transparent"
 >
 Cancel
 </button>
 )}
 <button
 type="submit"
 disabled={isAdminCigiUploading}
 className="px-4 py-1.5 bg-brand hover:bg-brand-dark disabled:bg-zinc-700 text-zinc-950 font-bold rounded text-xs cursor-pointer border-none flex items-center gap-1 shadow"
 >
 {isAdminCigiUploading ? (
 <><span className="w-3 h-3 border-2 border-zinc-955/30 border-t-zinc-955 rounded-full animate-spin" /> Saving...</>
 ) : (
 <>{adminCigiEditingId ? 'Update Result' : 'Upload Result'}</>
 )}
 </button>
 </div>
 </div>
 </form>
 </div>

 <div className="pt-2 flex justify-end">
 <button
 onClick={() => setViewingStudent(null)}
 className="px-6 py-2.5 border border-zinc-800 hover:bg-zinc-855 text-white font-bold text-sm rounded-lg cursor-pointer transition text-center border-none bg-transparent"
 >
 Close Profile
 </button>
 </div>
 </div>
 </div>
 )}

    </div>
  );
}