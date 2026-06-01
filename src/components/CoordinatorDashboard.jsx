import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Calendar, BarChart3, Settings, HelpCircle, 
  Search, Bell, Plus, CheckCircle, AlertCircle, ArrowUpRight, 
  Sparkles, Info, Award, Compass, MessageCircle, FileText, UserCheck, ShieldAlert
} from 'lucide-react';

const INITIAL_CASES = [
  {
    id: 'STU-8841',
    name: 'Fathima R.',
    service: 'Psychological Counselling',
    school: 'TechFlow Academy',
    stage: 'Schedule',
    advisor: 'Dr. Sarah Joseph (RCI)',
    riskScore: 82,
    riskLabel: 'Critical',
    weight: '2,800 pts',
    volume: '120 mins',
    reason: 'Severe academic anxiety. Undergoing clinical assessment. Focus: doorstep emotional support.',
    status: 'Critical'
  },
  {
    id: 'STU-4574',
    name: 'Goutham S.',
    service: 'Career Counselling',
    school: 'St. Marys HSS',
    stage: 'Advisor Assignment',
    advisor: 'Prof. Anand Kumar',
    riskScore: 65,
    riskLabel: 'High',
    weight: '1,500 pts',
    volume: '90 mins',
    reason: 'Parental conflict regarding stream choice. Mechanical aptitude is high, but parents insist on medical.',
    status: 'High'
  },
  {
    id: 'STU-7812',
    name: 'Adithya K.',
    service: 'CDAT Diagnostics',
    school: 'Model School Calicut',
    stage: 'Report Generated',
    advisor: 'Rinsha K. P.',
    riskScore: 28,
    riskLabel: 'Normal',
    weight: '2,100 pts',
    volume: '80 mins',
    reason: 'Completed scientific assessment. Needs final coordination and stream planning roadmap.',
    status: 'Active'
  },
  {
    id: 'STU-1029',
    name: 'Aiswarya M.',
    service: 'Psychological Counselling',
    school: 'Mambaram English Medium',
    stage: 'Details Confirmed',
    advisor: 'Dr. Sarah Joseph (RCI)',
    riskScore: 12,
    riskLabel: 'Low',
    weight: '3,200 pts',
    volume: '110 mins',
    reason: 'Routine session scheduling. Coping strategies for exam preparation. Normal developmental markers.',
    status: 'Active'
  }
];

const CORE_METRICS = [
  { label: 'Active Mentees', value: '142/150', color: 'text-brand' },
  { label: 'RCI Mentors', value: '18/20', color: 'text-white' },
  { label: 'Completed CDATs', value: '485', color: 'text-white' },
  { label: 'Active Sessions', value: '12', color: 'text-brand' },
  { label: 'Satisfaction Rate', value: '96.8%', color: 'text-emerald-400' }
];

