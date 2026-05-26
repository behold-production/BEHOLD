import React, { useState, useEffect } from 'react';
import { Sparkles, Info, ArrowUpRight, User, BookOpen, Heart, Award, Hash, Check } from 'lucide-react';

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

export default function Services({ setView, onBookTherapist }) {
  const [showAptitudeForm, setShowAptitudeForm] = useState(false);
  const [aptitudeForm, setAptitudeForm] = useState(INITIAL_STATE);
  const [isAutofilled, setIsAutofilled] = useState(false);

  // Load from localStorage for autofill
  useEffect(() => {
    if (showAptitudeForm) {
      const saved = localStorage.getItem('behold_student_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAptitudeForm(prev => ({ ...INITIAL_STATE, ...parsed }));
          setIsAutofilled(true);
        } catch (e) {
          console.error("Error reading student profile", e);
        }
      }
    }
  }, [showAptitudeForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAptitudeForm(prev => ({ ...prev, [name]: value }));
    setIsAutofilled(false);
  };

  const handleCigiRedirect = (e) => {
    e.preventDefault();
    // Build and save comprehensive query params to localStorage so they auto-fill
    localStorage.setItem('behold_student_profile', JSON.stringify({
      name: aptitudeForm.name,
      email: aptitudeForm.email,
      confirmEmail: aptitudeForm.confirmEmail,
      dob: aptitudeForm.dob,
      gender: aptitudeForm.gender,
      phone: aptitudeForm.phone,
      whatsapp: aptitudeForm.whatsapp,
      country: aptitudeForm.country,
      phoneCode: aptitudeForm.phoneCode,
      homeDistrict: aptitudeForm.homeDistrict,
      grade: aptitudeForm.grade,
      schoolCountry: aptitudeForm.schoolCountry,
      schoolState: aptitudeForm.schoolState,
      schoolDistrict: aptitudeForm.schoolDistrict,
      schoolName: aptitudeForm.schoolName,
      medium: aptitudeForm.medium,
      board: aptitudeForm.board,
      careerInterests: aptitudeForm.careerInterests,
      specialTalents: aptitudeForm.specialTalents,
      achievements: aptitudeForm.achievements,
      fatherQualification: aptitudeForm.fatherQualification,
      motherQualification: aptitudeForm.motherQualification,
      fatherOccupation: aptitudeForm.fatherOccupation,
      motherOccupation: aptitudeForm.motherOccupation,
      guardianName: aptitudeForm.guardianName,
      guardianRelationship: aptitudeForm.guardianRelationship,
      guardianPhone: aptitudeForm.guardianPhone,
      preferredBatch: aptitudeForm.preferredBatch,
      groupCode: aptitudeForm.groupCode
    }));
    
    // Redirect to local booking page with Muhsina (c3) pre-selected
    if (onBookTherapist) {
      onBookTherapist('c3');
    } else {
      setView('booking');
    }
  };

  // Dynamic 3D tilt effects handlers
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (centerY - y) / 16;
    const tiltY = (x - centerX) / 16;
    
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <section id="services" className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-black text-left relative">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand/10 rounded-full glow-glow pointer-events-none" />

      {/* Editorial Header */}
      <div className="mb-16 md:mb-24 space-y-4">
        <span className="text-[10px] bg-black text-white px-3.5 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit block">
          our core specialities
        </span>
        <h2 className="text-4xl md:text-5xl font-header font-black tracking-tight text-gray-900 leading-tight uppercase">
          Empowering Services
        </h2>
        <p className="text-black/50 font-sans text-sm md:text-base font-light max-w-xl">
          Immersive mental health, career roadmaps, and certified psychometrics designed to cultivate confidence and emotional clarity.
        </p>
      </div>

      {/* Services Cards */}
      <div className="space-y-12">
        
        {/* SERVICE 1: APTITUDE TEST CARD */}
        <div 
          id="card-aptitude" 
          className="card-luxury card-luxury-hover p-8 md:p-14 flex flex-col justify-between space-y-8 select-none border border-black/5"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="space-y-2">
                <span className="text-[9px] bg-brand text-black px-3 py-1 rounded-full uppercase tracking-widest font-black font-mono">
                  scientific strengths mapping
                </span>
                <h3 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-black mt-1">Aptitude Test</h3>
              </div>
              <span className="text-[10px] text-black/50 font-bold tracking-wider uppercase border border-black/10 px-3 py-1 rounded-full bg-white/50 backdrop-blur-xs">
                Service 01
              </span>
            </div>
            
            <p className="text-black/60 font-sans text-sm md:text-base font-light leading-relaxed max-w-4xl">
              BEHOLD’s aptitude assessments help students discover their natural strengths, learning styles, interests, and hidden talents through scientifically designed evaluation methods. The assessment provides clear insights into suitable academic and career paths, helping students make informed future decisions with confidence.
            </p>
            
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-black/80 font-mono">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Certified CIGI psychometric models</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> Comprehensive 12-page cognitive diagnostic reports</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> In-school & Doorstep support</span>
            </div>
          </div>

          <div className="pt-6 border-t border-black/[0.05]">
            {!showAptitudeForm ? (
              <div className="flex gap-4 flex-wrap">
                <button 
                  onClick={() => setView('test')}
                  className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition cursor-pointer shadow-sm"
                >
                  Take Aptitude Test
                </button>
                <button 
                  onClick={() => setShowAptitudeForm(true)}
                  className="px-6 py-3.5 bg-brand hover:bg-brand-dark text-black font-bold text-xs uppercase tracking-widest rounded-full transition cursor-pointer shadow-sm border border-black/5"
                >
                  Book Aptitude (CDAC Registration)
                </button>
              </div>
            ) : (
              <div className="space-y-8 pt-4 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b border-black/[0.05] pb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                    Aptitude Registration Console (CIGI CDAT)
                  </h4>
                  <button 
                    onClick={() => setShowAptitudeForm(false)}
                    className="text-xs text-black/60 hover:text-black font-bold cursor-pointer underline"
                  >
                    Hide Form
                  </button>
                </div>

                {isAutofilled && (
                  <div className="p-4 bg-brand/10 border border-brand/30 text-black/80 rounded-2xl text-xs flex items-center justify-between max-w-xl">
                    <span className="flex items-center gap-2 font-medium">
                      <Sparkles className="w-4 h-4 text-black animate-pulse" />
                      Autofilled 25+ parameters from your student profile.
                    </span>
                    <button 
                      onClick={() => setView('profile')}
                      className="underline text-black font-extrabold cursor-pointer hover:text-black/80"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}

                <form onSubmit={handleCigiRedirect} className="space-y-8 text-xs font-semibold text-black/80">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* SECTION 1: Personal Details */}
                    <div className="md:col-span-3">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/45 block mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> 1. Personal Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Name of Student</label>
                          <input required type="text" name="name" placeholder="Your full name" value={aptitudeForm.name} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Email</label>
                          <input required type="email" name="email" placeholder="name@email.com" value={aptitudeForm.email} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Confirm Email</label>
                          <input required type="email" name="confirmEmail" placeholder="Re-enter email" value={aptitudeForm.confirmEmail} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Date of Birth</label>
                          <input required type="text" name="dob" placeholder="as 25-01-2006" value={aptitudeForm.dob} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Gender</label>
                          <div className="flex gap-6 pt-2">
                            {['Male', 'Female'].map(g => (
                              <label key={g} className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                <input type="radio" name="gender" value={g} checked={aptitudeForm.gender === g} onChange={handleInputChange} className="w-4 h-4 accent-black" />
                                <span>{g}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Phone</label>
                          <div className="flex gap-2">
                            <input type="text" name="phoneCode" value={aptitudeForm.phoneCode} onChange={handleInputChange} className="w-16 p-3.5 bg-white/70 border border-black/10 rounded-xl text-center" />
                            <input required type="tel" name="phone" placeholder="e.g. 8086664001" value={aptitudeForm.phone} onChange={handleInputChange} className="flex-1 p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">WhatsApp</label>
                          <input type="tel" name="whatsapp" placeholder="e.g. 8086664001" value={aptitudeForm.whatsapp} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Home District</label>
                          <select name="homeDistrict" value={aptitudeForm.homeDistrict} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand cursor-pointer">
                            <option value="">Select District</option>
                            {DISTRICTS_KERALA.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Grade</label>
                          <select name="grade" value={aptitudeForm.grade} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand cursor-pointer">
                            <option value="">Select Grade</option>
                            {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: School Details */}
                    <div className="md:col-span-3 border-t border-black/[0.05] pt-6">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/45 block mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> 2. School Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School Name</label>
                          <input type="text" name="schoolName" placeholder="Name of the school" value={aptitudeForm.schoolName} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School State</label>
                          <input type="text" name="schoolState" value={aptitudeForm.schoolState} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School District</label>
                          <select name="schoolDistrict" value={aptitudeForm.schoolDistrict} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand cursor-pointer">
                            <option value="">Select District</option>
                            {DISTRICTS_KERALA.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Medium</label>
                          <div className="flex gap-6 pt-2">
                            {['English', 'Malayalam', 'Other'].map(m => (
                              <label key={m} className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                <input type="radio" name="medium" value={m} checked={aptitudeForm.medium === m} onChange={handleInputChange} className="w-4 h-4 accent-black" />
                                <span>{m}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-3">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Board</label>
                          <div className="flex flex-wrap gap-6 pt-1">
                            {['Kerala-State', 'CBSE', 'ICSE', 'Other'].map(b => (
                              <label key={b} className="flex items-center gap-2 text-sm text-black cursor-pointer">
                                <input type="radio" name="board" value={b} checked={aptitudeForm.board === b} onChange={handleInputChange} className="w-4 h-4 accent-black" />
                                <span>{b}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: Interests */}
                    <div className="md:col-span-3 border-t border-black/[0.05] pt-6">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/45 block mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4" /> 3. Interests & Talents
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 md:col-span-3">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Career Interests</label>
                          <input type="text" name="careerInterests" placeholder="You can give more than one profession" value={aptitudeForm.careerInterests} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Special Talents</label>
                          <input type="text" name="specialTalents" placeholder="music, painting, cricket, athletics, etc." value={aptitudeForm.specialTalents} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Achievements</label>
                          <input type="text" name="achievements" placeholder="Recognition in School / District / State Level" value={aptitudeForm.achievements} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: Parents */}
                    <div className="md:col-span-3 border-t border-black/[0.05] pt-6">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/45 block mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> 4. Parents & Guardian Details
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Guardian Name</label>
                          <input required type="text" name="guardianName" placeholder="name of parent or guardian" value={aptitudeForm.guardianName} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Relationship</label>
                          <select name="guardianRelationship" value={aptitudeForm.guardianRelationship} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand cursor-pointer">
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Guardian Phone</label>
                          <input type="tel" name="guardianPhone" placeholder="Guardian mobile number" value={aptitudeForm.guardianPhone} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Father's Education</label>
                          <input type="text" name="fatherQualification" placeholder="Qualification of Father" value={aptitudeForm.fatherQualification} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Mother's Education</label>
                          <input type="text" name="motherQualification" placeholder="Qualification of Mother" value={aptitudeForm.motherQualification} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Father's Occupation</label>
                          <input type="text" name="fatherOccupation" placeholder="Occupation of Father" value={aptitudeForm.fatherOccupation} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand" />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: Batch */}
                    <div className="md:col-span-3 border-t border-black/[0.05] pt-6">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/45 block mb-4 flex items-center gap-2">
                        <Hash className="w-4 h-4" /> 5. Batch & Group
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Preferred Batch</label>
                          <select name="preferredBatch" value={aptitudeForm.preferredBatch} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand cursor-pointer">
                            <option value="">Select Batch</option>
                            <option value="Batch A (Weekends)">Batch A (Weekends)</option>
                            <option value="Batch B (Weekdays)">Batch B (Weekdays)</option>
                            <option value="Batch C (Evening)">Batch C (Evening)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Group Code</label>
                          <input type="text" name="groupCode" placeholder="Group Code" value={aptitudeForm.groupCode} onChange={handleInputChange} className="w-full p-3.5 bg-white/70 border border-black/10 rounded-xl outline-none focus:border-brand font-mono font-bold uppercase" />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="pt-6 border-t border-black/[0.05] flex items-center gap-4">
                    <button 
                      type="submit"
                      className="px-8 py-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-full transition cursor-pointer inline-flex items-center gap-2 shadow-md"
                    >
                      <span>Submit & Select Counselor</span>
                      <ArrowUpRight className="w-4 h-4 text-brand" />
                    </button>
                    <p className="text-[10px] text-black/45 font-semibold max-w-lg">
                      <Info className="w-4 h-4 inline mr-1" /> Saves entered details and redirects to Counselor Booking with counselor Muhsina P R preselected.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION - DUAL COUPLING ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* SERVICE 2: CAREER COUNSELLING */}
          <div 
            id="card-career" 
            className="col-span-12 md:col-span-6 card-luxury card-luxury-hover p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[360px]"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] bg-black text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black font-mono">
                    stream selection & roadmap
                  </span>
                  <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1">Career Counselling</h3>
                </div>
                <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-full bg-white/50 backdrop-blur-xs font-mono">
                  02
                </span>
              </div>
              <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
                Our personalized career counselling sessions guide students in choosing the right academic stream, career direction, and higher education opportunities based on their interests, abilities, personality, and future goals. We provide clarity, direction, and confidence for long-term success.
              </p>
            </div>

            <button
              onClick={() => {
                if (onBookTherapist) {
                  onBookTherapist('career_1'); // Pre-select a career advisor
                } else {
                  setView('booking');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer self-start shadow-xs hover:shadow-md"
            >
              Configure career session
            </button>
          </div>

          {/* SERVICE 3: PERSONAL COUNSELLING */}
          <div 
            id="card-mental" 
            className="col-span-12 md:col-span-6 card-luxury card-luxury-hover p-8 md:p-12 flex flex-col justify-between space-y-8 select-none border border-black/5 min-h-[360px]"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] bg-black text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black font-mono">
                    emotional & stress support
                  </span>
                  <h3 className="text-xl md:text-2xl font-header font-black uppercase tracking-wide text-black mt-1">Personal Counselling</h3>
                </div>
                <span className="text-[9px] text-black/50 font-bold uppercase tracking-wider border border-black/10 px-2 py-0.5 rounded-full bg-white/50 backdrop-blur-xs font-mono">
                  03
                </span>
              </div>
              <p className="text-black/60 font-sans text-xs md:text-sm font-light leading-relaxed">
                BEHOLD offers emotional and psychological support for students dealing with stress, anxiety, confusion, low confidence, peer pressure, and academic challenges. Our counselling approach creates a safe and supportive environment where students can grow emotionally stronger and mentally healthier.
              </p>
            </div>

            <button
              onClick={() => {
                if (onBookTherapist) {
                  onBookTherapist('c3'); // Pre-select a personal counsellor
                } else {
                  setView('booking');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white/80 hover:bg-black hover:text-white border border-black/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer self-start shadow-xs hover:shadow-md"
            >
              Configure counselling session
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
