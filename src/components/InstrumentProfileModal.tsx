import React, { useState, useEffect } from 'react';
import { Instrument } from '../types';
import { useApp } from '../context/AppContext';
import { generateQrDataUrl } from '../utils/qr';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  History, 
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface InstrumentProfileModalProps {
  instrument: Instrument | null;
  isOpen: boolean;
  onClose: () => void;
  onStartVerification: (instrument: Instrument) => void;
  onStartExternalCert: (instrument: Instrument) => void;
}

export const InstrumentProfileModal: React.FC<InstrumentProfileModalProps> = ({
  instrument,
  isOpen,
  onClose,
  onStartVerification,
  onStartExternalCert,
}) => {
  const { currentUser, activateInstrument, records } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (instrument) {
      generateQrDataUrl(instrument.qrCodeRef || `LAB-QR-${instrument.id}`).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [instrument]);

  if (!isOpen || !instrument) return null;

  const instrumentRecords = records.filter(
    (r) => r.instrumentId === instrument.id && r.isActive
  );

  const statusConfig = {
    active: {
      label: 'Active (Compliant & Valid)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    },
    out_of_service: {
      label: 'Quarantined (Out of Service)',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    },
    due_soon: {
      label: 'Approaching Due Date',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
    },
  }[instrument.status];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Lab_Tag_${instrument.id}_${instrument.serialNo}.png`;
    a.click();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(instrument.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs no-print">
      <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-teal-800 text-white flex items-center justify-center font-mono font-bold text-xs">
              {instrument.id.split('-')[1]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{instrument.name}</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${statusConfig.badgeClass}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                SN: {instrument.serialNo} · Category: {instrument.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quarantine Alert Warning if out of service */}
        {instrument.status === 'out_of_service' && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-3 flex items-start justify-between gap-4 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900 uppercase">
                  Instrument Quarantined (Auto-Quarantine Active)
                </p>
                <p className="text-rose-800 mt-0.5 text-[11px]">
                  Reason: {instrument.quarantineReason || 'Failed tolerance verification.'}
                </p>
                {instrument.quarantineTimestamp && (
                  <p className="text-[10px] text-rose-600 mt-0.5">
                    Logged at: {new Date(instrument.quarantineTimestamp).toLocaleString('en-US')}
                  </p>
                )}
              </div>
            </div>

            {(currentUser.role === 'supervisor' || currentUser.role === 'officer') && (
              <button
                type="button"
                onClick={() => activateInstrument(instrument.id)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors"
                title="Reactivate instrument after maintenance verification"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reactivate Instrument</span>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Main Grid: Info + QR Tag Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 2 Cols: Technical Parameters */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded p-4 font-mono">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Technical Specifications & Tolerance Bounds
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Instrument ID:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-900">{instrument.id}</span>
                      <button
                        onClick={handleCopyId}
                        className="text-[10px] text-teal-700 hover:underline"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Location:</span>
                    <span className="font-medium text-slate-800 block mt-0.5 truncate">{instrument.location}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">LGM Reference No:</span>
                    <span className="font-bold text-teal-800 block mt-0.5">{instrument.referenceNo || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Assigned Operator:</span>
                    <span className="font-medium text-slate-800 block mt-0.5">{instrument.assignedOperator || 'Unassigned'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Calibration Agency:</span>
                    <span className="font-medium text-slate-800 block mt-0.5">{instrument.calibrationCompany || 'In-House'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Division / Department:</span>
                    <span className="font-medium text-slate-800 block mt-0.5">{instrument.department || 'UPKS'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Target Reading (X₀):</span>
                    <span className="font-bold text-teal-800 text-sm block mt-0.5">
                      {instrument.targetReading} {instrument.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Allowed Limit (±δ):</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      ±{instrument.toleranceLimit} {instrument.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Last Calibrated:</span>
                    <span className="text-slate-700 block mt-0.5">
                      {instrument.lastCalibrationDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Next Due Date:</span>
                    <span className="font-bold text-slate-900 block mt-0.5">
                      {instrument.nextDueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Execution CTAs */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartVerification(instrument);
                  }}
                  className="flex-1 min-w-[190px] flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run Daily Verification</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartExternalCert(instrument);
                  }}
                  className="flex-1 min-w-[190px] flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Upload External Cert (AI)</span>
                </button>
              </div>
            </div>

            {/* 1 Col: Printable Lab Tag QR Container */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono mb-2">
                Physical Lab Tag (QR)
              </span>

              <div className="bg-white p-2.5 rounded border border-slate-300 shadow-2xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${instrument.name}`}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                  {instrument.id}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  {instrument.serialNo}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 w-full font-mono text-[11px]">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 flex items-center justify-center gap-1"
                  title="Download PNG QR Image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 flex items-center justify-center gap-1"
                  title="Print Lab Tag"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instrument Calibration History */}
          <div className="border-t border-slate-200 pt-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-700" />
                Instrument Verification & Calibration History
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {instrumentRecords.length} records registered
              </span>
            </div>

            {instrumentRecords.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded text-center text-xs text-slate-500">
                No previous calibration records found for this instrument.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded overflow-hidden text-xs font-mono">
                {instrumentRecords.map((rec) => {
                  const isPass = rec.resultStatus === 'Pass' || rec.resultStatus === 'Lulus';
                  return (
                    <div key={rec.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rec.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            rec.type === 'Internal' ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {rec.type === 'Internal' ? 'Internal' : 'External'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isPass ? 'Pass' : 'Fail'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Date: <span>{rec.date}</span> · By: {rec.createdBy} ({rec.createdRole})
                          {rec.readings && (
                            <span className="ml-2">
                              [Std: {rec.readings.standardReading} | Meas: {rec.readings.measuredReading} {rec.readings.unit}]
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          rec.approvalStatus === 'Approved'
                            ? 'text-emerald-700 bg-emerald-50'
                            : rec.approvalStatus === 'Rejected'
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}>
                          {rec.approvalStatus}
                        </span>
                        {rec.evaluatedBy && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            By: {rec.evaluatedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
