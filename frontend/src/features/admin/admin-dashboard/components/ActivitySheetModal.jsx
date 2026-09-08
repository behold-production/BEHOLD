import React, { useState, useEffect } from 'react';
import { X, FileText, UploadCloud, Share2, Eye, Download, CheckCircle, Clock } from 'lucide-react';
import ApiService from '../../../../services/api';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../../../services/api';

export default function ActivitySheetModal({ booking, onClose }) {
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [optionalMessage, setOptionalMessage] = useState('');

  const fetchWorksheets = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getSessionWorksheets(booking.id || booking.sessionId);
      if (res.success) {
        setWorksheets(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load worksheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (booking) {
      fetchWorksheets();
    }
  }, [booking]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a PDF file first.');
    if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed.');

    try {
      setUploading(true);
      const res = await ApiService.uploadWorksheet(
        booking.id || booking.sessionId, 
        booking.userId || booking.studentId || booking.student?.id,
        file, 
        optionalMessage
      );
      if (res.success) {
        toast.success('Activity sheet uploaded successfully');
        setFile(null);
        setOptionalMessage('');
        fetchWorksheets();
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Error uploading worksheet');
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (worksheetId) => {
    try {
      const res = await ApiService.shareWorksheet(worksheetId);
      if (res.success) {
        toast.success('Worksheet shared! WhatsApp notification sent.');
        fetchWorksheets();
      } else {
        toast.error(res.message || 'Failed to share worksheet');
      }
    } catch (err) {
      toast.error('Error sharing worksheet');
    }
  };

  const token = localStorage.getItem('behold_token');
  const apiUrl = getApiUrl(); // E.g., https://behold-api.com/api/v1

  const renderStatus = (status) => {
    switch(status) {
      case 'DRAFT': return <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs font-bold">DRAFT</span>;
      case 'SHARED': return <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Share2 className="w-3 h-3"/> SHARED</span>;
      case 'VIEWED': return <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Eye className="w-3 h-3"/> VIEWED</span>;
      case 'IN_PROGRESS': return <span className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> IN PROGRESS</span>;
      case 'SUBMITTED': return <span className="bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> SUBMITTED</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Session Activity Sheets
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Share tasks or worksheets with {booking.studentName || 'the client'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent flex flex-col gap-8">
          
          {/* Upload New Worksheet */}
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload New Activity Sheet
            </h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">PDF Document</label>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Optional Message</label>
                <textarea 
                  value={optionalMessage}
                  onChange={(e) => setOptionalMessage(e.target.value)}
                  placeholder="Instructions for the client..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none h-20"
                />
              </div>
              <button 
                type="submit" 
                disabled={uploading || !file}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-emerald-900/20"
              >
                {uploading ? 'Uploading...' : 'Upload & Save Draft'}
              </button>
            </form>
          </div>

          {/* Existing Worksheets */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Uploaded Activity Sheets
            </h3>
            
            {loading ? (
              <p className="text-sm text-zinc-500">Loading worksheets...</p>
            ) : worksheets.length === 0 ? (
              <p className="text-sm text-zinc-500">No activity sheets uploaded for this session yet.</p>
            ) : (
              <div className="space-y-3">
                {worksheets.map((ws) => (
                  <div key={ws.worksheetId} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-bold text-white">{ws.originalFileName}</p>
                        {renderStatus(ws.status)}
                      </div>
                      {ws.optionalMessage && (
                        <p className="text-xs text-zinc-400 mt-2 italic bg-zinc-950/50 p-2 rounded-lg border border-zinc-800">"{ws.optionalMessage}"</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {ws.status === 'DRAFT' && (
                        <button
                          onClick={() => handleShare(ws.worksheetId)}
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-900/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                      )}
                      
                      <a 
                        href={`${apiUrl}/worksheets/psychologist/${ws.worksheetId}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={(e) => {
                           // Quick hack: manually add Auth header if needed, but since it's an <a> tag we can't easily send headers. 
                           // Wait, standard token-based API needs headers. So we should fetch as blob and download it.
                           e.preventDefault();
                           fetch(`${apiUrl}/worksheets/psychologist/${ws.worksheetId}/file`, {
                             headers: { 'Authorization': `Bearer ${token}` }
                           })
                           .then(res => res.blob())
                           .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = ws.originalFileName;
                              a.click();
                           });
                        }}
                      >
                        <Download className="w-3.5 h-3.5" /> Original
                      </a>
                      
                      {ws.status === 'SUBMITTED' && ws.submissionStorageKey && (
                        <a 
                          href="#"
                          className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/10"
                          onClick={(e) => {
                            e.preventDefault();
                            fetch(`${apiUrl}/worksheets/psychologist/${ws.worksheetId}/submission-file`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                            .then(res => res.blob())
                            .then(blob => {
                               const url = window.URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url;
                               a.download = ws.submissionFileName || 'completed_worksheet.pdf';
                               a.click();
                            });
                          }}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> View Submission
                        </a>
                      )}
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
}
