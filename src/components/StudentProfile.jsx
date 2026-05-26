import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, CheckCircle2, ChevronRight, BookOpen, Heart, Award, ShieldAlert } from 'lucide-react';

const INITIAL_STATE = {
  name: '',
  email: '',
  confirmEmail: '',
  dob: '',
  gender: 'Male',
  phone: '',
  whatsapp: '',
  country: 'India',
  phoneCode: '0091',
  homeDistrict: '',
  grade: '',
  schoolCountry: 'India',
  schoolState: 'Kerala',
  schoolDistrict: '',
  schoolName: '',
  medium: 'English',
  board: 'Kerala-State',
  careerInterests: '',
  specialTalents: '',
  achievements: '',
  fatherQualification: '',
  motherQualification: '',
  fatherOccupation: '',
  motherOccupation: '',
  guardianName: '',
  guardianRelationship: 'Father',
  guardianPhone: '',
  preferredBatch: '',
  groupCode: ''
};

const DISTRICTS_KERALA = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
  'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
  'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

export default function StudentProfile({ setView }) {
  const [profile, setProfile] = useState(INITIAL_STATE);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('personal'); // personal, school, interests, parents, batch

  useEffect(() => {
    const saved = localStorage.getItem('behold_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data with initial state to avoid missing fields if version changes
        setProfile(prev => ({ ...INITIAL_STATE, ...parsed }));
      } catch (e) {
        console.error("Error reading student profile from localStorage", e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const err = {};
    if (!profile.name.trim() || profile.name.trim().length < 3) {
      err.name = "Name of Student must be at least 3 characters";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !emailRegex.test(profile.email)) {
      err.email = "Please enter a valid email address";
    }
    const phoneRegex = /^(\+?\d{1,4}[- ]?)?[6-9]\d{9}$/;
    if (!profile.phone || !phoneRegex.test(profile.phone)) {
      err.phone = "Please enter a valid phone number (e.g. 8086664001 or 0091-8086664001)";
    }
    if (profile.email !== profile.confirmEmail) {
      err.confirmEmail = "Emails do not match";
    }
    if (!profile.dob.trim()) {
      err.dob = "Date of Birth is required";
    }
    if (!profile.guardianName.trim()) {
      err.guardianName = "Guardian name is required";
    }
    return err;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      // Automatically switch to the tab with errors
      if (err.name || err.email || err.confirmEmail || err.phone || err.dob) {
        setActiveTab('personal');
      } else if (err.guardianName) {
        setActiveTab('parents');
      }
      return;
    }

    localStorage.setItem('behold_student_profile', JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white text-black font-sans text-left max-w-5xl mx-auto px-4 sm:px-6">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-header font-black text-gray-900 uppercase tracking-wide">
            Student Registration Profile
          </h2>
          <p className="text-gray-500 text-sm font-light mt-1">
            Complete your full profiling details. These will be saved locally and used to auto-fill the CIGI CDAT registration form.
          </p>
        </div>
        <button
          onClick={() => setView('landing')}
          className="bg-white border border-brand hover:bg-brand hover:text-white text-brand px-5 py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Side: Navigation Tabs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 scrollbar-none snap-x w-full">
            {[
              { id: 'personal', label: '1. Personal Details', icon: User },
              { id: 'school', label: '2. School Details', icon: BookOpen },
              { id: 'interests', label: '3. Talents & Interests', icon: Award },
              { id: 'parents', label: '4. Parents / Guardian', icon: Heart },
              { id: 'batch', label: '5. Batch & Group', icon: ChevronRight }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-3 rounded-[4px] border text-xs font-bold uppercase tracking-wider transition text-left cursor-pointer shrink-0 snap-start ${isActive
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block p-4 bg-gray-50 border border-gray-200 rounded-[4px] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-700 block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-800" /> Privacy Notice
            </span>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Your profile is stored entirely on your local browser database (`localStorage`) and is not transmitted to our servers until you choose to submit/register.
            </p>
          </div>
        </div>

        {/* Right Side: Tab Forms */}
        <div className="lg:col-span-3 border border-black p-5 sm:p-8 bg-white">
          <form onSubmit={handleSave} className="space-y-8 text-xs font-medium">

            {/* TAB 1: PERSONAL DETAILS */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-150 pb-2 text-gray-900">
                  Section 1: Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name of Student */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Name of Student</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={profile.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.name ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="text"
                      name="dob"
                      placeholder="as 25-01-2006"
                      value={profile.dob}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.dob ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    />
                    {errors.dob && <p className="text-[10px] text-red-500 font-semibold">{errors.dob}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@email.com"
                      value={profile.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.email ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    />
                    {errors.email && <p className="text-[10px] text-red-500 font-semibold">{errors.email}</p>}
                  </div>

                  {/* Confirm Email */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Confirm Email</label>
                    <input
                      type="email"
                      name="confirmEmail"
                      placeholder="Re-enter email"
                      value={profile.confirmEmail}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.confirmEmail ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    />
                    {errors.confirmEmail && <p className="text-[10px] text-red-500 font-semibold">{errors.confirmEmail}</p>}
                  </div>

                  {/* Phone Code & Phone */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Phone</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="phoneCode"
                        value={profile.phoneCode}
                        onChange={handleChange}
                        className="w-20 px-3 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none text-center"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 8086664001"
                        value={profile.phone}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.phone ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                          }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-500 font-semibold">{errors.phone}</p>}
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">WhatsApp Number</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="e.g. 8086664001"
                      value={profile.whatsapp}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Gender</label>
                    <div className="flex gap-4">
                      {['Male', 'Female'].map(g => (
                        <label key={g} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={profile.gender === g}
                            onChange={handleChange}
                            className="w-4 h-4 accent-black"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Home District */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Home District</label>
                    <select
                      name="homeDistrict"
                      value={profile.homeDistrict}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition cursor-pointer"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS_KERALA.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Grade (Class)</label>
                    <select
                      name="grade"
                      value={profile.grade}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition cursor-pointer"
                    >
                      <option value="">Select Grade</option>
                      {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('school')}
                    className="bg-brand text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-dark transition rounded-[4px] shadow-sm"
                  >
                    Next Section
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SCHOOL DETAILS */}
            {activeTab === 'school' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-150 pb-2 text-gray-900">
                  Section 2: School Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* School Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-500 uppercase tracking-wider">School Name</label>
                    <input
                      type="text"
                      name="schoolName"
                      placeholder="Name of the school"
                      value={profile.schoolName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* School Country */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">School Country</label>
                    <input
                      type="text"
                      name="schoolCountry"
                      value={profile.schoolCountry}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* School State */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">School State</label>
                    <input
                      type="text"
                      name="schoolState"
                      value={profile.schoolState}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* School District */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">School District</label>
                    <select
                      name="schoolDistrict"
                      value={profile.schoolDistrict}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition cursor-pointer"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS_KERALA.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Medium */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Medium of Instruction</label>
                    <div className="flex gap-4">
                      {['English', 'Malayalam', 'Other'].map(m => (
                        <label key={m} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                          <input
                            type="radio"
                            name="medium"
                            value={m}
                            checked={profile.medium === m}
                            onChange={handleChange}
                            className="w-4 h-4 accent-black"
                          />
                          {m}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Board */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-gray-500 uppercase tracking-wider">Board of Education</label>
                    <div className="flex flex-wrap gap-4">
                      {['Kerala-State', 'CBSE', 'ICSE', 'IGCSE', 'Other'].map(b => (
                        <label key={b} className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                          <input
                            type="radio"
                            name="board"
                            value={b}
                            checked={profile.board === b}
                            onChange={handleChange}
                            className="w-4 h-4 accent-black"
                          />
                          {b}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="bg-white border border-brand text-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand hover:text-white transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('interests')}
                    className="bg-brand text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-dark transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Next Section
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: TALENTS & INTERESTS */}
            {activeTab === 'interests' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-150 pb-2 text-gray-900">
                  Section 3: Talents & Interests
                </h3>

                <div className="space-y-6">

                  {/* Career Interests */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Career Interests</label>
                    <textarea
                      name="careerInterests"
                      placeholder="You can give more than one profession (e.g. Software Engineer, Architect, Designer)"
                      value={profile.careerInterests}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Special Talents */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Special Talents</label>
                    <input
                      type="text"
                      name="specialTalents"
                      placeholder="music, painting, cricket, athletics, etc."
                      value={profile.specialTalents}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Achievements */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Your Achievements</label>
                    <textarea
                      name="achievements"
                      placeholder="Recognition in School / District / State Level / Other Organizations"
                      value={profile.achievements}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('school')}
                    className="bg-white border border-brand text-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand hover:text-white transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('parents')}
                    className="bg-brand text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-dark transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Next Section
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: PARENTS / GUARDIAN DETAILS */}
            {activeTab === 'parents' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-150 pb-2 text-gray-900">
                  Section 4: Parents / Guardian Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Father Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Educational Qualification of Father</label>
                    <input
                      type="text"
                      name="fatherQualification"
                      placeholder="e.g. B.Tech, Tenth Class"
                      value={profile.fatherQualification}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Mother Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Educational Qualification of Mother</label>
                    <input
                      type="text"
                      name="motherQualification"
                      placeholder="e.g. M.Sc, Higher Secondary"
                      value={profile.motherQualification}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Father Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Occupation of Father</label>
                    <input
                      type="text"
                      name="fatherOccupation"
                      placeholder="e.g. Business, Teacher"
                      value={profile.fatherOccupation}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Mother Occupation */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Occupation of Mother</label>
                    <input
                      type="text"
                      name="motherOccupation"
                      placeholder="e.g. Homemaker, Govt Employee"
                      value={profile.motherOccupation}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                  {/* Guardian Name */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      placeholder="name of parent or guardian"
                      value={profile.guardianName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition ${errors.guardianName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                        }`}
                    />
                    {errors.guardianName && <p className="text-[10px] text-red-500 font-semibold">{errors.guardianName}</p>}
                  </div>

                  {/* Relationship */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Relationship</label>
                    <select
                      name="guardianRelationship"
                      value={profile.guardianRelationship}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition cursor-pointer"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Uncle">Uncle</option>
                      <option value="Aunt">Aunt</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Guardian Phone */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Guardian's Phone</label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      placeholder="Guardian mobile number"
                      value={profile.guardianPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition"
                    />
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('interests')}
                    className="bg-white border border-brand text-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand hover:text-white transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('batch')}
                    className="bg-brand text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-dark transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Next Section
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: BATCH & GROUP REGISTRATION */}
            {activeTab === 'batch' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-150 pb-2 text-gray-900">
                  Section 5: Preferred Batch & Group Registration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Preferred Batch */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Preferred Batch</label>
                    <select
                      name="preferredBatch"
                      value={profile.preferredBatch}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition cursor-pointer"
                    >
                      <option value="">Select Batch</option>
                      <option value="Batch A (Weekends)">Batch A (Weekends)</option>
                      <option value="Batch B (Weekdays)">Batch B (Weekdays)</option>
                      <option value="Batch C (Evening)">Batch C (Evening)</option>
                    </select>
                  </div>

                  {/* Group Code */}
                  <div className="space-y-1.5">
                    <label className="text-gray-500 uppercase tracking-wider">Group Code</label>
                    <input
                      type="text"
                      name="groupCode"
                      placeholder="If you have a Group Registration Code"
                      value={profile.groupCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 text-sm text-gray-950 rounded-[4px] outline-none focus:border-brand transition font-mono font-bold uppercase tracking-wider"
                    />
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('parents')}
                    className="bg-white border border-brand text-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand hover:text-white transition rounded-[4px] shadow-sm w-full sm:w-auto text-center"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="bg-brand text-white px-8 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-dark transition rounded-[4px] shadow-md w-full sm:w-auto text-center"
                  >
                    Save & Sync Profile
                  </button>
                </div>
              </div>
            )}

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-[4px] text-center font-bold text-xs flex items-center justify-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile Registered & Synchronized Locally!
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  );
}
