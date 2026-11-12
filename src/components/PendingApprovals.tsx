import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalibrationRecord } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Check, 
  X, 
  Lock
} from 'lucide-react';

export const PendingApprovals: React.FC = () => {
  const { records, currentUser, approveRecord, rejectRecord } = useApp();
  const [selectedRecord, setSelectedRecord] = useState<CalibrationRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pendingRecords = records.filter((r) => r.isActive && r.approvalStatus === 'Pending');

  const canApprove = currentUser.role === 'supervisor' || currentUser.role === 'officer';

  const handleOpenReview = (record: CalibrationRecord, action: 'approve' | 'reject') => {
    setSelectedRecord(record);
    setReviewAction(action);
    setEvalNotes(
      action === 'approve'
        ? 'Reviewed and verified in accordance with ISO 17025 standard operating procedures.'
        : 'Discrepancy detected in measurement readings / incomplete accreditation documentation.'
    );
    setActionMessage(null);
  };

  const handleConfirmReview = () => {
    if (!selectedRecord || !reviewAction) return;

    if (reviewAction === 'approve') {
      const res = approveRecord(selectedRecord.id, evalNotes);
      setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    } else {
      const res = rejectRecord(selectedRecord.id, evalNotes);
      setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    }

    setSelectedRecord(null);
    setReviewAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Context Banner */}
      <div className="bg-white rounded-lg border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Workflow Approval Queue
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {pendingRecords.length} Pending Review
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Review and approve daily operator verification tests and external accreditation calibration certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">Active Role:</span>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
              currentUser.role === 'supervisor'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : currentUser.role === 'officer'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {currentUser.role.toUpperCase()} ({currentUser.name})
            </span>
          </div>
        </div>

        {/* Permission Guard Notice for Operators */}
        {!canApprove && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Access Authorization Notice (RBAC FR-006):</strong> As an <strong>Operator</strong>, you can inspect submitted records but <strong>do not possess approval authorization</strong>. Switch to <em>Quality Supervisor</em> in the top status bar to test approvals.
            </span>
          </div>
        )}

        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded text-xs flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Pending Records Table / Cards */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Verification Queue
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            {pendingRecords.length} records requiring sign-off
          </span>
        </div>

        {pendingRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">Queue Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No pending calibration records awaiting review at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRecords.map((record) => (
              <div
                key={record.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {record.id}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        record.type === 'Internal'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {record.type === 'Internal' ? 'Internal Verification' : 'External Certificate'}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Result: {record.resultStatus}
                    </span>
                    {record.certificateNumber && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Cert No: {record.certificateNumber}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{record.instrumentName}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {record.instrumentId} · SN: {record.serialNo}
                    </p>
                  </div>

                  {/* Reading Details Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Standard (X₀):</span>
                      <span className="font-semibold text-slate-800">
                        {record.readings.standardReading} {record.readings.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Measured (X):</span>
                      <span className="font-semibold text-slate-800">
                        {record.readings.measuredReading} {record.readings.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Deviation (Δ):</span>
                      <span className="font-semibold text-teal-800">
                        {record.readings.deviation} {record.readings.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Tolerance (±δ):</span>
                      <span className="text-slate-700">
                        ±{record.readings.toleranceLimit} {record.readings.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>
                      Submitted by: <strong>{record.createdBy}</strong> ({record.createdRole})
                    </span>
                    <span>·</span>
                    <span>
                      Date: {record.date} ({new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    {record.calibrationBody && (
                      <>
                        <span>·</span>
                        <span>Body: {record.calibrationBody}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Supervisor Approval Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  {canApprove ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(record, 'reject')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReview(record, 'approve')}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 rounded text-xs font-medium border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        Restricted (Supervisor Only)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRecord && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
              reviewAction === 'approve' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {reviewAction === 'approve' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-700" />
                )}
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900">
                  {reviewAction === 'approve' ? 'Approve & Validate Record' : 'Reject Verification Record'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setReviewAction(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-mono">Instrument:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedRecord.instrumentName}
                </span>
                <span className="text-slate-500 font-mono block text-[11px]">
                  ID: {selectedRecord.instrumentId} · SN: {selectedRecord.serialNo}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Supervisor Audit Review Remarks *:
                </label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Enter evaluation notes or rejection rationale..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs font-mono"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600 text-[11px] font-mono leading-relaxed">
                <span className="block font-bold text-slate-800 uppercase">Audit Trail Logging:</span>
                This action will be permanently recorded under <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}) with ISO timestamp.
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(null);
                  setReviewAction(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-4 py-1.5 text-xs font-bold rounded text-white shadow-xs ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
