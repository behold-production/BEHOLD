import React from 'react';
import {
  BarChart3, Activity, Target, RefreshCw, Briefcase,
  Check, Award, ExternalLink, X as XIcon
} from 'lucide-react';
import { CAREER_SUGGESTIONS } from '../constants';
import { formatDateString } from '../../../../shared/utils/dateFormatter';

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
        <h2 className="text-xl font-bold text-zinc-950">Aptitude Test Results</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Access your sample diagnostic test results and upload external CIGI Differential Aptitude Test (C-DAT) results.
        </p>
      </div>

      {/* Grid layout for two sections: Sample Test and CIGI Test */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Column 1: Sample Test Results */}
        <div className="xl:col-span-7 space-y-6">
          <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-700 animate-pulse" /> Sample Aptitude Test (C-DAT)
            </h3>
            
            {!testProfile ? (
              <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-200 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">No Sample Test History</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Take the Behold sample diagnostic test to map your strengths.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/sample-test')}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors border-none"
                >
                  <Target className="w-3.5 h-3.5" /> Start Sample Test
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Dominant Domain Card */}
                <div className="bg-zinc-900 rounded-xl p-5 text-white">
                  <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">Dominant Domain</p>
                  <h4 className="text-xl font-bold text-white">{topDomain}</h4>
                  <p className="text-xs text-zinc-400 mt-1.5">
                    Your primary strength outcome. Click below to view the full detailed breakdown.
                  </p>
                  <div className="mt-3.5 flex justify-between items-center">
                    <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-md">
                      Score: {scores.find(([k]) => k === topDomain)?.[1] || 100}%
                    </span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Strength Domains</p>
                  {scores.slice(0, 4).map(([key, pct]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-700">{key}</span>
                        <span className="text-zinc-900 font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/sample-test')}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 font-medium rounded-lg text-xs transition-colors bg-white cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Sample Test
                </button>
              </div>
            )}
          </div>

          {/* Career Suggestions */}
          {testProfile && topDomain && CAREER_SUGGESTIONS[topDomain] && (
            <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-400" /> Career Alignment
              </h3>
              <p className="text-xs text-zinc-400 mb-3">Paths suited for {topDomain} strength.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAREER_SUGGESTIONS[topDomain].map((career, i) => (
                  <div key={i} className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-zinc-200 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-zinc-600" />
                    </div>
                    <span className="text-xs font-medium text-zinc-800">{career}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: CIGI Aptitude Test Results & Uploads */}
        <div className="xl:col-span-5 space-y-6">
          {/* Upload form */}
          <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-semibold text-zinc-900 mb-1.5 flex items-center gap-2">
              <Award className="w-4 h-4 text-zinc-750" /> CIGI Aptitude Test (C-DAT)
            </h3>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Registered and took the test on CIGI's site? Upload your scorecard/result (Image or PDF) below.
            </p>

            <form onSubmit={handleCigiUpload} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Upload Result File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setCigiFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                  required
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 file:cursor-pointer p-2 border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Allowed formats: JPG, JPEG, PNG, PDF (Max 5MB)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Date Taken</label>
                  <input
                    type="date"
                    value={cigiDate}
                    onChange={(e) => setCigiDate(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-700 block mb-1">Time Taken</label>
                  <input
                    type="time"
                    value={cigiTime}
                    onChange={(e) => setCigiTime(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">Remarks / Note</label>
                <textarea
                  placeholder="E.g. Got high scores in mathematical reasoning..."
                  value={cigiNote}
                  onChange={(e) => setCigiNote(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-zinc-200 rounded-lg text-xs focus:ring-1 focus:ring-zinc-400 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCigiUploading}
                className="w-full min-h-[38px] inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-500 text-white rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer"
              >
                {isCigiUploading ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <>Upload Result</>
                )}
              </button>
            </form>
          </div>

          {/* Results list */}
          <div className="card-luxury border-none rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">Uploaded CIGI Results ({cigiResultsList.length})</h3>

            {cigiResultsList.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                <p className="text-xs">No result files uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {cigiResultsList.map((result) => (
                  <div key={result.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${result.fileType === 'pdf' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          {result.fileType}
                        </span>
                        {(result.testDate || result.testTime) && (
                          <span className="text-[10px] text-zinc-500">
                            {formatDateString(result.testDate)} {result.testTime}
                          </span>
                        )}
                      </div>
                      {result.note && (
                        <p className="text-xs text-zinc-600 mt-1 truncate" title={result.note}>
                          {result.note}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Uploaded {formatDateString(result.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={result.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors"
                        title="View document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCigiDelete(result.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors"
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
