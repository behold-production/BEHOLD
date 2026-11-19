import React from 'react';
import { FileText, Download, Calendar, Activity, ShieldCheck, User } from 'lucide-react';

export default function MobileRecordsScreen({
  completedSessions = [],
  profile = {},
  formData = {},
  downloadPDFReceiptForSession,
  downloadConsultationReportPDF,
  onNavigateTab,
}) {
  return (
    <div className="pb-24 pt-4 px-4 bg-[#F8FAFC] min-h-screen text-slate-900">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-slate-900">Health & Consultation Records</h2>
        <p className="text-xs text-slate-500 mt-0.5">Clinical notes, vitals & digital receipts</p>
      </div>

      {/* Clinical Vitals Summary Box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-[#0E7490]">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Client Vitals</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(3)}
            className="text-xs font-bold text-[#0E7490]"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HEIGHT</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{formData?.height || 172}</span>
            <span className="text-[10px] font-semibold text-slate-400">CM</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WEIGHT</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-0.5">{formData?.weight || 68}</span>
            <span className="text-[10px] font-semibold text-slate-400">KG</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BLOOD</span>
            <span className="text-sm font-extrabold text-[#0E7490] block mt-0.5">{formData?.bloodGroup || 'O+'}</span>
            <span className="text-[10px] font-semibold text-slate-400">TYPE</span>
          </div>
        </div>
      </div>

      {/* Consultation History Records */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Consultation History ({completedSessions.length})</h3>

        {completedSessions.length > 0 ? (
          completedSessions.map((session) => {
            const sid = session._id || session.id;
            const therapist = session.counsellorName || session.therapistName || 'Clinical Psychologist';
            const date = session.date || session.slotDate || 'Session Date';

            return (
              <div
                key={sid}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{therapist}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {date}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => downloadPDFReceiptForSession?.(session)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Receipt PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadConsultationReportPDF?.(session)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-1.5 text-xs font-bold text-slate-700 active:scale-95"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Report PDF
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center rounded-2xl bg-white border border-slate-200 p-6">
            <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Consultation Records Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Completed consultations and digital session receipts will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Privacy Assurance Card */}
      <div className="mt-4 rounded-2xl bg-cyan-50/70 border border-cyan-100 p-3.5 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[#0E7490] shrink-0" />
        <p className="text-[11px] text-cyan-900 leading-relaxed font-medium">
          All clinical records and notes are end-to-end encrypted under professional psychological codes of confidentiality.
        </p>
      </div>
    </div>
  );
}