export default function CoordinatorDashboard({ setView }) {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState('STU-8841');
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleCardClick = (id) => {
    setSelectedCaseId(id);
  };

  const handleReassign = (id) => {
    alert(`Reassigning advisor for ${id}. Notification sent to state coordinator registry.`);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-gray-300 font-sans flex select-none text-left">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-16 bg-[#0c0c0e] border-r border-white/[0.04] flex flex-col items-center py-6 justify-between shrink-0">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Logo Spot */}
          <div 
            onClick={() => window.location.hash = '#/'}
            className="w-10 h-10 rounded-[100px] bg-brand text-black flex items-center justify-center cursor-pointer shadow-md shadow-brand/20 hover:scale-105 transition-all"
          >
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex flex-col items-center gap-4 w-full">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', active: true },
              { icon: Users, label: 'Mentees' },
              { icon: Calendar, label: 'Calendar' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: Settings, label: 'Settings' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative group flex items-center justify-center w-full">
                  <button 
                    className={`w-10 h-10 rounded-[100px] flex items-center justify-center transition-all ${
                      item.active 
                        ? 'bg-white text-black font-bold shadow-lg' 
                        : 'bg-[#141417]/80 hover:bg-[#202025] hover:text-white text-gray-500'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </button>
                  {/* Tooltip */}
                  <span className="absolute left-18 bg-black border border-white/[0.06] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Support & Profile */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative group flex items-center justify-center w-full">
            <button className="w-10 h-10 rounded-[100px] bg-[#141417]/80 hover:bg-[#202025] hover:text-white text-gray-500 flex items-center justify-center">
              <HelpCircle className="w-4.5 h-4.5" />
            </button>
            <span className="absolute left-18 bg-black border border-white/[0.06] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 whitespace-nowrap">
              Support Desk
            </span>
          </div>

          <div 
            onClick={() => window.location.hash = '#/profile'}
            className="w-9 h-9 rounded-full bg-brand-dark/20 border border-brand/40 text-brand flex items-center justify-center font-bold text-xs cursor-pointer hover:border-brand transition-all"
            title="Coordinator Profile"
          >
            FM
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP HEADER */}
        <header className="h-16 border-b border-white/[0.04] bg-[#0c0c0e] px-6 flex items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-gray-500">
              <span>Behold Portal</span>
              <span className="mx-2 text-white/10">/</span>
              <span>Coordinator Console</span>
              <span className="mx-2 text-white/10">/</span>
              <span className="text-brand">Diagnostic Overview</span>
            </div>
            <button 
              onClick={() => window.location.hash = '#/'}
              className="sm:hidden text-xs text-brand font-bold uppercase tracking-wider"
            >
              ← Back
            </button>
          </div>

          {/* Search bar & notification */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search cases, schools, codes..." 
                className="w-56 bg-[#141417] border border-white/[0.05] rounded-[100px] pl-9 pr-4 py-1.5 text-xs outline-none focus:border-brand/40 text-white placeholder-gray-600 transition-all font-sans"
              />
            </div>

            <button className="w-8 h-8 rounded-full bg-[#141417] hover:bg-[#202025] flex items-center justify-center border border-white/[0.05] relative cursor-pointer text-gray-400 hover:text-white">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full"></span>
            </button>

            {/* Profile Summary */}
            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">Faizal Manager</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">State Registrar</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3. SUBHEADER ACTIONS & METRICS */}
        <div className="bg-[#09090b] px-6 py-5 border-b border-white/[0.02] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-header font-black text-white uppercase tracking-wider">
                Console Run: CN-9913-HX
              </h1>
              <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span> Live Tracking
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider font-mono">
              Diagnostic Queue & Counselling Coordinator Dashboard
            </p>
          </div>

          {/* Dynamic metrics bar */}
          <div className="flex flex-wrap items-center gap-3">
            {CORE_METRICS.map((metric, idx) => (
              <div 
                key={idx} 
                className="bg-[#101013] border border-white/[0.03] rounded-[4px] px-3.5 py-2 flex flex-col justify-center min-w-[90px] text-center"
              >
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-wider leading-none">
                  {metric.label}
                </span>
                <span className={`text-xs sm:text-sm font-black mt-1 ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
            ))}

            {/* Subheader Action buttons */}
            <div className="flex gap-2 pl-2">
              <button 
                onClick={() => window.location.hash = '#/booking'}
                className="px-4 py-2.5 bg-[#141417] hover:bg-[#202025] hover:text-white border border-white/[0.06] rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Intake Form
              </button>
              <button 
                onClick={() => window.location.hash = '#/sample-test'}
                className="px-4 py-2.5 bg-brand hover:bg-brand-dark text-black rounded-[4px] text-[10px] font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-brand/10 flex items-center gap-1.5"
              >
                <span>Launch Test</span>
                <Plus className="w-3.5 h-3.5 text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. DASHBOARD SPLIT VIEW */}
        <main className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#070708]">
          
          {/* A. LEFT COLUMN: COGNITIVE DIAGNOSTIC GRID & DOMAIN ANALYTICS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#0c0c0e]/80 border border-white/[0.04] rounded-[4px] p-6 flex flex-col justify-between space-y-6">
              
              {/* Header metrics inside the card */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-brand" /> CDAT Cognitive Coverage
                  </h2>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">
                    Evaluated parameters representing academic & stream alignment ratios.
                  </p>
                </div>
                <div className="flex gap-6 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold uppercase">Points Tracked:</span>
                    <span className="text-white font-extrabold">28,700 / 44,000 pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold uppercase">Diagnostic hours:</span>
                    <span className="text-white font-extrabold">2,390 / 2,400 mins</span>
                  </div>
                </div>
              </div>

              {/* Progress bars matching style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-gray-400">
                    <span>Diagnostic Points Capacity</span>
                    <span className="text-brand">65%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-[4px] overflow-hidden">
                    <div className="h-full bg-brand rounded-[4px] w-[65%]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-gray-400">
                    <span>Clinical Hour Limits</span>
                    <span className="text-rose-450">99.5%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-[4px] overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-[4px] w-[99.5%] animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Visual Seat/Cognitive affinity layout grid (Stunning High-Tech layout) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                  Student Assessment Seats Mapping (Active Diagnostic Grid)
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cases.map((c) => {
                    const isSelected = c.id === selectedCaseId;
                    return (
                      <div 
                        key={c.id}
                        onClick={() => handleCardClick(c.id)}
                        className={`p-4 rounded-[4px] border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[90px] relative ${
                          isSelected 
                            ? 'bg-brand/10 border-brand' 
                            : 'bg-[#101013]/60 hover:bg-[#101013] border-white/[0.04] hover:border-white/10'
                        }`}
                      >
                        {/* Status tag indicator dot */}
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full flex items-center justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'Critical' 
                              ? 'bg-rose-500' 
                              : c.status === 'High' 
                                ? 'bg-amber-500' 
                                : 'bg-brand'
                          }`} />
                        </div>

                        <div className="space-y-1">
                          <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-[2px] w-fit block ${
                            c.status === 'Critical' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : c.status === 'High' 
                                ? 'bg-amber-500/10 text-amber-400' 
                                : 'bg-brand/10 text-brand'
                          }`}>
                            {c.id}
                          </span>
                          <h4 className="font-header font-black text-xs uppercase tracking-wide text-white truncate mt-1">
                            {c.name}
                          </h4>
                        </div>

                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-500 pt-2 border-t border-white/[0.03]">
                          <span>{c.weight}</span>
                          <span>{c.status}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Placeholders matching layout grid */}
                  {[
                    { code: 'CN-1200', type: 'Normal', value: '1,200 pts', label: 'Idle' },
                    { code: 'CN-4500', type: 'Normal', value: '4,500 pts', label: 'Idle' },
                    { code: 'CN-2300', type: 'Normal', value: '2,300 pts', label: 'Idle' },
                    { code: 'CN-8900', type: 'Normal', value: '8,900 pts', label: 'Idle' }
                  ].map((p, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-[4px] border border-dashed border-white/[0.03] bg-[#0c0c0e]/30 flex flex-col justify-between min-h-[90px] opacity-40 hover:opacity-75 transition-opacity"
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono uppercase text-gray-600 border border-white/[0.05] px-1.5 py-0.5 rounded-[2px] w-fit block">
                          {p.code}
                        </span>
                        <h4 className="font-header font-bold text-xs uppercase tracking-wide text-gray-500 mt-1">
                          Diagnostic Slot
                        </h4>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-gray-600 pt-2 border-t border-white/[0.03]">
                        <span>{p.value}</span>
                        <span>{p.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Cognitive affinity charts layout row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Numerical Aptitude', val: 78, score: 'Excellent' },
                { label: 'Spatial Visualization', val: 89, score: 'Superior' },
                { label: 'Emotional Resilience', val: 42, score: 'Attention Needed' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#0c0c0e]/80 border border-white/[0.04] p-5 rounded-[4px] space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">
                      {item.label}
                    </span>
                    <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                      item.val > 75 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : item.val > 50 
                          ? 'bg-brand/10 text-brand' 
                          : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.score}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-header font-black text-white">{item.val}%</span>
                    <span className="text-[8px] font-mono text-gray-600">ratio index</span>
                  </div>
                  <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.val > 75 
                          ? 'bg-emerald-400' 
                          : item.val > 50 
                            ? 'bg-brand' 
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* B. RIGHT COLUMN: COUNSELLING BOOKING QUEUE (CASE ANALYSIS) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0c0c0e]/80 border border-white/[0.04] rounded-[4px] p-5 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">
                      Active Intake Case Files
                    </h3>
                    <p className="text-[8px] text-gray-500 font-mono mt-0.5">
                      Queue: {cases.length} cases total | Weight metric: 10.6k pts
                    </p>
                  </div>
                  <button 
                    onClick={() => setCases(INITIAL_CASES)}
                    className="text-[8px] text-brand hover:underline font-bold uppercase"
                  >
                    Reset List
                  </button>
                </div>

                {/* Main Selected Case Details card */}
                <div className="bg-[#101013]/60 border border-brand/20 p-5 rounded-[4px] space-y-6">
                  
                  {/* Title & priority */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="inline-block text-[8px] bg-brand text-black px-2 py-0.5 font-bold uppercase tracking-widest font-mono rounded-[2px]">
                        {activeCase.id}
                      </span>
                      <h4 className="font-header font-black text-sm uppercase tracking-wide text-white mt-1">
                        {activeCase.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide italic">
                        {activeCase.service}
                      </p>
                    </div>

                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[2px] ${
                      activeCase.status === 'Critical' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                        : activeCase.status === 'High' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                          : 'bg-brand/10 text-brand border border-brand/25'
                    }`}>
                      {activeCase.riskLabel} Risk
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-b border-white/[0.04] py-4">
                    <div className="space-y-1">
                      <span className="text-gray-500 uppercase font-bold block">School Partner</span>
                      <span className="text-white font-medium">{activeCase.school}</span>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-gray-500 uppercase font-bold block">Assigned Mentor</span>
                      <span className="text-brand font-medium truncate block">{activeCase.advisor}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-500 uppercase font-bold block">In-flow Stage</span>
                      <span className="text-white font-medium">{activeCase.stage}</span>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-gray-500 uppercase font-bold block">Evaluated Weight</span>
                      <span className="text-white font-mono font-medium">{activeCase.weight}</span>
                    </div>
                  </div>

                  {/* Risk gauge progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-gray-400">
                      <span>Adolescent Stress Risk Ratio</span>
                      <span className={activeCase.riskScore > 75 ? 'text-rose-450' : 'text-brand'}>
                        {activeCase.riskScore}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeCase.riskScore > 75 
                            ? 'bg-rose-500' 
                            : activeCase.riskScore > 50 
                              ? 'bg-amber-500' 
                              : 'bg-brand'
                        }`}
                        style={{ width: `${activeCase.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Fragile warning details box (Matching layout warning block) */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-[4px] flex gap-3 text-left">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-amber-400 block">
                        Case Sensitivity Alert
                      </span>
                      <p className="text-[9px] text-gray-400 leading-relaxed font-light mt-1">
                        {activeCase.reason}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons matching packages card list */}
                  <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
                    <button 
                      onClick={() => handleReassign(activeCase.id)}
                      className="flex-1 py-3 bg-[#141417] hover:bg-[#202025] hover:text-white border border-white/[0.06] rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition cursor-pointer text-center"
                    >
                      Reassign Advisor
                    </button>
                    <a
                      href="https://wa.me/919497174011"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 bg-brand hover:bg-brand-dark text-black rounded-[4px] text-[10px] font-black uppercase tracking-wider transition cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Join Tele-Session</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              </div>

              {/* Support reference note */}
              <div className="p-4 bg-[#0a0a0c] border border-white/[0.03] rounded-[4px] flex items-start gap-2.5 text-[9px]">
                <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <p className="text-gray-500 leading-relaxed">
                  Active diagnostic records are protected under clinical compliance rules. Contact state operations desk for audit controls.
                </p>
              </div>

            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
