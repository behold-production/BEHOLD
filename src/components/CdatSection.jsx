import React, { useState, useEffect } from 'react';
import { Check, Sparkles, User, BookOpen, Heart, Info, ArrowLeft, ArrowRight } from 'lucide-react';

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
  guardianPhone: ''
};

const DISTRICTS_KERALA = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod',
  'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
  'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

export default function CdatSection({ setView }) {
  const [showAptitudeForm, setShowAptitudeForm] = useState(false);
  const [aptitudeForm, setAptitudeForm] = useState(INITIAL_STATE);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // personal, school, parents

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

  useEffect(() => {
    if (showAptitudeForm) {
      setTimeout(() => {
        const element = document.getElementById('card-aptitude');
        if (element) {
          const offset = 85;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [showAptitudeForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAptitudeForm(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('behold_student_profile', JSON.stringify(updated));
      return updated;
    });
    setIsAutofilled(false);
  };

  const handleCigiRedirect = (e) => {
    e.preventDefault();

    // Save to localStorage
    localStorage.setItem('behold_student_profile', JSON.stringify(aptitudeForm));

    // Build external CIGI registration URL parameters
    const queryParams = new URLSearchParams({ shem: 'rimspwouoe' });
    Object.entries(aptitudeForm).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        queryParams.append(key, val);
      }
    });

    const url = `https://cigicareer.com/cdat/`;
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = url;
    }
  };

  return (
    <section id="cdat" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-black text-left relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] bg-brand/5 rounded-[4px] glow-glow pointer-events-none" />

      {/* CDAT CARD */}
      <div
        id="card-aptitude"
        className="card-luxury card-luxury-hover p-5 sm:p-8 md:p-14 flex flex-col justify-between space-y-8 select-none border border-black/5 group"
      >
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <span className="text-[9px] bg-brand text-black px-3 py-1 rounded-[4px] uppercase tracking-widest font-black font-mono">
                scientific strengths mapping
              </span>
              <h3 className="text-2xl md:text-3xl font-header font-black uppercase tracking-wide text-black mt-1 group-hover:text-brand transition-colors duration-500">
                CIGI Differential Aptitude Test (CDAT)
              </h3>
            </div>
            
            {/* Sample Test button moved to the top of the section */}
            {!showAptitudeForm && (
              <button
                onClick={() => window.location.hash = '#/sample-test'}
                className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-[4px] transition cursor-pointer shadow-sm text-center shrink-0 w-full md:w-auto"
              >
                Sample Test
              </button>
            )}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <button
                onClick={() => setShowAptitudeForm(true)}
                className="px-6 py-3.5 bg-brand hover:bg-brand-dark text-black font-bold text-xs uppercase tracking-widest rounded-[4px] transition cursor-pointer shadow-sm border border-black/5 w-full sm:w-auto text-center"
              >
                Book Aptitude (CDAC Registration)
              </button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 animate-in fade-in duration-300">
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
                <div className="p-4 bg-brand/10 border border-brand/30 text-black/80 rounded-[4px] text-xs flex items-center justify-between max-w-xl">
                  <span className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-black animate-pulse" />
                    Autofilled 25+ parameters from your student profile.
                  </span>
                  <button
                    onClick={() => window.location.hash = '#/profile'}
                    className="underline text-black font-extrabold cursor-pointer hover:text-black/80"
                  >
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Subtabs for multi-step form */}
              <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'personal', label: '1. Personal Info', icon: User },
                  { id: 'school', label: '2. School & Talents', icon: BookOpen },
                  { id: 'parents', label: '3. Parents Details', icon: Heart }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-[10px] font-extrabold uppercase tracking-wider transition-all duration-350 hover:scale-[1.03] active:scale-[0.97] ${isActive
                        ? 'bg-brand text-white border-brand shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-brand hover:text-brand'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleCigiRedirect} className="space-y-6 text-xs font-semibold text-black/80">

                {/* TAB 1: PERSONAL DETAILS */}
                {activeTab === 'personal' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Name of Student</label>
                        <input required type="text" name="name" placeholder="Your full name" value={aptitudeForm.name} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Email</label>
                        <input required type="email" name="email" placeholder="name@email.com" value={aptitudeForm.email} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Confirm Email</label>
                        <input required type="email" name="confirmEmail" placeholder="Re-enter email" value={aptitudeForm.confirmEmail} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Date of Birth</label>
                        <input required type="text" name="dob" placeholder="as 25-01-2006" value={aptitudeForm.dob} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Gender</label>
                        <div className="flex gap-4 pt-1">
                          {['Male', 'Female'].map(g => (
                            <label key={g} className="flex items-center gap-1.5 text-xs text-black cursor-pointer">
                              <input type="radio" name="gender" value={g} checked={aptitudeForm.gender === g} onChange={handleInputChange} className="w-3.5 h-3.5 accent-black" />
                              <span>{g}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Phone</label>
                        <div className="flex gap-2">
                          <input type="text" name="phoneCode" value={aptitudeForm.phoneCode} onChange={handleInputChange} className="w-14 p-3 bg-white/70 border border-black/10 rounded-[4px] text-center" />
                          <input required type="tel" name="phone" placeholder="e.g. 8086664001" value={aptitudeForm.phone} onChange={handleInputChange} className="flex-1 p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">WhatsApp</label>
                        <input type="tel" name="whatsapp" placeholder="e.g. 8086664001" value={aptitudeForm.whatsapp} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Home District</label>
                        <select name="homeDistrict" value={aptitudeForm.homeDistrict} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand cursor-pointer">
                          <option value="">Select District</option>
                          {DISTRICTS_KERALA.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Grade</label>
                        <select name="grade" value={aptitudeForm.grade} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand cursor-pointer">
                          <option value="">Select Grade</option>
                          {['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Graduate', 'Other'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={() => setActiveTab('school')} className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition cursor-pointer flex items-center gap-1.5">
                        <span>Next Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: SCHOOL DETAILS */}
                {activeTab === 'school' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School Name</label>
                        <input type="text" name="schoolName" placeholder="Name of the school" value={aptitudeForm.schoolName} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School State</label>
                        <input type="text" name="schoolState" value={aptitudeForm.schoolState} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">School District</label>
                        <select name="schoolDistrict" value={aptitudeForm.schoolDistrict} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand cursor-pointer">
                          <option value="">Select District</option>
                          {DISTRICTS_KERALA.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Medium</label>
                        <div className="flex gap-4 pt-1">
                          {['English', 'Malayalam', 'Other'].map(m => (
                            <label key={m} className="flex items-center gap-1.5 text-xs text-black cursor-pointer">
                              <input type="radio" name="medium" value={m} checked={aptitudeForm.medium === m} onChange={handleInputChange} className="w-3.5 h-3.5 accent-black" />
                              <span>{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold mb-1">Board</label>
                        <div className="flex gap-4 pt-1">
                          {['Kerala-State', 'CBSE', 'ICSE', 'Other'].map(b => (
                            <label key={b} className="flex items-center gap-1.5 text-xs text-black cursor-pointer">
                              <input type="radio" name="board" value={b} checked={aptitudeForm.board === b} onChange={handleInputChange} className="w-3.5 h-3.5 accent-black" />
                              <span>{b}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Career Interests</label>
                        <input type="text" name="careerInterests" placeholder="You can give more than one profession" value={aptitudeForm.careerInterests} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Special Talents</label>
                        <input type="text" name="specialTalents" placeholder="music, painting, cricket, athletics, etc." value={aptitudeForm.specialTalents} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Achievements</label>
                        <input type="text" name="achievements" placeholder="Recognition in School / District / State Level" value={aptitudeForm.achievements} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <button type="button" onClick={() => setActiveTab('personal')} className="px-5 py-2.5 bg-white border border-gray-250 text-gray-700 hover:border-black hover:text-black font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition cursor-pointer flex items-center gap-1.5">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                      <button type="button" onClick={() => setActiveTab('parents')} className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition cursor-pointer flex items-center gap-1.5">
                        <span>Next Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: PARENTS DETAILS (Batch section removed) */}
                {activeTab === 'parents' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Guardian Name</label>
                        <input required type="text" name="guardianName" placeholder="name of parent or guardian" value={aptitudeForm.guardianName} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Relationship</label>
                        <select name="guardianRelationship" value={aptitudeForm.guardianRelationship} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand cursor-pointer">
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Uncle">Uncle</option>
                          <option value="Aunt">Aunt</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Guardian Phone</label>
                        <input type="tel" name="guardianPhone" placeholder="Guardian mobile number" value={aptitudeForm.guardianPhone} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Father's Education</label>
                        <input type="text" name="fatherQualification" placeholder="Qualification of Father" value={aptitudeForm.fatherQualification} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Mother's Education</label>
                        <input type="text" name="motherQualification" placeholder="Qualification of Mother" value={aptitudeForm.motherQualification} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-black/50 uppercase tracking-wider block text-[9px] font-extrabold">Father's Occupation</label>
                        <input type="text" name="fatherOccupation" placeholder="Occupation of Father" value={aptitudeForm.fatherOccupation} onChange={handleInputChange} className="w-full p-3 bg-white/70 border border-black/10 rounded-[4px] outline-none focus:border-brand" />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-between items-stretch sm:items-center">
                      <button type="button" onClick={() => setActiveTab('school')} className="px-5 py-2.5 bg-white border border-gray-250 text-gray-700 hover:border-black hover:text-black font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                      <button type="submit" className="px-8 py-3 bg-brand hover:bg-brand-dark text-black font-bold text-[10px] uppercase tracking-wider rounded-[4px] transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto">
                        <span>Submit & Register on CIGI</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-black/[0.05]">
                  <p className="text-[9px] text-black/45 font-semibold">
                    <Info className="w-3.5 h-3.5 inline mr-1" /> Saves entered details and navigates directly to CIGI Registration Portal.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
