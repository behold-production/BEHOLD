import React from 'react';
import {
 BarChart3, Activity, Target, RefreshCw, Briefcase,
 Check, Award, ExternalLink, X as XIcon
} from 'lucide-react';
import { CAREER_SUGGESTIONS } from '../../utils/studentProfileConstants';
import { formatDateString } from '../../../../utils/dateFormatter';

const ResultsTab = ({
 profile,
 testProfile,
 navigate,
 handleCigiUpload,
 fileInputRef,
 setCigiFile,
 cigiDate,
 setCigiDate,
 cigiTime,
 setCigiTime,
 cigiNote,
 setCigiNote,
 isCigiUploading,
 handleCigiDelete
}) => {
 const cigiResultsList = profile.cigiResults || [];
 const scores = testProfile ? Object.entries(testProfile.scores || {}) : [];
 const topDomain = testProfile?.dominantDomain;

 return (
 <div className="space-y-6 text-left">
 <div>
 <h2 className="text-xl font-semibold text-[#0e1111] tracking-tight">Aptitude Test Results</h2>
 <p className="text-sm text-[#7c8785] mt-1">
 Access your sample diagnostic test results and upload external CIGI Differential Aptitude Test (C-DAT) results.
 </p>
 </div>

 {/* Grid layout for two sections: Sample Test and CIGI Test */}
 <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
 {/* Column 1: Sample Test Results */}
 <div className="xl:col-span-7 space-y-6">
 <div className="bg-white border border-[#e6dfd0] rounded-[10px] shadow-square-light p-5">
 <h3 className="text-base font-semibold text-[#0e1111] mb-3 flex items-center gap-2">
 <BarChart3 className="w-4 h-4 text-[#3c4747] animate-pulse" /> Sample Aptitude Test (C-DAT)
 </h3>
 
 {!testProfile ? (
 <div className="bg-[#f6f1e6] border border-dashed border-[#d5cdbb] rounded-[10px] p-8 text-center">
 <div className="w-12 h-12 mx-auto rounded-[10px] bg-[#e6dfd0] flex items-center justify-center mb-3">
 <Activity className="w-6 h-6 text-[#7c8785]" />
 </div>
 <p className="text-sm font-semibold tracking-widest text-[#0e1111]">No Sample Test History</p>
 <p className="text-xs text-[#7c8785] mt-1 max-w-sm mx-auto">
 Take the Behold sample diagnostic test to map your strengths.
 </p>
 <button
 type="button"
 onClick={() => navigate('/sample-test')}
 className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-[#0e1111] text-white tracking-widest text-[10px] font-semibold rounded-[10px] hover:bg-[#243033] transition-colors border-none shadow-none"
 >
 <Target className="w-3.5 h-3.5" /> Start Sample Test
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 {/* Dominant Domain Card */}
 <div className="bg-[#0e1111] rounded-[10px] p-5 text-white">
 <p className="text-[10px] text-[#9aa29f] font-semibold tracking-widest mb-1">Dominant Domain</p>
 <h4 className="text-xl font-semibold tracking-widest text-white">{topDomain}</h4>
 <p className="text-xs text-[#9aa29f] mt-1.5">
 Your primary strength outcome. Click below to view the full detailed breakdown.
 </p>
 <div className="mt-3.5 flex justify-between items-center">
 <span className="text-[10px] tracking-widest font-semibold px-2.5 py-1 bg-white/10 rounded-[10px]">
 Score: {scores.find(([k]) => k === topDomain)?.[1] || 100}%
 </span>
 </div>
 </div>

 {/* Score Breakdown */}
 <div className="space-y-3 pt-2">
 <p className="text-[10px] font-semibold text-[#7c8785] tracking-widest">Top Strength Domains</p>
 {scores.slice(0, 4).map(([key, pct]) => (
 <div key={key} className="space-y-1">
 <div className="flex justify-between tracking-widest font-semibold text-[10px]">
 <span className="text-[#3c4747]">{key}</span>
 <span className="text-[#0e1111]">{pct}%</span>
 </div>
 <div className="h-1.5 w-full bg-[#f1eadc] rounded-[10px] overflow-hidden">
 <div className="h-full bg-[#0e1111] rounded-[10px]" style={{ width: `${pct}%` }} />
 </div>
 </div>
 ))}
 </div>

 <button
 type="button"
 onClick={() => navigate('/sample-test')}
 className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#e6dfd0] hover:border-[#d5cdbb] text-[#0e1111] tracking-widest text-[10px] font-semibold rounded-[10px] hover:bg-[#f6f1e6] transition-colors bg-white cursor-pointer"
 >
 <RefreshCw className="w-3.5 h-3.5" /> Retake Sample Test
 </button>
 </div>
 )}
 </div>

 {/* Career Suggestions */}
 {testProfile && topDomain && CAREER_SUGGESTIONS[topDomain] && (
 <div className="bg-white border border-[#e6dfd0] rounded-[10px] shadow-square-light p-5">
 <h3 className="text-sm font-semibold text-[#0e1111] mb-1 flex items-center gap-2">
 <Briefcase className="w-4 h-4 text-[#9aa29f]" /> Career Alignment
 </h3>
 <p className="text-xs text-[#7c8785] mb-3">Paths suited for {topDomain} strength.</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {CAREER_SUGGESTIONS[topDomain].map((career, i) => (
 <div key={i} className="bg-[#f6f1e6] border border-[#e6dfd0] rounded-[10px] p-2.5 flex items-center gap-2">
 <div className="w-5 h-5 rounded-[10px] bg-[#e6dfd0] flex items-center justify-center shrink-0">
 <Check className="w-3 h-3 text-[#55605f]" />
 </div>
 <span className="text-[10px] tracking-widest font-semibold text-[#0e1111]">{career}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>

 {/* Column 2: CIGI Aptitude Test Results & Uploads */}
 <div className="xl:col-span-5 space-y-6">
 {/* Upload form */}
 <div className="bg-white border border-[#e6dfd0] rounded-[10px] shadow-square-light p-5">
 <h3 className="text-base font-semibold text-[#0e1111] mb-1.5 flex items-center gap-2">
 <Award className="w-4 h-4 text-[#243033]" /> CIGI Aptitude Test (C-DAT)
 </h3>
 <p className="text-xs text-[#7c8785] mb-4 leading-relaxed">
 Registered and took the test on CIGI's site? Upload your scorecard/result (Image or PDF) below.
 </p>

 <form onSubmit={handleCigiUpload} className="space-y-3.5">
 <div>
 <label className="text-[10px] tracking-widest font-semibold text-[#55605f] block mb-1">
 Upload Result File <span className="text-rose-500">*</span>
 </label>
 <input
 type="file"
 ref={fileInputRef}
 onChange={(e) => setCigiFile(e.target.files[0])}
 accept="image/*,application/pdf"
 required
 className="w-full text-sm font-medium text-[#0e1111] file:mr-3 file:py-1.5 file:px-3 file:rounded-[10px] file:border-0 file:text-[10px] file: file:tracking-widest file:font-semibold file:bg-[#e6dfd0] file:text-[#0e1111] hover:file:bg-[#d5cdbb] file:cursor-pointer p-2 border border-[#e6dfd0] rounded-[10px] bg-[#f6f1e6] focus:outline-none"
 />
 <p className="text-[10px] font-semibold tracking-widest text-[#9aa29f] mt-1">Allowed formats: JPG, JPEG, PNG, PDF (Max 5MB)</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] tracking-widest font-semibold text-[#55605f] block mb-1">Date Taken</label>
 <input
 type="date"
 value={cigiDate}
 onChange={(e) => setCigiDate(e.target.value)}
 className="w-full p-2 border border-[#e6dfd0] rounded-[10px] text-sm font-medium bg-[#f6f1e6] text-[#0e1111] focus:ring-0 focus:border-[#0e1111] focus:bg-white outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] tracking-widest font-semibold text-[#55605f] block mb-1">Time Taken</label>
 <input
 type="time"
 value={cigiTime}
 onChange={(e) => setCigiTime(e.target.value)}
 className="w-full p-2 border border-[#e6dfd0] rounded-[10px] text-sm font-medium bg-[#f6f1e6] text-[#0e1111] focus:ring-0 focus:border-[#0e1111] focus:bg-white outline-none"
 />
 </div>
 </div>

 <div>
 <label className="text-[10px] tracking-widest font-semibold text-[#55605f] block mb-1">Remarks / Note</label>
 <textarea
 placeholder="E.g. Got high scores in mathematical reasoning..."
 value={cigiNote}
 onChange={(e) => setCigiNote(e.target.value)}
 rows={2}
 className="w-full p-2 border border-[#e6dfd0] rounded-2xl text-sm font-medium bg-[#f6f1e6] text-[#0e1111] focus:ring-0 focus:border-[#0e1111] focus:bg-white outline-none resize-none"
 />
 </div>

 <button
 type="submit"
 disabled={isCigiUploading}
 className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0e1111] hover:bg-[#243033] disabled:bg-[#7c8785] disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all border-none shadow-xs cursor-pointer hover-scale-btn"
 >
 {isCigiUploading ? (
 <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
 ) : (
 <>Upload Result</>
 )}
 </button>
 </form>
 </div>

 {/* Results list */}
 <div className="bg-white border border-[#e6dfd0] rounded-2xl shadow-square-light p-5">
 <h3 className="text-sm font-semibold text-[#0e1111] mb-3">Uploaded CIGI Results ({cigiResultsList.length})</h3>

 {cigiResultsList.length === 0 ? (
 <div className="text-center py-6 text-[#9aa29f] border border-dashed border-[#e6dfd0] rounded-[10px] bg-[#f6f1e6]">
 <p className="text-[10px] font-semibold tracking-widest">No result files uploaded yet.</p>
 </div>
 ) : (
 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
 {cigiResultsList.map((result) => (
 <div key={result.id} className="p-3 bg-white border border-[#e6dfd0] rounded-[10px] flex items-center justify-between gap-3 text-left">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={`text-[10px] px-1.5 py-0.5 rounded-[10px] font-semibold ${result.fileType === 'pdf' ? 'bg-rose-100 text-rose-700' : 'bg-[#f0e9dc] text-[#0b5c73]'}`}>
 {result.fileType}
 </span>
 {(result.testDate || result.testTime) && (
 <span className="text-[10px] text-[#7c8785] font-semibold tracking-widest">
 {formatDateString(result.testDate)} {result.testTime}
 </span>
 )}
 </div>
 {result.note && (
 <p className="text-xs text-[#55605f] font-medium mt-1 truncate" title={result.note}>
 {result.note}
 </p>
 )}
 <p className="text-[10px] text-[#9aa29f] font-semibold tracking-widest mt-0.5">
 Uploaded {formatDateString(result.uploadedAt)}
 </p>
 </div>

 <div className="flex items-center gap-1.5 shrink-0">
 <a
 href={result.fileUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="p-1.5 bg-[#f6f1e6] hover:bg-[#f1eadc] border border-[#e6dfd0] rounded-[10px] text-[#0e1111] transition-colors"
 title="View document"
 >
 <ExternalLink className="w-3.5 h-3.5" />
 </a>
 <button
 type="button"
 onClick={() => handleCigiDelete(result.id)}
 className="p-1.5 bg-[#f6f1e6] hover:bg-rose-50 border border-[#e6dfd0] hover:border-rose-200 rounded-[10px] text-[#0e1111] hover:text-rose-600 transition-colors cursor-pointer"
 title="Delete result"
 >
 <XIcon className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default ResultsTab;
